<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Session;
use App\Models\TrainingCounsellor;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail;
use App\Mail\BookingNotificationEmail;

class ClientBookingController extends Controller
{
    /**
     * Authenticate client and get booking info
     */
    public function authenticate(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'client_uuid' => 'nullable|string',
        ]);

        $query = Client::where('email', $validated['email']);
        
        if (isset($validated['client_uuid'])) {
            $query->where('uuid', $validated['client_uuid']);
        }

        $client = $query->first();

        if (!$client) {
            return response()->json(['message' => 'Client not found'], 404);
        }

        // Check if client is matched and agreement signed
        if (!$client->matched_tc_id) {
            return response()->json([
                'message' => 'You have not been matched with a counsellor yet.',
                'client' => null,
            ], 400);
        }

        if ($client->agreement_status !== 'signed') {
            return response()->json([
                'message' => 'Please sign your agreement before booking sessions.',
                'client' => null,
            ], 400);
        }

        // Get upcoming sessions
        $upcomingSessions = $client->getUpcomingSessions(20);
        
        // Get next session needing booking (for Low Cost)
        $nextSessionNeedingBooking = null;
        if ($client->service_type === 'Low Cost') {
            $nextSessionNeedingBooking = $client->getNextSessionNeedingBooking();
        }

        return response()->json([
            'client' => [
                'uuid' => $client->uuid,
                'name' => $client->name,
                'email' => $client->email,
                'service_type' => $client->service_type,
                'allocated_day' => $client->allocated_day,
                'allocated_time' => $client->allocated_time,
                'next_booking_deadline' => $client->next_booking_deadline,
                'matched_tc' => $client->matchedTc ? [
                    'name' => $client->matchedTc->name,
                    'uuid' => $client->matchedTc->uuid,
                ] : null,
            ],
            'upcoming_sessions' => $upcomingSessions,
            'next_session_needing_booking' => $nextSessionNeedingBooking,
        ]);
    }

    /**
     * Get available time slots for booking
     */
    public function getAvailableSlots(Request $request, $clientUuid)
    {
        $client = Client::where('uuid', $clientUuid)->firstOrFail();

        if (!$client->matched_tc_id) {
            return response()->json(['message' => 'Client not matched'], 400);
        }

        $tc = TrainingCounsellor::find($client->matched_tc_id);
        
        if (!$tc || !$tc->availability) {
            return response()->json(['message' => 'Counsellor availability not set'], 400);
        }

        // For Low Cost: only show allocated day/time
        if ($client->service_type === 'Low Cost' && $client->allocated_day && $client->allocated_time) {
            return response()->json([
                'slots' => [
                    [
                        'day' => $client->allocated_day,
                        'time' => $client->allocated_time,
                        'available' => true,
                    ]
                ],
                'booking_type' => 'block', // Must book block of 4
            ]);
        }

        // For Mid-Range: show same day/time each week
        if ($client->service_type === 'Mid Range' && $client->allocated_day && $client->allocated_time) {
            // Generate next 4 weeks of slots
            $slots = [];
            $dayOfWeek = $this->getDayOfWeekNumber($client->allocated_day);
            $startDate = Carbon::now()->next($dayOfWeek);
            
            for ($i = 0; $i < 4; $i++) {
                $date = $startDate->copy()->addWeeks($i);
                $slots[] = [
                    'date' => $date->format('Y-m-d'),
                    'day' => $client->allocated_day,
                    'time' => $client->allocated_time,
                    'available' => true,
                ];
            }

            return response()->json([
                'slots' => $slots,
                'booking_type' => 'flexible', // Can book weekly or block
            ]);
        }

        // For Counselling & Coaching: show all TC availability
        $slots = [];
        $availability = $tc->availability ?? [];
        
        foreach (['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as $day) {
            if (isset($availability[strtolower($day)]) && is_array($availability[strtolower($day)])) {
                foreach ($availability[strtolower($day)] as $time) {
                    $slots[] = [
                        'day' => $day,
                        'time' => $time,
                        'available' => true,
                    ];
                }
            }
        }

        return response()->json([
            'slots' => $slots,
            'booking_type' => 'flexible',
        ]);
    }

    /**
     * Book a single session (Mid-Range or Counselling & Coaching)
     */
    public function bookSession(Request $request)
    {
        $validated = $request->validate([
            'client_uuid' => 'required|string',
            'scheduled_at' => 'required|date|after:now',
            'session_type' => 'required|in:mid_range,counselling_coaching',
        ]);

        $client = Client::where('uuid', $validated['client_uuid'])->firstOrFail();

        // Verify client can book
        if (!$client->matched_tc_id || $client->agreement_status !== 'signed') {
            return response()->json(['message' => 'Client not ready to book'], 400);
        }

        // Create session
        $session = Session::create([
            'client_id' => $client->id,
            'tc_id' => $client->matched_tc_id,
            'session_type' => $validated['session_type'],
            'scheduled_at' => $validated['scheduled_at'],
            'status' => 'scheduled',
            'payment_status' => 'pending',
        ]);

        // Send notification to TC
        $this->notifyCounsellor($session);

        return response()->json([
            'message' => 'Session booked successfully',
            'session' => $session->load(['client', 'tc']),
        ], 201);
    }

    /**
     * Book a block of sessions (Low Cost - 4 sessions)
     */
    public function bookBlock(Request $request)
    {
        $validated = $request->validate([
            'client_uuid' => 'required|string',
            'start_date' => 'required|date|after:now',
            'sessions_count' => 'required|integer|in:3,4', // Can be 3 or 4
        ]);

        $client = Client::where('uuid', $validated['client_uuid'])->firstOrFail();

        // Verify client can book
        if (!$client->matched_tc_id || $client->agreement_status !== 'signed') {
            return response()->json(['message' => 'Client not ready to book'], 400);
        }

        if ($client->service_type !== 'Low Cost') {
            return response()->json(['message' => 'Block booking only available for Low Cost Counselling'], 400);
        }

        if (!$client->allocated_day || !$client->allocated_time) {
            return response()->json(['message' => 'Day and time not allocated for this client'], 400);
        }

        // Calculate session dates (weekly on allocated day)
        $startDate = Carbon::parse($validated['start_date']);
        $sessionsCount = $validated['sessions_count'];
        
        // Ensure start date matches allocated day
        $dayOfWeek = $this->getDayOfWeekNumber($client->allocated_day);
        $startDate->next($dayOfWeek);

        $sessions = [];
        $bookingDeadline = null;

        for ($i = 0; $i < $sessionsCount; $i++) {
            $sessionDate = $startDate->copy()->addWeeks($i);
            
            // Set booking deadline for next block (48hrs before 5th session if 4 sessions, or 4th if 3)
            if ($i === $sessionsCount - 1) {
                $nextSessionDate = $sessionDate->copy()->addWeek();
                $bookingDeadline = $nextSessionDate->copy()->subHours(48)->format('Y-m-d');
            }

            $session = Session::create([
                'client_id' => $client->id,
                'tc_id' => $client->matched_tc_id,
                'session_type' => 'low_cost',
                'scheduled_at' => $sessionDate->format('Y-m-d H:i:s'),
                'status' => 'scheduled',
                'is_block_booking' => true,
                'block_number' => $i + 1,
                'total_sessions_in_block' => $sessionsCount,
                'payment_status' => 'pending',
                'booking_deadline' => $i === $sessionsCount - 1 ? $bookingDeadline : null,
            ]);

            $sessions[] = $session;

            // Send notification for first session
            if ($i === 0) {
                $this->notifyCounsellor($session);
            }
        }

        // Update client's next booking deadline
        $client->update([
            'next_booking_deadline' => $bookingDeadline,
        ]);

        return response()->json([
            'message' => "Block of {$sessionsCount} sessions booked successfully",
            'sessions' => Session::whereIn('id', collect($sessions)->pluck('id'))->with(['client', 'tc'])->get(),
            'next_booking_deadline' => $bookingDeadline,
        ], 201);
    }

    /**
     * Get client's booking status
     */
    public function getBookingStatus($clientUuid)
    {
        $client = Client::where('uuid', $clientUuid)->firstOrFail();

        $upcomingSessions = $client->getUpcomingSessions(20);
        $nextSessionNeedingBooking = $client->getNextSessionNeedingBooking();

        // Calculate days until booking deadline
        $daysUntilDeadline = null;
        if ($client->next_booking_deadline) {
            $deadline = Carbon::parse($client->next_booking_deadline);
            $daysUntilDeadline = now()->diffInDays($deadline, false);
        }

        return response()->json([
            'client' => [
                'uuid' => $client->uuid,
                'name' => $client->name,
                'service_type' => $client->service_type,
                'allocated_day' => $client->allocated_day,
                'allocated_time' => $client->allocated_time,
                'next_booking_deadline' => $client->next_booking_deadline,
                'days_until_deadline' => $daysUntilDeadline,
            ],
            'upcoming_sessions' => $upcomingSessions,
            'next_session_needing_booking' => $nextSessionNeedingBooking,
        ]);
    }

    /**
     * Helper: Notify counsellor of booking
     */
    private function notifyCounsellor(Session $session)
    {
        if ($session->tc && $session->tc->email) {
            try {
                Mail::to($session->tc->email)->send(new BookingNotificationEmail(
                    $session->tc->name,
                    $session->client->name,
                    'session',
                    $session->scheduled_at,
                    ['notes' => $session->notes]
                ));
            } catch (\Exception $e) {
                \Log::error('Failed to send booking notification: ' . $e->getMessage());
            }
        }
    }

    /**
     * Helper: Get day of week number for Carbon
     */
    private function getDayOfWeekNumber($dayName)
    {
        $days = [
            'Monday' => Carbon::MONDAY,
            'Tuesday' => Carbon::TUESDAY,
            'Wednesday' => Carbon::WEDNESDAY,
            'Thursday' => Carbon::THURSDAY,
            'Friday' => Carbon::FRIDAY,
        ];

        return $days[$dayName] ?? Carbon::MONDAY;
    }
}


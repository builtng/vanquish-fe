<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Session;
use App\Models\TrainingCounsellor;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\DynamicEmail;

use App\Services\EmailService;

class ClientBookingController extends Controller
{
    protected $emailService;

    public function __construct(EmailService $emailService)
    {
        $this->emailService = $emailService;
    }
    /**
     * Authenticate client and get booking info
     */
    public function authenticate(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required_without:client_uuid|nullable|email',
            'client_uuid' => 'required_without:email|nullable|string',
        ]);

        $query = Client::query();

        if (!empty($validated['email'])) {
            $query->where('email', $validated['email']);
        }

        if (!empty($validated['client_uuid'])) {
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

        // We have removed the 'signed' requirement to allow consultation before signing
        // Get upcoming sessions
        $upcomingSessions = $client->getUpcomingSessions(20);

        // Get next session needing booking (for Low Cost)
        $nextSessionNeedingBooking = null;
        if ($client->service_type === 'Low Cost') {
            $nextSessionNeedingBooking = $client->getNextSessionNeedingBooking();
        }

        return response()->json([
            'client' => [
                'id' => $client->id,
                'uuid' => $client->uuid,
                'name' => $client->name,
                'email' => $client->email,
                'service_type' => $client->service_type,
                'allocated_day' => $client->allocated_day,
                'allocated_time' => $client->allocated_time,
                'next_booking_deadline' => $client->next_booking_deadline,
                'matched_tc' => $client->matchedTc ? [
                    'name' => $client->matchedTc->abbreviated_name,
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

        // --- BOOKING GATE ---
        // Admin must explicitly enable bookings for each service type.
        // If not enabled, return empty slots with a clear flag so the frontend can
        // show a "Booking not yet open" message rather than a calendar of fake dates.
        $serviceType = $client->service_type;
        $serviceSetting = \App\Models\ServiceSetting::where('service_name', $serviceType)->first();

        if (!$serviceSetting || !$serviceSetting->booking_enabled) {
            return response()->json([
                'slots'           => [],
                'booking_enabled' => false,
                'message'         => 'Booking is not yet open for your service. Please check back soon or contact support.',
            ]);
        }

        $tc = TrainingCounsellor::find($client->matched_tc_id);

        if (!$tc || !$tc->availability) {
            return response()->json(['message' => 'Counsellor availability not set'], 400);
        }

        // Get all existing sessions for this TC to prevent double booking
        $existingSessions = Session::where('tc_id', $tc->id)
            ->whereIn('status', ['scheduled', 'completed'])
            ->get(['scheduled_at']);

        $bookedTimes = $existingSessions->map(function ($session) {
            return $session->scheduled_at->format('Y-m-d H:i');
        })->toArray();

        // For Low Cost: if already allocated, show next few occurrences
        if ($client->service_type === 'Low Cost' && $client->allocated_day && $client->allocated_time) {
            $slots = [];
            $dayOfWeek = $this->getDayOfWeekNumber($client->allocated_day);
            $startDate = Carbon::now()->next($dayOfWeek);

            // If next session is within 48 hours, it's CLOSED. Skip to the following week.
            if (Carbon::now()->diffInHours($startDate, false) < 48) {
                $startDate->addWeek();
            }

            // Provide 8 weeks of options
            for ($i = 0; $i < 8; $i++) {

                $date = $startDate->copy()->addWeeks($i);
                $slotDateTime = $date->format('Y-m-d') . ' ' . $this->formatTimeToHHi($client->allocated_time);

                $slots[] = [
                    'date' => $date->format('Y-m-d'),
                    'day' => $client->allocated_day,
                    'time' => $client->allocated_time,
                    'formatted_time' => $this->formatTimeToHHi($client->allocated_time),
                    'available' => !in_array($slotDateTime, $bookedTimes),
                ];
            }

            return response()->json([
                'slots' => $slots,
                'booking_type' => 'block',
            ]);
        }


        // For Mid-Range: if already allocated, show same day/time each week
        if ($client->service_type === 'Mid Range' && $client->allocated_day && $client->allocated_time) {
            $slots = [];
            $dayOfWeek = $this->getDayOfWeekNumber($client->allocated_day);
            $startDate = Carbon::now()->next($dayOfWeek);

            for ($i = 0; $i < 4; $i++) {
                $date = $startDate->copy()->addWeeks($i);
                $slotDateTime = $date->format('Y-m-d') . ' ' . $this->formatTimeToHHi($client->allocated_time);

                $slots[] = [
                    'date' => $date->format('Y-m-d'),
                    'day' => $client->allocated_day,
                    'time' => $client->allocated_time,
                    'formatted_time' => $this->formatTimeToHHi($client->allocated_time),
                    'available' => !in_array($slotDateTime, $bookedTimes),
                ];
            }

            return response()->json([
                'slots' => $slots,
                'booking_type' => 'flexible',
            ]);
        }

        // If no slot allocated OR it's Counselling & Coaching, show all TC availability for next 2 weeks
        $slots = [];
        // Normalize availability keys to lowercase for robust lookup
        $availabilityData = array_change_key_case($tc->availability ?? [], CASE_LOWER);
        $startDate = Carbon::now();

        for ($i = 0; $i < 14; $i++) {
            $currentDate = $startDate->copy()->addDays($i);
            $dayName = $currentDate->format('l');
            $dayKey = strtolower($dayName);

            if (isset($availabilityData[$dayKey]) && is_array($availabilityData[$dayKey])) {
                foreach ($availabilityData[$dayKey] as $time) {
                    $slotDateTime = $currentDate->format('Y-m-d') . ' ' . $this->formatTimeToHHi($time);

                    // 48-hour rule for Low Cost/Mid-Range
                    $isAvailable = !in_array($slotDateTime, $bookedTimes);
                    if (($client->service_type === 'Low Cost' || $client->service_type === 'Mid Range') &&
                        $currentDate->diffInHours(now(), false) > -48
                    ) {
                        $isAvailable = false;
                    }

                    $slots[] = [
                        'date' => $currentDate->format('Y-m-d'),
                        'day' => $dayName,
                        'time' => $time,
                        'formatted_time' => $this->formatTimeToHHi($time),
                        'available' => $isAvailable,
                    ];
                }
            }
        }

        return response()->json([
            'slots' => $slots,
            'booking_type' => $client->service_type === 'Low Cost' ? 'block' : 'flexible',
        ]);
    }

    /**
     * Book a single session (Mid-Range or Counselling & Coaching)
     */
    public function bookSession(Request $request)
    {
        $validated = $request->validate([
            'client_uuid' => 'required|string',
            'scheduled_at' => 'required|date|after:' . now()->subMinutes(5)->toDateTimeString(),
            'session_type' => 'required|in:mid_range,counselling_coaching',
        ]);

        $client = Client::where('uuid', $validated['client_uuid'])->firstOrFail();

        if (!$client->matched_tc_id) {
            return response()->json(['message' => 'Client not matched with a counsellor yet'], 400);
        }

        // Check for double booking
        $isBooked = Session::where('tc_id', $client->matched_tc_id)
            ->where('scheduled_at', $validated['scheduled_at'])
            ->whereIn('status', ['scheduled', 'completed'])
            ->exists();

        if ($isBooked) {
            return response()->json(['message' => 'This slot is already booked. Please choose another one.'], 400);
        }

        // If Mid Range and no allocated day/time, set it now
        if ($client->service_type === 'Mid Range' && (!$client->allocated_day || !$client->allocated_time)) {
            $scheduledAt = Carbon::parse($validated['scheduled_at']);
            $client->update([
                'allocated_day' => $scheduledAt->format('l'),
                'allocated_time' => $scheduledAt->format('g:ia'),
            ]);
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

        // Send confirmation to Client
        if ($client->email) {
            $this->emailService->sendAndLog(
                $client,
                'booking_confirmation',
                [
                    'client_name' => $client->name,
                    'booking_type' => 'session',
                    'counsellor_name' => $session->tc ? $session->tc->abbreviated_name : 'Your Counsellor',
                    'booking_details' => Carbon::parse($session->scheduled_at)->format('l, jS F Y (H:i)'),
                    'location' => 'Online',
                    'duration' => 50,
                    'date' => Carbon::parse($session->scheduled_at)->format('F j, Y'),
                    'time' => Carbon::parse($session->scheduled_at)->format('H:i'),
                    'consultation_link' => config('app.frontend_url') . '/client-booking?uuid=' . $client->uuid
                ]
            );
        }

        return response()->json([
            'message' => 'Session booked successfully. Please proceed to payment.',
            'session' => $session->load(['client', 'tc']),
            'session_ids' => [$session->id],
        ], 201);
    }

    /**
     * Book a block of sessions (Low Cost - 4 sessions)
     */
    public function bookBlock(Request $request)
    {
        $validated = $request->validate([
            'client_uuid' => 'required|string',
            'start_date' => 'required|date|after:' . now()->subMinutes(5)->toDateTimeString(),
            'sessions_count' => 'nullable|integer|in:3,4',
            'time_slot' => 'nullable|string', // Optional if already set, required if not
        ]);

        $client = Client::where('uuid', $validated['client_uuid'])->firstOrFail();

        if (!$client->matched_tc_id) {
            return response()->json(['message' => 'Client not matched with a counsellor yet'], 400);
        }

        if ($client->service_type !== 'Low Cost') {
            return response()->json(['message' => 'Block booking only available for Low Cost Counselling'], 400);
        }

        $startDate = Carbon::parse($validated['start_date']);

        // If a time slot is provided (either from validation or existing allocation), incorporate it into startDate
        $timeToUse = $validated['time_slot'] ?? $client->allocated_time;
        if ($timeToUse) {
            $formattedTime = $this->formatTimeToHHi($timeToUse);
            $startDate = Carbon::parse($startDate->format('Y-m-d') . ' ' . $formattedTime);
        }

        // If no allocated day/time, set it now
        if (!$client->allocated_day || !$client->allocated_time) {
            if (!isset($validated['time_slot'])) {
                return response()->json(['message' => 'Please select a time slot for your recurring sessions.'], 400);
            }
            $client->update([
                'allocated_day' => $startDate->format('l'),
                'allocated_time' => $validated['time_slot'],
            ]);
        }

        $sessionsCount = $validated['sessions_count'] ?? 4;

        // --- 48-hour rule check ---
        $now = Carbon::now();
        if ($now->diffInHours($startDate, false) < 48) {
            return response()->json(['message' => 'Sessions must be booked at least 48 hours in advance. This slot is now closed.'], 400);
        }

        // Check for double booking for the ENTIRE block (at least the first session)
        $isBooked = Session::where('tc_id', $client->matched_tc_id)
            ->where('scheduled_at', $startDate->format('Y-m-d H:i:s'))
            ->whereIn('status', ['scheduled', 'completed'])
            ->exists();

        if ($isBooked) {
            return response()->json(['message' => 'The selected slot is already booked. Please choose another one.'], 400);
        }

        // --- Penalty/Deadline Check ---
        if ($client->next_booking_deadline && $now->gt(Carbon::parse($client->next_booking_deadline))) {
            $sessionsCount = 3; // Enforce penalty
            Log::info("Penalty applied for client {$client->uuid}: deadline was {$client->next_booking_deadline}");
        }

        // --- Session Continuity Check ---
        $lastSession = $client->sessions()->where('status', 'scheduled')->orderBy('scheduled_at', 'desc')->first();
        if ($lastSession) {
            $expectedNextDate = Carbon::parse($lastSession->scheduled_at)->addWeek();
            if (!$startDate->isSameDay($expectedNextDate)) {
                // If they missed a week, ensure we skip exactly that week and apply penalty if not already
                if ($startDate->gt($expectedNextDate)) {
                    $sessionsCount = 3;
                } else {
                    return response()->json(['message' => 'Invalid start date. Sessions must follow the previous block continuously.'], 400);
                }
            }
        } else {
            // First block: ensure it matches allocated day
            $dayOfWeek = $this->getDayOfWeekNumber($client->allocated_day);
            if ($startDate->dayOfWeek !== $dayOfWeek) {
                return response()->json(['message' => "Invalid start date. Your allocated day is {$client->allocated_day}."], 400);
            }
        }

        $sessions = [];
        $bookingDeadline = null;

        for ($i = 0; $i < $sessionsCount; $i++) {
            $sessionDate = $startDate->copy()->addWeeks($i);

            // Set booking deadline for next block (48hrs before what would be the next session)
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
                'auto_deduction_applied' => $sessionsCount === 3,
            ]);

            $sessions[] = $session;

            if ($i === 0) {
                // For the first session in the block
            }
        }
        $sessionIds = collect($sessions)->pluck('id')->toArray();


        // Update client's next booking deadline
        $client->update([
            'next_booking_deadline' => $bookingDeadline,
        ]);

        // Send confirmation to Client
        if ($client->email) {
            $sessionDatesFormatted = collect($sessions)->map(fn($s) => Carbon::parse($s->scheduled_at)->format('l, jS F Y (H:i)'))->join(', ');

            $this->emailService->sendAndLog(
                $client,
                'booking_confirmation',
                [
                    'client_name' => $client->name,
                    'booking_type' => 'Block of ' . count($sessions) . ' Sessions' . ($sessionsCount === 3 ? ' (Penalty Applied)' : ''),
                    'counsellor_name' => $client->matchedTc ? $client->matchedTc->abbreviated_name : 'Your Counsellor',
                    'booking_details' => $sessionDatesFormatted,
                    'location' => 'Online',
                    'duration' => 50,
                    'consultation_link' => config('app.frontend_url') . '/client-booking?uuid=' . $client->uuid,
                    'date' => $startDate->format('F j, Y'),
                    'time' => $startDate->format('H:i')
                ]
            );
        }

        return response()->json([
            'message' => "Block of {$sessionsCount} sessions booked successfully" . ($sessionsCount === 3 ? " (Penalty applied for missing deadline)" : "") . ". Please proceed to payment.",
            'sessions' => Session::whereIn('id', $sessionIds)->with(['client', 'tc'])->get(),
            'session_ids' => $sessionIds,
            'next_booking_deadline' => $bookingDeadline,
            'penalty_applied' => $sessionsCount === 3,
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
                'id' => $client->id,
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
                Mail::to($session->tc->email)->send(new DynamicEmail(
                    'booking_notification',
                    [
                        'tc_name' => $session->tc->name,
                        'client_name' => $session->client->name,
                        'booking_type' => 'session',
                        'scheduled_at' => Carbon::parse($session->scheduled_at)->format('l, jS F Y (H:i)'),
                        'notes' => $session->notes ?? 'N/A'
                    ]
                ));
            } catch (\Exception $e) {
                Log::error('Failed to send booking notification: ' . $e->getMessage());
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

    /**
     * Helper: Format time string (e.g., "10:00am") to "HH:mm"
     */
    private function formatTimeToHHi($timeString)
    {
        if (!$timeString) return '00:00';

        // Mapping for abstract time slots
        $mapping = [
            'morning-early' => '10:00',
            'morning-late' => '11:00',
            'afternoon-early' => '13:00',
            'afternoon-late' => '16:00',
            'evening' => '17:00'
        ];

        if (isset($mapping[$timeString])) {
            return $mapping[$timeString];
        }

        // Handle range like "10:00am-10:50am" - take only the start
        if (str_contains($timeString, '-')) {
            $timeString = explode('-', $timeString)[0];
        }

        try {
            return Carbon::parse($timeString)->format('H:i');
        } catch (\Exception $e) {
            // Fallback for simple formats like "10am"
            $timestamp = strtotime($timeString);
            return $timestamp ? date('H:i', $timestamp) : '00:00';
        }
    }
}

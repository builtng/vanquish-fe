<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use App\Models\ActivityLog;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\DynamicEmail;

use App\Services\EmailService;

class ConsultationController extends Controller
{
    protected $emailService;

    public function __construct(EmailService $emailService)
    {
        $this->emailService = $emailService;
    }

    public function index(Request $request)
    {
        $query = Consultation::with(['client', 'tc']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('date')) {
            $query->whereDate('scheduled_at', $request->date);
        }

        $consultations = $query->orderBy('id', 'desc')->get();
        return response()->json($consultations);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'tc_id' => 'nullable|exists:training_counsellors,id',
            'scheduled_at' => 'required|date',
            'notes' => 'nullable|string',
            'send_confirmation' => 'boolean',
            'is_fallback' => 'boolean',
        ]);

        // Check for double booking if a TC is assigned
        if (!empty($validated['tc_id'])) {
            $isDoubleBooked = Consultation::where('tc_id', $validated['tc_id'])
                ->where('scheduled_at', $validated['scheduled_at'])
                ->whereIn('status', ['scheduled'])
                ->exists();

            if ($isDoubleBooked) {
                return response()->json([
                    'message' => 'The selected Trainee Counsellor is already booked for this time slot.'
                ], 422);
            }
        }

        $validated['consultation_id'] = 'CONS' . str_pad(Consultation::count() + 1, 3, '0', STR_PAD_LEFT);
        $validated['status'] = 'scheduled';

        $consultation = Consultation::create($validated);
        $consultation->load(['client', 'tc']);

        // Log activity
        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'consultation_booked',
            'model_type' => Consultation::class,
            'model_id' => $consultation->id,
            'description' => "Consultation booked for client {$consultation->client->name}",
            'ip_address' => $request->ip(),
        ]);

        $baseUrl = rtrim(config('app.frontend_url'), '/');
        $consultationLink = $baseUrl . "/consultation/{$consultation->id}"; // Example internal link


        // Send notification to TC if assigned
        if ($consultation->tc_id && $consultation->tc) {
            $tc = $consultation->tc;

            // Send email notification if TC has email
            if ($tc->email) {
                try {
                    Mail::to($tc->email)->send(new DynamicEmail(
                        'booking_notification',
                        [
                            'tc_name' => $tc->name,
                            'client_name' => $consultation->client->name,
                            'booking_type' => 'consultation',
                            'scheduled_at' => \Carbon\Carbon::parse($consultation->scheduled_at)->format('l, jS F Y (H:i)'),
                            'notes' => $consultation->notes ?? 'N/A'
                        ]
                    ));
                } catch (\Exception $e) {
                    Log::error('Failed to send consultation booking notification: ' . $e->getMessage());
                }
            }

            // Create in-system message notification
            try {
                Message::create([
                    'from_user_id' => $request->user()->id,
                    'to_tc_id' => $tc->id,
                    'subject' => "New Consultation Booking: {$consultation->client->name}",
                    'message' => "A consultation has been scheduled for {$consultation->client->name} on " .
                        \Carbon\Carbon::parse($consultation->scheduled_at)->format('l, F j, Y \a\t g:i A') .
                        ($consultation->notes ? "\n\nNotes: {$consultation->notes}" : ''),
                    'type' => 'staff_to_counsellor',
                    'related_client_id' => $consultation->client_id,
                    'related_consultation_id' => $consultation->id,
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to create consultation booking message: ' . $e->getMessage());
            }
        }

        // Send confirmation email to client using EmailService for tracking
        if ($consultation->client && $consultation->client->email) {
            $this->emailService->sendAndLog(
                $consultation->client,
                'booking_confirmation',
                [
                    'client_name' => $consultation->client->name,
                    'booking_type' => 'consultation',
                    'counsellor_name' => $consultation->tc ? $consultation->tc->abbreviated_name : 'Assigned Counsellor',
                    'booking_details' => \Carbon\Carbon::parse($consultation->scheduled_at)->format('l, jS F Y (H:i)'),
                    'location' => 'Online',
                    'duration' => 50,
                    'consultation_link' => $consultationLink,
                    'date' => \Carbon\Carbon::parse($consultation->scheduled_at)->format('F j, Y'),
                    'time' => \Carbon\Carbon::parse($consultation->scheduled_at)->format('H:i')
                ]
            );
        }

        return response()->json($consultation, 201);
    }

    public function show($id)
    {
        $consultation = Consultation::with(['client', 'tc'])->findOrFail($id);
        return response()->json($consultation);
    }

    public function update(Request $request, $id)
    {
        $consultation = Consultation::findOrFail($id);

        $validated = $request->validate([
            'scheduled_at' => 'sometimes|date',
            'notes' => 'nullable|string',
            'status' => 'sometimes|in:scheduled,completed,cancelled,no_show',
        ]);

        $consultation->update($validated);

        return response()->json($consultation->load(['client', 'tc']));
    }

    public function destroy(Request $request, $id)
    {
        $consultation = Consultation::findOrFail($id);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'consultation_deleted',
            'model_type' => Consultation::class,
            'model_id' => $consultation->id,
            'description' => "Consultation deleted for client {$consultation->client->name}",
            'ip_address' => $request->ip(),
        ]);

        $consultation->delete();

        return response()->json(['message' => 'Consultation deleted successfully']);
    }

    public function complete(Request $request, $id)
    {
        $consultation = Consultation::findOrFail($id);

        $validated = $request->validate([
            'duration_minutes' => 'required|integer|min:1',
            'notes' => 'nullable|string',
            'outcome' => 'required|in:approved,not_approved,pending',
            'recommended_service' => 'nullable|string',
            'recommended_modality' => 'nullable|string',
            'risk_notes' => 'nullable|string',
            'next_steps' => 'nullable|string',
        ]);

        // Set payment amount based on recommended service
        $paymentAmount = 13.00; // Default for counselling services
        if ($validated['recommended_service'] === 'Coaching/Counselling') {
            $paymentAmount = 25.00;
        }

        $consultation->update([
            'status' => 'completed',
            'completed_at' => now(),
            'payment_amount' => $paymentAmount,
            ...$validated,
        ]);

        // Update client stage if approved
        if ($validated['outcome'] === 'approved') {
            $client = $consultation->client;
            $client->update(['stage' => 'Consultation Completed']);

            // Trigger follow-up notification to client
            if ($client->email) {
                $this->emailService->sendAndLog(
                    $client,
                    'consultation_follow_up',
                    [
                        'client_name' => $client->name,
                        'outcome' => $validated['outcome'],
                        'next_steps' => 'Our team will now review your assessment and match you with a suitable counsellor. You will receive an email once the match is made.'
                    ]
                );
            }
        }

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'consultation_completed',
            'model_type' => Consultation::class,
            'model_id' => $consultation->id,
            'description' => "Consultation completed with outcome: {$validated['outcome']}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json($consultation->load(['client', 'tc']));
    }

    public function cancel(Request $request, $id)
    {
        $consultation = Consultation::findOrFail($id);
        $consultation->update(['status' => 'cancelled']);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'consultation_cancelled',
            'model_type' => Consultation::class,
            'model_id' => $consultation->id,
            'description' => "Consultation cancelled",
            'ip_address' => $request->ip(),
        ]);

        return response()->json($consultation->load(['client', 'tc']));
    }

    public function reschedule(Request $request, $id)
    {
        $consultation = Consultation::findOrFail($id);

        $validated = $request->validate([
            'scheduled_at' => 'required|date',
        ]);

        $consultation->update($validated);

        // Send reschedule email if client has email
        if ($consultation->client && $consultation->client->email) {
            $baseUrl = rtrim(config('app.frontend_url'), '/');
            $consultationLink = $baseUrl . "/consultation/{$consultation->id}";

            $this->emailService->sendAndLog(
                $consultation->client,
                'booking_rescheduled',
                [
                    'client_name' => $consultation->client->name,
                    'booking_type' => 'consultation',
                    'counsellor_name' => $consultation->tc ? $consultation->tc->abbreviated_name : 'Assigned Counsellor',
                    'new_scheduled_at' => \Carbon\Carbon::parse($consultation->scheduled_at)->format('l, jS F Y (H:i)'),
                    'notes' => $consultation->notes ?? 'N/A',
                    'consultation_link' => $consultationLink
                ]
            );
        }

        // Send notification to TC if assigned
        if ($consultation->tc && $consultation->tc->email) {
            try {
                Mail::to($consultation->tc->email)->send(new DynamicEmail(
                    'booking_notification',
                    [
                        'tc_name' => $consultation->tc->name,
                        'client_name' => $consultation->client->name,
                        'booking_type' => 'consultation (Rescheduled)',
                        'scheduled_at' => \Carbon\Carbon::parse($consultation->scheduled_at)->format('l, jS F Y (H:i)'),
                        'notes' => "This is a reschedule. " . ($consultation->notes ?? 'N/A')
                    ]
                ));
            } catch (\Exception $e) {
                Log::error('Failed to send reschedule notification to TC: ' . $e->getMessage());
            }
        }

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'consultation_rescheduled',
            'model_type' => Consultation::class,
            'model_id' => $consultation->id,
            'description' => "Consultation rescheduled to {$validated['scheduled_at']}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json($consultation->load(['client', 'tc']));
    }

    public function stats(Request $request)
    {
        $today = now()->startOfDay();
        $todayEnd = now()->endOfDay();
        $startOfMonth = now()->startOfMonth();

        $stats = [
            'today_count' => Consultation::where('status', 'scheduled')
                ->whereDate('scheduled_at', $today)
                ->count(),

            'upcoming_count' => Consultation::where('status', 'scheduled')
                ->whereDate('scheduled_at', '>=', $today)
                ->count(),

            'this_week_count' => Consultation::where('status', 'scheduled')
                ->count(),

            'completed_this_month' => Consultation::where('status', 'completed')
                ->where('completed_at', '>=', $startOfMonth)
                ->count(),

            'pending_payment' => Consultation::where('payment_status', 'pending')
                ->count(),
        ];

        return response()->json($stats);
    }
}

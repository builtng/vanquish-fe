<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\ClientTcMatch;
use App\Models\ActivityLog;
use App\Mail\ClientFeedbackFormEmail;
use App\Mail\GenericClientEmail;
use App\Mail\ClientAgreementEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Gate;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        // Authorization check
        if (!Gate::allows('viewAny', Client::class)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $query = Client::with(['matchedTc']);

        // Search - sanitize input
        if ($request->has('search')) {
            $search = Str::limit($request->search, 100); // Limit search length
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filters - validate enum values
        if ($request->has('stage') && $request->stage !== 'all') {
            $validStages = ['Application', 'Consultation Booked', 'Consultation Completed', 'Pending Match', 'Matched', 'Agreement Pending', 'Active Therapy', 'Completed'];
            if (in_array($request->stage, $validStages)) {
                $query->where('stage', $request->stage);
            }
        }

        if ($request->has('status') && $request->status !== 'all') {
            $validStatuses = ['active', 'urgent', 'stuck', 'archived'];
            if (in_array($request->status, $validStatuses)) {
                $query->where('status', $request->status);
            }
        }

        if ($request->has('service_type') && $request->service_type !== 'all') {
            $validServiceTypes = ['Low Cost', 'Mid Range', 'High Range'];
            if (in_array($request->service_type, $validServiceTypes)) {
                $query->where('service_type', $request->service_type);
            }
        }

        // Pagination - limit per page to prevent abuse
        $perPage = min($request->get('per_page', 20), 100); // Max 100 per page
        $clients = $query->paginate($perPage);

        return response()->json($clients);
    }

    public function store(Request $request)
    {
        // Authorization check
        if (!Gate::allows('create', Client::class)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:clients,email',
            'age' => 'nullable|integer|min:1|max:120',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'postcode' => 'nullable|string|max:20',
            'gender' => 'nullable|string|max:50',
            'ethnicity' => 'nullable|string|max:100',
            'sexual_orientation' => 'nullable|string|max:100',
            'service_type' => 'nullable|in:Low Cost,Mid Range,High Range',
            'primary_issues' => 'nullable|array|max:20',
            'primary_issues.*' => 'string|max:255',
            'availability' => 'nullable|array|max:7',
            'availability.*' => 'string|max:50',
        ]);

        $validated['client_id'] = 'CL' . str_pad(Client::count() + 1, 3, '0', STR_PAD_LEFT);
        $validated['submitted_date'] = now();

        $client = Client::create($validated);

        // Log activity
        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'client_created',
            'model_type' => Client::class,
            'model_id' => $client->id,
            'description' => "Client {$client->name} created",
            'ip_address' => $request->ip(),
        ]);

        return response()->json($client->load('matchedTc'), 201);
    }

    public function show($id)
    {
        // Find by UUID or fall back to client_id for backward compatibility
        $client = Client::where('uuid', $id)
            ->orWhere('client_id', $id)
            ->with(['matchedTc', 'consultations', 'matches.tc'])
            ->firstOrFail();

        // Authorization check
        if (!Gate::allows('view', $client)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($client);
    }

    public function update(Request $request, $id)
    {
        // Find by UUID or fall back to client_id for backward compatibility
        $client = Client::where('uuid', $id)->orWhere('client_id', $id)->firstOrFail();

        // Authorization check
        if (!Gate::allows('update', $client)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:clients,email,' . $client->id,
            'age' => 'nullable|integer|min:1|max:120',
            'phone' => 'nullable|string|max:20',
            'stage' => 'sometimes|in:Application,Consultation Booked,Consultation Completed,Pending Match,Matched,Agreement Pending,Active Therapy,Completed',
            'status' => 'sometimes|in:active,urgent,stuck,archived',
            'service_type' => 'nullable|in:Low Cost,Mid Range,High Range',
            'primary_issues' => 'nullable|array|max:20',
            'primary_issues.*' => 'string|max:255',
            'availability' => 'nullable|array|max:7',
            'availability.*' => 'string|max:50',
        ]);

        $client->update($validated);

        // Log activity
        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'client_updated',
            'model_type' => Client::class,
            'model_id' => $client->id,
            'description' => "Client {$client->name} updated",
            'changes' => $validated,
            'ip_address' => $request->ip(),
        ]);

        return response()->json($client->load('matchedTc'));
    }

    public function destroy($id)
    {
        // Find by UUID or fall back to client_id for backward compatibility
        $client = Client::where('uuid', $id)->orWhere('client_id', $id)->firstOrFail();

        // Authorization check - only admins can delete
        if (!Gate::allows('delete', $client)) {
            return response()->json(['message' => 'Unauthorized. Only admins can delete clients.'], 403);
        }

        $client->delete();

        // Log activity
        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'client_deleted',
            'model_type' => Client::class,
            'model_id' => $client->id,
            'description' => "Client {$client->name} deleted",
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['message' => 'Client deleted successfully']);
    }

    public function details($id)
    {
        // Find by UUID or fall back to client_id for backward compatibility
        $client = Client::where('uuid', $id)
            ->orWhere('client_id', $id)
            ->with([
                'matchedTc',
                'consultations.tc',
                'matches.tc',
                'intakeForm'
            ])
            ->firstOrFail();

        // Authorization check
        if (!Gate::allows('view', $client)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($client);
    }

    public function progressStage(Request $request, $id)
    {
        // Find by UUID or fall back to client_id for backward compatibility
        $client = Client::where('uuid', $id)->orWhere('client_id', $id)->firstOrFail();

        // Authorization check
        if (!Gate::allows('update', $client)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $request->validate([
            'stage' => 'required|in:Application,Consultation Booked,Consultation Completed,Pending Match,Matched,Agreement Pending,Active Therapy,Completed',
        ]);

        $oldStage = $client->stage;
        $client->update(['stage' => $request->stage]);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'client_stage_progressed',
            'model_type' => Client::class,
            'model_id' => $client->id,
            'description' => "Client {$client->name} progressed from {$oldStage} to {$request->stage}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json($client);
    }

    public function pendingMatches(Request $request)
    {
        // Authorization check
        if (!Gate::allows('viewAny', Client::class)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $query = Client::where('stage', 'Pending Match')
            ->with(['matchedTc']);

        if ($request->has('search')) {
            $search = Str::limit($request->search, 100);
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('service_type') && $request->service_type !== 'all') {
            $validServiceTypes = ['Low Cost', 'Mid Range', 'High Range'];
            if (in_array($request->service_type, $validServiceTypes)) {
                $query->where('service_type', $request->service_type);
            }
        }

        $clients = $query->get()->map(function($client) {
            $client->days_waiting = $client->submitted_date 
                ? now()->diffInDays($client->submitted_date) 
                : 0;
            
            // Calculate urgency based on multiple factors
            $urgency = $this->calculateUrgency($client);
            $client->urgency = $urgency;
            
            return $client;
        });

        // Filter by urgency if requested
        if ($request->has('urgency') && $request->urgency !== 'all') {
            $validUrgencies = ['high', 'medium', 'low'];
            if (in_array($request->urgency, $validUrgencies)) {
                $clients = $clients->filter(function($client) use ($request) {
                    return $client->urgency === $request->urgency;
                })->values();
            }
        }

        return response()->json($clients);
    }

    public function pendingMatchesCount(Request $request)
    {
        // Authorization check
        if (!Gate::allows('viewAny', Client::class)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $count = Client::where('stage', 'Pending Match')->count();
        return response()->json(['count' => $count]);
    }

    /**
     * Calculate urgency rating based on multiple factors:
     * - Status (urgent/stuck = high priority)
     * - Days waiting (7+ days = high, 3-6 days = medium, <3 days = low)
     * - Risk flags (any risk flags = high priority)
     * - Service type (Low Cost = higher priority)
     */
    private function calculateUrgency($client)
    {
        $urgencyScore = 0;
        
        // Status-based urgency
        if ($client->status === 'urgent') {
            $urgencyScore += 3;
        } elseif ($client->status === 'stuck') {
            $urgencyScore += 2;
        }
        
        // Days waiting urgency
        $daysWaiting = $client->submitted_date ? now()->diffInDays($client->submitted_date) : 0;
        if ($daysWaiting >= 7) {
            $urgencyScore += 3; // High priority for 7+ days
        } elseif ($daysWaiting >= 3) {
            $urgencyScore += 2; // Medium priority for 3-6 days
        } elseif ($daysWaiting > 0) {
            $urgencyScore += 1; // Low priority for 1-2 days
        }
        
        // Risk flags urgency
        if ($client->risk_flags && $client->risk_flags !== 'None reported' && trim($client->risk_flags) !== '') {
            $urgencyScore += 3; // High priority for any risk flags
        }
        
        // Service type urgency (Low Cost clients may need faster matching)
        if ($client->service_type === 'Low Cost') {
            $urgencyScore += 1;
        }
        
        // Determine final urgency level
        if ($urgencyScore >= 5) {
            return 'high';
        } elseif ($urgencyScore >= 3) {
            return 'medium';
        } else {
            return 'low';
        }
    }

    public function assignMatch(Request $request)
    {
        // Authorization check
        if (!Gate::allows('update', Client::class)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'client_id' => 'required',
            'tc_id' => 'required',
            'match_score' => 'nullable|integer|min:0|max:100',
            'assignment_notes' => 'nullable|string|max:1000',
            'send_notification' => 'boolean',
        ]);

        // Find by UUID or client_id/tc_id - sanitize input
        $client = Client::where('uuid', $validated['client_id'])
            ->orWhere('client_id', $validated['client_id'])
            ->orWhere('id', $validated['client_id'])
            ->firstOrFail();
        $tc = \App\Models\TrainingCounsellor::where('uuid', $validated['tc_id'])
            ->orWhere('tc_id', $validated['tc_id'])
            ->orWhere('id', $validated['tc_id'])
            ->firstOrFail();

        // Create match
        $match = ClientTcMatch::create([
            'client_id' => $client->id,
            'tc_id' => $tc->id,
            'match_score' => $validated['match_score'] ?? null,
            'assignment_notes' => $validated['assignment_notes'] ?? null,
            'status' => 'assigned',
            'assigned_date' => now(),
            'send_notification' => $validated['send_notification'] ?? true,
        ]);

        // Update client
        $client->update([
            'matched_tc_id' => $tc->id,
            'matched_date' => now(),
            'stage' => 'Agreement Pending',
        ]);

        // Update TC client count
        $tc->increment('current_clients');

        // Check if activity log already exists for this match to prevent duplicates
        $existingLog = ActivityLog::where('action', 'client_tc_matched')
            ->where('model_type', ClientTcMatch::class)
            ->where('model_id', $match->id)
            ->first();

        if (!$existingLog) {
            ActivityLog::create([
                'user_id' => $request->user()->id,
                'action' => 'client_tc_matched',
                'model_type' => ClientTcMatch::class,
                'model_id' => $match->id,
                'description' => "Client {$client->name} matched with TC {$tc->name}",
                'ip_address' => $request->ip(),
            ]);
        }

        return response()->json($match->load(['client', 'tc']), 201);
    }

    public function sendEmail(Request $request, $id)
    {
        // Find by UUID or fall back to client_id for backward compatibility
        $client = Client::where('uuid', $id)->orWhere('client_id', $id)->firstOrFail();

        // Authorization check
        if (!Gate::allows('update', $client)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
        ]);

        // Check if email exists
        if (!$client->email) {
            return response()->json([
                'message' => 'Client does not have an email address',
            ], 400);
        }

        // Send email
        try {
            Mail::to($client->email)->send(new GenericClientEmail($client->name, $validated['subject'], $validated['message']));

            ActivityLog::create([
                'user_id' => $request->user()->id,
                'action' => 'email_sent',
                'model_type' => Client::class,
                'model_id' => $client->id,
                'description' => "Email sent to {$client->name} ({$client->email}): {$validated['subject']}",
                'changes' => ['subject' => $validated['subject']],
                'ip_address' => $request->ip(),
            ]);

            return response()->json([
                'message' => 'Email sent successfully to ' . $client->email,
                'to' => $client->email,
                'subject' => $validated['subject'],
                'client_uuid' => $client->uuid,
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to send email to client', [
                'client_id' => $client->id,
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => 'Failed to send email. Please try again later.',
            ], 500);
        }
    }

    public function sendFeedbackForm(Request $request, $id)
    {
        // Find by UUID or fall back to client_id for backward compatibility
        $client = Client::where('uuid', $id)->orWhere('client_id', $id)->firstOrFail();

        // Authorization check
        if (!Gate::allows('update', $client)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        // Check if email exists
        if (!$client->email) {
            return response()->json([
                'message' => 'Client does not have an email address',
            ], 400);
        }

        // Check if feedback was sent recently (within last 3 months)
        if ($client->last_feedback_sent_at && now()->diffInMonths($client->last_feedback_sent_at) < 3) {
            $monthsAgo = now()->diffInMonths($client->last_feedback_sent_at);
            return response()->json([
                'message' => "Feedback form was sent {$monthsAgo} month(s) ago. Please wait until 3 months have passed.",
            ], 400);
        }

        // Send email
        try {
            Mail::to($client->email)->send(new ClientFeedbackFormEmail($client->name));

            // Update client record
            $client->update([
                'last_feedback_sent_at' => now(),
            ]);

            ActivityLog::create([
                'user_id' => $request->user()->id,
                'action' => 'feedback_form_sent',
                'model_type' => Client::class,
                'model_id' => $client->id,
                'description' => "Feedback form email sent to {$client->name} ({$client->email})",
                'ip_address' => $request->ip(),
            ]);

            return response()->json([
                'message' => 'Feedback form email sent successfully to ' . $client->email,
                'client_uuid' => $client->uuid,
                'last_feedback_sent_at' => $client->last_feedback_sent_at,
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to send feedback form email', [
                'client_id' => $client->id,
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => 'Failed to send email. Please try again later.',
            ], 500);
        }
    }

    public function resendAgreement(Request $request, $id)
    {
        // Find by UUID or fall back to client_id for backward compatibility
        $client = Client::where('uuid', $id)->orWhere('client_id', $id)->firstOrFail();

        // Authorization check
        if (!Gate::allows('update', $client)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        // Check if email exists
        if (!$client->email) {
            return response()->json([
                'message' => 'Client does not have an email address',
            ], 400);
        }

        // Send email
        try {
            Mail::to($client->email)->send(new ClientAgreementEmail($client->name));

            // Update client record
            $client->update([
                'agreement_status' => 'sent',
                'agreement_sent_at' => now(),
            ]);

            ActivityLog::create([
                'user_id' => $request->user()->id,
                'action' => 'agreement_resent',
                'model_type' => Client::class,
                'model_id' => $client->id,
                'description' => "Agreement email resent to {$client->name} ({$client->email})",
                'ip_address' => $request->ip(),
            ]);

            return response()->json([
                'message' => 'Agreement email sent successfully to ' . $client->email,
                'client_uuid' => $client->uuid,
                'agreement_sent_at' => $client->agreement_sent_at,
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to resend agreement email', [
                'client_id' => $client->id,
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => 'Failed to send email. Please try again later.',
            ], 500);
        }
    }

    public function updateSatisfactionScore(Request $request, $id)
    {
        // Find by UUID or fall back to client_id for backward compatibility
        $client = Client::where('uuid', $id)->orWhere('client_id', $id)->firstOrFail();

        // Authorization check
        if (!Gate::allows('update', $client)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $validated = $request->validate([
            'satisfaction_score' => 'required|numeric|min:0|max:5',
        ]);

        // Calculate new average satisfaction score
        $currentScore = $client->satisfaction_score ?? 0;
        $currentCount = $client->feedback_count ?? 0;
        $newScore = $validated['satisfaction_score'];
        
        // Calculate weighted average
        $totalScore = ($currentScore * $currentCount) + $newScore;
        $newCount = $currentCount + 1;
        $averageScore = $totalScore / $newCount;

        // Update client record
        $client->update([
            'satisfaction_score' => round($averageScore, 2),
            'feedback_count' => $newCount,
            'last_feedback_date' => now(),
        ]);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'satisfaction_score_updated',
            'model_type' => Client::class,
            'model_id' => $client->id,
            'description' => "Satisfaction score updated for {$client->name}: {$newScore}/5 (Average: {$averageScore}/5)",
            'changes' => [
                'new_score' => $newScore,
                'average_score' => round($averageScore, 2),
                'feedback_count' => $newCount,
            ],
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Satisfaction score updated successfully',
            'client' => $client->load('matchedTc'),
            'satisfaction_score' => round($averageScore, 2),
            'feedback_count' => $newCount,
        ]);
    }

    public function getEligibleForFeedback(Request $request)
    {
        // Authorization check
        if (!Gate::allows('viewAny', Client::class)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Get clients who are eligible for feedback forms (3+ months since last feedback or never sent)
        $query = Client::where('stage', 'Active Therapy')
            ->orWhere('stage', 'Completed')
            ->where(function($q) {
                $q->whereNull('last_feedback_sent_at')
                  ->orWhereRaw('DATEDIFF(NOW(), last_feedback_sent_at) >= 90');
            })
            ->with(['matchedTc']);

        if ($request->has('search')) {
            $search = Str::limit($request->search, 100);
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $clients = $query->get()->map(function($client) {
            $client->months_since_feedback = $client->last_feedback_sent_at 
                ? now()->diffInMonths($client->last_feedback_sent_at) 
                : null;
            return $client;
        });

        return response()->json($clients);
    }
}

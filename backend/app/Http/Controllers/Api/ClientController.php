<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\ClientTcMatch;
use App\Models\ActivityLog;
use App\Mail\DynamicEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Services\EmailService;

class ClientController extends Controller
{
    protected $emailService;

    public function __construct(EmailService $emailService)
    {
        $this->emailService = $emailService;
    }

    public function index(Request $request)
    {
        // Authorization check
        if (!Gate::allows('viewAny', Client::class)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $query = Client::with(['matchedTc'])->orderBy('id', 'desc');

        // Search - sanitize input
        if ($request->has('search')) {
            $search = Str::limit($request->search, 100); // Limit search length
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filters - validate enum values
        if ($request->has('stage') && $request->stage !== 'all') {
            $validStages = ['Application & Assessment form Submitted', 'Consultation Booked', 'Consultation Completed', 'Matched with TC', 'Agreement Sent', 'Agreement Signed', 'Sessions Bookable', 'Active Therapy'];
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
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'email' => 'required|email|unique:clients,email',
            'age' => 'nullable|integer|min:1|max:120',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'postcode' => 'nullable|string|max:20',
            'gender' => 'nullable|string|max:50',
            'ethnicity' => 'nullable|string|max:100',
            'sexual_orientation' => 'nullable|string|max:100',
            'service_type' => 'nullable|string|max:255',
            'primary_issues' => 'nullable|array|max:40',
            'primary_issues.*' => 'string|max:255',
            'availability' => 'nullable|array|max:7',
            'availability.*' => 'array',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:255',
            'emergency_contact_relationship' => 'nullable|string|max:255',
            'gp_name' => 'nullable|string|max:255',
            'gp_practice_name' => 'nullable|string|max:255',
            'gp_practice_phone' => 'nullable|string|max:255',
            'additional_details' => 'nullable|string',
            'risk_issues' => 'nullable|string',
            'on_medication' => 'nullable|string|max:10',
            'medication_details' => 'nullable|string',
            'disabilities' => 'nullable|string',
            'voicemail_permission' => 'nullable|string|max:10',
            'currently_in_therapy' => 'nullable|string|max:10',
            'how_heard_about' => 'nullable|string|max:255',
            'referral_reasons' => 'nullable|string',
            'referral_name' => 'nullable|string|max:255',
            'referral_phone' => 'nullable|string|max:255',
            'organization_name' => 'nullable|string|max:255',
            'organization_email' => 'nullable|string|max:255',
            'admin_notes' => 'nullable|string',
            'payment_status' => 'nullable|string|max:50',
            'stage' => 'nullable|string|max:100',
            'status' => 'nullable|string|max:50',
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
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'email' => 'sometimes|email|unique:clients,email,' . $client->id,
            'gender' => 'nullable|string|max:50',
            'ethnicity' => 'nullable|string|max:100',
            'sexual_orientation' => 'nullable|string|max:100',
            'service_type' => 'nullable|string',
            'primary_issues' => 'nullable|array|max:40',
            'primary_issues.*' => 'string|max:255',
            'availability' => 'nullable|array|max:7',
            'availability.*' => 'array',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:255',
            'emergency_contact_relationship' => 'nullable|string|max:255',
            'gp_name' => 'nullable|string|max:255',
            'gp_practice_name' => 'nullable|string|max:255',
            'gp_practice_phone' => 'nullable|string|max:255',
            'additional_details' => 'nullable|string',
            'risk_issues' => 'nullable|string',
            'on_medication' => 'nullable|string|max:10',
            'medication_details' => 'nullable|string',
            'disabilities' => 'nullable|string',
            'voicemail_permission' => 'nullable|string|max:10',
            'currently_in_therapy' => 'nullable|string|max:10',
            'how_heard_about' => 'nullable|string|max:255',
            'referral_reasons' => 'nullable|string',
            'referral_name' => 'nullable|string|max:255',
            'referral_phone' => 'nullable|string|max:255',
            'organization_name' => 'nullable|string|max:255',
            'organization_email' => 'nullable|string|max:255',
            'admin_notes' => 'nullable|string',
            'payment_status' => 'nullable|string|max:50',
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

    public function destroy(Request $request, $id)
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

    public function details(Request $request, $id)
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

        $response = $client->toArray();

        // Add photo_url if photo exists
        if ($client->photo) {
            $response['photo_url'] = $this->getStorageUrl($request, $client->photo);
        }

        return response()->json($response);
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
            'stage' => 'required|in:Application & Assessment form Submitted,Consultation Booked,Consultation Completed,Matched with TC,Agreement Sent,Agreement Signed,Sessions Bookable,Active Therapy',
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

        $query = Client::whereIn('stage', ['Consultation Booked', 'Consultation Completed'])
            ->with(['matchedTc', 'consultations' => function ($q) {
                $q->orderBy('id', 'desc')->with('tc');
            }]);

        if ($request->has('search')) {
            $search = Str::limit($request->search, 100);
            $query->where(function ($q) use ($search) {
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

        // Sorting
        $sortBy = $request->get('sort_by', 'newest');
        if ($sortBy === 'daysWaiting') {
            $query->orderBy('id', 'asc'); // Longest waiting first
        } elseif ($sortBy === 'name') {
            $query->orderBy('name', 'asc');
        } elseif ($sortBy === 'newest') {
            $query->orderBy('id', 'desc');
        } else {
            $query->orderBy('id', 'desc');
        }

        $clients = $query->get()->map(function ($client) {
            // Priority for baseline: 
            // 1. Latest consultation date (completed or scheduled)
            // 2. Client's submitted_date
            // 3. Client's created_at
            $latestConsultation = $client->consultations->first();
            $baseline = null;

            if ($latestConsultation) {
                $baseline = $latestConsultation->completed_at ?: $latestConsultation->scheduled_at;
            }

            if (!$baseline) {
                $baseline = $client->submitted_date ?: $client->created_at;
            }

            // Ensure baseline is a valid Carbon instance
            if (!$baseline instanceof \Carbon\Carbon) {
                $baseline = \Illuminate\Support\Carbon::parse($baseline);
            }

            $now = now();

            $diffInHours = $now->diffInHours($baseline);
            $diffInDays = $now->diffInDays($baseline);

            // Logic: If less than 24 hours → show "Less than 1 day"
            if ($diffInHours < 24) {
                $client->waiting_days_text = "Less than 1 day";
            } else {
                $client->waiting_days_text = $diffInDays . " " . Str::plural('day', $diffInDays) . " waiting";
            }

            // Numeric values for backwards compatibility and sorting
            $client->days_waiting = $diffInDays;
            $client->waiting_hours = $diffInHours;

            // Calculate urgency based on multiple factors
            $urgency = $this->calculateUrgency($client);
            $client->urgency = $urgency;

            return $client;
        });

        // Filter by urgency if requested
        if ($request->has('urgency') && $request->urgency !== 'all') {
            $validUrgencies = ['high', 'medium', 'low'];
            if (in_array($request->urgency, $validUrgencies)) {
                $clients = $clients->filter(function ($client) use ($request) {
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

        $count = Client::where('stage', 'Consultation Completed')->count();
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

        // Authorization check - moved after finding the client
        if (!Gate::allows('update', $client)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Validation for Counsellor Type vs Service Type
        if ($client->service_type === 'Low Cost' && $tc->counsellor_type !== 'Trainee') {
            return response()->json(['message' => 'Low Cost clients must be matched with a Trainee Counsellor.'], 422);
        }
        if ($client->service_type === 'Mid Range' && $tc->counsellor_type !== 'Qualified') {
            return response()->json(['message' => 'Mid-Range clients must be matched with a Qualified Counsellor.'], 422);
        }


        // Check if match already exists
        $existingMatch = ClientTcMatch::where('client_id', $client->id)
            ->where('tc_id', $tc->id)
            ->first();

        $isNewMatch = !$existingMatch;

        if ($existingMatch) {
            // Update existing match instead of creating a new one
            $existingMatch->update([
                'match_score' => $validated['match_score'] ?? $existingMatch->match_score,
                'assignment_notes' => $validated['assignment_notes'] ?? $existingMatch->assignment_notes,
                'service_type' => $client->service_type,
                'status' => 'assigned',
                'assigned_date' => $existingMatch->assigned_date ?? now(),
                'send_notification' => $validated['send_notification'] ?? true,
            ]);


            $match = $existingMatch;

            // Log the update
            ActivityLog::create([
                'user_id' => $request->user()->id,
                'action' => 'client_tc_match_updated',
                'model_type' => ClientTcMatch::class,
                'model_id' => $match->id,
                'description' => "{$request->user()->name} updated match between client {$client->name} and TC {$tc->name}",
                'ip_address' => $request->ip(),
            ]);
        } else {
            // Create new match
            $match = ClientTcMatch::create([
                'client_id' => $client->id,
                'tc_id' => $tc->id,
                'service_type' => $client->service_type,
                'match_score' => $validated['match_score'] ?? null,
                'assignment_notes' => $validated['assignment_notes'] ?? null,
                'status' => 'assigned',
                'assigned_date' => now(),
                'send_notification' => $validated['send_notification'] ?? true,
            ]);


            // Update TC client count only for new matches
            $tc->increment('current_clients');

            // Log the new match
            ActivityLog::create([
                'user_id' => $request->user()->id,
                'action' => 'client_tc_matched',
                'model_type' => ClientTcMatch::class,
                'model_id' => $match->id,
                'description' => "{$request->user()->name} matched client {$client->name} with TC {$tc->name}",
                'ip_address' => $request->ip(),
            ]);
        }

        // Update client
        $updateData = [
            'matched_tc_id' => $tc->id,
            'matched_date' => $client->matched_date ?? now(),
            'stage' => 'Matched with TC',
        ];

        $client->update($updateData);

        // Send notification emails if requested
        $shouldSendNotification = $validated['send_notification'] ?? true;

        if ($shouldSendNotification) {
            try {
                // Generate agreement URL
                $companySettings = DB::table('company_settings')->pluck('value', 'key')->toArray();
                $useInternalAgreement = ($companySettings['use_internal_agreement_form'] ?? '0') === '1';

                if ($useInternalAgreement) {
                    $baseUrl = rtrim(config('app.frontend_url'), '/');
                    $slug = ($client->service_type === 'Low Cost') ? 'low-cost' : 'mid-range';
                    $agreementUrl = $baseUrl . '/agreement/' . $slug . '?uuid=' . $client->uuid;
                } else {
                    $agreementUrl = $companySettings['jotform_agreement_url'] ?? 'https://form.jotform.com/vanquish/agreement';
                }

                // Send email to client using EmailService
                if ($client->email) {
                    $this->emailService->sendAndLog(
                        $client,
                        'match_assigned',
                        [
                            'client_name' => $client->name,
                            'tc_name' => $tc->abbreviated_name,
                            'email' => $client->email,
                            'agreement_url' => $agreementUrl
                        ]
                    );


                    sleep(2); // Delay

                    // Send agreement link using EmailService
                    $this->emailService->sendAndLog(
                        $client,
                        'agreement_sent',
                        [
                            'client_name' => $client->name,
                            'email' => $client->email,
                            'agreement_url' => $agreementUrl
                        ]
                    );

                    // Update client record
                    $client->update([
                        'agreement_status' => 'sent',
                        'agreement_sent_at' => now(),
                        'stage' => 'Agreement Sent',
                    ]);
                }


                // Send email to TC
                if ($tc->email) {
                    sleep(2); // Delay to prevent Mailtrap rate limits

                    $dashboardUrl = $baseUrl . '/dashboard/clients/' . $client->uuid;

                    Mail::to($tc->email)->send(new DynamicEmail(
                        'tc_match_notification',
                        [
                            'tc_name' => $tc->name,
                            'client_name' => $client->name,
                            'client_age' => $client->age ?? 'Not provided',
                            'service_type' => $client->service_type ?? 'Not provided',
                            'match_score' => $validated['match_score'] ?? 0,
                            'notes' => $validated['assignment_notes'] ?? 'N/A',
                            'dashboard_url' => $dashboardUrl
                        ]
                    ));
                }

                // Log email notifications
                ActivityLog::create([
                    'user_id' => $request->user()->id,
                    'action' => 'match_notifications_sent',
                    'model_type' => ClientTcMatch::class,
                    'model_id' => $match->id,
                    'description' => "Match notification emails sent to {$client->name} and {$tc->name}",
                    'ip_address' => $request->ip(),
                ]);
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Failed to send match notification emails', [
                    'match_id' => $match->id,
                    'client_id' => $client->id,
                    'tc_id' => $tc->id,
                    'error' => $e->getMessage(),
                ]);
                // Don't fail the entire request if email fails
            }
        }

        return response()->json($match->load(['client', 'tc']), $isNewMatch ? 201 : 200);
    }

    public function unassignMatch(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required',
        ]);

        // Find by UUID or ID
        $client = Client::where('uuid', $validated['client_id'])
            ->orWhere('id', $validated['client_id'])
            ->firstOrFail();

        // Authorization check
        if (!Gate::allows('update', $client)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!$client->matched_tc_id) {
            return response()->json(['message' => 'Client is not assigned to any TC'], 400);
        }

        $tcId = $client->matched_tc_id;
        $tc = \App\Models\TrainingCounsellor::find($tcId);

        // Update match record status
        $match = ClientTcMatch::where('client_id', $client->id)
            ->where('tc_id', $tcId)
            ->where('status', 'assigned')
            ->first();

        if ($match) {
            $match->update([
                'status' => 'cancelled',
            ]);
        }

        // Decrement TC client count
        if ($tc) {
            $tc->decrement('current_clients');
        }

        // Update client status
        $oldTcName = $tc ? $tc->name : 'Unknown TC';
        $client->update([
            'matched_tc_id' => null,
            'matched_date' => null,
            'stage' => 'Consultation Completed', // Go back to pending matches
        ]);

        // Log activity
        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'client_tc_unassigned',
            'model_type' => Client::class,
            'model_id' => $client->id,
            'description' => "{$request->user()->name} unassigned client {$client->name} from TC {$oldTcName}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['message' => 'Client unassigned successfully']);
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
        $success = $this->emailService->sendAndLog(
            $client,
            'generic_client_email',
            [
                'client_name' => $client->name,
                'message' => $validated['message'],
                'subject' => $validated['subject']
            ]
        );

        if (!$success) {
            return response()->json([
                'message' => 'Failed to send email. Please try again later.',
            ], 500);
        }

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
        $baseUrl = rtrim(config('app.frontend_url'), '/');
        $success = $this->emailService->sendAndLog(
            $client,
            'feedback_form',
            [
                'client_name' => $client->name,
                'feedback_url' => $baseUrl . '/feedback-form?' . http_build_query(['uuid' => $client->uuid])
            ]
        );

        if (!$success) {
            return response()->json([
                'message' => 'Failed to send email. Please try again later.',
            ], 500);
        }

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

        // Generate agreement URL
        $companySettings = DB::table('company_settings')->pluck('value', 'key')->toArray();
        $useInternalAgreement = ($companySettings['use_internal_agreement_form'] ?? '0') === '1';

        if ($useInternalAgreement) {
            $baseUrl = rtrim(config('app.frontend_url'), '/');
            $slug = ($client->service_type === 'Low Cost') ? 'low-cost' : 'mid-range';
            $agreementUrl = $baseUrl . '/agreement/' . $slug . '?uuid=' . $client->uuid;
        } else {
            $agreementUrl = $companySettings['jotform_agreement_url'] ?? 'https://form.jotform.com/vanquish/agreement';
        }

        $success = $this->emailService->sendAndLog(
            $client,
            'agreement_sent',
            [
                'client_name' => $client->name,
                'email' => $client->email,
                'agreement_url' => $agreementUrl
            ]
        );

        if (!$success) {
            return response()->json([
                'message' => 'Failed to send email. Please try again later.',
            ], 500);
        }

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
            ->where(function ($q) {
                $q->whereNull('last_feedback_sent_at')
                    ->orWhereRaw('DATEDIFF(NOW(), last_feedback_sent_at) >= 90');
            })
            ->with(['matchedTc']);

        if ($request->has('search')) {
            $search = Str::limit($request->search, 100);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $clients = $query->get()->map(function ($client) {
            $client->months_since_feedback = $client->last_feedback_sent_at
                ? now()->diffInMonths($client->last_feedback_sent_at)
                : null;
            return $client;
        });

        return response()->json($clients);
    }

    /**
     * Upload photo for client (admin only)
     */
    public function uploadPhoto(Request $request, $id)
    {
        // Find by UUID or fall back to client_id for backward compatibility
        $client = Client::where('uuid', $id)->orWhere('client_id', $id)->firstOrFail();

        // Only admin can upload photos
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Admin access required.'], 403);
        }

        $request->validate([
            'photo' => 'required|image|mimes:jpeg,jpg,png|max:5120', // Max 5MB
        ]);

        $file = $request->file('photo');

        // Additional security checks
        $originalName = $file->getClientOriginalName();
        $extension = strtolower($file->getClientOriginalExtension());
        $mimeType = $file->getMimeType();

        // Validate file extension
        $allowedExtensions = ['jpg', 'jpeg', 'png'];
        if (!in_array($extension, $allowedExtensions)) {
            return response()->json([
                'message' => 'Invalid file type. Allowed types: JPG, JPEG, PNG',
            ], 422);
        }

        // Validate MIME type
        $allowedMimeTypes = ['image/jpeg', 'image/png'];
        if (!in_array($mimeType, $allowedMimeTypes)) {
            return response()->json([
                'message' => 'Invalid file MIME type.',
            ], 422);
        }

        // Sanitize filename
        $sanitizedName = preg_replace('/[^a-zA-Z0-9._-]/', '_', $originalName);
        $sanitizedName = substr($sanitizedName, 0, 255);

        // Generate unique filename to prevent overwrites
        $filename = time() . '_' . uniqid() . '_' . $sanitizedName;

        // Delete old photo if exists
        if ($client->photo) {
            $oldPhotoPath = storage_path('app/public/' . $client->photo);
            if (file_exists($oldPhotoPath)) {
                @unlink($oldPhotoPath);
            }
        }

        $path = $file->storeAs("client_photos/{$client->id}", $filename, 'public');

        // Update client with photo path
        $client->update(['photo' => $path]);

        // Log activity
        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'client_photo_uploaded',
            'model_type' => Client::class,
            'model_id' => $client->id,
            'description' => "Photo uploaded for client {$client->name}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Photo uploaded successfully',
            'photo' => $path,
            'photo_url' => $this->getStorageUrl($request, $path),
        ]);
    }

    /**
     * Delete photo for client (admin only)
     */
    public function deletePhoto(Request $request, $id)
    {
        // Find by UUID or fall back to client_id for backward compatibility
        $client = Client::where('uuid', $id)->orWhere('client_id', $id)->firstOrFail();

        // Only admin can delete photos
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Admin access required.'], 403);
        }

        if (!$client->photo) {
            return response()->json([
                'message' => 'No photo to delete',
            ], 404);
        }

        // Delete file from storage
        $photoPath = storage_path('app/public/' . $client->photo);
        if (file_exists($photoPath)) {
            @unlink($photoPath);
        }

        // Update client
        $client->update(['photo' => null]);

        // Log activity
        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'client_photo_deleted',
            'model_type' => Client::class,
            'model_id' => $client->id,
            'description' => "Photo deleted for client {$client->name}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Photo deleted successfully',
        ]);
    }

    /**
     * Generate storage URL using request's base URL
     */
    private function getStorageUrl(Request $request, $path)
    {
        $baseUrl = $request->getSchemeAndHttpHost();
        return $baseUrl . '/storage/' . $path;
    }

    /**
     * Download client report as PDF
     */
    public function downloadReport(Request $request, $id)
    {
        // Find by UUID or fall back to client_id for backward compatibility
        $client = Client::where('uuid', $id)
            ->orWhere('client_id', $id)
            ->with([
                'matchedTc',
                'consultations',
                'intakeForm'
            ])
            ->firstOrFail();

        // Authorization check
        if (!Gate::allows('view', $client)) {
            // Allow if user is staff/admin even if policy might be stricter
            // But let's stick to standard gate check or role check
            if ($request->user()->role !== 'admin' && $request->user()->role !== 'staff') {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        // Extract Intake Form Data
        $emergencyContact = [];
        $gpDetails = [];

        if ($client->intakeForm && $client->intakeForm->count() > 0) {
            $intake = $client->intakeForm->first();

            // Parse emergency contact
            if ($intake->emergency_contact) {
                try {
                    $decoded = json_decode($intake->emergency_contact, true);
                    if (is_array($decoded)) {
                        $emergencyContact = $decoded;
                    }
                } catch (\Exception $e) { /* ignore */
                }
            }

            // Parse GP details
            if ($intake->gp_details) {
                try {
                    $decoded = json_decode($intake->gp_details, true);
                    if (is_array($decoded)) {
                        $gpDetails = $decoded;
                    }
                } catch (\Exception $e) { /* ignore */
                }
            }
        }
    
        // Fetch company settings
        $companySettings = DB::table('company_settings')->pluck('value', 'key')->toArray();

        // Get consultations sorted by date
        $consultations = $client->consultations->sortByDesc('scheduled_at');

        // Generate PDF
        $pdf = Pdf::loadView('pdf.client-report', [
            'client' => $client,
            'emergencyContact' => $emergencyContact,
            'gpDetails' => $gpDetails,
            'consultations' => $consultations,
            'companySettings' => $companySettings,
        ]);

        // Set paper size and orientation
        $pdf->setPaper('A4', 'portrait');

        // Log activity
        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'report_downloaded',
            'model_type' => Client::class,
            'model_id' => $client->id,
            'description' => "Report downloaded for client {$client->name}",
            'ip_address' => $request->ip(),
        ]);

        // Return PDF download with requested format: TC_{NAME}_REPORT.pdf
        // Note: For clients, maybe CL_{NAME}_REPORT.pdf is better?
        // User asked for "TC_CHARLES_REPORT.pdf" for TCs.
        // For clients, I will use "CLIENT_CHARLES_REPORT.pdf" to differentiate.
        $sanitizedName = strtoupper(preg_replace('/[^a-zA-Z0-9]/', '_', $client->name));
        return $pdf->download("CLIENT_{$sanitizedName}_REPORT.pdf");
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TraineeApplication;
use App\Models\TraineeApplicationSetting;
use App\Models\TrainingCounsellor;
use App\Models\User;
use App\Models\ActivityLog;
use App\Mail\DynamicEmail;
use App\Jobs\SendTraineeStageTwoInvite;
use App\Jobs\SendInterviewReminder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class TraineeApplicationController extends Controller
{
    /**
     * Display a listing of applications.
     */
    public function index(Request $request)
    {
        $query = TraineeApplication::orderBy('created_at', 'desc');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('source') && $request->source !== 'all') {
            $query->where('source', $request->source);
        }

        return response()->json($query->paginate($request->input('per_page', 20)));
    }

    /**
     * Get count of new trainee applications.
     */
    public function pendingCount()
    {
        $count = TraineeApplication::where('status', 'New Application')->count();
        return response()->json($count);
    }

    /**
     * Store a newly created application (Internal Form).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'institution' => 'nullable|string|max:255',
            'course_name' => 'nullable|string|max:255',
            'course_duration' => 'nullable|string|max:255',
            'experience_background' => 'nullable|string',
        ]);

        $validated['source'] = 'internal_form';
        $validated['status'] = 'New Application';

        // duplicate prevention: update if exists
        $application = TraineeApplication::updateOrCreate(
            ['email' => $validated['email']],
            $validated
        );

        ActivityLog::create([
            'user_id' => $request->user()->id ?? null,
            'action' => 'trainee_application_submitted_internal',
            'model_type' => TraineeApplication::class,
            'model_id' => $application->id,
            'description' => "Trainee application submitted internally for {$application->first_name} {$application->last_name}",
            'changes' => $validated,
            'ip_address' => $request->ip(),
        ]);

        // Send Email #1 Immediately
        try {
            Mail::to($application->email)->send(new DynamicEmail('trainee_application_received', [
                'first_name' => $application->first_name,
                'last_name' => $application->last_name,
                'email' => $application->email,
            ]));
        } catch (\Exception $e) {
            Log::error("Failed to send trainee application received email: " . $e->getMessage());
        }

        // QUEUE JOB: Send Email #2 after 48 hours
        try {
            SendTraineeStageTwoInvite::dispatch($application)->delay(now()->addHours(48));
        } catch (\Exception $e) {
            Log::error("Failed to dispatch trainee stage two invite: " . $e->getMessage());
        }

        return response()->json([
            'message' => 'Application submitted successfully',
            'application' => $application,
        ], 201);
    }

    /**
     * Send initial invitation to apply (before application exists).
     */
    public function inviteEmail(Request $request)
    {
        $validated = $request->validate([
            'email'      => 'required|email',
            'first_name' => 'required|string|max:255',
        ]);

        try {
            Mail::to($validated['email'])->send(new DynamicEmail('trainee_initial_invite', [
                'first_name' => $validated['first_name'],
            ]));

            return response()->json(['message' => 'Invitation sent successfully']);
        } catch (\Exception $e) {
            Log::error("Failed to send initial trainee invite: " . $e->getMessage());
            return response()->json(['message' => 'Failed to send invitation'], 500);
        }
    }

    /**
     * Display the specified application.
     */
    public function show(TraineeApplication $traineeApplication)
    {
        return response()->json($traineeApplication);
    }

    public function updateStatus(Request $request, TraineeApplication $traineeApplication)
    {
        $validated = $request->validate([
            'status' => 'required|string', // Support full status workflow
            'induction_date' => 'nullable|string', // Optional date for acceptance
        ]);

        $oldStatus = $traineeApplication->status;
        $traineeApplication->update([
            'status' => $validated['status'],
            'induction_date' => $validated['induction_date'] ?? $traineeApplication->induction_date
        ]);

        try {
            ActivityLog::create([
                'user_id' => optional($request->user())->id,
                'action' => 'trainee_application_status_updated',
                'model_type' => TraineeApplication::class,
                'model_id' => $traineeApplication->id,
                'description' => "Application status updated from {$oldStatus} to {$validated['status']} for " . ($traineeApplication->name ?? 'applicant'),
                'changes' => ['old_status' => $oldStatus, 'new_status' => $validated['status']],
                'ip_address' => $request->ip(),
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to log trainee status update: " . $e->getMessage());
        }
 
        // If manually moved to Stage 3 Interview Booked and no data exists, set defaults
        if ($validated['status'] === 'Stage 3 Interview Booked' && empty($traineeApplication->interview_data)) {
            $zoomLink = TraineeApplicationSetting::getByKey('default_zoom_link', config('services.trafft.default_zoom_link', 'https://zoom.us/j/vanquishtherapies'));
            
            $traineeApplication->update([
                'interview_data' => [
                    'trafft' => [
                        'appointment_id' => 'MANUAL-' . strtoupper(\Illuminate\Support\Str::random(6)),
                        'meeting_id' => rand(100000000, 999999999),
                        'date' => 'TBC',
                        'time' => 'TBC',
                        'host_name' => 'Vanquish Admin',
                        'zoom_link' => $zoomLink,
                    ]
                ]
            ]);
        }
 
        // TRIGGER EMAIL: Stage 2 Invitation (HireVire link)
        if ($validated['status'] === 'Stage 2 Invited') {
            try {
                Mail::to($traineeApplication->email)->send(new DynamicEmail('trainee_stage_two_invite', [
                    'first_name' => $traineeApplication->first_name,
                    'interview_link' => config('services.hirevire.interview_url', 'https://hirevire.com/v/vanquish-therapies-trainee/'),
                ]));
            } catch (\Exception $e) {
                Log::error("Failed to send stage 2 invite: " . $e->getMessage());
            }
        }

        // TRIGGER EMAIL: If Stage 2 is approved, send Stage 3 Invitation (Trafft booking link)
        if ($validated['status'] === 'Stage 2 Approved') {
            try {
                Mail::to($traineeApplication->email)->send(new DynamicEmail('trainee_stage_three_invite', [
                    'first_name'   => $traineeApplication->first_name,
                    'full_name'    => $traineeApplication->first_name . ' ' . $traineeApplication->last_name,
                    'booking_link' => config('services.trafft.booking_url', 'https://vanquishtherapies.co.uk/placement-interview/'),
                    'induction_date' => config('services.trafft.next_induction_date', 'Monday, 19th January, 10:00am'),
                ]));
            } catch (\Exception $e) {
                Log::error("Failed to send stage 3 invite: " . $e->getMessage());
            }
        }

        // TRIGGER EMAIL: If Accepted
        if ($validated['status'] === 'Accepted') {
            try {
                Mail::to($traineeApplication->email)->send(new DynamicEmail('trainee_placement_acceptance', [
                    'first_name' => $traineeApplication->first_name,
                    'induction_date' => $validated['induction_date'] ?? 'To be confirmed',
                ]));
            } catch (\Exception $e) {
                Log::error("Failed to send acceptance email: " . $e->getMessage());
            }
        }

        // TRIGGER EMAIL: If Rejected (from ANY stage)
        $postStage1Statuses = ['New Application', 'Stage 2 Invited', 'Stage 2 Video Submitted', 'Stage 2 Approved', 'Stage 3 Interview Booked', 'Interview Attended'];
        if ($validated['status'] === 'Rejected' && in_array($oldStatus, $postStage1Statuses)) {
            try {
                Mail::to($traineeApplication->email)->send(new DynamicEmail('trainee_placement_rejection', [
                    'first_name' => $traineeApplication->first_name,
                ]));
            } catch (\Exception $e) {
                Log::error("Failed to send rejection email: " . $e->getMessage());
            }
        }

        return response()->json($traineeApplication);
    }

    /**
     * Remove the specified application.
     */
    public function destroy(TraineeApplication $traineeApplication)
    {
        $traineeApplication->delete();
        return response()->json(['message' => 'Application deleted successfully']);
    }

    /**
     * Generate Zoom Meeting SDK Signature.
     */
    public function getZoomSignature(Request $request, $id)
    {
        $application = TraineeApplication::findOrFail($id);
        $meetingNumber = $application->interview_data['trafft']['meeting_id'] ?? null;
        
        if (!$meetingNumber) {
            return response()->json(['error' => 'No meeting ID associated with this application'], 422);
        }

        $sdkKey = TraineeApplicationSetting::getByKey('zoom_sdk_key', config('services.zoom.sdk_key'));
        $sdkSecret = TraineeApplicationSetting::getByKey('zoom_sdk_secret', config('services.zoom.sdk_secret'));

        if (!$sdkKey || !$sdkSecret) {
            return response()->json(['error' => 'Zoom SDK credentials not configured'], 500);
        }

        $role = 1; // 1 for host/admin, 0 for participant
        $iat = time() - 30; // issued at
        $exp = $iat + 60 * 60 * 2; // expires in 2 hours

        $header = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
        
        $payload = base64_encode(json_encode([
            'sdkKey' => $sdkKey,
            'mn' => (int)$meetingNumber,
            'role' => $role,
            'iat' => $iat,
            'exp' => $exp,
            'appKey' => $sdkKey,
            'tokenExp' => $exp
        ]));

        $signature = hash_hmac('sha256', "$header.$payload", $sdkSecret, true);
        $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        
        $token = "$header.$payload.$base64Signature";

        return response()->json([
            'signature' => $token,
            'sdk_key' => $sdkKey,
            'meeting_number' => $meetingNumber,
            'password' => '', // Meetings might require password, usually empty for Trafft unless set
        ]);
    }

    /**
     * Settings for Trainee Applications.
     */
     public function getSettings()
    {
        $priorityQuestions = TraineeApplicationSetting::getByKey('priority_questions', []);
        $zoomLink = TraineeApplicationSetting::getByKey('default_zoom_link', config('services.trafft.default_zoom_link'));
        $inductionDate = TraineeApplicationSetting::getByKey('next_induction_date', config('services.trafft.next_induction_date'));
        $zoomMode = TraineeApplicationSetting::getByKey('zoom_mode', 'embedded');
        $sdkKey = TraineeApplicationSetting::getByKey('zoom_sdk_key', '');
        $sdkSecret = TraineeApplicationSetting::getByKey('zoom_sdk_secret', '');
        
        return response()->json([
            'priority_questions' => $priorityQuestions,
            'default_zoom_link' => $zoomLink,
            'next_induction_date' => $inductionDate,
            'zoom_mode' => $zoomMode,
            'zoom_sdk_key' => $sdkKey,
            'zoom_sdk_secret' => $sdkSecret ? '********' : '' // Mask secret
        ]);
    }

    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'priority_questions' => 'sometimes|array',
            'default_zoom_link' => 'sometimes|string|nullable',
            'next_induction_date' => 'sometimes|string|nullable',
            'zoom_mode' => 'sometimes|string|in:embedded,web_client',
            'zoom_sdk_key' => 'sometimes|string|nullable',
            'zoom_sdk_secret' => 'sometimes|string|nullable',
        ]);
        
        if (isset($validated['priority_questions'])) {
            TraineeApplicationSetting::setByKey('priority_questions', $validated['priority_questions']);
        }
        
        if (isset($validated['default_zoom_link'])) {
            TraineeApplicationSetting::setByKey('default_zoom_link', $validated['default_zoom_link']);
        }

        if (isset($validated['next_induction_date'])) {
            TraineeApplicationSetting::setByKey('next_induction_date', $validated['next_induction_date']);
        }

        if (isset($validated['zoom_mode'])) {
            TraineeApplicationSetting::setByKey('zoom_mode', $validated['zoom_mode']);
        }

        if (isset($validated['zoom_sdk_key'])) {
            TraineeApplicationSetting::setByKey('zoom_sdk_key', $validated['zoom_sdk_key']);
        }

        if (isset($validated['zoom_sdk_secret']) && $validated['zoom_sdk_secret'] !== '********') {
            TraineeApplicationSetting::setByKey('zoom_sdk_secret', $validated['zoom_sdk_secret']);
        }
        
        return response()->json([
            'message' => 'Trainee settings updated successfully',
            'priority_questions' => TraineeApplicationSetting::getByKey('priority_questions', []),
            'default_zoom_link' => TraineeApplicationSetting::getByKey('default_zoom_link'),
            'next_induction_date' => TraineeApplicationSetting::getByKey('next_induction_date'),
            'zoom_mode' => TraineeApplicationSetting::getByKey('zoom_mode', 'embedded'),
            'zoom_sdk_key' => TraineeApplicationSetting::getByKey('zoom_sdk_key'),
            'zoom_sdk_secret' => '********'
        ]);
    }

    /**
     * Send Stage 2 Invite manually (Admin override).
     */
    public function sendInvite(TraineeApplication $traineeApplication)
    {
        if ($traineeApplication->status === 'Rejected') {
            return response()->json(['message' => 'Cannot invite a rejected applicant.'], 400);
        }

        SendTraineeStageTwoInvite::dispatchSync($traineeApplication);

        return response()->json([
            'message' => 'Stage 2 invitation sent successfully',
            'status'  => $traineeApplication->fresh()->status,
        ]);
    }

    /**
     * Send Stage 3 Interview Invite manually (Admin override).
     */
    public function sendStageThreeInvite(TraineeApplication $traineeApplication)
    {
        if ($traineeApplication->status === 'Rejected') {
            return response()->json(['message' => 'Cannot invite a rejected applicant.'], 400);
        }

        try {
            Mail::to($traineeApplication->email)->send(new DynamicEmail('trainee_stage_three_invite', [
                'first_name'     => $traineeApplication->first_name,
                'full_name'      => $traineeApplication->first_name . ' ' . $traineeApplication->last_name,
                'booking_link'   => config('services.trafft.booking_url', 'https://vanquishtherapies.co.uk/placement-interview/'),
                'induction_date' => config('services.trafft.next_induction_date', 'Monday, 19th January, 10:00am'),
            ]));

            $traineeApplication->update(['status' => 'Stage 2 Approved']);
        } catch (\Exception $e) {
            Log::error("Failed to manual send Stage 3 invite: " . $e->getMessage());
            return response()->json(['message' => 'Failed to send invitation.'], 500);
        }

        return response()->json([
            'message' => 'Stage 3 invitation sent successfully',
            'status'  => $traineeApplication->fresh()->status,
        ]);
    }

    /**
     * Step 8 — Record interview attendance (admin marks attended or no-show).
     *
     * POST /api/trainee-applications/{id}/attendance
     */
    public function recordAttendance(Request $request, TraineeApplication $traineeApplication)
    {
        $validated = $request->validate([
            'attended'      => 'required|boolean',
            'notes'         => 'nullable|string|max:2000',
            'attended_at'   => 'nullable|date',
        ]);

        $status = $validated['attended'] ? 'Interview Attended' : 'Interview No Show';

        $interviewData = is_array($traineeApplication->interview_data)
            ? $traineeApplication->interview_data
            : [];

        $traineeApplication->update([
            'status'         => $status,
            'interview_data' => array_merge($interviewData, [
                'attendance' => [
                    'attended'    => $validated['attended'],
                    'attended_at' => $validated['attended_at'] ?? now()->toIso8601String(),
                    'notes'       => $validated['notes'] ?? null,
                    'recorded_by' => $request->user()->id,
                ]
            ]),
        ]);

        try {
            ActivityLog::create([
                'user_id'     => optional($request->user())->id,
                'action'      => 'trainee_interview_attendance_recorded',
                'model_type'  => TraineeApplication::class,
                'model_id'    => $traineeApplication->id,
                'description' => "Interview attendance recorded ({$status}) for " . ($traineeApplication->name ?? 'applicant'),
                'changes'     => ['status' => $status, 'attended' => $validated['attended']],
                'ip_address'  => $request->ip(),
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to log trainee interview attendance: " . $e->getMessage());
        }

        return response()->json([
            'message'     => 'Attendance recorded',
            'status'      => $status,
            'application' => $traineeApplication->fresh(),
        ]);
    }

    /**
     * Step 8 — Admin makes final placement decision.
     *
     * POST /api/trainee-applications/{id}/decision
     * Body: { decision: 'Accepted'|'Rejected'|'Pending', induction_date?: string, notes?: string }
     */
    public function makeDecision(Request $request, TraineeApplication $traineeApplication)
    {
        $validated = $request->validate([
            'decision'       => 'required|in:Accepted,Rejected,Pending',
            'induction_date' => 'nullable|string',
            'notes'          => 'nullable|string|max:2000',
        ]);

        $oldStatus = $traineeApplication->status;
        $newStatus = $validated['decision'] === 'Pending' ? 'Hold' : $validated['decision'];

        $interviewData = is_array($traineeApplication->interview_data) ? $traineeApplication->interview_data : [];
        $interviewData['decision'] = [
            'outcome'        => $validated['decision'],
            'decided_at'     => now()->toIso8601String(),
            'decided_by'     => $request->user()->id,
            'induction_date' => $validated['induction_date'] ?? null,
            'notes'          => $validated['notes'] ?? null,
        ];

        $traineeApplication->update([
            'status'         => $newStatus,
            'interview_data' => $interviewData,
        ]);

        try {
            ActivityLog::create([
                'user_id'     => optional($request->user())->id,
                'action'      => 'trainee_placement_decision',
                'model_type'  => TraineeApplication::class,
                'model_id'    => $traineeApplication->id,
                'description' => "Placement decision '{$validated['decision']}' recorded for " . ($traineeApplication->name ?? 'applicant'),
                'changes'     => ['decision' => $validated['decision'], 'old_status' => $oldStatus, 'new_status' => $newStatus],
                'ip_address'  => $request->ip(),
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to log trainee placement decision: " . $e->getMessage());
        }

        // Initialize onboarding data if accepted
        if ($validated['decision'] === 'Accepted') {
            $traineeApplication->update([
                'onboarding_data' => [
                    'checklist' => [
                        'four_way_agreement' => false,
                        'therapy_form'       => false,
                        'induction_attended' => false,
                        'portal_setup'       => false,
                        'policies_signed'    => false,
                    ],
                    'induction_date' => $validated['induction_date'] ?? 'To be confirmed',
                ]
            ]);
        }

        // Send emails (kept from previous step)
        if ($validated['decision'] === 'Accepted') {
            try {
                $companySettings = \Illuminate\Support\Facades\DB::table('company_settings')->pluck('value', 'key')->toArray();
                
                Mail::to($traineeApplication->email)->send(new DynamicEmail('trainee_placement_acceptance', [
                    'first_name'              => $traineeApplication->first_name,
                    'induction_date'          => $validated['induction_date'] ?? 'Monday, 19th January, 10:00am',
                    'induction_zoom_link'    => config('services.trafft.default_zoom_link', 'https://zoom.us/j/vanquish-induction'),
                    'agreement_download_link' => 'https://vanquishtherapies.co.uk/templates/4-way-agreement-trainee.docx',
                    'therapy_form_url'        => ($companySettings['use_internal_agreement_form'] ?? '0') === '1' 
                                                ? rtrim(config('app.frontend_url'), '/') . '/therapy-form' 
                                                : ($companySettings['jotform_therapy_form_url'] ?? 'https://form.jotform.com/241002800146035'),
                ]));
            } catch (\Exception $e) {
                Log::error("Failed to send acceptance email: " . $e->getMessage());
            }
        } elseif ($validated['decision'] === 'Rejected') {
            try {
                Mail::to($traineeApplication->email)->send(new DynamicEmail('trainee_placement_rejection', [
                    'first_name' => $traineeApplication->first_name,
                ]));
            } catch (\Exception $e) {
                Log::error("Failed to send rejection email: " . $e->getMessage());
            }
        }

        return response()->json([
            'message'     => "Decision recorded: {$validated['decision']}",
            'status'      => $newStatus,
            'application' => $traineeApplication->fresh(),
        ]);
    }

    /**
     * Step 10 — Update paperwork status (agreement, therapy form).
     */
    public function updatePaperwork(Request $request, TraineeApplication $traineeApplication)
    {
        $validated = $request->validate([
            'document_key' => 'required|in:four_way_agreement,therapy_form',
            'status'       => 'required|boolean',
        ]);

        $onboarding = is_array($traineeApplication->onboarding_data) 
            ? $traineeApplication->onboarding_data 
            : ['checklist' => []];

        $onboarding['checklist'][$validated['document_key']] = $validated['status'];
        $onboarding['history'][] = [
            'action' => "paperwork_{$validated['document_key']}_updated",
            'status' => $validated['status'],
            'at'     => now()->toIso8601String(),
            'by'     => $request->user()->id,
        ];

        $traineeApplication->update(['onboarding_data' => $onboarding]);

        return response()->json([
            'message' => 'Paperwork status updated',
            'application' => $traineeApplication->fresh()
        ]);
    }

    /**
     * Step 11 — Record induction attendance.
     */
    public function recordInductionAttendance(Request $request, TraineeApplication $traineeApplication)
    {
        $validated = $request->validate([
            'attended' => 'required|boolean',
            'notes'    => 'nullable|string',
        ]);

        $onboarding = $traineeApplication->onboarding_data ?? [];
        $onboarding['checklist']['induction_attended'] = $validated['attended'];
        $onboarding['induction_notes'] = $validated['notes'];

        $traineeApplication->update([
            'status'          => $validated['attended'] ? 'Induction Attended' : 'Induction No-Show',
            'onboarding_data' => $onboarding
        ]);

        try {
            ActivityLog::create([
                'user_id'     => optional($request->user())->id,
                'action'      => 'trainee_induction_attendance',
                'model_type'  => TraineeApplication::class,
                'model_id'    => $traineeApplication->id,
                'description' => "Induction attendance recorded for " . ($traineeApplication->name ?? 'applicant'),
                'ip_address'  => $request->ip(),
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to log trainee induction attendance: " . $e->getMessage());
        }

        return response()->json(['message' => 'Induction status recorded', 'application' => $traineeApplication->fresh()]);
    }

    /**
     * Step 12 — Send Portal Invitation.
     *
     * Creates a TrainingCounsellor profile and a counsellor User account (if they
     * don't already exist), then emails the trainee their login credentials for
     * the internal Vanquish counsellor portal.
     */
    public function sendPortalInvite(Request $request, TraineeApplication $traineeApplication)
    {
        try {
            $portalUrl = rtrim(config('app.frontend_url', 'https://vqtmanagement.com'), '/') . '/counsellor-login';

            // ── 1. Find or create TrainingCounsellor record ──────────────────────
            $tc = TrainingCounsellor::where('email', $traineeApplication->email)->first();

            if (!$tc) {
                $tc = TrainingCounsellor::create([
                    'tc_id'       => 'TC' . str_pad(TrainingCounsellor::count() + 1, 3, '0', STR_PAD_LEFT),
                    'name'        => trim($traineeApplication->first_name . ' ' . $traineeApplication->last_name),
                    'email'       => $traineeApplication->email,
                    'phone'       => $traineeApplication->phone ?? null,
                    'institution' => $traineeApplication->institution ?? null,
                    'course'      => $traineeApplication->course_name ?? null,
                    'status'      => 'Active',
                    'joined_date' => now(),
                    'last_activity' => now(),
                ]);
            }

            // ── 2. Find or create User account (role = counsellor) ──────────────
            $existingUser = User::where('email', $traineeApplication->email)->first();
            $temporaryPassword = null;

            if (!$existingUser) {
                $temporaryPassword = \Illuminate\Support\Str::random(10) . '!1Aa';
                $existingUser = User::create([
                    'name'                    => trim($traineeApplication->first_name . ' ' . $traineeApplication->last_name),
                    'email'                   => strtolower(trim($traineeApplication->email)),
                    'password'                => Hash::make($temporaryPassword),
                    'role'                    => 'counsellor',
                    'training_counsellor_id'  => $tc->id,
                ]);
            } elseif ($existingUser->role !== 'counsellor') {
                // Existing user with a different role — update to counsellor and link TC
                $existingUser->update([
                    'role'                   => 'counsellor',
                    'training_counsellor_id' => $tc->id,
                ]);
            }

            // ── 3. Send portal invite email with internal URL ────────────────────
            Mail::to($traineeApplication->email)->send(new DynamicEmail('trainee_portal_invite', [
                'first_name'         => $traineeApplication->first_name,
                'portal_link'        => $portalUrl,
                'email'              => $traineeApplication->email,
                'temporary_password' => $temporaryPassword ?? '(use your existing password)',
            ]));

            // ── 4. Update application status ─────────────────────────────────────
            $onboarding = $traineeApplication->onboarding_data ?? [];
            $onboarding['portal_invite_sent_at'] = now()->toIso8601String();
            $onboarding['checklist']['portal_setup'] = true;

            $traineeApplication->update([
                'status'                => 'Onboarding',
                'onboarding_data'       => $onboarding,
                'portal_access_granted' => true,
            ]);

            ActivityLog::create([
                'user_id'     => optional($request->user())->id,
                'action'      => 'trainee_portal_invite_sent',
                'model_type'  => TraineeApplication::class,
                'model_id'    => $traineeApplication->id,
                'description' => "Portal invite sent and counsellor account created for {$traineeApplication->first_name} {$traineeApplication->last_name}",
                'ip_address'  => $request->ip(),
            ]);

            return response()->json([
                'message'            => 'Portal invitation sent and counsellor account created',
                'tc_id'              => $tc->tc_id,
                'account_created'    => $temporaryPassword !== null,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send portal invite: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to send invite: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Step 14 — Mark as Active Placement.
     */
    public function finalizePlacement(Request $request, TraineeApplication $traineeApplication)
    {
        $traineeApplication->update(['status' => 'Active Placement']);

        try {
            ActivityLog::create([
                'user_id'     => optional($request->user())->id,
                'action'      => 'trainee_active_placement',
                'model_type'  => TraineeApplication::class,
                'model_id'    => $traineeApplication->id,
                'description' => ($traineeApplication->name ?? 'Trainee') . " is now an ACTIVE PLACEMENT",
                'ip_address'  => $request->ip(),
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to log trainee active placement: " . $e->getMessage());
        }

        return response()->json(['message' => 'Trainee is now ACTIVE']);
    }

    /**
     * Handle Stage 2 Video Interview Callback.
     */
    public function handleStageTwoSubmission(Request $request)
    {
        $validated = $request->validate([
            'uuid' => 'required|exists:trainee_applications,uuid',
            'video_url' => 'nullable|string',
        ]);

        $application = TraineeApplication::where('uuid', $validated['uuid'])->firstOrFail();

        $application->update([
            'status' => 'Stage 2 Video Submitted',
            'video_url' => $validated['video_url'] ?? $application->video_url,
        ]);
        
        ActivityLog::create([
            'user_id' => null,
            'action' => 'trainee_video_interview_submitted',
            'model_type' => TraineeApplication::class,
            'model_id' => $application->id,
            'description' => "Video interview submitted for {$application->first_name} {$application->last_name}",
            'ip_address' => $request->ip(),
        ]);

        // Send Email #3
        try {
            Mail::to($application->email)->send(new DynamicEmail('trainee_video_interview_received', [
                'first_name' => $application->first_name,
            ]));
        } catch (\Exception $e) {
            Log::error("Failed to send trainee video interview received email: " . $e->getMessage());
        }

        return response()->json(['message' => 'Submission received successfully']);
    }

    /**
     * Get available interview slots (Legacy/Internal).
     * @deprecated Use Trafft booking system instead.
     */
    public function getAvailableInterviewSlots()
    {
        return response()->json([]);
    }
}

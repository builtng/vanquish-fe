<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TraineeApplication;
use App\Models\TraineeApplicationSetting;
use App\Models\ActivityLog;
use App\Mail\DynamicEmail;
use App\Jobs\SendTraineeStageTwoInvite;
use App\Jobs\SendInterviewReminder;
use Illuminate\Http\Request;
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
            'assessment_answers' => 'nullable|array',
        ]);

        $validated['source'] = 'internal_form';

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
        SendTraineeStageTwoInvite::dispatch($application)->delay(now()->addHours(48));

        return response()->json([
            'message' => 'Application submitted successfully',
            'application' => $application,
        ], 201);
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
        $traineeApplication->update(['status' => $validated['status']]);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'trainee_application_status_updated',
            'model_type' => TraineeApplication::class,
            'model_id' => $traineeApplication->id,
            'description' => "Application status updated from {$oldStatus} to {$validated['status']} for {$traineeApplication->name}",
            'changes' => ['old_status' => $oldStatus, 'new_status' => $validated['status']],
            'ip_address' => $request->ip(),
        ]);

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

        // TRIGGER EMAIL: If Rejected (from ANY stage after Stage 1)
        $postStage1Statuses = ['Stage 2 Invited', 'Stage 2 Video Submitted', 'Stage 2 Approved', 'Stage 3 Interview Booked', 'Interview Attended'];
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
     * Settings for Trainee Applications.
     */
    public function getSettings()
    {
        $priorityQuestions = TraineeApplicationSetting::getByKey('priority_questions', []);
        return response()->json(['priority_questions' => $priorityQuestions]);
    }

    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'priority_questions' => 'required|array',
        ]);
        
        TraineeApplicationSetting::setByKey('priority_questions', $validated['priority_questions']);
        
        return response()->json([
            'message' => 'Assessment settings updated successfully',
            'priority_questions' => $validated['priority_questions']
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

        ActivityLog::create([
            'user_id'     => $request->user()->id,
            'action'      => 'trainee_interview_attendance_recorded',
            'model_type'  => TraineeApplication::class,
            'model_id'    => $traineeApplication->id,
            'description' => "Interview attendance recorded ({$status}) for {$traineeApplication->first_name} {$traineeApplication->last_name}",
            'changes'     => ['status' => $status, 'attended' => $validated['attended']],
            'ip_address'  => $request->ip(),
        ]);

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

        ActivityLog::create([
            'user_id'     => $request->user()->id,
            'action'      => 'trainee_placement_decision',
            'model_type'  => TraineeApplication::class,
            'model_id'    => $traineeApplication->id,
            'description' => "Placement decision '{$validated['decision']}' recorded for {$traineeApplication->first_name} {$traineeApplication->last_name}",
            'changes'     => ['decision' => $validated['decision'], 'old_status' => $oldStatus, 'new_status' => $newStatus],
            'ip_address'  => $request->ip(),
        ]);

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
                Mail::to($traineeApplication->email)->send(new DynamicEmail('trainee_placement_acceptance', [
                    'first_name'              => $traineeApplication->first_name,
                    'induction_date'          => $validated['induction_date'] ?? 'Monday, 19th January, 10:00am',
                    'induction_zoom_link'    => config('services.trafft.default_zoom_link', 'https://zoom.us/j/vanquish-induction'),
                    'agreement_download_link' => 'https://vanquishtherapies.co.uk/templates/4-way-agreement-trainee.docx',
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

        ActivityLog::create([
            'user_id'     => $request->user()->id,
            'action'      => 'trainee_induction_attendance',
            'model_type'  => TraineeApplication::class,
            'model_id'    => $traineeApplication->id,
            'description' => "Induction attendance recorded for {$traineeApplication->first_name}",
            'ip_address'  => $request->ip(),
        ]);

        return response()->json(['message' => 'Induction status recorded', 'application' => $traineeApplication->fresh()]);
    }

    /**
     * Step 12 — Send Portal Invitation.
     */
    public function sendPortalInvite(Request $request, TraineeApplication $traineeApplication)
    {
        try {
            Mail::to($traineeApplication->email)->send(new DynamicEmail('trainee_portal_invite', [
                'first_name'  => $traineeApplication->first_name,
                'portal_link' => 'https://vanquish.suitedash.com',
            ]));

            $onboarding = $traineeApplication->onboarding_data ?? [];
            $onboarding['portal_invite_sent_at'] = now()->toIso8601String();
            
            $traineeApplication->update([
                'status' => 'Onboarding',
                'onboarding_data' => $onboarding,
                'portal_access_granted' => true
            ]);

            return response()->json(['message' => 'Portal invitation sent']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to send invite'], 500);
        }
    }

    /**
     * Step 14 — Mark as Active Placement.
     */
    public function finalizePlacement(Request $request, TraineeApplication $traineeApplication)
    {
        $traineeApplication->update(['status' => 'Active Placement']);

        ActivityLog::create([
            'user_id'     => $request->user()->id,
            'action'      => 'trainee_active_placement',
            'model_type'  => TraineeApplication::class,
            'model_id'    => $traineeApplication->id,
            'description' => "{$traineeApplication->first_name} is now an ACTIVE PLACEMENT",
            'ip_address'  => $request->ip(),
        ]);

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

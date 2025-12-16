<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Induction;
use App\Models\InductionAttendee;
use App\Models\TrainingCounsellor;
use App\Mail\InductionInvitationEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class InductionController extends Controller
{
    /**
     * Get all inductions
     */
    public function index(Request $request)
    {
        $query = Induction::with(['trainingCounsellor', 'attendees.trainingCounsellor']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('upcoming')) {
            $query->where('scheduled_at', '>=', Carbon::now());
        }

        $inductions = $query->orderBy('scheduled_at', 'asc')->get();

        return response()->json($inductions);
    }

    /**
     * Get a specific induction
     */
    public function show($id)
    {
        $induction = Induction::with(['trainingCounsellor', 'attendees.trainingCounsellor'])
            ->where('uuid', $id)
            ->orWhere('id', $id)
            ->firstOrFail();

        return response()->json($induction);
    }

    /**
     * Create a new induction
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tc_id' => 'required|exists:training_counsellors,id',
            'scheduled_at' => 'required|date|after:now',
            'location' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'attendee_tc_ids' => 'required|array|min:1',
            'attendee_tc_ids.*' => 'exists:training_counsellors,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $induction = Induction::create([
            'tc_id' => $request->tc_id,
            'scheduled_at' => $request->scheduled_at,
            'location' => $request->location,
            'notes' => $request->notes,
            'status' => 'scheduled',
        ]);

        // Create attendees
        foreach ($request->attendee_tc_ids as $tcId) {
            $attendee = InductionAttendee::create([
                'induction_id' => $induction->id,
                'tc_id' => $tcId,
                'expires_at' => Carbon::now()->addHours(72),
            ]);

            // Send invitation email
            $tc = TrainingCounsellor::find($tcId);
            if ($tc && $tc->email) {
                Mail::to($tc->email)->send(new InductionInvitationEmail($induction, $attendee));
            }
        }

        $induction->load(['trainingCounsellor', 'attendees.trainingCounsellor']);

        return response()->json($induction, 201);
    }

    /**
     * Update an induction
     */
    public function update(Request $request, $id)
    {
        $induction = Induction::where('uuid', $id)
            ->orWhere('id', $id)
            ->firstOrFail();

        $validator = Validator::make($request->all(), [
            'scheduled_at' => 'sometimes|date|after:now',
            'location' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'status' => 'sometimes|in:scheduled,completed,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $induction->update($request->only(['scheduled_at', 'location', 'notes', 'status']));

        $induction->load(['trainingCounsellor', 'attendees.trainingCounsellor']);

        return response()->json($induction);
    }

    /**
     * Accept induction invitation
     */
    public function acceptInvitation(Request $request, $token)
    {
        try {
            $attendee = InductionAttendee::where('acceptance_token', $token)->firstOrFail();
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Invalid or expired invitation token.',
            ], 404);
        }

        if (!$attendee->canAccept()) {
            return response()->json([
                'message' => 'This invitation has expired or has already been processed.',
                'expired' => $attendee->isExpired(),
                'status' => $attendee->status,
            ], 400);
        }

        $attendee->update([
            'status' => 'accepted',
            'accepted_at' => Carbon::now(),
        ]);

        $attendee->load(['induction.trainingCounsellor', 'trainingCounsellor']);

        return response()->json([
            'message' => 'Induction invitation accepted successfully.',
            'induction' => $attendee->induction,
            'attendee' => $attendee,
        ]);
    }

    /**
     * Decline induction invitation
     */
    public function declineInvitation(Request $request, $token)
    {
        $attendee = InductionAttendee::where('acceptance_token', $token)->firstOrFail();

        if ($attendee->status !== 'pending') {
            return response()->json([
                'message' => 'This invitation has already been processed.',
            ], 400);
        }

        $attendee->update([
            'status' => 'declined',
        ]);

        return response()->json([
            'message' => 'Induction invitation declined.',
        ]);
    }

    /**
     * Add attendees to an induction
     */
    public function addAttendees(Request $request, $id)
    {
        $induction = Induction::where('uuid', $id)
            ->orWhere('id', $id)
            ->firstOrFail();

        $validator = Validator::make($request->all(), [
            'attendee_tc_ids' => 'required|array|min:1',
            'attendee_tc_ids.*' => 'exists:training_counsellors,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        foreach ($request->attendee_tc_ids as $tcId) {
            // Check if attendee already exists
            $existing = InductionAttendee::where('induction_id', $induction->id)
                ->where('tc_id', $tcId)
                ->first();

            if (!$existing) {
                $attendee = InductionAttendee::create([
                    'induction_id' => $induction->id,
                    'tc_id' => $tcId,
                    'expires_at' => Carbon::now()->addHours(72),
                ]);

                // Send invitation email
                $tc = TrainingCounsellor::find($tcId);
                if ($tc && $tc->email) {
                    Mail::to($tc->email)->send(new InductionInvitationEmail($induction, $attendee));
                }
            }
        }

        $induction->load(['trainingCounsellor', 'attendees.trainingCounsellor']);

        return response()->json($induction);
    }
}


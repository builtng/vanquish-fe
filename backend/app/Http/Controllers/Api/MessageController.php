<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\TrainingCounsellor;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\DynamicEmail;

class MessageController extends Controller
{
    /**
     * Get messages for the authenticated user
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Message::with(['fromUser', 'toTrainingCounsellor', 'relatedClient', 'relatedConsultation']);

        if ($user->isCounsellor() && $user->training_counsellor_id) {
            // Counsellors see messages sent to their TC profile
            $query->where('to_tc_id', $user->training_counsellor_id)
                ->orWhere('from_user_id', $user->id);
        } else {
            // Staff/admin see messages sent to them or from them
            $query->where(function ($q) use ($user) {
                $q->where('to_user_id', $user->id)
                    ->orWhere('from_user_id', $user->id);
            });
        }

        if ($request->has('unread_only') && $request->unread_only) {
            $query->where('is_read', false);
        }

        $messages = $query->orderBy('id', 'desc')->paginate(20);

        return response()->json($messages);
    }

    /**
     * Send a message to a counsellor
     */
    public function sendToCounsellor(Request $request)
    {
        $user = $request->user();

        // Only staff/admin can send messages to counsellors
        if (!$user->isStaff()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'tc_id' => 'required|exists:training_counsellors,id',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
            'related_client_id' => 'nullable|exists:clients,id',
            'related_consultation_id' => 'nullable|exists:consultations,id',
            'send_email_notification' => 'boolean',
        ]);

        $tc = TrainingCounsellor::findOrFail($validated['tc_id']);

        $message = Message::create([
            'from_user_id' => $user->id,
            'to_tc_id' => $tc->id,
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'type' => 'staff_to_counsellor',
            'related_client_id' => $validated['related_client_id'] ?? null,
            'related_consultation_id' => $validated['related_consultation_id'] ?? null,
        ]);

        // Send email notification if requested and TC has email
        if (($validated['send_email_notification'] ?? true) && $tc->email) {
            try {
                $emailMessage = $validated['message'];
                if (isset($validated['related_client_id']) && $validated['related_client_id']) {
                    $client = \App\Models\Client::find($validated['related_client_id']);
                    if ($client) {
                        $emailMessage .= "\n\nRelated to client: {$client->name}";
                    }
                }

                Mail::to($tc->email)->send(new DynamicEmail(
                    'generic_tc_email',
                    [
                        'tc_name' => $tc->name,
                        'message' => $emailMessage,
                        'subject' => "New Message: {$validated['subject']}"
                    ]
                ));
            } catch (\Exception $e) {
                // Log error but don't fail the request
                Log::error('Failed to send message email notification: ' . $e->getMessage());
            }
        }

        // Log activity
        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'message_sent',
            'model_type' => Message::class,
            'model_id' => $message->id,
            'description' => "Message sent to {$tc->name}: {$validated['subject']}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Message sent successfully',
            'data' => $message->load(['fromUser', 'toTrainingCounsellor', 'relatedClient']),
        ], 201);
    }

    /**
     * Send a message from counsellor to staff
     */
    public function sendToStaff(Request $request)
    {
        $user = $request->user();

        // Only counsellors can send messages to staff
        if (!$user->isCounsellor()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'to_email' => 'required|email',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
            'related_client_id' => 'nullable|exists:clients,id',
            'related_consultation_id' => 'nullable|exists:consultations,id',
        ]);

        // Find the specific user by email
        $targetUser = \App\Models\User::where('email', $validated['to_email'])->first();

        // Ensure the target user is staff/admin
        if (!$targetUser || !$targetUser->isStaff()) {
            // If user not found, we still send an email if possible, but we can't link it in the DB messaging system easily
            // For now, let's assume valid staff email is required for in-portal messaging
            // but we will send the email anyway to satisfy the "sent to different email admin" requirement
            try {
                Mail::to($validated['to_email'])->send(new DynamicEmail(
                    'generic_tc_email',
                    [
                        'tc_name' => 'Admin Team',
                        'message' => "Message from Counsellor {$user->name}:\n\n" . $validated['message'],
                        'subject' => "Counsellor Message: {$validated['subject']}"
                    ]
                ));
            } catch (\Exception $e) {
                Log::error('Failed to send counsellor-to-admin email: ' . $e->getMessage());
            }

            return response()->json([
                'message' => 'Message sent via email',
            ], 200);
        }

        $message = Message::create([
            'from_user_id' => $user->id,
            'to_user_id' => $targetUser->id,
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'type' => 'counsellor_to_staff',
            'related_client_id' => $validated['related_client_id'] ?? null,
            'related_consultation_id' => $validated['related_consultation_id'] ?? null,
        ]);

        // Also send email to the specific admin
        try {
            Mail::to($targetUser->email)->send(new DynamicEmail(
                'generic_tc_email',
                [
                    'tc_name' => $targetUser->name,
                    'message' => "New message from {$user->name}:\n\n" . $validated['message'],
                    'subject' => "New Message from Counsellor: {$validated['subject']}"
                ]
            ));
        } catch (\Exception $e) {
            Log::error('Failed to send admin notification email: ' . $e->getMessage());
        }

        // Log activity
        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'message_sent',
            'model_type' => Message::class,
            'model_id' => $message->id,
            'description' => "Message sent from counsellor to {$targetUser->name}: {$validated['subject']}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Message sent successfully to ' . $targetUser->name,
            'data' => $message,
        ], 201);
    }

    /**
     * Mark message as read
     */
    public function markAsRead(Request $request, $id)
    {
        $user = $request->user();
        $message = Message::findOrFail($id);

        // Check if user has access to this message
        $hasAccess = false;
        if ($user->isCounsellor() && $user->training_counsellor_id) {
            $hasAccess = $message->to_tc_id === $user->training_counsellor_id || $message->from_user_id === $user->id;
        } else {
            $hasAccess = $message->to_user_id === $user->id || $message->from_user_id === $user->id;
        }

        if (!$hasAccess) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $message->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        return response()->json(['message' => 'Message marked as read']);
    }

    /**
     * Get unread message count
     */
    public function unreadCount(Request $request)
    {
        $user = $request->user();
        $query = Message::where('is_read', false);

        if ($user->isCounsellor() && $user->training_counsellor_id) {
            $query->where('to_tc_id', $user->training_counsellor_id);
        } else {
            $query->where('to_user_id', $user->id);
        }

        $count = $query->count();

        return response()->json(['count' => $count]);
    }

    /**
     * Get a single message
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $message = Message::with(['fromUser', 'toUser', 'toTrainingCounsellor', 'relatedClient', 'relatedConsultation'])
            ->findOrFail($id);

        // Check access
        $hasAccess = false;
        if ($user->isCounsellor() && $user->training_counsellor_id) {
            $hasAccess = $message->to_tc_id === $user->training_counsellor_id || $message->from_user_id === $user->id;
        } else {
            $hasAccess = $message->to_user_id === $user->id || $message->from_user_id === $user->id;
        }

        if (!$hasAccess) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($message);
    }
}

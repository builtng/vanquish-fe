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
        $query = Message::with(['fromUser', 'toTrainingCounsellor', 'toUser', 'relatedClient', 'relatedConsultation']);

        $folder = $request->get('folder', 'inbox');
        $peerId = $request->get('peer_id');
        $peerType = $request->get('peer_type', 'user'); // user or tc

        if ($peerId) {
            // Get history between user and peer
            $query->where(function($q) use ($user, $peerId, $peerType) {
                // If current user is originator
                $q->where(function($inner) use ($user, $peerId, $peerType) {
                    $inner->where('from_user_id', $user->id);
                    if ($peerType === 'tc') {
                        $inner->where('to_tc_id', $peerId);
                    } else {
                        $inner->where('to_user_id', $peerId);
                    }
                })
                // OR if peer is originator
                ->orWhere(function($inner) use ($user, $peerId, $peerType) {
                    if ($user->isCounsellor() && $user->training_counsellor_id) {
                        $inner->where('to_tc_id', $user->training_counsellor_id);
                    } else {
                        $inner->where('to_user_id', $user->id);
                    }
                    $inner->where('from_user_id', $peerId);
                });
            })->where('is_trashed', false);
        } elseif ($user->isCounsellor() && $user->training_counsellor_id) {
            if ($folder === 'trash') {
                $query->where(function ($q) use ($user) {
                    $q->where('to_tc_id', $user->training_counsellor_id)
                      ->orWhere('from_user_id', $user->id);
                })->where('is_trashed', true);
            } elseif ($folder === 'sent') {
                $query->where('from_user_id', $user->id)->where('is_trashed', false);
            } else {
                // Default: inbox
                $query->where('to_tc_id', $user->training_counsellor_id)->where('is_trashed', false);
            }
        } else {
            // Staff/admin
            if ($folder === 'trash') {
                $query->where(function ($q) use ($user) {
                    $q->where('to_user_id', $user->id)
                      ->orWhere('from_user_id', $user->id);
                })->where('is_trashed', true);
            } elseif ($folder === 'sent') {
                $query->where('from_user_id', $user->id)->where('is_trashed', false);
            } else {
                $query->where('to_user_id', $user->id)->where('is_trashed', false);
            }
        }

        if ($request->has('unread_only') && $request->unread_only) {
            $query->where('is_read', false);
        }

        $messages = $query->orderBy('id', 'desc')->paginate(50);

        return response()->json($messages);
    }

    /**
     * Get unique conversations for the chat sidebar
     */
    public function conversations(Request $request)
    {
        $user = $request->user();
        
        // Find all messages involving the user
        $query = Message::with(['fromUser', 'toUser', 'toTrainingCounsellor'])
            ->where(function($q) use ($user) {
                if ($user->isCounsellor() && $user->training_counsellor_id) {
                    $q->where('to_tc_id', $user->training_counsellor_id)
                      ->orWhere('from_user_id', $user->id);
                } else {
                    $q->where('to_user_id', $user->id)
                      ->orWhere('from_user_id', $user->id);
                }
            })
            ->where('is_trashed', false)
            ->orderBy('created_at', 'desc');

        $allMessages = $query->get();
        
        $conversations = [];
        $seen = [];

        foreach ($allMessages as $msg) {
            // Determine peer identifier
            $peerId = null;
            $peerType = null;
            $peerName = null;

            if ($user->isCounsellor()) {
                // peer is either from_user (staff) or to_user (staff)
                if ($msg->from_user_id !== $user->id) {
                    $peerId = $msg->from_user_id;
                    $peerType = 'user';
                    $peerName = $msg->fromUser?->name;
                } else {
                    $peerId = $msg->to_user_id;
                    $peerType = 'user';
                    $peerName = $msg->toUser?->name;
                }
            } else {
                // User is staff. Peer can be another staff (user) or a TC (tc)
                if ($msg->from_user_id !== $user->id) {
                    $peerId = $msg->from_user_id;
                    $peerType = 'user';
                    $peerName = $msg->fromUser?->name;
                } else {
                    if ($msg->to_tc_id) {
                        $peerId = $msg->to_tc_id;
                        $peerType = 'tc';
                        $peerName = $msg->toTrainingCounsellor?->name;
                    } else {
                        $peerId = $msg->to_user_id;
                        $peerType = 'user';
                        $peerName = $msg->toUser?->name;
                    }
                }
            }

            if (!$peerId) continue;

            $key = $peerType . '_' . $peerId;
            if (!isset($seen[$key])) {
                $seen[$key] = true;
                $conversations[] = [
                    'peer_id' => $peerId,
                    'peer_type' => $peerType,
                    'peer_name' => $peerName,
                    'last_message' => $msg,
                ];
            }
        }

        return response()->json($conversations);
    }

    /**
     * Send a message to counsellors
     */
    public function sendToCounsellor(Request $request)
    {
        $user = $request->user();

        // Only staff/admin can send messages to counsellors
        if (!$user->isStaff()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'tc_ids' => 'required|array',
            'tc_ids.*' => 'exists:training_counsellors,id',
            'cc_user_ids' => 'nullable|array',
            'cc_user_ids.*' => 'exists:users,id',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:10000',
            'related_client_id' => 'nullable|exists:clients,id',
            'related_consultation_id' => 'nullable|exists:consultations,id',
            'send_email_notification' => 'boolean',
        ]);

        $ccUsers = $validated['cc_user_ids'] ?? [];
        $recipientTcIds = $validated['tc_ids'];
        
        $messages = [];
        
        // Combine all unique targeted user IDs for records
        // For TCs, we need their user records if they have one
        foreach ($recipientTcIds as $tcId) {
            $tc = TrainingCounsellor::with('user')->findOrFail($tcId);
            
            $msg = Message::create([
                'from_user_id' => $user->id,
                'to_tc_id' => $tc->id,
                'to_user_id' => $tc->user_id, // Link to user if exists
                'subject' => $validated['subject'],
                'message' => $validated['message'],
                'type' => 'staff_to_counsellor',
                'cc_users' => $ccUsers,
                'related_client_id' => $validated['related_client_id'] ?? null,
                'related_consultation_id' => $validated['related_consultation_id'] ?? null,
            ]);
            
            $messages[] = $msg;

            // Email
            if (($validated['send_email_notification'] ?? true) && $tc->email) {
                try {
                    Mail::to($tc->email)->send(new DynamicEmail(
                        'generic_tc_email',
                        [
                            'tc_name' => $tc->name,
                            'message' => $validated['message'],
                            'subject' => "New Message: {$validated['subject']}"
                        ]
                    ));
                } catch (\Exception $e) {
                    Log::error('Failed to send message email notification to TC: ' . $e->getMessage());
                }
            }
        }

        // Also create records for CC users so it shows in their inbox
        foreach ($ccUsers as $ccUserId) {
            $ccUser = \App\Models\User::find($ccUserId);
            if ($ccUser && !in_array($ccUserId, array_column($messages, 'to_user_id'))) {
                Message::create([
                    'from_user_id' => $user->id,
                    'to_user_id' => $ccUser->id,
                    'subject' => $validated['subject'],
                    'message' => $validated['message'],
                    'type' => 'staff_to_staff',
                    'cc_users' => $ccUsers,
                    'related_client_id' => $validated['related_client_id'] ?? null,
                    'related_consultation_id' => $validated['related_consultation_id'] ?? null,
                ]);
            }
        }

        return response()->json([
            'message' => 'Messages sent successfully',
            'count' => count($messages),
        ], 201);
    }

    /**
     * Get list of staff users (for counsellors to select as recipients)
     */
    public function getStaffList(Request $request)
    {
        $user = $request->user();

        // Staff and counsellors can use this endpoint
        if (!$user->isCounsellor() && !$user->isStaff()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $staffRoles = ['super_admin', 'admin', 'staff', 'consultation_staff', 'compliance_officer'];

        $staffUsers = \App\Models\User::select('id', 'name', 'email', 'role')
            ->whereIn('role', $staffRoles)
            ->orderBy('name')
            ->get();

        return response()->json($staffUsers);
    }

    /**
     * Send a message from counsellor to staff
     */
    public function sendToStaff(Request $request)
    {
        $user = $request->user();

        // Counsellors and staff can send messages to staff
        if (!$user->isCounsellor() && !$user->isStaff()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'to_user_ids' => 'required|array',
            'to_user_ids.*' => 'exists:users,id',
            'cc_user_ids' => 'nullable|array',
            'cc_user_ids.*' => 'exists:users,id',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:10000',
            'related_client_id' => 'nullable|exists:clients,id',
            'related_consultation_id' => 'nullable|exists:consultations,id',
        ]);

        $ccUsers = $validated['cc_user_ids'] ?? [];
        $allRecipients = array_merge($validated['to_user_ids'], $ccUsers);
        
        $sentCount = 0;

        foreach ($allRecipients as $targetUserId) {
            $targetUser = \App\Models\User::findOrFail($targetUserId);

            // Counsellors and staff can only message Staff
            if (!$targetUser->isStaff()) {
                continue; // Skip non-staff recipients
            }

            $message = Message::create([
                'from_user_id' => $user->id,
                'to_user_id' => $targetUser->id,
                'subject' => $validated['subject'],
                'message' => $validated['message'],
                'type' => $user->isCounsellor() ? 'counsellor_to_staff' : 'staff_to_staff',
                'cc_users' => $ccUsers,
                'related_client_id' => $validated['related_client_id'] ?? null,
                'related_consultation_id' => $validated['related_consultation_id'] ?? null,
            ]);
            
            $sentCount++;

            // Email Notification
            try {
                Mail::to($targetUser->email)->send(new DynamicEmail(
                    'generic_tc_email',
                    [
                        'tc_name' => $targetUser->name,
                        'message' => "New message from {$user->name} (" . ($user->isCounsellor() ? "Counsellor" : "Staff") . "):\n\n" . $validated['message'],
                        'subject' => "New Internal Message: {$validated['subject']}"
                    ]
                ));
            } catch (\Exception $e) {
                Log::error('Failed to send staff notification email: ' . $e->getMessage());
            }
        }

        if ($sentCount === 0) {
            return response()->json(['message' => 'No valid staff recipients found.'], 422);
        }

        return response()->json([
            'message' => 'Message sent successfully to ' . $sentCount . ' recipients',
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
        $query = Message::where('is_read', false)->where('is_trashed', false);

        if ($user->isCounsellor() && $user->training_counsellor_id) {
            $query->where('to_tc_id', $user->training_counsellor_id);
        } else {
            $query->where('to_user_id', $user->id);
        }

        $count = $query->count();

        return response()->json(['count' => $count]);
    }

    /**
     * Trash a message
     */
    public function trash(Request $request, $id)
    {
        $user = $request->user();
        $message = Message::findOrFail($id);

        $message->update([
            'is_trashed' => true,
            'trashed_at' => now(),
        ]);

        return response()->json(['message' => 'Message moved to trash']);
    }

    /**
     * Restore a message from trash
     */
    public function restore(Request $request, $id)
    {
        $user = $request->user();
        $message = Message::findOrFail($id);

        $message->update([
            'is_trashed' => false,
            'trashed_at' => null,
        ]);

        return response()->json(['message' => 'Message restored from trash']);
    }

    /**
     * Permanently delete a message
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $message = Message::findOrFail($id);

        $message->delete();

        return response()->json(['message' => 'Message permanently deleted']);
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

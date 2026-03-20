<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SessionNote;
use Illuminate\Http\Request;

class SessionNoteController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = SessionNote::query()->with(['client:id,name', 'counsellor:id,name']);

        if ($user->role === 'counsellor') {
            $query->where('training_counsellor_id', '=', $user->training_counsellor_id);
        }

        if ($request->has('client_id')) {
            $query->where('client_id', $request->client_id);
        }

        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'counsellor' || !$user->training_counsellor_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'client_id' => 'nullable|exists:clients,id',
            'type' => 'required|string|in:weekly,block_summary,risk_update',
            'content' => 'required|array',
        ]);

        $note = SessionNote::create([
            'training_counsellor_id' => $user->training_counsellor_id,
            'client_id' => $request->client_id,
            'type' => $request->type,
            'content' => $request->content,
            'status' => 'submitted',
        ]);

        return response()->json($note, 201);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $note = SessionNote::with(['client:id,name', 'counsellor:id,name'])->findOrFail($id);

        if ($user->role === 'counsellor' && $note->training_counsellor_id !== $user->training_counsellor_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($note);
    }
}

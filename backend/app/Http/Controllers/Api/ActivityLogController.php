<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Client;
use App\Models\TrainingCounsellor;
use App\Models\ClientTcMatch;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $query = ActivityLog::with(['user'])->orderBy('created_at', 'desc');

        if ($request->has('action')) {
            $query->where('action', $request->action);
        }

        if ($request->has('model_type')) {
            $query->where('model_type', $request->model_type);
        }

        $perPage = $request->get('per_page', 50);
        $logs = $query->paginate($perPage);

        // Transform logs to include related model UUIDs
        $logs->getCollection()->transform(function ($log) {
            $data = $log->toArray();
            
            // Add related model UUID if available
            if ($log->model_type && $log->model_id) {
                if ($log->model_type === Client::class) {
                    $client = Client::find($log->model_id);
                    if ($client) {
                        $data['client_uuid'] = $client->uuid;
                        $data['client_id'] = $client->client_id;
                        $data['client_name'] = $client->name;
                    }
                } elseif ($log->model_type === TrainingCounsellor::class) {
                    $tc = TrainingCounsellor::find($log->model_id);
                    if ($tc) {
                        $data['tc_uuid'] = $tc->uuid;
                        $data['tc_id'] = $tc->tc_id;
                        $data['tc_name'] = $tc->name;
                    }
                } elseif ($log->model_type === ClientTcMatch::class) {
                    $match = ClientTcMatch::with(['client', 'tc'])->find($log->model_id);
                    if ($match) {
                        if ($match->client) {
                            $data['client_uuid'] = $match->client->uuid;
                            $data['client_id'] = $match->client->client_id;
                            $data['client_name'] = $match->client->name;
                        }
                        if ($match->tc) {
                            $data['tc_uuid'] = $match->tc->uuid;
                            $data['tc_id'] = $match->tc->tc_id;
                            $data['tc_name'] = $match->tc->name;
                        }
                    }
                }
            }
            
            return $data;
        });

        return response()->json($logs);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'action' => 'required|string|max:255',
            'model_type' => 'required|string',
            'model_id' => 'required|integer',
            'description' => 'required|string',
            'changes' => 'nullable|array',
        ]);

        $log = ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => $validated['action'],
            'model_type' => $validated['model_type'],
            'model_id' => $validated['model_id'],
            'description' => $validated['description'],
            'changes' => $validated['changes'] ?? null,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json($log, 201);
    }

    public function update(Request $request, $id)
    {
        $log = ActivityLog::findOrFail($id);

        // Only allow updating description for admin notes
        $validated = $request->validate([
            'description' => 'required|string',
        ]);

        $log->update([
            'description' => $validated['description'],
        ]);

        return response()->json($log);
    }

    public function destroy($id)
    {
        $log = ActivityLog::findOrFail($id);
        $log->delete();

        return response()->json(['message' => 'Activity log deleted successfully']);
    }
}

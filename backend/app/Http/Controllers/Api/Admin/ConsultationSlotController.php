<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ConsultationSlot;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ConsultationSlotController extends Controller
{
    public function index()
    {
        $slots = ConsultationSlot::orderBy('consultation_datetime', 'asc')->get();

        // Because of the Consultation model Observer, 'booked_slots' and 'status' are automatically 
        // synced in the database whenever a consultation is created, updated, or deleted. 
        // Returning the slots directly is now accurate.

        return response()->json($slots);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'consultation_datetime' => 'required|date|after:' . now()->subMinutes(5)->toDateTimeString(),
            'max_slots' => 'nullable|integer|min:1',
        ]);

        $slot = ConsultationSlot::create([
            'consultation_datetime' => $validated['consultation_datetime'],
            'max_slots' => $validated['max_slots'] ?? null,
            'status' => 'available',
            'booked_slots' => 0,
        ]);

        return response()->json(['message' => 'Consultation slot created successfully', 'slot' => $slot], 201);
    }

    public function update(Request $request, $id)
    {
        $slot = ConsultationSlot::findOrFail($id);

        $validated = $request->validate([
            'consultation_datetime' => 'sometimes|date|after:' . now()->subMinutes(5)->toDateTimeString(),
            'max_slots' => 'nullable|integer|min:1',
            'status' => 'sometimes|in:available,full,closed',
        ]);

        // If reducing max_slots, ensure it's not lower than already booked
        if (isset($validated['max_slots']) && $validated['max_slots'] < $slot->booked_slots) {
            return response()->json(['message' => 'Cannot set max slots lower than currently booked amount'], 400);
        }

        $slot->update($validated);

        // Auto update status to full if max is reached
        if ($slot->max_slots && $slot->booked_slots >= $slot->max_slots) {
            $slot->update(['status' => 'full']);
        } elseif ($slot->status === 'full' && (!$slot->max_slots || $slot->booked_slots < $slot->max_slots)) {
            $slot->update(['status' => 'available']);
        }

        return response()->json(['message' => 'Consultation slot updated successfully', 'slot' => $slot]);
    }

    public function destroy($id)
    {
        $slot = ConsultationSlot::findOrFail($id);

        if ($slot->booked_slots > 0) {
            return response()->json(['message' => 'Cannot delete a slot that has bookings'], 400);
        }

        $slot->delete();

        return response()->json(['message' => 'Consultation slot deleted successfully']);
    }
}

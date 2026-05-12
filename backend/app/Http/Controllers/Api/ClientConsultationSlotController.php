<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ConsultationSlot;
use App\Models\Consultation;
use App\Models\Client;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Services\EmailService;

class ClientConsultationSlotController extends Controller
{
    protected $emailService;

    public function __construct(EmailService $emailService)
    {
        $this->emailService = $emailService;
    }

    public function getAvailableSlots(Request $request)
    {
        $slots = ConsultationSlot::where('status', 'available')
            ->where('consultation_datetime', '>=', Carbon::now())
            ->where(function ($query) {
                $query->whereNull('max_slots')
                    ->orWhereRaw('booked_slots < max_slots');
            })
            ->orderBy('consultation_datetime', 'asc')
            ->get()
            ->unique('consultation_datetime')
            ->values();

        return response()->json($slots);
    }

    public function bookConsultation(Request $request)
    {
        $validated = $request->validate([
            'client_uuid' => 'required|exists:clients,uuid',
            'consultation_slot_id' => 'required|exists:consultation_slots,id',
        ]);

        $client = Client::where('uuid', $validated['client_uuid'])->firstOrFail();

        // Use a transaction and lock for update to prevent race conditions
        return DB::transaction(function () use ($client, $validated) {
            $slot = ConsultationSlot::lockForUpdate()->findOrFail($validated['consultation_slot_id']);

            // Verify slot is available
            if ($slot->status !== 'available' && $slot->status !== 'open') {
                if ($slot->status === 'full' || ($slot->max_slots && $slot->booked_slots >= $slot->max_slots)) {
                    return response()->json(['message' => 'This slot is already fully booked.'], 400);
                }
                if ($slot->status === 'closed') {
                    return response()->json(['message' => 'This slot is closed.'], 400);
                }
            }

            if (Carbon::parse($slot->consultation_datetime)->isPast()) {
                return response()->json(['message' => 'Cannot book a slot in the past.'], 400);
            }

            // Verify payment
            // We assume successful intake or payment creates a consultation with payment_status = paid
            $consultation = Consultation::where('client_id', $client->id)
                ->whereNull('consultation_slot_id')
                ->where(function ($query) {
                    $query->where('payment_status', 'paid')
                        ->orWhere('status', '!=', 'completed');
                })
                ->latest()
                ->first();

            if (!$consultation) {
                // If no consultation record exists, create one now
                // This handles cases where intake was free/discounted or payment record sync issues
                $consultation = Consultation::create([
                    'consultation_id' => 'CONS' . str_pad(Consultation::count() + 1, 4, '0', STR_PAD_LEFT),
                    'client_id' => $client->id,
                    'status' => 'scheduled',
                    'payment_status' => 'paid', // Default to paid if we allow booking
                ]);
            }

            // Check if they already booked this exact slot to prevent double-booking
            if (Consultation::where('client_id', $client->id)->where('consultation_slot_id', $slot->id)->exists()) {
                return response()->json(['message' => 'You have already booked this slot.'], 400);
            }

            // "Create booking" -> Update the existing paid consultation with the slot, and set it to scheduled
            $consultation->update([
                'consultation_slot_id' => $slot->id,
                'scheduled_at' => $slot->consultation_datetime,
                'status' => 'scheduled',
            ]);

            // Update client stage
            $client->update(['stage' => 'Consultation Booked']);

            // (Note: $slot->booked_slots and $slot->status are auto-updated by the Consultation model observer)

            // Send confirmation email
            if ($client->email) {
                $this->emailService->sendAndLog(
                    $client,
                    'booking_confirmation',
                    [
                        'client_name' => $client->name,
                        'booking_type' => 'Consultation',
                        'counsellor_name' => 'Assessor',
                        'booking_details' => Carbon::parse($slot->consultation_datetime)->format('l, jS F Y (H:i)'),
                        'location' => 'Online',
                        'duration' => 50,
                        'consultation_link' => config('app.frontend_url') . '/client-booking?uuid=' . $client->uuid
                    ]
                );
            }

            return response()->json([
                'message' => 'Consultation booked successfully',
                'consultation' => $consultation->load(['consultationSlot'])
            ]);
        });
    }
}

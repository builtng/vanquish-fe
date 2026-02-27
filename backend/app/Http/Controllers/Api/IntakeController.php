<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClientIntakeForm;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Stripe;
use Stripe\PaymentIntent;

class IntakeController extends Controller
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret_key'));
    }

    /**
     * Handle payment success for intake forms
     */
    public function handlePaymentSuccess(Request $request)
    {
        try {
            $validated = $request->validate([
                'payment_intent_id' => 'required|string',
                'intake_id' => 'required|exists:client_intake_forms,id',
                'coupon_code' => 'nullable|string',
            ]);

            // 1. Verify Stripe Payment Intent
            $paymentIntent = PaymentIntent::retrieve($validated['payment_intent_id']);

            if (!$paymentIntent || $paymentIntent->status !== 'succeeded') {
                return response()->json([
                    'message' => 'Payment verification failed.',
                    'status' => 'error'
                ], 400);
            }

            // 2. Confirm coupon validity (if applied)
            if (!empty($validated['coupon_code'])) {
                $coupon = Coupon::where('code', $validated['coupon_code'])->first();
                if (!$coupon || !$coupon->isValid()) {
                    Log::warning("Invalid coupon used during payment success: " . $validated['coupon_code']);
                    // We don't necessarily fail the whole process if payment succeeded, 
                    // but we log it. In a stricter flow:
                    // return response()->json(['message' => 'Invalid coupon.'], 400);
                }
            }

            // 3. Update intake/payment status
            $intake = ClientIntakeForm::findOrFail($validated['intake_id']);
            $intake->update([
                'payment_status' => 'paid',
                'payment_reference' => $paymentIntent->id,
                'payment_amount' => $paymentIntent->amount / 100,
                'payment_method' => $paymentIntent->payment_method_types[0] ?? 'card',
                'paid_at' => now(),
                'status' => 'submitted' // Or 'completed' as per user example
            ]);

            // 4. Send emails
            $client = $intake->client;
            if ($client && $client->email) {
                $emailService = app(\App\Services\EmailService::class);

                $emailService->sendAndLog($client, 'payment_confirmation', [
                    'client_name' => $client->name,
                    'email' => $client->email
                ]);

                sleep(2);

                $emailService->sendAndLog($client, 'intake_submission', [
                    'client_name' => $client->name,
                    'email' => $client->email
                ]);

                sleep(2);

                $bookingLink = config('app.frontend_url') . "/client-booking?uuid=" . $client->uuid;
                $emailService->sendAndLog($client, 'consultation_booking_link', [
                    'client_name' => $client->name,
                    'booking_link' => $bookingLink,
                    'tc_name' => 'To Be Assigned',
                    'session_date' => 'Pending'
                ]);
            }

            Log::info("Intake payment confirmed for ID: {$intake->id}");

            return response()->json([
                'message' => 'Your intake submission was successful.',
                'status' => 'success',
                'intake' => $intake
            ]);
        } catch (\Exception $e) {
            Log::error('Payment Success Error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Something went wrong. Please contact support.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Success page view (if accessed via web)
     */
    public function success()
    {
        // This would usually return a view, but in this SPA setup, 
        // it might just redirect to the frontend success page or return a message.
        return response()->json(['message' => 'Success confirmation page endpoint']);
    }
}

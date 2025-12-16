<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use App\Models\Client;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Exception\ApiErrorException;

class PaymentController extends Controller
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret_key'));
    }

    /**
     * Create a payment intent for a consultation
     */
    public function createPaymentIntent(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'amount' => 'required|numeric|min:0.50',
            'currency' => 'nullable|string|size:3',
            'coupon_code' => 'nullable|string|exists:coupons,code',
        ]);

        $currency = $validated['currency'] ?? 'gbp';
        $originalAmount = $validated['amount'];
        $finalAmount = $originalAmount;
        $discountAmount = 0;
        $couponId = null;

        // Apply coupon if exists
        if (!empty($validated['coupon_code'])) {
            $coupon = \App\Models\Coupon::where('code', $validated['coupon_code'])->first();
            if ($coupon && $coupon->isValid()) {
                $couponId = $coupon->id;
                if ($coupon->type === 'fixed') {
                    $finalAmount = max(0.50, $originalAmount - $coupon->value); // Stripe minimum is mostly 0.50
                    $discountAmount = $originalAmount - $finalAmount;
                } elseif ($coupon->type === 'percent') {
                     $discount = ($originalAmount * $coupon->value) / 100;
                     $finalAmount = max(0.50, $originalAmount - $discount);
                     $discountAmount = $originalAmount - $finalAmount;
                }
                
                // Track usage (increment on confirm, but for intent we just validate)
            }
        }

        $amountInPence = (int)($finalAmount * 100);

        try {
            $client = Client::findOrFail($validated['client_id']);

            // Create or retrieve Stripe customer
            $customerId = $this->getOrCreateStripeCustomer($client, $request->email ?? $client->email);

            // Create payment intent
            $paymentIntent = PaymentIntent::create([
                'amount' => $amountInPence,
                'currency' => $currency,
                'customer' => $customerId,
                'metadata' => [
                    'client_id' => $client->id,
                    'client_name' => $client->firstName . ' ' . $client->lastName,
                    'coupon_code' => $validated['coupon_code'] ?? null,
                    'original_amount' => $originalAmount,
                    'discount_amount' => $discountAmount
                ],
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
            ]);

            return response()->json([
                'client_secret' => $paymentIntent->client_secret,
                'payment_intent_id' => $paymentIntent->id,
                'amount' => $finalAmount,
                'discount' => $discountAmount
            ]);
        } catch (ApiErrorException $e) {
            Log::error('Stripe Payment Intent Error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to create payment intent',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Confirm payment and update consultation
     */
    public function confirmPayment(Request $request)
    {
        $validated = $request->validate([
            'payment_intent_id' => 'required|string',
            'consultation_id' => 'nullable|exists:consultations,id',
            'client_id' => 'required|exists:clients,id',
        ]);

        try {
            $paymentIntent = PaymentIntent::retrieve($validated['payment_intent_id']);

            if ($paymentIntent->status !== 'succeeded') {
                return response()->json([
                    'message' => 'Payment not completed',
                    'status' => $paymentIntent->status,
                ], 400);
            }

            // Update or create consultation with payment info
            $consultation = Consultation::where('client_id', $validated['client_id'])
                ->whereNull('paid_at')
                ->latest()
                ->first();

            if ($consultation) {
                $consultation->update([
                    'payment_status' => 'paid',
                    'payment_amount' => $paymentIntent->amount / 100,
                    'stripe_payment_intent_id' => $paymentIntent->id,
                    'stripe_customer_id' => $paymentIntent->customer,
                    'paid_at' => now(),
                    'payment_method' => $paymentIntent->payment_method_types[0] ?? 'card',
                ]);
            } else {
                // Create consultation if it doesn't exist
                $consultation = Consultation::create([
                    'consultation_id' => 'CONS' . str_pad(Consultation::count() + 1, 3, '0', STR_PAD_LEFT),
                    'client_id' => $validated['client_id'],
                    'payment_status' => 'paid',
                    'payment_amount' => $paymentIntent->amount / 100,
                    'stripe_payment_intent_id' => $paymentIntent->id,
                    'stripe_customer_id' => $paymentIntent->customer,
                    'paid_at' => now(),
                    'payment_method' => $paymentIntent->payment_method_types[0] ?? 'card',
                    'status' => 'scheduled',
                ]);
            }

            // Log activity (if user is authenticated)
            if ($request->user()) {
                ActivityLog::create([
                    'user_id' => $request->user()->id,
                    'action' => 'payment_completed',
                    'model_type' => Consultation::class,
                    'model_id' => $consultation->id,
                    'description' => "Payment of £{$consultation->payment_amount} completed for consultation",
                    'ip_address' => $request->ip(),
                ]);
            }

            return response()->json([
                'message' => 'Payment confirmed successfully',
                'consultation' => $consultation->load(['client']),
            ]);
        } catch (ApiErrorException $e) {
            Log::error('Stripe Payment Confirmation Error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to confirm payment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle Stripe webhook events
     */
    public function handleWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $endpointSecret = config('services.stripe.webhook_secret');

        // Validate webhook secret is configured
        if (!$endpointSecret) {
            Log::error('Stripe webhook secret not configured');
            return response()->json(['error' => 'Webhook configuration error'], 500);
        }

        try {
            $event = \Stripe\Webhook::constructEvent(
                $payload,
                $sigHeader,
                $endpointSecret
            );
        } catch (\UnexpectedValueException $e) {
            // Invalid payload
            Log::warning('Stripe Webhook Invalid Payload', [
                'ip' => $request->ip(),
                'error' => $e->getMessage(),
            ]);
            return response()->json(['error' => 'Invalid payload'], 400);
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            // Invalid signature - potential security issue
            Log::warning('Stripe Webhook Invalid Signature', [
                'ip' => $request->ip(),
                'error' => $e->getMessage(),
            ]);
            return response()->json(['error' => 'Invalid signature'], 400);
        } catch (\Exception $e) {
            Log::error('Stripe Webhook Error', [
                'ip' => $request->ip(),
                'error' => $e->getMessage(),
            ]);
            return response()->json(['error' => 'Webhook processing failed'], 500);
        }

        // Handle the event
        switch ($event->type) {
            case 'payment_intent.succeeded':
                $paymentIntent = $event->data->object;
                $this->handlePaymentSuccess($paymentIntent);
                break;

            case 'payment_intent.payment_failed':
                $paymentIntent = $event->data->object;
                $this->handlePaymentFailure($paymentIntent);
                break;

            default:
                Log::info('Unhandled Stripe event: ' . $event->type);
        }

        return response()->json(['received' => true]);
    }

    /**
     * Get or create Stripe customer
     */
    private function getOrCreateStripeCustomer(Client $client, $email)
    {
        if ($client->stripe_customer_id) {
            try {
                $customer = \Stripe\Customer::retrieve($client->stripe_customer_id);
                return $customer->id;
            } catch (\Exception $e) {
                // Customer doesn't exist, create new one
            }
        }

        $customer = \Stripe\Customer::create([
            'email' => $email,
            'name' => $client->firstName . ' ' . $client->lastName,
            'metadata' => [
                'client_id' => $client->id,
            ],
        ]);

        // Update client with Stripe customer ID if column exists
        if (Schema::hasColumn('clients', 'stripe_customer_id')) {
            $client->update(['stripe_customer_id' => $customer->id]);
        }

        return $customer->id;
    }

    /**
     * Handle successful payment
     */
    private function handlePaymentSuccess($paymentIntent)
    {
        $clientId = $paymentIntent->metadata->client_id ?? null;
        if (!$clientId) {
            return;
        }

        $consultation = Consultation::where('client_id', $clientId)
            ->whereNull('paid_at')
            ->latest()
            ->first();

        if ($consultation) {
            $consultation->update([
                'payment_status' => 'paid',
                'payment_amount' => $paymentIntent->amount / 100,
                'stripe_payment_intent_id' => $paymentIntent->id,
                'stripe_customer_id' => $paymentIntent->customer,
                'paid_at' => now(),
                'payment_method' => $paymentIntent->payment_method_types[0] ?? 'card',
            ]);
        }
    }

    /**
     * Handle failed payment
     */
    private function handlePaymentFailure($paymentIntent)
    {
        $clientId = $paymentIntent->metadata->client_id ?? null;
        if (!$clientId) {
            return;
        }

        $consultation = Consultation::where('client_id', $clientId)
            ->whereNull('paid_at')
            ->latest()
            ->first();

        if ($consultation) {
            $consultation->update([
                'payment_status' => 'failed',
            ]);
        }
    }
}


"use client";
import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { CreditCard, Lock, AlertCircle, CheckCircle } from "lucide-react";

const STRIPE_MODE = process.env.NEXT_PUBLIC_STRIPE_MODE || "test";
const STRIPE_KEY =
  STRIPE_MODE === "live"
    ? process.env.NEXT_PUBLIC_STRIPE_LIVE_PUBLIC_KEY
    : process.env.NEXT_PUBLIC_STRIPE_TEST_PUBLIC_KEY;

const stripePromise = STRIPE_KEY ? loadStripe(STRIPE_KEY) : null;

if (!STRIPE_KEY) {
  console.error(
    `Critical Error: Stripe Public Key is missing for ${STRIPE_MODE} mode. Payment system will not function.`,
  );
} else {
  console.log(`Stripe Initialized in ${STRIPE_MODE.toUpperCase()} mode.`);
}

export function StripePaymentForm({ clientId, amount, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("idle"); // idle, processing, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setPaymentStatus("processing");

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message);
        setPaymentStatus("error");
        setIsLoading(false);
        return;
      }

      const { error: confirmError, paymentIntent } =
        await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/payment-success`,
          },
          redirect: "if_required",
        });

      if (confirmError) {
        setError(confirmError.message);
        setPaymentStatus("error");
        if (onError) onError(confirmError);
      } else {
        // Confirm payment on backend
        if (paymentIntent && paymentIntent.status === "succeeded") {
          try {
            await fetch(
              `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/payments/confirm`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  payment_intent_id: paymentIntent.id,
                  client_id: clientId,
                }),
              },
            );
          } catch (err) {
            console.error("Failed to confirm payment on backend:", err);
          }
        }
        setPaymentStatus("success");
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      setError(err.message || "An error occurred during payment");
      setPaymentStatus("error");
      if (onError) onError(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (paymentStatus === "success") {
    return (
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 text-center">
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-green-900 mb-2">
          Payment Successful!
        </h3>
        <p className="text-sm text-green-700">
          Your consultation has been confirmed.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="border border-gray-300 rounded-lg p-4">
        <PaymentElement />
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-600">
            Your payment information is secure and encrypted. This
            consultation/admin fee is non-refundable.
          </p>
        </div>
        {STRIPE_MODE === "test" && (
          <div className="mt-1 pt-3 border-t border-gray-200">
            <p className="text-xs font-medium text-purple-700 mb-1">
              Testing Mode Active
            </p>
            <p className="text-[10px] text-gray-500">
              Use test card:{" "}
              <code className="bg-purple-50 px-1 rounded text-purple-700">
                4242 4242 4242 4242
              </code>
            </p>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={!stripe || isLoading || paymentStatus === "processing"}
        className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
          isLoading ? "cursor-wait" : ""
        }`}
        style={{ backgroundColor: "#6f1d56" }}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            Pay £{amount.toFixed(2)}
          </>
        )}
      </button>
    </form>
  );
}

export function StripePaymentWrapper({
  clientId,
  amount,
  paymentType = "consultation",
  couponCode,
  onSuccess,
  onError,
}) {
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/payments/create-intent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              client_id: clientId,
              amount: amount,
              currency: "gbp",
              payment_type: paymentType,
              coupon_code: couponCode,
            }),
          },
        );

        if (!response.ok) {
          throw new Error("Failed to create payment intent");
        }

        const data = await response.json();
        setClientSecret(data.client_secret);
      } catch (err) {
        setError(err.message || "Failed to initialize payment");
        if (onError) onError(err);
      } finally {
        setLoading(false);
      }
    };

    if (clientId && amount) {
      createPaymentIntent();
    }
  }, [clientId, amount, onError]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <svg
            className="animate-spin h-8 w-8 mx-auto mb-4"
            style={{ color: "#6f1d56" }}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-sm text-gray-600">Loading payment form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-red-900">Payment Error</p>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return null;
  }

  const options = {
    clientSecret,
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#6f1d56",
      },
    },
  };

  if (!stripePromise) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-red-900 mb-2">
          Configuration Error
        </h3>
        <p className="text-red-700 font-medium">
          Payment system is not configured.
        </p>
        <p className="text-sm text-red-600 mt-2">
          Error: Stripe Public Key is missing for <code>{STRIPE_MODE}</code>{" "}
          mode.
        </p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <StripePaymentForm
        clientId={clientId}
        amount={amount}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
}

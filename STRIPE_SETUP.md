# Stripe Payment Integration Setup

This document explains how to set up Stripe payments for the Vanquish application.

## Prerequisites

1. Stripe account (sign up at https://stripe.com)
2. Stripe API keys (available in Stripe Dashboard)

## Backend Setup

1. **Install Stripe PHP SDK** (already added to composer.json):

```bash
cd backend
composer install
```

2. **Add Stripe credentials to `.env`**:

```env
STRIPE_MODE=test # Set to 'live' for production
STRIPE_TEST_PUBLIC_KEY=pk_test_...
STRIPE_TEST_SECRET_KEY=sk_test_...
STRIPE_LIVE_PUBLIC_KEY=pk_live_...
STRIPE_LIVE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

3. **Run migrations**:

```bash
php artisan migrate
```

4. **Set up Stripe Webhook**:
   - Go to Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/payments/webhook`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET` in `.env`

## Frontend Setup

1. **Install Stripe dependencies** (already installed):

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

2. **Add Stripe credentials to `.env`**:

```env
NEXT_PUBLIC_STRIPE_MODE=test
NEXT_PUBLIC_STRIPE_TEST_PUBLIC_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_LIVE_PUBLIC_KEY=pk_live_...
```

## Testing

### Test Cards

Use these test card numbers in Stripe test mode:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

Use any future expiry date, any 3-digit CVC, and any postal code.

### Test Flow

1. Fill out the client intake form
2. On the payment step, use test card `4242 4242 4242 4242`
3. Complete payment
4. Check Stripe Dashboard for payment confirmation

## Payment Flow

1. Client fills out intake form
2. Form is submitted, creating a client record
3. Payment intent is created via `/api/payments/create-intent`
4. Client enters payment details using Stripe Elements
5. Payment is confirmed via Stripe
6. Backend confirms payment via `/api/payments/confirm`
7. Consultation record is updated with payment status

## Environment Variables

### Backend (.env)

```env
STRIPE_MODE=test                  # test or live
STRIPE_TEST_PUBLIC_KEY=pk_test_... # Test Publishable Key
STRIPE_TEST_SECRET_KEY=sk_test_... # Test Secret Key
STRIPE_LIVE_PUBLIC_KEY=pk_live_... # Live Publishable Key
STRIPE_LIVE_SECRET_KEY=sk_live_... # Live Secret Key
STRIPE_WEBHOOK_SECRET=whsec_...    # Webhook signing secret
```

### Frontend (.env)

```env
NEXT_PUBLIC_STRIPE_MODE=test
NEXT_PUBLIC_STRIPE_TEST_PUBLIC_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_LIVE_PUBLIC_KEY=pk_live_...
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Production Setup

1. Switch to live API keys in Stripe Dashboard
2. Update environment variables with live keys
3. Update webhook endpoint to production URL
4. Test with real card (use small amount first)

## Security Notes

- Never commit API keys to version control
- Use environment variables for all keys
- Webhook endpoint validates signatures
- Payment intents are created server-side
- Card details never touch your server (handled by Stripe)

## Troubleshooting

### Payment Intent Creation Fails

- Check Stripe API keys are correct
- Verify client_id exists in database
- Check API logs for detailed errors

### Webhook Not Working

- Verify webhook URL is accessible
- Check webhook signing secret matches
- Review Stripe Dashboard → Webhooks for event logs

### Payment Not Confirming

- Check browser console for errors
- Verify Stripe Elements is loading
- Check network tab for API calls

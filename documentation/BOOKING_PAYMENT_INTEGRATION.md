# Booking Payment Integration

The session booking system has been integrated with the payment processing system.

## Changes Overview

1.  **Backend (`ClientBookingController.php`)**:
    - Updated `authenticate` and `getBookingStatus` endpoints to return the client's database `id` (required for payment intent creation).
    - Ensured consistent response structure for both new authentication and status refreshes.

2.  **Frontend (`app/client-booking/page.jsx`)**:
    - **Payment Modal**: Added a payment modal that appears after booking details are confirmed but before the booking is finalized.
    - **Stripe Integration**: Utilized `StripePaymentWrapper` to handle secure payments via Stripe.
    - **Low Cost Booking**:
      - Calculates payment of £25.00 for block bookings (3 or 4 sessions).
      - Requires payment before confirming the block.
    - **Mid Range Booking**:
      - Added UI for selecting single session slots from available times.
      - Calculates payment of £40.00 per session.
      - Requires payment before confirming the session.
    - **Agreement Redirects**: Updated agreement forms to redirect to the internal booking system instead of external Amelia/Trafft.

## Booking Rules & Logic

1.  **48-Hour Rule**:
    - Sessions must be booked at least 48 hours in advance.
    - For Low Cost blocks, if the next available slot is within 48 hours, the system automatically skips to the following week.
    - Mid Range clients will only see slots starting at least 48 hours from the current time.

2.  **Continuity Requirement (Low Cost)**:
    - Blocks must follow the previous block continuously (weekly).
    - The system enforces this through a `sessions_count` penalty if a client misses their deadline or breaks continuity.

3.  **No Traditional Login**:
    - Clients access the portal exclusively via unique UUID links provided during the agreement process or via automated emails.
    - The portal auto-authenticates using these parameters.

## How to Test

1.  **Low Cost Client**:
    - Log in as a Low Cost client (or use redirect from agreement).
    - Click "Book Next Block".
    - Select start date and number of sessions (3 or 4).
    - Click "Book".
    - Verify the Payment Modal appears with £25.00 amount.
    - Complete payment.
    - Verify success message and booking confirmation.

2.  **Mid Range Client**:
    - Log in as a Mid Range client.
    - Click "Book Session".
    - Select an available time slot.
    - Click "Book".
    - Verify the Payment Modal appears with £40.00 amount.
    - Complete payment.
    - Verify success message and booking confirmation.

## Notes

- The system uses the `StripePaymentWrapper` component which handles the creation of Payment Intents and confirmation.
- Booking data is stored in `pendingBookingData` state until payment is successful.
- The `apiService.bookBlock` and `apiService.bookSession` are called only after successful payment.

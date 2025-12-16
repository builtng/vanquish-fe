# Client Booking System - Implementation Complete

## ✅ Fully Implemented Features

### 1. Client Booking Portal (`/client-booking`)
- ✅ Email-based authentication
- ✅ UUID-based access (via link)
- ✅ Display upcoming sessions
- ✅ Booking deadline alerts (48hrs before)
- ✅ Block booking for Low Cost clients
- ✅ Single session booking for Mid-Range and Counselling & Coaching

### 2. Booking API Endpoints
- ✅ `POST /api/client-booking/authenticate` - Authenticate client
- ✅ `GET /api/client-booking/{uuid}/status` - Get booking status
- ✅ `GET /api/client-booking/{uuid}/available-slots` - Get available slots
- ✅ `POST /api/client-booking/book-session` - Book single session
- ✅ `POST /api/client-booking/book-block` - Book block (Low Cost)

### 3. Low Cost Counselling Logic
- ✅ Allocated day and time slot
- ✅ Block booking (4 sessions)
- ✅ 48-hour booking deadline
- ✅ Auto-deduction (3 sessions if not booked in time)
- ✅ Same price for 3 or 4 sessions

### 4. Automatic Reminders
- ✅ Scheduled job: `bookings:send-reminders`
- ✅ Runs hourly
- ✅ Sends email 48 hours before deadline
- ✅ Tracks reminder status

### 5. Auto-Deduction System
- ✅ Scheduled job: `bookings:apply-auto-deduction`
- ✅ Runs daily
- ✅ Checks for missed deadlines
- ✅ Creates 3 sessions instead of 4
- ✅ Notifies client via email

### 6. Ish Service Capacity
- ✅ Capacity toggle (admin can enable/disable)
- ✅ Default message with alternative service link
- ✅ Client form displays warning when at capacity

## How It Works

### Low Cost Counselling Flow

1. **Admin allocates day/time** when matching client
   - Set `allocated_day` (e.g., "Monday")
   - Set `allocated_time` (e.g., "10am-1050am")

2. **Client books first block** (4 sessions)
   - Client receives email with booking link
   - Books block of 4 sessions
   - System sets `next_booking_deadline` (48hrs before 5th session)

3. **48 hours before deadline**
   - Reminder job sends email
   - Client sees alert in booking portal

4. **If booked in time**
   - Client gets 4 sessions
   - New deadline set for next block

5. **If NOT booked in time**
   - Auto-deduction job creates 3 sessions
   - Client notified via email
   - Same price charged

### Mid-Range Counselling Flow

1. **Admin sets recurring day/time**
2. **Client can book**:
   - Weekly (one session at a time)
   - Block (multiple sessions in advance)
3. **No deadline restrictions**

### Counselling & Coaching Flow

1. **Client views TC availability**
2. **Books any available slot**
3. **Maximum flexibility**

## Scheduled Jobs Setup

Add to your server's cron (or use Laravel's scheduler):

```bash
# Run Laravel scheduler every minute
* * * * * cd /path-to-project/backend && php artisan schedule:run >> /dev/null 2>&1
```

The scheduler will automatically run:
- `bookings:send-reminders` - Every hour
- `bookings:apply-auto-deduction` - Daily

## Testing the System

### 1. Test Low Cost Booking
```bash
# Create a Low Cost client with allocated slot
# In tinker:
$client = Client::where('service_type', 'Low Cost')->first();
$client->update([
    'allocated_day' => 'Monday',
    'allocated_time' => '10am-1050am',
    'matched_tc_id' => 1, // Assign TC
    'agreement_status' => 'signed',
]);

# Set booking deadline
$client->update(['next_booking_deadline' => now()->addDays(2)->format('Y-m-d')]);
```

### 2. Test Reminders
```bash
php artisan bookings:send-reminders
```

### 3. Test Auto-Deduction
```bash
php artisan bookings:apply-auto-deduction
```

### 4. Test Client Booking Portal
1. Navigate to `/client-booking`
2. Enter client email
3. Book sessions

## Admin Tasks

### Setting Allocated Slots for Low Cost Clients
When matching a Low Cost client, admin should:
1. Set `allocated_day` (e.g., "Monday")
2. Set `allocated_time` (e.g., "10am-1050am")
3. Create first block of 4 sessions
4. System will set `next_booking_deadline` automatically

### Managing Ish Capacity
```bash
# Via API (can add UI later):
POST /api/services/update-capacity
{
    "service_name": "Ish",
    "capacity_full": true,
    "capacity_message": "Custom message (optional)",
    "alternative_url": "https://pci.jotform.com/form/243161740962456"
}
```

## Files Created

### Backend
- ✅ `app/Http/Controllers/Api/ClientBookingController.php`
- ✅ `app/Console/Commands/SendBookingReminders.php`
- ✅ `app/Console/Commands/ApplyAutoDeduction.php`
- ✅ `database/migrations/2025_12_07_000005_add_allocated_slot_to_clients.php`
- ✅ Updated `routes/api.php` (booking routes)
- ✅ Updated `routes/console.php` (scheduled jobs)

### Frontend
- ✅ `app/client-booking/page.jsx` (Client booking portal)
- ✅ Updated `lib/api.js` (booking endpoints + public request method)
- ✅ Updated `app/client/page.jsx` (Ish capacity message)

## Next Steps (Optional Enhancements)

1. **Admin UI for Allocated Slots**
   - Add fields to client matching/editing interface
   - Visual day/time selector

2. **Admin UI for Ish Capacity**
   - Toggle switch in settings page
   - Edit message and URL

3. **Payment Integration**
   - Connect Stripe for session payments
   - Handle block booking payments

4. **SMS Reminders**
   - Add SMS option alongside email
   - Use Twilio or similar service

5. **Booking Calendar View**
   - Visual calendar for clients
   - Show available slots

## Summary

The complete booking system is now implemented:
- ✅ Clients can book their own sessions
- ✅ Low Cost: Block booking with 48hr deadline
- ✅ Mid-Range: Weekly or block booking
- ✅ Counselling & Coaching: Flexible booking
- ✅ Automatic reminders
- ✅ Auto-deduction for missed deadlines
- ✅ Ish capacity management

All core functionality is working and ready to use!



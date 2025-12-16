# Client Booking System Implementation Guide

## Overview

This document describes the client self-booking system where clients book their own therapy sessions after being matched with a counsellor and signing the agreement.

## Service Types & Booking Rules

### 1. Low Cost Counselling
- **Allocation**: Clients are allocated a specific day and time slot (e.g., Monday 10am-10:50am)
- **Booking Pattern**: Book once a month, paying for a block of 4 sessions
- **Deadline**: Must book next block 48 hours before their next scheduled session
- **Auto-Deduction**: If not booked in time, system automatically gives 3 sessions instead of 4 (same price)
- **Reminders**: Automatic email/SMS reminder 48 hours before booking deadline

### 2. Mid-Range Counselling
- **Allocation**: Same day/time each week
- **Booking Options**: 
  - Block book multiple sessions
  - Book weekly (one session at a time)
- **Flexibility**: Client chooses their preferred booking method

### 3. Counselling and Coaching
- **Flexibility**: Book any day/time available
- **No restrictions**: Maximum flexibility for scheduling

## Implementation Status

### ✅ Completed
1. **Ish Service Capacity**
   - Backend capacity check endpoint
   - Default message and alternative URL
   - Admin can toggle capacity on/off
   - Client form displays capacity warning

2. **Database Schema**
   - Added `allocated_day` and `allocated_time` to clients table
   - Added `next_booking_deadline` to clients table
   - Session table already has booking fields (booking_deadline, booking_reminder_sent, auto_deduction_applied)

### 🚧 In Progress
1. **Client Booking Portal** - Creating client-facing booking page
2. **Booking Controller** - API endpoints for booking sessions
3. **Reminder System** - Scheduled job for 48hr reminders
4. **Auto-Deduction** - Scheduled job for checking missed deadlines

## Next Steps

### 1. Create Client Booking Portal (`/app/client-booking/page.jsx`)
- Client authentication via email/UUID token
- Display upcoming sessions
- Show booking deadline for Low Cost clients
- Allow booking based on service type rules

### 2. Create Booking Controller (`/backend/app/Http/Controllers/Api/ClientBookingController.php`)
- `GET /api/client-booking/{client_uuid}` - Get client's booking info
- `POST /api/client-booking/book-session` - Book a session
- `POST /api/client-booking/book-block` - Book block of sessions (Low Cost)
- `GET /api/client-booking/available-slots` - Get available time slots

### 3. Create Scheduled Jobs
- **ReminderJob**: Check for sessions needing reminders (48hrs before deadline)
- **AutoDeductionJob**: Check for missed deadlines and apply auto-deduction

### 4. Admin Settings
- Add Ish capacity toggle to settings page
- Allow setting allocated day/time for Low Cost clients

## Database Fields Added

### Clients Table
- `allocated_day` (string, nullable) - Day of week for Low Cost clients
- `allocated_time` (string, nullable) - Time slot for Low Cost clients  
- `next_booking_deadline` (date, nullable) - 48hrs before next session

### Sessions Table (Already Exists)
- `booking_deadline` (date, nullable) - 48hrs before scheduled session
- `booking_reminder_sent` (boolean) - Whether reminder was sent
- `auto_deduction_applied` (boolean) - Whether auto-deduction was applied
- `is_block_booking` (boolean) - Whether this is part of a block
- `block_number` (integer, nullable) - Which session in block (1-4)
- `total_sessions_in_block` (integer, nullable) - Total sessions in block

## API Endpoints Needed

### Client Booking Endpoints
```
GET    /api/client-booking/{client_uuid}           - Get booking info
POST   /api/client-booking/book-session           - Book single session
POST   /api/client-booking/book-block             - Book block (Low Cost)
GET    /api/client-booking/available-slots        - Get available slots
POST   /api/client-booking/authenticate           - Authenticate client
```

### Admin Endpoints (Already Exists)
```
GET    /api/services/ish-capacity                 - Check Ish capacity
POST   /api/services/update-capacity              - Update capacity (admin)
```

## Workflow Examples

### Low Cost Counselling Booking Flow
1. Client matched with TC and agreement signed
2. Admin allocates day/time (e.g., Monday 10am)
3. Admin creates first block of 4 sessions
4. Client receives email with booking link
5. Client books block of 4 sessions (pays for 4)
6. System sets booking_deadline for next block (48hrs before 5th session)
7. 48hrs before deadline: System sends reminder email
8. If booked in time: Client gets 4 sessions
9. If NOT booked in time: System auto-applies 3 sessions (same price)

### Mid-Range Counselling Booking Flow
1. Client matched with TC and agreement signed
2. Admin sets recurring day/time (e.g., Tuesday 2pm)
3. Client can:
   - Book block of sessions in advance
   - Book weekly as needed
4. No deadline restrictions

### Counselling & Coaching Booking Flow
1. Client matched with TC and agreement signed
2. Client views TC's availability
3. Client books any available slot
4. Maximum flexibility

## Files Created/Modified

### Backend
- ✅ `database/migrations/2025_12_07_000005_add_allocated_slot_to_clients.php`
- ✅ `app/Models/Client.php` (added helper methods)
- ✅ `app/Http/Controllers/Api/ServiceController.php` (updated Ish capacity)

### Frontend
- ✅ `app/client/page.jsx` (updated Ish capacity message)

### To Be Created
- `app/client-booking/page.jsx` - Client booking portal
- `backend/app/Http/Controllers/Api/ClientBookingController.php` - Booking API
- `backend/app/Console/Commands/SendBookingReminders.php` - Reminder command
- `backend/app/Console/Commands/ApplyAutoDeduction.php` - Auto-deduction command
- `app/dashboard/settings/page.jsx` - Add Ish capacity toggle

## Testing Checklist

- [ ] Low Cost client can book block of 4 sessions
- [ ] Reminder sent 48hrs before deadline
- [ ] Auto-deduction applies if not booked in time (3 sessions)
- [ ] Mid-Range client can book weekly or block
- [ ] Counselling & Coaching client can book any available slot
- [ ] Ish capacity toggle works in admin settings
- [ ] Capacity message displays correctly in client form



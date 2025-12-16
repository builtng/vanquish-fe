# Multi-Admin Activity Tracking & Counsellor Portal

## Overview

This document describes the enhanced multi-admin activity tracking system and counsellor portal that allows:
- Multiple admin/staff members with granular permissions
- Automatic notifications to counsellors when clients book
- Communication system between staff and external counsellors
- Minimal-access counsellor portal

## Features Implemented

### 1. Enhanced Permission System

**Database Changes:**
- Created `permissions` table for granular permissions
- Created `user_permissions` pivot table
- Added `counsellor` role to users table
- Added `training_counsellor_id` to users table (links counsellor users to their TC profile)

**Permission Types:**
- `match_clients` - Match clients with TCs
- `edit_clients` - Edit client information
- `view_only` - View-only access
- `delete_clients` - Delete client records
- `manage_users` - Manage system users
- `view_own_clients` - Counsellors view their assigned clients
- `view_own_sessions` - Counsellors view their sessions
- `send_message` - Send messages

**User Roles:**
- **Admin**: Full access to everything (bypasses permission checks)
- **Staff**: Can access most features (can be restricted via permissions)
- **Counsellor**: Minimal access - can only view their own clients/sessions and send messages

### 2. Multi-Admin Activity Tracking

**Enhanced Activity Log:**
- Tracks which admin/staff member performed each action
- Filter by user_id to see actions by specific admin
- Filter by date range
- Filter by action type
- Shows user name and role in activity log display

**Activity Log Controller Updates:**
- Added `user_id` filtering
- Added `date_from` and `date_to` filtering
- Improved user information in responses

### 3. Automatic Booking Notifications

**When Consultations are Booked:**
- Automatic email notification sent to assigned TC (if email exists)
- In-system message notification created
- Both notifications include:
  - Client name
  - Scheduled date/time
  - Notes (if any)
  - Link to counsellor portal

**Email Template:**
- Professional booking notification email
- Includes all booking details
- Link to counsellor portal

### 4. Communication System

**Messages Table:**
- Stores messages between staff and counsellors
- Types: `staff_to_counsellor`, `counsellor_to_staff`, `staff_to_staff`
- Tracks read/unread status
- Links to related clients/consultations

**Message Features:**
- Staff can send messages to specific counsellors
- Counsellors can send messages to admin team
- Email notifications (optional)
- Read/unread tracking
- Unread message count

**Message Controller:**
- `GET /api/messages` - List messages (filtered by user role)
- `GET /api/messages/{id}` - Get single message
- `POST /api/messages/send-to-counsellor` - Staff send to counsellor
- `POST /api/messages/send-to-staff` - Counsellor send to staff
- `POST /api/messages/{id}/mark-read` - Mark as read
- `GET /api/messages/unread-count` - Get unread count

### 5. Counsellor Portal

**Location:** `/counsellor-portal`

**Features:**
- View messages from staff
- Send messages to admin team
- See unread message count
- View booking notifications
- Minimal interface with restricted access

**Access Control:**
- Only users with `counsellor` role can access
- Automatically filters messages to show only those for the logged-in counsellor

## Setup Instructions

### 1. Run Migrations

```bash
cd backend
php artisan migrate
```

This will create:
- `permissions` table
- `user_permissions` table
- `messages` table
- Updates to `users` table (counsellor role, training_counsellor_id)

### 2. Seed Permissions

```bash
php artisan db:seed --class=PermissionSeeder
```

This creates all default permissions.

### 3. Create Counsellor User Accounts

To create a counsellor account linked to a Training Counsellor:

```php
// In tinker or seeder
$tc = TrainingCounsellor::where('email', 'counsellor@example.com')->first();
$user = User::create([
    'name' => 'Counsellor Name',
    'email' => 'counsellor@example.com',
    'password' => Hash::make('password'),
    'role' => 'counsellor',
    'training_counsellor_id' => $tc->id,
]);
```

### 4. Assign Permissions (Optional)

To restrict staff members:

```php
$user = User::find($userId);
$permission = Permission::where('name', 'view_only')->first();
$user->permissions()->attach($permission->id);
```

## Usage

### For Admin/Staff

**Sending Messages to Counsellors:**
1. Navigate to Training Counsellor details page
2. Use "Send Message" button (to be added to UI)
3. Or use API: `POST /api/messages/send-to-counsellor`

**Viewing Activity Logs:**
1. Go to Activity Log page
2. Use filters to see actions by specific admin
3. Filter by date range, action type, or user

**Managing Permissions:**
- Currently managed via database
- UI can be added to User Management page

### For Counsellors

**Accessing Portal:**
1. Login with counsellor account
2. Navigate to `/counsellor-portal`
3. View messages and send replies

**Receiving Notifications:**
- Automatic email when consultation is booked
- In-system message notification
- Unread count badge

## API Endpoints

### Messages

- `GET /api/messages` - List messages
- `GET /api/messages/{id}` - Get message
- `POST /api/messages/send-to-counsellor` - Send to counsellor (staff only)
- `POST /api/messages/send-to-staff` - Send to staff (counsellor only)
- `POST /api/messages/{id}/mark-read` - Mark as read
- `GET /api/messages/unread-count` - Get unread count

### Activity Logs

- `GET /api/activity-logs?user_id={id}` - Filter by admin
- `GET /api/activity-logs?date_from={date}&date_to={date}` - Filter by date
- `GET /api/activity-logs?action={action}` - Filter by action type

## Future Enhancements

1. **Permission Management UI**
   - Add UI to assign permissions to users
   - Visual permission editor

2. **Enhanced Counsellor Portal**
   - View assigned clients
   - View scheduled sessions
   - Session notes interface

3. **Notification Preferences**
   - Allow counsellors to set notification preferences
   - Email vs in-app notifications

4. **Message Threading**
   - Group related messages
   - Reply threading

5. **Activity Log Export**
   - Export activity logs to CSV/PDF
   - Advanced filtering and reporting

## Security Notes

- All routes are protected by authentication
- Role-based access control enforced
- Counsellors can only see their own messages
- Staff/admin can see messages they sent/received
- Activity logs track IP addresses and user agents

## Files Created/Modified

### Backend

**Migrations:**
- `2025_12_07_000001_create_permissions_table.php`
- `2025_12_07_000002_create_messages_table.php`
- `2025_12_07_000003_add_counsellor_role_to_users.php`
- `2025_12_07_000004_add_tc_user_relationship.php`

**Models:**
- `app/Models/Permission.php`
- `app/Models/Message.php`
- Updated `app/Models/User.php` (added permission methods, relationships)

**Controllers:**
- `app/Http/Controllers/Api/MessageController.php`
- Updated `app/Http/Controllers/Api/ConsultationController.php` (added notifications)
- Updated `app/Http/Controllers/Api/ActivityLogController.php` (enhanced filtering)

**Mail:**
- `app/Mail/BookingNotificationEmail.php`
- `resources/views/emails/booking-notification.blade.php`

**Seeders:**
- `database/seeders/PermissionSeeder.php`

**Routes:**
- Updated `routes/api.php` (added message routes)

### Frontend

**Pages:**
- `app/counsellor-portal/page.jsx` (new counsellor portal)

**API Service:**
- Updated `lib/api.js` (added message methods)

## Testing

1. **Test Counsellor Portal:**
   - Create counsellor user
   - Login and access `/counsellor-portal`
   - Send message to staff
   - Verify message appears in admin view

2. **Test Notifications:**
   - Book a consultation with TC assigned
   - Verify email sent (if TC has email)
   - Verify in-system message created
   - Login as counsellor and verify message appears

3. **Test Activity Logging:**
   - Perform actions as different admins
   - Filter activity log by user_id
   - Verify correct admin shown for each action

4. **Test Permissions:**
   - Assign view_only permission to staff
   - Verify they can't edit/delete
   - Remove permission and verify access restored



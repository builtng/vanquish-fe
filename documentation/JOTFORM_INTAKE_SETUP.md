# JotForm Intake Form Setup Guide

This guide explains how to set up the JotForm intake form integration for the client intake workflow.

## Overview

After clients submit the initial intake form, they are automatically redirected to complete a JotForm intake form. The system captures important data from questions 6, 9, 16, 22, 24, and 34, then redirects clients to the booking system.

## Form URL

**JotForm URL**: `https://form.jotform.com/231631669909062`

## Workflow

1. Client submits initial intake form (`/client`)
2. System creates client record and redirects to JotForm with:
   - `email` parameter: Client's email address
   - `client_uuid` parameter: Client's UUID
3. Client completes JotForm intake form
4. JotForm sends webhook to our server
5. System processes webhook and stores important data
6. Client is redirected to booking system: `https://vanquishtherapiesvqt.trafft.com/`

## Webhook Configuration

### Webhook Endpoint

**URL**: `POST /api/jotform/intake-webhook`

**Example**: `https://your-domain.com/api/jotform/intake-webhook`

### Setting Up Webhook in JotForm

1. Log in to JotForm and open form editor: https://www.jotform.com/form-builder/231631669909062
2. Go to **Settings** → **Integrations** → **Webhooks**
3. Click **Add Webhook**
4. Enter webhook URL: `https://your-domain.com/api/jotform/intake-webhook`
5. Select trigger: **On Form Submit**
6. Method: **POST**
7. Format: **JSON** (recommended) or **Form Data**
8. Save webhook

### Redirect Configuration

1. In JotForm form editor, go to **Settings** → **Form Options**
2. Scroll to **Thank You Page** section
3. Select **Redirect to external link**
4. Enter redirect URL: `https://your-domain.com/jotform-redirect`
   - This page will show copyright info and redirect to booking system
5. Save settings

**Alternative**: You can redirect directly to the booking system:
- Redirect URL: `https://vanquishtherapiesvqt.trafft.com/`

## Important Questions

The system captures data from the following questions:
- **Question 6**
- **Question 9**
- **Question 16**
- **Question 22**
- **Question 24**
- **Question 34**

### Field Name Mapping

JotForm uses question numbers for field names. The webhook handler looks for:
- `q6`, `question6`, `question_6` for Question 6
- `q9`, `question9`, `question_9` for Question 9
- `q16`, `question16`, `question_16` for Question 16
- `q22`, `question22`, `question_22` for Question 22
- `q24`, `question24`, `question_24` for Question 24
- `q34`, `question34`, `question_34` for Question 34

If your JotForm uses different field names, check the webhook logs and update `JotFormWebhookController.php` accordingly.

## URL Parameters (Prefilled Data)

The initial redirect to JotForm includes prefilled data from the client intake form:

**Required Parameters:**
- `email`: Client's email address
- `client_uuid`: Client's UUID (for webhook matching)

**Prefilled Fields (if available):**
- `q1` / `first_name`: First Name
- `q2` / `last_name`: Last Name
- `q3` / `q4` / `email`: Email Address
- `q5` / `phone`: Phone Number
- `q6` / `age`: Age
- `q7` / `gender`: Gender
- `q8` / `ethnicity`: Ethnicity
- `q9` / `sexual_orientation`: Sexual Orientation
- `q10` / `service_type`: Service Type
- `uuid` / `client_id`: Client UUID (alternative formats)

**Example URL**:
```
https://form.jotform.com/231631669909062?email=client@example.com&client_uuid=123e4567-e89b-12d3-a456-426614174000&q1=John&q2=Smith&q5=+447700900000&q6=28&q7=Male
```

**Note:** JotForm fields must be configured to accept URL parameters. To enable prefilling:
1. In JotForm editor, select each field
2. Go to **Properties** → **Advanced**
3. Enable **"Allow Pre-fill"** option
4. Set the field name to match the parameter (e.g., `q1`, `first_name`, etc.)

The system sends both question numbers (`q1`, `q2`, etc.) and field names (`first_name`, `last_name`, etc.) to maximize compatibility.

## Copyright Information

The redirect page (`/jotform-redirect`) includes copyright information stating:
- The form was created using JotForm (third-party service)
- JotForm is not owned or operated by Vanquish Therapies
- Copyright notice for Vanquish Therapies

## Database Storage

The webhook stores data in the `clients` table:
- `jotform_intake_data`: JSON field containing all form data and important questions
- `jotform_intake_submission_id`: JotForm submission ID
- `jotform_intake_completed_at`: Timestamp when form was completed

## Testing

1. Submit a test client intake form
2. Verify redirect to JotForm with correct parameters
3. Complete the JotForm
4. Check webhook logs: `backend/storage/logs/laravel.log`
5. Verify client record is updated in database
6. Verify redirect to booking system

## Troubleshooting

### Webhook Not Receiving Data

1. Check webhook URL is correct in JotForm settings
2. Verify webhook is enabled and set to trigger on form submission
3. Check Laravel logs for webhook activity
4. Verify server is accessible from internet (for production)

### Client Not Found

1. Verify `email` or `client_uuid` parameters are passed correctly
2. Check webhook logs for received data
3. Verify client exists in database with matching email/UUID

### Field Names Not Matching

1. Submit a test form
2. Check webhook logs for `available_fields` array
3. Update field name mappings in `JotFormWebhookController.php`

### Redirect Not Working

1. Verify redirect URL is set in JotForm form settings
2. Check if redirect page exists: `/jotform-redirect`
3. Verify booking system URL is correct

## Files Modified

- `backend/database/migrations/2025_12_06_130324_add_jotform_intake_data_to_clients_table.php` - Database migration
- `backend/app/Http/Controllers/Api/JotFormWebhookController.php` - Webhook handler
- `backend/app/Http/Controllers/Api/IntakeFormController.php` - Returns client UUID
- `backend/app/Models/Client.php` - Added fillable fields
- `backend/routes/api.php` - Added webhook route
- `app/client/page.jsx` - Redirects to JotForm after submission
- `app/jotform-redirect/page.jsx` - Redirect page with copyright info

## Next Steps

1. Run migration: `php artisan migrate`
2. Configure JotForm webhook (see above)
3. Configure JotForm redirect (see above)
4. Test the complete workflow
5. Monitor webhook logs for any issues


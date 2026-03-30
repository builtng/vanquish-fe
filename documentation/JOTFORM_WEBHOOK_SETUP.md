# JotForm Webhook Setup Guide

This guide explains how to set up the JotForm webhook to automatically update client records when agreements are signed.

## Overview

The system integrates with JotForm (https://form.jotform.com/231635798225060) to automatically:
- Log when agreements are signed
- Capture emergency contact information
- Update client records in the dashboard
- Progress clients from "Agreement Pending" to "Active Therapy" stage

## Backend Implementation

### Webhook Endpoint

The webhook endpoint is available at:
```
POST /api/jotform/agreement-webhook
```

This endpoint is public (no authentication required) and accepts POST requests from JotForm.

### Expected JotForm Field Names

The webhook handler looks for the following fields in the JotForm submission. You'll need to ensure your JotForm has fields with these names (or update the controller to match your field names):

**Required:**
- **Client Identifier**: Used to match the submission to a client record. The webhook tries multiple methods:
  1. **Email** (preferred): `email`, `client_email`, `clientEmail`, `Email`, `Client Email`, `q3_email`, `q4_email`
  2. **Client ID/UUID**: `client_id`, `clientId`, `uuid`
  3. **Name** (fallback): `Full Name`, `Full Name*`, `full_name`, `name`
  
  **Note**: Your current form doesn't have an email field. Consider adding one for more reliable matching, or ensure the "Full Name" field matches exactly with client names in your system.

- **Signature Upload**: **REQUIRED** - The agreement will only be marked as "signed" if a signature is detected
  - Possible field names: `signature`, `signature_upload`, `signature_file`, `client_signature`, `agreement_signature`, `q8_signature`, `q9_signature`, etc.
  - JotForm sends file uploads as URLs, so the webhook checks for any field containing "signature" that has a URL value

**Emergency Contact Fields (Optional but recommended):**
- **Emergency Contact Name**: `emergency_contact_name`, `emergencyContactName`, `Emergency Contact Name`, `q5_emergencyContactName`
- **Emergency Contact Phone**: `emergency_contact_phone`, `emergencyContactPhone`, `Emergency Contact Phone`, `q6_emergencyContactPhone`
- **Emergency Contact Relationship**: `emergency_contact_relationship`, `emergencyContactRelationship`, `Emergency Contact Relationship`, `q7_emergencyContactRelationship`

## Setting Up JotForm Webhook

1. **Log in to JotForm** and open your agreement form (ID: 231635798225060)

2. **Go to Settings → Integrations → Webhooks**

3. **Add a new webhook** with the following details:
   - **Webhook URL**: `https://your-domain.com/api/jotform/agreement-webhook`
     - Replace `your-domain.com` with your actual domain
     - For local development: `http://localhost:8000/api/jotform/agreement-webhook`
   - **Method**: POST
   - **Format**: JSON (recommended) or Form Data

4. **Configure the webhook to trigger on form submission**

5. **Test the webhook**:
   - Submit a test form with a client email that exists in your system
   - Check the Laravel logs (`storage/logs/laravel.log`) for webhook activity
   - Verify the client record is updated in the dashboard

## JotForm Field Configuration

To ensure the webhook works correctly, configure your JotForm fields as follows:

1. **Email Field**: 
   - Add a field that captures the client's email address
   - Name it one of: `email`, `client_email`, `clientEmail`, `Email`, `Client Email`, `q3_email`, or `q4_email`
   - Make it required

2. **Signature Field** (REQUIRED):
   - Your form uses a **Signature Pad** field ("Your Signature *")
   - JotForm signature pads send data as base64 encoded images or URLs
   - The webhook detects signatures by looking for:
     - Field names containing "signature" (case insensitive)
     - Base64 data URLs (`data:image/...`)
     - Image URLs
     - Long string values (likely signature data)
   - **Important**: The webhook will only mark the agreement as "signed" if signature data is detected in the submission
   - If your signature field has a different name, check the logs for "available_fields" to see what JotForm sends

3. **Emergency Contact Fields**:
   - Add fields for emergency contact name, phone, and relationship
   - Use the field names listed above, or update the `JotFormWebhookController.php` to match your field names

## Customizing Field Names

If your JotForm uses different field names, edit `/backend/app/Http/Controllers/Api/JotFormWebhookController.php` and update the `extractFieldValue()` method calls to include your field names.

For example, if your email field is named `client_email_address`, update line ~60:

```php
$clientEmail = $this->extractFieldValue($formData, [
    'client_email_address',  // Add your field name here
    'email',
    'client_email',
    // ... other options
]);
```

## Testing

1. **Test with a real client email**:
   - Find a client in your system
   - Submit the JotForm using that client's email
   - Check the dashboard to verify:
     - Agreement status changed to "signed"
     - Emergency contact information is displayed
     - Client stage progressed (if was in "Agreement Pending")

2. **Check logs**:
   - Laravel logs: `backend/storage/logs/laravel.log`
   - Look for entries like "JotForm webhook received" and "JotForm webhook processed successfully"

3. **Verify in dashboard**:
   - Go to client details page
   - Check that emergency contact is prominently displayed (red alert box)
   - Verify agreement status shows as "Signed" with timestamp

## Troubleshooting

### Webhook not receiving data
- Check JotForm webhook settings
- Verify the webhook URL is correct
- Check server logs for incoming requests
- Ensure your server is accessible from the internet (for production)

### Client not found
- Verify the email in the JotForm submission matches exactly with the client email in the database
- Check for typos or case sensitivity issues
- Review Laravel logs for "Client not found" messages

### Emergency contact not captured
- Verify field names match between JotForm and the controller
- Check Laravel logs to see what data is being received
- Update field name mappings in the controller if needed

### Agreement not marked as signed
- **Most common issue**: Signature field not detected
- Check Laravel logs for "No signature found in submission" warnings
- Verify your signature field name matches one of the expected names
- Ensure the signature field is a File Upload field (not a text field)
- Check that the signature was actually uploaded (not just the form submitted)
- Review the "available_fields" in the log to see what fields JotForm is sending
- Update the `extractSignatureField()` method in `JotFormWebhookController.php` to include your signature field name

### Agreement status not updating
- Check Laravel logs for errors
- Verify the webhook is being called (check JotForm webhook logs)
- Ensure the client record exists and email matches
- **Important**: Agreement will only be marked as "signed" if a signature is detected

## Security Considerations

- The webhook endpoint is public but should be protected by:
  - Rate limiting (configured in Laravel)
  - IP whitelisting (optional - add JotForm IPs to allowed list)
  - Request validation (implemented in the controller)
  - Logging all webhook activity

## Manual Updates

If the webhook fails or you need to manually update an agreement:

1. **Via Dashboard**:
   - Go to client details page
   - Use the "Send Agreement" or "Resend Agreement" button
   - Manually update emergency contact if needed

2. **Via API**:
   ```bash
   PUT /api/clients/{uuid}
   {
     "agreement_status": "signed",
     "agreement_signed_at": "2024-01-15 10:30:00",
     "emergency_contact_name": "John Doe",
     "emergency_contact_phone": "+44 123 456 7890",
     "emergency_contact_relationship": "Partner"
   }
   ```

## Next Steps

1. Configure your JotForm with the required fields
2. Set up the webhook in JotForm
3. Test with a real client submission
4. Monitor logs for the first few submissions
5. Update field names in the controller if needed to match your JotForm


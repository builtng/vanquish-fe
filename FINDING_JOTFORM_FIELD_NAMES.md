# Finding JotForm Field Names for Webhook Integration

When setting up the JotForm webhook, you need to know the exact field names that JotForm uses. Here's how to find them:

## Method 1: Check Webhook Test Data

1. **Submit a test form** with sample data (including a signature upload)
2. **Check your webhook endpoint logs** - The webhook controller logs all incoming data
3. Look in `backend/storage/logs/laravel.log` for entries like:
   ```
   JotForm Agreement Webhook Received
   payload: { ... all field names and values ... }
   ```
4. The field names will be visible in the payload

## Method 2: Use JotForm's Webhook Test Feature

1. Go to your JotForm → Settings → Integrations → Webhooks
2. Click on your webhook
3. Use the "Test Webhook" feature
4. Check the test payload - it will show all field names

## Method 3: Check JotForm Field IDs

JotForm uses question numbers (q1, q2, q3, etc.) for field names. To find your signature field:

1. **Edit your form** in JotForm
2. **Click on the signature/file upload field**
3. Look at the URL or field properties - it will show something like "Question 8" or "q8"
4. The field name will be `q8_signature` or `q8_signature_upload` (depending on field type)

## Common JotForm Field Name Patterns

- **Email fields**: `q3_email`, `q4_email`, `email`
- **File uploads**: `q8_signature`, `q9_signature_upload`, `signature`
- **Text fields**: `q5_emergencyContactName`, `emergency_contact_name`

## Updating the Webhook Controller

If your signature field has a different name, update the `extractSignatureField()` method in:
`backend/app/Http/Controllers/Api/JotFormWebhookController.php`

Add your field name to the `$possibleFieldNames` array:

```php
$possibleFieldNames = [
    'signature',
    'your_custom_field_name',  // Add your field name here
    'q8_signature',
    // ... etc
];
```

## Testing Signature Detection

After updating, test by:

1. Submitting a form with a signature
2. Check logs for:
   - ✅ "Successfully processed with signature" = Good!
   - ⚠️ "No signature found in submission" = Field name doesn't match

3. If signature not detected, check the log entry:
   ```
   'available_fields' => array_keys($data)
   ```
   This shows all field names JotForm sent - find your signature field name here!

## Quick Debug Checklist

- [ ] Signature field is a **File Upload** field (not text/textarea)
- [ ] Signature field is **required** in JotForm
- [ ] Test submission includes an actual file upload (not empty)
- [ ] Field name matches one in `extractSignatureField()` method
- [ ] Check Laravel logs for "available_fields" to see what JotForm sends


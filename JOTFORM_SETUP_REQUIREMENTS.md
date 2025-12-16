# JotForm Setup Requirements

This document outlines exactly what fields need to be added to your JotForm (ID: 231635798225060) to ensure proper integration with the Vanquish Therapies system.

## Current Form Status

✅ **Already Present:**
- Full Name field
- Emergency Contact Name field
- Relationship To You field
- Contact Number (For the Emergency Contact Person) field
- Your Signature field (signature pad)
- Date of signing field

❌ **Missing (Required for Reliable Integration):**
- Client Email field
- Client ID/UUID field (optional but recommended)

---

## Required Fields to Add

### 1. Client Email Field (REQUIRED)

**Why:** This is the primary method used to match form submissions to client records in the system. Without it, the system will try to match by name (less reliable).

**How to Add:**
1. Go to your JotForm editor
2. Add a **Single Line Text** field
3. Set the field label to: `Client Email` or `Email`
4. Make it **Required**
5. Set field name to: `email` or `client_email` (in field settings/advanced)
6. Add validation: Email format

**Field Configuration:**
- **Label**: "Client Email" or "Email Address"
- **Field Name**: `email` (preferred) or `client_email`
- **Type**: Single Line Text
- **Required**: Yes
- **Validation**: Email format
- **Position**: Add near the top, after "Full Name" field

**What the System Looks For:**
- `email`
- `client_email`
- `clientEmail`
- `Email`
- `Client Email`
- `q3_email` (if it's question 3)
- `q4_email` (if it's question 4)

---

### 2. Client ID/UUID Field (OPTIONAL but Recommended)

**Why:** Provides a secondary matching method if email doesn't match. Useful for testing and edge cases.

**How to Add:**
1. Add a **Single Line Text** field
2. Set the field label to: `Client ID` (or make it hidden)
3. Set field name to: `client_id` or `uuid`
4. **Optional**: Make it a hidden field that gets populated via URL parameter
5. Add help text: "This will be provided to you when the agreement is sent"

**Field Configuration:**
- **Label**: "Client ID" (or hide it)
- **Field Name**: `client_id` or `uuid`
- **Type**: Single Line Text or Hidden Field
- **Required**: No
- **Position**: Can be hidden or placed at the top

**Advanced Option - Pre-fill via URL:**
If you want to pre-fill the Client ID when sending the agreement link:
- Use JotForm's URL parameter feature
- Format: `https://form.jotform.com/231635798225060?client_id=CL001`
- The field will auto-populate

---

## Field Name Reference

### Current Fields (Already in Form)

| Display Label | Recommended Field Name | What System Looks For |
|--------------|------------------------|----------------------|
| Full Name | `full_name` or `name` | `Full Name`, `Full Name*`, `full_name`, `name` |
| Emergency Contact Name | `emergency_contact_name` | `Emergency Contact Name`, `emergency_contact_name`, `q5_emergencyContactName` |
| Relationship To You | `emergency_contact_relationship` | `Relationship To You`, `emergency_contact_relationship`, `q7_emergencyContactRelationship` |
| Contact Number (For Emergency Contact) | `emergency_contact_phone` | `Contact Number (For the Emergency Contact Person)`, `emergency_contact_phone`, `q6_emergencyContactPhone` |
| Your Signature | `signature` | `Your Signature`, `signature`, any field containing "signature" |
| Date of signing | `signature_date` | `Date of signing`, `signature_date` |

### New Fields to Add

| Display Label | Field Name | Type | Required | Position |
|--------------|------------|------|----------|----------|
| Client Email | `email` | Single Line Text | Yes | After "Full Name" |
| Client ID | `client_id` | Single Line Text (or Hidden) | No | Top or Hidden |

---

## Step-by-Step Setup Instructions

### Step 1: Add Email Field

1. **Open JotForm Editor**
   - Go to https://www.jotform.com/form-builder/231635798225060
   - Click "Edit Form"

2. **Add Email Field**
   - Click "+ Add Form Element"
   - Select "Single Line Text"
   - Drag it to position after "Full Name" field

3. **Configure Email Field**
   - Click on the field to edit
   - **Label**: Enter "Client Email" or "Email Address"
   - **Field Name**: Click "Advanced" → Set to `email`
   - **Required**: Check the box
   - **Validation**: Select "Email"
   - **Help Text** (optional): "Please enter the email address associated with your account"

4. **Save Changes**

### Step 2: Add Client ID Field (Optional)

1. **Add Hidden Field**
   - Click "+ Add Form Element"
   - Select "Hidden Field" or "Single Line Text"

2. **Configure Client ID Field**
   - **Label**: "Client ID" (or leave blank if hidden)
   - **Field Name**: Set to `client_id`
   - **Required**: No
   - **Visibility**: Can be hidden or shown with help text

3. **Save Changes**

### Step 3: Verify Field Names

1. **Check Field Names**
   - Click on each field
   - Go to "Advanced" or "Settings"
   - Verify field names match the recommendations above

2. **Test Form**
   - Use JotForm's "Preview" feature
   - Submit a test form
   - Check webhook logs to verify field names

---

## Testing Your Setup

### Test Submission Process

1. **Create a Test Client** in your system with:
   - Email: `test@example.com`
   - Name: `Test Client`

2. **Submit Test Form** with:
   - Email: `test@example.com` (must match client email)
   - Full Name: `Test Client` (backup matching)
   - Emergency Contact: Fill in all fields
   - Signature: Draw a signature
   - Date: Today's date

3. **Check Webhook Logs**
   - Go to `backend/storage/logs/laravel.log`
   - Look for: "JotForm Agreement Webhook Received"
   - Verify:
     - ✅ Client found
     - ✅ Signature detected
     - ✅ Emergency contact captured
     - ✅ Agreement marked as signed

4. **Check Dashboard**
   - Go to client details page
   - Verify:
     - Agreement status = "Signed"
     - Emergency contact displayed
     - Signature verified message shown

---

## Troubleshooting Field Names

### How to Find Actual Field Names

JotForm uses question numbers (q1, q2, q3, etc.) for field names. To find your exact field names:

1. **Method 1: Check Webhook Logs**
   - Submit a test form
   - Check `backend/storage/logs/laravel.log`
   - Look for `'available_fields' => [...]` in the log
   - This shows all field names JotForm sent

2. **Method 2: Use JotForm API**
   - Go to JotForm → Settings → API
   - Use: `GET /form/{formID}/questions`
   - This returns all fields with their names

3. **Method 3: Check Field Settings**
   - Edit each field in JotForm
   - Go to "Advanced" tab
   - Field name is shown there

### Updating Webhook Handler

If your field names don't match, update `backend/app/Http/Controllers/Api/JotFormWebhookController.php`:

1. **Find the field extraction code** (around line 36-85)
2. **Add your field names** to the array of possible names
3. **Test again**

Example:
```php
// If your email field is named "q3_emailAddress", add it:
if (isset($data['email']) || isset($data['q3_email']) || isset($data['q3_emailAddress'])) {
    $clientEmail = $data['email'] ?? $data['q3_email'] ?? $data['q3_emailAddress'];
    // ...
}
```

---

## Field Mapping Summary

### What Gets Captured

| Data | Field Name | Stored In Database | Displayed In Dashboard |
|------|------------|-------------------|------------------------|
| Client Email | `email` | Used for matching | N/A |
| Client ID | `client_id` | Used for matching | N/A |
| Full Name | `Full Name` | Used for matching | Client name |
| Emergency Contact Name | `Emergency Contact Name` | `emergency_contact_name` | ✅ Prominent red alert box |
| Emergency Contact Phone | `Contact Number...` | `emergency_contact_phone` | ✅ Clickable phone link |
| Emergency Contact Relationship | `Relationship To You` | `emergency_contact_relationship` | ✅ Next to name |
| Signature | `Your Signature` | `agreement_signature_url` | ✅ "View Signature" link |
| Signature Date | `Date of signing` | `agreement_signed_at` | ✅ Signed date/time |
| Submission ID | Auto | `agreement_jotform_id` | Used for reference |

---

## Quick Checklist

Before going live, verify:

- [ ] Email field added and named `email`
- [ ] Email field is required
- [ ] Email field has email validation
- [ ] Client ID field added (optional but recommended)
- [ ] All emergency contact fields present
- [ ] Signature field is a signature pad (not file upload)
- [ ] Test submission completed successfully
- [ ] Webhook logs show client found
- [ ] Webhook logs show signature detected
- [ ] Dashboard shows agreement as signed
- [ ] Emergency contact displays correctly

---

## Sending Agreement Links

### Option 1: Include Email in Link (Recommended)

When sending agreement emails, you can pre-fill the email field:

```
https://form.jotform.com/231635798225060?email=client@example.com
```

This ensures the email matches exactly.

### Option 2: Include Client ID in Link

```
https://form.jotform.com/231635798225060?client_id=CL001&email=client@example.com
```

### Option 3: Standard Link

Just send the form link - client enters their email manually (less reliable matching).

---

## Support

If you encounter issues:

1. **Check Logs**: `backend/storage/logs/laravel.log`
2. **Verify Field Names**: Use test submission to see what JotForm sends
3. **Update Controller**: Add your field names to the extraction logic
4. **Test Again**: Submit another test form

The webhook handler is designed to be flexible and will log all available fields if matching fails, making it easy to identify and fix field name mismatches.


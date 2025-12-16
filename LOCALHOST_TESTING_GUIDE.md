# Localhost Testing Guide - JotForm Intake Form Integration

## ✅ Servers Running

- **Backend**: http://localhost:8000
- **Frontend**: http://localhost:3000

## 🧪 Testing the Complete Workflow

### Step 1: Test Client Intake Form Submission

1. **Open the client intake form**:
   ```
   http://localhost:3000/client
   ```

2. **Fill out the form** with test data:
   - First Name: Test
   - Last Name: User
   - Email: test.user@example.com
   - Phone: +447700900000
   - Age: 25
   - Gender: Male
   - Complete all required fields

3. **Submit the form** - You should be redirected to JotForm with prefilled data

### Step 2: Verify JotForm Redirect

After form submission, check the browser URL. It should look like:
```
https://form.jotform.com/231631669909062?email=test.user%40example.com&client_uuid=...&q1=Test&first_name=Test&q2=User&last_name=User&...
```

**Verify**:
- ✅ Email is prefilled
- ✅ Client UUID is included
- ✅ First name, last name, and other fields are prefilled
- ✅ URL is properly encoded

### Step 3: Test Webhook Endpoint (Local)

Since JotForm can't reach localhost directly, you have two options:

#### Option A: Use ngrok (Recommended for Real Testing)

1. **Install ngrok**:
   ```bash
   # macOS
   brew install ngrok
   
   # Or download from https://ngrok.com/
   ```

2. **Start ngrok tunnel**:
   ```bash
   ngrok http 8000
   ```

3. **Copy the ngrok URL** (e.g., `https://abc123.ngrok.io`)

4. **Configure JotForm webhook**:
   - Go to JotForm form settings
   - Add webhook: `https://abc123.ngrok.io/api/jotform/intake-webhook`
   - Set trigger: On Form Submit

5. **Test**: Submit the JotForm and check backend logs

#### Option B: Test Webhook Manually

Use curl to simulate a JotForm webhook:

```bash
curl -X POST http://localhost:8000/api/jotform/intake-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "submissionID": "test_123",
    "email": "test.user@example.com",
    "client_uuid": "YOUR_CLIENT_UUID_HERE",
    "q6": "Answer to question 6",
    "q9": "Answer to question 9",
    "q16": "Answer to question 16",
    "q22": "Answer to question 22",
    "q24": "Answer to question 24",
    "q34": "Answer to question 34"
  }'
```

**Note**: Replace `YOUR_CLIENT_UUID_HERE` with the actual UUID from the client intake form submission.

### Step 4: Verify Database Updates

After webhook is processed, check the database:

```bash
cd backend
php artisan tinker
```

Then in tinker:
```php
$client = App\Models\Client::where('email', 'test.user@example.com')->first();
$client->jotform_intake_data;
$client->jotform_intake_submission_id;
$client->jotform_intake_completed_at;
```

### Step 5: Test Redirect Page

1. **Open redirect page**:
   ```
   http://localhost:3000/jotform-redirect
   ```

2. **Verify**:
   - ✅ Page loads correctly
   - ✅ Shows "Form Submitted Successfully!"
   - ✅ Countdown timer works (5 seconds)
   - ✅ Copyright information is displayed
   - ✅ Redirects to booking system after countdown

## 🔍 Debugging

### Check Backend Logs

```bash
tail -f backend/storage/logs/laravel.log
```

Look for:
- `JotForm Intake Webhook Received` - Webhook received
- `JotForm Intake: Successfully processed` - Processing successful
- `JotForm Intake: Client not found` - Client lookup failed

### Check Frontend Console

Open browser DevTools (F12) and check:
- Network tab for API calls
- Console for any JavaScript errors
- Verify redirect URL is generated correctly

### Common Issues

1. **Client not found in webhook**:
   - Verify email matches exactly (case-sensitive)
   - Check client UUID is correct
   - Verify client was created in database

2. **Prefilled data not showing in JotForm**:
   - JotForm fields must have "Allow Pre-fill" enabled
   - Field names must match URL parameters
   - Check JotForm form settings

3. **Webhook not receiving data**:
   - Verify ngrok is running (if using)
   - Check webhook URL is correct
   - Verify JotForm webhook is enabled

## 📋 Test Checklist

- [ ] Backend server running on localhost:8000
- [ ] Frontend server running on localhost:3000
- [ ] Client intake form accessible at /client
- [ ] Form submission redirects to JotForm
- [ ] JotForm URL contains prefilled data
- [ ] Webhook endpoint accessible
- [ ] Webhook processes data correctly
- [ ] Client record updated in database
- [ ] Redirect page accessible at /jotform-redirect
- [ ] Redirect page shows copyright info
- [ ] Redirect page redirects to booking system

## 🚀 Quick Test Commands

```bash
# Run integration test
./test_localhost_integration.sh

# Check backend logs
tail -f backend/storage/logs/laravel.log

# Test webhook manually (replace UUID)
curl -X POST http://localhost:8000/api/jotform/intake-webhook \
  -H "Content-Type: application/json" \
  -d '{"submissionID":"test","email":"test@example.com","client_uuid":"UUID_HERE","q6":"test"}'

# Check database
cd backend && php artisan tinker
```

## 📝 Notes

- For production testing, use ngrok or similar service to expose localhost
- JotForm webhook requires a publicly accessible URL
- All prefilled fields must have "Allow Pre-fill" enabled in JotForm
- Field names in JotForm must match URL parameters (q1, q2, etc. or field names)


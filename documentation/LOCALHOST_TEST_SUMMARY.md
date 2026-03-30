# ✅ Localhost Testing - Ready!

## 🎯 Current Status

Both servers are running and ready for testing:

- ✅ **Backend**: http://localhost:8000
- ✅ **Frontend**: http://localhost:3000

## 🧪 Quick Test Steps

### 1. Test Client Intake Form
Open in browser: **http://localhost:3000/client**

Fill out and submit the form. You should be redirected to JotForm with prefilled data.

### 2. Test Redirect Page
Open in browser: **http://localhost:3000/jotform-redirect**

Verify it shows copyright info and redirects to booking system.

### 3. Test Webhook Endpoint
Use the manual test script:
```bash
./test_webhook_manual.sh <client_email> <client_uuid>
```

Or use curl directly:
```bash
curl -X POST http://localhost:8000/api/jotform/intake-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "submissionID": "test_123",
    "email": "test@example.com",
    "client_uuid": "YOUR_UUID",
    "q6": "Test Q6",
    "q9": "Test Q9",
    "q16": "Test Q16",
    "q22": "Test Q22",
    "q24": "Test Q24",
    "q34": "Test Q34"
  }'
```

## 📋 Available Test Scripts

1. **`test_localhost_integration.sh`** - Full integration test
   ```bash
   ./test_localhost_integration.sh
   ```

2. **`test_webhook_manual.sh`** - Manual webhook test
   ```bash
   ./test_webhook_manual.sh <email> <uuid>
   ```

## 🔗 Test URLs

| Component | URL |
|-----------|-----|
| Client Intake Form | http://localhost:3000/client |
| Redirect Page | http://localhost:3000/jotform-redirect |
| Webhook Endpoint | http://localhost:8000/api/jotform/intake-webhook |
| Client Intake API | http://localhost:8000/api/client-intake |

## 📝 Testing with Real JotForm

To test with the actual JotForm (requires public URL):

1. **Install ngrok**:
   ```bash
   brew install ngrok  # macOS
   ```

2. **Start ngrok tunnel**:
   ```bash
   ngrok http 8000
   ```

3. **Copy the ngrok URL** (e.g., `https://abc123.ngrok.io`)

4. **Configure JotForm**:
   - Webhook URL: `https://abc123.ngrok.io/api/jotform/intake-webhook`
   - Redirect URL: `https://abc123.ngrok.io/jotform-redirect`

5. **Test**: Submit form → Complete JotForm → Verify webhook → Check redirect

## 🔍 Monitoring

### Backend Logs
```bash
tail -f backend/storage/logs/laravel.log
```

Look for:
- `JotForm Intake Webhook Received`
- `JotForm Intake: Successfully processed`
- `JotForm Intake: Client not found`

### Frontend Console
Open browser DevTools (F12) → Console tab

## ✅ Verified Working

- ✅ Backend server running
- ✅ Frontend server running
- ✅ Webhook endpoint accessible
- ✅ Client intake form accessible
- ✅ Redirect page accessible
- ✅ Routes registered correctly

## 🚀 Ready to Test!

Everything is set up and ready. Follow the steps above to test the complete workflow.

For detailed instructions, see: `LOCALHOST_TESTING_GUIDE.md`


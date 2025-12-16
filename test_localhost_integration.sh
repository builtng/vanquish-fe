#!/bin/bash

# Test script for JotForm Intake Form Integration on Localhost
# This tests the complete workflow locally

echo "=== JotForm Intake Form Integration - Localhost Test ==="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backend is running
echo "1. Checking backend server..."
if curl -s http://localhost:8000/api/services/ish-capacity > /dev/null; then
    echo -e "${GREEN}✅ Backend server is running on http://localhost:8000${NC}"
else
    echo -e "${RED}❌ Backend server is not running. Please start it with: cd backend && php artisan serve${NC}"
    exit 1
fi

# Check if frontend is running
echo ""
echo "2. Checking frontend server..."
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ Frontend server is running on http://localhost:3000${NC}"
else
    echo -e "${RED}❌ Frontend server is not running. Please start it with: npm run dev${NC}"
    exit 1
fi

# Test webhook endpoint
echo ""
echo "3. Testing webhook endpoint..."
WEBHOOK_RESPONSE=$(curl -s -X POST http://localhost:8000/api/jotform/intake-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "submissionID": "test_localhost_123",
    "email": "test@example.com",
    "client_uuid": "test-uuid-123",
    "q6": "Test Q6",
    "q9": "Test Q9",
    "q16": "Test Q16",
    "q22": "Test Q22",
    "q24": "Test Q24",
    "q34": "Test Q34"
  }')

if echo "$WEBHOOK_RESPONSE" | grep -q "Client not found\|Intake form processed successfully"; then
    echo -e "${GREEN}✅ Webhook endpoint is accessible${NC}"
    echo "Response: $WEBHOOK_RESPONSE"
else
    echo -e "${RED}❌ Webhook endpoint test failed${NC}"
    echo "Response: $WEBHOOK_RESPONSE"
fi

# Test client intake form endpoint
echo ""
echo "4. Testing client intake form endpoint..."
INTAKE_RESPONSE=$(curl -s -X POST http://localhost:8000/api/client-intake \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "User",
    "email": "testuser'$(date +%s)'@example.com",
    "phone": "+447700900000",
    "age": 25,
    "gender": "Male",
    "terms_accepted": true,
    "create_client": true
  }')

if echo "$INTAKE_RESPONSE" | grep -q "client_uuid\|Intake form submitted successfully"; then
    echo -e "${GREEN}✅ Client intake form endpoint works${NC}"
    CLIENT_UUID=$(echo "$INTAKE_RESPONSE" | grep -o '"client_uuid":"[^"]*"' | cut -d'"' -f4)
    if [ ! -z "$CLIENT_UUID" ]; then
        echo -e "${GREEN}✅ Client UUID returned: $CLIENT_UUID${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Intake form response: $INTAKE_RESPONSE${NC}"
fi

# Test redirect page
echo ""
echo "5. Testing redirect page..."
REDIRECT_RESPONSE=$(curl -s http://localhost:3000/jotform-redirect | grep -o "Form Submitted Successfully" | head -1)
if [ ! -z "$REDIRECT_RESPONSE" ]; then
    echo -e "${GREEN}✅ Redirect page is accessible${NC}"
else
    echo -e "${YELLOW}⚠️  Redirect page might not be accessible or content changed${NC}"
fi

# Test client form page
echo ""
echo "6. Testing client intake form page..."
CLIENT_PAGE_RESPONSE=$(curl -s http://localhost:3000/client | grep -o "Vanquish Therapies\|Book Your Consultation" | head -1)
if [ ! -z "$CLIENT_PAGE_RESPONSE" ]; then
    echo -e "${GREEN}✅ Client intake form page is accessible${NC}"
else
    echo -e "${YELLOW}⚠️  Client form page might not be accessible${NC}"
fi

echo ""
echo "=== Test Summary ==="
echo ""
echo "Backend API: http://localhost:8000/api"
echo "Frontend: http://localhost:3000"
echo ""
echo "Test URLs:"
echo "  - Client Intake Form: http://localhost:3000/client"
echo "  - Redirect Page: http://localhost:3000/jotform-redirect"
echo "  - Webhook Endpoint: http://localhost:8000/api/jotform/intake-webhook"
echo ""
echo -e "${YELLOW}Note: For JotForm webhook testing, you'll need to use a service like ngrok${NC}"
echo "  to expose localhost:8000 to the internet so JotForm can send webhooks."
echo ""
echo "To test with ngrok:"
echo "  1. Install ngrok: https://ngrok.com/"
echo "  2. Run: ngrok http 8000"
echo "  3. Use the ngrok URL in JotForm webhook settings"
echo ""


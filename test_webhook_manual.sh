#!/bin/bash

# Manual webhook test script
# Usage: ./test_webhook_manual.sh <client_email> <client_uuid>

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: $0 <client_email> <client_uuid>"
    echo ""
    echo "Example:"
    echo "  $0 test@example.com 123e4567-e89b-12d3-a456-426614174000"
    exit 1
fi

CLIENT_EMAIL=$1
CLIENT_UUID=$2

echo "Testing JotForm Intake Webhook..."
echo "Client Email: $CLIENT_EMAIL"
echo "Client UUID: $CLIENT_UUID"
echo ""

curl -X POST http://localhost:8000/api/jotform/intake-webhook \
  -H "Content-Type: application/json" \
  -d "{
    \"submissionID\": \"test_manual_$(date +%s)\",
    \"email\": \"$CLIENT_EMAIL\",
    \"client_uuid\": \"$CLIENT_UUID\",
    \"q6\": \"Test answer for question 6\",
    \"q9\": \"Test answer for question 9\",
    \"q16\": \"Test answer for question 16\",
    \"q22\": \"Test answer for question 22\",
    \"q24\": \"Test answer for question 24\",
    \"q34\": \"Test answer for question 34\",
    \"q1\": \"Test\",
    \"q2\": \"User\",
    \"q3\": \"$CLIENT_EMAIL\"
  }" | jq '.'

echo ""
echo "Check backend logs for details: tail -f backend/storage/logs/laravel.log"


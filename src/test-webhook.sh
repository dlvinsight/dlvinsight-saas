#!/bin/bash

# Test webhook locally
# This simulates a user.created event from Clerk

WEBHOOK_URL="http://localhost:3000/api/webhooks/clerk"
TIMESTAMP=$(date +%s)
WEBHOOK_ID="test_$(date +%s)"

# Sample payload (adjust the user data as needed)
PAYLOAD=$(cat <<EOF
{
  "data": {
    "id": "user_test_${TIMESTAMP}",
    "email_addresses": [{
      "email_address": "test${TIMESTAMP}@example.com"
    }],
    "first_name": "Test",
    "last_name": "User",
    "image_url": null,
    "created_at": $(date +%s)000,
    "updated_at": $(date +%s)000
  },
  "type": "user.created"
}
EOF
)

# For local testing without signature verification
echo "Sending test webhook to: $WEBHOOK_URL"
echo "Payload: $PAYLOAD"

curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "svix-id: $WEBHOOK_ID" \
  -H "svix-timestamp: $TIMESTAMP" \
  -H "svix-signature: test-signature" \
  -d "$PAYLOAD"

echo -e "\n\nCheck your database:"
echo "psql -c \"SELECT * FROM users WHERE email LIKE 'test%@example.com' ORDER BY created_at DESC LIMIT 1;\""
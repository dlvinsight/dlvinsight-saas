#!/bin/bash

echo "🚀 Running SP-API test with official SDK..."
echo ""

# Run with environment variables
npx dotenv -e .env.local -- tsx test-sp-api-sdk.ts

echo ""
echo "Test complete!"
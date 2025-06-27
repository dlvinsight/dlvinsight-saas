#!/bin/bash

# Run detailed SP-API test with full output
echo "🚀 Running detailed SP-API connection test..."
echo "This will show all Amazon API responses"
echo ""

# Run the TypeScript file directly with tsx
npx tsx test-sp-api-detailed.ts

echo ""
echo "Test complete!"
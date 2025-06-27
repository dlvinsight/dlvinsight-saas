#!/bin/bash

# Run SP-API catalog search test
echo "🔍 Running SP-API Catalog Search Test..."
echo "Searching for: samsung tv"
echo ""

# Run with environment variables
npx dotenv -e .env.local -- tsx test-sp-api-search.ts

echo ""
echo "Search test complete!"
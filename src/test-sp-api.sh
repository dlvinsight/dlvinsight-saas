#!/bin/bash

# Simple script to run SP-API connection test
# This runs the test in isolation without affecting the build

echo "Running SP-API connection test..."
echo "Using .env.local for credentials"
echo ""

# Run the specific test file
npx vitest run tests/sp-api-connection.test.ts --reporter=verbose --no-coverage

echo ""
echo "Test complete!"
#!/bin/bash

# Deploy script for Cloud Run without Docker build issues

echo "Deploying to Cloud Run..."

# Set your variables here
CLERK_PUBLISHABLE_KEY="pk_test_YWR2YW5jZWQtYWxpZW4tNzcuY2xlcmsuYWNjb3VudHMuZGV2JA"
CLERK_SECRET_KEY="sk_test_Oec619eBd5nZeXV2uSx0UUbiUjhd7B5fwYe7GdlJca"
DATABASE_URL="postgresql://postgres:yvYWVYXsrUTZyuKZn21khcKYG+8tkA18+mGCkFYuL2I=@/dlvinsight_prod?host=/cloudsql/dlvinsight-profit-analytics:europe-central2:dlvinsight-db"

# Deploy using gcloud run deploy with source
gcloud run deploy dlvinsight-saas \
  --source src \
  --region europe-central2 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production" \
  --set-env-vars="NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$CLERK_PUBLISHABLE_KEY" \
  --set-env-vars="CLERK_SECRET_KEY=$CLERK_SECRET_KEY" \
  --set-env-vars="NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in" \
  --set-env-vars="NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up" \
  --set-env-vars="DATABASE_URL=$DATABASE_URL" \
  --set-env-vars="BILLING_PLAN_ENV=prod" \
  --set-env-vars="NEXT_PUBLIC_APP_NAME=DLV Insight" \
  --set-env-vars="NEXT_PUBLIC_APP_DESCRIPTION=Amazon Seller Profit Analytics Platform" \
  --add-cloudsql-instances=dlvinsight-profit-analytics:europe-central2:dlvinsight-db
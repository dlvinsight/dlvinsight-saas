# SaaS Boilerplate Setup Plan for DLV Insight

This document provides a comprehensive plan for configuring and running the ixartz/SaaS-Boilerplate for the DLV Insight Profit Analytics platform.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Authentication Configuration (Clerk)](#authentication-configuration-clerk)
4. [Database Setup](#database-setup)
5. [Environment Configuration](#environment-configuration)
6. [Customization for DLV Insight](#customization-for-dlv-insight)
7. [Airbyte Integration Planning](#airbyte-integration-planning)
8. [Development Workflow](#development-workflow)
9. [Testing Strategy](#testing-strategy)
10. [Deployment Planning](#deployment-planning)

## Prerequisites

### System Requirements
- Node.js 20+ and npm
- Git
- PostgreSQL (local or cloud instance)
- Stripe CLI (for payment integration)
- Docker (for Airbyte)

### Required Accounts
- [ ] GitHub account
- [ ] Clerk account (authentication)
- [ ] PostgreSQL database (local or cloud)
- [ ] Stripe account (payments)
- [ ] Sentry account (error monitoring)
- [ ] Better Stack account (logging)
- [ ] Checkly account (monitoring)
- [ ] Crowdin account (i18n)
- [ ] Airbyte Cloud or self-hosted setup

## Initial Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone --depth=1 https://github.com/ixartz/SaaS-Boilerplate.git dlvinsight-saas
cd dlvinsight-saas

# Remove existing git history
rm -rf .git

# Initialize new git repository
git init
git add .
git commit -m "Initial commit: SaaS boilerplate foundation"

# Install dependencies
npm install

# Verify installation
npm run dev
# Open http://localhost:3000
```

### 2. Project Structure Overview

```
dlvinsight-saas/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # Reusable UI components
│   ├── features/         # Feature-specific components
│   ├── libs/            # Third-party library configs
│   ├── models/          # Database models (Drizzle ORM)
│   ├── templates/       # Page templates
│   ├── types/           # TypeScript types
│   └── utils/           # Utility functions
├── public/              # Static assets
├── migrations/          # Database migrations
├── tests/              # Test files
└── .env.example        # Environment variables template
```

## Authentication Configuration (Clerk)

### 1. Create Clerk Application

1. Sign up at [clerk.com](https://clerk.com)
2. Create new application named "DLV Insight"
3. Enable the following features:
   - Email/Password authentication
   - Social logins (Google, optional)
   - Organizations (for multi-tenancy)
   - User metadata

### 2. Configure Clerk Settings

```bash
# Copy environment template
cp .env.example .env.local

# Add Clerk keys to .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
```

### 3. Enable Organizations

1. In Clerk Dashboard → Organization Management → Settings
2. Enable Organizations
3. Configure organization roles:
   - `admin`: Full access to organization
   - `member`: Basic access
   - `viewer`: Read-only access

### 4. Customize Authentication Pages

Update authentication URLs in Clerk Dashboard:
- Sign-in URL: `/sign-in`
- Sign-up URL: `/sign-up`
- After sign-in URL: `/dashboard`
- After sign-up URL: `/onboarding/organization-selection`

## Database Setup

### 1. PostgreSQL Installation

#### Option A: Local PostgreSQL
```bash
# macOS
brew install postgresql
brew services start postgresql

# Create database
createdb dlvinsight_dev
```

#### Option B: Cloud PostgreSQL (Recommended)
- Supabase (free tier available)
- Neon
- Railway
- AWS RDS

### 2. Configure Database Connection

```bash
# .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/dlvinsight_dev"
```

### 3. Initialize Database Schema

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Open Drizzle Studio to view database
npm run db:studio
```

### 4. Customize Schema for DLV Insight

Create new schema file: `src/models/DLVSchema.ts`

```typescript
import { pgTable, text, timestamp, uuid, decimal, integer, jsonb } from 'drizzle-orm/pg-core';

// Amazon Seller Account
export const sellerAccounts = pgTable('seller_accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: text('organization_id').notNull(),
  accountName: text('account_name').notNull(),
  marketplaceId: text('marketplace_id').notNull(),
  sellerId: text('seller_id').notNull(),
  refreshToken: text('refresh_token'), // For SP-API
  isActive: integer('is_active').default(1),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Products
export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: text('organization_id').notNull(),
  sellerAccountId: uuid('seller_account_id').references(() => sellerAccounts.id),
  asin: text('asin').notNull(),
  sku: text('sku').notNull(),
  title: text('title'),
  imageUrl: text('image_url'),
  category: text('category'),
  createdAt: timestamp('created_at').defaultNow()
});

// Sales Data (from Airbyte sync)
export const salesData = pgTable('sales_data', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: text('organization_id').notNull(),
  sellerAccountId: uuid('seller_account_id').references(() => sellerAccounts.id),
  orderId: text('order_id').notNull(),
  orderDate: timestamp('order_date').notNull(),
  asin: text('asin'),
  sku: text('sku'),
  quantity: integer('quantity'),
  revenue: decimal('revenue', { precision: 10, scale: 2 }),
  costs: jsonb('costs'), // FBA fees, shipping, etc.
  profit: decimal('profit', { precision: 10, scale: 2 }),
  marketplace: text('marketplace'),
  syncedAt: timestamp('synced_at').defaultNow()
});
```

## Environment Configuration

### 1. Create Complete .env.local

```bash
# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dlvinsight_dev"

# Stripe (Payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Monitoring & Logging
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
LOGTAIL_SOURCE_TOKEN=xxxxx

# Amazon SP-API (for future direct integration)
AMAZON_SP_API_CLIENT_ID=xxxxx
AMAZON_SP_API_CLIENT_SECRET=xxxxx

# Airbyte Configuration
AIRBYTE_API_URL=http://localhost:8000
AIRBYTE_API_KEY=xxxxx
```

### 2. Update App Configuration

Edit `src/utils/AppConfig.ts`:

```typescript
export const AppConfig = {
  name: 'DLV Insight',
  description: 'Amazon Seller Profit Analytics Platform',
  locale: 'en',
  
  // Stripe price IDs
  stripePriceIds: {
    basic: 'price_xxxxx',     // $49/month
    premium: 'price_xxxxx',   // $99/month
    enterprise: 'price_xxxxx' // $299/month
  },
  
  // Feature flags
  features: {
    airbyte: true,
    forecasting: false, // Enable later
    advancedAnalytics: false
  }
};
```

## Customization for DLV Insight

### 1. Update Branding

```bash
# Replace favicon and logos
cp your-logo.png public/favicon.ico
cp your-logo.png public/apple-touch-icon.png

# Update metadata in layout files
# src/app/[locale]/layout.tsx
```

### 2. Create DLV-Specific Pages

```bash
# Dashboard pages structure
src/app/[locale]/(auth)/dashboard/
├── page.tsx                 # Main dashboard
├── analytics/
│   └── page.tsx            # Analytics view
├── products/
│   └── page.tsx            # Product management
├── accounts/
│   └── page.tsx            # Amazon account management
├── reports/
│   └── page.tsx            # Report generation
└── settings/
    ├── page.tsx            # Settings
    └── integrations/
        └── page.tsx        # Airbyte/SP-API config
```

### 3. Create Domain Components

```typescript
// src/features/amazon/components/AccountConnectionCard.tsx
export function AccountConnectionCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect Amazon Seller Account</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Amazon OAuth flow or API key input */}
      </CardContent>
    </Card>
  );
}
```

## Airbyte Integration Planning

### 1. Airbyte Setup Options

#### Option A: Airbyte Cloud
- Easier setup
- No infrastructure management
- Monthly cost based on usage

#### Option B: Self-Hosted
```bash
# Using Docker Compose
git clone https://github.com/airbytehq/airbyte.git
cd airbyte
docker-compose up

# Access at http://localhost:8000
```

### 2. Configure Amazon SP-API Connector

1. In Airbyte UI, create new source
2. Select "Amazon Seller Partner"
3. Configure:
   - Client ID & Secret
   - Refresh Token
   - Marketplace IDs
   - Report types to sync

### 3. Set Up Destination

1. Create PostgreSQL destination
2. Use same database as application
3. Configure sync schedule (e.g., every 6 hours)

### 4. Create Sync Jobs

Essential data syncs:
- Orders (for sales data)
- Inventory (for product catalog)
- Financial events (for profit calculation)
- FBA fees (for cost analysis)

## Development Workflow

### 1. Git Workflow

```bash
# Create feature branch
git checkout -b feature/amazon-integration

# Make changes and commit
npm run commit  # Uses Commitizen for conventional commits

# Push and create PR
git push -u origin feature/amazon-integration
```

### 2. Development Commands

```bash
# Start development server
npm run dev

# Run tests in watch mode
npm run test:watch

# Type checking
npm run type-check

# Linting and formatting
npm run lint
npm run format

# Database commands
npm run db:generate  # After schema changes
npm run db:migrate   # Apply migrations
npm run db:studio    # Visual database browser
```

### 3. Component Development

```bash
# Create new component
mkdir src/features/analytics/components
touch src/features/analytics/components/ProfitChart.tsx

# Add Storybook story
touch src/features/analytics/components/ProfitChart.stories.tsx
```

## Testing Strategy

### 1. Unit Tests

```typescript
// src/features/analytics/utils/profit-calculator.test.ts
import { describe, it, expect } from 'vitest';
import { calculateProfit } from './profit-calculator';

describe('calculateProfit', () => {
  it('should calculate profit correctly', () => {
    const result = calculateProfit({
      revenue: 100,
      costs: { fba: 15, shipping: 10 }
    });
    expect(result).toBe(75);
  });
});
```

### 2. Integration Tests

```typescript
// tests/integration/amazon-sync.test.ts
test('should sync Amazon data via Airbyte', async () => {
  // Test Airbyte API integration
});
```

### 3. E2E Tests

```typescript
// tests/e2e/dashboard.e2e.ts
test('user can view profit analytics', async ({ page }) => {
  await page.goto('/dashboard/analytics');
  await expect(page.getByText('Profit Overview')).toBeVisible();
});
```

## Deployment Planning

### 1. Staging Environment

```bash
# Create staging branch
git checkout -b staging

# Set up staging environment variables
# Use separate Clerk app, database, etc.
```

### 2. Production Checklist

- [ ] SSL certificates configured
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Monitoring configured (Sentry, Checkly)
- [ ] Backup strategy in place
- [ ] Rate limiting enabled
- [ ] Security headers configured

### 3. Deployment Options

#### Vercel (Recommended for Next.js)
```bash
npm i -g vercel
vercel --prod
```

#### Google Cloud App Engine
```yaml
# app.yaml
runtime: nodejs20
env: standard

env_variables:
  NODE_ENV: "production"
```

## Next Steps

1. **Week 1**: Complete initial setup and authentication
2. **Week 2**: Set up database schema and basic UI
3. **Week 3**: Integrate Airbyte and test data syncing
4. **Week 4**: Build analytics dashboard
5. **Week 5**: Add profit calculations and reporting
6. **Week 6**: Testing and deployment preparation

## Troubleshooting

### Common Issues

1. **Clerk authentication not working**
   - Verify API keys are correct
   - Check organization settings are enabled

2. **Database connection errors**
   - Verify DATABASE_URL format
   - Check PostgreSQL is running

3. **Airbyte sync failures**
   - Check SP-API credentials
   - Verify rate limits aren't exceeded

## Resources

- [SaaS Boilerplate Docs](https://github.com/ixartz/SaaS-Boilerplate)
- [Clerk Documentation](https://clerk.com/docs)
- [Airbyte Documentation](https://docs.airbyte.com)
- [Amazon SP-API Guide](https://developer-docs.amazon.com/sp-api/)
- [Next.js Documentation](https://nextjs.org/docs)
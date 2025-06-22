# Architecture Overview

## Technology Stack

- **Framework:** Next.js 14.2.25 with App Router + React 18.3.1 + TypeScript 5.6.3
- **Authentication:** Clerk (multi-tenant with organizations)
- **Database:** PostgreSQL with Drizzle ORM + Row Level Security
- **UI:** Tailwind CSS + Shadcn/UI + Radix UI primitives
- **Payments:** Stripe (subscriptions + billing)
- **Data Integration:** Airbyte-ready schema for Amazon SP-API
- **Monitoring:** Sentry + Logtail + Pino structured logging
- **Testing:** Vitest (unit) + Playwright (E2E)

## Project Structure
```
src/
├── app/[locale]/          # Internationalized routes
│   ├── (auth)/           # Protected routes (dashboard, profiles)
│   └── (unauth)/         # Public routes (landing, pricing)
├── components/ui/         # Shadcn/UI components
├── features/             # Feature modules (auth, billing, dashboard, landing)
├── libs/                 # Core utilities (DB, Env, Logger, i18n)
├── models/Schema.ts      # Database schema (Drizzle)
└── types/                # TypeScript definitions
```

## Database Architecture
- Multi-tenant with organization-based isolation
- Amazon analytics tables: seller_accounts, sales_data, products, financial_events, inventory, report_syncs
- Row Level Security enforced via JWT organization claims
- Airbyte-compatible schema for SP-API data ingestion

## Key Development Patterns

### Authentication Flow
- All dashboard routes require Clerk authentication
- Organization selection is mandatory for multi-tenant access
- Use `auth()` from `@clerk/nextjs` for server-side auth checks
- Locale-aware sign-in/sign-up redirects

### Database Queries
```typescript
// Always filter by organizationId for multi-tenant queries
const results = await db
  .select()
  .from(schema.tableName)
  .where(eq(schema.tableName.organizationId, organizationId));
```

### Component Patterns
- Use Shadcn/UI components from `@/components/ui/*`
- Implement variants with `class-variance-authority`
- Dark mode support via `next-themes`

### Environment Variables
- Validated at runtime via `@/libs/Env.ts`
- Access with `Env.VARIABLE_NAME`
- Client variables prefixed with `NEXT_PUBLIC_`

### Testing Patterns
```typescript
// Unit tests with Vitest
describe('FeatureName', () => {
  it('should behavior description', () => {
    // Test implementation
  });
});

// E2E tests with Playwright
test('user flow description', async ({ page }) => {
  await page.goto('/path');
  // Test implementation
});
```

## Airbyte Integration Strategy

### Amazon SP-API Data Synchronization
- Database schema designed for Airbyte ETL pipelines
- Amazon analytics tables ready for Airbyte connector output
- Incremental sync support with tracking columns
- Multi-marketplace data handling

### Data Flow
1. Airbyte pulls data from Amazon SP-API
2. Data lands in PostgreSQL analytics tables
3. Application processes and displays analytics
4. Real-time profit calculations from synchronized data

## Product Features & Positioning

### Core Differentiators
1. **Plan vs. Fact P&L Analysis** - Forecast profits and compare to actual results
2. **LTV Cohort Analytics** - Customer lifetime value tracking by cohorts
3. **Strategic Planning Focus** - Proactive planning vs. reactive reporting
4. **AI-Powered Forecasting** - Predictive analytics for business planning

### Feature Roadmap

**MVP Features (Phase 1):**
- Plan vs. Fact P&L dashboard
- LTV cohort analytics
- Basic forecasting engine
- Amazon data integration via Airbyte
- Multi-tenant organization management

**Core Features (Phase 2):**
- Advanced forecasting algorithms
- Strategic planning tools
- Performance gap analysis
- Automated reporting
- Multi-marketplace support

**Advanced Features (Phase 3):**
- AI-powered recommendations
- Custom report builder
- API access for integrations
- Advanced business intelligence
- White-label options
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: DLV Insight Profit Analytics

Multi-tenant Amazon analytics platform with forecasting capabilities - currently in planning phase.

## Project Approach

**Building with Open-Source Solutions:**
- Utilizing existing SaaS-ready open-source solutions as foundation
- Integrating Airbyte for Amazon SP-API data synchronization
- Focus on rapid MVP development using proven tools
- Minimizing custom development where possible

## Common Development Commands

```bash
# Development
npm run dev              # Start development server (Next.js + Spotlight)
npm run build           # Build for production
npm run start           # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run check-types     # TypeScript type checking
npm run test            # Run unit tests
npm run test:e2e        # Run E2E tests

# Database (Drizzle ORM)
npm run db:generate     # Generate migrations after schema changes
npm run db:migrate      # Apply migrations to database
npm run db:studio       # Open Drizzle Studio (database browser)

# Database Connection (Production)
# Password stored in: /tmp/db_password.txt (not committed to git)
PGPASSWORD="$(cat /tmp/db_password.txt)" /usr/local/opt/postgresql@15/bin/psql -h 34.116.202.95 -U postgres -d dlvinsight_prod
gcloud sql connect dlvinsight-db --user=postgres --database=dlvinsight_prod

# Git & Commits
npm run commit          # Use Commitizen for conventional commits

# Storybook
npm run storybook       # Start Storybook dev server
npm run storybook:build # Build Storybook
```

## Architecture Overview

**Technology Stack:**

- **Framework:** Next.js 14.2.25 with App Router + React 18.3.1 + TypeScript 5.6.3
- **Authentication:** Clerk (multi-tenant with organizations)
- **Database:** PostgreSQL with Drizzle ORM + Row Level Security
- **UI:** Tailwind CSS + Shadcn/UI + Radix UI primitives
- **Payments:** Stripe (subscriptions + billing)
- **Data Integration:** Airbyte-ready schema for Amazon SP-API
- **Monitoring:** Sentry + Logtail + Pino structured logging
- **Testing:** Vitest (unit) + Playwright (E2E)

**Project Structure:**
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

**Database Architecture:**
- Multi-tenant with organization-based isolation
- Amazon analytics tables: seller_accounts, sales_data, products, financial_events, inventory, report_syncs
- Row Level Security enforced via JWT organization claims
- Airbyte-compatible schema for SP-API data ingestion

**Database Configuration:**

*Local Development:*
- PostgreSQL running locally
- Database: `dlvinsight_dev`
- Connection: `postgresql://admin@localhost:5432/dlvinsight_dev`
- Environment: `.env.local`

*Production (Google Cloud SQL):*
- Instance: `dlvinsight-db` (PostgreSQL 17)
- Project: `dlvinsight-profit-analytics`
- Region: `europe-central2-b`
- Database: `dlvinsight_prod`
- Public IP: `34.116.202.95`
- Password stored in: `/tmp/db_password.txt` (local development only)
- Cloud Build DATABASE_URL: `postgresql://postgres:PASSWORD@/dlvinsight_prod?host=/cloudsql/dlvinsight-profit-analytics:europe-central2:dlvinsight-db`
- Direct connection: `postgresql://postgres:PASSWORD@34.116.202.95:5432/dlvinsight_prod?sslmode=disable`

*Tables Created:*
- `organization` - Multi-tenant organization management
- `seller_accounts` - Amazon seller account credentials
- `sales_data` - Amazon sales transactions
- `products` - Product catalog
- `inventory` - Inventory levels
- `financial_events` - Amazon financial data
- `report_syncs` - Data synchronization tracking
- `todo` - Application todos

**Current Project Status:**
- ✅ SaaS boilerplate foundation established (ixartz/SaaS-Boilerplate)
- ✅ Environment configuration completed
- ✅ Database schema designed for Amazon analytics
- ✅ Development workflow configured
- ✅ Production database setup completed (Cloud SQL)
- ✅ Database migrations applied to production
- ✅ Cloud Build configuration ready
- ⏳ Airbyte integration setup pending
- ⏳ Amazon SP-API connector configuration pending
- ⏳ UI components for analytics dashboard pending

## Development Rules

**IMPORTANT Git Commit Rules:**
- NEVER mention AI, LLM, Claude, or any AI assistance in git commits - this is STRICTLY FORBIDDEN
- NEVER use phrases like "Generated with", "AI-assisted", or similar in commits
- Keep all commit messages VERY SHORT (max 50 characters for subject line)
- Commit regularly and frequently (after each meaningful change)
- Push commits to remote regularly to avoid losing work
- Use imperative mood in commit messages (e.g., "Add feature" not "Added feature")
- Focus commit messages on WHAT changed, not HOW it was created

**General Rules:**
- Only mention AI assistance in README.md if needed
- Focus tokens on actual development, not attribution

## Key Development Patterns

**Authentication Flow:**
- All dashboard routes require Clerk authentication
- Organization selection is mandatory for multi-tenant access
- Use `auth()` from `@clerk/nextjs` for server-side auth checks
- Locale-aware sign-in/sign-up redirects

**Database Queries:**
```typescript
// Always filter by organizationId for multi-tenant queries
const results = await db
  .select()
  .from(schema.tableName)
  .where(eq(schema.tableName.organizationId, organizationId));
```

**Component Patterns:**
- Use Shadcn/UI components from `@/components/ui/*`
- Implement variants with `class-variance-authority`
- Dark mode support via `next-themes`

**Environment Variables:**
- Validated at runtime via `@/libs/Env.ts`
- Access with `Env.VARIABLE_NAME`
- Client variables prefixed with `NEXT_PUBLIC_`

**Testing Patterns:**
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

**Amazon SP-API Data Synchronization:**
- Database schema designed for Airbyte ETL pipelines
- Amazon analytics tables ready for Airbyte connector output
- Incremental sync support with tracking columns
- Multi-marketplace data handling

**Airbyte Setup (Pending):**
- Use Airbyte Amazon Seller Partner connector
- Configure incremental sync for orders, products, financial events
- Set up transformation for profit/loss calculations
- Schedule regular data refreshes

**Data Flow:**
1. Airbyte pulls data from Amazon SP-API
2. Data lands in PostgreSQL analytics tables
3. Application processes and displays analytics
4. Real-time profit calculations from synchronized data

## Custom Shortcuts

--GCP -> git commit push
--WD -> audit the codebase, think hard and write a doc, a .md file in /docs, named AUDIT-\*\*\*.The doc takes the form of a step by step action checklist. you don't change anything else, just focus on the .md (and then --GCP). when finished, point to the filepath of the doc.
--AP -> turn the following audit into a step by step list of actions, an actual action plan with checkboxes. The naming format is /docs/ACTION-PLAN-**\*** (then --GCP)
--EXE execute the step by step plan from file, at each step think, check the corresponding checkboxes, and --GPC
--TERMINATOR -> --EXE + --DS
--CD -> check obsolete .md and ditch them (+ --GCP)
--DS -> don't stop till totally finished


## Documentation & Planning

**MVP Planning:**
- [MVP-QUICKSTART.md](./MVP-QUICKSTART.md) - Rapid MVP deployment using Supabase + Airbyte
- [AIRBYTE-AMAZON-SETUP.md](./AIRBYTE-AMAZON-SETUP.md) - Airbyte configuration for Amazon SP-API
- [COMPREHENSIVE-PROJECT-DOCUMENTATION.md](./COMPREHENSIVE-PROJECT-DOCUMENTATION.md) - Full project documentation

**Architecture Planning (To be created):**
- Technology stack evaluation document
- Open-source SaaS solution comparison
- Airbyte integration architecture
- MVP feature prioritization

## Planning Phase TODO

- [ ] Evaluate open-source SaaS boilerplates
- [ ] Test Airbyte Amazon SP-API connector
- [ ] Define MVP feature set
- [ ] Create technology decision document
- [ ] Design multi-tenant data architecture
- [ ] Plan authentication strategy
- [ ] Estimate development timeline
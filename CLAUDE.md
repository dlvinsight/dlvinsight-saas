# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 CRITICAL Git Commit Rules - READ FIRST

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

## Project: DLV Insight Profit Analytics

Multi-tenant Amazon analytics platform with forecasting capabilities - deployed to Google Cloud Run.

## 🚨 CRITICAL Project-Specific Information

**Production URLs:**
- Main App: https://app.dlvinsight.com (europe-west1)
- Legacy: https://dlv-saas-d-1017650028198.europe-central2.run.app

**Google Cloud Project:** `dlvinsight-profit-analytics`

**Authentication (Clerk):**
- Instance: `advanced-alien-77` (ins_2d6vISZdkrdaKmjZZ4ixbvM776d)
- ⚠️ NEVER use keys from "open-stinkbug-8" instance - they cause auth errors!
- Keys are in `.env.local` and Cloud Run environment variables

**Database (Cloud SQL):**
- Instance: `dlvinsight-db-west1` (PostgreSQL 17)
- Connection: `dlvinsight-profit-analytics:europe-west1:dlvinsight-db-west1`
- Database: `dlvinsight_prod`
- Password: Stored in `/tmp/db_password.txt` (local only, not in git)
- Public IP: `35.241.144.115`
- Cloud Run URL: `postgresql://postgres:PASSWORD@/dlvinsight_prod?host=/cloudsql/dlvinsight-profit-analytics:europe-west1:dlvinsight-db-west1`

**Payments (Stripe):**
- Test mode configured
- Keys are in `.env.local` and Cloud Run environment variables

**Cloud Run Service:**
- `dlvinsight-app` (europe-west1) - Production with custom domain app.dlvinsight.com
- Build Method: Google Cloud Buildpacks (auto-detects Node.js)
- Build Trigger: Automatic on push to main branch
- Build Time: ~10 minutes

**Domain Configuration:**
- Domain: `app.dlvinsight.com`
- DNS: CNAME → `ghs.googlehosted.com.`
- Managed by: Google Domains

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
- Instance: `dlvinsight-db-west1` (PostgreSQL 17)
- Project: `dlvinsight-profit-analytics`
- Region: `europe-west1`
- Database: `dlvinsight_prod`
- Public IP: `35.241.144.115`
- Password stored in: `/tmp/db_password.txt` (local development only)
- Cloud Build DATABASE_URL: `postgresql://postgres:PASSWORD@/dlvinsight_prod?host=/cloudsql/dlvinsight-profit-analytics:europe-west1:dlvinsight-db-west1`
- Direct connection: `postgresql://postgres:PASSWORD@35.241.144.115:5432/dlvinsight_prod?sslmode=disable`

*Tables Created:*
- `organization` - Multi-tenant organization management
- `seller_accounts` - Amazon seller account credentials
- `sales_data` - Amazon sales transactions
- `products` - Product catalog
- `inventory` - Inventory levels
- `financial_events` - Amazon financial data
- `report_syncs` - Data synchronization tracking
- `todo` - Application todos

**CI/CD Pipeline:**
- GitHub repo: `https://github.com/dlvinsight/dlvinsight-saas`
- Build trigger: Pushes to `main` branch
- Build process: Google Cloud Buildpacks (Node.js auto-detected)
- Build location: Global (multi-region)
- Deployment: Auto-deploys to Cloud Run in europe-west1
- Build time: ~10 minutes
- Image registry: `europe-west1-docker.pkg.dev/dlvinsight-profit-analytics/cloud-run-source-deploy/`
- Trigger ID: `8b6ba718-d811-48a6-9cc3-b388fa8c5e4d`
- Service Account: `1017650028198-compute@developer.gserviceaccount.com`

**Important Build Notes:**
- Source code is in `/src` directory (not root)
- Uses `project.toml` to configure buildpacks
- Environment variables are set at runtime (not build time)
- `.env` file MUST have correct Clerk keys or auth will fail

**Current Project Status:**
- ✅ SaaS boilerplate foundation established (ixartz/SaaS-Boilerplate)
- ✅ Environment configuration completed
- ✅ Database schema designed for Amazon analytics
- ✅ Development workflow configured
- ✅ Production database setup completed (Cloud SQL)
- ✅ Database migrations applied to production
- ✅ Cloud Build configuration ready
- ✅ Cloud Run deployment working (europe-west1)
- ✅ Custom domain configured (app.dlvinsight.com)
- ✅ Authentication working with Clerk
- ✅ Stripe integration configured
- ⏳ Airbyte integration setup pending
- ⏳ Amazon SP-API connector configuration pending
- ⏳ UI components for analytics dashboard pending

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

## Cloud Run Production Commands

**Check Domain Mapping Status:**
```bash
gcloud beta run domain-mappings describe --domain=app.dlvinsight.com --region=europe-west1
```

**View Service Details:**
```bash
gcloud run services describe dlvinsight-app --region=europe-west1
```

**Update Environment Variables:**
```bash
gcloud run services update dlvinsight-app --region=europe-west1 --update-env-vars="KEY=value"
```

**View Logs:**
```bash
gcloud run services logs read dlvinsight-app --region=europe-west1 --limit=50
```

**Deploy New Version (europe-west1):**
```bash
# Get latest image from europe-central2 build
IMAGE=$(gcloud run services describe dlv-saas-d --region=europe-central2 --format="get(spec.template.spec.containers[0].image)")

# Deploy to europe-west1
gcloud run deploy dlvinsight-app \
  --image=$IMAGE \
  --region=europe-west1 \
  --add-cloudsql-instances=dlvinsight-profit-analytics:europe-central2:dlvinsight-db
```

**Service:**
- Production: `dlvinsight-app` (europe-west1) - https://app.dlvinsight.com

**⚠️ Important Notes:**
- Domain mappings not supported in europe-central2 - that's why we use europe-west1
- IAM binding for public access has been fixed - service is publicly accessible

## Custom Shortcuts

--GCP -> git commit push
--WD -> audit the codebase, think hard and write a doc, a .md file in /docs, named AUDIT-\*\*\*.The doc takes the form of a step by step action checklist. you don't change anything else, just focus on the .md (and then --GCP). when finished, point to the filepath of the doc.
--AP -> turn the following audit into a step by step list of actions, an actual action plan with checkboxes. The naming format is /docs/ACTION-PLAN-**\*** (then --GCP)
--EXE execute the step by step plan from file, at each step think, check the corresponding checkboxes, and --GPC
--TERMINATOR -> --EXE + --DS
--CD -> check obsolete .md and ditch them (+ --GCP)
--DS -> don't stop till totally finished


## Product Features & Positioning

### Core Differentiators (Based on Competitor Analysis)

**Primary Unique Features:**
1. **Plan vs. Fact P&L Analysis** - Forecast profits and compare to actual results (unique in market)
2. **LTV Cohort Analytics** - Customer lifetime value tracking by cohorts (MVP feature)
3. **Strategic Planning Focus** - Proactive planning vs. reactive reporting
4. **AI-Powered Forecasting** - Predictive analytics for business planning

**Value Proposition:**
"Plan, Forecast, and Measure Your Amazon Success - The only platform that compares your plans to reality"

### Feature Roadmap

**MVP Features (Phase 1):**
- [ ] Plan vs. Fact P&L dashboard
- [ ] LTV cohort analytics
- [ ] Basic forecasting engine
- [ ] Amazon data integration via Airbyte
- [ ] Multi-tenant organization management

**Core Features (Phase 2):**
- [ ] Advanced forecasting algorithms
- [ ] Strategic planning tools
- [ ] Performance gap analysis
- [ ] Automated reporting
- [ ] Multi-marketplace support

**Advanced Features (Phase 3):**
- [ ] AI-powered recommendations
- [ ] Custom report builder
- [ ] API access for integrations
- [ ] Advanced business intelligence
- [ ] White-label options

### Competitive Positioning

**vs. Sellerise ($19.99/month):**
- Strategic planning vs. basic tools
- Forecasting vs. reactive reporting
- Advanced analytics vs. simple dashboard

**vs. Sellerboard ($15-79/month):**
- Plan/Fact analysis vs. profit tracking only
- LTV cohorts vs. basic customer data
- Strategic focus vs. operational focus

**vs. Helium 10 ($39-229/month):**
- Planning/forecasting vs. product research
- Strategic analytics vs. operational tools
- Business intelligence vs. basic metrics

### Pricing Strategy

**Starter - $29/month:**
- 1 Amazon account
- Basic Plan vs. Fact analysis
- LTV cohort tracking
- Standard forecasting
- Email support

**Professional - $79/month:**
- 3 Amazon accounts
- Advanced P&L analysis
- Multi-marketplace support
- AI-powered forecasting
- Priority support

**Enterprise - $199/month:**
- Unlimited accounts
- Custom reporting
- Advanced analytics
- Dedicated account manager
- API access

## Documentation & Planning

**MVP Planning:**
- [MVP-QUICKSTART.md](./MVP-QUICKSTART.md) - Rapid MVP deployment using Supabase + Airbyte
- [AIRBYTE-AMAZON-SETUP.md](./AIRBYTE-AMAZON-SETUP.md) - Airbyte configuration for Amazon SP-API
- [COMPREHENSIVE-PROJECT-DOCUMENTATION.md](./COMPREHENSIVE-PROJECT-DOCUMENTATION.md) - Full project documentation
- [COMPETITOR-ANALYSIS.md](./COMPETITOR-ANALYSIS.md) - Analysis of Sellerise, Sellerboard, Helium 10
- [LANDING-PAGE-UPDATE-PLAN.md](./LANDING-PAGE-UPDATE-PLAN.md) - Complete landing page redesign plan
- [SAAS-BOILERPLATE-SETUP-PLAN.md](./SAAS-BOILERPLATE-SETUP-PLAN.md) - SaaS foundation setup guide

**Architecture Planning:**
- Technology stack evaluation document
- Open-source SaaS solution comparison
- Airbyte integration architecture
- MVP feature prioritization

## Current Development Status

**✅ Completed:**
- SaaS boilerplate foundation established (ixartz/SaaS-Boilerplate)
- Environment configuration completed
- Database schema designed for Amazon analytics
- Development workflow configured
- Production database setup completed (Cloud SQL)
- Database migrations applied to production
- Cloud Build configuration ready
- Cloud Run deployment working (europe-west1)
- Custom domain configured (app.dlvinsight.com)
- Authentication working with Clerk
- Stripe integration configured
- Competitor analysis completed
- Landing page strategy defined

**🚧 In Progress:**
- Landing page implementation
- MVP feature development planning

**⏳ Pending:**
- Airbyte integration setup
- Amazon SP-API connector configuration
- UI components for analytics dashboard
- Plan vs. Fact P&L implementation
- LTV cohort analytics implementation
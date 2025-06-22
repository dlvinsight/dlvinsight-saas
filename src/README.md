# DLV Insight

Amazon analytics SaaS platform with Plan vs. Fact P&L analysis.

## Tech Stack

- **Framework**: Next.js 14.2.25 + TypeScript 5.6.3
- **Database**: PostgreSQL 17 + Drizzle ORM
- **Authentication**: Clerk (multi-tenant)
- **Payments**: Stripe
- **UI**: Tailwind CSS + Shadcn/UI
- **Hosting**: Google Cloud Run (europe-west1)
- **Domain**: https://app.dlvinsight.com

## Project Structure

```
src/
├── app/[locale]/          # Internationalized routes
│   ├── (auth)/           # Protected routes
│   └── (unauth)/         # Public routes
├── components/ui/         # Shadcn/UI components
├── features/             # Feature modules
├── libs/                 # Core utilities
├── models/Schema.ts      # Database schema
└── types/                # TypeScript definitions
```

## Development

```bash
npm install
npm run dev              # Start dev server on http://localhost:3000
npm run lint             # Run ESLint
npm run check-types      # TypeScript type checking
npm run build            # Production build
```

## Database

```bash
npm run db:generate      # Generate migrations
npm run db:migrate       # Apply migrations
npm run db:studio        # Open Drizzle Studio
```

## Environment Variables

Required in `.env.local`:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_*` - Clerk authentication keys
- `STRIPE_*` - Stripe payment keys
- `NEXT_PUBLIC_APP_URL` - Application URL

## Deployment

Automated deployment via Google Cloud Build:
- Push to `main` → Deploys to production
- Build time: ~10 minutes
- Service: `dlvinsight-app` in europe-west1

## Features

- Multi-tenant organization management
- Amazon seller account integration
- Sales data analytics
- Product catalog management
- Financial event tracking
- Report synchronization
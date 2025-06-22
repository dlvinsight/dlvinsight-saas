# SaaS Boilerplate Template - Ready to Fork

This is a production-ready SaaS boilerplate with all the essential features configured and deployed.

## 🚀 What's Included

### ✅ Core Features Ready
- **Authentication**: Clerk multi-tenant auth configured
- **Database**: PostgreSQL with Drizzle ORM
- **Payments**: Stripe subscription billing
- **Landing Page**: Conversion-optimized with pricing
- **Internationalization**: Multi-language support (EN/FR)
- **Dark Mode**: Theme switching support
- **Deployment**: Google Cloud Run auto-deploy
- **CI/CD**: GitHub Actions + Cloud Build
- **Monitoring**: Sentry + Logtail configured

### 🏗️ Architecture
- Next.js 14 with App Router
- TypeScript with strict mode
- Tailwind CSS + Shadcn/UI
- PostgreSQL with Row Level Security
- Multi-tenant organization structure

## 📋 How to Fork for New Project

### 1. Create Your Fork
```bash
# Clone this repository at the v1.0.0-boilerplate tag
git clone --branch v1.0.0-boilerplate https://github.com/dlvinsight/dlvinsight-saas.git your-new-saas
cd your-new-saas

# Remove existing git history
rm -rf .git

# Initialize new repository
git init
git add .
git commit -m "Initial commit from SaaS boilerplate"

# Add your new repository
git remote add origin https://github.com/yourusername/your-new-saas.git
git push -u origin main
```

### 2. Update Project Configuration

#### A. Update package.json
```json
{
  "name": "your-saas-name",
  "version": "1.0.0",
  "description": "Your SaaS description"
}
```

#### B. Update AppConfig.ts
```typescript
export const AppConfig = {
  name: 'Your SaaS Name',
  description: 'Your SaaS Description',
  // ... other config
};
```

#### C. Update environment variables
Create new `.env.local`:
```env
# Get new keys from Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# Your database
DATABASE_URL=

# Get new keys from Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Your monitoring
SENTRY_DSN=
LOGTAIL_SOURCE_TOKEN=
```

### 3. Set Up Services

#### Clerk Authentication
1. Create account at https://clerk.com
2. Create new application
3. Copy API keys to `.env.local`
4. Update sign-in/sign-up URLs in Clerk dashboard

#### Database Setup
```bash
# Local PostgreSQL
createdb your_saas_dev

# Update DATABASE_URL in .env.local
DATABASE_URL=postgresql://username@localhost:5432/your_saas_dev

# Run migrations
cd src
npm run db:migrate
```

#### Stripe Setup
1. Create account at https://stripe.com
2. Get API keys from dashboard
3. Create products and price IDs
4. Update price IDs in `AppConfig.ts`

#### Google Cloud Setup (Optional)
```bash
# Create new project
gcloud projects create your-saas-id

# Set up Cloud SQL
gcloud sql instances create your-db --database-version=POSTGRES_17

# Set up Cloud Run
gcloud run deploy your-saas-app --source src --region=us-central1
```

### 4. Customize Your SaaS

#### Remove DLV Insight Specific Content
1. Delete these files:
   - `COMPETITOR-ANALYSIS.md`
   - `LANDING-PAGE-UPDATE-PLAN.md`
   - `AIRBYTE-AMAZON-SETUP.md`
   - `MVP-QUICKSTART.md`

2. Update landing page components:
   - Remove/update `PlanVsFactSection.tsx`
   - Remove/update `LTVCohortSection.tsx`
   - Remove/update `ForecastingSection.tsx`
   - Remove/update `StrategicDashboardSection.tsx`

3. Clean up database schema:
   - Remove Amazon-specific tables
   - Keep core tables (organization, user, etc.)

#### Update Branding
1. Replace logos in `/public`
2. Update colors in `tailwind.config.js`
3. Update meta tags and SEO
4. Update footer and navbar links

### 5. Quick Customization Checklist

- [ ] Update `package.json` name and description
- [ ] Update `AppConfig.ts` with your app details
- [ ] Replace environment variables with your own
- [ ] Update pricing plans in `AppConfig.ts`
- [ ] Customize landing page content
- [ ] Update translations in `/locales`
- [ ] Replace favicon and logos
- [ ] Update color scheme
- [ ] Remove unused features
- [ ] Update database schema for your needs
- [ ] Configure your deployment

## 🎯 Common SaaS Templates

### 1. B2B SaaS Template
```typescript
// Keep: Auth, Billing, Organizations, Admin
// Add: Team management, Permissions, Audit logs
// Focus: Enterprise features, SSO, Advanced security
```

### 2. B2C SaaS Template
```typescript
// Keep: Auth, Billing, User profiles
// Remove: Organizations, Complex permissions
// Add: Social login, Gamification, Referrals
```

### 3. Marketplace Template
```typescript
// Keep: Auth, Billing, Organizations
// Add: Vendor accounts, Product listings, Reviews
// Focus: Multi-vendor, Commission system
```

### 4. API-First SaaS
```typescript
// Keep: Auth, Billing, Organizations
// Add: API keys, Rate limiting, Usage tracking
// Focus: Developer experience, Documentation
```

## 📦 What to Keep vs. Remove

### Always Keep
- ✅ Authentication system (Clerk)
- ✅ Database setup (Drizzle + PostgreSQL)
- ✅ Billing integration (Stripe)
- ✅ Deployment configuration
- ✅ TypeScript + ESLint setup
- ✅ Tailwind + Shadcn/UI
- ✅ Internationalization
- ✅ Error tracking (Sentry)

### Consider Removing
- ❌ Specific business logic
- ❌ Industry-specific features
- ❌ Custom landing page sections
- ❌ Specialized database tables
- ❌ Third-party integrations (Airbyte, etc.)

### Customize
- 🎨 Landing page content
- 🎨 Pricing tiers and features
- 🎨 Color scheme and branding
- 🎨 Email templates
- 🎨 Dashboard layout

## 🚨 Important Notes

1. **Security**: Generate new secrets for all services
2. **Keys**: Never reuse API keys between projects
3. **Database**: Always use a fresh database
4. **Git History**: Start with clean history
5. **Dependencies**: Update all npm packages

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Shadcn/UI Components](https://ui.shadcn.com)

---

## Version Information

**Boilerplate Version**: v1.0.0-boilerplate
**Created**: December 2024
**Last Updated**: December 2024

This boilerplate is based on the DLV Insight SaaS platform foundation, with all business-specific features removed and core SaaS functionality retained.
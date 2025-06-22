# DLV Insight - Project Overview

## 🎯 Vision & Mission

### Vision
To become the leading strategic planning platform for Amazon sellers, transforming how they forecast, plan, and measure business success.

### Mission
Empower Amazon sellers with advanced analytics and forecasting tools that enable proactive business planning rather than reactive reporting.

## 🚀 Core Value Propositions

### 1. Plan vs. Fact P&L Analysis (Unique Differentiator)
- **What**: Compare planned P&L forecasts with actual results
- **Why**: Identify performance gaps and optimize strategies
- **How**: Side-by-side comparison dashboards with variance analysis

### 2. LTV Cohort Analytics (MVP Feature)
- **What**: Track customer lifetime value by acquisition cohorts
- **Why**: Optimize customer acquisition costs and retention strategies
- **How**: Advanced cohort tracking with visual analytics

### 3. AI-Powered Forecasting
- **What**: Predict future revenue, costs, and profitability
- **Why**: Make data-driven inventory and marketing decisions
- **How**: Machine learning models analyzing historical data and market trends

### 4. Strategic Planning Tools
- **What**: Proactive business planning capabilities
- **Why**: Move from reactive to strategic decision-making
- **How**: Goal setting, scenario planning, and what-if analysis

## 💻 Technology Stack

### Frontend
- **Framework**: Next.js 14.2.25 (App Router)
- **Language**: TypeScript 5.6.3
- **UI Library**: React 18.3.1
- **Styling**: Tailwind CSS + CSS Modules
- **Component Library**: Shadcn/UI (Radix UI primitives)
- **State Management**: React Context + Hooks
- **Internationalization**: next-intl (English/French)
- **Theme**: next-themes (dark mode support)

### Backend & Infrastructure
- **Runtime**: Node.js
- **API**: Next.js API Routes
- **Database**: PostgreSQL 17
- **ORM**: Drizzle ORM
- **Authentication**: Clerk (multi-tenant)
- **Payments**: Stripe (subscriptions)
- **Hosting**: Google Cloud Run (europe-west1)
- **Database Hosting**: Google Cloud SQL
- **Build System**: Google Cloud Build
- **Container**: Google Cloud Buildpacks

### Data Integration (Planned)
- **ETL Platform**: Airbyte
- **Data Source**: Amazon SP-API
- **Sync Strategy**: Incremental updates
- **Storage**: PostgreSQL with optimized schema

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint + Prettier
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Git Hooks**: Husky + lint-staged
- **Commit Convention**: Commitizen
- **Documentation**: Storybook
- **Monitoring**: Sentry + Logtail

## 🏗️ Architecture

### Application Architecture
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js App   │────▶│  Clerk Auth     │────▶│   PostgreSQL    │
│  (App Router)   │     │  (Multi-tenant) │     │   (Drizzle)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                                                │
         ▼                                                ▼
┌─────────────────┐                            ┌─────────────────┐
│     Stripe      │                            │    Airbyte      │
│  (Payments)     │                            │  (Amazon Data)  │
└─────────────────┘                            └─────────────────┘
```

### Database Schema
```sql
-- Core Tables
organization          -- Multi-tenant organizations
seller_accounts      -- Amazon seller credentials
sales_data          -- Sales transactions
products            -- Product catalog
inventory           -- Stock levels
financial_events    -- Financial data
report_syncs        -- Sync tracking
todo                -- Task management

-- Security
Row Level Security (RLS) enabled
JWT-based organization isolation
```

### Project Structure
```
src/
├── app/[locale]/          # Internationalized routes
│   ├── (auth)/           # Protected routes
│   └── (unauth)/         # Public routes
├── components/ui/         # Shadcn/UI components
├── features/             # Feature modules
│   ├── auth/            # Authentication
│   ├── billing/         # Stripe integration
│   ├── dashboard/       # Dashboard components
│   └── landing/         # Landing page sections
├── libs/                 # Core utilities
│   ├── DB.ts            # Database client
│   ├── Env.ts           # Environment validation
│   └── Logger.ts        # Structured logging
├── models/Schema.ts      # Database schema
├── templates/           # Page templates
└── utils/               # Helper functions
```

## 🔑 Key Features

### Current Features
1. **Multi-tenant Architecture**
   - Organization-based isolation
   - Clerk authentication
   - Role-based access control

2. **Billing & Subscriptions**
   - Stripe integration
   - Three pricing tiers
   - Usage-based billing ready

3. **Internationalization**
   - English and French support
   - Locale-based routing
   - RTL ready

4. **Landing Page**
   - Conversion-optimized design
   - Feature showcases
   - Pricing comparison
   - Social proof elements

### Planned Features (MVP)
1. **Amazon Data Integration**
   - Airbyte connector setup
   - SP-API authentication
   - Automated data sync

2. **Plan vs. Fact Dashboard**
   - P&L forecasting interface
   - Variance analysis
   - Performance metrics

3. **LTV Cohort Analytics**
   - Customer segmentation
   - Retention analysis
   - Value optimization

4. **Basic Forecasting**
   - Revenue predictions
   - Inventory planning
   - Seasonal adjustments

### Future Features
1. **Advanced AI Forecasting**
   - ML-powered predictions
   - Market trend analysis
   - Competitor insights

2. **Custom Reporting**
   - Report builder
   - Scheduled reports
   - Data exports

3. **API Access**
   - REST API
   - Webhook support
   - Third-party integrations

4. **Mobile App**
   - React Native
   - Push notifications
   - Offline support

## 🚀 Deployment & DevOps

### Production Environment
- **URL**: https://app.dlvinsight.com
- **Region**: europe-west1
- **Service**: dlvinsight-app (Cloud Run)
- **Database**: dlvinsight-db-west1 (Cloud SQL)

### CI/CD Pipeline
1. **Trigger**: Push to main branch
2. **Build**: Google Cloud Build
3. **Test**: Automated tests run
4. **Deploy**: Auto-deploy to Cloud Run
5. **Monitor**: Sentry error tracking

### Environment Variables
```env
# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
CLERK_WEBHOOK_SECRET

# Database
DATABASE_URL

# Payments
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET

# Monitoring
SENTRY_DSN
LOGTAIL_SOURCE_TOKEN
```

## 📊 Business Model

### Pricing Tiers
1. **Starter - $29/month**
   - 1 Amazon account
   - Basic features
   - Email support

2. **Professional - $79/month**
   - 3 Amazon accounts
   - Advanced features
   - Priority support

3. **Enterprise - $199/month**
   - Unlimited accounts
   - All features
   - Dedicated support

### Revenue Streams
- **Primary**: Monthly subscriptions
- **Secondary**: Annual plans (planned)
- **Future**: API access, custom reports

### Target Market
- **Primary**: Growing Amazon sellers ($100K-$1M revenue)
- **Secondary**: Established sellers ($1M+ revenue)
- **Tertiary**: New sellers starting out

## 🎯 Development Roadmap

### Phase 1: Foundation (Completed)
- ✅ SaaS boilerplate setup
- ✅ Authentication system
- ✅ Database schema
- ✅ Landing page
- ✅ Deployment pipeline

### Phase 2: MVP Features (Current)
- ⏳ Airbyte integration
- ⏳ Amazon SP-API connector
- ⏳ Plan vs. Fact dashboard
- ⏳ LTV cohort analytics
- ⏳ Basic forecasting

### Phase 3: Enhancement
- 📅 Advanced forecasting
- 📅 Custom reporting
- 📅 API development
- 📅 Mobile app

### Phase 4: Scale
- 📅 ML/AI features
- 📅 Marketplace integrations
- 📅 White-label options
- 📅 Enterprise features

## 🔒 Security & Compliance

### Security Measures
- **Authentication**: Clerk with MFA support
- **Data Encryption**: TLS in transit, encrypted at rest
- **Access Control**: Row-level security
- **API Security**: Rate limiting, JWT tokens
- **Monitoring**: Real-time security alerts

### Compliance (Planned)
- GDPR compliance
- SOC 2 certification
- PCI DSS for payments
- Amazon developer compliance

## 📈 Success Metrics

### Technical KPIs
- Page load time < 3s
- 99.9% uptime
- < 1% error rate
- API response < 200ms

### Business KPIs
- Monthly Recurring Revenue (MRR)
- Customer Acquisition Cost (CAC)
- Customer Lifetime Value (CLV)
- Churn rate < 5%
- NPS score > 50

### User Engagement
- Daily Active Users (DAU)
- Feature adoption rate
- Session duration
- Support ticket volume

## 🤝 Competitive Landscape

### Direct Competitors
1. **Sellerboard** ($15-79/month)
   - Basic profit tracking
   - Limited forecasting
   - No Plan vs. Fact

2. **Helium 10** ($39-229/month)
   - Product research focus
   - Basic analytics
   - No strategic planning

3. **Jungle Scout** ($49-129/month)
   - Product discovery
   - Sales estimates
   - Limited P&L features

### Competitive Advantages
1. **Unique Features**: Plan vs. Fact analysis
2. **Strategic Focus**: Planning vs. reporting
3. **Advanced Analytics**: LTV cohorts
4. **Better Price/Value**: More features for less

## 📞 Support & Documentation

### Support Channels
- **Email**: All plans
- **Priority**: Professional+ plans
- **Dedicated**: Enterprise only
- **Documentation**: docs.dlvinsight.com (planned)

### Resources
- Getting started guide
- Video tutorials
- API documentation
- Community forum (planned)

## 🚨 Current Challenges & Solutions

### Technical Challenges
1. **Data Volume**: Optimize queries, implement caching
2. **Real-time Sync**: Use webhooks, queue processing
3. **Scalability**: Horizontal scaling, microservices

### Business Challenges
1. **User Acquisition**: Content marketing, partnerships
2. **Retention**: Feature development, customer success
3. **Competition**: Unique features, better UX

## 📝 Notes for Development

### Code Quality Standards
- TypeScript strict mode
- 90%+ test coverage
- Documented components
- Performance budgets

### Development Workflow
1. Feature branch from main
2. Write tests first (TDD)
3. Code review required
4. Auto-deploy on merge

### Best Practices
- Component composition
- Server-side rendering
- Progressive enhancement
- Accessibility first

---

This document serves as the single source of truth for the DLV Insight project. It should be updated as the project evolves and new decisions are made.
# DLV Insight - Project Context & TODO

## Project Overview
Amazon analytics SaaS platform with **Plan vs. Fact P&L** analysis - comparing forecasts to reality.

## Key Project Files

### Configuration & Setup
- [`/src/.env.local`](./src/.env.local) - Environment variables (Clerk auth, database, SP-API sandbox credentials)
- [`/src/CLAUDE.md`](./CLAUDE.md) - Project instructions and shortcuts
- [`/src/next.config.mjs`](./next.config.mjs) - Next.js configuration
- [`/src/package.json`](./package.json) - Dependencies and scripts

### Database & Models
- [`/src/src/libs/DB.ts`](./src/libs/DB.ts) - Database connection and initialization
- [`/src/src/models/Schema.ts`](./src/models/Schema.ts) - Drizzle ORM schema definitions
- [`/src/src/libs/encryption.ts`](./src/libs/encryption.ts) - Encryption utilities for sensitive data

### Amazon SP-API Integration
- [`/src/src/libs/amazon-sp-api.ts`](./src/libs/amazon-sp-api.ts) - Core SP-API authentication and connection testing
- [`/src/src/domain/marketplace/amazon/`](./src/domain/marketplace/amazon/) - Domain models for Amazon integration
  - [`entities/SellerAccount.ts`](./src/domain/marketplace/amazon/entities/SellerAccount.ts) - Seller account entity
  - [`services/sp-api/sp-api-client.service.ts`](./src/domain/marketplace/amazon/services/sp-api/sp-api-client.service.ts) - SP-API client for orders
  - [`services/sp-api/sp-api-auth.service.ts`](./src/domain/marketplace/amazon/services/sp-api/sp-api-auth.service.ts) - SP-API authentication service

### Dashboard Pages
- [`/src/src/app/[locale]/(auth)/dashboard/layout.tsx`](./src/app/[locale]/(auth)/dashboard/layout.tsx) - Dashboard layout with navigation
- [`/src/src/app/[locale]/(auth)/dashboard/sources/`](./src/app/[locale]/(auth)/dashboard/sources/) - Amazon account management
  - [`page.tsx`](./src/app/[locale]/(auth)/dashboard/sources/page.tsx) - Sources page
  - [`actions.ts`](./src/app/[locale]/(auth)/dashboard/sources/actions.ts) - Server actions for account management
  - [`components/SourcesList.tsx`](./src/app/[locale]/(auth)/dashboard/sources/components/SourcesList.tsx) - Account list component
- [`/src/src/app/[locale]/(auth)/dashboard/products/`](./src/app/[locale]/(auth)/dashboard/products/) - Product catalog view
  - [`page.tsx`](./src/app/[locale]/(auth)/dashboard/products/page.tsx) - Products page
  - [`actions.ts`](./src/app/[locale]/(auth)/dashboard/products/actions.ts) - Server actions with SP-API integration
  - [`components/ProductsList.tsx`](./src/app/[locale]/(auth)/dashboard/products/components/ProductsList.tsx) - Products list with account selector

### Localization
- [`/src/src/locales/en.json`](./src/locales/en.json) - English translations

### Reference Files (Airbyte Examples)
- `/airbyte_example/integration/` - SP-API integration patterns
- `/resource/GET_AFN` - Amazon FBA inventory data examples

## Current Implementation Status

### ✅ Completed
1. **Multi-tenant Architecture** - Organization-based data isolation
2. **Amazon Account Management** - Add/remove SP-API accounts with encrypted credentials
3. **Products Page** - Basic SKU view with account selector
4. **SP-API Integration** - OAuth token exchange and catalog items fetching
5. **Sandbox Support** - Works with Amazon SP-API sandbox for testing

### 🚧 In Progress
- Real-time product data fetching from SP-API
- Proper error handling and retry logic

## Future Development Ideas

### High Priority
1. **Complete Product Data**
   - [ ] Implement pricing API integration to show product prices
   - [ ] Add inventory levels from FBA inventory API
   - [ ] Fetch product images and display them
   - [ ] Add product search and filtering capabilities

2. **Report Generation System**
   - [ ] Implement SP-API report creation/polling pattern (like GET_AFN_INVENTORY_DATA)
   - [ ] Add background job processing for long-running reports
   - [ ] Store report data in database for historical analysis

3. **P&L Analytics Core**
   - [ ] Design P&L data model (revenue, costs, fees, etc.)
   - [ ] Implement Amazon fees calculation
   - [ ] Create forecast vs actual comparison views
   - [ ] Add data visualization with charts

### Medium Priority
4. **Order Management**
   - [ ] Fetch and display orders using existing `sp-api-client.service.ts`
   - [ ] Calculate order-level profitability
   - [ ] Link orders to products for cohort analysis

5. **Data Synchronization**
   - [ ] Implement scheduled sync jobs with Airbyte or custom workers
   - [ ] Add sync status indicators and history
   - [ ] Handle rate limiting and error recovery

6. **Performance Optimization**
   - [ ] Implement caching for frequently accessed data
   - [ ] Add pagination for large datasets
   - [ ] Optimize database queries with proper indexes

### Low Priority
7. **Enhanced Features**
   - [ ] Multi-marketplace support (EU, FE regions)
   - [ ] Competitor analysis using Buy Box data
   - [ ] Automated repricing suggestions
   - [ ] Email alerts for important metrics

8. **Developer Experience**
   - [ ] Add comprehensive API documentation
   - [ ] Create unit tests for SP-API integration
   - [ ] Add integration tests with sandbox data
   - [ ] Implement proper logging and monitoring

## Technical Debt
- [ ] Remove console.log statements and implement proper logging
- [ ] Add proper TypeScript types for SP-API responses
- [ ] Implement retry logic with exponential backoff
- [ ] Add request/response interceptors for debugging
- [ ] Standardize error handling across the application

## Security Improvements
- [ ] Implement API rate limiting
- [ ] Add request signing for additional security
- [ ] Audit credential storage and encryption
- [ ] Add activity logging for compliance

## Notes
- The project uses Clerk for authentication with instance `advanced-alien-77`
- Database password is stored in `/tmp/db_password.txt` (never commit)
- All queries must be filtered by `organizationId` for multi-tenancy
- Source code is in `/src` directory (required by Cloud Build)

## Useful Commands
```bash
npm run dev              # Start development server
npm run lint             # Check code quality
npm run check-types      # TypeScript type checking
npm run db:migrate       # Apply database migrations
```

## Git Shortcuts (from CLAUDE.md)
- `--GCP` → git add -A && git commit -m "msg" && git push
- `--WD` → Write audit doc
- `--AP` → Convert audit to action plan
- `--EXE` → Execute plan from file
- `--TERMINATOR` → Execute until finished

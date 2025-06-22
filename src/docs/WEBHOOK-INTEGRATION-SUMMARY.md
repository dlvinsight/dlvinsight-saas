# Webhook Integration Summary

## Database Architecture Updates

### New Tables Created
- **users** - Stores user data synced from Clerk
  - id (UUID) - Internal primary key
  - clerk_user_id - Maps to Clerk's user ID
  - email, first_name, last_name, image_url
  - Indexes on clerk_user_id and email

- **organization** - Modified to store Clerk organization data
  - id (UUID) - Internal primary key
  - clerk_org_id - Maps to Clerk's organization ID
  - name - Organization name from Clerk
  - Existing Stripe fields preserved

- **user_organizations** - Many-to-many relationship
  - Links users to organizations with roles
  - Unique constraint on user-org pairs

- **clerk_webhook_events** - Webhook event tracking
  - Stores all incoming webhook events
  - Tracks processing status
  - Indexes for unprocessed events

### Schema Updates to Existing Tables
- **seller_accounts**
  - Added user_id (UUID) - References internal user ID
  - Changed organization_id to UUID with foreign key
  - Added SP-API credential fields (encrypted)
  - Added marketplace details (code, name, region, currency)
  - Added status tracking fields (lastSyncAt, lastErrorAt)
  - Performance indexes on org_id, user_id, seller_id, marketplace

- **All Amazon analytics tables**
  - Updated organization_id to UUID with foreign keys
  - Added proper indexes for performance

## Clerk Webhook Integration

### Webhook Endpoint Created
- **Route**: `/api/webhooks/clerk/route.ts`
- **Features**:
  - Signature verification with svix
  - Handles all Clerk events (user/org CRUD)
  - Stores events in clerk_webhook_events table
  - Development mode bypass for testing
  - Comprehensive error handling and logging

### Events Handled
- user.created, user.updated, user.deleted
- organization.created, organization.updated, organization.deleted
- organizationMembership.created, organizationMembership.updated, organizationMembership.deleted

## Authentication Helpers

### auth-helpers.ts Created
- **getCurrentUser()** - Get user from database using Clerk ID
- **getCurrentOrganization()** - Get organization with user's role
- **getAuthContext()** - Get both user and org in one call
- **requireAuthContext()** - Enforce auth requirements
- **getUserOrganizations()** - List all user's organizations

## Security Implementation

### Encryption Utilities
- **encryption.ts** - AES-256-GCM encryption for sensitive data
- Functions for encrypting/decrypting SP-API credentials
- Uses PBKDF2 for key derivation
- Separate functions for object encryption

### Environment Variables Added
- **CLERK_WEBHOOK_SECRET** - For webhook signature verification
- **ENCRYPTION_KEY** - For encrypting sensitive credentials
- **SKIP_DB_MIGRATIONS** - Prevents migration errors in production

## Testing & Debugging

### Test Sync Page
- **Route**: `/dashboard/test-sync`
- Shows current Clerk IDs vs database sync status
- Lists all webhook events received
- Displays users and organizations in database
- Useful for debugging sync issues

### Local Testing Script
- **test-webhook.sh** - Simulates webhook events locally
- Bypasses signature verification in development
- Helps test webhook handling without Clerk

## Migration Handling

### Database Migrations
- Created proper __drizzle_migrations table
- Fixed migration tracking issues
- Added error handling for build-time migrations
- SKIP_DB_MIGRATIONS flag to prevent duplicate runs

### Manual Data Entry
- Inserted test user (data@dlvinsight.com)
- Created two organizations (dlv1, dlv2)
- Established user-org relationships

## Cloud Run Updates

### Environment Variables Updated
- CLERK_WEBHOOK_SECRET
- ENCRYPTION_KEY
- SKIP_DB_MIGRATIONS
- BILLING_PLAN_ENV (set to prod)
- NEXT_PUBLIC_APP_URL

### Deployment
- Merged to main branch
- Automatic deployment triggered
- New revision deployed: dlvinsight-app-00011-p4z

## Key Architecture Decisions

### ID Strategy
- Use internal UUIDs as primary keys
- Store Clerk IDs as references
- All foreign keys use internal IDs
- Enables future auth provider flexibility

### Multi-Tenancy
- Organization-based isolation
- All queries filter by organizationId
- User can belong to multiple organizations
- Role-based access per organization

### Data Flow
1. User signs up in Clerk
2. Clerk sends webhook to our endpoint
3. Webhook handler creates user in PostgreSQL
4. User/org relationships maintained automatically
5. Application queries local database for user data

## Next Steps Required

### Clerk Dashboard Configuration
- Set webhook endpoint URL to: https://app.dlvinsight.com/api/webhooks/clerk
- Ensure all required events are selected
- Webhook secret already configured in Cloud Run

### Production Verification
- Test user signup flow
- Verify webhook events are received
- Check database synchronization
- Monitor for any errors in logs
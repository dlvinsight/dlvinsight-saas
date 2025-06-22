import {
  bigint,
  decimal,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// This file defines the structure of your database tables using the Drizzle ORM.

// To modify the database schema:
// 1. Update this file with your desired changes.
// 2. Generate a new migration by running: `npm run db:generate`

// The generated migration file will reflect your schema changes.
// The migration is automatically applied during the next database interaction,
// so there's no need to run it manually or restart the Next.js server.

// Users table - synced from Clerk via webhooks
export const userSchema = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    clerkUserId: text('clerk_user_id').notNull().unique(), // Clerk's user ID
    email: text('email').notNull(),
    firstName: text('first_name'),
    lastName: text('last_name'),
    imageUrl: text('image_url'),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => {
    return {
      clerkUserIdIdx: index('idx_user_clerk_id').on(table.clerkUserId),
      emailIdx: index('idx_user_email').on(table.email),
    };
  },
);

export const organizationSchema = pgTable(
  'organization',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    clerkOrgId: text('clerk_org_id').notNull().unique(), // Clerk's organization ID
    name: text('name'), // Organization name from Clerk
    stripeCustomerId: text('stripe_customer_id'),
    stripeSubscriptionId: text('stripe_subscription_id'),
    stripeSubscriptionPriceId: text('stripe_subscription_price_id'),
    stripeSubscriptionStatus: text('stripe_subscription_status'),
    stripeSubscriptionCurrentPeriodEnd: bigint(
      'stripe_subscription_current_period_end',
      { mode: 'number' },
    ),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      clerkOrgIdIdx: index('idx_org_clerk_id').on(table.clerkOrgId),
      stripeCustomerIdIdx: uniqueIndex('stripe_customer_id_idx').on(
        table.stripeCustomerId,
      ),
    };
  },
);

// User-Organization relationship (many-to-many)
export const userOrganizationSchema = pgTable(
  'user_organizations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => userSchema.id),
    organizationId: uuid('organization_id').notNull().references(() => organizationSchema.id),
    role: text('role').default('member'), // member, admin, owner
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      userOrgIdx: uniqueIndex('idx_user_org').on(table.userId, table.organizationId),
    };
  },
);

export const todoSchema = pgTable('todo', {
  id: serial('id').primaryKey(),
  ownerId: text('owner_id').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// DLV Insight specific schemas for Amazon analytics

// Amazon Seller Account
export const sellerAccountSchema = pgTable(
  'seller_accounts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id').notNull().references(() => organizationSchema.id),
    userId: uuid('user_id').notNull().references(() => userSchema.id), // Internal user ID who created the account
    accountName: text('account_name').notNull(),
    marketplaceId: text('marketplace_id').notNull(),
    marketplaceCode: text('marketplace_code').notNull(), // US, DE, UK, etc.
    marketplaceName: text('marketplace_name').notNull(), // Amazon.com, Amazon.de, etc.
    region: text('region').notNull(), // NA, EU, FE
    currency: text('currency').notNull(), // USD, EUR, GBP
    currencySymbol: text('currency_symbol').notNull(), // $, €, £
    endpoint: text('endpoint').notNull(), // SP-API endpoint URL
    sellerId: text('seller_id').notNull(),
    awsEnvironment: text('aws_environment').default('PRODUCTION'), // PRODUCTION or SANDBOX
    accountType: text('account_type').default('Seller'), // Seller or Vendor
    // NOTE: These fields should be encrypted before storage using a service like AWS KMS or similar
    lwaClientId: text('lwa_client_id'), // Encrypted - SP-API LWA Client ID
    lwaClientSecret: text('lwa_client_secret'), // Encrypted - SP-API LWA Client Secret
    refreshToken: text('refresh_token'), // Encrypted - SP-API Refresh Token
    isActive: integer('is_active').default(1),
    lastSyncAt: timestamp('last_sync_at', { mode: 'date' }),
    lastErrorAt: timestamp('last_error_at', { mode: 'date' }),
    lastErrorMessage: text('last_error_message'),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => {
    return {
      orgIdIdx: index('idx_seller_accounts_org_id').on(table.organizationId),
      userIdIdx: index('idx_seller_accounts_user_id').on(table.userId),
      sellerIdIdx: index('idx_seller_accounts_seller_id').on(table.sellerId),
      marketplaceIdx: index('idx_seller_accounts_marketplace').on(table.marketplaceCode),
    };
  },
);

// Products
export const productSchema = pgTable(
  'products',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id').notNull().references(() => organizationSchema.id),
    sellerAccountId: uuid('seller_account_id').references(() => sellerAccountSchema.id),
    asin: text('asin').notNull(),
    sku: text('sku').notNull(),
    title: text('title'),
    imageUrl: text('image_url'),
    category: text('category'),
    brandName: text('brand_name'),
    packageQuantity: integer('package_quantity'),
    itemWeight: decimal('item_weight', { precision: 10, scale: 2 }),
    itemDimensions: jsonb('item_dimensions'), // length, width, height
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => {
    return {
      asinSkuIdx: uniqueIndex('idx_products_asin_sku').on(table.asin, table.sku, table.sellerAccountId),
      orgIdIdx: index('idx_products_org_id').on(table.organizationId),
    };
  },
);

// Sales Data (from Airbyte sync)
export const salesDataSchema = pgTable(
  'sales_data',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id').notNull().references(() => organizationSchema.id),
    sellerAccountId: uuid('seller_account_id').references(() => sellerAccountSchema.id),
    orderId: text('order_id').notNull(),
    orderDate: timestamp('order_date', { mode: 'date' }).notNull(),
    asin: text('asin'),
    sku: text('sku'),
    quantity: integer('quantity'),
    revenue: decimal('revenue', { precision: 10, scale: 2 }),
    costs: jsonb('costs'), // FBA fees, shipping, etc.
    profit: decimal('profit', { precision: 10, scale: 2 }),
    profitMargin: decimal('profit_margin', { precision: 5, scale: 2 }),
    marketplace: text('marketplace'),
    fulfillmentChannel: text('fulfillment_channel'), // FBA or FBM
    syncedAt: timestamp('synced_at', { mode: 'date' }).defaultNow().notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      orderDateIdx: index('idx_sales_order_date').on(table.orderDate),
      orgIdIdx: index('idx_sales_org_id').on(table.organizationId),
      orderIdIdx: index('idx_sales_order_id').on(table.orderId),
    };
  },
);

// Inventory Data
export const inventorySchema = pgTable(
  'inventory',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id').notNull().references(() => organizationSchema.id),
    sellerAccountId: uuid('seller_account_id').references(() => sellerAccountSchema.id),
    asin: text('asin').notNull(),
    sku: text('sku').notNull(),
    totalQuantity: integer('total_quantity'),
    inboundQuantity: integer('inbound_quantity'),
    availableQuantity: integer('available_quantity'),
    reservedQuantity: integer('reserved_quantity'),
    fulfillmentChannel: text('fulfillment_channel'),
    lastUpdated: timestamp('last_updated', { mode: 'date' }).notNull(),
    syncedAt: timestamp('synced_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      asinSkuIdx: index('idx_inventory_asin_sku').on(table.asin, table.sku, table.sellerAccountId),
      orgIdIdx: index('idx_inventory_org_id').on(table.organizationId),
    };
  },
);

// Financial Events (detailed cost breakdown)
export const financialEventSchema = pgTable('financial_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').notNull().references(() => organizationSchema.id),
  sellerAccountId: uuid('seller_account_id').references(() => sellerAccountSchema.id),
  eventGroupId: text('event_group_id'),
  eventType: text('event_type'), // Order, Refund, FBAFee, etc.
  orderId: text('order_id'),
  asin: text('asin'),
  sku: text('sku'),
  eventDate: timestamp('event_date', { mode: 'date' }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }),
  currency: text('currency').default('USD'),
  feeType: text('fee_type'), // Commission, FBA, Shipping, etc.
  feeDescription: text('fee_description'),
  syncedAt: timestamp('synced_at', { mode: 'date' }).defaultNow().notNull(),
});

// Reports tracking (for managing Airbyte sync status)
export const reportSyncSchema = pgTable('report_syncs', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').notNull().references(() => organizationSchema.id),
  sellerAccountId: uuid('seller_account_id').references(() => sellerAccountSchema.id),
  reportType: text('report_type').notNull(), // e.g., 'orders', 'inventory', 'financial'
  reportId: text('report_id'),
  startDate: timestamp('start_date', { mode: 'date' }),
  endDate: timestamp('end_date', { mode: 'date' }),
  status: text('status').default('pending'), // pending, processing, completed, failed
  recordsProcessed: integer('records_processed').default(0),
  errorMessage: text('error_message'),
  lastSyncAt: timestamp('last_sync_at', { mode: 'date' }),
  nextSyncAt: timestamp('next_sync_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// Clerk Webhook Events tracking
export const clerkWebhookEventSchema = pgTable(
  'clerk_webhook_events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    eventType: text('event_type').notNull(), // 'user.created', 'organization.created', etc.
    eventId: text('event_id').notNull().unique(),
    payload: jsonb('payload').notNull(),
    processedAt: timestamp('processed_at', { mode: 'date' }),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      eventTypeIdx: index('idx_webhook_events_type').on(table.eventType),
      processedIdx: index('idx_webhook_events_processed').on(table.processedAt).where(sql`${table.processedAt} IS NULL`),
    };
  },
);

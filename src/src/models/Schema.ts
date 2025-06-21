import {
  bigint,
  decimal,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

// This file defines the structure of your database tables using the Drizzle ORM.

// To modify the database schema:
// 1. Update this file with your desired changes.
// 2. Generate a new migration by running: `npm run db:generate`

// The generated migration file will reflect your schema changes.
// The migration is automatically applied during the next database interaction,
// so there's no need to run it manually or restart the Next.js server.

export const organizationSchema = pgTable(
  'organization',
  {
    id: text('id').primaryKey(),
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
      stripeCustomerIdIdx: uniqueIndex('stripe_customer_id_idx').on(
        table.stripeCustomerId,
      ),
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
export const sellerAccountSchema = pgTable('seller_accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: text('organization_id').notNull(),
  accountName: text('account_name').notNull(),
  marketplaceId: text('marketplace_id').notNull(),
  sellerId: text('seller_id').notNull(),
  refreshToken: text('refresh_token'), // For SP-API
  isActive: integer('is_active').default(1),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Products
export const productSchema = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: text('organization_id').notNull(),
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
});

// Sales Data (from Airbyte sync)
export const salesDataSchema = pgTable('sales_data', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: text('organization_id').notNull(),
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
});

// Inventory Data
export const inventorySchema = pgTable('inventory', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: text('organization_id').notNull(),
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
});

// Financial Events (detailed cost breakdown)
export const financialEventSchema = pgTable('financial_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: text('organization_id').notNull(),
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
  organizationId: text('organization_id').notNull(),
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

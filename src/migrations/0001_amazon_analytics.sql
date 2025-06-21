-- Add Amazon-specific fields to organization table
ALTER TABLE "organization" 
ADD COLUMN "amazon_seller_id" text,
ADD COLUMN "amazon_refresh_token" text,
ADD COLUMN "amazon_marketplace_ids" text[],
ADD COLUMN "airbyte_connection_id" text,
ADD COLUMN "amazon_connected_at" timestamp;

-- Amazon credentials table (for multiple accounts per org in future)
CREATE TABLE IF NOT EXISTS "amazon_credentials" (
  "id" serial PRIMARY KEY,
  "organization_id" text NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "seller_id" text NOT NULL,
  "refresh_token" text NOT NULL,
  "marketplace_ids" text[] NOT NULL DEFAULT '{}',
  "is_active" boolean DEFAULT true,
  "last_sync_at" timestamp,
  "airbyte_source_id" text,
  "airbyte_connection_id" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Amazon orders table
CREATE TABLE IF NOT EXISTS "amazon_orders" (
  "amazon_order_id" text PRIMARY KEY,
  "organization_id" text NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "purchase_date" timestamp NOT NULL,
  "last_update_date" timestamp,
  "order_status" text NOT NULL,
  "fulfillment_channel" text,
  "sales_channel" text,
  "ship_service_level" text,
  "order_total_amount" decimal(10,2),
  "order_total_currency" text,
  "number_of_items_shipped" integer DEFAULT 0,
  "number_of_items_unshipped" integer DEFAULT 0,
  "marketplace_id" text NOT NULL,
  "buyer_email" text,
  "buyer_name" text,
  "ship_country_code" text,
  "raw_data" jsonb,
  "synced_at" timestamp DEFAULT now() NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Amazon order items table
CREATE TABLE IF NOT EXISTS "amazon_order_items" (
  "id" serial PRIMARY KEY,
  "amazon_order_id" text NOT NULL REFERENCES "amazon_orders"("amazon_order_id") ON DELETE CASCADE,
  "organization_id" text NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "asin" text NOT NULL,
  "sku" text,
  "order_item_id" text NOT NULL,
  "title" text,
  "quantity_ordered" integer NOT NULL,
  "quantity_shipped" integer DEFAULT 0,
  "item_price_amount" decimal(10,2),
  "item_price_currency" text,
  "item_tax_amount" decimal(10,2),
  "promotion_discount_amount" decimal(10,2),
  "raw_data" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL,
  UNIQUE("order_item_id")
);

-- Amazon products/catalog table
CREATE TABLE IF NOT EXISTS "amazon_products" (
  "id" serial PRIMARY KEY,
  "organization_id" text NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "asin" text NOT NULL,
  "sku" text,
  "title" text,
  "brand" text,
  "manufacturer" text,
  "product_group" text,
  "product_type" text,
  "list_price_amount" decimal(10,2),
  "list_price_currency" text,
  "image_url" text,
  "parent_asin" text,
  "variation_attributes" jsonb,
  "raw_data" jsonb,
  "last_updated" timestamp DEFAULT now() NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  UNIQUE("organization_id", "asin")
);

-- Amazon financial events table (fees, reimbursements, etc)
CREATE TABLE IF NOT EXISTS "amazon_financial_events" (
  "id" serial PRIMARY KEY,
  "organization_id" text NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "amazon_order_id" text,
  "event_type" text NOT NULL, -- 'shipment', 'refund', 'adjustment', 'fee', etc
  "posted_date" timestamp NOT NULL,
  "marketplace_name" text,
  "amount_type" text NOT NULL, -- 'principal', 'fee', 'tax', etc
  "amount_value" decimal(10,2) NOT NULL,
  "amount_currency" text NOT NULL,
  "fee_type" text, -- 'FBAPerUnitFulfillmentFee', 'Commission', etc
  "description" text,
  "raw_data" jsonb,
  "synced_at" timestamp DEFAULT now() NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Analytics summary table (pre-calculated for performance)
CREATE TABLE IF NOT EXISTS "amazon_analytics_daily" (
  "id" serial PRIMARY KEY,
  "organization_id" text NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "date" date NOT NULL,
  "marketplace_id" text,
  "total_orders" integer DEFAULT 0,
  "total_units" integer DEFAULT 0,
  "gross_revenue" decimal(10,2) DEFAULT 0,
  "total_fees" decimal(10,2) DEFAULT 0,
  "net_revenue" decimal(10,2) DEFAULT 0,
  "average_order_value" decimal(10,2) DEFAULT 0,
  "unique_customers" integer DEFAULT 0,
  "unique_skus_sold" integer DEFAULT 0,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  UNIQUE("organization_id", "date", "marketplace_id")
);

-- Indexes for performance
CREATE INDEX "idx_amazon_orders_org_date" ON "amazon_orders" ("organization_id", "purchase_date" DESC);
CREATE INDEX "idx_amazon_order_items_org_sku" ON "amazon_order_items" ("organization_id", "sku");
CREATE INDEX "idx_amazon_products_org_sku" ON "amazon_products" ("organization_id", "sku");
CREATE INDEX "idx_amazon_financial_org_date" ON "amazon_financial_events" ("organization_id", "posted_date" DESC);
CREATE INDEX "idx_amazon_analytics_org_date" ON "amazon_analytics_daily" ("organization_id", "date" DESC);

-- Enable Row Level Security
ALTER TABLE "amazon_credentials" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "amazon_orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "amazon_order_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "amazon_products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "amazon_financial_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "amazon_analytics_daily" ENABLE ROW LEVEL SECURITY;

-- RLS Policies (assuming clerk user has org_id in JWT)
CREATE POLICY "Users can view own org data" ON "amazon_orders"
  FOR SELECT USING (organization_id = current_setting('app.current_organization_id')::text);

CREATE POLICY "Users can view own org data" ON "amazon_order_items"
  FOR SELECT USING (organization_id = current_setting('app.current_organization_id')::text);

CREATE POLICY "Users can view own org data" ON "amazon_products"
  FOR SELECT USING (organization_id = current_setting('app.current_organization_id')::text);

CREATE POLICY "Users can view own org data" ON "amazon_financial_events"
  FOR SELECT USING (organization_id = current_setting('app.current_organization_id')::text);

CREATE POLICY "Users can view own org data" ON "amazon_analytics_daily"
  FOR SELECT USING (organization_id = current_setting('app.current_organization_id')::text);
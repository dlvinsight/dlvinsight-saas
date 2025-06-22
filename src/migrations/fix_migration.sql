-- Drop existing tables with dependencies
DROP TABLE IF EXISTS financial_events CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS report_syncs CASCADE;
DROP TABLE IF EXISTS sales_data CASCADE;
DROP TABLE IF EXISTS seller_accounts CASCADE;
DROP TABLE IF EXISTS organization CASCADE;
DROP TABLE IF EXISTS user_organizations CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Now run the complete schema creation
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" text NOT NULL,
	"email" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_user_id_unique" UNIQUE("clerk_user_id")
);

CREATE TABLE IF NOT EXISTS "organization" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_org_id" text NOT NULL,
	"name" text,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"stripe_subscription_price_id" text,
	"stripe_subscription_status" text,
	"stripe_subscription_current_period_end" bigint,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organization_clerk_org_id_unique" UNIQUE("clerk_org_id")
);

CREATE TABLE IF NOT EXISTS "user_organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"role" text DEFAULT 'member',
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "seller_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"account_name" text NOT NULL,
	"marketplace_id" text NOT NULL,
	"marketplace_code" text NOT NULL,
	"marketplace_name" text NOT NULL,
	"region" text NOT NULL,
	"currency" text NOT NULL,
	"currency_symbol" text NOT NULL,
	"endpoint" text NOT NULL,
	"seller_id" text NOT NULL,
	"aws_environment" text DEFAULT 'PRODUCTION',
	"account_type" text DEFAULT 'Seller',
	"lwa_client_id" text,
	"lwa_client_secret" text,
	"refresh_token" text,
	"is_active" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"seller_account_id" uuid,
	"asin" text NOT NULL,
	"sku" text NOT NULL,
	"title" text,
	"image_url" text,
	"category" text,
	"brand_name" text,
	"package_quantity" integer,
	"item_weight" decimal(10, 2),
	"item_dimensions" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "sales_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"seller_account_id" uuid,
	"order_id" text NOT NULL,
	"order_date" timestamp NOT NULL,
	"asin" text,
	"sku" text,
	"quantity" integer,
	"revenue" decimal(10, 2),
	"costs" jsonb,
	"profit" decimal(10, 2),
	"profit_margin" decimal(5, 2),
	"marketplace" text,
	"fulfillment_channel" text,
	"synced_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "inventory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"seller_account_id" uuid,
	"asin" text NOT NULL,
	"sku" text NOT NULL,
	"total_quantity" integer,
	"inbound_quantity" integer,
	"available_quantity" integer,
	"reserved_quantity" integer,
	"fulfillment_channel" text,
	"last_updated" timestamp NOT NULL,
	"synced_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "financial_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"seller_account_id" uuid,
	"event_group_id" text,
	"event_type" text,
	"order_id" text,
	"asin" text,
	"sku" text,
	"event_date" timestamp NOT NULL,
	"amount" decimal(10, 2),
	"currency" text DEFAULT 'USD',
	"fee_type" text,
	"fee_description" text,
	"synced_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "report_syncs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"seller_account_id" uuid,
	"report_type" text NOT NULL,
	"report_id" text,
	"start_date" timestamp,
	"end_date" timestamp,
	"status" text DEFAULT 'pending',
	"records_processed" integer DEFAULT 0,
	"error_message" text,
	"last_sync_at" timestamp,
	"next_sync_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraints
ALTER TABLE "user_organizations" ADD CONSTRAINT "user_organizations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "user_organizations" ADD CONSTRAINT "user_organizations_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "seller_accounts" ADD CONSTRAINT "seller_accounts_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "seller_accounts" ADD CONSTRAINT "seller_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "products" ADD CONSTRAINT "products_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "products" ADD CONSTRAINT "products_seller_account_id_seller_accounts_id_fk" FOREIGN KEY ("seller_account_id") REFERENCES "seller_accounts"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "sales_data" ADD CONSTRAINT "sales_data_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "sales_data" ADD CONSTRAINT "sales_data_seller_account_id_seller_accounts_id_fk" FOREIGN KEY ("seller_account_id") REFERENCES "seller_accounts"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_seller_account_id_seller_accounts_id_fk" FOREIGN KEY ("seller_account_id") REFERENCES "seller_accounts"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "financial_events" ADD CONSTRAINT "financial_events_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "financial_events" ADD CONSTRAINT "financial_events_seller_account_id_seller_accounts_id_fk" FOREIGN KEY ("seller_account_id") REFERENCES "seller_accounts"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "report_syncs" ADD CONSTRAINT "report_syncs_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "report_syncs" ADD CONSTRAINT "report_syncs_seller_account_id_seller_accounts_id_fk" FOREIGN KEY ("seller_account_id") REFERENCES "seller_accounts"("id") ON DELETE no action ON UPDATE no action;

-- Create indexes
CREATE INDEX "idx_user_clerk_id" ON "users" ("clerk_user_id");
CREATE INDEX "idx_user_email" ON "users" ("email");
CREATE INDEX "idx_org_clerk_id" ON "organization" ("clerk_org_id");
CREATE UNIQUE INDEX "stripe_customer_id_idx" ON "organization" ("stripe_customer_id");
CREATE UNIQUE INDEX "idx_user_org" ON "user_organizations" ("user_id","organization_id");
CREATE INDEX "idx_webhook_events_type" ON "clerk_webhook_events" ("event_type");
CREATE INDEX "idx_webhook_events_processed" ON "clerk_webhook_events" ("processed_at") WHERE "clerk_webhook_events"."processed_at" IS NULL;
CREATE TABLE IF NOT EXISTS "financial_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"seller_account_id" uuid,
	"event_group_id" text,
	"event_type" text,
	"order_id" text,
	"asin" text,
	"sku" text,
	"event_date" timestamp NOT NULL,
	"amount" numeric(10, 2),
	"currency" text DEFAULT 'USD',
	"fee_type" text,
	"fee_description" text,
	"synced_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inventory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
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
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"seller_account_id" uuid,
	"asin" text NOT NULL,
	"sku" text NOT NULL,
	"title" text,
	"image_url" text,
	"category" text,
	"brand_name" text,
	"package_quantity" integer,
	"item_weight" numeric(10, 2),
	"item_dimensions" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "report_syncs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
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
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sales_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"seller_account_id" uuid,
	"order_id" text NOT NULL,
	"order_date" timestamp NOT NULL,
	"asin" text,
	"sku" text,
	"quantity" integer,
	"revenue" numeric(10, 2),
	"costs" jsonb,
	"profit" numeric(10, 2),
	"profit_margin" numeric(5, 2),
	"marketplace" text,
	"fulfillment_channel" text,
	"synced_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "seller_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"account_name" text NOT NULL,
	"marketplace_id" text NOT NULL,
	"seller_id" text NOT NULL,
	"refresh_token" text,
	"is_active" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "financial_events" ADD CONSTRAINT "financial_events_seller_account_id_seller_accounts_id_fk" FOREIGN KEY ("seller_account_id") REFERENCES "public"."seller_accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory" ADD CONSTRAINT "inventory_seller_account_id_seller_accounts_id_fk" FOREIGN KEY ("seller_account_id") REFERENCES "public"."seller_accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "products" ADD CONSTRAINT "products_seller_account_id_seller_accounts_id_fk" FOREIGN KEY ("seller_account_id") REFERENCES "public"."seller_accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "report_syncs" ADD CONSTRAINT "report_syncs_seller_account_id_seller_accounts_id_fk" FOREIGN KEY ("seller_account_id") REFERENCES "public"."seller_accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sales_data" ADD CONSTRAINT "sales_data_seller_account_id_seller_accounts_id_fk" FOREIGN KEY ("seller_account_id") REFERENCES "public"."seller_accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

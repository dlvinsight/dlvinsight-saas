ALTER TABLE "seller_accounts" ADD COLUMN "last_sync_at" timestamp;--> statement-breakpoint
ALTER TABLE "seller_accounts" ADD COLUMN "last_error_at" timestamp;--> statement-breakpoint
ALTER TABLE "seller_accounts" ADD COLUMN "last_error_message" text;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_inventory_asin_sku" ON "inventory" USING btree ("asin","sku","seller_account_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_inventory_org_id" ON "inventory" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_products_asin_sku" ON "products" USING btree ("asin","sku","seller_account_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_products_org_id" ON "products" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sales_order_date" ON "sales_data" USING btree ("order_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sales_org_id" ON "sales_data" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sales_order_id" ON "sales_data" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_seller_accounts_org_id" ON "seller_accounts" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_seller_accounts_user_id" ON "seller_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_seller_accounts_seller_id" ON "seller_accounts" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_seller_accounts_marketplace" ON "seller_accounts" USING btree ("marketplace_code");
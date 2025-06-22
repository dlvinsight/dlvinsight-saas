ALTER TABLE "seller_accounts" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "seller_accounts" ADD COLUMN "marketplace_code" text NOT NULL;--> statement-breakpoint
ALTER TABLE "seller_accounts" ADD COLUMN "marketplace_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "seller_accounts" ADD COLUMN "region" text NOT NULL;--> statement-breakpoint
ALTER TABLE "seller_accounts" ADD COLUMN "currency" text NOT NULL;--> statement-breakpoint
ALTER TABLE "seller_accounts" ADD COLUMN "currency_symbol" text NOT NULL;--> statement-breakpoint
ALTER TABLE "seller_accounts" ADD COLUMN "endpoint" text NOT NULL;--> statement-breakpoint
ALTER TABLE "seller_accounts" ADD COLUMN "aws_environment" text DEFAULT 'PRODUCTION';--> statement-breakpoint
ALTER TABLE "seller_accounts" ADD COLUMN "account_type" text DEFAULT 'Seller';--> statement-breakpoint
ALTER TABLE "seller_accounts" ADD COLUMN "lwa_client_id" text;--> statement-breakpoint
ALTER TABLE "seller_accounts" ADD COLUMN "lwa_client_secret" text;
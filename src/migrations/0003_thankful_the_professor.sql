CREATE TABLE IF NOT EXISTS "clerk_webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" text NOT NULL,
	"event_id" text NOT NULL,
	"payload" jsonb NOT NULL,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "clerk_webhook_events_event_id_unique" UNIQUE("event_id")
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_webhook_events_type" ON "clerk_webhook_events" USING btree ("event_type");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_webhook_events_processed" ON "clerk_webhook_events" USING btree ("processed_at") WHERE "clerk_webhook_events"."processed_at" IS NULL;
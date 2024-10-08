ALTER TABLE "addresses" ADD COLUMN "address_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "zip_code" text NOT NULL;--> statement-breakpoint
ALTER TABLE "addresses" DROP COLUMN IF EXISTS "postal_code";
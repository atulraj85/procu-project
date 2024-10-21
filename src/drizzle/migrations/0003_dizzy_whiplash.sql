ALTER TABLE "rfp_products" DROP CONSTRAINT "rfp_products_product_id_fkey";
--> statement-breakpoint
DROP INDEX IF EXISTS "rfp_products_rfp_id_product_id_key";--> statement-breakpoint
ALTER TABLE "rfp_products" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "rfp_products" DROP COLUMN IF EXISTS "product_id";
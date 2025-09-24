DO $$ BEGIN
 CREATE TYPE "public"."invitation_status" AS ENUM('SENT', 'VIEWED', 'QUOTED', 'DECLINED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "quotations" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "quotations" ADD COLUMN "terms_conditions" text;--> statement-breakpoint
ALTER TABLE "rfp_vendor_invitations" ADD COLUMN "status" "invitation_status" DEFAULT 'SENT' NOT NULL;--> statement-breakpoint
ALTER TABLE "rfp_vendor_invitations" ADD COLUMN "updated_at" timestamp;
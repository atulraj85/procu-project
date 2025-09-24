ALTER TABLE "quotations" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "quotations" ADD COLUMN "terms_conditions" text;--> statement-breakpoint
ALTER TABLE "rfp_vendor_invitations" ADD COLUMN "status" "invitation_status" DEFAULT 'SENT' NOT NULL;--> statement-breakpoint
ALTER TABLE "rfp_vendor_invitations" ADD COLUMN "updated_at" timestamp;
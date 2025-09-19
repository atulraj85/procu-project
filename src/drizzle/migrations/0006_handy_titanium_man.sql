DO $$ BEGIN
 CREATE TYPE "public"."approval_stage" AS ENUM('PROCUREMENT', 'FINANCE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."po_status" AS ENUM('DRAFT', 'SENT', 'ACKNOWLEDGED', 'CONFIRMED', 'RECEIVED', 'CLOSED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."quotation_status" AS ENUM('OPEN', 'SUBMITTED', 'LOCKED', 'UNDER_REVIEW', 'SHORTLISTED', 'REJECTED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."vendor_status" AS ENUM('PENDING_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "po_entities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"legal_name" text NOT NULL,
	"address" text NOT NULL,
	"gst" text,
	"created_at" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vendor_contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid NOT NULL,
	"name" text NOT NULL,
	"designation" text,
	"email" text NOT NULL,
	"phone" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp (3) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "approvers_list" ADD COLUMN "stage" "approval_stage" DEFAULT 'PROCUREMENT' NOT NULL;--> statement-breakpoint
ALTER TABLE "approvers_list" ADD COLUMN "sequence" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "pos" ADD COLUMN "status" "po_status" DEFAULT 'DRAFT' NOT NULL;--> statement-breakpoint
ALTER TABLE "pos" ADD COLUMN "entity_id" uuid;--> statement-breakpoint
ALTER TABLE "quotations" ADD COLUMN "submitted_at" timestamp (3);--> statement-breakpoint
ALTER TABLE "quotations" ADD COLUMN "locked_at" timestamp (3);--> statement-breakpoint
ALTER TABLE "quotations" ADD COLUMN "status" "quotation_status" DEFAULT 'OPEN' NOT NULL;--> statement-breakpoint
ALTER TABLE "rfps" ADD COLUMN "cutoff_at" timestamp (3) NOT NULL;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "status" "vendor_status" DEFAULT 'PENDING_REVIEW' NOT NULL;
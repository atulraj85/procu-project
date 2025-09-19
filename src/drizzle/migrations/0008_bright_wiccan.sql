ALTER TYPE "rfp_status" ADD VALUE 'REJECTED';--> statement-breakpoint
ALTER TABLE "rfps" ADD COLUMN "rejection_reason" text;
ALTER TYPE "user_role" ADD VALUE 'FINANCE_TEAM';--> statement-breakpoint
ALTER TYPE "user_role" ADD VALUE 'FINANCE_MANAGER';--> statement-breakpoint
ALTER TABLE "quotations" DROP COLUMN IF EXISTS "notes";--> statement-breakpoint
ALTER TABLE "quotations" DROP COLUMN IF EXISTS "terms_conditions";--> statement-breakpoint
ALTER TABLE "rfp_vendor_invitations" DROP COLUMN IF EXISTS "status";--> statement-breakpoint
ALTER TABLE "rfp_vendor_invitations" DROP COLUMN IF EXISTS "updated_at";
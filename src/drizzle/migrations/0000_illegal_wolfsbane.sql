DO $$ BEGIN
 CREATE TYPE "public"."approval_stage" AS ENUM('PROCUREMENT_MANAGER', 'FINANCE_MANAGER', 'FINANCE_EXECUTIVE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."message_type" AS ENUM('TEXT', 'ATTACHMENT', 'SYSTEM_MESSAGE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."po_status" AS ENUM('DRAFT', 'GENERATED', 'SENT_TO_VENDOR', 'ACKNOWLEDGED', 'IN_PROGRESS', 'DELIVERED', 'COMPLETED', 'CANCELLED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."quotation_status" AS ENUM('OPEN', 'SUBMITTED', 'LOCKED', 'UNDER_REVIEW', 'SHORTLISTED', 'SELECTED', 'REJECTED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."rfp_status" AS ENUM('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SENT_TO_VENDORS', 'QUOTATION_RECEIVED', 'VENDOR_SELECTED', 'PO_GENERATED', 'DELIVERED', 'COMPLETED', 'CANCELLED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."user_role" AS ENUM('SYSTEM_ADMIN', 'PROCUREMENT_MANAGER', 'PROCUREMENT_LEAD', 'ADMIN_TEAM', 'FINANCE_TEAM', 'FINANCE_EXECUTIVE', 'USER', 'VENDOR');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."vendor_status" AS ENUM('PENDING_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED', 'BLACKLISTED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"priority" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_trails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" uuid NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"metadata" jsonb,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "conversation_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rfp_id" uuid NOT NULL,
	"thread_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"sender_type" varchar(20) NOT NULL,
	"message_type" "message_type" NOT NULL,
	"content" text,
	"attachments" jsonb,
	"parent_message_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "email_verification_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"token" uuid DEFAULT gen_random_uuid() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "goods_receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"po_id" uuid NOT NULL,
	"received_by" uuid NOT NULL,
	"received_at" timestamp NOT NULL,
	"received_items" jsonb NOT NULL,
	"partial_delivery" boolean DEFAULT false NOT NULL,
	"quality_check" boolean DEFAULT false NOT NULL,
	"quality_notes" text,
	"invoice_number" varchar(100),
	"invoice_date" timestamp,
	"invoice_amount" numeric(15, 2),
	"supporting_documents" jsonb,
	"vendor_rating" integer,
	"feedback" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"legal_name" varchar(255) NOT NULL,
	"gstin" varchar(15),
	"pan" varchar(10),
	"address" text NOT NULL,
	"city" varchar(100) NOT NULL,
	"state" varchar(100) NOT NULL,
	"pincode" varchar(10) NOT NULL,
	"country" varchar(100) DEFAULT 'India' NOT NULL,
	"phone" varchar(20),
	"email" varchar(255),
	"website" varchar(255),
	"logo" text,
	"stamp" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "po_entities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"legal_name" varchar(255) NOT NULL,
	"address" text NOT NULL,
	"gstin" varchar(15),
	"organization_id" uuid NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"token" uuid DEFAULT gen_random_uuid() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"parent_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"requires_approval" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"category_id" uuid NOT NULL,
	"brand" varchar(100),
	"model_number" varchar(100),
	"specifications" jsonb,
	"keywords" text[],
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "purchase_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"po_number" varchar(50) NOT NULL,
	"rfp_id" uuid NOT NULL,
	"quotation_id" uuid NOT NULL,
	"vendor_id" uuid NOT NULL,
	"entity_id" uuid NOT NULL,
	"line_items" jsonb NOT NULL,
	"subtotal" numeric(15, 2) NOT NULL,
	"gst_amount" numeric(15, 2) NOT NULL,
	"total_amount" numeric(15, 2) NOT NULL,
	"delivery_date" timestamp NOT NULL,
	"delivery_address" text NOT NULL,
	"payment_terms" text,
	"other_terms" text,
	"status" "po_status" DEFAULT 'DRAFT' NOT NULL,
	"generated_by" uuid NOT NULL,
	"acknowledged_at" timestamp,
	"penalty_clause" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "question_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid,
	"questions" jsonb NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quotations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rfp_id" uuid NOT NULL,
	"vendor_id" uuid NOT NULL,
	"quotation_number" varchar(50),
	"line_item_quotes" jsonb NOT NULL,
	"subtotal" numeric(15, 2) NOT NULL,
	"gst_amount" numeric(15, 2) NOT NULL,
	"total_amount" numeric(15, 2) NOT NULL,
	"other_charges" jsonb,
	"supporting_documents" jsonb,
	"valid_till" timestamp NOT NULL,
	"delivery_timeline" varchar(100),
	"status" "quotation_status" DEFAULT 'OPEN' NOT NULL,
	"submitted_at" timestamp,
	"locked_at" timestamp,
	"evaluation_score" numeric(5, 2),
	"evaluation_notes" text,
	"is_shortlisted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rfp_approvals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rfp_id" uuid NOT NULL,
	"approver_id" uuid NOT NULL,
	"stage" "approval_stage" NOT NULL,
	"sequence" integer NOT NULL,
	"approved" boolean,
	"approved_at" timestamp,
	"comments" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rfps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rfp_number" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"line_items" jsonb NOT NULL,
	"delivery_location" text NOT NULL,
	"delivery_states" text[],
	"delivery_date" timestamp NOT NULL,
	"question_template_id" uuid,
	"question_answers" jsonb,
	"estimated_budget" numeric(15, 2),
	"currency" varchar(3) DEFAULT 'INR',
	"status" "rfp_status" DEFAULT 'DRAFT' NOT NULL,
	"created_by" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"selection_criteria" jsonb,
	"quotation_cutoff_date" timestamp NOT NULL,
	"rejection_reason" text,
	"conversation_threads" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rfp_vendor_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rfp_id" uuid NOT NULL,
	"vendor_id" uuid NOT NULL,
	"invited_at" timestamp NOT NULL,
	"invited_by" uuid NOT NULL,
	"access_token" uuid DEFAULT gen_random_uuid() NOT NULL,
	"viewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"email_verified" timestamp,
	"password" varchar(255) NOT NULL,
	"mobile" varchar(20),
	"role" "user_role" DEFAULT 'USER' NOT NULL,
	"organization_id" uuid NOT NULL,
	"vendor_id" uuid,
	"profile_pic" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vendor_contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"designation" varchar(100),
	"email" varchar(255) NOT NULL,
	"phone" varchar(20),
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vendor_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"brand_offered" varchar(100),
	"model_offered" varchar(100),
	"specifications" jsonb,
	"base_price" numeric(12, 2),
	"currency" varchar(3) DEFAULT 'INR',
	"is_currently_offered" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vendors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"legal_name" varchar(255),
	"gstin" varchar(15),
	"pan" varchar(10),
	"business_registration_year" integer,
	"employee_count" varchar(50),
	"logo" text,
	"description" text,
	"address" text NOT NULL,
	"city" varchar(100) NOT NULL,
	"state" varchar(100) NOT NULL,
	"pincode" varchar(10) NOT NULL,
	"country" varchar(100) DEFAULT 'India' NOT NULL,
	"phone" varchar(20),
	"email" varchar(255),
	"website" varchar(255),
	"specializations" text[],
	"certifications" jsonb,
	"social_media_links" jsonb,
	"status" "vendor_status" DEFAULT 'PENDING_REVIEW' NOT NULL,
	"verified_by" uuid,
	"verified_at" timestamp,
	"dealing_keywords" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audit_trails" ADD CONSTRAINT "audit_trails_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."audit_events"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audit_trails" ADD CONSTRAINT "audit_trails_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conversation_messages" ADD CONSTRAINT "conversation_messages_rfp_id_fkey" FOREIGN KEY ("rfp_id") REFERENCES "public"."rfps"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conversation_messages" ADD CONSTRAINT "conversation_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conversation_messages" ADD CONSTRAINT "conversation_messages_parent_message_id_fkey" FOREIGN KEY ("parent_message_id") REFERENCES "public"."conversation_messages"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "goods_receipts" ADD CONSTRAINT "goods_receipts_po_id_fkey" FOREIGN KEY ("po_id") REFERENCES "public"."purchase_orders"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "goods_receipts" ADD CONSTRAINT "goods_receipts_received_by_fkey" FOREIGN KEY ("received_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "po_entities" ADD CONSTRAINT "po_entities_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."product_categories"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_rfp_id_fkey" FOREIGN KEY ("rfp_id") REFERENCES "public"."rfps"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "public"."quotations"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "public"."po_entities"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_generated_by_fkey" FOREIGN KEY ("generated_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "question_templates" ADD CONSTRAINT "question_templates_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "question_templates" ADD CONSTRAINT "question_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quotations" ADD CONSTRAINT "quotations_rfp_id_fkey" FOREIGN KEY ("rfp_id") REFERENCES "public"."rfps"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quotations" ADD CONSTRAINT "quotations_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rfp_approvals" ADD CONSTRAINT "rfp_approvals_rfp_id_fkey" FOREIGN KEY ("rfp_id") REFERENCES "public"."rfps"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rfp_approvals" ADD CONSTRAINT "rfp_approvals_approver_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rfps" ADD CONSTRAINT "rfps_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rfps" ADD CONSTRAINT "rfps_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rfps" ADD CONSTRAINT "rfps_question_template_id_fkey" FOREIGN KEY ("question_template_id") REFERENCES "public"."question_templates"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rfp_vendor_invitations" ADD CONSTRAINT "rfp_vendor_invitations_rfp_id_fkey" FOREIGN KEY ("rfp_id") REFERENCES "public"."rfps"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rfp_vendor_invitations" ADD CONSTRAINT "rfp_vendor_invitations_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rfp_vendor_invitations" ADD CONSTRAINT "rfp_vendor_invitations_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vendor_contacts" ADD CONSTRAINT "vendor_contacts_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vendor_products" ADD CONSTRAINT "vendor_products_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vendor_products" ADD CONSTRAINT "vendor_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vendors" ADD CONSTRAINT "vendors_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "audit_events_name_idx" ON "audit_events" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_trails_event_idx" ON "audit_trails" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_trails_user_idx" ON "audit_trails" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_trails_entity_idx" ON "audit_trails" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_trails_created_at_idx" ON "audit_trails" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "conversation_messages_rfp_thread_idx" ON "conversation_messages" USING btree ("rfp_id","thread_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "conversation_messages_created_at_idx" ON "conversation_messages" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "email_verification_tokens_email_token_idx" ON "email_verification_tokens" USING btree ("email","token");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "email_verification_tokens_token_idx" ON "email_verification_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "goods_receipts_po_idx" ON "goods_receipts" USING btree ("po_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "organizations_gstin_idx" ON "organizations" USING btree ("gstin");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "organizations_pan_idx" ON "organizations" USING btree ("pan");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "po_entities_name_idx" ON "po_entities" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "password_reset_tokens_email_token_idx" ON "password_reset_tokens" USING btree ("email","token");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "password_reset_tokens_token_idx" ON "password_reset_tokens" USING btree ("token");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "product_categories_name_idx" ON "product_categories" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_name_idx" ON "products" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_keywords_idx" ON "products" USING gin ("keywords");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "purchase_orders_po_number_idx" ON "purchase_orders" USING btree ("po_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "purchase_orders_status_idx" ON "purchase_orders" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "quotations_rfp_vendor_idx" ON "quotations" USING btree ("rfp_id","vendor_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quotations_status_idx" ON "quotations" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "rfp_approvals_rfp_approver_idx" ON "rfp_approvals" USING btree ("rfp_id","approver_id","stage");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "rfps_rfp_number_idx" ON "rfps" USING btree ("rfp_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "rfps_status_idx" ON "rfps" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "rfp_vendor_invitations_rfp_vendor_idx" ON "rfp_vendor_invitations" USING btree ("rfp_id","vendor_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "rfp_vendor_invitations_access_token_idx" ON "rfp_vendor_invitations" USING btree ("access_token");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_name_email_mobile_idx" ON "users" USING btree ("name","email","mobile");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "vendor_products_vendor_product_idx" ON "vendor_products" USING btree ("vendor_id","product_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "vendors_gstin_idx" ON "vendors" USING btree ("gstin");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "vendors_company_name_idx" ON "vendors" USING btree ("company_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "vendors_keywords_idx" ON "vendors" USING gin ("dealing_keywords");
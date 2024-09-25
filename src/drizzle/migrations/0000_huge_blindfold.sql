DO $$ BEGIN
 CREATE TYPE "public"."AddressType" AS ENUM('BUSINESS', 'SHIPPING');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."RFPStatus" AS ENUM('DRAFT', 'SUBMITTED', 'PO_CREATED', 'ADVANCE_PAID', 'INVOICE_RECEIVED', 'GRN_RECEIVED', 'PAYMENT_DONE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."Role" AS ENUM('ADMIN', 'PR_MANAGER', 'FINANCE_MANAGER', 'ACCOUNTANT', 'QUALITY_ASSURANCE', 'USER', 'VENDOR');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "AuditTrail" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"details" jsonb NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "AuditableEvent" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"priority" integer NOT NULL,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Company" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"website" text,
	"industry" text,
	"foundedDate" timestamp(3),
	"status" text,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL,
	"GST" text,
	"logo" text,
	"stamp" text,
	"gstAddress" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "EmailVerificationToken" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"token" uuid NOT NULL,
	"expires_at" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"token" uuid NOT NULL,
	"expires_at" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "RFPQueryResponse" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" varchar(255) NOT NULL,
	"query_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"parent_query_response_id" uuid,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "RFPQuery" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" varchar(255) NOT NULL,
	"rfp_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "User" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" timestamp(3),
	"password" text NOT NULL,
	"mobile" text,
	"role" "Role" DEFAULT 'USER' NOT NULL,
	"companyId" uuid NOT NULL,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Address" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"street" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"postalCode" text NOT NULL,
	"country" text NOT NULL,
	"addressType" "AddressType" NOT NULL,
	"companyId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ApproversList" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rfpId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"approved" boolean DEFAULT false NOT NULL,
	"approvedAt" timestamp(3),
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "GoodStatus" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoiceId" uuid NOT NULL,
	"deliveryStatus" boolean NOT NULL,
	"qualityAssurance" boolean NOT NULL,
	"qualityAssuranceLeaderId" uuid NOT NULL,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Invoice" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"poId" uuid NOT NULL,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "OtherCharge" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quotationId" uuid NOT NULL,
	"name" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"gst" numeric(5, 2) NOT NULL,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Payment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoiceId" uuid NOT NULL,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PO" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"poId" text NOT NULL,
	"quotationId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"companyId" uuid NOT NULL,
	"rfpId" uuid NOT NULL,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL,
	"remarks" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"checksum" varchar(64) NOT NULL,
	"finished_at" timestamp with time zone,
	"migration_name" varchar(255) NOT NULL,
	"logs" text,
	"rolled_back_at" timestamp with time zone,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"applied_steps_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Product" (
	"name" text NOT NULL,
	"modelNo" text NOT NULL,
	"specification" text NOT NULL,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"productCategoryId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ProductCategory" (
	"name" text NOT NULL,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "QualityAssurance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Quotation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rfpId" uuid NOT NULL,
	"vendorId" uuid NOT NULL,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL,
	"isPrimary" boolean DEFAULT false NOT NULL,
	"totalAmount" numeric(10, 2) NOT NULL,
	"refNo" text,
	"totalAmountWithoutGST" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "RFP" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rfpId" varchar(255) NOT NULL,
	"requirementType" text NOT NULL,
	"dateOfOrdering" timestamp(3) NOT NULL,
	"deliveryLocation" text NOT NULL,
	"deliveryByDate" timestamp(3) NOT NULL,
	"userId" uuid NOT NULL,
	"rfpStatus" "RFPStatus" DEFAULT 'DRAFT' NOT NULL,
	"preferredQuotationId" uuid,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "RFPProduct" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rfpId" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL,
	"description" text,
	"productId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "SupportingDocument" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quotationId" uuid NOT NULL,
	"documentType" text NOT NULL,
	"documentName" text NOT NULL,
	"location" text NOT NULL,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Vendor" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customerCode" text,
	"primaryName" text NOT NULL,
	"companyName" text NOT NULL,
	"contactDisplayName" text NOT NULL,
	"email" text,
	"workPhone" text,
	"mobile" text,
	"website" text,
	"gstin" text,
	"msmeNo" text,
	"address" text,
	"customerState" text,
	"customerCity" text,
	"country" text,
	"zip" text,
	"remarks" text,
	"pan" text,
	"verifiedById" uuid,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "VendorPricing" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quotationId" uuid NOT NULL,
	"rfpProductId" uuid NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL,
	"GST" integer NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "AuditTrail" ADD CONSTRAINT "AuditTrail_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."AuditableEvent"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "AuditTrail" ADD CONSTRAINT "AuditTrail_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "RFPQueryResponse" ADD CONSTRAINT "RFPQueryResponse_query_id_fkey" FOREIGN KEY ("query_id") REFERENCES "public"."RFPQuery"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "RFPQueryResponse" ADD CONSTRAINT "RFPQueryResponse_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "RFPQueryResponse" ADD CONSTRAINT "RFPQueryResponse_parent_query_response_id_fkey" FOREIGN KEY ("parent_query_response_id") REFERENCES "public"."RFPQueryResponse"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "RFPQuery" ADD CONSTRAINT "RFPQuery_rfp_id_fkey" FOREIGN KEY ("rfp_id") REFERENCES "public"."RFP"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "RFPQuery" ADD CONSTRAINT "RFPQuery_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Address" ADD CONSTRAINT "Address_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ApproversList" ADD CONSTRAINT "ApproversList_rfpId_fkey" FOREIGN KEY ("rfpId") REFERENCES "public"."RFP"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ApproversList" ADD CONSTRAINT "ApproversList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "GoodStatus" ADD CONSTRAINT "GoodStatus_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "public"."Invoice"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "GoodStatus" ADD CONSTRAINT "GoodStatus_qualityAssuranceLeaderId_fkey" FOREIGN KEY ("qualityAssuranceLeaderId") REFERENCES "public"."QualityAssurance"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_poId_fkey" FOREIGN KEY ("poId") REFERENCES "public"."PO"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "OtherCharge" ADD CONSTRAINT "OtherCharge_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "public"."Quotation"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Payment" ADD CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "public"."Invoice"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PO" ADD CONSTRAINT "PO_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "public"."Quotation"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PO" ADD CONSTRAINT "PO_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PO" ADD CONSTRAINT "PO_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PO" ADD CONSTRAINT "PO_rfpId_fkey" FOREIGN KEY ("rfpId") REFERENCES "public"."RFP"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Product" ADD CONSTRAINT "Product_productCategoryId_fkey" FOREIGN KEY ("productCategoryId") REFERENCES "public"."ProductCategory"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "QualityAssurance" ADD CONSTRAINT "QualityAssurance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_rfpId_fkey" FOREIGN KEY ("rfpId") REFERENCES "public"."RFP"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."Vendor"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "RFP" ADD CONSTRAINT "RFP_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "RFPProduct" ADD CONSTRAINT "RFPProduct_rfpId_fkey" FOREIGN KEY ("rfpId") REFERENCES "public"."RFP"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "RFPProduct" ADD CONSTRAINT "RFPProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "SupportingDocument" ADD CONSTRAINT "SupportingDocument_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "public"."Quotation"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "VendorPricing" ADD CONSTRAINT "VendorPricing_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "public"."Quotation"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "VendorPricing" ADD CONSTRAINT "VendorPricing_rfpProductId_fkey" FOREIGN KEY ("rfpProductId") REFERENCES "public"."RFPProduct"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "AuditTrail_eventId_idx" ON "AuditTrail" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "AuditTrail_user_id_idx" ON "AuditTrail" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "AuditableEvent_name_key" ON "AuditableEvent" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Company_GST_key" ON "Company" USING btree ("GST");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Company_email_key" ON "Company" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "EmailVerificationToken_email_token_key" ON "EmailVerificationToken" USING btree ("email","token");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "EmailVerificationToken_token_key" ON "EmailVerificationToken" USING btree ("token");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "PasswordResetToken_email_token_key" ON "PasswordResetToken" USING btree ("email","token");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "PasswordResetToken_token_key" ON "PasswordResetToken" USING btree ("token");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "User_name_email_mobile_idx" ON "User" USING btree ("name","email","mobile");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "ApproversList_rfpId_userId_key" ON "ApproversList" USING btree ("rfpId","userId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "GoodStatus_invoiceId_key" ON "GoodStatus" USING btree ("invoiceId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Invoice_poId_key" ON "Invoice" USING btree ("poId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "OtherCharge_quotationId_name_key" ON "OtherCharge" USING btree ("quotationId","name");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "PO_poId_key" ON "PO" USING btree ("poId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "PO_quotationId_key" ON "PO" USING btree ("quotationId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "PO_rfpId_key" ON "PO" USING btree ("rfpId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Product_name_modelNo_specification_idx" ON "Product" USING btree ("name","modelNo","specification");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "ProductCategory_name_key" ON "ProductCategory" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "QualityAssurance_userId_key" ON "QualityAssurance" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "RFP_rfpId_idx" ON "RFP" USING btree ("rfpId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "RFP_rfpId_key" ON "RFP" USING btree ("rfpId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "RFPProduct_rfpId_productId_key" ON "RFPProduct" USING btree ("rfpId","productId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Vendor_gstin_key" ON "Vendor" USING btree ("gstin");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Vendor_primaryName_companyName_contactDisplayName_email_mob_idx" ON "Vendor" USING btree ("primaryName","companyName","contactDisplayName","email","mobile","gstin");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "VendorPricing_quotationId_rfpProductId_key" ON "VendorPricing" USING btree ("quotationId","rfpProductId");
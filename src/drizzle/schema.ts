import { relations, sql } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// =====================
// Enums
// =====================
export const UserRole = pgEnum("user_role", [
  "SYSTEM_ADMIN",
  "PROCUREMENT_MANAGER", 
  "PROCUREMENT_LEAD",
  "ADMIN_TEAM",
  "FINANCE_TEAM",
  "FINANCE_EXECUTIVE",
  "USER",
  "VENDOR"
]);

export const RFPStatus = pgEnum("rfp_status", [
  "DRAFT",
  "PENDING_APPROVAL",
  "APPROVED",
  "REJECTED",
  "SENT_TO_VENDORS",
  "QUOTATION_RECEIVED",
  "VENDOR_SELECTED",
  "PO_GENERATED",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED"
]);

export const QuotationStatus = pgEnum("quotation_status", [
  "OPEN",
  "SUBMITTED", 
  "LOCKED",
  "UNDER_REVIEW",
  "SHORTLISTED",
  "SELECTED",
  "REJECTED"
]);

export const POStatus = pgEnum("po_status", [
  "DRAFT",
  "GENERATED",
  "SENT_TO_VENDOR",
  "ACKNOWLEDGED",
  "IN_PROGRESS",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED"
]);

export const VendorStatus = pgEnum("vendor_status", [
  "PENDING_REVIEW",
  "APPROVED", 
  "REJECTED",
  "SUSPENDED",
  "BLACKLISTED"
]);

export const ApprovalStage = pgEnum("approval_stage", [
  "PROCUREMENT_MANAGER",
  "FINANCE_MANAGER", 
  "FINANCE_EXECUTIVE"
]);

export const MessageType = pgEnum("message_type", [
  "TEXT",
  "ATTACHMENT",
  "SYSTEM_MESSAGE"
]);

// =====================
// Core Tables
// =====================

// Organizations Table
export const OrganizationTable = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  legalName: varchar("legal_name", { length: 255 }).notNull(),
  gstin: varchar("gstin", { length: 15 }),
  pan: varchar("pan", { length: 10 }),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  pincode: varchar("pincode", { length: 10 }).notNull(),
  country: varchar("country", { length: 100 }).default("India").notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  website: varchar("website", { length: 255 }),
  logo: text("logo"),
  stamp: text("stamp"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").notNull()
}, (table) => ({
  gstinIdx: uniqueIndex("organizations_gstin_idx").on(table.gstin),
  panIdx: uniqueIndex("organizations_pan_idx").on(table.pan)
}));

// Users Table  
export const UserTable = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  password: varchar("password", { length: 255 }).notNull(),
  mobile: varchar("mobile", { length: 20 }),
  role: UserRole("role").default("USER").notNull(),
  organizationId: uuid("organization_id"),
  vendorId: uuid("vendor_id"), // Reference to VendorTable if user is vendor
  profilePic: text("profile_pic"),
  isActive: boolean("is_active").default(true).notNull(),
  lastLoginAt: timestamp("last_login_at", { mode: "date" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").notNull()
}, (table) => ({
  emailIdx: uniqueIndex("users_email_idx").on(table.email),
  nameEmailMobileIdx: index("users_name_email_mobile_idx").on(
    table.name, table.email, table.mobile
  ),
  userOrganizationFkey: foreignKey({
    columns: [table.organizationId],
    foreignColumns: [OrganizationTable.id],
    name: "users_organization_id_fkey"
  }).onUpdate("cascade").onDelete("restrict")
}));

// Product Categories Table
export const ProductCategoryTable = pgTable("product_categories", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  parentId: uuid("parent_id"), // For subcategories
  isActive: boolean("is_active").default(true).notNull(),
  requiresApproval: boolean("requires_approval").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").notNull()
}, (table) => ({
  nameIdx: uniqueIndex("product_categories_name_idx").on(table.name),
  parentFkey: foreignKey({
    columns: [table.parentId],
    foreignColumns: [table.id],
    name: "product_categories_parent_id_fkey"
  }).onUpdate("cascade").onDelete("set null")
}));

// Products Table
export const ProductTable = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  categoryId: uuid("category_id").notNull(),
  brand: varchar("brand", { length: 100 }),
  modelNumber: varchar("model_number", { length: 100 }),
  specifications: jsonb("specifications"), // Dynamic specs based on category
  keywords: text("keywords").array(), // For search
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").notNull()
}, (table) => ({
  nameIdx: index("products_name_idx").on(table.name),
  categoryFkey: foreignKey({
    columns: [table.categoryId],
    foreignColumns: [ProductCategoryTable.id],
    name: "products_category_id_fkey"
  }).onUpdate("cascade").onDelete("restrict"),
  keywordsIdx: index("products_keywords_idx").using("gin", table.keywords)
}));

// Question Templates Table (for RFP questions)
export const QuestionTemplateTable = pgTable("question_templates", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  categoryId: uuid("category_id"), // Optional: category-specific questions
  questions: jsonb("questions").notNull(), // Array of question objects
  version: integer("version").default(1).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").notNull()
}, (table) => ({
  categoryFkey: foreignKey({
    columns: [table.categoryId],
    foreignColumns: [ProductCategoryTable.id],
    name: "question_templates_category_id_fkey"
  }).onUpdate("cascade").onDelete("set null"),
  createdByFkey: foreignKey({
    columns: [table.createdBy],
    foreignColumns: [UserTable.id],
    name: "question_templates_created_by_fkey"
  }).onUpdate("cascade").onDelete("restrict")
}));

// Vendors Table
export const VendorTable = pgTable("vendors", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  legalName: varchar("legal_name", { length: 255 }),
  gstin: varchar("gstin", { length: 15 }),
  pan: varchar("pan", { length: 10 }),
  businessRegistrationYear: integer("business_registration_year"),
  employeeCount: varchar("employee_count", { length: 50 }),
  logo: text("logo"),
  description: text("description"),
  
  // Address
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  pincode: varchar("pincode", { length: 10 }).notNull(),
  country: varchar("country", { length: 100 }).default("India").notNull(),
  
  // Contact Details
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  website: varchar("website", { length: 255 }),
  
  // Business Details
  specializations: text("specializations").array(),
  certifications: jsonb("certifications"), // Array of certification objects
  socialMediaLinks: jsonb("social_media_links"),
  
  // Status and Verification
  status: VendorStatus("status").default("PENDING_REVIEW").notNull(),
  verifiedBy: uuid("verified_by"),
  verifiedAt: timestamp("verified_at", { mode: "date" }),
  
  // Product Keywords for matching
  dealingKeywords: text("dealing_keywords").array(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").notNull()
}, (table) => ({
  gstinIdx: uniqueIndex("vendors_gstin_idx").on(table.gstin),
  companyNameIdx: index("vendors_company_name_idx").on(table.companyName),
  keywordsIdx: index("vendors_keywords_idx").using("gin", table.dealingKeywords),
  verifiedByFkey: foreignKey({
    columns: [table.verifiedBy],
    foreignColumns: [UserTable.id],
    name: "vendors_verified_by_fkey"
  }).onUpdate("cascade").onDelete("set null")
}));

// Vendor Contacts Table
export const VendorContactTable = pgTable("vendor_contacts", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  vendorId: uuid("vendor_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  designation: varchar("designation", { length: 100 }),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  isPrimary: boolean("is_primary").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").notNull()
}, (table) => ({
  vendorFkey: foreignKey({
    columns: [table.vendorId],
    foreignColumns: [VendorTable.id],
    name: "vendor_contacts_vendor_id_fkey"
  }).onUpdate("cascade").onDelete("cascade")
}));

// Vendor Products Table
export const VendorProductTable = pgTable("vendor_products", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  vendorId: uuid("vendor_id").notNull(),
  productId: uuid("product_id").notNull(),
  brandOffered: varchar("brand_offered", { length: 100 }),
  modelOffered: varchar("model_offered", { length: 100 }),
  specifications: jsonb("specifications"),
  basePrice: numeric("base_price", { precision: 12, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("INR"),
  isCurrentlyOffered: boolean("is_currently_offered").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").notNull()
}, (table) => ({
  vendorProductIdx: uniqueIndex("vendor_products_vendor_product_idx").on(
    table.vendorId, table.productId
  ),
  vendorFkey: foreignKey({
    columns: [table.vendorId],
    foreignColumns: [VendorTable.id],
    name: "vendor_products_vendor_id_fkey"
  }).onUpdate("cascade").onDelete("cascade"),
  productFkey: foreignKey({
    columns: [table.productId],
    foreignColumns: [ProductTable.id],
    name: "vendor_products_product_id_fkey"
  }).onUpdate("cascade").onDelete("cascade")
}));

// RFP Table
export const RFPTable = pgTable("rfps", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  rfpNumber: varchar("rfp_number", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  // Technical Section
  lineItems: jsonb("line_items").notNull(), // Array of requested products with quantities
  deliveryLocation: text("delivery_location").notNull(),
  deliveryStates: text("delivery_states").array(), // Multiple states allowed
  deliveryDate: timestamp("delivery_date", { mode: "date" }).notNull(),
  
  // Questions and Answers
  questionTemplateId: uuid("question_template_id"),
  questionAnswers: jsonb("question_answers"), // User's answers to questions
  
  // Financial Section  
  estimatedBudget: numeric("estimated_budget", { precision: 15, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("INR"),
  
  // Workflow
  status: RFPStatus("status").default("DRAFT").notNull(),
  createdBy: uuid("created_by").notNull(),
  organizationId: uuid("organization_id").notNull(),
  
  // Vendor Selection Criteria
  selectionCriteria: jsonb("selection_criteria"), // Certification requirements etc.
  
  // Timeline
  quotationCutoffDate: timestamp("quotation_cutoff_date", { mode: "date" }).notNull(),
  
  // Approval tracking
  rejectionReason: text("rejection_reason"),
  
  // Conversations (thread-based)
  conversationThreads: jsonb("conversation_threads").default([]).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").notNull()
}, (table) => ({
  rfpNumberIdx: uniqueIndex("rfps_rfp_number_idx").on(table.rfpNumber),
  statusIdx: index("rfps_status_idx").on(table.status),
  createdByFkey: foreignKey({
    columns: [table.createdBy],
    foreignColumns: [UserTable.id],
    name: "rfps_created_by_fkey"
  }).onUpdate("cascade").onDelete("restrict"),
  organizationFkey: foreignKey({
    columns: [table.organizationId],
    foreignColumns: [OrganizationTable.id],
    name: "rfps_organization_id_fkey"
  }).onUpdate("cascade").onDelete("restrict"),
  questionTemplateFkey: foreignKey({
    columns: [table.questionTemplateId],
    foreignColumns: [QuestionTemplateTable.id],
    name: "rfps_question_template_id_fkey"
  }).onUpdate("cascade").onDelete("set null")
}));

// RFP Approvals Table
export const RFPApprovalTable = pgTable("rfp_approvals", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  rfpId: uuid("rfp_id").notNull(),
  approverId: uuid("approver_id").notNull(),
  stage: ApprovalStage("stage").notNull(),
  sequence: integer("sequence").notNull(), // Order of approval
  approved: boolean("approved"),
  approvedAt: timestamp("approved_at", { mode: "date" }),
  comments: text("comments"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").notNull()
}, (table) => ({
  rfpApproverIdx: uniqueIndex("rfp_approvals_rfp_approver_idx").on(
    table.rfpId, table.approverId, table.stage
  ),
  rfpFkey: foreignKey({
    columns: [table.rfpId],
    foreignColumns: [RFPTable.id],
    name: "rfp_approvals_rfp_id_fkey"
  }).onUpdate("cascade").onDelete("cascade"),
  approverFkey: foreignKey({
    columns: [table.approverId],
    foreignColumns: [UserTable.id],
    name: "rfp_approvals_approver_id_fkey"
  }).onUpdate("cascade").onDelete("restrict")
}));

// RFP Vendor Invitations Table
export const RFPVendorInvitationTable = pgTable("rfp_vendor_invitations", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  rfpId: uuid("rfp_id").notNull(),
  vendorId: uuid("vendor_id").notNull(),
  invitedAt: timestamp("invited_at", { mode: "date" }).notNull(),
  invitedBy: uuid("invited_by").notNull(),
  accessToken: uuid("access_token").defaultRandom().notNull(), // For vendor access
  viewedAt: timestamp("viewed_at", { mode: "date" }),
  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => ({
  rfpVendorIdx: uniqueIndex("rfp_vendor_invitations_rfp_vendor_idx").on(
    table.rfpId, table.vendorId
  ),
  accessTokenIdx: uniqueIndex("rfp_vendor_invitations_access_token_idx").on(
    table.accessToken
  ),
  rfpFkey: foreignKey({
    columns: [table.rfpId],
    foreignColumns: [RFPTable.id],
    name: "rfp_vendor_invitations_rfp_id_fkey"
  }).onUpdate("cascade").onDelete("cascade"),
  vendorFkey: foreignKey({
    columns: [table.vendorId],
    foreignColumns: [VendorTable.id],
    name: "rfp_vendor_invitations_vendor_id_fkey"
  }).onUpdate("cascade").onDelete("cascade"),
  invitedByFkey: foreignKey({
    columns: [table.invitedBy],
    foreignColumns: [UserTable.id],
    name: "rfp_vendor_invitations_invited_by_fkey"
  }).onUpdate("cascade").onDelete("restrict")
}));

// Quotations Table
export const QuotationTable = pgTable("quotations", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  rfpId: uuid("rfp_id").notNull(),
  vendorId: uuid("vendor_id").notNull(),
  quotationNumber: varchar("quotation_number", { length: 50 }),
  
  // Technical Quote - Line items with pricing
  lineItemQuotes: jsonb("line_item_quotes").notNull(), // Array of quoted items
  
  // Financial Summary
  subtotal: numeric("subtotal", { precision: 15, scale: 2 }).notNull(),
  gstAmount: numeric("gst_amount", { precision: 15, scale: 2 }).notNull(),
  totalAmount: numeric("total_amount", { precision: 15, scale: 2 }).notNull(),
  
  // Additional charges
  otherCharges: jsonb("other_charges"), // Array of miscellaneous charges
  
  // Supporting documents
  supportingDocuments: jsonb("supporting_documents"), // Array of document objects
  
  // Timeline
  validTill: timestamp("valid_till", { mode: "date" }).notNull(),
  deliveryTimeline: varchar("delivery_timeline", { length: 100 }),
  
  // Status
  status: QuotationStatus("status").default("OPEN").notNull(),
  submittedAt: timestamp("submitted_at", { mode: "date" }),
  lockedAt: timestamp("locked_at", { mode: "date" }),
  
  // Evaluation
  evaluationScore: numeric("evaluation_score", { precision: 5, scale: 2 }),
  evaluationNotes: text("evaluation_notes"),
  isShortlisted: boolean("is_shortlisted").default(false).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").notNull()
}, (table) => ({
  rfpVendorIdx: uniqueIndex("quotations_rfp_vendor_idx").on(
    table.rfpId, table.vendorId
  ),
  statusIdx: index("quotations_status_idx").on(table.status),
  rfpFkey: foreignKey({
    columns: [table.rfpId],
    foreignColumns: [RFPTable.id],
    name: "quotations_rfp_id_fkey"
  }).onUpdate("cascade").onDelete("cascade"),
  vendorFkey: foreignKey({
    columns: [table.vendorId],
    foreignColumns: [VendorTable.id],
    name: "quotations_vendor_id_fkey"
  }).onUpdate("cascade").onDelete("cascade")
}));

// PO Entities Table (MM, MH, Mavericks etc.)
export const POEntityTable = pgTable("po_entities", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  legalName: varchar("legal_name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  gstin: varchar("gstin", { length: 15 }),
  organizationId: uuid("organization_id").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => ({
  nameIdx: uniqueIndex("po_entities_name_idx").on(table.name),
  organizationFkey: foreignKey({
    columns: [table.organizationId],
    foreignColumns: [OrganizationTable.id],
    name: "po_entities_organization_id_fkey"
  }).onUpdate("cascade").onDelete("restrict")
}));

// Purchase Orders Table
export const PurchaseOrderTable = pgTable("purchase_orders", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  poNumber: varchar("po_number", { length: 50 }).notNull(),
  rfpId: uuid("rfp_id").notNull(),
  quotationId: uuid("quotation_id").notNull(),
  vendorId: uuid("vendor_id").notNull(),
  entityId: uuid("entity_id").notNull(), // Which entity is issuing PO
  
  // PO Details
  lineItems: jsonb("line_items").notNull(), // From selected quotation
  subtotal: numeric("subtotal", { precision: 15, scale: 2 }).notNull(),
  gstAmount: numeric("gst_amount", { precision: 15, scale: 2 }).notNull(),
  totalAmount: numeric("total_amount", { precision: 15, scale: 2 }).notNull(),
  
  // Terms
  deliveryDate: timestamp("delivery_date", { mode: "date" }).notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  paymentTerms: text("payment_terms"),
  otherTerms: text("other_terms"),
  
  // Workflow
  status: POStatus("status").default("DRAFT").notNull(),
  generatedBy: uuid("generated_by").notNull(),
  acknowledgedAt: timestamp("acknowledged_at", { mode: "date" }),
  
  // Penalty clause
  penaltyClause: text("penalty_clause"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").notNull()
}, (table) => ({
  poNumberIdx: uniqueIndex("purchase_orders_po_number_idx").on(table.poNumber),
  statusIdx: index("purchase_orders_status_idx").on(table.status),
  rfpFkey: foreignKey({
    columns: [table.rfpId],
    foreignColumns: [RFPTable.id],
    name: "purchase_orders_rfp_id_fkey"
  }).onUpdate("cascade").onDelete("restrict"),
  quotationFkey: foreignKey({
    columns: [table.quotationId],
    foreignColumns: [QuotationTable.id],
    name: "purchase_orders_quotation_id_fkey"
  }).onUpdate("cascade").onDelete("restrict"),
  vendorFkey: foreignKey({
    columns: [table.vendorId],
    foreignColumns: [VendorTable.id],
    name: "purchase_orders_vendor_id_fkey"
  }).onUpdate("cascade").onDelete("restrict"),
  entityFkey: foreignKey({
    columns: [table.entityId],
    foreignColumns: [POEntityTable.id],
    name: "purchase_orders_entity_id_fkey"
  }).onUpdate("cascade").onDelete("restrict"),
  generatedByFkey: foreignKey({
    columns: [table.generatedBy],
    foreignColumns: [UserTable.id],
    name: "purchase_orders_generated_by_fkey"
  }).onUpdate("cascade").onDelete("restrict")
}));

// Goods Receipt Table
export const GoodsReceiptTable = pgTable("goods_receipts", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  poId: uuid("po_id").notNull(),
  receivedBy: uuid("received_by").notNull(),
  receivedAt: timestamp("received_at", { mode: "date" }).notNull(),
  
  // Receipt details
  receivedItems: jsonb("received_items").notNull(), // What was actually received
  partialDelivery: boolean("partial_delivery").default(false).notNull(),
  qualityCheck: boolean("quality_check").default(false).notNull(),
  qualityNotes: text("quality_notes"),
  
  // Documents
  invoiceNumber: varchar("invoice_number", { length: 100 }),
  invoiceDate: timestamp("invoice_date", { mode: "date" }),
  invoiceAmount: numeric("invoice_amount", { precision: 15, scale: 2 }),
  supportingDocuments: jsonb("supporting_documents"),
  
  // Feedback
  vendorRating: integer("vendor_rating"), // 1-5 scale
  feedback: text("feedback"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").notNull()
}, (table) => ({
  poIdx: index("goods_receipts_po_idx").on(table.poId),
  poFkey: foreignKey({
    columns: [table.poId],
    foreignColumns: [PurchaseOrderTable.id],
    name: "goods_receipts_po_id_fkey"
  }).onUpdate("cascade").onDelete("restrict"),
  receivedByFkey: foreignKey({
    columns: [table.receivedBy],
    foreignColumns: [UserTable.id],
    name: "goods_receipts_received_by_fkey"
  }).onUpdate("cascade").onDelete("restrict")
}));

// Conversation Messages Table (for RFP conversations)
export const ConversationMessageTable = pgTable("conversation_messages", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  rfpId: uuid("rfp_id").notNull(),
  threadId: uuid("thread_id").notNull(), // Groups related messages
  senderId: uuid("sender_id").notNull(),
  senderType: varchar("sender_type", { length: 20 }).notNull(), // 'USER' or 'VENDOR'
  
  // Message content
  messageType: MessageType("message_type").notNull(),
  content: text("content"),
  attachments: jsonb("attachments"), // Array of attachment objects
  
  // Threading
  parentMessageId: uuid("parent_message_id"), // For replies
  
  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => ({
  rfpThreadIdx: index("conversation_messages_rfp_thread_idx").on(
    table.rfpId, table.threadId
  ),
  createdAtIdx: index("conversation_messages_created_at_idx").on(table.createdAt),
  rfpFkey: foreignKey({
    columns: [table.rfpId],
    foreignColumns: [RFPTable.id],
    name: "conversation_messages_rfp_id_fkey"
  }).onUpdate("cascade").onDelete("cascade"),
  senderFkey: foreignKey({
    columns: [table.senderId],
    foreignColumns: [UserTable.id],
    name: "conversation_messages_sender_id_fkey"
  }).onUpdate("cascade").onDelete("restrict"),
  parentFkey: foreignKey({
    columns: [table.parentMessageId],
    foreignColumns: [table.id],
    name: "conversation_messages_parent_message_id_fkey"
  }).onUpdate("cascade").onDelete("set null")
}));

// =====================
// Relations
// =====================

export const organizationRelations = relations(OrganizationTable, ({ many }) => ({
  users: many(UserTable),
  rfps: many(RFPTable),
  poEntities: many(POEntityTable)
}));

export const userRelations = relations(UserTable, ({ one, many }) => ({
  organization: one(OrganizationTable, {
    fields: [UserTable.organizationId],
    references: [OrganizationTable.id]
  }),
  vendor: one(VendorTable, {
    fields: [UserTable.vendorId],
    references: [VendorTable.id]
  }),
  createdRFPs: many(RFPTable),
  approvals: many(RFPApprovalTable),
  invitedVendors: many(RFPVendorInvitationTable),
  generatedPOs: many(PurchaseOrderTable),
  receivedGoods: many(GoodsReceiptTable),
  messages: many(ConversationMessageTable),
  createdQuestionTemplates: many(QuestionTemplateTable)
}));

export const productCategoryRelations = relations(ProductCategoryTable, ({ one, many }) => ({
  parent: one(ProductCategoryTable, {
    fields: [ProductCategoryTable.parentId],
    references: [ProductCategoryTable.id],
    relationName: "category_parent"
  }),
  children: many(ProductCategoryTable, {
    relationName: "category_parent"
  }),
  products: many(ProductTable),
  questionTemplates: many(QuestionTemplateTable)
}));

export const productRelations = relations(ProductTable, ({ one, many }) => ({
  category: one(ProductCategoryTable, {
    fields: [ProductTable.categoryId],
    references: [ProductCategoryTable.id]
  }),
  vendorProducts: many(VendorProductTable)
}));

export const questionTemplateRelations = relations(QuestionTemplateTable, ({ one, many }) => ({
  category: one(ProductCategoryTable, {
    fields: [QuestionTemplateTable.categoryId],
    references: [ProductCategoryTable.id]
  }),
  createdBy: one(UserTable, {
    fields: [QuestionTemplateTable.createdBy],
    references: [UserTable.id]
  }),
  rfps: many(RFPTable)
}));

export const vendorRelations = relations(VendorTable, ({ one, many }) => ({
  verifiedBy: one(UserTable, {
    fields: [VendorTable.verifiedBy],
    references: [UserTable.id]
  }),
  contacts: many(VendorContactTable),
  products: many(VendorProductTable),
  quotations: many(QuotationTable),
  invitations: many(RFPVendorInvitationTable),
  purchaseOrders: many(PurchaseOrderTable),
  users: many(UserTable)
}));

export const vendorContactRelations = relations(VendorContactTable, ({ one }) => ({
  vendor: one(VendorTable, {
    fields: [VendorContactTable.vendorId],
    references: [VendorTable.id]
  })
}));

export const vendorProductRelations = relations(VendorProductTable, ({ one }) => ({
  vendor: one(VendorTable, {
    fields: [VendorProductTable.vendorId],
    references: [VendorTable.id]
  }),
  product: one(ProductTable, {
    fields: [VendorProductTable.productId],
    references: [ProductTable.id]
  })
}));

export const rfpRelations = relations(RFPTable, ({ one, many }) => ({
  createdBy: one(UserTable, {
    fields: [RFPTable.createdBy],
    references: [UserTable.id]
  }),
  organization: one(OrganizationTable, {
    fields: [RFPTable.organizationId],
    references: [OrganizationTable.id]
  }),
  questionTemplate: one(QuestionTemplateTable, {
    fields: [RFPTable.questionTemplateId],
    references: [QuestionTemplateTable.id]
  }),
  approvals: many(RFPApprovalTable),
  vendorInvitations: many(RFPVendorInvitationTable),
  quotations: many(QuotationTable),
  purchaseOrders: many(PurchaseOrderTable),
  conversations: many(ConversationMessageTable)
}));

export const rfpApprovalRelations = relations(RFPApprovalTable, ({ one }) => ({
  rfp: one(RFPTable, {
    fields: [RFPApprovalTable.rfpId],
    references: [RFPTable.id]
  }),
  approver: one(UserTable, {
    fields: [RFPApprovalTable.approverId],
    references: [UserTable.id]
  })
}));

export const rfpVendorInvitationRelations = relations(RFPVendorInvitationTable, ({ one }) => ({
  rfp: one(RFPTable, {
    fields: [RFPVendorInvitationTable.rfpId],
    references: [RFPTable.id]
  }),
  vendor: one(VendorTable, {
    fields: [RFPVendorInvitationTable.vendorId],
    references: [VendorTable.id]
  }),
  invitedBy: one(UserTable, {
    fields: [RFPVendorInvitationTable.invitedBy],
    references: [UserTable.id]
  })
}));

export const quotationRelations = relations(QuotationTable, ({ one, many }) => ({
  rfp: one(RFPTable, {
    fields: [QuotationTable.rfpId],
    references: [RFPTable.id]
  }),
  vendor: one(VendorTable, {
    fields: [QuotationTable.vendorId],
    references: [VendorTable.id]
  }),
  purchaseOrders: many(PurchaseOrderTable)
}));

export const poEntityRelations = relations(POEntityTable, ({ one, many }) => ({
  organization: one(OrganizationTable, {
    fields: [POEntityTable.organizationId],
    references: [OrganizationTable.id]
  }),
  purchaseOrders: many(PurchaseOrderTable)
}));

export const purchaseOrderRelations = relations(PurchaseOrderTable, ({ one, many }) => ({
  rfp: one(RFPTable, {
    fields: [PurchaseOrderTable.rfpId],
    references: [RFPTable.id]
  }),
  quotation: one(QuotationTable, {
    fields: [PurchaseOrderTable.quotationId],
    references: [QuotationTable.id]
  }),
  vendor: one(VendorTable, {
    fields: [PurchaseOrderTable.vendorId],
    references: [VendorTable.id]
  }),
  entity: one(POEntityTable, {
    fields: [PurchaseOrderTable.entityId],
    references: [POEntityTable.id]
  }),
  generatedBy: one(UserTable, {
    fields: [PurchaseOrderTable.generatedBy],
    references: [UserTable.id]
  }),
  goodsReceipts: many(GoodsReceiptTable)
}));

export const goodsReceiptRelations = relations(GoodsReceiptTable, ({ one }) => ({
  purchaseOrder: one(PurchaseOrderTable, {
    fields: [GoodsReceiptTable.poId],
    references: [PurchaseOrderTable.id]
  }),
  receivedBy: one(UserTable, {
    fields: [GoodsReceiptTable.receivedBy],
    references: [UserTable.id]
  })
}));

export const conversationMessageRelations = relations(ConversationMessageTable, ({ one, many }) => ({
  rfp: one(RFPTable, {
    fields: [ConversationMessageTable.rfpId],
    references: [RFPTable.id]
  }),
  sender: one(UserTable, {
    fields: [ConversationMessageTable.senderId],
    references: [UserTable.id]
  }),
  parentMessage: one(ConversationMessageTable, {
    fields: [ConversationMessageTable.parentMessageId],
    references: [ConversationMessageTable.id],
    relationName: "message_replies"
  }),
  replies: many(ConversationMessageTable, {
    relationName: "message_replies"
  })
}));

// =====================
// Auth Token Tables
// =====================

export const EmailVerificationTokenTable = pgTable("email_verification_tokens", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  token: uuid("token").defaultRandom().notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => ({
  emailTokenIdx: uniqueIndex("email_verification_tokens_email_token_idx").on(
    table.email, table.token
  ),
  tokenIdx: uniqueIndex("email_verification_tokens_token_idx").on(table.token)
}));

export const PasswordResetTokenTable = pgTable("password_reset_tokens", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  token: uuid("token").defaultRandom().notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => ({
  emailTokenIdx: uniqueIndex("password_reset_tokens_email_token_idx").on(
    table.email, table.token
  ),
  tokenIdx: uniqueIndex("password_reset_tokens_token_idx").on(table.token)
}));

// =====================
// Audit Trail Tables
// =====================

export const AuditEventTable = pgTable("audit_events", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  priority: integer("priority").default(1).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => ({
  nameIdx: uniqueIndex("audit_events_name_idx").on(table.name)
}));

export const AuditTrailTable = pgTable("audit_trails", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  eventId: uuid("event_id").notNull(),
  userId: uuid("user_id").notNull(),
  entityType: varchar("entity_type", { length: 50 }).notNull(), // 'RFP', 'QUOTATION', etc.
  entityId: uuid("entity_id").notNull(),
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  metadata: jsonb("metadata"), // Additional context
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => ({
  eventIdx: index("audit_trails_event_idx").on(table.eventId),
  userIdx: index("audit_trails_user_idx").on(table.userId),
  entityIdx: index("audit_trails_entity_idx").on(table.entityType, table.entityId),
  createdAtIdx: index("audit_trails_created_at_idx").on(table.createdAt),
  eventFkey: foreignKey({
    columns: [table.eventId],
    foreignColumns: [AuditEventTable.id],
    name: "audit_trails_event_id_fkey"
  }).onUpdate("cascade").onDelete("restrict"),
  userFkey: foreignKey({
    columns: [table.userId],
    foreignColumns: [UserTable.id],
    name: "audit_trails_user_id_fkey"
  }).onUpdate("cascade").onDelete("restrict")
}));

export const auditEventRelations = relations(AuditEventTable, ({ many }) => ({
  auditTrails: many(AuditTrailTable)
}));

export const auditTrailRelations = relations(AuditTrailTable, ({ one }) => ({
  event: one(AuditEventTable, {
    fields: [AuditTrailTable.eventId],
    references: [AuditEventTable.id]
  }),
  user: one(UserTable, {
    fields: [AuditTrailTable.userId],
    references: [UserTable.id]
  })
}));
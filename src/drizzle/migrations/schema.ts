import { pgTable, index, foreignKey, uuid, varchar, text, jsonb, timestamp, uniqueIndex, numeric, boolean, integer, pgEnum } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"

export const approvalStage = pgEnum("approval_stage", ['PROCUREMENT_MANAGER', 'FINANCE_MANAGER', 'FINANCE_EXECUTIVE', 'PROCUREMENT_LEAD'])
export const invitationStatus = pgEnum("invitation_status", ['SENT', 'VIEWED', 'QUOTED', 'DECLINED'])
export const messageType = pgEnum("message_type", ['TEXT', 'ATTACHMENT', 'SYSTEM_MESSAGE'])
export const poStatus = pgEnum("po_status", ['DRAFT', 'GENERATED', 'SENT_TO_VENDOR', 'ACKNOWLEDGED', 'IN_PROGRESS', 'DELIVERED', 'COMPLETED', 'CANCELLED'])
export const quotationStatus = pgEnum("quotation_status", ['OPEN', 'SUBMITTED', 'LOCKED', 'UNDER_REVIEW', 'SHORTLISTED', 'SELECTED', 'REJECTED'])
export const rfpStatus = pgEnum("rfp_status", ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SENT_TO_VENDORS', 'QUOTATION_RECEIVED', 'VENDOR_SELECTED', 'PO_GENERATED', 'DELIVERED', 'COMPLETED', 'CANCELLED'])
export const userRole = pgEnum("user_role", ['SYSTEM_ADMIN', 'PROCUREMENT_MANAGER', 'PROCUREMENT_LEAD', 'ADMIN_TEAM', 'FINANCE_TEAM', 'FINANCE_EXECUTIVE', 'USER', 'VENDOR', 'FINANCE_MANAGER'])
export const vendorStatus = pgEnum("vendor_status", ['PENDING_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED', 'BLACKLISTED'])



export const conversationMessages = pgTable("conversation_messages", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	rfpId: uuid("rfp_id").notNull(),
	threadId: uuid("thread_id").notNull(),
	senderId: uuid("sender_id").notNull(),
	senderType: varchar("sender_type", { length: 20 }).notNull(),
	messageType: messageType("message_type").notNull(),
	content: text("content"),
	attachments: jsonb("attachments"),
	parentMessageId: uuid("parent_message_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		createdAtIdx: index("conversation_messages_created_at_idx").using("btree", table.createdAt.asc().nullsLast()),
		rfpThreadIdx: index("conversation_messages_rfp_thread_idx").using("btree", table.rfpId.asc().nullsLast(), table.threadId.asc().nullsLast()),
		conversationMessagesRfpIdFkey: foreignKey({
			columns: [table.rfpId],
			foreignColumns: [rfps.id],
			name: "conversation_messages_rfp_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
		conversationMessagesSenderIdFkey: foreignKey({
			columns: [table.senderId],
			foreignColumns: [users.id],
			name: "conversation_messages_sender_id_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
		conversationMessagesParentMessageIdFkey: foreignKey({
			columns: [table.parentMessageId],
			foreignColumns: [table.id],
			name: "conversation_messages_parent_message_id_fkey"
		}).onUpdate("cascade").onDelete("set null"),
	}
});

export const purchaseOrders = pgTable("purchase_orders", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	poNumber: varchar("po_number", { length: 50 }).notNull(),
	rfpId: uuid("rfp_id").notNull(),
	quotationId: uuid("quotation_id").notNull(),
	vendorId: uuid("vendor_id").notNull(),
	entityId: uuid("entity_id").notNull(),
	lineItems: jsonb("line_items").notNull(),
	subtotal: numeric("subtotal", { precision: 15, scale:  2 }).notNull(),
	gstAmount: numeric("gst_amount", { precision: 15, scale:  2 }).notNull(),
	totalAmount: numeric("total_amount", { precision: 15, scale:  2 }).notNull(),
	deliveryDate: timestamp("delivery_date", { mode: 'string' }).notNull(),
	deliveryAddress: text("delivery_address").notNull(),
	paymentTerms: text("payment_terms"),
	otherTerms: text("other_terms"),
	status: poStatus("status").default('DRAFT').notNull(),
	generatedBy: uuid("generated_by").notNull(),
	acknowledgedAt: timestamp("acknowledged_at", { mode: 'string' }),
	penaltyClause: text("penalty_clause"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
},
(table) => {
	return {
		poNumberIdx: uniqueIndex("purchase_orders_po_number_idx").using("btree", table.poNumber.asc().nullsLast()),
		statusIdx: index("purchase_orders_status_idx").using("btree", table.status.asc().nullsLast()),
		purchaseOrdersRfpIdFkey: foreignKey({
			columns: [table.rfpId],
			foreignColumns: [rfps.id],
			name: "purchase_orders_rfp_id_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
		purchaseOrdersQuotationIdFkey: foreignKey({
			columns: [table.quotationId],
			foreignColumns: [quotations.id],
			name: "purchase_orders_quotation_id_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
		purchaseOrdersVendorIdFkey: foreignKey({
			columns: [table.vendorId],
			foreignColumns: [vendors.id],
			name: "purchase_orders_vendor_id_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
		purchaseOrdersEntityIdFkey: foreignKey({
			columns: [table.entityId],
			foreignColumns: [poEntities.id],
			name: "purchase_orders_entity_id_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
		purchaseOrdersGeneratedByFkey: foreignKey({
			columns: [table.generatedBy],
			foreignColumns: [users.id],
			name: "purchase_orders_generated_by_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	}
});

export const goodsReceipts = pgTable("goods_receipts", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	poId: uuid("po_id").notNull(),
	receivedBy: uuid("received_by").notNull(),
	receivedAt: timestamp("received_at", { mode: 'string' }).notNull(),
	receivedItems: jsonb("received_items").notNull(),
	partialDelivery: boolean("partial_delivery").default(false).notNull(),
	qualityCheck: boolean("quality_check").default(false).notNull(),
	qualityNotes: text("quality_notes"),
	invoiceNumber: varchar("invoice_number", { length: 100 }),
	invoiceDate: timestamp("invoice_date", { mode: 'string' }),
	invoiceAmount: numeric("invoice_amount", { precision: 15, scale:  2 }),
	supportingDocuments: jsonb("supporting_documents"),
	vendorRating: integer("vendor_rating"),
	feedback: text("feedback"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
},
(table) => {
	return {
		poIdx: index("goods_receipts_po_idx").using("btree", table.poId.asc().nullsLast()),
		goodsReceiptsPoIdFkey: foreignKey({
			columns: [table.poId],
			foreignColumns: [purchaseOrders.id],
			name: "goods_receipts_po_id_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
		goodsReceiptsReceivedByFkey: foreignKey({
			columns: [table.receivedBy],
			foreignColumns: [users.id],
			name: "goods_receipts_received_by_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	}
});

export const emailVerificationTokens = pgTable("email_verification_tokens", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	email: varchar("email", { length: 255 }).notNull(),
	token: uuid("token").defaultRandom().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		emailTokenIdx: uniqueIndex("email_verification_tokens_email_token_idx").using("btree", table.email.asc().nullsLast(), table.token.asc().nullsLast()),
		tokenIdx: uniqueIndex("email_verification_tokens_token_idx").using("btree", table.token.asc().nullsLast()),
	}
});

export const organizations = pgTable("organizations", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	name: varchar("name", { length: 255 }).notNull(),
	legalName: varchar("legal_name", { length: 255 }).notNull(),
	gstin: varchar("gstin", { length: 15 }),
	pan: varchar("pan", { length: 10 }),
	address: text("address").notNull(),
	city: varchar("city", { length: 100 }).notNull(),
	state: varchar("state", { length: 100 }).notNull(),
	pincode: varchar("pincode", { length: 10 }).notNull(),
	country: varchar("country", { length: 100 }).default('India').notNull(),
	phone: varchar("phone", { length: 20 }),
	email: varchar("email", { length: 255 }),
	website: varchar("website", { length: 255 }),
	logo: text("logo"),
	stamp: text("stamp"),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
},
(table) => {
	return {
		gstinIdx: uniqueIndex("organizations_gstin_idx").using("btree", table.gstin.asc().nullsLast()),
		panIdx: uniqueIndex("organizations_pan_idx").using("btree", table.pan.asc().nullsLast()),
	}
});

export const productCategories = pgTable("product_categories", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	name: varchar("name", { length: 255 }).notNull(),
	description: text("description"),
	parentId: uuid("parent_id"),
	isActive: boolean("is_active").default(true).notNull(),
	requiresApproval: boolean("requires_approval").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
},
(table) => {
	return {
		nameIdx: uniqueIndex("product_categories_name_idx").using("btree", table.name.asc().nullsLast()),
		productCategoriesParentIdFkey: foreignKey({
			columns: [table.parentId],
			foreignColumns: [table.id],
			name: "product_categories_parent_id_fkey"
		}).onUpdate("cascade").onDelete("set null"),
	}
});

export const products = pgTable("products", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	name: varchar("name", { length: 255 }).notNull(),
	description: text("description"),
	categoryId: uuid("category_id").notNull(),
	brand: varchar("brand", { length: 100 }),
	modelNumber: varchar("model_number", { length: 100 }),
	specifications: jsonb("specifications"),
	keywords: text("keywords").array(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
},
(table) => {
	return {
		keywordsIdx: index("products_keywords_idx").using("gin", table.keywords.asc().nullsLast()),
		nameIdx: index("products_name_idx").using("btree", table.name.asc().nullsLast()),
		productsCategoryIdFkey: foreignKey({
			columns: [table.categoryId],
			foreignColumns: [productCategories.id],
			name: "products_category_id_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	}
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	email: varchar("email", { length: 255 }).notNull(),
	token: uuid("token").defaultRandom().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		emailTokenIdx: uniqueIndex("password_reset_tokens_email_token_idx").using("btree", table.email.asc().nullsLast(), table.token.asc().nullsLast()),
		tokenIdx: uniqueIndex("password_reset_tokens_token_idx").using("btree", table.token.asc().nullsLast()),
	}
});

export const poEntities = pgTable("po_entities", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	name: varchar("name", { length: 100 }).notNull(),
	legalName: varchar("legal_name", { length: 255 }).notNull(),
	address: text("address").notNull(),
	gstin: varchar("gstin", { length: 15 }),
	organizationId: uuid("organization_id").notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		nameIdx: uniqueIndex("po_entities_name_idx").using("btree", table.name.asc().nullsLast()),
		poEntitiesOrganizationIdFkey: foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "po_entities_organization_id_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	}
});

export const auditEvents = pgTable("audit_events", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	name: varchar("name", { length: 255 }).notNull(),
	description: text("description"),
	priority: integer("priority").default(1).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		nameIdx: uniqueIndex("audit_events_name_idx").using("btree", table.name.asc().nullsLast()),
	}
});

export const questionTemplates = pgTable("question_templates", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	categoryId: uuid("category_id"),
	questions: jsonb("questions").notNull(),
	version: integer("version").default(1).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdBy: uuid("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
},
(table) => {
	return {
		questionTemplatesCategoryIdFkey: foreignKey({
			columns: [table.categoryId],
			foreignColumns: [productCategories.id],
			name: "question_templates_category_id_fkey"
		}).onUpdate("cascade").onDelete("set null"),
		questionTemplatesCreatedByFkey: foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "question_templates_created_by_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	}
});

export const rfpVendorInvitations = pgTable("rfp_vendor_invitations", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	rfpId: uuid("rfp_id").notNull(),
	vendorId: uuid("vendor_id").notNull(),
	invitedAt: timestamp("invited_at", { mode: 'string' }).notNull(),
	invitedBy: uuid("invited_by").notNull(),
	accessToken: uuid("access_token").defaultRandom().notNull(),
	viewedAt: timestamp("viewed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		accessTokenIdx: uniqueIndex("rfp_vendor_invitations_access_token_idx").using("btree", table.accessToken.asc().nullsLast()),
		rfpVendorIdx: uniqueIndex("rfp_vendor_invitations_rfp_vendor_idx").using("btree", table.rfpId.asc().nullsLast(), table.vendorId.asc().nullsLast()),
		rfpVendorInvitationsRfpIdFkey: foreignKey({
			columns: [table.rfpId],
			foreignColumns: [rfps.id],
			name: "rfp_vendor_invitations_rfp_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
		rfpVendorInvitationsVendorIdFkey: foreignKey({
			columns: [table.vendorId],
			foreignColumns: [vendors.id],
			name: "rfp_vendor_invitations_vendor_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
		rfpVendorInvitationsInvitedByFkey: foreignKey({
			columns: [table.invitedBy],
			foreignColumns: [users.id],
			name: "rfp_vendor_invitations_invited_by_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	}
});

export const quotations = pgTable("quotations", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	rfpId: uuid("rfp_id").notNull(),
	vendorId: uuid("vendor_id").notNull(),
	quotationNumber: varchar("quotation_number", { length: 50 }),
	lineItemQuotes: jsonb("line_item_quotes").notNull(),
	subtotal: numeric("subtotal", { precision: 15, scale:  2 }).notNull(),
	gstAmount: numeric("gst_amount", { precision: 15, scale:  2 }).notNull(),
	totalAmount: numeric("total_amount", { precision: 15, scale:  2 }).notNull(),
	otherCharges: jsonb("other_charges"),
	supportingDocuments: jsonb("supporting_documents"),
	validTill: timestamp("valid_till", { mode: 'string' }).notNull(),
	deliveryTimeline: varchar("delivery_timeline", { length: 100 }),
	status: quotationStatus("status").default('OPEN').notNull(),
	submittedAt: timestamp("submitted_at", { mode: 'string' }),
	lockedAt: timestamp("locked_at", { mode: 'string' }),
	evaluationScore: numeric("evaluation_score", { precision: 5, scale:  2 }),
	evaluationNotes: text("evaluation_notes"),
	isShortlisted: boolean("is_shortlisted").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
},
(table) => {
	return {
		rfpVendorIdx: uniqueIndex("quotations_rfp_vendor_idx").using("btree", table.rfpId.asc().nullsLast(), table.vendorId.asc().nullsLast()),
		statusIdx: index("quotations_status_idx").using("btree", table.status.asc().nullsLast()),
		quotationsRfpIdFkey: foreignKey({
			columns: [table.rfpId],
			foreignColumns: [rfps.id],
			name: "quotations_rfp_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
		quotationsVendorIdFkey: foreignKey({
			columns: [table.vendorId],
			foreignColumns: [vendors.id],
			name: "quotations_vendor_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	}
});

export const rfpApprovals = pgTable("rfp_approvals", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	rfpId: uuid("rfp_id").notNull(),
	approverId: uuid("approver_id").notNull(),
	stage: approvalStage("stage").notNull(),
	sequence: integer("sequence").notNull(),
	approved: boolean("approved"),
	approvedAt: timestamp("approved_at", { mode: 'string' }),
	comments: text("comments"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
},
(table) => {
	return {
		rfpApproverIdx: uniqueIndex("rfp_approvals_rfp_approver_idx").using("btree", table.rfpId.asc().nullsLast(), table.approverId.asc().nullsLast(), table.stage.asc().nullsLast()),
		rfpApprovalsRfpIdFkey: foreignKey({
			columns: [table.rfpId],
			foreignColumns: [rfps.id],
			name: "rfp_approvals_rfp_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
		rfpApprovalsApproverIdFkey: foreignKey({
			columns: [table.approverId],
			foreignColumns: [users.id],
			name: "rfp_approvals_approver_id_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	}
});

export const users = pgTable("users", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	name: varchar("name", { length: 255 }).notNull(),
	email: varchar("email", { length: 255 }).notNull(),
	emailVerified: timestamp("email_verified", { mode: 'string' }),
	password: varchar("password", { length: 255 }).notNull(),
	mobile: varchar("mobile", { length: 20 }),
	role: userRole("role").default('USER').notNull(),
	organizationId: uuid("organization_id"),
	vendorId: uuid("vendor_id"),
	profilePic: text("profile_pic"),
	isActive: boolean("is_active").default(true).notNull(),
	lastLoginAt: timestamp("last_login_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
},
(table) => {
	return {
		emailIdx: uniqueIndex("users_email_idx").using("btree", table.email.asc().nullsLast()),
		nameEmailMobileIdx: index("users_name_email_mobile_idx").using("btree", table.name.asc().nullsLast(), table.email.asc().nullsLast(), table.mobile.asc().nullsLast()),
		usersOrganizationIdFkey: foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "users_organization_id_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	}
});

export const auditTrails = pgTable("audit_trails", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	eventId: uuid("event_id").notNull(),
	userId: uuid("user_id").notNull(),
	entityType: varchar("entity_type", { length: 50 }).notNull(),
	entityId: uuid("entity_id").notNull(),
	oldValues: jsonb("old_values"),
	newValues: jsonb("new_values"),
	metadata: jsonb("metadata"),
	ipAddress: varchar("ip_address", { length: 45 }),
	userAgent: text("user_agent"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		createdAtIdx: index("audit_trails_created_at_idx").using("btree", table.createdAt.asc().nullsLast()),
		entityIdx: index("audit_trails_entity_idx").using("btree", table.entityType.asc().nullsLast(), table.entityId.asc().nullsLast()),
		eventIdx: index("audit_trails_event_idx").using("btree", table.eventId.asc().nullsLast()),
		userIdx: index("audit_trails_user_idx").using("btree", table.userId.asc().nullsLast()),
		auditTrailsEventIdFkey: foreignKey({
			columns: [table.eventId],
			foreignColumns: [auditEvents.id],
			name: "audit_trails_event_id_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
		auditTrailsUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "audit_trails_user_id_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	}
});

export const rfps = pgTable("rfps", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	rfpNumber: varchar("rfp_number", { length: 50 }).notNull(),
	title: varchar("title", { length: 255 }).notNull(),
	description: text("description"),
	lineItems: jsonb("line_items").notNull(),
	deliveryLocation: text("delivery_location").notNull(),
	deliveryStates: text("delivery_states").array(),
	deliveryDate: timestamp("delivery_date", { mode: 'string' }).notNull(),
	questionTemplateId: uuid("question_template_id"),
	questionAnswers: jsonb("question_answers"),
	estimatedBudget: numeric("estimated_budget", { precision: 15, scale:  2 }),
	currency: varchar("currency", { length: 3 }).default('INR'),
	status: rfpStatus("status").default('DRAFT').notNull(),
	createdBy: uuid("created_by").notNull(),
	organizationId: uuid("organization_id").notNull(),
	selectionCriteria: jsonb("selection_criteria"),
	quotationCutoffDate: timestamp("quotation_cutoff_date", { mode: 'string' }).notNull(),
	rejectionReason: text("rejection_reason"),
	conversationThreads: jsonb("conversation_threads").default([]).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
},
(table) => {
	return {
		rfpNumberIdx: uniqueIndex("rfps_rfp_number_idx").using("btree", table.rfpNumber.asc().nullsLast()),
		statusIdx: index("rfps_status_idx").using("btree", table.status.asc().nullsLast()),
		rfpsCreatedByFkey: foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "rfps_created_by_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
		rfpsOrganizationIdFkey: foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "rfps_organization_id_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
		rfpsQuestionTemplateIdFkey: foreignKey({
			columns: [table.questionTemplateId],
			foreignColumns: [questionTemplates.id],
			name: "rfps_question_template_id_fkey"
		}).onUpdate("cascade").onDelete("set null"),
	}
});

export const vendors = pgTable("vendors", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	companyName: varchar("company_name", { length: 255 }).notNull(),
	legalName: varchar("legal_name", { length: 255 }),
	gstin: varchar("gstin", { length: 15 }),
	pan: varchar("pan", { length: 10 }),
	businessRegistrationYear: integer("business_registration_year"),
	employeeCount: varchar("employee_count", { length: 50 }),
	logo: text("logo"),
	description: text("description"),
	address: text("address").notNull(),
	city: varchar("city", { length: 100 }).notNull(),
	state: varchar("state", { length: 100 }).notNull(),
	pincode: varchar("pincode", { length: 10 }).notNull(),
	country: varchar("country", { length: 100 }).default('India').notNull(),
	phone: varchar("phone", { length: 20 }),
	email: varchar("email", { length: 255 }),
	website: varchar("website", { length: 255 }),
	specializations: text("specializations").array(),
	certifications: jsonb("certifications"),
	socialMediaLinks: jsonb("social_media_links"),
	status: vendorStatus("status").default('PENDING_REVIEW').notNull(),
	verifiedBy: uuid("verified_by"),
	verifiedAt: timestamp("verified_at", { mode: 'string' }),
	dealingKeywords: text("dealing_keywords").array(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
},
(table) => {
	return {
		companyNameIdx: index("vendors_company_name_idx").using("btree", table.companyName.asc().nullsLast()),
		gstinIdx: uniqueIndex("vendors_gstin_idx").using("btree", table.gstin.asc().nullsLast()),
		keywordsIdx: index("vendors_keywords_idx").using("gin", table.dealingKeywords.asc().nullsLast()),
		vendorsVerifiedByFkey: foreignKey({
			columns: [table.verifiedBy],
			foreignColumns: [users.id],
			name: "vendors_verified_by_fkey"
		}).onUpdate("cascade").onDelete("set null"),
	}
});

export const vendorContacts = pgTable("vendor_contacts", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	vendorId: uuid("vendor_id").notNull(),
	name: varchar("name", { length: 255 }).notNull(),
	designation: varchar("designation", { length: 100 }),
	email: varchar("email", { length: 255 }).notNull(),
	phone: varchar("phone", { length: 20 }),
	isPrimary: boolean("is_primary").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
},
(table) => {
	return {
		vendorContactsVendorIdFkey: foreignKey({
			columns: [table.vendorId],
			foreignColumns: [vendors.id],
			name: "vendor_contacts_vendor_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	}
});

export const vendorProducts = pgTable("vendor_products", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	vendorId: uuid("vendor_id").notNull(),
	productId: uuid("product_id").notNull(),
	brandOffered: varchar("brand_offered", { length: 100 }),
	modelOffered: varchar("model_offered", { length: 100 }),
	specifications: jsonb("specifications"),
	basePrice: numeric("base_price", { precision: 12, scale:  2 }),
	currency: varchar("currency", { length: 3 }).default('INR'),
	isCurrentlyOffered: boolean("is_currently_offered").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
},
(table) => {
	return {
		vendorProductIdx: uniqueIndex("vendor_products_vendor_product_idx").using("btree", table.vendorId.asc().nullsLast(), table.productId.asc().nullsLast()),
		vendorProductsVendorIdFkey: foreignKey({
			columns: [table.vendorId],
			foreignColumns: [vendors.id],
			name: "vendor_products_vendor_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
		vendorProductsProductIdFkey: foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "vendor_products_product_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	}
});
import { relations } from "drizzle-orm/relations";
import { rfps, conversationMessages, users, purchaseOrders, quotations, vendors, poEntities, goodsReceipts, productCategories, products, organizations, questionTemplates, rfpVendorInvitations, rfpApprovals, auditEvents, auditTrails, vendorContacts, vendorProducts } from "./schema";

export const conversationMessagesRelations = relations(conversationMessages, ({one, many}) => ({
	rfp: one(rfps, {
		fields: [conversationMessages.rfpId],
		references: [rfps.id]
	}),
	user: one(users, {
		fields: [conversationMessages.senderId],
		references: [users.id]
	}),
	conversationMessage: one(conversationMessages, {
		fields: [conversationMessages.parentMessageId],
		references: [conversationMessages.id],
		relationName: "conversationMessages_parentMessageId_conversationMessages_id"
	}),
	conversationMessages: many(conversationMessages, {
		relationName: "conversationMessages_parentMessageId_conversationMessages_id"
	}),
}));

export const rfpsRelations = relations(rfps, ({one, many}) => ({
	conversationMessages: many(conversationMessages),
	purchaseOrders: many(purchaseOrders),
	rfpVendorInvitations: many(rfpVendorInvitations),
	quotations: many(quotations),
	rfpApprovals: many(rfpApprovals),
	user: one(users, {
		fields: [rfps.createdBy],
		references: [users.id]
	}),
	organization: one(organizations, {
		fields: [rfps.organizationId],
		references: [organizations.id]
	}),
	questionTemplate: one(questionTemplates, {
		fields: [rfps.questionTemplateId],
		references: [questionTemplates.id]
	}),
}));

export const usersRelations = relations(users, ({one, many}) => ({
	conversationMessages: many(conversationMessages),
	purchaseOrders: many(purchaseOrders),
	goodsReceipts: many(goodsReceipts),
	questionTemplates: many(questionTemplates),
	rfpVendorInvitations: many(rfpVendorInvitations),
	rfpApprovals: many(rfpApprovals),
	organization: one(organizations, {
		fields: [users.organizationId],
		references: [organizations.id]
	}),
	auditTrails: many(auditTrails),
	rfps: many(rfps),
	vendors: many(vendors),
}));

export const purchaseOrdersRelations = relations(purchaseOrders, ({one, many}) => ({
	rfp: one(rfps, {
		fields: [purchaseOrders.rfpId],
		references: [rfps.id]
	}),
	quotation: one(quotations, {
		fields: [purchaseOrders.quotationId],
		references: [quotations.id]
	}),
	vendor: one(vendors, {
		fields: [purchaseOrders.vendorId],
		references: [vendors.id]
	}),
	poEntity: one(poEntities, {
		fields: [purchaseOrders.entityId],
		references: [poEntities.id]
	}),
	user: one(users, {
		fields: [purchaseOrders.generatedBy],
		references: [users.id]
	}),
	goodsReceipts: many(goodsReceipts),
}));

export const quotationsRelations = relations(quotations, ({one, many}) => ({
	purchaseOrders: many(purchaseOrders),
	rfp: one(rfps, {
		fields: [quotations.rfpId],
		references: [rfps.id]
	}),
	vendor: one(vendors, {
		fields: [quotations.vendorId],
		references: [vendors.id]
	}),
}));

export const vendorsRelations = relations(vendors, ({one, many}) => ({
	purchaseOrders: many(purchaseOrders),
	rfpVendorInvitations: many(rfpVendorInvitations),
	quotations: many(quotations),
	user: one(users, {
		fields: [vendors.verifiedBy],
		references: [users.id]
	}),
	vendorContacts: many(vendorContacts),
	vendorProducts: many(vendorProducts),
}));

export const poEntitiesRelations = relations(poEntities, ({one, many}) => ({
	purchaseOrders: many(purchaseOrders),
	organization: one(organizations, {
		fields: [poEntities.organizationId],
		references: [organizations.id]
	}),
}));

export const goodsReceiptsRelations = relations(goodsReceipts, ({one}) => ({
	purchaseOrder: one(purchaseOrders, {
		fields: [goodsReceipts.poId],
		references: [purchaseOrders.id]
	}),
	user: one(users, {
		fields: [goodsReceipts.receivedBy],
		references: [users.id]
	}),
}));

export const productCategoriesRelations = relations(productCategories, ({one, many}) => ({
	productCategory: one(productCategories, {
		fields: [productCategories.parentId],
		references: [productCategories.id],
		relationName: "productCategories_parentId_productCategories_id"
	}),
	productCategories: many(productCategories, {
		relationName: "productCategories_parentId_productCategories_id"
	}),
	products: many(products),
	questionTemplates: many(questionTemplates),
}));

export const productsRelations = relations(products, ({one, many}) => ({
	productCategory: one(productCategories, {
		fields: [products.categoryId],
		references: [productCategories.id]
	}),
	vendorProducts: many(vendorProducts),
}));

export const organizationsRelations = relations(organizations, ({many}) => ({
	poEntities: many(poEntities),
	users: many(users),
	rfps: many(rfps),
}));

export const questionTemplatesRelations = relations(questionTemplates, ({one, many}) => ({
	productCategory: one(productCategories, {
		fields: [questionTemplates.categoryId],
		references: [productCategories.id]
	}),
	user: one(users, {
		fields: [questionTemplates.createdBy],
		references: [users.id]
	}),
	rfps: many(rfps),
}));

export const rfpVendorInvitationsRelations = relations(rfpVendorInvitations, ({one}) => ({
	rfp: one(rfps, {
		fields: [rfpVendorInvitations.rfpId],
		references: [rfps.id]
	}),
	vendor: one(vendors, {
		fields: [rfpVendorInvitations.vendorId],
		references: [vendors.id]
	}),
	user: one(users, {
		fields: [rfpVendorInvitations.invitedBy],
		references: [users.id]
	}),
}));

export const rfpApprovalsRelations = relations(rfpApprovals, ({one}) => ({
	rfp: one(rfps, {
		fields: [rfpApprovals.rfpId],
		references: [rfps.id]
	}),
	user: one(users, {
		fields: [rfpApprovals.approverId],
		references: [users.id]
	}),
}));

export const auditTrailsRelations = relations(auditTrails, ({one}) => ({
	auditEvent: one(auditEvents, {
		fields: [auditTrails.eventId],
		references: [auditEvents.id]
	}),
	user: one(users, {
		fields: [auditTrails.userId],
		references: [users.id]
	}),
}));

export const auditEventsRelations = relations(auditEvents, ({many}) => ({
	auditTrails: many(auditTrails),
}));

export const vendorContactsRelations = relations(vendorContacts, ({one}) => ({
	vendor: one(vendors, {
		fields: [vendorContacts.vendorId],
		references: [vendors.id]
	}),
}));

export const vendorProductsRelations = relations(vendorProducts, ({one}) => ({
	vendor: one(vendors, {
		fields: [vendorProducts.vendorId],
		references: [vendors.id]
	}),
	product: one(products, {
		fields: [vendorProducts.productId],
		references: [products.id]
	}),
}));
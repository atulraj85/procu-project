import {
  address,
  approversList,
  AuditableEventTable,
  AuditTrailTable,
  CompanyTable,
  goodStatus,
  invoice,
  otherCharge,
  payment,
  po,
  product,
  productCategory,
  qualityAssurance,
  quotation,
  rfp,
  rfpProduct,
  RFPQueryTable,
  RFPQueryResponseTable,
  supportingDocument,
  UserTable,
  vendor,
  vendorPricing,
} from "@/drizzle/schema";
import { relations } from "drizzle-orm/relations";

export const auditTrailRelations = relations(AuditTrailTable, ({ one }) => ({
  auditableEvent: one(AuditableEventTable, {
    fields: [AuditTrailTable.eventId],
    references: [AuditableEventTable.id],
  }),
  user: one(UserTable, {
    fields: [AuditTrailTable.userId],
    references: [UserTable.id],
  }),
}));

export const auditableEventRelations = relations(
  AuditableEventTable,
  ({ many }) => ({
    auditTrails: many(AuditTrailTable),
  })
);

export const userRelations = relations(UserTable, ({ one, many }) => ({
  auditTrails: many(AuditTrailTable),
  rfpQueries: many(RFPQueryTable),
  rfpQueryResponses: many(RFPQueryResponseTable),
  rfps: many(rfp),
  company: one(CompanyTable, {
    fields: [UserTable.companyId],
    references: [CompanyTable.id],
  }),
  vendors: many(vendor),
  pos: many(po),
  qualityAssurances: many(qualityAssurance),
  approversLists: many(approversList),
}));

export const rfpQueryRelations = relations(RFPQueryTable, ({ one, many }) => ({
  rfp: one(rfp, {
    fields: [RFPQueryTable.rfpId],
    references: [rfp.id],
  }),
  user: one(UserTable, {
    fields: [RFPQueryTable.userId],
    references: [UserTable.id],
  }),
  rfpQueryResponses: many(RFPQueryResponseTable),
}));

export const rfpRelations = relations(rfp, ({ one, many }) => ({
  rfpQueries: many(RFPQueryTable),
  user: one(UserTable, {
    fields: [rfp.userId],
    references: [UserTable.id],
  }),
  pos: many(po),
  quotations: many(quotation),
  approversLists: many(approversList),
  rfpProducts: many(rfpProduct),
}));

export const rfpQueryResponseRelations = relations(
  RFPQueryResponseTable,
  ({ one, many }) => ({
    rfpQuery: one(RFPQueryTable, {
      fields: [RFPQueryResponseTable.queryId],
      references: [RFPQueryTable.id],
    }),
    user: one(UserTable, {
      fields: [RFPQueryResponseTable.userId],
      references: [UserTable.id],
    }),
    rfpQueryResponse: one(RFPQueryResponseTable, {
      fields: [RFPQueryResponseTable.parentQueryResponseId],
      references: [RFPQueryResponseTable.id],
      relationName:
        "rfpQueryResponse_parentQueryResponseId_rfpQueryResponse_id",
    }),
    rfpQueryResponses: many(RFPQueryResponseTable, {
      relationName:
        "rfpQueryResponse_parentQueryResponseId_rfpQueryResponse_id",
    }),
  })
);

export const companyRelations = relations(CompanyTable, ({ many }) => ({
  users: many(UserTable),
  pos: many(po),
  addresses: many(address),
}));

export const vendorRelations = relations(vendor, ({ one, many }) => ({
  user: one(UserTable, {
    fields: [vendor.verifiedById],
    references: [UserTable.id],
  }),
  quotations: many(quotation),
}));

export const invoiceRelations = relations(invoice, ({ one, many }) => ({
  po: one(po, {
    fields: [invoice.poId],
    references: [po.id],
  }),
  payments: many(payment),
  goodStatuses: many(goodStatus),
}));

export const poRelations = relations(po, ({ one, many }) => ({
  invoices: many(invoice),
  quotation: one(quotation, {
    fields: [po.quotationId],
    references: [quotation.id],
  }),
  user: one(UserTable, {
    fields: [po.userId],
    references: [UserTable.id],
  }),
  company: one(CompanyTable, {
    fields: [po.companyId],
    references: [CompanyTable.id],
  }),
  rfp: one(rfp, {
    fields: [po.rfpId],
    references: [rfp.id],
  }),
}));

export const paymentRelations = relations(payment, ({ one }) => ({
  invoice: one(invoice, {
    fields: [payment.invoiceId],
    references: [invoice.id],
  }),
}));

export const goodStatusRelations = relations(goodStatus, ({ one }) => ({
  invoice: one(invoice, {
    fields: [goodStatus.invoiceId],
    references: [invoice.id],
  }),
  qualityAssurance: one(qualityAssurance, {
    fields: [goodStatus.qualityAssuranceLeaderId],
    references: [qualityAssurance.id],
  }),
}));

export const qualityAssuranceRelations = relations(
  qualityAssurance,
  ({ one, many }) => ({
    goodStatuses: many(goodStatus),
    user: one(UserTable, {
      fields: [qualityAssurance.userId],
      references: [UserTable.id],
    }),
  })
);

export const quotationRelations = relations(quotation, ({ one, many }) => ({
  pos: many(po),
  rfp: one(rfp, {
    fields: [quotation.rfpId],
    references: [rfp.id],
  }),
  vendor: one(vendor, {
    fields: [quotation.vendorId],
    references: [vendor.id],
  }),
  supportingDocuments: many(supportingDocument),
  vendorPricings: many(vendorPricing),
  otherCharges: many(otherCharge),
}));

export const supportingDocumentRelations = relations(
  supportingDocument,
  ({ one }) => ({
    quotation: one(quotation, {
      fields: [supportingDocument.quotationId],
      references: [quotation.id],
    }),
  })
);

export const approversListRelations = relations(approversList, ({ one }) => ({
  rfp: one(rfp, {
    fields: [approversList.rfpId],
    references: [rfp.id],
  }),
  user: one(UserTable, {
    fields: [approversList.userId],
    references: [UserTable.id],
  }),
}));

export const productRelations = relations(product, ({ one, many }) => ({
  productCategory: one(productCategory, {
    fields: [product.productCategoryId],
    references: [productCategory.id],
  }),
  rfpProducts: many(rfpProduct),
}));

export const productCategoryRelations = relations(
  productCategory,
  ({ many }) => ({
    products: many(product),
  })
);

export const rfpProductRelations = relations(rfpProduct, ({ one, many }) => ({
  rfp: one(rfp, {
    fields: [rfpProduct.rfpId],
    references: [rfp.id],
  }),
  product: one(product, {
    fields: [rfpProduct.productId],
    references: [product.id],
  }),
  vendorPricings: many(vendorPricing),
}));

export const vendorPricingRelations = relations(vendorPricing, ({ one }) => ({
  quotation: one(quotation, {
    fields: [vendorPricing.quotationId],
    references: [quotation.id],
  }),
  rfpProduct: one(rfpProduct, {
    fields: [vendorPricing.rfpProductId],
    references: [rfpProduct.id],
  }),
}));

export const addressRelations = relations(address, ({ one }) => ({
  company: one(CompanyTable, {
    fields: [address.companyId],
    references: [CompanyTable.id],
  }),
}));

export const otherChargeRelations = relations(otherCharge, ({ one }) => ({
  quotation: one(quotation, {
    fields: [otherCharge.quotationId],
    references: [quotation.id],
  }),
}));

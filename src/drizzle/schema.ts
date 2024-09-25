import { sql } from "drizzle-orm";
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

export const AddressType = pgEnum("AddressType", ["BUSINESS", "SHIPPING"]);

export const RFPStatus = pgEnum("RFPStatus", [
  "DRAFT",
  "SUBMITTED",
  "PO_CREATED",
  "ADVANCE_PAID",
  "INVOICE_RECEIVED",
  "GRN_RECEIVED",
  "PAYMENT_DONE",
]);

export const UserRole = pgEnum("Role", [
  "ADMIN",
  "PR_MANAGER",
  "FINANCE_MANAGER",
  "ACCOUNTANT",
  "QUALITY_ASSURANCE",
  "USER",
  "VENDOR",
]);

export const UserTable = pgTable(
  "User",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: timestamp("emailVerified", { precision: 3, mode: "string" }),
    password: text("password").notNull(),
    mobile: text("mobile"),
    role: UserRole("role").default("USER").notNull(),
    companyId: uuid("companyId").notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "string",
    }).notNull(),
  },
  (table) => {
    return {
      emailKey: uniqueIndex("User_email_key").using(
        "btree",
        table.email.asc().nullsLast()
      ),
      nameEmailMobileIdx: index("User_name_email_mobile_idx").using(
        "btree",
        table.name.asc().nullsLast(),
        table.email.asc().nullsLast(),
        table.mobile.asc().nullsLast()
      ),
      userCompanyIdFkey: foreignKey({
        columns: [table.companyId],
        foreignColumns: [CompanyTable.id],
        name: "User_companyId_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
    };
  }
);

export const EmailVerificationTokenTable = pgTable(
  "EmailVerificationToken",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    email: text("email").notNull(),
    token: uuid("token").notNull(),
    expiresAt: timestamp("expires_at", {
      precision: 3,
      mode: "string",
    }).notNull(),
  },
  (table) => {
    return {
      emailTokenKey: uniqueIndex(
        "EmailVerificationToken_email_token_key"
      ).using(
        "btree",
        table.email.asc().nullsLast(),
        table.token.asc().nullsLast()
      ),
      tokenKey: uniqueIndex("EmailVerificationToken_token_key").using(
        "btree",
        table.token.asc().nullsLast()
      ),
    };
  }
);

export const PasswordResetTokenTable = pgTable(
  "PasswordResetToken",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    email: text("email").notNull(),
    token: uuid("token").notNull(),
    expiresAt: timestamp("expires_at", {
      precision: 3,
      mode: "string",
    }).notNull(),
  },
  (table) => {
    return {
      emailTokenKey: uniqueIndex("PasswordResetToken_email_token_key").using(
        "btree",
        table.email.asc().nullsLast(),
        table.token.asc().nullsLast()
      ),
      tokenKey: uniqueIndex("PasswordResetToken_token_key").using(
        "btree",
        table.token.asc().nullsLast()
      ),
    };
  }
);

export const AuditableEventTable = pgTable(
  "AuditableEvent",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    priority: integer("priority").notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "string",
    }).notNull(),
  },
  (table) => {
    return {
      nameKey: uniqueIndex("AuditableEvent_name_key").using(
        "btree",
        table.name.asc().nullsLast()
      ),
    };
  }
);

export const AuditTrailTable = pgTable(
  "AuditTrail",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    eventId: uuid("event_id").notNull(),
    details: jsonb("details").notNull(),
    userId: uuid("user_id").notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => {
    return {
      eventIdIdx: index("AuditTrail_eventId_idx").using(
        "btree",
        table.eventId.asc().nullsLast()
      ),
      userIdIdx: index("AuditTrail_user_id_idx").using(
        "btree",
        table.userId.asc().nullsLast()
      ),
      auditTrailEventIdFkey: foreignKey({
        columns: [table.eventId],
        foreignColumns: [AuditableEventTable.id],
        name: "AuditTrail_event_id_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
      auditTrailUserIdFkey: foreignKey({
        columns: [table.userId],
        foreignColumns: [UserTable.id],
        name: "AuditTrail_user_id_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
    };
  }
);

export const prismaMigrations = pgTable("_prisma_migrations", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  checksum: varchar("checksum", { length: 64 }).notNull(),
  finishedAt: timestamp("finished_at", { withTimezone: true, mode: "string" }),
  migrationName: varchar("migration_name", { length: 255 }).notNull(),
  logs: text("logs"),
  rolledBackAt: timestamp("rolled_back_at", {
    withTimezone: true,
    mode: "string",
  }),
  startedAt: timestamp("started_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  appliedStepsCount: integer("applied_steps_count").default(0).notNull(),
});

export const RFPQueryTable = pgTable(
  "RFPQuery",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    content: varchar("content", { length: 255 }).notNull(),
    rfpId: uuid("rfp_id").notNull(),
    userId: uuid("user_id").notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "string",
    }).notNull(),
  },
  (table) => {
    return {
      rfpQueryRfpIdFkey: foreignKey({
        columns: [table.rfpId],
        foreignColumns: [rfp.id],
        name: "RFPQuery_rfp_id_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
      rfpQueryUserIdFkey: foreignKey({
        columns: [table.userId],
        foreignColumns: [UserTable.id],
        name: "RFPQuery_user_id_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
    };
  }
);

export const RFPQueryResponseTable = pgTable(
  "RFPQueryResponse",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    content: varchar("content", { length: 255 }).notNull(),
    queryId: uuid("query_id").notNull(),
    userId: uuid("user_id").notNull(),
    parentQueryResponseId: uuid("parent_query_response_id"),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "string",
    }).notNull(),
  },
  (table) => {
    return {
      rfpQueryResponseQueryIdFkey: foreignKey({
        columns: [table.queryId],
        foreignColumns: [RFPQueryTable.id],
        name: "RFPQueryResponse_query_id_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
      rfpQueryResponseUserIdFkey: foreignKey({
        columns: [table.userId],
        foreignColumns: [UserTable.id],
        name: "RFPQueryResponse_user_id_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
      rfpQueryResponseParentQueryResponseIdFkey: foreignKey({
        columns: [table.parentQueryResponseId],
        foreignColumns: [table.id],
        name: "RFPQueryResponse_parent_query_response_id_fkey",
      })
        .onUpdate("cascade")
        .onDelete("set null"),
    };
  }
);

export const CompanyTable = pgTable(
  "Company",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    website: text("website"),
    industry: text("industry"),
    foundedDate: timestamp("foundedDate", { precision: 3, mode: "string" }),
    status: text("status"),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "string",
    }).notNull(),
    gst: text("GST"),
    logo: text("logo"),
    stamp: text("stamp"),
    gstAddress: text("gstAddress"),
  },
  (table) => {
    return {
      gstKey: uniqueIndex("Company_GST_key").using(
        "btree",
        table.gst.asc().nullsLast()
      ),
      emailKey: uniqueIndex("Company_email_key").using(
        "btree",
        table.email.asc().nullsLast()
      ),
    };
  }
);

export const rfp = pgTable(
  "RFP",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    rfpId: varchar("rfpId", { length: 255 }).notNull(),
    requirementType: text("requirementType").notNull(),
    dateOfOrdering: timestamp("dateOfOrdering", {
      precision: 3,
      mode: "string",
    }).notNull(),
    deliveryLocation: text("deliveryLocation").notNull(),
    deliveryByDate: timestamp("deliveryByDate", {
      precision: 3,
      mode: "string",
    }).notNull(),
    userId: uuid("userId").notNull(),
    rfpStatus: RFPStatus("rfpStatus").default("DRAFT").notNull(),
    preferredQuotationId: uuid("preferredQuotationId"),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "string",
    }).notNull(),
  },
  (table) => {
    return {
      rfpIdIdx: index("RFP_rfpId_idx").using(
        "btree",
        table.rfpId.asc().nullsLast()
      ),
      rfpIdKey: uniqueIndex("RFP_rfpId_key").using(
        "btree",
        table.rfpId.asc().nullsLast()
      ),
      rfpUserIdFkey: foreignKey({
        columns: [table.userId],
        foreignColumns: [UserTable.id],
        name: "RFP_userId_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
    };
  }
);

export const vendor = pgTable(
  "Vendor",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    customerCode: text("customerCode"),
    primaryName: text("primaryName").notNull(),
    companyName: text("companyName").notNull(),
    contactDisplayName: text("contactDisplayName").notNull(),
    email: text("email"),
    workPhone: text("workPhone"),
    mobile: text("mobile"),
    website: text("website"),
    gstin: text("gstin"),
    msmeNo: text("msmeNo"),
    address: text("address"),
    customerState: text("customerState"),
    customerCity: text("customerCity"),
    country: text("country"),
    zip: text("zip"),
    remarks: text("remarks"),
    pan: text("pan"),
    verifiedById: uuid("verifiedById"),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "string",
    }).notNull(),
  },
  (table) => {
    return {
      gstinKey: uniqueIndex("Vendor_gstin_key").using(
        "btree",
        table.gstin.asc().nullsLast()
      ),
      primaryNameCompanyNameContactDisplayNameEmailMobIdx: index(
        "Vendor_primaryName_companyName_contactDisplayName_email_mob_idx"
      ).using(
        "btree",
        table.primaryName.asc().nullsLast(),
        table.companyName.asc().nullsLast(),
        table.contactDisplayName.asc().nullsLast(),
        table.email.asc().nullsLast(),
        table.mobile.asc().nullsLast(),
        table.gstin.asc().nullsLast()
      ),
      vendorVerifiedByIdFkey: foreignKey({
        columns: [table.verifiedById],
        foreignColumns: [UserTable.id],
        name: "Vendor_verifiedById_fkey",
      })
        .onUpdate("cascade")
        .onDelete("set null"),
    };
  }
);

export const invoice = pgTable(
  "Invoice",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    poId: uuid("poId").notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "string",
    }).notNull(),
  },
  (table) => {
    return {
      poIdKey: uniqueIndex("Invoice_poId_key").using(
        "btree",
        table.poId.asc().nullsLast()
      ),
      invoicePoIdFkey: foreignKey({
        columns: [table.poId],
        foreignColumns: [po.id],
        name: "Invoice_poId_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
    };
  }
);

export const payment = pgTable(
  "Payment",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    invoiceId: uuid("invoiceId").notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "string",
    }).notNull(),
  },
  (table) => {
    return {
      paymentInvoiceIdFkey: foreignKey({
        columns: [table.invoiceId],
        foreignColumns: [invoice.id],
        name: "Payment_invoiceId_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
    };
  }
);

export const productCategory = pgTable(
  "ProductCategory",
  {
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "string",
    }).notNull(),
    id: uuid("id").defaultRandom().primaryKey().notNull(),
  },
  (table) => {
    return {
      nameKey: uniqueIndex("ProductCategory_name_key").using(
        "btree",
        table.name.asc().nullsLast()
      ),
    };
  }
);

export const goodStatus = pgTable(
  "GoodStatus",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    invoiceId: uuid("invoiceId").notNull(),
    deliveryStatus: boolean("deliveryStatus").notNull(),
    qualityAssurance: boolean("qualityAssurance").notNull(),
    qualityAssuranceLeaderId: uuid("qualityAssuranceLeaderId").notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "string",
    }).notNull(),
  },
  (table) => {
    return {
      invoiceIdKey: uniqueIndex("GoodStatus_invoiceId_key").using(
        "btree",
        table.invoiceId.asc().nullsLast()
      ),
      goodStatusInvoiceIdFkey: foreignKey({
        columns: [table.invoiceId],
        foreignColumns: [invoice.id],
        name: "GoodStatus_invoiceId_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
      goodStatusQualityAssuranceLeaderIdFkey: foreignKey({
        columns: [table.qualityAssuranceLeaderId],
        foreignColumns: [qualityAssurance.id],
        name: "GoodStatus_qualityAssuranceLeaderId_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
    };
  }
);

export const po = pgTable(
  "PO",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    poId: text("poId").notNull(),
    quotationId: uuid("quotationId").notNull(),
    userId: uuid("userId").notNull(),
    companyId: uuid("companyId").notNull(),
    rfpId: uuid("rfpId").notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "string",
    }).notNull(),
    remarks: text("remarks").notNull(),
  },
  (table) => {
    return {
      poIdKey: uniqueIndex("PO_poId_key").using(
        "btree",
        table.poId.asc().nullsLast()
      ),
      quotationIdKey: uniqueIndex("PO_quotationId_key").using(
        "btree",
        table.quotationId.asc().nullsLast()
      ),
      rfpIdKey: uniqueIndex("PO_rfpId_key").using(
        "btree",
        table.rfpId.asc().nullsLast()
      ),
      poQuotationIdFkey: foreignKey({
        columns: [table.quotationId],
        foreignColumns: [quotation.id],
        name: "PO_quotationId_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
      poUserIdFkey: foreignKey({
        columns: [table.userId],
        foreignColumns: [UserTable.id],
        name: "PO_userId_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
      poCompanyIdFkey: foreignKey({
        columns: [table.companyId],
        foreignColumns: [CompanyTable.id],
        name: "PO_companyId_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
      poRfpIdFkey: foreignKey({
        columns: [table.rfpId],
        foreignColumns: [rfp.id],
        name: "PO_rfpId_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
    };
  }
);

export const quotation = pgTable(
  "Quotation",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    rfpId: uuid("rfpId").notNull(),
    vendorId: uuid("vendorId").notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "string",
    }).notNull(),
    isPrimary: boolean("isPrimary").default(false).notNull(),
    totalAmount: numeric("totalAmount", { precision: 10, scale: 2 }).notNull(),
    refNo: text("refNo"),
    totalAmountWithoutGst: numeric("totalAmountWithoutGST", {
      precision: 10,
      scale: 2,
    }).notNull(),
  },
  (table) => {
    return {
      quotationRfpIdFkey: foreignKey({
        columns: [table.rfpId],
        foreignColumns: [rfp.id],
        name: "Quotation_rfpId_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
      quotationVendorIdFkey: foreignKey({
        columns: [table.vendorId],
        foreignColumns: [vendor.id],
        name: "Quotation_vendorId_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
    };
  }
);

export const qualityAssurance = pgTable(
  "QualityAssurance",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    userId: uuid("userId").notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => {
    return {
      userIdKey: uniqueIndex("QualityAssurance_userId_key").using(
        "btree",
        table.userId.asc().nullsLast()
      ),
      qualityAssuranceUserIdFkey: foreignKey({
        columns: [table.userId],
        foreignColumns: [UserTable.id],
        name: "QualityAssurance_userId_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
    };
  }
);

export const supportingDocument = pgTable(
  "SupportingDocument",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    quotationId: uuid("quotationId").notNull(),
    documentType: text("documentType").notNull(),
    documentName: text("documentName").notNull(),
    location: text("location").notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "string",
    }).notNull(),
  },
  (table) => {
    return {
      supportingDocumentQuotationIdFkey: foreignKey({
        columns: [table.quotationId],
        foreignColumns: [quotation.id],
        name: "SupportingDocument_quotationId_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
    };
  }
);

export const approversList = pgTable(
  "ApproversList",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    rfpId: uuid("rfpId").notNull(),
    userId: uuid("userId").notNull(),
    approved: boolean("approved").default(false).notNull(),
    approvedAt: timestamp("approvedAt", { precision: 3, mode: "string" }),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "string",
    }).notNull(),
  },
  (table) => {
    return {
      rfpIdUserIdKey: uniqueIndex("ApproversList_rfpId_userId_key").using(
        "btree",
        table.rfpId.asc().nullsLast(),
        table.userId.asc().nullsLast()
      ),
      approversListRfpIdFkey: foreignKey({
        columns: [table.rfpId],
        foreignColumns: [rfp.id],
        name: "ApproversList_rfpId_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
      approversListUserIdFkey: foreignKey({
        columns: [table.userId],
        foreignColumns: [UserTable.id],
        name: "ApproversList_userId_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
    };
  }
);

export const product = pgTable(
  "Product",
  {
    name: text("name").notNull(),
    modelNo: text("modelNo").notNull(),
    specification: text("specification").notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "string",
    }).notNull(),
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    productCategoryId: uuid("productCategoryId").notNull(),
  },
  (table) => {
    return {
      nameModelNoSpecificationIdx: index(
        "Product_name_modelNo_specification_idx"
      ).using(
        "btree",
        table.name.asc().nullsLast(),
        table.modelNo.asc().nullsLast(),
        table.specification.asc().nullsLast()
      ),
      productProductCategoryIdFkey: foreignKey({
        columns: [table.productCategoryId],
        foreignColumns: [productCategory.id],
        name: "Product_productCategoryId_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
    };
  }
);

export const rfpProduct = pgTable(
  "RFPProduct",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    rfpId: uuid("rfpId").notNull(),
    quantity: integer("quantity").notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "string",
    }).notNull(),
    description: text("description"),
    productId: uuid("productId").notNull(),
  },
  (table) => {
    return {
      rfpIdProductIdKey: uniqueIndex("RFPProduct_rfpId_productId_key").using(
        "btree",
        table.rfpId.asc().nullsLast(),
        table.productId.asc().nullsLast()
      ),
      rfpProductRfpIdFkey: foreignKey({
        columns: [table.rfpId],
        foreignColumns: [rfp.id],
        name: "RFPProduct_rfpId_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
      rfpProductProductIdFkey: foreignKey({
        columns: [table.productId],
        foreignColumns: [product.id],
        name: "RFPProduct_productId_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
    };
  }
);

export const vendorPricing = pgTable(
  "VendorPricing",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    quotationId: uuid("quotationId").notNull(),
    rfpProductId: uuid("rfpProductId").notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "string",
    }).notNull(),
    gst: integer("GST").notNull(),
  },
  (table) => {
    return {
      quotationIdRfpProductIdKey: uniqueIndex(
        "VendorPricing_quotationId_rfpProductId_key"
      ).using(
        "btree",
        table.quotationId.asc().nullsLast(),
        table.rfpProductId.asc().nullsLast()
      ),
      vendorPricingQuotationIdFkey: foreignKey({
        columns: [table.quotationId],
        foreignColumns: [quotation.id],
        name: "VendorPricing_quotationId_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
      vendorPricingRfpProductIdFkey: foreignKey({
        columns: [table.rfpProductId],
        foreignColumns: [rfpProduct.id],
        name: "VendorPricing_rfpProductId_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
    };
  }
);

export const address = pgTable(
  "Address",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    street: text("street").notNull(),
    city: text("city").notNull(),
    state: text("state").notNull(),
    postalCode: text("postalCode").notNull(),
    country: text("country").notNull(),
    addressType: AddressType("addressType").notNull(),
    companyId: uuid("companyId").notNull(),
  },
  (table) => {
    return {
      addressCompanyIdFkey: foreignKey({
        columns: [table.companyId],
        foreignColumns: [CompanyTable.id],
        name: "Address_companyId_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
    };
  }
);

export const otherCharge = pgTable(
  "OtherCharge",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    quotationId: uuid("quotationId").notNull(),
    name: text("name").notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    gst: numeric("gst", { precision: 5, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "string",
    }).notNull(),
  },
  (table) => {
    return {
      quotationIdNameKey: uniqueIndex("OtherCharge_quotationId_name_key").using(
        "btree",
        table.quotationId.asc().nullsLast(),
        table.name.asc().nullsLast()
      ),
      otherChargeQuotationIdFkey: foreignKey({
        columns: [table.quotationId],
        foreignColumns: [quotation.id],
        name: "OtherCharge_quotationId_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
    };
  }
);

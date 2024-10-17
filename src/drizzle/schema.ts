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

export const AddressType = pgEnum("address_type", ["BUSINESS", "SHIPPING"]);

export const RFPStatus = pgEnum("rfp_status", [
  "DRAFT",
  "SUBMITTED",
  "PO_CREATED",
  "ADVANCE_PAID",
  "INVOICE_RECEIVED",
  "GRN_RECEIVED",
  "PAYMENT_DONE",
]);

export const UserRole = pgEnum("user_role", [
  "ADMIN",
  "PR_MANAGER",
  "FINANCE_MANAGER",
  "ACCOUNTANT",
  "QUALITY_ASSURANCE",
  "USER",
  "VENDOR",
]);

export const UserTable = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: timestamp("email_verified", { precision: 3, mode: "date" }),
    password: text("password").notNull(),
    mobile: text("mobile"),
    role: UserRole("role").default("USER").notNull(),
    companyId: uuid("company_id").notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "date",
    }).notNull(),
  },
  (table) => {
    return {
      emailKey: uniqueIndex("users_email_key").using(
        "btree",
        table.email.asc().nullsLast()
      ),
      nameEmailMobileIdx: index("users_name_email_mobile_idx").using(
        "btree",
        table.name.asc().nullsLast(),
        table.email.asc().nullsLast(),
        table.mobile.asc().nullsLast()
      ),
      userCompanyIdFkey: foreignKey({
        columns: [table.companyId],
        foreignColumns: [CompanyTable.id],
        name: "users_company_id_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
    };
  }
);

export const UserTableRelations = relations(UserTable, ({ one, many }) => ({
  company: one(CompanyTable, {
    fields: [UserTable.companyId],
    references: [CompanyTable.id],
  }),
  auditTrails: many(AuditTrailTable),
  rfpQueries: many(RFPQueryTable),
  rfpQueryResponses: many(RFPQueryResponseTable),
  rfps: many(RFPTable),
  vendors: many(VendorTable),
  pos: many(POTable),
  qualityAssurances: many(QualityAssuranceTable),
  approversLists: many(ApproversListTable),
}));

export const EmailVerificationTokenTable = pgTable(
  "email_verification_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    email: text("email").notNull(),
    token: uuid("token").notNull(),
    expiresAt: timestamp("expires_at", {
      precision: 3,
      mode: "date",
    }).notNull(),
  },
  (table) => {
    return {
      emailTokenKey: uniqueIndex(
        "email_verification_tokens_email_token_key"
      ).using(
        "btree",
        table.email.asc().nullsLast(),
        table.token.asc().nullsLast()
      ),
      tokenKey: uniqueIndex("email_verification_tokens_token_key").using(
        "btree",
        table.token.asc().nullsLast()
      ),
    };
  }
);

export const PasswordResetTokenTable = pgTable(
  "password_reset_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    email: text("email").notNull(),
    token: uuid("token").notNull(),
    expiresAt: timestamp("expires_at", {
      precision: 3,
      mode: "date",
    }).notNull(),
  },
  (table) => {
    return {
      emailTokenKey: uniqueIndex("password_reset_tokens_email_token_key").using(
        "btree",
        table.email.asc().nullsLast(),
        table.token.asc().nullsLast()
      ),
      tokenKey: uniqueIndex("password_reset_tokens_token_key").using(
        "btree",
        table.token.asc().nullsLast()
      ),
    };
  }
);

export const AuditableEventTable = pgTable(
  "auditable_events",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    priority: integer("priority").notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "date",
    }).notNull(),
  },
  (table) => {
    return {
      nameKey: uniqueIndex("auditable_events_name_key").using(
        "btree",
        table.name.asc().nullsLast()
      ),
    };
  }
);

export const AuditableEventTableRelations = relations(
  AuditableEventTable,
  ({ many }) => ({
    auditTrails: many(AuditTrailTable),
  })
);

export const AuditTrailTable = pgTable(
  "audit_trails",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    details: jsonb("details").notNull(),
    eventId: uuid("event_id").notNull(),
    userId: uuid("user_id").notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => {
    return {
      eventIdIdx: index("audit_trails_event_id_idx").using(
        "btree",
        table.eventId.asc().nullsLast()
      ),
      userIdIdx: index("audit_trails_user_id_idx").using(
        "btree",
        table.userId.asc().nullsLast()
      ),
      auditTrailEventIdFkey: foreignKey({
        columns: [table.eventId],
        foreignColumns: [AuditableEventTable.id],
        name: "audit_trails_event_id_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
      auditTrailUserIdFkey: foreignKey({
        columns: [table.userId],
        foreignColumns: [UserTable.id],
        name: "audit_trails_user_id_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
    };
  }
);

export const AuditTrailTableRelations = relations(
  AuditTrailTable,
  ({ one }) => ({
    auditableEvent: one(AuditableEventTable, {
      fields: [AuditTrailTable.eventId],
      references: [AuditableEventTable.id],
    }),
    user: one(UserTable, {
      fields: [AuditTrailTable.userId],
      references: [UserTable.id],
    }),
  })
);

export const CompanyTable = pgTable(
  "companies",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    website: text("website"),
    industry: text("industry"),
    foundedDate: timestamp("founded_date", { precision: 3, mode: "date" }),
    status: text("status"),
    gst: text("gst"),
    logo: text("logo"),
    stamp: text("stamp"),
    gstAddress: text("gst_address"),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "date",
    }).notNull(),
  },
  (table) => {
    return {
      gstKey: uniqueIndex("companies_gst_key").using(
        "btree",
        table.gst.asc().nullsLast()
      ),
      emailKey: uniqueIndex("companies_email_key").using(
        "btree",
        table.email.asc().nullsLast()
      ),
    };
  }
);

export const CompanyTableRelations = relations(CompanyTable, ({ many }) => ({
  pos: many(POTable),
  users: many(UserTable),
  addresses: many(AddressTable),
}));

export const RFPTable = pgTable(
  "rfps",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    rfpId: varchar("rfp_id", { length: 255 }).notNull(),
    requirementType: text("requirement_type").notNull(),
    dateOfOrdering: timestamp("date_of_ordering", {
      precision: 3,
      mode: "date",
    }).notNull(),
    deliveryLocation: text("delivery_location").notNull(),
    deliveryByDate: timestamp("delivery_by_date", {
      precision: 3,
      mode: "date",
    }).notNull(),
    userId: uuid("user_id").notNull(),
    rfpStatus: RFPStatus("rfp_status").default("DRAFT").notNull(),
    preferredQuotationId: uuid("preferred_quotation_id"),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "date",
    }).notNull(),
  },
  (table) => {
    return {
      rfpIdIdx: index("rfps_rfp_id_idx").using(
        "btree",
        table.rfpId.asc().nullsLast()
      ),
      rfpIdKey: uniqueIndex("rfps_rfp_id_key").using(
        "btree",
        table.rfpId.asc().nullsLast()
      ),
      rfpUserIdFkey: foreignKey({
        columns: [table.userId],
        foreignColumns: [UserTable.id],
        name: "rfps_user_id_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
    };
  }
);

export const RFPTableRelations = relations(RFPTable, ({ one, many }) => ({
  user: one(UserTable, {
    fields: [RFPTable.userId],
    references: [UserTable.id],
  }),
  rfpQueries: many(RFPQueryTable),
  pos: many(POTable),
  quotations: many(QuotationTable),
  approversLists: many(ApproversListTable),
  rfpProducts: many(RFPProductTable),
}));

export const RFPQueryTable = pgTable(
  "rfp_queries",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    content: varchar("content", { length: 255 }).notNull(),
    rfpId: uuid("rfp_id").notNull(),
    userId: uuid("user_id").notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "date",
    }).notNull(),
  },
  (table) => {
    return {
      rfpQueryRfpIdFkey: foreignKey({
        columns: [table.rfpId],
        foreignColumns: [RFPTable.id],
        name: "rfp_queries_rfp_id_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
      rfpQueryUserIdFkey: foreignKey({
        columns: [table.userId],
        foreignColumns: [UserTable.id],
        name: "rfp_queries_user_id_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
    };
  }
);

export const RFPQueryTableRelations = relations(
  RFPQueryTable,
  ({ one, many }) => ({
    rfp: one(RFPTable, {
      fields: [RFPQueryTable.rfpId],
      references: [RFPTable.id],
    }),
    user: one(UserTable, {
      fields: [RFPQueryTable.userId],
      references: [UserTable.id],
    }),
    rfpQueryResponses: many(RFPQueryResponseTable),
  })
);

export const RFPQueryResponseTable = pgTable(
  "rfp_query_responses",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    content: varchar("content", { length: 255 }).notNull(),
    queryId: uuid("query_id").notNull(),
    userId: uuid("user_id").notNull(),
    parentQueryResponseId: uuid("parent_query_response_id"),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "date",
    }).notNull(),
  },
  (table) => {
    return {
      rfpQueryResponseQueryIdFkey: foreignKey({
        columns: [table.queryId],
        foreignColumns: [RFPQueryTable.id],
        name: "rfp_query_responses_query_id_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
      rfpQueryResponseUserIdFkey: foreignKey({
        columns: [table.userId],
        foreignColumns: [UserTable.id],
        name: "rfp_query_responses_user_id_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
      rfpQueryResponseParentQueryResponseIdFkey: foreignKey({
        columns: [table.parentQueryResponseId],
        foreignColumns: [table.id],
        name: "rfp_query_responses_parent_query_response_id_fkey",
      })
        .onUpdate("cascade")
        .onDelete("set null"),
    };
  }
);

export const RFPQueryResponseTableRelations = relations(
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
        "rfp_query_responses_parent_query_response_id_rfp_query_response_id",
    }),
    rfpQueryResponses: many(RFPQueryResponseTable, {
      relationName:
        "rfp_query_responses_parent_query_response_id_rfp_query_response_id",
    }),
  })
);

export const AddressTable = pgTable(
  "addresses",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    addressName: text("address_name").notNull().unique(),
    street: text("street").notNull(),
    city: text("city").notNull(),
    state: text("state").notNull(),
    postalCode: text("postal_code").notNull(),
    country: text("country").notNull(),
    addressType: AddressType("address_type").notNull(),
    companyId: uuid("company_id").notNull(),
  },
  (table) => {
    return {
      addressCompanyIdFkey: foreignKey({
        columns: [table.companyId],
        foreignColumns: [CompanyTable.id],
        name: "addresses_company_id_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
    };
  }
);

export const AddressTableRelations = relations(AddressTable, ({ one }) => ({
  company: one(CompanyTable, {
    fields: [AddressTable.companyId],
    references: [CompanyTable.id],
  }),
}));

export const VendorTable = pgTable(
  "vendors",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    customerCode: text("customer_code"),
    primaryName: text("primary_name").notNull(),
    companyName: text("company_name").notNull(),
    contactDisplayName: text("contact_display_name").notNull(),
    email: text("email"),
    workPhone: text("work_phone"),
    mobile: text("mobile"),
    website: text("website"),
    gstin: text("gstin"),
    msmeNo: text("msme_no"),
    address: text("address"),
    customerState: text("customer_state"),
    customerCity: text("customer_city"),
    country: text("country"),
    zip: text("zip"),
    remarks: text("remarks"),
    pan: text("pan"),
    verifiedById: uuid("verified_by_id"),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "date",
    }).notNull(),
  },
  (table) => {
    return {
      gstinKey: uniqueIndex("vendors_gstin_key").using(
        "btree",
        table.gstin.asc().nullsLast()
      ),
      primaryNameCompanyNameContactDisplayNameEmailMobIdx: index(
        "vendors_primary_name_company_name_contact_display_name_email_mob_idx"
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
        name: "vendors_verified_by_id_fkey",
      })
        .onUpdate("cascade")
        .onDelete("set null"),
    };
  }
);

export const VendorTableRelations = relations(VendorTable, ({ one, many }) => ({
  user: one(UserTable, {
    fields: [VendorTable.verifiedById],
    references: [UserTable.id],
  }),
  quotations: many(QuotationTable),
}));

export const InvoiceTable = pgTable(
  "invoices",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    poId: uuid("po_id").notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "date",
    }).notNull(),
  },
  (table) => {
    return {
      poIdKey: uniqueIndex("invoices_po_id_key").using(
        "btree",
        table.poId.asc().nullsLast()
      ),
      invoicePoIdFkey: foreignKey({
        columns: [table.poId],
        foreignColumns: [POTable.id],
        name: "invoices_po_id_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
    };
  }
);

export const InvoiceTableRelations = relations(
  InvoiceTable,
  ({ one, many }) => ({
    po: one(POTable, {
      fields: [InvoiceTable.poId],
      references: [POTable.id],
    }),
    payments: many(PaymentTable),
    goodStatuses: many(GoodStatusTable),
  })
);

export const PaymentTable = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    invoiceId: uuid("invoice_id").notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "date",
    }).notNull(),
  },
  (table) => {
    return {
      paymentInvoiceIdFkey: foreignKey({
        columns: [table.invoiceId],
        foreignColumns: [InvoiceTable.id],
        name: "payments_invoice_id_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
    };
  }
);

export const PaymentTableRelations = relations(PaymentTable, ({ one }) => ({
  invoice: one(InvoiceTable, {
    fields: [PaymentTable.invoiceId],
    references: [InvoiceTable.id],
  }),
}));

export const ProductCategoryTable = pgTable(
  "product_categories",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "date",
    }).notNull(),
  },
  (table) => {
    return {
      nameKey: uniqueIndex("product_categories_name_key").using(
        "btree",
        table.name.asc().nullsLast()
      ),
    };
  }
);

export const ProductCategoryTableRelations = relations(
  ProductCategoryTable,
  ({ many }) => ({
    products: many(ProductTable),
  })
);

export const ProductTable = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    name: text("name").notNull(),
    modelNo: text("model_no").notNull(),
    specification: text("specification").notNull(),
    productCategoryId: uuid("product_category_id").notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "date",
    }).notNull(),
  },
  (table) => {
    return {
      nameModelNoSpecificationIdx: index(
        "products_name_model_no_specification_idx"
      ).using(
        "btree",
        table.name.asc().nullsLast(),
        table.modelNo.asc().nullsLast(),
        table.specification.asc().nullsLast()
      ),
      productProductCategoryIdFkey: foreignKey({
        columns: [table.productCategoryId],
        foreignColumns: [ProductCategoryTable.id],
        name: "products_product_category_id_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
    };
  }
);

export const ProductTableRelations = relations(
  ProductTable,
  ({ one, many }) => ({
    productCategory: one(ProductCategoryTable, {
      fields: [ProductTable.productCategoryId],
      references: [ProductCategoryTable.id],
    }),
    rfpProducts: many(RFPProductTable),
  })
);

export const POTable = pgTable(
  "pos",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    poId: text("po_id").notNull(),
    remarks: text("remarks").notNull(),
    quotationId: uuid("quotation_id").notNull(),
    userId: uuid("user_id").notNull(),
    companyId: uuid("company_id").notNull(),
    rfpId: uuid("rfp_id").notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "date",
    }).notNull(),
  },
  (table) => {
    return {
      poIdKey: uniqueIndex("pos_po_id_key").using(
        "btree",
        table.poId.asc().nullsLast()
      ),
      quotationIdKey: uniqueIndex("pos_quotation_id_key").using(
        "btree",
        table.quotationId.asc().nullsLast()
      ),
      rfpIdKey: uniqueIndex("pos_rfp_id_key").using(
        "btree",
        table.rfpId.asc().nullsLast()
      ),
      poQuotationIdFkey: foreignKey({
        columns: [table.quotationId],
        foreignColumns: [QuotationTable.id],
        name: "pos_quotation_id_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
      poUserIdFkey: foreignKey({
        columns: [table.userId],
        foreignColumns: [UserTable.id],
        name: "pos_user_id_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
      poCompanyIdFkey: foreignKey({
        columns: [table.companyId],
        foreignColumns: [CompanyTable.id],
        name: "pos_company_id_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
      poRfpIdFkey: foreignKey({
        columns: [table.rfpId],
        foreignColumns: [RFPTable.id],
        name: "pos_rfp_id_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
    };
  }
);

export const POTableRelations = relations(POTable, ({ one, many }) => ({
  quotation: one(QuotationTable, {
    fields: [POTable.quotationId],
    references: [QuotationTable.id],
  }),
  company: one(CompanyTable, {
    fields: [POTable.companyId],
    references: [CompanyTable.id],
  }),
  rfp: one(RFPTable, {
    fields: [POTable.rfpId],
    references: [RFPTable.id],
  }),
  user: one(UserTable, {
    fields: [POTable.userId],
    references: [UserTable.id],
  }),
  invoices: many(InvoiceTable),
}));

export const QuotationTable = pgTable(
  "quotations",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    rfpId: uuid("rfp_id").notNull(),
    vendorId: uuid("vendor_id").notNull(),
    isPrimary: boolean("is_primary").default(false).notNull(),
    refNo: text("ref_no"),
    totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
    totalAmountWithoutGst: numeric("total_amount_without_gst", {
      precision: 10,
      scale: 2,
    }).notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "date",
    }).notNull(),
  },
  (table) => {
    return {
      quotationRfpIdFkey: foreignKey({
        columns: [table.rfpId],
        foreignColumns: [RFPTable.id],
        name: "quotations_rfp_id_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
      quotationVendorIdFkey: foreignKey({
        columns: [table.vendorId],
        foreignColumns: [VendorTable.id],
        name: "quotations_vendor_id_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
    };
  }
);

export const QuotationTableRelations = relations(
  QuotationTable,
  ({ one, many }) => ({
    pos: many(POTable),
    rfp: one(RFPTable, {
      fields: [QuotationTable.rfpId],
      references: [RFPTable.id],
    }),
    vendor: one(VendorTable, {
      fields: [QuotationTable.vendorId],
      references: [VendorTable.id],
    }),
    supportingDocuments: many(SupportingDocumentTable),
    vendorPricings: many(VendorPricingTable),
    otherCharges: many(OtherChargeTable),
  })
);

export const QualityAssuranceTable = pgTable(
  "quality_assurances",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => {
    return {
      userIdKey: uniqueIndex("quality_assurances_user_id_key").using(
        "btree",
        table.userId.asc().nullsLast()
      ),
      qualityAssuranceUserIdFkey: foreignKey({
        columns: [table.userId],
        foreignColumns: [UserTable.id],
        name: "quality_assurances_user_id_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
    };
  }
);

export const QualityAssuranceTableRelations = relations(
  QualityAssuranceTable,
  ({ one, many }) => ({
    goodStatuses: many(GoodStatusTable),
    user: one(UserTable, {
      fields: [QualityAssuranceTable.userId],
      references: [UserTable.id],
    }),
  })
);

export const SupportingDocumentTable = pgTable(
  "supporting_documents",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    documentName: text("document_name").notNull(),
    documentType: text("document_type").notNull(),
    location: text("location").notNull(),
    quotationId: uuid("quotation_id").notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "date",
    }).notNull(),
  },
  (table) => {
    return {
      supportingDocumentQuotationIdFkey: foreignKey({
        columns: [table.quotationId],
        foreignColumns: [QuotationTable.id],
        name: "supporting_documents_quotation_id_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
    };
  }
);

export const SupportingDocumentTableRelations = relations(
  SupportingDocumentTable,
  ({ one }) => ({
    quotation: one(QuotationTable, {
      fields: [SupportingDocumentTable.quotationId],
      references: [QuotationTable.id],
    }),
  })
);

export const ApproversListTable = pgTable(
  "approvers_list",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    rfpId: uuid("rfp_id").notNull(),
    userId: uuid("user_id").notNull(),
    approved: boolean("approved").default(false).notNull(),
    approvedAt: timestamp("approved_at", { precision: 3, mode: "date" }),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "date",
    }).notNull(),
  },
  (table) => {
    return {
      rfpIdUserIdKey: uniqueIndex("approvers_list_rfp_id_user_id_key").using(
        "btree",
        table.rfpId.asc().nullsLast(),
        table.userId.asc().nullsLast()
      ),
      approversListRfpIdFkey: foreignKey({
        columns: [table.rfpId],
        foreignColumns: [RFPTable.id],
        name: "approvers_list_rfp_id_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
      approversListUserIdFkey: foreignKey({
        columns: [table.userId],
        foreignColumns: [UserTable.id],
        name: "approvers_list_user_id_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
    };
  }
);
export const ApproversListTableRelations = relations(
  ApproversListTable,
  ({ one }) => ({
    rfp: one(RFPTable, {
      fields: [ApproversListTable.rfpId],
      references: [RFPTable.id],
    }),
    user: one(UserTable, {
      fields: [ApproversListTable.userId],
      references: [UserTable.id],
    }),
  })
);

export const RFPProductTable = pgTable(
  "rfp_products",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    rfpId: uuid("rfp_id").notNull(),
    name: text("name").notNull(),
    quantity: integer("quantity").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "date",
    }).notNull(),
  },
  (table) => {
    return {
      rfpProductRfpIdFkey: foreignKey({
        columns: [table.rfpId],
        foreignColumns: [RFPTable.id],
        name: "rfp_products_rfp_id_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
    };
  }
);

export const GoodStatusTable = pgTable(
  "good_statuses",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    invoiceId: uuid("invoice_id").notNull(),
    deliveryStatus: boolean("delivery_status").notNull(),
    qualityAssurance: boolean("quality_assurance").notNull(),
    qualityAssuranceLeaderId: uuid("quality_assurance_leader_id").notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "date",
    }).notNull(),
  },
  (table) => {
    return {
      invoiceIdKey: uniqueIndex("good_statuses_invoice_id_key").using(
        "btree",
        table.invoiceId.asc().nullsLast()
      ),
      goodStatusInvoiceIdFkey: foreignKey({
        columns: [table.invoiceId],
        foreignColumns: [InvoiceTable.id],
        name: "good_statuses_invoice_id_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
      goodStatusQualityAssuranceLeaderIdFkey: foreignKey({
        columns: [table.qualityAssuranceLeaderId],
        foreignColumns: [QualityAssuranceTable.id],
        name: "good_statuses_quality_assurance_leader_id_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
    };
  }
);

export const GoodStatusTableRelations = relations(
  GoodStatusTable,
  ({ one }) => ({
    invoice: one(InvoiceTable, {
      fields: [GoodStatusTable.invoiceId],
      references: [InvoiceTable.id],
    }),
    qualityAssurance: one(QualityAssuranceTable, {
      fields: [GoodStatusTable.qualityAssuranceLeaderId],
      references: [QualityAssuranceTable.id],
    }),
  })
);

export const VendorPricingTable = pgTable(
  "vendor_pricings",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    gst: integer("gst").notNull(),
    rfpProductId: uuid("rfp_product_id").notNull(),
    quotationId: uuid("quotation_id").notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "date",
    }).notNull(),
  },
  (table) => {
    return {
      quotationIdRfpProductIdKey: uniqueIndex(
        "vendor_pricings_quotation_id_rfp_product_id_key"
      ).using(
        "btree",
        table.quotationId.asc().nullsLast(),
        table.rfpProductId.asc().nullsLast()
      ),
      vendorPricingQuotationIdFkey: foreignKey({
        columns: [table.quotationId],
        foreignColumns: [QuotationTable.id],
        name: "vendor_pricings_quotation_id_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
      vendorPricingRfpProductIdFkey: foreignKey({
        columns: [table.rfpProductId],
        foreignColumns: [RFPProductTable.id],
        name: "vendor_pricings_rfp_product_id_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
    };
  }
);
export const VendorPricingTableRelations = relations(
  VendorPricingTable,
  ({ one }) => ({
    quotation: one(QuotationTable, {
      fields: [VendorPricingTable.quotationId],
      references: [QuotationTable.id],
    }),
    rfpProduct: one(RFPProductTable, {
      fields: [VendorPricingTable.rfpProductId],
      references: [RFPProductTable.id],
    }),
  })
);

export const OtherChargeTable = pgTable(
  "other_charges",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    name: text("name").notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    gst: numeric("gst", { precision: 5, scale: 2 }).notNull(),
    quotationId: uuid("quotation_id").notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "date",
    }).notNull(),
  },
  (table) => {
    return {
      quotationIdNameKey: uniqueIndex(
        "other_charges_quotation_id_name_key"
      ).using(
        "btree",
        table.quotationId.asc().nullsLast(),
        table.name.asc().nullsLast()
      ),
      otherChargeQuotationIdFkey: foreignKey({
        columns: [table.quotationId],
        foreignColumns: [QuotationTable.id],
        name: "other_charges_quotation_id_fkey",
      })
        .onUpdate("cascade")
        .onDelete("restrict"),
    };
  }
);

export const OtherChargeTableRelations = relations(
  OtherChargeTable,
  ({ one }) => ({
    quotation: one(QuotationTable, {
      fields: [OtherChargeTable.quotationId],
      references: [QuotationTable.id],
    }),
  })
);

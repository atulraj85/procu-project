// lib/prisma.js or lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export { prisma };

export const modelMap: Record<string, any> = {
  company: {
    model: prisma.company,
    attributes: ["id", "name", "address", "created_at", "updated_at"],
  },
  // user: {
  //   model: prisma.user,
  //   attributes: [
  //     "id",
  //     "email",
  //     "password",
  //     "name",
  //     "role",
  //     "companyId",
  //     "created_at",
  //     "updated_at",
  //     "qualityAssurance",
  //   ],
  // },
  vendor: {
    model: prisma.vendor,
    attributes: [
      "id",
      "customerCode",
      "primaryName",
      "companyName",
      "contactDisplayName",
      "email",
      "workPhone",
      "mobile",
      "website",
      "openingBalance",
      "gstin",
      "msmeNo",
      "address",
      "currency",
      "customerTerms",
      "customerState",
      "customerCity",
      "country",
      "zip",
      "fax",
      "dlNumber",
      "remarks",
      "openingType",
      "pan",
      "productCategoryId",
      "created_at",
      "updated_at",
    ],
  },
  payment: {
    model: prisma.payment,
    attributes: ["id", "invoiceId", "created_at", "updated_at"],
  },
  productCategory: {
    model: prisma.productCategory,
    attributes: ["id", "name", "created_at", "updated_at"],
  },
  po: {
    model: prisma.pO,
    attributes: ["id", "quotationId", "userId", "created_at", "updated_at"],
  },
  goodStatus: {
    model: prisma.goodStatus,
    attributes: [
      "id",
      "invoiceId",
      "deliveryStatus",
      "qualityAssurance",
      "qualityAssuranceLeaderId",
      "created_at",
      "updated_at",
    ],
  },
  product: {
    model: prisma.product,
    attributes: [
      "id",
      "name",
      "modelNo",
      "specification",
      "productCategoryId",
      "created_at",
      "updated_at",
    ],
  },
  invoice: {
    model: prisma.invoice,
    attributes: ["id", "poId", "created_at", "updated_at"],
  },
  quotation: {
    model: prisma.quotation,
    attributes: [
      "id",
      "rfpId",
      "vendorId",
      "billAmount",
      "created_at",
      "updated_at",
    ],
  },
  qualityAssurance: {
    model: prisma.qualityAssurance,
    attributes: ["id", "userId", "created_at", "updated_at"],
  },
  // rfp: {
  //   model: prisma.rFP,
  //   attributes: [
  //     "id",
  //     "requirementType",
  //     "dateOfOrdering",
  //     "deliveryLocation",
  //     "deliveryByDate",
  //     "lastDateToRespond",
  //     "rfpStatus",
  //     "userId",
  //     "created_at",
  //     "updated_at",
  //   ],
  // },
  rfpProduct: {
    model: prisma.rFPProduct,
    attributes: [
      "id",
      "rfpId",
      "productId",
      "quantity",
      "created_at",
      "updated_at",
    ],
  },
  approver: {
    model: prisma.approver,
    attributes: ["id", "name", "email", "phone", "created_at", "updated_at"],
  },
  approversList: {
    model: prisma.approversList,
    attributes: [
      "id",
      "rfpId",
      "approverId",
      "approved",
      "approvedAt",
      "created_at",
      "updated_at",
    ],
  },
};

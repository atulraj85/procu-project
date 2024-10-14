import { z } from "zod";

// Product Schema
export const productSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Product name is required"),
  modelNo: z.string().min(1, "Model number is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price must be non-negative"),
  rfpProductId: z.string().min(9, "RFP Product is needed"),
  gst: z
    .enum(["NILL", "0", "3", "5", "12", "18", "28"])
    .refine((val) => val !== "NILL", {
      message: "GST cannot be NILL",
    }),
  totalPriceWithoutGST: z.number(),
  totalPriceWithGST: z.number(),
});

// Other Charge Schema
export const otherChargeSchema = z.object({
  name: z.string().min(1, "Charge name is required"),
  unitPrice: z.number().min(0, "Unit price must be non-negative"),
  gst: z
    .enum(["NILL", "0", "3", "5", "12", "18", "28"])
    .refine((val) => val !== "NILL", {
      message: "GST cannot be NILL",
    }),
});

// Supporting Document Schema
export const supportingDocumentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Document name is required"),
  fileName: z.string().optional(),
  location: z.string().optional(),
});

// Quotation Schema
export const quotationSchema = z.object({
  id: z.string().optional(),
  refNo: z.string().min(1, "Reference number is required"),
  vendorId: z.string().min(1, "Vendor is required"),
  vendor: z.any(),
  totalAmount: z.number(),
  totalAmountWithoutGST: z.number(),
  products: z.array(productSchema).refine((arr) => arr.length > 0, {
    message: "At least one product is required",
  }),
  otherCharges: z.array(otherChargeSchema).refine((arr) => arr.length > 0, {
    message: "At least one other charge is required",
  }),
  total: z.object({
    withGST: z.number(),
    withoutGST: z.number(),
  }),
  supportingDocuments: z
    .array(supportingDocumentSchema)
    .refine((arr) => arr.length > 0, {
      message: "At least one supporting document is required",
    }),
});

// RFP Schema
export const rfpSchema = z.object({
  rfpId: z.string(),
  rfpStatus: z.string(),
  preferredQuotationId: z.string().nullable(),
  preferredVendorId: z.string().optional().nullable(),
  products: z.any().optional(),
  quotations: z
    .array(quotationSchema)
    .min(1, "At least one quotation is required")
    .max(3, "Maximum 3 quotations allowed"),
});

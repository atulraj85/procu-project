import { z } from "zod";

const ProductSchema = z.object({
  specification: z.string().optional(),
  rfpProductId: z
    .string({
      required_error: "Product ID is required",
      invalid_type_error: "Product ID must be a string",
    })
    .optional(),
  name: z.string().optional(),
  modelNo: z.string().optional(),
  quantity: z
    .number({
      required_error: "Quantity is required",
      invalid_type_error: "Quantity must be a number",
    })
    .positive("Quantity must be a positive number"),
});

const ApproverSchema = z.object({
  approverId: z.string({
    required_error: "Approver ID is required",
    invalid_type_error: "Approver ID must be a string",
  }),
  name: z.string().optional(),
  email: z.string().email("Invalid email format").optional(),
  mobile: z.string().optional(),
});

export const FirstRFPSchema = z.object({
  requirementType: z.string({
    required_error: "Requirement type is required",
    invalid_type_error: "Requirement type must be a string",
  }),
  dateOfOrdering: z
    .string({
      required_error: "Date of ordering is required",
    }),
    // .refine((date) => !isNaN(Date.parse(date)), {
    //   message: "Invalid date format for date of ordering",
    // }),
  deliveryLocation: z.string({
    required_error: "Delivery location is required",
    invalid_type_error: "Delivery location must be a string",
  }),
  deliveryByDate: z
    .string({
      required_error: "Delivery by date is required",
    }),
    // .refine((date) => !isNaN(Date.parse(date)), {
    //   message: "Invalid date format for delivery by date",
    // }),

  rfpStatus: z.string({
    required_error: "RFP status is required",
    invalid_type_error: "RFP status must be a string",
  }),
  userId: z.string().optional(),
  rfpProducts: z
    .array(ProductSchema, {
      required_error: "At least one product is required",
      invalid_type_error: "Products must be an array",
    })
    .nonempty("At least one product is required"),
  approvers: z
    .array(ApproverSchema, {
      required_error: "At least one approver is required",
      invalid_type_error: "Approvers must be an array",
    })
    .nonempty("At least one approver is required"),

  additionalInstructions: z.string().optional(),
});

// Type inference
type FirstRFP = z.infer<typeof FirstRFPSchema>;

import { z } from "zod";

export const ProductDataSchema = z.object({
  name: z.string(),
  modelNo: z.string(),
  specification: z.string(),
  productCategoryId: z.string(),
});
export const UpdateProductDataSchema = z.object({
  specification: z.string(),
});

"use server";

import { z } from "zod";
import { ProductDataSchema } from "@/schemas/ProductSchema";
import { createProduct } from "@/data/product";

export async function saveProduct(data: z.infer<typeof ProductDataSchema>) {
  const validation = ProductDataSchema.safeParse(data);

  if (!validation.success) {
    return { error: "Invalid fields!" } as const;
  }

  try {
    await createProduct(validation.data);
    
    return { success: "Saved successfully!" };
  } catch (err) {
    console.error("Failed to create product", err);
    return { error: "Failed to save product." };
  }
}

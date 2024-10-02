"use server";

import { ProductTable } from "@/drizzle/schema";
import { db } from "@/lib/db";

type ProductData = {
  name: string;
  modelNo: string;
  specification: string;
  productCategoryId: string;
};

export async function createProduct(data: ProductData) {
  try {
    const results = await db
      .insert(ProductTable)
      .values({
        name: data.name,
        modelNo: data.modelNo,
        specification: data.specification,
        productCategoryId: data.productCategoryId,

        updatedAt: new Date(),
      })
      .returning();
    return results[0] || null;
  } catch (error) {
    console.error(`Error Creating Product: ${data}`, error);
  }
}

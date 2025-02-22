import { ProductTable } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";

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

export async function putProduct(id: string, data: { specification: string }) {
  try {
    const results = await db
      .update(ProductTable)
      .set({
        specification: data.specification,
        updatedAt: new Date(),
      })
      .where(eq(ProductTable.id, id)) // Assuming 'id' is the unique identifier for the product
      .returning();

    return results[0] || null;
  } catch (error) {
    console.error(`Error Updating Product: ${data}`, error);
    throw new Error("Failed to update product"); // Optionally rethrow the error
  }
}

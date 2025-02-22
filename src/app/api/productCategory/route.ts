import { ProductCategoryTable } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { CreateProductCategorySchema } from "@/schemas";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const productCategories = await db.query.ProductCategoryTable.findMany();
    return NextResponse.json(productCategories);
  } catch (error: unknown) {
    console.error("Detailed error:", error);
    return NextResponse.json(
      { error: "Error fetching records", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const validation = CreateProductCategorySchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }

  try {
    const { name } = validation.data;

    const existingProductCategory =
      await db.query.ProductCategoryTable.findFirst({
        columns: { id: true },
        where: eq(ProductCategoryTable.name, name),
      });
    if (existingProductCategory) {
      return NextResponse.json(
        {
          error: `Product category with name '${name}' already exists`,
        },
        { status: 400 }
      );
    }

    const results = await db
      .insert(ProductCategoryTable)
      .values({
        name,
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json(
      { response: { data: results[0] } },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: `Failed to create user, Error: ${error.message}`,
      },
      { status: 500 }
    );
  }
}

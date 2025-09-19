import { VendorTable } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { VendorRequestBody } from "@/types";
import { and, asc, desc, eq, InferSelectModel, SQL } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// Type Definitions
type SortBy = keyof InferSelectModel<typeof VendorTable>;
type SortDirection = "asc" | "desc";
type WhereField = keyof InferSelectModel<typeof VendorTable>;

const DEFAULT_SORTING_FIELD: SortBy = "id";
const DEFAULT_SORTING_DIRECTION: SortDirection = "desc";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const sortBy: SortBy =
      (searchParams.get("sortBy") as SortBy) || DEFAULT_SORTING_FIELD;
    const sortingOrder: SortDirection =
      (searchParams.get("order") as SortDirection) || DEFAULT_SORTING_DIRECTION;

    if (!["asc", "desc"].includes(sortingOrder)) {
      return NextResponse.json(
        { error: "Invalid order value" },
        { status: 400 }
      );
    }

    // Construct where conditions
    const whereConditions: SQL<unknown>[] = [];
    searchParams.forEach((value, key) => {
      if (key !== "sortBy" && key !== "order") {
        if (key in VendorTable) {
          whereConditions.push(eq(VendorTable[key as WhereField], value));
        }
      }
    });

    // Combine conditions using 'and'
    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Fetch filtered and sorted vendors
    const records = await db.query.VendorTable.findMany({
      where: whereClause,
      orderBy:
        sortingOrder === "asc"
          ? [asc(VendorTable[sortBy])]
          : [desc(VendorTable[sortBy])],
    });

    return NextResponse.json(records);
  } catch (error: unknown) {
    console.error("Detailed error:", error);
    return NextResponse.json(
      { error: "Error fetching records", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const vendorDataArray: VendorRequestBody[] = await request.json();

    // Validate that the body is an array
    if (!Array.isArray(vendorDataArray)) {
      return NextResponse.json(
        { error: "Request body must be an array of vendor data." },
        { status: 400 }
      );
    }

    // Validate required fields for each vendor
    const requiredFields: (keyof VendorRequestBody)[] = [
      "primaryName",
      "companyName",
      "contactDisplayName",
    ];

    const createdVendors = [];

    for (const vendorData of vendorDataArray) {
      for (const field of requiredFields) {
        if (!vendorData[field]) {
          return NextResponse.json(
            { error: `Missing required field: ${field}` },
            { status: 400 }
          );
        }
      }

      // Create a new vendor
      const newVendor = await db.insert(VendorTable).values({
        ...vendorData,
        updatedAt: new Date(),
      });

      createdVendors.push(newVendor);
    }

    

    return NextResponse.json({ data: createdVendors }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating vendors:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A vendor with this unique field already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: `Failed to create vendors: ${error.message}` },
      { status: 500 }
    );
  }
}

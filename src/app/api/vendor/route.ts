import { VendorTable } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { standardized_error_response, database_error_response, success_response } from "@/lib/response";
import { BUSINESS_ERROR_CODES, VALIDATION_ERROR_CODES } from "@/lib/errorCodes";
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
      return standardized_error_response(
        VALIDATION_ERROR_CODES.INVALID_FORMAT,
        { field: "order", validValues: ["asc", "desc"] },
        "Invalid order value. Must be 'asc' or 'desc'"
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

    return success_response(records, "Vendors retrieved successfully");
  } catch (error: unknown) {
    console.error("Detailed error:", error);
    return standardized_error_response(
      "INTERNAL_SERVER_ERROR",
      { originalError: (error as Error).message },
      "Error fetching vendor records"
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const vendorDataArray: VendorRequestBody[] = await request.json();

    // Validate that the body is an array
    if (!Array.isArray(vendorDataArray)) {
      return standardized_error_response(
        VALIDATION_ERROR_CODES.INVALID_FORMAT,
        { expectedType: "array", receivedType: typeof vendorDataArray },
        "Request body must be an array of vendor data"
      );
    }

    if (vendorDataArray.length === 0) {
      return standardized_error_response(
        VALIDATION_ERROR_CODES.INVALID_FORMAT,
        { minimumItems: 1 },
        "At least one vendor must be provided"
      );
    }

    // Validate required fields for each vendor
    const requiredFields: (keyof VendorRequestBody)[] = [
      "primaryName",
      "companyName",
      "contactDisplayName",
    ];

    for (let i = 0; i < vendorDataArray.length; i++) {
      const vendorData = vendorDataArray[i];
      for (const field of requiredFields) {
        if (!vendorData[field]) {
          return standardized_error_response(
            VALIDATION_ERROR_CODES.REQUIRED_FIELD,
            { field, vendorIndex: i },
            `Missing required field '${field}' for vendor at index ${i}`
          );
        }
      }
    }

    const createdVendors = [];

    for (const vendorData of vendorDataArray) {
      // Create a new vendor
      const newVendor = await db.insert(VendorTable).values({
        ...vendorData,
        updatedAt: new Date(),
      });

      createdVendors.push(newVendor);
    }

    return success_response(
      { vendors: createdVendors, count: createdVendors.length },
      `Successfully created ${createdVendors.length} vendor(s)`,
      201
    );
  } catch (error: any) {
    console.error("Error creating vendors:", error);

    // Handle specific Prisma/Database errors
    if (error.code) {
      return database_error_response(error);
    }

    // Handle other errors
    return standardized_error_response(
      "INTERNAL_SERVER_ERROR",
      { originalError: error.message },
      "Failed to create vendors"
    );
  }
}

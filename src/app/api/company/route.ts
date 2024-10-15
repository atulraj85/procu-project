import { deleteCompany } from "@/data/company";
import { CompanyTable } from "@/drizzle/schema";
import { db } from "@/lib/db";

import { companySchema } from "@/schemas/Comapny/InitialCompanySchema";
import { and, asc, desc, eq, InferSelectModel, SQL } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// Type Definitions
type SortBy = keyof InferSelectModel<typeof CompanyTable>;
type SortDirection = "asc" | "desc";
type WhereField = keyof InferSelectModel<typeof CompanyTable>;

const DEFAULT_SORTING_FIELD: SortBy = "id";
const DEFAULT_SORTING_DIRECTION: SortDirection = "desc";

export async function POST(request: Request) {
  const debug = true; // Set to true to enable debug logs

  try {
    if (debug) {
      console.log("Starting company registration route");
    }

    const reqData = await request.json();
    if (debug) {
      console.log("Request data:", reqData);
    }

    const validation = companySchema.safeParse(reqData);

    if (!validation.success) {
      if (debug) {
        console.log("Validation error:", validation.error);
      }
      // return

      return NextResponse.json({ error: "Invalid fields!" });
    } else {
      if (debug) {
        console.log("Validation success:", validation.success);
      }
    }

    // Extract fields from FormData
    const fields = validation.data;
    if (debug) {
      console.log("Validated fields:", fields);
    }

    // Convert FormData entries to an array and iterate
    const gst = fields.company_gstn;
    if (debug) {
      console.log("GST number:", gst);
    }

    // first find this compnay alreadi registerd or not
    if (debug) {
      console.log("Checking if company exists with GST:", gst);
    }

    const result = await db
      .select()
      .from(CompanyTable)
      .where(eq(CompanyTable.gst, gst));

    if (debug) {
      console.log("Company search result:", result);
    }

    if (result.length != 0) {
      if (debug) {
        console.log("Company already registered with GST:", gst);
        console.log("Company already registered:", result);
      }
      return NextResponse.json(
        { error: "Company Already Registerd!" },
        { status: 409 }
      );
    }
    // Create a new company entry in the database
    if (debug) {
      console.log("Creating company in database with fields:", fields);
    }

    const [insertedCompany] = await db
      .insert(CompanyTable)
      .values({
        name: fields.company_name,
        gst: fields.company_gstn,
        gstAddress: fields.address,
        email: fields.email,
        phone: fields.phone,
        updatedAt: new Date(),
      })
      .returning();

    if (debug) {
      console.log("Company created successfully:", insertedCompany);
    }

    // Return only the inserted company data
    return NextResponse.json(insertedCompany, { status: 201 });
  } catch (error) {
    if (debug) {
      console.log("Error in company registration:", error);
      console.log(
        "Error details:",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
    return NextResponse.json(
      { error: "Failed to save company" },
      { status: 500 }
    );
  }
}
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
        if (key in CompanyTable) {
          whereConditions.push(eq(CompanyTable[key as WhereField], value));
        }
      }
    });

    // Combine conditions using 'and'
    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Fetch filtered and sorted users
    const companies = await db.query.CompanyTable.findMany({
      where: whereClause,
      orderBy:
        sortingOrder === "asc"
          ? [asc(CompanyTable[sortBy])]
          : [desc(CompanyTable[sortBy])],
      // Include the addresses in the result
      with: {
        addresses: true,
      },
    });

    console.log(`Found ${companies.length} records`);

    return NextResponse.json(companies);
  } catch (error) {
    console.error("Detailed error:", error);
    return NextResponse.json(
      { error: "Error fetching records", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await deleteCompany(id);
    return NextResponse.json({ message: "Company deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Error deleting company" },
      { status: 500 }
    );
  }
}

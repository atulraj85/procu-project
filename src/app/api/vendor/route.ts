// /api/vendor/route.ts
import { VendorTable, UserTable, CompanyTable } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { VendorRequestBody } from "@/types";
import { and, asc, desc, eq, InferSelectModel, SQL } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// Type Definitions
type SortBy = keyof InferSelectModel<typeof VendorTable>;
type SortDirection = "asc" | "desc";
type WhereField = keyof InferSelectModel<typeof VendorTable>;

const DEFAULT_SORTING_FIELD: SortBy = "id";
const DEFAULT_SORTING_DIRECTION: SortDirection = "desc";

// Update VendorRequestBody to include password and user details
interface VendorRegistrationBody extends VendorRequestBody {
  password: string;
  email: string; // Make email required
}

export async function POST(request: NextRequest) {
  try {
    const vendorDataArray: VendorRegistrationBody[] = await request.json();

    // Validate that the body is an array
    if (!Array.isArray(vendorDataArray)) {
      return NextResponse.json(
        { error: "Request body must be an array of vendor data." },
        { status: 400 }
      );
    }

    // Validate required fields for each vendor
    const requiredFields: (keyof VendorRegistrationBody)[] = [
      "primaryName",
      "companyName", 
      "contactDisplayName",
      "email",
      "password",
    ];

    const createdVendors = [];

    for (const vendorData of vendorDataArray) {
      // Validate required fields
      for (const field of requiredFields) {
        if (!vendorData[field]) {
          return NextResponse.json(
            { error: `Missing required field: ${field}` },
            { status: 400 }
          );
        }
      }

      // Additional email validation
      if (!vendorData.email || typeof vendorData.email !== 'string' || vendorData.email.trim() === '') {
        return NextResponse.json(
          { error: "Valid email is required" },
          { status: 400 }
        );
      }

      // FIX: Check if email already exists - with proper type checking
      const existingUser = await db
        .select({ id: UserTable.id })
        .from(UserTable)
        .where(eq(UserTable.email, vendorData.email.trim())) // Now TypeScript knows email is string
        .limit(1);

      if (existingUser.length > 0) {
        return NextResponse.json(
          { error: `Email ${vendorData.email} is already registered` },
          { status: 409 }
        );
      }

      // FIX: Check if GSTIN already exists - with null check
      if (vendorData.gstin && typeof vendorData.gstin === 'string' && vendorData.gstin.trim() !== '') {
        const existingVendor = await db
          .select({ id: VendorTable.id })
          .from(VendorTable)
          .where(eq(VendorTable.gstin, vendorData.gstin.trim()))
          .limit(1);

        if (existingVendor.length > 0) {
          return NextResponse.json(
            { error: `GSTIN ${vendorData.gstin} is already registered` },
            { status: 409 }
          );
        }
      }

      // Use transaction to create Company, User, and Vendor
      const result = await db.transaction(async (tx) => {
        // Step 1: Create Company first (since User requires companyId)
        const [newCompany] = await tx
          .insert(CompanyTable)
          .values({
            name: vendorData.companyName || '',
            email: vendorData.email.trim(),
            phone: vendorData.mobile || vendorData.workPhone || '',
            website: vendorData.website || '',
            gst: vendorData.gstin || '',
            gstAddress: vendorData.address || '',
            status: "ACTIVE",
            updatedAt: new Date(),
          })
          .returning({ id: CompanyTable.id });


        // Step 2: Create Vendor profile
        const [newVendor] = await tx
          .insert(VendorTable)
          .values({
            customerCode: vendorData.customerCode || `VEND-${Date.now()}`,
            primaryName: vendorData.primaryName || '',
            companyName: vendorData.companyName || '',
            contactDisplayName: vendorData.contactDisplayName || vendorData.primaryName || '',
            email: vendorData.email.trim(),
            workPhone: vendorData.workPhone || '',
            mobile: vendorData.mobile || '',
            website: vendorData.website || '',
            gstin: vendorData.gstin || '',
            msmeNo: vendorData.msmeNo || '',
            address: vendorData.address || '',
            customerState: vendorData.customerState || '',
            customerCity: vendorData.customerCity || '',
            country: vendorData.country || 'India',
            zip: vendorData.zip || '',
            remarks: vendorData.remarks || '',
            pan: vendorData.pan || '',
            status: "PENDING_REVIEW",
            verifiedById: null,
            updatedAt: new Date(),
          })
          .returning({
            id: VendorTable.id,
            primaryName: VendorTable.primaryName,
            companyName: VendorTable.companyName,
            email: VendorTable.email,
            status: VendorTable.status,
          });

        // Step 3: Hash password
        const hashedPassword = await bcrypt.hash(vendorData.password, 12);

        // Step 4: Create User account with VENDOR role
        const [newUser] = await tx
          .insert(UserTable)
          .values({
            name: vendorData.primaryName || '',
            email: vendorData.email.trim(),
            password: hashedPassword,
            mobile: vendorData.mobile || '',
            role: "VENDOR",
            vendorId : newVendor.id,
            companyId: newCompany.id,
            updatedAt: new Date(),
          })
          .returning({ id: UserTable.id, email: UserTable.email });


        return {
          user: newUser,
          vendor: newVendor,
          company: newCompany,
        };
      });

      createdVendors.push(result);
    }

    return NextResponse.json({ 
      data: createdVendors,
      message: "Vendor registration successful. Your application is pending approval."
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error creating vendors:", error);

    // Handle specific database errors
    if (error.code === "23505") { // Unique constraint violation
      return NextResponse.json(
        { error: "A vendor with this email or GSTIN already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: `Failed to create vendors: ${error.message}` },
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
        if (key in VendorTable) {
          whereConditions.push(eq(VendorTable[key as WhereField], value));
        }
      }
    });

    // Add to your existing GET function
const status = searchParams.get("status");
if (status) {
  whereConditions.push(eq(VendorTable.status, status as any));
}

    
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


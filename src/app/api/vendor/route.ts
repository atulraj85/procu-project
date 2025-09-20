// /api/vendor/route.ts
import { VendorTable, UserTable, OrganizationTable, VendorContactTable } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { and, asc, desc, eq, InferSelectModel, SQL } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// Type Definitions
type SortBy = keyof InferSelectModel<typeof VendorTable>;
type SortDirection = "asc" | "desc";
type WhereField = keyof InferSelectModel<typeof VendorTable>;

const DEFAULT_SORTING_FIELD: SortBy = "id";
const DEFAULT_SORTING_DIRECTION: SortDirection = "desc";

// Vendor Registration Interface for new schema
interface VendorRegistrationBody {
  // User Authentication
  name: string;
  email: string;
  password: string;
  mobile?: string;
  
  // Vendor Company Information
  companyName: string;
  legalName?: string;
  gstin?: string;
  pan?: string;
  businessRegistrationYear?: number;
  employeeCount?: string;
  logo?: string;
  description?: string;
  
  // Address Information
  address: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  
  // Contact Details
  phone?: string;
  website?: string;
  
  // Business Details
  specializations?: string[];
  certifications?: any[];
  socialMediaLinks?: any;
  dealingKeywords?: string[];
  
  // Additional Contact Information
  primaryContactName?: string;
  primaryContactEmail?: string;
  primaryContactPhone?: string;
  designation?: string;
}

// /api/vendor/route.ts - Updated to match your frontend data
export async function POST(request: NextRequest) {
  try {
    const vendorData = await request.json();

    // Get user information from userId to fill missing data
    const userData = await db
      .select({
        name: UserTable.name,
        email: UserTable.email,
        mobile: UserTable.mobile,
        organizationId: UserTable.organizationId
      })
      .from(UserTable)
      .where(eq(UserTable.id, vendorData.userId))
      .limit(1);

    if (userData.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const user = userData[0];

    // Validate required fields (using data from user if not provided)
    const requiredFields = {
      companyName: vendorData.companyName,
      city: vendorData.city,
      state: vendorData.state,
      pincode: vendorData.pincode,
      primaryContactName: vendorData.primaryContactName || user.name,
      primaryContactEmail: vendorData.primaryContactEmail || user.email,
    };

    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Use transaction to create vendor and update user
    const result = await db.transaction(async (tx) => {
      // Create Vendor profile
      const [newVendor] = await tx
        .insert(VendorTable)
        .values({
          companyName: vendorData.companyName,
          legalName: vendorData.legalName || vendorData.companyName,
          gstin: vendorData.gstin || null,
          pan: vendorData.pan || null,
          businessRegistrationYear: vendorData.businessRegistrationYear || null,
          employeeCount: vendorData.employeeCount || null,
          logo: vendorData.logo || null,
          description: vendorData.description || null,
          
          // Address - use addressLine1 as address
          address: vendorData.addressLine1 || vendorData.address || '',
          city: vendorData.city,
          state: vendorData.state,
          pincode: vendorData.pincode,
          country: vendorData.country || 'India',
          
          // Contact Details
          phone: vendorData.primaryContactPhone || vendorData.whatsappNumber || user.mobile,
          email: vendorData.primaryContactEmail || user.email,
          website: vendorData.website || null,
          
          // Business Details
          specializations: vendorData.specializations || [],
          certifications: vendorData.certifications || null,
          socialMediaLinks: vendorData.socialMediaLinks || null,
          dealingKeywords: vendorData.dealingKeywords || [], // This is what we need to collect
          
          status: "PENDING_REVIEW",
          verifiedBy: null,
          verifiedAt: null,
          updatedAt: new Date(),
        })
        .returning();

      // Update user with vendor reference
      await tx
        .update(UserTable)
        .set({
          vendorId: newVendor.id,
          role: "VENDOR",
          updatedAt: new Date(),
        })
        .where(eq(UserTable.id, vendorData.userId));

      // Create primary vendor contact
      await tx
        .insert(VendorContactTable)
        .values({
          vendorId: newVendor.id,
          name: vendorData.primaryContactName || user.name,
          designation: vendorData.designation || 'Primary Contact',
          email: vendorData.primaryContactEmail || user.email,
          phone: vendorData.primaryContactPhone || vendorData.whatsappNumber || user.mobile,
          isPrimary: true,
          updatedAt: new Date(),
        });

      return newVendor;
    });

    return NextResponse.json({ 
      data: result,
      message: "Vendor registration successful. Your application is pending approval."
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error creating vendor:", error);
    return NextResponse.json(
      { error: `Failed to create vendor: ${error.message}` },
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


import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { serializePrismaModel } from "../[tablename]/route"; // Adjust the import path as necessary

const prisma = new PrismaClient();

interface VendorRequestBody {
  customerCode?: string;
  primaryName: string;
  companyName: string;
  contactDisplayName: string;
  email?: string;
  workPhone?: string;
  mobile?: string;
  website?: string;
  openingBalance?: string;
  gstin?: string;
  msmeNo?: string;
  address?: string;
  currency?: string;
  customerTerms?: string;
  customerState?: string;
  customerCity?: string;
  country?: string;
  zip?: string;
  fax?: string;
  dlNumber?: string;
  remarks?: string;
  openingType?: string;
  pan?: string;
  productCategoryId: number; // Assuming this is required
  verifiedById?: string; // Optional field for the user who verified the vendor
}

export async function POST(request: Request) {
  try {
    const vendorData: VendorRequestBody = await request.json();

    // Create a new vendor
    const newVendor = await prisma.vendor.create({
      data: {
        ...vendorData,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return NextResponse.json({ data: newVendor }, { status: 201 });
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

    const whereClause: Record<string, any> = {};
    const orderByClause: Record<string, "asc" | "desc"> = {};
    const validAttributes = [
      "id",
      "customerCode",
      "primaryName",
      "companyName",
      "contactDisplayName",
      "email",
      "workPhone",
      "mobile",
      "website",
      "openingBalance",
      "gstin",
      "msmeNo",
      "address",
      "currency",
      "customerTerms",
      "customerState",
      "customerCity",
      "country",
      "zip",
      "fax",
      "dlNumber",
      "remarks",
      "openingType",
      "pan",
      "productCategoryId",
      "verifiedById", // Include verifiedById in valid attributes
      "created_at",
      "updated_at",
    ];

    searchParams.forEach((value, key) => {
      if (validAttributes.includes(key)) {
        if (key === "orderBy") {
          const [orderByField, orderByDirection] = value.split(",");
          if (validAttributes.includes(orderByField)) {
            orderByClause[orderByField] =
              orderByDirection === "asc" ? "asc" : "desc";
          }
        } else if (key === "id") {
          const ids = value.split(",").map((id) => id);
          whereClause.id = ids.length > 1 ? { in: ids } : ids[0];
        } else {
          whereClause[key] = value;
        }
      } else {
        return NextResponse.json(
          { error: `Invalid attribute: ${key}` },
          { status: 400 }
        );
      }
    });

    const records = await prisma.vendor.findMany({
      where: whereClause,
      orderBy: orderByClause,
    });

    if (Object.keys(whereClause).length > 0 && records.length === 0) {
      return NextResponse.json(
        { error: `Not found matching the criteria` },
        { status: 404 }
      );
    }

    return NextResponse.json(serializePrismaModel(records));
  } catch (error: unknown) {
    console.error("Detailed error:", error);
    return NextResponse.json(
      { error: "Error fetching records", details: (error as Error).message },
      { status: 500 }
    );
  }
}

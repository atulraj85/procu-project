import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { serializePrismaModel, VendorRequestBody } from "@/types";

const prisma = new PrismaClient();

const vendorModel = {
  model: prisma.vendor,
  attributes: [
    "id",
    "customerCode",
    "primaryName",
    "companyName",
    "contactDisplayName",
    "email",
    "workPhone",
    "mobile",
    "website",
    "gstin",
    "msmeNo",
    "address",
    "customerState",
    "customerCity",
    "country",
    "zip",
    "remarks",
    "pan",
    "verifiedById",
    "created_at",
    "updated_at",
  ],
};

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
      "gstin",
      "msmeNo",
      "address",
      "customerState",
      "customerCity",
      "country",
      "zip",
      "remarks",
      "pan",
      "verifiedById",
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
        } else if (key === "id" || key === "verifiedById") {
          const ids = value.split(",").map((id) => id);
          whereClause[key] = ids.length > 1 ? { in: ids } : ids[0];
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

    return NextResponse.json(records);
  } catch (error: unknown) {
    console.error("Detailed error:", error);
    return NextResponse.json(
      { error: "Error fetching records", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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
      const newVendor = await prisma.vendor.create({
        data: vendorData,
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

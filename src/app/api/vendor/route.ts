import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { VendorRequestBody } from "@/types";
import { serializePrismaModel } from "../[tablename]/route";

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

export async function POST(request: Request) {
  try {
    const vendorData: VendorRequestBody = await request.json();

    // Validate required fields
    const requiredFields: (keyof VendorRequestBody)[] = [
      "primaryName",
      "companyName",
      "contactDisplayName",
    ];
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

    return NextResponse.json({ data: newVendor }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating vendor:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A vendor with this unique field already exists." },
        { status: 409 }
      );
    }

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


export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID is required for updating a record" },
        { status: 400 }
      );
    }

    const data = await request.json();

    const validAttributes = vendorModel.attributes;
    const invalidKeys = Object.keys(data).filter(
      (key) => !validAttributes.includes(key)
    );
    if (invalidKeys.length > 0) {
      return NextResponse.json(
        { error: `Invalid attributes in data: ${invalidKeys.join(", ")}` },
        { status: 400 }
      );
    }

    // Add the updated_at field to the data
    data.updated_at = new Date(); // Set to the current date and time

    // Update the record
    const updatedRecord = await vendorModel.model.update({
      where: { id: id },
      data,
    });

    return NextResponse.json(serializePrismaModel(updatedRecord), {
      status: 200,
    });
  } catch (error: unknown) {
    console.error("Detailed error:", error);
    return NextResponse.json(
      { error: "Error updating record", details: (error as Error).message },
      { status: 500 }
    );
  }
}


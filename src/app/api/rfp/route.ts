import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { generateRFPId } from "@/lib/prisma";
import { RequestBody, RFPStatus, serializePrismaModel } from "@/types";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const {
      requirementType,
      dateOfOrdering,
      deliveryLocation,
      deliveryByDate,
      userId,
      rfpProducts,
      approvers,
      rfpStatus,
    }: RequestBody = await request.json();

    // Check if the user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User does not exist" },
        { status: 404 }
      );
    }

    // Validate the status
    if (!Object.values(RFPStatus).includes(rfpStatus)) {
      return NextResponse.json(
        { error: `Invalid status value: ${rfpStatus}` },
        { status: 400 }
      );
    }

    // Generate RFP ID
    const rfpId = await generateRFPId();

    // Create RFP inside the transaction
    const newRFP = await prisma.$transaction(async (prisma) => {
      // Create the RFP first
      const createdRFP = await prisma.rFP.create({
        data: {
          rfpId,
          requirementType,
          dateOfOrdering: new Date(dateOfOrdering),
          deliveryLocation,
          deliveryByDate: new Date(deliveryByDate),
          userId,
          rfpStatus,
        },
      });

      // Create RFP products and approvers
      await Promise.all([
        prisma.rFPProduct.createMany({
          data: rfpProducts.map((rfpProduct) => ({
            rfpId: createdRFP.id, // Use the ID of the created RFP
            quantity: rfpProduct.quantity,
            productId: parseInt(rfpProduct.productId, 10), // Ensure this is the correct type
          })),
        }),
        prisma.approversList.createMany({
          data: approvers.map((approver) => ({
            rfpId: createdRFP.id, // Use the ID of the created RFP
            userId: approver.approverId,
            approved: false,
          })),
        }),
      ]);

      return createdRFP;
    });

    return NextResponse.json({ data: newRFP }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating RFP:", error);
    return NextResponse.json(
      { error: `Failed to create RFP: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const whereClause: Record<string, any> = {};
    const orderByClause: Record<string, "asc" | "desc"> = {};
    const validAttributes = rfpModel.attributes;

    searchParams.forEach((value, key) => {
      if (validAttributes.includes(key)) {
        if (key === "orderBy") {
          const [orderByField, orderByDirection] = value.split(",");
          if (validAttributes.includes(orderByField)) {
            orderByClause[orderByField] =
              orderByDirection === "asc" ? "asc" : "desc";
          }
        } else if (key === "id") {
          const ids = value.split(",").map((id) => parseInt(id, 10));
          whereClause.id = ids.length > 1 ? { in: ids } : ids[0];
        } else if (key === "state_id") {
          const stateIds = value.split(",").map((id) => parseInt(id, 10));
          whereClause.state_id =
            stateIds.length > 1 ? { in: stateIds } : stateIds[0];
        } else {
          whereClause[key] = value;
        }
      }
    });

    // console.log("Where clause:", whereClause);

    const records = await prisma.rFP.findMany({
      where: whereClause,
      orderBy: orderByClause,
    });

    if (Object.keys(whereClause).length > 0 && records.length === 0) {
      return NextResponse.json(
        { error: `No found matching the criteria` },
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

export const rfpModel = {
  model: prisma.rFP,
  attributes: [
    "id",
    "rfpId",
    "requirementType",
    "dateOfOrdering",
    "deliveryLocation",
    "deliveryByDate",
    "userId",
    "rfpStatus",
    "quotations",
    "preferredVendorId",
    "preferredQuotationId",
    "created_at",
    "updated_at",
  ],
};

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

    // Define valid attributes for the RFP model
    const validAttributes = rfpModel.attributes; // Assuming rfpModel is defined similarly to vendorModel
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
    const updatedRecord = await rfpModel.model.update({
      where: { id: id }, // Ensure id is the correct type (string or number based on your schema)
      data,
    });

    return NextResponse.json(serializePrismaModel(updatedRecord), {
      status: 200,
    });
  } catch (error: unknown) {
    console.error("Error updating RFP:", error);
    return NextResponse.json(
      { error: "Error updating record", details: (error as Error).message },
      { status: 500 }
    );
  }
}

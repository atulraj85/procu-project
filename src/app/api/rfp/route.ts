import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { generateRFPId, modelMap } from "@/lib/prisma";
import { serializePrismaModel } from "../[tablename]/route";
import { RequestBody, RFPStatus } from "@/types";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const {
      requirementType,
      dateOfOrdering,
      deliveryLocation,
      deliveryByDate,
      lastDateToRespond,
      userId,
      rfpProducts,
      approvers,
      rfpStatus,
      quotations,
      preferredVendorId,
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
          lastDateToRespond: new Date(lastDateToRespond),
          userId,
          rfpStatus,
        },
      });

      // Create related records using the createdRFP.id
      const createdQuotations = await prisma.quotation.createMany({
        data: quotations.map((quotation) => ({
          rfpId: createdRFP.id, // Use the ID of the created RFP
          billAmount: quotation.billAmount,
          vendorId: quotation.vendorId,
        })),
      });

      // Determine the preferredQuotationId based on the preferredVendorId
      const preferredQuotation = await prisma.quotation.findFirst({
        where: {
          vendorId: preferredVendorId,
          rfpId: createdRFP.id, // Ensure this is the correct RFP ID
        },
      });

      const preferredQuotationId = preferredQuotation
        ? preferredQuotation.id
        : null;

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

      // Update the RFP with the preferredQuotationId
      await prisma.rFP.update({
        where: { id: createdRFP.id },
        data: { preferredQuotationId },
      });

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

const rfpModel = {
  model: prisma.rFP,
  attributes: [
    "id",
    "rfpId",
    "requirementType",
    "dateOfOrdering",
    "deliveryLocation",
    "deliveryByDate",
    "lastDateToRespond",
    "userId",
    "rfpStatus",
    "preferredQuotationId",
    "created_at",
    "updated_at",
  ],
};

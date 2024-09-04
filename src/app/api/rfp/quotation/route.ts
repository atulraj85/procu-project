import { NextRequest, NextResponse } from "next/server";
import { rfpModel } from "../route";
import { serializePrismaModel } from "@/types";
import { prisma } from "@/lib/prisma";

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
    const { preferredVendorId } = data; // Extract preferredVendorId from the request

    // Define valid attributes for the RFP model
    const validAttributes = rfpModel.attributes;
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
    data.updated_at = new Date();

    // Create new quotations for those that do not exist
    const newQuotations = data.quotations.map(
      (quotation: { vendorId: string | number; billAmount: any }) => ({
        vendorId: quotation.vendorId,
        billAmount: quotation.billAmount,
        rfpId: id, // Connect to the current RFP
      })
    );

    // Remove preferredVendorId from data before updating
    delete data.preferredVendorId;

    // Update the RFP record with new quotations
    const updatedRecord = await prisma.rFP.update({
      where: { id: id },
      data: {
        ...data,
        quotations: {
          create: newQuotations, // Create new quotations
        },
      },
    });

    // After creating the quotations, find the preferredQuotationId
    const createdQuotations = await prisma.quotation.findMany({
      where: { rfpId: id },
    });

    // Find the preferredQuotationId based on preferredVendorId
    const preferredQuotationId = createdQuotations.find(
      (quotation) => quotation.vendorId === preferredVendorId
    )?.id;

    // Update the RFP record with the preferredQuotationId if it exists
    if (preferredQuotationId) {
      await prisma.rFP.update({
        where: { id: id },
        data: {
          preferredQuotationId, // Set the preferredQuotationId
        },
      });
    }

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

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { generateRFPId, rfpModel } from "@/lib/prisma";
import { RequestBody, RFPStatus, serializePrismaModel } from "@/types";
import { vendorList } from "@/lib/sidebarLinks";

const prisma = new PrismaClient();

function formatRFPData(inputData: any[]) {
  return inputData.map((rfp: any) => ({
    id: rfp.id,
    rfpId: rfp.rfpId,
    requirementType: rfp.requirementType,
    dateOfOrdering: rfp.dateOfOrdering,
    deliveryLocation: rfp.deliveryLocation,
    deliveryByDate: rfp.deliveryByDate,
    rfpStatus: rfp.rfpStatus,
    preferredQuotationId: rfp.preferredQuotationId,
    created_at: rfp.created_at,
    updated_at: rfp.updated_at,
    approvers: rfp.approversList.map((approver: any) => ({
      name: approver.user.name,
      email: approver.user.email,
      mobile: approver.user.mobile,
    })),
    products: rfp.rfpProducts.map((product: any) => ({
      id: product.product.id,
      name: product.product.name,
      modelNo: product.product.modelNo,
      quantity: product.quantity,
      rfpProductId: product.id,
    })),
    quotations: rfp.quotations.map((quotation: any) => ({
      id: quotation.id,
      totalAmount: quotation.totalAmount,
      refNo: quotation.refNo,
      totalAmountWithoutGST: quotation.totalAmountWithoutGST,
      created_at: quotation.created_at,
      updated_at: quotation.updated_at,
      vendor: quotation.vendor,
      products: [
        ...quotation?.vendorPricings.map((pricing: any) => ({
          id: pricing.rfpProduct.product.id,
          rfpProductId: pricing.rfpProduct.id,
          name: pricing.rfpProduct.product.name,
          modelNo: pricing.rfpProduct.product.modelNo,
          quantity: pricing.rfpProduct.quantity,
          price: pricing.price,
          gst: pricing.GST,
          type: "product", 
        })),
        ...(quotation.otherCharges || []).map((charge: any) => ({
          ...charge,
          type: "otherCharge",
        })),
      ],
      supportingDocuments: quotation.supportingDocuments || [],
    })),
    createdBy: {
      name: rfp.user.name,
      email: rfp.user.email,
      mobile: rfp.user.mobile,
    },
  }));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const whereClause: Record<string, any> = {};
    let orderByClause: Record<string, "asc" | "desc"> | undefined = undefined;
    const validAttributes = [...rfpModel.attributes, "orderBy"];

    console.log("Received search params:", Object.fromEntries(searchParams));

    searchParams.forEach((value, key) => {
      console.log(`Processing parameter: ${key} = ${value}`);
      if (validAttributes.includes(key)) {
        if (key === "orderBy") {
          const parts = value.split(",");
          let orderByField: string = rfpModel.attributes[0]; // Default to first attribute
          let orderByDirection: "asc" | "desc" = "asc"; // Default to ascending

          if (parts.length === 2) {
            orderByField = parts[0];
            orderByDirection =
              parts[1].toLowerCase() === "desc" ? "desc" : "asc";
          } else if (parts.length === 1) {
            orderByDirection =
              parts[0].toLowerCase() === "desc" ? "desc" : "asc";
          }

          console.log(
            `OrderBy field: ${orderByField}, direction: ${orderByDirection}`
          );

          if (rfpModel.attributes.includes(orderByField)) {
            orderByClause = {
              [orderByField]: orderByDirection,
            };
            console.log(`Set orderByClause:`, orderByClause);
          } else {
            console.log(`Invalid orderBy field: ${orderByField}`);
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
      } else {
        console.log(`Ignoring invalid parameter: ${key}`);
      }
    });

    const records = await prisma.rFP.findMany({
      where: whereClause,
      orderBy: orderByClause,
      select: {
        id: true,
        rfpId: true,
        requirementType: true,
        dateOfOrdering: true,
        deliveryLocation: true,
        deliveryByDate: true,
        rfpStatus: true,
        preferredQuotationId: true,
        created_at: true,
        updated_at: true,
        approversList: {
          select: {
            user: {
              select: {
                name: true,
                email: true,
                mobile: true,
              },
            },
          },
        },
        rfpProducts: {
          select: {
            id: true,
            product: {
              select: {
                id: true,
                name: true,
                modelNo: true,
              },
            },
            // description: true, TODO
            quantity: true,
          },
        },
        quotations: {
          select: {
            id: true,
            refNo: true,
            totalAmount: true,
            totalAmountWithoutGST: true,
            created_at: true,
            updated_at: true,
            vendor: {
              select: {
                id: true,
                companyName: true,
                email: true,
                mobile: true,
                address: true,
                customerState: true,
                customerCity: true,
                country: true,
                zip: true,
                gstin: true,
                pan: true,
              },
            },
            vendorPricings: {
              select: {
                price: true,
                GST: true,
                rfpProduct: {
                  select: {
                    id: true,
                    product: {
                      select: {
                        id: true,
                        name: true,
                        modelNo: true,
                      },
                    },
                    // description: true, TODO
                    quantity: true,
                  },
                },
              },
            },
            otherCharges: {
              select: {
                name: true,
                price: true,
                gst: true,
              },
            },

            supportingDocuments: {
              select: {
                documentName: true,
                location: true,
              },
            },
          },
        },

        user: {
          select: {
            name: true,
            email: true,
            mobile: true,
          },
        },
      },
    });

    const formattedData = formatRFPData(records);
    console.log("formattedData", formattedData);

    console.log(`Found ${records.length} records`);

    if (Object.keys(whereClause).length > 0 && records.length === 0) {
      return NextResponse.json(
        { error: `No records found matching the criteria` },
        { status: 404 }
      );
    }

    return NextResponse.json(serializePrismaModel(formattedData));
  } catch (error: unknown) {
    console.error("Detailed error:", error);
    return NextResponse.json(
      { error: "Error fetching records", details: (error as Error).message },
      { status: 500 }
    );
  }
}

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

    console.log(dateOfOrdering);

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
          dateOfOrdering: new Date(),
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
            productId: rfpProduct.productId, // Ensure this is the correct type
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

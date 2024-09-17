import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { serializePrismaModel } from "@/types";

const prisma = new PrismaClient();

// POST /api/po
export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("Body reciveived: ", body);

    const updateRFP = await prisma.rFP.update({
      where: {
        id: body.rfpId,
      },
      data: {
        rfpStatus: body.rfpStatus,
      },
    });

    const po = await prisma.pO.create({
      data: {
        poId: body.poId,
        quotationId: body.quotationId,
        userId: body.userId,
        companyId: body.companyId,
        rfpId: body.rfpId,
        remarks: body.remarks,
      },
    });

    const rfp_po = {
      po: po,
      rfp: updateRFP,
    };

    console.log("After prisma: ", po);
    return NextResponse.json(rfp_po, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: `Error creating PO ${error.message}` },
      { status: 500 }
    );
  }
}
const poModel = {
  model: prisma.pO,
  attributes: [
    "id",
    "poId", // Unique identifier for the PO
    "quotationId", // ID of the associated quotation
    "userId", // ID of the user associated with the PO
    "invoice", // Optional invoice field
    "remarks", // Remarks related to the PO
    "companyId", // ID of the company associated with the PO
    "rfpId", // Unique RFP ID associated with the PO
    "created_at", // Timestamp for when the PO was created
    "updated_at", // Timestamp for when the PO was last updated
  ],
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const whereClause: Record<string, any> = {};
    let orderByClause: Record<string, "asc" | "desc"> | undefined = undefined;
    const validAttributes = [...poModel.attributes, "orderBy"];

    console.log("Received search params:", Object.fromEntries(searchParams));

    searchParams.forEach((value, key) => {
      console.log(`Processing parameter: ${key} = ${value}`);
      if (validAttributes.includes(key)) {
        if (key === "orderBy") {
          const parts = value.split(",");
          let orderByField: string = poModel.attributes[0]; // Default to first attribute
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

          if (poModel.attributes.includes(orderByField)) {
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

    const records = await prisma.pO.findMany({
      where: whereClause,
      orderBy: orderByClause,
      select: {
        id: true,
        poId: true, // Added poId
        quotationId: true,
        quotation: {
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
        remarks: true, // Added remarks
        company: {
          select: {
            id: true,
            name: true,
            GST: true,
            logo: true,
            stamp: true,
            email: true,
            phone: true,
            website: true,
            addresses: true,
          },
        },
        rfpId: true,
      },
    });

    const formattedData = formatPOData(records);
    console.log("formattedData", formattedData);

    console.log(`Found ${records.length} records`);

    if (Object.keys(whereClause).length > 0 && records.length === 0) {
      return NextResponse.json(
        { error: `No records found matching the criteria` },
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

function formatPOData(inputData: any[]): any[] {
  return inputData.map((po: any) => ({
    id: po.id,
    poId: po.poId,
    rfpId: po.rfpId,
    quotations: [
      {
        id: po.quotation.id,
        totalAmount: po.quotation.totalAmount,
        refNo: po.quotation.refNo,
        totalAmountWithoutGST: po.quotation.totalAmountWithoutGST,
        created_at: po.quotation.created_at,
        updated_at: po.quotation.updated_at,
        vendor: {
          id: po.quotation.vendor.id,
          companyName: po.quotation.vendor.companyName,
          email: po.quotation.vendor.email,
          mobile: po.quotation.vendor.mobile,
          address: po.quotation.vendor.address,
          customerState: po.quotation.vendor.customerState,
          customerCity: po.quotation.vendor.customerCity,
          country: po.quotation.vendor.country,
          zip: po.quotation.vendor.zip,
          gstin: po.quotation.vendor.gstin,
          pan: po.quotation.vendor.pan,
        },
        products: po.quotation.vendorPricings.map((pricing: any) => ({
          id: pricing.rfpProduct.product.id,
          rfpProductId: pricing.rfpProduct.id,
          name: pricing.rfpProduct.product.name,
          modelNo: pricing.rfpProduct.product.modelNo,
          quantity: pricing.rfpProduct.quantity,
          price: pricing.price,
          GST: pricing.GST,
        })),
        otherCharges: po.quotation.otherCharges || [],
        supportingDocuments: po.quotation.supportingDocuments || [],
      },
    ],
    createdBy: {
      name: po.user.name,
      email: po.user.email,
      mobile: po.user.mobile,
    },
    remarks: po.remarks,
    company: {
      id: po.company.id,
      name: po.company.name,
      GST: po.company.GST,
      logo: po.company.logo,
      stamp: po.company.stamp,
      email: po.company.email,
      phone: po.company.phone,
      website: po.company.website,
      industry: po.company.industry,
      foundedDate: po.company.foundedDate,
      status: po.company.status,
      created_at: po.company.created_at,
      updated_at: po.company.updated_at,
    },
  }));
}

// PUT /api/po/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updatedPo = await prisma.pO.update({
      where: { id: params.id },
      data: {
        poId: body.poId,
        quotationId: body.quotationId,
        userId: body.userId,
        companyId: body.companyId,
        rfpId: body.rfpId,
      },
    });
    return NextResponse.json(updatedPo);
  } catch (error) {
    return NextResponse.json({ error: "Error updating PO" }, { status: 500 });
  }
}

// DELETE /api/po/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.pO.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: "PO deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Error deleting PO" }, { status: 500 });
  }
}

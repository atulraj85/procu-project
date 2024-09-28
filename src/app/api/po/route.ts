import { POTable, RFPTable } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { serializePrismaModel } from "@/types";
import { and, asc, desc, eq, InferSelectModel, SQL } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// POST /api/po
export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("Body reciveived: ", body);

    const updatedRFPs = await db
      .update(RFPTable)
      .set({ rfpStatus: body.rfpStatus })
      .where(eq(RFPTable.id, body.rfpId))
      .returning();
    const updatedRFP = updatedRFPs[0];

    const insertedPOs = await db
      .insert(POTable)
      .values({
        poId: body.poId,
        quotationId: body.quotationId,
        userId: body.userId,
        companyId: body.companyId,
        rfpId: body.rfpId,
        remarks: body.remarks,
        updatedAt: new Date(),
      })
      .returning();
    const po = insertedPOs[0];

    const rfp_po = {
      po: po,
      rfp: updatedRFP,
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

// Type Definitions
type SortBy = keyof InferSelectModel<typeof POTable>;
type SortDirection = "asc" | "desc";
type WhereField = keyof InferSelectModel<typeof POTable>;

const DEFAULT_SORTING_FIELD: SortBy = "id";
const DEFAULT_SORTING_DIRECTION: SortDirection = "desc";
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    console.log("Received search params:", Object.fromEntries(searchParams));

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
        if (key in POTable) {
          whereConditions.push(eq(POTable[key as WhereField], value));
        }
      }
    });

    // Combine conditions using 'and'
    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    let records = await db.query.POTable.findMany({
      where: whereClause,
      orderBy:
        sortingOrder === "asc"
          ? [asc(POTable[sortBy])]
          : [desc(POTable[sortBy])],
      columns: {
        id: true,
        poId: true, // Added poId
        remarks: true, // Added remarks
        quotationId: true,
      },
      with: {
        quotation: {
          columns: {
            id: true,
            refNo: true,
            totalAmount: true,
            totalAmountWithoutGst: true,
            createdAt: true,
            updatedAt: true,
          },
          with: {
            vendor: {
              columns: {
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
              columns: { price: true, gst: true },
              with: {
                rfpProduct: {
                  columns: { id: true, quantity: true },
                  with: {
                    product: {
                      columns: {
                        id: true,
                        name: true,
                        modelNo: true,
                        specification: true,
                      },
                    },
                  },
                },
              },
            },
            otherCharges: {
              columns: { name: true, price: true, gst: true },
            },
            supportingDocuments: {
              columns: { documentName: true, location: true },
            },
          },
        },
        user: {
          columns: { name: true, email: true, mobile: true },
        },
        company: {
          columns: {
            id: true,
            name: true,
            gst: true,
            logo: true,
            stamp: true,
            email: true,
            phone: true,
            website: true,
          },
          with: {
            addresses: true,
          },
        },
        rfp: {
          columns: { rfpId: true, rfpStatus: true },
        },
      },
    });

    const formattedData = formatPOData(records);
    console.log("formattedData", formattedData);

    console.log(`Found ${records.length} records`);

    return NextResponse.json(serializePrismaModel(formattedData));
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
    RFPStatus: po.rfp.rfpStatus,
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
        products: [
          ...po.quotation?.vendorPricings.map((pricing: any) => ({
            id: pricing.rfpProduct.product.id,
            rfpProductId: pricing.rfpProduct.id,
            name: pricing.rfpProduct.product.name,
            modelNo: pricing.rfpProduct.product.modelNo,
            quantity: pricing.rfpProduct.quantity,
            price: pricing.price,
            description: pricing.rfpProduct.product.specification,
            gst: pricing.GST,
            type: "product",
          })),
          ...(po.quotation.otherCharges || []).map((charge: any) => ({
            ...charge,
            type: "otherCharge",
          })),
        ],
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
      addresses: po.company.addresses,
      created_at: po.company.created_at,
      updated_at: po.company.updated_at,
    },
  }));
}

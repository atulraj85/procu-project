import { saveAuditTrail } from "@/actions/audit-trail";
import {
  ApproversListTable,
  RFPProductTable,
  RFPTable,
} from "@/drizzle/schema";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { RequestBody, RFPStatus, serializePrismaModel } from "@/types";
import { generateRFPId } from "@/utils";
import { and, asc, desc, eq, InferSelectModel, SQL } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// Type Definitions
type SortBy = keyof InferSelectModel<typeof RFPTable>;
type SortDirection = "asc" | "desc";
type WhereField = keyof InferSelectModel<typeof RFPTable>;

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
        if (key in RFPTable) {
          whereConditions.push(eq(RFPTable[key as WhereField], value));
        }
      }
    });

    // Combine conditions using 'and'
    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const records = await db.query.RFPTable.findMany({
      where: whereClause,
      orderBy:
        sortingOrder === "asc"
          ? [asc(RFPTable[sortBy])]
          : [desc(RFPTable[sortBy])],
      columns: {
        id: true,
        rfpId: true,
        requirementType: true,
        dateOfOrdering: true,
        deliveryLocation: true,
        deliveryByDate: true,
          overallReason: true, // ADD THIS LINE
        rfpStatus: true,
        preferredQuotationId: true,
        createdAt: true,
        updatedAt: true,
      },
      with: {
        approversLists: {
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                email: true,
                mobile: true,
              },
            },
          },
        },
        rfpProducts: {
          columns: { id: true, quantity: true, description: true },
        },
        quotations: {
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
                  columns: {
                    id: true,
                    quantity: true,
                    description: true,
                  },
                },
              },
            },
            otherCharges: {
              columns: {
                name: true,
                price: true,
                gst: true,
              },
            },
            supportingDocuments: {
              columns: {
                documentName: true,
                location: true,
              },
            },
          },
        },
        user: {
          columns: {
            name: true,
            email: true,
            mobile: true,
            role: true,
          },
        },
      },
    });

    // console.log(`Found ${records.length} records`);

    const formattedData = formatRFPData(records);

    // console.log("Formatted data:", JSON.stringify(formattedData, null, 2));
    // console.log("records data:", JSON.stringify(records, null, 2));

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
  const currentLoggedInUser = await currentUser();
  if (
    !currentLoggedInUser ||
    !currentLoggedInUser.id ||
    !["USER", "PR_MANAGER"].includes(currentLoggedInUser.role)
  ) {
    console.error("Invalid user!");
    return NextResponse.json({ error: "Invalid user!" }, { status: 404 });
  }

  // TODO: Add validation logic before creating RFP.

  try {
    const {
      requirementType,
      dateOfOrdering,
      deliveryLocation,
      deliveryByDate,
      rfpProducts,
      overallReason, // ADD THIS
      approvers,
      rfpStatus,
      rfpId,
    }: RequestBody = await request.json();

    console.log(dateOfOrdering);

    // Validate the status
    if (!Object.values(RFPStatus).includes(rfpStatus)) {
      return NextResponse.json(
        { error: `Invalid status value: ${rfpStatus}` },
        { status: 400 }
      );
    }

    // // Generate RFP ID
    // let rfpId: any;
    // try {
    //   rfpId = await generateRFPId();
    // } catch (error: any) {
    //   console.error("Error generating RFP id", error);
    //   return NextResponse.json(
    //     { error: `Failed to create RFP: ${error.message}` },
    //     { status: 500 }
    //   );
    // }

    const newRFP = await db.transaction(async (tx) => {
      const [createdRFP] = await tx
        .insert(RFPTable)
        .values({
          requirementType,
          dateOfOrdering: new Date(),
          deliveryLocation,
          deliveryByDate: new Date(deliveryByDate),
          overallReason, // ADD THIS
          cutoffAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // ADD THIS - Default 7 days
          userId: currentLoggedInUser.id!,
          rfpStatus,
          rfpId,
          updatedAt: new Date(),
        })
        .returning({ id: RFPTable.id, rfpId: RFPTable.rfpId });

      const rfpProductValues = rfpProducts.map((rfpProduct) => ({
        rfpId: createdRFP.id,
        description: rfpProduct.description,
        quantity: rfpProduct.quantity,
        updatedAt: new Date(),
      }));
      if (rfpProductValues && rfpProductValues.length > 0) {
        await tx.insert(RFPProductTable).values(rfpProductValues);
      }

      const approverValues = approvers.map((approver) => ({
        rfpId: createdRFP.id,
        userId: approver.approverId,
        approved: false,
        updatedAt: new Date(),
      }));
      if (approverValues && approverValues.length > 0) {
        await tx.insert(ApproversListTable).values(approverValues);
      }

      return createdRFP;
    });

    // TODO: Decide what should be the 'rfpDescription'.
    if (newRFP) {
      try {
        await saveAuditTrail({
          eventName: "RFP_CREATED",
          details: {
            rfpId: newRFP.rfpId,
            rfpDescription: "Description of RFP",
          },
        });
      } catch (error) {
        console.error("Error saving rfp audit trails", error);
      }
    }

    return NextResponse.json({ data: newRFP }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating RFP:", error);
    return NextResponse.json(
      { error: `Failed to create RFP: ${error.message}` },
      { status: 500 }
    );
  }
}

function formatRFPData(rfps: any[]) {
  if (!Array.isArray(rfps)) {
    console.warn("Expected array input for formatRFPData");
    return [];
  }

  return rfps
    .map((rfp) => {
      if (!rfp) return null;

      return {
        id: rfp?.id,
        rfpId: rfp?.rfpId,
        requirementType: rfp?.requirementType,
        dateOfOrdering: rfp?.dateOfOrdering,
        deliveryLocation: rfp?.deliveryLocation,
        deliveryByDate: rfp?.deliveryByDate,
        rfpStatus: rfp?.rfpStatus,
        preferredQuotationId: rfp?.preferredQuotationId,
        created_at: rfp?.createdAt,
        updated_at: rfp?.updatedAt,

        // Handle approvers list
        approvers:
          rfp?.approversLists?.map((approver: any) => ({
            name: approver?.user?.name,
            id: approver?.user?.id,
            email: approver?.user?.email,
            mobile: approver?.user?.mobile,
          })) || [],

        // Handle products
        products:
          rfp?.rfpProducts?.map((product: any) => ({
            id: product?.id,
            quantity: product?.quantity,
            description: product?.description,
          })) || [],

        // Handle quotations
        quotations:
          rfp?.quotations?.map((quotation: any) => {
            // Prepare vendor pricings
            const vendorPricings =
              quotation?.vendorPricings?.map((pricing: any) => ({
                id: pricing?.rfpProduct?.id,
                rfpProductId: pricing?.rfpProduct?.id,
                quantity: pricing?.rfpProduct?.quantity,
                price: pricing?.price,
                description: pricing?.rfpProduct?.description,
                gst: pricing?.gst,
                type: "product",
              })) || [];

            // Prepare other charges
            const otherCharges =
              quotation?.otherCharges?.map((charge: any) => ({
                ...charge,
                type: "otherCharge",
              })) || [];

            return {
              id: quotation?.id,
              totalAmount: quotation?.totalAmount,
              refNo: quotation?.refNo,
              totalAmountWithoutGST: quotation?.totalAmountWithoutGst,
              created_at: quotation?.createdAt,
              updated_at: quotation?.updatedAt,
              vendor: quotation?.vendor,
              products: [...vendorPricings, ...otherCharges],
              supportingDocuments: quotation?.supportingDocuments || [],
            };
          }) || [],

        // Handle user info
        createdBy: rfp?.user
          ? {
            name: rfp.user?.name,
            email: rfp.user?.email,
            mobile: rfp.user?.mobile,
            role: rfp.user?.role,
          }
          : null,
      };
    })
    .filter(Boolean); // Remove any null entries
}

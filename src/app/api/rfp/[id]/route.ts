import { saveAuditTrail } from "@/actions/audit-trail";
import {
  ApproversListTable,
  RFPProductTable,
  RFPTable,
} from "@/drizzle/schema";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { RequestBody, RFPStatus } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";


// /api/rfp/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rfpId = params.id;

    const record = await db.query.RFPTable.findFirst({
      where: eq(RFPTable.id, rfpId),
      columns: {
        id: true,
        rfpId: true,
        requirementType: true,
        dateOfOrdering: true,
        deliveryLocation: true,
        deliveryByDate: true,
        rfpStatus: true,
        reason: true,
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
          columns: { 
            id: true, 
            quantity: true, 
            description: true 
          },
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

    if (!record) {
      return NextResponse.json({ error: "RFP not found" }, { status: 404 });
    }

    const formattedData = formatRFPData([record])[0]; // Use existing formatter

    return NextResponse.json(formattedData);
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching RFP details", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const currentLoggedInUser = await currentUser();
  if (
    !currentLoggedInUser ||
    !currentLoggedInUser.id ||
    currentLoggedInUser.role !== "PR_MANAGER"
  ) {
    console.error("Invalid user!");
    return NextResponse.json({ error: "Invalid user!" }, { status: 404 });
  }

  try {
    const {
      requirementType,
      dateOfOrdering,
      deliveryLocation,
      deliveryByDate,
      rfpProducts,
      approvers,
      rfpStatus,
    }: RequestBody = await request.json();

    console.log("###### rfpProducts", rfpProducts);

    // Validate the status
    if (!Object.values(RFPStatus).includes(rfpStatus)) {
      return NextResponse.json(
        { error: `Invalid status value: ${rfpStatus}` },
        { status: 400 }
      );
    }

    const updatedRFP = await db.transaction(async (tx) => {
      // Update the main RFP record
      const [updatedRFP] = await tx
        .update(RFPTable)
        .set({
          requirementType,
          dateOfOrdering: new Date(dateOfOrdering),
          deliveryLocation,
          deliveryByDate: new Date(deliveryByDate),
          rfpStatus,
          updatedAt: new Date(),
        })
        .where(eq(RFPTable.id, params.id))
        .returning({ id: RFPTable.id, rfpId: RFPTable.rfpId });

      if (!updatedRFP) {
        throw new Error("RFP not found");
      }

      // Delete existing products and approvers
      await tx
        .delete(RFPProductTable)
        .where(eq(RFPProductTable.rfpId, updatedRFP.id));
      await tx
        .delete(ApproversListTable)
        .where(eq(ApproversListTable.rfpId, updatedRFP.id));

      console.log("########## rfpProducts", JSON.stringify(rfpProducts));

      // Insert new products
      if (rfpProducts && rfpProducts.length > 0) {
        const rfpProductValues = rfpProducts.map((rfpProduct) => ({
          rfpId: updatedRFP.id,
          quantity: rfpProduct.quantity,
          name: rfpProduct.name,
          description: rfpProduct.description,
          updatedAt: new Date(),
        }));
        await tx.insert(RFPProductTable).values(rfpProductValues);
      }

      // Insert new approvers
      if (approvers && approvers.length > 0) {
        const approverValues = approvers.map((approver) => ({
          rfpId: updatedRFP.id,
          userId: approver.approverId,
          approved: false,
          updatedAt: new Date(),
        }));
        await tx.insert(ApproversListTable).values(approverValues);
      }

      return updatedRFP;
    });

    // Record the audit trail
    if (updatedRFP) {
      try {
        await saveAuditTrail({
          eventName: "RFP_UPDATED",
          details: {
            rfpId: updatedRFP.rfpId,
            rfpDescription: "RFP has been updated",
          },
        });
      } catch (error) {
        console.error("Error saving rfp audit trails", error);
      }
    }

    return NextResponse.json({ data: updatedRFP }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating RFP:", error);
    return NextResponse.json(
      { error: `Failed to update RFP: ${error.message}` },
      { status: error.message === "RFP not found" ? 404 : 500 }
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
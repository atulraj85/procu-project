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

      console.log("########## rfpProducts",JSON.stringify(rfpProducts));

      // Insert new products
      if (rfpProducts && rfpProducts.length > 0) {
        const rfpProductValues = rfpProducts.map((rfpProduct) => ({
          rfpId: updatedRFP.id,
          quantity: rfpProduct.quantity,
          productId: rfpProduct.productId,
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

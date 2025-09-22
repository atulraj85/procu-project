import { saveAuditTrail } from "@/actions/audit-trail";
import {
  RFPApprovalTable,
  RFPTable,
  QuotationTable,
  UserTable,
  VendorTable
} from "@/drizzle/schema";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { RequestBody } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

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
        rfpNumber: true,        // Updated from rfpId
        title: true,           // Added title
        description: true,     // Added description
        deliveryLocation: true,
        deliveryStates: true,  // Added delivery states
        deliveryDate: true,    // Updated from deliveryByDate
        estimatedBudget: true, // Added budget
        currency: true,        // Added currency
        status: true,          // Updated from rfpStatus
        lineItems: true,       // Updated from rfpProducts - now JSONB
        questionAnswers: true, // Added question answers
        selectionCriteria: true, // Added selection criteria
        quotationCutoffDate: true, // Added cutoff date
        rejectionReason: true, // Added rejection reason
        createdBy: true,       // Updated field name
        organizationId: true,  // Added organization
        createdAt: true,
        updatedAt: true,
      },
      with: {
        // Updated relations based on your schema
        createdBy: {
          columns: {
            id: true,
            name: true,
            email: true,
            mobile: true,
            role: true,
          },
        },
        organization: {
          columns: {
            id: true,
            name: true,
            legalName: true,
            gstin: true,
            address: true,
          },
        },
        approvals: {
          columns: {
            id: true,
            approverId: true,
            stage: true,
            sequence: true,
            approved: true,
            approvedAt: true,
            comments: true,
          },
          with: {
            approver: {
              columns: {
                id: true,
                name: true,
                email: true,
                mobile: true,
                role: true,
              },
            },
          },
        },
        quotations: {
          columns: {
            id: true,
            quotationNumber: true,
            lineItemQuotes: true,
            subtotal: true,
            gstAmount: true,
            totalAmount: true,
            otherCharges: true,
            supportingDocuments: true,
            validTill: true,
            deliveryTimeline: true,
            status: true,
            submittedAt: true,
            evaluationScore: true,
            evaluationNotes: true,
            isShortlisted: true,
            createdAt: true,
            updatedAt: true,
          },
          with: {
            vendor: {
              columns: {
                id: true,
                companyName: true,
                legalName: true,
                gstin: true,
                pan: true,
                address: true,
                city: true,
                state: true,
                pincode: true,
                phone: true,
                email: true,
                website: true,
                status: true,
              },
            },
          },
        },
        vendorInvitations: {
          columns: {
            id: true,
            vendorId: true,
            invitedAt: true,
            invitedBy: true,
            viewedAt: true,
          },
          with: {
            vendor: {
              columns: {
                id: true,
                companyName: true,
                email: true,
                phone: true,
                status: true,
              },
            },
            invitedBy: {
              columns: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        purchaseOrders: {
          columns: {
            id: true,
            poNumber: true,
            status: true,
            totalAmount: true,
            deliveryDate: true,
            createdAt: true,
          },
        },
      },
    });

    if (!record) {
      return NextResponse.json({ error: "RFP not found" }, { status: 404 });
    }

    const formattedData = formatRFPData([record])[0];

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error fetching RFP details:", error);
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
  if (!currentLoggedInUser || !currentLoggedInUser.id) {
    console.error("Invalid user!");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      title,
      description,
      deliveryLocation,
      deliveryStates,
      deliveryDate,
      lineItems,
      estimatedBudget,
      currency,
      questionAnswers,
      selectionCriteria,
      quotationCutoffDate,
      status,
    } = await request.json();

    // Validate the status against your RFP status enum
    const validStatuses = [
      "DRAFT",
      "PENDING_APPROVAL", 
      "APPROVED",
      "REJECTED",
      "SENT_TO_VENDORS",
      "QUOTATION_RECEIVED",
      "VENDOR_SELECTED",
      "PO_GENERATED",
      "DELIVERED",
      "COMPLETED",
      "CANCELLED"
    ];

    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status value: ${status}` },
        { status: 400 }
      );
    }

    const updatedRFP = await db.transaction(async (tx) => {
      // Check if RFP exists and user has permission to update
      const existingRFP = await tx.query.RFPTable.findFirst({
        where: eq(RFPTable.id, params.id),
        columns: { id: true, createdBy: true, status: true },
      });

      if (!existingRFP) {
        throw new Error("RFP not found");
      }

      // Check permissions - only creator or admin can update
      if (existingRFP.createdBy !== currentLoggedInUser.id && 
          !['SYSTEM_ADMIN', 'PROCUREMENT_MANAGER'].includes(currentLoggedInUser.role)) {
        throw new Error("Permission denied");
      }

      // Update the main RFP record
      const [updatedRFP] = await tx
        .update(RFPTable)
        .set({
          title,
          description,
          deliveryLocation,
          deliveryStates,
          deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
          lineItems: lineItems || existingRFP.lineItems, // Keep existing if not provided
          estimatedBudget,
          currency: currency || 'INR',
          questionAnswers,
          selectionCriteria,
          quotationCutoffDate: quotationCutoffDate ? new Date(quotationCutoffDate) : undefined,
          status,
          updatedAt: new Date(),
        })
        .where(eq(RFPTable.id, params.id))
        .returning({ 
          id: RFPTable.id, 
          rfpNumber: RFPTable.rfpNumber,
          title: RFPTable.title,
          status: RFPTable.status
        });

      return updatedRFP;
    });

    // Record the audit trail
    if (updatedRFP) {
      try {
        await saveAuditTrail({
          eventName: "RFP_UPDATED",
          details: {
            rfpId: updatedRFP.rfpNumber,
            rfpTitle: updatedRFP.title,
            rfpDescription: "RFP has been updated",
            updatedBy: currentLoggedInUser.name,
            newStatus: updatedRFP.status,
          },
        });
      } catch (error) {
        console.error("Error saving RFP audit trail:", error);
      }
    }

    return NextResponse.json({ 
      data: updatedRFP,
      message: "RFP updated successfully" 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error updating RFP:", error);
    
    let statusCode = 500;
    let errorMessage = `Failed to update RFP: ${error.message}`;
    
    if (error.message === "RFP not found") {
      statusCode = 404;
      errorMessage = "RFP not found";
    } else if (error.message === "Permission denied") {
      statusCode = 403;
      errorMessage = "You don't have permission to update this RFP";
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
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
        rfpNumber: rfp?.rfpNumber,
        title: rfp?.title,
        description: rfp?.description,
        deliveryLocation: rfp?.deliveryLocation,
        deliveryStates: rfp?.deliveryStates || [],
        deliveryDate: rfp?.deliveryDate,
        estimatedBudget: rfp?.estimatedBudget,
        currency: rfp?.currency,
        status: rfp?.status,
        quotationCutoffDate: rfp?.quotationCutoffDate,
        rejectionReason: rfp?.rejectionReason,
        createdAt: rfp?.createdAt,
        updatedAt: rfp?.updatedAt,

        // Line items (stored as JSONB in your schema)
        lineItems: rfp?.lineItems || [],

        // Question answers
        questionAnswers: rfp?.questionAnswers || {},

        // Selection criteria
        selectionCriteria: rfp?.selectionCriteria || {},

        // Organization info
        organization: rfp?.organization ? {
          id: rfp.organization.id,
          name: rfp.organization.name,
          legalName: rfp.organization.legalName,
          gstin: rfp.organization.gstin,
          address: rfp.organization.address,
        } : null,

        // Handle approvals
        approvals: rfp?.approvals?.map((approval: any) => ({
          id: approval?.id,
          stage: approval?.stage,
          sequence: approval?.sequence,
          approved: approval?.approved,
          approvedAt: approval?.approvedAt,
          comments: approval?.comments,
          approver: {
            id: approval?.approver?.id,
            name: approval?.approver?.name,
            email: approval?.approver?.email,
            mobile: approval?.approver?.mobile,
            role: approval?.approver?.role,
          },
        })) || [],

        // Handle quotations with updated structure
        quotations: rfp?.quotations?.map((quotation: any) => ({
          id: quotation?.id,
          quotationNumber: quotation?.quotationNumber,
          subtotal: quotation?.subtotal,
          gstAmount: quotation?.gstAmount,
          totalAmount: quotation?.totalAmount,
          otherCharges: quotation?.otherCharges || [],
          lineItemQuotes: quotation?.lineItemQuotes || [],
          supportingDocuments: quotation?.supportingDocuments || [],
          validTill: quotation?.validTill,
          deliveryTimeline: quotation?.deliveryTimeline,
          status: quotation?.status,
          submittedAt: quotation?.submittedAt,
          evaluationScore: quotation?.evaluationScore,
          evaluationNotes: quotation?.evaluationNotes,
          isShortlisted: quotation?.isShortlisted,
          createdAt: quotation?.createdAt,
          updatedAt: quotation?.updatedAt,
          vendor: quotation?.vendor ? {
            id: quotation.vendor.id,
            companyName: quotation.vendor.companyName,
            legalName: quotation.vendor.legalName,
            gstin: quotation.vendor.gstin,
            pan: quotation.vendor.pan,
            address: quotation.vendor.address,
            city: quotation.vendor.city,
            state: quotation.vendor.state,
            pincode: quotation.vendor.pincode,
            phone: quotation.vendor.phone,
            email: quotation.vendor.email,
            website: quotation.vendor.website,
            status: quotation.vendor.status,
          } : null,
        })) || [],

        // Handle vendor invitations
        vendorInvitations: rfp?.vendorInvitations?.map((invitation: any) => ({
          id: invitation?.id,
          invitedAt: invitation?.invitedAt,
          viewedAt: invitation?.viewedAt,
          vendor: invitation?.vendor ? {
            id: invitation.vendor.id,
            companyName: invitation.vendor.companyName,
            email: invitation.vendor.email,
            phone: invitation.vendor.phone,
            status: invitation.vendor.status,
          } : null,
          invitedBy: invitation?.invitedBy ? {
            id: invitation.invitedBy.id,
            name: invitation.invitedBy.name,
            email: invitation.invitedBy.email,
          } : null,
        })) || [],

        // Handle purchase orders
        purchaseOrders: rfp?.purchaseOrders?.map((po: any) => ({
          id: po?.id,
          poNumber: po?.poNumber,
          status: po?.status,
          totalAmount: po?.totalAmount,
          deliveryDate: po?.deliveryDate,
          createdAt: po?.createdAt,
        })) || [],

        // Handle creator info
        createdBy: rfp?.createdBy ? {
          id: rfp.createdBy.id,
          name: rfp.createdBy.name,
          email: rfp.createdBy.email,
          mobile: rfp.createdBy.mobile,
          role: rfp.createdBy.role,
        } : null,

        // Additional computed fields
        totalQuotations: rfp?.quotations?.length || 0,
        shortlistedQuotations: rfp?.quotations?.filter((q: any) => q.isShortlisted)?.length || 0,
        invitedVendors: rfp?.vendorInvitations?.length || 0,
        hasActivePO: rfp?.purchaseOrders?.some((po: any) => 
          ['GENERATED', 'SENT_TO_VENDOR', 'ACKNOWLEDGED', 'IN_PROGRESS'].includes(po.status)
        ) || false,
      };
    })
    .filter(Boolean);
}

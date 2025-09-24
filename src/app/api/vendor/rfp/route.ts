import { NextRequest, NextResponse } from 'next/server';
import { and, eq, gte, desc } from 'drizzle-orm';
import { RFPTable, RFPVendorInvitationTable, VendorTable, UserTable } from '@/drizzle/schema';
import { db } from '@/lib/db';
import { currentUser } from '@/lib/auth';

// GET RFPs that are sent to specific vendor
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user?.vendorId) {
      return NextResponse.json(
        { error: "User not associated with any vendor" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'SENT_TO_VENDORS';


    // Get RFPs that are invited to this vendor and still accepting quotations
    const rfpsWithInvitations = await db
      .select({
        // RFP Details
        id: RFPTable.id,
        rfpNumber: RFPTable.rfpNumber,
        title: RFPTable.title,
        description: RFPTable.description,
        lineItems: RFPTable.lineItems,
        deliveryLocation: RFPTable.deliveryLocation,
        deliveryStates: RFPTable.deliveryStates,
        deliveryDate: RFPTable.deliveryDate,
        estimatedBudget: RFPTable.estimatedBudget,
        currency: RFPTable.currency,
        status: RFPTable.status,
        quotationCutoffDate: RFPTable.quotationCutoffDate,
        questionAnswers: RFPTable.questionAnswers,
        selectionCriteria: RFPTable.selectionCriteria,
        createdAt: RFPTable.createdAt,
        
        // Creator Details
        createdBy: UserTable.name,
        createdByEmail: UserTable.email,
        
        // Invitation Details
        invitationId: RFPVendorInvitationTable.id,
        invitedAt: RFPVendorInvitationTable.invitedAt,
        viewedAt: RFPVendorInvitationTable.viewedAt,
        invitationStatus: RFPVendorInvitationTable.status,
      })
      .from(RFPVendorInvitationTable)
      .innerJoin(RFPTable, eq(RFPVendorInvitationTable.rfpId, RFPTable.id))
      .leftJoin(UserTable, eq(RFPTable.createdBy, UserTable.id))
      .where(
        and(
          eq(RFPVendorInvitationTable.vendorId, user.vendorId),
          eq(RFPTable.status, status as any),
          gte(RFPTable.quotationCutoffDate, new Date()) // Only active RFPs
        )
      )
      .orderBy(desc(RFPTable.createdAt));

    // Mark as viewed if not already viewed
    const unviewedInvitations = rfpsWithInvitations
      .filter(rfp => !rfp.viewedAt)
      .map(rfp => rfp.invitationId);

    if (unviewedInvitations.length > 0) {
      await db
        .update(RFPVendorInvitationTable)
        .set({ 
          viewedAt: new Date(),
          status: 'VIEWED'
        })
        .where(eq(RFPVendorInvitationTable.id, unviewedInvitations[0]));
    }

    // Format response
    const formattedRfps = rfpsWithInvitations.map(rfp => ({
      id: rfp.id,
      rfpNumber: rfp.rfpNumber,
      title: rfp.title,
      description: rfp.description,
      lineItems: rfp.lineItems || [],
      lineItemsCount: Array.isArray(rfp.lineItems) ? rfp.lineItems.length : 0,
      deliveryLocation: rfp.deliveryLocation,
      deliveryStates: rfp.deliveryStates || [],
      deliveryDate: rfp.deliveryDate,
      estimatedBudget: rfp.estimatedBudget,
      currency: rfp.currency || 'INR',
      status: rfp.status,
      quotationCutoffDate: rfp.quotationCutoffDate,
      questionAnswers: rfp.questionAnswers || {},
      selectionCriteria: rfp.selectionCriteria || {},
      createdAt: rfp.createdAt,
      createdBy: rfp.createdBy,
      createdByEmail: rfp.createdByEmail,
      
      // Invitation specific
      invitationId: rfp.invitationId,
      invitedAt: rfp.invitedAt,
      viewedAt: rfp.viewedAt,
      invitationStatus: rfp.invitationStatus,
      
      // Status flags
      canSubmitQuotation: new Date() < new Date(rfp.quotationCutoffDate),
      daysRemaining: Math.ceil((new Date(rfp.quotationCutoffDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
    }));

    return NextResponse.json({
      rfps: formattedRfps,
      total: formattedRfps.length,
      vendorId: user.vendorId
    });

  } catch (error) {
    console.error('Error fetching vendor RFPs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch RFPs' },
      { status: 500 }
    );
  }
}

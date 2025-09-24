import { NextRequest, NextResponse } from 'next/server';
import { and, eq, desc } from 'drizzle-orm';
import { QuotationTable, RFPTable, RFPVendorInvitationTable, VendorTable } from '@/drizzle/schema';
import { db } from '@/lib/db';
import { currentUser } from '@/lib/auth';
import { uploadToS3 } from '@/lib/s3'; // Assuming you have S3 upload utility

// GET vendor's quotations for an RFP
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
    const rfpId = searchParams.get('rfpId');

    if (!rfpId) {
      return NextResponse.json(
        { error: "RFP ID is required" },
        { status: 400 }
      );
    }

    // Get all quotations for this RFP from this vendor (including previous versions)
    const quotations = await db.query.QuotationTable.findMany({
      where: and(
        eq(QuotationTable.rfpId, rfpId),
        eq(QuotationTable.vendorId, user.vendorId)
      ),
      orderBy: [desc(QuotationTable.createdAt)],
    });

    // Get RFP details to check cutoff date
    const rfp = await db.query.RFPTable.findFirst({
      where: eq(RFPTable.id, rfpId),
      columns: {
        quotationCutoffDate: true,
        status: true,
      }
    });

    const canEdit = rfp && new Date() < new Date(rfp.quotationCutoffDate);
    const latestQuotation = quotations[0]; // Most recent quotation

    return NextResponse.json({
      quotations,
      latestQuotation,
      canEdit,
      rfpId,
      vendorId: user.vendorId
    });

  } catch (error) {
    console.error('Error fetching quotations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quotations' },
      { status: 500 }
    );
  }
}
// POST/PUT create or update quotation (UPSERT)
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user?.vendorId) {
      return NextResponse.json(
        { error: "User not associated with any vendor" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const quotationData = JSON.parse(formData.get('quotationData') as string);

    const {
      rfpId,
      quotationNumber,
      lineItemQuotes,
      otherCharges,
      validTill,
      deliveryTimeline,
      notes,
      termsConditions
    } = quotationData;

    // Validate RFP and invitation (same as before)
    const rfp = await db.query.RFPTable.findFirst({
      where: eq(RFPTable.id, rfpId),
    });

    if (!rfp) {
      return NextResponse.json({ error: "RFP not found" }, { status: 404 });
    }

    if (new Date() >= new Date(rfp.quotationCutoffDate)) {
      return NextResponse.json(
        { error: "Quotation cutoff date has passed" }, 
        { status: 400 }
      );
    }

    const invitation = await db.query.RFPVendorInvitationTable.findFirst({
      where: and(
        eq(RFPVendorInvitationTable.rfpId, rfpId),
        eq(RFPVendorInvitationTable.vendorId, user.vendorId)
      )
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "You are not invited to submit quotation for this RFP" },
        { status: 403 }
      );
    }

    // Handle file uploads (same as before)
    const supportingDocuments = [];
    const fileEntries = Array.from(formData.entries()).filter(([key]) => key.startsWith('file_'));
    
    for (const [key, file] of fileEntries) {
      if (file instanceof File) {
        const uploadResult = await uploadToS3(file);
        supportingDocuments.push({
          fileName: file.name,
          fileUrl: uploadResult.url,
          fileSize: file.size,
          mimeType: file.type,
        });
      }
    }

    // Calculate totals (same as before)
    const subtotal = lineItemQuotes.reduce((sum: number, item: any) => 
      sum + (item.unitPrice * item.quantity), 0
    ) + (otherCharges?.reduce((sum: number, charge: any) => 
      sum + charge.amount, 0) || 0);

    const gstAmount = lineItemQuotes.reduce((sum: number, item: any) => 
      sum + ((item.unitPrice * item.quantity) * (item.gstPercentage / 100)), 0
    ) + (otherCharges?.reduce((sum: number, charge: any) => 
      sum + (charge.amount * (charge.gstPercentage / 100)), 0) || 0);

    const totalAmount = subtotal + gstAmount;

    // UPSERT: Check if quotation exists, then update or insert
    const existingQuotation = await db.query.QuotationTable.findFirst({
      where: and(
        eq(QuotationTable.rfpId, rfpId),
        eq(QuotationTable.vendorId, user.vendorId)
      )
    });

    let quotation;

    if (existingQuotation) {
      // UPDATE existing quotation
      [quotation] = await db
        .update(QuotationTable)
        .set({
          quotationNumber: quotationNumber || existingQuotation.quotationNumber,
          lineItemQuotes,
          otherCharges: otherCharges || [],
          subtotal,
          gstAmount,
          totalAmount,
          supportingDocuments,
          validTill: validTill ? new Date(validTill) : existingQuotation.validTill,
          deliveryTimeline,
          notes,
          termsConditions,
          status: 'SUBMITTED',
          submittedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(QuotationTable.id, existingQuotation.id))
        .returning();

      // Update invitation status to QUOTED
      await db
        .update(RFPVendorInvitationTable)
        .set({ 
          status: 'QUOTED',
          updatedAt: new Date()
        })
        .where(eq(RFPVendorInvitationTable.id, invitation.id));

      return NextResponse.json({
        quotation,
        message: 'Quotation updated successfully'
      });

    } else {
      // INSERT new quotation
      [quotation] = await db
        .insert(QuotationTable)
        .values({
          rfpId,
          vendorId: user.vendorId,
          quotationNumber: quotationNumber || `QUO-${Date.now()}`,
          lineItemQuotes,
          otherCharges: otherCharges || [],
          subtotal,
          gstAmount,
          totalAmount,
          supportingDocuments,
          validTill: validTill ? new Date(validTill) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          deliveryTimeline,
          notes,
          termsConditions,
          status: 'SUBMITTED',
          submittedAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      // Update invitation status to QUOTED
      await db
        .update(RFPVendorInvitationTable)
        .set({ 
          status: 'QUOTED',
          updatedAt: new Date()
        })
        .where(eq(RFPVendorInvitationTable.id, invitation.id));

      return NextResponse.json({
        quotation,
        message: 'Quotation submitted successfully'
      }, { status: 201 });
    }

  } catch (error) {
    console.error('Error creating/updating quotation:', error);
    return NextResponse.json(
      { error: 'Failed to process quotation' },
      { status: 500 }
    );
  }
}

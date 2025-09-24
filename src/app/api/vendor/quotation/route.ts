import { NextRequest, NextResponse } from 'next/server';
import { and, eq, desc } from 'drizzle-orm';
import { QuotationTable, RFPTable, RFPVendorInvitationTable, VendorTable } from '@/drizzle/schema';
import { db } from '@/lib/db';

// GET vendor's quotations for an RFP
export async function GET(
  request: NextRequest
) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');
    if (!vendorId) {
      return NextResponse.json(
        { error: "Vendor ID is required" },
        { status: 400 }
      );
    }

    const rfpId = searchParams.get('rfpId');

    if (!rfpId) {
      return NextResponse.json(
        { error: "RFP ID is required" },
        { status: 400 }
      );
    }

    // Verify vendor exists
    const vendor = await db.query.VendorTable.findFirst({
      where: eq(VendorTable.id, vendorId),
      columns: { id: true, status: true }
    });

    if (!vendor) {
      return NextResponse.json(
        { error: "Vendor not found" },
        { status: 404 }
      );
    }

    // Get quotation for this RFP from this vendor (should be only one)
    const quotation = await db.query.QuotationTable.findFirst({
      where: and(
        eq(QuotationTable.rfpId, rfpId),
        eq(QuotationTable.vendorId, vendorId)
      ),
    });

    // Get RFP details to check cutoff date
    const rfp = await db.query.RFPTable.findFirst({
      where: eq(RFPTable.id, rfpId),
      columns: {
        quotationCutoffDate: true,
        status: true,
      }
    });

    const canEdit = rfp && new Date() < new Date(rfp.quotationCutoffDate) && rfp.status === 'SENT_TO_VENDORS';

    return NextResponse.json({
      quotation,
      canEdit,
      rfpId,
      vendorId,
      rfpStatus: rfp?.status,
      quotationCutoffDate: rfp?.quotationCutoffDate
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
export async function POST(
  request: NextRequest) {
  try {
const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');
    if (!vendorId) {
      return NextResponse.json(
        { error: "Vendor ID is required" },
        { status: 400 }
      );
    }

    const requestBody = await request.json();
    
    const {
      rfpId,
      quotationNumber,
      lineItemQuotes,
      otherCharges,
      validTill,
      deliveryTimeline,
      notes,
      termsConditions,
      supportingDocuments // Direct file URLs array
    } = requestBody;

    // Validate required fields
    if (!rfpId) {
      return NextResponse.json(
        { error: "RFP ID is required" },
        { status: 400 }
      );
    }

    if (!lineItemQuotes || !Array.isArray(lineItemQuotes) || lineItemQuotes.length === 0) {
      return NextResponse.json(
        { error: "Line item quotes are required" },
        { status: 400 }
      );
    }

    // Verify vendor exists and is active
    const vendor = await db.query.VendorTable.findFirst({
      where: eq(VendorTable.id, vendorId),
      columns: { id: true, status: true }
    });

    if (!vendor) {
      return NextResponse.json(
        { error: "Vendor not found" },
        { status: 404 }
      );
    }

    if (vendor.status !== 'APPROVED') {
      return NextResponse.json(
        { error: "Vendor is not approved to submit quotations" },
        { status: 403 }
      );
    }

    // Validate RFP exists and is accepting quotations
    const rfp = await db.query.RFPTable.findFirst({
      where: eq(RFPTable.id, rfpId),
    });

    if (!rfp) {
      return NextResponse.json({ error: "RFP not found" }, { status: 404 });
    }

    if (rfp.status !== 'SENT_TO_VENDORS') {
      return NextResponse.json(
        { error: "RFP is not currently accepting quotations" },
        { status: 400 }
      );
    }

    if (new Date() >= new Date(rfp.quotationCutoffDate)) {
      return NextResponse.json(
        { error: "Quotation cutoff date has passed" }, 
        { status: 400 }
      );
    }

    // Verify vendor is invited to this RFP
    const invitation = await db.query.RFPVendorInvitationTable.findFirst({
      where: and(
        eq(RFPVendorInvitationTable.rfpId, rfpId),
        eq(RFPVendorInvitationTable.vendorId, vendorId)
      )
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Vendor is not invited to submit quotation for this RFP" },
        { status: 403 }
      );
    }

    // Validate line item quotes
    for (const item of lineItemQuotes) {
      if (!item.lineItemId || !item.unitPrice || item.unitPrice <= 0) {
        return NextResponse.json(
          { error: "All line items must have valid unit prices" },
          { status: 400 }
        );
      }
    }

    // Calculate totals
    const subtotal = lineItemQuotes.reduce((sum: number, item: any) => 
      sum + (parseFloat(item.unitPrice) * parseInt(item.quantity)), 0
    ) + (otherCharges?.reduce((sum: number, charge: any) => 
      sum + parseFloat(charge.amount), 0) || 0);

    const gstAmount = lineItemQuotes.reduce((sum: number, item: any) => 
      sum + ((parseFloat(item.unitPrice) * parseInt(item.quantity)) * (parseFloat(item.gstPercentage) / 100)), 0
    ) + (otherCharges?.reduce((sum: number, charge: any) => 
      sum + (parseFloat(charge.amount) * (parseFloat(charge.gstPercentage || 0) / 100)), 0) || 0);

    const totalAmount = subtotal + gstAmount;

    // Process supporting documents (expecting direct URLs)
    const processedDocuments = (supportingDocuments || []).map((doc: any) => ({
      fileName: doc.fileName || doc.name,
      fileUrl: doc.fileUrl || doc.url,
      fileSize: doc.fileSize || 0,
      mimeType: doc.mimeType || doc.type || 'application/octet-stream',
      uploadedAt: new Date().toISOString()
    }));

    // UPSERT: Check if quotation exists, then update or insert
    const existingQuotation = await db.query.QuotationTable.findFirst({
      where: and(
        eq(QuotationTable.rfpId, rfpId),
        eq(QuotationTable.vendorId, vendorId)
      )
    });

    let quotation;
    const currentTimestamp = new Date();

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
          supportingDocuments: processedDocuments,
          validTill: validTill ? new Date(validTill) : existingQuotation.validTill,
          deliveryTimeline: deliveryTimeline || existingQuotation.deliveryTimeline,
          notes: notes || existingQuotation.notes,
          termsConditions: termsConditions || existingQuotation.termsConditions,
          status: 'SUBMITTED',
          submittedAt: currentTimestamp,
          updatedAt: currentTimestamp,
        })
        .where(eq(QuotationTable.id, existingQuotation.id))
        .returning();

      // Update invitation status to QUOTED
      await db
        .update(RFPVendorInvitationTable)
        .set({ 
          status: 'QUOTED',
          updatedAt: currentTimestamp
        })
        .where(eq(RFPVendorInvitationTable.id, invitation.id));

      return NextResponse.json({
        quotation,
        message: 'Quotation updated successfully',
        action: 'updated'
      });

    } else {
      // INSERT new quotation
      [quotation] = await db
        .insert(QuotationTable)
        .values({
          rfpId,
          vendorId,
          quotationNumber: quotationNumber || `QUO-${vendorId.slice(-6)}-${Date.now()}`,
          lineItemQuotes,
          otherCharges: otherCharges || [],
          subtotal,
          gstAmount,
          totalAmount,
          supportingDocuments: processedDocuments,
          validTill: validTill ? new Date(validTill) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          deliveryTimeline,
          notes,
          termsConditions,
          status: 'SUBMITTED',
          submittedAt: currentTimestamp,
          updatedAt: currentTimestamp,
        })
        .returning();

      // Update invitation status to QUOTED
      await db
        .update(RFPVendorInvitationTable)
        .set({ 
          status: 'QUOTED',
          updatedAt: currentTimestamp
        })
        .where(eq(RFPVendorInvitationTable.id, invitation.id));

      return NextResponse.json({
        quotation,
        message: 'Quotation submitted successfully',
        action: 'created'
      }, { status: 201 });
    }

  } catch (error) {
    console.error('Error creating/updating quotation:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process quotation',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}

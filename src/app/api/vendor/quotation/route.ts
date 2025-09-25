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
    console.log('Received quotation data:', JSON.stringify(requestBody, null, 2)); // Debug log
    
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

    // Fixed validation logic for line item quotes
    for (let i = 0; i < lineItemQuotes.length; i++) {
      const item = lineItemQuotes[i];
      console.log(`Validating line item ${i + 1}:`, item); // Debug log
      
      // Check if lineItemId exists (may be missing in your payload)
      if (!item.lineItemId && !item.productName) {
        return NextResponse.json(
          { error: `Line item ${i + 1} must have either a lineItemId or productName` },
          { status: 400 }
        );
      }
      
      // Convert unitPrice to number and validate
      const unitPrice = parseFloat(item.unitPrice);
      
      if (!item.unitPrice || isNaN(unitPrice) || unitPrice <= 0) {
        console.log('Invalid unit price:', item.unitPrice, 'parsed as:', unitPrice); // Debug log
        return NextResponse.json(
          { 
            error: `Invalid unit price for item "${item.productName || 'Item ' + (i + 1)}". Price must be a positive number.`,
            details: `Received: "${item.unitPrice}", Parsed as: ${unitPrice}`
          },
          { status: 400 }
        );
      }

      // Validate quantity
      const quantity = parseInt(item.quantity);
      if (!item.quantity || isNaN(quantity) || quantity <= 0) {
        return NextResponse.json(
          { 
            error: `Invalid quantity for item "${item.productName || 'Item ' + (i + 1)}". Quantity must be a positive number.`,
            details: `Received: "${item.quantity}", Parsed as: ${quantity}`
          },
          { status: 400 }
        );
      }

      // Validate GST percentage
      const gstPercentage = parseFloat(item.gstPercentage);
      if (isNaN(gstPercentage) || gstPercentage < 0) {
        return NextResponse.json(
          { 
            error: `Invalid GST percentage for item "${item.productName || 'Item ' + (i + 1)}". GST must be a non-negative number.`,
            details: `Received: "${item.gstPercentage}", Parsed as: ${gstPercentage}`
          },
          { status: 400 }
        );
      }
    }

    // Validate other charges if present
    if (otherCharges && Array.isArray(otherCharges)) {
      for (let i = 0; i < otherCharges.length; i++) {
        const charge = otherCharges[i];
        console.log(`Validating other charge ${i + 1}:`, charge); // Debug log
        
        if (charge.amount) {
          const amount = parseFloat(charge.amount);
          if (isNaN(amount) || amount < 0) {
            return NextResponse.json(
              { 
                error: `Invalid amount for charge "${charge.name || 'Charge ' + (i + 1)}". Amount must be a non-negative number.`,
                details: `Received: "${charge.amount}", Parsed as: ${amount}`
              },
              { status: 400 }
            );
          }
        }

        // Validate GST percentage for charges
        if (charge.gstPercentage !== undefined) {
          const gstPercentage = parseFloat(charge.gstPercentage);
          if (isNaN(gstPercentage) || gstPercentage < 0) {
            return NextResponse.json(
              { 
                error: `Invalid GST percentage for charge "${charge.name || 'Charge ' + (i + 1)}". GST must be a non-negative number.`,
                details: `Received: "${charge.gstPercentage}", Parsed as: ${gstPercentage}`
              },
              { status: 400 }
            );
          }
        }
      }
    }

    // Calculate totals with proper number conversion
    const subtotal = lineItemQuotes.reduce((sum: number, item: any) => {
      const unitPrice = parseFloat(item.unitPrice) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return sum + (unitPrice * quantity);
    }, 0) + (otherCharges?.reduce((sum: number, charge: any) => {
      const amount = parseFloat(charge.amount) || 0;
      return sum + amount;
    }, 0) || 0);

    const gstAmount = lineItemQuotes.reduce((sum: number, item: any) => {
      const unitPrice = parseFloat(item.unitPrice) || 0;
      const quantity = parseInt(item.quantity) || 0;
      const gstPercentage = parseFloat(item.gstPercentage) || 0;
      return sum + ((unitPrice * quantity) * (gstPercentage / 100));
    }, 0) + (otherCharges?.reduce((sum: number, charge: any) => {
      const amount = parseFloat(charge.amount) || 0;
      const gstPercentage = parseFloat(charge.gstPercentage || 0) || 0;
      return sum + (amount * (gstPercentage / 100));
    }, 0) || 0);

    const totalAmount = subtotal + gstAmount;

    console.log('Calculated totals:', { 
      subtotal: subtotal.toFixed(2), 
      gstAmount: gstAmount.toFixed(2), 
      totalAmount: totalAmount.toFixed(2) 
    }); // Debug log

    // Process supporting documents (expecting direct URLs)
    const processedDocuments = (supportingDocuments || []).map((doc: any) => ({
      fileName: doc.fileName || doc.name,
      fileUrl: doc.fileUrl || doc.url,
      fileSize: doc.fileSize || 0,
      mimeType: doc.mimeType || doc.type || 'application/octet-stream',
      uploadedAt: new Date().toISOString()
    }));

    console.log('Processed documents:', processedDocuments.length); // Debug log

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
      console.log('Updating existing quotation:', existingQuotation.id); // Debug log
      
      // UPDATE existing quotation
      [quotation] = await db
        .update(QuotationTable)
        .set({
          quotationNumber: quotationNumber || existingQuotation.quotationNumber,
          lineItemQuotes,
          otherCharges: otherCharges || [],
          subtotal: subtotal.toString(), // Convert to string for database
          gstAmount: gstAmount.toString(),
          totalAmount: totalAmount.toString(),
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

      console.log('Quotation updated successfully:', quotation.id); // Debug log

      return NextResponse.json({
        quotation,
        message: 'Quotation updated successfully',
        action: 'updated',
        totals: {
          subtotal: subtotal.toFixed(2),
          gstAmount: gstAmount.toFixed(2),
          totalAmount: totalAmount.toFixed(2)
        }
      });

    } else {
      console.log('Creating new quotation for vendor:', vendorId); // Debug log
      
      // INSERT new quotation
      [quotation] = await db
        .insert(QuotationTable)
        .values({
          rfpId,
          vendorId,
          quotationNumber: quotationNumber || `QUO-${vendorId.slice(-6)}-${Date.now()}`,
          lineItemQuotes,
          otherCharges: otherCharges || [],
          subtotal: subtotal.toString(), // Convert to string for database
          gstAmount: gstAmount.toString(),
          totalAmount: totalAmount.toString(),
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

      console.log('Quotation created successfully:', quotation.id); // Debug log

      return NextResponse.json({
        quotation,
        message: 'Quotation submitted successfully',
        action: 'created',
        totals: {
          subtotal: subtotal.toFixed(2),
          gstAmount: gstAmount.toFixed(2),
          totalAmount: totalAmount.toFixed(2)
        }
      }, { status: 201 });
    }

  } catch (error) {
    console.error('Error creating/updating quotation:', error);
    
    // Enhanced error handling
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: 'Failed to process quotation',
          details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to process quotation',
        details: 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

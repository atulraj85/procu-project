// /api/quotations/[id]/route.ts
import { QuotationTable, VendorPricingTable, OtherChargesTable, SupportingDocumentTable } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";

// GET - Fetch single quotation
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quotationId = params.id;

    const quotation = await db.query.QuotationTable.findFirst({
      where: eq(QuotationTable.id, quotationId),
      with: {
        vendor: {
          columns: {
            id: true,
            primaryName: true,
            companyName: true,
            email: true,
            mobile: true,
            gstin: true,
          }
        },
        vendorPricings: {
          with: {
            rfpProduct: {
              columns: {
                id: true,
                description: true,
                quantity: true,
              }
            }
          }
        },
        otherCharges: true,
        supportingDocuments: true
      }
    });

    if (!quotation) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    // Format the response
    const formattedQuotation = {
      id: quotation.id,
      refNo: quotation.refNo,
      rfpId: quotation.rfpId,
      vendorId: quotation.vendorId,
      totalAmount: quotation.totalAmount,
      totalAmountWithoutGst: quotation.totalAmountWithoutGst,
      createdAt: quotation.createdAt,
      updatedAt: quotation.updatedAt,
      vendor: quotation.vendor,
      products: quotation.vendorPricings?.map(pricing => ({
        id: pricing.rfpProduct?.id,
        rfpProductId: pricing.rfpProduct?.id,
        description: pricing.rfpProduct?.description,
        quantity: pricing.rfpProduct?.quantity,
        price: pricing.price,
        gst: pricing.gst,
        type: "product"
      })) || [],
      otherCharges: quotation.otherCharges?.map(charge => ({
        id: charge.id,
        name: charge.name,
        price: charge.price,
        gst: charge.gst,
        type: "otherCharge"
      })) || [],
      supportingDocuments: quotation.supportingDocuments || []
    };

    return NextResponse.json(formattedQuotation);

  } catch (error: unknown) {
    console.error("Error fetching quotation:", error);
    return NextResponse.json(
      { error: "Error fetching quotation", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// PUT - Update existing quotation
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quotationId = params.id;
    const formData = await request.formData();
    const quotationDataStr = formData.get("quotationData") as string;

    if (!quotationDataStr) {
      return NextResponse.json(
        { error: "Missing quotationData" },
        { status: 400 }
      );
    }

    const quotationData = JSON.parse(quotationDataStr);

    // Check if quotation exists
    const existingQuotation = await db.query.QuotationTable.findFirst({
      where: eq(QuotationTable.id, quotationId),
      columns: { id: true, vendorId: true, rfpId: true }
    });

    if (!existingQuotation) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    // Handle file uploads
    const uploadedFiles: { [key: string]: string } = {};
    for (const [key, value] of formData.entries()) {
      if (value instanceof File && key.startsWith('supportingDocument_')) {
        const file = value as File;
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const fileName = `${Date.now()}-${file.name}`;
        const filePath = join(process.cwd(), 'public', 'uploads', fileName);
        
        await writeFile(filePath, buffer);
        uploadedFiles[key] = `/uploads/${fileName}`;
      }
    }

    // Update quotation in transaction
    const result = await db.transaction(async (tx) => {
      // Calculate totals
      const totalWithoutGst = quotationData.products.reduce((sum: number, product: any) => {
        return sum + (product.unitPrice * product.quantity);
      }, 0) + quotationData.otherCharges.reduce((sum: number, charge: any) => {
        return sum + charge.unitPrice;
      }, 0);

      const totalWithGst = quotationData.products.reduce((sum: number, product: any) => {
        const gstValue = product.gst === "NILL" ? 0 : parseFloat(product.gst);
        return sum + (product.unitPrice * product.quantity * (1 + gstValue / 100));
      }, 0) + quotationData.otherCharges.reduce((sum: number, charge: any) => {
        const gstValue = charge.gst === "NILL" ? 0 : parseFloat(charge.gst);
        return sum + (charge.unitPrice * (1 + gstValue / 100));
      }, 0);

      // Update quotation
      await tx.update(QuotationTable)
        .set({
          refNo: quotationData.refNo,
          totalAmount: totalWithGst,
          totalAmountWithoutGst: totalWithoutGst,
          updatedAt: new Date(),
        })
        .where(eq(QuotationTable.id, quotationId));

      // Delete existing vendor pricings and recreate
      await tx.delete(VendorPricingTable).where(eq(VendorPricingTable.quotationId, quotationId));
      
      if (quotationData.products && quotationData.products.length > 0) {
        const vendorPricingValues = quotationData.products.map((product: any) => ({
          quotationId: quotationId,
          rfpProductId: product.rfpProductId,
          price: product.unitPrice,
          gst: product.gst === "NILL" ? 0 : parseFloat(product.gst),
          updatedAt: new Date(),
        }));
        
        await tx.insert(VendorPricingTable).values(vendorPricingValues);
      }

      // Delete existing other charges and recreate
      await tx.delete(OtherChargesTable).where(eq(OtherChargesTable.quotationId, quotationId));
      
      if (quotationData.otherCharges && quotationData.otherCharges.length > 0) {
        const otherChargesValues = quotationData.otherCharges
          .filter((charge: any) => charge.unitPrice > 0)
          .map((charge: any) => ({
            quotationId: quotationId,
            name: charge.name,
            price: charge.unitPrice,
            gst: charge.gst === "NILL" ? 0 : parseFloat(charge.gst),
            updatedAt: new Date(),
          }));
        
        if (otherChargesValues.length > 0) {
          await tx.insert(OtherChargesTable).values(otherChargesValues);
        }
      }

      // Update supporting documents
      await tx.delete(SupportingDocumentTable).where(eq(SupportingDocumentTable.quotationId, quotationId));
      
      if (quotationData.supportingDocuments && quotationData.supportingDocuments.length > 0) {
        const documentValues = quotationData.supportingDocuments.map((doc: any, index: number) => {
          const fileKey = `supportingDocument_${index}`;
          const fileLocation = uploadedFiles[fileKey] || doc.location;
          
          return {
            quotationId: quotationId,
            documentName: doc.name,
            location: fileLocation,
            updatedAt: new Date(),
          };
        });
        
        await tx.insert(SupportingDocumentTable).values(documentValues);
      }

      return { id: quotationId };
    });

    return NextResponse.json({ 
      data: result,
      message: "Quotation updated successfully" 
    });

  } catch (error: any) {
    console.error("Error updating quotation:", error);
    return NextResponse.json(
      { error: `Failed to update quotation: ${error.message}` },
      { status: 500 }
    );
  }
}

// DELETE - Delete quotation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quotationId = params.id;

    // Check if quotation exists
    const existingQuotation = await db.query.QuotationTable.findFirst({
      where: eq(QuotationTable.id, quotationId),
      columns: { id: true }
    });

    if (!existingQuotation) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    // Delete quotation and all related data in transaction
    await db.transaction(async (tx) => {
      await tx.delete(SupportingDocumentTable).where(eq(SupportingDocumentTable.quotationId, quotationId));
      await tx.delete(OtherChargesTable).where(eq(OtherChargesTable.quotationId, quotationId));
      await tx.delete(VendorPricingTable).where(eq(VendorPricingTable.quotationId, quotationId));
      await tx.delete(QuotationTable).where(eq(QuotationTable.id, quotationId));
    });

    return NextResponse.json({ message: "Quotation deleted successfully" });

  } catch (error: any) {
    console.error("Error deleting quotation:", error);
    return NextResponse.json(
      { error: `Failed to delete quotation: ${error.message}` },
      { status: 500 }
    );
  }
}

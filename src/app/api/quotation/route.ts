// /api/quotations/route.ts
import { QuotationTable, VendorPricingTable, OtherChargeTable, SupportingDocumentTable, RFPTable, VendorTable } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { and, desc, asc, eq, InferSelectModel, SQL } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";

// Type Definitions
type SortBy = keyof InferSelectModel<typeof QuotationTable>;
type SortDirection = "asc" | "desc";
type WhereField = keyof InferSelectModel<typeof QuotationTable>;

const DEFAULT_SORTING_FIELD: SortBy = "createdAt";
const DEFAULT_SORTING_DIRECTION: SortDirection = "desc";

// GET - Fetch quotations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    
    const sortBy: SortBy = (searchParams.get("sortBy") as SortBy) || DEFAULT_SORTING_FIELD;
    const sortingOrder: SortDirection = (searchParams.get("order") as SortDirection) || DEFAULT_SORTING_DIRECTION;
    const rfpId = searchParams.get("rfpId");
    const vendorId = searchParams.get("vendorId");
    
    // Construct where conditions
    const whereConditions: SQL<unknown>[] = [];
    
    if (rfpId) {
      whereConditions.push(eq(QuotationTable.rfpId, rfpId));
    }
    
    if (vendorId) {
      whereConditions.push(eq(QuotationTable.vendorId, vendorId));
    }
    
    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // FIX: Use proper orderBy syntax
    const quotations = await db.query.QuotationTable.findMany({
      where: whereClause,
      orderBy: sortingOrder === "asc" 
        ? [asc(QuotationTable[sortBy])] 
        : [desc(QuotationTable[sortBy])],
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
        otherCharges: {
          columns: {
            id: true,
            name: true,
            price: true,
            gst: true,
          }
        },
        supportingDocuments: {
          columns: {
            id: true,
            documentName: true,
            location: true,
          }
        }
      }
    });

    // Format the response - FIX: Add proper typing
    const formattedQuotations = quotations.map((quotation: any) => ({
      id: quotation.id,
      refNo: quotation.refNo,
      rfpId: quotation.rfpId,
      vendorId: quotation.vendorId,
      totalAmount: quotation.totalAmount,
      totalAmountWithoutGst: quotation.totalAmountWithoutGst,
      createdAt: quotation.createdAt,
      updatedAt: quotation.updatedAt,
      vendor: quotation.vendor,
      products: quotation.vendorPricings?.map((pricing: any) => ({
        id: pricing.rfpProduct?.id,
        rfpProductId: pricing.rfpProduct?.id,
        description: pricing.rfpProduct?.description,
        quantity: pricing.rfpProduct?.quantity,
        price: pricing.price,
        gst: pricing.gst,
        type: "product"
      })) || [],
      otherCharges: quotation.otherCharges?.map((charge: any) => ({
        id: charge.id,
        name: charge.name,
        price: charge.price,
        gst: charge.gst,
        type: "otherCharge"
      })) || [],
      supportingDocuments: quotation.supportingDocuments || []
    }));

    return NextResponse.json(formattedQuotations);

  } catch (error: unknown) {
    console.error("Error fetching quotations:", error);
    return NextResponse.json(
      { error: "Error fetching quotations", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST - Create new quotation
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const quotationDataStr = formData.get("quotationData") as string;
    const rfpId = formData.get("rfpId") as string;
    const vendorId = formData.get("vendorId") as string;

    if (!quotationDataStr || !rfpId || !vendorId) {
      return NextResponse.json(
        { error: "Missing required fields: quotationData, rfpId, vendorId" },
        { status: 400 }
      );
    }

    const quotationData = JSON.parse(quotationDataStr);

    // Check if RFP exists and is in SUBMITTED status
    const rfp = await db.query.RFPTable.findFirst({
      where: eq(RFPTable.id, rfpId),
      columns: { id: true, rfpStatus: true }
    });

    if (!rfp) {
      return NextResponse.json({ error: "RFP not found" }, { status: 404 });
    }

    if (rfp.rfpStatus !== "SUBMITTED") {
      return NextResponse.json(
        { error: "RFP is not available for quotations" },
        { status: 400 }
      );
    }

    // Check if vendor already has a quotation for this RFP
    const existingQuotation = await db.query.QuotationTable.findFirst({
      where: and(
        eq(QuotationTable.rfpId, rfpId),
        eq(QuotationTable.vendorId, vendorId)
      ),
      columns: { id: true }
    });

    if (existingQuotation) {
      return NextResponse.json(
        { error: "Vendor already has a quotation for this RFP. Use PUT to update." },
        { status: 409 }
      );
    }

    // Verify vendor exists and is approved
    const vendor = await db.query.VendorTable.findFirst({
      where: eq(VendorTable.id, vendorId),
      columns: { id: true, status: true }
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    if (vendor.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Only approved vendors can submit quotations" },
        { status: 403 }
      );
    }

    // Handle file uploads
    const uploadedFiles: { [key: string]: string } = {};
    for (const [key, value] of formData.entries()) {
      if (value instanceof File && key.startsWith('supportingDocument_')) {
        const file = value as File;
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = join(process.cwd(), 'public', 'uploads', fileName);
        
        await writeFile(filePath, buffer);
        uploadedFiles[key] = `/uploads/${fileName}`;
      }
    }

    // Create quotation in transaction
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

      // Create quotation
      const [newQuotation] = await tx.insert(QuotationTable).values({
        refNo: quotationData.refNo,
        rfpId: rfpId,
        vendorId: vendorId,
        totalAmount: totalWithGst,
        totalAmountWithoutGst: totalWithoutGst,
        status: "SUBMITTED", // Add this if your schema has status
        updatedAt: new Date(),
      }).returning({ id: QuotationTable.id });

      // Create vendor pricings for products
      if (quotationData.products && quotationData.products.length > 0) {
        const vendorPricingValues = quotationData.products.map((product: any) => ({
          quotationId: newQuotation.id,
          rfpProductId: product.rfpProductId,
          price: product.unitPrice,
          gst: product.gst === "NILL" ? 0 : parseFloat(product.gst),
          updatedAt: new Date(),
        }));
        
        await tx.insert(VendorPricingTable).values(vendorPricingValues);
      }

      // Create other charges
      if (quotationData.otherCharges && quotationData.otherCharges.length > 0) {
        const otherChargesValues = quotationData.otherCharges
          .filter((charge: any) => charge.unitPrice > 0)
          .map((charge: any) => ({
            quotationId: newQuotation.id,
            name: charge.name,
            price: charge.unitPrice,
            gst: charge.gst === "NILL" ? 0 : parseFloat(charge.gst),
            updatedAt: new Date(),
          }));
        
        if (otherChargesValues.length > 0) {
          await tx.insert(OtherChargeTable).values(otherChargesValues);
        }
      }

      // Create supporting documents
      if (quotationData.supportingDocuments && quotationData.supportingDocuments.length > 0) {
        const documentValues = quotationData.supportingDocuments.map((doc: any, index: number) => {
          const fileKey = `supportingDocument_${index}`;
          const fileLocation = uploadedFiles[fileKey] || doc.location;
          
          return {
            quotationId: newQuotation.id,
            documentName: doc.name,
            location: fileLocation,
            updatedAt: new Date(),
          };
        });
        
        await tx.insert(SupportingDocumentTable).values(documentValues);
      }

      return newQuotation;
    });

    return NextResponse.json({ 
      data: result,
      message: "Quotation submitted successfully" 
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error creating quotation:", error);
    return NextResponse.json(
      { error: `Failed to create quotation: ${error.message}` },
      { status: 500 }
    );
  }
}

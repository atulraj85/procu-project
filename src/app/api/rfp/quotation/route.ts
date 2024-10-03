import {
  OtherChargeTable,
  QuotationTable,
  RFPTable,
  SupportingDocumentTable,
  VendorPricingTable,
} from "@/drizzle/schema";
import { db } from "@/lib/db";
import { serializePrismaModel } from "@/types";
import { isValidUUID } from "@/utils";
import { Decimal } from "decimal.js";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";

export async function PUT(request: NextRequest) {
  console.log("PUT request started");
  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");
    console.log("Request ID:", id);

    if (!id || !isValidUUID(id)) {
      console.error("Invalid UUID provided:", id);
      return NextResponse.json(
        { error: "Valid UUID is required for updating a record" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const data = JSON.parse(formData.get("data") as string);
    // console.log("Parsed form data:", JSON.stringify(data, null, 2));

    const { quotations, preferredVendorId, rfpStatus } = data;
    const processedQuotations = await Promise.all(
      (quotations || []).map(async (quotation: any) => {
        const {
          id: quotationId,
          vendorId,
          products,
          otherCharges,
          total,
          refNo,
          supportingDocuments,
        } = quotation;

        // console.log(
        //   "Processing quotation:",
        //   JSON.stringify(quotation, null, 2)
        // );

        if (!isValidUUID(vendorId)) {
          console.error(`Invalid vendorId: ${vendorId}`);
          throw new Error(`Invalid vendorId: ${vendorId}`);
        }

        // console.log("supportingDocuments", supportingDocuments);

        let processedDocuments = [];
        if (supportingDocuments && supportingDocuments.length > 0) {
          processedDocuments = await Promise.all(
            supportingDocuments.map(async (doc: any) => {
              if (doc.location) {
                // console.log("doc.location", doc.location);
                return {
                  documentType: doc.fileName,
                  documentName: doc.fileName,
                  location: doc.location,
                };
              } else {
                // Process new document only if it hasn't been processed yet
                // console.log("This is new file data starting");

                const newDocuments = await processDocuments(
                  id,
                  vendorId,
                  Array.from(formData.entries()).slice(2)
                );

                // console.log("Create new document:", newDocuments);
                return newDocuments; // Ensure you return the new documents
              }
            })
          );

          // Flatten the processedDocuments array and filter out null/undefined values
          processedDocuments = processedDocuments
            .flat()
            .filter((doc) => doc !== null && doc !== undefined);
        }

        // Remove duplicates from processedDocuments
        const uniqueDocuments = Array.from(
          new Set(processedDocuments.map((doc) => JSON.stringify(doc)))
        ).map((doc) => JSON.parse(doc));

        return {
          id: quotationId && isValidUUID(quotationId) ? quotationId : undefined,
          vendorId,
          refNo,
          totalAmount: new Decimal(total.withGST).toNumber(),
          totalAmountWithoutGST: new Decimal(total.withoutGST).toNumber(),
          vendorPricings: {
            create: products.map((product: any) => ({
              price: new Decimal(product.unitPrice).toNumber(),
              GST: parseInt(product.gst),
              rfpProduct: { connect: { id: product.rfpProductId } },
            })),
          },
          otherCharges: {
            create: otherCharges.map((charge: any) => ({
              name: charge.name,
              price: new Decimal(charge.unitPrice).toNumber(),
              gst: new Decimal(charge.gst).toNumber(),
            })),
          },
          supportingDocuments: {
            create: uniqueDocuments, // Use unique documents
          },
        };
      })
    );

    // console.log(
    //   "Processed quotations:",
    //   JSON.stringify(processedQuotations, null, 2)
    // );

    const existingRFP = await db.query.RFPTable.findFirst({
      where: eq(RFPTable.id, id),
      with: {
        quotations: true,
      },
    });

    if (!existingRFP) {
      throw new Error(`RFP with id ${id} not found`);
    }

    // console.log("Existing RFP found:", JSON.stringify(existingRFP, null, 2));

    // Update or create quotations
    const updatedQuotations = await Promise.all(
      processedQuotations.map(async (q) => {
        if (q.id) {
          // Update existing quotation
          // console.log("Updating quotation:", q);
          return updatedQuotation(q);
        } else {
          return createNewQuotation(id, q);
        }
      })
    );

    // Step 1: Update the RFP with the new status and preferred quotation
    await db
      .update(RFPTable)
      .set({
        rfpStatus,
        preferredQuotationId: preferredVendorId
          ? updatedQuotations.find((q) => q.vendorId === preferredVendorId)?.id
          : undefined,
      })
      .where(eq(RFPTable.id, id));

    // Step 2: Update the quotations to associate with the RFP
    await Promise.all(
      updatedQuotations.map(async (quotation) => {
        await db
          .update(QuotationTable)
          .set({ rfpId: id }) // Connecting by setting foreign key
          .where(eq(QuotationTable.id, quotation.id));
      })
    );

    // Step 3: Fetch the updated RFP with related data
    const updatedRFP = await db.query.RFPTable.findFirst({
      where: eq(RFPTable.id, id),
      with: {
        quotations: {
          with: {
            supportingDocuments: true,
            vendorPricings: true,
            otherCharges: true,
          },
        },
      },
    });

    return NextResponse.json(serializePrismaModel(updatedRFP), {
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage = (error as Error).message || "Unknown error occurred";
    console.error("Error updating RFP:", errorMessage);
    return NextResponse.json(
      { error: "Error updating document", reason: errorMessage },
      { status: 400 }
    );
  }
}

async function createNewQuotation(rfpId: string, q: any) {
  const createdQuotation = await db.transaction(async (tx) => {
    const [newQuotation] = await tx
      .insert(QuotationTable)
      .values({
        rfpId,
        vendorId: q.vendorId,
        refNo: q.refNo,
        totalAmount: q.totalAmount,
        totalAmountWithoutGst: q.totalAmountWithoutGST,
        updatedAt: new Date(),
      })
      .returning({ id: QuotationTable.id });

    const vendorPricingValues =
      q.vendorPricings.create?.map((pricing: any) => ({
        quotationId: newQuotation.id,
        price: pricing.price,
        GST: pricing.GST,
      })) || [];
    if (vendorPricingValues && vendorPricingValues.length) {
      await tx.insert(VendorPricingTable).values(vendorPricingValues);
    }

    const otherChargeValues = q.otherCharges.create.map((charge: any) => ({
      quotationId: newQuotation.id,
      name: charge.name,
      price: charge.price,
      gst: charge.gst,
    }));
    if (otherChargeValues && otherChargeValues.length) {
      await tx.insert(OtherChargeTable).values(otherChargeValues);
    }

    const supportingDocumentValues = q.supportingDocuments.create
      .filter((doc: any) => doc !== null)
      .map((doc: any) => ({
        quotationId: newQuotation.id,
        documentName: doc.documentName,
        location: doc.location,
      }));
    if (supportingDocumentValues && supportingDocumentValues.length) {
      await tx.insert(SupportingDocumentTable).values(supportingDocumentValues);
    }

    return newQuotation;
  });

  return { ...createNewQuotation };
}

async function updatedQuotation(q: any) {
  await db.transaction(async (tx) => {
    // Update the quotation data
    await tx
      .update(QuotationTable)
      .set({
        vendorId: q.vendorId,
        refNo: q.refNo,
        totalAmount: q.totalAmount,
        totalAmountWithoutGst: q.totalAmountWithoutGST,
      })
      .where(eq(QuotationTable.id, q.id));

    // Delete the old vendor pricings
    await tx
      .delete(VendorPricingTable)
      .where(eq(VendorPricingTable.quotationId, q.id));

    // Insert the new vendor pricings
    await tx.insert(VendorPricingTable).values(
      q.vendorPricings.create.map((pricing: any) => ({
        quotationId: q.id,
        price: pricing.price,
        GST: pricing.GST,
      }))
    );

    // Delete the old other charges
    await tx
      .delete(OtherChargeTable)
      .where(eq(OtherChargeTable.quotationId, q.id));

    // Insert the new other charges
    await tx.insert(OtherChargeTable).values(
      q.otherCharges.create.map((charge: any) => ({
        quotationId: q.id,
        name: charge.name,
        price: charge.price,
        gst: charge.gst,
      }))
    );

    // Delete the old supporting documents
    await tx
      .delete(SupportingDocumentTable)
      .where(eq(SupportingDocumentTable.quotationId, q.id));

    // Insert the new supporting documents
    await tx.insert(SupportingDocumentTable).values(
      q.supportingDocuments.create
        .filter((doc: any) => doc !== null) // Filter out null docs
        .map((doc: any) => ({
          quotationId: q.id,
          documentName: doc.documentName,
          location: doc.location,
        }))
    );
  });

  // Return updated quotation (optional based on what you need to do with it)
  return { id: q.id, ...q };
}

async function processDocuments(
  rfpId: string,
  vendorId: string,
  supDocs: any[]
) {
  const vendorDocs = supDocs.filter((doc) => doc[0].startsWith(vendorId));

  return Promise.all(
    vendorDocs.map(async ([key, file]) => {
      if (!(file instanceof File)) {
        console.warn(`Invalid file for ${key}`);
        return null;
      }

      const docType = key.split("/")[1];
      const newFileName = `${docType}.${file.name.split(".").pop()}`;
      const fileNameWithDate = `${
        new Date().toISOString().split("T")[0]
      }-${newFileName}`;

      const utapi = new UTApi();

      // Upload file to UploadThing
      const uploadResult = await utapi.uploadFiles([file]);

      if (!uploadResult) {
        console.error("Upload failed");
        return null;
      }

      const [uploadedFile] = uploadResult;

      const documentInfo = {
        documentType: file.name,
        documentName: fileNameWithDate,
        location: uploadedFile.data?.url,
      };

      return documentInfo;
    })
  );
}

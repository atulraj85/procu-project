import { NextRequest, NextResponse } from "next/server";
import { serializePrismaModel } from "@/types";
import { prisma } from "@/lib/prisma";
import path from "path";
import fs from "fs/promises";
import { Prisma } from "@prisma/client";

function isValidUUID(uuid: string) {
  const uuidRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
  return uuidRegex.test(uuid);
}
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
    console.log("Parsed form data:", JSON.stringify(data, null, 2));

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
        } = quotation;

        console.log(
          "Processing quotation:",
          JSON.stringify(quotation, null, 2)
        );

        if (!isValidUUID(vendorId)) {
          console.error(`Invalid vendorId: ${vendorId}`);
          throw new Error(`Invalid vendorId: ${vendorId}`);
        }

        const processedDocuments = await processDocuments(
          id,
          vendorId,
          Array.from(formData.entries()).slice(2)
        );

        return {
          id: quotationId && isValidUUID(quotationId) ? quotationId : undefined,
          vendorId,
          refNo,
          totalAmount: new Prisma.Decimal(total.withGST),
          totalAmountWithoutGST: new Prisma.Decimal(total.withoutGST),
          vendorPricings: {
            create: products.map((product: any) => ({
              price: new Prisma.Decimal(product.unitPrice),
              GST: parseInt(product.gst),
              rfpProduct: { connect: { id: product.rfpProductId } },
            })),
          },
          otherCharges: {
            create: otherCharges.map((charge: any) => ({
              name: charge.name,
              price: new Prisma.Decimal(charge.unitPrice),
              gst: new Prisma.Decimal(charge.gst),
            })),
          },
          supportingDocuments: {
            create: processedDocuments,
          },
        };
      })
    );

    console.log(
      "Processed quotations:",
      JSON.stringify(processedQuotations, null, 2)
    );

    const createRecords = await prisma.$transaction(async (prisma) => {
      const existingRFP = await prisma.rFP.findUnique({
        where: { id },
        include: { quotations: true },
      });

      if (!existingRFP) {
        throw new Error(`RFP with id ${id} not found`);
      }

      console.log("Existing RFP found:", JSON.stringify(existingRFP, null, 2));

      // Delete existing records for the quotations that are not in the new data
      // await deleteExistingRecords(existingRFP.quotations);

      // Update or create quotations
      const updatedQuotations = await Promise.all(
        processedQuotations.map(async (q) => {
          if (q.id) {
            // Update existing quotation
            console.log("Updating quotation:", q);
            return prisma.quotation.update({
              where: { id: q.id },
              data: {
                vendorId: q.vendorId,
                refNo: q.refNo,
                totalAmount: q.totalAmount,
                totalAmountWithoutGST: q.totalAmountWithoutGST,
                vendorPricings: {
                  deleteMany: { quotationId: q.id }, // Delete existing vendor pricing
                  create: q.vendorPricings.create, // Create new vendor pricing
                },
                otherCharges: {
                  deleteMany: { quotationId: q.id }, // Delete existing other charges
                  create: q.otherCharges.create, // Create new other charges
                },
                supportingDocuments: {
                  deleteMany: { quotationId: q.id }, // Delete existing supporting documents
                  create: q.supportingDocuments.create.filter(
                    (doc: null) => doc !== null
                  ),
                },
              },
            });
          } else {
            // Create new quotation
            console.log("Creating quotation:", q);
            return prisma.quotation.create({
              data: {
                rfpId: id,
                vendorId: q.vendorId,
                refNo: q.refNo,
                totalAmount: q.totalAmount,
                totalAmountWithoutGST: q.totalAmountWithoutGST,
                vendorPricings: {
                  create: q.vendorPricings.create,
                },
                otherCharges: {
                  create: q.otherCharges.create,
                },
                supportingDocuments: {
                  create: q.supportingDocuments.create.filter(
                    (doc: null) => doc !== null
                  ),
                },
              },
            });
          }
        })
      );

      return prisma.rFP.update({
        where: { id },
        data: {
          rfpStatus,
          quotations: {
            connect: updatedQuotations.map((q) => ({ id: q.id })),
          },
          preferredQuotationId: preferredVendorId
            ? updatedQuotations.find((q) => q.vendorId === preferredVendorId)
                ?.id
            : undefined,
        },
        include: {
          quotations: {
            include: {
              supportingDocuments: true,
              vendorPricings: true,
              otherCharges: true,
            },
          },
        },
      });
    });

    return NextResponse.json(serializePrismaModel(createRecords), {
      status: 200,
    });
  } catch (error: unknown) {
    console.error("Error updating RFP:", error);
    return NextResponse.json(
      { error: "Error updating record", details: (error as Error).message },
      { status: 500 }
    );
  }
}

async function deleteExistingRecords(existingQuotations: any[]) {
  for (const quotation of existingQuotations) {
    const quotationId = quotation.id;

    console.log(`Deleting quotation ID: ${quotationId}`);

    // Delete associated vendor pricing
    console.log(`Deleting vendor pricing for quotation ID: ${quotationId}`);
    await prisma.vendorPricing.deleteMany({
      where: { quotationId },
    });

    // Delete associated other charges
    console.log(`Deleting other charges for quotation ID: ${quotationId}`);
    await prisma.otherCharge.deleteMany({
      where: { quotationId },
    });

    // Delete associated supporting documents
    console.log(
      `Deleting supporting documents for quotation ID: ${quotationId}`
    );
    await prisma.supportingDocument.deleteMany({
      where: { quotationId },
    });

    // Finally, delete the quotation itself
    await prisma.quotation.delete({
      where: { id: quotationId },
    });
  }
}

async function processQuotations(quotations: any[], supDocs: any[]) {
  return Promise.all(
    (quotations || []).map(async (quotation) => {
      const {
        id: quotationId,
        vendorId,
        products,
        otherCharges,
        total,
        refNo,
      } = quotation;

      if (!isValidUUID(vendorId)) {
        throw new Error(`Invalid vendorId: ${vendorId}`);
      }

      const processedDocuments = await processDocuments(
        quotationId,
        vendorId,
        supDocs
      );

      const processedQuotation = {
        id: quotationId && isValidUUID(quotationId) ? quotationId : undefined,
        vendorId,
        refNo,
        totalAmount: new Prisma.Decimal(total.withGST),
        totalAmountWithoutGST: new Prisma.Decimal(total.withoutGST),
        vendorPricings: {
          create: products.map((product: any) => ({
            price: new Prisma.Decimal(product.unitPrice),
            GST: parseInt(product.gst),
            rfpProduct: { connect: { id: product.rfpProductId } },
          })),
        },
        otherCharges: {
          create: otherCharges.map((charge: any) => ({
            name: charge.name,
            price: new Prisma.Decimal(charge.unitPrice),
            gst: new Prisma.Decimal(charge.gst),
          })),
        },
        supportingDocuments: {
          create: processedDocuments,
        },
      };

      console.log(
        "Processed quotation in processQuotations:",
        JSON.stringify(processedQuotation, null, 2)
      );
      return processedQuotation;
    })
  );
}

// async function deleteExistingRecords(quotations: any[]) {
//   for (const quotation of quotations) {
//     console.log(`Deleting vendor pricing for quotation ID: ${quotation.id}`);
//     await prisma.vendorPricing.deleteMany({
//       where: { quotationId: quotation.id },
//     });

//     console.log(`Deleting other charges for quotation ID: ${quotation.id}`);
//     await prisma.otherCharge.deleteMany({
//       where: { quotationId: quotation.id },
//     });

//     console.log(
//       `Deleting supporting documents for quotation ID: ${quotation.id}`
//     );
//     await prisma.supportingDocument.deleteMany({
//       where: { quotationId: quotation.id },
//     });
//   }
// }

async function processDocuments(
  rfpId: string,
  vendorId: string,
  supDocs: any[]
) {
  const quotationDirPath = path.join(
    process.cwd(),
    "public",
    "assets",
    `RFP-${rfpId}`,
    vendorId
  );
  await fs.mkdir(quotationDirPath, { recursive: true });

  const vendorDocs = supDocs.filter((doc) => doc[0].startsWith(vendorId));

  console.log("Processing documents for vendor ID:", vendorId);
  console.log("Vendor documents found:", JSON.stringify(vendorDocs, null, 2));

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
      const filePath = path.join(quotationDirPath, fileNameWithDate);

      const fileBuffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(filePath, fileBuffer);

      const documentInfo = {
        documentType: file.name,
        documentName: fileNameWithDate,
        location: `/assets/RFP-${rfpId}/${vendorId}/${fileNameWithDate}`,
      };

      console.log("Processed document:", JSON.stringify(documentInfo, null, 2));
      return documentInfo;
    })
  );
}

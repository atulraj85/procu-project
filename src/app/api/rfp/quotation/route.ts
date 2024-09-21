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

    const existingRFP = await prisma.rFP.findUnique({
      where: { id },
      include: { quotations: true },
    });

    if (!existingRFP) {
      throw new Error(`RFP with id ${id} not found`);
    }

    console.log("Existing RFP found:", JSON.stringify(existingRFP, null, 2));

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

    // Update the RFP with the new quotations
    const updatedRFP = await prisma.rFP.update({
      where: { id },
      data: {
        rfpStatus,
        quotations: {
          connect: updatedQuotations.map((q) => ({ id: q.id })),
        },
        preferredQuotationId: preferredVendorId
          ? updatedQuotations.find((q) => q.vendorId === preferredVendorId)?.id
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

    return NextResponse.json(serializePrismaModel(updatedRFP), {
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage = (error as Error).message || "Unknown error occurred";
    console.error("Error updating RFP:", errorMessage);
    return NextResponse.json(
      { error: "Error updating document", reason: errorMessage },
      { status: 400 } // You can choose a different status code if needed
    );
  }
}

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

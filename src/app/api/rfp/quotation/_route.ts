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
    console.log("Parsed form data:", data);

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

        console.log("Processing quotation:", { quotationId, vendorId, refNo });

        if (!isValidUUID(vendorId)) {
          console.error(`Invalid vendorId: ${vendorId}`);
          throw new Error(`Invalid vendorId: ${vendorId}`);
        }

        return {
          // id: quotationId && isValidUUID(quotationId) ? quotationId : undefined,
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
            create: await processDocuments(
              id,
              vendorId,
              Array.from(formData.entries()).slice(2)
            ),
          },
        };
      })
    );

    console.log(
      "Processed quotations:",
      JSON.stringify(processedQuotations, null, 2)
    );

    const updatedRecord = await prisma.$transaction(async (prisma) => {
      const existingRFP = await prisma.rFP.findUnique({
        where: { id },
        include: { quotations: true },
      });

      if (!existingRFP) {
        throw new Error(`RFP with id ${id} not found`);
      }

      await deleteExistingRecords(existingRFP.quotations);

      // insert Quotate
      // delete quotation
      // updaate quotation

      return prisma.rFP.update({
        where: { id },
        data: {
          rfpStatus,
          quotations: {
            upsert: processedQuotations.map((q) => {
              console.log("Upserting quotation:", q); // Log before upsert
              return {
                where: { id: q.id || "" }, // Ensure id is not undefined
                update: {
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
                      (doc) => doc !== null
                    ),
                  },
                },
                create: {
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
                      (doc) => doc !== null
                    ),
                  },
                },
              };
            }),
          },
          preferredQuotationId: preferredVendorId
            ? processedQuotations.find((q) => q.vendorId === preferredVendorId)
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

    console.log("Updated RFP record:", updatedRecord);

    return NextResponse.json(serializePrismaModel(updatedRecord), {
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
}

async function deleteExistingRecords(quotations: any[]) {
  for (const quotation of quotations) {
    console.log(`Deleting vendor pricing for quotation ID: ${quotation.id}`);
    await prisma.vendorPricing.deleteMany({
      where: { quotationId: quotation.id },
    });

    console.log(`Deleting other charges for quotation ID: ${quotation.id}`);
    await prisma.otherCharge.deleteMany({
      where: { quotationId: quotation.id },
    });

    console.log(
      `Deleting supporting documents for quotation ID: ${quotation.id}`
    );
    await prisma.supportingDocument.deleteMany({
      where: { quotationId: quotation.id },
    });
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

      return {
        documentType: file.name,
        documentName: fileNameWithDate,
        location: `/assets/RFP-${rfpId}/${vendorId}/${fileNameWithDate}`,
      };
    })
  );
}

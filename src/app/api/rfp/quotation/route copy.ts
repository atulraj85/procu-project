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
      console.log("Invalid UUID provided:", id);
      return NextResponse.json(
        { error: "Valid UUID is required for updating a record" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const data = JSON.parse(formData.get("data") as string);
    console.log("Parsed form data:", data);

    const { quotations, preferredVendorId, rfpStatus } = data;
    console.log("Extracted data:", {
      quotations,
      preferredVendorId,
      rfpStatus,
    });

    const supDocs = Array.from(formData.entries()).slice(2);
    console.log("Supporting documents:", supDocs);

    const processedQuotations = await Promise.all(
      (quotations || []).map(async (quotation: any) => {
        console.log("Processing quotation:", quotation);
        const {
          id: quotationId,
          vendorId,
          products,
          otherCharges,
          total,
          refNo,
        } = quotation;

        if (!isValidUUID(vendorId)) {
          console.error(`Invalid vendorId: ${vendorId}`);
          throw new Error(`Invalid vendorId: ${vendorId}`);
        }

        const processedDocuments = await processDocuments(
          id,
          vendorId,
          supDocs
        );
        console.log("Processed documents:", processedDocuments);

        return {
          id: quotationId,
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
    console.log("Processed quotations:", processedQuotations);

    const updatedRecord = await prisma.rFP.update({
      where: { id },
      data: {
        rfpStatus: rfpStatus,
        quotations: {
          upsert: processedQuotations.map((q) => ({
            where: { id: q.id || "" },
            create: {
              vendorId: q.vendorId,
              refNo: q.refNo,
              totalAmount: q.totalAmount,
              totalAmountWithoutGST: q.totalAmountWithoutGST,
              vendorPricings: q.vendorPricings,
              otherCharges: q.otherCharges,
              supportingDocuments: q.supportingDocuments,
            },
            update: {
              vendorId: q.vendorId,
              refNo: q.refNo,
              totalAmount: q.totalAmount,
              totalAmountWithoutGST: q.totalAmountWithoutGST,
              vendorPricings: q.vendorPricings,
              otherCharges: q.otherCharges,
              supportingDocuments: q.supportingDocuments,
            },
          })),
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
// ... (keep the existing helper functions)
async function processDocuments(
  rfpId: string,
  vendorId: string,
  supDocs: any[]
) {
  console.log("Processing documents for RFP:", rfpId, "Vendor:", vendorId);
  const quotationDirPath = path.join(
    process.cwd(),
    "public",
    "assets",
    `RFP-${rfpId}`,
    vendorId
  );
  console.log("Quotation directory path:", quotationDirPath);

  await fs.mkdir(quotationDirPath, { recursive: true });
  console.log("Created directory:", quotationDirPath);

  const vendorDocs = supDocs.filter((doc) => doc[0].startsWith(vendorId));
  console.log("Vendor documents:", vendorDocs);

  return Promise.all(
    vendorDocs.map(async ([key, file]) => {
      console.log("Processing document:", key);
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
      console.log("File path:", filePath);

      const fileBuffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(filePath, fileBuffer);
      console.log("File written:", filePath);

      return {
        documentType: file.name,
        documentName: fileNameWithDate,
        location: `/assets/RFP-${rfpId}/${vendorId}/${fileNameWithDate}`,
      };
    })
  );
}

async function updateQuotation(existingQuotation: any, quotationData: any) {
  console.log("Updating quotation:", existingQuotation.id);
  console.log("Quotation data:", quotationData);

  const {
    vendorId,
    products,
    otherCharges,
    total,
    refNo,
    supportingDocuments,
  } = quotationData;

  const updatedQuotation = await prisma.quotation.update({
    where: { id: existingQuotation.id },
    data: {
      vendorId,
      refNo,
      totalAmount: parseFloat(total.withGST) || 0,
      totalAmountWithoutGST: parseFloat(total.withoutGST) || 0,
      vendorPricings: {
        deleteMany: {},
        create: products.map((product: any) => ({
          price: parseFloat(product.unitPrice) || 0,
          GST: parseInt(product.gst) || 0,
          rfpProduct: { connect: { id: product.rfpProductId } },
        })),
      },
      otherCharges: {
        deleteMany: {},
        create: otherCharges.map((charge: any) => ({
          name: charge.name,
          price: parseFloat(charge.unitPrice) || 0,
          gst: parseFloat(charge.gst) || 0,
        })),
      },
      supportingDocuments: {
        deleteMany: {},
        create: supportingDocuments,
      },
    },
    include: {
      vendorPricings: true,
      otherCharges: true,
      supportingDocuments: true,
    },
  });

  console.log("Updated quotation:", updatedQuotation);
  return updatedQuotation;
}

async function createQuotation(quotationData: any) {
  console.log("Creating new quotation");
  console.log("Quotation data:", quotationData);

  const {
    rfpId,
    vendorId,
    products,
    otherCharges,
    total,
    refNo,
    supportingDocuments,
  } = quotationData;

  const newQuotation = await prisma.quotation.create({
    data: {
      rfp: { connect: { id: rfpId } },
      vendor: { connect: { id: vendorId } },
      refNo,
      totalAmount: parseFloat(total.withGST) || 0,
      totalAmountWithoutGST: parseFloat(total.withoutGST) || 0,
      vendorPricings: {
        create: products.map((product: any) => ({
          price: parseFloat(product.unitPrice) || 0,
          GST: parseInt(product.gst) || 0,
          rfpProduct: { connect: { id: product.id } },
        })),
      },
      otherCharges: {
        create: otherCharges.map((charge: any) => ({
          name: charge.name,
          price: parseFloat(charge.unitPrice) || 0,
          gst: parseFloat(charge.gst) || 0,
        })),
      },
      supportingDocuments: {
        create: supportingDocuments,
      },
    },
    include: {
      vendorPricings: true,
      otherCharges: true,
      supportingDocuments: true,
    },
  });

  console.log("Created new quotation:", newQuotation);
  return newQuotation;
}

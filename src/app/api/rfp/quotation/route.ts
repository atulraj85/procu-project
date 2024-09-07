import { NextRequest, NextResponse } from "next/server";
import { serializePrismaModel } from "@/types";
import { prisma, rfpModel } from "@/lib/prisma";
import path from "path";
import fs from "fs";

// Helper function to validate UUID
function isValidUUID(uuid: string) {
  const uuidRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
  return uuidRegex.test(uuid);
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");
    if (!id || !isValidUUID(id)) {
      return NextResponse.json(
        { error: "Valid UUID is required for updating a record" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const data = JSON.parse(formData.get("data") as string);
    const { quotations, preferredVendorId } = data;

    console.log("data:", data);
    console.log("quotations:", quotations);
    console.log("preferredVendorId:", preferredVendorId);

    // Define valid attributes for the RFP model
    const validAttributes = rfpModel.attributes;
    const invalidKeys = Object.keys(data).filter(
      (key) => !validAttributes.includes(key)
    );
    if (invalidKeys.length > 0) {
      return NextResponse.json(
        { error: `Invalid attributes in data: ${invalidKeys.join(", ")}` },
        { status: 400 }
      );
    }

    // Add the updated_at field to the data
    data.updated_at = new Date();

    // Process quotations and their supporting documents
    const processedQuotations = await Promise.all(
      (quotations || []).map(async (quotation: any) => {
        const { vendorId, products, supportingDocuments, totalAmount } =
          quotation;
        if (!isValidUUID(vendorId)) {
          throw new Error(`Invalid vendorId: ${vendorId}`);
        }

        const quotationDirPath = path.join(
          process.cwd(),
          "public",
          "assets",
          `RFP-${id}`,
          vendorId
        );
        await fs.promises.mkdir(quotationDirPath, { recursive: true });

        const processedDocuments = await Promise.all(
          Object.entries(supportingDocuments || {}).map(
            async ([docType, fileName]) => {
              const file = formData.get(`${vendorId}-${docType}`) as File;
              if (!file) {
                throw new Error(`File not found for ${vendorId}-${docType}`);
              }
              const filePath = path.join(quotationDirPath, fileName as string);
              const fileBuffer = Buffer.from(await file.arrayBuffer());
              await fs.promises.writeFile(filePath, fileBuffer);
              return {
                documentType: docType,
                documentName: fileName,
                location: `/assets/RFP-${id}/${vendorId}/${fileName}`,
              };
            }
          )
        );

        // Create VendorPricing entries for each product in the quotation
        const vendorPricingEntries = products.map((product: any) => {
          // Instead of checking for UUID, we'll use the numeric ID
          if (typeof product.id !== "number" || isNaN(product.id)) {
            throw new Error(`Invalid product id: ${product.id}`);
          }
          return {
            price: parseFloat(product.amount),
            rfpProduct: {
              connect: {
                rfpId_productId: {
                  rfpId: id,
                  productId: product.id,
                },
              },
            },
          };
        });

        return {
          vendorId,
          totalAmount: parseFloat(totalAmount),
          supportingDocuments: {
            create: processedDocuments,
          },
          vendorPricings: {
            create: vendorPricingEntries,
          },
        };
      })
    );

    console.log("processedQuotations", processedQuotations);

    delete data.preferredVendorId;

    console.log(data, typeof id);

    // Update the RFP record with new quotations and supporting documents
    const updatedRecord = await prisma.rFP.update({
      where: { id },
      data: {
        ...data,
        quotations: {
          deleteMany: {},
          create: processedQuotations,
        },
      },
      include: {
        quotations: true,
      },
    });

    // Find the preferredQuotationId based on preferredVendorId
    const preferredQuotation = updatedRecord.quotations.find(
      (quotation) => quotation.vendorId === preferredVendorId
    );

    if (preferredQuotation) {
      await prisma.rFP.update({
        where: { id },
        data: {
          preferredQuotationId: preferredQuotation.id,
        },
      });
    }

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

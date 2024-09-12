import { NextRequest, NextResponse } from "next/server";
import { serializePrismaModel } from "@/types";
import { prisma } from "@/lib/prisma";
import path from "path";
import fs from "fs/promises";

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
    const { quotations } = data;

    // Process quotations and their supporting documents
    const processedQuotations = await Promise.all(
      (quotations || []).map(async (quotation: any) => {
        const { vendorId, products, otherCharges, total, supportingDocuments } =
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
        await fs.mkdir(quotationDirPath, { recursive: true });

        const processedDocuments = await Promise.all(
          (supportingDocuments || []).map(async (doc: any) => {
            const fileKey = `${vendorId}/${doc.name}`; // Construct the file key based on the new format
            const file = formData.get(fileKey) as File;
            if (!file) {
              console.warn(`File not found for ${fileKey}`);
              return null; // Handle this case as needed
            }
            const fileName = file.name;
            const filePath = path.join(
              process.cwd(),
              "public",
              "assets",
              fileKey
            ); // Save to the specified path
            const fileBuffer = Buffer.from(await file.arrayBuffer());
            await fs.writeFile(filePath, fileBuffer);
            return {
              documentType: doc.name,
              documentName: fileName,
              location: `/assets/${fileKey}`, // Adjust the location accordingly
            };
          })
        );

        const filteredDocuments = processedDocuments.filter(
          (doc) => doc !== null
        );

        // Create VendorPricing entries for each product in the quotation
        const vendorPricingEntries = products.map((product: any) => ({
          price: parseFloat(product.unitPrice),
          rfpProduct: {
            connect: {
              rfpId_productId: {
                rfpId: id,
                productId: product.id,
              },
            },
          },
        }));

        // Create OtherCharges entries
        const otherChargesEntries = otherCharges.map((charge: any) => ({
          name: charge.name,
          price: parseFloat(charge.unitPrice),
          gst: parseFloat(charge.gst),
        }));

        return {
          vendorId,
          totalAmount: parseFloat(total.withGST),
          totalAmountWithoutGST: parseFloat(total.withoutGST),
          supportingDocuments: {
            create: filteredDocuments,
          },
          vendorPricings: {
            create: vendorPricingEntries,
          },
          otherCharges: {
            create: otherChargesEntries,
          },
        };
      })
    );

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
        quotations: {
          include: {
            supportingDocuments: true,
            vendorPricings: true,
            otherCharges: true,
          },
        },
      },
    });

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

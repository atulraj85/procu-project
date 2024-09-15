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
    console.log("quotations", quotations);
    console.log("formData", formData);
    const supDocs = Array.from(formData.entries()).slice(2);
    //console.log("supDocs", supDocs);

    // Process quotations and their supporting documents
    const processedQuotations = await Promise.all(
      (quotations || []).map(async (quotation: any) => {
        const { vendorId, products, otherCharges, total, supportingDocuments } =
          quotation;

        if (!isValidUUID(vendorId)) {
          throw new Error(`Invalid vendorId: ${vendorId}`);
        }

        //console.log("vendorId", vendorId);

        async function processedDocuments() {
          const quotationDirPath = path.join(
            process.cwd(),
            "public",
            "assets",
            `RFP-${id}`,
            vendorId
          );

          //console.log("quotationDirPath", quotationDirPath);

          await fs.mkdir(quotationDirPath, { recursive: true });

          const index = supDocs.findIndex((doc) => doc[0].startsWith(vendorId));

          if (index !== -1) {
            //console.log(`Element found at index: ${index}`);
            //console.log(`Element:`, supDocs[index]);
          } else {
            //console.log("Element not found");
            throw "Supporting documents not found!";
          }

          const str = supDocs[index][0]; // e.g., 'b5b7988e-c18f-4193-9737-cc35ae3c557c/Bill'
          const result = str.split("/")[1];
          //console.log("result", result);

          const file = supDocs[index][1] as File;
          if (!file) {
            console.warn(`File not found for ${supDocs[index][0]}`);
            return null;
          }

          // Extract the name from supDocs[0][0] and the original file extension
          const newFileName = `${result}.${file.name.split(".").pop()}`; // Combine name and extension
          //console.log("newFileName", newFileName);

          const filePath = path.join(quotationDirPath, newFileName); // Create the full file path with the new name

          try {
            const fileBuffer = await Buffer.from(await file.arrayBuffer());
            //console.log("fileBuffer", fileBuffer);
            const done = await fs.writeFile(filePath, fileBuffer); // Use the full file path
            //console.log("done", done);
          } catch (error: any) {
            //console.log(error);
          }

          return {
            documentType: file.name,
            documentName: newFileName,
            location: `/assets/RFP-${id}/${vendorId}/${newFileName}`,
          };
        }

        const processedDocumentData = await processedDocuments();

        //console.log("processedDocumentData", processedDocumentData);

        //console.log("products", products);

        // Create VendorPricing entries for each product in the quotation
        const vendorPricingEntries = products.map((product: any) => ({
          price: parseFloat(product.unitPrice) || 0,
          GST: parseInt(product.gst), // Default to 0 if unitPrice is null
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
          price: parseFloat(charge.unitPrice) || 0, // Default to 0 if unitPrice is null
          gst: parseFloat(charge.gst) || 0, // Default to 0 if gst is null
        }));

        return {
          vendorId,
          totalAmount: parseFloat(total.withGST) || 0, // Default to 0 if total.withGST is null
          totalAmountWithoutGST: parseFloat(total.withoutGST) || 0, // Default to 0 if total.withoutGST is null
          supportingDocuments: {
            create: processedDocumentData,
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

    //console.log("processedQuotations", processedQuotations);

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

// import { NextRequest, NextResponse } from "next/server";
// import { rfpModel } from "../route";
// import { serializePrismaModel } from "@/types";
// import { prisma } from "@/lib/prisma";

// export async function PUT(request: NextRequest) {
//   try {
//     const { searchParams } = request.nextUrl;
//     const id = searchParams.get("id");
//     if (!id) {
//       return NextResponse.json(
//         { error: "ID is required for updating a record" },
//         { status: 400 }
//       );
//     }

//     const data = await request.json();
//     const { preferredVendorId } = data; // Extract preferredVendorId from the request

//     // Define valid attributes for the RFP model
//     const validAttributes = rfpModel.attributes;
//     const invalidKeys = Object.keys(data).filter(
//       (key) => !validAttributes.includes(key)
//     );

//     if (invalidKeys.length > 0) {
//       return NextResponse.json(
//         { error: `Invalid attributes in data: ${invalidKeys.join(", ")}` },
//         { status: 400 }
//       );
//     }

//     // Add the updated_at field to the data
//     data.updated_at = new Date();

//     // Create new quotations for those that do not exist
//     const newQuotations = data.quotations.map(
//       (quotation: { vendorId: string | number; billAmount: any }) => ({
//         vendorId: quotation.vendorId,
//         billAmount: quotation.billAmount,
//         rfpId: id, // Connect to the current RFP
//       })
//     );

//     // Remove preferredVendorId from data before updating
//     delete data.preferredVendorId;

//     // Update the RFP record with new quotations
//     const updatedRecord = await prisma.rFP.update({
//       where: { id: id },
//       data: {
//         ...data,
//         quotations: {
//           create: newQuotations, // Create new quotations
//         },
//       },
//     });

//     // After creating the quotations, find the preferredQuotationId
//     const createdQuotations = await prisma.quotation.findMany({
//       where: { rfpId: id },
//     });

//     // Find the preferredQuotationId based on preferredVendorId
//     const preferredQuotationId = createdQuotations.find(
//       (quotation) => quotation.vendorId === preferredVendorId
//     )?.id;

//     // Update the RFP record with the preferredQuotationId if it exists
//     if (preferredQuotationId) {
//       await prisma.rFP.update({
//         where: { id: id },
//         data: {
//           preferredQuotationId, // Set the preferredQuotationId
//         },
//       });
//     }

//     return NextResponse.json(serializePrismaModel(updatedRecord), {
//       status: 200,
//     });
//   } catch (error: unknown) {
//     console.error("Error updating RFP:", error);
//     return NextResponse.json(
//       { error: "Error updating record", details: (error as Error).message },
//       { status: 500 }
//     );
//   }
// }
import { NextRequest, NextResponse } from "next/server";
import { serializePrismaModel } from "@/types";
import { prisma, rfpModel } from "@/lib/prisma";
import path from "path";
import fs from "fs";

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "ID is required for updating a record" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const data = JSON.parse(formData.get("data") as string);
    const { quotations, preferredVendorId } = data; // Keep preferredVendorId as is

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
      quotations.map(async (quotation: any) => {
        const { vendorId, billAmount, supportingDocuments } = quotation;
        const quotationDirPath = path.join(
          process.cwd(),
          "public",
          "assets",
          `RFP-${id}`,
          vendorId
        );
        await fs.promises.mkdir(quotationDirPath, { recursive: true });

        const processedDocuments = await Promise.all(
          Object.entries(supportingDocuments[0]).map(
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

        return {
          vendorId,
          billAmount: parseFloat(billAmount),
          supportingDocuments: {
            create: processedDocuments,
          },
        };
      })
    );

    delete data.preferredVendorId

    // Update the RFP record with new quotations and supporting documents
    const updatedRecord = await prisma.rFP.update({
      where: { id: id },
      data: {
        ...data,
        quotations: {
          deleteMany: {}, // Delete existing quotations
          create: processedQuotations, // Create new quotations with processed documents
        },
      },
      include: {
        quotations: true, // Include quotations in the result
      },
    });

    // Find the preferredQuotationId based on preferredVendorId
    const preferredQuotation = updatedRecord.quotations.find(
      (quotation) => quotation.vendorId === preferredVendorId // Use preferredVendorId to find the preferred quotation
    );

    if (preferredQuotation) {
      await prisma.rFP.update({
        where: { id: id },
        data: {
          preferredQuotationId: preferredQuotation.id, // Update preferredQuotationId
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

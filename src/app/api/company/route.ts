import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust the import based on your project structure
import fs from "fs";
import path from "path";
import { serializePrismaModel } from "@/types";

// // Ensure the API route does not use bodyParser
// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

async function saveFile(file: File, directory: string) {
  const filePath = path.join(directory, file.name);
  const fileStream = fs.createWriteStream(filePath);
  const readableStream = file.stream();

  await new Promise<void>((resolve, reject) => {
    const reader = readableStream.getReader();
    const pump = async () => {
      const { done, value } = await reader.read();
      if (done) {
        fileStream.end();
        resolve();
        return;
      }
      fileStream.write(value);
      pump();
    };
    pump().catch(reject);
  });

  return filePath; // Return the path for further use
}

export async function POST(request: Request) {
  try {
    const reqData = await request.formData();
    console.log(reqData);

    // Extract fields from FormData
    const fields: Record<string, string> = {};
    const files: Record<string, File[]> = {};

    // Convert FormData entries to an array and iterate
    const entries = Array.from(reqData.entries());
    for (const [key, value] of entries) {
      if (value instanceof File) {
        if (!files[key]) {
          files[key] = [];
        }
        files[key].push(value);
      } else {
        fields[key] = value as string;
      }
    }

    // Define paths for saving files
    const companyAssetsPath = path.join(process.cwd(), "public/company");
    if (!fs.existsSync(companyAssetsPath)) {
      fs.mkdirSync(companyAssetsPath, { recursive: true });
    }

    // Save logo and stamp files if they exist
    const logoPath = files.logo
      ? await saveFile(files.logo[0], companyAssetsPath)
      : null;
    const stampPath = files.stamp
      ? await saveFile(files.stamp[0], companyAssetsPath)
      : null;

    // Create a new company entry in the database
    const company = await prisma.company.create({
      data: {
        name: fields.name,
        GST: fields.GST,
        gstAddress: fields.gstAddress,
        email: fields.email,
        phone: fields.phone,
        website: fields.website,
        industry: fields.industry,
        foundedDate: fields.foundedDate ? new Date(fields.foundedDate) : null,
        status: fields.status,
        logo: logoPath ? `/company/${path.basename(logoPath)}` : null, // Store the relative path
        stamp: stampPath ? `/company/${path.basename(stampPath)}` : null, // Store the relative path
      },
    });

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to save company" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const whereClause: Record<string, any> = {};
    let orderByClause: Record<string, "asc" | "desc"> | undefined = undefined;
    const validAttributes = [...companyModel.attributes, "orderBy"];

    console.log("Received search params:", Object.fromEntries(searchParams));

    searchParams.forEach((value, key) => {
      console.log(`Processing parameter: ${key} = ${value}`);
      if (validAttributes.includes(key)) {
        if (key === "orderBy") {
          const parts = value.split(",");
          let orderByField: string = companyModel.attributes[0]; // Default to first attribute
          let orderByDirection: "asc" | "desc" = "asc"; // Default to ascending

          if (parts.length === 2) {
            orderByField = parts[0];
            orderByDirection =
              parts[1].toLowerCase() === "desc" ? "desc" : "asc";
          } else if (parts.length === 1) {
            orderByDirection =
              parts[0].toLowerCase() === "desc" ? "desc" : "asc";
          }

          console.log(
            `OrderBy field: ${orderByField}, direction: ${orderByDirection}`
          );

          if (companyModel.attributes.includes(orderByField)) {
            orderByClause = {
              [orderByField]: orderByDirection,
            };
            console.log(`Set orderByClause:`, orderByClause);
          } else {
            console.log(`Invalid orderBy field: ${orderByField}`);
          }
        } else if (key === "id") {
          const ids = value.split(",").map((id) => id);
          whereClause.id = ids.length > 1 ? { in: ids } : ids[0];
        } else if (key === "state_id") {
          const stateIds = value.split(",").map((id) => parseInt(id, 10));
          whereClause.state_id =
            stateIds.length > 1 ? { in: stateIds } : stateIds[0];
        } else {
          whereClause[key] = value;
        }
      } else {
        console.log(`Ignoring invalid parameter: ${key}`);
      }
    });

    const records = await prisma.company.findMany({
      where: whereClause,
      orderBy: orderByClause,
      include: {
        addresses: true,
      },
    });

    // const formattedData = formatRFPData(records);
    // console.log("formattedData", formattedData);

    console.log(`Found ${records.length} records`);

    if (Object.keys(whereClause).length > 0 && records.length === 0) {
      return NextResponse.json(
        { error: `No records found matching the criteria` },
        { status: 404 }
      );
    }

    return NextResponse.json(serializePrismaModel(records));
  } catch (error: unknown) {
    console.error("Detailed error:", error);
    return NextResponse.json(
      { error: "Error fetching records", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// export async function PUT(request: NextRequest) {
//   try {
//     const reqData = await request.formData();
//     const { searchParams } = request.nextUrl;
//     const id = searchParams.get("id");

//     console.log(reqData);

//     if (!id) {
//       return NextResponse.json(
//         { error: "ID is required for updating a record" },
//         { status: 400 }
//       );
//     }

//     const foundedDate = reqData.get('foundedDate') as string;

//     // Extract company fields from FormData
//     const fields: Record<string, string> = {};
//     const files: Record<string, File> = {};

//     const entries = Array.from(reqData.entries());
//     for (const [key, value] of entries) {
//       if (value instanceof File) {
//         files[key] = value;
//       } else {
//         fields[key] = value as string;
//       }
//     }

//     // Handle files (logo, stamp)
//     const companyAssetsPath = path.join(process.cwd(), "public/company");
//     if (!fs.existsSync(companyAssetsPath)) {
//       fs.mkdirSync(companyAssetsPath, { recursive: true });
//     }

//     const logoPath = files.logo
//       ? await saveFile(files.logo, companyAssetsPath)
//       : undefined;
//     const stampPath = files.stamp
//       ? await saveFile(files.stamp, companyAssetsPath)
//       : undefined;

//     // Prepare update data for the company
//     const updateData = {
//       ...fields,
//       foundedDate: foundedDate ? new Date(foundedDate) : undefined, // Parse foundedDate
//       ...(logoPath && { logo: logoPath }),
//       ...(stampPath && { stamp: stampPath }),
//     };

//     // Now handle address data
//     const addressFields = {
//       street: reqData.get("street") as string,
//       city: reqData.get("city") as string,
//       state: reqData.get("state") as string,
//       postalCode: reqData.get("postalCode") as string,
//       country: reqData.get("country") as string,
//       addressType: reqData.get("addressType") as string, // Ensure that this matches your enum
//     };

//    const addressId = reqData.get("addressId") as string | null; // Ensure this is provided from frontend if address exists

// const company = await prisma.company.update({
//   where: { id },
//   data: {
//     ...updateData,
//     addresses: {
//       upsert: {
//         where: { id: addressId || "" }, // Ensure to use the unique 'id' of the address
//         create: {
//           street: reqData.get("street") as string,
//           city: reqData.get("city") as string,
//           state: reqData.get("state") as string,
//           postalCode: reqData.get("postalCode") as string,
//           country: reqData.get("country") as string,
//           addressType: reqData.get("addressType") as string, // Ensure addressType is valid
//         },
//         update: {
//           street: reqData.get("street") as string,
//           city: reqData.get("city") as string,
//           state: reqData.get("state") as string,
//           postalCode: reqData.get("postalCode") as string,
//           country: reqData.get("country") as string,
//           addressType: reqData.get("addressType") as string, // Ensure addressType is valid
//         },
//       },
//     },
//   },
// });

//     return NextResponse.json({ status: "success", data: company });
//   } catch (error: any) {
//     console.error(error);
//     return NextResponse.json(
//       { error: `Failed to update company: ${error.message}` },
//       { status: 500 }
//     );
//   }
// }

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await prisma.company.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Company deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Error deleting company" },
      { status: 500 }
    );
  }
}

const companyModel = {
  model: prisma.company,
  attributes: [
    "id",
    "name",
    "GST",
    "gstAddress",
    "logo",
    "stamp",
    "email",
    "phone",
    "website",
    "industry",
    "foundedDate",
    "status",
    "created_at",
    "updated_at",
  ],
};

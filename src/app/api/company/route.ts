import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust the import based on your project structure
import fs from "fs";
import path from "path";

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
        email: fields.email,
        phone: fields.phone,
        website: fields.website,
        industry: fields.industry,
        foundedDate: fields.foundedDate ? new Date(fields.foundedDate) : null,
        status: fields.status,
        logo: logoPath ? `/assets/company/${path.basename(logoPath)}` : null, // Store the relative path
        stamp: stampPath ? `/assets/company/${path.basename(stampPath)}` : null, // Store the relative path
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

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      include: {
        addresses: true, // Include related addresses
        users: true, // Include related users
        PO: true, // Include related purchase orders (if needed)
      },
    });
    return NextResponse.json(companies);
  } catch (error) {
    console.error(error); // Log the error for debugging
    return NextResponse.json(
      { error: "Error fetching companies" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    const company = await prisma.company.update({
      where: { id },
      data,
    });
    return NextResponse.json(company);
  } catch (error) {
    return NextResponse.json(
      { error: "Error updating company" },
      { status: 500 }
    );
  }
}

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

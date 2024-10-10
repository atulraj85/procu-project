import { deleteCompany } from "@/data/company";
import { CompanyTable } from "@/drizzle/schema";
import { db } from "@/lib/db";
import fs from "fs";

import { saveFile } from "@/utils/saveFiles";
import { and, asc, desc, eq, InferSelectModel, SQL } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

// Type Definitions
type SortBy = keyof InferSelectModel<typeof CompanyTable>;
type SortDirection = "asc" | "desc";
type WhereField = keyof InferSelectModel<typeof CompanyTable>;

const DEFAULT_SORTING_FIELD: SortBy = "id";
const DEFAULT_SORTING_DIRECTION: SortDirection = "desc";

export async function POST(request: Request) {
  try {
    console.log("in the company register route");
    const reqData = await request.formData();
    console.log(reqData);
    

   
  
    

    // Extract fields from FormData
    const fields: Record<string, string> = {};
    const files: Record<string, File[]> = {};

    // Convert FormData entries to an array and iterate
    console.log("converting form data into array");
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

    const gst = fields.company_gstn;

     // first find this compnay alreadi registerd or not
     const result = await db.select().from(CompanyTable).where(eq(CompanyTable.gst, gst));

     if(result){
      console.log(result);
      return NextResponse.json({error:"Compnay Already Registerd"}, {status:409});
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
    console.log("Creating company in db");

    console.log("#################### fields", fields);
    const [insertedCompany] = await db
      .insert(CompanyTable)
      .values({
        name: fields.company_name,
        gst: fields.company_gstn,
        gstAddress: fields.address,
        email: fields.email,
        phone: fields.phone,
        // website: fields.website,
        // industry: fields.industry,
        // foundedDate: fields.foundedDate ? new Date(fields.foundedDate) : null,
        // status: fields.status,
        logo: logoPath ? `/company/${path.basename(logoPath)}` : null,
        stamp: stampPath ? `/company/${path.basename(stampPath)}` : null,
        updatedAt: new Date(),
      })
      .returning();

    // Return only the inserted company data
    return NextResponse.json(insertedCompany, { status: 201 });
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

    const sortBy: SortBy =
      (searchParams.get("sortBy") as SortBy) || DEFAULT_SORTING_FIELD;
    const sortingOrder: SortDirection =
      (searchParams.get("order") as SortDirection) || DEFAULT_SORTING_DIRECTION;

    if (!["asc", "desc"].includes(sortingOrder)) {
      return NextResponse.json(
        { error: "Invalid order value" },
        { status: 400 }
      );
    }

    // Construct where conditions
    const whereConditions: SQL<unknown>[] = [];
    searchParams.forEach((value, key) => {
      if (key !== "sortBy" && key !== "order") {
        if (key in CompanyTable) {
          whereConditions.push(eq(CompanyTable[key as WhereField], value));
        }
      }
    });

    // Combine conditions using 'and'
    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Fetch filtered and sorted users
    const companies = await db.query.CompanyTable.findMany({
      where: whereClause,
      orderBy:
        sortingOrder === "asc"
          ? [asc(CompanyTable[sortBy])]
          : [desc(CompanyTable[sortBy])],
      // Include the addresses in the result
      with: {
        addresses: true,
      },
    });

    console.log(`Found ${companies.length} records`);

    return NextResponse.json(companies);
  } catch (error) {
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
    await deleteCompany(id);
    return NextResponse.json({ message: "Company deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Error deleting company" },
      { status: 500 }
    );
  }
}

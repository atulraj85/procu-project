import { deleteCompany } from "@/data/company";
import { AddressTable, CompanyTable } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { AddressType } from "@/schemas";
import { eq } from "drizzle-orm";
import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { saveFile } from "../route";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const company = await db.query.CompanyTable.findFirst({
      where: eq(CompanyTable.id, params.id),
      with: {
        addresses: true,
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error("Detailed error:", error);
    return NextResponse.json(
      { error: "Error fetching records", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existingCompany = await db.query.CompanyTable.findFirst({
      columns: { id: true },
      where: eq(CompanyTable.id, params.id),
    });
    if (!existingCompany) {
      return NextResponse.json({ error: "Invalid company" }, { status: 404 });
    }

    const reqData = await request.formData();
    const foundedDate = reqData.get("foundedDate") as string;
    // Extract company fields from FormData
    const fields: Record<string, string> = {};
    const files: Record<string, File> = {};
    const entries = Array.from(reqData.entries());
    for (const [key, value] of entries) {
      if (value instanceof File) {
        files[key] = value;
      } else {
        fields[key] = value as string;
      }
    }

    // Handle files (logo, stamp)
    const companyAssetsPath = path.join(process.cwd(), "public/company");
    if (!fs.existsSync(companyAssetsPath)) {
      fs.mkdirSync(companyAssetsPath, { recursive: true });
    }
    const logoPath = files.logo
      ? await saveFile(files.logo, companyAssetsPath)
      : undefined;
    const stampPath = files.stamp
      ? await saveFile(files.stamp, companyAssetsPath)
      : undefined;

    // Prepare update data for the company
    const updateData = {
      ...fields,
      foundedDate: foundedDate ? new Date(foundedDate) : undefined,
      ...(logoPath && { logo: logoPath }),
      ...(stampPath && { stamp: stampPath }),
    };

    // Now handle address data
    const mapToAddressType = (value: string): AddressType | null => {
      if (value === "BUSINESS") {
        return "BUSINESS";
      } else if (value === "SHIPPING") {
        return "SHIPPING";
      }
      return null;
    };

    // If the address exists, update it, otherwise, create a new one
    const addressType =
      mapToAddressType(reqData.get("addressType") as string) || "BUSINESS";
    const addressFields = {
      street: reqData.get("street") as string,
      city: reqData.get("city") as string,
      state: reqData.get("state") as string,
      postalCode: reqData.get("postalCode") as string,
      country: reqData.get("country") as string,
      addressType,
    };
    const addressId = reqData.get("addressId") as string | null;

    // Update company.
    await db
      .update(CompanyTable)
      .set({ ...updateData })
      .where(eq(CompanyTable.id, existingCompany.id));

    const existingAddress = addressId
      ? await db.query.AddressTable.findFirst({
          where: eq(AddressTable.id, addressId),
        })
      : null;

    if (existingAddress) {
      await db
        .update(AddressTable)
        .set(addressFields)

        .where(eq(AddressTable.id, addressId!));
    } else {
      await db.insert(AddressTable).values({
        ...addressFields,
        companyId: existingCompany.id,
      });
    }

    const company = await db.query.CompanyTable.findFirst({
      where: eq(CompanyTable.id, existingCompany.id),
      with: {
        addresses: true,
      },
    });
    // Return the updated company data
    return NextResponse.json({ status: "success", data: company });
  } catch (error: any) {
    console.error("Error updating company", error);
    return NextResponse.json(
      { error: `Failed to update company: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const company = await db.query.CompanyTable.findFirst({
      columns: { id: true },
      where: eq(CompanyTable.id, params.id),
    });

    if (!company) {
      return NextResponse.json({ error: "Invalid company" }, { status: 404 });
    }

    await deleteCompany(company.id);

    return NextResponse.json({});
  } catch (error) {
    return NextResponse.json(
      { error: "Company deletion failed" },
      { status: 500 }
    );
  }
}

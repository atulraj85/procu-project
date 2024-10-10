import { deleteCompany } from "@/data/company";
import { AddressTable, CompanyTable } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { AddressType } from "@/schemas";
import { saveFile } from "@/utils/saveFiles";
import { eq } from "drizzle-orm";
import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

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
      ...(foundedDate ? { foundedDate: new Date(foundedDate) } : undefined),
      ...(logoPath && { logo: logoPath }),
      ...(stampPath && { stamp: stampPath }),
    };
    // Remove invalid Date if foundedDate is falsy or an invalid date
    if (!foundedDate || isNaN(new Date(foundedDate).getTime())) {
      delete updateData.foundedDate;
    }

    // Now handle address data
    const mapToAddressType = (value: string): AddressType | null => {
      if (value === "BUSINESS") {
        return "BUSINESS";
      } else if (value === "SHIPPING") {
        return "SHIPPING";
      }
      return null;
    };

    // Update company.
    console.log("Updating company", updateData);
    await db
      .update(CompanyTable)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(CompanyTable.id, existingCompany.id));

    // If the address exists, update it, otherwise, create a new one
    const addressType =
      mapToAddressType(reqData.get("addressType") as string) || "BUSINESS";

    // [{"street":"","country":"","state":"","city":"","zipCode":"","AddressType":"SHIPPING"}]
    const addressesPayload = reqData.get("addresses") as string; // Get the JSON string
    const parsedAddresses = JSON.parse(addressesPayload) as Array<
      Record<string, string>
    >;

    const parsedAddresses2 =
      parsedAddresses?.map((address) => {
        const addressType = mapToAddressType(address.AddressType) || "BUSINESS";
        return {
          addressName:address.addressName,
          addressId: address.addressId,
          street: address.street,
          city: address.city,
          state: address.state,
          postalCode: address.zipCode,
          country: address.country,
          addressType,
        };
      }) || [];

    const addressesToInsert = [];
    const addressesToUpdate = [];

    for (let i = 0; i < parsedAddresses2.length; i++) {
      const address = parsedAddresses2[i];
      const existingAddress = address.addressId
        ? await db.query.AddressTable.findFirst({
            where: eq(AddressTable.id, address.addressId),
          })
        : null;
      if (existingAddress) {
        addressesToUpdate.push({ ...address, companyId: existingCompany.id });
      } else {
        addressesToInsert.push({ ...address, companyId: existingCompany.id });
      }
    }

    if (addressesToInsert && addressesToInsert.length > 0) {
      await db.insert(AddressTable).values(addressesToInsert);
    }

    if (addressesToUpdate && addressesToUpdate.length > 0) {
      for (let i = 0; i < addressesToUpdate.length; i++) {
        await Promise.all(
          addressesToUpdate.map((item) =>
            db
              .update(AddressTable)
              .set(item)
              .where(eq(AddressTable.id, item.addressId))
          )
        );
      }
    }

    const company = await db.query.CompanyTable.findFirst({
      where: eq(CompanyTable.id, existingCompany.id),
      with: {
        addresses: true,
      },
    });

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

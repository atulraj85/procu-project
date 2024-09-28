import { deleteCompany, findCompanyById } from "@/data/company";
import { CompanyTable } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const company = await findCompanyById(params.id);
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

import { AddressTable, CompanyTable } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { AddressSchema } from "@/schemas";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(`Fetching addresses for company: ${params.id}`);
  try {
    const company = await db.query.CompanyTable.findFirst({
      columns: { id: true },
      where: eq(CompanyTable.id, params.id),
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const addresses = await db.query.AddressTable.findMany({
      where: eq(AddressTable.companyId, params.id),
    });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error(`Error fetching addresses for company ${params.id}`, error);
    return NextResponse.json(
      { error: `Error fetching addresses for company ${params.id}` },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(`Creating a new address for company: ${params.id}`);

  const body = await request.json();

  const validation = AddressSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }

  try {
    const company = await db.query.CompanyTable.findFirst({
      columns: { id: true },
      where: eq(CompanyTable.id, params.id),
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const [newAddress] = await db
      .insert(AddressTable)
      .values({ ...validation.data, companyId: company.id })
      .returning();

    return NextResponse.json(newAddress, { status: 201 });
  } catch (error: any) {
    console.error("Error creating address", error);
    return NextResponse.json(
      { error: "Error creating address" },
      { status: 500 }
    );
  }
}

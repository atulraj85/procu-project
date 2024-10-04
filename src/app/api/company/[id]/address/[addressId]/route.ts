import { AddressTable } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { AddressSchema } from "@/schemas";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; addressId: string } }
) {
  const { id: companyId, addressId } = params;

  console.log(
    `Fetching address with id: ${addressId} for company: ${companyId}`
  );
  try {
    const address = await db.query.AddressTable.findFirst({
      columns: { id: true },
      where: and(
        eq(AddressTable.id, addressId),
        eq(AddressTable.companyId, companyId)
      ),
    });

    if (!address) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    return NextResponse.json(address);
  } catch (error) {
    console.error(`Error fetching address with id: ${params.id}`, error);
    return NextResponse.json(
      { error: `Error fetching address with id: ${params.id}` },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; addressId: string } }
) {
  const { id: companyId, addressId } = params;

  console.log(`Updating address: ${addressId} for company: ${companyId}`);

  const body = await request.json();

  const validation = AddressSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }

  try {
    const address = await db.query.AddressTable.findFirst({
      columns: { id: true },
      where: and(
        eq(AddressTable.id, addressId),
        eq(AddressTable.companyId, companyId)
      ),
    });

    if (!address) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    const [updatedAddress] = await db
      .update(AddressTable)
      .set({ ...validation.data })
      .returning();

    return NextResponse.json(updatedAddress);
  } catch (error: any) {
    console.error(
      `Updating address: ${params.id} for company: ${params.addressId}`,
      error
    );
    return NextResponse.json(
      {
        error: `Updating address: ${params.id} for company: ${params.addressId}`,
      },
      { status: 500 }
    );
  }
}

import { VendorTable } from "@/drizzle/schema";
import { drizzleDB as db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();

  try {
    let results = await db
      .select({ id: VendorTable.id })
      .from(VendorTable)
      .where(eq(VendorTable.id, params.id));

    if (!results[0]) {
      return NextResponse.json({ errpr: "Invalid vendor" }, { status: 404 });
    }

    const vendor = results[0];

    results = await db
      .update(VendorTable)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(VendorTable.id, vendor.id))
      .returning();

    return NextResponse.json(results[0]);
  } catch (error) {
    console.error("Detailed error:", error);
    return NextResponse.json(
      { error: "Error updating record", details: (error as Error).message },
      { status: 500 }
    );
  }
}

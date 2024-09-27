import { VendorTable } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();

  try {
    const vendor = await db.query.VendorTable.findFirst({
      columns: { id: true },
      where: eq(VendorTable.id, params.id),
    });

    if (!vendor) {
      return NextResponse.json({ errpr: "Invalid vendor" }, { status: 404 });
    }

    const results = await db
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

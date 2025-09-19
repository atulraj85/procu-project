import { VendorTable } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status, approvedById } = await request.json();
    
    // Validate status
    if (!["APPROVED", "REJECTED", "SUSPENDED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be APPROVED, REJECTED, or SUSPENDED" },
        { status: 400 }
      );
    }

    const vendor = await db.query.VendorTable.findFirst({
      where: eq(VendorTable.id, params.id),
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const result = await db
      .update(VendorTable)
      .set({
        status,
        verifiedById:approvedById,
        updatedAt: new Date(),
      })
      .where(eq(VendorTable.id, params.id))
      .returning();

    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json(
      { error: "Error updating vendor status", details: (error as Error).message },
      { status: 500 }
    );
  }
}

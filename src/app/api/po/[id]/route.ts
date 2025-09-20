import { PurchaseOrderTable } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const po = await db.query.PurchaseOrderTable.findFirst({
      columns: { id: true },
      where: eq(PurchaseOrderTable.id, params.id),
    });

    if (!po) {
      return NextResponse.json({ error: "Invalid PO" }, { status: 404 });
    }

    await db.delete(PurchaseOrderTable).where(eq(PurchaseOrderTable.id, params.id));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting PO:", error);
    return NextResponse.json({ error: "Error deleting PO" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const po = await db.query.PurchaseOrderTable.findFirst({
      columns: { id: true },
      where: eq(PurchaseOrderTable.id, params.id),
    });

    if (!po) {
      return NextResponse.json({ error: "Invalid PO" }, { status: 404 });
    }

    const body = await request.json();
    const results = await db
      .update(PurchaseOrderTable)
      .set({
        quotationId: body.quotationId,
        userId: body.userId,
        companyId: body.companyId,
        rfpId: body.rfpId,
      })
      .where(eq(PurchaseOrderTable.id, params.id))
      .returning();

    return NextResponse.json(results[0]);
  } catch (error) {
    return NextResponse.json({ error: "Error updating PO" }, { status: 500 });
  }
}

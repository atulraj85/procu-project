import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST /api/po
export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("Body reciveived: ", body);

    const updateRFP = await prisma.rFP.update({
      where: {
        id: body.rfpId,
      },
      data: {
        rfpStatus: body.rfpStatus,
      },
    });

    const po = await prisma.pO.create({
      data: {
        poId: body.poId,
        quotationId: body.quotationId,
        userId: body.userId,
        companyId: body.companyId,
        rfpId: body.rfpId,
        remarks: body.remarks,
      },
    });

    const rfp_po = {
      po: po,
      rfp: updateRFP,
    };

    console.log("After prisma: ", po);
    return NextResponse.json(rfp_po, { status: 201 });
  } catch (error:any) {
    return NextResponse.json({ error: `Error creating PO ${error.message}` }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id?: string } }
) {
  try {
    if (params.id) {
      // Fetch a specific PO if an ID is provided
      const po = await prisma.pO.findUnique({
        where: { id: params.id },
      });
      if (!po) {
        return NextResponse.json({ error: "PO not found" }, { status: 404 });
      }
      return NextResponse.json(po);
    } else {
      // Fetch all POs if no ID is provided
      const pos = await prisma.pO.findMany();
      return NextResponse.json(pos);
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching PO(s)" },
      { status: 500 }
    );
  }
}

// PUT /api/po/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updatedPo = await prisma.pO.update({
      where: { id: params.id },
      data: {
        poId: body.poId,
        quotationId: body.quotationId,
        userId: body.userId,
        companyId: body.companyId,
        rfpId: body.rfpId,
      },
    });
    return NextResponse.json(updatedPo);
  } catch (error) {
    return NextResponse.json({ error: "Error updating PO" }, { status: 500 });
  }
}

// DELETE /api/po/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.pO.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: "PO deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Error deleting PO" }, { status: 500 });
  }
}

import { VendorTable } from "@/drizzle/schema";
import { rfpModel } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  try {
    // Define valid attributes for the RFP model
    const validAttributes = rfpModel.attributes; // Assuming rfpModel is defined similarly to vendorModel
    const invalidKeys = Object.keys(body).filter(
      (key) => !validAttributes.includes(key)
    );

    if (invalidKeys.length > 0) {
      return NextResponse.json(
        { error: `Invalid attributes in data: ${invalidKeys.join(", ")}` },
        { status: 400 }
      );
    }

    await drizzleDB
      .update()
      .set({
        email,
        password: hashedPassword,
        name,
        role,
        updatedAt: new Date(),
      })
      .where(eq(UserTable.id, user.id))
      .returning();
    body.updated_at = new Date(); // Set to the current date and time

    // Update the record
    const updatedRecord = await rfpModel.model.update({
      where: { id: id }, // Ensure id is the correct type (string or number based on your schema)
      data: body,
    });

    return NextResponse.json(serializePrismaModel(updatedRecord), {
      status: 200,
    });
  } catch (error: unknown) {
    console.error("Error updating RFP:", error);
    return NextResponse.json(
      { error: "Error updating record", details: (error as Error).message },
      { status: 500 }
    );
  }
}

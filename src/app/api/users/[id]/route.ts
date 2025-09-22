import { deleteUser } from "@/data/user";
import { UserTable } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Move schema to a separate file (e.g., schemas/user.ts)
const updateUserSchema = z.object({
  role: z.enum(["SYSTEM_ADMIN" , "PROCUREMENT_MANAGER" , "PROCUREMENT_LEAD" , "ADMIN_TEAM" , "FINANCE_TEAM" , "FINANCE_EXECUTIVE" , "USER" , "VENDOR"]).optional(),
  email: z.string().email().optional(),
  name: z.string().min(1).optional(),
  vendorProfileId: z.string().uuid().optional(),
  updatedAt: z.string().datetime().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await db.query.UserTable.findFirst({
      where: eq(UserTable.id, params.id),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const validation = updateUserSchema.safeParse(body);
  
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }

  try {
    const user = await db.query.UserTable.findFirst({
      where: eq(UserTable.id, params.id),
    });
    
    if (!user) {
      return NextResponse.json({ error: "Invalid user" }, { status: 404 });
    }

    const { role, email, name, vendorProfileId } = validation.data;
    const updateObject: Partial<typeof UserTable.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (role !== undefined) updateObject.role = role;
    if (email !== undefined) updateObject.email = email;
    if (name !== undefined) updateObject.name = name;
    if (vendorProfileId !== undefined) updateObject.vendorId = vendorProfileId;

    const results = await db
      .update(UserTable)
      .set(updateObject)
      .where(eq(UserTable.id, params.id))
      .returning();

    const updatedUser = results[0];
    
    if (!updatedUser) {
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }

    return NextResponse.json({ data: updatedUser });
  } catch (err) {
    console.error("Error updating user:", err);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await db.query.UserTable.findFirst({
      columns: { id: true },
      where: eq(UserTable.id, params.id),
    });
    if (!user) {
      return NextResponse.json({ error: "Invalid user" }, { status: 404 });
    }

    await deleteUser(user.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
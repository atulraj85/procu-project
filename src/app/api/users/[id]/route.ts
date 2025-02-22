import { deleteUser } from "@/data/user";
import { UserTable } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { UpdateUserSchema } from "@/schemas";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const validation = UpdateUserSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }

  try {
    const user = await db.query.UserTable.findFirst({
      columns: { id: true },
      where: eq(UserTable.id, params.id),
    });
    if (!user) {
      return NextResponse.json({ error: "Invalid user" }, { status: 404 });
    }
    const {  role } = validation.data;
    const results = await db
      .update(UserTable)
      .set({
        role,
        updatedAt: new Date(),
      })
      .where(eq(UserTable.id, user.id))
      .returning();
    const updatedUser = results[0] || null;
    return NextResponse.json({ updatedUser });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
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
      return NextResponse.json({ error: "Inavlid user" }, { status: 404 });
    }

    await deleteUser(user.id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}


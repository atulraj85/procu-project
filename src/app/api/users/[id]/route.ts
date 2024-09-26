import { deleteUser, findUserById } from "@/data/user";
import { UserTable } from "@/drizzle/schema";
import { drizzleDB } from "@/lib/db";
import { UpdateUserSchema } from "@/schemas";
import bcrypt from "bcryptjs";
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
    const user = await findUserById(params.id);
    if (!user) {
      return NextResponse.json({ error: "Invalid user" }, { status: 404 });
    }

    const { name, email, password, role } = validation.data;
    const hashedPassword = await bcrypt.hash(password, 10);
    const results = await drizzleDB
      .update(UserTable)
      .set({
        email,
        password: hashedPassword,
        name,
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
    const user = await findUserById(params.id);
    if (!user) {
      return NextResponse.json({ error: "Inavlid user" }, { status: 404 });
    }

    await deleteUser(user.id);

    return NextResponse.json({});
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}

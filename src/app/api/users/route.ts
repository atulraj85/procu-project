// src/app/api/users/route.ts

import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// Import the Role enum if needed
// GET: Retrieve all users
export async function GET() {
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json({ response: { data: users } });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST: Create a new user
export async function POST(request: Request) {
  const { email, password, name, role } = await request.json();

  try {
    const newUser = await prisma.user.create({
      data: {
        email,
        password, // Make sure to hash the password before saving it
        name,
        role: role || Role.VENDOR, // Default to VENDOR if no role is provided
      },
    });
    return NextResponse.json({ response: { data: newUser } }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

// PUT: Update an existing user
export async function PUT(request: Request) {
  const { id, email, password, name, role } = await request.json();

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        email,
        password, // Make sure to hash the password before saving it
        name,
        role,
      },
    });
    return NextResponse.json({ response: { data: updatedUser } });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a user
export async function DELETE(request: Request) {
  const { id } = await request.json();

  try {
    await prisma.user.delete({
      where: { id },
    });
    return NextResponse.json({
      response: { message: "User deleted successfully" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}

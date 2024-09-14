// src/app/api/users/route.ts

import { NextResponse } from "next/server";
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
  const { email, password, name, role, company } = await request.json();

  try {
    // Check if the company exists
    const existingCompany = await prisma.company.findFirst({
      where: { name: company },
    });

    if (!existingCompany) {
      return NextResponse.json(
        { error: "Company does not exist" },
        { status: 404 }
      );
    }

    // Create a new user
    const companyId = existingCompany.id;

    const newUser = await prisma.user.create({
      data: {
        email,
        password, // Make sure to hash the password before saving it
        name,
        companyId: companyId,
        role: role, // Default to VENDOR if no role is provided
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    return NextResponse.json(
      { response: { data: "newUser" } },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: `Failed to create user, Error: ${error.message}`,
      },
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

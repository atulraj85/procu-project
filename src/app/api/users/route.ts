// src/app/api/users/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializePrismaModel } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const whereClause: Record<string, any> = {};
    let orderByClause: Record<string, "asc" | "desc"> | undefined = undefined;
    const validAttributes = [...userModel.attributes, "orderBy"];

    console.log("Received search params:", Object.fromEntries(searchParams));

    searchParams.forEach((value, key) => {
      console.log(`Processing parameter: ${key} = ${value}`);
      if (validAttributes.includes(key)) {
        if (key === "orderBy") {
          const parts = value.split(",");
          let orderByField: string = userModel.attributes[0]; // Default to first attribute
          let orderByDirection: "asc" | "desc" = "asc"; // Default to ascending

          if (parts.length === 2) {
            orderByField = parts[0];
            orderByDirection =
              parts[1].toLowerCase() === "desc" ? "desc" : "asc";
          } else if (parts.length === 1) {
            orderByDirection =
              parts[0].toLowerCase() === "desc" ? "desc" : "asc";
          }

          console.log(
            `OrderBy field: ${orderByField}, direction: ${orderByDirection}`
          );

          if (userModel.attributes.includes(orderByField)) {
            orderByClause = {
              [orderByField]: orderByDirection,
            };
            console.log(`Set orderByClause:`, orderByClause);
          } else {
            console.log(`Invalid orderBy field: ${orderByField}`);
          }
        } else if (key === "id") {
          const ids = value.split(",").map((id) => id);
          whereClause.id = ids.length > 1 ? { in: ids } : ids[0];
        } else if (key === "state_id") {
          const stateIds = value.split(",").map((id) => parseInt(id, 10));
          whereClause.state_id =
            stateIds.length > 1 ? { in: stateIds } : stateIds[0];
        } else {
          whereClause[key] = value;
        }
      } else {
        console.log(`Ignoring invalid parameter: ${key}`);
      }
    });

    const records = await prisma.user.findMany({
      where: whereClause,
      orderBy: orderByClause,
      
    });

    // const formattedData = formatRFPData(records);
    // console.log("formattedData", formattedData);

    console.log(`Found ${records.length} records`);

    if (Object.keys(whereClause).length > 0 && records.length === 0) {
      return NextResponse.json(
        { error: `No records found matching the criteria` },
        { status: 404 }
      );
    }

    return NextResponse.json(serializePrismaModel(records));
  } catch (error: unknown) {
    console.error("Detailed error:", error);
    return NextResponse.json(
      { error: "Error fetching records", details: (error as Error).message },
      { status: 500 }
    );
  }
}

const userModel = {
  model: prisma.user,
  attributes: [
    "id",
    "email",
    "password",
    "name",
    "mobile",
    "role",
    "companyId",
    "created_at",
    "updated_at",
  ],
};
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

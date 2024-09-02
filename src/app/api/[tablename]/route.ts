import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { modelMap } from "@/lib/prisma";

// Mapping of table names to Prisma model methods

export function serializePrismaModel<T>(model: T): T {
  return JSON.parse(
    JSON.stringify(model, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

//new GET
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const tableName = request.nextUrl.pathname.split("/").pop();
    if (!tableName || !modelMap[tableName]) {
      return NextResponse.json(
        { error: "Invalid table name" },
        { status: 400 }
      );
    }

    const whereClause: Record<string, any> = {};
    const orderByClause: Record<string, "asc" | "desc"> = {};
    const validAttributes = modelMap[tableName].attributes;

    searchParams.forEach((value, key) => {
      if (validAttributes.includes(key)) {
        if (key === "orderBy") {
          const [orderByField, orderByDirection] = value.split(",");
          if (validAttributes.includes(orderByField)) {
            orderByClause[orderByField] =
              orderByDirection === "asc" ? "asc" : "desc";
          }
        } else if (key === "id") {
          const ids = value.split(",").map((id) => parseInt(id, 10));
          whereClause.id = ids.length > 1 ? { in: ids } : ids[0];
        } else if (key === "state_id") {
          const stateIds = value.split(",").map((id) => parseInt(id, 10));
          whereClause.state_id =
            stateIds.length > 1 ? { in: stateIds } : stateIds[0];
        } else {
          whereClause[key] = value;
        }
      }
    });

    // console.log("Where clause:", whereClause);

    const records = await modelMap[tableName].model.findMany({
      // where: whereClause,
      // orderBy: orderByClause,
    });

    if (Object.keys(whereClause).length > 0 && records.length === 0) {
      return NextResponse.json(
        { error: `No ${tableName} found matching the criteria` },
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

export async function POST(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const tableName = pathname.split("/").pop(); // Get the last part of the URL as tableName

    if (!tableName || !modelMap[tableName]) {
      return NextResponse.json(
        { error: "Invalid table name" },
        { status: 400 }
      );
    }

    // Parse the JSON body
    const data = await request.json();

    // Validate incoming data against the model's attributes
    const validAttributes = modelMap[tableName].attributes;
    const invalidKeys = Object.keys(data).filter(
      (key) => !validAttributes.includes(key)
    );
    if (invalidKeys.length > 0) {
      return NextResponse.json(
        { error: `Invalid attributes in data: ${invalidKeys.join(", ")}` },
        { status: 400 }
      );
    }

    // If you need to handle file uploads, you can do it here
    // For example, if you have a field for a logo URL
    if (data.logo) {
      const filePath = path.join("public", "assets", data.logo.name);
      const fileBuffer = Buffer.from(await data.logo.arrayBuffer());
      await fs.promises.writeFile(filePath, fileBuffer);
      data.logo_url = `/assets/${data.logo.name}`;
      delete data.logo; // Remove the logo field from data if it's not needed in the database
    }

    const createdRecord = await modelMap[tableName].model.create({
      data,
    });

    return NextResponse.json(serializePrismaModel(createdRecord), {
      status: 201, // Use 201 for resource creation
    });
  } catch (error: any) {
    console.error("Detailed error:", error);
    return NextResponse.json(
      { error: "Error creating record", details: error.message },
      { status: 500 }
    );
  }
}

// PUT function to update an existing record
export async function PUT(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const tableName = pathname.split("/").pop(); // Get the last part of the URL as tableName
    const id = request.nextUrl.searchParams.get("id");

    if (!tableName || !modelMap[tableName]) {
      return NextResponse.json(
        { error: "Invalid table name" },
        { status: 400 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { error: "ID is required for updating a record" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const data: { [key: string]: any } = Object.fromEntries(formData);
    const files: { [key: string]: File } = {};

    for (const [key, value] of Object.entries(data)) {
      if (value instanceof File) {
        files[key] = value;
        delete data[key];
      }
    }

    // Validate incoming data against the model's attributes
    const validAttributes = modelMap[tableName].attributes;
    const invalidKeys = Object.keys(data).filter(
      (key) => !validAttributes.includes(key)
    );
    if (invalidKeys.length > 0) {
      return NextResponse.json(
        { error: `Invalid attributes in data: ${invalidKeys.join(", ")}` },
        { status: 400 }
      );
    }

    // Save files to the public/assets/ directory
    for (const [key, file] of Object.entries(files)) {
      const filePath = path.join("public", "assets", file.name);
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      await fs.promises.writeFile(filePath, fileBuffer);
      data.logo_url = `/assets/${file.name}`;
    }

    const updatedRecord = await modelMap[tableName].model.update({
      where: { id: BigInt(id) },
      data,
    });

    return NextResponse.json(serializePrismaModel(updatedRecord), {
      status: 200,
    });
  } catch (error: any) {
    console.error("Detailed error:", error);
    return NextResponse.json(
      { error: "Error updating record", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE function to delete a record
export async function DELETE(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const tableName = pathname.split("/").pop(); // Get the last part of the URL as tableName
    const id = request.nextUrl.searchParams.get("id");

    if (!tableName || !modelMap[tableName]) {
      return NextResponse.json(
        { error: "Invalid table name" },
        { status: 400 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { error: "ID is required for deleting a record" },
        { status: 400 }
      );
    }

    await modelMap[tableName].model.delete({
      where: { id: BigInt(id) },
    });

    return NextResponse.json(
      { message: `${tableName} deleted successfully` },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Detailed error:", error);
    return NextResponse.json(
      { error: "Error deleting record", details: error.message },
      { status: 500 }
    );
  }
}

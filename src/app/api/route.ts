// app/api/fields/route.ts
import { modelMap } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const fieldNamesAndAttributes = Object.entries(modelMap).map(
      ([key, { attributes }]) => ({
        fieldName: key,
        attributes: attributes,
      })
    );

    return NextResponse.json(fieldNamesAndAttributes);
  } catch (error) {
    console.error("Error fetching field names and attributes:", error);
    return NextResponse.json(
      { error: "Failed to fetch field names and attributes" },
      { status: 500 }
    );
  }
}

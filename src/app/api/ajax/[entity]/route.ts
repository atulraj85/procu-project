import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type SelectField = boolean | { select: Record<string, SelectField> };

type SearchConfig = {
  model: any;
  searchFields: string[];
  returnFields: Record<string, SelectField>;
};

const searchConfigs: Record<string, SearchConfig> = {
  users: {
    model: prisma.user,
    searchFields: ["name", "email"],
    returnFields: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
  vendors: {
    model: prisma.vendor,
    searchFields: [
      "primaryName",
      "companyName",
      "contactDisplayName",
      "email",
      "gstin",
    ],
    returnFields: {
      id: true,
      primaryName: true,
      companyName: true,
      contactDisplayName: true,
      email: true,
      mobile: true
    },
  },
  products: {
    model: prisma.product,
    searchFields: ["name", "modelNo", "specification"],
    returnFields: {
      id: true,
      name: true,
      modelNo: true,
      specification: true,
      productCategory: {
        select: {
          name: true,
        },
      },
    },
  },
};

export async function GET(
  request: NextRequest,
  { params }: { params: { entity: string } }
) {
  const entity = params.entity as keyof typeof searchConfigs;
  const config = searchConfigs[entity];

  if (!config) {
    return NextResponse.json({ error: "Invalid entity" }, { status: 400 });
  }

  // Extract the search term from the query parameters
  const searchTerm = request.nextUrl.searchParams.get("q");

  if (!searchTerm) {
    return NextResponse.json(
      { error: "Search term 'q' is required" },
      { status: 400 }
    );
  }

  // Construct the where clause for searching across multiple fields
  const whereClause = {
    OR: config.searchFields.map((field) => ({
      [field]: {
        contains: searchTerm,
        mode: "insensitive",
      },
    })),
  };

  try {
    const results = await config.model.findMany({
      where: whereClause,
      select: config.returnFields,
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error(`Error searching ${entity}:`, error);
    return NextResponse.json(
      { error: `An error occurred while searching ${entity}` },
      { status: 500 }
    );
  }
}

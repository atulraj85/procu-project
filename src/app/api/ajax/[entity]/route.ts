// app/api/search/[entity]/route.ts
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
    searchFields: ["primaryName", "companyName", "contactDisplayName", "email"],
    returnFields: {
      id: true,
      primaryName: true,
      companyName: true,
      contactDisplayName: true,
      email: true,
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

  // Extract query parameters
  const whereClause: Record<string, any> = {};
  for (const field of config.searchFields) {
    const value = request.nextUrl.searchParams.get(field);
    if (value) {
      whereClause[field] = { contains: value, mode: "insensitive" };
    }
  }

  // If no valid query parameters are provided, return an error
  if (Object.keys(whereClause).length === 0) {
    return NextResponse.json(
      { error: "At least one valid query parameter is required" },
      { status: 400 }
    );
  }

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

import { ProductTable, UserTable, VendorTable } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { ilike, or } from "drizzle-orm";
import { PgColumn } from "drizzle-orm/pg-core";
import { NextRequest, NextResponse } from "next/server";

type SearchConfig = {
  searchFields: PgColumn[];
  columns: Record<string, boolean>;
  with: any;
};

const searchConfigs: Record<string, SearchConfig> = {
  users: {
    searchFields: [UserTable.name, UserTable.email, UserTable.mobile],
    columns: {
      id: true,
      name: true,
      email: true,
      mobile: true,
      role: true,
    },
    with: undefined,
  },
  vendors: {
    searchFields: [
      VendorTable.primaryName,
      VendorTable.companyName,
      VendorTable.contactDisplayName,
      VendorTable.email,
      VendorTable.gstin,
    ],
    columns: {
      id: true,
      primaryName: true,
      companyName: true,
      contactDisplayName: true,
      email: true,
      mobile: true,
      gstin: true,
    },
    with: undefined,
  },
  products: {
    searchFields: [
      ProductTable.name,
      ProductTable.modelNo,
      ProductTable.specification,
    ],
    columns: {
      id: true,
      name: true,
      modelNo: true,
      specification: true,
    },
    with: {
      productCategory: {
        columns: {
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

  try {
    const model = getEntityModel(entity);
    const whereClause = or(
      ...config.searchFields.map((field) => ilike(field, `%${searchTerm}%`))
    );
    const results = await model.findMany({
      columns: config.columns,
      with: config.with,
      where: whereClause,
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

function getEntityModel(name: string) {
  switch (name) {
    case "users":
      return db.query.UserTable;
    case "vendors":
      return db.query.VendorTable;
    case "products":
      return db.query.ProductTable;
    default:
      throw new Error("Entity not supported!");
  }
}

import { saveAuditTrail } from "@/actions/audit-trail";
import {
  ApproversListTable,
  RFPProductTable,
  RFPTable,
  UserRole,
  UserTable,
} from "@/drizzle/schema";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { RequestBody, RFPStatus, serializePrismaModel } from "@/types";
import { generateRFPId } from "@/utils";
import { and, asc, desc, eq, InferSelectModel, or, SQL } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";



// Type Definitions
type SortBy = keyof InferSelectModel<typeof RFPTable>;
type SortDirection = "asc" | "desc";
type WhereField = keyof InferSelectModel<typeof RFPTable>;

const DEFAULT_SORTING_FIELD: SortBy = "id";
const DEFAULT_SORTING_DIRECTION: SortDirection = "desc";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get("userId");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = searchParams.get("order") || "desc";

    // Build where conditions
    const whereConditions: SQL<unknown>[] = [];
    if (userId) {
      whereConditions.push(eq(RFPTable.userId, userId));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const records = await db.query.RFPTable.findMany({
      where: whereClause,
      orderBy: order === "asc" ? [asc(RFPTable[sortBy])] : [desc(RFPTable[sortBy])],
      columns: {
        id: true,
        rfpId: true,
        requirementType: true,
        dateOfOrdering: true,
        deliveryByDate: true,
        rfpStatus: true,
        reason: true,
        createdAt: true,
        updatedAt: true,
      },
      with: {
        rfpProducts: {
          columns: { 
            id: true,
            description: true,
            quantity: true 
          },
        },
        quotations: {
          columns: { id: true }, // Just count quotations
        },
        user: {
          columns: {
            name: true,
            role: true,
          },
        },
      },
    });

    // Format for table display
    const tableData = records.map(rfp => ({
      id: rfp.id,
      rfpId: rfp.rfpId,
      requirementType: rfp.requirementType,
      status: rfp.rfpStatus,
      reason: rfp.reason,
      products: rfp.rfpProducts || [], // SEND FULL PRODUCTS ARRAY
      productCount: rfp.rfpProducts?.length || 0,
      quotationCount: rfp.quotations?.length || 0,
      createdDate: rfp.createdAt,
      deliveryDate: rfp.deliveryByDate,
      createdBy: rfp.user?.name,
      // Simple status indicators
      canAddQuotation: rfp.rfpStatus === "SUBMITTED",
      canCreatePO: rfp.quotations && rfp.quotations.length > 0,
    }));

    return NextResponse.json(tableData);
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching RFP summary", details: (error as Error).message },
      { status: 500 }
    );
  }
}

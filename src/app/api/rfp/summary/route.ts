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

const DEFAULT_SORTING_FIELD: SortBy = "createdAt";
const DEFAULT_SORTING_DIRECTION: SortDirection = "desc";

// Valid sortable columns to prevent errors
const VALID_SORT_COLUMNS: (keyof InferSelectModel<typeof RFPTable>)[] = [
  'id', 'rfpNumber', 'title', 'status', 'createdAt', 'updatedAt', 'deliveryDate'
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get("userId");
    const createdBy = searchParams.get("createdBy"); // Added this for user-specific RFPs
    const sortBy = searchParams.get("sortBy") || DEFAULT_SORTING_FIELD;
    const order = searchParams.get("order") || DEFAULT_SORTING_DIRECTION;

    // Validate sortBy column exists
    const validSortBy = VALID_SORT_COLUMNS.includes(sortBy as any) 
      ? (sortBy as keyof InferSelectModel<typeof RFPTable>)
      : DEFAULT_SORTING_FIELD;

    // Build where conditions
    const whereConditions: SQL<unknown>[] = [];
    
    // Filter by creator (the user who created the RFP)
    if (createdBy) {
      whereConditions.push(eq(RFPTable.createdBy, createdBy));
    }
    
    // Alternative: if you want to filter by userId for some other purpose
    if (userId && !createdBy) {
      whereConditions.push(eq(RFPTable.createdBy, userId));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Get current user for authorization (optional)
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log('Fetching RFPs with filters:', { createdBy, userId, sortBy: validSortBy, order });

    const records = await db.query.RFPTable.findMany({
      where: whereClause,
      orderBy: order === "asc" 
        ? [asc(RFPTable[validSortBy])] 
        : [desc(RFPTable[validSortBy])],
      columns: {
        id: true,
        rfpNumber: true, // Changed from rfpId to rfpNumber based on schema
        title: true,     // Added title
        description: true, // Added description if needed
        status: true,    // Changed from rfpStatus to status
        deliveryDate: true,
        estimatedBudget: true,
        createdBy: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true,
      },
      with: {
        // Make sure these relations exist in your schema
        createdBy: {  // This should match the relation name in your schema
          columns: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        quotations: {
          columns: { 
            id: true,
            status: true,
            totalAmount: true,
          },
        },
        // If you have RFP line items instead of products
        // lineItems: {
        //   columns: {
        //     id: true,
        //     description: true,
        //     quantity: true,
        //   },
        // },
      },
    });

    console.log('Found RFPs:', records.length);

    // Format for table display
    const tableData = records.map(rfp => ({
      id: rfp.id,
      rfpNumber: rfp.rfpNumber,
      title: rfp.title,
      description: rfp.description,
      status: rfp.status,
      estimatedBudget: rfp.estimatedBudget,
      deliveryDate: rfp.deliveryDate,
      createdAt: rfp.createdAt,
      updatedAt: rfp.updatedAt,
      createdBy: rfp.createdBy?.name || 'Unknown',
      createdByEmail: rfp.createdBy?.email,
      quotationCount: rfp.quotations?.length || 0,
      quotations: rfp.quotations || [],
      // Status-based actions
      canAddQuotation: rfp.status === "SENT_TO_VENDORS",
      canCreatePO: rfp.quotations && rfp.quotations.length > 0 && rfp.status === "VENDOR_SELECTED",
      canEdit: rfp.status === "DRAFT",
    }));

    return NextResponse.json({
      data: tableData,
      total: tableData.length,
      filters: { createdBy, userId },
      sorting: { sortBy: validSortBy, order }
    });

  } catch (error) {
    console.error("Error fetching RFP summary:", error);
    return NextResponse.json(
      { 
        error: "Error fetching RFP summary", 
        details: (error as Error).message,
        stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
      },
      { status: 500 }
    );
  }
}

// src/app/api/rfps/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { and, eq, or, desc, asc } from 'drizzle-orm';
import { RFPTable, UserTable, RFPApprovalTable } from '@/drizzle/schema';
import { db } from '@/lib/db';

// GET all RFPs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const organizationId = searchParams.get('organizationId');
    
    let query = db
      .select({
        id: RFPTable.id,
        rfpNumber: RFPTable.rfpNumber,
        title: RFPTable.title,
        description: RFPTable.description,
        lineItems: RFPTable.lineItems,
        deliveryLocation: RFPTable.deliveryLocation,
        deliveryDate: RFPTable.deliveryDate,
        estimatedBudget: RFPTable.estimatedBudget,
        status: RFPTable.status,
        quotationCutoffDate: RFPTable.quotationCutoffDate,
        createdAt: RFPTable.createdAt,
        updatedAt: RFPTable.updatedAt,
        createdBy: UserTable.name,
        createdByEmail: UserTable.email
      })
      .from(RFPTable)
      .leftJoin(UserTable, eq(RFPTable.createdBy, UserTable.id))
      .orderBy(desc(RFPTable.createdAt));
    
    // Apply filters
    const whereConditions = [];
    if (userId) {
      whereConditions.push(eq(RFPTable.createdBy, userId));
    }
    if (status) {
      whereConditions.push(eq(RFPTable.status, status));
    }
    if (organizationId) {
      whereConditions.push(eq(RFPTable.organizationId, organizationId));
    }
    
    if (whereConditions.length > 0) {
      query = query.where(and(...whereConditions));
    }
    
    const rfps = await query;
    
    return NextResponse.json(rfps);
  } catch (error) {
    console.error('Error fetching RFPs:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// POST create a new RFP
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title,
      description,
      lineItems,
      deliveryLocation,
      deliveryStates,
      deliveryDate,
      estimatedBudget,
      currency,
      createdBy,
      organizationId,
      quotationCutoffDate,
      questionTemplateId,
      questionAnswers,
      selectionCriteria
    } = body;

    // Validate required fields
    if (!title || !lineItems || !deliveryLocation || !deliveryDate || !createdBy || !organizationId || !quotationCutoffDate) {
      return NextResponse.json(
        { message: 'Title, line items, delivery location, delivery date, created by, organization ID, and quotation cutoff date are required' }, 
        { status: 400 }
      );
    }

    // Validate line items structure
    if (!Array.isArray(lineItems) || lineItems.length === 0) {
      return NextResponse.json(
        { message: 'Line items must be a non-empty array' }, 
        { status: 400 }
      );
    }

    // Validate each line item
    for (const item of lineItems) {
      if (!item.productName || !item.quantity || item.quantity < 1) {
        return NextResponse.json(
          { message: 'Each line item must have a product name and quantity >= 1' }, 
          { status: 400 }
        );
      }
    }

    // Verify user exists and get their role
    const userCheck = await db
      .select({ role: UserTable.role, organizationId: UserTable.organizationId })
      .from(UserTable)
      .where(eq(UserTable.id, createdBy))
      .limit(1);

    if (userCheck.length === 0) {
      return NextResponse.json(
        { message: 'User not found' }, 
        { status: 404 }
      );
    }

    const userRole = userCheck[0].role;
    const userOrgId = userCheck[0].organizationId;

    // Verify organization access
    if (userOrgId !== organizationId) {
      return NextResponse.json(
        { message: 'User does not belong to this organization' }, 
        { status: 403 }
      );
    }

    // Generate RFP number
    const rfpCount = await db
      .select({ count: RFPTable.id })
      .from(RFPTable)
      .where(eq(RFPTable.organizationId, organizationId));
    
    const rfpNumber = `RFP-${new Date().getFullYear()}-${String(rfpCount.length + 1).padStart(4, '0')}`;

    // Create RFP in transaction
    const result = await db.transaction(async (tx) => {
      // Create the RFP
      const [newRFP] = await tx
        .insert(RFPTable)
        .values({
          rfpNumber,
          title,
          description: description || null,
          lineItems,
          deliveryLocation,
          deliveryStates: deliveryStates || [],
          deliveryDate: new Date(deliveryDate),
          estimatedBudget: estimatedBudget || null,
          currency: currency || 'INR',
          status: userRole === 'USER' ? 'DRAFT' : 'PENDING_APPROVAL',
          createdBy,
          organizationId,
          quotationCutoffDate: new Date(quotationCutoffDate),
          questionTemplateId: questionTemplateId || null,
          questionAnswers: questionAnswers || null,
          selectionCriteria: selectionCriteria || null,
          updatedAt: new Date()
        })
        .returning();

      // If user is regular USER, create approval workflow
      if (userRole === 'USER') {
        // Get default approvers (PROCUREMENT_MANAGER and FINANCE_TEAM)
        const approvers = await tx
          .select({ id: UserTable.id, role: UserTable.role })
          .from(UserTable)
          .where(
            and(
              eq(UserTable.organizationId, organizationId),
              or(
                eq(UserTable.role, 'PROCUREMENT_MANAGER'),
                eq(UserTable.role, 'FINANCE_TEAM')
              )
            )
          );

        // Create approval records
        if (approvers.length > 0) {
          const approvalValues = approvers.map((approver, index) => ({
            rfpId: newRFP.id,
            approverId: approver.id,
            stage: approver.role === 'PROCUREMENT_MANAGER' ? 'PROCUREMENT_MANAGER' : 'FINANCE_MANAGER',
            sequence: index + 1,
            updatedAt: new Date()
          }));
          
          await tx.insert(RFPApprovalTable).values(approvalValues);
        }
      }

      return newRFP;
    });

    return NextResponse.json({
      data: result,
      message: userRole === 'USER' 
        ? 'RFP request submitted successfully and sent for approval' 
        : 'RFP created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating RFP:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// src/app/api/rfp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { and, eq, or, desc, asc } from 'drizzle-orm';
import { RFPTable, UserTable, RFPApprovalTable } from '@/drizzle/schema';
import { db } from '@/lib/db';

// Define the exact enum types to match your schema
type RFPStatus = 
  | "DRAFT" 
  | "PENDING_APPROVAL" 
  | "APPROVED" 
  | "REJECTED" 
  | "SENT_TO_VENDORS" 
  | "QUOTATION_RECEIVED" 
  | "VENDOR_SELECTED" 
  | "PO_GENERATED" 
  | "DELIVERED" 
  | "COMPLETED" 
  | "CANCELLED";

type ApprovalStage = 
  | "PROCUREMENT_LEAD"
  | "PROCUREMENT_MANAGER"
  | "FINANCE_EXECUTIVE"
  | "FINANCE_MANAGER";

// GET all RFPs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status') as RFPStatus | null;
    const organizationId = searchParams.get('organizationId');
    
    let query = db
      .select({
        id: RFPTable.id,
        rfpNumber: RFPTable.rfpNumber,
        title: RFPTable.title,
        description: RFPTable.description,
        lineItems: RFPTable.lineItems,
        deliveryLocation: RFPTable.deliveryLocation,
        deliveryStates: RFPTable.deliveryStates,
        deliveryDate: RFPTable.deliveryDate,
        estimatedBudget: RFPTable.estimatedBudget,
        currency: RFPTable.currency,
        status: RFPTable.status,
        quotationCutoffDate: RFPTable.quotationCutoffDate,
        questionAnswers: RFPTable.questionAnswers,
        selectionCriteria: RFPTable.selectionCriteria,
        rejectionReason: RFPTable.rejectionReason,
        createdAt: RFPTable.createdAt,
        updatedAt: RFPTable.updatedAt,
        createdBy: UserTable.name,
        createdByEmail: UserTable.email,
        createdById: RFPTable.createdBy
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
      // Cast status to the correct enum type
      whereConditions.push(eq(RFPTable.status, status));
    }
    if (organizationId) {
      whereConditions.push(eq(RFPTable.organizationId, organizationId));
    }
    
    if (whereConditions.length > 0) {
      query = query.where(and(...whereConditions)) as typeof query;
    }
    
    const rfps = await query;
    
    // Format response to include computed fields
    const formattedRfps = rfps.map(rfp => ({
      ...rfp,
      lineItemsCount: Array.isArray(rfp.lineItems) ? rfp.lineItems.length : 0,
      // Status-based action flags
      canEdit: rfp.status === "DRAFT",
      canApprove: rfp.status === "DRAFT" || rfp.status === "PENDING_APPROVAL",
      canSendToVendors: rfp.status === "APPROVED",
    }));
    
    return NextResponse.json(formattedRfps);
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

    console.log('Creating RFP with data:', body);

    // Validate only essential required fields
    if (!deliveryLocation || !deliveryDate || !createdBy || !organizationId) {
      return NextResponse.json(
        { message: 'Delivery location, delivery date, created by, and organization ID are required' }, 
        { status: 400 }
      );
    }

    // Validate questionAnswers structure if provided
    if (questionAnswers) {
      const requiredQuestionFields = [
        'usage_type', 'request_type', 'required_date', 'client_related', 
        'request_reason', 'quantity_needed', 'specific_request'
      ];
      
      const missingFields = requiredQuestionFields.filter(field => 
        !questionAnswers[field] || questionAnswers[field].toString().trim() === ''
      );
      
      if (missingFields.length > 0) {
        return NextResponse.json(
          { message: `Missing required question answers: ${missingFields.join(', ')}` }, 
          { status: 400 }
        );
      }
    }

    // Validate line items if provided
    if (lineItems && !Array.isArray(lineItems)) {
      return NextResponse.json(
        { message: 'Line items must be an array' }, 
        { status: 400 }
      );
    }

    if (lineItems && lineItems.length > 0) {
      for (const item of lineItems) {
        if (!item.productName || !item.quantity || item.quantity < 1) {
          return NextResponse.json(
            { message: 'Each line item must have a product name and quantity >= 1' }, 
            { status: 400 }
          );
        }
      }
    }

    // Verify user exists and get their role
    const userCheck = await db
      .select({ 
        role: UserTable.role, 
        organizationId: UserTable.organizationId,
        name: UserTable.name,
        email: UserTable.email
      })
      .from(UserTable)
      .where(eq(UserTable.id, createdBy))
      .limit(1);

    if (userCheck.length === 0) {
      return NextResponse.json(
        { message: 'User not found' }, 
        { status: 404 }
      );
    }

    const user = userCheck[0];

    // Verify organization access
    if (user.organizationId !== organizationId) {
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

    // Determine initial status based on user role - use explicit enum values
    let initialStatus: RFPStatus = "DRAFT";
    if (user.role === 'USER') {
      // If user provides basic info, it goes to pending approval
      initialStatus = questionAnswers ? "PENDING_APPROVAL" : "DRAFT";
    } else if (['PROCUREMENT_LEAD', 'PROCUREMENT_MANAGER'].includes(user.role)) {
      // Managers can create more complete RFPs
      initialStatus = "DRAFT";
    }

    // Auto-generate title if not provided
    const autoTitle = title || `${questionAnswers?.request_type || 'Hardware'} Request - ${questionAnswers?.specific_request || 'Equipment'}`;

    // Set default quotation cutoff date if not provided (30 days from now)
    const defaultCutoffDate = quotationCutoffDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Create RFP in transaction
    const result = await db.transaction(async (tx) => {
      // Create the RFP
      const [newRFP] = await tx
        .insert(RFPTable)
        .values({
          rfpNumber,
          title: autoTitle,
          description: description || null,
          lineItems: lineItems || [],
          deliveryLocation,
          deliveryStates: deliveryStates || [],
          deliveryDate: new Date(deliveryDate),
          estimatedBudget: estimatedBudget || null,
          currency: currency || 'INR',
          status: initialStatus, // Now properly typed
          createdBy,
          organizationId,
          quotationCutoffDate: new Date(defaultCutoffDate),
          questionTemplateId: questionTemplateId || null,
          questionAnswers: questionAnswers || {},
          selectionCriteria: selectionCriteria || null,
          updatedAt: new Date()
        })
        .returning();

      // Create approval workflow for USER role
      if (user.role === 'USER' && initialStatus === "PENDING_APPROVAL") {
        // Get approvers from the organization
        const approvers = await tx
          .select({ id: UserTable.id, role: UserTable.role })
          .from(UserTable)
          .where(
            and(
              eq(UserTable.organizationId, organizationId),
              or(
                eq(UserTable.role, 'PROCUREMENT_LEAD'),
                eq(UserTable.role, 'PROCUREMENT_MANAGER'),
                eq(UserTable.role, 'FINANCE_EXECUTIVE'),
                eq(UserTable.role, 'FINANCE_MANAGER')
              )
            )
          );

        // Create approval workflow with proper enum types
        if (approvers.length > 0) {
          const approvalValues: {
            rfpId: string;
            approverId: string;
            stage: ApprovalStage;
            sequence: number;
            updatedAt: Date;
          }[] = [];
          
          let sequence = 1;

          // Add PROCUREMENT_LEAD first
          const procurementLead = approvers.find(a => a.role === 'PROCUREMENT_LEAD');
          if (procurementLead) {
            approvalValues.push({
              rfpId: newRFP.id,
              approverId: procurementLead.id,
              stage: "PROCUREMENT_LEAD" as ApprovalStage,
              sequence: sequence++,
              updatedAt: new Date()
            });
          }

          // Add PROCUREMENT_MANAGER
          const procurementManager = approvers.find(a => a.role === 'PROCUREMENT_MANAGER');
          if (procurementManager) {
            approvalValues.push({
              rfpId: newRFP.id,
              approverId: procurementManager.id,
              stage: "PROCUREMENT_MANAGER" as ApprovalStage,
              sequence: sequence++,
              updatedAt: new Date()
            });
          }

          // Add financial approvers
          const financeExecutive = approvers.find(a => a.role === 'FINANCE_EXECUTIVE');
          if (financeExecutive) {
            approvalValues.push({
              rfpId: newRFP.id,
              approverId: financeExecutive.id,
              stage: "FINANCE_EXECUTIVE" as ApprovalStage,
              sequence: sequence++,
              updatedAt: new Date()
            });
          }

          const financeManager = approvers.find(a => a.role === 'FINANCE_MANAGER');
          if (financeManager) {
            approvalValues.push({
              rfpId: newRFP.id,
              approverId: financeManager.id,
              stage: "FINANCE_MANAGER" as ApprovalStage,
              sequence: sequence++,
              updatedAt: new Date()
            });
          }
          
          if (approvalValues.length > 0) {
            await tx.insert(RFPApprovalTable).values(approvalValues);
          }
        }
      }

      return newRFP;
    });

    // Return success response
    const responseMessage = user.role === 'USER' && initialStatus === "PENDING_APPROVAL"
      ? 'RFP request submitted successfully and sent for approval'
      : 'RFP created successfully';

    return NextResponse.json({
      data: {
        ...result,
        lineItemsCount: Array.isArray(lineItems) ? lineItems.length : 0,
        createdByName: user.name,
        createdByEmail: user.email,
        canEdit: result.status === 'DRAFT',
        canApprove: result.status === 'PENDING_APPROVAL'
      },
      message: responseMessage
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating RFP:', error);
    return NextResponse.json(
      { 
        message: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, 
      { status: 500 }
    );
  }
}


// Add this PUT method to your existing route.ts file

// PUT update an existing RFP
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      id, // RFP ID to update
      title,
      description,
      lineItems,
      deliveryLocation,
      deliveryStates,
      deliveryDate,
      estimatedBudget,
      currency,
      quotationCutoffDate,
      questionAnswers,
      selectionCriteria,
      status, // For status updates (approval/rejection)
      rejectionReason,
      updatedBy, // Who is making the update
      approvalAction, // 'approve', 'reject', or null for general updates
      approvalComments
    } = body;

    console.log('Updating RFP with data:', body);

    // Validate required fields
    if (!id || !updatedBy) {
      return NextResponse.json(
        { message: 'RFP ID and updated by user ID are required' }, 
        { status: 400 }
      );
    }

    // Get current RFP and verify permissions
    const currentRFP = await db
      .select({
        id: RFPTable.id,
        status: RFPTable.status,
        createdBy: RFPTable.createdBy,
        organizationId: RFPTable.organizationId,
        rfpNumber: RFPTable.rfpNumber
      })
      .from(RFPTable)
      .where(eq(RFPTable.id, id))
      .limit(1);

    if (currentRFP.length === 0) {
      return NextResponse.json(
        { message: 'RFP not found' }, 
        { status: 404 }
      );
    }

    const rfp = currentRFP[0];

    // Get user making the update
    const userCheck = await db
      .select({ 
        role: UserTable.role, 
        organizationId: UserTable.organizationId,
        name: UserTable.name,
        email: UserTable.email
      })
      .from(UserTable)
      .where(eq(UserTable.id, updatedBy))
      .limit(1);

    if (userCheck.length === 0) {
      return NextResponse.json(
        { message: 'User not found' }, 
        { status: 404 }
      );
    }

    const user = userCheck[0];

    // Verify organization access
    if (user.organizationId !== rfp.organizationId) {
      return NextResponse.json(
        { message: 'User does not belong to this organization' }, 
        { status: 403 }
      );
    }

    // Check permissions based on role and current status
    const canEdit = (
      (user.role === 'USER' && rfp.createdBy === updatedBy && rfp.status === 'DRAFT') ||
      (user.role === 'PROCUREMENT_LEAD' && ['DRAFT', 'PENDING_APPROVAL'].includes(rfp.status)) ||
      (user.role === 'PROCUREMENT_MANAGER' && ['APPROVED', 'SENT_TO_VENDORS'].includes(rfp.status)) ||
      (['FINANCE_EXECUTIVE', 'FINANCE_MANAGER'].includes(user.role) && ['VENDOR_SELECTED'].includes(rfp.status))
    );

    if (!canEdit) {
      return NextResponse.json(
        { message: 'You do not have permission to update this RFP in its current status' }, 
        { status: 403 }
      );
    }

    // Handle approval/rejection actions
    if (approvalAction) {
      return await handleApprovalAction(
        id, 
        updatedBy, 
        user.role, 
        approvalAction, 
        approvalComments, 
        rejectionReason
      );
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    };

    // Only update fields that are provided
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (lineItems !== undefined) updateData.lineItems = lineItems;
    if (deliveryLocation !== undefined) updateData.deliveryLocation = deliveryLocation;
    if (deliveryStates !== undefined) updateData.deliveryStates = deliveryStates;
    if (deliveryDate !== undefined) updateData.deliveryDate = new Date(deliveryDate);
    if (estimatedBudget !== undefined) updateData.estimatedBudget = estimatedBudget;
    if (currency !== undefined) updateData.currency = currency;
    if (quotationCutoffDate !== undefined) updateData.quotationCutoffDate = new Date(quotationCutoffDate);
    if (questionAnswers !== undefined) updateData.questionAnswers = questionAnswers;
    if (selectionCriteria !== undefined) updateData.selectionCriteria = selectionCriteria;
    if (status !== undefined) updateData.status = status as RFPStatus;
    if (rejectionReason !== undefined) updateData.rejectionReason = rejectionReason;

    // Update the RFP
    const [updatedRFP] = await db
      .update(RFPTable)
      .set(updateData)
      .where(eq(RFPTable.id, id))
      .returning();

    return NextResponse.json({
      data: {
        ...updatedRFP,
        lineItemsCount: Array.isArray(updatedRFP.lineItems) ? updatedRFP.lineItems.length : 0,
        canEdit: canEdit,
        updatedByName: user.name
      },
      message: 'RFP updated successfully'
    });

  } catch (error) {
    console.error('Error updating RFP:', error);
    return NextResponse.json(
      { 
        message: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, 
      { status: 500 }
    );
  }
}

// Helper function to handle approval actions
async function handleApprovalAction(
  rfpId: string,
  approverId: string,
  approverRole: string,
  action: 'approve' | 'reject',
  comments?: string,
  rejectionReason?: string
) {
  return await db.transaction(async (tx) => {
    // Get current approval record
    const currentApproval = await tx
      .select()
      .from(RFPApprovalTable)
      .where(
        and(
          eq(RFPApprovalTable.rfpId, rfpId),
          eq(RFPApprovalTable.approverId, approverId)
        )
      )
      .limit(1);

    if (currentApproval.length === 0) {
      throw new Error('Approval record not found for this user');
    }

    const approval = currentApproval[0];

    if (action === 'reject') {
      // Update approval record as rejected
      await tx
        .update(RFPApprovalTable)
        .set({
          approved: false,
          approvedAt: new Date(),
          comments: comments || rejectionReason,
          updatedAt: new Date()
        })
        .where(eq(RFPApprovalTable.id, approval.id));

      // Update RFP status to rejected
      const [updatedRFP] = await tx
        .update(RFPTable)
        .set({
          status: "REJECTED" as RFPStatus,
          rejectionReason: rejectionReason || comments,
          updatedAt: new Date()
        })
        .where(eq(RFPTable.id, rfpId))
        .returning();

      return NextResponse.json({
        data: updatedRFP,
        message: 'RFP rejected successfully'
      });
    }

    if (action === 'approve') {
      // Update approval record as approved
      await tx
        .update(RFPApprovalTable)
        .set({
          approved: true,
          approvedAt: new Date(),
          comments: comments,
          updatedAt: new Date()
        })
        .where(eq(RFPApprovalTable.id, approval.id));

      // Check if this is the final approval
      const allApprovals = await tx
        .select()
        .from(RFPApprovalTable)
        .where(eq(RFPApprovalTable.rfpId, rfpId))
        .orderBy(asc(RFPApprovalTable.sequence));

      const currentSequence = approval.sequence;
      const nextApproval = allApprovals.find(a => a.sequence === currentSequence + 1);

      let newStatus: RFPStatus;
      if (!nextApproval) {
        // This is the final approval
        newStatus = "APPROVED";
      } else {
        // More approvals needed
        newStatus = "PENDING_APPROVAL";
      }

      // Update RFP status
      const [updatedRFP] = await tx
        .update(RFPTable)
        .set({
          status: newStatus,
          updatedAt: new Date()
        })
        .where(eq(RFPTable.id, rfpId))
        .returning();

      return NextResponse.json({
        data: updatedRFP,
        message: nextApproval 
          ? 'Approval recorded. RFP moved to next approval stage.'
          : 'RFP fully approved and ready for vendor selection.'
      });
    }
  });
}


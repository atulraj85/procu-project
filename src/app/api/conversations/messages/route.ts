// src/app/api/conversations/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { and, eq, desc, asc } from 'drizzle-orm';
import { 
  ConversationMessageTable, 
  RFPTable, 
  UserTable
} from '@/drizzle/schema';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// GET conversation messages - by RFP ID and thread
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rfpId = searchParams.get('rfpId');
    const threadId = searchParams.get('threadId');
    const messageId = searchParams.get('messageId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Validate required parameters
    if (!rfpId) {
      return NextResponse.json(
        { message: 'RFP ID is required' }, 
        { status: 400 }
      );
    }

    // Base query with joins for user and RFP information
    let query = db
      .select({
        id: ConversationMessageTable.id,
        rfpId: ConversationMessageTable.rfpId,
        threadId: ConversationMessageTable.threadId,
        senderId: ConversationMessageTable.senderId,
        senderType: ConversationMessageTable.senderType,
        senderName: UserTable.name,
        senderEmail: UserTable.email,
        messageType: ConversationMessageTable.messageType,
        content: ConversationMessageTable.content,
        attachments: ConversationMessageTable.attachments,
        parentMessageId: ConversationMessageTable.parentMessageId,
        createdAt: ConversationMessageTable.createdAt,
        // RFP details
        rfpTitle: RFPTable.title,
        rfpNumber: RFPTable.rfpNumber
      })
      .from(ConversationMessageTable)
      .leftJoin(UserTable, eq(ConversationMessageTable.senderId, UserTable.id))
      .leftJoin(RFPTable, eq(ConversationMessageTable.rfpId, RFPTable.id))
      .where(eq(ConversationMessageTable.rfpId, rfpId))
      .orderBy(asc(ConversationMessageTable.createdAt))
      .limit(limit)
      .offset(offset);

    // Apply additional filters
    const whereConditions = [eq(ConversationMessageTable.rfpId, rfpId)];
    
    if (threadId) {
      whereConditions.push(eq(ConversationMessageTable.threadId, threadId));
    }
    
    if (messageId) {
      whereConditions.push(eq(ConversationMessageTable.id, messageId));
    }
    
    if (whereConditions.length > 1) {
      query = query.where(and(...whereConditions));
    }
    
    const messages = await query;
    
    // If specific message ID requested, return single object
    if (messageId) {
      const message = messages[0];
      if (!message) {
        return NextResponse.json(
          { message: 'Message not found' }, 
          { status: 404 }
        );
      }
      return NextResponse.json(message);
    }
    
    // Group messages by thread if no specific thread requested
    const result = {
      messages,
      pagination: {
        limit,
        offset,
        total: messages.length,
        hasMore: messages.length === limit
      }
    };
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// POST create a new message in conversation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      rfpId,
      threadId,
      senderId,
      senderType,
      messageType,
      content,
      attachments,
      parentMessageId,
      isNewThread = false // Add this flag
    } = body;

    // Validate required fields
    if (!rfpId || !senderId || !senderType || !messageType) {
      return NextResponse.json(
        { message: 'RFP ID, sender ID, sender type, and message type are required' }, 
        { status: 400 }
      );
    }

    // Validate sender type
    const validSenderTypes = ['USER', 'VENDOR'];
    if (!validSenderTypes.includes(senderType)) {
      return NextResponse.json(
        { message: `Invalid sender type. Valid types: ${validSenderTypes.join(', ')}` }, 
        { status: 400 }
      );
    }

    // Validate message type
    const validMessageTypes = ['TEXT', 'ATTACHMENT', 'SYSTEM_MESSAGE'];
    if (!validMessageTypes.includes(messageType)) {
      return NextResponse.json(
        { message: `Invalid message type. Valid types: ${validMessageTypes.join(', ')}` }, 
        { status: 400 }
      );
    }

    // Validate content based on message type
    if (messageType === 'TEXT' && (!content || content.trim() === '')) {
      return NextResponse.json(
        { message: 'Content is required for text messages' }, 
        { status: 400 }
      );
    }

    if (messageType === 'ATTACHMENT' && (!attachments || !Array.isArray(attachments) || attachments.length === 0)) {
      return NextResponse.json(
        { message: 'Attachments are required for attachment messages' }, 
        { status: 400 }
      );
    }

    

    // Verify RFP exists
    const rfpCheck = await db
      .select({ 
        id: RFPTable.id,
        title: RFPTable.title,
        status: RFPTable.status 
      })
      .from(RFPTable)
      .where(eq(RFPTable.id, rfpId))
      .limit(1);

    if (rfpCheck.length === 0) {
      return NextResponse.json(
        { message: 'RFP not found' }, 
        { status: 404 }
      );
    }

    // Verify sender exists
    const senderCheck = await db
      .select({ 
        id: UserTable.id,
        name: UserTable.name,
        role: UserTable.role 
      })
      .from(UserTable)
      .where(eq(UserTable.id, senderId))
      .limit(1);

    if (senderCheck.length === 0) {
      return NextResponse.json(
        { message: 'Sender not found' }, 
        { status: 404 }
      );
    }

    // If parentMessageId provided, verify it exists
    if (parentMessageId) {
      const parentCheck = await db
        .select({ id: ConversationMessageTable.id })
        .from(ConversationMessageTable)
        .where(
          and(
            eq(ConversationMessageTable.id, parentMessageId),
            eq(ConversationMessageTable.rfpId, rfpId)
          )
        )
        .limit(1);

      if (parentCheck.length === 0) {
        return NextResponse.json(
          { message: 'Parent message not found in this RFP' }, 
          { status: 404 }
        );
      }
    }

    let finalThreadId = threadId;
    
    // If it's explicitly a new thread or no threadId provided and no parentMessageId
    if (isNewThread || (!threadId && !parentMessageId)) {
      finalThreadId = uuidv4();
      console.log('Creating new thread with ID:', finalThreadId);
    } else if (!threadId && parentMessageId) {
      // If replying to a message, get the thread ID from parent message
      const [parentMessage] = await db
        .select({ threadId: ConversationMessageTable.threadId })
        .from(ConversationMessageTable)
        .where(eq(ConversationMessageTable.id, parentMessageId))
        .limit(1);
      
      if (parentMessage) {
        finalThreadId = parentMessage.threadId;
      } else {
        return NextResponse.json(
          { message: 'Parent message not found' }, 
          { status: 404 }
        );
      }
    }
    // Create the message
    const [newMessage] = await db
      .insert(ConversationMessageTable)
      .values({
        rfpId,
        threadId: finalThreadId, // Use the properly determined thread ID
        senderId,
        senderType,
        messageType,
        content: content || null,
        attachments: attachments || null,
        parentMessageId: parentMessageId || null
      })
      .returning();

    // Fetch the complete message with sender details
    const [messageWithDetails] = await db
      .select({
        id: ConversationMessageTable.id,
        rfpId: ConversationMessageTable.rfpId,
        threadId: ConversationMessageTable.threadId,
        senderId: ConversationMessageTable.senderId,
        senderType: ConversationMessageTable.senderType,
        senderName: UserTable.name,
        senderEmail: UserTable.email,
        messageType: ConversationMessageTable.messageType,
        content: ConversationMessageTable.content,
        attachments: ConversationMessageTable.attachments,
        parentMessageId: ConversationMessageTable.parentMessageId,
        createdAt: ConversationMessageTable.createdAt,
        rfpTitle: RFPTable.title,
        rfpNumber: RFPTable.rfpNumber
      })
      .from(ConversationMessageTable)
      .leftJoin(UserTable, eq(ConversationMessageTable.senderId, UserTable.id))
      .leftJoin(RFPTable, eq(ConversationMessageTable.rfpId, RFPTable.id))
      .where(eq(ConversationMessageTable.id, newMessage.id));

    return NextResponse.json({
      data: messageWithDetails,
      message: 'Message sent successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating conversation message:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// src/app/api/conversations/[messageId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { 
  ConversationMessageTable, 
  UserTable,
  RFPTable 
} from '@/drizzle/schema';
import { db } from '@/lib/db';

// GET single message by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const messageId = params.messageId;

    const [message] = await db
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
      .where(eq(ConversationMessageTable.id, messageId));

    if (!message) {
      return NextResponse.json(
        { message: 'Message not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(message);

  } catch (error) {
    console.error('Error fetching message:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// PUT update message (for editing)
export async function PUT(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const messageId = params.messageId;
    const body = await request.json();
    const { content, attachments } = body;

    // Check if message exists and get current data
    const [existingMessage] = await db
      .select({
        id: ConversationMessageTable.id,
        senderId: ConversationMessageTable.senderId,
        messageType: ConversationMessageTable.messageType,
        createdAt: ConversationMessageTable.createdAt,
        content: ConversationMessageTable.content
      })
      .from(ConversationMessageTable)
      .where(eq(ConversationMessageTable.id, messageId));

    if (!existingMessage) {
      return NextResponse.json(
        { message: 'Message not found' }, 
        { status: 404 }
      );
    }

    // Only allow editing within 24 hours and only text messages
    const hoursSinceCreation = (Date.now() - new Date(existingMessage.createdAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreation > 24) {
      return NextResponse.json(
        { message: 'Messages can only be edited within 24 hours' }, 
        { status: 403 }
      );
    }

    if (existingMessage.messageType !== 'TEXT') {
      return NextResponse.json(
        { message: 'Only text messages can be edited' }, 
        { status: 403 }
      );
    }

    // Update the message
    await db
      .update(ConversationMessageTable)
      .set({
        content: content || existingMessage.content,
        attachments: attachments || null
      })
      .where(eq(ConversationMessageTable.id, messageId));

    // Fetch updated message with details
    const [messageWithDetails] = await db
      .select({
        id: ConversationMessageTable.id,
        rfpId: ConversationMessageTable.rfpId,
        threadId: ConversationMessageTable.threadId,
        senderId: ConversationMessageTable.senderId,
        senderType: ConversationMessageTable.senderType,
        senderName: UserTable.name,
        messageType: ConversationMessageTable.messageType,
        content: ConversationMessageTable.content,
        attachments: ConversationMessageTable.attachments,
        parentMessageId: ConversationMessageTable.parentMessageId,
        createdAt: ConversationMessageTable.createdAt
      })
      .from(ConversationMessageTable)
      .leftJoin(UserTable, eq(ConversationMessageTable.senderId, UserTable.id))
      .where(eq(ConversationMessageTable.id, messageId));

    return NextResponse.json({
      data: messageWithDetails,
      message: 'Message updated successfully'
    });

  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// DELETE message (soft delete by marking as deleted)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const messageId = params.messageId;

    // Check if message exists
    const [existingMessage] = await db
      .select({
        id: ConversationMessageTable.id,
        senderId: ConversationMessageTable.senderId,
        createdAt: ConversationMessageTable.createdAt
      })
      .from(ConversationMessageTable)
      .where(eq(ConversationMessageTable.id, messageId));

    if (!existingMessage) {
      return NextResponse.json(
        { message: 'Message not found' }, 
        { status: 404 }
      );
    }

    // Only allow deletion within 1 hour
    const hoursSinceCreation = (Date.now() - new Date(existingMessage.createdAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreation > 1) {
      return NextResponse.json(
        { message: 'Messages can only be deleted within 1 hour' }, 
        { status: 403 }
      );
    }

    // Update message to mark as deleted
    await db
      .update(ConversationMessageTable)
      .set({
        content: '[Message deleted]',
        messageType: 'SYSTEM_MESSAGE',
        attachments: null
      })
      .where(eq(ConversationMessageTable.id, messageId));

    return NextResponse.json({
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

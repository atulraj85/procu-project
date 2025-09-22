// src/app/api/conversations/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { and, eq, like, desc } from 'drizzle-orm';
import { 
  ConversationMessageTable, 
  RFPTable, 
  UserTable 
} from '@/drizzle/schema';
import { db } from '@/lib/db';

// GET search messages within conversations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rfpId = searchParams.get('rfpId');
    const query = searchParams.get('q');
    const senderType = searchParams.get('senderType');
    const messageType = searchParams.get('messageType');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    if (!rfpId || !query) {
      return NextResponse.json(
        { message: 'RFP ID and search query are required' }, 
        { status: 400 }
      );
    }

    // Build search conditions
    const whereConditions = [
      eq(ConversationMessageTable.rfpId, rfpId),
      like(ConversationMessageTable.content, `%${query}%`)
    ];

    if (senderType) {
      whereConditions.push(eq(ConversationMessageTable.senderType, senderType));
    }

    if (messageType) {
      whereConditions.push(eq(ConversationMessageTable.messageType, messageType));
    }

    const messages = await db
      .select({
        id: ConversationMessageTable.id,
        rfpId: ConversationMessageTable.rfpId,
        threadId: ConversationMessageTable.threadId,
        senderId: ConversationMessageTable.senderId,
        senderType: ConversationMessageTable.senderType,
        senderName: UserTable.name,
        messageType: ConversationMessageTable.messageType,
        content: ConversationMessageTable.content,
        createdAt: ConversationMessageTable.createdAt,
        rfpTitle: RFPTable.title
      })
      .from(ConversationMessageTable)
      .leftJoin(UserTable, eq(ConversationMessageTable.senderId, UserTable.id))
      .leftJoin(RFPTable, eq(ConversationMessageTable.rfpId, RFPTable.id))
      .where(and(...whereConditions))
      .orderBy(desc(ConversationMessageTable.createdAt))
      .limit(limit);

    return NextResponse.json({
      query,
      messages,
      total: messages.length
    });

  } catch (error) {
    console.error('Error searching messages:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

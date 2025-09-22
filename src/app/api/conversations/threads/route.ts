// // src/app/api/conversations/threads/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { eq, desc, sql } from 'drizzle-orm';
// import { 
//   ConversationMessageTable, 
//   RFPTable, 
//   UserTable 
// } from '@/drizzle/schema';
// import { db } from '@/lib/db';

// // GET conversation threads for an RFP
// // In your threads API (/api/conversations/threads/route.ts), update the query:
// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const rfpId = searchParams.get('rfpId');
    
//     if (!rfpId) {
//       return NextResponse.json(
//         { message: 'RFP ID is required' }, 
//         { status: 400 }
//       );
//     }

//     // Get threads with latest message info
//     const threadsQuery = sql`
//       WITH latest_messages AS (
//         SELECT DISTINCT ON (thread_id)
//           thread_id,
//           content as last_message_content,
//           message_type as last_message_type,
//           sender_type as last_sender_type,
//           sender_id,
//           created_at as last_message_at
//         FROM ${ConversationMessageTable}
//         WHERE rfp_id = ${rfpId}
//         ORDER BY thread_id, created_at DESC
//       ),
//       thread_counts AS (
//         SELECT 
//           thread_id,
//           COUNT(*) as message_count
//         FROM ${ConversationMessageTable}
//         WHERE rfp_id = ${rfpId}
//         GROUP BY thread_id
//       )
//       SELECT 
//         lm.thread_id,
//         lm.last_message_content,
//         lm.last_message_type,
//         lm.last_sender_type,
//         u.name as last_sender_name,
//         lm.last_message_at,
//         tc.message_count
//       FROM latest_messages lm
//       LEFT JOIN ${UserTable} u ON lm.sender_id = u.id
//       LEFT JOIN thread_counts tc ON lm.thread_id = tc.thread_id
//       ORDER BY lm.last_message_at DESC
//     `;

//     const threads = await db.execute(threadsQuery);
    
//     console.log('Found threads:', threads.rows);

//     return NextResponse.json({
//       rfpId,
//       threads: threads.rows,
//       totalThreads: threads.rows.length
//     });

//   } catch (error) {
//     console.error('Error fetching conversation threads:', error);
//     return NextResponse.json(
//       { message: 'Internal server error' }, 
//       { status: 500 }
//     );
//   }
// }


// src/app/api/conversations/threads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { eq, desc, sql } from 'drizzle-orm';
import {
  ConversationMessageTable,
  RFPTable,
  UserTable
} from '@/drizzle/schema';
import { db } from '@/lib/db';

// GET conversation threads for an RFP
// In your threads API (/api/conversations/threads/route.ts), update the query:
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rfpId = searchParams.get('rfpId');
        
    if (!rfpId) {
      return NextResponse.json(
        { message: 'RFP ID is required' },
         { status: 400 }
      );
    }

    // Get threads with latest message info and first message info
    const threadsQuery = sql`
      WITH latest_messages AS (
        SELECT DISTINCT ON (thread_id)
          thread_id,
          content as last_message_content,
          message_type as last_message_type,
          sender_type as last_sender_type,
          sender_id,
          created_at as last_message_at
        FROM ${ConversationMessageTable}
        WHERE rfp_id = ${rfpId}
        ORDER BY thread_id, created_at DESC
      ),
      first_messages AS (
        SELECT DISTINCT ON (thread_id)
          thread_id,
          content as first_message_content
        FROM ${ConversationMessageTable}
        WHERE rfp_id = ${rfpId}
        ORDER BY thread_id, created_at ASC
      ),
      thread_counts AS (
        SELECT 
          thread_id,
          COUNT(*) as message_count
        FROM ${ConversationMessageTable}
        WHERE rfp_id = ${rfpId}
        GROUP BY thread_id
      )
      SELECT 
        lm.thread_id,
        fm.first_message_content,
        lm.last_message_content,
        lm.last_message_type,
        lm.last_sender_type,
        u.name as last_sender_name,
        lm.last_message_at,
        tc.message_count
      FROM latest_messages lm
      LEFT JOIN first_messages fm ON lm.thread_id = fm.thread_id
      LEFT JOIN ${UserTable} u ON lm.sender_id = u.id
      LEFT JOIN thread_counts tc ON lm.thread_id = tc.thread_id
      ORDER BY lm.last_message_at DESC
    `;

    const threads = await db.execute(threadsQuery);
        
    console.log('Found threads:', threads.rows);
    
    return NextResponse.json({
      rfpId,
      threads: threads.rows,
      totalThreads: threads.rows.length
    });
  } catch (error) {
    console.error('Error fetching conversation threads:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
       { status: 500 }
    );
  }
}
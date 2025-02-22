import { AuditTrailTable } from "@/drizzle/schema";
import { db } from "@/lib/db";

interface AuditTrailInput {
  eventId: string;
  userId: string;
  details: Record<string, any>;
}

export async function createAuditTrail(data: AuditTrailInput) {
  try {
    // console.log(`Creating audit trail for eventId: ${data.eventId}`);
    const results = await db
      .insert(AuditTrailTable)
      .values({ ...data })
      .returning();
    return results[0] || null;
  } catch (error) {
    console.error(
      `Error creating audit trail for eventId: ${data.eventId}`,
      error
    );
    throw error;
  }
}

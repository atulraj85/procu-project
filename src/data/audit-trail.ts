import { AuditTrailTable } from "@/drizzle/schema";
import { db } from "@/lib/db";

interface AuditTrailInput {
  eventId: string;
  userId: string;
  details: Record<string, any>;
}

export async function createAuditTrail(data: AuditTrailInput) {
  try {
    const results = await db
      .insert(AuditTrailTable)
      .values({ ...data })
      .returning();
    return results[0] || null;
  } catch (err) {
    console.error("Error saving audit trail", err);
    throw err;
  }
}

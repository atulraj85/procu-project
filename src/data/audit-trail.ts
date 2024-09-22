import { db } from "@/lib/db";

interface AuditTrailInput {
  eventId: string;
  userId: string;
  details: Record<string, any>;
}

export async function createAuditTrail(data: AuditTrailInput) {
  try {
    const { eventId, details, userId } = data;
    return await db.auditTrail.create({
      data: {
        eventId,
        details,
        userId,
      },
    });
  } catch (err) {
    console.error("Error saving audit trail:", err);
    throw new Error("Could not save audit trail");
  }
}

export async function findAuditableEventByName(name: string) {
  try {
    return await db.auditableEvent.findUnique({
      where: { name },
    });
  } catch (err) {
    console.error(`Error finding event by name: ${name}`, err);
    throw new Error(`Failed to retrieve auditable event: ${err}`);
  }
}

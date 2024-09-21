import { db } from "@/lib/db";
import { User } from "@prisma/client";

/**
 * {
     "id": 1,
     "eventId": 1,
     "details": {
       "rfpNumber": "RFP-2024-001",
       "rfpDescription": "Supply of Office Equipment",
       "createdBy": {
          "userId": 101,
          "name": "Laura Grey",
          "role": "FINANCE_TEAM_MEMBER"
        }
     },
     "userId": 101,
     
     "createdAt": "2024-09-20T10:15:00Z",
    }

 */

interface AuditTrailInput {
  eventId: string;
  details: Record<string, any>; // Flexible structure for event details
  userId: string; // UUID of the User creating the audit entry
}

export async function createAuditTrail(data: AuditTrailInput) {
  try {
    const { eventId, details, userId } = data;
    await db.auditTrail.create({
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
    return db.auditableEvent.findUnique({
      where: { name },
    });
  } catch (err) {
    throw err;
  }
}

"use server";

import { createAuditTrail, findAuditableEventByName } from "@/data/audit-trail";
import { currentUser } from "@/lib/auth";

type RequestData = {
  eventName: string;
  details: Record<string, any>;
};

export async function saveAuditTrail(data: RequestData) {
  const user = await currentUser();
  if (!user || !user.id || !user.role) {
    return { error: "Invalid user!" } as const;
  }

  const { eventName, details } = data;

  const existingEvent = await findAuditableEventByName(eventName);
  if (!existingEvent) {
    return { error: "Invalid auditable event!" } as const;
  }

  try {
    await createAuditTrail({
      userId: user.id,
      eventId: existingEvent.id,
      details: {
        ...details,
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
        },
      },
    });
    return { success: "Saved successfully!" };
  } catch (err) {
    console.error("Failed to create audit trail", err);
    return { error: "Failed to save audit trail." };
  }
}

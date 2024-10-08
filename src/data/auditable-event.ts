import { AuditableEventTable } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function findAuditableEventByName(name: string) {
  try {
    // console.log(`Finding auditable event by name: ${name}`);
    return await db.query.AuditableEventTable.findFirst({
      where: eq(AuditableEventTable.name, name),
    });
  } catch (err) {
    console.error(`Error finding auditable event by name: ${name}`, err);
    throw err;
  }
}

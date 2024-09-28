import { AuditableEventTable } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function findAuditableEventByName(name: string) {
  try {
    console.log(`Finding auditable event by name: ${name}`);
    const results = await db
      .select()
      .from(AuditableEventTable)
      .where(eq(AuditableEventTable.name, name))
      .limit(1);
    return results[0] || null;
  } catch (err) {
    console.error(`Error finding auditable event by name: ${name}`, err);
    throw err;
  }
}

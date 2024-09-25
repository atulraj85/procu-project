import { CompanyTable } from "@/drizzle/schema";
import { drizzleDB as db } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function findCompanyByName(name: string) {
  const results = await db
    .select()
    .from(CompanyTable)
    .where(eq(CompanyTable.name, name));
  return results[0] || null;
}

export async function findCompanyById(id: string) {
  const results = await db
    .select()
    .from(CompanyTable)
    .where(eq(CompanyTable.id, id));
  return results[0] || null;
}

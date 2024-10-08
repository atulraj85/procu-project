import { CompanyTable } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function findCompanyByName(name: string) {
  try {
    // console.log(`Finding company by name: ${name}`);
    return await db.query.CompanyTable.findFirst({
      where: eq(CompanyTable.name, name),
    });
  } catch (error) {
    console.error(`Error finding company by name ${name}`, error);
    throw error;
  }
}

export async function findCompanyById(id: string) {
  try {
    // console.log(`Finding company by id: ${id}`);
    return await db.query.CompanyTable.findFirst({
      where: eq(CompanyTable.id, id),
    });
  } catch (error) {
    console.error(`Error finding company by id ${id}`, error);
    throw error;
  }
}

export async function deleteCompany(id: string) {
  try {
    // console.log(`Deleting company with id: ${id}`);
    await db.delete(CompanyTable).where(eq(CompanyTable.id, id));
  } catch (error) {
    console.error(`Error deleting company with id: ${id}`, error);
    throw error;
  }
}

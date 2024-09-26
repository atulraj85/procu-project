import { PasswordResetTokenTable } from "@/drizzle/schema";
import { drizzleDB as db } from "@/lib/db";
import { eq } from "drizzle-orm";

interface PasswordResetTokenData {
  email: string;
  token: string;
  expiresAt: Date;
}

export async function createPasswordResetToken(data: PasswordResetTokenData) {
  try {
    const results = await db
      .insert(PasswordResetTokenTable)
      .values({
        email: data.email,
        token: data.token,
        expiresAt: data.expiresAt,
      })
      .returning();
    return results[0] || null;
  } catch (error) {
    console.error(error);
  }
}

export async function deletePasswordResetToken(id: string) {
  try {
    await db
      .delete(PasswordResetTokenTable)
      .where(eq(PasswordResetTokenTable.id, id));
  } catch (error) {
    console.error(error);
  }
}

export async function findPasswordResetTokenByToken(token: string) {
  try {
    const results = await db
      .select()
      .from(PasswordResetTokenTable)
      .where(eq(PasswordResetTokenTable.token, token))
      .limit(1);
    return results[0] || null;
  } catch (error) {
    console.error(error);
  }
}

export async function findPasswordResetTokenByEmail(email: string) {
  try {
    const results = await db
      .select()
      .from(PasswordResetTokenTable)
      .where(eq(PasswordResetTokenTable.email, email))
      .limit(1);
    return results[0] || null;
  } catch (error) {
    console.error(error);
  }
}

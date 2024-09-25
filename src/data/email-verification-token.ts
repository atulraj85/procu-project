import { EmailVerificationTokenTable } from "@/drizzle/schema";
import { drizzleDB as db } from "@/lib/db";
import { eq } from "drizzle-orm";

interface EmailVerificationTokenData {
  email: string;
  token: string;
  expiresAt: Date;
}

export async function createEmailVerificationToken(
  data: EmailVerificationTokenData
) {
  try {
    const results = await db
      .insert(EmailVerificationTokenTable)
      .values({
        email: data.email,
        token: data.token,
        expiresAt: data.expiresAt.toISOString(),
      })
      .returning();
    return results[0] || null;
  } catch (error) {
    console.error(
      `Error deleting email-verification-token with data: ${data}`,
      error
    );
  }
}

export async function deleteEmailVerificationToken(id: string) {
  try {
    console.log(`Deleting email-verification-token with id: ${id}`);
    await db
      .delete(EmailVerificationTokenTable)
      .where(eq(EmailVerificationTokenTable.id, id));
  } catch (error) {
    console.error(
      `Error deleting email-verification-token with id: ${id}`,
      error
    );
  }
}

export async function findEmailVerificationTokenByToken(token: string) {
  try {
    console.log(`Finding email-verification-token by token: ${token}`);
    const results = await db
      .select()
      .from(EmailVerificationTokenTable)
      .where(eq(EmailVerificationTokenTable.token, token))
      .limit(1);
    return results || null;
  } catch (error) {
    console.error(
      `Error finding email-verification-token by token ${token}`,
      error
    );
  }
}

export async function findEmailVerificationTokenByEmail(email: string) {
  try {
    console.log(`Finding email-verification-token by email: ${email}`);
    const results = await db
      .select()
      .from(EmailVerificationTokenTable)
      .where(eq(EmailVerificationTokenTable.email, email))
      .limit(1);
    return results[0] || null;
  } catch (error) {
    console.error(
      `Error finding email-verification-token by email ${email}`,
      error
    );
  }
}

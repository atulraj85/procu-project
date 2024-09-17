import { db } from "@/lib/db";

interface EmailVerificationTokenData {
  email: string;
  token: string;
  expiresAt: Date;
}

export async function createEmailVerificationToken(
  data: EmailVerificationTokenData
) {
  try {
    return await db.emailVerificationToken.create({
      data: { ...data },
    });
  } catch (error) {
    console.error(
      `Error deleting email-verification-token with data: ${data}`,
      error
    );
  }
}

export async function deleteEmailVerificationToken(id: number) {
  try {
    console.log(`Deleting email-verification-token with id: ${id}`);
    await db.emailVerificationToken.delete({
      where: { id },
    });
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
    return await db.emailVerificationToken.findUnique({
      where: { token },
    });
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
    return await db.emailVerificationToken.findFirst({
      where: { email },
    });
  } catch (error) {
    console.error(
      `Error finding email-verification-token by email ${email}`,
      error
    );
  }
}

import { db } from "@/lib/db";

interface PasswordResetTokenData {
  email: string;
  token: string;
  expiresAt: Date;
}

export async function createPasswordResetToken(data: PasswordResetTokenData) {
  try {
    return await db.passwordResetToken.create({
      data: { ...data },
    });
  } catch (error) {
    console.error(error);
  }
}

export async function deletePasswordResetToken(id: number) {
  try {
    await db.passwordResetToken.delete({
      where: { id },
    });
  } catch (error) {
    console.error(error);
  }
}

export async function findPasswordResetTokenByToken(token: string) {
  try {
    return await db.passwordResetToken.findUnique({
      where: { token },
    });
  } catch (error) {
    console.error(error);
  }
}

export async function findPasswordResetTokenByEmail(email: string) {
  try {
    return await db.passwordResetToken.findFirst({
      where: { email },
    });
  } catch (error) {
    console.error(error);
  }
}

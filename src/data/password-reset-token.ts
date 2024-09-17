import { db } from "@/lib/db";

export async function findPasswordResetTokenByToken(token: string) {
  try {
    return await db.passwordResetToken.findUnique({
      where: { token },
    });
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function findPasswordResetTokenByEmail(email: string) {
  try {
    return await db.passwordResetToken.findFirst({
      where: { email },
    });
  } catch (error) {
    console.error(error);
    return null;
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

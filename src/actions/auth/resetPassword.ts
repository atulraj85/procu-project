"use server";

import {
  deletePasswordResetToken,
  findPasswordResetTokenByToken,
} from "@/data/password-reset-token";
import { findUserByEmail } from "@/data/user";
import { UserTable } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { ResetPasswordSchema } from "@/schemas";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";

export async function resetPassword(
  values: z.infer<typeof ResetPasswordSchema>,
  token?: string | null
) {
  if (!token) {
    return { error: "Missing token!" } as const;
  }

  const validation = ResetPasswordSchema.safeParse(values);
  if (!validation.success) {
    return { error: "Invalid fields!" } as const;
  }

  const existingToken = await findPasswordResetTokenByToken(token);
  if (!existingToken) {
    return { error: "Token does not exist!" } as const;
  }

  if (isTokenExpired(existingToken.expiresAt)) {
    return { error: "Token has expired!" } as const;
  }

  const existingUser = await findUserByEmail(existingToken.email);
  if (!existingUser) {
    return { error: "Email does not exist!" } as const;
  }

  const { password } = validation.data;
  const hashedPassword = await bcrypt.hash(password, 10);
  await db
    .update(UserTable)
    .set({
      password: hashedPassword,
      updatedAt: new Date(),
    })
    .where(eq(UserTable.id, existingUser.id));

  await deletePasswordResetToken(existingToken.id);

  return { success: "Password updated!" } as const;
}

function isTokenExpired(expiryDate: Date): boolean {
  return expiryDate < new Date();
}

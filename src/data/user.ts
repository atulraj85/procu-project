import { db } from "@/lib/db";
import { User } from "@prisma/client";

export async function findUserById(id: string) {
  try {
    console.log(`Finding user by id: ${id}`);
    return await db.user.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error(`Error finding user by id: ${id}`, error);
  }
}

export async function findUserByEmail(email: string) {
  try {
    console.log(`Finding user by id: ${email}`);
    return await db.user.findUnique({
      where: { email },
    });
  } catch (error) {
    console.error(`Error finding user by email: ${email}`, error);
  }
}

export async function markUserEmailVerified(userId: string) {
  try {
    console.log(`Marking user email verified for user: ${userId}`);
    await db.user.update({
      where: { id: userId },
      data: {
        emailVerified: new Date(),
      },
    });
  } catch (error) {
    console.error("Error on creating user", error);
  }
}

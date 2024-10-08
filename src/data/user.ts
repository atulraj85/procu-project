import { UserRole, UserTable } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";

interface UserData {
  email: string;
  name: string;
  password: string;
  companyId: string;
  mobile: string;
  role: (typeof UserRole.enumValues)[number];
}

export async function createUser(data: UserData) {
  try {
    const results = await db
      .insert(UserTable)
      .values({
        email: data.email,
        name: data.name,
        password: data.password,
        companyId: data.companyId,
        mobile: data.mobile,
        role: data.role,
        updatedAt: new Date(),
      })
      .returning();
    return results[0] || null;
  } catch (error) {
    console.error(
      `Error deleting email-verification-token with data: ${data}`,
      error
    );
    throw error;
  }
}

export async function deleteUser(id: string) {
  try {
    // console.log(`Deleting user with id: ${id}`);
    await db.delete(UserTable).where(eq(UserTable.id, id));
  } catch (error) {
    console.error(`Error deleting user with id: ${id}`, error);
    throw error;
  }
}

export async function findUserById(id: string) {
  try {
    // console.log(`Finding user by id: ${id}`);
    return await db.query.UserTable.findFirst({
      where: eq(UserTable.id, id),
    });
  } catch (error) {
    console.error(`Error finding user by id: ${id}`, error);
    throw error;
  }
}

export async function findUserByEmail(email: string) {
  try {
    // console.log(`Finding user by email: ${email}`);
    return await db.query.UserTable.findFirst({
      where: eq(UserTable.email, email),
    });
  } catch (error) {
    console.error(`Error finding user by email: ${email}`, error);
    throw error;
  }
}

export async function markUserEmailVerified(userId: string) {
  // console.log(`Marking user email verified for user: ${userId}`);
  try {
    await db
      .update(UserTable)
      .set({
        emailVerified: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(UserTable.id, userId));
  } catch (error) {
    console.error("Error on creating user", error);
    throw error;
  }
}

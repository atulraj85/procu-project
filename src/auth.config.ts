import { db } from "@/lib/db";
import { LoginUserInputValidation } from "@/lib/validations";
import bcrypt from "bcryptjs";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export default {
  providers: [
    Credentials({
      async authorize(credentials) {
        const validation = LoginUserInputValidation.safeParse(credentials);
        if (!validation.success) {
          return null;
        }

        const { email, password } = validation.data;
        const user = await db.user.findUnique({
          where: { email },
        });
        if (!user || !user.password) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        return passwordMatch ? user : null;
      },
    }),
  ],
} satisfies NextAuthConfig;

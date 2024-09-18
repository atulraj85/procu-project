"use server";

import { findUserByEmail } from "@/data/user";
import { db } from "@/lib/db";
import { sendEmailVerificationEmail } from "@/lib/mail";
import { generateEmailVerificationToken } from "@/lib/token";
import { RegisterUserSchema } from "@/schemas";
import bcrypt from "bcryptjs";
import { z } from "zod";

export async function registerUser(values: z.infer<typeof RegisterUserSchema>) {
  const validation = RegisterUserSchema.safeParse(values);
  if (!validation.success) {
    return { error: "Invalid fields!" } as const;
  }

  const { email, name, password, company, mobile } = validation.data;

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return { error: "User with this email already exists!" } as const;
  }

  // Retrieve companyId from the company table using findFirst
  const companyRecord = await db.company.findFirst({
    where: {
      name: company, // Assuming the company table has a 'name' field
    },
  });

  if (!companyRecord) {
    return { error: "Company not found!" } as const;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await db.user.create({
    data: {
      email,
      companyId: companyRecord.id,
      name,
      mobile,
      password: hashedPassword,
    },
  });

  const verificationToken = await generateEmailVerificationToken(email);
  if (verificationToken) {
    await sendEmailVerificationEmail(
      verificationToken.email,
      verificationToken.token
    );
    return {
      success: "User created successfully and confirmation email sent!",
    } as const;
  } else {
    return { error: "Some error occurred!" } as const;
  }
}

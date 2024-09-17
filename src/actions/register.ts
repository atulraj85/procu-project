"use server";

import { findUserByEmail } from "@/data/user";
import { db } from "@/lib/db";
import { sendEmailVerificationEmail } from "@/lib/mail";
import { generateEmailVerificationToken } from "@/lib/token";
import { CreateUserInputValidation } from "@/lib/validations";
import bcrypt from "bcryptjs";
import { z } from "zod";

export async function register(
  values: z.infer<typeof CreateUserInputValidation>
) {
  const validation = CreateUserInputValidation.safeParse(values);
  if (!validation.success) {
    return { error: "Invalid fields!" } as const;
  }

  const { email, name, password, company, mobile } = validation.data;

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return { error: "Email already in use!" } as const;
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
    return { success: "Confirmation email sent!" } as const;
  } else {
    return { error: "Confirmation email not sent!" } as const;
  }
}

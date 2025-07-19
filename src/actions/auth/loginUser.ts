"use server";

import { signIn } from "@/auth";
import { findUserByEmail } from "@/data/user";
import { sendEmailVerificationEmail } from "@/lib/mail";
import { generateEmailVerificationToken } from "@/lib/token";
import { getErrorMessage, mapAuthErrorCode, AUTH_ERROR_CODES } from "@/lib/errorCodes";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { LoginSchema } from "@/schemas";
import { AuthError } from "next-auth";
import * as z from "zod";

export async function loginUser(values: z.infer<typeof LoginSchema>) {
  const validation = LoginSchema.safeParse(values);

  if (!validation.success) {
    return { 
      error: getErrorMessage("INVALID_FORMAT"),
      errorCode: "INVALID_FORMAT"
    } as const;
  }

  const { email, password } = validation.data;
  const existingUser = await findUserByEmail(email);

  if (!existingUser) {
    return { 
      error: getErrorMessage(AUTH_ERROR_CODES.INVALID_EMAIL),
      errorCode: AUTH_ERROR_CODES.INVALID_EMAIL
    } as const;
  }

  if (!existingUser.emailVerified) {
    const verificationToken = await generateEmailVerificationToken(
      existingUser.email
    );
    if (verificationToken) {
      await sendEmailVerificationEmail(
        verificationToken.email,
        verificationToken.token
      );
      return { 
        success: "Email sent for email verification!",
        errorCode: AUTH_ERROR_CODES.EMAIL_NOT_VERIFIED
      } as const;
    }
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      const errorCode = mapAuthErrorCode(error.type);
      return { 
        error: getErrorMessage(errorCode),
        errorCode,
        details: { authErrorType: error.type }
      } as const;
    }

    // For non-auth errors, log and return generic error
    console.error("Login error:", error);
    return { 
      error: getErrorMessage("INTERNAL_SERVER_ERROR"),
      errorCode: "INTERNAL_SERVER_ERROR"
    } as const;
  }
}

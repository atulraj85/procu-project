import { z } from "zod";

const emailSchema = z
  .string({ required_error: "Email is required!" })
  .min(1, { message: "Email is required!" })
  .email({ message: "Invalid email!" });

const passwordSchema = z
  .string({ required_error: "Password is required!" })
  .min(1, { message: "Password is required!" })
  .min(8, { message: "Password must be at least 8 characters!" })
  .max(25, { message: "Password must be at most 25 characters!" });

export const LoginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const ForgotPasswordSchema = z.object({
  email: emailSchema,
});

export const ResetPasswordSchema = z.object({
  password: passwordSchema,
});

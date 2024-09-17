import { z } from "zod";

export const LoginSchema = z.object({
  email: z
    .string()
    .email({
      message: "Enter a valid email",
    })
    .min(2, {
      message: "email must be at least 2 characters.",
    }),
  password: z
    .string()
    .min(8, {
      message: "Password must be at least 8 characters.",
    })
    .max(25, {
      message: "Password must be at most 25 characters.",
    }),
});

export const ForgotPasswordSchema = z.object({
  email: z
    .string({ required_error: "Email is required!" })
    .min(1, { message: "Email is required!" })
    .email({ message: "Enter a valid email!" }),
});

export const ResetPasswordSchema = z.object({
  password: z
    .string({ required_error: "Password is required!" })
    .min(1, { message: "Password is required!" })
    .min(8, {
      message: "Password must be at least 8 characters.",
    })
    .max(25, {
      message: "Password must be at most 25 characters.",
    }),
});

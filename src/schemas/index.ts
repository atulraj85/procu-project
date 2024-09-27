import { Role } from "@prisma/client";
import { string, z } from "zod";

const emailSchema = z
  .string({ required_error: "Email is required!" })
  .min(1, { message: "Email is required!" })
  .email({ message: "Invalid email!" });

const passwordSchema = z
  .string({ required_error: "Password is required!" })
  .min(1, { message: "Password is required!" })
  .min(8, { message: "Password must be at least 8 characters!" })
  .max(25, { message: "Password must be at most 25 characters!" });

const nameSchema = z
  .string({ required_error: "Full name is required!" })
  .min(1, { message: "Full name is required!" })
  .min(3, { message: "Full name must be at least 3 characters." })
  .max(50, { message: "Full name must be at most 50 characters." });

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

const RoleEnum = z.enum(
  [
    Role.ADMIN,
    Role.PR_MANAGER,
    Role.FINANCE_MANAGER,
    Role.ACCOUNTANT,
    Role.QUALITY_ASSURANCE,
    Role.USER,
  ],
  { invalid_type_error: "Invalid role!" }
);

export const RegisterUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  company: z
    .string({ required_error: "Company is required!" })
    .min(1, { message: "Company is required!" })
    .min(2, { message: "Company must be at least 2 characters." }),
  mobile: z
    .string({ required_error: "Number is required!" })
    .min(1, { message: "Number is required!" })
    .min(10, { message: "Number must be at least 10 characters." }),
  role: RoleEnum.optional() || string,
});

export const UpdateUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  role: RoleEnum.optional(),
});

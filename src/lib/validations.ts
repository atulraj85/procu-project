import * as z from "zod";

const CreateUserInputValidation = z.object({
  name: z
    .string()
    .min(3, {
      message: "Full name must be at least 3 characters.",
    })
    .max(50, {
      message: "Full name must be at most 50 characters.",
    }),
  company: z.string().min(2, {
    message: "Company must be at least 2 characters.",
  }),
  role: z.string().optional(),

  email: z
    .string()
    .email({
      message: "Enter a valid email",
    })
    .min(2, {
      message: "Email must be at least 2 characters.",
    }),
  mobile: z.string().min(10, {
    message: "Number must be at least 10 characters.",
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

const LoginUserInputValidation = z.object({
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

export { CreateUserInputValidation, LoginUserInputValidation };

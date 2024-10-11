import { validateGstn } from "@/lib/Validation";
import { z } from "zod";

const companySchema = z.object({
  company_gstn: z.string().refine(validateGstn, { message: "Invalid GSTN" }),
  company_name: z.string().min(1, "Company name is required"),
  address: z.string().min(1, "Address is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),
});

type CompanyData = z.infer<typeof companySchema>;


export { companySchema };
export type { CompanyData };

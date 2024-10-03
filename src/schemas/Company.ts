import * as z from "zod";


export const CompanyFormSchema = z.object({
    email: z.string().optional().or(z.literal("")), //TODO email
    phone: z.string().optional(),
    website: z.string().optional().or(z.literal("")), //TODO url()
    industry: z.string().optional(),
    foundedDate: z.string().optional(), // Use string for date input
    status: z.enum(["active", "inactive"]).optional(),
    logo: z.instanceof(File).optional(), // File input for logo
    stamp: z.instanceof(File).optional(), // File input for stamp
  
    deliveryAddress: z.object({
      street: z.string().min(2, "Address is required"),
      country: z.string().optional(),
      state: z.string().optional(),
      city: z.string().optional(),
      zipCode: z.string().optional(),
    }),
  });


  export const AddressformSchema = z.object({
    title: z.string().min(1, "Title is required"),
    street: z.string().min(1, "Street is required"),
    country: z.string().min(1, "Country is required"),
    state: z.string().min(1, "State is required"),
    city: z.string().min(1, "City is required"),
    zipCode: z.string().min(1, "Zip Code is required"),
  });
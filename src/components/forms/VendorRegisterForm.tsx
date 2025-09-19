"use client";

import { IoEye, IoEyeOff } from "react-icons/io5";
import { IoIosSearch } from "react-icons/io";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import MainButton from "../common/MainButton";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { validateGstn, validateEmail, validateIndianPhoneNumber } from "@/lib/Validation";

// Validation Schema
const VendorRegistrationSchema = z.object({
  primaryName: z.string().min(2, "Primary contact name is required"),
  companyName: z.string().min(2, "Company name is required"),
  contactDisplayName: z.string().min(2, "Contact display name is required"),
  email: z.string().email("Invalid email address"),
  mobile: z.string().min(10, "Valid mobile number is required"),
  workPhone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  gstin: z.string().min(15, "Valid GSTIN is required"),
  pan: z.string().min(10, "Valid PAN is required"),
  address: z.string().min(10, "Address is required"),
  customerState: z.string().min(1, "State is required"),
  customerCity: z.string().min(1, "City is required"),
  country: z.string().default("India"),
  zip: z.string().min(6, "Valid pin code is required"),
  msmeNo: z.string().optional(),
  remarks: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const FormSchema = VendorRegistrationSchema;

function VendorRegistrationForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [states, setStates] = useState<{ value: string; label: string }[]>([]);
  const [cities, setCities] = useState<{ value: string; label: string }[]>([]);
  const [isGstinFetching, setIsGstinFetching] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const router = useRouter();

  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      primaryName: "",
      companyName: "",
      contactDisplayName: "",
      email: "",
      mobile: "",
      workPhone: "",
      website: "",
      gstin: "",
      pan: "",
      address: "",
      customerState: "",
      customerCity: "",
      country: "India",
      zip: "",
      msmeNo: "",
      remarks: "",
      password: "",
    },
  });

  // Fetch states on component mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await fetch("/api/address/states/IN");
        if (response.ok) {
          const data = await response.json();
          const transformedStates = data.map((state: { code: any; name: any }) => ({
            value: state.code,
            label: state.name,
          }));
          setStates(transformedStates);
        }
      } catch (error) {
        console.error("Error fetching states:", error);
      }
    };
    fetchStates();
  }, []);

  // Fetch cities when state changes
  useEffect(() => {
    const fetchCities = async () => {
      const state = form.watch("customerState");
      if (state) {
        try {
          const response = await fetch(`/api/address/cities/IN/${state}`);
          if (response.ok) {
            const data = await response.json();
            const transformedCities = data.map((city: { name: any }) => ({
              value: city.name,
              label: city.name,
            }));
            setCities(transformedCities);
          }
        } catch (error) {
          console.error("Error fetching cities:", error);
        }
      }
    };
    fetchCities();
  }, [form.watch("customerState")]);

  // GSTIN search function
  const handleSearchGSTN = async () => {
    const gstin = form.getValues("gstin");
    
    if (!validateGstn(gstin).isValid) {
      toast({
        title: "Invalid GSTIN",
        description: "Please enter a valid GSTIN",
        variant: "destructive",
      });
      return;
    }

    setIsGstinFetching(true);

    try {
      // Check if vendor already exists
      const existingVendorResponse = await fetch(`/api/vendor?gstin=${gstin}`);
      const existingVendor = await existingVendorResponse.json();

      if (existingVendorResponse.ok && Array.isArray(existingVendor) && existingVendor.length > 0) {
        toast({
          title: "Vendor Already Exists",
          description: "This GSTIN is already registered in the system.",
          variant: "destructive",
        });
        setIsGstinFetching(false);
        return;
      }

      // Fetch from GST database
      const gstResponse = await fetch(`/api/vendor/gst/${gstin}`);
      const gstData = await gstResponse.json();

      if (gstResponse.ok && gstData.flag) {
        const data = gstData.data;
        
        // Auto-fill form with GST data
        form.setValue("companyName", data.lgnm || "");
        form.setValue("customerState", data.pradr.addr.stcd || "");
        form.setValue("zip", data.pradr.addr.pncd || "");
        form.setValue("address", data.pradr.adr || "");
        form.setValue("customerCity", data.pradr.addr.city || "");
        form.setValue("pan", data.gstin.slice(2, 12) || "");

        toast({
          title: "GSTIN Details Fetched",
          description: "Company details have been populated from GST database.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch details from GST database.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching GSTIN details:", error);
      toast({
        title: "Error",
        description: "An error occurred while fetching GSTIN details.",
        variant: "destructive",
      });
    } finally {
      setIsGstinFetching(false);
    }
  };

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setError(undefined);
    setSuccess(undefined);

    startTransition(async () => {
      try {
        // Prepare vendor data
        const vendorData = {
          customerCode: `VEND-${Date.now()}`, // Auto-generate customer code
          primaryName: data.primaryName,
          companyName: data.companyName,
          contactDisplayName: data.contactDisplayName,
          email: data.email,
          workPhone: data.workPhone,
          mobile: data.mobile,
          website: data.website,
          gstin: data.gstin,
          password : data.password,
          msmeNo: data.msmeNo,
          address: data.address,
          customerState: data.customerState,
          customerCity: data.customerCity,
          country: data.country,
          zip: data.zip,
          remarks: data.remarks,
          pan: data.pan,
          status: "PENDING_REVIEW", // Default status for new registrations
        };

        const response = await fetch("/api/vendor", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify([vendorData]), // API expects array
        });

        const result = await response.json();

        if (response.ok) {
          form.reset();
          setSuccess("Registration successful! Your application is pending approval.");
          toast({
            title: "🎉 Registration Successful",
            description: "Your vendor registration has been submitted for approval.",
          });
          
          // Redirect after successful registration
          setTimeout(() => {
            router.push("/auth/login");
          }, 2000);
        } else {
          setError(result.error || "Registration failed. Please try again.");
        }
      } catch (error) {
        console.error("Registration error:", error);
        setError("An error occurred during registration. Please try again.");
      }
    });
  }

  return (
    <div className="w-full flex flex-col gap-[2.81rem] justify-center items-center min-h-screen px-4 lg:px-[4rem] py-8">
      <div className="self-start">
        <p className="text-[#333] text-[1.625rem] font-[700]">Vendor Registration</p>
        {/* <p className="text-[#333] text-[1.125rem]">Join our procurement network</p> */}
      </div>
      
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-6 max-w-2xl"
        >
          {/* GSTIN Field with Search */}
          <div className="relative">
            <FormField
              control={form.control}
              name="gstin"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="GSTIN (e.g., 27ABCDE1234F1Z6)"
                      {...field}
                      className="h-[3.75rem] w-full rounded-large pr-12"
                      startIcon="building"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <button
              type="button"
              onClick={handleSearchGSTN}
              disabled={isGstinFetching}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xl text-gray-500 hover:text-primary disabled:opacity-50"
            >
              <IoIosSearch />
            </button>
          </div>

          {/* Company Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Company Name"
                      {...field}
                      className="h-[3.75rem] w-full rounded-large"
                      startIcon="building"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pan"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="PAN Card Number"
                      {...field}
                      className="h-[3.75rem] w-full rounded-large"
                      startIcon="card"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Contact Person Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="primaryName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Primary Contact Name"
                      {...field}
                      className="h-[3.75rem] w-full rounded-large"
                      startIcon="user"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactDisplayName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Contact Display Name"
                      {...field}
                      className="h-[3.75rem] w-full rounded-large"
                      startIcon="user"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Email Address"
                      {...field}
                      className="h-[3.75rem] w-full rounded-large"
                      startIcon="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mobile"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Mobile Number"
                      {...field}
                      className="h-[3.75rem] w-full rounded-large"
                      startIcon="phone"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Website (optional)"
                    {...field}
                    className="h-[3.75rem] w-full rounded-large"
                    startIcon="globe"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Address Information */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Complete Address"
                    {...field}
                    className="h-[3.75rem] w-full rounded-large"
                    startIcon="location"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="customerState"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-[3.75rem] w-full rounded-large">
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {states.map((state) => (
                            <SelectItem key={state.value} value={state.value}>
                              {state.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerCity"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-[3.75rem] w-full rounded-large">
                        <SelectValue placeholder="Select City" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {cities.map((city) => (
                            <SelectItem key={city.value} value={city.value}>
                              {city.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="zip"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Pin Code"
                      {...field}
                      className="h-[3.75rem] w-full rounded-large"
                      startIcon="location"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Optional Fields */}
          <FormField
            control={form.control}
            name="msmeNo"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="MSME Number (optional)"
                    {...field}
                    className="h-[3.75rem] w-full rounded-large"
                    startIcon="card"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password Field */}
          <div className="relative">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Password"
                      {...field}
                      startIcon="padlock"
                      className="h-[3.75rem] w-full rounded-large"
                      type={showPassword ? "text" : "password"}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <span
              className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-2xl opacity-55"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <IoEyeOff /> : <IoEye />}
            </span>
          </div>

          <FormError message={error} />
          <FormSuccess message={success} />

          <MainButton
            text="Register as Vendor"
            classes="h-[3.31rem] rounded-large"
            width="full_width"
            isSubmitable
            isLoading={isPending}
          />

          <div className="flex justify-center font-bold text-[14px] text-[#191A15] mt-4">
            <Link href="/auth/login">Already have an account? Login</Link>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default VendorRegistrationForm;

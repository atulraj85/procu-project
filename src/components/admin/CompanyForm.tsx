"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { IoConstructOutline } from "react-icons/io5";
import { AddressType } from "@prisma/client";

interface Company {
  GST: string;
  addresses: any[];
  created_at: string;
  email: string;
  foundedDate: null | string;
  id: string;
  industry: null | string;
  logo: null | string;
  name: string;
  phone: string;
  stamp: null | string;
  status: null | string;
  updated_at: string;
  website: null | string;
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  GST: z.string().optional(),
  email: z.string().optional().or(z.literal("")), //TODO email
  phone: z.string().optional(),
  website: z.string().optional().or(z.literal("")), //TODO url()
  industry: z.string().optional(),
  foundedDate: z.string().optional(), // Use string for date input
  status: z.enum(["active", "inactive"]).optional(),
  logo: z.instanceof(File).optional(), // File input for logo
  stamp: z.instanceof(File).optional(), // File input for stamp
  businessAddress: z.object({
    street: z.string().optional(),
    country: z.string().optional(),
    state: z.string().optional(),
    city: z.string().optional(),
    zipCode: z.string().optional(),
    AddressType: z.string().optional(),
  }),
  deliveryAddress: z.object({
    street: z.string().optional(),
    country: z.string().optional(),
    state: z.string().optional(),
    city: z.string().optional(),
    zipCode: z.string().optional(),
    AddressType: z.string().optional(),
  }),
});

type CompanyFormValues = z.infer<typeof formSchema>;

interface CompanyFormProps {
  initialData?: any;
  onSubmit: (data: CompanyFormValues) => Promise<void>;
}

export function CompanyForm({ initialData, onSubmit }: CompanyFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [userid, setUserId] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyData, setCompanyData] = useState<Company | null>(null);

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      GST: "",
      email: "",
      phone: "",
      website: "",
      industry: "",
      foundedDate: "",
      status: "active",
      logo: undefined,
      stamp: undefined,
      businessAddress: {
        street: "",
        country: "",
        state: "",
        city: "",
        zipCode: "",
        addressType: "BUSINESS",
      },
      deliveryAddress: {
        street: "",
        country: "",
        state: "",
        city: "",
        zipCode: "",
        addressType: "SHIPPING",
      },
      ...initialData,
    },
  });

  useEffect(() => {
    const storedUserId = localStorage.getItem("USER_ID");
    console.log(storedUserId);
    setUserId(storedUserId);

    if (storedUserId) {
      getCompanyId(storedUserId);
    }
  }, []);

  const getCompanyId = async (id: string) => {
    try {
      const response = await fetch(`/api/users?id=${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch company details");
      }
      const data = await response.json();
      const companyid = data[0].companyId;
      setCompanyId(companyid);
      getCompanyDetails(companyid);
    } catch (error) {
      console.error("Error fetching admin details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch admin details",
        variant: "destructive",
      });
    }
  };

  const getCompanyDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/company?id=${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch company details");
      }
      const data = await response.json();
      setCompanyData(data[0]);
      const company = data[0];

      // Update form values with company data
      form.reset({
        name: company.name || "",
        GST: company.GST || "",
        email: company.email || "",
        phone: company.phone || "",
        website: company.website || "",
        industry: company.industry || "",
        foundedDate: company.foundedDate || "",
        status: company.status || "active",
        logo: undefined,
        stamp: undefined,
        businessAddress: {
          street: company.addresses[0]?.address || "",
          country: company.addresses[0]?.country || "",
          state: company.addresses[0]?.state || "",
          city: company.addresses[0]?.city || "",
          zipCode: company.addresses[0]?.zipCode || "",
          AddressType: "BUSINESS",
        },
        deliveryAddress: {
          street: company.addresses[1]?.address || "",
          country: company.addresses[1]?.country || "",
          state: company.addresses[1]?.state || "",
          city: company.addresses[1]?.city || "",
          zipCode: company.addresses[1]?.zipCode || "",
          AddressType: "SHIPPING",
        },
      });
    } catch (error) {
      console.error("Error fetching company details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch company details",
        variant: "destructive",
      });
    }
  };

  async function onSubmitForm(data: CompanyFormValues) {
    setIsLoading(true);
    try {
      const formData = new FormData();
      for (const key in data) {
        if (key === "businessAddress" || key === "deliveryAddress") {
          continue; // Skip these for now, we'll handle them separately
        }
        const value = data[key as keyof CompanyFormValues];
        if (value instanceof File) {
          formData.append(key, value);
        } else if (key === "foundedDate" && value) {
          // Convert foundedDate to ISO format
          const date = new Date(value as string);
          const isoDate = date.toISOString();
          formData.append(key, isoDate);
        } else {
          formData.append(key, JSON.stringify(value) || "");
        }
      }
     

      
  
      
      // Add addresses as a JSON string
      const addresses = [data.businessAddress, data.deliveryAddress];

      formData.append("addresses", JSON.stringify(addresses));

      // Log formData contents (for debugging)
      // newData.forEach((value, key) => {
      //   console.log(`${key}: ${value}`);
      // });

      console.log(formData);
      // Call the onSubmit prop function with the formData
      // await onSubmit(data);

      const response = await fetch(`/api/company?id=${companyId}`, {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        // Reset form after submission
        form.reset();

        toast({
          title: "Success",
          description: "Company saved successfully",
        });
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Failed to save company",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {/* Existing form fields */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* ... (Keep all the existing form fields here) ... */}
              <FormField
                control={form.control}
                name="GST"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GST Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* <FormField
                control={form.control}
                name="businessAddress"
                render={({ field }) => (
                  <FormItem >
                    <FormLabel>Business Address</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="foundedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Founded Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* File input for Logo */}
              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files) {
                            field.onChange(e.target.files[0]);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* File input for Stamp */}
              <FormField
                control={form.control}
                name="stamp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stamp</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files) {
                            field.onChange(e.target.files[0]);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business Address</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <FormField
                control={form.control}
                name="businessAddress.street"
                render={({ field }) => (
                  <FormItem className="col-span-3">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-20">
                <FormField
                  control={form.control}
                  name="businessAddress.country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessAddress.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessAddress.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessAddress.zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zip Code</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Address</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <FormField
                control={form.control}
                name="deliveryAddress.street"
                render={({ field }) => (
                  <FormItem className="col-span-3">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-20">
                <FormField
                  control={form.control}
                  name="deliveryAddress.country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deliveryAddress.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deliveryAddress.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deliveryAddress.zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zip Code</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={isLoading} className="my-4 bg-primary">
          {isLoading ? "Saving..." : "Save Company"}
        </Button>
      </form>
    </Form>
  );
}

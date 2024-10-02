"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Loader from "@/components/shared/Loader";
import * as z from "zod";
import { Upload } from "lucide-react";
import { CiCircleRemove } from "react-icons/ci";
import { Button } from "@/components/ui/button";
import { addresses } from "@/app/dashboard/admin/company/address";
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
import { useCurrentUser } from "@/hooks/auth";

import AddressForm from "./AddressForm";

interface Company {
  GST: string;
  gstAddress: string;
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
  email: z.string().optional().or(z.literal("")), //TODO email
  phone: z.string().optional(),
  website: z.string().optional().or(z.literal("")), //TODO url()
  industry: z.string().optional(),
  foundedDate: z.string().optional(), // Use string for date input
  status: z.enum(["active", "inactive"]).optional(),
  logo: z.instanceof(File).optional(), // File input for logo
  stamp: z.instanceof(File).optional(), // File input for stamp

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
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyData, setCompanyData] = useState<Company | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [stampPreview, setStampPreview] = useState<string | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState<boolean>(true);
  // Address States
  const [currentAddress, setCurrentAddress] = useState<{
    title: string;
    street: string;
    country: string;
    state: string;
    city: string;
    zipCode: string;
  } | null>(null);

  const handlecurrentAddress = (searchTitle: string) => {
    let currAddress = addresses.filter((address) =>
      address.title.toLowerCase().includes(searchTitle.toLowerCase())
    );

    setCurrentAddress(currAddress[0]);
    console.log(addresses[0]);
  };

  const currentUser = useCurrentUser();
  const userId = currentUser?.id;

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      
      email: "",
      phone: "",
      website: "",
      industry: "",
      foundedDate: "",
      status: "active",
      logo: undefined,
      stamp: undefined,

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
    if (userId) {
      getCompanyId(userId);
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
      setCompanyData(data[0]);
      console.log(data[0]);

      // Update form values with company data
      form.reset({
        email: company.email || "",
        phone: company.phone || "",
        website: company.website || "",
        industry: company.industry || "",
        foundedDate: company.foundedDate || "",
        status: company.status || "active",
        logo: undefined,
        stamp: undefined,
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
          console.log(value);
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
      const addresses = [data.deliveryAddress];

      formData.append("addresses", JSON.stringify(addresses));

      // Log formData contents (for debugging)
      formData.forEach((value, key) => {
        console.log(`${key}: ${value}`);
      });

      console.log(formData);
      // Call the onSubmit prop function with the formData
      // await onSubmit(data);

      const response = await fetch(`/api/company/${companyId}`, {
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

  if (!companyData) {
    return <Loader />;
  }

  return (
    <>
    
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-8">
        <Card>
          <CardContent className="mt-4">
            <div className="flex  justify-between mb-6">
              <div>
                <p>
                  {" "}
                  <strong>{companyData?.name}</strong>{" "}
                </p>
                <p>
                  {" "}
                  <strong>{companyData?.GST}</strong>{" "}
                </p>
              </div>

              <div className="w-[30%]">
                {" "}
                <p></p>{" "}
                <strong>
                  {" "}
                  <span className="text-xl">Address:</span>{" "}
                  {companyData.gstAddress
                    ? companyData.gstAddress
                    : " address not come from backend "}
                </strong>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
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
              {/* 
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
              /> */}

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
                  <FormItem className="relative">
                    <FormLabel className=" absolute  left-8 top-0 items-center justify-center w-32  rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                      <p className="text-md mb-3 font-medium">Logo</p>
                      <img
                        src={
                          logoPreview
                            ? logoPreview
                            : "https://cdn.pixabay.com/photo/2017/03/19/20/19/ball-2157465_640.png"
                        }
                        alt="Preview"
                        className="w-14 h-14 object-cover rounded-full"
                      />
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="hidden"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          let count = 0;
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setLogoPreview(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                            field.onChange(file);
                            count++;
                          }
                        }}
                      />
                    </FormControl>
                    {logoPreview && (
                      // <Button
                      //   type="button"
                      //   variant="outline"
                      //   size="sm"
                      //   className="mt-6"
                      //   onClick={() => {
                      //     setPreview(null);
                      //     field.onChange(null);
                      //   }}
                      // >
                      <CiCircleRemove
                        className="w-12 absolute right-24 top-2"
                        // variant="outline"
                        size="sm"
                        onClick={() => {
                          setLogoPreview(null);
                          field.onChange(null);
                        }}
                      />
                    )}
                  </FormItem>
                )}
              />

              {/* File input for Stamp */}
              <FormField
                control={form.control}
                name="stamp"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormLabel className=" absolute  left-8 top-0 items-center justify-center w-32  rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                      <p className="text-md mb-3 font-medium">Stamp</p>
                      <img
                        src={
                          stampPreview
                            ? stampPreview
                            : "https://img.freepik.com/free-vector/guarantee-best-quality-stamp_1017-7145.jpg?size=626&ext=jpg&ga=GA1.1.525718953.1713282863&semt=ais_hybrid"
                        }
                        alt="Preview"
                        className="w-14 h-14 object-cover rounded-full"
                      />
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="hidden"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          let count = 0;
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setStampPreview(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                            field.onChange(file);
                            count++;
                          }
                        }}
                      />
                    </FormControl>
                    {stampPreview && (
                      // <Button
                      //   type="button"
                      //   variant="outline"
                      //   size="sm"
                      //   className="mt-6"
                      //   onClick={() => {
                      //     setPreview(null);
                      //     field.onChange(null);
                      //   }}
                      // >
                      <CiCircleRemove
                        className="w-12 absolute right-24 top-2"
                        // variant="outline"
                        size="sm"
                        onClick={() => {
                          setStampPreview(null);
                          field.onChange(null);
                        }}
                      />
                    )}
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

       {isAddingAddress && <Card>
          <CardHeader>
            <CardTitle >Delivery Address</CardTitle>
            <div className="flex justify-between items-center">
              <Select
                // value={}
                onValueChange={(value) => {
                  console.log(value);
                  handlecurrentAddress(value);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Addresse" />
                </SelectTrigger>
                <SelectContent>
                  {addresses.map((item, idx) => (
                    <SelectItem value={item.title}>{item.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button type="button" onClick={()=>setIsAddingAddress(false)} className="my-4 bg-primary" >Add Address</Button>
            </div>
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
                      <Input {...field} value={currentAddress?.street} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="deliveryAddress.country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input {...field} value={currentAddress?.country} />
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
                        <Input {...field} value={currentAddress?.state} />
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
                        <Input {...field} value={currentAddress?.city} />
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
                        <Input {...field} value={currentAddress?.zipCode} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card> } 

        <Button type="submit" disabled={isLoading} className="my-4 bg-primary">
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Form >

    <div className="mt-4">
      {!isAddingAddress && <AddressForm  companyId={companyId} isAddingAddress={() => setIsAddingAddress(true)} />}
    </div>
    </>
  );
}

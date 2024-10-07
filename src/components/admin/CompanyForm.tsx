"use client";
import Loader from "@/components/shared/Loader";
import * as z from "zod";
import { CiCircleRemove } from "react-icons/ci";
import { Button } from "@/components/ui/button";
import { addresses } from "./address";
import { CompanyFormSchema } from "@/schemas/Company";
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
import { Card, CardContent } from "../ui/card";
import { useCurrentUser } from "@/hooks/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import AddressUpdate from "./AddressUpdate";
import { Company } from "@/types";

type CompanyFormValues = z.infer<typeof CompanyFormSchema>;

interface CompanyFormProps {
  initialData?: any;
  onSubmit: (data: CompanyFormValues) => Promise<void>;
}

export function CompanyForm({ initialData, onSubmit }: CompanyFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [companyId, setCompanyId] = useState<string>("");
  const [companyData, setCompanyData] = useState<Company | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [stampPreview, setStampPreview] = useState<string | null>(null);

  const currentUser = useCurrentUser();
  const userId = currentUser?.id;

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(CompanyFormSchema),
    defaultValues: {
      email: "",
      phone: "",
      website: "",
      industry: "",
      status: "active",
      logo: undefined,
      stamp: undefined,
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
      const response = await fetch(`/api/company/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch company details");
      }
      const data = await response.json();
      setCompanyData(data);
      const company = data;
      setCompanyData(data);
      console.log(data);

      form.reset({
        email: company.email || "",
        phone: company.phone || "",
        website: company.website || "",
        industry: company.industry || "",
        status: company.status || "active",
        logo: undefined,
        stamp: undefined,
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
    console.log(data);
    try {
      const formData = new FormData();
      for (const key in data) {
        if (key === "businessAddress" || key === "deliveryAddress") {
          continue;
        }
        const value = data[key as keyof CompanyFormValues];
        if (value instanceof File) {
          formData.append(key, value);
          console.log(value);
        } else {
          formData.append(key, JSON.stringify(value) || "");
        }
      }

      formData.forEach((value, key) => {
        console.log(`${key}: ${value}`);
      });

      console.log(formData);

      const response = await fetch(`/api/company/${companyId}`, {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
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
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-4">
          <Card>
            <CardContent className="mt-4">
              <div className="flex justify-between mb-6">
                <div>
                  <p><strong>{companyData?.name}</strong></p>
                  <p><strong>{companyData?.gst}</strong></p>
                </div>
                <div className="w-[30%]">
                  <p></p>
                  <strong>
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
                <FormField
                  control={form.control}
                  name="logo"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormLabel className="absolute left-8 top-0 items-center justify-center w-32 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
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
                        <CiCircleRemove
                          className="w-12 absolute right-24 top-2"
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
                <FormField
                  control={form.control}
                  name="stamp"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormLabel className="absolute left-8 top-0 items-center justify-center w-32 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
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
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setStampPreview(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                              field.onChange(file);
                            }
                          }}
                        />
                      </FormControl>
                      {stampPreview && (
                        <CiCircleRemove
                          className="w-12 absolute right-24 top-2"
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
          <Button
            type="submit"
            disabled={isLoading}
            className="my-4 bg-primary"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Form>
      <div className="mt-6">
        <AddressUpdate companyId={companyId}/>
      </div>
    </div>
  );
}
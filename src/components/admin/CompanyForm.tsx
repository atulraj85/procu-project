"use client";
import Loader from "@/components/shared/Loader";
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
import { useCurrentUser } from "@/hooks/auth";
import { CompanyFormSchema } from "@/schemas/Company";
import { Company } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { CiCircleRemove } from "react-icons/ci";
import * as z from "zod";
import { Card, CardContent } from "../ui/card";
import ViewAddress from "./ViewAddress";

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
      console.log(":compnay data", data);

      form.reset({
        email: data.email,
        phone: data.phone,
        website: data.website,
        industry: data.industry,
        status: data.status,
        logo: undefined,
        stamp: undefined,
      });
      setLogoPreview(null);
      setStampPreview(null);
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

        // Check if the value is a File and that the file is not empty (null or undefined)
        if (value instanceof File) {
          console.log("file data", value)
          console.log(key, value);
          // if (value) {
            // Ensure the file is not empty by checking its size
            formData.append(key, value);
            console.log(value);
          // }
        } else {
          // Append non-file values, skipping empty files
          if(value !== "undefined"){
            console.log(key, value);
            formData.append(key, String(value));
          }
         
        }
      }

      // formData.append("addresses", JSON.stringify(addresses));

      formData.forEach((value, key) => {
        console.log(`${key}: ${value}`);
      });

      console.log(formData);

      const response = await fetch(`/api/company/${companyId}`, {
        method: "PUT",
        body: formData,
      });

      console.log(response);

      if (response.ok) {
        form.reset();
        toast({
          title: "Success",
          description: "Details Updated successfully",
        });
        getCompanyDetails(companyId);
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

  function formatFilePath(filePath: string): string {
    // Extract the part after 'company' and replace backslashes with forward slashes
    let formattedPath =
      filePath.split("company").pop()?.replace(/\\/g, "/") || "";

    // Remove any leading slashes
    formattedPath = formattedPath.replace(/^\/+/, "");

    return "/" + formattedPath; // Return with a leading forward slash
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Company Details</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-4">
          <Card>
            <CardContent className="mt-4">
              <div className="flex justify-between mb-6">
                <div>
                  <p>
                    <strong>{companyData?.name}</strong>
                  </p>
                  <p>
                    <strong>{companyData?.gst}</strong>
                  </p>
                </div>
                <div className="w-[30%]">
                  <p></p>
                  <strong>
                    <span className="text-xl">Address:</span>{" "}
                    {companyData.gstAddress ? companyData.gstAddress : ""}
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
                        defaultValue={companyData.status}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="status" />
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
                              : companyData.logo
                              ? `/company/${formatFilePath(companyData.logo)}`
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
                              : companyData.stamp
                              ? `/company/${formatFilePath(companyData.stamp)}`
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
              <Button
                type="submit"
                // disabled={isLoading}
                className="mt-4 w-36 my-4 bg-primary"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </form>
      </Form>
      <div className="mt-6">
        <ViewAddress companyId={companyId} />
      </div>
    </div>
  );
}

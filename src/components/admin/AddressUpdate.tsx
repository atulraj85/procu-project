import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { addresses } from "@/app/(protected)/dashboard/admin/company/address";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { AddressformSchema } from "@/schemas/Company";
import AddressForm from "./AddressForm";
import { toast } from "@/components/ui/use-toast";
import { CompanyFormSchema } from "@/schemas/Company";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AddressUpdateProps {
    compnayId: string;
}

interface Address {
  title: string;
  street: string;
  country: string;
  state: string;
  city: string;
  zipCode: string;
}

type FormValues = z.infer<typeof AddressformSchema>;
type TCompanyFomr = z.infer<typeof CompanyFormSchema>;

const AddressUpdate: React.FC<AddressUpdateProps> = ({ compnayId }) => {
  const [isAddingAddress, setIsAddingAddress] = useState<boolean>(true);
  const [companyData, setCompanyData] = useState<Address | null>(null);
  const [currentAddress, setCurrentAddress] = useState<{
    title: string;
    street: string;
    country: string;
    state: string;
    city: string;
    zipCode: string;
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(AddressformSchema),
    defaultValues: {
      title: "",
      street: "",
      country: "",
      state: "",
      city: "",
      zipCode: "",
    },
  });

  const handlecurrentAddress = (searchTitle: string) => {
    let currAddress = addresses.find((address) =>
      address.title.toLowerCase().includes(searchTitle.toLowerCase())
    );
    if (currAddress) {
      setCurrentAddress(currAddress);
      form.reset(currAddress); // Reset form fields with the selected address values
    }
  };

  const onSubmitForm = (data: FormValues) => {
    console.log("Submitted Data:", data);
    // Add the logic to handle form submission, such as sending data to a backend API.
  };

  const handleChange = (field: keyof FormValues, value: string) => {
    setCurrentAddress((prev) => {
      if (prev) {
        return { ...prev, [field]: value };
      }
      return prev;
    });
    form.setValue(field, value); // Update form state as well
  };


  useEffect(()=>{
    getCompanyDetails(compnayId);
  },[])

  useEffect(() => {
    console.log("Updated companyData:", companyData);
  }, [companyData]);


  const getCompanyDetails = async (id: string ) => {
    try {
      const response = await fetch(`/api/company?id=${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch company details");
      }
      const data = await response.json();
      console.log(data[0].addresses);
  

      // Update form values with company data
     
    } catch (error) {
      console.error("Error fetching company details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch company details",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-8">
          {isAddingAddress && (
            <Card>
              <CardHeader>
                <CardTitle>Delivery Address</CardTitle>
                <div className="flex justify-between items-center">
                  <Select
                    onValueChange={(value) => {
                      handlecurrentAddress(value);
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Address" />
                    </SelectTrigger>
                    <SelectContent>
                      {addresses.map((item, idx) => (
                        <SelectItem key={idx} value={item.title}>
                          {item.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    type="button"
                    onClick={() => setIsAddingAddress(false)}
                    className="my-4 bg-primary"
                  >
                    Add Address
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem className="col-span-3">
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={currentAddress?.street || ""}
                            onChange={(e) => handleChange("street", e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={currentAddress?.country || ""}
                              onChange={(e) => handleChange("country", e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={currentAddress?.state || ""}
                              onChange={(e) => handleChange("state", e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={currentAddress?.city || ""}
                              onChange={(e) => handleChange("city", e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zip Code</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={currentAddress?.zipCode || ""}
                              onChange={(e) => handleChange("zipCode", e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Button type="submit" className="mt-4 w-28 my-4 bg-primary">
                  Save
                </Button>
              </CardContent>
            </Card>
          )}
        </form>
      </Form>

      <div className="mt-4">
        {!isAddingAddress && (
          <AddressForm
            companyId={compnayId}
            isAddingAddress={() => setIsAddingAddress(true)}
          />
        )}
      </div>
    </div>
  );
};

export default AddressUpdate;

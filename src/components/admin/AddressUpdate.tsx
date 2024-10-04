import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { addresses } from "./address";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AddressformSchema } from "@/schemas/Company";
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
import AddressForm from "./AddressForm";
import { Company } from "@/types";
import { toast } from "@/components/ui/use-toast";

type FormValues = z.infer<typeof AddressformSchema>;

interface Props {
  companyId: string;
}

const AddressUpdate: React.FC<Props> = ({ companyId }) => {
  const [isAddingAddress, setIsAddingAddress] = useState<boolean>(false);
  const [companyData, setCompanyData] = useState<any>();

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

  useEffect(() => {
    getCompanyDetails(companyId);
    if (companyData) {
      console.log("Updated companyData:", companyData);
    }
  }, [companyId]);

  // New useEffect to log companyData when it changes
  useEffect(() => {
    if (companyData) {
      console.log("Updated companyData:", companyData);
    }
  }, [companyData]);

  const getCompanyDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/company/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch company details");
      }
      const data = await response.json();

      console.log("res data", data);

      setCompanyData(data);
    } catch (error) {
      console.error("Error fetching company details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch company details",
        variant: "destructive",
      });
    }
  };

  const handleAddressSelect = (searchTitle: string) => {
    const selectedAddress = addresses.find(
      (address) => address.title.toLowerCase() === searchTitle.toLowerCase()
    );
    if (selectedAddress) {
      form.reset(selectedAddress);
    }
  };

  const onSubmitForm = async (data: FormValues) => {
    console.log(data);

    const formData = new FormData();

    const addresses = [
      {
        ...data,
        date: new Date().toISOString(),
      },
    ];

    formData.append("addresses", JSON.stringify(addresses));

    const response = await fetch(`/api/company/${companyId}`, {
      method: "PUT",
      body: formData,
    });

    console.log(response);
  };

  return (
    <div>
      {!isAddingAddress && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmitForm)}
            className="space-y-8"
          >
            <Card>
              <CardHeader>
                <CardTitle>Delivery Address</CardTitle>
                <div className="flex justify-between items-center">
                  <Select onValueChange={handleAddressSelect}>
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
                    onClick={() => setIsAddingAddress(true)}
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
                          <Input {...field} />
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
                            <Input {...field} />
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
                            <Input {...field} />
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
                            <Input {...field} />
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
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Button type="submit" className="mt-4 w-28 my-4 bg-primary">
                  Submit
                </Button>
              </CardContent>
            </Card>
          </form>
        </Form>
      )}

      {isAddingAddress && (
        <AddressForm
          companyId={companyId}
          isAddingAddress={() => setIsAddingAddress(false)}
        />
      )}
    </div>
  );
};

export default AddressUpdate;

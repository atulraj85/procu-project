import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import NewAddress from "./NewAddress";
import { toast } from "@/components/ui/use-toast";
import { AddressInterface } from "@/types";

type FormValues = z.infer<typeof AddressformSchema>;

interface Props {
  companyId: string;
  setRfpAddress: React.Dispatch<React.SetStateAction<string>>;
}

const CompanyAddresses: React.FC<Props> = ({ companyId, setRfpAddress }) => {
  const [isAddingAddress, setIsAddingAddress] = useState<boolean>(false);
  const [addresses, setAddresses] = useState<AddressInterface[] | null>(null);
  const [currAddressID, setCurrAddressID] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(AddressformSchema),
    defaultValues: {
      addressName: "",
      street: "",
      country: "",
      state: "",
      city: "",
      postalCode: "",
    },
  });

  const getAddresses = async (id: string) => {
    try {
      const response = await fetch(`/api/company/${id}/address`);
      if (!response.ok) {
        throw new Error("Failed to fetch Addresses");
      }
      const data = await response.json();
      console.log("Fetched addresses:", data);
      setAddresses(data);
    } catch (error) {
      console.error("Error fetching Addresses:", error);
      toast({
        title: "Error",
        description: "Error fetching Addresses",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    getAddresses(companyId);
    form.reset({
      addressName: "",
      street: "",
      country: "",
      state: "",
      city: "",
      postalCode: "",
    });
  }, [companyId, isAddingAddress]);

  const handleAddressSelect = (searchTitle: string) => {
    const selectedAddress = addresses?.find(
      (address) =>
        address.addressName.toLowerCase() === searchTitle.toLowerCase()
    );
    if (selectedAddress) {
      setCurrAddressID(selectedAddress.id);
      form.reset(selectedAddress);
      console.log(selectedAddress.addressName);
      console.log(selectedAddress);
    }
  };

  const onSubmitForm = async (data: FormValues) => {
    setIsSaving(true);
    console.log(data);

    const {street, city, postalCode, state, country  } = data;

    const address = `${street}, ${city}, ${postalCode}, ${state}, ${country}`;
    console.log(address);

    setRfpAddress(address);

    toast({
            title: "Success",
            description: "Delivery Address Selected",
            
          });

          setIsSaving(false);
    // const FormData = {
    //   ...data,
    //   addressType: "SHIPPING",
    // };

    // try {
    //   const response = await fetch(
    //     `/api/company/${companyId}/address/${currAddressID}`,
    //     {
    //       method: "PUT",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       body: JSON.stringify(FormData),
    //     }
    //   );

    //   if (!response.ok) {
    //     throw new Error("Failed to update address");
    //   }

    //   toast({
    //     title: "Success",
    //     description: "Address updated successfully",
    //   });

    //   getAddresses(companyId);
    // } catch (error) {
    //   console.error("Error updating address:", error);
    //   toast({
    //     title: "Error",
    //     description: "Failed to update address",
    //     variant: "destructive",
    //   });
    // } finally {
    //   setIsSaving(false);
    // }
  };

  const toggleAddingAddress = () => {
    setIsAddingAddress((prev) => !prev);
  };

  return (
    <div>
      {!isAddingAddress ? (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmitForm)}
            className="space-y-8"
          >
            <Card>
              <CardHeader>
                <CardTitle>Address Details</CardTitle>
                <div className="flex justify-between items-center">
                  <Select onValueChange={handleAddressSelect}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Address" />
                    </SelectTrigger>
                    <SelectContent>
                      {addresses?.map((item, idx) => (
                        <SelectItem key={idx + 1} value={item.addressName}>
                          {item.addressName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    type="button"
                    onClick={toggleAddingAddress}
                    className="my-4 bg-primary"
                  >
                    New Address
                  </Button>
                </div>
              </CardHeader>

              {addresses?.length === 0 ? (
                <div className="item-center justify-center flex m-10">
                  Please create a new address
                </div>
              ) : (
                <CardContent>
                  <div className="flex flex-col gap-2">
                    <FormField
                      control={form.control}
                      name="street"
                      render={({ field }) => (
                        <FormItem className="col-span-3">
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input {...field} disabled />
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
                              <Input {...field} disabled/>
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
                              <Input {...field} disabled/>
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
                              <Input {...field} disabled/>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Zip Code</FormLabel>
                            <FormControl>
                              <Input {...field} disabled/>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="mt-4 w-36 my-4 bg-primary"
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Select Address"}
                  </Button>
                </CardContent>
              )}
            </Card>
          </form>
        </Form>
      ) : (
        <NewAddress
          companyId={companyId} setRfpAddress={setRfpAddress}
          isAddingAddress={toggleAddingAddress}
        />
      )}
    </div>
  );
};

export default CompanyAddresses;

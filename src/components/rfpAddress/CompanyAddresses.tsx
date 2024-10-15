import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AddressformSchema } from "@/schemas/Company";
import { IoIosAddCircle } from "react-icons/io";
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

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import NewAddress from "./NewAddress";
import { toast } from "@/components/ui/use-toast";
import { AddressInterface } from "@/types";
import { cosineDistance } from "drizzle-orm";

type FormValues = z.infer<typeof AddressformSchema>;

interface Props {
  companyId: string ;
  setRfpAddress: React.Dispatch<React.SetStateAction<string>>;
}

const CompanyAddresses: React.FC<Props> = ({ companyId, setRfpAddress }) => {
  const [isAddingAddress, setIsAddingAddress] = useState<boolean>(true);
  const [addresses, setAddresses] = useState<AddressInterface[] | null>(null);
  const [currAddressID, setCurrAddressID] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [selectedAddr, setSelectedAddr] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState(false);

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

    const address = `${selectedAddress?.street}, ${selectedAddress?.city}, ${selectedAddress?.postalCode}, ${selectedAddress?.state}, ${selectedAddress?.country}`;
    setSelectedAddr(address);
    console.log(address);
    setRfpAddress(address);
  };

  const onSubmitForm = async (data: FormValues) => {
    setIsSaving(true);
    console.log(data);

    const { street, city, postalCode, state, country } = data;

    const address = `${street}, ${city}, ${postalCode}, ${state}, ${country}`;
    console.log(address);

    setRfpAddress(address);

    toast({
      title: "Success",
      description: "Delivery Address Selected",
    });

    setIsSaving(false);
    
  };

  const toggleAddingAddress = () => {
    setIsAddingAddress((prev)=> prev);
    setNewAddress((prev) => !prev);

  };

  const handleNewAdress = ()=>{
    setIsAddingAddress(false);
    setTimeout(()=>{
      setIsAddingAddress(true);
    }, 2000);
    // setSelectedAddr("");
  }

  return (
    <div>
      
      <Card>
        <CardHeader>
          <CardTitle></CardTitle>
          <div className="flex gap-6">

          {isAddingAddress && <Select onValueChange={handleAddressSelect}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Address" />
              </SelectTrigger>
              <SelectContent>
                {addresses?.map((item, idx) => (
                  <SelectItem key={idx} value={item.addressName}>
                    {item.addressName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
      }

            {/* <Button
              type="button"
              onClick={toggleAddingAddress}
              className="my-4 bg-primary"
            >
              New Address

            </Button> */}
          <div className="flex gap-2  w-full">
            
            {selectedAddr && <div className={`w-[50%] ${selectedAddr ? "": "hidden" }`}>
            
              <Input readOnly type="text" value={selectedAddr} className=" col-span-1" />
            
            </div>}

            <Sheet>
              <SheetTrigger>
                <div className="relative group">
                  <IoIosAddCircle className="text-3xl cursor-pointer text-green-300" />
                  {/* Hover text */}
                  <span className="absolute -bottom-6 left-0 opacity-0 text-sm text-gray-600 transition-opacity duration-300 group-hover:opacity-100">
                    New 
                  </span>
                </div>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Add new Delivery Address</SheetTitle>
                  <NewAddress
                    companyId={companyId}
                    setRfpAddress={setRfpAddress}
                    isAddingAddress={toggleAddingAddress}
                    setSelectedAddr={setSelectedAddr}
                    handleNewAdress={handleNewAdress}
                  />
                </SheetHeader>
              </SheetContent>
            </Sheet>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* {!isAddingAddress ? (
      
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-8">
            {addresses?.length === 0 ? (
              <div className="item-center justify-center flex m-10">
                Please create a new address
              </div>
            ) : (
              <Card>
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
                              <Input {...field} disabled />
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
                              <Input {...field} disabled />
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
                              <Input {...field} disabled />
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
                              <Input {...field} disabled />
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
              </Card>
            )}
          </form>
        </Form>
      ) : ( */}

      {/* )} */}
    </div>
  );
};

export default CompanyAddresses;

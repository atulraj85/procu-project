import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddressformSchema, AddressformSchema2 } from "@/schemas/Company";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { CiEdit } from "react-icons/ci";
import { IoIosAddCircle } from "react-icons/io";
import * as z from "zod";
import EditAddress from "./EditAddress";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { AddressInterface } from "@/types";
import NewAddress from "./NewAddress";

type FormValues = z.infer<typeof AddressformSchema>;
type addrersProps = z.infer<typeof AddressformSchema2>;

interface Props {
  companyId: string;
  setRfpAddress: React.Dispatch<React.SetStateAction<string>>;
  errors: any;
  setErrors: any;
}

const CompanyAddresses: React.FC<Props> = ({
  companyId,
  setRfpAddress,
  errors,
  setErrors,
}) => {
  const [isAddingAddress, setIsAddingAddress] = useState<boolean>(true);
  const [addresses, setAddresses] = useState<AddressInterface[] | null>(null);
  const [currAddressID, setCurrAddressID] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [selectedAddr, setSelectedAddr] = useState<string | null>(null);
  const [addressProp, setAddressProp] = useState<addrersProps | null>(null);
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

  useEffect(() => {
    if (addresses) {
      handleAddressSelect(addresses[0].addressName);
    }
  }, [addresses]);

  const handleAddressSelect = (searchTitle: string) => {
    setAddressProp(null);
    errors.address = "";
    setErrors(errors);
    const selectedAddress = addresses?.find(
      (address) =>
        address.addressName.toLowerCase() === searchTitle.toLowerCase()
    );
    if (selectedAddress) {
      // setAddressProp(selectedAddress);
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

  // const onSubmitForm = async (data: FormValues) => {
  //   setIsSaving(true);
  //   console.log(data);

  //   const { street, city, postalCode, state, country } = data;

  //   const address = `${street}, ${city}, ${postalCode}, ${state}, ${country}`;
  //   console.log(address);

  //   setRfpAddress(address);

  //   toast({
  //     title: "Success",
  //     description: "Delivery Address Selected",
  //   });

  //   setIsSaving(false);

  // };

  const toggleAddingAddress = () => {
    setIsAddingAddress((prev) => prev);
    setNewAddress((prev) => !prev);
  };

  const handleNewAdress = () => {
    setIsAddingAddress(false);
    setTimeout(() => {
      setIsAddingAddress(true);
    }, 2000);
    // setSelectedAddr("");
  };

  return (
    <div>
      <Card>
        <CardHeader>
          {addresses && (
            <div className="flex gap-6">
              {isAddingAddress && (
                <Select
                  onValueChange={handleAddressSelect}
                  defaultValue={addresses[0].addressName}
                >
                  {" "}
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
              )}

              <div className="flex gap-4  w-full">
                {selectedAddr && (
                  <div className={`w-[50%] ${selectedAddr ? "" : "hidden"}`}>
                    <Input
                      readOnly
                      type="text"
                      value={selectedAddr}
                      className=" col-span-1"
                      onChange={() => {}}
                    />
                  </div>
                )}

                {errors.address && (
                  <p className="text-red-500 text-sm">{errors.address}</p>
                )}

                {addressProp && (
                  <Sheet>
                    <SheetTrigger>
                      <div className="relative group">
                        <CiEdit className="text-3xl cursor-pointer text-green-300" />
                        {/* Hover text */}
                        <span className="absolute -bottom-6 left-0 opacity-0 text-sm text-gray-600 transition-opacity duration-300 group-hover:opacity-100">
                          Edit
                        </span>
                      </div>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Edit Delivery Address</SheetTitle>
                        <EditAddress
                          addressProp={addressProp}
                          setAddressProp={setAddressProp}
                          setRfpAddress={setRfpAddress}
                          isAddingAddress={toggleAddingAddress}
                          setSelectedAddr={setSelectedAddr}
                          handleNewAdress={handleNewAdress}
                        />
                      </SheetHeader>
                    </SheetContent>
                  </Sheet>
                )}

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
                        setAddressProp={setAddressProp}
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
          )}
        </CardHeader>
      </Card>
    </div>
  );
};

export default CompanyAddresses;

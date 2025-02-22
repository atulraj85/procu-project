import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AddressformSchema } from "@/schemas/Company";
import { AddressformSchema2 } from "@/schemas/Company";
import { IoIosAddCircle } from "react-icons/io";
import { CiEdit } from "react-icons/ci";
import AddressForm from "./AddressForm";
import Edit from "./Edit";
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
import { toast } from "@/components/ui/use-toast";
import { AddressInterface } from "@/types";
import { cosineDistance } from "drizzle-orm";


type FormValues = z.infer<typeof AddressformSchema>;
type addressPropValue = z.infer<typeof AddressformSchema2>;

interface Props {
  companyId: string ;
//   setRfpAddress: React.Dispatch<React.SetStateAction<string>>;
}

const ViewAddress: React.FC<Props> = ({ companyId,  }) => {
  const [isAddingAddress, setIsAddingAddress] = useState<boolean>(true);
  const [addresses, setAddresses] = useState<AddressInterface[] | null>(null);
  const [currAddressID, setCurrAddressID] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [selectedAddr, setSelectedAddr] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState(false);
  const [addressProp, setAddressProp] = useState< AddressInterface| null>(null);
  

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
      // form.reset(selectedAddress);
      console.log(selectedAddress.addressName);
      console.log(selectedAddress);
      setAddressProp(selectedAddress);
    }

    const address = `${selectedAddress?.street}, ${selectedAddress?.city}, ${selectedAddress?.postalCode}, ${selectedAddress?.state}, ${selectedAddress?.country}`;
    setSelectedAddr(address);
    console.log(address);
    
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

          <div className="flex gap-4  w-full">
            
            {selectedAddr && <div className={`w-[50%] ${selectedAddr ? "": "hidden" }`}>
            
              <Input readOnly type="text" value={selectedAddr} className=" col-span-1" />
            
            </div>}


           {addressProp && <Sheet>
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
                  <Edit
                    companyId={companyId}
                    setAddressProp={setAddressProp}
                    addressProp={addressProp}
                  />
                </SheetHeader>
              </SheetContent>
            </Sheet>}

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
                  <AddressForm
                    companyId={companyId}
                  />
                </SheetHeader>
              </SheetContent>
            </Sheet>
            </div>
          </div>
        </CardHeader>
      </Card>

   
    </div>
  );
};

export default ViewAddress;

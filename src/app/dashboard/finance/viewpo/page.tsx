"use client";
import { ProductList } from "@/components/new-manager/UpdateRFP2";
import Loader from "@/components/shared/Loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@radix-ui/react-label";
import { X } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

const Page = () => {
  const { control, setValue, getValues, register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchParams = useSearchParams();
  const rfp = searchParams.get("");
  const USER_ID = localStorage.getItem("USER_ID");
 console.log("register",register);
 
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch RFP data
        const rfpResponse = await fetch(`/api/rfp?rfpId=${rfp}`);
        if (!rfpResponse.ok) {
          throw new Error("Network response was not ok");
        }
        const rfpData = await rfpResponse.json();
        const rfpDetails = rfpData[0];
        console.log("rfpDetails",rfpDetails);
        

        // Set form values directly from the fetched RFP data
        setValue("companyName", rfpDetails.quotations[0]?.vendor?.companyName || "");
        setValue("companyGST", rfpDetails.quotations[0]?.vendor?.gstin || "");
        setValue("companyAddress", rfpDetails.quotations[0]?.vendor?.address || "");
        setValue("qutationid", rfpDetails.quotations[0]?.id || "");
        setValue("poId", rfpDetails.rfpId || ""); // This will be updated later
        setValue("orderNo", ""); // Set this based on your requirements
        setValue("ref", rfpDetails.quotations[0]?.refNo || ""); // Set this based on your requirements
        setValue("date", new Date().toISOString().split("T")[0]); // Set current date or any specific date
        setValue("deliveryLocation", rfpDetails.deliveryLocation || ""); // Set delivery location
        
        setValue("remarks", ""); // Initialize remarks field

        // Populate products if needed
        const preferredQuotationId = rfpDetails.preferredQuotationId;
        const preferredQuotation = rfpDetails.quotations.find(q => q.id === preferredQuotationId);
        if (preferredQuotation) {
          setValue("products", preferredQuotation.products || []);
        }

        // Fetch company details
        const companyResponse = await fetch('/api/company');
        if (!companyResponse.ok) {
          throw new Error("Network response was not ok");
        }
        const companyData = await companyResponse.json();
        const company = companyData[0]; // Assuming you want the first company
        console.log("company", company);
        
        // Set company details in the form
        setValue("companyName", company.name || "");
        setValue("companyGST", company.GST || "");
        setValue("companyid", company.id || "");
        setValue("companylogo", company.logo || "");
        
        setValue("companyAddress", company.addresses[0]?.street || ""); // Assuming you want the first address

        // Fetch PO ID from the API
        const poResponse = await fetch(`/api/po/poId`);
        if (!poResponse.ok) {
          throw new Error("Network response was not ok");
        }
        const poData = await poResponse.json();
        console.log("po",poData);
        
        setValue("poId", poData || ""); // Assuming the response has a field named poId

      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setValue, rfp]);
  

  const onSubmit = async (data) => {
    console.log("data",data);
    
    const payload = {
      poId: data.poId,
      quotationId: data.qutationid, // Correctly access the quotation ID from the form data
      userId: USER_ID, // Replace with actual user ID
      companyId: data.companyid, // Use the company ID from the form data
      rfpId: rfp, // Use the rfp directly from the search params
      remarks: data.remarks,
    };
    console.log(payload);
    try {
      const response = await fetch('/api/po', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const result = await response.json();
      console.log('Success:', result);
      // Handle success (e.g., show a success message, redirect, etc.)
    } catch (error) {
      console.error('Error:', error);
      // Handle error (e.g., show an error message)
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return ( 
    <div>
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Create Product Order</CardTitle>
          <Link href="/dashboard/finance">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="text-black-500 bg-red-400"
            >
              <X className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>

        <CardContent>
          <Card className="mb-2">
            <CardHeader>
              {/* <CardTitle className="text-lg">Company Details</CardTitle> */}
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
              <div>
                <Label className="font-bold text-[16px] text-slate-700">
                  Company Logo
                </Label>
                <div className="w-[50px] h-[50px] overflow-hidden ">
                  <Image
                    src={getValues("companylogo")} // Use the logo from the company data
                    alt={"logo"}
                    height={20}
                    width={20}
                    className="object-cover w-full h-full rounded-full"
                  />
                </div>
              </div>

              <div>
                <Label className="mb-2 font-bold text-[16px] text-slate-700">
                  Company Name
                </Label>
                <Input
                  disabled
                  {...register("companyName")}
                  placeholder="Name"
                  className="flex-1"
                />
              </div>

              <div>
                <Label className="mb-2 font-bold text-[16px] text-slate-700">
                  Company GST
                </Label>
                <Input
                  disabled
                  {...register("companyGST")}
                  className="text-[14px]"
                />
              </div>
              <div>
                <Label className="mb-2 font-bold text-[16px] text-slate-700">
                  Company Address
                </Label>
                <Textarea
                  disabled
                  {...register("companyAddress")}
                  className="text-[14px]"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-2">
            <CardHeader>
              <CardTitle className="text-lg">PO Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2">
              <div>
                <Label className="mb-2 font-bold text-[16px] text-slate-700">
                  PO-ID:{" "}
                </Label>
                <Input
                  disabled
                  {...register("poId")}
                  placeholder="POID"
                  className="flex-1"
                />
              </div>

              <div>
                <Label className="mb-2 font-bold text-[16px] text-slate-700">
                  Order No
                </Label>
                <Input
                  disabled
                  {...register("orderNo")}
                  className="text-[14px]"
                />
              </div>

              <div>
                <Label className="mb-2 font-bold text-[16px] text-slate-700">
                  Ref
                </Label>
                <Input
                  disabled
                  {...register("ref")}
                  className="text-[14px]"
                />
              </div>

              <div>
                <Label className="mb-2 font-bold text-[16px] text-slate-700">
                  Date
                </Label>
                <Input
                  disabled
                  type="date"
                  {...register("date")}
                  className="text-[14px]"
                />
              </div>
            </CardContent>
          </Card>

          <ProductList
            control={control}
            index={0}
            getValues={getValues}
            setValue={setValue}
            products={getValues("products") || []}
          />
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg text-slate-700">Shipping Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap">
            <div className="mx-4 flex-1">
              <Label className="font-bold text-[16px] text-slate-700 pb-2">Billing Address</Label>
              <Textarea
                disabled
                {...register("companyAddress")}
                className="text-[14px]"
              />
            </div>
            <div className="mx-4 flex-1">
              <Label className="font-bold text-[16px] text-slate-700 pb-2">Shipping Address</Label>
              <Textarea
                disabled
                {...register("deliveryLocation")} // Set delivery location
                className="text-[14px]"
              />
            </div>
          </div>
          <div className="mt-4">
            <Label className="font-bold text-[16px] text-slate-700 pb-2">Remarks</Label>
            <Textarea
              {...register("remarks")} // Register the remarks input
              className="text-[14px]"
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" onClick={handleSubmit(onSubmit)} className="mt-4">
        Submit
      </Button>
    </div>
  );
};

export default Page;

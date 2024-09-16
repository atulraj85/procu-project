"use client";
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
import Loader from "@/components/shared/Loader";

const Page = () => {
  const { control, setValue, getValues, register } = useForm();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchParams = useSearchParams();
  const rfp = searchParams.get("rfp");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/rfp?rfpId=${rfp}`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        const rfpData = data[0];

        // Set form values directly from the fetched data
        setValue("companyName", rfpData.quotations[0]?.vendor?.companyName || "");
        setValue("companyGST", rfpData.quotations[0]?.vendor?.gstin || "");
        setValue("companyAddress", rfpData.quotations[0]?.vendor?.address || "");
        setValue("poId", rfpData.rfpId || "");
        setValue("orderNo", ""); // Set this based on your requirements
        setValue("ref", ""); // Set this based on your requirements
        setValue("date", new Date().toISOString().split("T")[0]); // Set current date or any specific date

        // Set delivery location and remarks
        setValue("deliveryLocation", rfpData.deliveryLocation || ""); // Set delivery location
        setValue("remarks", ""); // Initialize remarks field

        // Populate products if needed
        const preferredQuotationId = rfpData.preferredQuotationId;
        const preferredQuotation = rfpData.quotations.find(q => q.id === preferredQuotationId);
        if (preferredQuotation) {
          setValue("products", preferredQuotation.products || []);
        }
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setValue, rfp]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const products = getValues("products") || [];

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
              <CardTitle className="text-lg">Company Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
              <div>
                <Label className="font-bold text-[16px] text-slate-700">
                  Company Logo
                </Label>
                <div className="w-[150px] h-[150px] overflow-hidden rounded-full">
                  <Image
                    src={"/company/logo.png"}
                    alt={"logo"}
                    height={50}
                    width={50}
                    className="object-cover w-full h-full"
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

          {/* Product Display Section */}
          <Card className="mb-2">
            <CardHeader>
              <CardTitle className="text-lg">Products</CardTitle>
            </CardHeader>
            <CardContent>
              {products.length > 0 ? (
                products.map((product, index) => (
                  <div key={index} className="border-b py-2">
                    <div className="flex justify-between">
                      <span className="font-bold">{product.name}</span>
                      <span className="text-gray-500">{product.price}</span>
                    </div>
                    <div className="text-sm text-gray-600">{product.description}</div>
                    <div className="flex justify-between mt-2">
                      <span>Quantity: {product.quantity}</span>
                      <span>Total: {product.totalPrice}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div>No products available.</div>
              )}
            </CardContent>
          </Card>

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
                {...register("deliveryLocation")} // Set  delivery location
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
    </div>
  );
};

export default Page;

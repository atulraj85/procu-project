<<<<<<< HEAD
"use client"
import React, { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
=======
"use client";
import { ProductList } from "@/components/new-manager/UpdateRFP2";
import Loader from "@/components/shared/Loader";
>>>>>>> backend
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@radix-ui/react-label";
<<<<<<< HEAD
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

interface CompanyAddress {
  street: string;
  city: string;
  postalCode: string;
}

interface Company {
  id: string;
  name: string;
  addresses: CompanyAddress[];
  gst?: string;
  // Add other fields as necessary
}

type Product = {
  id: string;
  name: string;
  modelNo: string;
  quantity: number;
  unitPrice?: number;
  gst?: string;
  totalPriceWithoutGST?: number;
  totalPriceWithGST?: number;
};

const ProductList = ({ control, index, getValues, setValue, rfpId }:any) => {
  const { fields } = useFieldArray({
    control,
    name: `quotations.${index}.products`,
  });
  const [error, setError] = useState<string | null>(null);
  const [rfpProducts, setRfpProducts] = useState<Product[]>([]);
  const [loading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchRFPProducts() {
      setIsLoading(true);
      if (rfpId) {
        try {
          const rfpProductsData = await fetch(`/api/rfpProductd/4887846-0242-4ece-b311-3089ed5f6fec`);
          const data = await rfpProductsData.json();

          const productsWithDetails: Product[] = await Promise.all(
            data.map(async (rfpProduct: any) => {
              const productData = await fetch(
                `/api/product?id=${rfpProduct.productId}`
              );

              const responseData = await productData.json();

              if (Array.isArray(responseData) && responseData.length > 0) {
                return responseData.map((product: any) => ({
                  id: product.id || null,
                  name: product.name || null,
                  modelNo: product.modelNo || null,
                  quantity: rfpProduct.quantity || 0,
                  amount: 0,
                  unitPrice: product.unitPrice || null,
                  gst: product.gst || null,
                  totalPriceWithoutGST: product.totalPriceWithoutGST || null,
                  totalPriceWithGST: product.totalPriceWithGST || null,
                }));
              }
              return []; // Return an empty array if responseData is not valid
            })
          );

          const flattenedProductsWithDetails = productsWithDetails.flat();

          console.log("productsWithDetails", flattenedProductsWithDetails);

          setRfpProducts(flattenedProductsWithDetails);
          setValue(
            `quotations.${index}.products`,
            flattenedProductsWithDetails
          );

          setError(null);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "An unknown error occurred"
          );
        } finally {
          setIsLoading(false);
        }
      }
    }

    fetchRFPProducts();
  }, [rfpId, setValue, index]);

  const calculateTotals = (
    unitPrice: number,
    quantity: number,
    gst: string
  ) => {
    const totalWithoutGST = unitPrice * quantity;
    const gstValue = gst === "NILL" ? 0 : parseFloat(gst);
    const totalWithGST = totalWithoutGST * (1 + gstValue / 100);
    return { totalWithoutGST, totalWithGST };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Products</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          <div className="grid grid-cols-7 gap-2 mb-2">
            <Label>Name</Label>
            <Label>Model No.</Label>
            <Label>Quantity</Label>
            <Label>Unit Price</Label>
            <Label>GST</Label>
            <Label>Total (Without GST)</Label>
            <Label>Total (With GST)</Label>
          </div>

          {loading ? (
            <div>Fetching Data...</div>
          ) : (
            fields.map((field, productIndex) => (
              <div key={field.id} className="grid grid-cols-7 gap-2 m-2">
                <Input
                  {...control.register(
                    `quotations.${index}.products.${productIndex}.name`
                  )}
                  readOnly
                />
                <Input
                  {...control.register(
                    `quotations.${index}.products.${productIndex}.modelNo`
                  )}
                  readOnly
                />
                <Input
                  {...control.register(
                    `quotations.${index}.products.${productIndex}.quantity`
                  )}
                  readOnly
                />
                <Controller
                  name={`quotations.${index}.products.${productIndex}.unitPrice`}
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => {
                        const unitPrice = parseFloat(e.target.value);
                        field.onChange(unitPrice);
                        const quantity = getValues(
                          `quotations.${index}.products.${productIndex}.quantity`
                        );
                        const gst = getValues(
                          `quotations.${index}.products.${productIndex}.gst`
                        );
                        const { totalWithoutGST, totalWithGST } =
                          calculateTotals(unitPrice, quantity, gst);

                        setValue(
                          `quotations.${index}.products.${productIndex}.totalPriceWithoutGST`,
                          totalWithoutGST
                        );
                        setValue(
                          `quotations.${index}.products.${productIndex}.totalPriceWithGST`,
                          totalWithGST
                        );
                      }}
                    />
                  )}
                />
                <Controller
                  name={`quotations.${index}.products.${productIndex}.gst`}
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        const unitPrice = getValues(
                          `quotations.${index}.products.${productIndex}.unitPrice`
                        );
                        const quantity = getValues(
                          `quotations.${index}.products.${productIndex}.quantity`
                        );
                        const { totalWithoutGST, totalWithGST } =
                          calculateTotals(unitPrice, quantity, value);
                        setValue(
                          `quotations.${index}.products.${productIndex}.totalPriceWithoutGST`,
                          totalWithoutGST
                        );
                        setValue(
                          `quotations.${index}.products.${productIndex}.totalPriceWithGST`,
                          totalWithGST
                        );
                      }}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select GST" />
                      </SelectTrigger>
                      <SelectContent>
                        {["NILL", "0", "3", "5", "12", "18", "28"].map(
                          (gst) => (
                            <SelectItem key={gst} value={gst}>
                              {gst}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                <Input
                  {...control.register(
                    `quotations.${index}.products.${productIndex}.totalPriceWithoutGST`
                  )}
                  readOnly
                  value={(
                    getValues(
                      `quotations.${index}.products.${productIndex}.totalPriceWithoutGST`
                    ) || 0
                  ).toFixed(2)}
                />
                <Input
                  {...control.register(
                    `quotations.${index}.products.${productIndex}.totalPriceWithGST`
                  )}
                  readOnly
                  value={(
                    getValues(
                      `quotations.${index}.products.${productIndex}.totalPriceWithGST`
                    ) || 0
                  ).toFixed(2)}
                />
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
=======
import { X } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";

const Page = () => {
  const { control, handleSubmit, setValue, getValues } = useForm();

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
                <Label className=" font-bold text-[16px] text-slate-700">
                  Company Logo
                </Label>
                <div className="w-[150px] h-[150px] overflow-hidden rounded-full">
                  <Image
                    src={"/company/logo.png"}
                    alt={"logo"}
                    height={150}
                    width={150}
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
                  value={""}
                  placeholder="Name"
                  className="flex-1"
                />
              </div>

              <div>
                <Label className="mb-2 font-bold text-[16px] text-slate-700">
                  Company GST
                </Label>
                <Input className="text-[14px]"></Input>
              </div>
              <div>
                <Label className="mb-2 font-bold text-[16px] text-slate-700">
                  Company Address
                </Label>
                <Textarea className="text-[14px]"></Textarea>
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
                  value={""}
                  placeholder="POID"
                  className="flex-1"
                />
              </div>

              <div>
                <Label className="mb-2 font-bold text-[16px] text-slate-700">
                  Order No
                </Label>
                <Input className="text-[14px]"></Input>
              </div>

              <div>
                <Label className="mb-2 font-bold text-[16px] text-slate-700">
                  Ref
                </Label>
                <Input className="text-[14px]"></Input>
              </div>

              <div>
                <Label className="mb-2 font-bold text-[16px] text-slate-700">
                  Date
                </Label>
                <Input type="date" className="text-[14px]"></Input>
              </div>
            </CardContent>
          </Card>

          <ProductList
            control={control}
            index={0}
            getValues={getValues}
            setValue={setValue}
            rfpId={"3e2cdb1a-3b27-440b-a019-0694638fd223"}
          />
        </CardContent>
      </Card>
    </div>
>>>>>>> backend
  );
};

const Page = () => {
  const [company, setCompany] = useState<Company | null>(null);
  const [rfpData, setRfpData] = useState<any>({});
  const searchParams = useSearchParams();
  const rfp = searchParams.get("rfp");

  const { control, getValues, setValue } = useForm({
    defaultValues: {
      quotations: [{ products: [] }],
    },
  });

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await fetch(`/api/company?rfpId=${encodeURIComponent(rfp)}`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        console.log("company", data[0].addresses);
        setCompany(data[0]);
      } catch (error) {
        console.error("Error fetching company data:", error);
      }
    };

    const fetchRfpData = async () => {
      try {
        const response = await fetch(`/api/rfp?rfpId=${encodeURIComponent(rfp)}`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        console.log(data[0]);
        setRfpData(data[0]);
      } catch (error) {
        console.error("Error fetching RFP data:", error);
      }
    };

    fetchCompanyData();
    fetchRfpData();
  }, [rfp]);

  return (
    <div>
      <div className="flex justify-between pb-8">
        <h1 className="font-bold text-[24px]">Create PO</h1>
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
      </div>
      
      {/* Company Information Card */}
      <Card className="mb-5">
        <div className="flex flex-wrap justify-between p-4">
          <div>
            <Label className="font-bold text-[16px] text-slate-700 pb-2">Company Name</Label>
            <Input className="text-[14px]" value={company?.name || ''} readOnly />
          </div>
          <div>
            <Label className="font-bold text-[16px] text-slate-700 pb-2">Company GST</Label>
            <Input className="text-[14px]" value={company?.gst || ''} readOnly />
          </div>
          <div>
            <Label className="font-bold text-[16px] text-slate-700 pb-2">Company Address</Label>
            <Textarea 
              className="text-[14px]" 
              value={company?.addresses?.[0] ? `${company.addresses[0].street}, ${company.addresses[0].city}, ${company.addresses[0].postalCode}` : ''} 
              readOnly 
            />
          </div>
        </div>
      </Card>

      {/* Purchase Order Card */}
      <Label className="font-bold text-[16px] text-slate-700 pb-2">Purchase Order</Label>
      <Card className="mt-4 mb-4">
        <div className="flex flex-wrap justify-between p-4">
          <div>
            <Label className="font-bold text-[16px] text-slate-700 pb-2">Company Address</Label>
            <Textarea className="text-[14px]" />
          </div>
          <div>
            <Label className="font-bold text-[16px] text-slate-700 pb-2">Company GST</Label>
            <Input className="text-[14px]" />
          </div>
          <div>
            <Label className="font-bold text-[16px] text-slate-700 pb-2">Order No</Label>
            <Input className="text-[14px]" />
          </div>
          <div>
            <Label className="font-bold text-[16px] text-slate-700 pb-2">Ref</Label>
            <Input className="text-[14px]" />
          </div>
          <div>
            <Label className="font-bold text-[16px] text-slate-700 pb-2">Date</Label>
            <Input className="text-[14px]" type="date" />
          </div>
        </div>
      </Card>

      {/* ProductList Component */}
      <ProductList
        control={control}
        index={0}
        getValues={getValues}
        setValue={setValue}
        rfpId={rfp}
      />

      {/* Shipping Information Card */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg text-slate-700">Shipping Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap">
            <div className="mx-4 flex-1">
              <Label className="font-bold text-[16px] text-slate-700 pb-2">Billing Address</Label>
              <Textarea className="text-[14px]" />
            </div>
            <div className="mx-4 flex-1">
              <Label className="font-bold text-[16px] text-slate-700 pb-2">Shipping Address</Label>
              <Textarea className="text-[14px]" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
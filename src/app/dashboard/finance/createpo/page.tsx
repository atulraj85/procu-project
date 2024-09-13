"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@radix-ui/react-label";
import { Select } from "@radix-ui/react-select";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import React, { useEffect, useState } from "react";
import { Controller, useFieldArray } from "react-hook-form";



const Page = () => {
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
  const ProductList = ({
    control,
    index,
    getValues,
    setValue,
    rfpId,
  }: {
    control: any;
    index: number;
    getValues: any;
    setValue: any;
    rfpId: string;
  }) => {
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
            const rfpProductsData = await fetch(`/api/rfpProduct?rfpId=${rfpId}`);
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
  
            // if (globalFormData.has("quotations")) {
            //   const quotations = JSON.parse(
            //     globalFormData.get("quotations") as string
            //   );
            //   quotations[index] = {
            //     ...quotations[index],
            //     products: flattenedProductsWithDetails,
            //   };
            //   globalFormData.set("quotations", JSON.stringify(quotations));
            // }
  
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
    }, [rfpId]);
  
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
  }
  return (
   <div>
    <div className="flex justify-end pb-8">
        <Link href="/dashboard/finance">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="text-black-500 bg-red-400"
          >
            <X className="h-4 w-4" />
          </Button>{" "}
        </Link>
      </div>
    <Card>
      <div className="flex flex-wrap justify-between p-4">
        <div>
          <div>
            <Label className="font-bold">Company Name</Label>
            <Input className="text-[14px]"></Input>
          </div>
        </div>
        
          <div>
            <Label className="font-bold">Company Address</Label>
            <Textarea className="text-[14px]"></Textarea>
          </div>
          <div>
            <Label className="font-bold">Company GST</Label>
            <Input className="text-[14px]"></Input>
          </div>
        </div>
      </Card>

      <Label className="font-bold my-4"> Purchase Order </Label>
      <Card>
      <div className="flex flex-wrap justify-between p-4">
        
        
          <div>
            <Label className="font-bold">Company Address</Label>
            <Textarea className="text-[14px]"></Textarea>
          </div>
          <div>
            <Label className="font-bold">Company GST</Label>
            <Input className="text-[14px]"></Input>
          </div>
          <div>
            <Label className="font-bold">Order No</Label>
            <Input className="text-[14px]"></Input>
          </div>
          <div>
            <Label className="font-bold">Ref</Label>
            <Input className="text-[14px]"></Input>
          </div>
         
          <div>
            <Label className="font-bold">Date</Label>
            <Input className="text-[14px]"></Input>
          </div>
        </div>
      </Card>
  

 
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
            <>Fetching Data</>
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

                        const quotations = JSON.parse(
                          globalFormData.get("quotations") as string
                        );
                        quotations[index].products[productIndex].unitPrice =
                          unitPrice;
                        quotations[index].products[
                          productIndex
                        ].totalPriceWithoutGST = totalWithoutGST;
                        quotations[index].products[
                          productIndex
                        ].totalPriceWithGST = totalWithGST;
                        globalFormData.set(
                          "quotations",
                          JSON.stringify(quotations)
                        );

                        // setValue(
                        //   `quotations.${index}.products.${productIndex}.totalPriceWithoutGST`,
                        //   totalWithoutGST
                        // );
                        // setValue(
                        //   `quotations.${index}.products.${productIndex}.totalPriceWithGST`,
                        //   totalWithGST
                        // );
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
  

      
   </div>
  );
};

export default Page;

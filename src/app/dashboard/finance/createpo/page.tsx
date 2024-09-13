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
  );
};

export default Page;

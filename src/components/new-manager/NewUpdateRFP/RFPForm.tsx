import React from "react";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { rfpSchema } from "@/schemas/RFPSchema";
import { Label } from "@/components/ui/label";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { X } from "lucide-react";
import VendorSelector from "./Vendor";

type RFPFormData = z.infer<typeof rfpSchema>;

interface RFPFormProps {
  initialData: any;
}

const RFPForm: React.FC<RFPFormProps> = ({ initialData }: RFPFormProps) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RFPFormData>({
    resolver: zodResolver(rfpSchema),
    defaultValues: initialData,
  });

  const {
    fields: quotationFields,
    append: appendQuotation,
    remove: removeQuotation,
  } = useFieldArray({
    control,
    name: "quotations",
  });

  console.log("quotationFields", quotationFields);

  console.log(errors);

  const onSubmit = (data: any) => {
    console.log("RFP Data form", data);
    console.log(errors);
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <div className="flex justify-between mt-2 mb-3 px-6">
              <div className="flex flex-col">
                <div className="flex items-center mb-2">
                  <Label className="font-bold text-md border border-black rounded-full mr-4 px-3 py-1">
                    {initialData.requirementType === "Product" ? "P" : "S"}
                  </Label>
                  <Label>RFP ID: {initialData.rfpId}</Label>
                </div>

                {/* Product Details */}
                <div className="ml-12">
                  {initialData.products.map(
                    (product: any, index: React.Key | null | undefined) => (
                      <div key={index} className="flex flex-col mb-1">
                        <div className="flex items-center space-x-4">
                          <Label className="font-medium">
                            Name: {product.name}
                          </Label>
                          <Label className="font-medium">
                            Model: {product.modelNo}
                          </Label>
                          <Label className="font-medium">
                            Qty: {product.quantity}
                          </Label>
                        </div>
                        {product.description && (
                          <Label className="text-sm text-gray-600">
                            Description: {product.description}
                          </Label>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="flex">
                <div className="">
                  <Label>
                    RFP Date:{" "}
                    {new Date(initialData.dateOfOrdering).toLocaleDateString()}
                  </Label>
                  <div className="space-y-2">
                    <Label>
                      Exp. Delivery Date:{" "}
                      {new Date(
                        initialData.deliveryByDate
                      ).toLocaleDateString()}
                    </Label>
                  </div>
                </div>
                <div className="pl-3 justify-end">
                  <Link href="/dashboard/manager">
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
              </div>
            </div>
          </CardHeader>
        </Card>

        <label
          htmlFor="rfpId"
          className="block text-sm font-medium text-gray-700"
        >
          RFP ID
        </label>
        <input
          type="text"
          id="rfpId"
          {...register("rfpId")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
        {errors.rfpId && (
          <p className="mt-1 text-sm text-red-600">{errors.rfpId.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="rfpStatus"
          className="block text-sm font-medium text-gray-700"
        >
          RFP Status
        </label>
        <input
          type="text"
          id="rfpStatus"
          {...register("rfpStatus")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
        {errors.rfpStatus && (
          <p className="mt-1 text-sm text-red-600">
            {errors.rfpStatus.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="preferredQuotationId"
          className="block text-sm font-medium text-gray-700"
        >
          Preferred Quotation ID
        </label>
        <input
          type="text"
          id="preferredQuotationId"
          {...register("preferredQuotationId")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
        {errors.preferredQuotationId && (
          <p className="mt-1 text-sm text-red-600">
            {errors.preferredQuotationId.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="preferredVendorId"
          className="block text-sm font-medium text-gray-700"
        >
          Preferred Vendor ID
        </label>
        <input
          type="text"
          id="preferredVendorId"
          {...register("preferredVendorId")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
        {errors.preferredVendorId && (
          <p className="mt-1 text-sm text-red-600">
            {errors.preferredVendorId.message}
          </p>
        )}
      </div>

      <div>
        <h2 className="text-lg font-medium text-gray-900">Quotations</h2>
        {quotationFields.map((field, index) => (
          <div key={field.id} className="border p-4 mt-4">
            <h3 className="text-md font-medium text-gray-900">
              Quotation {index + 1}
            </h3>
            <div className="mt-2">
              <label
                htmlFor={`quotations.${index}.refNo`}
                className="block text-sm font-medium text-gray-700"
              >
                Reference Number
              </label>
              <input
                type="text"
                id={`quotations.${index}.refNo`}
                {...register(`quotations.${index}.refNo`)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              {errors.quotations?.[index]?.refNo && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.quotations[index].refNo.message}
                </p>
              )}
            </div>

            <VendorSelector
              index={0}
              setValue={undefined}
              vendor={undefined}
              
              errors={errors}
            />

            <button
              type="button"
              onClick={() => removeQuotation(index)}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Remove Quotation
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            appendQuotation({
              refNo: "",
              vendorId: "",
              totalAmount: 0,
              totalAmountWithoutGST: 0,
              products: [],
              otherCharges: [],
              total: { withGST: 0, withoutGST: 0 },
              supportingDocuments: [],
            })
          }
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Quotation
        </button>
      </div>

      <button
        type="submit"
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
      >
        Submit
      </button>
    </form>
  );
};

export default RFPForm;

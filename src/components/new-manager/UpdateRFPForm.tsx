import React, { ChangeEvent, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

type Quotation = {
  vendorId: string;
  billAmount: number;
  supportingDocuments: {
    quotation: File | null;
    bill: File | null;
    productCatalog: File | null;
  };
};

type FormData = {
  quotations: Quotation[];
  preferredVendorId: string;
};
type SupportingDocumentKeys = "quotation" | "bill" | "productCatalog";
export default function RFPUpdateForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [rfpId, setRfpId] = useState<string>("");

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      quotations: [
        {
          vendorId: "",
          billAmount: 0,
          supportingDocuments: {
            quotation: null,
            bill: null,
            productCatalog: null,
          },
        },
      ],
      preferredVendorId: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "quotations",
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        quotations: data.quotations.map((q) => ({
          vendorId: q.vendorId,
          billAmount: q.billAmount,
          supportingDocuments: [
            {
              quotation: q.supportingDocuments.quotation?.name,
              bill: q.supportingDocuments.bill?.name,
              productCatalog: q.supportingDocuments.productCatalog?.name,
            },
          ],
        })),
        preferredVendorId: data.preferredVendorId,
      })
    );

    data.quotations.forEach((quotation) => {
      Object.entries(quotation.supportingDocuments).forEach(([key, file]) => {
        if (file) {
          formData.append(`${quotation.vendorId}-${key}`, file);
        }
      });
    });

    try {
      const response = await fetch(`/api/rfp/quotation?id=${rfpId}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to update RFP");
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRFPIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRfpId(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Update RFP</CardTitle>
          <div>
            <Label htmlFor="rfpId">RFP ID</Label>
            <Input id="rfpId" value={rfpId} onChange={handleRFPIdChange} />
          </div>
        </CardHeader>
        <CardContent>
          {fields.map((field, index) => (
            <div key={field.id} className="space-y-4 mb-6">
              <h3 className="text-lg font-semibold">Quotation {index + 1}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`quotations.${index}.vendorId`}>
                    Vendor ID
                  </Label>
                  <Input
                    {...register(`quotations.${index}.vendorId`, {
                      required: "Vendor ID is required",
                    })}
                    id={`quotations.${index}.vendorId`}
                  />
                  {errors.quotations?.[index]?.vendorId && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.quotations[index]?.vendorId?.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor={`quotations.${index}.billAmount`}>
                    Bill Amount
                  </Label>
                  <Input
                    type="number"
                    {...register(`quotations.${index}.billAmount`, {
                      required: "Bill amount is required",
                      min: 0,
                    })}
                    id={`quotations.${index}.billAmount`}
                  />
                  {errors.quotations?.[index]?.billAmount && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.quotations[index]?.billAmount?.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2 w-[30%] ">
                <Label>Supporting Documents</Label>
                {["quotation", "bill", "productCatalog"].map((docType) => (
                  <div key={docType}>
                    <Label
                      htmlFor={`quotations.${index}.supportingDocuments.${docType}`}
                    >
                      {docType.charAt(0).toUpperCase() + docType.slice(1)}
                    </Label>
                    <Controller
                      name={
                        `quotations.${index}.supportingDocuments.${docType}` as const
                      }
                      control={control}
                      defaultValue={null}
                      render={({ field }) => (
                        <Input
                          type="file"
                          onChange={(e) =>
                            field.onChange(e.target.files?.[0] || null)
                          }
                          id={`quotations.${index}.supportingDocuments.${docType}`}
                        />
                      )}
                    />
                  </div>
                ))}
              </div>
              {index > 0 && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => remove(index)}
                >
                  Remove Quotation
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            onClick={() =>
              append({
                vendorId: "",
                billAmount: 0,
                supportingDocuments: {
                  quotation: null,
                  bill: null,
                  productCatalog: null,
                },
              })
            }
          >
            Add Quotation
          </Button>
        </CardContent>
      </Card>

      <div>
        <Label htmlFor="preferredVendorId">Preferred Vendor ID</Label>
        <Input
          {...register("preferredVendorId", {
            required: "Preferred Vendor ID is required",
          })}
          id="preferredVendorId"
        />
        {errors.preferredVendorId && (
          <p className="text-red-500 text-sm mt-1">
            {errors.preferredVendorId.message}
          </p>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>RFP updated successfully.</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating...
          </>
        ) : (
          "Update RFP"
        )}
      </Button>
    </form>
  );
}

"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { rfpSchema } from "@/schemas/RFPSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ChevronUp, Loader2, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import {
  Control,
  useFieldArray,
  useForm,
  UseFormSetValue,
  useWatch,
} from "react-hook-form";
import { z } from "zod";
import { Checkbox } from "../../ui/checkbox";
import { Textarea } from "../../ui/textarea";
import { toast } from "../../ui/use-toast";
import OtherChargesList from "./OtherCharges";
import { ProductList } from "./Product";
import SupportingDocumentsList from "./SupportingDocs";
import VendorSelector from "./Vendor";

const globalFormData = new FormData();

interface TotalComponentProps {
  control: Control<any>;
  index: number;
  setValue: UseFormSetValue<any>;
}
const TotalComponent: React.FC<TotalComponentProps> = ({
  control,
  index,
  setValue,
}) => {
  const quotation = useWatch({
    control,
    name: `quotations.${index}`,
  });

  useEffect(() => {
    // if (quotation.total) {
    //   setValue(`quotations.${index}.total`, quotation.total);
    // }
    const totalWithoutGST =
      (quotation.products?.reduce(
        (sum: number, product: { totalPriceWithoutGST: number | string }) =>
          sum + (Number(product.totalPriceWithoutGST) || 0),
        0
      ) || 0) +
      (quotation.otherCharges?.reduce(
        (sum: number, charge: { unitPrice: number | string }) =>
          sum + (Number(charge.unitPrice) || 0),
        0
      ) || 0);

    const totalWithGST =
      (quotation.products?.reduce(
        (sum: number, product: { totalPriceWithGST: number | string }) =>
          sum + (Number(product.totalPriceWithGST) || 0),
        0
      ) || 0) +
      (quotation.otherCharges?.reduce(
        (sum: number, charge: { gst: string; unitPrice: number | string }) => {
          const gstValue = charge.gst === "NILL" ? 0 : parseFloat(charge.gst);
          return sum + (Number(charge.unitPrice) || 0) * (1 + gstValue / 100);
        },
        0
      ) || 0);

    const newTotal = {
      withoutGST: Number(totalWithoutGST),
      withGST: Number(totalWithGST),
    };
    if (
      quotation.total?.withoutGST !== newTotal.withoutGST ||
      quotation.total?.withGST !== newTotal.withGST
    ) {
      setValue(`quotations.${index}.total`, newTotal, { shouldDirty: false });

      // Update globalFormData
      if (globalFormData.has("quotations")) {
        const quotations = JSON.parse(
          globalFormData.get("quotations") as string
        );
        quotations[index].total = newTotal;
        globalFormData.set("quotations", JSON.stringify(quotations));
      }
    }
  }, [quotation, setValue, index]);

  return (
    <div className="grid grid-cols-2 gap-2 rounded text-sm">
      <div>
        <Label className="font-bold">Taxable Amount (INR)</Label>
        <div>{quotation.total?.withoutGST || "0.00"} </div>
      </div>
      <div>
        <Label className="font-bold">Total (incl. GST) (INR)</Label>
        <div>{(quotation.total?.withGST || 0).toFixed(2)}</div>
      </div>
    </div>
  );
};

export default function RFPUpdateForm({
  rfpId,
  initialData,
}: {
  rfpId: string;
  initialData: any;
}) {
  console.log("initialData", initialData);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [files, setFiles] = useState<{ [key: string]: File }>({});
  const [preferredVendorIndex, setPreferredVendorIndex] = useState<
    number | null
  >(null);
  const [showReasonPrompt, setShowReasonPrompt] = useState(false);
  const [reason, setReason] = useState("");
  const quotationLimit = 3;
  const [preferredVendorId, setPreferredVendorId] = useState("");
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const router = useRouter();
  const [showPreferredQuotationError, setShowPreferredQuotationError] =
    useState("");

  const handleError = (errorMessage: string) => {
    setShowPreferredQuotationError(errorMessage);
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<z.infer<typeof rfpSchema>>({
    resolver: zodResolver(rfpSchema),
    defaultValues: {
      rfpId: initialData.rfpId,
      rfpStatus: initialData.rfpStatus,
      preferredQuotationId: initialData.preferredQuotationId,
      reason: "",
      // products: initialData.products,
      quotations: initialData.quotations.map((quotation: any) => ({
        id: quotation.id,
        refNo: quotation.refNo,
        vendorId: quotation.vendor?.id,
        vendor: quotation.vendor,
        totalAmount: quotation.totalAmount,
        totalAmountWithoutGST: quotation.totalAmountWithoutGST,
        products: quotation.products
          .filter((product: any) => product.type === "product")
          .map((product: any) => ({
            id: product.id,
            rfpProductId: product.rfpProductId,
            name: product.name,
            description: product.description,
            modelNo: product.modelNo,
            quantity: product.quantity,
            unitPrice: parseFloat(product.price),
            gst: product.gst.toString(),
            totalPriceWithoutGST: parseFloat(product.price) * product.quantity,
            totalPriceWithGST:
              parseFloat(product.price) *
              product.quantity *
              (1 + product.GST / 100),
          })),
        otherCharges: quotation.products
          .filter((product: any) => product.type === "otherCharge")
          .map((charge: any) => ({
            id: charge.id,
            name: "Other Charges",
            unitPrice: parseFloat(charge.price),
            gst: charge.gst.toString(),
          })),
        total: {
          withGST: parseFloat(quotation.totalAmount),
          withoutGST: parseFloat(quotation.totalAmountWithoutGST),
        },
        supportingDocuments: quotation.supportingDocuments.map((doc: any) => ({
          id: doc.id,
          name: doc.documentName,
          fileName: doc.documentName,
          location: doc.location,
        })),
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "quotations",
  });

  useEffect(() => {
    const currentQuotations = JSON.stringify(getValues().quotations);
    if (globalFormData.get("quotations") !== currentQuotations) {
      globalFormData.set("quotations", currentQuotations);
    }
  }, [getValues]);

  const handleDeleteClick = (index: number) => {
    setDeleteIndex(index);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteIndex !== null) {
      remove(deleteIndex);
      setIsDeleteDialogOpen(false);
      setDeleteIndex(null);
    }
  };

  const handleAddQuotation = useCallback(() => {
    if (fields.length < quotationLimit) {
      append({
        id: "",
        refNo: "",
        vendorId: "",
        products: [],
        otherCharges: [],
        total: { withGST: 0, withoutGST: 0 },
        supportingDocuments: [],
        totalAmount: 0,
        totalAmountWithoutGST: 0,
        vendor: null,
      });
      setShowReasonPrompt(true);
    } else {
      setShowReasonPrompt(false);
    }
  }, [fields.length, append]);

  const [visibleQuotations, setVisibleQuotations] = useState(
    fields.map(() => true)
  );

  const toggleQuotationVisibility = (index: number) => {
    setVisibleQuotations((prev) => {
      const newVisibility = [...prev];
      newVisibility[index] = !newVisibility[index];
      return newVisibility;
    });
  };

  const handleSubmitReasonAndAddQuotation = async (
    data: z.infer<typeof rfpSchema>
  ) => {
    console.log("Error: ", error);

    console.log("Submitting reason and adding quotation:", data);

    if (!preferredVendorId) {
      console.log("Heelo");
      setShowPreferredQuotationError("Please select a Quotation.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append("rfpId", rfpId);
      const serializedData = JSON.stringify({
        ...data,
        rfpStatus: fields.length < 3 ? "DRAFT" : "SUBMITTED",
      });
      formData.append("data", serializedData);
      formData.append("data", serializedData);

      // console.log(files);

      // Append files to formData
      Object.entries(files).forEach(([key, file]) => {
        formData.append(key, file);
      });

      // console.log("FormData to be sent:", Object.fromEntries(formData));

      const response = await fetch(`/api/rfp/quotation?id=${initialData.id}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Could not update quotations!`);
      }

      const result = await response.json();
      // console.log("RFP updated successfully:", result);
      setSuccess(true);

      toast({
        title: "🎉 Quotation Updated!",
        description: response.ok,
      });
      router.push("/dashboard/manager");
    } catch (err) {
      console.error("Error updating RFP:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: z.infer<typeof rfpSchema>) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);


    try {
      const formData = new FormData();
      formData.append("rfpId", rfpId);
      const serializedData = JSON.stringify({
        ...data,
        rfpStatus: fields.length < 3 ? "DRAFT" : "SUBMITTED",
      });
      formData.append("data", serializedData);
      formData.append("data", serializedData);

      // console.log(files);

      // Append files to formData
      Object.entries(files).forEach(([key, file]) => {
        formData.append(key, file);
      });

      // console.log("FormData to be sent:", Object.fromEntries(formData));

      const response = await fetch(`/api/rfp/quotation?id=${initialData.id}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Could not update quotations!`);
      }

      const result = await response.json();
      // console.log("RFP updated successfully:", result);
      setSuccess(true);

      toast({
        title: "🎉 Quotation Submitted!",
        description: response.ok,
      });
      router.push("/dashboard/manager");
    } catch (err) {
      console.error("Error updating RFP:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Update RFP</CardTitle>
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
        </CardHeader>
        <CardContent>
          {fields.map((field, index) => {
            const quotation = getValues(`quotations.${index}`);
            return (
              <div key={field.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between gap-2">
                  {/* Quotation ref */}
                  <div className="flex items-center gap-2">
                    <h3 className="text-md font-semibold">
                      Quotation {/* {index + 1} */}
                      Ref No.
                    </h3>
                    <Input {...control.register(`quotations.${index}.refNo`)} />
                    {errors?.quotations?.[index]?.refNo && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.quotations?.[index]?.refNo?.message ||
                          "Error message not available"}
                      </p>
                    )}
                  </div>

                  {/* Total amounts */}
                  <TotalComponent
                    setValue={setValue}
                    control={control}
                    index={index}
                  />
                  {/* Preferred Quote checkbox */}
                  <div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={preferredVendorIndex === index}
                        disabled={
                          preferredVendorIndex !== null &&
                          preferredVendorIndex !== index
                        }
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setValue("preferredVendorId", quotation.vendorId);
                            setPreferredVendorId(quotation.vendorId);
                            setShowPreferredQuotationError("");
                            setPreferredVendorIndex(index);
                          } else {
                            setPreferredVendorId("");
                            setPreferredVendorIndex(null);
                          }
                        }}
                      />
                      <div className="flex">
                        <Label className=" text-green-700">
                          Preferred Quote
                        </Label>
                        {showPreferredQuotationError && (
                          <p className="text-red-500 text-sm mt-1">
                            {showPreferredQuotationError ||
                              "Please select a Quotation."}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <span
                    className="cursor-pointer"
                    onClick={() => toggleQuotationVisibility(index)}
                  >
                    {visibleQuotations[index] ? <ChevronDown /> : <ChevronUp />}
                  </span>
                </div>

                {visibleQuotations[index] && (
                  <div>
                    {/* <div className="my-2">
                        <Label className=" text-green-700">
                          Reason for Preferring this Quotation{" "}
                        </Label>
                        {preferredVendorIndex === index && (
                          <Input
                            className="mb-2"
                            placeholder="Reason for preferring this vendor"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                          />
                        )}
                      </div> */}

                    <div className="py-2 w-3/4">
                      <VendorSelector
                        errors={errors}
                        setValue={setValue}
                        index={index}
                        vendor={quotation.vendor}
                        globalFormData={globalFormData}
                        setShowCheckbox={undefined}
                      />
                    </div>

                    <div className="mb-2">
                      <CardTitle className="text-lg">
                        Products / Services Details
                      </CardTitle>
                      <div>
                        <ProductList
                          errors={errors}
                          products={
                            quotation.products.length === 0
                              ? initialData.products
                              : quotation.products
                          }
                          setValue={setValue}
                          getValues={getValues}
                          control={control}
                          index={index}
                          globalFormData={globalFormData}
                        />

                        <OtherChargesList
                          control={control}
                          index={index}
                          formData={FormData}
                          globalFormData={globalFormData}
                          errors={errors}
                        />
                      </div>
                    </div>

                    <SupportingDocumentsList
                      errors={errors}
                      control={control}
                      index={index}
                      setValue={setValue}
                      files={files}
                      setFiles={setFiles}
                      getValues={getValues}
                    />

                    <Button
                      type="button"
                      onClick={() => handleDeleteClick(index)}
                      variant="outline"
                      size="icon"
                      className="text-red-500 w-1/1 p-2 mt-2"
                    >
                      {/* <X className="h-4 w-4" /> */}
                      <Trash2 className="h-4 w-4" />
                      {"  "}
                      Remove Quotation
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
          {fields.length < quotationLimit && (
            <Button
              className="bg-primary mt-2"
              type="button"
              onClick={handleAddQuotation}
            >
              Add Quotation
            </Button>
          )}
        </CardContent>
      </Card>

      {isDeleteDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
            <p className="mb-4">
              Are you sure you want to delete this quotation? This action cannot
              be undone.
            </p>
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

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

      {fields.length === 3 ? (
        <Button className="bg-primary" type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit RFP"
          )}
        </Button>
      ) : (
        <div>
          <Textarea
            className="w-1/3 mb-2"
            placeholder="Reason for adding less than 3 quotations"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          {errors?.reason && (
            <p className="text-red-500 text-sm mt-1">{errors.reason.message}</p>
          )}

          <Button
            type="submit"
            className="bg-primary"
            onClick={() => {
              const formData = getValues();
              if (reason) {
                setValue("reason", reason);
                handleSubmitReasonAndAddQuotation(formData);
                setReason("");
              }
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Reason and Add Quotation"
            )}
          </Button>
        </div>
      )}
    </form>
  );
}

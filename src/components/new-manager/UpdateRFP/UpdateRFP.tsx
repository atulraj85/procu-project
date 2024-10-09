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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
    if (!quotation) return;

    const calculateTotals = () => {
      // Calculate total without GST
      const productsTotal =
        quotation.products?.reduce((sum: number, product: any) => {
          return sum + (Number(product.totalPriceWithoutGST) || 0);
        }, 0) || 0;

      const otherChargesTotal =
        quotation.otherCharges?.reduce((sum: number, charge: any) => {
          return sum + (Number(charge.unitPrice) || 0);
        }, 0) || 0;

      const totalWithoutGST = productsTotal + otherChargesTotal;

      // Calculate total with GST
      const productsTotalWithGST =
        quotation.products?.reduce((sum: number, product: any) => {
          const gstValue = product.gst === "NILL" ? 0 : parseFloat(product.gst);
          const priceWithGST =
            (Number(product.unitPrice) || 0) *
            product.quantity *
            (1 + gstValue / 100);
          return sum + priceWithGST;
        }, 0) || 0;

      const otherChargesTotalWithGST =
        quotation.otherCharges?.reduce((sum: number, charge: any) => {
          const gstValue = charge.gst === "NILL" ? 0 : parseFloat(charge.gst);
          const chargeWithGST =
            (Number(charge.unitPrice) || 0) * (1 + gstValue / 100);
          return sum + chargeWithGST;
        }, 0) || 0;

      const totalWithGST = productsTotalWithGST + otherChargesTotalWithGST;

      return {
        withoutGST: Number(totalWithoutGST),
        withGST: Number(totalWithGST),
      };
    };

    // Only update if the quotation has products or other charges
    if (quotation.products?.length > 0 || quotation.otherCharges?.length > 0) {
      const newTotal = calculateTotals();

      // Only update if values have changed significantly (using small epsilon for float comparison)
      const hasChanged =
        !quotation.total ||
        Math.abs(quotation.total.withoutGST - newTotal.withoutGST) > 0.01 ||
        Math.abs(quotation.total.withGST - newTotal.withGST) > 0.01;

      if (hasChanged) {
        setValue(`quotations.${index}.total`, newTotal, { shouldDirty: false });

        // Update globalFormData
        try {
          if (globalFormData.has("quotations")) {
            const formDataValue = globalFormData.get("quotations");
            if (formDataValue && typeof formDataValue === "string") {
              const quotations = JSON.parse(formDataValue);
              if (
                quotations &&
                Array.isArray(quotations) &&
                quotations[index]
              ) {
                quotations[index].total = newTotal;
                globalFormData.set("quotations", JSON.stringify(quotations));
              }
            }
          }
        } catch (error) {
          console.error("Error updating globalFormData:", error);
        }
      }
    }
  }, [quotation, setValue, index]);

  // Format numbers for display
  const formatCurrency = (value: number | undefined): string => {
    if (value === undefined) return "0.00";
    return value.toFixed(2);
  };

  return (
    <div className="grid grid-cols-2 gap-2 rounded text-sm ">
      <div className="text-gray-400">
        <Label className="font-bold">Taxable Amount (INR)</Label>
        <div className="text-base font-medium">
          {formatCurrency(quotation?.total?.withoutGST)}
        </div>
      </div>
      <div className="text-gray-400">
        <Label className="font-bold">Total (incl. GST) (INR)</Label>
        <div className="text-base font-medium">
          {formatCurrency(quotation?.total?.withGST)}
        </div>
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
  // console.log("initialData", initialData);

  const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [files, setFiles] = useState<{ [key: string]: File }>({});
  const [preferredVendorIndex, setPreferredVendorIndex] = useState<
    number | null
  >(null);
  const [showReasonPrompt, setShowReasonPrompt] = useState(false);
  const [showReasonDialog, setShowReasonDialog] = useState(false);
  const [reason, setReason] = useState("");
  const quotationLimit = 3;
  const [preferredVendorId, setPreferredVendorId] = useState("");
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const router = useRouter();
  const [showPreferredQuotationError, setShowPreferredQuotationError] =
    useState("");

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
            name: "Other Charges (if any)",
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

  // useEffect(() => {
  //   console.log("Current form errors:", JSON.stringify(errors));
  // }, [errors]);

  const [reasonError, setReasonError] = useState<string | null>(null);

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
      setVisibleQuotationIndex(fields.length);
      setShowReasonPrompt(true);
    } else {
      setShowReasonPrompt(false);
    }
  }, [fields.length, append]);

  const [visibleQuotationIndex, setVisibleQuotationIndex] = useState<
    number | null
  >(null);

  const toggleQuotationVisibility = (index: number) => {
    setVisibleQuotationIndex(visibleQuotationIndex === index ? null : index);
  };

  const onSubmit = async (data: z.infer<typeof rfpSchema>) => {
    console.log("Error: ", errors);

    // console.log("Submitting quotation:", JSON.stringify(data));

    if (!preferredVendorId) {
      console.log("Heelo");
      setShowPreferredQuotationError("Please select a Quotation.");
      return;
    }

    if (fields.length < 3) {
      setShowReasonDialog(true);
      return;
    }
    await submitForm(data);
  };

  const submitForm = async (data: z.infer<typeof rfpSchema>) => {
    setIsLoading(true);
    // setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append("rfpId", rfpId);
      const serializedData = JSON.stringify({
        ...data,
        rfpStatus: fields.length < 3 ? "DRAFT" : "SUBMITTED",
      });
      formData.append("data", serializedData);

      // console.log(files);

      // Append files to formData
      Object.entries(files).forEach(([key, file]) => {
        formData.append(key, file);
      });

      console.log("FormData to be sent:", Object.fromEntries(formData));

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
      // setError(
      //   err instanceof Error ? err.message : "An unknown error occurred"
      // );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReasonSubmit = () => {
    if (!reason.trim()) {
      setReasonError(
        "Please provide a reason for submitting less than 3 quotations"
      );
      return;
    }

    setReasonError(null);
    setShowReasonDialog(false);
    submitForm(getValues());
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Update RFP: {rfpId}</CardTitle>
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
            const isVisible = visibleQuotationIndex === index;
            return (
              <div key={field.id} className="border rounded-lg p-4 mb-2">
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                  {/* Quotation ref */}
                  <div className="flex items-center gap-2">
                    <h3 className="text-md font-semibold">Quotation Ref No.</h3>
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
                    {isVisible ? <ChevronDown /> : <ChevronUp />}{" "}
                  </span>
                </div>

                {isVisible && (
                  <div>
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

                    <div className="flex gap-2 justify-end">
                      <Button
                        className="bg-primary mt-2"
                        type="button"
                        // onClick={handleAddQuotation}
                      >
                        Save
                      </Button>
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
                        Remove
                      </Button>
                    </div>
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

      {/* Reason Dialog */}
      <Dialog open={showReasonDialog} onOpenChange={setShowReasonDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reason Required</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reason">
              Please provide a reason for submitting less than 3 quotations:
            </Label>
            <Textarea
              id="reason"
              className="mt-2"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setReasonError(null);
              }}
              placeholder="Enter your reason here..."
            />
            {reasonError && (
              <p className="text-red-500 text-sm mt-1">{reasonError}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReasonDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleReasonSubmit}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {success && (
        <Alert>
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>RFP updated successfully.</AlertDescription>
        </Alert>
      )}

      {/* {fields.length === 3 ? (
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
              onChange={(e) => {
                setReason(e.target.value);
                setReasonError("");
              }}
            />

            {reasonError && (
              <p className="text-red-500 text-sm mt-1">{reasonError}</p>
            )}

            <Button
              type="button"
              className="bg-primary"
              onClick={() => {
                if (fields.length < 3 && !reason) {
                  setReasonError("Please select reason");
                }

                const formData = getValues();
                if (reason) {
                  setReason(reason);
                  handleSubmitReasonAndAddQuotation(formData);
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
        )} */}
    </form>
  );
}

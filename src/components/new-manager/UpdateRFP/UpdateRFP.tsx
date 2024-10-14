"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { quotationSchema, rfpSchema } from "@/schemas/RFPSchema";
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
import { TotalComponent } from "./TotalCharge";
import QuotationForm from "./QuotationFrom";

const globalFormData = new FormData();

export default function RFPUpdateForm({
  rfpId,
  initialData,
}: {
  rfpId: string;
  initialData: any;
}) {
  console.log("initialData", initialData);

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
  const [savingQuotation, setSavingQuotation] = useState<number | null>(null);
  const [savedQuotations, setSavedQuotations] = useState<Set<number>>(
    new Set()
  );

  const saveQuotation = async (data: z.infer<typeof rfpSchema>) => {
    // setSavingQuotation(index);
    // try{
    //   const quotationData = getValues(`quotations.${index}`);
    //   const formData = new FormData();
    //   formData.append("rfpId", rfpId);
    //   formData.append("quotationIndex", index.toString());
    //   formData.append("data", JSON.stringify(quotationData));

    //   // // Append relevant files for this quotation
    //   // Object.entries(files).forEach(([key, file]) => {
    //   //   if (key.startsWith(`quotations.${index}`)) {
    //   //     formData.append(key, file);
    //   //   }
    //   // });

    //   Object.entries(files).forEach(([key, file]) => {
    //     formData.append(key, file);
    //   });

    //   const response = await fetch(`/api/rfp/quotation?id=${initialData.id}`, {
    //     method: "PUT",
    //     body: formData,
    //   });

    //   if (!response.ok) {
    //     throw new Error("Failed to save quotation");
    //   }

    //   // Mark this quotation as saved
    //   setSavedQuotations((prev) => new Set([...prev, index]));
    //   toast({
    //     title: "Success",
    //     description: "Quotation saved successfully",
    //   });
    // }

    try {
      if (!preferredVendorId) {
        setShowPreferredQuotationError("Please select a preferred quotation");
        return;
      }

      // If less than 3 quotations, show reason dialog
      if (fields.length < 3) {
        setShowReasonDialog(true);
        return;
      }

      // await submitForm(data);
      const quotationData = data;
      const formData = new FormData();
      formData.append("rfpId", rfpId);
      const serializedData = JSON.stringify({
        ...quotationData,
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
      // router.push("/dashboard/manager");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save quotation",
        variant: "destructive",
      });
    } finally {
      setSavingQuotation(null);
    }
  };

  const onSubmit = async (data: z.infer<typeof rfpSchema>) => {
    // Check if all quotations are saved
    // const unsavedQuotations = fields.findIndex(
    //   (_, index) => !savedQuotations.has(index)
    // );
    // if (unsavedQuotations !== -1) {
    //   toast({
    //     title: "Error",
    //     description: "Please save all quotations before submitting",
    //     variant: "destructive",
    //   });
    //   return;
    // }

    // Check for preferred quotation
    if (!preferredVendorId) {
      setShowPreferredQuotationError("Please select a preferred quotation");
      return;
    }

    // If less than 3 quotations, show reason dialog
    if (fields.length < 3) {
      setShowReasonDialog(true);
      return;
    }

    await submitForm(data);
  };

  const renderQuotation = (field: any, index: number) => {
    const quotation = getValues(`quotations.${index}`);
    const isVisible = visibleQuotationIndex === index;
    const isSaved = savedQuotations.has(index);

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
            globalFormData={globalFormData}
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
                <Label className=" text-green-700">Preferred Quote</Label>
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
                // onClick={() => saveQuotation(index)}
                onClick={() => saveQuotation(getValues())}
                disabled={savingQuotation === index}
              >
                {savingQuotation === index ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : isSaved ? (
                  "Update"
                ) : (
                  "Save"
                )}
              </Button>
              <Button
                type="button"
                onClick={() => handleDeleteClick(index)}
                variant="outline"
                className="text-red-500 mt-2"
                disabled={savingQuotation === index}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          </div>
        )}
      </div>
    );
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
      products: initialData.products,
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

  console.log("Errrrror RFP UPdate", errors);

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

  // const onSubmit = async (data: z.infer<typeof rfpSchema>) => {
  //   console.log("Error: ", errors);

  //   // console.log("Submitting quotation:", JSON.stringify(data));

  //   if (!preferredVendorId) {
  //     console.log("Heelo");
  //     setShowPreferredQuotationError("Please select a Quotation.");
  //     return;
  //   }

  //   if (fields.length < 3) {
  //     setShowReasonDialog(true);
  //     return;
  //   }
  //   await submitForm(data);
  // };

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

  const handleQuotationSubmit = async (
    index: number,
    data: z.infer<typeof quotationSchema>
  ) => {
    // Your logic to save individual quotation
    // This could be an API call or update to your form state
    console.log(`Saving quotation ${index}:`, data);
    // Update the main form state
    setValue(`quotations.${index}`, data);
    toast({
      title: "Success",
      description: "Quotation saved successfully",
    });
  };

  console.log("GlobalForm Data", JSON.stringify(globalFormData));

  return (
    <div>
      {fields.map((field, index) => (
        <QuotationForm
          key={field.id}
          index={index}
          initialData={initialData}
          fieldData={field}
          onSubmit={(data) => handleQuotationSubmit(index, data)}
          onDelete={() => remove(index)}
          isPreferred={preferredVendorId === field.vendorId}
          onPreferredChange={(checked) => {
            if (checked) {
              setPreferredVendorId(field.vendorId);
            } else {
              setPreferredVendorId("");
            }
          }}
          files={files}
          setFiles={setFiles}
          globalFormData={globalFormData}
        />
      ))}

      {fields.length < quotationLimit && (
        <Button
          className="bg-primary mt-2"
          type="button"
          onClick={handleAddQuotation}
        >
          Add Quotation
        </Button>
      )}
    </div>

    // (
    //   // <form onSubmit={handleSubmit(saveQuotation)} className="space-y-8">
    //   //   <Card>
    //   //     <CardHeader className="flex flex-row justify-between items-center">
    //   //       {/* <CardTitle>Update RFP: {rfpId}</CardTitle> */}

    //   //       <div className="flex justify-end  mt-2 mb-3">
    //   //         {/* RFP and product details */}
    //   //         <div className="flex flex-col">
    //   //           <div className="flex items-center mb-2">
    //   //             <Label className="font-bold text-md border border-black rounded-full mr-4 px-3 py-1">
    //   //               {initialData.requirementType === "Product" ? "P" : "S"}
    //   //             </Label>
    //   //             <Label>RFP ID: {initialData.rfpId}</Label>
    //   //           </div>

    //   //           {/* Product Details */}
    //   //           <div className="">
    //   //             {initialData.products.map(
    //   //               (product: any, index: React.Key | null | undefined) => (
    //   //                 <div key={index} className="flex flex-col mb-1">
    //   //                   <div className="flex items-center space-x-4">
    //   //                     <Label className="font-medium">
    //   //                       Name: {product.name}
    //   //                     </Label>
    //   //                     <Label className="font-medium">
    //   //                       Model: {product.modelNo}
    //   //                     </Label>
    //   //                     <Label className="font-medium">
    //   //                       Qty: {product.quantity}
    //   //                     </Label>
    //   //                   </div>
    //   //                   {product.description && (
    //   //                     <Label className="text-sm text-gray-600">
    //   //                       Description: {product.description}
    //   //                     </Label>
    //   //                   )}
    //   //                 </div>
    //   //               )
    //   //             )}
    //   //           </div>
    //   //         </div>

    //   //         {/* Add space here */}
    //   //         <div className="flex flex-col">
    //   //           <Label>
    //   //             RFP Date:
    //   //             {new Date(initialData.dateOfOrdering).toLocaleDateString()}
    //   //           </Label>
    //   //           <Label>
    //   //             Exp. Delivery Date:{" "}
    //   //             {new Date(initialData.deliveryByDate).toLocaleDateString()}
    //   //           </Label>
    //   //         </div>
    //   //       </div>

    //   //       <Link href="/dashboard/manager">
    //   //         <Button
    //   //           type="button"
    //   //           variant="outline"
    //   //           size="icon"
    //   //           className="text-black-500 bg-red-400"
    //   //         >
    //   //           <X className="h-4 w-4" />
    //   //         </Button>
    //   //       </Link>
    //   //     </CardHeader>
    //   //     <CardContent>
    //   //       {/* {fields.map((field, index) => renderQuotation(field, index))} */}
    //   //       {fields.map((field, index) => (
    //   //         <QuotationForm
    //   //           key={field.id}
    //   //           index={index}
    //   //           initialData={initialData}
    //   //           fieldData={field}
    //   //           onSubmit={(data) => handleQuotationSubmit(index, data)}
    //   //           onDelete={() => remove(index)}
    //   //           isPreferred={preferredVendorId === field.vendorId}
    //   //           onPreferredChange={(checked) => {
    //   //             if (checked) {
    //   //               setPreferredVendorId(field.vendorId);
    //   //             } else {
    //   //               setPreferredVendorId("");
    //   //             }
    //   //           }}
    //   //           files={files}
    //   //           setFiles={setFiles}
    //   //           globalFormData={globalFormData}
    //   //         />
    //   //       ))}
    //   //       {fields.length < quotationLimit && (
    //   //         <Button
    //   //           className="bg-primary mt-2"
    //   //           type="button"
    //   //           onClick={handleAddQuotation}
    //   //         >
    //   //           Add Quotation
    //   //         </Button>
    //   //       )}
    //   //     </CardContent>
    //   //   </Card>

    //   //   {isDeleteDialogOpen && (
    //   //     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    //   //       <div className="bg-white p-6 rounded-lg">
    //   //         <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
    //   //         <p className="mb-4">
    //   //           Are you sure you want to delete this quotation? This action cannot
    //   //           be undone.
    //   //         </p>
    //   //         <div className="flex justify-end">
    //   //           <Button
    //   //             variant="outline"
    //   //             onClick={() => setIsDeleteDialogOpen(false)}
    //   //             className="mr-2"
    //   //           >
    //   //             Cancel
    //   //           </Button>
    //   //           <Button variant="destructive" onClick={handleDeleteConfirm}>
    //   //             Delete
    //   //           </Button>
    //   //         </div>
    //   //       </div>
    //   //     </div>
    //   //   )}

    //   //   <Button className="bg-primary" type="submit" disabled={isLoading}>
    //   //     {isLoading ? (
    //   //       <>
    //   //         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    //   //         Submitting...
    //   //       </>
    //   //     ) : (
    //   //       "Submit RFP"
    //   //     )}
    //   //   </Button>

    //   //   {/* Reason Dialog */}
    //   //   <Dialog open={showReasonDialog} onOpenChange={setShowReasonDialog}>
    //   //     <DialogContent>
    //   //       <DialogHeader>
    //   //         <DialogTitle>Reason Required</DialogTitle>
    //   //       </DialogHeader>
    //   //       <div className="py-4">
    //   //         <Label htmlFor="reason">
    //   //           Please provide a reason for submitting less than 3 quotations:
    //   //         </Label>
    //   //         <Textarea
    //   //           id="reason"
    //   //           className="mt-2"
    //   //           value={reason}
    //   //           onChange={(e) => {
    //   //             setReason(e.target.value);
    //   //             setReasonError(null);
    //   //           }}
    //   //           placeholder="Enter your reason here..."
    //   //         />
    //   //         {reasonError && (
    //   //           <p className="text-red-500 text-sm mt-1">{reasonError}</p>
    //   //         )}
    //   //       </div>
    //   //       <DialogFooter>
    //   //         <Button
    //   //           variant="outline"
    //   //           onClick={() => setShowReasonDialog(false)}
    //   //         >
    //   //           Cancel
    //   //         </Button>
    //   //         <Button onClick={handleReasonSubmit}>Submit</Button>
    //   //       </DialogFooter>
    //   //     </DialogContent>
    //   //   </Dialog>

    //   //   {success && (
    //   //     <Alert>
    //   //       <AlertTitle>Success</AlertTitle>
    //   //       <AlertDescription>RFP updated successfully.</AlertDescription>
    //   //     </Alert>
    //   //   )}
    //   // </form>
    // )
  );
}

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
import TotalComponent from "./TotalCharges";
import QuotationUploader from "./UploadQuotation";

const globalFormData = new FormData();

export default function RFPUpdateForm({
  rfpId,
  initialData,
}: {
  rfpId: string;
  initialData: any;
}) {
  // console.log("initialData", initialData);

  const [isLoading, setIsLoading] = useState(false);
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
    useState(false);
  const [savingQuotation, setSavingQuotation] = useState<number | null>(null);
  const [savedQuotations, setSavedQuotations] = useState<Set<number>>(
    new Set()
  );

  const [savingRFPQuotation, setSavingRFPQuotation] = useState(false);

  const [quotationRefError, setQuotationRefError] = useState("");
  const [quotationVendorError, setQuotationVendorError] = useState("");
  const [quotationUnitPriceError, setQuotationUnitPriceError] = useState("");
  const [quotationUnitPriceOtherError, setQuotationUnitPriceOtherError] =
    useState("");
  const [reasonError, setReasonError] = useState<string | null>(null);

  const [quotationDocNameError, setQuotationDocNameError] = useState("");
  const [visibleQuotationIndex, setVisibleQuotationIndex] = useState<
    number | null
  >(null);
  const toggleQuotationVisibility = (index: number) => {
    setVisibleQuotationIndex(visibleQuotationIndex === index ? null : index);
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

  useEffect(() => {
    const currentQuotations = JSON.stringify(getValues().quotations);
    if (globalFormData.get("quotations") !== currentQuotations) {
      globalFormData.set("quotations", currentQuotations);
    }
  }, [getValues]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "quotations",
  });
  const validateQuotation = (data: z.infer<typeof rfpSchema>): boolean => {
    const result = data.quotations.map((quotation, id) => {
      if (quotation.refNo === "") {
        setQuotationRefError("Ref Number is required");
        console.log("Enter ref no");
        return false;
      }

      if (quotation.vendorId === "") {
        setQuotationVendorError("Vendor is empty");
        console.log("Vendor is empty");
        return false;
      }

      quotation.supportingDocuments.map((document) => {
        if (document.name === "") {
          console.log(document);
          setQuotationDocNameError("No name selected!");
          console.log("Document name is missing!");
          return false;
        }
      });

      quotation.supportingDocuments.map((document) => {
        if (document.fileName === "") {
          console.log(document);
          setQuotationDocNameError("File details are not added!");
          console.log("Document name is missing!");
          return false;
        }
      });

      quotation.otherCharges.map((other) => {
        if (other.unitPrice <= 0) {
          setQuotationUnitPriceOtherError("Unit is empty!");
          console.log("unit price is empty");
          return false;
        }
      });

      const productsValid = quotation.products.every((product, id) => {
        if (product.unitPrice <= 0) {
          setQuotationUnitPriceError("Unit price is empty!");
          console.log("unit price is empty");
          return false;
        }
        return true;
      });

      if (!productsValid) {
        return false;
      }

      // Note: The `otherCharges` mapping was incomplete in the original code.
      // You may want to add validation logic for `otherCharges` here.

      return true;
    });

    return result.every(Boolean);
  };

  const saveQuote = async (index: number, data: z.infer<typeof rfpSchema>) => {
    if (validateQuotation(data)) {
      try {
        //check quotation ref no to non blank
        // check vendor no blank
        // Product / other charges items quantity and unit price not blank && numeric/decimal && non negative
        // Supporting doc, non blank name, document

        setSavingRFPQuotation(true);
        console.log("Save quote", data);

        const tempQuotations = data.quotations;
        data.quotations = [tempQuotations[index]];

        const finalData = { ...data };

        console.log("finalData", finalData);

        const quotationData = data.quotations;

        console.log("Quotation data", quotationData);

        console.log(`Quotation at index: ${index}`, quotationData[index]);

        const formData = new FormData();
        formData.append("rfpId", rfpId);
        const serializedData = JSON.stringify({
          ...data,
          rfpStatus: fields.length < 3 ? "DRAFT" : "SUBMITTED",
        });
        formData.append("data", serializedData);

        Object.entries(files).forEach(([key, file]) => {
          formData.append(key, file);
        });

        console.log("FormData to be sent:", Object.fromEntries(formData));

        const response = await fetch(
          `/api/rfp/quotation?id=${initialData.id}`,
          {
            method: "PUT",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error(`Could not update quotations!`);
        }

        const result = await response.json();
        console.log("RFP updated successfully:", result);

        setValue(`quotations.${index}.id`, result.quotations[index].id);

        console.log("Current form", getValues());
        // setSuccess(true);

        setSavingRFPQuotation(false);

        toast({
          title: "🎉 Quotation Updated!",
          description: response.ok,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save quotation",
          variant: "destructive",
        });
      } finally {
        setSavingQuotation(null);
      }
    }
  };

  const saveRFP = async (data: z.infer<typeof rfpSchema>) => {
    if (data.quotations.length === 0) {
      console.log(" atleast 1 quotation needed");
      return;
    }

    if (!data.preferredVendorId) {
      setShowPreferredQuotationError(true);
      console.log("Set 1 preferred quotation");
      return;
    }

    if (data.quotations.length < 3) {
      console.log("Please provide reason for < 3 quotes");
      setShowReasonDialog(true);
    }
  };

  const handleQuotationParsed = (quotationData: any, index: number) => {
    // Update the form with parsed data
    if (quotationData) {
      setValue(`quotations.${index}.refNo`, quotationData.refNo || "");
      setValue(`quotations.${index}.vendorId`, quotationData.vendorId || "");

      // Parse total amounts by removing commas and converting to numbers
      const totalAmount = parseFloat(
        quotationData.totalAmount?.replace(/,/g, "") || "0"
      );
      const totalAmountWithoutGST = parseFloat(
        quotationData.totalAmountWithoutGST?.replace(/,/g, "") || "0"
      );

      setValue(`quotations.${index}.totalAmount`, totalAmount);
      setValue(
        `quotations.${index}.totalAmountWithoutGST`,
        totalAmountWithoutGST
      );

      // Update products if they exist
      if (quotationData.products && quotationData.products.length > 0) {
        const mappedProducts = quotationData.products.map((product: any) => {
          // Parse the price by removing commas and converting to number
          const unitPrice = parseFloat(product.price?.replace(/,/g, "") || "0");

          return {
            id: product.id || null,
            quantity: product.quantity || 0,
            unitPrice: unitPrice, // Use the parsed price
            description: `${product.name} | ${product.description}` || "",
            rfpProductId: product.rfpProductId || "",
            gst: product.gst || "0",
            totalPriceWithoutGST: product.totalPriceWithoutGST || 0,
            totalPriceWithGST: product.totalPriceWithGST || 0,
          };
        });
        setValue(`quotations.${index}.products`, mappedProducts);
      }

      // Update other charges if they exist
      if (quotationData.otherCharges && quotationData.otherCharges.length > 0) {
        setValue(
          `quotations.${index}.otherCharges`,
          quotationData.otherCharges
        );
      }
    }
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
            <div className="flex-row">
              <Input
                {...control.register(`quotations.${index}.refNo`)}
                onChange={() => {
                  setQuotationRefError("");
                }}
              />
              {quotationRefError && (
                <p className="text-red-500 text-sm mt-1">{quotationRefError}</p>
              )}
            </div>
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
                    setShowPreferredQuotationError(false);
                    setPreferredVendorIndex(index);
                  } else {
                    setPreferredVendorId("");
                    setPreferredVendorIndex(null);
                  }
                }}
              />
              <div className="flex">
                <Label className=" text-green-700">Preferred Quote</Label>
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
            <QuotationUploader
              onQuotationParsed={(data) => handleQuotationParsed(data, index)}
            />
            <SupportingDocumentsList
              errors={quotationDocNameError}
              handleError={setQuotationDocNameError}
              control={control}
              index={index}
              setValue={setValue}
              files={files}
              setFiles={setFiles}
              getValues={getValues}
            />

            <div className="py-2 w-3/4">
              <VendorSelector
                errors={quotationVendorError}
                handleError={setQuotationVendorError}
                setValue={setValue}
                index={index}
                vendor={quotation.vendor}
                globalFormData={globalFormData}
                setShowCheckbox={undefined}
              />
            </div>

            <div className="mb-2">
              <div>
                <ProductList
                  errors={quotationUnitPriceError}
                  handleError={setQuotationUnitPriceError}
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
                  errors={quotationUnitPriceOtherError}
                  handleError={setQuotationUnitPriceOtherError}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                className="bg-primary mt-2"
                type="button"
                onClick={() => saveQuote(index, getValues())}
                disabled={savingQuotation === index}
              >
                {/* {savingQuotation === index ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : isSaved ? (
                  "Update"
                ) : (
                  "Save"
                )} */}

                {savingRFPQuotation ? (
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

  const submitForm = async (data: z.infer<typeof rfpSchema>) => {
    setIsLoading(true);
    setSuccess(false);

    try {
      console.log("submitForm", data);
      const formData = new FormData();
      let rfpStatusValue = "";
      console.log("Reason: ", reason);

      if (fields.length < 3 && reason) {
        rfpStatusValue = "SUBMITTED";
      }

      formData.append("rfpId", rfpId);
      data.reason = reason;

      const serializedData = JSON.stringify({
        ...data,
        rfpStatus: rfpStatusValue,
      });
      formData.append("data", serializedData);

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
      console.log("RFP updated successfully:", result);
      setSuccess(true);
      setIsLoading(false);
      toast({
        title: "🎉 RFP Submitted!",
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
    } else {
      setReason(reason);
    }

    console.log("Reason ", reason);

    setReasonError(null);
    setShowReasonDialog(false);
    submitForm(getValues());
  };

  return (
    <form onSubmit={handleSubmit(saveRFP)} className="space-y-8">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div className="flex justify-between mt-2 mb-3 px-6 w-full ">
            <div className="flex flex-col">
              <div className="flex items-center mb-2">
                <Label className="font-bold text-md border border-black rounded-full mr-4 px-3 py-1">
                  {initialData.requirementType === "Product" ? "P" : "S"}
                </Label>
                <Label>RFP ID: {initialData.rfpId}</Label>
              </div>

              {/* Product Details */}
              <div className="ml-12">
                {initialData.products.map((product: any, index: any) => (
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
                ))}
              </div>
            </div>

            <div className="flex gap-6">
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
              </div>
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
        </CardHeader>
        <CardContent>
          {fields.map((field, index) => renderQuotation(field, index))}
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

      {preferredVendorIndex ||
        (showPreferredQuotationError && (
          <p className="text-red-500 text-sm mt-1">
            "Please select a Preferred Quotation."
          </p>
        ))}

      <Button
        className="bg-primary"
        type="submit"
        disabled={isLoading}
        onClick={() => {
          saveRFP(getValues());
        }}
      >
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
                console.log("Reson input fomr ", e.target.value);

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
    </form>
  );
}

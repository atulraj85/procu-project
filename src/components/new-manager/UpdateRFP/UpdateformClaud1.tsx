import React, { useState, useEffect, useCallback } from "react";
import {
  useForm,
  useFieldArray,
  useWatch,
  Control,
  UseFormSetValue,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ChevronDown, ChevronUp, Loader2, X, Plus } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { rfpSchema } from "@/schemas/RFPSchema";
import { ProductList } from "./Product";
import VendorSelector from "./Vendor";
import OtherChargesList from "./OtherCharges";
import SupportingDocumentsList from "./SupportingDocs";

const TotalComponent = ({ control, index, setValue }) => {
  const quotation = useWatch({ control, name: `quotations.${index}` });

  useEffect(() => {
    // Calculate totals (implementation details omitted for brevity)
  }, [quotation, setValue, index]);

  return (
    <div className="grid grid-cols-2 gap-2 text-sm">
      <div>
        <Label className="font-semibold">Taxable Amount (INR)</Label>
        <div>{quotation.total?.withoutGST?.toFixed(2) || "0.00"}</div>
      </div>
      <div>
        <Label className="font-semibold">Total (incl. GST) (INR)</Label>
        <div>{quotation.total?.withGST?.toFixed(2) || "0.00"}</div>
      </div>
    </div>
  );
};

const globalFormData = new FormData();


export default function RFPUpdateForm({}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [files, setFiles] = useState({});
  const [preferredVendorIndex, setPreferredVendorIndex] = useState(null);
  const [reason, setReason] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm({
    resolver: zodResolver(rfpSchema),
    defaultValues: {
      // ... (default values implementation)
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "quotations",
  });

  const validateForm = (data: any) => {
    // ... (form validation implementation)
  };

  const onSubmit = async (data: any) => {
    // ... (form submission implementation)
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center py-2">
          <CardTitle className="text-xl">Update RFP</CardTitle>
          <Link href="/dashboard/manager">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="text-red-500"
            >
              <X className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-2">
            {fields.map((field, index) => (
              <AccordionItem key={field.id} value={`item-${index}`}>
                <AccordionTrigger className="py-2">
                  <div className="flex justify-between items-center w-full">
                    <span className="font-semibold">Quotation {index + 1}</span>
                    <div className="flex items-center space-x-4">
                      <Input
                        {...control.register(`quotations.${index}.refNo`)}
                        placeholder="Ref No."
                        className="w-32"
                      />
                      <TotalComponent
                        control={control}
                        index={index}
                        setValue={setValue}
                      />
                      <Checkbox
                        checked={preferredVendorIndex === index}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPreferredVendorIndex(index);
                            setValue(
                              "preferredVendorId",
                              getValues(`quotations.${index}.vendorId`)
                            );
                          } else {
                            setPreferredVendorIndex(null);
                            setValue("preferredVendorId", "");
                          }
                        }}
                      />
                      <Label className="text-green-700">Preferred</Label>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <VendorSelector
                      errors={errors}
                      setValue={setValue}
                      index={index}
                      vendor={getValues(`quotations.${index}.vendor`)}
                    />
                    <ProductList
                      errors={errors}
                      products={getValues(`quotations.${index}.products`)}
                      setValue={setValue}
                      getValues={getValues}
                      control={control}
                      index={index}
                    />
                    <OtherChargesList
                      errors={errors}
                      control={control}
                      index={index}
                      formData={getValues()}
                    />
                    <SupportingDocumentsList
                      errors={errors}
                      control={control}
                      index={index}
                      setValue={setValue}
                      files={files}
                      setFiles={setFiles}
                      getValues={getValues}
                    />
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        onClick={() => {
                          setDeleteIndex(index);
                          setIsDeleteDialogOpen(true);
                        }}
                        variant="outline"
                        size="sm"
                        className="text-red-500"
                      >
                        Delete Quotation
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          {fields.length < 3 && (
            <Button
              type="button"
              onClick={() =>
                append({
                  /* ... default quotation structure ... */
                })
              }
              className="mt-4"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Quotation
            </Button>
          )}
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {fields.length < 3 && (
        <div className="space-y-2">
          <Textarea
            placeholder="Reason for adding less than 3 quotations"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full"
          />
          {errors?.reason && (
            <p className="text-red-500 text-sm">{errors.reason.message}</p>
          )}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit RFP"
        )}
      </Button>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete this quotation? This action cannot
            be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                remove(deleteIndex);
                setIsDeleteDialogOpen(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}

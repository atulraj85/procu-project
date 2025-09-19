"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm, Control, useWatch, UseFormSetValue } from "react-hook-form";
import { useCurrentUser } from "@/hooks/auth";
import { ProductList } from "../new-manager/UpdateRFP/Product";
import OtherChargesList from "../new-manager/UpdateRFP/OtherCharges";
import SupportingDocumentsList from "../new-manager/UpdateRFP/SupportingDocs";

interface TotalComponentProps {
  control: Control<any>;
  setValue: UseFormSetValue<any>;
}

const TotalComponent: React.FC<TotalComponentProps> = ({ control, setValue }) => {
  const quotation = useWatch({ control, name: 'quotation' });

  useEffect(() => {
    if (!quotation) return;

    const calculateTotals = () => {
      // Calculate total without GST
      const productsTotal = quotation.products?.reduce((sum: number, product: any) => {
        return sum + (Number(product.totalPriceWithoutGST) || 0);
      }, 0) || 0;

      const otherChargesTotal = quotation.otherCharges?.reduce((sum: number, charge: any) => {
        return sum + (Number(charge.unitPrice) || 0);
      }, 0) || 0;

      const totalWithoutGST = productsTotal + otherChargesTotal;

      // Calculate total with GST
      const productsTotalWithGST = quotation.products?.reduce((sum: number, product: any) => {
        const gstValue = product.gst === "NILL" ? 0 : parseFloat(product.gst);
        const priceWithGST = (Number(product.unitPrice) || 0) * product.quantity * (1 + gstValue / 100);
        return sum + priceWithGST;
      }, 0) || 0;

      const otherChargesTotalWithGST = quotation.otherCharges?.reduce((sum: number, charge: any) => {
        const gstValue = charge.gst === "NILL" ? 0 : parseFloat(charge.gst);
        const chargeWithGST = (Number(charge.unitPrice) || 0) * (1 + gstValue / 100);
        return sum + chargeWithGST;
      }, 0) || 0;

      const totalWithGST = productsTotalWithGST + otherChargesTotalWithGST;

      return {
        withoutGST: Number(totalWithoutGST),
        withGST: Number(totalWithGST),
      };
    };

    if (quotation.products?.length > 0 || quotation.otherCharges?.length > 0) {
      const newTotal = calculateTotals();
      
      const hasChanged = !quotation.total ||
        Math.abs(quotation.total.withoutGST - newTotal.withoutGST) > 0.01 ||
        Math.abs(quotation.total.withGST - newTotal.withGST) > 0.01;

      if (hasChanged) {
        setValue('quotation.total', newTotal, { shouldDirty: false });
      }
    }
  }, [quotation, setValue]);

  const formatCurrency = (value: number | undefined): string => {
    if (value === undefined) return "0.00";
    return value.toFixed(2);
  };

  return (
    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
      <div>
        <Label className="font-bold text-sm text-gray-600">Taxable Amount (INR)</Label>
        <div className="text-lg font-semibold">₹ {formatCurrency(quotation?.total?.withoutGST)}</div>
      </div>
      <div>
        <Label className="font-bold text-sm text-gray-600">Total (incl. GST) (INR)</Label>
        <div className="text-lg font-semibold text-primary">₹ {formatCurrency(quotation?.total?.withGST)}</div>
      </div>
    </div>
  );
};

interface VendorQuotationFormProps {
  rfpId: string;
  rfpData: any;
  existingQuotation?: any;
  onQuotationSaved: () => void;
}

const VendorQuotationForm: React.FC<VendorQuotationFormProps> = ({
  rfpId,
  rfpData,
  existingQuotation,
  onQuotationSaved
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [files, setFiles] = useState<{ [key: string]: File }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const currentUser = useCurrentUser();

  const { control, handleSubmit, setValue, getValues, formState: { errors: formErrors } } = useForm({
    defaultValues: {
      quotation: {
        id: existingQuotation?.id || "",
        refNo: existingQuotation?.refNo || "",
        vendorId: currentUser?.id || "",
        products: existingQuotation?.products || rfpData.products.map((product: any) => ({
          id: product.id,
          rfpProductId: product.id,
          name: product.name || product.description,
          description: product.description,
          quantity: product.quantity,
          unitPrice: existingQuotation ? parseFloat(existingQuotation.products.find((p: any) => p.rfpProductId === product.id)?.price || 0) : 0,
          gst: existingQuotation ? existingQuotation.products.find((p: any) => p.rfpProductId === product.id)?.gst?.toString() || "18" : "18",
          totalPriceWithoutGST: 0,
          totalPriceWithGST: 0,
        })),
        otherCharges: existingQuotation?.otherCharges || [
          {
            id: "",
            name: "Other Charges (if any)",
            unitPrice: 0,
            gst: "18",
          }
        ],
        total: {
          withGST: existingQuotation?.totalAmount || 0,
          withoutGST: existingQuotation?.totalAmountWithoutGST || 0,
        },
        supportingDocuments: existingQuotation?.supportingDocuments || [],
      }
    }
  });

  const validateQuotation = (data: any): boolean => {
    const newErrors: { [key: string]: string } = {};
    const quotation = data.quotation;

    if (!quotation.refNo?.trim()) {
      newErrors.refNo = "Reference Number is required";
    }

    // Validate products have prices
    const invalidProducts = quotation.products.filter((product: any) => !product.unitPrice || product.unitPrice <= 0);
    if (invalidProducts.length > 0) {
      newErrors.products = "All products must have valid unit prices";
    }

    // Validate supporting documents
    if (!quotation.supportingDocuments || quotation.supportingDocuments.length === 0) {
      newErrors.documents = "At least one supporting document is required";
    } else {
      const invalidDocs = quotation.supportingDocuments.filter((doc: any) => !doc.name?.trim() || !doc.fileName?.trim());
      if (invalidDocs.length > 0) {
        newErrors.documents = "All documents must have valid names and files";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveQuotation = async (data: any) => {
    if (!validateQuotation(data)) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors and try again",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("rfpId", rfpId);
      formData.append("vendorId", currentUser?.id || "");
      
      // Prepare quotation data
      const quotationData = {
        ...data.quotation,
        vendorId: currentUser?.id,
        rfpId: rfpId,
      };

      formData.append("quotationData", JSON.stringify(quotationData));

      // Append files
      Object.entries(files).forEach(([key, file]) => {
        formData.append(key, file);
      });

      const endpoint = existingQuotation 
        ? `/api/quotations/${existingQuotation.id}` 
        : '/api/quotations';
      
      const method = existingQuotation ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method: method,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to ${existingQuotation ? 'update' : 'create'} quotation`);
      }

      const result = await response.json();
      console.log("Quotation saved successfully:", result);

      setSuccess(true);
      toast({
        title: "🎉 Quotation Saved!",
        description: `Your quotation has been ${existingQuotation ? 'updated' : 'submitted'} successfully.`,
      });

      onQuotationSaved();

    } catch (error) {
      console.error("Error saving quotation:", error);
      toast({
        title: "Error",
        description: "Failed to save quotation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{existingQuotation ? 'Update' : 'Submit'} Your Quotation</span>
          <span className="text-sm text-gray-500">Vendor: {currentUser?.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(saveQuotation)} className="space-y-6">
          
          {/* Reference Number */}
          <div>
            <Label htmlFor="refNo">Reference Number *</Label>
            <Input
              id="refNo"
              {...control.register('quotation.refNo')}
              placeholder="Enter your quotation reference number"
              className={errors.refNo ? "border-red-500" : ""}
            />
            {errors.refNo && <p className="text-red-500 text-sm mt-1">{errors.refNo}</p>}
          </div>

          {/* Products List */}
          <div>
            <Label className="text-lg font-semibold mb-4 block">Product Pricing</Label>
            <ProductList
              errors={errors.products}
              handleError={(error: string) => setErrors({...errors, products: error})}
              products={getValues('quotation.products')}
              setValue={setValue}
              getValues={getValues}
              control={control}
              index={0} // Since we only have one quotation
              globalFormData={new FormData()}
            />
          </div>

          {/* Other Charges */}
          <div>
            <Label className="text-lg font-semibold mb-4 block">Other Charges</Label>
            <OtherChargesList
              control={control}
              index={0} // Since we only have one quotation
              formData={FormData}
              globalFormData={new FormData()}
              errors={errors.otherCharges}
              handleError={(error: string) => setErrors({...errors, otherCharges: error})}
            />
          </div>

          {/* Total Component */}
          <TotalComponent control={control} setValue={setValue} />

          {/* Supporting Documents */}
          <div>
            <Label className="text-lg font-semibold mb-4 block">Supporting Documents *</Label>
            <SupportingDocumentsList
              errors={errors.documents}
              handleError={(error: string) => setErrors({...errors, documents: error})}
              control={control}
              index={0} // Since we only have one quotation
              setValue={setValue}
              files={files}
              setFiles={setFiles}
              getValues={getValues}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="submit"
              className="bg-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {existingQuotation ? 'Updating...' : 'Submitting...'}
                </>
              ) : (
                existingQuotation ? 'Update Quotation' : 'Submit Quotation'
              )}
            </Button>
          </div>
        </form>

        {success && (
          <Alert className="mt-4">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              Your quotation has been {existingQuotation ? 'updated' : 'submitted'} successfully.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default VendorQuotationForm;

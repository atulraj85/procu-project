import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import VendorSelector from "./Vendor";
import { ProductList } from "./Product";
import OtherChargesList from "./OtherCharges";
import SupportingDocumentsList from "./SupportingDocs";

// Import your quotation schema here
import { quotationSchema } from "@/schemas/RFPSchema";
import { Input } from "@/components/ui/input";
import { TotalComponent } from "./TotalCharge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface QuotationFormProps {
  index: number;
  initialData: any;
  fieldData: any;
  onSubmit: (data: z.infer<typeof quotationSchema>) => Promise<void>;
  onDelete: () => void;
  isPreferred: boolean;
  onPreferredChange: (checked: boolean) => void;
  files: { [key: string]: File };
  setFiles: React.Dispatch<React.SetStateAction<{ [key: string]: File }>>;
  globalFormData: FormData;
}

const QuotationForm: React.FC<QuotationFormProps> = ({
  index,
  initialData,
  onSubmit,
  onDelete,
  isPreferred,
  onPreferredChange,
  files,
  fieldData,
  setFiles,
  globalFormData,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    getValues,
    setError,
  } = useForm<z.infer<typeof quotationSchema>>({
    resolver: zodResolver(quotationSchema),
    defaultValues: { ...fieldData, products: initialData.products },
  });

  const onQuotationSubmit = async (data: z.infer<typeof quotationSchema>) => {
    console.log("onQuotationSubmit", data);
    console.log("globolFormData", globalFormData);

    setIsSaving(true);
    try {
      //   await onSubmit(data);
      console.log("Quotation From data", data);
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  console.log("Errrrrorrrrr", errors);

  return (
    <div className="border rounded-lg p-4 mb-2">
      <form onSubmit={handleSubmit(onQuotationSubmit)}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-md font-semibold">Quotation Ref No.</h3>
            <div className="flex flex-col">
              <Input {...register("refNo")} />
              {errors.refNo && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.refNo.message}
                </p>
              )}
            </div>
          </div>

          <TotalComponent
            setValue={setValue}
            control={control}
            index={index}
            globalFormData={globalFormData}
          />

          <div className="flex items-center gap-2">
            <Checkbox
              checked={isPreferred}
              onCheckedChange={onPreferredChange}
            />
            <Label className="text-green-700">Preferred Quote</Label>
          </div>

          <span
            className="cursor-pointer"
            onClick={() => setIsVisible(!isVisible)}
          >
            {isVisible ? <ChevronDown /> : <ChevronUp />}
          </span>
        </div>

        {isVisible && (
          <div>
            <div className="py-2 w-3/4">
              <VendorSelector
                errors={errors}
                setValue={setValue}
                index={index}
                vendor={getValues("vendor")}
                globalFormData={globalFormData}
              />
            </div>

            <div className="mb-2">
              <h4 className="text-lg font-semibold">
                Products / Services Details
              </h4>
              <ProductList
                errors={errors}
                products={getValues("products")}
                setValue={setValue}
                getValues={getValues}
                control={control}
                index={index}
                globalFormData={globalFormData}
              />

              <OtherChargesList
                control={control}
                index={index}
                formData={new FormData()}
                globalFormData={globalFormData}
                errors={errors}
              />
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
                type="submit"
                disabled={isSaving}
                onClick={() => {
                  onQuotationSubmit(getValues());
                }}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
              <Button
                type="button"
                onClick={onDelete}
                variant="outline"
                className="text-red-500 mt-2"
                disabled={isSaving}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default QuotationForm;

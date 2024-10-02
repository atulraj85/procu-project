import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, PlusIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Controller, useFieldArray } from "react-hook-form";

const OtherChargesList = ({
  control,
  index,
  formData,
  globalFormData,
  errors,
}: {
  control: any;
  index: number;
  formData: any;
  globalFormData: any;
  errors: any;
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `quotations.${index}.otherCharges`,
  });

  const updateGlobalFormData = useCallback(() => {
    if (globalFormData.has("quotations")) {
      const quotations = JSON.parse(globalFormData.get("quotations") as string);

      // Ensure the quotation at this index exists
      if (!quotations[index]) {
        quotations[index] = { otherCharges: [] };
      }

      quotations[index].otherCharges = fields;
      globalFormData.set("quotations", JSON.stringify(quotations));
    } else {
      // If "quotations" doesn't exist in globalFormData, initialize it
      const newQuotations = [{ otherCharges: fields }];
      globalFormData.set("quotations", JSON.stringify(newQuotations));
    }
  }, [fields, index]);

  useEffect(() => {
    updateGlobalFormData();
  }, [fields, updateGlobalFormData]);

  return (
    <div className="">
      {errors?.quotations?.[index]?.otherCharges && (
        <p className="text-red-500 text-sm mt-1">
          {errors.quotations[index].otherCharges.message}
        </p>
      )}
      {fields.map((field, chargeIndex) => (
        <div key={field.id} className="flex space-x-4 items-start mt-2">
          {/* Name */}
          <div className="w-1/6">
            <Input
              {...control.register(
                `quotations.${index}.otherCharges.${chargeIndex}.name`
              )}
              // value={"Other Charges"}
            />
            {errors?.quotations?.[index]?.otherCharges?.[chargeIndex]?.name && (
              <p className="text-red-500 text-sm mt-1">
                {
                  errors.quotations[index].otherCharges[chargeIndex].name
                    .message
                }
              </p>
            )}
          </div>
          {/* Space */}
          <div className="w-1/4"></div>
          <div className="w-1/12">
            <Input type="number" className="text-center" value={1} />
          </div>

          {/* Unit Price */}
          <div className="w-1/12">
            <Input
              type="number"
              step="0.01"
              className="text-right"
              {...control.register(
                `quotations.${index}.otherCharges.${chargeIndex}.unitPrice`
              )}
            />
            {errors?.quotations?.[index]?.otherCharges[chargeIndex]
              ?.unitPrice && (
              <p className="text-red-500 text-sm mt-1">
                {
                  errors.quotations[index].otherCharges[chargeIndex].unitPrice
                    .message
                }
              </p>
            )}
          </div>
          {/* GST */}
          <div className="w-1/12">
            <Controller
              name={`quotations.${index}.otherCharges.${chargeIndex}.gst`}
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select GST" />
                  </SelectTrigger>
                  <SelectContent>
                    {["NILL", "0", "3", "5", "12", "18", "28"].map((gst) => (
                      <SelectItem key={gst} value={gst}>
                        {gst}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors?.quotations?.[index]?.otherCharges?.[chargeIndex]?.gst && (
              <p className="text-red-500 text-sm mt-1">
                {errors.quotations[index].otherCharges[chargeIndex].gst.message}
              </p>
            )}
          </div>

          {/* Close button */}
          <div className="">
            <Label className="font-bold text-[16px] text-slate-700"></Label>
            <Button
              type="button"
              onClick={() => remove(chargeIndex)}
              variant="outline"
              size="icon"
              className="text-red-500"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}

      <Button
        type="button"
        className="bg-primary mt-2"
        onClick={() => {
          append({ name: "Other Charges", gst: "NILL", unitPrice: 0 });
          updateGlobalFormData();
        }}
      >
        <PlusIcon />
      </Button>
    </div>
  );
};

export default OtherChargesList;

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

type OtherCharge = {
  id: any;
  price: any;
  name: string;
  gst: string;
  unitPrice: number;
};

const OtherChargesList = ({
  control,
  index,
  formData,
  globalFormData,
}: {
  control: any;
  index: number;
  formData: any;
  globalFormData: any;
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
    <div>
      <hr />
      <div>
        <CardTitle className="text-lg">Other Charges (If any)</CardTitle>

        <div className="flex justify-between">
          <div className="grid grid-cols-1">
            <div className="grid grid-cols-4 gap-2 mb-2">
              <Label>Name</Label>
              <Label>GST</Label>
              <Label>Unit Price</Label>
            </div>
            {fields.map((field, chargeIndex) => (
              <div className="space-y-2 mb-2" key={field.id}>
                <div className="grid grid-cols-4 gap-2">
                  <Input
                    {...control.register(
                      `quotations.${index}.otherCharges.${chargeIndex}.name`
                    )}
                  />
                  <Controller
                    name={`quotations.${index}.otherCharges.${chargeIndex}.gst`}
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select GST" />
                        </SelectTrigger>
                        <SelectContent>
                          {["NILL", "0", "3", "5", "12", "18", "28"].map(
                            (gst) => (
                              <SelectItem key={gst} value={gst}>
                                {gst}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <Input
                    type="number"
                    {...control.register(
                      `quotations.${index}.otherCharges.${chargeIndex}.unitPrice`
                    )}
                  />

                  <div className="flex flex-col">
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
              </div>
            ))}
          </div>

          <Button
            type="button"
            className="bg-primary"
            onClick={() => {
              append({ name: "", gst: "NILL", unitPrice: 0 });
              updateGlobalFormData();
            }}
          >
            <PlusIcon />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OtherChargesList;

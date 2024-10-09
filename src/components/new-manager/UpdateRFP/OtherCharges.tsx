import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCallback, useEffect } from "react";
import { Controller, useFieldArray } from "react-hook-form";

const calculateAmounts = (unitPrice: number, gst: string) => {
  const taxableAmount = parseFloat(unitPrice.toString()) || 0;
  const gstRate = gst === "NILL" ? 0 : parseFloat(gst) / 100;
  const gstAmount = taxableAmount * gstRate;
  const totalAmount = taxableAmount + gstAmount;

  return {
    taxableAmount: taxableAmount.toFixed(2),
    totalAmount: totalAmount.toFixed(2),
  };
};

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

      if (!quotations[index]) {
        quotations[index] = { otherCharges: [] };
      }

      quotations[index].otherCharges = fields;
      globalFormData.set("quotations", JSON.stringify(quotations));
    } else {
      const newQuotations = [{ otherCharges: fields }];
      globalFormData.set("quotations", JSON.stringify(newQuotations));
    }
  }, [fields, index]);

  if (fields.length <= 0) {
    append({
      name: "Other Charges (if any)",
      gst: "NILL",
      unitPrice: 0,
    });
  }

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
      {fields.map((field, chargeIndex) => {
        const amounts = calculateAmounts(
          control._formValues.quotations?.[index]?.otherCharges?.[chargeIndex]
            ?.unitPrice || 0,
          control._formValues.quotations?.[index]?.otherCharges?.[chargeIndex]
            ?.gst || "NILL"
        );

        return (
          <div key={field.id} className="flex space-x-4 items-start mt-2">
            <div className="w-1/6">
              <Input
                {...control.register(
                  `quotations.${index}.otherCharges.${chargeIndex}.name`
                )}
              />
              {errors?.quotations?.[index]?.otherCharges?.[chargeIndex]
                ?.name && (
                <p className="text-red-500 text-sm mt-1">
                  {
                    errors.quotations[index].otherCharges[chargeIndex].name
                      .message
                  }
                </p>
              )}
            </div>
            <div className="w-1/4"></div>
            <div className="w-1/12"></div>

            <div className="w-1/12">
              <Input
                type="number"
                step="0.01"
                className="text-right"
                {...control.register(
                  `quotations.${index}.otherCharges.${chargeIndex}.unitPrice`,
                  {
                    valueAsNumber: true,
                  }
                )}
              />
            </div>

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
              {errors?.quotations?.[index]?.otherCharges?.[chargeIndex]
                ?.gst && (
                <p className="text-red-500 text-sm mt-1">
                  {
                    errors.quotations[index].otherCharges[chargeIndex].gst
                      .message
                  }
                </p>
              )}
            </div>

            <div className="w-1/12">
              <Input
                className="text-right"
                value={amounts.taxableAmount}
                readOnly
              />
            </div>

            <div className="w-1/12">
              <Input
                className="text-right"
                value={amounts.totalAmount}
                readOnly
              />
            </div>
          </div>
        );
      })}

      {/* <Button
        type="button"
        className="bg-primary mt-2"
        onClick={() => {
          updateGlobalFormData();
        }}
      >
        <PlusIcon />
      </Button> */}
    </div>
  );
};

export default OtherChargesList;

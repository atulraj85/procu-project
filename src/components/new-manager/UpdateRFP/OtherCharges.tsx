import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCallback, useEffect, useState } from "react";
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
  handleError,
}: {
  control: any;
  index: number;
  formData: any;
  globalFormData: any;
  errors: any;
  handleError: any;
}) => {
  const { fields, append } = useFieldArray({
    control,
    name: `quotations.${index}.otherCharges`,
  });

  const [amounts, setAmounts] = useState<{
    [key: number]: { taxableAmount: string; totalAmount: string };
  }>({});

  // Function to update amounts for all fields
  const updateAllAmounts = useCallback(() => {
    const newAmounts: {
      [key: number]: { taxableAmount: string; totalAmount: string };
    } = {};

    fields.forEach((field, chargeIndex) => {
      const unitPrice =
        control._getWatch(
          `quotations.${index}.otherCharges.${chargeIndex}.unitPrice`
        ) || 0;
      const gst =
        control._getWatch(
          `quotations.${index}.otherCharges.${chargeIndex}.gst`
        ) || "NILL";

      newAmounts[chargeIndex] = calculateAmounts(unitPrice, gst);
    });

    setAmounts(newAmounts);
  }, [fields, control, index]);

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
  }, [fields, index, globalFormData]);

  // Initialize with at least one field if empty
  if (fields.length <= 0) {
    append({
      name: "Other Charges (if any)",
      gst: "0",
      unitPrice: 0,
    });
  }

  // Update amounts whenever fields change or component mounts
  useEffect(() => {
    updateAllAmounts();
  }, [fields, updateAllAmounts]);

  // Update global form data when fields change
  useEffect(() => {
    updateGlobalFormData();
  }, [fields, updateGlobalFormData]);

  const handleUnitPriceChange = (chargeIndex: number, newValue: number) => {
    handleError("");
    const gst =
      control._getWatch(
        `quotations.${index}.otherCharges.${chargeIndex}.gst`
      ) || "NILL";
    const newAmounts = calculateAmounts(newValue, gst);
    setAmounts((prev) => ({
      ...prev,
      [chargeIndex]: newAmounts,
    }));
  };

  const handleGstChange = (chargeIndex: number, gst: string) => {
    const unitPrice =
      control._getWatch(
        `quotations.${index}.otherCharges.${chargeIndex}.unitPrice`
      ) || 0;
    const newAmounts = calculateAmounts(unitPrice, gst);
    setAmounts((prev) => ({
      ...prev,
      [chargeIndex]: newAmounts,
    }));
  };

  return (
    <div className="">
      {errors?.quotations?.[index]?.otherCharges && (
        <p className="text-red-500 text-sm mt-1">
          {errors.quotations[index].otherCharges.message}
        </p>
      )}
      {fields.map((field, chargeIndex) => (
        <div key={field.id} className="flex space-x-4 items-start mt-2">
          <div className="w-1/2">
            <Input
              {...control.register(
                `quotations.${index}.otherCharges.${chargeIndex}.name`
              )}
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
          <div className="w-1/12"></div>
          <div className="w-1/12">
            <Controller
              name={`quotations.${index}.otherCharges.${chargeIndex}.unitPrice`}
              control={control}
              render={({ field }) => (
                <Input
                  type="number"
                  step="0.01"
                  className="text-right"
                  value={field.value}
                  onChange={(e) => {
                    const newValue = parseFloat(e.target.value) || 0;
                    field.onChange(newValue);
                    handleUnitPriceChange(chargeIndex, newValue);
                  }}
                />
              )}
            />
            {errors && <p className="text-red-500 text-sm mt-1">{errors}</p>}
          </div>
          <div className="w-1/12">
            <Controller
              name={`quotations.${index}.otherCharges.${chargeIndex}.gst`}
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleGstChange(chargeIndex, value);
                  }}
                  value={field.value}
                >
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
          </div>
          <div className="w-1/12">
            <Input
              className="text-right"
              value={amounts[chargeIndex]?.taxableAmount || "0.00"}
              readOnly
            />
          </div>
          <div className="w-1/12">
            <Input
              className="text-right"
              value={amounts[chargeIndex]?.totalAmount || "0.00"}
              readOnly
            />
          </div>
          <div className="w-1/12"></div>
        </div>
      ))}
    </div>
  );
};

export default OtherChargesList;

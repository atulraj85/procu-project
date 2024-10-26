import { Label } from "@/components/ui/label";
import { useEffect } from "react";
import { Control, UseFormSetValue, useWatch } from "react-hook-form";



interface TotalComponentProps {
  control: Control<any>;
  index: number;
  setValue: UseFormSetValue<any>;
  globalFormData: any;
}

const TotalComponent: React.FC<TotalComponentProps> = ({
  control,
  index,
  setValue,
  globalFormData,
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


export default TotalComponent;
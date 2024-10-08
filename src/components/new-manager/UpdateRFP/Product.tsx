import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCallback, useEffect, useState } from "react";
import { Controller, useFieldArray } from "react-hook-form";

type Product = {
  vendorPricing?: any;
  id: string;
  name: string;
  rfpProductId?: string;
  modelNo: string;
  quantity: number;
  unitPrice?: number;
  gst?: string;
  totalPriceWithoutGST?: number;
  totalPriceWithGST?: number;
};
const ProductList = ({
  products,
  control,
  index,
  getValues,
  setValue,
  errors,
  globalFormData,
}: {
  products: Product[];
  control: any;
  index: number;
  getValues: any;
  setValue: any;
  errors: any;
  globalFormData: any;
}) => {
  const { fields, replace } = useFieldArray({
    control,
    name: `quotations.${index}.products`,
  });

  console.log("@@@@@@@@@@@@@@@@@@@@ fields", fields);
  //RFPProductId visible

  const [error, setError] = useState<string | null>(null);
  const [loading, setIsLoading] = useState(false);

  const updateProductTotals = useCallback(
    (productIndex: number) => {
      const unitPrice = getValues(
        `quotations.${index}.products.${productIndex}.unitPrice`
      );
      const quantity = getValues(
        `quotations.${index}.products.${productIndex}.quantity`
      );
      const gst = getValues(`quotations.${index}.products.${productIndex}.gst`);

      // console.log("Calculating totals for:", { unitPrice, quantity, gst });

      const { totalWithoutGST, totalWithGST } = calculateTotals(
        unitPrice,
        quantity,
        gst
      );

      // console.log("Calculated totals:", { totalWithoutGST, totalWithGST });

      setValue(
        `quotations.${index}.products.${productIndex}.totalPriceWithoutGST`,
        totalWithoutGST
      );
      setValue(
        `quotations.${index}.products.${productIndex}.totalPriceWithGST`,
        totalWithGST
      );

      // Update global form data
      if (globalFormData.has("quotations")) {
        const quotations = JSON.parse(
          globalFormData.get("quotations") as string
        );
        quotations[index].products[productIndex] = {
          ...quotations[index].products[productIndex],
          unitPrice,
          gst,
          totalPriceWithoutGST: totalWithoutGST,
          totalPriceWithGST: totalWithGST,
        };
        globalFormData.set("quotations", JSON.stringify(quotations));
      }
    },
    [getValues, setValue, index, globalFormData]
  );

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    try {
      if (Array.isArray(products) && products.length > 0) {
        const mappedProducts = products.map((product: any) => ({
          id: product.id || null,
          name: product.name || "",
          modelNo: product.modelNo || "",
          quantity: product.quantity || 0,
          unitPrice: product.unitPrice || 0,
          description: product.description || "",
          rfpProductId: product.rfpProductId || "",
          gst: product.gst || "NILL",
          totalPriceWithoutGST: product.totalPriceWithoutGST || 0,
          totalPriceWithGST: product.totalPriceWithGST || 0,
        }));

        // Use replace to set the products directly
        replace(mappedProducts);

        // Update global form data
        if (globalFormData.has("quotations")) {
          const quotations = JSON.parse(
            globalFormData.get("quotations") as string
          );
          quotations[index] = {
            ...quotations[index],
            products: mappedProducts,
          };
          globalFormData.set("quotations", JSON.stringify(quotations));
        }

        // Calculate totals for each product
        mappedProducts.forEach((_, productIndex) => {
          updateProductTotals(productIndex);
        });
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const calculateTotals = (
    unitPrice: number,
    quantity: number,
    gst: string
  ) => {
    const totalWithoutGST = unitPrice * quantity;
    const gstValue = gst === "NILL" ? 0 : parseFloat(gst);
    const totalWithGST = totalWithoutGST * (1 + gstValue / 100);
    return { totalWithoutGST, totalWithGST };
  };

  return (
    <div>
      <div className="space-y-4">
        <div className="flex space-x-4">
          <div className="w-1/6">
            <Label>Name</Label>
          </div>
          <div className="w-1/4">
            <Label>Product Description</Label>
          </div>
          <div className="w-1/12 text-center">
            <Label>Qty.</Label>
          </div>
          <div className="w-1/12 text-center">
            <Label>Unit Price</Label>
          </div>
          <div className="w-1/12 text-center">
            <Label>GST%</Label>
          </div>
          <div className="w-1/12 text-right">
            <Label>Taxable Amount (INR)</Label>
          </div>
          <div className="w-1/12 text-right">
            <Label>Total (incl. GST) (INR)</Label>
          </div>
        </div>
        {fields.map((field, productIndex) => (
          <div key={field.id} className="flex space-x-4 items-start">
            {/* Name */}
            <div className="w-1/6">
              <Input
                {...control.register(
                  `quotations.${index}.products.${productIndex}.name`
                )}
                readOnly
              />
              {errors?.quotations?.[index]?.products?.[productIndex]?.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.quotations[index].products[productIndex].name.message}
                </p>
              )}
            </div>
            {/* Description */}
            <div className="w-1/4">
              <Input
                {...control.register(
                  `quotations.${index}.products.${productIndex}.description`
                )}
              />
              {/* <Input
                {...control.register(
                  `quotations.${index}.products.${productIndex}.description`
                )}
              /> */}
              {errors?.quotations?.[index]?.products?.[productIndex]
                ?.modelNo && (
                <p className="text-red-500 text-sm mt-1">
                  {
                    errors.quotations[index].products[productIndex].modelNo
                      .message
                  }
                </p>
              )}
            </div>
            {/* Quantity */}
            <div className="w-1/12">
              <Input
                type="number"
                className="text-center"
                {...control.register(
                  `quotations.${index}.products.${productIndex}.quantity`,
                  {
                    valueAsNumber: true,
                  }
                )}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  setValue(
                    `quotations.${index}.products.${productIndex}.quantity`,
                    value
                  );
                  updateProductTotals(productIndex);
                }}
              />
              {errors?.quotations?.[index]?.products?.[productIndex]
                ?.quantity && (
                <p className="text-red-500 text-sm mt-1">
                  {
                    errors.quotations[index].products[productIndex].quantity
                      .message
                  }
                </p>
              )}
            </div>
            {/* unit price */}
            <div className="w-1/12">
              <Controller
                name={`quotations.${index}.products.${productIndex}.unitPrice`}
                control={control}
                render={({ field }) => (
                  <Input
                    type="number"
                    step="0.01"
                    className="text-right"
                    {...field}
                    onChange={(e) => {
                      field.onChange(parseFloat(e.target.value));
                      updateProductTotals(productIndex);
                    }}
                  />
                )}
              />
              {errors?.quotations?.[index]?.products?.[productIndex]
                ?.unitPrice && (
                <p className="text-red-500 text-sm mt-1">
                  {
                    errors.quotations[index].products[productIndex].unitPrice
                      .message
                  }
                </p>
              )}
            </div>
            {/* GST */}
            <div className="w-1/12">
              <Controller
                name={`quotations.${index}.products.${productIndex}.gst`}
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      updateProductTotals(productIndex);
                    }}
                    value={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="GST" />
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
              {errors?.quotations?.[index]?.products?.[productIndex]?.gst && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.quotations[index].products[productIndex].gst.message}
                </p>
              )}
            </div>
            {/* Taxable amount */}
            <div className="w-1/12">
              <Input
                className="text-right"
                {...control.register(
                  `quotations.${index}.products.${productIndex}.totalPriceWithoutGST`
                )}
                readOnly
                value={(
                  parseFloat(
                    getValues(
                      `quotations.${index}.products.${productIndex}.totalPriceWithoutGST`
                    )
                  ) || 0
                ).toFixed(2)}
              />
            </div>
            {/* Total amount */}
            <div className="w-1/12">
              <Input
                className="text-right"
                {...control.register(
                  `quotations.${index}.products.${productIndex}.totalPriceWithGST`
                )}
                readOnly
                value={(
                  parseFloat(
                    getValues(
                      `quotations.${index}.products.${productIndex}.totalPriceWithGST`
                    )
                  ) || 0
                ).toFixed(2)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { ProductList };

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { X } from "lucide-react";
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
  handleError,
  globalFormData,
}: {
  products: Product[];
  control: any;
  index: number;
  getValues: any;
  setValue: any;
  errors: any;
  globalFormData: any;
  handleError: any;
}) => {
  const { fields, replace, remove } = useFieldArray({
    control,
    name: `quotations.${index}.products`,
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);

  const handleDeleteClick = (productIndex: number) => {
    setProductToDelete(productIndex);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete === null) return;

    // Remove the product from the fields array
    remove(productToDelete);

    // Remove the product from the form data
    const currentProducts = getValues(`quotations.${index}.products`);
    const updatedProducts = currentProducts.filter(
      (_: any, i: number) => i !== productToDelete
    );
    setValue(`quotations.${index}.products`, updatedProducts);

    // Update global form data
    if (globalFormData.has("quotations")) {
      const quotations = JSON.parse(globalFormData.get("quotations") as string);
      quotations[index].products = updatedProducts;
      globalFormData.set("quotations", JSON.stringify(quotations));
    }

    // Reset state
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const updateProductTotals = useCallback(
    (productIndex: number) => {
      handleError("");
      const unitPrice = getValues(
        `quotations.${index}.products.${productIndex}.unitPrice`
      );
      const quantity = getValues(
        `quotations.${index}.products.${productIndex}.quantity`
      );
      const gst = getValues(`quotations.${index}.products.${productIndex}.gst`);

      const { totalWithoutGST, totalWithGST } = calculateTotals(
        unitPrice,
        quantity,
        gst
      );
      setValue(
        `quotations.${index}.products.${productIndex}.totalPriceWithoutGST`,
        totalWithoutGST
      );
      setValue(
        `quotations.${index}.products.${productIndex}.totalPriceWithGST`,
        totalWithGST
      );

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
          description: `${product.name} | ${product.description}` || "",
          rfpProductId: product.rfpProductId || "",
          gst: product.gst || "0",
          totalPriceWithoutGST: product.totalPriceWithoutGST || 0,
          totalPriceWithGST: product.totalPriceWithGST || 0,
        }));

        replace(mappedProducts);

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
          <div className="w-1/2">
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
          <div className="w-1/12">
            <Label>Actions</Label>
          </div>
        </div>
        {fields.map((field, productIndex) => (
          <div key={field.id} className="flex space-x-4 items-start">
            <div className="w-1/2">
              <Input
                {...control.register(
                  `quotations.${index}.products.${productIndex}.description`
                )}
              />
            </div>
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
                readOnly
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
              {errors && <p className="text-red-500 text-sm mt-1">{errors}</p>}
            </div>
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
                  ) || 0.0
                ).toFixed(2)}
              />
            </div>
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
                  ) || 0.0
                ).toFixed(2)}
              />
            </div>
            <div className="w-1/12">
              <Button
                type="button"
                onClick={() => handleDeleteClick(productIndex)}
                variant="outline"
                size="icon"
                className="text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export { ProductList };

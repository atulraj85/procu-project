// Step 1: Define Types

import React, { useState, useEffect, useCallback, ChangeEvent } from "react";
import {
  useForm,
  useFieldArray,
  Controller,
  useWatch,
  Control,
  UseFormSetValue,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2, Plus, PlusIcon, X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Add quotation ref number (Quotation table)

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

type OtherCharge = {
  id: any;
  price: any;
  name: string;
  gst: string;
  unitPrice: number;
};

type SupportingDocument = {
  id?: any;
  documentType?: any;
  documentName?: any;
  location?: any;
  name?: string;
  fileName?: string;
};

type Total = {
  withGST: number;
  withoutGST: number;
};

type Quotation = {
  vendor: any;
  totalAmount(totalAmount: any): number;
  totalAmountWithoutGST(totalAmountWithoutGST: any): number;
  vendorId: string;
  products: Product[];
  otherCharges: OtherCharge[];
  total: Total;
  supportingDocuments: SupportingDocument[];
};

type FormData = {
  quotations: Quotation[];
};

const globalFormData = new FormData();

// Step 2: Create Vendor Selector Component

type Vendor = {
  id: string;
  companyName: string;
  contactDisplayName: string;
  email: string;
  mobile: string;
  gstin: string;
};

const VendorSelector = ({
  index,
  setValue,
  setShowCheckbox,
  vendor,
  setVendorError,
}: {
  index: number;
  setValue: any;
  setShowCheckbox: any;
  vendor: any;
  setVendorError: (error: string | null) => void; // New prop type
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [fetchedVendors, setFetchedVendors] = useState<Vendor[]>([]);
  const [approvedVendor, setApprovedVendor] = useState<Vendor | null>(null);
  const [disableVendorSearch, setDisableVendorSearch] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (vendor) {
      setApprovedVendor(vendor);
      setDisableVendorSearch(true);
      setVendorError(null); // Clear error when vendor is set
    }
  }, [vendor]);

  const handleSearchChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchTerm(value);

      if (value) {
        try {
          const response = await fetch(`/api/ajax/vendors?q=${value}`);
          const responseData = await response.json();
          console.log("responseData", responseData);
          const formattedVendors = responseData.map((vendor: any) => ({
            ...vendor,
            vendorId: vendor.productId || vendor.id || String(vendor._id),
          }));
          setFetchedVendors(formattedVendors);
        } catch (error) {
          setError("Failed to fetch vendors");
        }
      } else {
        setFetchedVendors([]);
      }
    },
    []
  );

  const addVendor = useCallback(
    (vendor: Vendor) => {
      if (!vendor.id) {
        setError("Vendor ID is missing");
        return;
      }

      // Check if the vendor is already added to any quotation
      const quotations = JSON.parse(
        (globalFormData.get("quotations") as string) || "[]"
      );
      const isVendorAlreadyAdded = quotations.some(
        (quotation: any) => quotation.vendorId === vendor.id
      );

      if (isVendorAlreadyAdded) {
        setError(
          `Vendor with ID ${vendor.id} is already added to a quotation.`
        );
        return;
      }

      setApprovedVendor(vendor);
      setDisableVendorSearch(true);
      setSearchTerm("");
      setFetchedVendors([]);

      const vendorData = {
        vendorId: vendor.id,
      };

      if (!globalFormData.has("quotations")) {
        globalFormData.set("quotations", JSON.stringify([]));
      }

      const updatedQuotations = JSON.parse(
        globalFormData.get("quotations") as string
      );
      updatedQuotations[index] = { ...updatedQuotations[index], ...vendorData };
      globalFormData.set("quotations", JSON.stringify(updatedQuotations));
    },
    [index]
  );

  const removeVendor = () => {
    setApprovedVendor(null);
    setValue(`quotations.${index}.vendorId`, "");
    setDisableVendorSearch(false);

    // Remove vendor data from global FormData
    if (globalFormData.has("quotations")) {
      const quotations = JSON.parse(globalFormData.get("quotations") as string);
      if (quotations[index]) {
        delete quotations[index].vendorId;
      }
      globalFormData.set("quotations", JSON.stringify(quotations));
    }
  };

  useEffect(() => {
    if (!approvedVendor) {
      setVendorError("You must select a vendor."); // Set error if no vendor is selected
    } else {
      setVendorError(null); // Clear error if a vendor is selected
    }
  }, [approvedVendor, setVendorError]);
  return (
    <Card>
      <CardHeader>
        <div className="flex">
          <CardTitle className="text-lg">Vendor Details</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between">
          <div className="w-[70%]">
            {error && <div className="text-red-500">{error}</div>}
            {approvedVendor && (
              <div className="flex items-center space-x-2 mb-2">
                <div className="flex flex-col">
                  <Label className="mb-2 font-bold text-[16px] text-slate-700">
                    Vendor Name
                  </Label>
                  <Input
                    disabled
                    value={approvedVendor.companyName}
                    placeholder="Name"
                    className="flex-1"
                  />
                </div>
                <div className="flex flex-col">
                  <Label className="mb-2 font-bold text-[16px] text-slate-700">
                    Email
                  </Label>
                  <Input
                    disabled
                    value={approvedVendor.email}
                    placeholder="Email"
                    className="flex-1"
                  />
                </div>
                <div className="flex flex-col">
                  <Label className="mb-2 font-bold text-[16px] text-slate-700">
                    Phone
                  </Label>
                  <Input
                    disabled
                    value={approvedVendor.mobile}
                    placeholder="Phone"
                    className="flex-1"
                  />
                </div>
                <div className="flex flex-col">
                  <Label className="mb-2 font-bold text-[16px] text-slate-700">
                    GSTIN
                  </Label>
                  <Input
                    disabled
                    value={approvedVendor.gstin}
                    placeholder="GSTIN"
                    className="flex-1"
                  />
                </div>
                <div className="flex flex-col">
                  <Label className="mb-8 font-bold text-[16px] text-slate-700"></Label>
                  <Button
                    type="button"
                    onClick={() => removeVendor()}
                    variant="outline"
                    size="icon"
                    className="text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="w-[30%] pl-8">
            <Input
              className="border-2 border-green-700"
              disabled={disableVendorSearch}
              type="text"
              placeholder="Search Vendors..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <div>
              {fetchedVendors.length > 0 && (
                <div className="mt-2">
                  <h3 className="font-semibold">Fetched Vendors:</h3>
                  <ul>
                    {fetchedVendors.map((vendor) => (
                      <li
                        key={vendor.id}
                        className="py-1 cursor-pointer hover:bg-gray-200"
                        onClick={() => {
                          addVendor(vendor);
                          setValue(`quotations.${index}.vendorId`, vendor.id);
                          setFetchedVendors([]);
                          setError(null);
                        }}
                      >
                        {vendor.companyName} | {vendor.email}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {disableVendorSearch && (
              <Alert
                variant="default"
                className="mt-2 border-orange-500 text-orange-500"
              >
                <AlertCircle className="h-4 w-4" color="orange" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  &quot;You need to remove the current vendor first to modify
                  existing vendor details.&quot;
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Step 3: Create Product List Component

const ProductList = ({
  products,
  control,
  index,
  getValues,
  setValue,
  setErrors,
}: {
  products: Product[];
  control: any;
  index: number;
  getValues: any;
  setValue: any;
  setErrors: (error: string) => void; // New prop type
}) => {
  const { fields, replace } = useFieldArray({
    control,
    name: `quotations.${index}.products`,
  });

  const [loading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // Single error state

  useEffect(() => {
    setIsLoading(true);
    try {
      if (Array.isArray(products) && products.length > 0) {
        const mappedProducts = products.map((product: any) => ({
          id: product.id || null,
          name: product.name || "",
          modelNo: product.modelNo || "",
          quantity: product.quantity || 0,
          unitPrice: product.unitPrice || 0,
          rfpProductId: product.rfpProductId || "",
          gst: product.gst || "NILL",
          totalPriceWithoutGST: product.totalPriceWithoutGST || 0,
          totalPriceWithGST: product.totalPriceWithGST || 0,
        }));

        replace(mappedProducts);
      }
      setErrors(""); // Clear errors on successful load
    } catch (err) {
      setErrors(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  }, [products, replace, index, setErrors]);

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

  const validateProduct = (productIndex: number) => {
    const quantity = getValues(
      `quotations.${index}.products.${productIndex}.quantity`
    );
    const unitPrice = getValues(
      `quotations.${index}.products.${productIndex}.unitPrice`
    );
    const gst = getValues(`quotations.${index}.products.${productIndex}.gst`);

    if (quantity <= 0 || !Number.isInteger(quantity)) {
      setError(
        `Quantity must be a positive integer for product ${productIndex + 1}.`
      );
      return false;
    }

    if (unitPrice < 0) {
      setError(
        `Unit Price must be a positive number for product ${productIndex + 1}.`
      );
      return false;
    }

    if (!["NILL", "0", "3", "5", "12", "18", "28"].includes(gst)) {
      setError(`Invalid GST value for product ${productIndex + 1}.`);
      return false;
    }

    setError(null); // Clear error if validation passes
    return true;
  };

  const updateProductTotals = (productIndex: number) => {
    if (!validateProduct(productIndex)) return;

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
          <div className="w-1/6 text-center">
            <Label>Unit Price</Label>
          </div>
          <div className="w-1/12 text-center">
            <Label>GST%</Label>
          </div>
          <div className="w-1/6 text-right">
            <Label>Taxable Amount (INR)</Label>
          </div>
          <div className="w-1/6 text-right">
            <Label>Total (incl. GST) (INR)</Label>
          </div>
        </div>
        {loading ? (
          <div>Fetching Data...</div>
        ) : (
          fields.map((field, productIndex) => (
            <div key={field.id} className="flex space-x-4 items-start">
              <div className="w-1/6">
                <Input
                  {...control.register(
                    `quotations.${index}.products.${productIndex}.name`
                  )}
                  readOnly
                />
              </div>
              <div className="w-1/4">
                <Textarea className="w-full" />
              </div>
              <div className="w-1/12">
                <Input
                  type="number"
                  className="text-center"
                  {...control.register(
                    `quotations.${index}.products.${productIndex}.quantity`
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
              </div>
              <div className="w-1/6">
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
              </div>
              <div className="w-1/6">
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
              <div className="w-1/6">
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
          ))
        )}
        {error && <div className="text-red-500">{error}</div>}
      </div>
    </div>
  );
};

export { ProductList };

// Step 4: Create Other Charges List Component

const OtherChargesList = ({
  control,
  index,
  formData,
}: {
  control: any;
  index: number;
  formData: any;
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
      <CardContent>
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
      </CardContent>
    </div>
  );
};
// Step 5: Create Supporting Documents List Component
import { Eye } from "lucide-react";
import { getTodayDate } from "@/lib/getTodayDate";

const SupportingDocumentsList = ({
  control,
  index,
  setValue,
  files,
  setFiles,
  getValue,
}: {
  control: Control<FormData>;
  index: number;
  setValue: UseFormSetValue<FormData>;
  getValue: any;
  files: { [key: string]: File };
  setFiles: React.Dispatch<React.SetStateAction<{ [key: string]: File }>>;
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `quotations.${index}.supportingDocuments`,
  });

  const quotation = useWatch({
    control,
    name: `quotations.${index}`,
  });

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    docIndex: number
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const documentName = getValue(
        `quotations.${index}.supportingDocuments.${docIndex}.name`
      );
      const fileKey = `${getValue(
        `quotations.${index}.vendorId`
      )}/${documentName}`;
      setFiles((prevFiles) => ({
        ...prevFiles,
        [fileKey]: file,
      }));
      setValue(
        `quotations.${index}.supportingDocuments.${docIndex}.fileName`,
        file.name
      );
    }
  };

  const handlePreview = (location: string) => {
    window.open(`/${location}`, "_blank");
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Supporting Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <Label>Name</Label>
            <Label>File</Label>
          </div>

          <div className="flex">
            <div className="grid grid-cols-1 justify-between">
              {fields.map((field, docIndex) => {
                const location = getValue(
                  `quotations.${index}.supportingDocuments.${docIndex}.location`
                );
                const isFileUploaded = !!location;

                return (
                  <div key={field.id} className="grid grid-cols-3 gap-2">
                    <Input
                      {...control.register(
                        `quotations.${index}.supportingDocuments.${docIndex}.name`
                      )}
                      placeholder="Enter document name"
                    />
                    <div>
                      {isFileUploaded ? (
                        <Input
                          type="text"
                          value={location}
                          disabled
                          className="bg-gray-100"
                        />
                      ) : (
                        <Input
                          type="file"
                          onChange={(e) => handleFileChange(e, docIndex)}
                        />
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {isFileUploaded && (
                        <Button
                          type="button"
                          onClick={() => handlePreview(location)}
                          variant="outline"
                          size="icon"
                          className="text-blue-500"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}

                      <div className="flex flex-col">
                        <Label className="font-bold text-[16px] text-slate-700"></Label>
                        <Button
                          type="button"
                          onClick={() => remove(docIndex)}
                          variant="outline"
                          size="icon"
                          className="text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button
              type="button"
              className="bg-primary"
              onClick={() => append({ name: "", fileName: "" })}
            >
              <PlusIcon />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
// Step 6: Create Total Component
interface TotalComponentProps {
  control: Control<any>;
  index: number;
  setValue: UseFormSetValue<any>;
}
const TotalComponent: React.FC<TotalComponentProps> = ({
  control,
  index,
  setValue,
}) => {
  const quotation = useWatch({
    control,
    name: `quotations.${index}`,
  });

  useEffect(() => {
    // if (quotation.total) {
    //   setValue(`quotations.${index}.total`, quotation.total);
    // }
    const totalWithoutGST =
      (quotation.products?.reduce(
        (sum: number, product: { totalPriceWithoutGST: number | string }) =>
          sum + (Number(product.totalPriceWithoutGST) || 0),
        0
      ) || 0) +
      (quotation.otherCharges?.reduce(
        (sum: number, charge: { unitPrice: number | string }) =>
          sum + (Number(charge.unitPrice) || 0),
        0
      ) || 0);

    const totalWithGST =
      (quotation.products?.reduce(
        (sum: number, product: { totalPriceWithGST: number | string }) =>
          sum + (Number(product.totalPriceWithGST) || 0),
        0
      ) || 0) +
      (quotation.otherCharges?.reduce(
        (sum: number, charge: { gst: string; unitPrice: number | string }) => {
          const gstValue = charge.gst === "NILL" ? 0 : parseFloat(charge.gst);
          return sum + (Number(charge.unitPrice) || 0) * (1 + gstValue / 100);
        },
        0
      ) || 0);

    const newTotal = {
      withoutGST: Number(totalWithoutGST),
      withGST: Number(totalWithGST),
    };

    // Only update if the total has changed
    if (
      quotation.total?.withoutGST !== newTotal.withoutGST ||
      quotation.total?.withGST !== newTotal.withGST
    ) {
      setValue(`quotations.${index}.total`, newTotal);

      // Update globalFormData
      if (globalFormData.has("quotations")) {
        const quotations = JSON.parse(
          globalFormData.get("quotations") as string
        );
        quotations[index].total = newTotal;
        globalFormData.set("quotations", JSON.stringify(quotations));
      }
    }
  }, [quotation, setValue, index]);

  return (
    <div className="grid grid-cols-2 gap-2 p-2 bg-green-200 rounded">
      <div>
        <Label>Taxable Amount (INR)</Label>
        <Input value={quotation.total?.withoutGST || "0.00"} readOnly />
      </div>
      <div>
        <Label>Total (incl. GST) (INR)</Label>
        <Input value={(quotation.total?.withGST || 0).toFixed(2)} readOnly />
      </div>
    </div>
  );
};

// Step 7: Create Main RFP Update Form Component

// type Approver = {
//   name: string;
//   email: string;
//   mobile: string;
// };

// type SupportingDocument = {
//   id: string;
//   documentType: string;
//   documentName: string;
//   location: string;
// };

// type Product = {
//   vendorPricing: any;
//   id: string;
//   rfpProductId: string;
//   price: number;
// };

// type OtherCharge = {
//   id: string;
//   name: string;
//   price: number;
//   gst: number;
// };

// type Total = {
//   withGST: number;
//   withoutGST: number;
// };

// type Quotation = {
//   totalAmount: number;
//   totalAmountWithoutGST: number;
//   vendor: any;
//   products: Product[];
//   otherCharges: OtherCharge[];
//   total: Total;
//   supportingDocuments: SupportingDocument[];
// };

// type RFPData = {
//   rfpId: string;
//   requirementType: string;
//   dateOfOrdering: string;
//   deliveryLocation: string;
//   deliveryByDate: string;
//   rfpStatus: string;
//   preferredQuotationId: string | null;
//   created_at: string;
//   updated_at: string;
//   approvers: Approver[];
//   quotations: Quotation[];
//   createdBy: Approver;
// };

export default function RFPUpdateForm({
  rfpId,
  initialData,
}: {
  rfpId: string;
  initialData: any;
}) {
  // console.log("RFPUpdateForm - Received rfpId:", rfpId);
  // console.log("RFPUpdateForm - Received initialData:", initialData);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [files, setFiles] = useState<{ [key: string]: File }>({});
  const [preferredVendorIndex, setPreferredVendorIndex] = useState<
    number | null
  >(null);
  const [showReasonPrompt, setShowReasonPrompt] = useState(false);
  const [reason, setReason] = useState("");
  const quotationLimit = 3;
  const [quotes, setQuotes] = useState(0);
  const [preferredVendorId, setPreferredVendorId] = useState("");
  const [showCheckbox, setShowCheckbox] = useState(true);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [requirementType, setRequirementType] = useState("");

  const { control, handleSubmit, setValue, getValues } = useForm<any>({
    defaultValues: {
      rfpId: initialData.rfpId,
      rfpStatus: initialData.rfpStatus,
      preferredQuotationId: initialData.preferredQuotationId,
      // products: initialData.products,
      quotations: initialData.quotations.map((quotation: any) => ({
        id: quotation.id,
        refNo: quotation.refNo,
        vendorId: quotation.vendor?.id,
        vendor: quotation.vendor,
        totalAmount: quotation.totalAmount,
        totalAmountWithoutGST: quotation.totalAmountWithoutGST,
        products: quotation.products
          .filter((product: any) => product.type === "product")
          .map((product: any) => ({
            id: product.id,
            rfpProductId: product.rfpProductId,
            name: product.name,
            modelNo: product.modelNo,
            quantity: product.quantity,
            unitPrice: parseFloat(product.price),
            gst: product.gst.toString(),
            totalPriceWithoutGST: parseFloat(product.price) * product.quantity,
            totalPriceWithGST:
              parseFloat(product.price) *
              product.quantity *
              (1 + product.GST / 100),
          })),
        otherCharges: quotation.products
          .filter((product: any) => product.type === "otherCharge")
          .map((charge: any) => ({
            id: charge.id,
            name: charge.name,
            unitPrice: parseFloat(charge.price),
            gst: charge.gst,
          })),
        total: {
          withGST: parseFloat(quotation.totalAmount),
          withoutGST: parseFloat(quotation.totalAmountWithoutGST),
        },
        supportingDocuments: quotation.supportingDocuments.map((doc: any) => ({
          id: doc.id,
          name: doc.documentName,
          fileName: doc.documentName,
          location: doc.location,
        })),
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "quotations",
  });

  useEffect(() => {
    fields.length === 0 ? setQuotes(1) : setQuotes(fields.length);
  }, [fields]);

  useEffect(() => {
    globalFormData.set("quotations", JSON.stringify(getValues().quotations));
    setRequirementType(initialData.requirementType);
  }, [getValues().quotations]);

  const handleDeleteClick = (index: number) => {
    setDeleteIndex(index);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteIndex !== null) {
      remove(deleteIndex);
      setQuotes(quotes - 1);
      setIsDeleteDialogOpen(false);
      setDeleteIndex(null);
    }
  };

  const [errors, setErrors] = useState<{
    [key: string]: string;
  }>({});

  const validateForm = (data: FormData): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Validate preferred vendor
    if (!preferredVendorId) {
      newErrors.preferredVendor = "You must select a preferred quotation.";
    }

    // Validate reference numbers
    fields.forEach((_, index) => {
      const refNo = getValues(`quotations.${index}.refNo`);
      if (!refNo || refNo.trim() === "") {
        newErrors[`quotations.${index}.refNo`] =
          "Reference number is required.";
      }
    });

    // Validate products
    fields.forEach((_, quotationIndex) => {
      const products = getValues(`quotations.${quotationIndex}.products`);
      products.forEach((product: any, productIndex: number) => {
        if (!product.quantity) {
          newErrors[
            `quotations.${quotationIndex}.products.${productIndex}.quantity`
          ] = `Quantity at Quotataion ${
            quotationIndex + 1
          } must be a positive integer.`;
          console.log("here");
        }
        if (product.unitPrice <= 0) {
          newErrors[
            `quotations.${quotationIndex}.products.${productIndex}.unitPrice`
          ] = `Unit price at Quotataion ${
            quotationIndex + 1
          } must be a positive integer.`;
        }
        if (!["NILL", "0", "3", "5", "12", "18", "28"].includes(product.gst)) {
          newErrors[
            `quotations.${quotationIndex}.products.${productIndex}.gst`
          ] = "Invalid GST value.";
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    if (!validateForm(data)) {
      setIsLoading(false);
      return;
    }

    console.log("Text data to be sent:", data);

    if (!preferredVendorId) {
      setError("You must select a preferred quotation before submitting.");
      setIsLoading(false);
      return; // Exit the function if validation fails
    }

    const emptyRefNos = fields.reduce((acc: number[], _, index) => {
      const refNo = getValues(`quotations.${index}.refNo`);
      if (!refNo || refNo.trim() === "") {
        acc.push(index + 1); // Store 1-based index for user-friendly message
      }
      return acc;
    }, []);

    if (emptyRefNos.length > 0) {
      setError(
        `Reference numbers are missing for quotation(s): ${emptyRefNos.join(
          ", "
        )}`
      );
      setIsLoading(false);
      return; // Exit the function if validation fails
    }

    try {
      const formData = new FormData();
      formData.append("rfpId", rfpId);
      const serializedData = JSON.stringify({
        ...data,
        rfpStatus: quotes < 3 ? "DRAFT" : "SUBMITTED",
      });
      formData.append("data", serializedData);
      formData.append("data", serializedData);

      console.log(files);

      // Append files to formData
      Object.entries(files).forEach(([key, file]) => {
        formData.append(key, file);
      });

      console.log("FormData to be sent:", Object.fromEntries(formData));

      const response = await fetch(`/api/rfp/quotation?id=${initialData.id}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const res = await response.json();

        console.log("res", res);
        throw new Error(`${res.error} ${res.reason}`);
      }

      const result = await response.json();
      console.log("RFP updated successfully:", result);
      setSuccess(true);
    } catch (err) {
      console.error("Error updating RFP:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Update RFP</CardTitle>

          <Link href="/dashboard/manager">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="text-black-500 bg-red-400"
            >
              <X className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>

        <CardContent>
          {rfpId && (
            <div className="flex justify-between">
              <p className="text-md text-muted-foreground">RFP ID: {rfpId}</p>
              <p>Date of Updating: {getTodayDate()}</p>
            </div>
          )}

          {fields.map((field, index) => {
            const quotation = getValues(`quotations.${index}`);
            const refNoError =
              error &&
              error.includes(
                `Reference numbers are missing for quotation(s): ${index + 1}`
              );
            return (
              <Accordion
                key={field.id}
                type="single"
                collapsible
                defaultValue={`quotation-${index}`}
                className="mb-4"
              >
                <AccordionItem value={`quotation-${index}`}>
                  <AccordionTrigger>Quotation {index + 1}</AccordionTrigger>

                  <AccordionContent>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          <div className="flex flex-row items-center justify-between gap-2 mb-2">
                            <div className="w-1/4">
                              <Label>Ref No.</Label>
                              <Input
                                {...control.register(
                                  `quotations.${index}.refNo`
                                )}
                              />
                              {refNoError && (
                                <p className="text-red-500 text-sm">
                                  Reference number is required.
                                </p>
                              )}
                            </div>
                            <div className="flex flex-row items-center gap-2">
                              <Checkbox
                                checked={preferredVendorIndex === index}
                                disabled={
                                  preferredVendorIndex !== null &&
                                  preferredVendorIndex !== index
                                }
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setValue(
                                      "preferredVendorId",
                                      quotation.vendorId
                                    );
                                    setPreferredVendorId(quotation.vendorId);
                                    setPreferredVendorIndex(index);
                                  } else {
                                    setPreferredVendorId("");
                                    setPreferredVendorIndex(null);
                                  }
                                }}
                              />
                              <div className="flex flex-col gap-1">
                                <Label className="font-bold text-[16px] text-green-700">
                                  Preferred Quote
                                </Label>
                                {preferredVendorIndex === index && (
                                  <Input
                                    className="mb-2"
                                    placeholder="Reason for preferring this vendor"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                  />
                                )}
                              </div>
                            </div>

                            <div className="w-1/3">
                              <TotalComponent
                                setValue={setValue}
                                control={control}
                                index={index}
                              />
                            </div>
                          </div>
                        </CardTitle>
                      </CardHeader>
                    </Card>

                    <div className="my-2">
                      <VendorSelector
                        setVendorError={(error) => setError(error)} // Pass the error handler
                        setValue={setValue}
                        index={index}
                        setShowCheckbox={setShowCheckbox}
                        vendor={quotation.vendor}
                      />
                    </div>

                    <Card className="my-2">
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Products / Services Details
                        </CardTitle>
                      </CardHeader>

                      <CardContent>
                        <div className="mb-2">
                          <ProductList
                            setErrors={(error) => setError(error)} // Pass the error handler
                            products={
                              quotation.products.length === 0
                                ? initialData.products
                                : quotation.products
                            }
                            setValue={setValue}
                            getValues={getValues}
                            control={control}
                            index={index}
                          />
                        </div>

                        <OtherChargesList
                          control={control}
                          index={index}
                          formData={FormData}
                        />
                      </CardContent>
                    </Card>

                    <SupportingDocumentsList
                      control={control}
                      index={index}
                      setValue={setValue}
                      files={files}
                      setFiles={setFiles}
                      getValue={getValues}
                    />

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        onClick={() => handleDeleteClick(index)}
                        variant="outline"
                        size="icon"
                        className="text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            );
          })}

          {fields.length < quotationLimit && (
            <div className="flex justify-end">
              <Button
                className="bg-primary flex justify-end"
                type="button"
                onClick={() => {
                  if (fields.length < quotationLimit) {
                    append({
                      vendorId: "",
                      products: [],
                      otherCharges: [],
                      total: { withGST: 0, withoutGST: 0 },
                      supportingDocuments: [],
                    });
                    setQuotes(quotes + 1);
                    setShowReasonPrompt(true);
                  } else {
                    setShowReasonPrompt(false);
                  }
                }}
              >
                Add Quotation
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this quotation? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive" className="w-1/4">
          <AlertTitle>Validation Errors</AlertTitle>
          <AlertDescription>
            <ul>
              {Object.entries(errors).map(([key, value]) => (
                <li key={key}>{value}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>RFP updated successfully.</AlertDescription>
        </Alert>
      )}

      {quotes === 3 ? (
        <Button
          className="bg-primary"
          type="submit"
          disabled={isLoading}
          onClick={() => {}}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit RFP"
          )}
        </Button>
      ) : (
        <div className="flex">
          <div>
            <Textarea
              className=" mb-2"
              placeholder="Reason for adding less than 3 quotations"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <Button
              type="submit"
              className="bg-primary"
              onClick={() => {
                if (reason) {
                  append({
                    vendorId: "",
                    products: [],
                    otherCharges: [],
                    total: { withGST: 0, withoutGST: 0 },
                    supportingDocuments: [],
                  });
                  setShowReasonPrompt(false);
                  setReason("");
                }
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Reason and Save Quotation"
              )}
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}

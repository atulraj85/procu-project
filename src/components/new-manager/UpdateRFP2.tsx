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
}: {
  index: number;
  setValue: any;
  setShowCheckbox: any;
  vendor: any;
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
              <Alert variant="default" className="mt-2 border-orange-500 text-orange-500">
                <AlertCircle className="h-4 w-4"  color="orange"/>
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  You need to remove the current vendor first to modify
                  existing vendor details.
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
}: {
  products: Product[];
  control: any;
  index: number;
  getValues: any;
  setValue: any;
}) => {
  const { fields, replace } = useFieldArray({
    control,
    name: `quotations.${index}.products`,
  });

  console.log("products", products);

  if (products.length == 0) {
    console.log("tes");
    const data = getValues(`quotations.products`);
    console.log(data);
  }

  const [error, setError] = useState<string | null>(null);
  const [loading, setIsLoading] = useState(false);

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
      }
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  }, [products, replace, index]);

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

  const updateProductTotals = (productIndex: number) => {
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

    // Update global form data
    if (globalFormData.has("quotations")) {
      const quotations = JSON.parse(globalFormData.get("quotations") as string);
      quotations[index].products[productIndex] = {
        ...quotations[index].products[productIndex],
        unitPrice,
        gst,
        totalPriceWithoutGST: totalWithoutGST,
        totalPriceWithGST: totalWithGST,
      };
      globalFormData.set("quotations", JSON.stringify(quotations));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Products</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          <div className="grid grid-cols-7 gap-2 mb-2">
            <Label>Name</Label>
            <Label>Model No.</Label>
            <Label>Quantity</Label>
            <Label>Unit Price</Label>
            <Label>GST</Label>
            <Label>Total (Without GST)</Label>
            <Label>Total (With GST)</Label>
          </div>

          {loading ? (
            <>Fetching Data</>
          ) : (
            fields.map((field, productIndex) => (
              <div key={field.id} className="grid grid-cols-7 gap-2 m-2">
                <Input
                  {...control.register(
                    `quotations.${index}.products.${productIndex}.name`
                  )}
                  readOnly
                />
                <Input
                  {...control.register(
                    `quotations.${index}.products.${productIndex}.modelNo`
                  )}
                  readOnly
                />
                <Input
                  {...control.register(
                    `quotations.${index}.products.${productIndex}.quantity`
                  )}
                  readOnly
                />
                <Controller
                  name={`quotations.${index}.products.${productIndex}.unitPrice`}
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => {
                        field.onChange(parseFloat(e.target.value));
                        updateProductTotals(productIndex);
                      }}
                    />
                  )}
                />
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
                <Input
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
            ))
          )}
        </div>
      </CardContent>
    </Card>
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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Other Charges (If any)</CardTitle>
        </CardHeader>

        <CardContent>
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
      </Card>
    </div>
  );
};
// Step 5: Create Supporting Documents List Component
import { Eye } from "lucide-react";

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
      <Card className="mr-2">
        <CardHeader>
          <CardTitle className="text-lg">Supporting Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2 mb-2">
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
                  <div key={field.id} className="grid grid-cols-3 gap-2 my-2">
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
              className="bg-primary mt-2"
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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Total</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        <div>
          <Label>Total Without GST</Label>
          <Input value={quotation.total?.withoutGST || "0.00"} readOnly />
        </div>
        <div>
          <Label>Total With GST</Label>
          <Input value={(quotation.total?.withGST || 0).toFixed(2)} readOnly />
        </div>
      </CardContent>
    </Card>
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
  console.log("RFPUpdateForm - Received rfpId:", rfpId);
  console.log("RFPUpdateForm - Received initialData:", initialData);

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
        products: quotation.products.map((product: any) => ({
          id: product.id,
          rfpProductId: product.rfpProductId,
          name: product.name,
          modelNo: product.modelNo,
          quantity: product.quantity,
          unitPrice: parseFloat(product.price),
          gst: product.GST.toString(),
          totalPriceWithoutGST: parseFloat(product.price) * product.quantity,
          totalPriceWithGST:
            parseFloat(product.price) *
            product.quantity *
            (1 + product.GST / 100),
        })),
        otherCharges: quotation.otherCharges.map((charge: any) => ({
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
    setQuotes(fields.length);
  }, [fields]);

  useEffect(() => {
    globalFormData.set("quotations", JSON.stringify(getValues().quotations));
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

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    console.log("Text data to be sent:", data);

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
        throw new Error(`HTTP error! status: ${response.status}`);
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

        <h1>{}</h1>

        <CardContent>
          {fields.map((field, index) => {
            const quotation = getValues(`quotations.${index}`);
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
                          </div>
                        </CardTitle>
                      </CardHeader>
                    </Card>

                    <div className="my-2">
                      <VendorSelector
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

                    <div className="flex mb-2">
                      <div className="w-1/2">
                        <SupportingDocumentsList
                          control={control}
                          index={index}
                          setValue={setValue}
                          files={files}
                          setFiles={setFiles}
                          getValue={getValues}
                        />
                      </div>

                      <div className="w-1/2">
                        <TotalComponent
                          setValue={setValue}
                          control={control}
                          index={index}
                        />
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={() => handleDeleteClick(index)}
                      variant="outline"
                      size="icon"
                      className="text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            );
          })}

          {fields.length < quotationLimit && (
            <Button
              className="bg-primary"
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

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
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
        <div>
          <Textarea
            className="w-1/3 mb-2"
            placeholder="Reason for adding less than 3 quotations"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <Button
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
              "Submit Reason and Add Quotation"
            )}
          </Button>
        </div>
      )}
    </form>
  );
}

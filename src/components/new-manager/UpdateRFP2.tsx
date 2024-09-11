// Step 1: Define Types

import React, { useState, useEffect, useCallback, ChangeEvent } from "react";
import {
  useForm,
  useFieldArray,
  Controller,
  useWatch,
  Control,
  UseFormSetValue,
  useController,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Plus, X } from "lucide-react";
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

type Product = {
  id: string;
  name: string;
  modelNo: string;
  quantity: number;
  unitPrice?: number;
  gst?: string;
  totalPriceWithoutGST?: number;
  totalPriceWithGST?: number;
};

type OtherCharge = {
  name: string;
  gst: string;
  unitPrice: number;
};

type SupportingDocument = {
  name: string;
  file: File | null;
};

type Total = {
  withGST: number;
  withoutGST: number;
};

type Quotation = {
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
  primaryName: string;
  companyName: string;
  contactDisplayName: string;
  email: string;
  mobile: string;
  gstin: string;
};

const VendorSelector = ({
  index,
  setValue,
}: {
  index: number;
  setValue: any;
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [fetchedVendors, setFetchedVendors] = useState<Vendor[]>([]);
  const [approvedVendors, setApprovedVendors] = useState<Vendor[]>([]);
  const [disableVendorSearch, setDisableVendorSearch] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearchChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchTerm(value);

      if (value) {
        try {
          const response = await fetch(`/api/ajax/vendors?q=${value}`);
          const responseData = await response.json();

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

      if (!approvedVendors.some((p) => p.id === vendor.id)) {
        setApprovedVendors((prev) => [...prev, vendor]);
        setDisableVendorSearch(true);
        setSearchTerm("");
        setFetchedVendors([]);

        const vendorData = {
          vendorId: vendor.id,
        };

        if (!globalFormData.has("quotations")) {
          globalFormData.set("quotations", JSON.stringify([]));
        }

        const quotations = JSON.parse(
          globalFormData.get("quotations") as string
        );
        quotations[index] = { ...quotations[index], ...vendorData };
        globalFormData.set("quotations", JSON.stringify(quotations));
      } else {
        setError(`Vendor with ID ${vendor.id} already exists.`);
      }
    },
    [approvedVendors, index]
  );

  const removeVendor = (vendorId: string) => {
    setApprovedVendors((prev) => prev.filter((v) => v.id !== vendorId));
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
        <CardTitle className="text-lg">Vendor Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          disabled={disableVendorSearch}
          className="w-1/2"
          type="text"
          placeholder="Search Vendors..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
        {error && <div className="text-red-500">{error}</div>}
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
                  {vendor.primaryName} | {vendor.email}
                </li>
              ))}
            </ul>
          </div>
        )}
        {approvedVendors.map((vendor) => (
          <div key={vendor.id} className="flex items-center space-x-2 mb-2">
            <div className="flex flex-col">
              <Label className="mb-2 font-bold text-[16px] text-slate-700">
                Vendor Name
              </Label>
              <Input
                disabled
                value={vendor.primaryName}
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
                value={vendor.email}
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
                value={vendor.mobile}
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
                value={vendor.gstin}
                placeholder="GSTIN"
                className="flex-1"
              />
            </div>
            <div className="flex flex-col">
              <Label className="mb-8 font-bold text-[16px] text-slate-700"></Label>
              <Button
                type="button"
                onClick={() => removeVendor(vendor.id)}
                variant="outline"
                size="icon"
                className="text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// Step 3: Create Product List Component

const ProductList = ({
  control,
  index,
  getValues,
  setValue,
}: {
  control: any;
  index: number;
  getValues: any;
  setValue: any;
}) => {
  const { fields } = useFieldArray({
    control,
    name: `quotations.${index}.products`,
  });
  const [error, setError] = useState<string | null>(null);
  const [rfpId, setRfpId] = useState<string>("");
  const [rfpProducts, setRfpProducts] = useState<Product[]>([]);
  const [loading, setIsLoading] = useState(false);

  useEffect(() => {
    setRfpId("b9c42c82-ec99-4163-b886-a348d156ffc8");

    async function fetchRFPProducts() {
      setIsLoading(true);
      if (rfpId) {
        try {
          const rfpProductsData = await fetch(`/api/rfpProduct?rfpId=${rfpId}`);
          const data = await rfpProductsData.json();

          const productsWithDetails: Product[] = await Promise.all(
            data.map(async (rfpProduct: any) => {
              const productData = await fetch(
                `/api/product?id=${rfpProduct.productId}`
              );

              const responseData = await productData.json();

              if (Array.isArray(responseData) && responseData.length > 0) {
                return responseData.map((product: any) => ({
                  id: product.id || null,
                  name: product.name || null,
                  modelNo: product.modelNo || null,
                  quantity: rfpProduct.quantity || 0,
                  amount: 0,
                  unitPrice: product.unitPrice || null,
                  gst: product.gst || null,
                  totalPriceWithoutGST: product.totalPriceWithoutGST || null,
                  totalPriceWithGST: product.totalPriceWithGST || null,
                }));
              }
              return []; // Return an empty array if responseData is not valid
            })
          );

          const flattenedProductsWithDetails = productsWithDetails.flat();

          console.log("productsWithDetails", flattenedProductsWithDetails);

          setRfpProducts(flattenedProductsWithDetails);
          setValue(
            `quotations.${index}.products`,
            flattenedProductsWithDetails
          );

          if (globalFormData.has("quotations")) {
            const quotations = JSON.parse(
              globalFormData.get("quotations") as string
            );
            quotations[index] = {
              ...quotations[index],
              products: flattenedProductsWithDetails,
            };
            globalFormData.set("quotations", JSON.stringify(quotations));
          }

          setError(null);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "An unknown error occurred"
          );
        } finally {
          setIsLoading(false);
        }
      }
    }

    fetchRFPProducts();
  }, [rfpId]);

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
                        const unitPrice = parseFloat(e.target.value);
                        field.onChange(unitPrice);
                        const quantity = getValues(
                          `quotations.${index}.products.${productIndex}.quantity`
                        );
                        const gst = getValues(
                          `quotations.${index}.products.${productIndex}.gst`
                        );
                        const { totalWithoutGST, totalWithGST } =
                          calculateTotals(unitPrice, quantity, gst);

                        const quotations = JSON.parse(
                          globalFormData.get("quotations") as string
                        );
                        quotations[index].products[productIndex].unitPrice =
                          unitPrice;
                        quotations[index].products[
                          productIndex
                        ].totalPriceWithoutGST = totalWithoutGST;
                        quotations[index].products[
                          productIndex
                        ].totalPriceWithGST = totalWithGST;
                        globalFormData.set(
                          "quotations",
                          JSON.stringify(quotations)
                        );

                        // setValue(
                        //   `quotations.${index}.products.${productIndex}.totalPriceWithoutGST`,
                        //   totalWithoutGST
                        // );
                        // setValue(
                        //   `quotations.${index}.products.${productIndex}.totalPriceWithGST`,
                        //   totalWithGST
                        // );
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
                        const unitPrice = getValues(
                          `quotations.${index}.products.${productIndex}.unitPrice`
                        );
                        const quantity = getValues(
                          `quotations.${index}.products.${productIndex}.quantity`
                        );
                        const { totalWithoutGST, totalWithGST } =
                          calculateTotals(unitPrice, quantity, value);
                        setValue(
                          `quotations.${index}.products.${productIndex}.totalPriceWithoutGST`,
                          totalWithoutGST
                        );
                        setValue(
                          `quotations.${index}.products.${productIndex}.totalPriceWithGST`,
                          totalWithGST
                        );
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
                    getValues(
                      `quotations.${index}.products.${productIndex}.totalPriceWithoutGST`
                    ) || 0
                  ).toFixed(2)}
                />
                <Input
                  {...control.register(
                    `quotations.${index}.products.${productIndex}.totalPriceWithGST`
                  )}
                  readOnly
                  value={(
                    getValues(
                      `quotations.${index}.products.${productIndex}.totalPriceWithGST`
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
      quotations[index].otherCharges = fields;
      globalFormData.set("quotations", JSON.stringify(quotations));
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
          <div className="grid grid-cols-4 gap-2 mb-2">
            <Label>Name</Label>
            <Label>GST</Label>
            <Label>Unit Price</Label>
          </div>
          {fields.map((field, chargeIndex) => (
            <div className="space-y-2 m-2">
              <div key={field.id} className="grid grid-cols-4 gap-2">
                <Input
                  {...control.register(
                    `quotations.${index}.otherCharges.${chargeIndex}.name`
                  )}
                />
                <Controller
                  name={`quotations.${index}.otherCharges.${chargeIndex}.gst`}
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
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

          <Button
            className="bg-primary mt-2"
            onClick={() => {
              append({ name: "", gst: "NILL", unitPrice: 0 });
              updateGlobalFormData();
            }}
          >
            Add Other Charge
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// Step 5: Create Supporting Documents List Component

const SupportingDocumentsList = ({
  control,
  index,
  setValue,
}: {
  control: any;
  index: number;
  setValue: any;
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `quotations.${index}.supportingDocuments`,
  });

  const updateGlobalFormData = useCallback(() => {
    if (globalFormData.has("quotations")) {
      const quotations = JSON.parse(globalFormData.get("quotations") as string);
      quotations[index].supportingDocuments = fields;
      globalFormData.set("quotations", JSON.stringify(quotations));
    }
  }, [fields, index]);

  useEffect(() => {
    updateGlobalFormData();
  }, [fields, updateGlobalFormData]);

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Supporting Documents</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <Label>Name</Label>
            <Label>File</Label>
            <Label></Label>
          </div>
          {fields.map((field, docIndex) => (
            <div key={field.id} className="grid grid-cols-3 gap-2 m-2">
              <Input
                {...control.register(
                  `quotations.${index}.supportingDocuments.${docIndex}.name`
                )}
              />
              <Input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setValue(
                    `quotations.${index}.supportingDocuments.${docIndex}.file`,
                    file
                  );
                  updateGlobalFormData();
                }}
              />
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
          ))}
          <Button
            className="bg-primary mt-2"
            onClick={() => append({ name: "", file: null })}
          >
            Add Supporting Document
          </Button>
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

    setValue(`quotations.${index}.total`, {
      withoutGST: Number(totalWithoutGST.toFixed(2)),
      withGST: Number(totalWithGST.toFixed(2)),
    });

    // Update globalFormData
    if (globalFormData.has("quotations")) {
      const quotations = JSON.parse(globalFormData.get("quotations") as string);
      quotations[index].total = {
        withoutGST: Number(totalWithoutGST.toFixed(2)),
        withGST: Number(totalWithGST.toFixed(2)),
      };
      globalFormData.set("quotations", JSON.stringify(quotations));
    }
  }, [quotation, setValue, index]);

  return (
    <div className="grid grid-cols-2 gap-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label>Total Without GST</Label>
            <Input
              value={quotation.total?.withoutGST?.toFixed(2) || "0.00"}
              readOnly
            />
          </div>
          <div>
            <Label>Total With GST</Label>
            <Input
              value={quotation.total?.withGST?.toFixed(2) || "0.00"}
              readOnly
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Step 7: Create Main RFP Update Form Component

export default function RFPUpdateForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const formData = new FormData();

  const { control, handleSubmit, setValue, getValues } = useForm<FormData>({
    defaultValues: {
      quotations: [
        {
          vendorId: "",
          products: [],
          otherCharges: [],
          total: { withGST: 0, withoutGST: 0 },
          supportingDocuments: [],
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "quotations",
  });

  const jsonToFormData = (data: any) => {
    const formData = new FormData();

    // Append each property of the JSON object to FormData
    for (const key in data) {
      if (Array.isArray(data[key])) {
        data[key].forEach((item, index) => {
          for (const itemKey in item) {
            // If the item is an object, append its properties
            if (typeof item[itemKey] === "object" && item[itemKey] !== null) {
              for (const subKey in item[itemKey]) {
                formData.append(
                  `${key}[${index}][${itemKey}][${subKey}]`,
                  item[itemKey][subKey]
                );
              }
            } else {
              formData.append(`${key}[${index}][${itemKey}]`, item[itemKey]);
            }
          }
        });
      } else {
        formData.append(key, data[key]);
      }
    }

    return formData;
  };

  useEffect(() => {
    globalFormData.set("quotations", JSON.stringify(getValues().quotations));
  }, []);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      console.log(globalFormData);

      const response = await fetch(
        "/api/rfp/quotation?id=b9c42c82-ec99-4163-b886-a348d156ffc8",
        {
          method: "PUT",
          body: formData,
        }
      );

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
        <CardHeader>
          <CardTitle>Update RFP</CardTitle>
        </CardHeader>
        <CardContent>
          {fields.map((field, index) => (
            <Accordion
              key={field.id}
              type="single"
              collapsible
              defaultValue={index === 0 ? `quotation-0` : undefined}
              className="mb-4"
            >
              <AccordionItem value={`quotation-${index}`}>
                <AccordionTrigger>
                  {index === 0
                    ? "Primary Quotation"
                    : `Secondary Quotation ${index}`}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="m-2">
                    <VendorSelector setValue={setValue} index={index} />
                  </div>
                  <div className="m-2">
                    <ProductList
                      setValue={setValue}
                      getValues={getValues}
                      control={control}
                      index={index}
                    />
                  </div>

                  <OtherChargesList
                    control={control}
                    index={index}
                    formData={formData}
                  />

                  <div className="m-2">
                    <TotalComponent
                      setValue={setValue}
                      control={control}
                      index={index}
                    />
                  </div>
                  <div className="m-2">
                    <SupportingDocumentsList
                      setValue={setValue}
                      control={control}
                      index={index}
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={() => {
                      console.log("Removing index:", index);
                      remove(index);
                    }}
                    variant="outline"
                    size="icon"
                    className="text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))}

          {fields.length < 3 && (
            <Button
              onClick={() =>
                append({
                  vendorId: "",
                  products: [],
                  otherCharges: [],
                  total: { withGST: 0, withoutGST: 0 },
                  supportingDocuments: [],
                })
              }
            >
              Add Quotation
            </Button>
          )}
        </CardContent>
      </Card>
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
      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating...
          </>
        ) : (
          "Update RFP"
        )}
      </Button>
    </form>
  );
}

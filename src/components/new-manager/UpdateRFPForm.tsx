import React, {
  ChangeEvent,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
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
} from "../ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Updated type definitions
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

type Vendor = {
  id: string;
  primaryName: string;
  companyName: string;
  contactDisplayName: string;
  email: string;
  mobile: string;
  gstin: string;
};

type SupportingDocumentKeys = "quotation" | "bill" | "productCatalog";

type Quotation = {
  vendorId: string;
  isPrimary: boolean;
  products: Product[];
  otherCharges: OtherCharge[];
  totalAmount: number;
  supportingDocuments: {
    [K in SupportingDocumentKeys]: File | null;
  };
};

type FormData = {
  quotations: Quotation[];
  preferredVendorId: string;
};

// Custom hook for API calls
const useApi = () => {
  const fetchData = useCallback(async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }
    return response.json();
  }, []);

  return { fetchData };
};

export default function RFPUpdateForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [rfpId, setRfpId] = useState<string>("");
  const [rfpProducts, setRfpProducts] = useState<Product[]>([]);
  const [searchVendorTerm, setSearchVendorTerm] = useState("");
  const [fetchedVendors, setFetchedVendors] = useState<Vendor[]>([]);
  const [approvedVendors, setApprovedVendors] = useState<Vendor[]>([]);

  const { fetchData } = useApi();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      quotations: [
        {
          vendorId: "",
          isPrimary: true,
          products: [],
          otherCharges: [],
          totalAmount: 0,
          supportingDocuments: {
            quotation: null,
            bill: null,
            productCatalog: null,
          },
        },
      ],
      preferredVendorId: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "quotations",
  });

  const handleSearchChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>, entity: string) => {
      const value = e.target.value;
      setSearchVendorTerm(value);

      if (value) {
        try {
          const data = await fetchData(`/api/ajax/${entity}?q=${value}`);
          if (entity === "vendors") {
            const formattedVendors = data.map((vendor: any) => ({
              ...vendor,
              vendorId: vendor.productId || vendor.id || String(vendor._id),
            }));
            setFetchedVendors(formattedVendors);
          }
        } catch (error) {
          console.error(`Error fetching ${entity}:`, error);
          setError(`Failed to fetch ${entity}`);
        }
      } else {
        setFetchedVendors([]);
      }
    },
    [fetchData]
  );

  const addProduct = useCallback(
    (vendor: Vendor) => {
      if (!vendor.id) {
        setError("Vendor ID is missing");
        return;
      }

      const vendorExists = approvedVendors.some((p) => p.id === vendor.id);

      if (!vendorExists) {
        setApprovedVendors((prevVendors) => [...prevVendors, vendor]);
        setSearchVendorTerm("");
        setFetchedVendors([]);
      } else {
        setError(`Vendor with ID ${vendor.id} already exists.`);
      }
    },
    [approvedVendors]
  );

  const removeProduct = useCallback((index: number) => {
    setApprovedVendors((prevVendors) =>
      prevVendors.filter((_, i) => i !== index)
    );
  }, []);

  const fetchRFPProducts = useCallback(async () => {
    if (rfpId) {
      try {
        setIsLoading(true);
        const rfpProductsData = await fetchData(
          `/api/rfpProduct?rfpId=${rfpId}`
        );
        const productsWithDetails = await Promise.all(
          rfpProductsData.map(async (rfpProduct: any) => {
            const productData = await fetchData(
              `/api/product?id=${rfpProduct.productId}`
            );
            return {
              id: productData[0].id,
              name: productData[0].name,
              modelNo: productData[0].modelNo,
              quantity: rfpProduct.quantity,
              amount: 0,
            };
          })
        );

        setRfpProducts(productsWithDetails);

        setValue(
          "quotations",
          fields.map((field, index) => ({
            ...field,
            isPrimary: index === 0,
            products: productsWithDetails,
          }))
        );
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    }
  }, [rfpId, fetchData, fields, setValue]);

  const handleRFPIdChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setRfpId(e.target.value);
  }, []);

  const calculateTotalAmount = useCallback(
    (index: number) => {
      const quotation = fields[index];
      const productTotal = quotation.products.reduce(
        (sum, product) => sum + product.totalPriceWithGST!,
        0
      );
      const otherChargesTotal = quotation.otherCharges.reduce(
        (sum, charge) =>
          sum + charge.unitPrice * (1 + parseFloat(charge.gst) / 100),
        0
      );
      const total = productTotal + otherChargesTotal;
      setValue(`quotations.${index}.totalAmount`, total);
    },
    [fields, setValue]
  );

  const calculateProductTotals = useCallback(
    (index: number, productIndex: number) => {
      const product = fields[index].products[productIndex];
      const totalWithoutGST = product.quantity * product.unitPrice!;
      const totalWithGST =
        product.gst === "NILL"
          ? totalWithoutGST
          : totalWithoutGST * (1 + parseFloat(product.gst!) / 100);

      setValue(
        `quotations.${index}.products.${productIndex}.totalPriceWithoutGST`,
        totalWithoutGST
      );
      setValue(
        `quotations.${index}.products.${productIndex}.totalPriceWithGST`,
        totalWithGST
      );
      calculateTotalAmount(index);
    },
    [fields, setValue, calculateTotalAmount]
  );

  const onSubmit = useCallback(
    async (data: FormData) => {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      const formData = new FormData();
      formData.append(
        "data",
        JSON.stringify({
          rfpStatus: "PENDING",
          quotations: data.quotations.map((q) => ({
            vendorId: q.vendorId,
            isPrimary: q.isPrimary,
            products: q.products,
            totalAmount: q.totalAmount,
            supportingDocuments: {
              quotation: q.supportingDocuments.quotation?.name,
              bill: q.supportingDocuments.bill?.name,
              productCatalog: q.supportingDocuments.productCatalog?.name,
            },
          })),
          preferredVendorId: data.preferredVendorId,
        })
      );

      data.quotations.forEach((quotation, index) => {
        Object.entries(quotation.supportingDocuments).forEach(([key, file]) => {
          if (file) {
            formData.append(`${index}-${key}`, file);
          }
        });
      });

      try {
        const response = await fetch(`/api/rfp/quotation?id=${rfpId}`, {
          method: "PUT",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to update RFP");
        }

        setSuccess(true);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [rfpId]
  );

  // Memoize the form rendering
  const renderForm = useMemo(
    () => (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Update RFP</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="flex-grow">
                <Label htmlFor="rfpId">RFP ID</Label>
                <Input id="rfpId" value={rfpId} onChange={handleRFPIdChange} />
              </div>
              <Button
                type="button"
                onClick={fetchRFPProducts}
                disabled={isLoading || !rfpId}
                className="mt-5"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div>
              {fields.length > 0 && (
                <div className="space-y-4 mb-6">
                  <h3 className="text-lg font-semibold">Primary Quotation</h3>
                  <div key={fields[0].id} className="grid gap-4">
                    {/* Vendor Details */}
                    <div>
                      <Label htmlFor={`quotations.0.vendorId`}>
                        Vendor Details
                      </Label>
                      {errors.quotations?.[0]?.vendorId && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.quotations[0]?.vendorId?.message}
                        </p>
                      )}

                      <Input
                        type="text"
                        placeholder="Search Vendors..."
                        value={searchVendorTerm}
                        onChange={(e) => handleSearchChange(e, "vendors")}
                        className="flex-1 my-2 mb-10"
                      />

                      {fetchedVendors.length > 0 && (
                        <div className="mt-2">
                          <h3 className="font-semibold">Fetched Products:</h3>
                          <ul>
                            {fetchedVendors.map((vendor) => (
                              <li
                                key={vendor.id}
                                className="py-1 cursor-pointer hover:bg-gray-200"
                                onClick={() => {
                                  if (vendor) {
                                    addProduct(vendor);
                                  } else {
                                    console.error("No vendor selected");
                                  }
                                }}
                              >
                                {vendor.primaryName} | {vendor.email}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {approvedVendors.map((vendor, index) => (
                        <div
                          key={vendor.id}
                          className="flex items-center space-x-2 mb-2"
                        >
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
                              onClick={() => removeProduct(index)}
                              variant="outline"
                              size="icon"
                              className="text-red-500"
                            >
                              <X className="h-4 w-4 " />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Products */}
                    <div className="space-y-2">
                      <Label>Products</Label>
                      <div className="grid grid-cols-7 gap-2 mb-2">
                        <Label>Name</Label>
                        <Label>Model No.</Label>
                        <Label>Quantity</Label>
                        <Label>Unit Price</Label>
                        <Label>GST</Label>
                        <Label>Total (Without GST)</Label>
                        <Label>Total (With GST)</Label>
                      </div>
                      {fields[0].products.map((product, productIndex) => (
                        <div
                          key={product.id}
                          className="grid grid-cols-7 gap-2"
                        >
                          <Input value={product.name} readOnly />
                          <Input value={product.modelNo} readOnly />
                          <Input value={product.quantity.toString()} readOnly />
                          <Controller
                            name={`quotations.0.products.${productIndex}.unitPrice`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(parseFloat(e.target.value));
                                  calculateProductTotals(0, productIndex);
                                }}
                              />
                            )}
                          />
                          <Controller
                            name={`quotations.0.products.${productIndex}.gst`}
                            control={control}
                            render={({ field }) => (
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  calculateProductTotals(0, productIndex);
                                }}
                                value={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select GST" />
                                </SelectTrigger>
                                <SelectContent>
                                  {[
                                    "NILL",
                                    "0",
                                    "3",
                                    "5",
                                    "12",
                                    "18",
                                    "28",
                                  ].map((gst) => (
                                    <SelectItem key={gst} value={gst}>
                                      {gst}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                          <Input
                            value={product.totalPriceWithoutGST?.toFixed(2)}
                            readOnly
                          />
                          <Input
                            value={product.totalPriceWithGST?.toFixed(2)}
                            readOnly
                          />
                        </div>
                      ))}
                    </div>

                    {/* Other Charges */}
                    <div className="space-y-2">
                      <Label>Other Charges</Label>
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <Label>Name</Label>
                        <Label>GST</Label>
                        <Label>Unit Price</Label>
                      </div>
                      <Controller
                        name="quotations.0.otherCharges"
                        control={control}
                        render={({ field }) => (
                          <>
                            {field.value.map((charge, chargeIndex) => (
                              <div
                                key={chargeIndex}
                                className="grid grid-cols-3 gap-2"
                              >
                                <Input
                                  value={charge.name}
                                  onChange={(e) => {
                                    const newCharges = [...field.value];
                                    newCharges[chargeIndex].name =
                                      e.target.value;
                                    field.onChange(newCharges);
                                  }}
                                />
                                <Select
                                  onValueChange={(value) => {
                                    const newCharges = [...field.value];
                                    newCharges[chargeIndex].gst = value;
                                    field.onChange(newCharges);
                                    calculateTotalAmount(0);
                                  }}
                                  value={charge.gst}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select GST" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {[
                                      "NILL",
                                      "0",
                                      "3",
                                      "5",
                                      "12",
                                      "18",
                                      "28",
                                    ].map((gst) => (
                                      <SelectItem key={gst} value={gst}>
                                        {gst}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Input
                                  type="number"
                                  value={charge.unitPrice}
                                  onChange={(e) => {
                                    const newCharges = [...field.value];
                                    newCharges[chargeIndex].unitPrice =
                                      parseFloat(e.target.value);
                                    field.onChange(newCharges);
                                    calculateTotalAmount(0);
                                  }}
                                />
                              </div>
                            ))}
                            <Button
                              type="button"
                              onClick={() => {
                                field.onChange([
                                  ...field.value,
                                  { name: "", gst: "NILL", unitPrice: 0 },
                                ]);
                              }}
                            >
                              Add Other Charge
                            </Button>
                          </>
                        )}
                      />
                    </div>

                    {/* Total Amount */}
                    {/* <div>
                      <Label>Total Amount</Label>
                      <Input
                        value={fields[0].totalAmount.toFixed(2)}
                        readOnly
                      />
                    </div> */}

                    <div className="space-y-2">
                      <Label>Supporting Documents</Label>
                      {(["quotation", "bill", "productCatalog"] as const).map(
                        (docType) => (
                          <div key={docType}>
                            <Label
                              htmlFor={`quotations.0.supportingDocuments.${docType}`}
                            >
                              {docType.charAt(0).toUpperCase() +
                                docType.slice(1)}
                            </Label>
                            <Controller
                              name={`quotations.0.supportingDocuments.${docType}`}
                              control={control}
                              defaultValue={null}
                              render={({
                                field: { onChange, value, ...rest },
                              }) => (
                                <Input
                                  type="file"
                                  onChange={(
                                    e: ChangeEvent<HTMLInputElement>
                                  ) => onChange(e.target.files?.[0] || null)}
                                  {...rest}
                                />
                              )}
                            />
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Secondary Quotations */}
              <Accordion type="multiple" defaultValue={["quotation-1"]}>
                {fields.slice(1).map((field, index) => (
                  <AccordionItem key={index} value={`quotation-${index + 1}`}>
                    <AccordionTrigger>
                      <h3 className="text-lg font-semibold">
                        Secondary Quotation {index + 1}
                      </h3>
                    </AccordionTrigger>
                    <AccordionContent>
                      {/* ... (implement the same structure as the primary quotation for secondary quotations) */}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            <Button
              type="button"
              onClick={() =>
                append({
                  vendorId: "",
                  isPrimary: false,
                  products: rfpProducts.map((product) => ({
                    ...product,
                    unitPrice: 0,
                    gst: "NILL",
                    totalPriceWithoutGST: 0,
                    totalPriceWithGST: 0,
                  })),
                  otherCharges: [],
                  totalAmount: 0,
                  supportingDocuments: {
                    quotation: null,
                    bill: null,
                    productCatalog: null,
                  },
                })
              }
            >
              Add Secondary Quotation
            </Button>
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
    ),
    [
      handleSubmit,
      onSubmit,
      fields,
      approvedVendors,
      fetchedVendors,
      isLoading,
      error,
      success,
      calculateProductTotals,
      calculateTotalAmount,
      rfpProducts,
    ]
  );

  return renderForm;
}

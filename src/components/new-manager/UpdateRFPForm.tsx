import React, { ChangeEvent, useState, useEffect } from "react";
import { useForm, useFieldArray, Controller, Path } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Plus, X } from "lucide-react";

type Product = {
  quantity?: any;
  id: string;
  name: string;
  modelNo: string;
  amount: number;
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

interface RFPProduct {
  productId: string;
  name?: string;
  modelNo?: string;
  quantity: number;
}

type SupportingDocumentKeys = "quotation" | "bill" | "productCatalog";

type Quotation = {
  vendorId: string;
  isPrimary: boolean;
  products: Product[];
  totalAmount: number;
  supportingDocuments: {
    [K in SupportingDocumentKeys]: File | null;
  };
};

type FormData = {
  quotations: Quotation[];
  preferredVendorId: string;
};

export default function RFPUpdateForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [rfpId, setRfpId] = useState<string>("");
  const [rfpProducts, setRfpProducts] = useState<Product[]>([]);

  const [searchVendorTerm, setSearchVendorTerm] = useState("");
  const [fetchedVendors, setFetchedVendors] = useState<Vendor[]>([]);
  const [vendorSelected, setVendorSelected] = useState(false);
  const [approvedVendors, setApprovedVendors] = useState<Vendor[]>([]);



  //TODO hard coded VendorID for now
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      quotations: [
        {
          vendorId: "f0fcf4a2-af42-49d5-bbee-6e2b6e85bcbe",
          isPrimary: true,
          products: [],
          totalAmount: 0,
          supportingDocuments: {
            quotation: null,
            bill: null,
            productCatalog: null,
          },
        },
      ],
      preferredVendorId: "f0fcf4a2-af42-49d5-bbee-6e2b6e85bcbe",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "quotations",
  });

  const handleSearchChange = async (
    e: ChangeEvent<HTMLInputElement>,
    entity: string
  ) => {
    const value = e.target.value;
    if (entity === "vendors") {
      setSearchVendorTerm(value);
    }

    if (value) {
      try {
        const response = await fetch(`/api/ajax/${entity}?q=${value}`);
        const data = await response.json();

        if (entity === "vendors") {
          const formattedVendors = data.map((product: any) => ({
            ...product,
            productId: product.productId || product.id || String(product._id),
          }));
          setFetchedVendors(formattedVendors);
        }
      } catch (error) {
        console.error(`Error fetching ${entity}:`, error);
      }
    } else {
      setFetchedVendors([]);
      setVendorSelected(false);
    }
  };

  const handleVendorChange = (
    index: number,
    field: keyof Vendor,
    value: Vendor[keyof Vendor]
  ) => {
    const updatedVendors = [...approvedVendors];
    updatedVendors[index] = { ...updatedVendors[index], [field]: value };
    setApprovedVendors(updatedVendors);

    // setFormData((prevData) => ({
    //   ...prevData,
    //   rfpProducts: updatedProducts.map(({ productId, quantity }) => ({
    //     productId,
    //     quantity,
    //   })),
    // }));
  };

  const addProduct = (vendor: Vendor) => {
    if (!vendor.id) {
      console.error("Vendor ID is missing");
      return;
    }

    const vendorExists = approvedVendors.some((p) => p.id === vendor.id);

    if (!vendorExists) {
      const newProduct = { ...vendor, quantity: 1 };
      setApprovedVendors((prevProducts) => [...prevProducts, newProduct]);
      // setFormData((prevData) => ({
      //   ...prevData,
      //   rfpProducts: [
      //     ...prevData.rfpProducts,
      //     { productId: String(product.productId), quantity: 1 },
      //   ],
      // }));
      setSearchVendorTerm("");
      setFetchedVendors([]);
    } else {
      console.warn(`Vendor with ID ${vendor.id} already exists.`);
    }
  };
  const removeProduct = (index: number) => {
    setApprovedVendors((prevProducts) =>
      prevProducts.filter((_, i) => i !== index)
    );
    // setFormData((prevData) => ({
    //   ...prevData,
    //   rfpProducts: prevData.rfpProducts.filter((_, i) => i !== index),
    // }));
  };

  const fetchProductDetails = async (productId: string): Promise<Product> => {
    const response = await fetch(`/api/product?id=${productId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch product details for ID ${productId}`);
    }
    const productData = await response.json();

    return {
      id: productData[0].id,
      name: productData[0].name,
      modelNo: productData[0].modelNo,
      amount: 0,
    };
  };

  const fetchRFPProducts = async () => {
    if (rfpId) {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/rfpProduct?rfpId=${rfpId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch RFP products");
        }
        const rfpProductsData: RFPProduct[] = await response.json();
        const productsWithDetails = await Promise.all(
          rfpProductsData.map(async (rfpProduct) => {
            const productDetails = await fetchProductDetails(
              String(rfpProduct.productId)
            );
            return {
              ...productDetails,
              quantity: rfpProduct.quantity,
            };
          })
        );

        setRfpProducts(productsWithDetails);

        setValue(
          "quotations",
          fields.map((field, index) => ({
            ...field,
            isPrimary: index === 0,
            products: productsWithDetails.map((product) => ({
              ...product,
              amount: 0,
            })),
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
  };

  const handleRFPIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRfpId(e.target.value);
  };

  const calculateTotalAmount = (index: number) => {
    const quotation = fields[index];
    const total = quotation.products.reduce(
      (sum, product) => sum + product.amount,
      0
    );
    setValue(`quotations.${index}.totalAmount`, total);
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    //TODO hard coded totalAmount for now

    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        rfpStatus: "PENDING",
        quotations: data.quotations.map((q) => ({
          vendorId: q.vendorId,
          isPrimary: q.isPrimary,
          products: q.products,
          totalAmount: 7869,
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
      console.log(formData);
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
  };

  return (
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
          {fields.map((field, index) => (
            <div key={field.id} className="space-y-4 mb-6">
              <h3 className="text-lg font-semibold">
                {index === 0
                  ? "Primary Quotation"
                  : `Secondary Quotation ${index}`}
              </h3>
              <div className="grid  gap-4">
                <div>
                  <Label htmlFor={`quotations.${index}.vendorId`}>
                    Vendor Details
                  </Label>
                  {/* <Input
                    {...register(`quotations.${index}.vendorId` as const, {
                      required: "Vendor ID is required",
                    })}
                    id={`quotations.${index}.vendorId`}
                  /> */}
                  {errors.quotations?.[index]?.vendorId && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.quotations[index]?.vendorId?.message}
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
                        <Label
                          className={`mb-2 font-bold text-[16px] text-slate-700 ${
                            index === 1 ? "hidden" : "visible"
                          }`}
                        >
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
                        <Label
                          className={`mb-2 font-bold text-[16px] text-slate-700 ${
                            index === 1 ? "hidden" : "visible"
                          }`}
                        >
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
                        <Label
                          className={`mb-2 font-bold text-[16px] text-slate-700 ${
                            index === 1 ? "hidden" : "visible"
                          }`}
                        >
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
                        <Label
                          className={`mb-2 font-bold text-[16px] text-slate-700 ${
                            index === 1 ? "hidden" : "visible"
                          }`}
                        >
                          GSTIN
                        </Label>
                        <Input
                          disabled
                          value={vendor.gstin}
                          placeholder="GSTIN"
                          className="flex-1"
                        />
                        {/* <Input
                          type="number"
                          value={vendor.gstin}
                          placeholder="GSTIN"
                          className="flex-1"
                        /> */}
                      </div>
                      <div className="flex flex-col">
                        <Label
                          className={`mb-8 font-bold text-[16px] text-slate-700 ${
                            index === 1 ? "hidden" : "visible"
                          }`}
                        ></Label>
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
              </div>
              <div className="space-y-2">
                <Label>Products</Label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  <Label>Name</Label>
                  <Label>Model No.</Label>
                  <Label>Quantity</Label>
                  <Label>Amount</Label>
                </div>
                {field.products.map((product, productIndex) => (
                  <div key={product.id} className="grid grid-cols-4 gap-2">
                    <Input value={product.name} readOnly />
                    <Input value={product.modelNo} readOnly />
                    <Input value={product.quantity.toString()} readOnly />
                    <Controller
                      name={
                        `quotations.${index}.products.${productIndex}.amount` as Path<FormData>
                      }
                      control={control}
                      render={({ field }) => (
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => {
                            field.onChange(parseFloat(e.target.value));
                            calculateTotalAmount(index);
                          }}
                        />
                      )}
                    />
                  </div>
                ))}
              </div>

              <div>
                <Label>Total Amount</Label>
                <Input value={field.totalAmount.toString()} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Supporting Documents</Label>
                {(["quotation", "bill", "productCatalog"] as const).map(
                  (docType) => (
                    <div key={docType}>
                      <Label
                        htmlFor={`quotations.${index}.supportingDocuments.${docType}`}
                      >
                        {docType.charAt(0).toUpperCase() + docType.slice(1)}
                      </Label>
                      <Controller
                        name={
                          `quotations.${index}.supportingDocuments.${docType}` as Path<FormData>
                        }
                        control={control}
                        defaultValue={null}
                        render={({ field: { onChange, value, ...rest } }) => (
                          <Input
                            type="file"
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              onChange(e.target.files?.[0] || null)
                            }
                            {...rest}
                          />
                        )}
                      />
                    </div>
                  )
                )}
              </div>
              {index > 0 && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => remove(index)}
                >
                  Remove Quotation
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            onClick={() =>
              append({
                vendorId: "",
                isPrimary: false,
                products: rfpProducts.map((product) => ({
                  ...product,
                  amount: 0,
                })),
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

      <div>
        <Label htmlFor="preferredVendorId">Preferred Vendor ID</Label>
        <Input
          {...register("preferredVendorId", {
            required: "Preferred Vendor ID is required",
          })}
          id="preferredVendorId"
        />
        {errors.preferredVendorId && (
          <p className="text-red-500 text-sm mt-1">
            {errors.preferredVendorId.message}
          </p>
        )}
      </div>

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

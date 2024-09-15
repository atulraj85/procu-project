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
import Link from "next/link";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";

// Add quotation ref number (Quotation table)

type Product = {
  vendorPricing?: any;
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
  primaryName: string;
  companyName: string;
  contactDisplayName: string;
  email: string;
  mobile: string;
  gstin: string;
};

// const VendorSelector = ({
//   index,
//   setValue,
//   setShowCheckbox,
// }: {
//   index: number;
//   setValue: any;
//   setShowCheckbox: any;
// }) => {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [fetchedVendors, setFetchedVendors] = useState<Vendor[]>([]);
//   const [approvedVendors, setApprovedVendors] = useState<Vendor[]>([]);
//   const [disableVendorSearch, setDisableVendorSearch] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // const vendorId = useWatch({
//   //   control,
//   //   name: `quotations.${index}.vendorId`,
//   // });

//   // useEffect(() => {
//   //   const fetchVendorDetails = async () => {
//   //     if (vendorId) {
//   //       try {
//   //         const response = await fetch(`/api/vendor?id=${vendorId}`);
//   //         const vendorData = await response.json();
//   //         const formattedVendors = vendorData.map((vendor: any) => ({
//   //           ...vendor,
//   //           vendorId: vendor.productId || vendor.id || String(vendor._id),
//   //         }));
//   //         // console.log("formattedVendors", formattedVendors);
//   //         addVendor(formattedVendors[0]);
//   //         if (vendorData) {
//   //           setApprovedVendors([formattedVendors[0]]);
//   //           setDisableVendorSearch(true);
//   //         }
//   //       } catch (error) {
//   //         setError("Failed to fetch vendor details");
//   //       }
//   //     }
//   //   };

//   //   fetchVendorDetails();
//   // }, [vendorId]);

//   const handleSearchChange = useCallback(
//     async (e: ChangeEvent<HTMLInputElement>) => {
//       const value = e.target.value;
//       setSearchTerm(value);

//       if (value) {
//         try {
//           const response = await fetch(`/api/ajax/vendors?q=${value}`);
//           const responseData = await response.json();
//           console.log("responseData", responseData);
//           const formattedVendors = responseData.map((vendor: any) => ({
//             ...vendor,
//             vendorId: vendor.productId || vendor.id || String(vendor._id),
//           }));
//           setFetchedVendors(formattedVendors);
//         } catch (error) {
//           setError("Failed to fetch vendors");
//         }
//       } else {
//         setFetchedVendors([]);
//       }
//     },
//     []
//   );
//   const addVendor = useCallback(
//     (vendor: Vendor) => {
//       // console.log("approvedVendors", approvedVendors);
//       if (!vendor.id) {
//         setError("Vendor ID is missing");
//         return;
//       }

//       if (!approvedVendors.some((p) => p.id === vendor.id)) {
//         setApprovedVendors((prev) => [...prev, vendor]);
//         setDisableVendorSearch(true);
//         setSearchTerm("");
//         setFetchedVendors([]);

//         const vendorData = {
//           vendorId: vendor.id,
//         };

//         if (!globalFormData.has("quotations")) {
//           globalFormData.set("quotations", JSON.stringify([]));
//         }

//         const quotations = JSON.parse(
//           globalFormData.get("quotations") as string
//         );
//         quotations[index] = { ...quotations[index], ...vendorData };
//         globalFormData.set("quotations", JSON.stringify(quotations));
//       } else {
//         setError(`Vendor with ID ${vendor.id} already exists.`);
//       }
//     },
//     [approvedVendors, index]
//   );

//   const removeVendor = (vendorId: string) => {
//     setApprovedVendors((prev) => prev.filter((v) => v.id !== vendorId));
//     setValue(`quotations.${index}.vendorId`, "");
//     setDisableVendorSearch(false);

//     // Remove vendor data from global FormData
//     if (globalFormData.has("quotations")) {
//       const quotations = JSON.parse(globalFormData.get("quotations") as string);
//       if (quotations[index]) {
//         delete quotations[index].vendorId;
//       }
//       globalFormData.set("quotations", JSON.stringify(quotations));
//     }
//   };

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle className="text-lg">Vendor Details</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <Input
//           disabled={disableVendorSearch}
//           className="w-1/2"
//           type="text"
//           placeholder="Search Vendors..."
//           value={searchTerm}
//           onChange={handleSearchChange}
//         />
//         {error && <div className="text-red-500">{error}</div>}
//         {fetchedVendors.length > 0 && (
//           <div className="mt-2">
//             <h3 className="font-semibold">Fetched Vendors:</h3>
//             <ul>
//               {fetchedVendors.map((vendor) => (
//                 <li
//                   key={vendor.id}
//                   className="py-1 cursor-pointer hover:bg-gray-200"
//                   onClick={() => {
//                     addVendor(vendor);
//                     setValue(`quotations.${index}.vendorId`, vendor.id);
//                     setFetchedVendors([]);
//                     setError(null);
//                   }}
//                 >
//                   {vendor.primaryName} | {vendor.email}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}
//         {approvedVendors.map((vendor) => (
//           <div key={vendor.id} className="flex items-center space-x-2 mb-2">
//             <div className="flex flex-col">
//               <Label className="mb-2 font-bold text-[16px] text-slate-700">
//                 Vendor Name
//               </Label>
//               <Input
//                 disabled
//                 value={vendor.primaryName}
//                 placeholder="Name"
//                 className="flex-1"
//               />
//             </div>
//             <div className="flex flex-col">
//               <Label className="mb-2 font-bold text-[16px] text-slate-700">
//                 Email
//               </Label>
//               <Input
//                 disabled
//                 value={vendor.email}
//                 placeholder="Email"
//                 className="flex-1"
//               />
//             </div>
//             <div className="flex flex-col">
//               <Label className="mb-2 font-bold text-[16px] text-slate-700">
//                 Phone
//               </Label>
//               <Input
//                 disabled
//                 value={vendor.mobile}
//                 placeholder="Phone"
//                 className="flex-1"
//               />
//             </div>
//             <div className="flex flex-col">
//               <Label className="mb-2 font-bold text-[16px] text-slate-700">
//                 GSTIN
//               </Label>
//               <Input
//                 disabled
//                 value={vendor.gstin}
//                 placeholder="GSTIN"
//                 className="flex-1"
//               />
//             </div>
//             <div className="flex flex-col">
//               <Label className="mb-8 font-bold text-[16px] text-slate-700"></Label>
//               <Button
//                 type="button"
//                 onClick={() => removeVendor(vendor.id)}
//                 variant="outline"
//                 size="icon"
//                 className="text-red-500"
//               >
//                 <X className="h-4 w-4" />
//               </Button>
//             </div>
//           </div>
//         ))}
//       </CardContent>
//     </Card>
//   );
// };

const VendorSelector = ({
  index,
  setValue,
  setShowCheckbox,
}: {
  index: number;
  setValue: any;
  setShowCheckbox: any;
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [fetchedVendors, setFetchedVendors] = useState<Vendor[]>([]);
  const [approvedVendor, setApprovedVendor] = useState<Vendor | null>(null);
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
        {approvedVendor && (
          <div className="flex items-center space-x-2 mb-2">
            <div className="flex flex-col">
              <Label className="mb-2 font-bold text-[16px] text-slate-700">
                Vendor Name
              </Label>
              <Input
                disabled
                value={approvedVendor.primaryName}
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
  const { fields } = useFieldArray({
    control,
    name: `quotations.${index}.products`,
  });

  // const products = useWatch({
  //   control,
  //   name: `products`,
  // });

  // console.log(products);

  const [error, setError] = useState<string | null>(null);
  const [rfpProducts, setRfpProducts] = useState<Product[]>([]);
  const [loading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);

    let mappedProducts;

    if (Array.isArray(products) && products.length > 0) {
      console.log("products", products);

      mappedProducts = products.map((product: any) => ({
        id: product.id || null,
        name: product.name || null,
        modelNo: product.modelNo || null,
        quantity: product.quantity || 0,
        amount: 0,
        unitPrice: product.unitPrice || null,
        gst: product.gst || null,
        totalPriceWithoutGST: product.totalPriceWithoutGST || null,
        totalPriceWithGST: product.totalPriceWithGST || null,
      }));

      console.log("mappedProducts", mappedProducts);
    }
    try {
      const flattenedProductsWithDetails = mappedProducts!.flat();
      console.log("productsWithDetails", flattenedProductsWithDetails);
      setRfpProducts(flattenedProductsWithDetails);
      setValue(`quotations.${index}.products`, flattenedProductsWithDetails);
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
  }, [products]);

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
            type="button"
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

  // Use useWatch to get the current values of the quotation
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
      console.log("File", file);

      console.log(
        "FILENAME",
        getValue(`quotations.${index}.supportingDocuments.${docIndex}.name`)
      );

      const documentName = getValue(
        `quotations.${index}.supportingDocuments.${docIndex}.name`
      );
      console.log("documentName", documentName);
      console.log(getValue(`quotations.${index}.vendorId`));
      const fileKey = `${getValue(
        `quotations.${index}.vendorId`
      )}/${documentName}`;
      console.log("fileKey", fileKey);

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
          </div>
          {fields.map((field, docIndex) => (
            <div key={field.id} className="grid grid-cols-3 gap-2 m-2">
              <Input
                {...control.register(
                  `quotations.${index}.supportingDocuments.${docIndex}.name`
                )}
                placeholder="Enter document name"
              />
              <Input
                type="file"
                onChange={(e) => handleFileChange(e, docIndex)}
              />
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
          ))}
          <Button
            type="button"
            className="bg-primary mt-2"
            onClick={() => append({ name: "", fileName: "" })}
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
    <div className="grid grid-cols-2 gap-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label>Total Without GST</Label>
            {/* <Input
              value={quotation.total?.withoutGST?.toFixed(2) || "0.00"}
              readOnly
            />{" "} */}
            <Input value={quotation.total?.withoutGST || "0.00"} readOnly />
          </div>
          <div>
            <Label>Total With GST</Label>
            {/* <Input
              value={quotation.total?.withGST?.toFixed(2) || "0.00"}
              readOnly
            /> */}
            <Input value={quotation.total?.withGST || "0.00"} readOnly />
          </div>
        </CardContent>
      </Card>
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
  console.log("RFPUpdateForm - Received rfpId:", rfpId);
  console.log("RFPUpdateForm - Received initialData:", initialData);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [files, setFiles] = useState<{ [key: string]: File }>({});
  const { control, handleSubmit, setValue, getValues } = useForm<any>();
  const [preferredVendorIndex, setPreferredVendorIndex] = useState<
    number | null
  >(null);
  const [showReasonPrompt, setShowReasonPrompt] = useState(false);
  const [reason, setReason] = useState("");
  const quotationLimit = 3;
  const [quotes, setQuotes] = useState(0);
  const [preferredVendorId, setPreferredVendorId] = useState("");
  const [showCheckbox, setShowCheckbox] = useState(true);
  const products = initialData.products;

  // {
  // defaultValues: {
  //   rfpId: initialData.rfpId,
  //   // requirementType: initialData.requirementType,
  //   // dateOfOrdering: initialData.dateOfOrdering,
  //   // deliveryLocation: initialData.deliveryLocation,
  //   // deliveryByDate: initialData.deliveryByDate,
  //   rfpStatus: initialData.rfpStatus,
  //   preferredQuotationId: initialData.preferredQuotationId,
  //   // created_at: initialData.created_at,
  //   // updated_at: initialData.updated_at,
  //   // approvers: initialData.approvers,
  //   // products: initialData.products,

  //   quotations: initialData.quotations.map((quotation: any) => ({
  //     totalAmount: quotation.totalAmount,
  //     totalAmountWithoutGST: quotation.totalAmountWithoutGST,
  //     vendor: quotation.vendor,
  //     products: quotation.products.map((product: any) => ({
  //       id: product.id,
  //       rfpProductId: product.id,
  //       price: product.vendorPricing?.price || 0,
  //     })),
  //     otherCharges: quotation.otherCharges.map((charge: any) => ({
  //       id: charge.id,
  //       name: charge.name,
  //       price: charge.price,
  //       gst: charge.gst,
  //     })),
  //     total: {
  //       withGST: quotation.totalAmount,
  //       withoutGST: quotation.totalAmountWithoutGST,
  //     },
  //     supportingDocuments: quotation.supportingDocuments.map((doc: any) => ({
  //       id: doc.id,
  //       documentType: doc.documentType,
  //       documentName: doc.documentName,
  //       location: doc.location,
  //     })),
  //   })),
  //   // createdBy: initialData.createdBy,
  // },
  // }

  const { fields, append, remove } = useFieldArray({
    control,
    name: "quotations",
  });

  // Be aware of this
  // useEffect(() => {
  //   globalFormData.set("quotations", JSON.stringify(getValues().quotations));
  // }, [getValues().quotations]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    console.log("Text data to be sent:", data);

    try {
      const formData = new FormData();

      // Add rfpId to formData
      formData.append("rfpId", rfpId);

      if (quotes < 3) {
        formData.append("rfpStatus", "DRAFT");
      } else {
        formData.append("rfpStatus", "SUBMITTED");
      }

      // Serialize the form data (excluding files) to JSON
      const serializedData = JSON.stringify(data);
      formData.append("data", serializedData);

      console.log(files);

      // Append files to formData
      Object.entries(files).forEach(([key, file]) => {
        formData.append(key, file);
      });

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
            </Button>{" "}
          </Link>
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
                <AccordionTrigger>Quotation {index + 1}</AccordionTrigger>

                <AccordionContent>
                  <div className="m-2">
                    <Card className="w-1/2">
                      <CardHeader>
                        <CardTitle className="text-lg">
                          <div className="ml-2 mb-2 flex flex-row gap-1 items-center">
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
                                    getValues(`quotations.${index}.vendorId`)
                                  );
                                  setPreferredVendorId(
                                    getValues(`quotations.${index}.vendorId`)
                                  );
                                  setPreferredVendorIndex(index); // Set the current index as preferred
                                } else {
                                  setPreferredVendorId("");
                                  setPreferredVendorIndex(null); // Reset preferred vendor index
                                }
                              }}
                            />
                            <Label className="font-bold text-[16px] text-slate-700">
                              Preferred Quote
                            </Label>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {preferredVendorIndex === index ? (
                          <div>
                            <Textarea
                              className=" mb-2"
                              placeholder="Reason for preferring this vendor"
                              value={reason}
                              onChange={(e) => setReason(e.target.value)}
                            />
                          </div>
                        ) : (
                          <></>
                        )}

                        <div className="w-1/2">
                          <Label>Ref No.</Label>
                          <Input
                            {...control.register(`quotations.${index}.refNo`)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="m-2">
                    <VendorSelector
                      setValue={setValue}
                      index={index}
                      setShowCheckbox={setShowCheckbox}
                    />
                  </div>

                  <div className="m-2">
                    <ProductList
                      products={products}
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

                  <div className="m-2">
                    <TotalComponent
                      setValue={setValue}
                      control={control}
                      index={index}
                    />
                  </div>
                  <div className="m-2">
                    <SupportingDocumentsList
                      control={control}
                      index={index}
                      setValue={setValue}
                      files={files}
                      setFiles={setFiles}
                      getValue={getValues}
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={() => {
                      console.log("Removing index:", index);
                      remove(index);
                      setQuotes(quotes - 1);
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

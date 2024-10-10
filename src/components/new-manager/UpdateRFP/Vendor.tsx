import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { X } from "lucide-react";
import { ChangeEvent, useCallback, useEffect, useState } from "react";

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
  globalFormData,
  errors,
}: {
  index: number;
  setValue: any;
  setShowCheckbox: any;
  vendor: any;
  globalFormData: any;
  errors: any;
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
          // console.log("responseData", responseData);
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
    <div>
      <div className="flex items-center w-full">
        <div className="font-bold">Vendor Details:</div>
        {error && <div className="text-red-500 ml-2">{error}</div>}
        {approvedVendor && (
          <div className="flex items-center text-sm ml-2">
            <div className="text-slate-700">
              {`${approvedVendor.companyName} | Email: ${approvedVendor.email} | Phone: ${approvedVendor.mobile}`}
            </div>
            <Button
              type="button"
              onClick={removeVendor}
              variant="outline"
              size="icon"
              className="text-red-500 ml-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        {errors?.quotations?.[index]?.vendorId && (
          <p className="text-red-500 text-sm mt-1">
            {errors.quotations[index].vendorId.message}
          </p>
        )}

        {!disableVendorSearch && (
          <Input
            disabled={disableVendorSearch}
            type="text"
            placeholder="Search Vendors..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        )}
      </div>

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
        {disableVendorSearch && (
          <div className=" border-orange-500 text-orange-500">
            <div className="text-sm">
              You need to remove the current vendor first to modify existing
              vendor details.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorSelector;

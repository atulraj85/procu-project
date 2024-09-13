"use client";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Loader from "@/components/shared/Loader";

interface VendorData {
  id: string;
  customerCode: string;
  primaryName: string;
  companyName: string;
  contactDisplayName: string;
  email: string;
  workPhone: string;
  mobile: string;
  website: string;
  gstin: string;
  msmeNo: string;
  address: string;
  customerState: string;
  customerCity: string;
  country: string;
  zip: string;
  remarks: string;
  pan: string;
  verifiedById: string;
  created_at: string;
  updated_at: string;
  productCategoryId: string | null;
}

interface VendorDetailsProps {
  gstin1: string | null;
}

const VendorDetails: React.FC<VendorDetailsProps> = () => {
  const [vendorData, setVendorData] = useState<VendorData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const gstin1 = searchParams.get("gstin");
  useEffect(() => {
    const fetchVendorDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/vendor?gstin=${encodeURIComponent(gstin1)}`
        );
        const data = await response.json();
        console.log("data", data);

        if (Array.isArray(data) && data.length > 0) {
          setVendorData(data[0]);
        } else {
          setError("No vendor data found");
        }
      } catch (err) {
        setError("An error occurred while fetching vendor data");
        toast.error("Failed to fetch vendor details");
      } finally {
        setLoading(false);
      }
    };

    fetchVendorDetails();
  }, [gstin1]);

  if (loading) {
    return <Loader/>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!vendorData) {
    return <div>No vendor data available</div>;
  }

  return (
    <>
      <div className="flex justify-end mt-6 mr-20">
        <Link href="/dashboard">
          <Button>Cancel</Button>
        </Link>
      </div>
      <div className="p-5">
        <form className="flex flex-wrap w-full gap-7">
          <div className="flex flex-col gap-3 w-60 text-base">
            <label className="font-bold">GSTIN</label>
            <h1 className="text-[15px]">{vendorData.gstin}</h1>
          </div>

          <div className="flex flex-col gap-3 w-60 text-base">
            <label className="font-bold">Company Name</label>
            <h1 className="text-[15px]">{vendorData.companyName}</h1>
          </div>

          <div className="flex flex-col gap-3 w-60 text-base">
            <label className="font-bold">PAN Card</label>
            <h1 className="text-[15px]">{vendorData.pan}</h1>
          </div>

          <div className="flex flex-col gap-3 w-60 text-base">
            <label className="font-bold">Address</label>
            <h1 className="text-[15px]">{vendorData.address}</h1>
          </div>

          <div className="flex flex-col gap-3 w-60 text-base">
            <label className="font-bold">Pin Code</label>
            <h1 className="text-[15px]">{vendorData.zip}</h1>
          </div>

          <div className="flex flex-col gap-3 w-60 text-base">
            <label className="font-bold">Person Name</label>
            <h1 className="text-[15px]">{vendorData.primaryName}</h1>
          </div>

          <div className="flex flex-col gap-3 w-60 text-base">
            <label className="font-bold">Contact No</label>
            <h1 className="text-[15px]">{vendorData.mobile}</h1>
          </div>

          <div className="flex flex-col gap-3 w-60 text-base">
            <label className="font-bold">Email</label>
            <h1 className="text-[15px]">{vendorData.email}</h1>
          </div>

          <div className="flex flex-col gap-3 w-60 text-base">
            <label className="font-bold">Website</label>
            <h1 className="text-[15px]">{vendorData.website}</h1>
          </div>

          <div className="flex flex-col gap-3 w-60 text-base">
            <label className="font-bold">State</label>
            <h1 className="text-[15px]">{vendorData.customerState}</h1>
          </div>

          <div className="flex flex-col gap-3 w-60 text-base">
            <label className="font-bold">City</label>
            <h1 className="text-[15px]">{vendorData.customerCity}</h1>
          </div>
        </form>
      </div>
    </>
  );
};

export default VendorDetails;

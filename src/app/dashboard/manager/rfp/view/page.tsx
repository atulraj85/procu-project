"use client"
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { X } from "lucide-react";
import Loader from "@/components/shared/Loader";

interface RfpData {
  id: string;
  rfpId: string;
  requirementType: string;
  dateOfOrdering: string;
  deliveryLocation: string;
  deliveryByDate: string;
  userId: string;
  rfpStatus: string;
  preferredQuotationId: string | null;
  created_at: string;
  updated_at: string;
}

const RfpDetails: React.FC = () => {
  const [rfpData, setRfpData] = useState<RfpData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const rfpId = searchParams.get('rfp');

  useEffect(() => {
    const fetchRfpDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/rfp?rfpId=${encodeURIComponent(rfpId)}`);
        const data = await response.json();
        console.log("data", data);
        
        if (Array.isArray(data) && data.length > 0) {
          setRfpData(data[0]);
        
          
        } else {
          setError("No RFP data found");
        }
      } catch (err) {
        setError("An error occurred while fetching RFP data");
        toast.error("Failed to fetch RFP details");
      } finally {
        setLoading(false);
      }
    };

    fetchRfpDetails();
  }, [rfpId]);

  if (loading) {
    return <Loader/>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!rfpData) {
    return <div>No RFP data available</div>;
  }

  return (
    <>
      <div className="text-lg font-bold">View RFP</div>

      <div className="flex justify-end mt-6 mr-20">
        <Link href="/dashboard/manager">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="text-black-500 bg-red-400"
          >
            <X className="h-4 w-4" />
          </Button>{" "}
        </Link>{" "}
      </div>
      <div className="p-5">
        <form className="flex flex-wrap w-full gap-7">
          <div className="flex flex-col gap-3 w-60 text-base">
            <label className="font-bold">RFP ID</label>
            <h1 className="text-[15px]">{rfpData.rfpId}</h1>
          </div>

          <div className="flex flex-col gap-3 w-60 text-base">
            <label className="font-bold">Requirement Type</label>
            <h1 className="text-[15px]">{rfpData.requirementType}</h1>
          </div>

          <div className="flex flex-col gap-3 w-60 text-base">
            <label className="font-bold">Date of Ordering</label>
            <h1 className="text-[15px]">
              {new Date(rfpData.dateOfOrdering).toLocaleDateString()}
            </h1>
          </div>

          <div className="flex flex-col gap-3 w-60 text-base">
            <label className="font-bold">Delivery Location</label>
            <h1 className="text-[15px]">{rfpData.deliveryLocation}</h1>
          </div>

          <div className="flex flex-col gap-3 w-60 text-base">
            <label className="font-bold">Delivery By Date</label>
            <h1 className="text-[15px]">
              {new Date(rfpData.deliveryByDate).toLocaleDateString()}
            </h1>
          </div>

          <div className="flex flex-col gap-3 w-60 text-base">
            <label className="font-bold">RFP Status</label>
            <h1 className="text-[15px]">{rfpData.rfpStatus}</h1>
          </div>

          <div className="flex flex-col gap-3 w-60 text-base">
            <label className="font-bold">Created At</label>
            <h1 className="text-[15px]">
              {new Date(rfpData.created_at).toLocaleString()}
            </h1>
          </div>

          <div className="flex flex-col gap-3 w-60 text-base">
            <label className="font-bold">Updated At</label>
            <h1 className="text-[15px]">
              {new Date(rfpData.updated_at).toLocaleString()}
            </h1>
          </div>
        </form>
      </div>
    </>
  );
};

export default RfpDetails;

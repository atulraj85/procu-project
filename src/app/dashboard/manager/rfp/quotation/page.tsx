"use client";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import RFPUpdateForm from "@/components/new-manager/UpdateRFP2";
import Loader from "@/components/shared/Loader";

const Page = () => {
  const searchParams = useSearchParams();
  const [rfpId, setRfpId] = useState<string | null>(null);
  const [rfpData, setRfpData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get("rfp");
    if (id) {
      const fetchData = async () => {
        try {
          // Fetch RFP details
          const rfpResponse = await fetch(`/api/rfp?rfpId=${id}`);
          if (!rfpResponse.ok) {
            throw new Error(`HTTP error! status: ${rfpResponse.status}`);
          }
          const rfpResult = await rfpResponse.json();
          setRfpId(rfpResult[0].id);

          const quotationsResult = rfpResult[0].quotations;

          console.log("quotationsResult", quotationsResult);

          // Check if quotations array is not empty
          if (quotationsResult && quotationsResult.length > 0) {
            console.log("here");
            setRfpData({
              ...rfpResult[0],
              quotations: quotationsResult,
            });
          } else {
            // If quotations array is empty, set rfpData to null
            setRfpData(null);
          }
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [searchParams]);

  if (loading) return <Loader />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>{rfpId && <RFPUpdateForm rfpId={rfpId} initialData={rfpData} />}</div>
  );
};

export default Page;

"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Loader from "@/components/shared/Loader";
import RFPUpdateForm from "@/components/new-manager/UpdateRFP/UpdateRFP";

const Page = () => {
  const searchParams = useSearchParams();
  const [rfpId, setRfpId] = useState<string | null>(null);
  const [rfpData, setRfpData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get("rfp");
    console.log("RFP ID from searchParams:", id);
    setRfpId(id);
    if (id) {
      const fetchData = async () => {
        try {
          console.log("Fetching RFP data for ID:", id);
          const rfpResponse = await fetch(`/api/rfp?rfpId=${id}`);
          if (!rfpResponse.ok) {
            throw new Error(`HTTP error! status: ${rfpResponse.status}`);
          }
          const rfpResult = await rfpResponse.json();
          console.log("Raw RFP Result:", rfpResult);

          if (rfpResult[0]) {
            console.log("Setting RFP ID:", rfpResult[0].id);
            setRfpData(rfpResult[0]);
            console.log("Setting RFP Data:", rfpResult[0]);
          } else {
            console.log("No RFP data found");
            setRfpData(null);
          }
        } catch (err: any) {
          console.error("Error fetching RFP data:", err);
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
    <div>
      {rfpId && rfpData ? (
        <RFPUpdateForm rfpId={rfpId} initialData={rfpData} />
      ) : (
        <div>No RFP data available</div>
      )}
    </div>
  );
};

export default Page;

"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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

          console.log("rfpResult from fetch: ", rfpResult);

          if (rfpResult[0]) {
            setRfpData(rfpResult[0]);
          } else {
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
    <div>
      {rfpId && rfpData && (
        <RFPUpdateForm rfpId={rfpId} initialData={rfpData} />
      )}
    </div>
  );
};

export default Page;

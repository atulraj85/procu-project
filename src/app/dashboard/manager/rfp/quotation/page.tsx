"use client";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import RFPUpdateFormOLD from "@/components/new-manager/UpdateRFPFormOLD";
import RFPUpdateForm from "@/components/new-manager/UpdateRFP2";
import Loader from "@/components/shared/Loader";

const Page = () => {
  const searchParams = useSearchParams();
  const [rfpId, setRfpId] = useState<string | null>(null); // State variable to hold the RFP ID
  const [loading, setLoading] = useState(true); // State variable for loading state
  const [error, setError] = useState(null); // State variable for error handling

  useEffect(() => {
    const id = searchParams.get("rfp"); // Get the id from search params
    if (id) {
      const fetchData = async () => {
        try {
          const response = await fetch(`/api/rfp?rfpId=${id}`);
          const data = await response.json();
          console.log(data[0].id);
          setRfpId(data[0].id);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const result = await response.json();
          // setData(result); // Save the fetched data to state
        } catch (err: any) {
          setError(err.message); // Set error message if fetch fails
        } finally {
          setLoading(false); // Set loading to false after fetch completes
        }
      };

      fetchData();
    }
  }, [searchParams]);

  return (
    <div>
     
      <div>
        {loading && <Loader/>}
        {rfpId && <RFPUpdateForm rfpId={rfpId} />}{" "}
        {/* {rfpId && <RFPUpdateFormOLD />}{" "} */}
      </div>
    </div>
  );
};

export default Page;

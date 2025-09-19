"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Loader from "@/components/shared/Loader";
import VendorQuotationForm from "@/components/vendor/VendorQuotationForm"; // New component
import { useCurrentUser } from "@/hooks/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const VendorQuotationPage = () => {
  const searchParams = useSearchParams();
  const currentUser = useCurrentUser();
  const [rfpId, setRfpId] = useState<string | null>(null);
  const [rfpData, setRfpData] = useState<any>(null);
  const [existingQuotation, setExistingQuotation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is vendor
  if (currentUser && currentUser.role !== "VENDOR") {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Access denied. Only vendors can submit quotations.</p>
      </div>
    );
  }

  useEffect(() => {
    const id = searchParams.get("rfp");
    console.log("RFP ID from searchParams:", id);
    setRfpId(id);
    
    if (id && currentUser?.id) {
      const fetchData = async () => {
        try {
          console.log("Fetching RFP data for ID:", id);
          
          // Fetch RFP data
          const rfpResponse = await fetch(`/api/rfp?rfpId=${id}`);
          if (!rfpResponse.ok) {
            throw new Error(`HTTP error! status: ${rfpResponse.status}`);
          }
          const rfpResult = await rfpResponse.json();
          console.log("Raw RFP Result:", rfpResult);

          if (rfpResult[0]) {
            console.log("Setting RFP Data:", rfpResult[0]);
            setRfpData(rfpResult[0]);

            // Check if RFP is in SUBMITTED status (vendors can only quote on submitted RFPs)
            if (rfpResult[0].rfpStatus !== "SUBMITTED") {
              setError("This RFP is not available for quotations");
              setLoading(false);
              return;
            }

            // Check if vendor already has a quotation for this RFP
            const quotationResponse = await fetch(`/api/quotations?rfpId=${id}&vendorId=${currentUser.id}`);
            if (quotationResponse.ok) {
              const quotationResult = await quotationResponse.json();
              if (quotationResult && quotationResult.length > 0) {
                console.log("Existing quotation found:", quotationResult[0]);
                setExistingQuotation(quotationResult[0]);
              }
            }
          } else {
            console.log("No RFP data found");
            setRfpData(null);
            setError("RFP not found");
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
  }, [searchParams, currentUser]);

  if (loading) return <Loader />;
  if (error) return (
    <div className="flex items-center justify-center h-64">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            <h2 className="text-lg font-semibold mb-2">Error</h2>
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      {rfpId && rfpData ? (
        <>
          {/* RFP Information Header */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Submit Quotation - {rfpData.rfpId}</span>
                {existingQuotation && (
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Quotation Already Submitted
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-semibold">Requirement Type:</span> {rfpData.requirementType}
                </div>
                <div>
                  <span className="font-semibold">Delivery Date:</span> {new Date(rfpData.deliveryByDate).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-semibold">Delivery Location:</span> {rfpData.deliveryLocation}
                </div>
              </div>
              
              {/* Products List */}
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Required Products/Services:</h3>
                <div className="space-y-2">
                  {rfpData.products?.map((product: any, index: number) => (
                    <div key={index} className="bg-gray-50 p-3 rounded border">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{product.description}</span>
                        <span className="text-gray-600">Qty: {product.quantity}</span>
                      </div>
                      {product.businessJustification && (
                        <div className="text-sm text-gray-600 mt-1">
                          <strong>Justification:</strong> {product.businessJustification}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quotation Form */}
          <VendorQuotationForm 
            rfpId={rfpId} 
            rfpData={rfpData} 
            existingQuotation={existingQuotation}
            onQuotationSaved={() => {
              // Refresh the page or show success message
              window.location.reload();
            }}
          />
        </>
      ) : (
        <div className="flex items-center justify-center h-64">
          <p>No RFP data available</p>
        </div>
      )}
    </div>
  );
};

export default VendorQuotationPage;

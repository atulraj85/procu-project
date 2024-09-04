"use client";

import React, { useState, useEffect } from "react";
import ProductDetails from "./ProductDetails";
import DeliveryDetails from "./DeliveryDetails";
import ApproveDetails from "./ApproverDetails";

const RequestForProduct: React.FC = () => {
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
  const [rfpId, setRfpId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [approverData, setApproverData] = useState<ApproverData[]>([]);
  const [productData, setProductData] = useState<Product[]>([]);
  const [deliveryData, setDeliveryData] = useState<Delivery>({
    address: "",
    city: "",
    country: "",
    preferredDeliveryDate: "",
    state: "",
    zipCode: ""
  });

  useEffect(() => {
    const fetchRfpId = async () => {
      try {
        const response = await fetch("/api/rfp/rfpid");
        if (!response.ok) {
          throw new Error("Failed to fetch RFP ID");
        }
        const data = await response.json();
        setRfpId(data);
      } catch (err) {
        setError("Error fetching RFP ID. Please try again later.");
        console.error("Error fetching RFP ID:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRfpId();
  }, []);

  const toggleAccordion = (accordionName: string) => {
    setActiveAccordion(
      activeAccordion === accordionName ? null : accordionName
    );
  };

  const handleApproverDataChange = (data: ApproverData[]) => {
    setApproverData(data);
  };

  const handleProductDataChange = (data: Product[]) => {
    setProductData(data);
  };

  const handleDeliveryDataChange = (data: Delivery) => {
    setDeliveryData(data);
  };

  const handleSubmit = async () => {
    // Construct the payload based on the current state
    // const payload = {
    //   requirementType: "Office Supplies",
    //   dateOfOrdering: new Date().toISOString(), // Replace with actual value if needed
    //   deliveryLocation: `${deliveryData.address}, ${deliveryData.city}, ${deliveryData.state}, ${deliveryData.country}, ${deliveryData.zipCode}`,
    //   deliveryByDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(), // Example: 3 months from now
    //   lastDateToRespond: new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString(), // Example: 2 months from now
    //   userId: "ded94860-af4c-4b45-a151-3d0d9babd7e0", // Replace with actual user ID
    //   rfpStatus: "DRAFT",
    //   rfpProducts: productData.map((product) => ({
    //     productId: product.id,
    //     quantity: 1, // Assuming a default quantity if not specified
    //     additionalField: product.additionalField // Include additional fields if needed
    //   })),
    //   approvers: approverData.map((approver) => ({
    //     approverId: approver.approver_email // Adjust according to your API requirements
    //   })),
    // };
    const payload={ 
      "requirementType": "Office Supplies", 
      "dateOfOrdering": "2023-10-01T10:00:00Z", 
      "deliveryLocation": "123 Main St, City, Country", 
      "deliveryByDate": "2023-12-31T10:00:00Z", 
      "lastDateToRespond": "2023-11-30T10:00:00Z", 
      "userId": "ded94860-af4c-4b45-a151-3d0d9babd7e0", 
      "rfpStatus": "DRAFT", // Use one of the RFPStatus enum values 
      "rfpProducts": [ 
        { 
          "productId": "1", // Replace with an actual product ID 
          "quantity": 20 
        } 
      ], 
      "approvers": [ 
        { 
          "approverId": "ded94860-af4c-4b45-a151-3d0d9babd7e0" // Replace with an actual approver ID 
        } 
      ]
     }

    try {
      const response = await fetch("/api/rfp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to submit RFP");
      }

      const result = await response.json();
      console.log("RFP submitted successfully:", result);
      // Handle success (e.g., show a success message or redirect)
    } catch (err) {
      setError("Error submitting RFP. Please try again later.");
      console.error("Error submitting RFP:", err);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-gray-800 text-2xl mb-4">Request of Product/Services</h1>
      {rfpId && <p className="text-gray-600 mb-4">RFP ID: {rfpId}</p>}

      <hr className="my-4" />

      <div>
        <button
          onClick={() => toggleAccordion("approver")}
          className="w-full text-left py-2 px-4 bg-gray-200 hover:bg-gray-300 focus:outline-none transition duration-200"
        >
          <h2 className="text-lg text-gray-800">Approver Details</h2>
        </button>
       
          <div className="p-4 bg-gray-100 border border-gray-300">
            <ApproveDetails onApproverDataChange={handleApproverDataChange} />
          </div>
      
      </div>

      <hr className="my-4" />

      <div>
        <button
          onClick={() => toggleAccordion("product")}
          className="w-full text-left py-2 px-4 bg-gray-200 hover:bg-gray-300 focus:outline-none transition duration-200"
        >
          <h2 className="text-lg text-gray-800">Product Details</h2>
        </button>
        
          <div className="p-4 bg-gray-100 border border-gray-300">
            <ProductDetails onProductDataChange={handleProductDataChange} />
          </div>
       
      </div>

      <hr className="my-4" />

      <div>
        <button
          onClick={() => toggleAccordion("delivery")}
          className="w-full text-left py-2 px-4 bg-gray-200 hover:bg-gray-300 focus:outline-none transition duration-200"
        >
          <h2 className="text-lg text-gray-800">Delivery Details</h2>
        </button>
        
          <div className="p-4 bg-gray-100 border border-gray-300">
            <DeliveryDetails deliveryData={deliveryData} onDeliveryDataChange={handleDeliveryDataChange} />
          </div>
        
      </div>

      <hr className="my-4" />

      <button
        onClick={handleSubmit}
        className="w-full py-2 px-4 bg-blue-500 text-white hover:bg-blue-600 transition duration-200"
      >
        Submit RFP
      </button>
    </div>
  );
};

export default RequestForProduct;

"use client";

import React, { useState, useEffect } from "react";
import ProductDetails from "./ProductDetails";
import DeliveryDetails from "./DeliveryDetails";
import ApproveDetails from "./ApproverDetails";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface ApproverData {
  approverId: string;
}

interface Product {
  id: string;
  additionalField: number; // Changed to number
}

interface Delivery {
  address: string;
  city: string;
  country: string;
  preferredDeliveryDate: string;
  state: string;
  zipCode: string;
}

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
    zipCode: "",
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
    const payload = {
      requirementType: "Office Supplies",
      dateOfOrdering: new Date().toISOString(),
      deliveryLocation: `${deliveryData.address}, ${deliveryData.city}, ${deliveryData.state}, ${deliveryData.country}, ${deliveryData.zipCode}`,
      deliveryByDate: new Date(
        new Date().setMonth(new Date().getMonth() + 3)
      ).toISOString(),
      lastDateToRespond: new Date(
        new Date().setMonth(new Date().getMonth() + 2)
      ).toISOString(),
      userId: "ded94860-af4c-4b45-a151-3d0d9babd7e0",
      rfpStatus: "DRAFT",
      rfpProducts: productData.map((product) => ({
        productId: product.id,
        quantity: product.additionalField,
      })),
      approvers: approverData.map((approver) => ({
        approverId: approver.approverId, // Use the actual approverId from the data
      })),
    };

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
      toast.success("RFP submitted successfully!");
    } catch (err) {
      setError("Error submitting RFP. Please try again later.");
      toast.error("Error submitting RFP. Please try again later.");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>; // Consider adding a spinner or skeleton loader
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-gray-800 text-2xl mb-4">
        Request of Product/Services
      </h1>
      {rfpId && <p className="text-gray-600 mb-4">RFP ID: {rfpId}</p>}

      <hr className="my-4" />

      <div>
        <button
          onClick={() => toggleAccordion("approver")}
          className="w-full text-left py-2 px-4 bg-gray-200 hover:bg-gray-300 focus:outline-none transition duration-200"
        >
          <h2 className="text-lg text-gray-800">Approver Details</h2>
        </button>
        {/* {activeAccordion === "approver" && ( */}
          <div className="p-4 border border-gray-300">
            <ApproveDetails onApproverDataChange={handleApproverDataChange} />
          </div>
        {/* // )} */}
      </div>

      <hr className="my-4" />

      <div>
        <button
          onClick={() => toggleAccordion("product")}
          className="w-full text-left py-2 px-4 bg-gray-200 hover:bg-gray-300 focus:outline-none transition duration-200"
        >
          <h2 className="text-lg text-gray-800">Product Details</h2>
        </button>
        {/* {activeAccordion === "product" && ( // Conditional rendering based on activeAccordion */}
          <div className="p-4 border border-gray-300">
            <ProductDetails onProductDataChange={handleProductDataChange} />
          </div>
        {/* )} */}
      </div>

      <hr className="my-4" />

      <div>
        <button
          onClick={() => toggleAccordion("delivery")}
          className="w-full text-left py-2 px-4 bg-gray-200 hover:bg-gray-300 focus:outline-none transition duration-200"
        >
          <h2 className="text-lg text-gray-800">Delivery Details</h2>
        </button>
        {/* {activeAccordion === "delivery" && ( // Conditional rendering based on activeAccordion */}
          <div className="p-4 border border-gray-300">
            <DeliveryDetails
              deliveryData={deliveryData}
              onDeliveryDataChange={handleDeliveryDataChange}
            />
          </div>
        {/* )} */}
      </div>

      <hr className="my-4" />

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          className="py-2 px-4 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition duration-200"
        >
          Submit RFP
        </button>
      </div>
      {/* ToastContainer to display toast notifications */}
      <ToastContainer />
    </div>
  );
};

export default RequestForProduct;

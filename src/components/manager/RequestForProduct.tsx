"use client";
import React, { useState } from "react";
import VendorDetails from "./VendorDetails";
import ProductDetails from "./ProductDetails";
import ApproverDetails from "./ApproverDetails";

const RequestForProduct: React.FC = () => {
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

  const toggleAccordion = (accordionName: string) => {
    setActiveAccordion(
      activeAccordion === accordionName ? null : accordionName
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-gray-800 text-2xl mb-4">
        Request of Product/Services
      </h1>
      <div>
        <button
          onClick={() => toggleAccordion("approver")}
          className="w-full text-left py-2 px-4 bg-gray-200 hover:bg-gray-300 focus:outline-none transition duration-200"
        >
          <h2 className="text-lg text-gray-800">Approver Details</h2>
        </button>
        {activeAccordion === "approver" && (
          <div className="p-4 bg-gray-100 border border-gray-300">
            <ApproverDetails />
          </div>
        )}
      </div>
      <hr className="my-4" />
      <div>
        <button
          onClick={() => toggleAccordion("vendor")}
          className="w-full text-left py-2 px-4 bg-gray-200 hover:bg-gray-300 focus:outline-none transition duration-200"
        >
          <h2 className="text-lg text-gray-800">Vendor Details</h2>
        </button>
        {activeAccordion === "vendor" && (
          <div className="p-4 bg-gray-100 border border-gray-300">
            <VendorDetails />
          </div>
        )}
      </div>
      <hr className="my-4" />

      <div>
        <button
          onClick={() => toggleAccordion("product")}
          className="w-full text-left py-2 px-4 bg-gray-200 hover:bg-gray-300 focus:outline-none transition duration-200"
        >
          <h2 className="text-lg text-gray-800">Product Details</h2>
        </button>
        {activeAccordion === "product" && (
          <div className="p-4 bg-gray-100 border border-gray-300">
            <ProductDetails />
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestForProduct;

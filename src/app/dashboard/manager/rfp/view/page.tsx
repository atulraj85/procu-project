"use client";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { X } from "lucide-react";
import Loader from "@/components/shared/Loader";

interface Approver {
  id: string;
  userId: string;
  approved: boolean;
  approvedAt: string | null;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

interface RfpProduct {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    modelNo: string;
    specification: string;
  };
}

interface Quotation {
  id: string;
  rfpId: string;
  vendorId: string;
  isPrimary: boolean;
  totalAmount: string;
  totalAmountWithoutGST: string;
  created_at: string;
  updated_at: string;
  supportingDocuments: Array<{
    id: string;
    quotationId: string;
    documentType: string;
    documentName: string;
    location: string;
    created_at: string;
    updated_at: string;
  }>;
  vendorPricings: Array<{
    id: string;
    quotationId: string;
    rfpProductId: string;
    price: string;
    GST: number;
    created_at: string;
    updated_at: string;
  }>;
  otherCharges: Array<{
    id: string;
    quotationId: string;
    name: string;
    price: string;
    gst: string;
    created_at: string;
    updated_at: string;
  }>;
}

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
  approversList: Approver[];
  rfpProducts: RfpProduct[];
  quotations: Quotation[]; // Add quotations field
  user: {
    name: string;
    email: string;
    mobile: string;
  };
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
    return <Loader />;
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
          </Button>
        </Link>
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

          <div className="flex flex-col gap-3 w-60 text-base">
            <label className="font-bold">Created By</label>
            <h1 className="text-[15px]">{rfpData.user.name}</h1>
            <h1 className="text-[15px]">{rfpData.user.email}</h1>
            <h1 className="text-[15px]">{rfpData.user.mobile}</h1>
          </div>
        </form>

        <div className="mt-8">
          <h2 className="text-lg font-bold mb-4">Approvers List</h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                {/* <th className="border border-gray-300 p-2">Approver ID</th> */}
                <th className="border border-gray-300 p-2">Name</th>
                <th className="border border-gray-300 p-2">Email</th>
                <th className="border border-gray-300 p-2">Role</th>
                <th className="border border-gray-300 p-2">Approved</th>
                <th className="border border-gray-300 p-2">Approved At</th>
              </tr>
            </thead>
            <tbody>
              {rfpData.approversList.map((approver) => (
                <tr key={approver.id}>
                  {/* <td className="border border-gray-300 p-2">{approver.userId}</td> */}
                  <td className="border border-gray-300 p-2">{approver.user.name}</td>
                  <td className="border border-gray-300 p-2">{approver.user.email}</td>
                  <td className="border border-gray-300 p-2">{approver.user.role}</td>
                  <td className="border border-gray-300 p-2">{approver.approved ? 'Yes' : 'No'}</td>
                  <td className="border border-gray-300 p-2">
                    {approver.approvedAt ? new Date(approver.approvedAt).toLocaleString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-bold mb-4">Products List</h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                {/* <th className="border border-gray-300 p-2">Product ID</th> */}
                <th className="border border-gray-300 p-2">Name</th>
                <th className="border border-gray-300 p-2">Model No</th>
                <th className="border border-gray-300 p-2">Specification</th>
                <th className="border border-gray-300 p-2">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {rfpData.rfpProducts.map((product) => (
                <tr key={product.id}>
                  {/* <td className="border border-gray-300 p-2">{product.productId}</td> */}
                  <td className="border border-gray-300 p-2">{product.product.name}</td>
                  <td className="border border-gray-300 p-2">{product.product.modelNo}</td>
                  <td className="border border-gray-300 p-2">{product.product.specification}</td>
                  <td className="border border-gray-300 p-2">{product.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
         
        <div className="mt-8">
          <h2 className="text-lg font-bold mb-4">Quotations List</h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2">Vendor ID</th>
                <th className="border border-gray-300 p-2">Total Amount</th>
                <th className="border border-gray-300 p-2">Total Amount Without GST</th>
                <th className="border border-gray-300 p-2">Created At</th>
                <th className="border border-gray-300 p-2">Supporting Documents</th>
              </tr>
            </thead>
            <tbody>
              {rfpData.quotations.map((quotation) => (
                <tr key={quotation.id}>
                  <td className="border border-gray-300 p-2">{quotation.vendorId}</td>
                  <td className="border border-gray-300 p-2">{quotation.totalAmount}</td>
                  <td className="border border-gray-300 p-2">{quotation.totalAmountWithoutGST}</td>
                  <td className="border border-gray-300 p-2">
                    {new Date(quotation.created_at).toLocaleString()}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {quotation.supportingDocuments.length > 0 ? (
                      <ul>
                        {quotation.supportingDocuments.map(doc => (
                          <li key={doc.id}>
                            <a href={doc.location} target="_blank" rel="noopener noreferrer">
                              {doc.documentName}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      'N/A'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
       
      </div>
    </>
  );
};

export default RfpDetails;
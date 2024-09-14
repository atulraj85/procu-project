"use client"
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
}

interface ApproverDetails {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface RfpProduct {
  id: string;
  productId: string;
  quantity: number;
}

interface ProductDetails {
  id: string;
  name: string;
  modelNo: string;
  specification: string;
  productCategoryId: string;
  created_at: string;
  updated_at: string;
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
  user: {
    name: string;
    email: string;
    mobile: string;
  };
}

const RfpDetails: React.FC = () => {
  const [rfpData, setRfpData] = useState<RfpData | null>(null);
  const [productDetails, setProductDetails] = useState<{ [key: string]: ProductDetails }>({});
  const [approverDetails, setApproverDetails] = useState<{ [key: string]: ApproverDetails | null }>({});
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
          await fetchProductDetails(data[0].rfpProducts);
          console.log();
          
          data[0].approversList.forEach(approver => {
            fetchApproverDetails(approver.userId);
          });
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

  const fetchProductDetails = async (products: RfpProduct[]) => {
    const details: { [key: string]: ProductDetails } = {};
    for (const product of products) {
      try {
        const response = await fetch(`/api/product?id=${product.productId}`);
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          details[product.productId] = data[0];
        }
      } catch (err) {
        console.error(`Failed to fetch details for product ${product.productId}`, err);
      }
    }
    setProductDetails(details);
  };

  const fetchApproverDetails = async (userId: string) => {
    try {
      setApproverDetails(prev => ({ ...prev, [userId]: null })); // Set to null to indicate loading
      const response = await fetch(`/api/users?id=${userId}`);
      const data = await response.json();
      if (data.response && data.response.data && data.response.data.length > 0) {
        setApproverDetails(prev => ({ ...prev, [userId]: data.response.data[0] }));
      } else {
        setApproverDetails(prev => ({ ...prev, [userId]: { id: userId, email: 'N/A', name: 'N/A', role: 'N/A' } }));
      }
    } catch (err) {
      console.error(`Failed to fetch details for approver ${userId}`, err);
      setApproverDetails(prev => ({ ...prev, [userId]: { id: userId, email: 'Error', name: 'Error', role: 'Error' } }));
    }
  };

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
                <th className="border border-gray-300 p-2">Approver ID</th>
                <th className="border border-gray-300 p-2">Name</th>
                <th className="border border-gray-300 p-2">Email</th>
                <th className="border border-gray-300 p-2">Role</th>
                <th className="border border-gray-300 p-2">Approved</th>
                <th className="border border-gray-300 p-2">Approved At</th>
              </tr>
            </thead>
            <tbody>
              {rfpData.approversList.map((approver) => {
                const details = approverDetails[approver.userId];
                return (
                  <tr key={approver.id}>
                    <td className="border border-gray-300 p-2">{approver.userId}</td>
                    <td className="border border-gray-300 p-2">
                      {details === null ? 'Loading...' : details?.name}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {details === null ? 'Loading...' : details?.email}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {details === null ? 'Loading...' : details?.role}
                    </td>
                    <td className="border border-gray-300 p-2">{approver.approved ? 'Yes' : 'No'}</td>
                    <td className="border border-gray-300 p-2">
                      {approver.approvedAt ? new Date(approver.approvedAt).toLocaleString() : 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-bold mb-4">Products List</h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2">Product ID</th>
                <th className="border border-gray-300 p-2">Name</th>
                <th className="border border-gray-300 p-2">Model No</th>
                <th className="border border-gray-300 p-2">Specification</th>
                <th className="border border-gray-300 p-2">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {rfpData.rfpProducts.map((product) => {
                const details = productDetails[product.productId];
                return (
                  <tr key={product.id}>
                    <td className="border border-gray-300 p-2">{product.productId}</td>
                    <td className="border border-gray-300 p-2">{details?.name || 'Loading...'}</td>
                    <td className="border border-gray-300 p-2">{details?.modelNo || 'Loading...'}</td>
                    <td className="border border-gray-300 p-2">{details?.specification || 'Loading...'}</td>
                    <td className="border border-gray-300 p-2">{product.quantity}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default RfpDetails;
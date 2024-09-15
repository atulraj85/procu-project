"use client"
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useSearchParams } from "next/navigation";
import { Input } from '@/components/ui/input';
// Define types for the RFP data structure
interface Vendor {
  companyName: string;
  email: string;
  mobile: string;
  address: string;
  customerState: string;
  customerCity: string;
  country: string;
  zip: string;
  gstin: string;
  pan: string;
}

interface Product {
  id: string;
  name: string;
  modelNo: string;
  quantity: number;
}

interface SupportingDocument {
  documentName: string;
  location: string;
}

interface Quotation {
  id: string;
  totalAmount: string;
  totalAmountWithoutGST: string;
  vendor: Vendor;
  products: Product[];
  supportingDocuments: SupportingDocument[]; // Add supporting documents to the quotation
}

interface Approver {
  name: string;
  email: string;
  mobile: string;
}

interface RFPData {
  rfpId: string;
  requirementType: string;
  dateOfOrdering: string;
  deliveryLocation: string;
  deliveryByDate: string;
  rfpStatus: string;
  approvers: Approver[];
  quotations: Quotation[];
}

const ViewRFP: React.FC = () => {
  const searchPrams=useSearchParams() // Get rfpId from URL parameters
  const rfp=searchPrams.get("rfp")
  const [rfpData, setRfpData] = useState<RFPData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRFP = async () => {
      try {
        const response = await fetch(`/api/rfp?rfpId=${rfp}`);
        if (!response.ok) {
          throw new Error('Failed to fetch RFP data');
        }
        const data: RFPData[] = await response.json();
        setRfpData(data[0]); // Assuming the API returns an array
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRFP();
  }, [rfp]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!rfpData) return <div>No RFP data found.</div>;

  return (
    <form className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>View RFP</CardTitle>
        </CardHeader>
        <CardContent>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Request for Product</CardTitle>
              <div className="flex justify-between">
                <p className="text-md text-muted-foreground">RFP ID: {rfpData.rfpId}</p>
                <p>Date of Ordering: {new Date(rfpData.dateOfOrdering).toLocaleDateString()}</p>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-4 gap-2">
              <div className="space-y-3 text-[19px]">
                <Label>Requirement Type</Label>
                <p>{rfpData.requirementType}</p>
              </div>
              <div className="space-y-2">
                <Label>Delivery By Date</Label>
                <p>{new Date(rfpData.deliveryByDate).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Approver Details</CardTitle>
            </CardHeader>
            <CardContent>
              {rfpData.approvers.map((approver, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <div className="flex flex-col">
                    <Label>Approver Name</Label>
                    <Input
                      type="text"
                      value={approver.name}
                      disabled
                      // className="border border-gray-300 p-2 rounded"
                    />
                  </div>
                  <div className="flex flex-col">
                    <Label>Email</Label>
                    <Input
                      type="text"
                      value={approver.email}
                      disabled
                      // className="border border-gray-300 p-2 rounded"
                    />
                  </div>
                  <div className="flex flex-col">
                    <Label>Phone</Label>
                    <Input
                      type="text"
                      value={approver.mobile}
                      disabled
                      // className="border border-gray-300 p-2 rounded"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="mb-4">
  <CardHeader>
    <CardTitle>Product Details</CardTitle>
  </CardHeader>
  <CardContent>
    {rfpData.quotations.map((quotation, index) => (
      <div key={index} className="mb-4">
        <div className="flex flex-col mb-4">
          <Label>Quotation ID</Label>
          <Input
            type="text"
            value={quotation.id}
            disabled
            className="border border-gray-300 p-2 rounded"
          />
        </div>
        <div className="flex flex-col mb-4">
          <Label>Total Amount</Label>
          <Input
            type="text"
            value={quotation.totalAmount}
            disabled
            className="border border-gray-300 p-2 rounded"
          />
        </div>
        <div className="flex flex-col mb-4">
          <Label>Total Amount Without GST</Label>
          <Input
            type="text"
            value={quotation.totalAmountWithoutGST}
            disabled
            className="border border-gray-300 p-2 rounded"
          />
        </div>
        <h4 className="font-semibold">Vendor Details</h4>
        <div className="flex items-center space-x-2 mb-2">
          <div className="flex flex-col">
            <Label>Company Name</Label>
            <Input
              type="text"
              value={quotation.vendor.companyName}
              disabled
              className="border border-gray-300 p-2 rounded"
            />
          </div>
          <div className="flex flex-col">
            <Label>Email</Label>
            <Input
              type="text"
              value={quotation.vendor.email}
              disabled
              className="border border-gray-300 p-2 rounded"
            />
          </div>
          <div className="flex flex-col">
            <Label>Mobile</Label>
            <Input
              type="text"
              value={quotation.vendor.mobile}
              disabled
              className="border border-gray-300 p-2 rounded"
            />
          </div>
        </div>
        <h4 className="font-semibold">Products</h4>
        {quotation.products.map((product, idx) => (
          <div key={idx} className="flex items-center space-x-2 mb-2">
            <div className="flex flex-col">
              <Label>Product Name</Label>
              <Input
                type="text"
                value={product.name}
                disabled
                className="border border-gray-300 p-2 rounded"
              />
            </div>
            <div className="flex flex-col">
              <Label>Model No</Label>
              <Input
                type="text"
                value={product.modelNo}
                disabled
                className="border border-gray-300 p-2 rounded"
              />
            </div>
            <div className="flex flex-col">
              <Label>Quantity</Label>
              <Input
                type="number"
                value={product.quantity}
                disabled
                className="border border-gray-300 p-2 rounded"
              />
            </div>
          </div>
        ))}
      </div>
    ))}
  </CardContent>
</Card>



          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Supporting Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th className="border border-gray-300 p-2">Document Name</th>
                    <th className="border border-gray-300 p-2">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {rfpData.quotations.flatMap((quotation) => 
                    quotation.supportingDocuments.map((doc, idx) => (
                      <tr key={idx}>
                        <td className="border border-gray-300 p-2">
                          <input
                            type="text"
                            value={doc.documentName}
                            disabled
                            className="w-full bg-gray-100"
                          />
                        </td>
                        <td className="border border-gray-300 p-2">
                          <input
                            type="text"
                            value={doc.location}
                            disabled
                            className="w-full bg-gray-100"
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Delivery Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Delivery Location</Label>
                <p>{rfpData.deliveryLocation}</p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </form>
  );
};

export default ViewRFP;

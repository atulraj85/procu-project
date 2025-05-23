"use client"
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { X, Star, FileText, Image as ImageIcon } from "lucide-react";
import Loader from "@/components/shared/Loader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";

// Define types for the RFP data structure
interface Vendor {
  price: string | number | readonly string[] | undefined;
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
  GST: string | number | readonly string[] | undefined;
  price: string | number | readonly string[] | undefined;
  id: string;
  name: string;
  modelNo: string;
  quantity: number;
}

interface SupportingDocument {
  documentName: string;
  location: string;
}

type OtherCharge = {
  price: number 
  gst:  number 
  name:string;
};

interface Quotation {
  otherCharges: [];
  refNo: string;
  id: string;
  totalAmount: string;
  totalAmountWithoutGST: string;
  vendor: Vendor;
  products: Product[];
  supportingDocuments: SupportingDocument[];
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
  preferredQuotationId: string;
  approvers: Approver[];
  quotations: Quotation[];
}

const ViewRFP: React.FC = () => {
  const searchParams = useSearchParams();
  const rfp = searchParams.get("rfp");
  const [rfpData, setRfpData] = useState<RFPData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRFP = async () => {
      try {
        const response = await fetch(`/api/rfp?rfpId=${rfp}`);
        if (!response.ok) {
          throw new Error("Failed to fetch RFP data");
        }
        const data: RFPData[] = await response.json();
        setRfpData(data[0]); // Assuming the API returns an array
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchRFP();
  }, [rfp]);

  if (loading) return <div><Loader /></div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!rfpData) return <div>No RFP data found.</div>;

  const isImageFile = (filename: string): boolean => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  };

  const DocumentPreview: React.FC<{ document: SupportingDocument }> = ({ document }) => {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            View
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{document.documentName}</DialogTitle>
          </DialogHeader>
          {isImageFile(document.location) ? (
            <Image
              src={document.location}
              alt={document.documentName}
              width={800}
              height={600}
              style={{ objectFit: 'contain' }}
            />
          ) : (
            <iframe
              src={document.location}
              title={document.documentName}
              width="100%"
              height="600px"
            />
          )}
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <form className="space-y-6">
      <Card>
        <div className="flex justify-end pb-5">
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
        <CardHeader>
          <CardTitle>View RFP</CardTitle>
        </CardHeader>
        <CardContent>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Request for Product</CardTitle>
              <div className="flex justify-between">
                <p className="text-md text-muted-foreground">
                  RFP ID: {rfpData.rfpId}
                </p>
                <p>
                  Date of Ordering:{" "}
                  {new Date(rfpData.dateOfOrdering).toLocaleDateString()}
                </p>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-4 gap-2">
              <div className=" ">
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
                    <Input type="text" value={approver.name} disabled />
                  </div>
                  <div className="flex flex-col">
                    <Label>Email</Label>
                    <Input type="text" value={approver.email} disabled />
                  </div>
                  <div className="flex flex-col">
                    <Label>Phone</Label>
                    <Input type="text" value={approver.mobile} disabled />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Quotations</CardTitle>
            </CardHeader>
            <CardContent>
              {rfpData.quotations.map((quotation, index) => (
                <div
                  key={index}
                  className={`mb-16 p-4 rounded-lg ${
                    quotation.id === rfpData.preferredQuotationId
                      ? " border-2 border-yellow-400"
                      : ""
                  }`}
                >
                  {quotation.id === rfpData.preferredQuotationId && (
                    <div className="flex items-center mb-2 text-yellow-600">
                      <Star className="mr-2" />
                      <span className="font-semibold">Preferred Vendor</span>
                    </div>
                  )}
                  {/* <div className="flex flex-col mb-4">
                    <Label>Quotation ID</Label>
                    <Input
                      type="text"
                      value={quotation.id}
                      disabled
                      className="border border-gray-300 p-2 rounded"
                    />
                  </div> */}
                  <div className="flex flex-col mb-4 w-[35%] mr-4">
                      <Label>Ref No</Label>
                      <Input
                        type="text"
                        value={quotation.refNo}
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
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          value={product.quantity}
                          disabled
                          className="border border-gray-300 p-2 rounded w-16"
                        />
                      </div>
                      <div className="flex flex-col">
                        <Label>Unit Price (INR)</Label>
                        <Input
                          type="number"
                          value={product.price}
                          disabled
                          className="border border-gray-300 p-2 rounded"
                        />
                      </div>
                      <div className="flex flex-col">
                        <Label>GST %</Label>
                        <Input
                          type="number"
                          value={product.GST}
                          disabled
                          className="border border-gray-300 p-2 rounded w-16"
                        />
                      </div>
                      <div className="flex flex-col">
                        <Label>Taxable Amount(INR)</Label>
                        <Input
                          type="number"
                          value={
                            Number(product?.price ?? 0) *
                            Number(product?.quantity ?? 0)
                          }
                          disabled
                          className="border border-gray-300 p-2 rounded "
                        />
                      </div>
                      <div className="flex flex-col">
                        <Label>Total Amount(INR)</Label>
                        <Input
                          type="number"
                          value={
                            Number(product.price ?? 0) *
                            Number(product.quantity ?? 0) *
                            (1 + Number(product.GST ?? 0) / 100)
                          }
                          disabled
                          className="border border-gray-300 p-2 rounded "
                        />
                      </div>
                    </div>
                  ))}
                  <h4 className="font-semibold pt-4">Other Charges</h4>
                  {quotation.otherCharges.map((other:OtherCharge, idx:number) => (
                    <div key={idx} className="flex items-center space-x-2 mb-2">
                      <div className="flex flex-col">
                        <Label>Name</Label>
                        <Input
                          type="text"
                          value={other.name}
                          disabled
                          className="border border-gray-300 p-2 rounded"
                        />
                      </div>
                      <div className="flex flex-col">
                        <Label>Unit Price</Label>
                        <Input
                          type="text"
                          value={other.price}
                          disabled
                          className="border border-gray-300 p-2 rounded"
                        />
                      </div>
                      <div className="flex flex-col">
                        <Label>GST%</Label>
                        <Input
                          type="text"
                          value={other.gst}
                          disabled
                          className="border border-gray-300 p-2 rounded"
                        />
                      </div>
                      <div className="flex flex-col">
                        <Label>Total Amount</Label>
                        <Input
                          type="text"
                          value={(other.price)*(1+(other.gst/100))}
                          disabled
                          className="border border-gray-300 p-2 rounded"
                        />
                      </div>
                      
                     
                    </div>
                  ))}
                   <div className="flex  pt-4">
                    
                    <div className="flex flex-col mb-4 mr-4">
                      <Label>Total Amount Incl.GST(INR)</Label>
                      <Input
                        type="text"
                        value={quotation.totalAmount}
                        disabled
                        className="border border-gray-300 p-2 rounded"
                      />
                    </div>
                    <div className="flex flex-col mb-4">
                      <Label>Taxable Amount (INR)</Label>
                      <Input
                        type="text"
                        value={quotation.totalAmountWithoutGST}
                        disabled
                        className="border border-gray-300 p-2 rounded"
                      />
                    </div>
                  </div>
                  
                  
                  <h4 className="font-semibold mt-4 mb-2">Supporting Documents</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-2 text-left">Document Name</th>
                      <th className="border border-gray-300 p-2 text-left">Type</th>
                      <th className="border border-gray-300 p-2 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotation.supportingDocuments.map((doc, idx) => (
                      <tr key={idx}>
                        <td className="border border-gray-300 p-2">{doc.documentName}</td>
                        <td className="border border-gray-300 p-2">
                          {isImageFile(doc.location) ? (
                            <ImageIcon className="inline-block mr-2" size={16} />
                          ) : (
                            <FileText className="inline-block mr-2" size={16} />
                          )}
                          {isImageFile(doc.location) ? 'Image' : 'PDF'}
                        </td>
                        <td className="border border-gray-300 p-2">
                          <DocumentPreview document={doc} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
              ))}
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

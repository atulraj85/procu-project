"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useSearchParams } from "next/navigation";
import { IoDocumentTextOutline } from "react-icons/io5";
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
import { Disclosure } from "@headlessui/react";

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
  description?: string;
  type: 'product' | 'otherCharge';
}

interface OtherCharge {
  name: string;
  price: string | number;
  gst: string | number;
  description?: string;
  type: 'otherCharge';
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
  otherCharges: OtherCharge[];
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

  const calculateTaxableAmount = (item: Product | OtherCharge) => {
    const price = typeof item.price === 'string' ? parseFloat(item.price) : Number(item.price);
    return price * (('quantity' in item && item.type !== 'otherCharge') ? item.quantity : 1);
  };

  const calculateTotalAmount = (item: Product | OtherCharge) => {
    const taxableAmount = calculateTaxableAmount(item);
    const gst = typeof item.GST === 'string' ? parseFloat(item.GST) : Number(item.GST || item.gst || 0);
    return taxableAmount * (1 + gst / 100);
  };

  if (loading) return <div><Loader /></div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!rfpData) return <div>No RFP data found.</div>;

  const isImageFile = (filename: string): boolean => {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];
    return imageExtensions.some((ext) => filename.toLowerCase().endsWith(ext));
  };

  const DocumentPreview: React.FC<{ document: SupportingDocument }> = ({
    document,
  }) => {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
          <IoDocumentTextOutline />
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
              style={{ objectFit: "contain" }}
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
    <form className="space-y-2">
      <Card>
        <div className="flex justify-between mt-2 mb-3 px-6 ">
          <div className="flex items-center">
            <Label className="font-bold text-md border border-black rounded-full mr-4 px-3 py-1">
              {rfpData.requirementType === "Product" ? "P" : "S"}
            </Label>
            <Label>
              RFP ID: {rfpData.rfpId}
            </Label>
          </div>
          <div className="flex">
            <div className="">
              <Label>
                RFP Date: {new Date(rfpData.dateOfOrdering).toLocaleDateString()}
              </Label>
              <div className="space-y-2">
                <Label>
                  Exp. Delivery Date: {new Date(rfpData.deliveryByDate).toLocaleDateString()}
                </Label>
              </div>
            </div>
            <div className="pl-3">
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
          </div>
        </div>
            <div className="pl-3">
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
          </div>
        </div>

        <CardContent>
          <Card className="mb-4">
            <CardContent>
              <div className="pt-2 pb-2">
                <Label className="font-bold text-20">Quotations</Label>
              </div>
              <div>
                {rfpData.quotations.map((quotation, index) => (
                  <Disclosure key={index} as="div" className="mb-4">
                    {({ open }) => (
                      <>
                        <Disclosure.Button
                          className={`flex justify-between w-full p-4 text-left text-sm font-medium ${
                            open ? "bg-gray-200" : "bg-blue-100"
                          }`}
                        >
                          <span className="flex">
                            <span className="font-bold">Quot. Ref No : </span> {quotation.refNo}
                            {quotation.id === rfpData.preferredQuotationId && (
                              <span className="text-yellow-600 pl-4 font-semibold">
                                <Star className="mr-2" />
                              </span>
                            )}
                          </span>
                          <div><span className="font-bold">Total Amount (INR) :</span> {quotation.totalAmount}</div>
                        </Disclosure.Button>
                        <Disclosure.Panel className="p-4">
                          <h4 className="font-semibold">Vendor Details</h4>
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="flex flex-col">
                              <Label>{quotation.vendor.companyName} {quotation.vendor.email} {quotation.vendor.mobile}</Label>
                            </div>
                          </div>
                          <h4 className="font-semibold mt-4">Products and Other Charges</h4>
                          <table className="min-w-full border-collapse border border-gray-300 mt-2">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="border border-gray-300 p-2 text-left">Name</th>
                                <th className="border border-gray-300 p-2 text-left">Description</th>
                                <th className="border border-gray-300 p-2 text-left">Qty</th>
                                <th className="border border-gray-300 p-2 text-left">Unit Price</th>
                                <th className="border border-gray-300 p-2 text-left">GST %</th>
                                <th className="border border-gray-300 p-2 text-left">Taxable Amt.</th>
                                <th className="border border-gray-300 p-2 text-left">Total Amt.</th>
                              </tr>
                              <tr className="bg-gray-100">
                                <th className="border border-gray-300 p-2 text-left"></th>
                                <th className="border border-gray-300 p-2 text-left"></th>
                                <th className="border border-gray-300 p-2 text-left"></th>
                                <th className="border border-gray-300 p-2 text-left">(INR)</th>
                                <th className="border border-gray-300 p-2 text-left"></th>
                                <th className="border border-gray-300 p-2 text-left">(INR)</th>
                                <th className="border border-gray-300 p-2 text-left">(INR)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[
                                ...quotation.products,
                                ...(Array.isArray(quotation.otherCharges) ? quotation.otherCharges : [])
                              ].map((item, idx) => (
                                <tr key={idx}>
                                  <td className="border border-gray-300 p-2">
                                    {item.type === 'otherCharge' ? 'Other Charge' : item.name}
                                  </td>
                                  <td className="border border-gray-300 p-2">
                                    {item.type === 'otherCharge' ? '' : (item.description || 'N/A')}
                                  </td>
                                  <td className="border border-gray-300 p-2">
                                    {item.type === 'otherCharge' ? '' : (item.quantity || '')}
                                  </td>
                                  <td className="border border-gray-300 p-2">{item.price}</td>
                                  <td className="border border-gray-300 p-2">{item.GST || item.gst || 0}</td>
                                  <td className="border border-gray-300 p-2">{calculateTaxableAmount(item).toFixed(2)}</td>
                                  <td className="border border-gray-300 p-2">{calculateTotalAmount(item).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="bg-gray-200">
                                <td colSpan={5} className="border border-gray-300 p-2 font-bold text-right">Total:</td>
                                <td className="border border-gray-300 p-2 font-bold">{quotation.totalAmountWithoutGST}</td>
                                <td className="border border-gray-300 p-2 font-bold">{quotation.totalAmount}</td>
                              </tr>
                            </tfoot>
                          </table>
                          
                          <h4 className="font-semibold mt-4 mb-2">Supporting Documents</h4>
                          <div className="flex flex-wrap gap-4">
                            {quotation.supportingDocuments.map((doc, idx) => (
                              <div key={idx} className="flex items-center space-x-2">
                                <span>{doc.documentName}</span>
                                <DocumentPreview document={doc} />
                              </div>
                            ))}
                          </div>
                        </Disclosure.Panel>
                      </>
                    )}
                  </Disclosure>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="flex">
            <Card className="mb-4 mr-2 w-[75%]">
              <CardHeader>
               
                <Label className="font-bold text-20">Approver Details</Label>
              </CardHeader>
              <CardContent>
                {rfpData.approvers.map((approver, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <div>
                      <h1>{approver.name} | {approver.email} | {approver.mobile}</h1>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="mb-4">
              <CardHeader>
               
                <Label className="font-bold text-20">Delivery Location</Label>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p>{rfpData.deliveryLocation}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default ViewRFP;
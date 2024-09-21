"use client";
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
import { Disclosure } from "@headlessui/react"; // Import Disclosure for accordion

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

interface Quotation {
  otherCharges: any;
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
  console.log("rfp",rfpData);
  
  // console.log("rfp",new Date(rfpData.deliveryByDate).toDateString("d-m-Y")  );
  


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

  if (loading)
    return (
      <div>
        <Loader />
      </div>
    );
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
          <Label className=" font-bold text-md border border-black  rounded-full mr-4 px-3 py-1 ">
                p
              </Label>
            <Label >
              RFP ID:  {rfpData.rfpId}
            </Label>

           
              
              </div>
             
           
<div className="flex">
            <div className="">
              <Label>
                RFP Date:{" "}
                {new Date(rfpData.dateOfOrdering).toLocaleDateString()}
              </Label>
              <div className="space-y-2">
                <Label>
                  Exp. Delivery Date:{" "}
                  {new Date(rfpData.deliveryByDate).toLocaleDateString()}
                  <h1></h1>
                </Label>
              </div>
            </div>
            <div className="pl-3" >
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
              <div  className="pt-2 pb-2" >
            <Label className=" font-bold text-20">Quotations</Label>
            </div>
            <div >
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
                        {/* <span>{open ? "-" : "+"}</span> */}
                      </Disclosure.Button>
                      <Disclosure.Panel className="p-4">
                        {quotation.id === rfpData.preferredQuotationId && (
                          <div className="flex items-center mb-2 text-yellow-600">
                            {/* <Star className="mr-2" />
                            <span className="font-semibold">
                              Preferred Vendor
                            </span> */}
                          </div>
                        )}
                        {/* <div className="flex flex-col mb-4 w-[35%] mr-4">
                          <Label>Ref No</Label>
                          <Input
                            type="text"
                            value={quotation.refNo}
                            disabled
                            className="border border-gray-300 p-2 rounded"
                          />
                        </div> */}
                        <h4 className="font-semibold">Vendor Details</h4>
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex flex-col">
                            <Label>{quotation.vendor.companyName} {quotation.vendor.email} {quotation.vendor.mobile}</Label>
                            {/* <Label>Company Name</Label> */}
                            {/* <Input
                              type="text"
                              value={quotation.vendor.companyName}
                              disabled
                              className="border border-gray-300 p-2 rounded"
                            /> */}
                          </div>
                          <div className="flex flex-col">
                            {/* <Label>Email</Label> */}
                            <Input
                              type="text"
                              value={quotation.vendor.email}
                              disabled
                              className="border border-gray-300 p-2 rounded"
                            />
                          </div>
                          <div className="flex flex-col">
                            {/* <Label>Mobile</Label> */}
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
                          <div
                            key={idx}
                            className="flex items-center space-x-2 mb-2"
                          >
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
                                value={product.price * product.quantity}
                                disabled
                                className="border border-gray-300 p-2 rounded"
                              />
                            </div>
                            <div className="flex flex-col">
                              <Label>Total Amount(INR)</Label>
                              <Input
                                type="number"
                                value={
                                  product.price *
                                  product.quantity *
                                  (1 + product.GST / 100)
                                }
                                disabled
                                className="border border-gray-300 p-2 rounded"
                              />
                            </div>
                          </div>
                        ))}
                        <h4 className="font-semibold pt-4">Other Charges</h4>
                        {quotation.otherCharges.map((other, idx) => (
                          <div
                            key={idx}
                            className="flex items-center space-x-2 mb-2"
                          >
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
                                value={other.price * (1 + other.gst / 100)}
                                disabled
                                className="border border-gray-300 p-2 rounded"
                              />
                            </div>
                          </div>
                        ))}
                        <div className="flex pt-4">
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
                        <h4 className="font-semibold mt-4 mb-2">
                          Supporting Documents
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full border-collapse border border-gray-300">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="border border-gray-300 p-2 text-left">
                                  Document Name
                                </th>
                                <th className="border border-gray-300 p-2 text-left">
                                  Type
                                </th>
                                <th className="border border-gray-300 p-2 text-left">
                                  Action
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {quotation.supportingDocuments.map((doc, idx) => (
                                <tr key={idx}>
                                  <td className="border border-gray-300 p-2">
                                    {doc.documentName}
                                  </td>
                                  <td className="border border-gray-300 p-2">
                                    {isImageFile(doc.location) ? (
                                      <ImageIcon
                                        className="inline-block mr-2"
                                        size={16}
                                      />
                                    ) : (
                                      <FileText
                                        className="inline-block mr-2"
                                        size={16}
                                      />
                                    )}
                                    {isImageFile(doc.location)
                                      ? "Image"
                                      : "PDF"}
                                  </td>
                                  <td className="border border-gray-300 p-2">
                                    <DocumentPreview document={doc} />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              ))}
              </div>
            </CardContent>
          </Card>
           <div className="flex ">
          <Card className="mb-4 mr-2 w-[70%]">
            <CardHeader>
              <CardTitle>Approver Details</CardTitle>
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
              <CardTitle>Delivery Location</CardTitle>
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

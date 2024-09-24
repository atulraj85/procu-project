"use client";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import html2canvas from 'html2canvas';
import jsPDF from "jspdf";

interface CompanyAddress {
  id?: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  addressType: string;
  companyId: string;
}

interface Company {
  id: string;
  name: string;
  addresses: CompanyAddress[];
  logo: string;
  stamp: string;
}

interface Vendor {
  id: string;
  companyName: string;
  email: string;
  gstin: string;
  address: string;
}

interface Product {
  id?: string;
  name: string;
  modelNo: string;
  price: string;
  quantity: number;
  GST: number;
}

interface OtherCharge {
  id?: string;
  name: string;
  modelNo: string;
  price: string;
  gst: number;
}

interface Quotation {
  id?: string;
  vendor: Vendor;
  products: Product[];
  otherCharges: OtherCharge[];
  refNo: string;
}

interface RfpData {
  id?: string;
  poId: string;
  company: Company;
  quotations: Quotation[];
}

const Page: React.FC = () => {
  const [rfpData, setRfpData] = useState<RfpData | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const searchParams = useSearchParams();
  const poId = searchParams.get("poid");
  const pageRef = useRef<HTMLDivElement>(null);
  const date = new Date();

  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  
  let currentDate = `${day}/${month}/${year}`;

  useEffect(() => {
    const fetchPoData = async () => {
      try {
        const response = await fetch(`/api/po?poId=${poId}`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        const poData: RfpData = data[0];
        setRfpData(poData);
        setCompany(poData.company);
  
        if (poData.quotations && poData.quotations.length > 0) {
          const quotation = poData.quotations[0];
          setVendor(quotation.vendor);
        }
      } catch (error) {
        console.error("Error fetching PO data:", error);
      }
    };
  
    fetchPoData();
  }, [poId]);

  
  const calculateTaxableAmount = (item: Product | OtherCharge) => {
    const price = typeof item.price === 'string' ? parseFloat(item.price) : Number(item.price);
    return price * (('quantity' in item) ? item.quantity : 1);
  };

  const calculateTotalAmount = (item: Product | OtherCharge) => {
    const taxableAmount = calculateTaxableAmount(item);
    const gst = typeof item.GST === 'number' ? item.GST : (typeof item.gst === 'number' ? item.gst : 0);
    return taxableAmount * (1 + gst / 100);
  };
  const preferredQuotation = rfpDetails?.quotations.find(q => q.id === rfpDetails.preferredQuotationId);

  if (!preferredQuotation) return <div>No preferred quotation found.</div>;
  const downloadPDF = async () => {
    if (pageRef.current) {
      try {
        const canvas = await html2canvas(pageRef.current, {
          scale: 2,
          useCORS: true,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save("purchase_order_full_page.pdf");
      } catch (error) {
        console.error("Error generating PDF:", error);
      }
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent("Purchase Order");
    const body = encodeURIComponent(`Please find the purchase order attached.\n\nLink: ${window.location.href}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  // Calculate total taxable amount and total amount
  const totalTaxableAmount = rfpData?.quotations?.[0]?.products.reduce((acc, product) => {
    return acc + (parseFloat(product.price) * product.quantity);
  }, 0) || 0;
  const totalOtherAmount = rfpData?.quotations?.[0]?.otherCharges.reduce((acc, charge) => {
    return acc + (parseFloat(charge.price) * (1 + (charge.gst / 100)));
  }, 0) || 0;

  const totalAmount = rfpData?.quotations?.[0]?.products.reduce((acc, product) => {
    return acc + (parseFloat(product.price) * product.quantity) * (1 + (product.GST / 100));
  }, 0) || 0;

  return (
    <div ref={pageRef}>
      <div className="mx-20 mt-4">
        <div className="flex justify-end pb-8">
          <Link href="/dashboard/finance">
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
        <section className="flex justify-between pb-7">
          <div>
            <Image className="rounded-full" height={100} width={100} alt="Company logo" src={company?.logo || "/company/logo.png"} />
          </div>
          <div className="w-[35%]">
            <div>
              <h1 className="font-bold flex justify-end">{company?.name}</h1>
            </div>
            <div className="flex justify-end">
              <h1 className="text-[14px]">{vendor?.address}</h1>
            </div>
          </div>
        </section>

        <div className="font-bold flex justify-center">
          <h1>Purchase Order</h1>
        </div>
        <section className="flex justify-between">
          <div className="w-[30%]">
            <h1 className="font-bold">{vendor?.companyName}</h1>
            {company?.addresses && company.addresses.length > 0 ? (
              company.addresses
                .filter(address => address.addressType === "BUSINESS")
                .map((address) => (
                  <h1 key={address.id} className="text-[14px]">
                    {`${address.street}, ${address.city}, ${address.state}, ${address.postalCode}, ${address.country}`}
                  </h1>
                ))
            ) : (
              <h1 className="text-[14px]">No address available</h1>
            )}
            <p className="font-bold">
              GSTIN: <span className="font-sans text-[14px]"> {vendor?.gstin}</span>
            </p>
          </div>
          <div>
            <div className="flex">
              <label className="font-bold">Order No :</label>
              <h1 className="text-[14px]">{rfpData?.poId}</h1>
            </div>
            <div className="flex">
              <label className="font-bold">Ref :-</label>
              <h1 className="text-[14px]">{rfpData?.quotations[0]?.refNo}</h1>
            </div>
            <div className="flex">
              <label className="font-bold">Date :-</label>
              <h1 className="text-[14px]">{currentDate}</h1>
            </div>
          </div>
        </section>

        <div className="font-bold mt-10 mb-4 ">
          <h1>Description: Render Farm</h1>
        </div>

        <div className="p-4">
              {/* <h4 className="font-semibold">Quotation Reference: {preferredQuotation.refNo}</h4>
              <h4 className="font-semibold mt-4">Vendor: {preferredQuotation.vendor.companyName}</h4> */}
              {/* <h4 className="font-semibold mt-4">Products and Other Charges</h4> */}
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
                </thead>
                <tbody>
                  {[
                    ...preferredQuotation.products,
                    ...(Array.isArray(preferredQuotation.otherCharges) ? preferredQuotation.otherCharges : [])
                  ].map((item, idx) => (
                    <tr key={idx}>
                      <td className="border border-gray-300 p-2">
                        {'modelNo' in item ? item.name : 'Other Charge'}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {item.description || 'N/A'}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {'quantity' in item ? item.quantity : ''}
                      </td>
                      <td className="border border-gray-300 p-2">{item.price}</td>
                      <td className="border border-gray-300 p-2">{'GST' in item ? item.GST : item.gst}</td>
                      <td className="border border-gray-300 p-2">{calculateTaxableAmount(item).toFixed(2)}</td>
                      <td className="border border-gray-300 p-2">{calculateTotalAmount(item).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-200">
                    <td colSpan={5} className="border border-gray-300 p-2 font-bold text-right">Total:</td>
                    <td className="border border-gray-300 p-2 font-bold">{preferredQuotation.totalAmountWithoutGST}</td>
                    {/* <td className="border border-gray-300 p-2 font-bold">{preferredQuotation.totalAmount}</td> */}
                  </tr>
                </tfoot>
              </table>
            </div>
        
        <div className="font-bold mt-10 mb-4 ">
          <h1>Other Charges</h1>
        </div>
        <section className="flex justify-center pt-4">
          <table className="w-full border border-collapse border-gray-300">
            <thead>
              <tr>
                <th className="font-bold p-1 border border-gray-300 text-center">Name</th>
                <th className="font-bold p-1 border border-gray-300 text-center">Unit Price in INR</th>
                <th className="font-bold p-1 border border-gray-300 text-center">GST</th>
                <th className="font-bold p-1 border border-gray-300 text-center">Total Price in INR</th>
              </tr>
            </thead>
            <tbody>
              {rfpData?.quotations?.[0]?.otherCharges && rfpData.quotations[0].otherCharges.length > 0 ? (
                rfpData.quotations[0].otherCharges.map((charge, index) => (
                  <tr key={charge.id || index}>
                    <td className="text-[14px] border border-gray-300 p-4">
                      {charge.name} 
                    </td>
                    <td className="text-[14px] border border-gray-300 p-4 text-right">{charge.price}</td>
                    <td className="text-[14px] border border-gray-300 p-4 text-right">{charge.gst}%</td>
                    <td className="text-[14px] border border-gray-300 p-4 text-right">{(parseFloat(charge.price) * (1 + (charge.gst / 100))).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center">No other charges available</td>
                </tr>
              )}
              <tr>
                <td colSpan={3} className="font-bold text-right pr-14 border ">Total Amount Including GST:</td>
                <td className="text-[14px] border p-2 text-right">{totalOtherAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </section>
        <section className="flex justify-between">
          <div>
            <div className="w-[50%] mt-7 mb-3">
              <label className="font-bold">{company?.name}</label>
              <Image height={80} width={100} alt="Signature" src={company?.stamp || "/company/logo.png"} />
              <h1 className="text-[14px]">Authorized Signatory</h1>
            </div>
            <div className="flex justify-between">
              <div className="w-[50%] mt-7 mb-3">
                <label className="font-bold">Invoice To:</label>
                <h1 className="text-[14px]">{vendor?.address}</h1>
              </div>
              <div className="pr-6">
                {/* Optional logo or stamp can be added here */}
              </div>
            </div>
            <div className="mb-8">
              <label className="font-bold">Ship To:</label>
              {company?.addresses && company.addresses.length > 0 ? (
                <p className="text-[14px]">{`${company.addresses[1].street}, ${company.addresses[1].city}, ${company.addresses[1].postalCode}`}</p>
              ) : (
                <p className="text-[14px]">No shipping address available</p>
              )}
            </div>
          </div>
        </section>

        <div className="flex justify-center mt-4">
          <Button onClick={downloadPDF} className="bg-blue-500 text-white mr-4">
            Download PDF
          </Button>
          <Button onClick={shareViaEmail} className="bg-green-500 text-white">
            Share via Email
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Page;
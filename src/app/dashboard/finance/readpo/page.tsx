"use client";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Loader from "@/components/shared/Loader";

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
  description:string;
  gst: number;
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
  totalAmountWithoutGST: number; // Assuming this is part of the Quotation
  totalAmount: number; // Assuming this is part of the Quotation
}

interface RfpData {
  id?: string;
  poId: string;
  company: Company;
  remarks:string;
  quotations: Quotation[];
}

const Page = () => {
  const [poData, setPoData] = useState<RfpData | null>(null);
  const searchParams = useSearchParams();
  const poId = searchParams.get("poid");
  const pageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchPoData = async () => {
      try {
        const response = await fetch(`/api/po?poid=${poId}`);
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        setPoData(data[0]);
      } catch (error) {
        console.error("Error fetching PO data:", error);
      }
    };

    if (poId) fetchPoData();
  }, [poId]);

  const calculateTaxableAmount = (item: Product): number => {
    const price = parseFloat(item.price);
    return price * (item.quantity || 1);
  };

  const calculateTotalAmount = (item: Product): number => {
    const taxableAmount = calculateTaxableAmount(item);
    const gst = item.gst || 0;
    return taxableAmount * (1 + gst / 100);
  };

  const downloadPDF = async () => {
    if (pageRef.current) {
      try {
        const canvas = await html2canvas(pageRef.current, {
          scale: 2,
          useCORS: true,
        });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "px",
          format: [canvas.width, canvas.height],
        });
        pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
        pdf.save("purchase_order.pdf");
      } catch (error) {
        console.error("Error generating PDF:", error);
      }
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent("Purchase Order");
    const body = encodeURIComponent(
      `Please find the purchase order attached.\n\nLink: ${window.location.href}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  if (!poData) return <div><Loader/></div>;

  const { company, quotations } = poData;
  const quotation = quotations[0];
  const currentDate = new Date().toLocaleDateString();

  return (
    <div ref={pageRef} className="mx-20 mt-4">
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

      <section className=" pb-7">
        <Image
          className="rounded-full"
          height={75}
          width={75}
          alt="Company logo"
          src={company.logo || "/company/logo.png"}
        />
        <div className="w-[35%] text-left">
          <h1 className="font-bold">{company.name}</h1>
          <h1 className="text-[14px]">
            {company.addresses[0]?.street}, {company.addresses[0]?.city}
          </h1>
        </div>
      </section>

      <h1 className="font-bold text-center mb-4">Purchase Order</h1>

      <section className="flex justify-between mb-8">
        <div className="w-[30%]">
          <h1 className="font-bold">{quotation.vendor.companyName}</h1>
          <h1 className="text-[14px]">{quotation.vendor.address}</h1>
          <p className="font-bold">
            GSTIN:{" "}
            <span className="font-sans text-[14px]">
              {quotation.vendor.gstin}
            </span>
          </p>
        </div>
        <div>
          <p>
            <span className="font-bold">Order No:</span> {poData.poId}
          </p>
          <p>
            <span className="font-bold">Ref:</span> {quotation.refNo}
          </p>
          <p>
            <span className="font-bold">Date:</span> {currentDate}
          </p>
        </div>
      </section>

      <h2 className="font-bold mt-10 mb-4">Description: Render Farm</h2>

      <table className="w-full border-collapse border border-gray-300 mb-8">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2 text-left">Name</th>
            <th className="border border-gray-300 p-2 text-left">Product Description</th>
            <th className="border border-gray-300 p-2 text-left">Qty</th>
            <th className="border border-gray-300 p-2 text-left">Unit Price</th>
            <th className="border border-gray-300 p-2 text-left">GST %</th>
            <th className="border border-gray-300 p-2 text-left">
              Taxable Amt.
            </th>
            <th className="border border-gray-300 p-2 text-left">Total Amt.</th>
          </tr>
        </thead>
        <tbody>
          {quotation.products.map((item, idx) => (
            <tr key={idx}>
              <td className="border border-gray-300 p-2">{item.name}</td>
              <td className="border border-gray-300 p-2">{item.description}</td>
              <td className="border border-gray-300 p-2">{item.quantity}</td>
              <td className="border border-gray-300 p-2">{item.price}</td>
              <td className="border border-gray-300 p-2">{item.gst}%</td>
              <td className="border border-gray-300 p-2">
                {calculateTaxableAmount(item).toFixed(2)}
              </td>
              <td className="border border-gray-300 p-2">
                {calculateTotalAmount(item).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-gray-200">
            <td
              colSpan={5}
              className="border border-gray-300 p-2 font-bold text-right"
            >
              Total:
            </td>
            <td className="border border-gray-300 p-2 font-bold">
              {quotation.totalAmountWithoutGST}
            </td>
            <td className="border border-gray-300 p-2 font-bold">
              {quotation.totalAmount}
            </td>
          </tr>
        </tfoot>
      </table>

      <section className="flex justify-between mb-8">
        <div>
          <div className="mb-4">
            <p className="font-bold">{company.name}</p>
            <Image
              height={80}
              width={100}
              alt="Signature"
              src={company.stamp || "/company/sign.png"}
            />
            <p className="text-[14px]">Authorized Signatory</p>
          </div>
          <div className="mb-4">
            <p className="font-bold">Invoice To:</p>
            <p className="text-[14px]">{quotation.vendor.address}</p>
          </div>
          <div>
            <p className="font-bold">Ship To:</p>
            <p className="text-[14px]">
              {
                company.addresses.find(
                  (addr) => addr.addressType === "SHIPPING"
                )?.street
              }
              ,
              {
                company.addresses.find(
                  (addr) => addr.addressType === "SHIPPING"
                )?.city
              }
            </p>
          </div>
        </div>
        <div>
          <p className="font-bold mb-2">Remarks:</p>
          <p className="text-[14px]">{poData.remarks}</p>
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
  );
};

export default Page;
"use client";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState ,useRef } from "react";
import html2canvas from 'html2canvas';
import jsPDF from "jspdf";

interface CompanyAddress {
  street: string;
  city: string;
  postalCode: string;
}

interface Company {
  id: string;
  name: string;
  addresses: CompanyAddress[];
  // Add other fields as necessary
}

interface Vendor {
  id: string;
  customerCode: string;
  primaryName: string;
  companyName: string;
  email: string;
  gstin: string;
  address: string;
  // Add other fields as necessary
}

const vendor: Vendor = {
  id: "b5b7988e-c18f-4193-9737-cc35ae3c557c",
  customerCode: "CUST-001",
  primaryName: "Ashutosh Kumar Mishra",
  companyName: "GROWW AND BECONSCIOUS PRIVATE LIMITED",
  email: "ashutoshmishra8796@gmail.com",
  gstin: "27AAECG8478M1ZT",
  address:
    "GROUND FLOOR, FLAT NO. 001,, DADARKAR ARCADE N L PARELKAR, PAREL VILLAGE, PAREL, Mumbai, Maharashtra, 400012",
};

const Page: React.FC = () => {
  const [rfpData, setRfpData] = useState<any>({});
  const [company, setCompany] = useState<Company | null>(null);
  const searchParams = useSearchParams();
  const rfp = searchParams.get("rfp");
  const pageRef = useRef<HTMLDivElement>(null);
  const date = new Date();

  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  
  // This arrangement can be altered based on how we want the date's format to appear.
  let currentDate = `${day}/${month}/${year}`;

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await fetch(`/api/company?rfpId=${encodeURIComponent(rfp)}`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        console.log("company", data[0].addresses); // Log the fetched data
        setCompany(data[0]); // Store the data in state if needed
      } catch (error) {
        console.error("Error fetching company data:", error);
      }
    };

    fetchCompanyData();
  }, [rfp]);

  useEffect(() => {
    const fetchRfpData = async () => {
      try {
        const response = await fetch(`/api/rfp?rfpId=${encodeURIComponent(rfp)}`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        console.log(data[0]); // Log the fetched data
        setRfpData(data[0]); // Store the data in state if needed
      } catch (error) {
        console.error("Error fetching RFP data:", error);
      }
    };

    fetchRfpData();
  }, [rfp]);

  const downloadPDF = async () => {
  if (pageRef.current) {
    const canvas = await html2canvas(pageRef.current, {
      scale: 2, // Increase scale for better quality
      useCORS: true, // This might be necessary for loading images
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save("purchase_order_full_page.pdf");
  }
}

  return (
    <div>
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
            </Button>{" "}
          </Link>
        </div>
        <section className="flex justify-between pb-7">
          <div >
            {/* <label className="font-bold">Company Logo</label> */}
            <Image className=" rounded-full" height={100} width={100} alt="Company logo" src="/company/logo.png" />
          </div>
          <div>
            <div>
              <h1 className="font-bold">{company?.name}</h1>
              <p className="text-[14px]">{`${company?.addresses[0].street}, ${company?.addresses[0].city}, ${company?.addresses[0].postalCode}`}</p>
            </div>
          </div>
        </section>

        {/* Another section for Purchase Order */}
        <div className="font-bold flex justify-center">
          <h1>Purchase Order</h1>
        </div>
        <section className="flex justify-between">
          <div className="w-[30%]">
            <h1 className="font-bold">{vendor.companyName}</h1>
            <h1 className="text-[14px]">{vendor.address}</h1>
            <p className="font-bold">
              GSTIN: <span className="font-sans text-[14px]"> {vendor.gstin}</span>
            </p>
          </div>
          <div>
            <div className="flex">
              <label className="font-bold">Order No :</label>
              <h1 className="text-[14px]">MM-PO-2024-25-190</h1>
            </div>
            <div className="flex">
              <label className="font-bold">Ref :-</label>
              <h1 className="text-[14px]">SO-24-00012</h1>
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
        <section className="flex justify-center">
          <table className="w-full border border-collapse border-gray-300">
            <thead>
              <tr>
                <th className="font-bold p-1 border border-gray-300 text-center">Product Description</th>
                <th className="font-bold p-1 border border-gray-300 text-center">Unit Price in INR</th>
                <th className="font-bold p-1 border border-gray-300 text-center">Qty</th>
                <th className="font-bold p-1 border border-gray-300 text-center">Total Price in INR</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-[14px] border border-gray-300 p-4">
                  GSTIN: Render Farm : <a href="https://www.foxrenderfarm.com/" target="_blank" rel="noopener noreferrer">https://www.foxrenderfarm.com/</a><br />
                  Credits Required: Rs 169340 (USD 2000 * 84.67)<br />
                  Handling cost: 18% INR 30,481.<br />
                  Total cost: 199821
                </td>
                <td className="text-[14px] border border-gray-300 p-4 text-right">1,99,821.00</td>
                <td className="text-[14px] border border-gray-300 p-4 text-right">1</td>
                <td className="text-[14px] border border-gray-300 p-4 text-right">1,99,821.00</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="flex justify-between">
          <div>
            <div className="w-[50%] mt-7 mb-3">
              <label className="font-bold">{company?.name}</label>
              <Image height={80} width={100} alt="Signature" src="/company/sign.png" />
              <h1 className="text-[14px]">Authorized Signatory</h1>
            </div>
            <div className="flex justify-between">
            <div className="w-[50%] mt-7 mb-3">
              <label className="font-bold">Invoice To:</label>
              <h1 className="text-[14px]">{vendor.address}</h1>
            </div>
            <div className="pr-6"> <Image height={150} width={150} alt="Company logo" src="/company/stamp-transparent-19.png" /></div>
            </div>
            <div className="mb-8">
              <label className="font-bold">Ship To:</label>
              <p className="text-[14px]">{`${company?.addresses[0].street}, ${company?.addresses[0].city}, ${company?.addresses[0].postalCode}`}</p>
            </div>
          </div>
        </section>

        <div className="flex justify-center mt-4">
        {/* <Button onClick={downloadPDF} className="bg-blue-500 text-white">
            Download PDF
          </Button> */}
        </div>
      </div>
    </div>
  );
};

export default Page;

<Card className="mt-4">
<CardHeader>
  <CardTitle className="text-lg text-slate-700">Shipping Information</CardTitle>
</CardHeader>
<CardContent>
  <div className="flex flex-wrap">
    <div className="mx-4 flex-1">
      <Label className="font-bold text-[16px] text-slate-700 pb-2">Billing Address</Label>
      <Textarea className="text-[14px]" />
    </div>
    <div className="mx-4 flex-1">
      <Label className="font-bold text-[16px] text-slate-700 pb-2">Shipping Address</Label>
      <Textarea className="text-[14px]" />
    </div>
  </div>
</CardContent>
</Card>

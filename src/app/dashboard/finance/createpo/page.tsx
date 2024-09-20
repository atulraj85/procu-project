"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import html2canvas from 'html2canvas';
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { X } from "lucide-react";
import Loader from "@/components/shared/Loader";

interface Product {
  id: string;
  name: string;
  modelNo: string;
  price: string;
  quantity: number;
  GST: number;
}

interface OtherCharge {
  id: string;
  name: string;
  price: string;
  gst: number;
}

interface FormData {
  companyName: string;
  companyGST: string;
  companyAddress: string;
  companyLogo: string;
  companyId: string;
  poId: string;
  orderNo: string;
  ref: string;
  date: string;
  rfpid: string;
  vendorName: string;
  vendorAddress: string;
  vendorGST: string;
  deliveryLocation: string;
  products: Product[];
  otherCharges: OtherCharge[];
  remarks: string;
  quotationId: string;
}

const Page: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    companyGST: "",
    companyAddress: "",
    companyLogo: "/company/logo.png",
    companyId: "",
    poId: "",
    orderNo: "",
    ref: "",
    date: "",
    rfpid: "",
    vendorName: "",
    vendorAddress: "",
    vendorGST: "",
    deliveryLocation: "",
    products: [],
    otherCharges: [],
    remarks: "",
    quotationId: ""
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const searchParams = useSearchParams();
  const rfp = searchParams.get("rfp");
  const USER_ID = typeof window !== 'undefined' ? localStorage.getItem("USER_ID") : null;
  const pageRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rfpResponse = await fetch(`/api/rfp?rfpId=${rfp}`);
        if (!rfpResponse.ok) throw new Error("Network response was not ok");
        const rfpData = await rfpResponse.json();
        const rfpDetails = rfpData[0];

        const companyResponse = await fetch('/api/company');
        if (!companyResponse.ok) throw new Error("Network response was not ok");
        const companyData = await companyResponse.json();
        const company = companyData[0];

        const poResponse = await fetch(`/api/po/poId`);
        if (!poResponse.ok) throw new Error("Network response was not ok");
        const poData = await poResponse.json();

        setFormData({
          companyName: company.name || "",
          companyGST: company.GST || "",
          companyAddress: company.addresses[0]?.street || "",
          companyLogo: company.logo || "/company/logo.png",
          companyId: company.id || "",
          poId: poData || "",
          orderNo: `MM-PO-${new Date().getFullYear()}-${poData}`,
          ref: rfpDetails.quotations[0]?.refNo || "",
          date: new Date().toLocaleDateString(),
          vendorName: rfpDetails.quotations[0]?.vendor?.companyName || "",
          rfpid: rfpDetails.id || "",
          vendorAddress: rfpDetails.quotations[0]?.vendor?.address || "",
          vendorGST: rfpDetails.quotations[0]?.vendor?.gstin || "",
          deliveryLocation: rfpDetails.deliveryLocation || "",
          products: rfpDetails.quotations[0]?.products || [],
          otherCharges: rfpDetails.quotations[0]?.otherCharges || [],
          remarks: "",
          quotationId: rfpDetails.quotations[0]?.id || ""
        });
      } catch (error) {
        setError(error instanceof Error ? error : new Error('An unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [rfp]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const onSubmit = async () => {
    const payload = {
      poId: formData.poId,
      quotationId: formData.quotationId,
      userId: USER_ID,
      companyId: formData.companyId,
      rfpId: formData.rfpid,
      remarks: formData.remarks,
      rfpStatus: "PO_CREATED"
    };
    
    try {
      const response = await fetch('/api/po', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Network response was not ok')
        else{

      const result = await response.json();
      toast({
        title: "🎉 PO Created successfully.",
       
      });
      router.push("/dashboard")
    }
      
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error creating PO",
        description: "An error occurred while creating the PO. Please try again.",
        variant: "destructive",
      });
    }
  };

  const calculateTotalAmount = (items: Product[] | OtherCharge[]): number => {
    return items.reduce((total, item) => {
      const price = parseFloat(item.price);
      const quantity = 'quantity' in item ? item.quantity : 1;
      const gst = 'GST' in item ? item.GST : item.gst;
      return total + (price * quantity * (1 + gst / 100));
    }, 0);
  };

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
        pdf.save("purchase_order.pdf");
      } catch (error) {
        console.error("Error generating PDF:", error);
        toast({
          title: "Error generating PDF",
          description: "An error occurred while generating the PDF. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent("Purchase Order");
    const body = encodeURIComponent(`Please find the purchase order attached.\n\nLink: ${window.location.href}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  if (loading) return <div><Loader/> </div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div ref={pageRef}>
      <div className="mx-20 mt-4">
        <div className="flex justify-end pb-8">
          <Link href="/dashboard/finance">
            <Button type="button" variant="outline" size="icon" className="text-black-500 bg-red-400">
              <X className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        <section className="flex justify-between pb-7">
          <div>
            <Image className="rounded-full" height={100} width={100} alt="Company logo" src={formData.companyLogo} />
          </div>
          <div className="w-[35%]">
            <div>
              <h1 className="font-bold flex justify-end">{formData.companyName}</h1>
            </div>
            <div className="flex justify-end">
              <h1 className="text-[14px]">{formData.companyAddress}</h1>
            </div>
          </div>
        </section>

        <div className="font-bold flex justify-center">
          <h1>Purchase Order</h1>
        </div>

        <section className="flex justify-between">
          <div className="w-[30%]">
            <h1 className="font-bold">{formData.vendorName}</h1>
            <h1 className="text-[14px]">{formData.vendorAddress}</h1>
            <p className="font-bold">
              GSTIN: <span className="font-sans text-[14px]">{formData.vendorGST}</span>
            </p>
          </div>
          <div>
            <div className="flex">
              <label className="font-bold">Order No :</label>
              <h1 className="text-[14px]">{formData.poId}</h1>
            </div>
            <div className="flex">
              <label className="font-bold">Ref :</label>
              <h1 className="text-[14px]">{formData.ref}</h1>
            </div>
            <div className="flex">
              <label className="font-bold">Date :</label>
              <h1 className="text-[14px]">{formData.date}</h1>
            </div>
          </div>
        </section>

        <div className="font-bold mt-10 mb-4">
          <h1>Description: Render Farm</h1>
        </div>

        <section className="flex justify-center">
          <table className="w-full border border-collapse border-gray-300">
            <thead>
              <tr>
                <th className="font-bold p-1 border border-gray-300 text-center">Product Description</th>
                <th className="font-bold p-1 border border-gray-300 text-center">Unit Price in INR</th>
                <th className="font-bold p-1 border border-gray-300 text-center">Qty</th>
                <th className="font-bold p-1 border border-gray-300 text-center">GST</th>
                <th className="font-bold p-1 border border-gray-300 text-center">Taxable Amount INR</th>
                <th className="font-bold p-1 border border-gray-300 text-center">Total Price in INR</th>
              </tr>
            </thead>
            <tbody>
              {formData.products.map((product, index) => (
                <tr key={product.id || index}>
                  <td className="text-[14px] border border-gray-300 p-4">
                    {product.name} (Model No: {product.modelNo})
                  </td>
                  <td className="text-[14px] border border-gray-300 p-4 text-right">{product.price}</td>
                  <td className="text-[14px] border border-gray-300 p-4 text-right">{product.quantity}</td>
                  <td className="text-[14px] border border-gray-300 p-4 text-right">{product.GST}%</td>
                  <td className="text-[14px] border border-gray-300 p-4 text-right">
                    {(parseFloat(product.price) * product.quantity).toFixed(2)}
                  </td>
                  <td className="text-[14px] border border-gray-300 p-4 text-right">
                    {((parseFloat(product.price) * product.quantity) * (1 + (product.GST / 100))).toFixed(2)}
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={5} className="font-bold text-right pr-14 border">Total Amount:</td>
                <td className="text-[14px] border p-2 text-right">
                  {calculateTotalAmount(formData.products).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </section>
        
        <div className="font-bold mt-10 mb-4">
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
              {formData.otherCharges.map((charge, index) => (
                <tr key={charge.id || index}>
                  <td className="text-[14px] border border-gray-300 p-4">{charge.name}</td>
                  <td className="text-[14px] border border-gray-300 p-4 text-right">{charge.price}</td>
                  <td className="text-[14px] border border-gray-300 p-4 text-right">{charge.gst}%</td>
                  <td className="text-[14px] border border-gray-300 p-4 text-right">
                    {(parseFloat(charge.price) * (1 + (charge.gst / 100))).toFixed(2)}
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={3} className="font-bold text-right pr-14 border">Total Amount Including GST:</td>
                <td className="text-[14px] border p-2 text-right">
                  {calculateTotalAmount(formData.otherCharges).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="flex justify-between mt-4">
          <div className="w-1/2">
            <div className="mt-7 mb-3">
              <label className="font-bold">{formData.companyName}</label>
              <Image height={80} width={100} alt="Signature" src="/company/sign.png" />
              <h1 className="text-[14px]">Authorized Signatory</h1>
            </div>
            <div className="mt-7 mb-3">
              <label className="font-bold">Invoice To:</label>
              <h1 className="text-[14px]">{formData.vendorAddress}</h1>
            </div>
            <div className="mb-8">
              <label className="font-bold">Ship To:</label>
              <p className="text-[14px]">{formData.deliveryLocation}</p>
            </div>
          </div>
          <div className="w-1/2 flex flex-col items-end">
            {/* <Image height={150} width={150} alt="Company stamp" src="/company/stamp-transparent-19.png" /> */}
            <div className="mt-4 w-full">
              <label className="font-bold">Remarks:</label>
              <Textarea 
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                className="w-full mt-2"
              />
            </div>
          </div>
        </section>

        <div className="flex justify-center mt-4">
          <Button onClick={onSubmit} className="bg-green-500 text-white mr-4">
            Submit PO
          </Button>
         
        </div>
      </div>
    </div>
  );
};

export default Page;
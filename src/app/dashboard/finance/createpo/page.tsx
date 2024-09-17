"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import html2canvas from 'html2canvas';
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";  

const Page = () => {
  const [formData, setFormData] = useState({
    companyName: "",
    companyGST: "",
    companyAddress: "",
    companyLogo: "/company/logo.png",
    companyId: "",
    poId: "",
    orderNo: "",
    ref: "",
    date: "",
    rfpid:"",
    unitPrice:"",
    vendorName: "",
    vendorAddress: "",
    vendorGST: "",
    deliveryLocation: "",
    products: [],
    remarks: "",
    productQuantity:"",
    productName:"",
    quotationId: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchParams = useSearchParams();
  const rfp = searchParams.get("rfp");
  const USER_ID = typeof window !== 'undefined' ? localStorage.getItem("USER_ID") : null;
  const pageRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch RFP data
        const rfpResponse = await fetch(`/api/rfp?rfpId=${rfp}`);
        if (!rfpResponse.ok) throw new Error("Network response was not ok");
        const rfpData = await rfpResponse.json();
        const rfpDetails = rfpData[0];
         console.log("rfpDetails",rfpDetails);
         
        // Fetch company details
        const companyResponse = await fetch('/api/company');
        if (!companyResponse.ok) throw new Error("Network response was not ok");
        const companyData = await companyResponse.json();
        const company = companyData[0];
        console.log("company",company);
        

        // Fetch PO ID
        const poResponse = await fetch(`/api/po/poId`);
        if (!poResponse.ok) throw new Error("Network response was not ok");
        const poData = await poResponse.json();

        // Update form data
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
          productName: rfpDetails.quotations[0]?.products.name || "",
          productQuantity: rfpDetails.quotations[0]?.products.quantity || "",
          unitPrice: rfpDetails.quotations[0]?.products.price || "",
          rfpid: rfpDetails.id || "",
          vendorAddress: rfpDetails.quotations[0]?.vendor?.address || "",
          vendorGST: rfpDetails.quotations[0]?.vendor?.gstin || "",
          deliveryLocation: rfpDetails.deliveryLocation || "",
          products: rfpDetails.quotations[0]?.products || [],
          remarks: "",
          quotationId: rfpDetails.quotations[0]?.id || ""
        });

      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [rfp]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const onSubmit = async () => {
    console.log("formData", formData);

    const payload = {
      poId: formData.poId,
      quotationId: formData.quotationId,
      userId: USER_ID,
      companyId: formData.companyId,
      rfpId: formData.rfpid,
      remarks: formData.remarks,
      rfpStatus:"PO_CREATED"
    };
    console.log("paylod",payload);
    
    
    try {
      const response = await fetch('/api/po', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const result = await response.json();
      toast({
        title: "🎉 Vendor added successfully.",
        
      });
     
      window.location.reload()
      return router.push("/dashboard");
      // Handle success (e.g., show a success message, redirect, etc.)
    } catch (error) {
      console.error('Error:', error);
      // Handle error (e.g., show an error message)
    }
  };

 


  if (loading) return <div>Loading...</div>;
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
          <div>
            <h1 className="font-bold">{formData.companyName}</h1>
            <p className="text-[14px]">{formData.companyAddress}</p>
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

        {/* <section className="flex justify-center">
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
              {formData.products.map((product, index) => (
                <tr key={index}>
                  <td className="text-[14px] border border-gray-300 p-4">{formData.productName}</td>
                  <td className="text-[14px] border border-gray-300 p-4 text-right">{formData.unitPrice}</td>
                  <td className="text-[14px] border border-gray-300 p-4 text-right">{formData.productQuantity}</td>
                  <td className="text-[14px] border border-gray-300 p-4 text-right">{(product.unitPrice * product.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section> */}

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
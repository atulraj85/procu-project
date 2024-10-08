"use client";

import Loader from "@/components/shared/Loader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { useCurrentUser } from "@/hooks/auth";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

interface Product {
  id: string;
  name: string;
  gst: string;
  modelNo: string;
  price: string;
  quantity: number;
  GST: number;
  description?: string;
}

interface OtherCharge {
  id: string;
  name: string;
  GST: string;
  price: string;
  gst: number;
  description?: string;
}

interface Vendor {
  companyName: string;
  email: string;
  mobile: string;
  address: string;
  gstin: string;
}

interface Quotation {
  id: string;
  refNo: string;
  totalAmount: string;
  totalAmountWithoutGST: string;
  vendor: Vendor;
  products: Product[];
  otherCharges: OtherCharge[];
}

interface RFPDetails {
  rfpId: string;
  requirementType: string;
  dateOfOrdering: string;
  deliveryLocation: string;
  deliveryByDate: string;
  rfpStatus: string;
  preferredQuotationId: string;
  quotations: Quotation[];
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
    quotationId: "",
  });
  const [rfpDetails, setRfpDetails] = useState<RFPDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const searchParams = useSearchParams();
  const rfp = searchParams.get("rfp");
  const currentUser = useCurrentUser();

  const USER_ID = currentUser!.id;
  const pageRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rfpResponse = await fetch(`/api/rfp?rfpId=${rfp}`);
        if (!rfpResponse.ok) throw new Error("Network response was not ok");
        const rfpData = await rfpResponse.json();
        const rfpDetails = rfpData[0];
        setRfpDetails(rfpDetails);

        const companyResponse = await fetch("/api/company");
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
          quotationId: rfpDetails.quotations[0]?.id || "",
        });
      } catch (error) {
        setError(
          error instanceof Error
            ? error
            : new Error("An unknown error occurred")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [rfp]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const onSubmit = async () => {
    if (!formData.remarks.trim()) {
      toast({
        title: "Remarks are required",
        description: "Please add remarks before submitting the PO.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      poId: formData.poId,
      quotationId: formData.quotationId,
      userId: USER_ID,
      companyId: formData.companyId,
      rfpId: formData.rfpid,
      remarks: formData.remarks,
      rfpStatus: "PO_CREATED",
    };

    try {
      const response = await fetch("/api/po", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Network response was not ok");
      else {
        const result = await response.json();
        toast({
          title: "🎉 PO Created successfully.",
        });
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error creating PO",
        description:
          "An error occurred while creating the PO. Please try again.",
        variant: "destructive",
      });
    }
  };

  const calculateTaxableAmount = (item: Product | OtherCharge) => {
    const price =
      typeof item.price === "string"
        ? parseFloat(item.price)
        : Number(item.price);
    return price * ("quantity" in item ? item.quantity : 1);
  };

  const calculateTotalAmount = (item: Product | OtherCharge) => {
    const taxableAmount = calculateTaxableAmount(item);
    const gst =
      typeof item.GST === "number"
        ? item.GST
        : typeof item.gst === "number"
        ? item.gst
        : 0;
    return taxableAmount * (1 + gst / 100);
  };

  const preferredQuotation = rfpDetails?.quotations.find(
    (q) => q.id === rfpDetails.preferredQuotationId
  );

  if (!preferredQuotation) return <div>No preferred quotation found.</div>;

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
        toast({
          title: "Error generating PDF",
          description:
            "An error occurred while generating the PDF. Please try again.",
          variant: "destructive",
        });
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

  if (loading)
    return (
      <div>
        <Loader />{" "}
      </div>
    );
  if (error) return <div>Error: {error.message}</div>;

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
            <Image
              className="rounded-full"
              height={75}
              width={75}
              alt="Company logo"
              src={formData.companyLogo}
            />
            <h1 className="font-bold flex justify-end">
              {formData.companyName}
            </h1>
            <h1 className="text-[14px]">{formData.companyAddress}</h1>
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
              GSTIN:{" "}
              <span className="font-sans text-[14px]">
                {formData.vendorGST}
              </span>
            </p>
          </div>
          <div>
            <div className="flex">
              <label className="font-bold">Order No :</label>
              <h1 className="text-[14px]">{formData.poId}</h1>
            </div>
            <div className="flex">
              <label className="font-bold">Ref :</label>
              <h1 className="text-[14px]">{preferredQuotation.refNo}</h1>
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
        </section> */}

        <div className="font-bold mt-10 mb-4">
          {/* <h1>Preferred Quotation Details</h1> */}
        </div>

        {/* <CardContent> */}
        <div className="p-4">
          {/* <h4 className="font-semibold">Quotation Reference: {preferredQuotation.refNo}</h4>
              <h4 className="font-semibold mt-4">Vendor: {preferredQuotation.vendor.companyName}</h4> */}
          {/* <h4 className="font-semibold mt-4">Products and Other Charges</h4> */}
          <table className="min-w-full border-collapse border border-gray-300 mt-2">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left">Name</th>
                <th className="border border-gray-300 p-2 text-left">
                  Description
                </th>
                <th className="border border-gray-300 p-2 text-left">Qty</th>
                <th className="border border-gray-300 p-2 text-left">
                  Unit Price
                </th>
                <th className="border border-gray-300 p-2 text-left">GST %</th>
                <th className="border border-gray-300 p-2 text-left">
                  Taxable Amt.
                </th>
                <th className="border border-gray-300 p-2 text-left">
                  Total Amt.
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ...preferredQuotation.products,
                ...(Array.isArray(preferredQuotation.otherCharges)
                  ? preferredQuotation.otherCharges
                  : []),
              ].map((item, idx) => (
                <tr key={idx}>
                  <td className="border border-gray-300 p-2">
                    {"modelNo" in item ? item.name : "Other Charge"}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {item.description || "N/A"}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {"quantity" in item ? item.quantity : ""}
                  </td>
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
                  {preferredQuotation.totalAmountWithoutGST}
                </td>
                <td className="border border-gray-300 p-2 font-bold">
                  {preferredQuotation.totalAmount}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        {/* </CardContent> */}

        <section className="flex justify-between mt-4">
          <div className="w-1/2">
            <div className="mt-7 mb-3">
              <label className="font-bold">{formData.companyName}</label>
              <Image
                height={80}
                width={100}
                alt="Signature"
                src="/company/sign.png"
              />
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
            <div className="mt-4 w-full">
              <label className="font-bold">Remarks:</label>
              <Textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                className="w-full mt-2"
                placeholder="Please enter remarks (required)"
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

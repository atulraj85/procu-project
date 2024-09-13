import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import React from "react";

const company = {
  id: "863f6852-7513-4c4e-8fef-c6828d843f1a",
  name: "Tech Innovations Inc.",
  address: {
    zip: "94043",
    city: "Silicon Valley",
    state: "California",
    county: "Santa Clara",
    street: "123 Tech Lane",
    country: "USA",
    district: "Silicon Valley District",
  },
  email: "contact@techinnovations.com",
  phone: "+1-234-567-8901",
  website: "https://www.techinnovations.com",
  industry: "Technology",
  foundedDate: "2020-01-15T00:00:00.000Z",
  status: "active",
  created_at: "2024-10-01T12:00:00.000Z",
  updated_at: "2024-10-01T12:00:00.000Z",
};
const vendor = {
  id: "b5b7988e-c18f-4193-9737-cc35ae3c557c",
  customerCode: "CUST-001",
  primaryName: "Ashutosh Kumar Mishra",
  companyName: "GROWW AND BECONSCIOUS PRIVATE LIMITED",
  contactDisplayName: "Ashutosh Kumar Mishra",
  email: "ashutoshmishra8796@gmail.com",
  workPhone: "9267970511",
  mobile: "9267970511",
  website: "https://www.gennextit.com",
  gstin: "27AAECG8478M1ZT",
  msmeNo: "MSME123456",
  address:
    "GROUND FLOOR, FLAT NO. 001,, DADARKAR ARCADE N L PARELKAR, PAREL VILLAGE, PAREL, Mumbai, Maharashtra, 400012",
  customerState: "UP",
  customerCity: "Ghaziabad",
  country: "India",
  zip: "400012",
  remarks: null,
  pan: "AAECG8478M",
  verifiedById: "9984cfb2-5bb0-4475-9340-f16be26bcb5b",
  created_at: "2024-09-11T08:54:50.009Z",
  updated_at: "2024-09-11T08:54:50.009Z",
  productCategoryId: null,
};
const Page = () => {
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
        <div>
          <label className="font-bold">Company Logo</label>
          <Image height={100} width={100} alt="Company logo" src=""></Image>
        </div>
        <div>
          <div>
            <h1 className="font-bold">{company.name}</h1>
            <p className="text-[14px]">{`${company.address.street},${company.address.city},${company.address.state},${company.address.zip}`}</p>
          </div>
        </div>
      </section>

      {/* Another section for Purchase Order */}
      <div className="font-bold flex justify-center">
        <h1>Purchase Order</h1>
      </div>
      <section className="flex justify-between">
        <div className="w-[30%]">
          {/* <label className="font-bold">GSTN</label> */}
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
            <h1 className="text-[14px]">22/07/2024</h1>
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
            <label className="font-bold">M-Monks Digital Media Pvt Ltd.</label>
            <Image height={100} width={100} alt="Company logo" src=""></Image>
            <h1 className="text-[14px]">Authorized Signatory</h1>
          </div>
          <div className="w-[50%] mt-7 mb-3">
            <label className="font-bold">Invoice To:</label>
            <h1 className="text-[14px]">{vendor.address}</h1>
          </div>
          <div className="mb-8">
            <label className="font-bold">Ship To:</label>
            <h1 className="text-[14px]">{`${company.address.street},${company.address.city},${company.address.state},${company.address.zip}`}</h1>
          </div>
        </div>
      </section>
    </div>
    </div>
  );
};

export default Page;

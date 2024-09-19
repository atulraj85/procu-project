"use client";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { IoIosSearch } from "react-icons/io";

import { validateGstn } from "@/lib/Validation";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { FiLoader } from "react-icons/fi";

6

interface Error {
  gstn: string;
  company: string;
  // pin: string;
  address: string;
  // pan: string;
  email:string;
  phone:string;
}

interface Data {
  email:string;
  phone:string;
}

interface CompanyData {
  company_gstn: string;
  company_name: string;
  // pin_code: string;
  address: string;
  // pan_card: string;
  email:string;
  phone:string;
}

const Company: React.FC = () => {

    
  const [data, setData] = useState<Data>(
    {
      email:"",
      phone:"",

    }
  )

  const [loader, setLoader] = useState<boolean>(false);

  const [companyData, setCompanyData] = useState<CompanyData>({
    company_gstn: "",
    company_name: "",
    // pin_code: "",
    address: "",
    // pan_card: "",
    email:"",
    phone:"",
  });

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const router = useRouter();
  const [errors, setErrors] = useState<Error>({
    gstn: "",
    company: "",
    // pin: "",
    address: "",
    // pan: "",
    email:"",
    phone:"",
  });

  const validateFields = (): boolean => {
    const newErrors = {
      gstn: "",
    company: "",
    // pin: "",
    address: "",
    // pan: "",
    email:"",
    phone:"",
    };
    let isValid = true;

    if (!validateGstn(companyData.company_gstn)) {
      newErrors.gstn = "Invalid GSTN.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChangeVendorDetails = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCompanyData((prevData) => ({ ...prevData, [name]: value }));
  };

  const fetchCompanyDetails = async (GST: string) => {
    try {
      const response1 = await fetch(`/api/company?GST=${GST}`);
      const result1 = await response1.json();
      console.log(result1);

      if (!result1.error) {
        toast({
          title: "Error",
          description: "User already exists.",
        });

        // window.location.reload();
        // return router.push("/dashboard");
      } else {
        const response = await fetch(`/api/vendor/gst/${GST}`);
        const result = await response.json();
        
        console.log(result);
        if (result.flag) {
          const data = result.data;
          setCompanyData({
            ...companyData,
            company_name: data.lgnm || "",
            // pin_code: data.pradr.addr.pncd || "",
            address: data.pradr.adr || "",
            // pan_card: data.gstin.slice(2, 12) || "",
          });
         
        } else {
          toast({
            title: "Failed to fetch conamy details.",
          });
        }
      }
    } catch (error) {
      toast({
        title: "An error occurred while fetching vendor details.",
      });
    }
    setLoader(false);
  };

  const handleSearchGSTN = () => {
    setLoader(true);
    if (validateGstn(companyData.company_gstn)) {
      fetchCompanyDetails(companyData.company_gstn);
    } else {
      toast({
        title: "Invalid GSTN.",
      });
    }
  };

  const onSubmitDetails = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateFields()) {
      toast({
        title: "Please correct the errors in the form.",
      });
      return;
    }

    // Create FormData object
    const formData = new FormData();
    formData.append("GST", companyData.company_gstn);
    formData.append("name", companyData.company_name);
    // formData.append("pincode", companyData.pin_code);
    formData.append("gstAddress", companyData.address);
    // formData.append("pancard", companyData.pan_card);
    formData.append("email", companyData.email);
    formData.append("phone", companyData.phone);

    

    



    try {
        console.log(companyData);
      // Send form data to the API
      const response = await fetch("/api/company", {
        method: "POST",
        body: formData,
      });

      console.log(response);

      if (response.ok) {
        toast({
          title: "Company Created Successfully.",
        });
        setCompanyData({
          company_gstn: "",
          company_name: "",
          // pin_code: "",
          address: "",
          // pan_card: "",
          email:"",
          phone:"",
        });
        router.push("/register/company/admin/register");
      } else {

        
        toast({
          title: "Failed to submit company details.",
        });
      }
    } catch (error:unknown ) {
        // if(error == "Validation")
        const prismaError = error as { code?: string };
        if (prismaError.code === 'P2002') {
          toast({
            title: "User already exists",
          });
        }           
        
      toast({
        title: `An error occurred while submitting the form. ${error}`,
      });
    }
  };

    

  return (
    <div className="h-[90vh]">
    <h1 className="text-center text-4xl font-semibold mt-12">Create Company</h1>
  
    <div className="flex h-[80vh]  items-center gap-16 ">
      <div className="relative flex justify-end">
        <img
          src="/images/pick-pages.png"
          alt="large auth splash image"
          className="w-[80%] rounded-xl"
        />
        <div className="absolute top-[60%] left-[30%]">
          <p className="text-[2.5rem] text-white font-[700]">
            Pr<span className="text-[#03B300]">o</span>cu
          </p>
          <p className="text-white text-[1.25rem] font-[700]">
            We&apos;re here to Increase your{" "}
            <span className="text-white">Productivity</span>
          </p>
        </div>
      </div>
  
      <div>
        <h2 className="container mx-auto p-4 text-2xl font-bold mb-4">Company Details</h2>
        <form
          onSubmit={onSubmitDetails}
          className="flex flex-col gap-7 w-[90%] container mx-auto mt-6"
        >
          {/* GSTN and Company Name in one row */}
          <div className="flex gap-4">
            <div className="flex flex-col gap-3 w-60 text-base relative">
              <label className="font-bold">GSTN</label>
              <Input
                type="text"
                name="company_gstn"
                value={companyData.company_gstn}
                onChange={handleChangeVendorDetails}
                placeholder="GSTN"
                className="p-2"
              />
              <button
                type="button"
                onClick={handleSearchGSTN}
                className="absolute right-0 top-14 transform -translate-y-1/2 px-1 py-1 rounded"
              >
              {loader ? <FiLoader /> :  <IoIosSearch />}
              </button>
              {errors.gstn && <p className="text-red-500">{errors.gstn}</p>}
            </div>
  
            <div className="flex flex-col gap-3 w-60 text-base">
              <label className="font-bold">Company Name</label>
              <Input
                disabled
                type="text"
                name="company_name"
                value={companyData.company_name}
                placeholder="Company Name"
                className="p-2"
              />
              {errors.company && <p className="text-red-500">{errors.company}</p>}
            </div>
          </div>
  
          {/* PAN Card and Address in one row */}
          <div className="flex gap-8">
           
  
            <div className="flex flex-col gap-3 w-60 text-base">
              <label className="font-bold">Address</label>
              <Input
                disabled
                type="text"
                name="address"
                value={companyData.address}
                placeholder="Address"
                className="p-2"
              />
              {errors.address && <p className="text-red-500">{errors.address}</p>}
            </div>

            <div className="flex flex-col gap-3 w-60 text-base">
              <label className="font-bold">Emial</label>
              <Input
                
                type="email"
                name="email"
                value={companyData.email}
                placeholder="email"
                className="p-2"
                onChange={handleChangeVendorDetails}
              />
              {errors.email && <p className="text-red-500">{errors.email}</p>}
            </div>
            </div>

            <div className="flex gap-8">

            <div className="flex flex-col gap-3 w-60 text-base">
              <label className="font-bold">Phone</label>
              <Input
                
                type="phone"
                name="phone"
                value={companyData.phone}
                placeholder="Phone"
                className="p-2"
                onChange={handleChangeVendorDetails}
              />
              {errors.email && <p className="text-red-500">{errors.email}</p>}
            </div>

            <div className="flex gap-4">
            <button
              type="submit"
              className="bg-primary text-white mt-8 py-2 px-4 rounded"
            >
              {isEditing ? "Update Vendor" : "Register"}
            </button>
          </div>
            </div>

           
          
          
  
          {/* Pin Code */}
          <div className="flex gap-8">
            {/* <div className="flex flex-col gap-3 w-60 text-base">
              <label className="font-bold">Pin Code</label>
              <Input
                disabled
                type="text"
                name="pin_code"
                value={companyData.pin_code}
                placeholder="Pin Code"
                className="p-2"
              />
              {errors.pin && <p className="text-red-500">{errors.pin}</p>}
            </div> */}
          
  
          {/* Submit Button */}
          {/* <div className="flex gap-4">
            <button
              type="submit"
              className="bg-primary text-white mt-8 py-2 px-4 rounded"
            >
              {isEditing ? "Update Vendor" : "Register"}
            </button>
          </div> */}
          </div>
        </form>
      </div>
    </div>
  </div>
  
  );
};

export default Company;

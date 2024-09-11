"use client";
import React, { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { IoIosSearch } from "react-icons/io";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Select from "react-select"; // Import react-select

interface VendorData {
  id: string;
  primaryName: string;
  vendor_gstn: string;
  company_name: string;
  contact_no: string;
  state: string;
  pin_code: string;
  person_name: string;
  email: string;
  website: string;
  city: string;
  address: string;
  pan_card: string;
}

interface Errors {
  gstn: string;
  company: string;
  contact: string;
  state: string;
  pin: string;
  person: string;
  email: string;
  website: string;
  city: string;
  address: string;
  pan: string;
}

const VendorDetails: React.FC = () => {
  const [vendorArray, setVendorArray] = useState<VendorData[]>([]);
  const [vendorData, setVendorData] = useState<VendorData>({
    id:"",
    primaryName: "",
    vendor_gstn: "",
    company_name: "",
    contact_no: "",
    state: "",
    pin_code: "",
    person_name: "",
    email: "",
    website: "",
    city: "",
    address: "",
    pan_card: "",
  });
  const searchParams = useSearchParams();
  const gstin1: string | null = searchParams.get('gstin');

  const [errors, setErrors] = useState<Errors>({
    gstn: "",
    company: "",
    contact: "",
    state: "",
    pin: "",
    person: "",
    email: "",
    website: "",
    city: "",
    address: "",
    pan: "",
  });

  const [states, setStates] = useState<{ value: string; label: string }[]>([]);
  const router = useRouter()

  const validateFields = (): boolean => {
    const newErrors: Errors = {
      gstn: "",
      company: "",
      contact: "",
      state: "",
      pin: "",
      person: "",
      email: "",
      website: "",
      city: "",
      address: "",
      pan: "",
    };
    let isValid = true;

    if (vendorData.vendor_gstn === "") {
      newErrors.gstn = "GSTN is required.";
      isValid = false;
    }
    if (vendorData.company_name === "") {
      newErrors.company = "Company Name is required.";
      isValid = false;
    }
    if (vendorData.contact_no === "") {
      newErrors.contact = "Contact No is required.";
      isValid = false;
    }
    if (vendorData.state === "") {
      newErrors.state = "State is required.";
      isValid = false;
    }
    if (vendorData.pin_code === "") {
      newErrors.pin = "Pin Code is required.";
      isValid = false;
    }
    if (vendorData.person_name === "") {
      newErrors.person = "Person Name is required.";
      isValid = false;
    }
    if (vendorData.email === "") {
      newErrors.email = "Email is required.";
      isValid = false;
    }
    if (vendorData.website === "") {
      newErrors.website = "Website is required.";
      isValid = false;
    }
    if (vendorData.city === "") {
      newErrors.city = "City is required.";
      isValid = false;
    }
    if (vendorData.address === "") {
      newErrors.address = "Address is required.";
      isValid = false;
    }
    if (vendorData.pan_card === "") {
      newErrors.pan = "PAN Card is required.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const fetchVendorDetails = async (gstn: string) => {
    try {
      const response = await fetch(`/api/vendor?gstin=${encodeURIComponent(gstn)}`);
      const result: VendorData[] = await response.json();
      
      if (result && result.length > 0) {
        const data = result[0]; // Assuming the response is an array and we take the first item
        
        setVendorData({
          ...data,
          id: data.id || "",
          primaryName: data.primaryName || "",
          vendor_gstn: data.gstin || "",
          company_name: data.companyName || "",
          contact_no: data.workPhone || "",
          state: data.customerState || "",
          pin_code: data.zip || "", // Assuming zip is the pin code
          address: data.address || "",
          city: data.customerCity || "",
          pan_card: data.pan || "",
          person_name: data.contactDisplayName || "",
          email: data.email || "",
          website: data.website || "",
        });
      } else {
        toast.error("No vendor details found.");
      }
    } catch (error) {
      toast.error("An error occurred while fetching vendor details.");
    }
  };

  const fetchStates = async () => {
    try {
      const response = await fetch('/api/address/states/IN');
      const result = await response.json();
      const formattedStates = result.map((state: { code: string; name: string }) => ({
        value: state.code,
        label: state.name,
      }));
      setStates(formattedStates);
    } catch (error) {
      toast.error("An error occurred while fetching states.");
    }
  };

  useEffect(() => {
    if (gstin1) {
      fetchVendorDetails(gstin1);
    }
    fetchStates(); // Fetch states on component mount
  }, [gstin1]); // Fetch vendor details when gstin1 changes

  const handleChangeVendorDetails = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setVendorData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleStateChange = (selectedOption: { value: string; label: string } | null) => {
    setVendorData((prevData) => ({ ...prevData, state: selectedOption ? selectedOption.value : "" }));
  };

  const onSubmitVendorDetails = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("inside submite");
    

    if (!validateFields()) {
      toast.error("Please correct the errors in the form.");
      return;
    }

    const newVendor = {
      customerCode: "CUST-001",
      primaryName: vendorData.person_name,
      companyName: vendorData.company_name,
      contactDisplayName: vendorData.person_name,
      email: vendorData.email,
      workPhone: vendorData.contact_no,
      mobile: vendorData.contact_no,
      website: vendorData.website,
      gstin: vendorData.vendor_gstn,
      msmeNo: "MSME123456",
      address: vendorData.address,
      zip: vendorData.pin_code,
      customerState: vendorData.state,
      customerCity: vendorData.city,
      country: "India",
      pan: vendorData.pan_card,
    };
    
    
 console.log("new",newVendor);
 
    try {
      const response = await fetch(`/api/vendor?id=${vendorData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newVendor),
      });
      const result = await response.json();

      if (result.success) {
        setVendorArray((prevData) => [...prevData, result.vendor]);
        toast.success("Vendor updated successfully.");
        return router.push('/dashboard');
      } else {
        toast.error(result.message || "Failed to update vendor.");
        return router.push('/dashboard'); 
      }
    } catch (error) {
      toast.error("An error occurred while updating the vendor.");
    }
  };

  return (
    <div className="p-5">
      <div className="flex justify-end pb-8">
        <Link href="/dashboard"><Button>Cancel</Button></Link>
      </div>
      <form onSubmit={onSubmitVendorDetails} className="flex flex-wrap w-full gap-7">
        <div className="flex flex-col gap-3 w-60 text-base relative">
          <label className="font-bold">GSTN</label>
          <Input
            type="text"
            name="vendor_gstn"
            value={vendorData.vendor_gstn}
            // onChange={handleChangeVendorDetails}
            placeholder="GSTN"
            className="p-2"
          />
          <button
            type="button"
            onClick={() => fetchVendorDetails(vendorData.vendor_gstn)}
            className="absolute right-0 top-14 transform -translate-y-1/2 px-1 py-1 rounded"
          >
            <IoIosSearch />
          </button>
          {errors.gstn && <p className="text-red-500">{errors.gstn}</p>}
        </div>

        <div className="flex flex-col gap-3 w-60 text-base">
          <label className="font-bold">Company Name</label>
          <Input
            type="text"
            name="company_name"
            value={vendorData.company_name}
            // onChange={handleChangeVendorDetails}
            placeholder="Company Name"
            className="p-2"
          />
          {errors.company && <p className="text-red-500">{errors.company}</p>}
        </div>

        <div className="flex flex-col gap-3 w-60 text-base">
          <label className="font-bold">PAN Card</label>
          <Input
            type="text"
            name="pan_card"
            value={vendorData.pan_card}
            // onChange={handleChangeVendorDetails}
            placeholder="PAN Card"
            className="p-2"
          />
          {errors.pan && <p className="text-red-500">{errors.pan}</p>}
        </div>

        <div className="flex flex-col gap-3 w-60 text-base">
          <label className="font-bold">Address</label>
          <Input
            type="text"
            name="address"
            value={vendorData.address}
            onChange={handleChangeVendorDetails}
            placeholder="Address"
            className="p-2"
          />
          {errors.address && <p className="text-red-500">{errors.address}</p>}
        </div>

        <div className="flex flex-col gap-3 w-60 text-base">
          <label className="font-bold">Pin Code</label>
          <Input
            type="text"
            name="pin_code"
            value={vendorData.pin_code}
            onChange={handleChangeVendorDetails}
            placeholder="Pin Code"
            className="p-2"
          />
          {errors.pin && <p className="text-red-500">{errors.pin}</p>}
        </div>

        <div className="flex flex-col gap-3 w-60 text-base">
          <label className="font-bold">Person Name</label>
          <Input
            type="text"
            name="person_name"
            value={vendorData.person_name}
            onChange={handleChangeVendorDetails}
            placeholder="Person Name"
            className="p-2"
          />
          {errors.person && <p className="text-red-500">{errors.person}</p>}
        </div>

        <div className="flex flex-col gap-3 w-60 text-base">
          <label className="font-bold">Contact No</label>
          <Input
            type="text"
            name="contact_no"
            value={vendorData.contact_no}
            onChange={handleChangeVendorDetails}
            placeholder="Contact No"
            className="p-2"
          />
          {errors.contact && <p className="text-red-500">{errors.contact}</p>}
        </div>

        <div className="flex flex-col gap-3 w-60 text-base">
          <label className="font-bold">Email</label>
          <Input
            type="text"
            name="email"
            value={vendorData.email}
            onChange={handleChangeVendorDetails}
            placeholder="Email"
            className="p-2"
          />
          {errors.email && <p className="text-red-500">{errors.email}</p>}
        </div>

        <div className="flex flex-col gap-3 w-60 text-base">
          <label className="font-bold">Website</label>
          <Input
            type="text"
            name="website"
            value={vendorData.website}
            onChange={handleChangeVendorDetails}
            placeholder="Website"
            className="p-2"
          />
          {errors.website && <p className="text-red-500">{errors.website}</p>}
        </div>

        <div className="flex flex-col gap-3 w-60 text-base">
          <label className="font-bold">State</label>
          <Select
  options={states}
  value={states.find(state => state.value === vendorData.state) || null} // This will set the selected state
  onChange={handleStateChange}
  placeholder="Select State"
  className="basic-single"
  classNamePrefix="select"
/>

          {errors.state && <p className="text-red-500">{errors.state}</p>}
        </div>

        <div className="flex flex-col gap-3 w-60 text-base">
          <label className="font-bold">City</label>
          <Input
            type="text"
            name="city"
            value={vendorData.city}
            onChange={handleChangeVendorDetails}
            placeholder="City"
            className="p-2"
          />
          {errors.city && <p className="text-red-500">{errors.city}</p>}
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-primary text-white mt-8 py-2 px-4 rounded"
          >
            Update Vendor
          </button>
        </div>
      </form>
    </div>
  );
};

export default VendorDetails;

import React, { ChangeEvent, useState } from "react";
import { toast } from "react-toastify";
import {
  validateEmail,
  validateIndianPhoneNumber,
  validatePinCode,
  validateGstn,
  validatePanCard,
} from "@/lib/Validation";

const states = [
  { value: '', label: 'Select State' },
  { value: 'state1', label: 'State 1' },
  { value: 'state2', label: 'State 2' },
  // Add more states as needed
];

interface VendorData {
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

const VendorDetails: React.FC = () => {
  const [vendorArray, setVendorArray] = useState<VendorData[]>([]);
  const [vendorData, setVendorData] = useState<VendorData>({
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

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [errors, setErrors] = useState({
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

  const validateFields = (): boolean => {
    const newErrors = {
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

    if (vendorData.vendor_gstn.trim() === "" || !validateGstn(vendorData.vendor_gstn).isValid) {
      newErrors.gstn = "Invalid GST Number.";
      isValid = false;
    }

    if (vendorData.company_name.trim() === "") {
      newErrors.company = "Company name is required.";
      isValid = false;
    }

    if (!validateIndianPhoneNumber(vendorData.contact_no).isValid) {
      newErrors.contact = "Invalid contact number.";
      isValid = false;
    }

    if (vendorData.state === "") {
      newErrors.state = "State is required.";
      isValid = false;
    }

    if (vendorData.pin_code.trim() === "" || !validatePinCode(vendorData.pin_code).isValid) {
      newErrors.pin = "Invalid pin code.";
      isValid = false;
    }

    if (vendorData.person_name.trim() === "") {
      newErrors.person = "Person name is required.";
      isValid = false;
    }

    if (!validateEmail(vendorData.email).isValid) {
      newErrors.email = "Invalid email address.";
      isValid = false;
    }

    if (vendorData.website.trim() !== "" && !/^(https?:\/\/)?[\w-]+(\.[\w-]+)+[/#?]?.*$/.test(vendorData.website)) {
      newErrors.website = "Invalid website URL.";
      isValid = false;
    }

    if (vendorData.city.trim() === "") {
      newErrors.city = "City is required.";
      isValid = false;
    }

    if (vendorData.address.trim() === "") {
      newErrors.address = "Address is required.";
      isValid = false;
    }

    // if (vendorData.pan_card.trim() === "" || !validatePanCard(vendorData.pan_card).isValid) {
    //   newErrors.pan = "Invalid PAN card.";
    //   isValid = false;
    // }

    setErrors(newErrors);
    return isValid;
  };

  const handleChangeVendorDetails = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setVendorData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFetchOrAddVendor = async () => {
    if (vendorData.vendor_gstn.trim() === "") {
      toast.error("Please enter a GST Number.");
      return;
    }
console.log(vendorData);

    try {
      const response = await fetch(`/api/vendor/gst/${vendorData.vendor_gstn}`); // Ensure this endpoint is correct
      if (response.ok) {
        const data: VendorData = await response.json();
        if (data.vendor_gstn) {
          setVendorData(data);
          console.log(data);
          
          toast.success("Vendor data fetched successfully");
        } else {
          toast.info("GST Number not found. Please fill in the details manually.");
          // Allow user to fill details manually
        }
      } else {
        toast.error("Failed to fetch vendor data");
      }
    } catch (error) {
      toast.error("Error fetching vendor data");
    }
  };

  const onSubmitVendorDetails = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateFields()) {
      toast.error("Please correct the errors in the form.");
      return;
    }

    const existingVendor = vendorArray.find(
      (vendor) =>
        vendor.email === vendorData.email ||
        vendor.contact_no === vendorData.contact_no
    );

    if (!isEditing && existingVendor) {
      toast.error(
        `${vendorData.email} or ${vendorData.contact_no} is already present.`
      );
      return;
    }

    if (isEditing && editIndex !== null) {
      const updatedVendors = [...vendorArray];
      updatedVendors[editIndex] = vendorData;
      setVendorArray(updatedVendors);
      toast.success("Vendor Details Updated");
    } else {
      setVendorArray((prevData) => [...prevData, vendorData]);
      toast.success("New Vendor Added");
    }

    // Reset form
    setVendorData({
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
    setErrors({
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
    setIsEditing(false);
    setEditIndex(null);
  };

  const handleRemoveVendor = (email: string) => {
    setVendorArray((prevData) =>
      prevData.filter((data) => data.email !== email)
    );
  };

  const handleEditVendor = (index: number) => {
    setVendorData(vendorArray[index]);
    setIsEditing(true);
    setEditIndex(index);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditIndex(null);
    setVendorData({
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
    setErrors({
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
  };

  return (
    <div className="p-5">
      <form onSubmit={onSubmitVendorDetails} className="flex flex-wrap gap-7">
        <div className="relative flex flex-col gap-3 w-60 text-base">
          <label htmlFor="vendor_gstn">Vendor GSTN</label>
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 4a7 7 0 011 13.9V21h2v-3.1A7 7 0 1111 4z"
              />
            </svg>
          </div>
          <input
            type="text"
            name="vendor_gstn"
            value={vendorData.vendor_gstn}
            onChange={handleChangeVendorDetails}
            className={`pl-10 outline-none border-b-2 ${
              errors.gstn ? "border-red-600" : "border-gray-600"
            }`}
            required
          />
          {errors.gstn && <p className="text-red-600 text-sm">{errors.gstn}</p>}
        </div>
        {/* Other fields here... */}
        <div className="flex items-end justify-center space-x-3 text-base">
          <button
            type="submit"
            className="bg-blue-700 hover:bg-blue-400 py-2 px-4 text-white rounded-md"
          >
            {isEditing ? "Update Vendor" : "Add Vendor"}
          </button>
          {isEditing && (
            <button
              type="button"
              className="bg-gray-300 hover:bg-gray-400 py-2 px-4 text-black rounded-md"
              onClick={handleCancelEdit}
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            className="bg-green-700 hover:bg-green-400 py-2 px-4 text-white rounded-md"
            onClick={handleFetchOrAddVendor}
          >
            Fetch or Add Vendor
          </button>
        </div>
      </form>

      <div className="mt-8">
        {vendorArray.length > 0 && (
          <table className="w-full border-collapse border border-gray-300 text-left">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2">GSTN</th>
                <th className="border border-gray-300 p-2">Company Name</th>
                <th className="border border-gray-300 p-2">Contact No</th>
                <th className="border border-gray-300 p-2">State</th>
                <th className="border border-gray-300 p-2">Pin Code</th>
                <th className="border border-gray-300 p-2">Person Name</th>
                <th className="border border-gray-300 p-2">Email</th>
                <th className="border border-gray-300 p-2">Website</th>
                <th className="border border-gray-300 p-2">City</th>
                <th className="border border-gray-300 p-2">Address</th>
                <th className="border border-gray-300 p-2">PAN Card</th>
                <th className="border border-gray-300 p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendorArray.map((data, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 p-2">{data.vendor_gstn}</td>
                  <td className="border border-gray-300 p-2">{data.company_name}</td>
                  <td className="border border-gray-300 p-2">{data.contact_no}</td>
                  <td className="border border-gray-300 p-2">{data.state}</td>
                  <td className="border border-gray-300 p-2">{data.pin_code}</td>
                  <td className="border border-gray-300 p-2">{data.person_name}</td>
                  <td className="border border-gray-300 p-2">{data.email}</td>
                  <td className="border border-gray-300 p-2">{data.website}</td>
                  <td className="border border-gray-300 p-2">{data.city}</td>
                  <td className="border border-gray-300 p-2">{data.address}</td>
                  <td className="border border-gray-300 p-2">{data.pan_card}</td>
                  <td className="border border-gray-300 p-2 flex items-center justify-center space-x-4">
                    <button
                      className="border py-1 px-4 text-blue-600 text-sm cursor-pointer"
                      onClick={() => handleEditVendor(index)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                        <path d="m15 5 4 4" />
                      </svg>
                    </button>
                    <button
                      className="border py-1 px-4 text-red-900 text-sm cursor-pointer"
                      onClick={() => handleRemoveVendor(data.email)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18" />
                        <path d="M8 6v12" />
                        <path d="M16 6v12" />
                        <path d="M5 6v2h14V6H5z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default VendorDetails;

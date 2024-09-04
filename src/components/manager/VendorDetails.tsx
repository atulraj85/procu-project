"use client";
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import PDFuploader from "../shared/PDFuploader";

interface VendorData {
  vendor_name: string;
  vendor_email: string;
  vendor_number: string;
  gst_number: string;
  file: File | null;
}

interface VendorAPIResponse {
  id: string;
  primaryName: string;
  companyName: string;
  contactDisplayName: string;
  email: string;
  workPhone: string;
  gstin: string;
}

const VendorDetails: React.FC = () => {
  const [vendorArray, setVendorArray] = useState<VendorData[]>([]);
  const [vendorData, setVendorData] = useState<VendorData>({
    vendor_name: "",
    vendor_email: "",
    vendor_number: "",
    gst_number: "",
    file: null,
  });

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [openDialogBox, setOpenDialogBox] = useState<boolean>(false);
  const [vendorToDelete, setVendorToDelete] = useState<string | null>(null);
  const [radioIndex, setRadioIndex] = useState<number>(-1);
  const [errors, setErrors] = useState({
    vendor_name: "",
    vendor_email: "",
    vendor_number: "",
    gst_number: "",
  });
  const [gstSuggestions, setGstSuggestions] = useState<VendorAPIResponse[]>([]);
  const [selectedGst, setSelectedGst] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/ajax/vendors")
      .then((response) => response.json())
      .then((data) => {
        const fetchedVendors = data.map((item: any) => ({
          vendor_name: item.vendor_name,
          vendor_email: item.vendor_email,
          vendor_number: item.vendor_number,
          gst_number: item.gst_number,
          file: null,
        }));
        setVendorArray(fetchedVendors);
      })
      .catch((error) => {
        toast.error("Failed to fetch vendor data");
      });
  }, []);

  const validateFields = (): boolean => {
    const newErrors = {
      vendor_name: "",
      vendor_email: "",
      vendor_number: "",
      gst_number: "",
    };
    let isValid = true;

    if (!validateVendorName(vendorData.vendor_name)) {
      newErrors.vendor_name = "Vendor name is required.";
      isValid = false;
    }

    if (!validateVendorEmail(vendorData.vendor_email)) {
      newErrors.vendor_email = "Valid email is required.";
      isValid = false;
    }

    if (!validateVendorNumber(vendorData.vendor_number)) {
      newErrors.vendor_number = "Vendor phone number is required.";
      isValid = false;
    }

    if (!validateGSTNumber(vendorData.gst_number)) {
      newErrors.gst_number = "Valid GST number is required.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const validateVendorName = (value: string) => value.trim() !== "";
  const validateVendorEmail = (value: string) => /\S+@\S+\.\S+/.test(value);
  const validateVendorNumber = (value: string) => value.trim() !== "";
  const validateGSTNumber = (value: string) => value.trim() !== "";

  const fetchVendorSuggestions = (gstNumber: string) => {
    console.log(gstNumber);
    
    fetch(`/api/ajax/vendors?q=${gstNumber}`)
      .then((response) => response.json())
      .then((data: VendorAPIResponse[]) => {
        setGstSuggestions(data);
        console.log(data);
        
      })
      .catch((error) => {
        toast.error("Failed to fetch vendor suggestions");
      });
  };

  const handleChangeVendorDetails = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVendorData((prevData) => ({ ...prevData, [name]: value }));

    if (name === "gst_number" && value.trim().length >= 2) {
      fetchVendorSuggestions(value.trim());
    }
  };

  const handleGstSuggestionClick = (gst: VendorAPIResponse) => {
    setVendorData({
      vendor_name: gst.primaryName,
      vendor_email: gst.email,
      vendor_number: gst.mobile,
      gst_number: gst.gstin,
      file: null,
    });
    setGstSuggestions([]);
    setSelectedGst(gst.gstin);
  };

  const onSubmitVendorDetails = (e: FormEvent) => {
    e.preventDefault();

    if (!validateFields()) {
      toast.error("Please correct the errors in the form.");
      return;
    }

    const vd = vendorArray.find(
      (vendor) =>
        vendor.vendor_email === vendorData.vendor_email ||
        vendor.vendor_number === vendorData.vendor_number ||
        vendor.gst_number === vendorData.gst_number
    );

    if (isEditing && editIndex !== null) {
      const updatedVendors = [...vendorArray];
      updatedVendors[editIndex] = vendorData;
      setVendorArray(updatedVendors);
      setIsEditing(false);
      setEditIndex(null);
      toast.success("Vendor Details Updated");
    } else if (!vd) {
      setVendorArray((prevData) => [...prevData, vendorData]);
      toast.success("New Vendor Added");
    } else {
      toast.error("Vendor already exists");
    }

    // Reset form fields
    setVendorData({
      vendor_name: "",
      vendor_email: "",
      vendor_number: "",
      gst_number: "",
      file: null,
    });
    setErrors({
      vendor_name: "",
      vendor_email: "",
      vendor_number: "",
      gst_number: "",
    });
    setGstSuggestions([]);
  };

  const handleConfirmDelete = () => {
    setVendorArray((prevData) =>
      prevData.filter((data) => data.vendor_email !== vendorToDelete)
    );

    setOpenDialogBox(false);
    setVendorToDelete(null);
    toast.success("Delete Vendor Details Successfully!");
  };

  const handleRemoveVendor = (email: string) => {
    setOpenDialogBox(true);
    setVendorToDelete(email);
  };

  const handleEditVendor = (index: number) => {
    setVendorData(vendorArray[index]);
    setIsEditing(true);
    setEditIndex(index);
  };

  const handleRadioChange = (index: number) => {
    setRadioIndex(index);
    toast.success(`${vendorArray[index].vendor_email} marked for preference.`);
  };

  const handleFileUpload = (index: number, file: File | null) => {
    const updatedVendors = [...vendorArray];
    updatedVendors[index].file = file;
    setVendorArray(updatedVendors);
  };

  return (
    <div className="text-gray-800 text-xl p-5">
      <form onSubmit={onSubmitVendorDetails} className="flex flex-wrap gap-5">
      <div className="flex flex-col gap-3 w-72 text-base relative">
          <label htmlFor="gst_number">GST Number</label>
          <div className="relative">
            <input
              type="text"
              name="gst_number"
              value={vendorData.gst_number}
              onChange={handleChangeVendorDetails}
              className={`outline-none border-b-2 ${errors.gst_number ? "border-red-600" : "border-gray-600"} pr-10`}
            />
            <svg
              className="absolute right-2 top-0 h-6 w-10 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M16.65 11A4.65 4.65 0 0112 15a4.65 4.65 0 01-4.65-4.65A4.65 4.65 0 0112 6.7a4.65 4.65 0 014.65 4.65z"
              />
            </svg>
          </div>
          {errors.gst_number && <p className="text-red-600 text-sm">{errors.gst_number}</p>}
          {gstSuggestions.length > 0 && (
            <ul className="absolute bg-white border border-gray-300 mt-1 w-full max-h-60 overflow-auto z-10">
              {gstSuggestions.map((gst) => (
                <li
                  key={gst.gstin}
                  onClick={() => handleGstSuggestionClick(gst)}
                  className="p-2 cursor-pointer hover:bg-gray-200"
                >
                  {gst.primaryName} - {gst.gstin}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex flex-col gap-3 w-72 text-base">
          <label htmlFor="vendor_name">Vendor Name</label>
          <input
            type="text"
            name="vendor_name"
            value={vendorData.vendor_name}
            onChange={handleChangeVendorDetails}
            className={`outline-none border-b-2 ${errors.vendor_name ? "border-red-600" : "border-gray-600"}`}
          />
          {errors.vendor_name && <p className="text-red-600 text-sm">{errors.vendor_name}</p>}
        </div>
        <div className="flex flex-col gap-3 w-72 text-base">
          <label htmlFor="vendor_email">Vendor Email</label>
          <input
            type="email"
            name="vendor_email"
            value={vendorData.vendor_email}
            onChange={handleChangeVendorDetails}
            className={`outline-none border-b-2 ${errors.vendor_email ? "border-red-600" : "border-gray-600"}`}
          />
          {errors.vendor_email && <p className="text-red-600 text-sm">{errors.vendor_email}</p>}
        </div>
        <div className="flex flex-col gap-3 w-72 text-base">
          <label htmlFor="vendor_number">Vendor Phone</label>
          <input
            type="text"
            name="vendor_number"
            value={vendorData.vendor_number}
            onChange={handleChangeVendorDetails}
            className={`outline-none border-b-2 ${errors.vendor_number ? "border-red-600" : "border-gray-600"}`}
          />
          {errors.vendor_number && <p className="text-red-600 text-sm">{errors.vendor_number}</p>}
        </div>
       

        <div className="flex items-end justify-center space-x-3 text-base">
          <button
            type="submit"
            className="bg-blue-700 hover:bg-blue-400 py-2 px-2 text-white rounded-md"
          >
            {isEditing ? "Update Vendor" : "Add Vendor"}
          </button>
        </div>
      </form>

      <div className="w-full py-2 my-5">
        {vendorArray.length !== 0 && (
          <table className="w-full border-collapse text-[13px] border border-gray-300 text-left">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2"></th>
                <th className="border border-gray-300 p-2">Vendor Name</th>
                <th className="border border-gray-300 p-2">Vendor Email</th>
                <th className="border border-gray-300 p-2">Vendor Phone</th>
                <th className="border border-gray-300 p-2">GST Number</th>
                <th className="border border-gray-300 p-2">File</th>
                <th className="border border-gray-300 p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendorArray.map((vendor, index) => (
                <tr key={vendor.vendor_email}>
                  <td className="border border-gray-300 p-2">
                    <input
                      type="radio"
                      checked={radioIndex === index}
                      onChange={() => handleRadioChange(index)}
                    />
                  </td>
                  <td className="border border-gray-300 p-2">{vendor.vendor_name}</td>
                  <td className="border border-gray-300 p-2">{vendor.vendor_email}</td>
                  <td className="border border-gray-300 p-2">{vendor.vendor_number}</td>
                  <td className="border border-gray-300 p-2">{vendor.gst_number}</td>
                  <td className="border border-gray-300 p-2">
                    <PDFuploader
                      index={index}
                      onFileUpload={handleFileUpload}
                    />
                  </td>
                  <td className="border border-gray-300 p-2">
                    <button
                      onClick={() => handleEditVendor(index)}
                      className=" text-green-800 px-2 py-1 rounded mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleRemoveVendor(vendor.vendor_email)}
                      className=" text-red-500 px-2 py-1 rounded"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {openDialogBox && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-5 rounded shadow-lg">
            <p>Are you sure you want to delete this vendor?</p>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setOpenDialogBox(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDetails;

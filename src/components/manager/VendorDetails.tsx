"use client";
import React, { ChangeEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import PDFuploader from "../shared/PDFuploader";

interface VendorData {
  vendor_name: string;
  vendor_email: string;
  vendor_number: string;
  file: File | null;
}

const VendorDetails: React.FC = () => {
  const [vendorArray, setVendorArray] = useState<VendorData[]>([]);
  const [vendorData, setVendorData] = useState<VendorData>({
    vendor_name: "",
    vendor_email: "",
    vendor_number: "",
    file: null,
  });

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [openDialogBox, setOpenDailogBox] = useState<boolean>(false);
  const [vendorToDelete, setVendorToDelete] = useState<string | null>(null);
  const [radioIndex, setRadioIndex] = useState<number>(-1);

  const handleChangeVendorDetails = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVendorData((prevData) => ({ ...prevData, [name]: value }));
  };

  const onSubmitVendorDetails = (e: any) => {
    e.preventDefault();

    if (vendorData.vendor_name == "") {
      toast.error("Name field is Empty.");
      return;
    }
    if (vendorData.vendor_email == "") {
      toast.error("Email field is Empty.");
      return;
    }
    if (vendorData.vendor_number == "") {
      toast.error("Phone Number is Empty");
      return;
    }

    if (isEditing && editIndex !== null) {
      const updatedVendors = [...vendorArray];
      updatedVendors[editIndex] = vendorData;
      setVendorArray(updatedVendors);
      setIsEditing(false);
      setEditIndex(null);
      toast.success("Vendor Details Updated");
    } else {
      setVendorArray((prevData) => [...prevData, vendorData]);
      toast.success("New Vendor Added");
    }

    setVendorData({
      vendor_name: "",
      vendor_email: "",
      vendor_number: "",
      file: null,
    });
  };

  const handleConfirmDelete = () => {
    setVendorArray((prevData) =>
      prevData.filter((data) => data.vendor_email !== vendorToDelete)
    );

    setOpenDailogBox(false);
    setVendorToDelete(null);
    toast.success("Delete Vendor Details Successfully!");
  };

  const handleRemoveVendor = (email: string) => {
    setOpenDailogBox(true);
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

  useEffect(() => {}, [vendorData]);

  const handleFileUpload = (index: number, file: File | null) => {
    const updatedVendors = [...vendorArray];
    updatedVendors[index].file = file;
    setVendorArray(updatedVendors);
  };

  return (
    <div className="">
      {openDialogBox && (
        <>
          <div className="fixed inset-0 bg-black opacity-50 z-20 pointer-events-none"></div>
          <div className="fixed inset-0 flex items-center justify-center z-30">
            <div className="bg-white p-6 rounded shadow-md text-center">
              <div className="mb-4">
                Are you sure you want to delete this vendor's details?
              </div>
              <div className="flex justify-center space-x-4">
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500"
                  onClick={() => {
                    handleConfirmDelete();
                    setOpenDailogBox(false);
                  }}
                >
                  Yes
                </button>
                <button
                  className="bg-red-400 text-white px-4 py-2 rounded hover:bg-red-300"
                  onClick={() => setOpenDailogBox(false)}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      <div className="text-gray-800 text-xl mt-5">
        <div className="flex space-x-4">
          <div className="flex flex-col gap-3 w-72 text-base">
            <label htmlFor="name">Vendor Name</label>
            <input
              type="text"
              name="vendor_name"
              value={vendorData.vendor_name}
              onChange={handleChangeVendorDetails}
              className="outline-none border-b-2 border-gray-600"
            />
          </div>
          <div className="flex flex-col gap-3 w-72 text-base">
            <label htmlFor="email">Vendor Email</label>
            <input
              type="email"
              name="vendor_email"
              value={vendorData.vendor_email}
              onChange={handleChangeVendorDetails}
              className="outline-none border-b-2 border-gray-600"
            />
          </div>
          <div className="flex flex-col gap-3 w-72 text-base">
            <label htmlFor="phone">Vendor Phone</label>
            <input
              type="text"
              name="vendor_number"
              value={vendorData.vendor_number}
              onChange={handleChangeVendorDetails}
              className="outline-none border-b-2 border-gray-600"
            />
          </div>

          <div className="flex items-end justify-center space-x-3 text-base">
            <button
              className="bg-blue-700 hover:bg-blue-400 py-2 px-2 text-white rounded-md"
              onClick={onSubmitVendorDetails}
            >
              {isEditing ? "Update Vendor" : "Add Vendor"}
            </button>
          </div>
        </div>
      </div>

      <div className="w-full py-2 my-5">
        <h6 className="text-[9px]">
          <i>*Also mark for prefered vendor.</i>
        </h6>
        {vendorArray.length !== 0 && (
          <table className="w-full border-collapse border border-gray-300 text-left">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2"></th>
                <th className="border border-gray-300 p-2">Vendor Name</th>
                <th className="border border-gray-300 p-2">Vendor Email</th>
                <th className="border border-gray-300 p-2">Vendor Number</th>
                <th className="border border-gray-300 p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendorArray.map((data: VendorData, index) => (
                <tr key={index}>
                  <td className="p-2 flex justify-center items-center">
                    <input
                      type="checkbox"
                      checked={radioIndex === index}
                      onChange={() => handleRadioChange(index)}
                    />
                  </td>
                  <td className="border border-gray-300 p-2">
                    {data.vendor_name}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {data.vendor_email}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {data.vendor_number}
                  </td>
                  <td className="border border-gray-300 p-2">
                    <PDFuploader
                      onFileUpload={(file) => handleFileUpload(index, file)}
                      currentFile={data.file}
                    />
                  </td>
                  <td className="border border-gray-300 p-2 flex items-center justify-center space-x-4">
                    <button
                      className=" text-blue-600"
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
                        className="lucide lucide-pencil"
                      >
                        <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                        <path d="m15 5 4 4" />
                      </svg>
                    </button>
                    <button
                      className=" text-red-900 "
                      onClick={() => handleRemoveVendor(data.vendor_email)}
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
                        className="lucide lucide-trash"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                        <path d="M15 6a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v1h6z" />
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

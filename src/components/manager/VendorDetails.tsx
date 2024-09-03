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

  useEffect(() => {
    // Replace 'vendors' with the appropriate entity as needed
    fetch(`/api/ajax/vendors?searchFields=vendor_name,vendor_email,vendor_number`)
      .then((response) => response.json())
      .then((data) => {
        const fetchedVendors = data.map((item: any) => ({
          vendor_name: item.vendor_name,
          vendor_email: item.vendor_email,
          vendor_number: item.vendor_number,
          file: null,
        }));
        setVendorArray(fetchedVendors);
      })
      .catch((error) => {
        toast.error("Failed to fetch vendor data");
      });
  }, []);

  const handleChangeVendorDetails = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVendorData((prevData) => ({ ...prevData, [name]: value }));
  };

  const onSubmitVendorDetails = (e: any) => {
    e.preventDefault();

    if (vendorData.vendor_name === "" || vendorData.vendor_email === "" || vendorData.vendor_number === "") {
      toast.error("Please fill in all fields.");
      return;
    }

    const vd = vendorArray.find(
      (vendor) =>
        vendor.vendor_email === vendorData.vendor_email ||
        vendor.vendor_number === vendorData.vendor_number
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

  const handleFileUpload = (index: number, file: File | null) => {
    const updatedVendors = [...vendorArray];
    updatedVendors[index].file = file;
    setVendorArray(updatedVendors);
  };

  return (
    <div className="">
      {/* Dialog box and other UI elements */}
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
                      className="text-blue-600"
                      onClick={() => handleEditVendor(index)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-900"
                      onClick={() => handleRemoveVendor(data.vendor_email)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {vendorArray.length !== 0 && (
          <button className="bg-green-700 hover:bg-blue-400 border py-2 px-2 text-white text-base my-5 rounded-md">
            Submit Details of Vendor
          </button>
        )}
      </div>
    </div>
  );
};

export default VendorDetails;

"use client";

import React, { ChangeEvent, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { validateEmail, validateIndianPhoneNumber } from "@/lib/Validation";
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdEdit } from "react-icons/md";

interface ApproverData {
  approver_name: string;
  approver_email: string;
  approver_number: string;
}

interface ApproveDetailsProps {
  onApproverDataChange: (data: ApproverData[]) => void;
}

const ApproveDetails: React.FC<ApproveDetailsProps> = ({ onApproverDataChange }) => {
  const [approverArray, setApproverArray] = useState<ApproverData[]>([]);
  const [approverData, setApproverData] = useState<ApproverData>({
    approver_name: "",
    approver_email: "",
    approver_number: "",
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    number: "",
  });
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredApprovers, setFilteredApprovers] = useState<any[]>([]);
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);

  useEffect(() => {
    onApproverDataChange(approverArray);
  }, [approverArray, onApproverDataChange]);

  useEffect(() => {
    const fetchApproverData = async (name: string) => {
      if (name.trim() === "") {
        setFilteredApprovers([]);
        return;
      }
      try {
        const response = await fetch(`/api/ajax/users?q=${name}`);
        if (!response.ok) {
          throw new Error("Failed to fetch approver data");
        }
        const data = await response.json();
        setFilteredApprovers(data);
      } catch (error) {
        console.error("Error fetching approver data:", error);
      }
    };

    fetchApproverData(searchTerm);
  }, [searchTerm]);

  const validateFields = (): boolean => {
    const newErrors = { name: "", email: "", number: "" };
    let isValid = true;

    if (approverData.approver_name.trim() === "") {
      newErrors.name = "Approver name is required.";
      isValid = false;
    }

    if (!validateEmail(approverData.approver_email).isValid) {
      newErrors.email = "Invalid email address.";
      isValid = false;
    }

    if (!validateIndianPhoneNumber(approverData.approver_number).isValid) {
      newErrors.number = "Approver phone number must be 10 digits.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChangeApproverDetails = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setApproverData((prevData) => ({ ...prevData, [name]: value }));
    if (name === "approver_name") {
      setSearchTerm(value);
      setDropdownVisible(true); // Show dropdown when typing
    }
  };

  const handleSelectApprover = (approver: any) => {
    setApproverData({
      approver_name: approver.name,
      approver_email: approver.email,
      approver_number: "", // Assuming phone number is not in the API response
    });
    setSearchTerm(""); // Clear search term
    setDropdownVisible(false); // Hide dropdown
  };

  const onSubmitApproverDetails = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateFields()) {
      toast.error("Please correct the errors in the form.");
      return;
    }

    const existingApprover = approverArray.find(
      (approver) =>
        approver.approver_email === approverData.approver_email ||
        approver.approver_number === approverData.approver_number
    );

    if (!isEditing && existingApprover) {
      toast.error(
        `${approverData.approver_email} or ${approverData.approver_number} is already present.`
      );
      return;
    }

    if (isEditing && editIndex !== null) {
      const updatedApprovers = [...approverArray];
      updatedApprovers[editIndex] = approverData;
      setApproverArray(updatedApprovers);
      toast.success("Approver Details Updated");
    } else {
      setApproverArray((prevData) => [...prevData, approverData]);
      toast.success("New Approver Added");
    }

    setApproverData({
      approver_name: "",
      approver_email: "",
      approver_number: "",
    });
    setErrors({ name: "", email: "", number: "" });
    setIsEditing(false);
    setEditIndex(null);
  };

  const handleRemoveApprover = (email: string) => {
    setApproverArray((prevData) =>
      prevData.filter((data) => data.approver_email !== email)
    );
  };

  const handleEditApprover = (index: number) => {
    setApproverData(approverArray[index]);
    setIsEditing(true);
    setEditIndex(index);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditIndex(null);
    setApproverData({
      approver_name: "",
      approver_email: "",
      approver_number: "",
    });
    setErrors({ name: "", email: "", number: "" });
    setSearchTerm(""); // Clear search term on cancel
    setDropdownVisible(false); // Hide dropdown
  };

  return (
    <div className="p-5">
      <form onSubmit={onSubmitApproverDetails} className="flex space-x-7">
        <div className="relative flex flex-col gap-3 w-60 text-base">
          <label htmlFor="approver_name">Approver Name</label>
          <input
            type="text"
            name="approver_name"
            value={approverData.approver_name}
            onChange={handleChangeApproverDetails}
            className={`outline-none border-b-2 ${
              errors.name ? "border-red-600" : "border-gray-600"
            }`}
            required
          />
          {dropdownVisible && searchTerm && filteredApprovers.length > 0 && (
            <ul className="absolute bg-white border border-gray-300 mt-1 w-full max-h-60 overflow-y-auto z-10 shadow-lg">
              {filteredApprovers.map((approver) => (
                <li
                  key={approver.email}
                  onClick={() => handleSelectApprover(approver)}
                  className="cursor-pointer px-4 py-2 hover:bg-gray-200"
                >
                  {approver.name} ({approver.email})
                </li>
              ))}
            </ul>
          )}
          {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
        </div>

        <div className="relative flex flex-col gap-3 w-64 text-base">
          <label htmlFor="approver_email">Approver Email</label>
          <input
            type="email"
            name="approver_email"
            value={approverData.approver_email}
            onChange={handleChangeApproverDetails}
            className={`outline-none border-b-2 ${
              errors.email ? "border-red-600" : "border-gray-600"
            }`}
            required
          />
          {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
        </div>

        <div className="relative flex flex-col gap-3 w-48 text-base">
          <label htmlFor="approver_number">Approver Phone</label>
          <input
            type="text"
            name="approver_number"
            value={approverData.approver_number}
            onChange={handleChangeApproverDetails}
            className={`outline-none border-b-2 ${
              errors.number ? "border-red-600" : "border-gray-600"
            }`}
            required
          />
          {errors.number && <p className="text-red-600 text-sm">{errors.number}</p>}
        </div>

        <div className="flex flex-col gap-3 mt-7">
          <button
            type="submit"
            className="border py-2 rounded-lg px-4 bg-blue-500 text-white"
          >
            {isEditing ? "Update Approver" : "Add "}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="border py-2 px-4 bg-gray-500 text-white"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="w-full py-2 my-5">
        {approverArray.length > 0 && (
          <table className="w-full border-collapse border border-gray-300 text-left">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2">Approver Name</th>
                <th className="border border-gray-300 p-2">Approver Email</th>
                <th className="border border-gray-300 p-2">Approver Number</th>
                <th className="border border-gray-300 p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {approverArray.map((data, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 p-2">{data.approver_name}</td>
                  <td className="border border-gray-300 p-2">{data.approver_email}</td>
                  <td className="border border-gray-300 p-2">{data.approver_number}</td>
                  <td className="border border-gray-300 p-2 flex items-center justify-center space-x-4">
                    <button
                      className=" py-1 px-4 text-blue-600 text-lg cursor-pointer"
                      onClick={() => handleEditApprover(index)}
                    >
                      <MdEdit />
                    </button>
                    <button
                      className=" py-1 px-4 text-red-400 text-lg cursor-pointer"
                      onClick={() => handleRemoveApprover(data.approver_email)}
                    >
                       <RiDeleteBin6Line />
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

export default ApproveDetails;

"use client";
import {
  validateEmail,
  validateIndianPhoneNumber,
  validateUsername,
} from "@/lib/Validation";
import React, { ChangeEvent, useState } from "react";
import { toast } from "react-toastify";

interface ApproverData {
  approver_name: string;
  approver_email: string;
  approver_number: string;
}

const ApproveDetails: React.FC = () => {
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

  const validateFields = () => {
    const newErrors = { name: "", email: "", number: "" };
    let isValid = true;

    if (approverData.approver_name.trim() === "") {
      newErrors.name = "Approver name is required.";
      isValid = false;
    }

    if (
      !/^[\w-.]+@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(approverData.approver_email)
    ) {
      newErrors.email = "Invalid email address.";
      isValid = false;
    }

    if (!/^\d{10}$/.test(approverData.approver_number)) {
      newErrors.number = "Approver phone number must be 10 digits.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChangeApproverDetails = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setApproverData((prevData) => ({ ...prevData, [name]: value }));
  };

  const onSubmitApproverDetails = (e: any) => {
    e.preventDefault();

    if (approverData.approver_name === "") {
      toast.error("Name field is empty.");
      return;
    }
    if (approverData.approver_email === "") {
      toast.error("Email field is empty.");
      return;
    }
    if (approverData.approver_number === "") {
      toast.error("Phone Number is empty.");
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

    const nameValidation = validateUsername(approverData.approver_name);
    const emailValidation = validateEmail(approverData.approver_email);
    const phoneValidation = validateIndianPhoneNumber(
      approverData.approver_number
    );

    if (!nameValidation.isValid) {
      toast.error(nameValidation.message, { theme: "light" });
      return;
    }
    if (!emailValidation.isValid) {
      toast.error(emailValidation.message);
      return;
    }
    if (!phoneValidation.isValid) {
      toast.error(phoneValidation.message);
      return;
    }

    if (isEditing && editIndex !== null) {
      const updatedApprovers = [...approverArray];
      updatedApprovers[editIndex] = approverData;
      setApproverArray(updatedApprovers);
      setIsEditing(false);
      setEditIndex(null);
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
  };

  const handleRemoveApprover = (email: string) => {
    setApproverArray((prevData) => [
      ...prevData.filter((data) => data.approver_email !== email),
    ]);
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
  };

  return (
    <div className="">
      <div className="text-gray-800 text-xl mt-5">
        <form onSubmit={onSubmitApproverDetails} className="flex space-x-7">
          <div className="flex flex-col gap-3 w-60 text-base">
            <label htmlFor="name">Approver name</label>
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
            {errors.name && (
              <p className="text-red-600 text-sm">{errors.name}</p>
            )}
          </div>
          <div className="flex flex-col gap-3 w-64 text-base">
            <label htmlFor="email">Approver Email</label>
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
            {errors.email && (
              <p className="text-red-600 text-sm">{errors.email}</p>
            )}
          </div>
          <div className="flex flex-col gap-3 w-52 text-base">
            <label htmlFor="phone">Approver Phone</label>
            <input
              type="tel"
              name="approver_number"
              value={approverData.approver_number}
              onChange={handleChangeApproverDetails}
              className={`outline-none border-b-2 ${
                errors.number ? "border-red-600" : "border-gray-600"
              }`}
              required
            />
            {errors.number && (
              <p className="text-red-600 text-sm">{errors.number}</p>
            )}
          </div>
          <div className="flex items-end justify-center space-x-3 text-base">
            <button
              type="submit"
              className="bg-blue-700 hover:bg-blue-400 py-2 px-2 text-white rounded-md"
            >
              {isEditing ? "Update Approver" : "Add More"}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-gray-700 hover:bg-gray-400 py-2 px-2 text-white rounded-md"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="w-full py-2 my-5">
        {approverArray.length !== 0 && (
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
                  <td className="border border-gray-300 p-2">
                    {data.approver_name}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {data.approver_email}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {data.approver_number}
                  </td>
                  <td className="border border-gray-300 p-2 flex items-center justify-center space-x-4">
                    <button
                      className="border py-1 px-4 text-blue-600 text-sm cursor-pointer"
                      onClick={() => handleEditApprover(index)}
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
                      className=" border py-1 px-4 text-red-900 text-sm cursor-pointer"
                      onClick={() => handleRemoveApprover(data.approver_email)}
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
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {approverArray.length !== 0 && (
          <button className="bg-green-700 hover:bg-blue-400 border py-2 px-2 text-white text-base my-5 rounded-md">
            Submit Approver Details
          </button>
        )}
      </div>
      <h6>Note: Any one of the approvers can approve</h6>
    </div>
  );
};

export default ApproveDetails;

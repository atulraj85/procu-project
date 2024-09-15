"use client";

import React, { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Select from "react-select";
import { parseISO, format } from "date-fns";
import { X } from "lucide-react";

interface RfpData {
  id: string;
  rfpId: string;
  requirementType: string;
  dateOfOrdering: string;
  deliveryLocation: string;
  deliveryByDate: string;
  rfpStatus: string;
}

interface Errors {
  requirementType: string;
  dateOfOrdering: string;
  deliveryLocation: string;
  deliveryByDate: string;
}

const RfpSubmissionForm: React.FC = () => {
  const [rfpData, setRfpData] = useState<RfpData>({
    id: "",
    rfpId: "",
    requirementType: "",
    dateOfOrdering: "",
    deliveryLocation: "",
    deliveryByDate: "",
    rfpStatus: "DRAFT",
  });

  const [errors, setErrors] = useState<Errors>({
    requirementType: "",
    dateOfOrdering: "",
    deliveryLocation: "",
    deliveryByDate: "",
  });

  const router = useRouter();

  // Fetch data on component mount
  useEffect(() => {
    const fetchRfpData = async () => {
      try {
        const response = await fetch("/api/rfp?rfpId=RFP-2024-09-11-0000");
        if (!response.ok) {
          throw new Error("Failed to fetch RFP data");
        }
        const data: RfpData = await response.json();
        console.log("data", data);

        // setRfpData(data[0]);
      } catch (error) {
        toast.error("An error occurred while fetching RFP data.");
      }
    };

    fetchRfpData();
  }, []); // Empty dependency array means this runs once on mount

  const validateFields = (): boolean => {
    const newErrors: Errors = {
      requirementType: "",
      dateOfOrdering: "",
      deliveryLocation: "",
      deliveryByDate: "",
    };
    let isValid = true;

    if (rfpData.requirementType === "") {
      newErrors.requirementType = "Requirement Type is required.";
      isValid = false;
    }
    if (rfpData.dateOfOrdering === "") {
      newErrors.dateOfOrdering = "Date of Ordering is required.";
      isValid = false;
    }
    if (rfpData.deliveryLocation === "") {
      newErrors.deliveryLocation = "Delivery Location is required.";
      isValid = false;
    }
    if (rfpData.deliveryByDate === "") {
      newErrors.deliveryByDate = "Delivery By Date is required.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChangeRfpDetails = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setRfpData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleRequirementTypeChange = (
    selectedOption: { value: string; label: string } | null
  ) => {
    setRfpData((prevData) => ({
      ...prevData,
      requirementType: selectedOption ? selectedOption.value : "",
    }));
  };

  const onSubmitRfpDetails = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("inside submit");

    if (!validateFields()) {
      toast.error("Please correct the errors in the form.");
      return;
    }

    try {
      const response = await fetch("/api/rfp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rfpData),
      });
      const result = await response.json();

      if (result.success) {
        toast.success("RFP submitted successfully.");
        router.push("/dashboard");
      } else {
        toast.error(result.message || "Failed to submit RFP.");
      }
    } catch (error) {
      toast.error("An error occurred while submitting the RFP.");
    }
  };

  const dateString = rfpData.dateOfOrdering;
  const dateObject = new Date(dateString);
  let formattedDate = "";

  if (!isNaN(dateObject.getTime())) {
    formattedDate = dateObject.toISOString().slice(0, 16); // Format for datetime-local input
  } else {
    console.error("Invalid date string:", dateString);
  }

  const dateString1 = rfpData.deliveryByDate;
  const dateObject1 = new Date(dateString1);
  let formattedDate1 = "";

  if (!isNaN(dateObject1.getTime())) {
    formattedDate1 = dateObject1.toISOString().slice(0, 16); // Format for datetime-local input
  } else {
    console.error("Invalid date string:", dateString);
  }

  return (
    <div className="p-5">
      <div className="text-lg font-bold">Edit RFP</div>

      <div className="flex justify-end pb-8">
        <Link href="/dashboard/manager">
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
      <form
        onSubmit={onSubmitRfpDetails}
        className="flex flex-wrap w-full gap-7"
      >
        <div className="flex flex-col gap-3 w-60 text-base">
          <label className="font-bold">Requirement Type</label>
          <Select
            options={[
              { value: "Service", label: "Service" },
              { value: "Product", label: "Product" },
            ]}
            value={{
              value: rfpData.requirementType,
              label: rfpData.requirementType,
            }}
            onChange={handleRequirementTypeChange}
            placeholder="Select Requirement Type"
            className="basic-single"
            classNamePrefix="select"
          />
          {errors.requirementType && (
            <p className="text-red-500">{errors.requirementType}</p>
          )}
        </div>

        <div className="flex flex-col gap-3 w-60 text-base">
          <label className="font-bold">Date of Ordering</label>
          <Input
            type="datetime-local"
            name="dateOfOrdering"
            value={formattedDate}
            onChange={handleChangeRfpDetails}
            className="p-2"
          />
          {errors.dateOfOrdering && (
            <p className="text-red-500">{errors.dateOfOrdering}</p>
          )}
        </div>

        <div className="flex flex-col gap-3 w-60 text-base">
          <label className="font-bold">Delivery Location</label>
          <Input
            type="text"
            name="deliveryLocation"
            value={rfpData.deliveryLocation}
            onChange={handleChangeRfpDetails}
            placeholder="Delivery Location"
            className="p-2"
          />
          {errors.deliveryLocation && (
            <p className="text-red-500">{errors.deliveryLocation}</p>
          )}
        </div>

        <div className="flex flex-col gap-3 w-60 text-base">
          <label className="font-bold">Delivery By Date</label>
          <Input
            type="datetime-local"
            name="deliveryByDate"
            value={formattedDate}
            onChange={handleChangeRfpDetails}
            className="p-2"
          />
          {errors.deliveryByDate && (
            <p className="text-red-500">{errors.deliveryByDate}</p>
          )}
        </div>

        <div className="flex flex-col gap-3 w-60 text-base">
          <label className="font-bold">RFP Status</label>
          <Input
            type="text"
            name="rfpStatus"
            value={rfpData.rfpStatus}
            readOnly
            className="p-2 bg-gray-100"
          />
        </div>

        <div className="flex gap-4 w-full">
          <button
            type="submit"
            className="bg-primary text-white mt-8 py-2 px-4 rounded"
          >
            Submit RFP
          </button>
        </div>
      </form>
    </div>
  );
};

export default RfpSubmissionForm;

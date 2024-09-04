"use client";

import React, { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "react-toastify";

const validateAddress = (value: string) => value.trim() !== "";
const validateCountry = (value: string) => value.trim() !== "";
const validateState = (value: string) => value.trim() !== "";
const validateCity = (value: string) => value.trim() !== "";
// const validateZipCode = (value: string) => /^\d{5}$/.test(value);
const validatePreferredDate = (value: string) => {
  const date = new Date(value);
  return !isNaN(date.getTime());
};

interface DeliveryDetailsProps {
  deliveryData: Delivery[];
  onDeliveryDataChange: (data: Delivery[]) => void;
}

interface Delivery {
  address: string;
  country: string;
  state: string;
  city: string;
  zipCode: string;
  preferredDeliveryDate: string;
}

const DeliveryDetails: React.FC<DeliveryDetailsProps> = ({ deliveryData, onDeliveryDataChange }) => {
  const [newDelivery, setNewDelivery] = useState<Delivery>({
    address: "",
    country: "",
    state: "",
    city: "",
    zipCode: "",
    preferredDeliveryDate: "",
  });
  const [errors, setErrors] = useState({
    address: "",
    country: "",
    state: "",
    city: "",
    zipCode: "",
    preferredDeliveryDate: "",
  });
  const [isEditing, setIsEditing] = useState<number | null>(null);

  const validateFields = (): boolean => {
    const newErrors = {
      address: "",
      country: "",
      state: "",
      city: "",
      zipCode: "",
      preferredDeliveryDate: "",
    };
    let isValid = true;

    if (!validateAddress(newDelivery.address)) {
      newErrors.address = "Address is required.";
      isValid = false;
    }

    if (!validateCountry(newDelivery.country)) {
      newErrors.country = "Country is required.";
      isValid = false;
    }

    if (!validateState(newDelivery.state)) {
      newErrors.state = "State is required.";
      isValid = false;
    }

    if (!validateCity(newDelivery.city)) {
      newErrors.city = "City is required.";
      isValid = false;
    }

    // if (!validateZipCode(newDelivery.zipCode)) {
    //   newErrors.zipCode = "Valid Zip Code is required.";
    //   isValid = false;
    // }

    if (!validatePreferredDate(newDelivery.preferredDeliveryDate)) {
      newErrors.preferredDeliveryDate = "Valid Preferred Delivery Date is required.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewDelivery((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!validateFields()) {
      toast.error("Please correct the errors in the form.");
      return;
    }

    if (isEditing !== null) {
      // Edit existing delivery
      const updatedData = deliveryData.map((item, index) =>
        index === isEditing ? newDelivery : item
      );
      onDeliveryDataChange(updatedData);
      setIsEditing(null);
    } else {
      // Add new delivery
      onDeliveryDataChange([...deliveryData, newDelivery]);
    }

    setNewDelivery({
      address: "",
      country: "",
      state: "",
      city: "",
      zipCode: "",
      preferredDeliveryDate: "",
    });
    setErrors({
      address: "",
      country: "",
      state: "",
      city: "",
      zipCode: "",
      preferredDeliveryDate: "",
    });
    toast.success(isEditing !== null ? "Delivery details updated successfully." : "Delivery details added successfully.");
  };

  const handleEdit = (index: number) => {
    setNewDelivery(deliveryData[index]);
    setIsEditing(index);
  };

  const handleRemove = (index: number) => {
    onDeliveryDataChange(deliveryData.filter((_, i) => i !== index));
    toast.success("Delivery details removed successfully.");
  };

  return (
    <div className="text-gray-800 text-xl p-5">
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-5">
        <div className="flex flex-col gap-3 w-80 text-base">
          <label htmlFor="address">Address</label>
          <input
            type="text"
            name="address"
            value={newDelivery.address}
            onChange={handleChange}
            className={`outline-none border-b-2 ${errors.address ? "border-red-600" : "border-gray-600"}`}
          />
          {errors.address && <p className="text-red-600 text-sm">{errors.address}</p>}
        </div>
        <div className="flex flex-col gap-3 w-64 text-base">
          <label htmlFor="country">Country</label>
          <input
            type="text"
            name="country"
            value={newDelivery.country}
            onChange={handleChange}
            className={`outline-none border-b-2 ${errors.country ? "border-red-600" : "border-gray-600"}`}
          />
          {errors.country && <p className="text-red-600 text-sm">{errors.country}</p>}
        </div>
        <div className="flex flex-col gap-3 w-64 text-base">
          <label htmlFor="state">State</label>
          <input
            type="text"
            name="state"
            value={newDelivery.state}
            onChange={handleChange}
            className={`outline-none border-b-2 ${errors.state ? "border-red-600" : "border-gray-600"}`}
          />
          {errors.state && <p className="text-red-600 text-sm">{errors.state}</p>}
        </div>
        <div className="flex flex-col gap-3 w-64 text-base">
          <label htmlFor="city">City</label>
          <input
            type="text"
            name="city"
            value={newDelivery.city}
            onChange={handleChange}
            className={`outline-none border-b-2 ${errors.city ? "border-red-600" : "border-gray-600"}`}
          />
          {errors.city && <p className="text-red-600 text-sm">{errors.city}</p>}
        </div>
        <div className="flex flex-col gap-3 w-64 text-base">
          <label htmlFor="zipCode">Zip Code</label>
          <input
            type="text"
            name="zipCode"
            value={newDelivery.zipCode}
            onChange={handleChange}
            className={`outline-none border-b-2 ${errors.zipCode ? "border-red-600" : "border-gray-600"}`}
          />
          {errors.zipCode && <p className="text-red-600 text-sm">{errors.zipCode}</p>}
        </div>
        <div className="flex flex-col gap-3 w-64 text-base">
          <label htmlFor="preferredDeliveryDate">Preferred Delivery Date</label>
          <input
            type="date"
            name="preferredDeliveryDate"
            value={newDelivery.preferredDeliveryDate}
            onChange={handleChange}
            className={`outline-none border-b-2 ${errors.preferredDeliveryDate ? "border-red-600" : "border-gray-600"}`}
          />
          {errors.preferredDeliveryDate && <p className="text-red-600 text-sm">{errors.preferredDeliveryDate}</p>}
        </div>
        <div className="flex flex-col justify-end">
          <button
            type="submit"
            className="bg-blue-700 hover:bg-blue-400 py-2 px-2 text-white text-base rounded-md"
          >
            {isEditing !== null ? "Save Changes" : "Add Delivery Details"}
          </button>
        </div>
      </form>

      <div className="my-5">
        {deliveryData.length > 0 && (
          <table className="w-full text-[15px] border-collapse border border-gray-300 text-left">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2">Address</th>
                <th className="border border-gray-300 p-2">Country</th>
                <th className="border border-gray-300 p-2">State</th>
                <th className="border border-gray-300 p-2">City</th>
                <th className="border border-gray-300 p-2">Zip Code</th>
                <th className="border border-gray-300 p-2">Preferred Delivery Date</th>
                <th className="border border-gray-300 p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {deliveryData.map((delivery, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 p-2">{delivery.address}</td>
                  <td className="border border-gray-300 p-2">{delivery.country}</td>
                  <td className="border border-gray-300 p-2">{delivery.state}</td>
                  <td className="border border-gray-300 p-2">{delivery.city}</td>
                  <td className="border border-gray-300 p-2">{delivery.zipCode}</td>
                  <td className="border border-gray-300 p-2">{delivery.preferredDeliveryDate}</td>
                  <td className="border border-gray-300 p-2 flex items-center justify-center space-x-4">
                    <button
                      className="border py-1 px-2 text-blue-900 text-sm cursor-pointer"
                      onClick={() => handleEdit(index)}
                    >
                      Edit
                    </button>
                    <button
                      className="border py-1 px-2 text-red-900 text-sm cursor-pointer"
                      onClick={() => handleRemove(index)}
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
    </div>
  );
};

export default DeliveryDetails;

import { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "react-toastify";

import {
  validateEmail,
  validateIndianPhoneNumber,
  validatePinCode,
  validateGstn,
  validatePanCard,
} from "@/lib/Validation"; // Ensure these validation functions are available

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

    if (!validateGstn(vendorData.vendor_gstn).isValid) {
      newErrors.gstn = "Invalid GSTN.";
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

    // Commented out pin code validation
    // if (!validatePinCode(vendorData.pin_code).isValid) {
    //   newErrors.pin = "Invalid pin code.";
    //   isValid = false;
    // }

    if (vendorData.person_name.trim() === "") {
      newErrors.person = "Person name is required.";
      isValid = false;
    }

    if (!validateEmail(vendorData.email).isValid) {
      newErrors.email = "Invalid email address.";
      isValid = false;
    }

    // Commented out PAN card validation
    // if (!validatePanCard(vendorData.pan_card).isValid) {
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

  const fetchVendorDetails = async (gstn: string) => {
    try {
      const response = await fetch(`/api/vendor/gst/${gstn}`);
      const result = await response.json();

      if (result.flag) {
        const data = result.data;
        setVendorData({
          ...vendorData,
          company_name: data.lgnm || "",
          state: data.pradr.addr.stcd || "",
          pin_code: data.pradr.addr.pncd || "",
          address: data.pradr.adr || "",
          city: data.pradr.addr.city || "",
          pan_card: data.nba.join(", ") || "",
        });
      } else {
        toast.error(result.message || "Failed to fetch vendor details.");
      }
    } catch (error) {
      toast.error("An error occurred while fetching vendor details.");
    }
  };

  const handleSearchGSTN = () => {
    if (validateGstn(vendorData.vendor_gstn).isValid) {
      fetchVendorDetails(vendorData.vendor_gstn);
    } else {
      toast.error("Invalid GSTN.");
    }
  };

  const onSubmitVendorDetails = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
      msmeNo: "MSME123456", // This value might need to come from the form if applicable
      address: vendorData.address,
      customerState: vendorData.state,
      customerCity: vendorData.city,
      country: "India", // Adjust if necessary
      pan: vendorData.pan_card,
      verifiedById: "acb43a4a-8e5e-41e5-8ebb-1c075fc3d41e" // This should be dynamically set if possible
    };

    try {
      const response = await fetch("/api/vendor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newVendor),
      });
      const result = await response.json();

      if (result.success) {
        // Assuming the API returns the added vendor in the response
        setVendorArray((prevData) => [...prevData, result.vendor]);
        toast.success("Vendor added successfully.");
      } else {
        toast.error(result.message || "Failed to add vendor.");
      }
    } catch (error) {
      toast.error("An error occurred while adding the vendor.");
    }

    // Clear the form
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
        <div className="flex flex-col gap-3 w-60 text-base relative">
          <label htmlFor="vendor_gstn">Vendor GSTN</label>
          <input
            type="text"
            name="vendor_gstn"
            value={vendorData.vendor_gstn}
            onChange={handleChangeVendorDetails}
            className={`outline-none border-b-2 ${
              errors.gstn ? "border-red-600" : "border-gray-600"
            } pr-10`}
            required
          />
          <button
            type="button"
            onClick={handleSearchGSTN}
            className="absolute top-1/2 right-2 transform -translate-y-1/2"
          >
            <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M23 21l-4.35-4.35M20.69 11.1A9.09 9.09 0 1 0 11.1 20.69a9.09 9.09 0 0 0 9.59-9.59z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {errors.gstn && <p className="text-red-600 text-sm">{errors.gstn}</p>}
        </div>

        <div className="flex flex-col gap-3 w-60 text-base">
          <label htmlFor="company_name">Company Name</label>
          <input
            type="text"
            name="company_name"
            value={vendorData.company_name}
            onChange={handleChangeVendorDetails}
            className={`outline-none border-b-2 ${
              errors.company ? "border-red-600" : "border-gray-600"
            }`}
            required
          />
          {errors.company && <p className="text-red-600 text-sm">{errors.company}</p>}
        </div>

        <div className="flex flex-col gap-3 w-60 text-base">
          <label htmlFor="contact_no">Contact No</label>
          <input
            type="text"
            name="contact_no"
            value={vendorData.contact_no}
            onChange={handleChangeVendorDetails}
            className={`outline-none border-b-2 ${
              errors.contact ? "border-red-600" : "border-gray-600"
            }`}
            required
          />
          {errors.contact && <p className="text-red-600 text-sm">{errors.contact}</p>}
        </div>

        <div className="flex flex-col gap-3 w-60 text-base">
          <label htmlFor="state">State</label>
          <select
            name="state"
            value={vendorData.state}
            onChange={handleChangeVendorDetails}
            className={`outline-none border-b-2 ${
              errors.state ? "border-red-600" : "border-gray-600"
            }`}
            required
          >
            <option value="">Select State</option>
            {states.map((state) => (
              <option key={state.value} value={state.value}>
                {state.label}
              </option>
            ))}
          </select>
          {errors.state && <p className="text-red-600 text-sm">{errors.state}</p>}
        </div>

        <div className="flex flex-col gap-3 w-60 text-base">
          <label htmlFor="pin_code">Pin Code</label>
          <input
            type="text"
            name="pin_code"
            value={vendorData.pin_code}
            onChange={handleChangeVendorDetails}
            className={`outline-none border-b-2 ${
              errors.pin ? "border-red-600" : "border-gray-600"
            }`}
          />
          {errors.pin && <p className="text-red-600 text-sm">{errors.pin}</p>}
        </div>

        <div className="flex flex-col gap-3 w-60 text-base">
          <label htmlFor="person_name">Person Name</label>
          <input
            type="text"
            name="person_name"
            value={vendorData.person_name}
            onChange={handleChangeVendorDetails}
            className={`outline-none border-b-2 ${
              errors.person ? "border-red-600" : "border-gray-600"
            }`}
            required
          />
          {errors.person && <p className="text-red-600 text-sm">{errors.person}</p>}
        </div>

        <div className="flex flex-col gap-3 w-60 text-base">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            value={vendorData.email}
            onChange={handleChangeVendorDetails}
            className={`outline-none border-b-2 ${
              errors.email ? "border-red-600" : "border-gray-600"
            }`}
            required
          />
          {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
        </div>

        <div className="flex flex-col gap-3 w-60 text-base">
          <label htmlFor="website">Website</label>
          <input
            type="text"
            name="website"
            value={vendorData.website}
            onChange={handleChangeVendorDetails}
            className={`outline-none border-b-2 ${
              errors.website ? "border-red-600" : "border-gray-600"
            }`}
          />
          {errors.website && <p className="text-red-600 text-sm">{errors.website}</p>}
        </div>

        <div className="flex flex-col gap-3 w-60 text-base">
          <label htmlFor="city">City</label>
          <input
            type="text"
            name="city"
            value={vendorData.city}
            onChange={handleChangeVendorDetails}
            className={`outline-none border-b-2 ${
              errors.city ? "border-red-600" : "border-gray-600"
            }`}
          />
          {errors.city && <p className="text-red-600 text-sm">{errors.city}</p>}
        </div>

        <div className="flex flex-col gap-3 w-60 text-base">
          <label htmlFor="address">Address</label>
          <input
            type="text"
            name="address"
            value={vendorData.address}
            onChange={handleChangeVendorDetails}
            className={`outline-none border-b-2 ${
              errors.address ? "border-red-600" : "border-gray-600"
            }`}
          />
          {errors.address && <p className="text-red-600 text-sm">{errors.address}</p>}
        </div>

        <div className="flex flex-col gap-3 w-60 text-base">
          <label htmlFor="pan_card">PAN Card</label>
          <input
            type="text"
            name="pan_card"
            value={vendorData.pan_card}
            onChange={handleChangeVendorDetails}
            className={`outline-none border-b-2 ${
              errors.pan ? "border-red-600" : "border-gray-600"
            }`}
          />
          {errors.pan && <p className="text-red-600 text-sm">{errors.pan}</p>}
        </div>

        <div className="flex gap-5">
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded"
          >
            {isEditing ? "Update Vendor" : "Add Vendor"}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="bg-gray-500 text-white py-2 px-4 rounded"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="mt-5">
        <h2 className="text-xl font-semibold mb-3">Vendor List</h2>
        {vendorArray.length > 0 ? (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2">GSTN</th>
                <th className="border border-gray-300 p-2">Company Name</th>
                <th className="border border-gray-300 p-2">Contact No</th>
                <th className="border border-gray-300 p-2">State</th>
                <th className="border border-gray-300 p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {vendorArray.map((vendor, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 p-2">{vendor.vendor_gstn}</td>
                  <td className="border border-gray-300 p-2">{vendor.company_name}</td>
                  <td className="border border-gray-300 p-2">{vendor.contact_no}</td>
                  <td className="border border-gray-300 p-2">{vendor.state}</td>
                  <td className="border border-gray-300 p-2">
                    <button
                      onClick={() => handleEditVendor(index)}
                      className="text-blue-500 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleRemoveVendor(vendor.email)}
                      className="text-red-500 hover:underline ml-2"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No vendors added yet.</p>
        )}
      </div>
    </div>
  );
};

export default VendorDetails;

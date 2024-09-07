"use client"
import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { MdModeEdit } from "react-icons/md";
import { IoIosSearch } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import { DataTable } from "../Table/data-table";
import { columns, Vendor } from "../Table/columns";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  validateEmail,
  validateIndianPhoneNumber,
  validatePinCode,
  validateGstn,
  validatePanCard,
} from "@/lib/Validation";


const states = [
  { value: 'state1', label: 'State 1' },
  { value: 'state2', label: 'State 2' },
  // Add more states as needed
];

interface VendorData {
  primaryName: ReactNode;
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
  console.log(vendorArray);
  
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
  const [showForm, setShowForm] = useState<boolean>(false);

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

    // if (vendorData.company_name.trim() === "") {
    //   newErrors.company = "Company name is required.";
    //   isValid = false;
    // }

    // if (!validateIndianPhoneNumber(vendorData.contact_no).isValid) {
    //   newErrors.contact = "Invalid contact number.";
    //   isValid = false;
    // }

    if (vendorData.state === "") {
      newErrors.state = "State is required.";
      isValid = false;
    }

    // if (vendorData.person_name.trim() === "") {
    //   newErrors.person = "Person name is required.";
    //   isValid = false;
    // }

    if (!validateEmail(vendorData.email).isValid) {
      newErrors.email = "Invalid email address.";
      isValid = false;
    }

    // if (!validatePinCode(vendorData.pin_code).isValid) {
    //   newErrors.pin = "Invalid pin code.";
    //   isValid = false;
    // }

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
          company_name: data.companyName || "",
          state: data.customerState || "",
          pin_code: data.zip || "",
          address: data.address || "",
          city: data.customerCity || "",
          pan_card: data.pan || "",
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
      msmeNo: "MSME123456",
      address: vendorData.address,
      customerState: vendorData.state,
      customerCity: vendorData.city,
      country: "India",
      pan: vendorData.pan_card,
      verifiedById: "ded94860-af4c-4b45-a151-3d0d9babd7e0"
    };
    console.log(newVendor);
    

    try {
      const response = await fetch("/api/vendor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([newVendor]),
      });
      const result = await response.json();

      if (result.success) {
        setVendorArray((prevData) => [...prevData, result.vendor]);
        toast.success("Vendor added successfully.");
      } else {
        toast.error(result.message || "Failed to add vendor.");
      }
    } catch (error) {
      toast.error("An error occurred while adding the vendor.");
    }

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
    setShowForm(false);
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
    setShowForm(true);
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
    setShowForm(false);
  };

  const fetchAllVendors = async () => {
    try {
      const response = await fetch("/api/vendor");
      const result = await response.json();
      
     

      if (true) {
        console.log(result);
        setVendorArray(result);
        console.log(result.data);
        
      } else {
        toast.error(result.message || "Failed to fetch vendor data.");
      }
    } catch (error) {
      toast.error("An error occurred while fetching vendor data.");
    }
  };

  useEffect(() => {
    fetchAllVendors();
    
    
  }, []);

  return (
    <div className="p-5">
      <Sheet  >
  <SheetTrigger className="bg-green-500 py-2 px-4 text-white  rounded ">Add Vendor</SheetTrigger>
  <SheetContent   >
    <SheetHeader>
      {/* <SheetTitle>Are you absolutely sure?</SheetTitle> */}
      <SheetDescription >
      {/* <div className="flex justify-end">
      <button
        onClick={() => setShowForm((prev) => !prev)}
        className="bg-green-500   text-white py-2 px-4 rounded mb-5"
      >
        {showForm ? < IoMdClose/> : "Add Vendor"}
      </button>
      </div> */}

      
        <form onSubmit={onSubmitVendorDetails} className="flex flex-wrap w-full  gap-7">
          <div className="flex flex-col gap-3 w-60 text-base relative">
            <label className="font-bold">GSTN</label>
            <input
              type="text"
              name="vendor_gstn"
              value={vendorData.vendor_gstn}
              onChange={handleChangeVendorDetails}
              placeholder="GSTN"
              className="p-2  border-b-2 border-black"
            />
            <button
              type="button"
              onClick={handleSearchGSTN}
              className="absolute right-0 top-14 transform -translate-y-1/2  px-1 py-1 rounded"
            >
              <IoIosSearch />
            </button>
            {errors.gstn && <p className="text-red-500">{errors.gstn}</p>}
          </div>

          <div className="flex flex-col gap-3 w-60 text-base">
            <label className="font-bold">Company Name</label>
            <input
              type="text"
              name="company_name"
              value={vendorData.company_name}
              onChange={handleChangeVendorDetails}
              placeholder="Company Name"
              className="p-2  border-b-2 border-black"
            />
            {errors.company && <p className="text-red-500">{errors.company}</p>}
          </div>

          <div className="flex flex-col gap-3 w-60 text-base">
            <label className="font-bold">Contact No</label>
            <input
              type="text"
              name="contact_no"
              value={vendorData.contact_no}
              onChange={handleChangeVendorDetails}
              placeholder="Contact No"
              className="p-2  border-b-2 border-black"
            />
            {errors.contact && <p className="text-red-500">{errors.contact}</p>}
          </div>

          <div className="flex flex-col gap-3 w-60 text-base">
            <label className="font-bold">State</label>
            <select
              name="state"
              value={vendorData.state}
              onChange={handleChangeVendorDetails}
              className="p-2  border-b-2 border-black"
            >
              <option value="">Select State</option>
              {states.map((state) => (
                <option key={state.value} value={state.value}>
                  {state.label}
                </option>
              ))}
            </select>
            {errors.state && <p className="text-red-500">{errors.state}</p>}
          </div>

          <div className="flex flex-col gap-3 w-60 text-base">
            <label className="font-bold">Pin Code</label>
            <input
              type="text"
              name="pin_code"
              value={vendorData.pin_code}
              onChange={handleChangeVendorDetails}
              placeholder="Pin Code"
              className="p-2  border-b-2 border-black"
            />
            {errors.pin && <p className="text-red-500">{errors.pin}</p>}
          </div>

          <div className="flex flex-col gap-3 w-60 text-base">
            <label className="font-bold">Person Name</label>
            <input
              type="text"
              name="person_name"
              value={vendorData.person_name}
              onChange={handleChangeVendorDetails}
              placeholder="Person Name"
              className="p-2  border-b-2 border-black"
            />
            {errors.person && <p className="text-red-500">{errors.person}</p>}
          </div>

          <div className="flex flex-col gap-3 w-60 text-base">
            <label className="font-bold">Email</label>
            <input
              type="text"
              name="email"
              value={vendorData.email}
              onChange={handleChangeVendorDetails}
              placeholder="Email"
              className="p-2  border-b-2 border-black"
            />
            {errors.email && <p className="text-red-500">{errors.email}</p>}
          </div>

          <div className="flex flex-col gap-3 w-60 text-base">
            <label className="font-bold">Website</label>
            <input
              type="text"
              name="website"
              value={vendorData.website}
              onChange={handleChangeVendorDetails}
              placeholder="Website"
              className="p-2  border-b-2 border-black"
            />
            {errors.website && <p className="text-red-500">{errors.website}</p>}
          </div>

          <div className="flex flex-col gap-3 w-60 text-base">
            <label className="font-bold">City</label>
            <input
              type="text"
              name="city"
              value={vendorData.city}
              onChange={handleChangeVendorDetails}
              placeholder="City"
              className="p-2  border-b-2 border-black"
            />
            {errors.city && <p className="text-red-500">{errors.city}</p>}
          </div>

          <div className="flex flex-col gap-3 w-60 text-base">
            <label className="font-bold">Address</label>
            <input
              type="text"
              name="address"
              value={vendorData.address}
              onChange={handleChangeVendorDetails}
              placeholder="Address"
              className="p-2  border-b-2 border-black "
            />
            {errors.address && <p className="text-red-500">{errors.address}</p>}
          </div>

          <div className="flex flex-col gap-3 w-60 text-base">
            <label className="font-bold">PAN Card</label>
            <input
              type="text"
              name="pan_card"
              value={vendorData.pan_card}
              onChange={handleChangeVendorDetails}
              placeholder="PAN Card"
              className="p-2  border-b-2 border-black"
            />
            {errors.pan && <p className="text-red-500">{errors.pan}</p>}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-green-500 text-white mt-8 py-2 px-4 rounded"
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
      
      </SheetDescription>
    </SheetHeader>
  </SheetContent>
</Sheet>
     

<DataTable columns={columns} data={vendorArray} />
    </div>
  );
};

export default VendorDetails;

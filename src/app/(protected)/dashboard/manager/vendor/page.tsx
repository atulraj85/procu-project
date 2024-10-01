"use client";
import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { IoIosSearch } from "react-icons/io";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  validateEmail,
  validateIndianPhoneNumber,
  validateGstn,
} from "@/lib/Validation";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/Table/data-table";
import { columns } from "@/components/Table/columns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Vendor {
  gstin: any;
  primaryName: string; // Required property
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

interface VendorData {
  primaryName?: string; // Required property
  gstin?: string;
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
  const [vendorArray, setVendorArray] = useState<Vendor[]>([]);
  // console.log("vendor1", vendorArray);

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
  const router = useRouter();
  const [states, setStates] = useState<{ value: string; label: string }[]>([]);
  const [cities, setCities] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await fetch("/api/address/states/IN");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();

        // Transform the data into the desired format
        const transformedStates = data.map(
          (state: { code: any; name: any }) => ({
            value: state.code,
            label: state.name,
          })
        );

        console.log("transformedStates", transformedStates);

        setStates(transformedStates); // Set the states in the state
      } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
      }
    };

    fetchStates(); // Call the fetch function
  }, []);
  useEffect(() => {
    const fetchCities = async () => {
      if (vendorData.state) {
        try {
          const response = await fetch(
            `/api/address/cities/IN/${vendorData.state}`
          );
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const data = await response.json();

          const transformedCities = data.map((city: { name: any }) => ({
            value: city.name,
            label: city.name,
          }));

          setCities(transformedCities);
        } catch (error) {
          console.error("There was a problem fetching cities:", error);
        }
      }
    };

    fetchCities();
  }, [vendorData.state]);
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

    // if (vendorData.state === "") {
    //   newErrors.state = "State is required.";
    //   isValid = false;
    // }

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
  const USER_ID = localStorage.getItem("USER_ID");

  const handleChangeVendorDetails = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    console.log(name);
    console.log(value);

    setVendorData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleStateChange = (value: string) => {
    setVendorData((prevData) => ({
      ...prevData,
      state: value,
    }));
  };

  const fetchVendorDetails = async (gstn: string) => {
    console.log("gstttttttt", gstn);

    try {
      const response1 = await fetch(`/api/vendor?gstin=${gstn}`);
      const result1 = await response1.json();
      console.log("result 1");

      if (!result1.error) {
        toast({
          title: "Error",
          description: "User all ready exist.",
        });

        window.location.reload();
        return router.push("/dashboard");
      } else {
        console.log("hhh1");

        const response = await fetch(`/api/vendor/gst/${gstn}`);
        const result = await response.json();
        console.log("result 1 out", result);

        if (result.flag) {
          const data = result.data;
          console.log("hi");
          let pan = data.gstin;

          setVendorData({
            ...vendorData,
            company_name: data.lgnm || "",
            state: data.pradr.addr.stcd || "",
            pin_code: data.pradr.addr.pncd || "",
            address: data.pradr.adr || "",
            city: data.pradr.addr.city || "",
            pan_card: data.gstin.slice(2, 12) || "",
          });
        } else {
          toast({
            title: "Failed to fetch vendor details.",
          });
        }
      }
    } catch (error) {
      toast({
        title: "An error occurred while fetching vendor details.",
      });
    }
  };

  const handleSearchGSTN = () => {
    if (validateGstn(vendorData.vendor_gstn).isValid) {
      console.log("data", vendorData.vendor_gstn);

      fetchVendorDetails(vendorData.vendor_gstn);
    } else {
      toast({
        title: "Invalid GSTN.",
      });
    }
  };

  const onSubmitVendorDetails = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateFields()) {
      toast({
        title: "Please correct the errors in the form.",
      });

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
      zip: vendorData.pin_code,
      country: "India",
      pan: vendorData.pan_card,
      verifiedById: USER_ID,
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

      if (response.ok) {
        setVendorArray((prevData) => [...prevData, result.vendor]);
        toast({
          title: "🎉 Vendor added successfully.",
        });

        window.location.reload();
        return router.push("/dashboard");
      } else {
        toast({
          title: "Failed to add vendor.",
        });

        return router.push("/dashboard");
      }
    } catch (error) {
      toast({
        title: "An error occurred while adding the vendor.",
      });
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
  const handleCityChange = (value: string) => {
    setVendorData((prevData) => ({
      ...prevData,
      city: value,
    }));
  };

  const handleEditVendor = (index: number) => {
    console.log("ven", vendorArray[index]);

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
        toast({
          title: "Failed to fetch vendor data.",
        });
      }
    } catch (error) {
      toast({
        title: "An error occurred while fetching vendor data.",
      });
    }
  };

  useEffect(() => {
    fetchAllVendors();
  }, []);

  return (
    <Card>
      
      <CardContent>
        
      
        <Sheet>
        <div className="flex justify-between pt-4">
        <CardTitle>Vendor List</CardTitle>
          <SheetTrigger className="bg-primary  justify-end py-2 px-4 text-white  rounded ">
            Add Vendor
          </SheetTrigger>
          </div>
          <SheetContent>
            <SheetHeader>
              <SheetDescription>
                <form
                  onSubmit={onSubmitVendorDetails}
                  className="flex flex-wrap w-full  gap-7"
                >
                  <div className="flex flex-col gap-3 w-60 text-base relative">
                    <label className="font-bold">GSTN</label>
                    <Input
                      type="text"
                      name="vendor_gstn"
                      value={vendorData.vendor_gstn}
                      onChange={handleChangeVendorDetails}
                      placeholder="GSTN"
                      className="p-2"
                    />

                    <button
                      type="button"
                      onClick={handleSearchGSTN}
                      className="absolute right-0 top-14 transform -translate-y-1/2  px-1 py-1 rounded"
                    >
                      <IoIosSearch />
                    </button>
                    {errors.gstn && (
                      <p className="text-red-500">{errors.gstn}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 w-60 text-base">
                    <label className="font-bold">Company Name</label>
                    <Input
                      disabled
                      type="text"
                      name="company_name"
                      value={vendorData.company_name}
                      // onChange={handleChangeVendorDetails}
                      placeholder="Company Name"
                      className="p-2   "
                    />

                    {errors.company && (
                      <p className="text-red-500">{errors.company}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 w-60 text-base">
                    <label className="font-bold">PAN Card</label>
                    <Input
                      disabled
                      type="text"
                      name="pan_card"
                      value={vendorData.pan_card}
                      // onChange={handleChangeVendorDetails}
                      placeholder="PAN Card"
                      className="p-2   "
                    />
                    {errors.pan && <p className="text-red-500">{errors.pan}</p>}
                  </div>

                  <div className="flex flex-col gap-3 w-60 text-base">
                    <label className="font-bold">Address</label>
                    <Input
                      disabled
                      type="text"
                      name="address"
                      value={vendorData.address}
                      // onChange={handleChangeVendorDetails}
                      placeholder="Address"
                      className="p-2    "
                    />
                    {errors.address && (
                      <p className="text-red-500">{errors.address}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 w-60 text-base">
                    <label className="font-bold">Pin Code</label>
                    <Input
                      disabled
                      type="text"
                      name="pin_code"
                      value={vendorData.pin_code}
                      // onChange={handleChangeVendorDetails}
                      placeholder="Pin Code"
                      className="p-2   "
                    />
                    {errors.pin && <p className="text-red-500">{errors.pin}</p>}
                  </div>
                  <div className="flex flex-col gap-3 w-60 text-base">
                    <label className="font-bold">Person Name</label>
                    <Input
                      type="text"
                      name="person_name"
                      value={vendorData.person_name}
                      onChange={handleChangeVendorDetails}
                      placeholder="Person Name"
                      className="p-2   "
                    />
                    {errors.person && (
                      <p className="text-red-500">{errors.person}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 w-60 text-base">
                    <label className="font-bold">Contact No</label>
                    <Input
                      type="text"
                      name="contact_no"
                      value={vendorData.contact_no}
                      onChange={handleChangeVendorDetails}
                      placeholder="Contact No"
                      className="p-2   "
                    />
                    {errors.contact && (
                      <p className="text-red-500">{errors.contact}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 w-60 text-base">
                    <label className="font-bold">Email</label>
                    <Input
                      type="text"
                      name="email"
                      value={vendorData.email}
                      onChange={handleChangeVendorDetails}
                      placeholder="Email"
                      className="p-2   "
                    />
                    {errors.email && (
                      <p className="text-red-500">{errors.email}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 w-60 text-base">
                    <label className="font-bold">Website</label>
                    <Input
                      type="text"
                      name="website"
                      value={vendorData.website}
                      onChange={handleChangeVendorDetails}
                      placeholder="Website"
                      className="p-2   "
                    />
                    {errors.website && (
                      <p className="text-red-500">{errors.website}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-3 w-60 text-base">
                    <label className="font-bold">State</label>
                    <Select
                      onValueChange={handleStateChange}
                      value={vendorData.state}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {states.map((state) => (
                            <SelectItem key={state.value} value={state.value}>
                              {state.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {errors.state && (
                      <p className="text-red-500">{errors.state}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 w-60 text-base">
                    <label className="font-bold">City</label>
                    <Select
                      onValueChange={handleCityChange}
                      value={vendorData.city}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a city" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {cities.map((city) => (
                            <SelectItem key={city.value} value={city.value}>
                              {city.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {errors.city && (
                      <p className="text-red-500">{errors.city}</p>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="bg-primary text-white mt-8 py-2 px-4 rounded"
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
      </CardContent>
    </Card>
  );
};

export default VendorDetails;

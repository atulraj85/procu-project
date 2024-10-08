"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { IoIosSearch } from "react-icons/io";
import { validateGstn } from "@/lib/Validation";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { FiLoader } from "react-icons/fi";
import { z } from "zod";

// Define Zod schema for form validation
const companySchema = z.object({
  company_gstn: z.string().refine(validateGstn, { message: "Invalid GSTN" }),
  company_name: z.string().min(1, "Company name is required"),
  address: z.string().min(1, "Address is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),
});

type CompanyData = z.infer<typeof companySchema>;

type Error = Partial<Record<keyof CompanyData, string>>;

const Company: React.FC = () => {
  const [loader, setLoader] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const router = useRouter();

  const [companyData, setCompanyData] = useState<CompanyData>({
    company_gstn: "",
    company_name: "",
    address: "",
    email: "",
    phone: "",
  });

  const [errors, setErrors] = useState<Error>({});

  const validateFields = (): boolean => {
    try {
      companySchema.parse(companyData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Error = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof CompanyData;
          newErrors[field] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleChangeVendorDetails = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setCompanyData((prevData) => ({ ...prevData, [name]: value }));
  };

  const fetchCompanyDetails = async (GST: string) => {
    console.log(GST);
    try {
      // const response1 = await fetch(`/api/company?GST=${GST}`);
      // const result1 = await response1.json();

      // if (!result1.error) {
      //   toast({
      //     title: "Error",
      //     description: "User already exists.",
      //   });

        // window.location.reload();
        // return router.push("/dashboard");
      // } else {
        const response = await fetch(`/api/gst/${GST}`);
        const result = await response.json();
        console.log(GST);

        console.log(result);
        
        if (result.flag) {
          const data = result.data;
          setCompanyData({
            ...companyData,
            company_name: data.lgnm || "",
            address: data.pradr.adr || "",
          });
        } else {
          toast({
            title: "Failed to fetch company details.",
          });
        }
      // }
    } catch (error) {
      toast({
        title: "An error occurred while fetching company details details.",
      });
      console.error(error);
    }
    setLoader(false);
  };

  const handleSearchGSTN = () => {
    setLoader(true);
    if (validateGstn(companyData.company_gstn)) {
      fetchCompanyDetails(companyData.company_gstn);
    } else {
      toast({
        title: "Invalid GSTN.",
      });
      setLoader(false);
    }
  };

  const onSubmitDetails = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateFields()) {
      toast({
        title: "Please correct the errors in the form.",
      });
      return;
    }

    const formData = new FormData();
    Object.entries(companyData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    try {
      const response = await fetch("/api/company", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast({
          title: "Company Created Successfully.",
        });
        setCompanyData({
          company_gstn: "",
          company_name: "",
          address: "",
          email: "",
          phone: "",
        });
        router.push("/auth/register/company/admin/register");
      } else {
        toast({
          title: "Failed to submit company details.",
        });
      }
    } catch (error: unknown) {
      const prismaError = error as { code?: string };
      if (prismaError.code === "P2002") {
        toast({
          title: "User already exists",
        });
      } else {
        toast({
          title: `An error occurred while submitting the form. ${error}`,
        });
      }
    }
  };

  return (
    <div className="h-[90vh]">
      <h1 className="text-center text-4xl font-semibold mt-12">
        Create Company
      </h1>

      <div className="flex h-[80vh] items-center gap-16">
        <div className="relative flex justify-end">
          <img
            src="/images/pick-pages.png"
            alt="large auth splash image"
            className="w-[80%] rounded-xl"
          />
          <div className="absolute top-[60%] left-[30%]">
            <p className="text-[2.5rem] text-white font-[700]">
              Pr<span className="text-[#03B300]">o</span>cu
            </p>
            <p className="text-white text-[1.25rem] font-[700]">
              We're here to Increase your{" "}
              <span className="text-white">Productivity</span>
            </p>
          </div>
        </div>

        <div>
          <h2 className="container mx-auto p-4 text-2xl font-bold mb-4">
            Company Details
          </h2>
          <form
            onSubmit={onSubmitDetails}
            className="flex flex-col gap-7 w-[90%] container mx-auto mt-6"
          >
            <div className="flex gap-4">
              <div className="flex flex-col gap-3 w-60 text-base relative">
                <label className="font-bold">GSTN</label>
                <Input
                  type="text"
                  name="company_gstn"
                  value={companyData.company_gstn}
                  onChange={handleChangeVendorDetails}
                  placeholder="GSTN"
                  className="p-2"
                />
                <button
                  type="button"
                  onClick={handleSearchGSTN}
                  className="absolute right-0 top-14 transform -translate-y-1/2 px-1 py-1 rounded"
                >
                  {loader ? <FiLoader /> : <IoIosSearch />}
                </button>
                {errors.company_gstn && <p className="text-red-500">{errors.company_gstn}</p>}
              </div>

              <div className="flex flex-col gap-3 w-60 text-base">
                <label className="font-bold">Company Name</label>
                <Input
                  disabled
                  type="text"
                  name="company_name"
                  value={companyData.company_name}
                  placeholder="Company Name"
                  className="p-2"
                />
                {errors.company_name && <p className="text-red-500">{errors.company_name}</p>}
              </div>
            </div>

            <div className="flex gap-8">
              <div className="flex flex-col gap-3 w-60 text-base">
                <label className="font-bold">Address</label>
                <Input
                  disabled
                  type="text"
                  name="address"
                  value={companyData.address}
                  placeholder="Address"
                  className="p-2"
                />
                {errors.address && <p className="text-red-500">{errors.address}</p>}
              </div>

              <div className="flex flex-col gap-3 w-60 text-base">
                <label className="font-bold">Email</label>
                <Input
                  type="email"
                  name="email"
                  value={companyData.email}
                  placeholder="Email"
                  className="p-2"
                  onChange={handleChangeVendorDetails}
                />
                {errors.email && <p className="text-red-500">{errors.email}</p>}
              </div>
            </div>

            <div className="flex gap-8">
              <div className="flex flex-col gap-3 w-60 text-base">
                <label className="font-bold">Phone</label>
                <Input
                  type="tel"
                  name="phone"
                  value={companyData.phone}
                  placeholder="Phone"
                  className="p-2"
                  onChange={handleChangeVendorDetails}
                />
                {errors.phone && <p className="text-red-500">{errors.phone}</p>}
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-primary text-white mt-8 py-2 px-4 rounded"
                >
                  {isEditing ? "Update Vendor" : "Register"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Company;
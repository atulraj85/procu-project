"use client";
import CompanyAddresses from "@/components/rfpAddress/CompanyAddresses";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { useCurrentUser } from "@/hooks/auth";
import { getTodayDate } from "@/lib/getTodayDate";
import { FirstRFPSchema } from "@/schemas/FirstRFPSchema";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";

interface RFPProduct {
  description?: string | number | readonly string[] | undefined;
  modelNo?: string;
  quantity: number;
}

interface Approver {
  approverId: string;
  name?: string;
  email?: string;
}

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  mobile: string;
  companyId: string;
};

interface FormData {
  requirementType: string;
  dateOfOrdering: string;
  deliveryLocation: string;
  deliveryByDate: string;
  lastDateToRespond: string;
  rfpStatus: string;
  userId?: string;
  rfpId: string;
  rfpProducts: RFPProduct[];
  approvers: Approver[];
}

const RFPForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    requirementType: "Product",
    dateOfOrdering: getTodayDate(),
    deliveryLocation: "",
    deliveryByDate: "",
    lastDateToRespond: "",
    rfpStatus: "DRAFT",
    rfpProducts: [],
    rfpId: "",
    approvers: [],
  });
  const [rfpId, setRfpId] = useState<string>("");
  const [searchApproverTerm, setSearchApproverTerm] = useState("");
  const [searchProductTerm, setSearchProductTerm] = useState("");
  const [fetchedUsers, setFetchedUsers] = useState<User[]>([]);
  const [fetchedProducts, setFetchedProducts] = useState<RFPProduct[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<User[]>([]);
  const [userSelected, setUserSelected] = useState(false);
  // const [product, setProduct] = useState<RFPProduct>();
  const [productSelected, setProductSelected] = useState(false);
  const [approvedProducts, setApprovedProducts] = useState<RFPProduct[]>([]);
  // const [additionalInstructions, setAdditionalInstructions] =
  // useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const router = useRouter();

  const currentUser = useCurrentUser();
  const userId = currentUser?.id;

  const [userInfo, setUserInfo] = useState<User>();
  const [savedRFP, setSavedRFP] = useState(false);

  const [rfpAddress, setRfpAddress] = useState<string>("");
  const today = new Date().toISOString().split("T")[0];
  const newErrors: { [key: string]: string } = {};
  const [newProduct, setNewProduct] = useState({
    description: "",
    quantity: 1,
  });

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        // setLoading(true);
        const response = await fetch("/api/company");
        const data = await response.json();

        if (data.length > 0) {
          const company = data[0];
          const shippingAddress = company.addresses.find(
            (addr: any) => addr.addressType === "SHIPPING"
          );

          if (shippingAddress) {
          } else {
            console.warn("No shipping address found for the company");
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching company data:", error);
      }
    };

    fetchCompanyData();
  }, []);

  useEffect(() => {
    async function fetchUserInformation() {
      try {
        // setLoading(true);

        const response = await fetch(`/api/users?id=${userId}`);
        const data = await response.json();
        setUserInfo(data[0]);
        // setLoading(false);
      } catch (error) {}
    }
    fetchUserInformation();
  }, []);

  useEffect(() => {
    const fetchRfpId = async () => {
      try {
        // setLoading(true);
        console.log("Frontend: Starting RFP ID fetch");

        const response = await fetch("/api/rfp/rfpid");
        console.log("Frontend: Received response:", {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Frontend: Parsed response data:", data);

        if (!data) {
          throw new Error("No RFP ID received from server");
        }

        setRfpId(data);

        setFormData((prevData) => ({
          ...prevData,
          rfpId: data,
        }));
        console.log("Frontend: Successfully set RFP ID:", data);
      } catch (err) {
        console.error("Frontend: Error fetching RFP ID:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch RFP ID");
      } finally {
        setLoading(false);
      }
    };

    fetchRfpId();
  }, []);

  const handleSearchChange = async (
    e: ChangeEvent<HTMLInputElement>,
    entity: string
  ) => {
    newErrors.approvers = "";
    setErrors(newErrors);
    const value = e.target.value;
    if (entity === "users") {
      setSearchApproverTerm(value);
    } else if (entity === "products") {
      setSearchProductTerm(value);
    }
    setUserSelected(false);

    if (value) {
      try {
        const response = await fetch(`/api/ajax/${entity}?q=${value}`);
        const data = await response.json();

        if (entity === "users") {
          setFetchedUsers(data);
        } else if (entity === "products") {
          const formattedProducts = data.map((product: any) => ({
            ...product,
            rfpProductId:
              product.rfpProductId || product.id || String(product._id),
          }));
          setFetchedProducts(formattedProducts);
        }
      } catch (error) {
        console.error(`Error fetching ${entity}:`, error);
      }
    } else {
      setFetchedUsers([]);
      setUserSelected(false);
      setFetchedProducts([]);
      setProductSelected(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    errors.deliveryByDate = "";
    setErrors(errors);
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const addApprover = (user: User) => {
    setApprovedUsers((prevUsers) => [...prevUsers, user]);
    setFormData((prevData) => ({
      ...prevData,
      approvers: [...prevData.approvers, { approverId: String(user.id) }],
    }));
  };

  const removeApprover = (index: number) => {
    setApprovedUsers((prevUsers) => prevUsers.filter((_, i) => i !== index));
    setFormData((prevData) => ({
      ...prevData,
      approvers: prevData.approvers.filter((_, i) => i !== index),
    }));
  };

  const handleProductInputChange = (field: string, value: string | number) => {
    setNewProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addProduct = () => {
    if (newProduct.description.trim()) {
      const productToAdd = {
        description: newProduct.description,
        quantity: newProduct.quantity,
      };

      setApprovedProducts((prev) => [...prev, productToAdd]);
      setFormData((prev) => ({
        ...prev,
        rfpProducts: [...prev.rfpProducts, productToAdd],
      }));

      // Reset the form
      setNewProduct({
        description: "",
        quantity: 1,
      });
    }
  };

  const removeProduct = (index: number) => {
    setApprovedProducts((prevProducts) =>
      prevProducts.filter((_, i) => i !== index)
    );
    setFormData((prevData) => ({
      ...prevData,
      rfpProducts: prevData.rfpProducts.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    if (!formData.requirementType)
      newErrors.requirementType = "Requirement type is required";
    if (!formData.deliveryByDate)
      newErrors.deliveryByDate = "Expected delivery date is required";
    if (approvedUsers.length === 0)
      newErrors.approvers = "At least one approver is required";
    if (approvedProducts.length === 0)
      newErrors.products = "At least one product is required";
    if (!rfpAddress) newErrors.address = "Address is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // console.log("Errors", errors, "Formdata", formData);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    console.log("##########Form data", JSON.stringify(formData));

    const validation = FirstRFPSchema.safeParse(formData);

    if (!validation.success) {
      console.log("################ validation error", validation.error);

      return { error: "Invalid fields!" } as const;
    }

    // const deliveryLocation = `${address}, ${city}, ${state}, ${country}, ${zipCode}`;
    // const formattedDate = formData.dateOfOrdering.split("/").reverse().join("-");
    console.log(rfpAddress);
    const updatedFormData = {
      ...formData,
      deliveryLocation: rfpAddress,
      rfpId: rfpId,
      userId : currentUser?.id
    };

    setLoading(true);
    setError(null);

    console.log(
      "################# datav from create",
      JSON.stringify(formData)
    );

    try {
      const response = await fetch("/api/rfp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFormData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit RFP");
      }

      const result = await response.json();
      if (result) {
        toast({
          title: "🎉 Draft Submitted!",
          description: "Your RFP draft has been successfully submitted.",
        });
        // router.push("/dashboard/manager");
        setSavedRFP(true);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error submitting RFP. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative pb-10">
      <Card>
        <CardHeader>
          <div className=" flex justify-between">
            <div>
              <CardTitle>Create RFP</CardTitle>
            </div>

            {userInfo && (
              <div className="flex ">
                <h1 className="px-3">Name:- {userInfo.name}</h1>
                <h1 className="px-3">Role:- {userInfo.role}</h1>
                <h1 className="px-3">Current Date:- {getTodayDate()}</h1>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Card className="mb-4">
            <form onSubmit={handleSubmit} className="space-y-2">
              <CardHeader>
                {rfpId && (
                  <div className="flex justify-between">
                    <p className="text-md text-muted-foreground">
                      RFP ID: {rfpId}
                    </p>
                    <p>RFP Date: {getTodayDate()}</p>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-x-6">
                <div className="flex flex-row justify-between  gap-4">
                  {/* Requirement Type Section */}
                  <div className="flex space-x-4">
                    <div>Requirement Type:</div>
                    <div className="">
                      <input
                        type="radio"
                        id="product"
                        name="requirementType"
                        value="Product"
                        checked={formData.requirementType === "Product"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            requirementType: e.target.value,
                          })
                        }
                        className="text-primary focus:ring-primary"
                      />
                      <Label htmlFor="product" className="text-sm font-medium">
                        Product
                      </Label>
                    </div>
                    <div className="">
                      <input
                        type="radio"
                        id="service"
                        name="requirementType"
                        value="Service"
                        checked={formData.requirementType === "Service"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            requirementType: e.target.value,
                          })
                        }
                        className="text-primary focus:ring-primary"
                      />
                      <Label htmlFor="service" className="text-sm font-medium">
                        Service
                      </Label>
                    </div>
                  </div>

                  {/* Delivery Date Section */}
                  <div className="-mt-8">
                    <Label
                      htmlFor="deliveryByDate"
                      className="text-sm font-medium"
                    >
                      Expected Delivery Date
                    </Label>
                    <Input
                      id="deliveryByDate"
                      name="deliveryByDate"
                      type="date"
                      min={today}
                      value={
                        formData.deliveryByDate
                        // ? formData.deliveryByDate
                        // : getTodayDate()
                      }
                      onChange={handleInputChange}
                      className={` ${
                        errors.deliveryByDate ? "border-red-500" : ""
                      }`}
                    />
                    {errors.deliveryByDate && (
                      <p className="text-red-500 text-sm">
                        {errors.deliveryByDate}
                      </p>
                    )}
                  </div>

                  {/* Approvers Section */}
                  <div className="space-y-4">
                    <div>
                      <Input
                        type="text"
                        placeholder="Search Approvers..."
                        value={searchApproverTerm}
                        onChange={(e) => handleSearchChange(e, "users")}
                        className="w-full mb-2"
                      />
                    </div>

                    {/* Fetched Users */}
                    {fetchedUsers.length > 0 && (
                      <div className="border rounded-md p-2 mb-4  overflow-y-auto">
                        <h3 className="font-medium mb-2">Fetched Users:</h3>
                        <ul className="space-y-1">
                          {fetchedUsers.map((user) => (
                            <li
                              key={user.id}
                              className="py-1 px-2 cursor-pointer hover:bg-gray-100 rounded transition-colors"
                              onClick={() => {
                                if (user) {
                                  addApprover(user);
                                  setSearchApproverTerm("");
                                  setFetchedUsers([]);
                                }
                              }}
                            >
                              {user.name} | {user.email} | {user.mobile}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Selected Approvers */}
                    <div className="space-y-2">
                      {approvedUsers.map((approver, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between px-2 rounded-md"
                        >
                          <div className="flex">
                            <h3 className="text-sm">{approver.name} </h3>
                            <h3 className="text-sm">
                              {" "}
                              | Email:-{approver.email}
                            </h3>
                          </div>
                          <Button
                            type="button"
                            onClick={() => removeApprover(index)}
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    {errors.approvers && (
                      <p className="text-red-500 text-sm">{errors.approvers}</p>
                    )}
                  </div>
                </div>

                <div>
                  <CardTitle>Product Details</CardTitle>
                </div>
                <div className="space-y-4 mt-4">
                  {/* Product Input Form */}
                  <div className="flex items-center space-x-2">
                    {/*
                      <Input
                        placeholder="Product Name"
                        value={newProduct.name}
                        onChange={(e) =>
                          handleProductInputChange("name", e.target.value)
                        }
                        className="flex-1"
                      />
                       */}
                    <Input
                      placeholder="Product Description"
                      value={newProduct.description}
                      onChange={(e) =>
                        handleProductInputChange("description", e.target.value)
                      }
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="Qty"
                      min="1"
                      value={newProduct.quantity}
                      onChange={(e) =>
                        handleProductInputChange(
                          "quantity",
                          parseInt(e.target.value, 10) || 1
                        )
                      }
                      className="w-24"
                    />
                    <Button
                      type="button"
                      onClick={addProduct}
                      className="bg-primary text-white"
                    >
                      Add Product
                    </Button>
                  </div>

                  {/* Display Added Products */}
                  <div className="space-y-2">
                    {approvedProducts.map((product, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md"
                      >
                        <span className="">{product.description}</span>
                        <span className="w-24 text-center">
                          {product.quantity}
                        </span>
                        <Button
                          type="button"
                          onClick={() => removeProduct(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {errors.products && (
                    <p className="text-red-500 text-sm">{errors.products}</p>
                  )}
                </div>
              </CardContent>

              <div className="flex justify-end space-x-4 mr-10">
                <div className="flex absolute bottom-[-12px] gap-2">
                  <Button
                    type="submit"
                    className=" px-4  rounded-lg bg-primary"
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Save RFP"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      if (savedRFP) {
                        router.push(
                          `/dashboard/manager/rfp/quotation?rfp=${rfpId}`
                        );
                      }
                    }}
                    className="px-4 last:rounded-lg bg-primary"
                    disabled={!savedRFP}
                  >
                    Add Quotation
                  </Button>
                </div>
              </div>

              {error && <div className="text-red-500">{error}</div>}
            </form>

            <div className="">
              {userInfo && (
                <div>
                  <CompanyAddresses
                    companyId={userInfo.companyId}
                    setRfpAddress={setRfpAddress}
                    errors={errors}
                    setErrors={setErrors}
                  />
                </div>
              )}
            </div>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default RFPForm;

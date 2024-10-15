"use client";
import { updateProduct } from "@/actions/product/createProduct";
import CompanyAddresses from "@/components/rfpAddress/CompanyAddresses";
import SheetSide from "@/components/new-manager/Product";
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
  specification?: string | number | readonly string[] | undefined;
  rfpProductId: string;
  name?: string;
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
  rfpProducts: RFPProduct[];
  approvers: Approver[];
  // deliveryLocationDetails: {
  //   country: string;
  //   state: string;
  //   city: string;
  //   zipCode: string;
  // };
}

const RFPForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    requirementType: "Product",
    dateOfOrdering: getTodayDate(),
    deliveryLocation: "",
    deliveryByDate: getTodayDate(),
    lastDateToRespond: "",
    rfpStatus: "DRAFT",
    rfpProducts: [],
    approvers: [],
    // deliveryLocationDetails: {
    //   country: "",
    //   state: "",
    //   city: "",
    //   zipCode: "",
    // },
  });

  const [address, setAddress] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [zipCode, setZipCode] = useState<string>("");

  const [rfpId, setRfpId] = useState<string>("");
  const [searchApproverTerm, setSearchApproverTerm] = useState("");
  const [searchProductTerm, setSearchProductTerm] = useState("");
  const [fetchedUsers, setFetchedUsers] = useState<User[]>([]);
  const [fetchedProducts, setFetchedProducts] = useState<RFPProduct[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<User[]>([]);
  const [userSelected, setUserSelected] = useState(false);
  const [product, setProduct] = useState<RFPProduct>();
  const [productSelected, setProductSelected] = useState(false);
  const [approvedProducts, setApprovedProducts] = useState<RFPProduct[]>([]);
  const [additionalInstructions, setAdditionalInstructions] =
    useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [modifiedProducts, setModifiedProducts] = useState<Set<string>>(
    new Set()
  );
  const router = useRouter();

  const currentUser = useCurrentUser();
  const userId = currentUser?.id;

  const [userInfo, setUserInfo] = useState<User>();

  const [rfpAddress, setRfpAddress] = useState<string>("");

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await fetch("/api/company");
        const data = await response.json();

        if (data.length > 0) {
          const company = data[0];
          const shippingAddress = company.addresses.find(
            (addr: any) => addr.addressType === "SHIPPING"
          );

          if (shippingAddress) {
            setAddress(shippingAddress.street);
            setCountry(shippingAddress.country);
            setState(shippingAddress.state);
            setCity(shippingAddress.city);
            setZipCode(shippingAddress.postalCode);
          } else {
            console.warn("No shipping address found for the company");
          }
        }
      } catch (error) {
        console.error("Error fetching company data:", error);
      }
    };

    fetchCompanyData();
  }, []);

  useEffect(() => {
    async function fetchUserInformation() {
      try {
        const response = await fetch(`/api/users?id=${userId}`);
        const data = await response.json();
        setUserInfo(data[0]);
        // console.log("user", data[0]);
      } catch (error) {}
    }
    fetchUserInformation();
  }, []);

  useEffect(() => {
    const fetchRfpId = async () => {
      try {
        const response = await fetch("/api/rfp/rfpid");
        if (!response.ok) {
          throw new Error("Failed to fetch RFP ID");
        }
        const data = await response.json();
        setRfpId(data);
      } catch (err) {
        console.error("Error fetching RFP ID:", err);
      }
    };

    fetchRfpId();
  }, []);

  const handleSearchChange = async (
    e: ChangeEvent<HTMLInputElement>,
    entity: string
  ) => {
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
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const today = new Date().toISOString().split("T")[0];

  // Add function to handle form updates
  const handleProductChange = (
    index: number,
    field: keyof RFPProduct,
    value: RFPProduct[keyof RFPProduct]
  ) => {
    const updatedProducts = [...approvedProducts];
    const product = updatedProducts[index];

    if (field === "specification") {
      setModifiedProducts((prev) => new Set(prev).add(product.rfpProductId));
    }

    updatedProducts[index] = { ...product, [field]: value };
    setApprovedProducts(updatedProducts);

    setFormData((prevData) => ({
      ...prevData,
      rfpProducts: updatedProducts.map(
        ({ rfpProductId, quantity, specification, name, modelNo }) => ({
          rfpProductId,
          quantity,
          specification,
          name,
          modelNo,
        })
      ),
    }));
  };

  const addApprover = (user: User) => {
    setApprovedUsers((prevUsers) => [...prevUsers, user]);
    setFormData((prevData) => ({
      ...prevData,
      approvers: [...prevData.approvers, { approverId: String(user.id) }],
    }));
  };
  const handleProductUpdate = async (
    productId: string,
    specification: string
  ) => {
    try {
      await updateProduct(productId, {
        specification: specification,
      });

      // Remove product from modified set after successful update
      setModifiedProducts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });

      toast({
        title: "Product Updated",
        description: "Product specification has been successfully updated.",
      });
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update product specification.",
        variant: "destructive",
      });
    }
  };

  const removeApprover = (index: number) => {
    setApprovedUsers((prevUsers) => prevUsers.filter((_, i) => i !== index));
    setFormData((prevData) => ({
      ...prevData,
      approvers: prevData.approvers.filter((_, i) => i !== index),
    }));
  };

  const addProduct = (product: RFPProduct) => {
    if (!product.rfpProductId) {
      console.error("Product ID is missing");
      return;
    }

    const productExists = approvedProducts.some(
      (p) => p.rfpProductId === product.rfpProductId
    );

    if (!productExists) {
      const newProduct = { ...product, quantity: 1 };
      setApprovedProducts((prevProducts) => [...prevProducts, newProduct]);
      setFormData((prevData) => ({
        ...prevData,
        rfpProducts: [
          ...prevData.rfpProducts,
          {
            rfpProductId: String(product.rfpProductId),
            quantity: 1,
            specification: product.specification,
            name: product.name,
            modelNo: product.modelNo,
          },
        ],
      }));
      setSearchProductTerm("");
      setFetchedProducts([]);
    } else {
      console.warn(`Product with ID ${product.rfpProductId} already exists.`);
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
    const newErrors: { [key: string]: string } = {};

    if (!formData.requirementType)
      newErrors.requirementType = "Requirement type is required";
    if (!formData.deliveryByDate)
      newErrors.deliveryByDate = "Expected delivery date is required";
    if (approvedUsers.length === 0)
      newErrors.approvers = "At least one approver is required";
    if (approvedProducts.length === 0)
      newErrors.products = "At least one product is required";
    if (!address) newErrors.address = "Address is required";
    if (!country) newErrors.country = "Country is required";
    if (!state) newErrors.state = "State is required";
    if (!city) newErrors.city = "City is required";
    if (!zipCode) newErrors.zipCode = "Zip code is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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

      // deliveryLocationDetails: {
      //   country,
      //   state,
      //   city,
      //   zipCode,
      // },
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
        router.push("/dashboard/manager");
        // window.location.reload();
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
                      value={formData.deliveryByDate}
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
                  </div>
                </div>

                <div className="">
                  <CardHeader>
                    <CardTitle>Product Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center mb-4 space-x-2">
                      <Input
                        type="text"
                        placeholder="Search Products..."
                        value={searchProductTerm}
                        onChange={(e) => handleSearchChange(e, "products")}
                        className="flex-1"
                      />
                      <SheetSide />
                    </div>

                    {fetchedProducts.length > 0 && (
                      <div className="mt-2">
                        <h3 className="font-semibold">Fetched Products:</h3>
                        <ul>
                          {fetchedProducts.map((product) => (
                            <li
                              key={product.rfpProductId}
                              className="py-1 cursor-pointer hover:bg-gray-200"
                              onClick={() => {
                                if (product) {
                                  addProduct(product);
                                } else {
                                  console.error("No Product selected");
                                }
                              }}
                            >
                              {product.name} | {product.modelNo}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {approvedProducts.map((product, index) => (
                      <div
                        key={product.rfpProductId}
                        className="flex items-center space-x-2 mb-2"
                      >
                        <div className="flex flex-col">
                          <Label
                            className={`mb-2 font-bold text-[16px] text-slate-700 ${
                              index > 0 ? "hidden" : "visible"
                            }`}
                          >
                            Product
                          </Label>
                          <Input
                            disabled
                            value={product.name}
                            placeholder="Name"
                            className="flex-1"
                          />
                        </div>
                        <div className="flex flex-col">
                          <Label
                            className={`mb-2 font-bold text-[16px] text-slate-700 ${
                              index > 0 ? "hidden" : "visible"
                            }`}
                          >
                            Product Description
                          </Label>
                          <div className="flex space-x-2">
                            <Input
                              value={product.specification}
                              onChange={(e) =>
                                handleProductChange(
                                  index,
                                  "specification",
                                  e.target.value
                                )
                              }
                              placeholder="Enter product description"
                              className="flex-1"
                            />
                            {modifiedProducts.has(product.rfpProductId) && (
                              <Button
                                type="button"
                                onClick={() =>
                                  handleProductUpdate(
                                    product.rfpProductId,
                                    product.specification as string
                                  )
                                }
                                className="bg-white hover:bg-white"
                              >
                                {/* Update */}
                                <Save
                                  size={20}
                                  strokeWidth={0.75}
                                  color="green"
                                />
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col w-1/12">
                          <Label
                            className={`mb-2 font-bold text-[16px] text-slate-700 ${
                              index > 0 ? "hidden" : "visible"
                            }`}
                          >
                            Quantity
                          </Label>
                          <Input
                            type="number"
                            value={product.quantity}
                            onChange={(e) =>
                              handleProductChange(
                                index,
                                "quantity",
                                parseInt(e.target.value, 10)
                              )
                            }
                            placeholder="Quantity"
                            className="flex-1"
                          />
                        </div>
                        <div className="flex flex-col">
                          <Label
                            className={`mb-2 font-bold text-[16px]  text-white ${
                              index > 0 ? "hidden" : "visible"
                            }`}
                          >
                            kkk
                          </Label>
                          <Button
                            type="button"
                            onClick={() => removeProduct(index)}
                            variant="outline"
                            size="icon"
                            className="text-red-500"
                          >
                            <X className="h-4 w-4 " />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {errors.products && (
                      <p className="text-red-500 text-sm">{errors.products}</p>
                    )}
                  </CardContent>
                </div>
              </CardContent>

              <div className="flex justify-end space-x-4 mr-10">
                <Button
                  type="submit"
                  className=" absolute bottom-[-12px]  px-4  rounded-lg bg-primary"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Save Draft RFP"}
                </Button>
              </div>

              {error && <div className="text-red-500">{error}</div>}
            </form>

            <div className="mx-6 mb-4 mt-[-6px]">
              {userInfo && (
                <CompanyAddresses
                  companyId={userInfo.companyId}
                  setRfpAddress={setRfpAddress}
                />
              )}
            </div>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default RFPForm;

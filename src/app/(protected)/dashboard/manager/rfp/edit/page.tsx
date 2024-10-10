"use client";
import SheetSide from "@/components/new-manager/Product";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { getTodayDate } from "@/lib/getTodayDate";
import { FirstRFPSchema } from "@/schemas/FirstRFPSchema";
import { X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";

interface RFPProduct {
  specification?: string | number | readonly string[] | undefined;
  productId: string;
  name?: string;
  modelNo?: string;
  quantity: number;
}

interface Approver {
  approverId: string;
  name?: string;
  email?: string;
  mobile?: string;
}

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  mobile: string;
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
  deliveryLocationDetails: {
    country: string;
    state: string;
    city: string;
    zipCode: string;
  };
  additionalInstructions?: string;
}

const EditRFPForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    requirementType: "Product",
    dateOfOrdering: getTodayDate(),
    deliveryLocation: "",
    deliveryByDate: "",
    lastDateToRespond: "",
    rfpStatus: "DRAFT",
    rfpProducts: [],
    approvers: [],
    deliveryLocationDetails: {
      country: "",
      state: "",
      city: "",
      zipCode: "",
    },
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
  const [approvedProducts, setApprovedProducts] = useState<RFPProduct[]>([]);
  const [additionalInstructions, setAdditionalInstructions] =
    useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [userInfo, setUserInfo] = useState<User>();

  const router = useRouter();
  const searchParams = useSearchParams();
  const urlRfpId = searchParams.get("rfp");
  const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .split("/")
      .join("/");
  };

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchRFPData = async () => {
      if (!urlRfpId) return;

      try {
        const response = await fetch(`/api/rfp?rfpId=${urlRfpId}`);
        if (!response.ok) throw new Error("Failed to fetch RFP data");
        const data = await response.json();
        const rfpData = data[0];

        // Extract delivery location details
        const [
          extractedAddress,
          extractedCity,
          extractedState,
          extractedCountry,
          extractedZipCode,
        ] = rfpData.deliveryLocation.split(", ");

        setRfpId(rfpData.rfpId);
        setAddress(extractedAddress);
        setCity(extractedCity);
        setState(extractedState);
        setCountry(extractedCountry);
        setZipCode(extractedZipCode);

        // Update approved products
        const formattedProducts = rfpData.products.map((product: any) => ({
          productId: product.rfpProductId,
          name: product.name,
          modelNo: product.modelNo,
          quantity: product.quantity,
          specification: product.description,
        }));
        setApprovedProducts(formattedProducts);

        // Update approved users
        const formattedApprovers = rfpData.approvers.map((approver: any) => ({
          id: approver.email,
          name: approver.name,
          email: approver.email,
          role: "Approver",
          mobile: approver.mobile,
        }));
        setApprovedUsers(formattedApprovers);

        // Set user info
        if (rfpData.createdBy) {
          setUserInfo({
            id: 1,
            name: rfpData.createdBy.name,
            email: rfpData.createdBy.email,
            role: rfpData.createdBy.role,
            mobile: rfpData.createdBy.mobile,
          });
        }

        // Update form data
        setFormData({
          requirementType: rfpData.requirementType,
          dateOfOrdering: rfpData.dateOfOrdering,
          deliveryLocation: rfpData.deliveryLocation,
          deliveryByDate: rfpData.deliveryByDate.split("T")[0],
          lastDateToRespond: rfpData.lastDateToRespond,
          rfpStatus: rfpData.rfpStatus,
          rfpProducts: formattedProducts,
          approvers: rfpData.approvers.map((approver: any) => ({
            approverId: approver.email,
            name: approver.name,
            email: approver.email,
            mobile: approver.mobile,
          })),
          deliveryLocationDetails: {
            country: extractedCountry,
            state: extractedState,
            city: extractedCity,
            zipCode: extractedZipCode,
          },
        });
      } catch (error) {
        console.error("Error fetching RFP data:", error);
        setError("Failed to load RFP data");
      }
    };

    fetchRFPData();
  }, [urlRfpId]);

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

    if (value) {
      try {
        const response = await fetch(`/api/ajax/${entity}?q=${value}`);
        const data = await response.json();

        if (entity === "users") {
          setFetchedUsers(data);
        } else if (entity === "products") {
          const formattedProducts = data.map((product: any) => ({
            ...product,
            productId: product.productId || product.id || String(product._id),
          }));
          setFetchedProducts(formattedProducts);
        }
      } catch (error) {
        console.error(`Error fetching ${entity}:`, error);
      }
    } else {
      if (entity === "users") {
        setFetchedUsers([]);
      } else {
        setFetchedProducts([]);
      }
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    switch (name) {
      case "address":
        setAddress(value);
        break;
      case "country":
        setCountry(value);
        break;
      case "state":
        setState(value);
        break;
      case "city":
        setCity(value);
        break;
      case "zipCode":
        setZipCode(value);
        break;
    }
  };

  const handleProductChange = (
    index: number,
    field: keyof RFPProduct,
    value: RFPProduct[keyof RFPProduct]
  ) => {
    const updatedProducts = [...approvedProducts];
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    setApprovedProducts(updatedProducts);

    setFormData((prevData) => ({
      ...prevData,
      rfpProducts: updatedProducts,
    }));
  };

  const addApprover = (user: User) => {
    const approverExists = approvedUsers.some(
      (existingUser) => existingUser.email === user.email
    );

    if (!approverExists) {
      setApprovedUsers((prevUsers) => [...prevUsers, user]);
      setFormData((prevData) => ({
        ...prevData,
        approvers: [
          ...prevData.approvers,
          {
            approverId: user.email,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
          },
        ],
      }));
      setSearchApproverTerm("");
      setFetchedUsers([]);
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
    const productExists = approvedProducts.some(
      (p) => p.productId === product.productId
    );

    if (!productExists) {
      const newProduct = { ...product, quantity: 1 };
      setApprovedProducts((prevProducts) => [...prevProducts, newProduct]);
      setFormData((prevData) => ({
        ...prevData,
        rfpProducts: [...prevData.rfpProducts, newProduct],
      }));
      setSearchProductTerm("");
      setFetchedProducts([]);
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
    if (formData.approvers.length === 0)
      newErrors.approvers = "At least one approver is required";
    if (formData.rfpProducts.length === 0)
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
    console.log("##########Form data", JSON.stringify(formData));

    const validation = FirstRFPSchema.safeParse(formData);

    if (!validation.success) {
      console.log("################ validation error", validation.error);

      return { error: "Invalid fields!" } as const;
    }

    if (!validateForm()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const deliveryLocation = `${address}, ${city}, ${state}, ${country}, ${zipCode}`;
    const updatedFormData = {
      ...formData,
      deliveryLocation,
      deliveryLocationDetails: {
        country,
        state,
        city,
        zipCode,
      },
    };

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/rfp/${urlRfpId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFormData),
      });

      if (!response.ok) {
        throw new Error("Failed to update RFP");
      }

      toast({
        title: "Success",
        description: "RFP updated successfully",
      });

      router.push("/dashboard/manager");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while updating the RFP"
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between">
            <div>
              <CardTitle>Edit RFP</CardTitle>
            </div>
            {userInfo && (
              <div className="flex">
                <h1 className="px-3">Name: {userInfo.name}</h1>
                <h1 className="px-3">Role: {userInfo.role}</h1>
                <h1 className="px-3">Current Date: {getTodayDate()}</h1>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Card className="mb-4">
            <CardHeader>
              {rfpId && (
                <div className="flex justify-between">
                  <p className="text-md text-muted-foreground">
                    RFP ID: {rfpId}
                  </p>
                  <p>RFP Date: {formatDate(formData.dateOfOrdering)}</p>
                </div>
              )}
            </CardHeader>
            <CardContent className="grid grid-cols-4 gap-2">
              <div className="space-y-1 text-[19px]">
                <Label>Requirement Type</Label>
                <div className="flex space-x-4 mt-2">
                  <div className="flex items-center space-x-2">
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
                    />
                    <Label htmlFor="product">Product</Label>
                  </div>
                  <div className="flex items-center space-x-2">
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
                    />
                    <Label htmlFor="service">Service</Label>
                  </div>
                </div>
                {errors.requirementType && (
                  <p className="text-red-500 text-sm">
                    {errors.requirementType}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryByDate">Expected Delivery Date</Label>
                <Input
                  id="deliveryByDate"
                  name="deliveryByDate"
                  type="date"
                  min={today}
                  value={formData.deliveryByDate}
                  onChange={handleInputChange}
                  className={errors.deliveryByDate ? "border-red-500" : ""}
                />
                {errors.deliveryByDate && (
                  <p className="text-red-500 text-sm">
                    {errors.deliveryByDate}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-4">
            <CardHeader>
              <div className="flex justify-between">
                <div className="text-md">
                  <p className="text-md text-muted-foreground">
                    Approver Details (for GRN)
                  </p>
                </div>
                <div>
                  <Input
                    type="text"
                    placeholder="Search Approvers..."
                    value={searchApproverTerm}
                    onChange={(e) => handleSearchChange(e, "users")}
                    className="flex-1"
                  />
                </div>
              </div>
              {errors.approvers && (
                <p className="text-red-500 text-sm">{errors.approvers}</p>
              )}
            </CardHeader>
            <CardContent>
              {fetchedUsers.length > 0 && (
                <div className="mt-2">
                  <h3 className="font-semibold">Fetched Users:</h3>
                  <ul>
                    {fetchedUsers.map((user) => (
                      <li
                        key={user.id}
                        className="py-1 cursor-pointer hover:bg-gray-200"
                        onClick={() => addApprover(user)}
                      >
                        {user.name} | {user.email} | {user.mobile}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {approvedUsers.map((approver, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <div className="flex flex-col text-md">
                    {/* <Label className={`mb-2 font-bold text-[16px] text-slate-700 ${
                        index > 0 ? "hidden" : "visible"
                      }`}>
                        Approver Name
                      </Label> */}
                    <h1>Mobile:-{approver.name} |</h1>
                    {/* <Input
                        disabled
                        value={approver.name}
                        placeholder="Name"
                        className="flex-1"
                      /> */}
                  </div>
                  <div className="flex flex-col text-md">
                    {/* <Label className={`mb-2 font-bold text-[16px] text-slate-700 ${
                        index > 0 ? "hidden" : "visible"
                      }`}>
                        Email
                      </Label>/ */}
                    <h1>Mobile:-{approver.email} |</h1>
                    {/* <Input
                        disabled
                        value={approver.email}
                        placeholder="Email"
                        className="flex-1"
                      /> */}
                  </div>
                  <div className="flex flex-col text-md">
                    {/* <Label className={`mb-2 font-bold text-[16px] text-slate-700 ${
                        index > 0 ? "hidden" : "visible"
                      }`}>
                        Phone
                      </Label> */}
                    {/* <Input
                        disabled
                        value={approver.mobile}
                        placeholder="Phone"
                        className="flex-1"
                      /> */}
                    <h1>Mobile:-{approver.mobile}</h1>
                  </div>
                  <div className="flex flex-col">
                    {/* <Label className={`mb-8 font-bold text-[16px] text-slate-700 ${
                        index > 0 ? "hidden" : "visible"
                      }`}></Label> */}
                    <Button
                      type="button"
                      onClick={() => removeApprover(index)}
                      variant="outline"
                      size="icon"
                      className="text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="mb-4">
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
                        key={product.productId}
                        className="py-1 cursor-pointer hover:bg-gray-200"
                        onClick={() => addProduct(product)}
                      >
                        {product.name} | {product.modelNo}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {approvedProducts.map((product, index) => (
                <div
                  key={product.productId}
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
                  <div className="flex flex-col w-[50%]">
                    <Label
                      className={`mb-2 font-bold text-[16px] text-slate-700 ${
                        index > 0 ? "hidden" : "visible"
                      }`}
                    >
                      Product Description
                    </Label>
                    <Input
                      // disabled
                      value={product.specification}
                      placeholder="Model"
                      className="flex-1"
                    />
                  </div>
                  <div className="flex flex-col">
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
                      className={`mb-8 font-bold text-[16px] text-slate-700 ${
                        index > 0 ? "hidden" : "visible"
                      }`}
                    ></Label>
                    <Button
                      type="button"
                      onClick={() => removeProduct(index)}
                      variant="outline"
                      size="icon"
                      className="text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {errors.products && (
                <p className="text-red-500 text-sm">{errors.products}</p>
              )}
            </CardContent>
          </Card>

          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Delivery Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={errors.address ? "border-red-500" : ""}
                />
                {errors.address && (
                  <p className="text-red-500 text-sm">{errors.address}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className={errors.country ? "border-red-500" : ""}
                  />
                  {errors.country && (
                    <p className="text-red-500 text-sm">{errors.country}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className={errors.state ? "border-red-500" : ""}
                  />
                  {errors.state && (
                    <p className="text-red-500 text-sm">{errors.state}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={errors.city ? "border-red-500" : ""}
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm">{errors.city}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input
                    id="zipCode"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className={errors.zipCode ? "border-red-500" : ""}
                  />
                  {errors.zipCode && (
                    <p className="text-red-500 text-sm">{errors.zipCode}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="additionalInstructions">
                  Additional Delivery Instructions
                </Label>
                <Textarea
                  id="additionalInstructions"
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end mr-10">
            <Button
              type="submit"
              className="px-4 py-2 rounded-lg bg-green-700"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update RFP"}
            </Button>
          </div>

          {error && <div className="text-red-500">{error}</div>}
        </CardContent>
      </Card>
    </form>
  );
};

export default EditRFPForm;

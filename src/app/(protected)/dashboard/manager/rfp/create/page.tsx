"use client";
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Sheet, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import SheetSide from "@/components/new-manager/Product";
import { useRouter } from "next/navigation";
import { getTodayDate } from "@/lib/getTodayDate";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
}

type User = {
  id: number;
  name: string;
  email: string;
  role:string,
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
  const [user, setUser] = useState<User>();
  const [userSelected, setUserSelected] = useState(false);
  const [product, setProduct] = useState<RFPProduct>();
  const [productSelected, setProductSelected] = useState(false);
  const [approvedProducts, setApprovedProducts] = useState<RFPProduct[]>([]);
  const [additionalInstructions, setAdditionalInstructions] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const router = useRouter();
  const userId = localStorage.getItem("USER_ID");
  const [userInfo , setUserInfo] =useState<User>()

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

   useEffect(()=>{
    async function fetchUserInformation () {
    try {
      const response = await fetch(`/api/users?id=${userId}`);
      const data = await response.json();
      setUserInfo(data[0])
      console.log("user",data[0]);
      
    } catch (error) {
      
    }
    
   }
   fetchUserInformation()
  },[])
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

  useEffect(() => {
    const userId = localStorage.getItem("USER_ID");
    if (userId) {
      setFormData((prevData) => ({ ...prevData, userId }));
    }
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
            productId: product.productId || product.id || String(product._id),
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
      deliveryLocation: `${value}, ${prevData.deliveryLocationDetails.city}, ${prevData.deliveryLocationDetails.state}, ${prevData.deliveryLocationDetails.country}, ${prevData.deliveryLocationDetails.zipCode}`,
    }));
    if (name === "country") {
      setCountry(value);
    } else if (name === "state") {
      setState(value);
    } else if (name === "city") {
      setCity(value);
    } else if (name === "zipCode") {
      setZipCode(value);
    }
  };

  const today = new Date();
  const formattedToday = today.toISOString().slice(0, 16);

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
      rfpProducts: updatedProducts.map(({ productId, quantity, specification, name, modelNo }) => ({
        productId,
        quantity,
        specification,
        name,
        modelNo
      })),
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

  const addProduct = (product: RFPProduct) => {
    if (!product.productId) {
      console.error("Product ID is missing");
      return;
    }
  
    const productExists = approvedProducts.some(
      (p) => p.productId === product.productId
    );
  
    if (!productExists) {
      const newProduct = { ...product, quantity: 1 };
      setApprovedProducts((prevProducts) => [...prevProducts, newProduct]);
      setFormData((prevData) => ({
        ...prevData,
        rfpProducts: [
          ...prevData.rfpProducts,
          { 
            productId: String(product.productId), 
            quantity: 1,
            specification: product.specification,
            name: product.name,
            modelNo: product.modelNo
          },
        ],
      }));
      setSearchProductTerm("");
      setFetchedProducts([]);
    } else {
      console.warn(`Product with ID ${product.productId} already exists.`);
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

    if (!formData.requirementType) newErrors.requirementType = "Requirement type is required";
    if (!formData.deliveryByDate) newErrors.deliveryByDate = "Expected delivery date is required";
    if (approvedUsers.length === 0) newErrors.approvers = "At least one approver is required";
    if (approvedProducts.length === 0) newErrors.products = "At least one product is required";
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
      if(result){
      toast({
        title: "🎉 Draft Submitted!",
        description: "Your RFP draft has been successfully submitted.",
      });
      router.push("/dashboard/manager");
      window.location.reload();
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
    <form onSubmit={handleSubmit} className="space-y-6">
    <Card>
      <CardHeader>
        <div className=" flex justify-between">
        <div>
        <CardTitle>Create RFP</CardTitle>
        </div>

        {userInfo && 
        <div className="flex ">
          <h1 className="px-3">Name:- {userInfo.name}</h1>
          <h1 className="px-3">Role:- {userInfo.role}</h1>
          <h1 className="px-3">Current Date:- {getTodayDate()}</h1>
        </div>
}
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
                <p>RFP Date: {getTodayDate()}</p>
              </div>
            )}
          </CardHeader>
          <CardContent className="grid grid-cols-4 gap-2">
            <div className="space-y-1 text-[19px]">
              <Label htmlFor="requirementType">Requirement Type</Label>
              <Select
                value={formData.requirementType}
                onValueChange={(value) =>
                  setFormData((prevData) => ({ ...prevData, requirementType: value }))
                }
              >
                <SelectTrigger className={errors.requirementType ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select requirement type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Product">Product</SelectItem>
                  <SelectItem value="Service">Service</SelectItem>
                </SelectContent>
              </Select>
              {errors.requirementType && (
                <p className="text-red-500 text-sm">{errors.requirementType}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryByDate">Expected Delivery Date</Label>
              <Input
                id="deliveryByDate"
                name="deliveryByDate"
                type="datetime-local"
                min={formattedToday}
                value={formData.deliveryByDate}
                onChange={handleInputChange}
                className={errors.deliveryByDate ? "border-red-500" : ""}
              />
              {errors.deliveryByDate && (
                <p className="text-red-500 text-sm">{errors.deliveryByDate}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <div className="flex justify-between">
              <div>
                <CardTitle>Approver Details (for GRN)</CardTitle>
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
                        onClick={() => {
                          if (user) {
                            addApprover(user);
                            setSearchApproverTerm("");
                            setFetchedUsers([]);
                          } else {
                            console.error("No user selected");
                          }
                        }}
                      >
                        {user.name} | {user.email} | {user.mobile}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {approvedUsers.map((approver, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <div className="flex flex-col">
                    <Label
                      className={`mb-2 font-bold text-[16px] text-slate-700 ${
                        index > 0 ? "hidden" : "visible"
                      }`}
                    >
                      Approver Name
                    </Label>
                    <Input
                      disabled
                      value={approver.name}
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
                      Email
                    </Label>
                    <Input
                      disabled
                      value={approver.email}
                      placeholder="Email"
                      className="flex-1"
                    />
                  </div>
                  <div className="flex flex-col">
                    <Label
                      className={`mb-2 font-bold text-[16px] text-slate-700 ${
                        index > 0 ? "hidden" : "visible"
                      }`}
                    >
                      Phone
                    </Label>
                    <Input
                      disabled
                      value={approver.mobile}
                      placeholder="Phone"
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
                      disabled
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
                      <X className="h-4 w-4 " />
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
              {loading ? "Submitting..." : "Save Draft RFP"}
            </Button>
          </div>

          {error && <div className="text-red-500">{error}</div>}
        </CardContent>
      </Card>
    </form>
  );
};

export default RFPForm;
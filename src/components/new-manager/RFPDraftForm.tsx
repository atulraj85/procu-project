import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Sheet, X } from "lucide-react";

import SheetSide from "./Product";
import { toast } from "../ui/use-toast";

interface RFPProduct {
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

function getTodayDate(): string {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed, so add 1
  const year = today.getFullYear(); // Get the full year

  return `${day}/${month}/${year}`;
}

const RFPForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    requirementType: "",
    dateOfOrdering: getTodayDate(),
    deliveryLocation: "",
    deliveryByDate: "27/07/2024",
    lastDateToRespond: "hii",
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
  const [additionalInstructions, setAdditionalInstructions] =
    useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await fetch("/api/company"); // Replace with your actual API endpoint
        const data = await response.json();

        // Assuming the API returns an array and you want the first item
        if (data.length > 0) {
          const company = data[0];
          setAddress(company.address.street);
          setCountry(company.address.country);
          setState(company.address.state);
          setCity(company.address.city);
          setZipCode(company.address.zip);
          // You can set additional instructions if needed
        }
      } catch (error) {
        console.error("Error fetching company data:", error);
      }
    };

    fetchCompanyData();
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
          // Ensure productId is set correctly
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
      rfpProducts: updatedProducts.map(({ productId, quantity }) => ({
        productId,
        quantity,
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
          { productId: String(product.productId), quantity: 1 },
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const deliveryLocation = `${address}, ${city}, ${state}, ${country}, ${zipCode}`;
    // Create updatedFormData without including the address
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

    // console.log("form data", updatedFormData);

    setLoading(true); // Set loading state to true
    setError(null); // Reset error state

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
      toast({
        title: "🎉 Draft Submitted!",
        description: response.ok,
      });
    } catch (err) {
      // toast({
      //   title: "Error",
      //   description: "",
      //   });
      setError(
        err instanceof Error
          ? err.message
          : "Error submitting RFP. Please try again later."
      );
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Request for Product</CardTitle>
          {rfpId && (
            <div className="flex justify-between">
              <p className="text-md text-muted-foreground">RFP ID: {rfpId}</p>
              <p>Date of Ordering: {getTodayDate()}</p>
            </div>
          )}
        </CardHeader>
        <CardContent className="grid grid-cols-4 gap-2">
          <div className="space-y-3 text-[19px]">
            <Label htmlFor="requirementType">Requirement Type</Label>
            <div className="flex items-center">
              <input
                type="radio"
                id="product"
                name="requirementType"
                value="Product"
                checked={formData.requirementType === "Product"}
                onChange={handleInputChange}
                className="mr-2"
              />
              <Label htmlFor="product" className="mr-4">
                Product
              </Label>

              <input
                type="radio"
                id="service"
                name="requirementType"
                value="Service"
                checked={formData.requirementType === "Service"}
                onChange={handleInputChange}
                className="mr-2"
              />
              <Label htmlFor="service">Service</Label>
            </div>
          </div>
          {/* <div className="space-y-2">
            <Label htmlFor="dateOfOrdering">Date of Ordering</Label>
            <Input
              id="dateOfOrdering"
              name="dateOfOrdering"
              type="datetime-local"
              value={formData.dateOfOrdering}
              onChange={handleInputChange}
            />
          </div> */}
          <div className="space-y-2">
            <Label htmlFor="deliveryByDate">Delivery By Date</Label>
            <Input
              id="deliveryByDate"
              name="deliveryByDate"
              type="datetime-local"
              value={formData.deliveryByDate}
              onChange={handleInputChange}
            />
          </div>
          {/* <div className="space-y-2">
            <Label htmlFor="lastDateToRespond">Last Date to Respond</Label>
            <Input
              id="lastDateToRespond"
              name="lastDateToRespond"
              type="datetime-local"
              value={formData.lastDateToRespond}
              onChange={handleInputChange}
            />
          </div> */}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Approver Details (for GRN)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4 space-x-2">
            <Input
              type="text"
              placeholder="Search Approvers..."
              value={searchApproverTerm}
              onChange={(e) => handleSearchChange(e, "users")}
              className="flex-1"
            />
            {/* <Button
              type="button"
              onClick={() => {
                // if (user) {
                //   addApprover(user);
                //   setSearchApproverTerm("");
                //   setFetchedUsers([]);
                // } else {
                //   console.error("No user selected");
                // }
              }}
              variant="outline"
              className={userSelected ? "bg-green-500" : ""}
            >
              <Plus />
            </Button> */}
          </div>

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
                    index === 1 ? "hidden" : "visible"
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
                    index === 1 ? "hidden" : "visible"
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
                    index === 1 ? "hidden" : "visible"
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
                    index === 1 ? "hidden" : "visible"
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

      <Card>
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
                    index === 1 ? "hidden" : "visible"
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
                    index === 1 ? "hidden" : "visible"
                  }`}
                >
                  Model No
                </Label>
                <Input
                  disabled
                  value={product.modelNo}
                  placeholder="Model"
                  className="flex-1"
                />
              </div>
              <div className="flex flex-col">
                <Label
                  className={`mb-2 font-bold text-[16px] text-slate-700 ${
                    index === 1 ? "hidden" : "visible"
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
                    index === 1 ? "hidden" : "visible"
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
        </CardContent>
      </Card>
      <Card>
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
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">Zip Code</Label>
              <Input
                id="zipCode"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
              />
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
    </form>
  );
};

export default RFPForm;

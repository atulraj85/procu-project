import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";

interface RFPProduct {
  id: string;
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
  id: number; // or string, depending on your API
  name: string;
  email: string;
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
}

const RFPForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    requirementType: "",
    dateOfOrdering: "",
    deliveryLocation: "",
    deliveryByDate: "",
    lastDateToRespond: "",
    rfpStatus: "DRAFT",
    rfpProducts: [],
    approvers: [],
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
  const [fetchedProducts, setfetchedProducts] = useState<RFPProduct[]>([]);
  const [approvedUsers, setapprovedUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User>();
  const [userSelected, setUserSelected] = useState(false);
  const [product, setProduct] = useState<RFPProduct>();
  const [productSelected, setProductSelected] = useState(false);
  const [approvedProducts, setapprovedProducts] = useState<RFPProduct[]>([]);

  const [additionalInstructions, setAdditionalInstructions] =
    useState<string>("");

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
          setFetchedUsers(data); // Assuming the response is an array of users
        } else if (entity === "products") {
            console.log(data);
            
          setfetchedProducts(data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    } else {
      setFetchedUsers([]);
      setUserSelected(false);
      setfetchedProducts([]);
      setProductSelected(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

const handleProductChange = <T extends keyof RFPProduct>(
  index: number,
  field: T,
  value: RFPProduct[T]
) => {
  const updatedProducts = [...formData.rfpProducts];
  updatedProducts[index][field] = value;
  setFormData((prevData) => ({ ...prevData, rfpProducts: updatedProducts }));
};


  const addApprover = (user: User) => {
    setapprovedUsers((prevUsers) => [...prevUsers, user]);
    setFormData((prevData) => ({
      ...prevData,
      approvers: [...prevData.approvers, { approverId: String(user?.id) }],
    }));
  };

  const removeApprover = (index: number) => {
    const updatedApprovers = formData.approvers.filter((_, i) => i !== index);
    setFormData((prevData) => ({ ...prevData, approvers: updatedApprovers }));
  };

  const addProduct = (product: RFPProduct) => {
    // Check if the product already exists in the approved products
      const productExists = approvedProducts.some((p) => p.id === product.id);
      console.log(product)

    if (!productExists) {
      setapprovedProducts((prevProducts) => [...prevProducts, product]);

      // Ensure that we are adding a complete RFPProduct object
      setFormData((prevData) => ({
        ...prevData,
        rfpProducts: [
          ...prevData.rfpProducts,
          {
            id: product.id, // Include the id
            quantity: product.quantity, // Include the quantity
          },
        ],
      }));
    } else {
      console.warn(`Product with ID ${product.id} already exists.`);
    }
  };

  const removeProduct = (index: number) => {
    const updatedProducts = formData.rfpProducts.filter((_, i) => i !== index);
    setFormData((prevData) => ({ ...prevData, rfpProducts: updatedProducts }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(formData);
    // Here you would send the formData to your API
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Request for Product</CardTitle>
          {rfpId && (
            <p className="text-md text-muted-foreground">RFP ID: {rfpId}</p>
          )}
        </CardHeader>
        <CardContent className="grid grid-cols-4 gap-2">
          <div className="space-y-2">
            <Label htmlFor="requirementType">Requirement Type</Label>
            <Input
              id="requirementType"
              name="requirementType"
              value={formData.requirementType}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateOfOrdering">Date of Ordering</Label>
            <Input
              id="dateOfOrdering"
              name="dateOfOrdering"
              type="datetime-local"
              value={formData.dateOfOrdering}
              onChange={handleInputChange}
            />
          </div>
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
          <div className="space-y-2">
            <Label htmlFor="lastDateToRespond">Last Date to Respond</Label>
            <Input
              id="lastDateToRespond"
              name="lastDateToRespond"
              type="datetime-local"
              value={formData.lastDateToRespond}
              onChange={handleInputChange}
            />
          </div>
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
              onChange={(e) => handleSearchChange(e, "users")} // Pass the entity here
              className="flex-1"
            />
            <Button
              type="button"
              onClick={() => {
                if (user) {
                  addApprover(user);
                } else {
                  console.error("No user selected");
                }
              }}
              variant="outline"
              className={userSelected ? "bg-green-500" : ""}
            >
              <Plus />
            </Button>
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
                      setUser(user);
                      setUserSelected(true);
                    }}
                  >
                    {user.name} ({user.email})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {approvedUsers.map((approver, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <Input
                disabled
                value={approver.name}
                placeholder="Name"
                className="flex-1"
              />
              <Input
                disabled
                value={approver.email}
                placeholder="Email"
                className="flex-1"
              />
              <Button
                type="button"
                onClick={() => removeApprover(index)}
                variant="outline"
                size="icon"
              >
                <X className="h-4 w-4" />
              </Button>
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
              onChange={(e) => handleSearchChange(e, "products")} // Pass the entity here
              className="flex-1"
            />
            <Button
              type="button"
              onClick={() => {
                if (product) {
                  addProduct(product);
                } else {
                  console.error("No Product selected");
                }
              }}
              variant="outline"
              className={productSelected ? "bg-green-500" : ""}
            >
              <Plus />
            </Button>
          </div>

          {fetchedProducts.length > 0 && (
            <div className="mt-2">
              <h3 className="font-semibold">Fetched Products:</h3>
              <ul>
                {fetchedProducts.map((product) => (
                  <li
                    key={product.id}
                    className="py-1 cursor-pointer hover:bg-gray-200"
                    onClick={() => {
                      setProduct(product);
                      setProductSelected(true);
                    }}
                  >
                    {product.name} ({product.modelNo})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {approvedProducts.map((product, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <Input
                disabled
                value={product.name}
                placeholder="Name"
                className="flex-1"
              />
              <Input
                disabled
                value={product.modelNo}
                placeholder="Model"
                className="flex-1"
              />
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
              <Button
                type="button"
                onClick={() => removeProduct(index)}
                variant="outline"
                size="icon"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {/* <Button type="button" onClick={(e) => {}} variant="outline">
            Add Product
          </Button> */}

          {/* {formData.rfpProducts.map((product, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <Input
                value={product.productId}
                onChange={(e) =>
                  handleProductChange(index, "productId", e.target.value)
                }
                placeholder="Product ID"
              />
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
              />
              <Button
                type="button"
                onClick={() => removeProduct(index)}
                variant="outline"
                size="icon"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))} */}
          {/* <Button type="button" onClick={(e) => { addProduct(product) }}   variant="outline">
            Add Product
          </Button> */}
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

      <Button type="submit" className="w-full">
        Save Draft RFP
      </Button>
    </form>
  );
};

export default RFPForm;


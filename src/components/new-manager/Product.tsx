import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "../ui/use-toast";
import { PlusIcon } from "lucide-react";

// Define the Product interface
interface Product {
  id: string; // Changed to string to match the API response
  name: string;
  modelNo: string;
  specification: string;
  productCategoryId: string; // Changed to string to match the API response
  created_at: string;
  updated_at: string;
}

export default function SheetSide() {
  const [name, setName] = useState<string>("");
  const [modelNo, setModelNo] = useState<string>("");
  const [specification, setSpecification] = useState<string>("");
  const [productCategoryId, setProductCategoryId] = useState<string>(""); // Changed to string
  const [products, setProducts] = useState<Product[]>([]); // State to store fetched products
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // New state for submission status
 

  console.log();
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/product");
        const data: Product[] = await response.json(); // Type the response data
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true); // Set submitting state to true
    e.stopPropagation();

    // Validate that all fields are filled
    if (!name || !modelNo || !specification || !productCategoryId) {
      toast({
        title: "Please fill in all fields.",
        description: "",
      });
      setIsSubmitting(false); // Reset submitting state
      return; // Prevent submission
    }

    const productData = {
      name,
      modelNo,
      specification,
      productCategoryId, // This will now be the ID of the selected category
    };

    try {
      const response = await fetch("/api/product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error("Failed to create product");
      }

      toast({
        title: "🎉 Product added successfully!",
        description: "",
      });
      // Optionally reset the form or close the sheet here
      setName("");
      setModelNo("");
      setSpecification("");
      setProductCategoryId("");
    } catch (error) {
      toast({
        title: "Error adding product. Please try again.",
        description: "",
      });
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }
  };

  // Check if the form is valid for enabling the submit button
  const isFormValid = name && modelNo && specification && productCategoryId;

  return (
    
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Add Product</Button>
      </SheetTrigger>
      <SheetContent side="right1">
        <SheetHeader>
          <SheetTitle>Add Product</SheetTitle>
          <SheetDescription>
            Fill in the details of the product you want to add.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleProductSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col">
              <Label htmlFor="name" className="mb-1 font-semibold">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex flex-col">
              <Label htmlFor="modelNo" className="mb-1 font-semibold">
                Model No
              </Label>
              <Input
                id="modelNo"
                value={modelNo}
                onChange={(e) => setModelNo(e.target.value)}
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex flex-col">
              <Label htmlFor="specification" className="mb-1 font-semibold">
                Specification
              </Label>
              <Input
                id="specification"
                value={specification}
                onChange={(e) => setSpecification(e.target.value)}
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex flex-col">
              <Label htmlFor="productCategoryId" className="mb-1 font-semibold">
                Product Category
              </Label>

              <div className="flex justify-between">
                <select
                  id="productCategoryId"
                  value={productCategoryId}
                  onChange={(e) => setProductCategoryId(e.target.value)}
                  className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="" disabled>
                    Select a product category
                  </option>
                  {products.map((product) => (
                    <option key={product.id} value={product.productCategoryId}>
                      {product.name}
                    </option>
                  ))}
                </select>
                <Button type="button" className="bg-primary" onClick={() => {}}>
                  <PlusIcon />
                </Button>
              </div>
            </div>
          </div>
          <SheetFooter>
            <Button
              type="submit"
              className="w-full bg-primary text-white transition duration-200"
              disabled={isSubmitting || !isFormValid} // Disable button while submitting or if form is invalid
            >
              {isSubmitting ? "Submitting..." : "Save Product"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

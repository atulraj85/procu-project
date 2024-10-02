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
import { PlusIcon, XIcon } from "lucide-react";
import { createProduct } from "@/data/product";

interface Product {
  id: string;
  name: string;
  modelNo: string;
  specification: string;
  productCategoryId: string;
  created_at: string;
  updated_at: string;
}

interface ProductCategory {
  id: string;
  name: string;
}

export default function SheetSide() {
  const [name, setName] = useState<string>("");
  const [modelNo, setModelNo] = useState<string>("");
  const [specification, setSpecification] = useState<string>("");
  const [productCategoryId, setProductCategoryId] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [productCategories, setProductCategories] = useState<ProductCategory[]>(
    []
  );
  const [newCategoryName, setNewCategoryName] = useState<string>("");
  const [isAddingCategory, setIsAddingCategory] = useState<boolean>(false);
  const [showCategoryForm, setShowCategoryForm] = useState<boolean>(false);

  useEffect(() => {
    fetchProducts();
    fetchProductCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/product");
      const data: Product[] = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchProductCategories = async () => {
    try {
      const response = await fetch("/api/productCategory");
      const data: ProductCategory[] = await response.json();
      setProductCategories(data);
    } catch (error) {
      console.error("Error fetching product categories:", error);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    e.stopPropagation();

    if (!name || !modelNo || !specification || !productCategoryId) {
      toast({
        title: "Please fill in all fields.",
        description: "",
      });
      setIsSubmitting(false);
      return;
    }

    const productData = {
      name,
      modelNo,
      specification,
      productCategoryId,
    };

    try {
      const response = await createProduct(productData);

      if (!response?.id) {
        throw new Error("Failed to create product");
      }

      toast({
        title: "🎉 Product added successfully!",
        description: "",
      });
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
      setIsSubmitting(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Please enter a category name.",
        description: "",
      });
      return;
    }

    setIsAddingCategory(true);

    try {
      const response = await fetch("/api/productCategory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newCategoryName }),
      });

      if (!response.ok) {
        throw new Error("Failed to create product category");
      }

      const newCategory: ProductCategory = await response.json();
      setProductCategories([...productCategories, newCategory]);
      setNewCategoryName("");
      toast({
        title: "🎉 Product category added successfully!",
        description: "",
      });
      fetchProductCategories(); // Refresh the list of categories
      setShowCategoryForm(false); // Hide the form after successful addition
    } catch (error) {
      toast({
        title: "Error adding product category. Please try again.",
        description: "",
      });
      console.error("Error:", error);
    } finally {
      setIsAddingCategory(false);
    }
  };

  const isFormValid = name && modelNo && specification && productCategoryId;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Add Product</Button>
      </SheetTrigger>
      <SheetContent side="right1">
        <SheetHeader>
          <SheetTitle>Add Product</SheetTitle>
        </SheetHeader>

        {/* Product Addition Form */}
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
              <div className="flex">
                <select
                  id="productCategoryId"
                  value={productCategoryId}
                  onChange={(e) => setProductCategoryId(e.target.value)}
                  className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="" disabled>
                    Select a product category
                  </option>

                  {productCategories && productCategories.length > 0 ? (
                    productCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No categories available
                    </option>
                  )}
                </select>
                <Button
                  type="button"
                  onClick={() => setShowCategoryForm(!showCategoryForm)}
                  className="bg-primary p-2 px-2 ml-3"
                >
                  {showCategoryForm ? (
                    <XIcon size={16} />
                  ) : (
                    <PlusIcon size={16} />
                  )}
                </Button>
              </div>
            </div>
          </div>
          <SheetFooter>
            <Button
              type="submit"
              className="w-full bg-primary text-white transition duration-200"
              disabled={isSubmitting || !isFormValid}
            >
              {isSubmitting ? "Submitting..." : "Save Product"}
            </Button>
          </SheetFooter>
        </form>

        {/* Product Category Addition Section */}
        <div className="mb-6 mt-4 border-b pb-4">
          <div className="flex justify-between items-center mb-2"></div>
          {showCategoryForm && (
            <div className=" space-x-2 mt-2">
              <h3 className="text-lg font-semibold mb-2 mx-2">
                Add Product Categories
              </h3>
              <div className="flex">
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter new category name"
                  className="flex-grow"
                />
                <Button
                  onClick={handleAddCategory}
                  disabled={isAddingCategory || !newCategoryName.trim()}
                  className="bg-primary ml-4"
                >
                  {isAddingCategory ? "Adding..." : "Add"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

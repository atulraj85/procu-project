import React, { useState } from "react";
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

export default function SheetSide() {
  const [name, setName] = useState("");
  const [modelNo, setModelNo] = useState("");
  const [specification, setSpecification] = useState("");
  const [productCategoryId, setProductCategoryId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for submission status

  const handleProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true); // Set submitting state to true

    const productData = {
      name,
      modelNo,
      specification,
      productCategoryId: parseInt(productCategoryId), // Ensure this is an integer
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

      const result = await response.json();
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

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Add Product</Button>
      </SheetTrigger>
      <SheetContent>
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
                Product Category ID
              </Label>
              <Input
                id="productCategoryId"
                type="number"
                value={productCategoryId}
                onChange={(e) => setProductCategoryId(e.target.value)}
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <SheetFooter>
            <Button
              type="submit"
              className="w-full bg-primary text-white transition duration-200"
              disabled={isSubmitting} // Disable button while submitting
            >
              {isSubmitting ? "Submitting..." : "Save Product"}{" "}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

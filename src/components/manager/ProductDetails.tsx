"use client";

import React, { ChangeEvent, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdAdd } from "react-icons/md";

// Define your interfaces
interface Product {
  id: number;
  name: string;
  additionalField: number; // Changed to number
}

interface ProductDetailsProps {
  onProductDataChange: (data: Product[]) => void;
}

// Validation functions
const validateName = (value: string) => value.trim() !== "";

const ProductDetails: React.FC<ProductDetailsProps> = ({ onProductDataChange }) => {
  const [products, setProducts] = useState<Product[]>([
    { id: 0, name: "", additionalField: 0 }
  ]);
  const [productOptions, setProductOptions] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModified, setIsModified] = useState<boolean>(false);
  const [dropdownIndex, setDropdownIndex] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ [key: number]: { name?: string; additionalField?: string } }>({});

  // Fetch products based on the search term
  const fetchProducts = async (query: string) => {
    try {
      const response = await fetch(`/api/ajax/products?q=${query}`);
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      setProductOptions(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    }
  };

  useEffect(() => {
    if (searchTerm.trim()) {
      fetchProducts(searchTerm);
    } else {
      setProductOptions([]);
    }
  }, [searchTerm]);

  useEffect(() => {
    onProductDataChange(products);
  }, [products, onProductDataChange]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    setSearchTerm(value);
    setProducts((prevProducts) => {
      const updatedProducts = [...prevProducts];
      updatedProducts[index] = { ...updatedProducts[index], name: value };
      return updatedProducts;
    });

    // Clear selected product if search term changes
    if (value === "") {
      setProductOptions([]);
      setDropdownIndex(null); // Hide dropdown
    } else {
      setDropdownIndex(index); // Show dropdown for the current index
    }
  };

  const handleProductSelect = (product: Product, index: number) => {
    setProducts((prevProducts) => {
      const updatedProducts = [...prevProducts];
      updatedProducts[index] = product;
      return updatedProducts;
    });
    setSearchTerm(product.name); // Set the search term to the selected product's name
    setProductOptions([]); // Clear dropdown options
    setIsModified(true);
    setDropdownIndex(null); // Hide dropdown
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const { name, value } = e.target;
    setProducts((prevProducts) => {
      const updatedProducts = [...prevProducts];
      updatedProducts[index] = { ...updatedProducts[index], [name]: Number(value) }; // Convert to number
      setIsModified(true);
      return updatedProducts;
    });
  };

  const validateFields = (): boolean => {
    let isValid = true;
    const newErrors: { [key: number]: { name?: string; additionalField?: string } } = {};

    products.forEach((product, index) => {
      const errorsForProduct: { name?: string; additionalField?: string } = {};
      
      if (!validateName(product.name)) {
        errorsForProduct.name = "Product name is required.";
        isValid = false;
      }

      if (isNaN(product.additionalField) || product.additionalField <= 0) {
        errorsForProduct.additionalField = "Valid quantity is required.";
        isValid = false;
      }

      if (Object.keys(errorsForProduct).length > 0) {
        newErrors[index] = errorsForProduct;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleAddRow = () => {
    setProducts((prevProducts) => [
      ...prevProducts,
      { id: prevProducts.length + 1, name: "", additionalField: 0 }
    ]);
    setIsModified(true);
  };

  const handleSave = () => {
    if (!validateFields()) {
      toast.error("Please correct the errors in the form.");
      return;
    }

    setIsModified(false);
    toast.success("Product details saved successfully.");
  };

  const handleRemove = (index: number) => {
    if (index === 0) {
      toast.error("The first row cannot be deleted.");
      return;
    }
    setProducts((prevProducts) => prevProducts.filter((_, i) => i !== index));
    setIsModified(true);
    toast.success("Product removed successfully.");
  };

  return (
    <div className="text-gray-800 text-xl p-5">
      <div className="my-5 flex justify-end gap-3">
        {/* Enable the Add New Row button */}
        {(products.length > 0 && isModified) && (
          <button
            type="button"
            onClick={handleSave}
            className="bg-green-700 hover:bg-green-400 py-2 px-4 text-white text-base rounded-md"
          >
            Save 
          </button>
        )}
      </div>

      <div className="my-5">
        <table className="w-full text-[15px] border-collapse border border-gray-300 text-left">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">Product Name</th>
              <th className="border border-gray-300 p-2">Quantity</th>
              <th className="border border-gray-300 p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={product.id}>
                <td className="border border-gray-300 p-2">
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={product.name}
                      onChange={(e) => handleSearchChange(e, index)}
                      className={`outline-none border-b-2  ${errors[index]?.name ? "border-red-600" : "border-gray-600"}`}
                    />
                    {dropdownIndex === index && searchTerm && productOptions.length > 0 && (
                      <ul className="absolute bg-white border border-gray-300 mt-3 w-full max-h-60 overflow-y-auto z-10">
                        {productOptions.map((option) => (
                          <li
                            key={option.id}
                            onClick={() => handleProductSelect(option, index)}
                            className="cursor-pointer px-4 py-2 hover:bg-gray-200"
                          >
                            {option.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {errors[index]?.name && <p className="text-red-600 text-sm">{errors[index].name}</p>}
                </td>
                <td className="border border-gray-300 p-2">
                  <input
                    type="number" // Changed to number
                    name="additionalField"
                    value={product.additionalField}
                    onChange={(e) => handleChange(e, index)}
                    className={`outline-none border-b-2  ${errors[index]?.additionalField ? "border-red-600" : "border-gray-600"}`}
                  />
                  {errors[index]?.additionalField && <p className="text-red-600 text-sm">{errors[index].additionalField}</p>}
                </td>
                <td className="flex border border-gray-300 p-2 items-center justify-center space-x-4">
                  <button
                    className="py-1 px-2 text-red-500 text-lg cursor-pointer"
                    onClick={() => handleRemove(index)}
                    disabled={index === 0} // Disable delete for the first row
                  >
                    <RiDeleteBin6Line />
                  </button>
                  {index === products.length - 1 && (
                    <button
                      type="button"
                      onClick={handleAddRow}
                      className="text-black px-2 py-1 text-xl"
                    >
                      <MdAdd />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductDetails;

"use client";
import React, { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { toast } from "react-toastify";

// Mock validation functions
const validatePrice = (value: string) => {
  const number = parseFloat(value);
  return !isNaN(number) && number > 0;
};

const validateQuantity = (value: string) => {
  const number = parseInt(value, 10);
  return !isNaN(number) && number > 0;
};

const validateGST = (value: string) => {
  const number = parseFloat(value);
  return !isNaN(number) && number >= 0 && number <= 100;
};

const validateAddress = (value: string) => {
  return value.trim() !== "";
};

interface Product {
  productName: string;
  description: string;
  unitPrice: string;
  quantity: string;
  gst: string;
  destinationAddress: string;
}

const ProductDetails = () => {
  const [productData, setProductData] = useState<Product>({
    productName: "",
    description: "",
    unitPrice: "",
    quantity: "",
    gst: "",
    destinationAddress: "",
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [errors, setErrors] = useState({
    productName: "",
    description: "",
    unitPrice: "",
    quantity: "",
    gst: "",
    destinationAddress: "",
  });
  const [otherCharges, setOtherCharges] = useState<number>(0);
  const [grandTotal, setGrandTotal] = useState<number>(0);

  useEffect(() => {
    const total = calculateGrandTotal();
    setGrandTotal(total);
  }, [products, otherCharges]);

  const validateFields = (): boolean => {
    const newErrors = {
      productName: "",
      description: "",
      unitPrice: "",
      quantity: "",
      gst: "",
      destinationAddress: "",
    };
    let isValid = true;

    if (productData.productName.trim() === "") {
      newErrors.productName = "Product name is required.";
      isValid = false;
    }

    if (productData.description.trim() === "") {
      newErrors.description = "Description is required.";
      isValid = false;
    }

    // if (!validatePrice(productData.unitPrice)) {
    //   newErrors.unitPrice = "Valid unit price is required.";
    //   isValid = false;
    // }

    if (!validateQuantity(productData.quantity)) {
      newErrors.quantity = "Valid quantity is required.";
      isValid = false;
    }

    // if (!validateGST(productData.gst)) {
    //   newErrors.gst = "GST should be between 0 and 100%.";
    //   isValid = false;
    // }

    if (!validateAddress(productData.destinationAddress)) {
      newErrors.destinationAddress = "Destination address is required.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProductData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!validateFields()) {
      toast.error("Please correct the errors in the form.");
      return;
    }

    if (editIndex !== null) {
      const updatedProducts = [...products];
      updatedProducts[editIndex] = productData;
      setProducts(updatedProducts);
      setEditIndex(null);
      toast.success("Product details updated successfully.");
    } else {
      setProducts((prevProducts) => [...prevProducts, productData]);
      toast.success("Product added successfully.");
    }

    setProductData({
      productName: "",
      description: "",
      unitPrice: "",
      quantity: "",
      gst: "",
      destinationAddress: "",
    });
    setErrors({
      productName: "",
      description: "",
      unitPrice: "",
      quantity: "",
      gst: "",
      destinationAddress: "",
    });
  };

  const handleRemove = (index: number) => {
    setProducts((prevProducts) => prevProducts.filter((_, i) => i !== index));
    toast.success("Product removed successfully.");
  };

  const handleEdit = (index: number) => {
    setProductData(products[index]);
    setEditIndex(index);
  };

  const calculateTotalPrice = () => {
    return products.reduce((acc, product) => {
      const unitPrice = parseFloat(product.unitPrice);
      const quantity = parseInt(product.quantity);
      return acc + unitPrice * quantity;
    }, 0);
  };

  const calculateTotalProductPrice = () => {
    return products.reduce((acc, product) => {
      const unitPrice = parseFloat(product.unitPrice);
      const quantity = parseFloat(product.quantity);
      const gst = parseFloat(product.gst) / 100;
      const productTotal = unitPrice * quantity * (1 + gst);
      return acc + productTotal;
    }, 0);
  };

  const calculateGrandTotal = () => {
    const productTotal = Number(calculateTotalProductPrice()).toFixed(2);
    return Number(productTotal) + Number(otherCharges);
  };

  return (
    <div className="text-gray-800 text-xl p-5">
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-5">
        <div className="flex flex-col gap-3 w-80 text-base">
          <label htmlFor="productName">Product Name</label>
          <input
            type="text"
            name="productName"
            value={productData.productName}
            onChange={handleChange}
            className={`outline-none border-b-2 ${errors.productName ? "border-red-600" : "border-gray-600"}`}
          />
          {errors.productName && <p className="text-red-600 text-sm">{errors.productName}</p>}
        </div>
        <div className="flex flex-col gap-3 w-2/3 text-base">
          <label htmlFor="description">Description</label>
          <input
            type="text"
            name="description"
            value={productData.description}
            onChange={handleChange}
            className={`outline-none border-b-2 ${errors.description ? "border-red-600" : "border-gray-600"}`}
          />
          {errors.description && <p className="text-red-600 text-sm">{errors.description}</p>}
        </div>
        {/* <div className="flex flex-col gap-3 w-64 text-base">
          <label htmlFor="unitPrice">Unit Price</label>
          <input
            type="text"
            name="unitPrice"
            value={productData.unitPrice}
            onChange={handleChange}
            className={`outline-none border-b-2 ${errors.unitPrice ? "border-red-600" : "border-gray-600"}`}
          />
          {errors.unitPrice && <p className="text-red-600 text-sm">{errors.unitPrice}</p>}
        </div> */}
        <div className="flex flex-col gap-3 w-64 text-base">
          <label htmlFor="quantity">Quantity</label>
          <input
            type="text"
            name="quantity"
            value={productData.quantity}
            onChange={handleChange}
            className={`outline-none border-b-2 ${errors.quantity ? "border-red-600" : "border-gray-600"}`}
          />
          {errors.quantity && <p className="text-red-600 text-sm">{errors.quantity}</p>}
        </div>
        {/* <div className="flex flex-col gap-3 w-64 text-base">
          <label htmlFor="gst">GST (%)</label>
          <input
            type="text"
            name="gst"
            value={productData.gst}
            onChange={handleChange}
            className={`outline-none border-b-2 ${errors.gst ? "border-red-600" : "border-gray-600"}`}
          />
          {errors.gst && <p className="text-red-600 text-sm">{errors.gst}</p>}
        </div> */}
        <div className="flex flex-col gap-3 w-80 text-base">
          <label htmlFor="destinationAddress">Destination Address</label>
          <input
            type="text"
            name="destinationAddress"
            value={productData.destinationAddress}
            onChange={handleChange}
            className={`outline-none border-b-2 ${errors.destinationAddress ? "border-red-600" : "border-gray-600"}`}
          />
          {errors.destinationAddress && <p className="text-red-600 text-sm">{errors.destinationAddress}</p>}
        </div>
        <div className="flex flex-col justify-end">
          <button
            type="submit"
            className="bg-blue-700 hover:bg-blue-400 py-2 px-2 text-white text-base rounded-md"
          >
            {editIndex !== null ? "Update Product" : "Add Product"}
          </button>
        </div>
      </form>

      <div className="my-5">
        {products.length > 0 && (
          <table className="w-full text-[15px] border-collapse border border-gray-300 text-left">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2">Product Name</th>
                <th className="border border-gray-300 p-2">Description</th>
                {/* <th className="border border-gray-300 p-2">Unit Price</th> */}
                <th className="border border-gray-300 p-2">Quantity</th>
                {/* <th className="border border-gray-300 p-2">GST</th> */}
                <th className="border border-gray-300 p-2">Destination Address</th>
                <th className="border border-gray-300 p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 p-2">{product.productName}</td>
                  <td className="border border-gray-300 p-2">{product.description}</td>
                  {/* <td className="border border-gray-300 p-2">{product.unitPrice}</td> */}
                  <td className="border border-gray-300 p-2">{product.quantity}</td>
                  {/* <td className="border border-gray-300 p-2">{product.gst}</td> */}
                  <td className="border border-gray-300 p-2">{product.destinationAddress}</td>
                  <td className="border border-gray-300 p-2 flex items-center justify-center space-x-4">
                    <button
                      className="border py-1 px-2 text-blue-600 text-sm cursor-pointer"
                      onClick={() => handleEdit(index)}
                    >
                      Edit
                    </button>
                    <button
                      className="border py-1 px-2 text-red-900 text-sm cursor-pointer"
                      onClick={() => handleRemove(index)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* <div className="mt-5 text-xl">
        <div className="flex items-center mb-2">
          <label htmlFor="otherCharges" className="mr-2">Other Charges:</label>
          <input
            type="number"
            id="otherCharges"
            value={otherCharges}
            onChange={(e) => setOtherCharges(Number(e.target.value))}
            className="border border-gray-300 p-2 rounded-md"
          />
        </div>
        <p>Total Price: {calculateTotalPrice().toFixed(2)}</p>
        <p>Grand Total: {grandTotal.toFixed(2)}</p>
      </div> */}
    </div>
  );
};

export default ProductDetails;

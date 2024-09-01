"use client";
import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { toast } from "react-toastify";

interface Product {
  productName: string;
  description: string;
  unitPrice: string;
  quantity: string;
  gst: string;
}

const ProductDetails = () => {
  const [productData, setProductData] = useState<Product>({
    productName: "",
    description: "",
    unitPrice: "",
    quantity: "",
    gst: "",
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [address, setAddress] = useState("");
  const [isEditing, setIsEditing] = useState(false); // Default to false
  const [savedAddress, setSavedAddress] = useState<string | null>(null);
  const [otherCharges, setOtherCharges] = useState<number>(0);
  const [grandTotal, setGrandTotal] = useState<number>(0);

  useEffect(() => {
    const total = calculateGrandTotal();
    setGrandTotal(total);
  }, [products, otherCharges]);

  useEffect(() => {
    const totalPrice = calculateTotalPrice();
    console.log("Total Price: ", totalPrice);
  }, [products]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProductData((prevData) => ({ ...prevData, [name]: value }));
  };

  const validate = () => {
    let valid = true;

    if (!productData.productName.trim()) {
      toast.error("Product name is required.");
      valid = false;
    }
    if (!productData.description.trim()) {
      toast.error("Description is required.");
      valid = false;
    }
    if (!productData.unitPrice.trim() || isNaN(Number(productData.unitPrice))) {
      toast.error("Valid unit price is required.");
      valid = false;
    }
    if (!productData.quantity.trim() || isNaN(Number(productData.quantity))) {
      toast.error("Valid quantity is required.");
      valid = false;
    }
    if (!productData.gst.trim() || isNaN(Number(productData.gst))) {
      toast.error("Valid GST is required.");
      valid = false;
    }
    if (Number(productData.gst) > 100) {
      toast.error("GST should be equal to or less than 100%");
      valid = false;
    }

    return valid;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (validate()) {
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
      });
    }
  };

  const handleRemove = (index: number) => {
    setProducts((prevProducts) => prevProducts.filter((_, i) => i !== index));
    toast.success("Product removed successfully.");
  };

  const handleEdit = (index: number) => {
    setProductData(products[index]);
    setEditIndex(index);
  };

  const handleAddressChange = (e: ChangeEvent<HTMLInputElement>) =>
    setAddress(e.target.value);

  const handleAddressSave = (e: FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      toast.error("Address cannot be empty.");
      return;
    }
    setSavedAddress(address);
    setIsEditing(false);
    toast.success("Address saved successfully.");
  };

  const handleAddressDelete = () => {
    setSavedAddress(null);
    setAddress("");
    toast.success("Address deleted successfully.");
  };

  const handleAddressEdit = () => {
    setIsEditing(true);
    toast.success("You can now edit the address.");
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
    <div className="text-gray-800 text-xl">
      <form className="flex flex-wrap gap-5" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-3 w-80 text-base">
          <label htmlFor="productName">Product Name</label>
          <input
            type="text"
            name="productName"
            value={productData.productName}
            onChange={handleChange}
            className="outline-none border-b-2 border-gray-600"
          />
        </div>
        <div className="flex flex-col gap-3 w-2/3 text-base">
          <label htmlFor="description">Description</label>
          <input
            type="text"
            name="description"
            value={productData.description}
            onChange={handleChange}
            className="outline-none border-b-2 border-gray-600"
          />
        </div>
        <div className="flex flex-col gap-3 w-80 text-base">
          <label htmlFor="unitPrice">Unit Price</label>
          <input
            type="text"
            name="unitPrice"
            value={productData.unitPrice}
            onChange={handleChange}
            className="outline-none border-b-2 border-gray-600"
          />
        </div>
        <div className="flex flex-col gap-3 w-64 text-base">
          <label htmlFor="quantity">Quantity</label>
          <input
            type="text"
            name="quantity"
            value={productData.quantity}
            onChange={handleChange}
            className="outline-none border-b-2 border-gray-600"
          />
        </div>
        <div className="flex flex-col gap-3 w-56 text-base">
          <label htmlFor="gst">GST (%)</label>
          <input
            type="text"
            name="gst"
            value={productData.gst}
            onChange={handleChange}
            className="outline-none border-b-2 border-gray-600"
          />
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
      <div className="mt-6">
        {products.length > 0 && (
          <table className="w-full border-collapse border border-gray-300 text-left">
            <thead className="font-normal text-base">
              <tr>
                <th className="border border-gray-300 p-2">Product Name</th>
                <th className="border border-gray-300 p-2">Description</th>
                <th className="border border-gray-300 p-2">Unit Price</th>
                <th className="border border-gray-300 p-2">Quantity</th>
                <th className="border border-gray-300 p-2">GST (%)</th>
                <th className="border border-gray-300 p-2">Total Price</th>
                <th className="border border-gray-300 p-2">Actions</th>
              </tr>
            </thead>
            <tbody className="text-base">
              {products.map((product, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-2">{product.productName}</td>
                  <td className="border border-gray-300 px-2">{product.description}</td>
                  <td className="border border-gray-300 px-2">{product.unitPrice}</td>
                  <td className="border border-gray-300 px-2">{product.quantity}</td>
                  <td className="border border-gray-300 px-2">{product.gst}</td>
                  <td className="border border-gray-300 px-2">
                    {Number(
                      parseFloat(product.unitPrice) *
                      parseFloat(product.quantity) *
                      (1 + parseFloat(product.gst) / 100)
                    ).toFixed(2)}
                  </td>
                  <td className="border border-gray-300 p-2 flex items-center justify-center">
                    <button
                      className="py-1 px-4 text-blue-600 text-sm ml-2 hover:cursor-pointer"
                      onClick={() => handleEdit(index)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-pencil"
                      >
                        <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                        <path d="m15 5 4 4" />
                      </svg>
                    </button>
                    <button
                      className="py-1 px-4 text-red-900 cursor-pointer hover:text-sm"
                      onClick={() => handleRemove(index)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-trash"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="flex items-end mt-4">
        <label htmlFor="otherCharges" className="mr-3">Other Charges</label>
        <input
          type="number"
          name="otherCharges"
          value={otherCharges}
          onChange={(e) => setOtherCharges(parseFloat(e.target.value))}
          className="outline-none border-b-2 border-gray-600"
          placeholder="Amount"
        />
        <div className="ml-5 font-bold">
          <h2>Grand Total: {grandTotal.toFixed(2)}</h2>
        </div>
      </div>
      <div className="text-gray-800 text-xl flex items-end">
        <div className="flex flex-col gap-3 w-2/3 text-base mt-10">
          <label htmlFor="address" className="text-xl">
            Please enter destination address.
          </label>
          <input
            type="text"
            name="address"
            value={isEditing ? address : savedAddress || ""}
            onChange={handleAddressChange}
            className="outline-none border-b-2 border-gray-600"
            disabled={!isEditing}
          />
        </div>
        <div className="mt-4 mx-2 flex">
          {!savedAddress ? (
            <button
              onClick={handleAddressSave}
              className="bg-blue-700 hover:bg-blue-400 py-2 px-4 text-white text-base rounded-md"
            >
              Save Address
            </button>
          ) : (
            <>
              {isEditing ? (
                <button
                  onClick={handleAddressSave}
                  className="bg-green-700 hover:bg-green-400 py-2 px-4 text-white text-base mr-2 rounded-md"
                >
                  Save Changes
                </button>
              ) : (
                <button
                  onClick={handleAddressEdit}
                  className="py-2 px-4 text-blue-700 text-base mr-2 hover:cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-pencil"
                  >
                    <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                    <path d="m15 5 4 4" />
                  </svg>
                </button>
              )}
              <button
                onClick={handleAddressDelete}
                className="py-2 px-4 text-red-900 text-base hover:cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-trash"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
      {products.length > 0 && (
        <button className="bg-green-700 hover:bg-blue-400 border py-2 px-2 text-white rounded-md text-base my-5">
          Submit Product
        </button>
      )}
    </div>
  );
};

export default ProductDetails;

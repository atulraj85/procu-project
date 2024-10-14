import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quotationSchema, rfpSchema } from "../../../schemas/RFPSchema";

// Import your schemas

const RFPForm = () => {
  const [quotations, setQuotations] = useState([]);

  // Outer form for RFP
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(rfpSchema),
  });

  const onRFPSubmit = (data: any) => {
    console.log("RFP Data:", data);
    // Handle RFP submission logic here
  };

  const handleQuotationSubmit = (quotationData: any) => {
    // Validate the quotation schema
    try {
      quotationSchema.parse(quotationData);
      // setQuotations((prev) => [...prev, quotationData]);
      console.log("Quotation added:", quotationData);
    } catch (error) {
      console.error("Quotation validation error:", error.errors);
    }
  };

  return (
    <form onSubmit={handleSubmit(onRFPSubmit)}>
      <h2>RFP Form</h2>
      <div>
        <label>RFP ID:</label>
        <input {...register("rfpId")} />
        {errors.rfpId && <p>{errors.rfpId.message}</p>}
      </div>
      <div>
        <label>RFP Status:</label>
        <input {...register("rfpStatus")} />
        {errors.rfpStatus && <p>{errors.rfpStatus.message}</p>}
      </div>

      <h3>Quotations</h3>
      {quotations.map((quotation, index) => (
        <div key={index}>
          <h4>Quotation {index + 1}</h4>
          <p>{JSON.stringify(quotation)}</p>
        </div>
      ))}

      <QuotationForm onSubmit={handleQuotationSubmit} />

      <button type="submit">Submit RFP</button>
    </form>
  );
};

const QuotationForm = ({ onSubmit }: any) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(quotationSchema),
  });

  const onQuotationSubmit = (data: any) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onQuotationSubmit)}>
      <h4>Add Quotation</h4>
      <div>
        <label>Reference Number:</label>
        <input {...register("refNo")} />
        {errors.refNo && <p>{errors.refNo.message}</p>}
      </div>
      <div>
        <label>Vendor ID:</label>
        <input {...register("vendorId")} />
        {errors.vendorId && <p>{errors.vendorId.message}</p>}
      </div>
      <div>
        <label>Total Amount:</label>
        <input type="number" {...register("totalAmount")} />
        {errors.totalAmount && <p>{errors.totalAmount.message}</p>}
      </div>
      {/* Add other fields for the quotation as needed */}
      <button type="submit">Add Quotation</button>
    </form>
  );
};

export default QuotationForm;

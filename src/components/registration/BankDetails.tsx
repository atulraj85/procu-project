import React from "react";

const BankDetails = ({ data, handleChangeData }: any) => {
  const handleSubmit = (e: any) => {
    e.preventDefault();
  };
  return (
    <div>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl my-4">Add Your Bank Details</h1>
        <div className="flex-style">
          <label htmlFor="bank">Name of Bank</label>
          <input
            type="text"
            className="input-style p-1 px-4"
            placeholder="name of bank"
            name="nameOfBank"
            onChange={handleChangeData}
            value={data.nameOfBank}
          />
        </div>
        <div className="flex-style">
          <label htmlFor="ifsc">IFSC Code</label>
          <input
            type="text"
            className="input-style p-1 px-4"
            placeholder="IFSC Code"
            name="ifsc_code"
            onChange={handleChangeData}
            value={data.ifsc_code}
          />
        </div>
        <div className="flex-style">
          <label htmlFor="address">Account&apos;s Name</label>
          <input
            type="text"
            className="input-style p-1 px-4"
            placeholder="john doe"
            name="account_name"
            onChange={handleChangeData}
            value={data.account_name}
          />
        </div>
        <div className="flex-style">
          <label htmlFor="address">Account Number</label>
          <input
            type="text"
            className="input-style p-1 px-4"
            placeholder="Account Number"
            name="account_number"
            onChange={handleChangeData}
            value={data.account_number}
          />
        </div>
        <div className="flex-style">
          <label htmlFor="address">PAN Card Number</label>
          <input
            type="text"
            className="input-style p-1 px-4"
            placeholder="PAN number"
            name="pan_number"
            onChange={handleChangeData}
            value={data.pan_number}
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="border-2 absolute bottom-24 right-28 float-right border-gray-800 py-2 px-4 mt-7 rounded-lg text-black hover:bg-primary transition-style hover:border-blue-600"
      >
        Submit
      </button>
    </div>
  );
};

export default BankDetails;

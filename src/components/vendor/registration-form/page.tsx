"use client";
import BankDetails from "@/components/registration/BankDetails";
import GSTnumber from "@/components/registration/GSTnumber";
import MsmeDetails from "@/components/registration/MsmeDetails";
import React, { ChangeEvent, ReactElement, useState } from "react";

const page = () => {
  const [index, setIndex] = useState(0);
  const [data, setData] = useState({
    company_name: "",
    company_address: "",
    state: "",
    pin: "",
    options: false,
    udhyog_number: "",
    nameOfBank: "",
    ifsc_code: "",
    account_name: "",
    account_number: "",
    pan_number: "",
  });

  const handleChangeData = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  console.log(data);

  const indexPlus = () => {
    if (index == 2) {
      return;
    } else {
      setIndex((prev) => prev + 1);
    }
  };
  const indexMinus = () => {
    if (index == 0) {
      return;
    } else {
      setIndex((prev) => prev - 1);
    }
  };
  return (
    <div className="relative flex flex-col justify-center items-center w-full h-screen">
      {index == 0 && (
        <GSTnumber data={data} handleChangeData={handleChangeData} />
      )}
      {index == 1 && (
        <MsmeDetails data={data} handleChangeData={handleChangeData} />
      )}
      {index == 2 && (
        <BankDetails data={data} handleChangeData={handleChangeData} />
      )}
      <div className="absolute bottom-24 right-8 flex space-x-7">
        {index !== 0 && (
          <button
            onClick={indexMinus}
            className="py-2 px-4 float-left rounded-lg text-black transition-style border-2 border-slate-900"
          >
            Prev
          </button>
        )}

        {index !== 2 && (
          <button
            onClick={indexPlus}
            className="py-2 px-4 float-right rounded-lg text-black transition-style border-2 border-slate-900"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default page;

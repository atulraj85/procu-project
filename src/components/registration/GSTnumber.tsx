"use client";
import Image from "next/image";
import React, { ChangeEvent, useState } from "react";

interface Props {
  data: {
    company_name: string;
    company_address: string;
    state: string;
    pin: string;
  };
  handleChangeData: (e: ChangeEvent<HTMLInputElement>) => void;
}

const GSTnumber: React.FC<Props> = ({ data, handleChangeData }: any) => {
  const [gstInfo, setGstInfo] = useState(false);
  const [file, setFile] = useState<any>(null);
  const [preview, setPreview] = useState("");
  const handleChange = (e: any) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
    }
  };
  // console.log(file);

  return (
    <div className="">
      <div className="transition-style">
        <h1 className="text-5xl my-5">
          Welcome to <span className="text-green-700 font-semibold">Procu</span>{" "}
        </h1>
        <div>
          <p className="text-xl text-gray-600">Please enter Your GST Number</p>
          <input
            type="text"
            className="border-b-2 border-b-gray-500 outline-none px-4 mr-4 py-1"
            placeholder="GST number"
          />
          <button
            onClick={() => setGstInfo(!gstInfo)}
            className=" rounded-lg text-black hover:bg-gray-400 px-4 py-2 transition-style underline"
          >
            skip
          </button>

          <div className="flex flex-row items-center my-3 space-x-5">
            <label
              htmlFor="fileInput"
              className="cursor-pointer transition duration-300"
            >
              <Image
                src="/assets/upload.png"
                alt="upload-icons"
                width={20}
                height={20}
              />
              <input
                type="file"
                id="fileInput"
                className="hidden"
                onChange={handleChange}
              />
            </label>
            {file ? (
              <h1 className="mx-2 text-green-700 font-bold">{file.name}</h1>
            ) : (
              <h1 className="text-gray-800">Upload GST Certificate</h1>
            )}
          </div>
        </div>
      </div>
      {gstInfo && (
        <>
          <div className="mt-14 flex flex-col gap-4">
            <div className="flex-style">
              <label htmlFor="company" className="text-gray-800">
                Company Name :
              </label>
              <input
                type="text"
                className="input-style p-1 px-4"
                placeholder="company&apos;s name"
                name="company_name"
                onChange={handleChangeData}
                value={data.company_name}
              />
            </div>

            <div className="flex-style">
              <label htmlFor="address">Company&apos;s Address</label>
              <input
                type="text"
                className="input-style p-1 px-4"
                placeholder="company&apos;s address"
                name="company_address"
                onChange={handleChangeData}
                value={data.company_address}
              />
            </div>
            <div className="flex space-x-3">
              <div className="flex-style">
                <label htmlFor="state">State</label>
                <input
                  type="text"
                  className="input-style p-1 px-4"
                  placeholder="state"
                  name="state"
                  onChange={handleChangeData}
                  value={data.state}
                />
              </div>
              <div className="flex-style">
                <label htmlFor="state">Pin</label>
                <input
                  type="text"
                  className="input-style p-1 px-4"
                  placeholder="pin"
                  name="pin"
                  onChange={handleChangeData}
                  value={data.pin}
                />
              </div>
            </div>
          </div>
        </>
      )}
      {/* <button className="py-2 px-4 mt-7 float-right rounded-lg text-black transition-style border-2 border-slate-900">
        continue
      </button> */}
    </div>
  );
};

export default GSTnumber;

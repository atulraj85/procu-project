import React from "react";

const MsmeDetails = ({ data, handleChangeData }: any) => {
  return (
    <>
      <div>
        <h1 className="text-xl text-gray-600">Are you MSME registrated ? </h1>
        <div className="mt-5">
          <div className="flex px-5 ">
            <input
              type="radio"
              id="option1"
              name="true"
              value="true"
              onChange={handleChangeData}
            />
            <label htmlFor="option1" className="px-5 text-lg text-gray-800">
              Yes
            </label>
          </div>

          <div className="flex px-5 ">
            <input
              type="radio"
              id="option2"
              name="false"
              value="false"
              onChange={handleChangeData}
            />
            <label htmlFor="option2" className="px-6 text-lg text-gray-800">
              No
            </label>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-xl text-gray-600">
            Enter your Udhyog AAdhar Number
          </p>
          <input
            type="text"
            className="border-b-2 border-b-gray-500 outline-none mt-3"
            placeholder="UDYAM-XY-07-1234567"
            name="udhyog_number"
            value={data.udhyog_number}
            onChange={handleChangeData}
          />
        </div>
      </div>
    </>
  );
};

export default MsmeDetails;

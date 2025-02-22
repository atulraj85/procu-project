import React from "react";
import Image from "next/image";
// import LoginPageLayouts from "@/components/layouts/LoginPageLayouts";
import Link from "next/link";

const Success = ({
  title,
  details,
  link,
}: {
  title: String;
  details: String;
  link: String;
}) => {
  return (
    
      <div className="bg-white w-[450px] flex flex-col py-24 px-8 items-center justify-center text-left border-4 rounded-lg border-gray-500 ">
        <div>
          <Image src="/assets/tick.svg" width={100} height={100} alt="image" />
        </div>
        <div className="flex flex-col text-center w-full mt-10">
          <h1 className="text-2xl py-3"> {title}</h1>
          <p className="text-lg text-gray-600 py-3">{details}</p>
          <Link href={`${title}`}>
            <button className="px-6 w-full text-white rounded-md bg-primary hover:bg-blue-500 my-2 py-2 text-xl mt-6 cursor-pointer">
              continue
            </button>
          </Link>
        </div>
      </div>
    
  );
};

export default Success;

import Image from "next/image";
import React from "react";

const AuthCard = ({ text }: { text: string }) => {
  return (
    <div className="px-10 py-10 rounded-r-2xl bg-primary w-full flex flex-col justify-center items-center text-white">
      <div className="p-2 my-5">
        <Image
          src={"/images/pick-pages.png"}
          alt="img"
          width={300}
          height={300}
          className="w-[200px] h-[200px]"
        />
      </div>
      <div className="my-16">
        <h1 className="text-5xl">Welcome to Procu</h1>
        <p className="text-2xl">{text} to Access your Account</p>
      </div>
    </div>
  );
};

export default AuthCard;

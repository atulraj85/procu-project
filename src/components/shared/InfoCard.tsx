import { InfoItem } from "@/types/index";
import Link from "next/link";
import React from "react";

const InfoCard = ({ info }: { info: InfoItem }) => {
  return (
    <div
      key={info.value}
      className="flex flex-col justify-center items-center cursor-pointer rounded-xl p-8 my-4 shadow-xl"
    >
      <h1 className="font-bold text-lg">{info.total}</h1>
      <p className="font-semibold text-lg">{info.label}</p>
      <h2 className="font-medium text-xl">Rs. {info.price}</h2>
    </div>
  );
};

export default InfoCard;

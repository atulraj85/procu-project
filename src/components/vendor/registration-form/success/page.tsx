import React from "react";
import Image from "next/image";
import LoginPageLayouts from "@/components/layouts/LoginPageLayouts";
import Link from "next/link";
import Success from "@/components/shared/Success";

const page = () => {
  return (
    <Success
      title="Registered Successfully"
      details="Go to your dashborad and continue to fill more details "
      link="/dashborad"
    />
  );
};

export default page;

import Link from "next/link";
import React from "react";

const Navbar = ({ link }: { link: string }) => {
  return (
    <div className="w-full">
      <div className="flex items-center space-x-3">
        <h1 className="text-2xl">
          <Link href={"/"}>Home</Link>
        </h1>
        <h1 className="text-2xl">
          <Link href={`/auth/${link}`}>{link}</Link>
        </h1>
      </div>
    </div>
  );
};

export default Navbar;

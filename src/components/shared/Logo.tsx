import Image from "next/image";
import React from "react";

const Logo = () => {
  return (
    <div>
      <Image
        src="/assets/procuLogo.svg"
        height={100}
        width={120}
        alt="image"
        className="absolute top-2 left-5"
      />
    </div>
  );
};

export default Logo;

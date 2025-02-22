import RegisterForm from "@/components/forms/RegisterForm";
import React from "react";

function RegisterPage() {
  return (
    <div className=" mt-3 flex items-center">
      <div className="relative flex  justify-end  ">
        <img
          src="/images/pick-pages.png"
          alt="large auth splash image"
          className="w-[80%] rounded-xl "
        />
        <div className="absolute top-[60%] left-[30%]">
          <p className="text-[2.5rem]  text-white font-[700]">
            Pr<span className="text-[#03B300]">o</span>cu
          </p>
          <p className="text-white text-[1.25rem] font-[700]">
            We&apos;re here to Increase your{" "}
            <span className="text-white">Productivity</span>
          </p>
        </div>
      </div>
      <div className="flex-grow">
        {/* <RegisterForm apiUrl="/api/register" loginPage="/login" text="Register as Admin"/> */}
        <RegisterForm text={"Register as Admin"} role={"ADMIN"} />
      </div>
    </div>
  );
}

export default RegisterPage;

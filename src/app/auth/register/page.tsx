"use client";
import RegisterForm from "@/components/forms/RegisterForm";
import VendorRegistrationForm from "@/components/forms/VendorRegisterForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";

type RegistrationType = "USER" | "VENDOR";

function RegisterPage() {
  const [registrationType, setRegistrationType] = useState<RegistrationType>("USER");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Toggle Buttons - Always Visible */}
      <div className="w-full flex justify-center pt-6 pb-4">
        <div className="bg-white rounded-lg p-1 shadow-md border">
          <Button
            variant={registrationType === "USER" ? "default" : "ghost"}
            onClick={() => setRegistrationType("USER")}
            className={`px-4 md:px-6 py-2 text-sm md:text-base rounded-md transition-all duration-200 ${
              registrationType === "USER"
                ? "bg-primary text-white shadow-sm"
                : "text-gray-600 hover:text-primary"
            }`}
          >
            User Registration
          </Button>
          <Button
            variant={registrationType === "VENDOR" ? "default" : "ghost"}
            onClick={() => setRegistrationType("VENDOR")}
            className={`px-4 md:px-6 py-2 text-sm md:text-base rounded-md transition-all duration-200 ${
              registrationType === "VENDOR"
                ? "bg-primary text-white shadow-sm"
                : "text-gray-600 hover:text-primary"
            }`}
          >
            Vendor Registration
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row">
        {/* Left Side Image - Hidden on mobile and tablet */}
        <div className="hidden lg:flex lg:w-2/5 xl:w-2/5 relative justify-center px-4 items-center xl:px-8">
          <div className="relative w-full max-w-md xl:max-w-lg">
            <img
              src="/images/pick-pages.png"
              alt="Registration illustration"
              className="w-full rounded-xl shadow-2xl"
            />
            <div className="absolute inset-0 flex flex-col justify-center items-center ">
              <p className="text-2xl xl:text-4xl text-white font-bold mt-2">
                Pr<span className="text-[#03B300]">o</span>cu
              </p>
              <p className="text-white text-sm xl:text-lg font-semibold px-4">
                We&apos;re here to Increase your Productivity
              </p>
            </div>
          </div>
        </div>

        {/* Right Side Form - Responsive width */}
        <div className="flex-1 lg:w-3/5 xl:w-3/5 flex items-center justify-center px-4 py-6">
          <div className="w-full max-w-3xl">
            {/* Mobile and Tablet Card View */}
            <div className="lg:hidden">
              <Card className="w-full shadow-xl border-0 bg-white/95 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className="mb-4">
                    <h1 className="text-3xl font-bold text-gray-800 mb-1">
                      Pr<span className="text-[#03B300]">o</span>cu
                    </h1>
                    <p className="text-gray-600">
                      Increase your Productivity
                    </p>
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-800">
                    {registrationType === "USER" ? "User Registration" : "Vendor Registration"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 md:px-6 pb-6">
                  {registrationType === "USER" ? (
                    <RegisterForm text="Register to get started" role="USER" />
                  ) : (
                    <VendorRegistrationForm />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Desktop Form View */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-lg shadow-lg p-6 xl:p-8">
                {registrationType === "USER" ? (
                  <RegisterForm text="Register to get started" role="USER" />
                ) : (
                  <VendorRegistrationForm />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Elements for Mobile/Tablet */}
      <div className="lg:hidden fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-primary/10 to-green-100/20 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-blue-100/20 to-primary/10 rounded-full transform translate-x-1/2 translate-y-1/2"></div>
        
        {/* Smaller Floating Elements */}
        <div className="absolute top-1/4 left-4 w-16 h-16 bg-primary/5 rounded-full"></div>
        <div className="absolute top-1/3 right-8 w-12 h-12 bg-green-200/10 rounded-full"></div>
        <div className="absolute bottom-1/3 left-8 w-20 h-20 bg-blue-200/10 rounded-full"></div>
        <div className="absolute bottom-1/4 right-4 w-14 h-14 bg-primary/5 rounded-full"></div>
      </div>
    </div>
  );
}

export default RegisterPage;

"use client";
import { toast } from "@/components/ui/use-toast";
import VendorBasicInfo from "@/components/vendorpage/VendorBasicInfo";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
// import ContactInfo from '@/components/vendorpage/ContectInfo';
import ContactInfo from "@/components/vendorpage/ContectInfo";
import ContactInfo2 from "@/components/vendorpage/SelectDate";
import { useCurrentUser } from "@/hooks/auth";
import VendorBusinessInfo from "@/components/vendorpage/VendorBussinessInfo";

// import ContactInfo from '@/components/vendorpage/ContectInfo';

type FormDataType = {
  [key: string]: any;
};

type StepType = {
  component: React.ComponentType<any>;
  title: string;
  img: string;
};

const VendorRegistrationForm: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [formData, setFormData] = useState<FormDataType>({});
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showOptionsStep, setShowOptionsStep] = useState<boolean>(true);
  const [selectedOptions, setSelectedOptions] = useState<
    Set<"service" | "product">
  >(new Set());
  const [currentForm, setCurrentForm] = useState<"service" | "product" | null>(
    null
  );
  const [showCompletion, setShowCompletion] = useState(false);
  const [selectedOption, setSelectedOption] = useState<
    "service" | "product" | null
  >(null);

  const role = useCurrentUser();
  const handleOptionSelect = (option: "service" | "product") => {
    setSelectedOption(option);
    setShowOptionsStep(false);
    setCurrentForm(option);
  };

  const steps: StepType[] = [
  {
    component: VendorBasicInfo,
    title: "Basic Information",
    img: "/basic.gif",
  },
  {
    component: ContactInfo,
    title: "Contact Information", 
    img: "/basic2.gif",
  },
  {
    component: VendorBusinessInfo, // NEW STEP
    title: "Business Details",
    img: "/business.gif",
  },
  {
    component: ContactInfo2,
    title: "Operating Hours",
    img: "/basic2.gif",
  },
];


  const updateData = (newData: FormDataType) => {
    setFormData((prevData) => ({ ...prevData, ...newData }));
  };

  const handleStepComplete = () => {
    setShowCompletion(true);
  };
  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const handleVendorSubmit = async () => {
    try {
      const vendorSubmitData = {
        ...formData,
        userId: role?.id,
        paymentStatus: "draft",
        services: undefined,
        products: undefined,
        certifications: undefined,
        references: undefined,
      };

      // Create vendor profile
      const vendorResponse = await fetch("/api/vendor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vendorSubmitData),
      });

      if (!vendorResponse.ok) {
        const errorData = await vendorResponse.json();
        throw new Error(errorData.error || "Failed to create vendor profile");
      }

      const vendorData = await vendorResponse.json();
      const newVendorId = vendorData.data.id;
      setVendorId(newVendorId);

      if (role?.id) {
        // Update user with vendor profile ID
        const updateData = {
          vendorProfileId: newVendorId,
          role: "VENDOR",
          updatedAt: new Date().toISOString(),
        };

        const updateUserResponse = await fetch(`/api/users/${role.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        });

        if (!updateUserResponse.ok) {
          const errorData = await updateUserResponse.json();
          throw new Error(
            errorData.error || "Failed to update user profile with vendor ID"
          );
        }

        const updateUserData = await updateUserResponse.json();
        console.log("User updated successfully:", updateUserData);
      }

      toast({
        title: "Success",
        description: "Vendor profile created successfully",
      });

      return newVendorId;
    } catch (error) {
      console.error("Error submitting vendor:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to submit vendor information",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleServicesSubmit = async (vendorId: string) => {
    if (!formData.services?.length) return;

    try {
      await Promise.all(
        formData.services.map((service: any) =>
          fetch("/api/vendorservice", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...service, vendorId }),
          })
        )
      );
    } catch (error) {
      console.error("Error submitting services:", error);
      toast({
        title: "Error",
        description: "Failed to submit vendor services",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleProductsSubmit = async (vendorId: string) => {
    if (!formData.products?.length) return;

    try {
      await Promise.all(
        formData.products.map((product: any) =>
          fetch("/api/vendorproduct", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...product, vendorId }),
          })
        )
      );
    } catch (error) {
      console.error("Error submitting products:", error);
      toast({
        title: "Error",
        description: "Failed to submit vendor products",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      const vendorId = await handleVendorSubmit();

      if (selectedOptions.has("service")) {
        await handleServicesSubmit(vendorId);
      }

      if (selectedOptions.has("product")) {
        await handleProductsSubmit(vendorId);
      }

      toast({
        title: "Registration Successful! 🎉",
        description:
          "Your vendor profile has been created successfully. Redirecting to your profile page...",
        variant: "default",
        duration: 3000,
      });

      router.push(`/dashboard/vendorOnboarding/payment/${vendorId}`);
    } catch (error) {
      console.error("Final submission error:", error);
      toast({
        title: "Error",
        description: "Registration failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="h-full bg-gradient-to-br from-green-100 to-green-100">
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Form Section */}
          <div className="flex-1 bg-white rounded-xl shadow-lg p-6">
            {/* Current Step Form */}
            <CurrentStepComponent
              data={formData}
              updateData={updateData}
              vendorId={vendorId}
              handleNextStep={handleNextStep}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorRegistrationForm;

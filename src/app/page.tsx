"use client"
import NavBar from "@/components/common/NavBar";
import BenefitSection from "@/components/sections/BenefitSection";
import CollabSection from "@/components/sections/CollabSection";
import FooterSection from "@/components/sections/FooterSection";
import HeroSection from "@/components/sections/HeroSection";
import OurFeatureSection from "@/components/sections/OurFeatureSection";
import SupportOurPartnerSection from "@/components/sections/SupportOurPartnerSection";
import AboutUs from "./about-us/page";
import { useState } from "react";
import ProcurementProductPage from "./product/page";
import ProcurementFAQPage from "./faq/page";

export default function Home() {
  const [currentTab , setCurrentTab] = useState<"Home"|"AboutUs"|"Product"|"Faq">("Home");
  return (
    <main className="relative">
      <NavBar setCurrentTab={setCurrentTab} />
      {/* <div className="mx-4 md:mx-[3.25rem] pt-32 lg:pt-16"> */}
{currentTab === "Home" &&
        <HeroSection />    
}   

{currentTab === "Product" &&
        <ProcurementProductPage />    
}   

{currentTab==="Faq"&&
<ProcurementFAQPage/>
}

{currentTab==="AboutUs" &&
<AboutUs/>
}

{/* </div> */}
      <FooterSection />
     
    </main>
  );
}

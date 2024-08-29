import NavBar from "@/components/common/NavBar";
import BenefitSection from "@/components/sections/BenefitSection";
import CollabSection from "@/components/sections/CollabSection";
import FooterSection from "@/components/sections/FooterSection";
import HeroSection from "@/components/sections/HeroSection";
import OurFeatureSection from "@/components/sections/OurFeatureSection";
import SupportOurPartnerSection from "@/components/sections/SupportOurPartnerSection";

export default function Home() {
  return (
    <main className="relative">
      <NavBar />
      <div className="mx-4 md:mx-[3.25rem] pt-32 lg:pt-16">
        <HeroSection />
        {/* <CollabSection /> */}
      </div>

      {/* <section>
        <SupportOurPartnerSection />
      </section>
      <div className="mx-4 md:mx-[3.25rem]">
        <OurFeatureSection />
        <BenefitSection />
      </div> */}

      {/* <FooterSection /> */}
      <div className=" mt-6 w-full  bg-slate-900 h-32"></div>
    </main>
  );
}

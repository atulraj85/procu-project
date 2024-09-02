import Sidebar from "@/components/shared/Sidebar";
import TopBar from "@/components/shared/TopBar";
import { vendorList } from "@/lib/sidebarLinks";
import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="">
      <div className="fixed top-0 left-0">
        <Sidebar items={vendorList} />
      </div>
      <div className="relative ml-64 flex flex-col">
        <TopBar />
        {children}
      </div>
    </div>
  );
};

export default layout;

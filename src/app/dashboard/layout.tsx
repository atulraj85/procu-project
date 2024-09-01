import Sidebar from "@/components/shared/Sidebar";
import TopBar from "@/components/shared/TopBar";
import { managerList, financeList } from "@/lib/sidebarLinks";
import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  const role: string = "finance";
  let list = managerList;

  if (role == "finance") {
    list = financeList;
  }
  return (
    <div className="">
    
    <div className="relative ml-64 flex flex-col">
      <TopBar />
      {children}
    </div>
  </div>
  );
};

export default layout;

"use client";
import DashboardNavBar from "@/components/common/DashboardNavBar";
import Sidebar from "@/components/shared/Sidebar";
import { useCurrentRole } from "@/hooks/auth";
import {
  AdminList,
  financeList,
  managerList,
  UserList,
  vendorList,
} from "@/lib/sidebarLinks";
import { IUserProfileResponse } from "@/types";
import React, { useState } from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [userProfile, setUserProfile] = useState<IUserProfileResponse | null>(
    null
  );
  const role = useCurrentRole();
  const [activeComponent, setActiveComponent] = useState("dashboard");

  const getSidebarList = () => {
    switch (role) {
      case "ADMIN":
        return AdminList;
      case "PR_MANAGER":
        return managerList;
      case "FINANCE_MANAGER":
        return financeList;
      case "VENDOR":
        return vendorList;
      default:
        return UserList;
    }
  };

  return (
    <div className="flex">
      <div className="fixed top-0 left-0 h-full">
        <Sidebar
          items={getSidebarList()}
          setActiveComponent={setActiveComponent}
        />
      </div>
      <div className="flex-1 ml-56">
        <div className="shadow">
          <DashboardNavBar userProfile={userProfile} loading={false} />
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default Layout;

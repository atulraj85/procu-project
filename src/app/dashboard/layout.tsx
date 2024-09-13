"use client";
import React, { useState, useEffect } from "react";
import DashboardNavBar from "@/components/common/DashboardNavBar";
import Loader from "@/components/shared/Loader";
import Sidebar from "@/components/shared/Sidebar";
import {
  managerList,
  financeList,
  AdminList,
  vendorList,
  UserList,
} from "@/lib/sidebarLinks";
import { IUserProfileResponse } from "@/types";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [userProfile, setUserProfile] = useState<IUserProfileResponse | null>(
    null
  );
  const [role, setRole] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [activeComponent, setActiveComponent] = useState("dashboard");

  useEffect(() => {
    const storedRole = localStorage.getItem("USER_ROLE");
    setRole(storedRole || "");
    setLoading(false);
  }, []);

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

  if (loading) {
    return <Loader />;
  }

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
          <DashboardNavBar userProfile={userProfile} loading={loading} />
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default Layout;

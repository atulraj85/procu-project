"use client";
import DashboardNavBar from "@/components/common/DashboardNavBar";
import Loader from "@/components/shared/Loader";
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
import React, { useEffect, useState } from "react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [userProfile, setUserProfile] = useState<IUserProfileResponse | null>(
    null
  );
  const role = useCurrentRole();
  const [loading, setLoading] = useState(true);
  const [activeComponent, setActiveComponent] = useState("dashboard");

  if (!role) {
    window.location.reload();
  }

  useEffect(() => {
    if (role) {
      setLoading(false);
    }
  }, [role]);

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
      case "USER":
        return UserList;
      default:
        return UserList;
    }
  };

  if (loading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
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

export default DashboardLayout;

"use client";

import DashboardNavBar from "@/components/common/DashboardNavBar";
import Loader from "@/components/shared/Loader";
import Sidebar from "@/components/shared/Sidebar";
import {
  managerList,
  financeList,
  AdminList,
  vendorList,
  UserList,
} from "@/lib/sidebarLinks"; // Assuming you have an adminList
import { IUserProfileResponse } from "@/types";
import React, { useState, useEffect } from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [userProfile, setUserProfile] = useState<IUserProfileResponse | null>(
    null
  );
  const [role, setRole] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedRole = localStorage.getItem("USER_ROLE");
    setRole(storedRole || "");
    setLoading(false);
  }, []);

  let list;

  switch (role) {
    case "ADMIN":
      list = AdminList;
      break;
    case "PR_MANAGER":
      list = managerList;
      break;
    case "FINANCE_MANAGER":
      list = financeList;
      break;
    case "VENDOR":
      list = vendorList;
      break;
    default:
      list = UserList;
  }

  return loading ? (
    <Loader />
  ) : (
    <div className="">
      <div className="relative ml-64 flex  flex-col content-center ">
        <div className=" border  bg-gray-50 ">
        <DashboardNavBar  userProfile={userProfile} loading={loading} />
        </div>
        {children}
      </div>
    </div>
  );
};

export default Layout;

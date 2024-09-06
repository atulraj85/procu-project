// src/app/dashboard/[role]/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardNavBar from "@/components/common/DashboardNavBar";
import makeApiCallService from "@/service/apiService";
import { IUserProfileResponse } from "@/types";
import AdminDashboard from "@/components/dashboards/AdminDashoard";
import Dashboardfinance from "@/components/finance/Dashboard";
import DashboardManager from "@/components/manager/Dashboard";
import AccountantDashboard from "@/components/dashboards/AccountantDashboard";
import VendorDashboard from "@/components/dashboards/VendorDashboard";
import { Admin, managerList, vendorList } from "@/lib/sidebarLinks";
import { log } from "console";
import ManagerDashboard from "@/components/dashboards/ManagerDashboard";

interface RoleDashboardProps {
  params: {
    role: string; // Define the type for the role parameter
  };
}

export default function RoleDashboard({ params }: RoleDashboardProps) {
  const router = useRouter();
  const { role } = params; // Get the role from the params

  useEffect(() => {
    // Check if the role is valid
    const validRoles = ["admin", "manager", "accountant", "vendor"];

    if (!role || !validRoles.includes(role)) {
      // Redirect to a default page if the role is invalid
      router.push("/dashboard/default");
    }
  }, [role, router]);

  const [userProfile, setUserProfile] = useState<IUserProfileResponse | null>(
    null
  );

  // useEffect(() => {
  //   async function fetch() {
  //     try {
  //       const response = await makeApiCallService<IUserProfileResponse>(
  //         "/api/dashboard/user-profile",
  //         {
  //           method: "GET",
  //         }
  //       );
  //       setUserProfile(response as IUserProfileResponse);
  //       setLoading(false);
  //     } catch (err) {
  //       setLoading(false);
  //     }
  //   }

  //   fetch();
  // }, []);


  const renderDashboardContent = () => {
    switch (role) {
      case "admin":
        return <AdminDashboard list={Admin} />;
      case "manager":
        return <ManagerDashboard list={managerList} />;
      case "accountant":
        return <AccountantDashboard list={managerList} />;
      case "vendor":
        return <VendorDashboard list={vendorList} />;
      default:
        return null;
    }
  };

  return (
    <div className="mx-4  mt-4  pb-16">
      <DashboardNavBar userProfile={userProfile} loading={false} />
      {/* <p>Welcome to the {role} dashboard!</p> */}
      {renderDashboardContent()}
    </div>
  );
}

"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/components/shared/Loader";
import AccountantDashboard from "@/components/dashboards/AccountantDashboard";
import ManagerDashboard from "@/components/dashboards/ManagerDashboard";
import VendorDashboard from "@/components/dashboards/VendorDashboard";
import {
  AdminList,
  managerList,
  vendorList,
  financeList,
} from "@/lib/sidebarLinks";
import AdminDashboard from "@/components/dashboards/AdminDashoard";

export default function Dashboard() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeComponent, setActiveComponent] = useState("dashboard");

  useEffect(() => {
    const token = localStorage.getItem("TOKEN");
    const userRole = localStorage.getItem("USER_ROLE");
    if (!token) {
      router.push("/login");
      return;
    }
    console.log(userRole);
    setRole(userRole || "");
    setLoading(false);
  }, [router]);

  const renderDashboardContent = () => {
    switch (role) {
      case "ADMIN":
        return (
          <AdminDashboard
            list={AdminList}
            activeComponent={activeComponent}
            setActiveComponent={setActiveComponent}
          />
        );
      case "PR_MANAGER":
        return (
          <ManagerDashboard
            list={managerList}
            activeComponent={activeComponent}
            setActiveComponent={setActiveComponent}
          />
        );
      // case "ACCOUNTANT":
      //   return (
      //     <AccountantDashboard
      //       list={financeList}
      //       activeComponent={activeComponent}
      //       setActiveComponent={setActiveComponent}
      //     />
      //   );
      // case "VENDOR":
      //   return (
      //     <VendorDashboard
      //       list={vendorList}
      //       activeComponent={activeComponent}
      //       setActiveComponent={setActiveComponent}
      //     />
      //   );
      // default:
      //   return (
      //     <VendorDashboard
      //       list={vendorList}
      //       activeComponent={activeComponent}
      //       setActiveComponent={setActiveComponent}
      //     />
      //   );
    }
  };

  if (loading) {
    return <Loader />;
  }

  return <div className="mx-4 mt-4">{renderDashboardContent()}</div>;
}

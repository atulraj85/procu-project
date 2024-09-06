"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../shared/Sidebar";
import { SidebarItem } from "@/app/types/types";
import Dashboard from "../manager/Dashboard";
import Addvender from "../manager/Addvender";
import RFPForm from "../new-manager/RFPDraftForm";
import RFPUpdateForm from "../new-manager/UpdateRFPForm";

interface ManagerDashboardProps {
  list: SidebarItem[];
}

export default function ManagerDashboard({ list }: ManagerDashboardProps) {
  const [activeComponent, setActiveComponent] = useState<
    "dashboard" | "createRFP" | "Addvendor" | "addQoutation"
  >("dashboard");

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("TOKEN");
    const role = localStorage.getItem("USER_ROLE");

    if (!token) {
      router.push("/login");
    } else if (role !== "PR_MANAGER") {
      router.push("/dashboard");
    }
  }, [router]);

  return (
    <div>
      <div className="fixed top-0 left-0">
        <Sidebar
          items={list}
          setActiveComponent={setActiveComponent} // Pass the function to update state
        />
      </div>
      <div>
        {activeComponent === "dashboard" && <Dashboard />}
        {activeComponent === "createRFP" && <RFPForm />}
        {activeComponent === "addQoutation" && <RFPUpdateForm />}
        {activeComponent === "Addvendor" && <Addvender />}
      </div>
    </div>
  );
}

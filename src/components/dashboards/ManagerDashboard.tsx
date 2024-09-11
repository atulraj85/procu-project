"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../shared/Sidebar";
import { SidebarItem } from "@/app/types/types";
import Dashboard from "../manager/Dashboard";
import Addvender from "../manager/Addvender";
import RFPForm from "../new-manager/RFPDraftForm";
import RFPUpdateForm from "../new-manager/UpdateRFP2";

interface ManagerDashboardProps {
  list: SidebarItem[];
  activeComponent: string;
  setActiveComponent: (value: string) => void;
}

export default function ManagerDashboard({
  list,
  activeComponent,
  setActiveComponent,
}: ManagerDashboardProps) {
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

  const renderComponent = () => {
    switch (activeComponent) {
      case "dashboard":
        return <Dashboard />;
      case "createRFP":
        return <RFPForm />;
      case "addQoutation":
        return <RFPUpdateForm />;
      case "Addvendor":
        return <Addvender />;
      default:
        return <h1 className="text-2xl font-bold mb-4">Select a component</h1>;
    }
  };

  return (
    <div className="flex">
      <div className="fixed top-0 left-0">
        <Sidebar items={list} setActiveComponent={setActiveComponent} />
      </div>
      <div className="p-8 w-full">{renderComponent()}</div>
    </div>
  );
}

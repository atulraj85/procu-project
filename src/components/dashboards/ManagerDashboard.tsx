"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Dashboard from "../manager/Dashboard";
import RFPForm from "../new-manager/RFPDraftForm";

interface ManagerDashboardProps {
  activeComponent: string;
}

export default function ManagerDashboard({
  activeComponent,
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
      default:
        return <h1 className="text-2xl font-bold mb-4">Select a component</h1>;
    }
  };

  return <div className="px-8 py-4 w-full">{renderComponent()}</div>;
}

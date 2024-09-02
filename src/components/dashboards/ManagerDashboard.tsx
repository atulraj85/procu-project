"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../shared/Sidebar";
import { SidebarItem } from "@/app/types/types";
import { Table } from "@/components/dashboards/Admin/Table";
import { Table2 } from "@/components/dashboards/Admin/Table2";
import Page from "../vendor/dashboard/page";
import ProductDetails from "../manager/ProductDetails";
import RequestForProduct from "../manager/RequestForProduct";

interface ManagerDashboardProps {
  list: SidebarItem[];
  
}

export default function ManagerDashboard({ list }: ManagerDashboardProps) {
  // Use TypeScript to explicitly set the type for activeComponent
  const [activeComponent, setActiveComponent] = useState<"dashboard" | string>("dashboard");

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("TOKEN");
    const role = localStorage.getItem("USER_ROLE")

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
          activeComponent={activeComponent}
          setActiveComponent={setActiveComponent}
        />
      </div>
      <div>
        {activeComponent === "dashboard" && < Page/>}
        {activeComponent === "productCatalog" && <RequestForProduct/>}
      </div>
    </div>
  );
}

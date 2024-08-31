// src/app/dashboard/admin/page.tsx

"use client";

import {useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// import Dashboard from "@/app/dashboard/page";
import Sidebar from "../shared/Sidebar";
import Dashboard from "../manager/Dashboard"
import { vendorList } from "@/lib/sidebarLinks";
import { SidebarItem } from "@/app/types/types";

interface SidebarOneProps {
  list: SidebarItem[];
}
export default function ManagerDashboard({list}:SidebarOneProps) {
  // const [activeComponent, setActiveComponent] = useState("service");

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("TOKEN");
    const role = localStorage.getItem("USER_ROLE");

    if (!token) {
      router.push("/login");
    } else if (role?.toLowerCase() !== "manager") {
      router.push("/dashboard");
    }
  }, [router]);

  return (
    <div>
       <div className="fixed top-0 left-0">
      <Sidebar items={list} />
    </div>
      
    </div>
  );
}

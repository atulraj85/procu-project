// src/app/dashboard/admin/page.tsx

"use client";

import {useEffect } from "react";
import { useRouter } from "next/navigation";
// import Dashboard from "@/app/dashboard/page";
import Sidebar from "../shared/Sidebar";
import Dashboard from "../manager/Dashboard"
import { vendorList } from "@/lib/sidebarLinks";

export default function ManagerDashboard() {
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
        {/* <Sidebar items={vendorList} /> */}
        
      </div>
      
    </div>
  );
}

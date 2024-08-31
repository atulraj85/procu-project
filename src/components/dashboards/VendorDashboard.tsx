// src/app/dashboard/admin/page.tsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Vendor from "../../app/dashboard/page"
import { SidebarItem } from "@/app/types/types";
import Sidebar from "../shared/Sidebar";

interface SidebarOneProps {
  list: SidebarItem[];
}

export default function VendorDashboard({list}:SidebarOneProps) {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("TOKEN");
    const role = localStorage.getItem("USER_ROLE");

    if (!token) {
      router.push("/login");
    } else if (role?.toLowerCase() !== "vendor") {
      router.push("/dashboard");
    }
  }, [router]);

  return (
    <div>
       <div className="fixed top-0 left-0">
      <Sidebar items={list} />
    </div>
      <h1>Vendor Dashboard</h1>
      <Vendor/>
    </div>
  );
}

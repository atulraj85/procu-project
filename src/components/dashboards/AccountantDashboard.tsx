// src/app/dashboard/admin/page.tsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SidebarItem } from "@/app/types/types";

interface SidebarOneProps {
  list: SidebarItem[];
}
export default function AccountantDashboard({list}:SidebarOneProps) {
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
      <h1>Accountant Dashboard</h1>
    </div>
  );
}

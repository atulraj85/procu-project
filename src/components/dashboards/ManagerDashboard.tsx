// src/app/dashboard/admin/page.tsx

"use client";

import {useEffect } from "react";
import { useRouter } from "next/navigation";

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
      <h1>Manager Dashboard</h1>
    </div>
  );
}

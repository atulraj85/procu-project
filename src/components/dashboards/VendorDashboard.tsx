// src/app/dashboard/admin/page.tsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VendorDashboard() {
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
      <h1>Vendor Dashboard</h1>
    </div>
  );
}

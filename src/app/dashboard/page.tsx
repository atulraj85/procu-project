"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/components/shared/Loader";

export default function Dashboard() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("TOKEN");
    const userRole = localStorage.getItem("USER_ROLE");
    if (!token) {
      router.push("/login");
      return;
    }
    setRole(userRole || "");
    setLoading(false);
  }, [router]);

  useEffect(() => {
    if (!loading) {
      switch (role) {
        case "ADMIN":
          router.push("/dashboard/admin");
          break;
        case "PR_MANAGER":
          router.push("/dashboard/manager");
          break;
        case "FINANCE_MANAGER":
          router.push("/dashboard/finance");
          break;
        default:
          // Handle default case if needed
          break;
      }
    }
  }, [role, loading, router]);

  if (loading) {
    return <Loader />;
  }

  return <div className="mx-4 ">{/* Your dashboard content goes here */}</div>;
}

// src/app/dashboard/page.tsx

"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    // Retrieve the token and role from local storage
    const token = localStorage.getItem("TOKEN");
    const role = localStorage.getItem("USER_ROLE");

    // Check if the user is authenticated
    if (!token) {
      router.push("/login");
      return;
    }

    // Redirect based on user role
    switch (role) {
      case "ADMIN":
        router.push("/dashboard/admin");
        break;
      case "PR_MANAGER":
        router.push("/dashboard/manager");
        break;
      case "ACCOUNTANT":
        router.push("/dashboard/accountant");
        break;
      case "VENDOR":
        router.push("/dashboard/vendor");
        break;
      default:
        // If role is not set or unknown, redirect to a default page
        router.push("/dashboard/default");
    }
  }, [router]);

  // This return is just a fallback, the component should redirect before rendering
  return <div>Redirecting...</div>;
}

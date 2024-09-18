"use client";
import { useCurrentRole } from "@/hooks/auth";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const role = useCurrentRole();

  if (!role) {
    router.push("/auth/login");
    return;
  } else {
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

  return <div className="mx-4 ">{/* Your dashboard content goes here */}</div>;
}

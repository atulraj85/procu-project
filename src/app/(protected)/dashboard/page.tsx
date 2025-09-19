"use client";
import Loader from "@/components/shared/Loader";
import { useCurrentRole } from "@/hooks/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const router = useRouter();
  const role = useCurrentRole();
  const [isRedirecting, setIsRedirecting] = useState(false);

  if (!role) {
    window.location.reload();
  }

  useEffect(() => {
    if (!role) {
      window.location.reload();
      router.push("/auth/login");
      return;
    }

    setIsRedirecting(true);
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
      case "USER":
        router.push("/dashboard/user")
      default:
        setIsRedirecting(false);
        break;
    }
  }, [router, role]);

  if (isRedirecting) {
    return <Loader />;
  }

  return (
    <div className="mx-4">{/* Your default dashboard content goes here */}</div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { IUsersListingResponse, SidebarItem } from "@/types";
import Loader from "@/components/shared/Loader";

export default function Page() {
  const router = useRouter();
  const [usersListing, setUsersListing] =
    useState<IUsersListingResponse | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("TOKEN");
    const role = localStorage.getItem("USER_ROLE");
    const userID = localStorage.getItem("USER_ID");
    if (!token) {
      router.push("/login");
    } else if (role?.toLowerCase() !== "admin") {
      router.push("/dashboard/admin");
    }
  }, [router]);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data: IUsersListingResponse = await response.json();
        setUsersListing(data);
      }
    };
    fetchUsers();
  }, []);

  if (!usersListing) {
    return <Loader />;
  }

  // const users = usersListing.response.data.map((user) => ({
  //   id: user.id,
  //   name: user.name,
  //   email: user.email,
  //   role: user.role,
  // }));

  return (
    <div className="flex">
      <div className="fixed top-0 left-0"></div>
    </div>
  );
}

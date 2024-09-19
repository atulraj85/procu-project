"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import Loader from "@/components/shared/Loader";
import { IUsersListingResponse } from "@/types";

function Page() {
  const [usersListing, setUsersListing] =
    useState<IUsersListingResponse | null>(null);

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

  const users = usersListing.response.data.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  }));

  return (
    <div className="flex">
      <div className="fixed top-0 left-0"></div>
    </div>
  );
}

export default Page;

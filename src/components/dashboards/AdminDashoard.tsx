"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IUsersListingResponse, SidebarItem } from "@/types";
import Sidebar from "../shared/Sidebar";
import Loader from "../shared/Loader";

interface SidebarOneProps {
  list: SidebarItem[];
}

export default function AdminDashboard({ list }: SidebarOneProps) {
  const router = useRouter();
  const [usersListing, setUsersListing] =
    useState<IUsersListingResponse | null>(null);
  const [activeComponent, setActiveComponent] = useState<
    "dashboard" | "createRFP" | "Addvendor" | "addQoutation"
  >("dashboard");

  useEffect(() => {
    const token = localStorage.getItem("TOKEN");
    const role = localStorage.getItem("USER_ROLE");
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

  const users = usersListing.response.data.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  }));

  return (
    <div className="flex">
      <div className="fixed top-0 left-0">
        <Sidebar items={list} setActiveComponent={setActiveComponent} />
      </div>
      <div className="ml-64 p-8 w-full">
        {" "}
        {/* Adjust margin and padding as needed */}
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

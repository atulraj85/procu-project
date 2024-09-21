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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { IUsersListingResponse } from "@/types";
import Loader from "@/components/shared/Loader";
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}



export default function AdminDashboard() {
  const router = useRouter();
  const [usersListing, setUsersListing] =
    useState<User[] | null>(null);

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
        const data = await response.json();
        setUsersListing(data);
      }
    };
    fetchUsers();
  }, []);

  if (!usersListing) {
    return <Loader />;
  }

  const users = usersListing.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  }));

  // Function to handle role change
  const handleRoleChange = async (role: string, id: number) => {
    console.log("User ID:", id);
    console.log("New Role:", role);

    try {
      const response = await fetch(`/api/users`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role,id }),
      });

      if (response.ok) {
        console.log("Role updated successfully");
        // Optionally, refetch users or update the local state to reflect the change
      } else {
        console.error("Failed to update role");
      }
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  return (
    <div className="flex">
      <div className="fixed top-0 left-0"></div>
      <>
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
                <TableCell>
                  <Select
                    onValueChange={(value) => handleRoleChange(value, user.id)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={user.role} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">ADMIN</SelectItem>
                      <SelectItem value="PR_MANAGER">PR_MANAGER</SelectItem>
                      <SelectItem value="FINANCE_MANAGER">FINANCE_MANAGER</SelectItem>
                      <SelectItem value="USER">USER</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </>{" "}
    </div>
  );
}
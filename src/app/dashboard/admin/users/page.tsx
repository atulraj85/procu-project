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
import Loader from "@/components/shared/Loader";

export default function AdminDashboard() {
  const [usersListing, setUsersListing] =
    useState<IUsersListingResponse | null>();
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/users");
        if (response.ok) {
          const data = await response.json();
          console.log("data", data);
          setUsersListing(data);
          setUsersListing({
            response: {
              meta: { success: true, message: "This is a message" },
              data: data,
            },
          });
        }
      } catch (err) {
        console.error("Error fetching users", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  const users =
    usersListing?.response?.data?.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    })) || [];

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
                <TableCell>{user.role}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </>{" "}
    </div>
  );
}

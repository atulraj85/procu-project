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
} from "@/components/ui/table"; // Assuming these are your table components
import { IUsersListingResponse, SidebarItem } from "@/types";
import Sidebar from "../shared/Sidebar";

interface SidebarOneProps {
  list: SidebarItem[];
}
// const Sidebar: React.FC<SidebarOneProps> = ({ items }) => {
export default function AdminDashboard({ list }: SidebarOneProps) {
  console.log("Received list prop:", list);

  const router = useRouter();
  const [usersListing, setUsersListing] =
    useState<IUsersListingResponse | null>(null);

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
    return <div>Loading...</div>;
  }

  const users = usersListing.response.data.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email, // Assuming the user object has an email property
    role: user.role, // Assuming the user object has a role property
  }));

   const [activeComponent, setActiveComponent] = useState<
     "dashboard" | "createRFP" | "Addvendor" | "addQoutation"
   >("dashboard");


  return (
    <>
      <div>
        <div className="fixed top-0 left-0">
          <Sidebar items={list} setActiveComponent={setActiveComponent} />
        </div>
      </div>
      <div>
        <h1>Admin Dashboard</h1>
        {/* <p>List content: {JSON.stringify(list)}</p> Display the received list prop */}
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
    </>
  );
}

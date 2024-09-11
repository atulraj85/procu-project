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

interface AdminDashboardProps {
  list: SidebarItem[];
  activeComponent: string;
  setActiveComponent: (value: string) => void;
}

export default function AdminDashboard({
  list,
  activeComponent,
  setActiveComponent,
}: AdminDashboardProps) {
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
    return <Loader />;
  }

  const users = usersListing.response.data.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  }));

  const renderComponent = () => {
    switch (activeComponent) {
      case "Users":
        return (
          <>
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
          </>
        );
      case "Dashboard":
        return <h1 className="text-2xl font-bold mb-4">Welcome Admin!</h1>;
      case "Component 1":
        return <h1 className="text-2xl font-bold mb-4">Component 1</h1>;
      case "Component 2":
        return <h1 className="text-2xl font-bold mb-4">Component 2</h1>;
      default:
        return <h1 className="text-2xl font-bold mb-4">Select a component</h1>;
    }
  };

  return (
    <div className="flex">
      <div className="fixed top-0 left-0">
        <Sidebar items={list} setActiveComponent={setActiveComponent} />
      </div>
      <div className="p-8 w-full">{renderComponent()}</div>
    </div>
  );
}

"use client"
import React, { useState, useEffect } from "react";
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
import Loader from "@/components/shared/Loader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "react-toastify";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<User[] | null>(null);
  const [pendingRoleChange, setPendingRoleChange] = useState<{
    role: string;
    id: number;
    currentRole: string;
  } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
        setUsers(data);
      }
    };
    fetchUsers();
  }, []);

  if (!users) {
    return <Loader />;
  }

  const handleRoleChange = async () => {
    if (!pendingRoleChange) return;

    const { role, id } = pendingRoleChange;

    try {
      const response = await fetch(`/api/users`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role, id }),
      });

      if (response.ok) {
        toast("Role updated successfully");
        console.log("role changes");
        // Update the local state to reflect the change
        setUsers(users.map(user => 
          user.id === id ? { ...user, role } : user
        ));
      } else {
        console.error("Failed to update role");
        toast.error("Failed to update role");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Error updating role");
    } finally {
      setIsDialogOpen(false);
      setPendingRoleChange(null);
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
                    value={user.role}
                    onValueChange={(value) => {
                      if (value !== user.role) {
                        setPendingRoleChange({ role: value, id: user.id, currentRole: user.role });
                        setIsDialogOpen(true);
                      }
                    }}
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

        {pendingRoleChange && (
          <AlertDialog open={isDialogOpen} onOpenChange={(open) => {
            if (!open) {
              // Reset to the current role if dialog is closed without confirmation
              setUsers(users.map(user => 
                user.id === pendingRoleChange.id ? { ...user, role: pendingRoleChange.currentRole } : user
              ));
              setPendingRoleChange(null);
            }
            setIsDialogOpen(open);
          }}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-red-500">Confirm Role Change</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to change the role?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-red-500" onClick={handleRoleChange}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </>
    </div>
  );
}
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
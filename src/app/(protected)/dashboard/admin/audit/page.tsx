import React from "react";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const page = () => {
  return (
    <div>

            <div className="flex justify-between m-4">
                <h2>RFP ID</h2>
                <h2>RFP CreatedAt</h2>
            </div>

      <Table>
        <TableCaption></TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead >Log Title</TableHead>
            <TableHead>Creator Name</TableHead>
            <TableHead>Creator Role</TableHead>
            <TableHead>creator Email</TableHead>
            <TableHead >Created at</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell >RFP Created</TableCell>
            <TableCell>Paid</TableCell>
            <TableCell>Admin</TableCell>
            <TableCell>sonu123@gmail.com</TableCell>
            <TableCell>02/5/2004</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default page;

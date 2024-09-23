import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface TableRow {
  rfpId: string;
  requirementType: string;
  dateOfOrdering: string;
  deliveryLocation: string;
  deliveryByDate: string;
  lastDateToRespond: string;
  rfpStatus: string;
}

export const columns1: ColumnDef<TableRow>[] = [
  { header: "RFP ID", accessorKey: "rfpId" },
  { header: "Requirement Type", accessorKey: "requirementType" },
  { header: "Date of Ordering", accessorKey: "dateOfOrdering" },
  { header: "Delivery Location", accessorKey: "deliveryLocation" },
  { header: "Delivery By Date", accessorKey: "deliveryByDate" },
  { header: "RFP Status", accessorKey: "rfpStatus" },
  {
    id: "actions",
    cell: ({ row }) => {
      const columns1 = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link
              href={`/dashboard/manager/rfp/quotation?rfp=${encodeURIComponent(
                columns1.rfpId
              )}`}
            >
              <DropdownMenuItem>Create Quotation</DropdownMenuItem>
            </Link>
            <Link
              href={`/dashboard/manager/rfp/view?rfp=${encodeURIComponent(
                columns1.rfpId
              )}`}
            >
              <DropdownMenuItem>View</DropdownMenuItem>
            </Link>
            <Link
              href={`/dashboard/manager/rfp/edit?rfp=${encodeURIComponent(
                columns1.rfpId
              )}`}
            >
              <DropdownMenuItem>Edit</DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
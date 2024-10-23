import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

interface TableRow {
  rfpId: string;
  requirementType: string;
  dateOfOrdering: string;
  deliveryLocation: string;
  deliveryByDate: string;
  lastDateToRespond: string;
  rfpStatus: string;
  quotations?: Array<any>; // Add quotations to the interface
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
      const rowData = row.original;
      const hasQuotations = rowData.quotations && rowData.quotations.length > 0;

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

            {/* Only show Add Quotations if there are no existing quotations */}
            {!hasQuotations && (
              <Link
                href={`/dashboard/manager/rfp/quotation?rfp=${encodeURIComponent(
                  rowData.rfpId
                )}`}
              >
                <DropdownMenuItem>Add Quotations</DropdownMenuItem>
              </Link>
            )}

            <Link
              href={`/dashboard/manager/rfp/view?rfp=${encodeURIComponent(
                rowData.rfpId
              )}`}
            >
              <DropdownMenuItem>View</DropdownMenuItem>
            </Link>

            {!hasQuotations && (
              <Link
                href={`/dashboard/manager/rfp/edit?rfp=${encodeURIComponent(
                  rowData.rfpId
                )}`}
              >
                <DropdownMenuItem>Edit</DropdownMenuItem>
              </Link>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

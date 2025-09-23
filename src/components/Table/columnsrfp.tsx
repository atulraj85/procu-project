// Update your columns file
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";

interface TableRow {
  id: string;
  rfpNumber: string;
  title: string;
  description: string;
  deliveryLocation: string;
  deliveryDate: string;
  quotationCutoffDate: string;
  status: string;
  createdAt: string;
  createdBy: string;
  lineItemsCount: number;
  estimatedBudget: string;
  quotations?: any[];
  totalQuotations?: number;
}

export const columns1: ColumnDef<TableRow>[] = [
  { 
    header: "RFP Number", 
    accessorKey: "rfpNumber",
    cell: ({ getValue }) => (
      <span className="font-mono text-sm">{getValue() as string}</span>
    )
  },
  { 
    header: "Title", 
    accessorKey: "title",
    cell: ({ getValue, row }) => (
      <div>
        <div className="font-medium">{getValue() as string}</div>
        <div className="text-xs text-gray-500 truncate max-w-xs">
          {row.original.description}
        </div>
      </div>
    )
  },
  { 
    header: "Status", 
    accessorKey: "status",
    cell: ({ getValue }) => {
      const status = getValue() as string;
      const statusColors: { [key: string]: string } = {
        'DRAFT': 'bg-gray-100 text-gray-800',
        'PENDING_APPROVAL': 'bg-yellow-100 text-yellow-800',
        'APPROVED': 'bg-blue-100 text-blue-800',
        'SENT_TO_VENDORS': 'bg-purple-100 text-purple-800',
        'QUOTATION_RECEIVED': 'bg-indigo-100 text-indigo-800',
        'COMPLETED': 'bg-green-100 text-green-800',
        'DELIVERED': 'bg-green-100 text-green-800',
      };
      
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
          {status.replace(/_/g, ' ')}
        </span>
      );
    }
  },
  { 
    header: "Delivery Location", 
    accessorKey: "deliveryLocation",
    cell: ({ getValue, row }) => (
      <div>
        <div className="font-medium">{(getValue() as string)}</div>
      </div>
    )
  },
  { 
    header: "Delivery Date", 
    accessorKey: "deliveryDate" 
  },
  { 
    header: "Created By", 
    accessorKey: "createdBy" 
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const rowData = row.original;
      const canApprove = rowData.status === "DRAFT" || rowData.status === "PENDING_APPROVAL";
      const canEdit = rowData.status === "DRAFT";
      const hasQuotations = (rowData.totalQuotations || 0) > 0;

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

            {/* View - Always available */}
            <Link href={`/dashboard/manager/rfp/view/${rowData.id}`}>
              <DropdownMenuItem>View Details</DropdownMenuItem>
            </Link>

            {/* Edit - Only for DRAFT status */}
            {/* {canEdit && (
              <Link href={`/dashboard/user/rfp/edit/${rowData.id}`}>
                <DropdownMenuItem>Edit</DropdownMenuItem>
              </Link>
            )} */}

            {/* Conversations - Always available */}
            {/* <Link href={`/dashboard/user/rfp/${rowData.id}/conversations`}>
              <DropdownMenuItem>View Conversations</DropdownMenuItem>
            </Link> */}

            {/* Quotations - Show count if available */}
            {hasQuotations && (
              <Link href={`/dashboard/procurement-lead/rfp/quotations/${rowData.id}`}>
                <DropdownMenuItem>
                  View Quotations ({rowData.totalQuotations})
                </DropdownMenuItem>
              </Link>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
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

export type Vendor = {
  gstin: string | number | boolean;
  vendor_gstn: string;
  company_name: string;
  contact_no: string;
  state: string;
  email: string;
  primaryName: string;
};

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

export const columns2: ColumnDef<TableRow>[] = [
  { header: "RFP ID", accessorKey: "rfpId" },
  { header: "Requirement Type", accessorKey: "requirementType" },
  { header: "Date of Ordering", accessorKey: "dateOfOrdering" },
  { header: "Delivery Location", accessorKey: "deliveryLocation" },
  { header: "Delivery By Date", accessorKey: "deliveryByDate" },
  // { header: "Last Date to Respond", accessorKey: "lastDateToRespond" },
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
              href={`/dashboard/finance/createpo?rfp=${encodeURIComponent(
                columns1.rfpId
              )}`}
            >
              {" "}
              <DropdownMenuItem> Create Purchase Order</DropdownMenuItem>{" "}
            </Link>
            {/* <Link
              href={`/dashboard/finance/readpo?rfp=${encodeURIComponent(
                columns1.rfpId
              )}`}
            >
              <DropdownMenuItem> View</DropdownMenuItem>
            </Link> */}
            {/* <Link href={`/dashboard/manager/editrfp?rfp=${encodeURIComponent(columns1.rfpId)}`}><DropdownMenuItem >  Edit </DropdownMenuItem></Link> */}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

interface TableRow1 {
  id: string;
  poId: string;
  RFPStatus: string;
  quotations: Array<{
    totalAmount: string;
    totalAmountWithoutGST: string;
    vendor: {
      companyName: string;
      mobile: string;
    };
  }>;
}

export const Po1: ColumnDef<TableRow1>[] = [
  { header: "PoId", accessorKey: "poId" },
  {
    header: "Vendor Name",
    accessorFn: (row) => row.quotations[0]?.vendor.companyName,
  },
  {
    header: "Vendor Mobile",
    accessorFn: (row) => row.quotations[0]?.vendor.mobile,
  },
  // {
  //   header: "Taxable Amount",
  //   accessorFn: (row) => row.quotations[0]?.totalAmountWithoutGST,
  // },
  {
    header: "Total Amount",
    accessorFn: (row) => row.quotations[0]?.totalAmount,
  },
  { header: "PO Status", accessorKey: "RFPStatus" },
  {
    id: "actions",
    cell: ({ row }) => {
      const poData = row.original;
      // console.log("poData1", poData);

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
              href={`/dashboard/finance/readpo?poid=${encodeURIComponent(
                poData.poId
              )}`}
            >
              <DropdownMenuItem> View</DropdownMenuItem>
            </Link>
            {/* <Link
              href={`/dashboard/manager/rfp/view?rfp=${encodeURIComponent(
                poData.id
              )}`}
            >
              <DropdownMenuItem>View</DropdownMenuItem>
            </Link> */}
            {/* <Link
              href={`/dashboard/manager/rfp/edit?rfp=${encodeURIComponent(
                poData.id
              )}`}
            >
              <DropdownMenuItem>Edit</DropdownMenuItem>
            </Link> */}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export const columns: ColumnDef<Vendor>[] = [
  {
    accessorKey: "gstin",
    header: "GSTN",
  },
  {
    accessorKey: "primaryName",
    // header: "Vendor Name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Vendor Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "companyName",
    header: "Company Name",
  },
  // {
  //   accessorKey: "mobile",
  //   header: "Contact No",
  // },
  // {
  //   accessorKey: "state",
  //   header: "State",
  // },
  {
    accessorKey: "email",
    // header: "Email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
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
            {/* <Link href="/dashboard/add"> <DropdownMenuItem> Create Quotation</DropdownMenuItem> </Link> */}
            <Link
              href={`/dashboard/manager/vendor/view?gstin=${encodeURIComponent(
                columns1.gstin
              )}`}
            >
              <DropdownMenuItem>View</DropdownMenuItem>
            </Link>

            <Link
              href={`/dashboard/manager/vendor/edit?gstin=${encodeURIComponent(
                columns1.gstin
              )}`}
            >
              <DropdownMenuItem> Edit </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

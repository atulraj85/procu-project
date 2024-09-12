import { ColumnDef } from "@tanstack/react-table";

import { ArrowUpDown } from "lucide-react"
import { Button } from "../ui/button";
import { MoreHorizontal } from "lucide-react"


export type Vendor = {
  gstin: string | number | boolean;
  vendor_gstn: string;
  company_name: string;
  contact_no: string;
  state: string;
  email: string;
  primaryName: string;
};
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import RFPUpdateForm from "../new-manager/UpdateRFPForm";
import Link from "next/link";
import { MdEdit } from "react-icons/md";
interface TableRow {
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
    // { header: "Last Date to Respond", accessorKey: "lastDateToRespond" },
    { header: "RFP Status", accessorKey: "rfpStatus" },
    {
      id: "actions",
      cell: ({ row }) => {
        const columns1 = row.original
        console.log("from  ",columns1);
        
   
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
              <Link  href={`/dashboard/manager/rfp/quotation?rfp=${encodeURIComponent(columns1.rfpId)}`}> <DropdownMenuItem> Create Quotation</DropdownMenuItem> </Link>
              <Link href={`/dashboard/manager/rfp/view?rfp=${encodeURIComponent(columns1.rfpId)}`}><DropdownMenuItem> View</DropdownMenuItem></Link>
              <Link href={`/dashboard/manager/rfp/edit?rfp=${encodeURIComponent(columns1.rfpId)}`}><DropdownMenuItem >  Edit </DropdownMenuItem></Link>

            </DropdownMenuContent>
          </DropdownMenu>
        )
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
        const columns1 = row.original
        console.log("from  ",columns1);
        
   
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
              <Link  href={`/dashboard/finance/createpo?rfp=${encodeURIComponent(columns1.rfpId)}`}> <DropdownMenuItem> Create Order</DropdownMenuItem> </Link>
              <Link href={`/dashboard/manager/viewrfp?rfp=${encodeURIComponent(columns1.rfpId)}`}><DropdownMenuItem> View</DropdownMenuItem></Link>
              {/* <Link href={`/dashboard/manager/editrfp?rfp=${encodeURIComponent(columns1.rfpId)}`}><DropdownMenuItem >  Edit </DropdownMenuItem></Link> */}

            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ];

  
  //   {
  //     Header: 'ID',
  //     accessor: 'id',
  //   },
  //   {
  //     Header: 'Customer Code',
  //     accessor: 'customerCode',
  //   },
  //   {
  //     Header: 'Primary Name',
  //     accessor: 'primaryName',
  //   },
  //   {
  //     Header: 'Company Name',
  //     accessor: 'companyName',
  //   },
  //   {
  //     Header: 'Contact Display Name',
  //     accessor: 'contactDisplayName',
  //   },
  //   {
  //     Header: 'Email',
  //     accessor: 'email',
  //   },
  //   {
  //     Header: 'Work Phone',
  //     accessor: 'workPhone',
  //   },
  //   {
  //     Header: 'Mobile',
  //     accessor: 'mobile',
  //   },
  //   {
  //     Header: 'Website',
  //     accessor: 'website',
  //   },
  //   {
  //     Header: 'GSTIN',
  //     accessor: 'gstin',
  //   },
  //   {
  //     Header: 'MSME No',
  //     accessor: 'msmeNo',
  //   },
  //   {
  //     Header: 'Address',
  //     accessor: 'address',
  //   },
  //   {
  //     Header: 'State',
  //     accessor: 'customerState',
  //   },
  //   {
  //     Header: 'City',
  //     accessor: 'customerCity',
  //   },
  //   {
  //     Header: 'Country',
  //     accessor: 'country',
  //   },
  //   {
  //     Header: 'Zip',
  //     accessor: 'zip',
  //   },
  //   {
  //     Header: 'PAN',
  //     accessor: 'pan',
  //   },
  // ];

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
        )
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
        )
      },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const columns1 = row.original
 
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
            href={`/dashboard/manager/viewvendor?gstin=${encodeURIComponent(columns1.gstin)}`}>
               <DropdownMenuItem>View</DropdownMenuItem>
            </Link>
           
            <Link href={`/dashboard/manager/editvendor?gstin=${encodeURIComponent(columns1.gstin)}` }><DropdownMenuItem >  Edit </DropdownMenuItem></Link>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
  
];



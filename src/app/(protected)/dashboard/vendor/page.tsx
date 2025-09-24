"use client";
import { DataTable } from "@/components/Table/data-table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader, Clock, AlertCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
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

interface VendorRFP {
  id: string;
  rfpNumber: string;
  title: string;
  description: string;
  deliveryLocation: string;
  deliveryDate: string;
  quotationCutoffDate: string;
  status: string;
  createdBy: string;
  lineItemsCount: number;
  estimatedBudget: string;
  daysRemaining: number;
  canSubmitQuotation: boolean;
  invitationStatus: string;
}

const VendorRFPDashboard = () => {
  const [rfps, setRfps] = useState<VendorRFP[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendorRFPs();
  }, []);

  const fetchVendorRFPs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/vendor/rfp?status=SENT_TO_VENDORS');
      const data = await response.json();
      setRfps(data.rfps || []);
    } catch (error) {
      console.error("Error fetching RFPs:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnDef<VendorRFP>[] = [
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
      cell: ({ getValue, row }) => {
        const status = getValue() as string;
        const daysRemaining = row.original.daysRemaining;
        
        return (
          <div className="flex flex-col gap-1">
            <Badge variant="outline" className="bg-purple-100 text-purple-800">
              {status.replace(/_/g, ' ')}
            </Badge>
            {daysRemaining > 0 ? (
              <span className={`text-xs flex items-center gap-1 ${daysRemaining <= 3 ? 'text-red-600' : 'text-green-600'}`}>
                <Clock className="w-3 h-3" />
                {daysRemaining} days left
              </span>
            ) : (
              <span className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Expired
              </span>
            )}
          </div>
        );
      }
    },
    {
      header: "Delivery Location",
      accessorKey: "deliveryLocation",
      cell: ({ getValue }) => (
        <div className="max-w-xs truncate" title={getValue() as string}>
          {getValue() as string}
        </div>
      )
    },
    {
      header: "Line Items",
      accessorKey: "lineItemsCount",
      cell: ({ getValue }) => (
        <span className="text-center">{getValue() as number}</span>
      )
    },
    {
      header: "Budget",
      accessorKey: "estimatedBudget",
      cell: ({ getValue }) => {
        const budget = getValue() as string;
        return budget !== 'N/A' ? `₹${parseFloat(budget).toLocaleString()}` : 'Not specified';
      }
    },
    {
      header: "Cutoff Date",
      accessorKey: "quotationCutoffDate",
      cell: ({ getValue }) => (
        <span className="text-sm">{new Date(getValue() as string).toLocaleDateString()}</span>
      )
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const rfp = row.original;
        
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

              {/* View RFP Details */}
              <Link href={`/dashboard/vendor/rfp/view/${rfp.id}`}>
                <DropdownMenuItem>View RFP Details</DropdownMenuItem>
              </Link>

              {/* Submit/Edit Quotation */}
              {rfp.canSubmitQuotation ? (
                <Link href={`/dashboard/vendor/rfp/quotation/${rfp.id}`}>
                  <DropdownMenuItem>Submit Quotation</DropdownMenuItem>
                </Link>
              ) : (
                <DropdownMenuItem disabled>
                  Quotation Period Ended
                </DropdownMenuItem>
              )}

              {/* View My Quotations */}
              <Link href={`/dashboard/vendor/rfp/my-quotations/${rfp.id}`}>
                <DropdownMenuItem>My Quotations</DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available RFPs - Quotation Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col w-full">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader className="animate-spin" />
              <span className="ml-2">Loading RFPs...</span>
            </div>
          ) : rfps.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No RFPs available for quotation at this time.</p>
            </div>
          ) : (
            <DataTable columns={columns} data={rfps} />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorRFPDashboard;

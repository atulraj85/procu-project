"use client";
import { DataTable } from "@/components/Table/data-table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader } from "lucide-react";
import React, { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { columns1 } from "@/components/Table/columnsmanager";

// Updated interface to match new API response
interface TableRow {
  id: string;
  rfpNumber: string;          // Changed from rfpId
  title: string;             // Added title
  description: string;       // Added description
  deliveryLocation: string;
  deliveryDate: string;      // Changed from deliveryByDate
  quotationCutoffDate: string; // Added cutoff date
  status: string;            // Changed from rfpStatus
  createdAt: string;         // Added created date
  createdBy: string;         // Added creator
  lineItemsCount: number;    // Count of line items
  estimatedBudget: string;   // Added budget
}

const Dashboard = () => {
  const [status, setStatus] = useState<"DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "COMPLETED">("DRAFT");
  const [content, setContent] = useState<TableRow[]>([]);
  const [title, setTitle] = useState("DRAFT RFPs");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Updated API endpoint - use the summary endpoint with user filter
      const response = await fetch(`/api/rfp?sortBy=createdAt&order=desc`);
      const data = await response.json();

      // Handle both direct array and nested data structure
      const rfpData = data.data || data;

      const formattedData = rfpData.map((item: any) => ({
        id: item.id,
        rfpNumber: item.rfpNumber,
        title: item.title,
        description: item.description,
        deliveryLocation: item.deliveryLocation,
        deliveryDate: new Date(item.deliveryDate).toLocaleDateString(),
        quotationCutoffDate: new Date(item.quotationCutoffDate).toLocaleDateString(),
        status: item.status,
        createdAt: new Date(item.createdAt).toLocaleDateString(),
        createdBy: item.createdBy,
        lineItemsCount: item.lineItems?.length || 0,
        estimatedBudget: item.estimatedBudget || 'N/A',
        quotations: item.quotations || [],
        totalQuotations: item.totalQuotations || 0,
      }));

      // Updated status filtering to match new enum values
      const filteredData = formattedData.filter((item: { status: string }) => {
        switch (status) {
          case "DRAFT":
            return item.status === "DRAFT";
          case "PENDING_APPROVAL":
            return item.status === "PENDING_APPROVAL";
          case "APPROVED":
            return ["APPROVED", "SENT_TO_VENDORS", "QUOTATION_RECEIVED"].includes(item.status);
          case "COMPLETED":
            return ["COMPLETED", "DELIVERED"].includes(item.status);
          default:
            return false;
        }
      });

      setContent(filteredData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    setData();
  }, [status]);

  const setData = () => {
    fetchData();

    switch (status) {
      case "DRAFT":
        setTitle("DRAFT RFPs");
        break;
      case "PENDING_APPROVAL":
        setTitle("PENDING APPROVAL RFPs");
        break;
      case "APPROVED":
        setTitle("APPROVED RFPs");
        break;
      case "COMPLETED":
        setTitle("COMPLETED RFPs");
        break;
    }
  };

  const columns: ColumnDef<TableRow>[] = columns1 as ColumnDef<TableRow>[];

  return (
    <Card>
      <CardHeader>
        <CardTitle>RFP Dashboard - Procurement Lead</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col w-full">
          <div className="flex py-5 gap-4">
            <div
              onClick={() => setStatus("DRAFT")}
              className={`px-3 py-2 border-2 rounded-lg hover:bg-blue-400 hover:text-white cursor-pointer ${
                status === "DRAFT" && "bg-blue-800 text-white"
              }`}
            >
              Draft RFPs
            </div>
            <div
              onClick={() => setStatus("PENDING_APPROVAL")}
              className={`px-3 py-2 border-2 rounded-lg hover:bg-yellow-400 hover:text-white cursor-pointer ${
                status === "PENDING_APPROVAL" && "bg-yellow-600 text-white"
              }`}
            >
              Pending Approval
            </div>
            <div
              onClick={() => setStatus("APPROVED")}
              className={`px-3 py-2 border-2 rounded-lg hover:bg-blue-400 hover:text-white cursor-pointer ${
                status === "APPROVED" && "bg-blue-800 text-white"
              }`}
            >
              Approved RFPs
            </div>
            <div
              onClick={() => setStatus("COMPLETED")}
              className={`px-3 py-2 border-2 rounded-lg hover:bg-green-600 hover:text-white cursor-pointer ${
                status === "COMPLETED" && "bg-green-700 text-white"
              }`}
            >
              Completed RFPs
            </div>
          </div>
          <hr />

          <div className="w-full">
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <Loader className="animate-spin" />
                <span className="ml-2">Loading RFPs...</span>
              </div>
            ) : (
              <DataTable columns={columns} data={content} />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Dashboard;

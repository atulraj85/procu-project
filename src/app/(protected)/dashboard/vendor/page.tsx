"use client";
import { DataTable } from "@/components/Table/data-table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader } from "lucide-react";
import React, { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { columns3 } from "@/components/Table/columns";

interface TableRow {
  rfpId: string;
  requirementType: string;
  dateOfOrdering: string;
  deliveryLocation: string;
  deliveryByDate: string;
  lastDateToRespond: string;
  rfpStatus: string;
}

const Dashboard = () => {
  const [status, setStatus] = useState<"OPEN" | "COMPLETED" | "DRAFT">("DRAFT");
  const [content, setContent] = useState<TableRow[]>([]);
  const [title, setTitle] = useState("OPEN RFPs");
  const [loading, setLoading] = useState(true);

  const headers = [
    { key: "rfpId", header: "RFP ID" },
    { key: "requirementType", header: "Requirement Type" },
    { key: "dateOfOrdering", header: "Date of Ordering" },
    { key: "deliveryLocation", header: "Delivery Location" },
    { key: "deliveryByDate", header: "Delivery By Date" },
    { key: "lastDateToRespond", header: "Last Date to Respond" },
    { key: "rfpStatus", header: "RFP Status" },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/rfp?sortBy=createdAt&order=desc");
      const data = await response.json();

      const formattedData = data.map((item: any) => ({
        rfpId: item.rfpId,
        requirementType: item.requirementType,
        dateOfOrdering: new Date(item.dateOfOrdering).toLocaleDateString(),
        deliveryLocation: item.deliveryLocation,
        deliveryByDate: new Date(item.deliveryByDate).toLocaleDateString(),
        lastDateToRespond: new Date(
          item.lastDateToRespond
        ).toLocaleDateString(),
        rfpStatus: item.rfpStatus,
        quotations: item.quotations,
      }));

      const filteredData = formattedData.filter(
        (item: { rfpStatus: string }) => {
          return (
            (status === "OPEN" &&
              (item.rfpStatus === "SUBMITTED" ||
                item.rfpStatus === "PO_CREATED")) ||
            (status === "COMPLETED" && item.rfpStatus === "PAYMENT_DONE") ||
            (status === "DRAFT" && item.rfpStatus === "DRAFT")
          );
        }
      );

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
      case "OPEN":
        setTitle("OPEN RFPs");
        break;
      case "COMPLETED":
        setTitle("COMPLETED RFPs");
        break;
      case "DRAFT":
        setTitle("DRAFT RFPs");
        break;
    }
  };

  // Define columns with correct type
  const columns: ColumnDef<TableRow>[] = columns3 as ColumnDef<TableRow>[];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard</CardTitle>
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
              onClick={() => setStatus("OPEN")}
              className={`px-3 py-2 border-2 rounded-lg hover:bg-blue-400 hover:text-white cursor-pointer ${
                status === "OPEN" && "bg-blue-800 text-white"
              }`}
            >
              Open RFPs
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
              <Loader />
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

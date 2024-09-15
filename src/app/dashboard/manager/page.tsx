"use client";
import { columns1 } from "@/components/Table/columns";
import { DataTable } from "@/components/Table/data-table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader } from "lucide-react";
import React, { useEffect, useState } from "react";

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
  const [loading, setLoading] = useState(true); // Loading state

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
    setLoading(true); // Set loading to true before fetching data
    try {
      const response = await fetch("/api/rfp?orderBy=created_at,desc");
      const data = await response.json();
      // console.log("Fetched data:", data); // Log fetched data

      // Convert data to fit TableRow format and filter based on status
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
      }));

      // Filter based on `status` state
     const filteredData = formattedData.filter(
       (item: { rfpStatus: string }) => {
         return (
           (status === "OPEN" && (item.rfpStatus === "SUBMITTED" || item.rfpStatus === "PO_CREATED" )) ||
           (status === "COMPLETED" && item.rfpStatus === "PAYMENT_DONE") ||
           (status === "DRAFT" && item.rfpStatus === "DRAFT")
         );
       }
     );

      setContent(filteredData);
      setLoading(false); // Set loading to false after data is set
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false); // Ensure loading is false if there's an error
    }
  };

  useEffect(() => {
    setData();
  }, [status]);

  const setData = () => {
    fetchData(); // Fetch data when the component mounts or when `status` changes

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
              // <Table title={title} titles={headers} content={content} />
              <DataTable columns={columns1} data={content} />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Dashboard;

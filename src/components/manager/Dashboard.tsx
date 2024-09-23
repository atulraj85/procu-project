"use client";
import React, { useEffect, useState } from "react";
import Loader from "../shared/Loader";
import { DataTable } from "../Table/data-table";
import { columns1 } from "../Table/columns";
import { ColumnDef } from "@tanstack/react-table";

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
  const [status, setStatus] = useState<'OPEN' | 'COMPLETED' | 'DRAFT'>('DRAFT');
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
      const response = await fetch('/api/rfp');
      const data = await response.json();

      const formattedData = data.map((item: any) => ({
        rfpId: item.rfpId,
        requirementType: item.requirementType,
        dateOfOrdering: new Date(item.dateOfOrdering).toLocaleDateString(),
        deliveryLocation: item.deliveryLocation,
        deliveryByDate: new Date(item.deliveryByDate).toLocaleDateString(),
        lastDateToRespond: new Date(item.lastDateToRespond).toLocaleDateString(),
        rfpStatus: item.rfpStatus,
      }));

      const filteredData = formattedData.filter((item: { rfpStatus: string; }) =>
        status === 'OPEN' ? item.rfpStatus === 'PENDING' :
        status === 'COMPLETED' ? item.rfpStatus === 'COMPLETED' :
        status === 'DRAFT' ? item.rfpStatus === 'DRAFT' :
        false
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
      case 'OPEN':
        setTitle("OPEN RFPs");
        break;
      case 'COMPLETED':
        setTitle("COMPLETED RFPs");
        break;
      case 'DRAFT':
        setTitle("DRAFT RFPs");
        break;
    }
  };

  // Explicitly type columns1 as ColumnDef<TableRow>[]
  const typedColumns: ColumnDef<TableRow>[] = columns1 as ColumnDef<TableRow>[];

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-evenly w-full">
        <div className="flex justify-between w-full  ">
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
      </div>
      <div className="flex py-5 gap-4">
        <div
          onClick={() => setStatus('DRAFT')}
          className={`px-3 py-2 border-2 rounded-lg hover:bg-blue-400 hover:text-white cursor-pointer ${
            status === 'DRAFT' && "bg-blue-800 text-white"
          }`}
        >
          Draft RFPs
        </div>
        <div
          onClick={() => setStatus('OPEN')}
          className={`px-3 py-2 border-2 rounded-lg hover:bg-blue-400 hover:text-white cursor-pointer ${
            status === 'OPEN' && "bg-blue-800 text-white"
          }`}
        >
          Open RFPs
        </div>
        <div
          onClick={() => setStatus('COMPLETED')}
          className={`px-3 py-2 border-2 rounded-lg hover:bg-green-600 hover:text-white cursor-pointer ${
            status === 'COMPLETED' && "bg-green-700 text-white"
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
          <DataTable columns={typedColumns} data={content} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
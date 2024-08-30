"use client";
import InfoCard from "@/components/shared/InfoCard";
import Table from "@/components/shared/Table";
import { InfoItem, TableColumn, TableData } from "@/types/index";
import React, { useEffect, useState } from "react";
import { grn_received, open_po, po_dues } from "@/lib/tableHeaders";
import {
  po_dues_Data,
  grn_received_Data,
  open_po_Data,
} from "@/lib/tableContent";
import Link from "next/link";

// Updated types for the header state
interface HeaderData {
  value: string;
  titles: TableColumn[];
  content: any;
}

const Dashboard = () => {
  const headerData: HeaderData[] = [
    {
      value: "grn_received",
      titles: grn_received,
      content: grn_received_Data,
    },
    {
      value: "open_po",
      titles: open_po,
      content: open_po_Data,
    },
    {
      value: "po_dues",
      titles: po_dues,
      content: po_dues_Data,
    },
  ];

  const infoLinks: InfoItem[] = [
    {
      value: "po_dues",
      total: 5,
      label: "PO Due",
      price: 453000, // Rs. 4.53 Lac = 453,000
      route: `/vendor/dashboard/po-due`,
    },
    {
      value: "open_po",
      total: 20,
      label: "Open PO",
      price: 2542000, // Rs. 25.42 Lac = 2,542,000
      route: `/vendor/dashboard/open-po`,
    },
    {
      value: "grn_received",
      total: 8,
      label: "GRN Received",
      price: 1827000, // Rs. 18.27 Lac = 1,827,000
      route: `/vendor/dashboard/grn-received`,
    },
    {
      value: "invoice-received",
      total: 12,
      label: "Invoice Received",
      price: 1027000, // Rs. 10.27 Lac = 1,027,000
      route: `/vendor/dashboard/invoice-received`,
    },
    {
      value: "payments-due",
      total: 8,
      label: "Payments Due",
      price: 453000, // Rs. 4.53 Lac = 453,000
      route: `/vendor/dashboard/payments-due`,
    },
  ];

  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<TableData[]>([]); // Adjust type based on actual content
  const [header, setHeader] = useState<TableColumn[]>([]);

  const handleData = () => {
    const heading = headerData.find((data) => data.value === title);
    if (heading) {
      setHeader(heading.titles);
      setContent(heading.content);
    }
    console.log(heading);
  };

  useEffect(() => {
    handleData();
  }, [title]);

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-evenly w-full">
        {infoLinks.map((info) => (
          <div key={info.value} onClick={() => setTitle(info.value)}>
            <InfoCard info={info} />
          </div>
        ))}
      </div>

      <hr />

      <div className="w-full">
        <Table title={title.toUpperCase()} titles={header} content={content} />
      </div>
    </div>
  );
};

export default Dashboard;

"use client";
import InfoCard from "@/components/shared/InfoCard";
import { InfoItem, TableColumn } from "@/types/index";
import React, { useEffect, useState } from "react";
import { grn_received, open_po, po_dues } from "@/lib/tableHeaders";
import {
  po_dues_Data,
  grn_received_Data,
  open_po_Data,
} from "@/lib/tableContent";
import { columns2 } from "@/components/Table/columns";
import { DataTable } from "@/components/Table/data-table";
import Loader from "@/components/shared/Loader";

interface RfpData {
  rfpId: string;
  requirementType: string;
  dateOfOrdering: string;
  deliveryLocation: string;
  deliveryByDate: string;
  lastDateToRespond: string;
  rfpStatus: string;
}

const Dashboard = () => {
  const headerData: { value: string; titles: TableColumn[]; content: any }[] = [
    { value: "grn_received", titles: grn_received, content: grn_received_Data },
    { value: "open_po", titles: open_po, content: open_po_Data },
    { value: "po_dues", titles: po_dues, content: po_dues_Data },
  ];

  const infoLinks: InfoItem[] = [
    {
      value: "po_dues",
      total: 5,
      label: "PO Due",
      price: 453000,
      route: `/vendor/dashboard/po-due`,
    },
    {
      value: "open_po",
      total: 20,
      label: "Open PO",
      price: 2542000,
      route: `/vendor/dashboard/open-po`,
    },
    {
      value: "complete",
      total: 8,
      label: "Complete PO",
      price: 453000,
      route: `/vendor/dashboard/payments-due`,
    },
  ];

  const [rfps, setRfps] = useState<RfpData[]>([]);
  const [content, setContent] = useState<RfpData[]>([]);
  const [header, setHeader] = useState<TableColumn[]>([]);
  const [title, setTitle] = useState("PO Due");
  const [loading, setLoading] = useState(true);

  const rfpHeaders: TableColumn[] = [
    { key: "rfpId", header: "RFP ID" },
    { key: "requirementType", header: "Requirement Type" },
    { key: "dateOfOrdering", header: "Date of Ordering" },
    { key: "deliveryLocation", header: "Delivery Location" },
    { key: "deliveryByDate", header: "Delivery By Date" },
    { key: "lastDateToRespond", header: "Last Date to Respond" },
    { key: "rfpStatus", header: "RFP Status" },
  ];

  const fetchRfpData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/rfp");
      const data = await response.json();

      const formattedData: RfpData[] = data.map((item: any) => ({
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

      setRfps(formattedData);
      setContent(
        formattedData.filter((item) => item.rfpStatus === "SUBMITTED")
      ); // Set initial content to pending RFPs
      setHeader(rfpHeaders);
    } catch (error) {
      console.error("Error fetching RFP data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInfoCardClick = (value: string) => {
    setTitle(value.toUpperCase());
    if (value === "po_dues") {
      setContent(rfps.filter((item) => item.rfpStatus === "SUBMITTED")); // Show pending RFPs
    } else if (value === "complete") {
      setContent(rfps.filter((item) => item.rfpStatus === "PAYMENT_DONE")); // Show complete RFPs
    } else if (value === "open_po") {
      setContent(
        rfps.filter(
          (item) =>
            item.rfpStatus !== "SUBMITTED" &&
            item.rfpStatus !== "PAYMENT_DONE" 
        )
      ); // Show open RFPs
    } else {
      const heading = headerData.find((data) => data.value === value);
      if (heading) {
        setHeader(heading.titles);
        setContent(heading.content);
      }
    }
  };

  useEffect(() => {
    fetchRfpData();
  }, []);

  useEffect(() => {
    handleInfoCardClick("po_dues"); // Set default view to "PO Due"
  }, [rfps]); // Ensure this runs after RFPs are fetched

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-evenly w-full">
        {infoLinks.map((info) => (
          <div key={info.value} onClick={() => handleInfoCardClick(info.value)}>
            <InfoCard info={info} />
          </div>
        ))}
      </div>

      <hr />

      <div className="w-full">
        {loading ? <Loader /> : <DataTable columns={columns2} data={content} />}
      </div>
    </div>
  );
};

export default Dashboard;

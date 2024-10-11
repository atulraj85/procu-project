"use client";

import React, { useEffect, useState } from "react";
import InfoCard from "@/components/shared/InfoCard";
import { InfoItem, TableColumn } from "@/types/index";
import { grn_received, open_po, po_dues } from "@/lib/tableHeaders";
import {
  po_dues_Data,
  grn_received_Data,
  open_po_Data,
} from "@/lib/tableContent";
import { columns2, Po1 } from "@/components/Table/columns"; // Remove TableRow from this import
import { DataTable } from "@/components/Table/data-table";
import Loader from "@/components/shared/Loader";
import { ColumnDef } from "@tanstack/react-table";

// Define TableRow interface here
interface TableRow {
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

interface RfpData {
  rfpId: string;
  requirementType: string;
  dateOfOrdering: string;
  deliveryLocation: string;
  deliveryByDate: string;
  lastDateToRespond: string;
  rfpStatus: string;
}

// Define a union type for all possible data types
type DataType = RfpData | TableRow;

const Dashboard: React.FC = () => {
  const headerData: { value: string; titles: TableColumn[]; content: any }[] = [
    { value: "grn_received", titles: grn_received, content: grn_received_Data },
    { value: "open_po", titles: open_po, content: open_po_Data },
    { value: "po_dues", titles: po_dues, content: po_dues_Data },
  ];

  const [infoLinks, setInfoLinks] = useState<InfoItem[]>([
    {
      value: "po_dues",
      total: 0,
      label: "PO Due",
      price: 453000,
      route: `/vendor/dashboard/po-due`,
    },
    {
      value: "open_po",
      total: 0,
      label: "Open PO",
      price: 2542000,
      route: `/vendor/dashboard/open-po`,
    },
    {
      value: "complete",
      total: 0,
      label: "Complete PO",
      price: 453000,
      route: `/vendor/dashboard/payments-due`,
    },
  ]);

  const [rfps, setRfps] = useState<RfpData[]>([]);
  const [po, setPo] = useState<TableRow[]>([]);
  const [content, setContent] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTable, setActiveTable] = useState<string>("po_dues");

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
        lastDateToRespond: new Date(item.lastDateToRespond).toLocaleDateString(),
        rfpStatus: item.rfpStatus,
      }));

      setRfps(formattedData);
      
      const poDueCount = formattedData.filter(item => item.rfpStatus === "SUBMITTED").length;
      const completePOCount = formattedData.filter(item => item.rfpStatus === "PAYMENT_DONE").length;

      setInfoLinks(prevLinks => 
        prevLinks.map(link => 
          link.value === "po_dues" ? { ...link, total: poDueCount } :
          link.value === "complete" ? { ...link, total: completePOCount } :
          link
        )
      );

      setContent(formattedData.filter((item) => item.rfpStatus === "SUBMITTED"));
    } catch (error) {
      console.error("Error fetching RFP data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPo = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/po");
      const data: TableRow[] = await response.json();
      setPo(data);
      
      setInfoLinks(prevLinks => 
        prevLinks.map(link => 
          link.value === "open_po" ? { ...link, total: data.length } : link
        )
      );
    } catch (error) {
      console.error("Error fetching PO data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInfoCardClick = (value: string) => {
    setActiveTable(value);

    if (value === "po_dues") {
      setContent(rfps.filter((item) => item.rfpStatus === "SUBMITTED"));
    } else if (value === "complete") {
      setContent(rfps.filter((item) => item.rfpStatus === "PAYMENT_DONE"));
    } else if (value === "open_po") {
      setContent(po);
    } else {
      const heading = headerData.find((data) => data.value === value);
      if (heading) {
        setContent(heading.content);
      }
    }
  };

  useEffect(() => {
    fetchRfpData();
    fetchPo();
  }, []);

  useEffect(() => {
    handleInfoCardClick("po_dues");
  }, [rfps]);

  const getColumns = (): ColumnDef<DataType>[] => {
    if (activeTable === "open_po") {
      return Po1 as ColumnDef<DataType>[];
    } else {
      return columns2 as ColumnDef<DataType>[];
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-evenly w-full mb-4">
        {infoLinks.map((info) => (
          <div 
            key={info.value} 
            onClick={() => handleInfoCardClick(info.value)}
          >
            <div className={activeTable === info.value ? "bg-green-100 rounded-2xl" : ""}>
              <InfoCard info={info} />
            </div>
          </div>
        ))}
      </div>
  
      {loading ? (
        <Loader />
      ) : (
        <DataTable columns={getColumns()} data={content} />
      )}
  
      <hr />
    </div>
  );
};

export default Dashboard;
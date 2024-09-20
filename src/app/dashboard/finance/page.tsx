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
import { columns2, Po1 } from "@/components/Table/columns";
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
  const [po, setPo] = useState<any[]>([]);
  const [content, setContent] = useState<RfpData[]>([]);
  const [header, setHeader] = useState<TableColumn[]>([]);
  const [title, setTitle] = useState("PO Due");
  const [loading, setLoading] = useState(true);
  const [activeTable, setActiveTable] = useState<string>("po_dues");

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
      console.log("data", data);

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
      
      // Count PO due (SUBMITTED status)
      const poDueCount = formattedData.filter(item => item.rfpStatus === "SUBMITTED").length;
      
      // Count Complete PO (PAYMENT_DONE status)
      const completePOCount = formattedData.filter(item => item.rfpStatus === "PAYMENT_DONE").length;

      // Update the counts in infoLinks
      setInfoLinks(prevLinks => 
        prevLinks.map(link => 
          link.value === "po_dues" ? { ...link, total: poDueCount } :
          link.value === "complete" ? { ...link, total: completePOCount } :
          link
        )
      );

      setContent(formattedData.filter((item) => item.rfpStatus === "SUBMITTED"));
      setHeader(rfpHeaders);
    } catch (error) {
      console.error("Error fetching RFP data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchPo = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/po");
        const data = await response.json();
        setPo(data);
        
        // Update the "Open PO" count in infoLinks
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
    fetchPo();
  }, []);

  const handleInfoCardClick = (value: string) => {
    setTitle(value.toUpperCase());
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
        setHeader(heading.titles);
        setContent(heading.content);
      }
    }
  };

  useEffect(() => {
    fetchRfpData();
  }, []);

  useEffect(() => {
    handleInfoCardClick("po_dues");
  }, [rfps]);

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
  
      {activeTable === "open_po" ? (
        <DataTable columns={Po1} data={po} />
      ) : (
        <div className="w-full">
          {loading ? <Loader /> : <DataTable columns={columns2} data={content} />}
        </div>
      )}
  
      <hr />
    </div>
  );
};

export default Dashboard;
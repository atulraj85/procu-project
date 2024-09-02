// "use client";
// import InfoCard from "@/components/shared/InfoCard";
// import Table from "@/components/shared/Table";
// import { InfoItem, TableColumn, TableData } from "@/types/types";
// import React, { useEffect, useState } from "react";
// import { grn_received, open_po, po_dues } from "@/lib/tableHeaders";
// import {
//   po_dues_Data,
//   grn_received_Data,
//   open_po_Data,
// } from "@/lib/tableContent";

// // Updated types for the header state
// interface HeaderData {
//   value: string;
//   titles: TableColumn[];
//   content: any;
// }

// const page = () => {
//   const headerData: HeaderData[] = [
//     {
//       value: "grn_received",
//       titles: grn_received,
//       content: grn_received_Data,
//     },
//     {
//       value: "open_po",
//       titles: open_po,
//       content: open_po_Data,
//     },
//     {
//       value: "po_dues",
//       titles: po_dues,
//       content: po_dues_Data,
//     },
//   ];

//   const infoLinks: InfoItem[] = [
//     {
//       value: "po_dues",
//       total: 5,
//       label: "PO Due",
//       price: 453000, // Rs. 4.53 Lac = 453,000
//       route: `/vendor/dashboard/po-due`,
//     },
//     {
//       value: "open_po",
//       total: 20,
//       label: "Open PO",
//       price: 2542000, // Rs. 25.42 Lac = 2,542,000
//       route: `/vendor/dashboard/open-po`,
//     },
//     {
//       value: "grn_received",
//       total: 8,
//       label: "GRN Received",
//       price: 1827000, // Rs. 18.27 Lac = 1,827,000
//       route: `/vendor/dashboard/grn-received`,
//     },
//     {
//       value: "invoice-received",
//       total: 12,
//       label: "Invoice Received",
//       price: 1027000, // Rs. 10.27 Lac = 1,027,000
//       route: `/vendor/dashboard/invoice-received`,
//     },
//     {
//       value: "payments-due",
//       total: 8,
//       label: "Payments Due",
//       price: 453000, // Rs. 4.53 Lac = 453,000
//       route: `/vendor/dashboard/payments-due`,
//     },
//   ];

//   // Updated state type
//   const [title, setTitle] = useState<string>("");
//   const [content, setContent] = useState<TableData[]>(po_dues_Data); // Adjust type based on actual content
//   const [header, setHeader] = useState<TableColumn[]>(po_dues);

//   const handleData = () => {
//     const heading = headerData.find((data) => data.value === title);
//     if (heading) {
//       setHeader(heading.titles);
//       setContent(heading.content);
//     }
//     console.log(heading);
//   };

//   useEffect(() => {
//     handleData();
//   }, [title]);

//   const handleTitle = (val: string) => {
//     setTitle(val);
//   };

//   return (
//     <div className="flex flex-col w-full">
//       <div className="flex items-center justify-evenly w-full">
//         {infoLinks.map((info) => (
//           <div key={info.value} onClick={() => handleTitle(info.value)}>
//             <InfoCard info={info} />
//           </div>
//         ))}
//       </div>
//       <div className="w-full">
//         <Table title={title.toUpperCase()} titles={header} content={content} />
//       </div>
//     </div>
//   );
// };

// export default page;

"use client";
import Table from "@/components/shared/Table";
import Link from "next/link";
import React, { useEffect, useState } from "react";
interface TableRow {
  rfpNumber: string;
  vendor: string;
  registration: string;
  purchaseOrder: string;
  grn: string;
  invoice: string;
  payment: string;
}

const page = () => {
  const complete_rfc = [
    {
      rfpNumber: "RFP-PO-2024-25-207",
      vendor: "Vendor G",
      registration: "PO/129/462",
      purchaseOrder: "Anil Mehta",
      grn: "GRN/129/462",
      invoice: "INV/129/462",
      payment: "06ABC00013",
    },
    {
      rfpNumber: "RFP-PO-2024-25-208",
      vendor: "Vendor H",
      registration: "PO/130/463",
      purchaseOrder: "Sunil Gupta",
      grn: "GRN/130/463",
      invoice: "INV/130/463",
      payment: "06ABC00014",
    },
    {
      rfpNumber: "RFP-PO-2024-25-209",
      vendor: "Vendor I",
      registration: "PO/131/464",
      purchaseOrder: "Arun Jain",
      grn: "GRN/131/464",
      invoice: "INV/131/464",
      payment: "06ABC00015",
    },
    {
      rfpNumber: "RFP-PO-2024-25-210",
      vendor: "Vendor J",
      registration: "PO/132/465",
      purchaseOrder: "Naveen Bhatt",
      grn: "GRN/132/465",
      invoice: "INV/132/465",
      payment: "06ABC00016",
    },
    {
      rfpNumber: "RFP-PO-2024-25-211",
      vendor: "Vendor K",
      registration: "PO/133/466",
      purchaseOrder: "Vikas Rao",
      grn: "GRN/133/466",
      invoice: "INV/133/466",
      payment: "06ABC00017",
    },
    {
      rfpNumber: "RFP-PO-2024-25-212",
      vendor: "Vendor L",
      registration: "PO/134/467",
      purchaseOrder: "Prakash Singh",
      grn: "GRN/134/467",
      invoice: "INV/134/467",
      payment: "06ABC00018",
    },
    {
      rfpNumber: "RFP-PO-2024-25-213",
      vendor: "Vendor M",
      registration: "PO/135/468",
      purchaseOrder: "Deepak Kumar",
      grn: "GRN/135/468",
      invoice: "INV/135/468",
      payment: "06ABC00019",
    },
    {
      rfpNumber: "RFP-PO-2024-25-214",
      vendor: "Vendor N",
      registration: "PO/136/469",
      purchaseOrder: "Ajay Sharma",
      grn: "GRN/136/469",
      invoice: "INV/136/469",
      payment: "06ABC00020",
    },
    {
      rfpNumber: "RFP-PO-2024-25-215",
      vendor: "Vendor O",
      registration: "PO/137/470",
      purchaseOrder: "Kiran Desai",
      grn: "GRN/137/470",
      invoice: "INV/137/470",
      payment: "06ABC00021",
    },
    {
      rfpNumber: "RFP-PO-2024-25-216",
      vendor: "Vendor P",
      registration: "PO/138/471",
      purchaseOrder: "Sanjay Mehta",
      grn: "GRN/138/471",
      invoice: "INV/138/471",
      payment: "06ABC00022",
    },
    {
      rfpNumber: "RFP-PO-2024-25-217",
      vendor: "Vendor Q",
      registration: "PO/139/472",
      purchaseOrder: "Rohit Kumar",
      grn: "GRN/139/472",
      invoice: "INV/139/472",
      payment: "06ABC00023",
    },
    {
      rfpNumber: "RFP-PO-2024-25-218",
      vendor: "Vendor R",
      registration: "PO/140/473",
      purchaseOrder: "Vinay Singh",
      grn: "GRN/140/473",
      invoice: "INV/140/473",
      payment: "06ABC00024",
    },
    {
      rfpNumber: "RFP-PO-2024-25-219",
      vendor: "Vendor S",
      registration: "PO/141/474",
      purchaseOrder: "Nitin Gupta",
      grn: "GRN/141/474",
      invoice: "INV/141/474",
      payment: "06ABC00025",
    },
    {
      rfpNumber: "RFP-PO-2024-25-220",
      vendor: "Vendor T",
      registration: "PO/142/475",
      purchaseOrder: "Sumit Yadav",
      grn: "GRN/142/475",
      invoice: "INV/142/475",
      payment: "06ABC00026",
    },
  ];

  const incomplete_rfc = [
    {
      rfpNumber: "RFP-PO-2024-25-201",
      vendor: "Rakesh Kumar",
      registration: "PO/123/456",
      purchaseOrder: "Ashwani Singh",
      grn: "GRN/123/456",
      invoice: "INV/123/456",
      payment: "06ABC00007",
    },
    {
      rfpNumber: "RFP-PO-2024-25-202",
      vendor: "Vendor B",
      registration: "PO/124/457",
      purchaseOrder: "Ravi Sharma",
      grn: "GRN/124/457",
      invoice: "INV/124/457",
      payment: "06ABC00008",
    },
    {
      rfpNumber: "RFP-PO-2024-25-203",
      vendor: "Vendor C",
      registration: "PO/125/458",
      purchaseOrder: "Manish Tiwari",
      grn: "GRN/125/458",
      invoice: "INV/125/458",
      payment: "06ABC00009",
    },
    {
      rfpNumber: "RFP-PO-2024-25-204",
      vendor: "Vendor D",
      registration: "PO/126/459",
      purchaseOrder: "Suresh Verma",
      grn: "GRN/126/459",
      invoice: "INV/126/459",
      payment: "06ABC00010",
    },
    {
      rfpNumber: "RFP-PO-2024-25-205",
      vendor: "Vendor E",
      registration: "PO/127/460",
      purchaseOrder: "Rajesh Kumar",
      grn: "GRN/127/460",
      invoice: "INV/127/460",
      payment: "06ABC00011",
    },
    {
      rfpNumber: "RFP-PO-2024-25-206",
      vendor: "Vendor F",
      registration: "PO/128/461",
      purchaseOrder: "Amit Singh",
      grn: "GRN/128/461",
      invoice: "INV/128/461",
      payment: "06ABC00012",
    },
  ];

  const headers = [
    { key: "rfpNumber", header: "RFP Number" },
    { key: "vendor", header: "Vendor" },
    { key: "registration", header: "Registration" },
    { key: "purchaseOrder", header: "Purchase Order" },
    { key: "grn", header: "GRN" },
    { key: "invoice", header: "Invoice" },
    { key: "payment", header: "Payment" },
  ];

  const [complete, setComplete] = useState(true);
  const [content, setContent] = useState<TableRow[]>([]); // Adjust type based on actual content
  const [title, setTitle] = useState("OPEN RPFs");
  const setData = () => {
    if (complete) {
      setContent(complete_rfc);
      setTitle("OPEN RPFs");
    } else {
      setContent(incomplete_rfc);
      setTitle("Compeleted RPFs");
    }
  };

  useEffect(() => {
    setData();
  }, [complete]);

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-evenly w-full">
        <div className="flex justify-between w-full px-10 py-5">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          {/* <Link
            href={``}
            className="bg-blue-700 hover:bg-blue-400  py-2 px-4 text-white"
          >
            Create RPF
          </Link> */}
        </div>
      </div>
      <div className="flex px-10 py-5 gap-4">
        <div
          onClick={() => setComplete(true)}
          className={`px-3 py-2 border-2 rounded-lg hover:bg-blue-400 hover:text-white cursor-pointer ${
            complete === true && "bg-blue-800 text-white"
          }`}
        >
          Open RFPs
        </div>
        <div
          onClick={() => setComplete(false)}
          className={`px-3 py-2 border-2 rounded-lg hover:bg-blue-400 hover:text-white cursor-pointer ${
            complete === false && "bg-blue-800 text-white"
          }`}
        >
          Completed RFPs
        </div>
      </div>
      <hr />

      <div className="w-full">
        <Table title={title} titles={headers} content={content} />
      </div>
    </div>
  );
};

export default page;

import { TableColumn } from "@/types/index";

export const po_dues: TableColumn[] = [
  {
    header: "Date Requested",
    key: "dateRequested",
  },
  {
    header: "RFP Number",
    key: "rfpNumber",
  },
  {
    header: "Vendor Registration",
    key: "vendorRegistration",
  },
  {
    header: "Action",
    key: "actions",
  },
];

export const open_po: TableColumn[] = [
  {
    header: "PO Number",
    key: "poNumber",
  },
  {
    header: "RFP Number",
    key: "rfpNumber",
  },
  {
    header: "GRN Status",
    key: "grnStatus",
  },
  {
    header: "Invoice Number",
    key: "invoiceNumber",
  },
];

export const grn_received: TableColumn[] = [
  {
    header: "PO Number",
    key: "poNumber",
  },
  {
    header: "RFP Number",
    key: "rfpNumber",
  },
  {
    header: "GRN Status",
    key: "grnStatus",
  },
];

export interface SidebarItem {
  value: string;
  label: string;
  imgUrl: string;
  route: string;
}

export interface InfoItem {
  value: string;
  total: number;
  label: string;
  price: number;
  route: string;
}

export interface TableColumn {
  header: string;
  key: string;
}

export interface TableData {
  dateRequested: "13-07-2024";
  rfpNumber: "RFP-PO-2024-25-201";
  vendorRegistration: "Pending";
  actions: "Register vendor";
}

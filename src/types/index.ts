export interface ICreateUserResponse {
  response: {
    meta: Meta;
    data: CreateUserResponseData;
  };
}

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

export interface ILoginUserResponse {
  response: {
    meta: Meta;
    data: {
      userId: string;
      token: string;
      role: string; // Ensure this is a string
    };
  };
}

export interface IUserProfileResponse {
  response: {
    meta: Meta;
    data: IUserProfileResponseData;
  };
}

export interface IUsersListingResponse {
  response: {
    meta: Meta;
    data: IUserProfileResponseData[];
  };
}

export interface IUsersMetricResponse {
  response: {
    meta: Meta;
    data: {
      totalUsers: number;
      totalVerifiedUsers: number;
      totalChannels: number;
    };
  };
}

interface IUserProfileResponseData {
  id: number;
  email: string;
  name: string;
  role: string;
  created_at: Date;
  updated_at: Date;
}

interface LoginUserResponseData {
  role(arg0: string, role: any): unknown;
  userId: string;
  token: string;
}

interface CreateUserResponseData {
  id: number;
  email: string;
  company: string;
  name: string;
  password: string;
  randomize_channel: number;
  created_at: Date;
  updated_at: Date;
}

interface Meta {
  success: boolean;
  message: string;
}

export enum RFPStatus {
  DRAFT = "DRAFT", // RFP Created but not submitted
  SUBMITTED = "SUBMITTED", // Submitted to finance
  PO_CREATED = "PO_CREATED", // Purchase Order Created
  ADVANCE_PAID = "ADVANCE_PAID", // Advance Payment Made
  INVOICE_RECEIVED = "INVOICE_RECEIVED", // Invoice Received
  GRN_RECEIVED = "GRN_RECEIVED", // Goods Receipt Note Received
  PAYMENT_DONE = "PAYMENT_DONE", // (PO Complete)
}

export function serializePrismaModel<T>(model: T): T {
  return JSON.parse(
    JSON.stringify(model, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

export interface RequestBody {
  requirementType: string;
  dateOfOrdering: string;
  deliveryLocation: string;
  deliveryByDate: string;
  lastDateToRespond: string;
  userId: string;
  rfpStatus: RFPStatus;
  preferredVendorId: string;
  rfpProducts: { productId: string; quantity: number }[];
  approvers: { approverId: string }[];
  quotations: { vendorId: string; billAmount: number }[]; // New field for quotations
}

export interface VendorRequestBody {
  customerCode?: string;
  primaryName: string;
  companyName: string;
  contactDisplayName: string;
  email?: string;
  workPhone?: string;
  mobile?: string;
  website?: string;
  gstin?: string;
  msmeNo?: string;
  address?: string;
  customerState?: string;
  customerCity?: string;
  country?: string;
  zip?: string;
  remarks?: string;
  pan?: string;
  verifiedById?: string;
}

interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  // Add other fields as necessary
}

export interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  website: string;
  industry: string;
  status: string;
  logo: string;
  stamp: string;
  gst?: string | null;
  gstAddress?: string | null;
  foundedDate?: string | null;
  addresses: Address[];
  createdAt: string;
  updatedAt: string;
}

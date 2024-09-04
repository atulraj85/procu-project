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
    meta: Meta,
    data: {
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
  company:string;
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
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  GRN_NOT_RECEIVED = "GRN_NOT_RECEIVED",
  INVOICE_NOT_RECEIVED = "INVOICE_NOT_RECEIVED",
  PAYMENT_NOT_DONE = "PAYMENT_NOT_DONE",
  COMPLETED = "COMPLETED",
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
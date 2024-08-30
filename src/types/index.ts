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

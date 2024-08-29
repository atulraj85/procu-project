export interface ICreateUserResponse {
  response: {
    meta: Meta;
    data: CreateUserResponseData;
  };
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

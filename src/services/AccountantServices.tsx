
import api from "./api";

export interface AccountantLoginPayload {
  email: string;
  password: string;
  loginDevice: {
    deviceId: string;
    deviceName: string;
    publicIP: string;
    location: string;
  };
  role: number;
}

// ACCOUNTANT LOGIN API
export const accountantLogin = async (
  payload: AccountantLoginPayload
) => {
  const response = await api.post(
    "/Account/login",
    payload
  );

  return response.data;
};

// ATTENDANCE FILTER PARAMETERS
export interface GetAttendanceParams {
  Search?: string;
  FromDate?: string;
  ToDate?: string;
  DepartmentId?: string;
  Status?: number;
  SortBy?: string;
  IsAscending?: boolean;
  PageNumber?: number;
  PageSize?: number;
}

// GET ATTENDANCE LIST API
export const getAttendance = async (
  params: GetAttendanceParams = {}
) => {
  const response = await api.get(
    "/Attendance/get-attendance",
    { params }
  );

  return response.data;
};

// GET ATTENDANCE BY ID API
export const getAttendanceById = async (
  id: string
) => {
  const response = await api.get(
    `/Attendance/get-attendance-by-id/${encodeURIComponent(id)}`
  );

  return response.data;
};


// ADMIN ATTENDANCE PAGE API - ALSO ALLOWED FOR ACCOUNTANT
export interface GetAttendancePageParams {
  FromDate?: string;
  ToDate?: string;
  DepartmentId?: string;
  Search?: string;
  Status?: number;
  PageNumber?: number;
  PageSize?: number;
}

export const getAttendancePageData = async (
  params: GetAttendancePageParams = {}
) => {
  const response = await api.get(
    "/Attendance/ACTUAL-ADMIN-PAGE-ENDPOINT",
    { params }
  );

  return response.data;
};
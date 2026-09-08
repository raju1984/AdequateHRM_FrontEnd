import axios from "axios";

const BASE_URL =
  "http://jupiterapi.adequateshop.com/api";

// =====================================================
// AUTH HEADERS
// =====================================================

const getAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: "*/*",
});

// =====================================================
// GET TOKEN
// =====================================================

const getToken = (): string => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error(
      "Authentication token is missing. Please login again."
    );
  }

  return token;
};

// =====================================================
// EMPLOYEE PROFILE
// =====================================================

export const getEmployeeProfile = async (
  id: string,
  token: string
) => {
  if (!token) {
    throw new Error(
      "Authentication token is missing. Please login again."
    );
  }

  const response = await axios.get(
    `${BASE_URL}/Profile/Get-Employee`,
    {
      params: {
        Id: id,
      },
      headers: getAuthHeaders(token),
    }
  );

  return response.data.data;
};

// =====================================================
// UPDATE EMPLOYEE PROFILE
// =====================================================

export const updateEmployeeProfile = async (
  data: any,
  token: string
) => {
  if (!token) {
    throw new Error(
      "Authentication token is missing. Please login again."
    );
  }

  return axios.put(
    `${BASE_URL}/Profile/Profile-Update`,
    data,
    {
      headers: {
        ...getAuthHeaders(token),
        "Content-Type": "application/json",
      },
    }
  );
};

// =====================================================
// HOLIDAY PAGE PARAMS
// =====================================================

export type HolidayPageParams = {
  Year?: number;
  HolidayType?: number;
  IsActive?: boolean;
  Search?: string;
  SortBy?: string;
  PageNumber?: number;
  PageSize?: number;
};

// =====================================================
// GET HOLIDAYS - PAGINATED
// =====================================================

export const getHolidays = async (
  token: string,
  params: HolidayPageParams = {}
) => {
  if (!token) {
    throw new Error(
      "Authentication token is missing. Please login again."
    );
  }

  const response = await axios.get(
    `${BASE_URL}/EmployeeHoliday/page-data`,
    {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "*/*",
      },
    }
  );

  return response;
};

// =====================================================
// GET HOLIDAY BY ID
// =====================================================

export const getHolidayById = async (
  holidayId: string,
  token: string
) => {
  if (!token) {
    throw new Error(
      "Authentication token is missing. Please login again."
    );
  }

  if (!holidayId) {
    throw new Error("Holiday ID is missing.");
  }

  const response = await axios.get(
    `${BASE_URL}/EmployeeHoliday/${holidayId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "*/*",
      },
    }
  );

  return response;
};

// =====================================================
// OLD HOLIDAY API
// =====================================================

export const getOldHolidays = async (
  token: string
) => {
  if (!token) {
    throw new Error(
      "Authentication token is missing. Please login again."
    );
  }

  return axios.get(
    `${BASE_URL}/Holiday/get-holiday`,
    {
      headers: getAuthHeaders(token),
    }
  );
};

// =====================================================
// GET ALL EMPLOYEES
// =====================================================

export const getAllEmployees = async () => {
  const token = getToken();

  const response = await axios.get(
    `${BASE_URL}/Employee/GetAll-Employees`,
    {
      params: {
        PageNumber: 1,
        PageSize: 100,
      },
      headers: getAuthHeaders(token),
    }
  );

  return response.data;
};

// =====================================================
// ADD EMPLOYEE
// =====================================================

export const addEmployee = async (
  data: FormData
) => {
  const token = getToken();

  const response = await axios.post(
    `${BASE_URL}/Employee/Add-Employee`,
    data,
    {
      headers: getAuthHeaders(token),
    }
  );

  return response.data;
};

// =====================================================
// GET DESIGNATIONS
// =====================================================

export const getDesignations = async () => {
  const token = getToken();

  const response = await axios.post(
    `${BASE_URL}/Designation/Get-Designation`,
    {
      pageNumber: 1,
      pageSize: 100,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "*/*",
      },
    }
  );

  return response.data;
};

// =====================================================
// ATTENDANCE PAGE PARAMS
// =====================================================

export type AttendancePageParams = {
  FromDate?: string;
  ToDate?: string;

  /*
   * Backend attendance status enum.
   *
   * Example:
   * 1 = Present
   * 2 = Absent
   *
   * If your backend uses different enum values,
   * change them in AttendancePage.tsx.
   */
  Status?: number;

  SortBy?: string;

  PageNumber?: number;
  PageSize?: number;
};

// =====================================================
// GET EMPLOYEE ATTENDANCE - PAGINATED
//
// GET:
// /api/EmployeeAttendance/page-data
// =====================================================

export const getEmployeeAttendance = async (
  params: AttendancePageParams = {}
) => {
  const token = getToken();

  const response = await axios.get(
    `${BASE_URL}/EmployeeAttendance/page-data`,
    {
      params,
      headers: getAuthHeaders(token),
    }
  );

  return response.data;
};

// =====================================================
// GET EMPLOYEE ATTENDANCE BY ID
//
// GET:
// /api/EmployeeAttendance/{attendanceId}
// =====================================================

export const getEmployeeAttendanceById = async (
  attendanceId: string
) => {
  const token = getToken();

  if (!attendanceId) {
    throw new Error(
      "Attendance ID is missing."
    );
  }

  const response = await axios.get(
    `${BASE_URL}/EmployeeAttendance/${attendanceId}`,
    {
      headers: getAuthHeaders(token),
    }
  );

  return response.data;
};

// =====================================================
// ATTENDANCE - LOGOUT / PUNCH OUT
//
// POST:
// /api/Attendance/logout
// =====================================================

export const logoutAttendance = async () => {
  const token = getToken();

  const response = await axios.post(
    `${BASE_URL}/Attendance/logout`,
    null,
    {
      headers: {
        ...getAuthHeaders(token),
        Accept: "*/*",
      },
    }
  );

  return response.data;
};

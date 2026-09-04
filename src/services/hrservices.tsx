import axios from "axios";

const BASE_URL = "http://jupiterapi.adequateshop.com/api";

/* =====================================================
   COMMON TOKEN
===================================================== */

const getToken = () => {
  return localStorage.getItem("token");
};

const getAuthHeaders = (token?: string | null) => {
  const authToken = token || getToken();

  return {
    Authorization: `Bearer ${authToken}`,
  };
};

/* =====================================================
   EMPLOYEE PROFILE
===================================================== */

export const getEmployeeProfile = async (
  id: string,
  token: string
) => {
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

export const updateEmployeeProfile = async (
  data: any,
  token: string
) => {
  const response = await axios.put(
    `${BASE_URL}/Profile/Profile-Update`,
    data,
    {
      headers: {
        ...getAuthHeaders(token),
        Accept: "*/*",
      },
    }
  );

  return response.data;
};

/* =====================================================
   HOLIDAYS
===================================================== */

export interface GetHolidaysParams {
  Search?: string;
  HolidayType?: number;
  PageNumber?: number;
  PageSize?: number;
  SortBy?: string;
}

export interface AddHolidayPayload {
  title: string;
  holidayDate: string;
  holidayType: number;
  description: string;
  status: boolean;
}

export interface UpdateHolidayPayload {
  id: string;
  title: string;
  description: string;
  holidayDate: string;
  holidayType: number;
  isActive: boolean;
}

export const getHolidays = async (
  params?: GetHolidaysParams
) => {
  const token = getToken();

  const response = await axios.get(
    `${BASE_URL}/Holiday/get-holiday`,
    {
      params: {
        Search: params?.Search || undefined,
        HolidayType: params?.HolidayType,
        PageNumber: params?.PageNumber ?? 1,
        PageSize: params?.PageSize ?? 10,
        SortBy: params?.SortBy || undefined,
      },
      headers: getAuthHeaders(token),
    }
  );

  return response.data;
};

export const getHolidayById = async (
  id: string
) => {
  const token = getToken();

  const response = await axios.get(
    `${BASE_URL}/Holiday/get-holiday-by-id`,
    {
      params: { id },
      headers: getAuthHeaders(token),
    }
  );

  return response.data;
};

export const addHoliday = async (
  data: AddHolidayPayload
) => {
  const token = getToken();

  const response = await axios.post(
    `${BASE_URL}/Holiday/Add_Holiday`,
    data,
    {
      headers: {
        ...getAuthHeaders(token),
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

export const updateHoliday = async (
  data: UpdateHolidayPayload
) => {
  const token = getToken();

  const response = await axios.put(
    `${BASE_URL}/Holiday/Update-Holiday`,
    data,
    {
      headers: {
        ...getAuthHeaders(token),
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

export const deleteHoliday = async (
  id: string
) => {
  const token = getToken();

  const response = await axios.delete(
    `${BASE_URL}/Holiday/Delete-Holiday`,
    {
      headers: {
        ...getAuthHeaders(token),
        "Content-Type": "application/json",
      },
      data: { id },
    }
  );

  return response.data;
};


/* =====================================================
   LEAVE TYPE
   Base URL does NOT use /api according to Swagger
===================================================== */

const LEAVE_TYPE_BASE_URL = "http://jupiterapi.adequateshop.com";

export interface GetAllLeaveTypePayload {
  search?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
}

export interface AddLeaveTypePayload {
  leaveName: string;
  leaveDays: number;
}

export interface UpdateLeaveTypePayload {
  id: string;
  leaveName: string;
  leaveDays: number;
  isActive: boolean;
}

export const addLeaveType = async (
  data: AddLeaveTypePayload
) => {
  const token = getToken();

  const response = await axios.post(
    `${LEAVE_TYPE_BASE_URL}/add-leave-type`,
    data,
    {
      headers: {
        ...getAuthHeaders(token),
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

export const getLeaveTypeById = async (
  id: string
) => {
  const token = getToken();

  const response = await axios.get(
    `${LEAVE_TYPE_BASE_URL}/get-leave-type/${id}`,
    {
      headers: {
        ...getAuthHeaders(token),
        Accept: "*/*",
      },
    }
  );

  return response.data;
};

export const updateLeaveType = async (
  data: UpdateLeaveTypePayload
) => {
  const token = getToken();

  const response = await axios.put(
    `${LEAVE_TYPE_BASE_URL}/update-leave-type`,
    data,
    {
      headers: {
        ...getAuthHeaders(token),
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

export const getAllLeaveTypes = async (
  data?: GetAllLeaveTypePayload
) => {
  const token = getToken();

  const payload = {
    search: data?.search ?? "",
    pageNumber: data?.pageNumber ?? 1,
    pageSize: data?.pageSize ?? 10,
    sortBy: data?.sortBy ?? "",
  };

  // This backend endpoint is GET, but Swagger/backend validation
  // also expects JSON content. Send the same values as both query
  // params and JSON body so ASP.NET model binding can satisfy either
  // binding style used by the endpoint.
  const response = await axios.request({
    method: "GET",
    url: `${LEAVE_TYPE_BASE_URL}/get-all-leave-type`,
    params: payload,
    data: payload,
    headers: {
      ...getAuthHeaders(token),
      Accept: "*/*",
      "Content-Type": "application/json",
    },
  });

  return response.data;
};

export const deleteLeaveType = async (
  id: string
) => {
  const token = getToken();

  const response = await axios.delete(
    `${LEAVE_TYPE_BASE_URL}/delete-leave-type`,
    {
      headers: {
        ...getAuthHeaders(token),
        "Content-Type": "application/json",
      },
      data: {
        id,
      },
    }
  );

  return response.data;
};

/* =====================================================
   EMPLOYEE - GET
   GET /Employee/page-data
===================================================== */

export interface GetEmployeesParams {
  Search?: string;
  DesignationId?: string;
  UserStatus?: number;
  FromDate?: string;
  ToDate?: string;
  PageNumber?: number;
  PageSize?: number;
  SortBy?: string;
}

export const getAllEmployees = async (
  params?: GetEmployeesParams
) => {
  const token = getToken();

  const response = await axios.get(
    `${BASE_URL}/Employee/page-data`,
    {
      params: {
        Search: params?.Search || undefined,
        DesignationId:
          params?.DesignationId || undefined,
        UserStatus: params?.UserStatus,
        FromDate: params?.FromDate || undefined,
        ToDate: params?.ToDate || undefined,
        PageNumber: params?.PageNumber ?? 1,
        PageSize: params?.PageSize ?? 100,
        SortBy: params?.SortBy || undefined,
      },
      headers: getAuthHeaders(token),
    }
  );

  return response.data;
};

/* =====================================================
   DEPARTMENT - GET
   GET /Department/Get-Department
===================================================== */

export interface GetDepartmentsParams {
  Search?: string;
  UserStatus?: number;
  PerpageEntry?: number;
  PageNumber?: number;
  PageSize?: number;
  SortBy?: string;
}

export const getDepartments = async (
  params?: GetDepartmentsParams
) => {
  const token = getToken();

  const response = await axios.get(
    `${BASE_URL}/Department/Get-Department`,
    {
      params: {
        Search: params?.Search || undefined,
        UserStatus: params?.UserStatus,
        PerpageEntry: params?.PerpageEntry,
        PageNumber: params?.PageNumber ?? 1,
        PageSize: params?.PageSize ?? 100,
        SortBy: params?.SortBy || undefined,
      },
      headers: getAuthHeaders(token),
    }
  );

  return response.data;
};

/* =====================================================
   DEPARTMENT - ADD
===================================================== */

export interface AddDepartmentPayload {
  departmentName: string;
  isActive: boolean;
}

export const addDepartment = async (
  data: AddDepartmentPayload
) => {
  const token = getToken();

  const response = await axios.post(
    `${BASE_URL}/Department/Add-department`,
    data,
    {
      headers: {
        ...getAuthHeaders(token),
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

/* =====================================================
   DEPARTMENT - UPDATE
===================================================== */

export interface UpdateDepartmentPayload {
  id: string;
  departmentName: string;
  isActive: boolean;
}

export const updateDepartment = async (
  data: UpdateDepartmentPayload
) => {
  const token = getToken();

  const response = await axios.put(
    `${BASE_URL}/Department/Update-Department`,
    data,
    {
      headers: {
        ...getAuthHeaders(token),
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

/* =====================================================
   DEPARTMENT - DELETE
===================================================== */

export const deleteDepartment = async (
  id: string
) => {
  const token = getToken();

  const response = await axios.delete(
    `${BASE_URL}/Department/Delete-Department`,
    {
      headers: {
        ...getAuthHeaders(token),
        "Content-Type": "application/json",
      },
      data: {
        id,
      },
    }
  );

  return response.data;
};

/* =====================================================
   DESIGNATION - GET
   GET /Designation/Get-Designation
===================================================== */

export interface GetDesignationsParams {
  Search?: string;
  DepartmentId?: string;
  UserStatus?: number;
  PageNumber?: number;
  PageSize?: number;
  SortBy?: string;
}

export const getDesignations = async (
  params?: GetDesignationsParams
) => {
  const token = getToken();

  const response = await axios.get(
    `${BASE_URL}/Designation/Get-Designation`,
    {
      params: {
        Search: params?.Search || undefined,
        DepartmentId:
          params?.DepartmentId || undefined,
        UserStatus: params?.UserStatus,
        PageNumber: params?.PageNumber ?? 1,
        PageSize: params?.PageSize ?? 100,
        SortBy: params?.SortBy || undefined,
      },
      headers: getAuthHeaders(token),
    }
  );

  return response.data;
};

/* =====================================================
   DESIGNATION - ADD
===================================================== */

export interface AddDesignationPayload {
  designationName: string;
  departmentId: string;
  isActive: boolean;
}

export const addDesignation = async (
  data: AddDesignationPayload
) => {
  const token = getToken();

  const response = await axios.post(
    `${BASE_URL}/Designation/Add-designation`,
    data,
    {
      headers: {
        ...getAuthHeaders(token),
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

/* =====================================================
   DESIGNATION - UPDATE
===================================================== */

export interface UpdateDesignationPayload {
  id: string;
  designationName: string;
  departmentId: string;
  isActive: boolean;
}

export const updateDesignation = async (
  data: UpdateDesignationPayload
) => {
  const token = getToken();

  const response = await axios.put(
    `${BASE_URL}/Designation/Update-Designation`,
    data,
    {
      headers: {
        ...getAuthHeaders(token),
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

/* ==================================================
   DESIGNATION - DELETE
=====================================================*/

export const deleteDesignation = async (
  id: string
) => {
  const token = getToken();

  const response = await axios.delete(
    `${BASE_URL}/Designation/Delete-Designation`,
    {
      headers: {
        ...getAuthHeaders(token),
        "Content-Type": "application/json",
      },
      data: {
        id,
      },
    }
  );

  return response.data;
};

/* =====================================================
   EMPLOYEE - ADD
   POST /Employee
===================================================== */

export const addEmployee = async (
  data: FormData
) => {
  const token = getToken();

  const response = await axios.post(
    `${BASE_URL}/Employee`,
    data,
    {
      headers: {
        ...getAuthHeaders(token),
      },
    }
  );

  return response.data;
};

/* =====================================================
   EMPLOYEE - UPDATE
===================================================== */

export const updateEmployee = async (
  employeeId: string,
  data: FormData
) => {
  const token = getToken();

  const response = await axios.put(
    `${BASE_URL}/Employee/${employeeId}`,
    data,
    {
      headers: {
        ...getAuthHeaders(token),
        Accept: "*/*",
      },
    }
  );

  return response.data;
};

/* =====================================================
   EMPLOYEE - DELETE

   DELETE /Employee/{employeeId}

   employeeId = UUID path parameter
===================================================== */

export const deleteEmployee = async (
  employeeId: string
) => {
  const token = getToken();

  const response = await axios.delete(
    `${BASE_URL}/Employee/${employeeId}`,
    {
      headers: {
        ...getAuthHeaders(token),
        Accept: "*/*",
      },
    }
  );

  return response.data;
};

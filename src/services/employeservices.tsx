import axios from "axios";

const BASE_URL =
  "http://jupiterapi.adequateshop.com/api";

// AUTH HEADERS

const getAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: "*/*",
});

// GET TOKEN

const getToken = (): string => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error(
      "Authentication token is missing. Please login again."
    );
  }

  return token;
};

// EMPLOYEE PROFILE


export const getEmployeeProfile = async (
  token: string
) => {
  if (!token) {
    throw new Error(
      "Authentication token is missing. Please login again."
    );
  }

  const response = await axios.get(
    `${BASE_URL}/Profile/Get-Profile`,
    {
      headers: getAuthHeaders(token),
    }
  );

  console.log(
    "PROFILE GET API RESPONSE:",
    response.data
  );



  const responseData = response.data;

  if (responseData?.data?.profile) {
    return responseData.data.profile;
  }

  if (responseData?.data?.Profile) {
    return responseData.data.Profile;
  }

  if (responseData?.data?.user) {
    return responseData.data.user;
  }

  if (responseData?.data?.User) {
    return responseData.data.User;
  }

  if (responseData?.data !== undefined) {
    return responseData.data;
  }

  return responseData;
};

// UPDATE EMPLOYEE PROFILE

export interface UpdateEmployeeProfileData {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
  state?: string;
  city?: string;
  postalCode?: string;

  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;

  profilePicture?: File | null;
}


export const updateEmployeeProfile = async (
  data: UpdateEmployeeProfileData,
  token: string
) => {
  if (!token) {
    throw new Error(
      "Authentication token is missing. Please login again."
    );
  }

  const formData = new FormData();

  formData.append(
    "Id",
    data.id || ""
  );

  formData.append(
    "FirstName",
    data.firstName || ""
  );

  formData.append(
    "LastName",
    data.lastName || ""
  );

  formData.append(
    "Email",
    data.email || ""
  );

  formData.append(
    "Phone",
    data.phone || ""
  );

  formData.append(
    "Address",
    data.address || ""
  );

  formData.append(
    "Country",
    data.country || ""
  );

  formData.append(
    "State",
    data.state || ""
  );

  formData.append(
    "City",
    data.city || ""
  );

  formData.append(
    "PostalCode",
    data.postalCode || ""
  );

  formData.append(
    "CurrentPassword",
    data.currentPassword || ""
  );

  formData.append(
    "NewPassword",
    data.newPassword || ""
  );

  formData.append(
    "ConfirmPassword",
    data.confirmPassword || ""
  );

 
  if (
    data.profilePicture &&
    data.profilePicture instanceof File
  ) {
    formData.append(
      "ProfilePicture",
      data.profilePicture
    );
  } else {
    formData.append(
      "ProfilePicture",
      ""
    );
  }

  const response = await axios.put(
    `${BASE_URL}/Profile/Update-Profile`,
    formData,
    {
      headers: {
        ...getAuthHeaders(token),

        
      },
    }
  );

  console.log(
    "PROFILE UPDATE API RESPONSE:",
    response.data
  );

  return response.data;
};

// HOLIDAY PAGE PARAMS

export type HolidayPageParams = {
  Year?: number;
  HolidayType?: number;
  IsActive?: boolean;
  Search?: string;
  SortBy?: string;
  PageNumber?: number;
  PageSize?: number;
};

// GET HOLIDAYS

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
      headers: getAuthHeaders(token),
    }
  );

  return response;
};

// GET HOLIDAY BY ID

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
    throw new Error(
      "Holiday ID is missing."
    );
  }

  const response = await axios.get(
    `${BASE_URL}/EmployeeHoliday/${holidayId}`,
    {
      headers: getAuthHeaders(token),
    }
  );

  return response;
};

// OLD HOLIDAY API

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

// GET ALL EMPLOYEES

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

// ADD EMPLOYEE

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

// GET DESIGNATIONS

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

// ATTENDANCE PAGE PARAMS

export type AttendancePageParams = {
  FromDate?: string;
  ToDate?: string;
  Status?: number;
  SortBy?: string;
  PageNumber?: number;
  PageSize?: number;
};



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

  console.log(
    "ATTENDANCE API RESPONSE:",
    response.data
  );

  return response.data;
};

// GET EMPLOYEE ATTENDANCE BY ID

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

// ATTENDANCE LOGOUT / PUNCH OUT

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


// LEAVE TYPES

export const getLeaveTypes = async (
  token: string
) => {
  if (!token) {
    throw new Error(
      "Authentication token is missing. Please login again."
    );
  }

  const response = await axios.get(
    `${BASE_URL}/EmployeeLeave/leave-types`,
    {
      headers: getAuthHeaders(token),
    }
  );

  return response.data;
};

// MY LEAVES

export type MyLeavesParams = {
  FromDate?: string;
  ToDate?: string;
  LeaveTypeId?: string;
  ApprovedById?: string;
  Status?: number;
  SortBy?: string;
  PageNumber?: number;
  PageSize?: number;
};

export const getMyLeaves = async (
  token: string,
  params: MyLeavesParams = {}
) => {
  if (!token) {
    throw new Error(
      "Authentication token is missing. Please login again."
    );
  }

  const response = await axios.get(
    `${BASE_URL}/EmployeeLeave/my-leaves`,
    {
      params,
      headers: getAuthHeaders(token),
    }
  );

  return response.data;
};

// GET LEAVE BY ID

export const getLeaveById = async (
  leaveId: string,
  token: string
) => {
  if (!token) {
    throw new Error(
      "Authentication token is missing. Please login again."
    );
  }

  if (!leaveId) {
    throw new Error(
      "Leave ID is missing."
    );
  }

  const response = await axios.get(
    `${BASE_URL}/EmployeeLeave/${leaveId}`,
    {
      headers: getAuthHeaders(token),
    }
  );

  return response.data;
};

// LEAVE PAYLOAD

export interface LeavePayload {
  UserId?: string;
  LeaveTypeMasterId: string;
  FromDate: string;
  ToDate: string;
  AvailType: number;
  Reason: string;
  Attachment?: File | null;
}

// BUILD LEAVE FORM DATA

const buildLeaveFormData = (
  payload: LeavePayload
): FormData => {
  const formData = new FormData();

  if (payload.UserId) {
    formData.append(
      "UserId",
      payload.UserId
    );
  }

  formData.append(
    "LeaveTypeMasterId",
    payload.LeaveTypeMasterId
  );

  formData.append(
    "FromDate",
    payload.FromDate
  );

  formData.append(
    "ToDate",
    payload.ToDate
  );

  formData.append(
    "AvailType",
    String(payload.AvailType)
  );

  formData.append(
    "Reason",
    payload.Reason
  );

  if (payload.Attachment) {
    formData.append(
      "Attachment",
      payload.Attachment
    );
  }

  return formData;
};

// ADD LEAVE

export const addLeave = async (
  payload: LeavePayload,
  token: string
) => {
  if (!token) {
    throw new Error(
      "Authentication token is missing. Please login again."
    );
  }

  const formData =
    buildLeaveFormData(payload);

  const response = await axios.post(
    `${BASE_URL}/EmployeeLeave/add-leave`,
    formData,
    {
      headers: {
        ...getAuthHeaders(token),


      },
    }
  );

  return response.data;
};

// UPDATE LEAVE

export const updateLeave = async (
  leaveId: string,
  payload: LeavePayload,
  token: string
) => {
  if (!token) {
    throw new Error(
      "Authentication token is missing. Please login again."
    );
  }

  if (!leaveId) {
    throw new Error(
      "Leave ID is missing."
    );
  }

  const formData =
    buildLeaveFormData(payload);

  const response = await axios.put(
    `${BASE_URL}/EmployeeLeave/${leaveId}`,
    formData,
    {
      headers: {
        ...getAuthHeaders(token),

      },
    }
  );

  return response.data;
};

// DELETE LEAVE

export const deleteLeave = async (
  leaveId: string,
  token: string
) => {
  if (!token) {
    throw new Error(
      "Authentication token is missing. Please login again."
    );
  }

  if (!leaveId) {
    throw new Error(
      "Leave ID is missing."
    );
  }

  const response = await axios.delete(
    `${BASE_URL}/EmployeeLeave/${leaveId}`,
    {
      headers: getAuthHeaders(token),
    }
  );

  return response.data;
};


// EMPLOYEE LEAVES

export type EmployeeLeavesParams = {
  FromDate?: string;
  ToDate?: string;
  LeaveTypeId?: string;
  ApprovedById?: string;
  Status?: number;
  SortBy?: string;
  PageNumber?: number;
  PageSize?: number;
};

export const getEmployeeLeaves = async (
  token: string,
  params: EmployeeLeavesParams = {}
) => {
  if (!token) {
    throw new Error(
      "Authentication token is missing. Please login again."
    );
  }

  const response = await axios.get(
    `${BASE_URL}/EmployeeLeave/employee-leaves`,
    {
      params,
      headers: getAuthHeaders(token),
    }
  );

  console.log(
    "EMPLOYEE LEAVES API RESPONSE:",
    response.data
  );

  return response.data;
};

// REVIEW LEAVE

export interface ReviewLeavePayload {
  status: number;
  remarks: string;
}

export const reviewLeave = async (
  leaveId: string,
  payload: ReviewLeavePayload,
  token: string
) => {
  if (!token) {
    throw new Error(
      "Authentication token is missing. Please login again."
    );
  }

  if (!leaveId) {
    throw new Error(
      "Leave ID is missing."
    );
  }

  const response = await axios.put(
    `${BASE_URL}/EmployeeLeave/${leaveId}/review`,
    {
      status: payload.status,
      remarks: payload.remarks,
    },
    {
      headers: {
        ...getAuthHeaders(token),
        "Content-Type": "application/json",
      },
    }
  );

  console.log(
    "REVIEW LEAVE API RESPONSE:",
    response.data
  );

  return response.data;
};

// EMPLOYEE DASHBOARD

export const getEmployeeDashboard = async () => {
  const token = getToken();

  console.log("Dashboard Token:", token);
  console.log("Dashboard User ID:", localStorage.getItem("userId"));

  const response = await axios.get(
    `${BASE_URL}/employee/dashboard`,
    {
      headers: {  
        Authorization: `Bearer ${token}`,
        Accept: "*/*",
      },
    }
  );

  console.log("EMPLOYEE DASHBOARD RESPONSE:", response.data);

  return response.data;
};
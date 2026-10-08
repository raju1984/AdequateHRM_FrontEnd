  import axios from "axios";

  const BASE_URL = "http://jupiterapi.adequateshop.com/api";

  /* =====================================================

    COMMON TOKEN

  ===================================================== */

  const getToken = (): string | null => {

    return localStorage.getItem("token");

  };

  const getAuthHeaders = (token?: string | null) => {

    const authToken = token || getToken();

    if (!authToken) {

      throw new Error(

        "Authentication token not found. Please login again."

      );

    }

    return {

      Authorization: `Bearer ${authToken}`,

    };

  };

  /* =====================================================

    UTC DATE HELPER

  ===================================================== */

  export const toUTCDateTime = (

    date: string,

    endOfDay = false

  ): string | undefined => {

    if (!date) {

      return undefined;

    }

    const utcDate = new Date(

      `${date}T${

        endOfDay ? "23:59:59.999" : "00:00:00.000"

      }Z`

    );

    if (Number.isNaN(utcDate.getTime())) {

      return undefined;

    }

    return utcDate.toISOString();

  };

  /* =====================================================

    ROLE

  ===================================================== */

  export interface GetRolesParams {

    Search?: string;

    IsActive?: boolean;

    SortBy?: string;

    FromDate?: string;

    ToDate?: string;

    PageNumber?: number;

    PageSize?: number;

  }

  export interface AddRolePayload {

    roleName: string;

    isActive: boolean;

  }

  export interface UpdateRolePayload {

    id: string | number;

    roleName: string;

    isActive: boolean;

  }

  export const getRoles = async (

    params?: GetRolesParams

  ) => {

    const response = await axios.get(

      `${BASE_URL}/Role/get-roles`,

      {

        params: {

          Search: params?.Search || undefined,

          IsActive:

            typeof params?.IsActive === "boolean"

              ? params.IsActive

              : undefined,

          SortBy: params?.SortBy || undefined,

          FromDate: params?.FromDate || undefined,

          ToDate: params?.ToDate || undefined,

          PageNumber: params?.PageNumber ?? 1,

          PageSize: params?.PageSize ?? 10,

        },

        headers: getAuthHeaders(),

      }

    );

    return response.data;

  };

  export const addRole = async (

    data: AddRolePayload

  ) => {

    const response = await axios.post(

      `${BASE_URL}/Role/add-role`,

      data,

      {

        headers: {

          ...getAuthHeaders(),

          "Content-Type": "application/json",

          Accept: "*/*",

        },

      }

    );

    return response.data;

  };

  export const updateRole = async (

    data: UpdateRolePayload

  ) => {

    const response = await axios.put(

      `${BASE_URL}/Role/update-role`,

      data,

      {

        headers: {

          ...getAuthHeaders(),

          "Content-Type": "application/json",

          Accept: "*/*",

        },

      }

    );

    return response.data;

  };

  export const deleteRole = async (

    id: string | number

  ) => {

    const response = await axios.delete(

      `${BASE_URL}/Role/delete-role`,

      {

        headers: {

          ...getAuthHeaders(),

          "Content-Type": "application/json",

          Accept: "*/*",

        },

        data: { id },

      }

    );

    return response.data;

  };

  /* =====================================================

    EMPLOYEE - GET

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

        headers: getAuthHeaders(),

      }

    );

    return response.data;

  };

  /* =====================================================
    PROFILE - GET / UPDATE
  ===================================================== */
  export interface ProfileData {
    Id?: string;
    FirstName?: string;
    LastName?: string;
    Email?: string;
    Phone?: string;
    Address?: string;
    Country?: string;
    State?: string;
    City?: string;
    PostalCode?: string;
    ProfilePicture?: string | null;
    ProfilePictureUrl?: string | null;
    [key: string]: unknown;
  }

  export interface ProfileApiResponse {
    statusCode?: number;
    message?: string;
    isSuccess?: boolean;
    data?: ProfileData | { profile?: ProfileData; user?: ProfileData } | null;
  }

  export const getProfile = async (token?: string | null): Promise<ProfileApiResponse> => {
    const response = await axios.get<ProfileApiResponse>(
      `${BASE_URL}/Profile/Get-Profile`,
      { headers: { ...getAuthHeaders(token), Accept: "application/json" } }
    );
    return response.data;
  };

  export interface UpdateProfilePayload {
    Id: string;
    FirstName: string;
    LastName: string;
    Email: string;
    Phone: string;
    Address: string;
    Country: string;
    State: string;
    City: string;
    PostalCode: string;
    CurrentPassword: string;
    NewPassword: string;
    ConfirmPassword: string;
    ProfilePicture?: File | null;
  }

  export const updateEmployeeProfile = async (
    data: UpdateProfilePayload,
    token?: string | null
  ): Promise<ProfileApiResponse> => {
    const formData = new FormData();
    const fields = [
      "Id", "FirstName", "LastName", "Email", "Phone", "Address",
      "Country", "State", "City", "PostalCode", "CurrentPassword",
      "NewPassword", "ConfirmPassword"
    ] as const;
    fields.forEach((field) => formData.append(field, data[field] ?? ""));
    if (data.ProfilePicture instanceof File) {
      formData.append("ProfilePicture", data.ProfilePicture);
    }
    const response = await axios.put<ProfileApiResponse>(
      `${BASE_URL}/Profile/Update-Profile`,
      formData,
      { headers: { ...getAuthHeaders(token), Accept: "application/json" } }
    );
    return response.data;
  };

  /* =====================================================

    HOLIDAYS

  ===================================================== */

export interface GetHolidaysParams {

  Search?: string;

  HolidayType?: number;

  FinancialYear?: string;

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

  const response = await axios.get(

    `${BASE_URL}/Holiday/get-holiday`,

    {

      params: {

        Search: params?.Search || undefined,

        HolidayType: params?.HolidayType,

        // ADDED: Financial Year

        FinancialYear: params?.FinancialYear || undefined,

        PageNumber: params?.PageNumber ?? 1,

        PageSize: params?.PageSize ?? 10,

        SortBy: params?.SortBy || undefined,

      },

      headers: getAuthHeaders(),

    }

  );

  return response.data;

};

  export const getHolidayById = async (

    id: string

  ) => {

    const response = await axios.get(

      `${BASE_URL}/Holiday/get-holiday-by-id`,

      {

        params: { id },

        headers: getAuthHeaders(),

      }

    );

    return response.data;

  };

  export const addHoliday = async (

    data: AddHolidayPayload

  ) => {

    const response = await axios.post(

      `${BASE_URL}/Holiday/Add_Holiday`,

      data,

      {

        headers: {

          ...getAuthHeaders(),

          "Content-Type": "application/json",

        },

      }

    );

    return response.data;

  };

  export const updateHoliday = async (

    data: UpdateHolidayPayload

  ) => {

    const response = await axios.put(

      `${BASE_URL}/Holiday/Update-Holiday`,

      data,

      {

        headers: {

          ...getAuthHeaders(),

          "Content-Type": "application/json",

        },

      }

    );

    return response.data;

  };

  export const deleteHoliday = async (

    id: string

  ) => {

    const response = await axios.delete(

      `${BASE_URL}/Holiday/Delete-Holiday`,

      {

        headers: {

          ...getAuthHeaders(),

          "Content-Type": "application/json",

        },

        data: { id },

      }

    );

    return response.data;

  };

  /* =====================================================

    LEAVE TYPE

  ===================================================== */

  const LEAVE_TYPE_BASE_URL =

    "http://jupiterapi.adequateshop.com";

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

    const response = await axios.post(

      `${LEAVE_TYPE_BASE_URL}/add-leave-type`,

      data,

      {

        headers: {

          ...getAuthHeaders(),

          "Content-Type": "application/json",

        },

      }

    );

    return response.data;

  };

  export const getLeaveTypeById = async (

    id: string

  ) => {

    const response = await axios.get(

      `${LEAVE_TYPE_BASE_URL}/get-leave-type/${id}`,

      {

        headers: {

          ...getAuthHeaders(),

          Accept: "*/*",

        },

      }

    );

    return response.data;

  };

  export const updateLeaveType = async (

    data: UpdateLeaveTypePayload

  ) => {

    const response = await axios.put(

      `${LEAVE_TYPE_BASE_URL}/update-leave-type`,

      data,

      {

        headers: {

          ...getAuthHeaders(),

          "Content-Type": "application/json",

        },

      }

    );

    return response.data;

  };

  export const getAllLeaveTypes = async (

    data?: GetAllLeaveTypePayload

  ) => {

    const response = await axios.get(

      `${LEAVE_TYPE_BASE_URL}/get-all-leave-type`,

      {

        params: {

          search: data?.search ?? "",

          pageNumber: data?.pageNumber ?? 1,

          pageSize: data?.pageSize ?? 100,

          sortBy: data?.sortBy ?? "",

        },

        headers: {

          ...getAuthHeaders(),

          Accept: "*/*",

        },

      }

    );

    return response.data;

  };

  export const deleteLeaveType = async (

    id: string

  ) => {

    const response = await axios.delete(

      `${LEAVE_TYPE_BASE_URL}/delete-leave-type`,

      {

        headers: {

          ...getAuthHeaders(),

          "Content-Type": "application/json",

        },

        data: { id },

      }

    );

    return response.data;

  };

  /* =====================================================

    EMPLOYEE LEAVE

  ===================================================== */

  const EMPLOYEE_LEAVE_BASE_URL =

    "http://jupiterapi.adequateshop.com";

  export interface GetAllLeavesParams {

    UserId?: string;

    LeaveTypeMasterId?: string;

    Status?: number;

    FromDate?: string;

    ToDate?: string;

    Search?: string;

    SortBy?: string;

    SortDirection?: string;

    PageNumber?: number;

    PageSize?: number;

    ReviewedByUserId?: string;

  }

  export const getAllLeaves = async (

    params?: GetAllLeavesParams

  ) => {

    const response = await axios.get(

      `${EMPLOYEE_LEAVE_BASE_URL}/get-all-leave`,

      {

        params: {

          UserId: params?.UserId || undefined,

          LeaveTypeMasterId:

            params?.LeaveTypeMasterId || undefined,

          Status:

            params?.Status !== undefined

              ? params.Status

              : undefined,

          FromDate: params?.FromDate || undefined,

          ToDate: params?.ToDate || undefined,

          Search: params?.Search || undefined,

          SortBy: params?.SortBy || undefined,

          SortDirection:

            params?.SortDirection || undefined,

          PageNumber: params?.PageNumber ?? 1,

          PageSize: params?.PageSize ?? 10,

          ReviewedByUserId:

            params?.ReviewedByUserId || undefined,

        },

        headers: {

          ...getAuthHeaders(),

          Accept: "application/json",

        },

      }

    );

    return response.data;

  };

  export const getLeaveById = async (

    id: string

  ) => {

    const response = await axios.get(

      `${EMPLOYEE_LEAVE_BASE_URL}/get-leave-by-id/${id}`,

      {

        headers: {

          ...getAuthHeaders(),

          Accept: "application/json",

        },

      }

    );

    return response.data;

  };

  export interface AddLeavePayload {

    UserId?: string;

    LeaveTypeMasterId: string;

    FromDate: string;

    ToDate: string;

    AvailType: number;

    Reason: string;

    Attachment?: File | null;

  }

  export const addLeave = async (

    data: AddLeavePayload

  ) => {

    const formData = new FormData();

    formData.append("UserId", data.UserId || "");

    formData.append(

      "LeaveTypeMasterId",

      data.LeaveTypeMasterId || ""

    );

    formData.append("FromDate", data.FromDate || "");

    formData.append("ToDate", data.ToDate || "");

    formData.append(

      "AvailType",

      String(data.AvailType)

    );

    formData.append("Reason", data.Reason || "");

    if (data.Attachment instanceof File) {

      formData.append(

        "Attachment",

        data.Attachment

      );

    }

    const response = await axios.post(

      `${EMPLOYEE_LEAVE_BASE_URL}/add-leave`,

      formData,

      {

        headers: {

          ...getAuthHeaders(),

          Accept: "*/*",

        },

      }

    );

    return response.data;

  };

  export interface UpdateLeavePayload {

    UserId?: string;

    LeaveTypeMasterId: string;

    FromDate: string;

    ToDate: string;

    AvailType: number;

    Reason: string;

    Attachment?: File | null;

  }

  export const updateLeave = async (

    leaveId: string,

    data: UpdateLeavePayload

  ) => {

    const formData = new FormData();

    formData.append("UserId", data.UserId || "");

    formData.append(

      "LeaveTypeMasterId",

      data.LeaveTypeMasterId || ""

    );

    formData.append("FromDate", data.FromDate || "");

    formData.append("ToDate", data.ToDate || "");

    formData.append(

      "AvailType",

      String(data.AvailType)

    );

    formData.append("Reason", data.Reason || "");

    if (data.Attachment instanceof File) {

      formData.append(

        "Attachment",

        data.Attachment

      );

    }

    const response = await axios.put(

      `${EMPLOYEE_LEAVE_BASE_URL}/update-leave/${leaveId}`,

      formData,

      {

        headers: {

          ...getAuthHeaders(),

          Accept: "*/*",

        },

      }

    );

    return response.data;

  };

  export interface UpdateLeaveStatusPayload {

    status: number;

    remarks: string;

  }

  export const updateLeaveStatus = async (

    leaveId: string,

    reviewedByUserId: string,

    data: UpdateLeaveStatusPayload

  ) => {

    const response = await axios.put(

      `${EMPLOYEE_LEAVE_BASE_URL}/update-leave-status/${leaveId}/${reviewedByUserId}`,

      data,

      {

        headers: {

          ...getAuthHeaders(),

          "Content-Type": "application/json",

          Accept: "*/*",

        },

      }

    );

    return response.data;

  };

  export const deleteLeave = async (

    leaveId: string

  ) => {

    const response = await axios.delete(

      `${EMPLOYEE_LEAVE_BASE_URL}/delete-leave/${leaveId}`,

      {

        headers: {

          ...getAuthHeaders(),

          Accept: "*/*",

        },

      }

    );

    return response.data;

  };

  /* =====================================================

    DEPARTMENT

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

        headers: getAuthHeaders(),

      }

    );

    return response.data;

  };

  export interface AddDepartmentPayload {

    departmentName: string;

    isActive: boolean;

  }

  export const addDepartment = async (

    data: AddDepartmentPayload

  ) => {

    const response = await axios.post(

      `${BASE_URL}/Department/Add-department`,

      data,

      {

        headers: {

          ...getAuthHeaders(),

          "Content-Type": "application/json",

        },

      }

    );

    return response.data;

  };

  export interface UpdateDepartmentPayload {

    id: string;

    departmentName: string;

    isActive: boolean;

  }

  export const updateDepartment = async (

    data: UpdateDepartmentPayload

  ) => {

    const response = await axios.put(

      `${BASE_URL}/Department/Update-Department`,

      data,

      {

        headers: {

          ...getAuthHeaders(),

          "Content-Type": "application/json",

        },

      }

    );

    return response.data;

  };

  export const deleteDepartment = async (

    id: string

  ) => {

    const response = await axios.delete(

      `${BASE_URL}/Department/Delete-Department`,

      {

        headers: {

          ...getAuthHeaders(),

          "Content-Type": "application/json",

        },

        data: { id },

      }

    );

    return response.data;

  };

  /* =====================================================

    DESIGNATION

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

        headers: getAuthHeaders(),

      }

    );

    return response.data;

  };

  export interface AddDesignationPayload {

    designationName: string;

    departmentId: string;

    isActive: boolean;

  }

  export const addDesignation = async (

    data: AddDesignationPayload

  ) => {

    const response = await axios.post(

      `${BASE_URL}/Designation/Add-designation`,

      data,

      {

        headers: {

          ...getAuthHeaders(),

          "Content-Type": "application/json",

        },

      }

    );

    return response.data;

  };

  export interface UpdateDesignationPayload {

    id: string;

    designationName: string;

    departmentId: string;

    isActive: boolean;

  }

  export const updateDesignation = async (

    data: UpdateDesignationPayload

  ) => {

    const response = await axios.put(

      `${BASE_URL}/Designation/Update-Designation`,

      data,

      {

        headers: {

          ...getAuthHeaders(),

          "Content-Type": "application/json",

        },

      }

    );

    return response.data;

  };

  export const deleteDesignation = async (

    id: string

  ) => {

    const response = await axios.delete(

      `${BASE_URL}/Designation/Delete-Designation`,

      {

        headers: {

          ...getAuthHeaders(),

          "Content-Type": "application/json",

        },

        data: { id },

      }

    );

    return response.data;

  };

  /* =====================================================

    EMPLOYEE - ADD

  ===================================================== */

  export const addEmployee = async (

    data: FormData

  ) => {

    const response = await axios.post(

      `${BASE_URL}/Employee`,

      data,

      {

        headers: {

          ...getAuthHeaders(),

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

    const response = await axios.put(

      `${BASE_URL}/Employee/${employeeId}`,

      data,

      {

        headers: {

          ...getAuthHeaders(),

          Accept: "*/*",

        },

      }

    );

    return response.data;

  };

  /* =====================================================

    EMPLOYEE - DELETE

  ===================================================== */

  export const deleteEmployee = async (

    employeeId: string

  ) => {

    const response = await axios.delete(

      `${BASE_URL}/Employee/${employeeId}`,

      {

        headers: {

          ...getAuthHeaders(),

          Accept: "*/*",

        },

      }

    );

    return response.data;

  };

  /* =====================================================

    LEAVE CHAT

  ===================================================== */

  export interface SendLeaveChatPayload {

    message: string;

  }

  export const getLeaveChatMessages = async (

    leaveId: string

  ) => {

    const response = await axios.get(

      `${BASE_URL}/LeaveChat/${leaveId}`,

      {

        headers: {

          ...getAuthHeaders(),

          Accept: "application/json",

        },

      }

    );

    return response.data;

  };

  export const sendLeaveChatMessage = async (

    leaveId: string,

    data: SendLeaveChatPayload

  ) => {

    const response = await axios.post(

      `${BASE_URL}/LeaveChat/${leaveId}/send`,

      data,

      {

        headers: {

          ...getAuthHeaders(),

          "Content-Type": "application/json",

          Accept: "*/*",

        },

      }

    );

    return response.data;

  };

  export const deleteLeaveChatMessage = async (

    messageId: string

  ) => {

    const response = await axios.delete(

      `${BASE_URL}/LeaveChat/message/${messageId}`,

      {

        headers: {

          ...getAuthHeaders(),

          Accept: "*/*",

        },

      }

    );

    return response.data;

  };

  /* =====================================================

    ATTENDANCE

  ===================================================== */

export const AttendanceStatus = {

  Present: 1,

  Absent: 2,

  Late: 3,

} as const;

  /* =====================================================

    ATTENDANCE DASHBOARD

  ===================================================== */

  export const getAttendanceDashboard =

    async () => {

      const response = await axios.get(

        `${BASE_URL}/Attendance/dashboard`,

        {

          headers: {

            ...getAuthHeaders(),

            Accept: "application/json",

          },

        }

      );

      return response.data;

    };

  /* =====================================================

    GET ATTENDANCE

  ===================================================== */

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

  export const getAttendance = async (

    params?: GetAttendanceParams

  ) => {

    const response = await axios.get(

      `${BASE_URL}/Attendance/get-attendance`,

      {

        params: {

          Search:

            params?.Search || undefined,

          FromDate:

            params?.FromDate || undefined,

          ToDate:

            params?.ToDate || undefined,

          DepartmentId:

            params?.DepartmentId || undefined,

          Status:

            params?.Status !== undefined

              ? params.Status

              : undefined,

          SortBy:

            params?.SortBy || undefined,

          IsAscending:

            params?.IsAscending !== undefined

              ? params.IsAscending

              : undefined,

          PageNumber:

            params?.PageNumber ?? 1,

          PageSize:

            params?.PageSize ?? 10,

        },

        headers: {

          ...getAuthHeaders(),

          Accept: "application/json",

        },

      }

    );

    return response.data;

  };

  /* =====================================================

    GET ATTENDANCE BY ID

  ===================================================== */

  export const getAttendanceById =

    async (id: string) => {

      const response = await axios.get(

        `${BASE_URL}/Attendance/get-attendance-by-id/${id}`,

        {

          headers: {

            ...getAuthHeaders(),

            Accept: "application/json",

          },

        }

      );

      return response.data;

    };

  /* =====================================================

    ATTENDANCE LOGOUT

  ===================================================== */

  export const attendanceLogout =

    async () => {

      const response = await axios.post(

        `${BASE_URL}/Attendance/logout`,

        {},

        {

          headers: {

            ...getAuthHeaders(),

            "Content-Type": "application/json",

            Accept: "*/*",

          },

        }

      );

      return response.data;

    };

    /* =====================================================

    HR DASHBOARD

  ===================================================== */

  export interface GetHRDashboardParams {

    AttendancePeriod?: string;

    DepartmentId?: string;

    RecentAttendanceCount?: number;

    LateEmployeeCount?: number;

  }

  export const getHRDashboard = async (

    params?: GetHRDashboardParams

  ) => {

    const response = await axios.get(

      `${BASE_URL}/HRDashboard/page-data`,

      {

        params: {

          AttendancePeriod:

            params?.AttendancePeriod || undefined,

          DepartmentId:

            params?.DepartmentId || undefined,

          RecentAttendanceCount:

            params?.RecentAttendanceCount,

          LateEmployeeCount:

            params?.LateEmployeeCount,

        },

        headers: {

          ...getAuthHeaders(),

          Accept: "application/json",

        },

      }

    );

    console.log(

      "HR DASHBOARD API RESPONSE:",

      response.data

    );

    return response.data;

  };

/* =====================================================

  USER

===================================================== */

export interface GetUsersParams {

  Search?: string;

  UserType?: number;

  UserStatus?: number;

  SortBy?: string;

  FromDate?: string;

  ToDate?: string;

  PageNumber?: number;

  PageSize?: number;

  RoleId?: string;

}

export interface UserEducationPayload {

  institutionName: string;

  location: string;

  startDate?: string;

  endDate?: string;

  degreeOrCourse: string;

  specialization: string;

  yearsAttended?: string;

}

export interface UserReferencePayload {

  name: string;

  title: string;

  company: string;

  phoneNumber: string;

}

export interface UserExperiencePayload {

  companyName: string;

  jobTitle: string;

  fromDate?: string;

  toDate?: string;

  isCurrentlyWorking: boolean;

  workPhone: string;

  startingPayRate: number;

  endingPayRate: number;

  address: string;

  city: string;

  state: string;

  postalCode: string;

  description: string;

}

export interface UserPermissionPayload {

  pageId: string;

  canRead: boolean;

  canWrite: boolean;

  canCreate: boolean;

  canDelete: boolean;

  canImport: boolean;

  canExport: boolean;

}

export interface AddUserPayload {

  firstName: string;

  lastName: string;

  userName: string;

  email: string;

  phoneNumber: string;

  password: string;

  confirmPassword: string;

  userType: number;

  roleId: string;

  address: string;

  city: string;

  state: string;

  postalCode: string;

  country: string;

  isLegallyEligibleToWork: boolean;

  isVeteran: boolean;

  isWillingForBackgroundCheck: boolean;

  designationId: string;

  availableStartDate?: string;

  desiredPay: number;

  isFullTimeDesired: boolean;

  isPartTimeDesired: boolean;

  isSeasonalOrTemporaryDesired: boolean;

  educations: UserEducationPayload[];

  references: UserReferencePayload[];

  experiences: UserExperiencePayload[];

  permissions: UserPermissionPayload[];

  [key: string]: any;

}

export interface UpdateUserPayload extends AddUserPayload {

  id: string;

  userStatus: number;

}

export interface UserApiModel {

  id?: string;

  firstName?: string;

  lastName?: string;

  userName?: string;

  email?: string;

  phoneNumber?: string;

  userType?: number;

  userStatus?: number;

  roleId?: string;

  roleName?: string;

  designationId?: string;

  designationName?: string;

  createdAt?: string;

  [key: string]: any;

}

export const getUsers = async (params?: GetUsersParams) => {

  const response = await axios.get(`${BASE_URL}/User/get-users`, {

    params: {

      Search: params?.Search || undefined,

      UserType: params?.UserType !== undefined ? params.UserType : undefined,

      UserStatus: params?.UserStatus !== undefined ? params.UserStatus : undefined,

      SortBy: params?.SortBy || undefined,

      FromDate: params?.FromDate || undefined,

      ToDate: params?.ToDate || undefined,

      PageNumber: params?.PageNumber ?? 1,

      PageSize: params?.PageSize ?? 10,

      RoleId: params?.RoleId || undefined,

    },

    headers: { ...getAuthHeaders(), Accept: "application/json" },

  });

  return response.data;

};

export const getUserById = async (id: string) => {

  const response = await axios.get(`${BASE_URL}/User/get-user-by-id/${id}`, {

    headers: { ...getAuthHeaders(), Accept: "application/json" },

  });

  return response.data;

};

export const addUser = async (data: AddUserPayload) => {

  const response = await axios.post(`${BASE_URL}/User/add-user`, data, {

    headers: {

      ...getAuthHeaders(),

      "Content-Type": "application/json",

      Accept: "*/*",

    },

  });

  return response.data;

};

export const updateUser = async (

  id: string,

  data: AddUserPayload & { id: string; userStatus: number }

) => {

  const response = await axios.put(`${BASE_URL}/User/update-user/${id}`, data, {

    headers: {

      ...getAuthHeaders(),

      "Content-Type": "application/json",

      Accept: "*/*",

    },

  });

  return response.data;

};

export const deleteUser = async (id: string) => {

  const response = await axios.delete(`${BASE_URL}/User/delete-user/${id}`, {

    headers: { ...getAuthHeaders(), Accept: "*/*" },

  });

  return response.data;

};

export const unwrapApiValue = (response: any): any => {

  if (response == null) return response;

  if (response?.data !== undefined) return response.data;

  if (response?.result !== undefined) return response.result;

  return response;

};

export const unwrapApiArray = (response: any): any[] => {

  const value = unwrapApiValue(response);

  if (Array.isArray(value)) return value;

  const candidates = [

    value?.users,

    value?.userList,

    value?.items,

    value?.values,

    value?.records,

    value?.data,

    response?.users,

    response?.userList,

    response?.items,

    response?.values,

    response?.records,

  ];

  return candidates.find(Array.isArray) ?? [];

};

/* =====================================================

    DEFAULT EXPORT

  ===================================================== */

  export default {

    getUsers,

    getUserById,

    addUser,

    updateUser,

    deleteUser,

    getRoles,

    addRole,

    updateRole,

    deleteRole,

    getAllEmployees,

    // getProfile,

    // updateEmployeeProfile,

    getHolidays,

    getHolidayById,

    addHoliday,

    updateHoliday,

    deleteHoliday,

    addLeaveType,

    getLeaveTypeById,

    updateLeaveType,

    getAllLeaveTypes,

    deleteLeaveType,

    addLeave,

    getAllLeaves,

    getLeaveById,

    updateLeave,

    updateLeaveStatus,

    deleteLeave,

    getDepartments,

    addDepartment,

    updateDepartment,

    deleteDepartment,

    getDesignations,

    addDesignation,

    updateDesignation,

    deleteDesignation,

    addEmployee,

    updateEmployee,

    deleteEmployee,

    getLeaveChatMessages,

    sendLeaveChatMessage,

    deleteLeaveChatMessage,

    getAttendanceDashboard,

    getAttendance,

    getAttendanceById,

    attendanceLogout,

    getHRDashboard,

  };

/* =====================================================

   CURRENT USER PERMISSIONS

===================================================== */

export interface MyPermission {

  pageId: string;

  canRead: boolean;

  canWrite: boolean;

  canCreate: boolean;

  canDelete: boolean;

  canImport: boolean;

  canExport: boolean;

}

export const getPermissionPages = async () => {

  const response = await axios.get(

    `${BASE_URL}/DesignationsAndPermission/get-pages`,

    {

      headers: {

        ...getAuthHeaders(),

        Accept: "application/json",

      },

    }

  );

  return response.data;

};

export const getMyPermissions = async () => {

  const response = await axios.get(

    `${BASE_URL}/User/my-permissions`,

    {

      headers: {

        ...getAuthHeaders(),

        Accept: "application/json",

      },

    }

  );

  return response.data;

};


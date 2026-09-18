import axios, {
  AxiosError,
} from "axios";

const BASE_URL =
  "http://jupiterapi.adequateshop.com/api";

const LEAVE_BASE_URL =
  "http://jupiterapi.adequateshop.com";

const LEAVE_TYPE_BASE_URL =
  "http://jupiterapi.adequateshop.com";

/* =====================================================
   TOKEN
===================================================== */

const getToken = (): string | null => {
  return localStorage.getItem("token");
};

const getAuthHeaders = (
  token?: string | null
) => {
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
   AXIOS ERROR HELPER
===================================================== */

const getApiErrorMessage = (
  error: unknown
): string => {
  const axiosError =
    error as AxiosError<any>;

  const responseData =
    axiosError?.response?.data;

  if (typeof responseData === "string") {
    return responseData;
  }

  if (responseData?.message) {
    return responseData.message;
  }

  if (responseData?.Message) {
    return responseData.Message;
  }

  if (responseData?.errors) {
    if (
      typeof responseData.errors === "object"
    ) {
      return Object.entries(
        responseData.errors
      )
        .map(([key, value]) => {
          const errorValue = Array.isArray(value)
            ? value.join(", ")
            : String(value);

          return `${key}: ${errorValue}`;
        })
        .join(" | ");
    }

    return String(responseData.errors);
  }

  if (axiosError?.message) {
    return axiosError.message;
  }

  return "Something went wrong.";
};

/* =====================================================
   COMMON REQUEST CONFIG
===================================================== */

const getJsonConfig = (
  token?: string | null
): any => {
  return {
    headers: {
      ...getAuthHeaders(token),
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  };
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
  id: string;
  roleName: string;
  isActive: boolean;
}

export interface DeleteRolePayload {
  id: string;
}

export const getRoles = async (
  params?: GetRolesParams
) => {
  const token = getToken();

  const response = await axios.get(
    `${BASE_URL}/Role/get-roles`,
    {
      params: {
        Search:
          params?.Search?.trim() ||
          undefined,

        IsActive:
          params?.IsActive,

        SortBy:
          params?.SortBy || undefined,

        FromDate:
          params?.FromDate || undefined,

        ToDate:
          params?.ToDate || undefined,

        PageNumber:
          params?.PageNumber ?? 1,

        PageSize:
          params?.PageSize ?? 10,
      },

      headers: getAuthHeaders(token),
    }
  );

  console.log(
    "GET ROLES RESPONSE:",
    response.data
  );

  return response.data;
};

export const addRole = async (
  data: AddRolePayload
) => {
  const token = getToken();

  if (!token) {
    throw new Error(
      "Token not found. Please login again."
    );
  }

  const response = await axios.post(
    `${BASE_URL}/Role/add-role`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "*/*",
      },
    }
  );

  console.log(
    "ADD ROLE RESPONSE:",
    response.data
  );

  return response.data;
};

export const updateRole = async (
  data: UpdateRolePayload
) => {
  const token = getToken();

  const response = await axios.put(
    `${BASE_URL}/Role/update-role`,
    data,
    {
      headers: {
        ...getAuthHeaders(token),
        "Content-Type": "application/json",
        Accept: "*/*",
      },
    }
  );

  console.log(
    "UPDATE ROLE RESPONSE:",
    response.data
  );

  return response.data;
};

export const deleteRole = async (
  id: string
) => {
  const token = getToken();

  const response = await axios.delete(
    `${BASE_URL}/Role/delete-role`,
    {
      headers: {
        ...getAuthHeaders(token),
        Accept: "*/*",
        "Content-Type": "application/json",
      },

      data: {
        id,
      },
    }
  );

  console.log(
    "DELETE ROLE RESPONSE:",
    response.data
  );

  return response.data;
};

/* =====================================================
   EMPLOYEE PROFILE
===================================================== */



const extractProfileData = (
  responseData: any
): any => {
  if (
    !responseData ||
    typeof responseData !== "object"
  ) {
    return null;
  }

  const candidates = [
    responseData?.data,
    responseData?.Data,
    responseData?.result,
    responseData?.Result,
    responseData?.profile,
    responseData?.Profile,
    responseData,
  ];

  /*
    First try to find an object that actually
    looks like a profile object.
  */

  const profileObject =
    candidates.find(
      (item) =>
        item &&
        typeof item === "object" &&
        !Array.isArray(item) &&
        (
          "id" in item ||
          "Id" in item ||
          "firstName" in item ||
          "FirstName" in item ||
          "lastName" in item ||
          "LastName" in item ||
          "email" in item ||
          "Email" in item ||
          "phone" in item ||
          "Phone" in item
        )
    );

  if (profileObject) {
    return profileObject;
  }

  /*
    Fallback to first object wrapper.
  */

  const objectWrapper =
    candidates.find(
      (item) =>
        item &&
        typeof item === "object" &&
        !Array.isArray(item)
    );

  return objectWrapper || null;
};



      export const getEmployeeProfile = async (
  idOrToken?: string,
  maybeToken?: string
) => {
  const token = maybeToken || idOrToken || getToken();



  try {
    const response = await axios.get(
      `${BASE_URL}/Profile/Get-Profile`,
      {
        headers: getAuthHeaders(token),
      }
    );

    console.log("GET PROFILE RESPONSE:", response.data);

    const profile = extractProfileData(response.data);

    console.log("EXTRACTED PROFILE DATA:", profile);

    return profile;
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    console.error(
      "GET PROFILE ERROR RESPONSE:",
      (error as AxiosError)?.response?.data
    );
    throw new Error(getApiErrorMessage(error));
  }
};

/* =====================================================
   UPDATE EMPLOYEE PROFILE
===================================================== */

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

/*
  PUT
  /api/Profile/Update-Profile

  Content-Type:
  multipart/form-data

  IMPORTANT:
  We intentionally do NOT manually set
  Content-Type: multipart/form-data.

  Axios/browser will automatically add the
  correct multipart boundary.
*/

export const updateEmployeeProfile =
  async (
    data: UpdateProfilePayload,
    token: string
  ) => {
    if (!token) {
      throw new Error(
        "Authentication token not found. Please login again."
      );
    }

    if (!data.Id?.trim()) {
      throw new Error(
        "Profile ID is required."
      );
    }

    const formData = new FormData();

    /*
      Exact Swagger/API field names
    */

    formData.append(
      "Id",
      data.Id
    );

    formData.append(
      "FirstName",
      data.FirstName || ""
    );

    formData.append(
      "LastName",
      data.LastName || ""
    );

    formData.append(
      "Email",
      data.Email || ""
    );

    formData.append(
      "Phone",
      data.Phone || ""
    );

    formData.append(
      "Address",
      data.Address || ""
    );

    formData.append(
      "Country",
      data.Country || ""
    );

    formData.append(
      "State",
      data.State || ""
    );

    formData.append(
      "City",
      data.City || ""
    );

    formData.append(
      "PostalCode",
      data.PostalCode || ""
    );

    formData.append(
      "CurrentPassword",
      data.CurrentPassword || ""
    );

    formData.append(
      "NewPassword",
      data.NewPassword || ""
    );

    formData.append(
      "ConfirmPassword",
      data.ConfirmPassword || ""
    );

    /*
      ProfilePicture is binary.

      Only append it when user actually
      selects a new image.
    */

    if (
      data.ProfilePicture instanceof File
    ) {
      formData.append(
        "ProfilePicture",
        data.ProfilePicture
      );
    }

    /*
      Debug FormData before request.
    */

    console.log(
      "UPDATE PROFILE FORM DATA:"
    );

    for (
      const [key, value]
      of formData.entries()
    ) {
      console.log(
        key,
        value instanceof File
          ? {
              name: value.name,
              type: value.type,
              size: value.size,
            }
          : value
      );
    }

    try {
      const response =
        await axios.put(
          `${BASE_URL}/Profile/Update-Profile`,
          formData,
          {
            headers: {
              ...getAuthHeaders(token),
              Accept: "*/*",
            },
          }
        );

      console.log(
        "UPDATE PROFILE RESPONSE:",
        response.data
      );

      return response.data;
    } catch (error) {
      console.error(
        "UPDATE PROFILE ERROR:",
        error
      );

      console.error(
        "UPDATE PROFILE STATUS:",
        (error as AxiosError)?.response
          ?.status
      );

      console.error(
        "UPDATE PROFILE ERROR RESPONSE:",
        (error as AxiosError)?.response
          ?.data
      );

      throw new Error(
        getApiErrorMessage(error)
      );
    }
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

export interface AddDepartmentPayload {
  departmentName: string;
  isActive: boolean;
}

export interface UpdateDepartmentPayload {
  id: string;
  departmentName: string;
  isActive: boolean;
}

export const getDepartments = async (
  params?: GetDepartmentsParams
) => {
  const token = getToken();

  const response = await axios.get(
    `${BASE_URL}/Department/Get-Department`,
    {
      params: {
        Search:
          params?.Search || undefined,

        UserStatus:
          params?.UserStatus,

        PerpageEntry:
          params?.PerpageEntry,

        PageNumber:
          params?.PageNumber ?? 1,

        PageSize:
          params?.PageSize ?? 100,

        SortBy:
          params?.SortBy || undefined,
      },

      headers: getAuthHeaders(token),
    }
  );

  console.log(
    "GET DEPARTMENTS RESPONSE:",
    response.data
  );

  return response.data;
};

export const addDepartment = async (
  data: AddDepartmentPayload
) => {
  const token = getToken();

  const response = await axios.post(
    `${BASE_URL}/Department/Add-department`,
    data,
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

export const updateDepartment =
  async (
    data: UpdateDepartmentPayload
  ) => {
    const token = getToken();

    const response =
      await axios.put(
        `${BASE_URL}/Department/Update-Department`,
        data,
        {
          headers: {
            ...getAuthHeaders(token),
            "Content-Type":
              "application/json",
            Accept: "*/*",
          },
        }
      );

    return response.data;
  };

export const deleteDepartment =
  async (
    id: string
  ) => {
    const token = getToken();

    const response =
      await axios.delete(
        `${BASE_URL}/Department/Delete-Department`,
        {
          headers: {
            ...getAuthHeaders(token),
            "Content-Type":
              "application/json",
          },

          data: {
            id,
          },
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

export interface AddDesignationPayload {
  designationName: string;
  departmentId: string;
  isActive: boolean;
}

export interface UpdateDesignationPayload {
  id: string;
  designationName: string;
  departmentId: string;
  isActive: boolean;
}

export const getDesignations = async (
  params?: GetDesignationsParams
) => {
  const token = getToken();

  const response = await axios.get(
    `${BASE_URL}/Designation/Get-Designation`,
    {
      params: {
        Search:
          params?.Search || undefined,

        DepartmentId:
          params?.DepartmentId || undefined,

        UserStatus:
          params?.UserStatus,

        PageNumber:
          params?.PageNumber ?? 1,

        PageSize:
          params?.PageSize ?? 100,

        SortBy:
          params?.SortBy || undefined,
      },

      headers: getAuthHeaders(token),
    }
  );

  console.log(
    "GET DESIGNATIONS RESPONSE:",
    response.data
  );

  return response.data;
};

export const addDesignation = async (
  data: AddDesignationPayload
) => {
  const token = getToken();

  const response = await axios.post(
    `${BASE_URL}/Designation/Add-designation`,
    data,
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

export const updateDesignation =
  async (
    data: UpdateDesignationPayload
  ) => {
    const token = getToken();

    const response =
      await axios.put(
        `${BASE_URL}/Designation/Update-Designation`,
        data,
        {
          headers: {
            ...getAuthHeaders(token),
            "Content-Type":
              "application/json",
            Accept: "*/*",
          },
        }
      );

    return response.data;
  };

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
   HOLIDAY
===================================================== */

export type HolidayTypeValue = 0 | 1;

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
  holidayDate: string;
  holidayType: number;
  description: string;
  status: boolean;
}

export const getHolidays = async (
  params?: GetHolidaysParams
) => {
  const token = getToken();

  const response = await axios.get(
    `${BASE_URL}/Holiday/get-holiday`,
    {
      params: {
        Search:
          params?.Search?.trim() ||
          undefined,

        HolidayType:
          params?.HolidayType,

        PageNumber:
          params?.PageNumber ?? 1,

        PageSize:
          params?.PageSize ?? 10,

        SortBy:
          params?.SortBy || undefined,
      },

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
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "*/*",
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
        Accept: "*/*",
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

      data: {
        id,
      },
    }
  );

  return response.data;
};

/* =====================================================
   EMPLOYEE
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
        Search:
          params?.Search || undefined,

        DesignationId:
          params?.DesignationId ||
          undefined,

        UserStatus:
          params?.UserStatus,

        FromDate:
          params?.FromDate || undefined,

        ToDate:
          params?.ToDate || undefined,

        PageNumber:
          params?.PageNumber ?? 1,

        PageSize:
          params?.PageSize ?? 100,

        SortBy:
          params?.SortBy || undefined,
      },

      headers: getAuthHeaders(token),
    }
  );

  console.log(
    "EMPLOYEE API RESPONSE:",
    response.data
  );

  return response.data;
};

/* =====================================================
   LEAVE TYPE
===================================================== */

export interface GetLeaveTypesParams {
  Search?: string;
  PageNumber?: number;
  PageSize?: number;
  SortBy?: string;
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

export interface DeleteLeaveTypePayload {
  id: string;
}

export const getAllLeaveTypes =
  async (
    params?: GetLeaveTypesParams
  ) => {
    const token = getToken();

    const response =
      await axios.get(
        `${LEAVE_TYPE_BASE_URL}/get-all-leave-type`,
        {
          params: {
            Search:
              params?.Search?.trim() ||
              undefined,

            PageNumber:
              params?.PageNumber ?? 1,

            PageSize:
              params?.PageSize ?? 10,

            SortBy:
              params?.SortBy || undefined,
          },

          headers:
            getAuthHeaders(token),
        }
      );

    return response.data;
  };

export const addLeaveType = async (
  data: AddLeaveTypePayload
) => {
  const token = getToken();

  const response = await axios.post(
    `${LEAVE_BASE_URL}/add-leave-type`,
    data,
    {
      headers: {
        ...getAuthHeaders(token),
        "Content-Type": "application/json",
        Accept: "*/*",
      },
    }
  );

  return response.data;
};

export const updateLeaveType =
  async (
    data: UpdateLeaveTypePayload
  ) => {
    const token = getToken();

    const response =
      await axios.put(
        `${LEAVE_TYPE_BASE_URL}/update-leave-type`,
        data,
        {
          headers: {
            ...getAuthHeaders(token),
            "Content-Type":
              "application/json",
            Accept: "*/*",
          },
        }
      );

    return response.data;
  };

export const deleteLeaveType =
  async (
    id: string
  ) => {
    const token = getToken();

    const response =
      await axios.delete(
        `${LEAVE_TYPE_BASE_URL}/delete-leave-type`,
        {
          headers: {
            ...getAuthHeaders(token),
            "Content-Type":
              "application/json",
          },

          data: {
            id,
          },
        }
      );

    return response.data;
  };

/* =====================================================
   LEAVE
===================================================== */

export type LeaveAvailType = 1 | 2 | 3;

export type LeaveStatusValue = 0 | 1 | 2;

export interface GetAllLeaveParams {
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

export interface AddLeavePayload {
  userId: string;
  leaveTypeMasterId: string;
  fromDate: string;
  toDate: string;
  availType: LeaveAvailType;
  reason: string;
  attachment?: string | null;
}

export interface UpdateLeavePayload {
  userId: string;
  leaveTypeMasterId: string;
  fromDate: string;
  toDate: string;
  availType: LeaveAvailType;
  reason: string;
  attachment?: string | null;
}

export interface UpdateLeaveStatusPayload {
  status: LeaveStatusValue;
  remarks?: string;
};

/* =====================================================
   PAYLOAD VALIDATION
===================================================== */

const validateLeavePayload = (
  data:
    | AddLeavePayload
    | UpdateLeavePayload
) => {
  if (!data.userId?.trim()) {
    throw new Error(
      "userId is required."
    );
  }

  if (!data.leaveTypeMasterId?.trim()) {
    throw new Error(
      "leaveTypeMasterId is required."
    );
  }

  if (!data.fromDate?.trim()) {
    throw new Error(
      "fromDate is required."
    );
  }

  if (!data.toDate?.trim()) {
    throw new Error(
      "toDate is required."
    );
  }

  if (
    ![1, 2, 3].includes(
      Number(data.availType)
    )
  ) {
    throw new Error(
      "availType must be 1, 2, or 3."
    );
  }

  if (!data.reason?.trim()) {
    throw new Error(
      "reason is required."
    );
  }
};

/* =====================================================
   CLEAN LEAVE PAYLOAD
===================================================== */

const cleanLeavePayload = (
  data:
    | AddLeavePayload
    | UpdateLeavePayload
) => {
  validateLeavePayload(data);

  const payload: Record<string, unknown> = {
    userId: data.userId.trim(),
    leaveTypeMasterId:
      data.leaveTypeMasterId.trim(),
    fromDate: data.fromDate.trim(),
    toDate: data.toDate.trim(),
    availType: Number(data.availType),
    reason: data.reason.trim(),
  };

  if (
    data.attachment !== undefined &&
    data.attachment !== null &&
    String(data.attachment).trim() !== ""
  ) {
    payload.attachment =
      String(data.attachment).trim();
  }

  return payload;
};

/* =====================================================
   GET ALL LEAVE
===================================================== */

export const getAllLeave = async (
  params?: GetAllLeaveParams
) => {
  const token = getToken();

  try {
    const response = await axios.get(
      `${LEAVE_TYPE_BASE_URL}/get-all-leave`,
      {
        params: {
          UserId:
            params?.UserId || undefined,

          LeaveTypeMasterId:
            params?.LeaveTypeMasterId ||
            undefined,

          Status:
            params?.Status !== undefined
              ? params.Status
              : undefined,

          FromDate:
            params?.FromDate || undefined,

          ToDate:
            params?.ToDate || undefined,

          Search:
            params?.Search?.trim() ||
            undefined,

          SortBy:
            params?.SortBy || undefined,

          SortDirection:
            params?.SortDirection || undefined,

          PageNumber:
            params?.PageNumber ?? 1,

          PageSize:
            params?.PageSize ?? 10,

          ReviewedByUserId:
            params?.ReviewedByUserId ||
            undefined,
        },

        headers: getAuthHeaders(token),
      }
    );

    console.log(
      "GET ALL LEAVE RESPONSE:",
      response.data
    );

    return response.data;
  } catch (error) {
    console.error(
      "GET ALL LEAVE ERROR:",
      error
    );

    throw new Error(
      getApiErrorMessage(error)
    );
  }
};

/* =====================================================
   GET LEAVE BY ID
===================================================== */

export const getLeaveById = async (
  id: string
) => {
  const token = getToken();

  if (!id?.trim()) {
    throw new Error(
      "Leave ID is required."
    );
  }

  try {
    const response = await axios.get(
      `${LEAVE_TYPE_BASE_URL}/get-leave-by-id/${encodeURIComponent(
        id.trim()
      )}`,
      {
        headers: getAuthHeaders(token),
      }
    );

    console.log(
      "GET LEAVE BY ID RESPONSE:",
      response.data
    );

    return response.data;
  } catch (error) {
    console.error(
      "GET LEAVE BY ID ERROR:",
      error
    );

    throw new Error(
      getApiErrorMessage(error)
    );
  }
};

/* =====================================================
   ADD LEAVE
===================================================== */

export const addLeave = async (
  data: AddLeavePayload
) => {
  const token = getToken();

  const payload =
    cleanLeavePayload(data);

  console.log(
    "ADD LEAVE PAYLOAD:",
    payload
  );

  try {
    const response = await axios.post(
      `${LEAVE_TYPE_BASE_URL}/add-leave`,
      payload,
      getJsonConfig(token)
    );

    console.log(
      "ADD LEAVE RESPONSE:",
      response.data
    );

    return response.data;
  } catch (error) {
    console.error(
      "ADD LEAVE ERROR RESPONSE:",
      (error as AxiosError)?.response?.data
    );

    throw new Error(
      getApiErrorMessage(error)
    );
  }
};

/* =====================================================
   UPDATE LEAVE
===================================================== */

export const updateLeave = async (
  leaveId: string,
  data: UpdateLeavePayload
) => {
  const token = getToken();

  if (!leaveId?.trim()) {
    throw new Error(
      "Leave ID is required."
    );
  }

  const payload =
    cleanLeavePayload(data);

  console.log(
    "UPDATE LEAVE ID:",
    leaveId
  );

  console.log(
    "UPDATE LEAVE PAYLOAD:",
    payload
  );

  try {
    const response = await axios.put(
      `${LEAVE_TYPE_BASE_URL}/update-leave/${encodeURIComponent(
        leaveId.trim()
      )}`,
      payload,
      getJsonConfig(token)
    );

    console.log(
      "UPDATE LEAVE RESPONSE:",
      response.data
    );

    return response.data;
  } catch (error) {
    console.error(
      "UPDATE LEAVE ERROR RESPONSE:",
      (error as AxiosError)?.response?.data
    );

    throw new Error(
      getApiErrorMessage(error)
    );
  }
};

/* =====================================================
   UPDATE LEAVE STATUS
===================================================== */

export const updateLeaveStatus = async (
  leaveId: string,
  reviewedByUserId: string,
  data: UpdateLeaveStatusPayload
) => {
  const token = getToken();

  if (!leaveId?.trim()) {
    throw new Error(
      "Leave ID is required."
    );
  }

  if (!reviewedByUserId?.trim()) {
    throw new Error(
      "Reviewed By User ID is required."
    );
  }

  const payload = {
    status: Number(data.status),
    remarks: data.remarks?.trim() || "",
  };

  if (
    ![0, 1, 2].includes(
      payload.status
    )
  ) {
    throw new Error(
      "Status must be 0, 1, or 2."
    );
  }

  try {
    const response = await axios.put(
      `${LEAVE_TYPE_BASE_URL}/update-leave-status/${encodeURIComponent(
        leaveId.trim()
      )}/${encodeURIComponent(
        reviewedByUserId.trim()
      )}`,
      payload,
      getJsonConfig(token)
    );

    console.log(
      "UPDATE LEAVE STATUS RESPONSE:",
      response.data
    );

    return response.data;
  } catch (error) {
    console.error(
      "UPDATE LEAVE STATUS ERROR RESPONSE:",
      (error as AxiosError)?.response?.data
    );

    throw new Error(
      getApiErrorMessage(error)
    );
  }
};

/* =====================================================
   DELETE LEAVE
===================================================== */

export const deleteLeave = async (
  leaveId: string
) => {
  const token = getToken();

  if (!leaveId?.trim()) {
    throw new Error(
      "Leave ID is required."
    );
  }

  try {
    const response = await axios.delete(
      `${LEAVE_TYPE_BASE_URL}/delete-leave/${encodeURIComponent(
        leaveId.trim()
      )}`,
      {
        headers: {
          ...getAuthHeaders(token),
          Accept: "application/json",
        },
      }
    );

    console.log(
      "DELETE LEAVE RESPONSE:",
      response.data
    );

    return response.data;
  } catch (error) {
    console.error(
      "DELETE LEAVE ERROR RESPONSE:",
      (error as AxiosError)?.response?.data
    );

    throw new Error(
      getApiErrorMessage(error)
    );
  }
};

/* =====================================================
   LEAVE CHAT
===================================================== */

export interface LeaveChatMessage {
  id?: string;
  messageId?: string;
  leaveId?: string;
  userId?: string;
  senderId?: string;
  senderName?: string;
  message?: string;
  createdAt?: string;
  updatedAt?: string;
  profilePicture?: string;

  [key: string]: any;
}

export interface SendLeaveChatMessagePayload {
  message: string;
}

/* =====================================================
   GET LEAVE CHAT
   GET /api/LeaveChat/{leaveId}
===================================================== */

export const getLeaveChat = async (
  leaveId: string
) => {
  const token = getToken();

  if (!leaveId?.trim()) {
    throw new Error(
      "Leave ID is required."
    );
  }

  try {
    const response = await axios.get(
      `${BASE_URL}/LeaveChat/${encodeURIComponent(
        leaveId.trim()
      )}`,
      {
        headers: {
          ...getAuthHeaders(token),
          Accept: "application/json",
        },
      }
    );

    console.log(
      "GET LEAVE CHAT RESPONSE:",
      response.data
    );

    return response.data;
  } catch (error) {
    console.error(
      "GET LEAVE CHAT ERROR:",
      error
    );

    throw new Error(
      getApiErrorMessage(error)
    );
  }
};

/* =====================================================
   SEND LEAVE CHAT MESSAGE
   POST /api/LeaveChat/{leaveId}/send
===================================================== */

export const sendLeaveChatMessage = async (
  leaveId: string,
  data: SendLeaveChatMessagePayload
) => {
  const token = getToken();

  if (!leaveId?.trim()) {
    throw new Error(
      "Leave ID is required."
    );
  }

  if (!data?.message?.trim()) {
    throw new Error(
      "Message is required."
    );
  }

  const payload = {
    message: data.message.trim(),
  };

  console.log(
    "SEND LEAVE CHAT LEAVE ID:",
    leaveId
  );

  console.log(
    "SEND LEAVE CHAT PAYLOAD:",
    payload
  );

  try {
    const response = await axios.post(
      `${BASE_URL}/LeaveChat/${encodeURIComponent(
        leaveId.trim()
      )}/send`,
      payload,
      getJsonConfig(token)
    );

    console.log(
      "SEND LEAVE CHAT RESPONSE:",
      response.data
    );

    return response.data;
  } catch (error) {
    console.error(
      "SEND LEAVE CHAT ERROR:",
      error
    );

    throw new Error(
      getApiErrorMessage(error)
    );
  }
};

/* =====================================================
   DELETE LEAVE CHAT MESSAGE
   DELETE /api/LeaveChat/message/{messageId}
===================================================== */

export const deleteLeaveChatMessage =
  async (
    messageId: string
  ) => {
    const token = getToken();

    if (!messageId?.trim()) {
      throw new Error(
        "Message ID is required."
      );
    }

    try {
      const response =
        await axios.delete(
          `${BASE_URL}/LeaveChat/message/${encodeURIComponent(
            messageId.trim()
          )}`,
          {
            headers: {
              ...getAuthHeaders(token),
              Accept: "application/json",
            },
          }
        );

      console.log(
        "DELETE LEAVE CHAT MESSAGE RESPONSE:",
        response.data
      );

      return response.data;
    } catch (error) {
      console.error(
        "DELETE LEAVE CHAT MESSAGE ERROR:",
        error
      );

      throw new Error(
        getApiErrorMessage(error)
      );
    }
  };

/* =====================================================
   ADMIN ATTENDANCE
===================================================== */

export interface GetAdminAttendanceParams {
  FromDate?: string;
  ToDate?: string;
  DepartmentId?: string;
  Status?: number;
  Search?: string;
  SortBy?: string;
  PageNumber?: number;
  PageSize?: number;
}

export interface UpdateAdminAttendancePayload {
  attendanceDate?: string;
  checkIn?: string;
  checkOut?: string;
  breakTime?: number;
  late?: number;
  productionHours?: number;
  status?: number;
}

/* =====================================================
   GET ADMIN ATTENDANCE
   GET /api/AdminAttendance/page-data
===================================================== */

export const getAdminAttendance =
  async (
    params?: GetAdminAttendanceParams
  ) => {
    const token = getToken();

    try {
      const response =
        await axios.get(
          `${BASE_URL}/AdminAttendance/page-data`,
          {
            params: {
              FromDate:
                params?.FromDate ||
                undefined,

              ToDate:
                params?.ToDate ||
                undefined,

              DepartmentId:
                params?.DepartmentId ||
                undefined,

              Status:
                params?.Status !== undefined
                  ? params.Status
                  : undefined,

              Search:
                params?.Search?.trim() ||
                undefined,

              SortBy:
                params?.SortBy ||
                undefined,

              PageNumber:
                params?.PageNumber ?? 1,

              PageSize:
                params?.PageSize ?? 10,
            },

            headers:
              getAuthHeaders(token),
          }
        );

      console.log(
        "GET ADMIN ATTENDANCE RESPONSE:",
        response.data
      );

      return response.data;
    } catch (error) {
      console.error(
        "GET ADMIN ATTENDANCE ERROR:",
        error
      );

      console.error(
        "GET ADMIN ATTENDANCE ERROR RESPONSE:",
        (error as AxiosError)?.response?.data
      );

      throw new Error(
        getApiErrorMessage(error)
      );
    }
  };

/* =====================================================
   UPDATE ADMIN ATTENDANCE
   PUT /api/AdminAttendance/{attendanceId}
===================================================== */

export const updateAdminAttendance =
  async (
    attendanceId: string,
    data: UpdateAdminAttendancePayload
  ) => {
    const token = getToken();

    if (!attendanceId?.trim()) {
      throw new Error(
        "Attendance ID is required."
      );
    }

    const payload = {
      attendanceDate:
        data.attendanceDate,

      checkIn:
        data.checkIn || "",

      checkOut:
        data.checkOut || "",

      breakTime:
        Number(data.breakTime ?? 0),

      late:
        Number(data.late ?? 0),

      productionHours:
        Number(data.productionHours ?? 0),

      status:
        Number(data.status),
    };

    console.log(
      "========================================"
    );

    console.log(
      "UPDATE ATTENDANCE ID:",
      attendanceId
    );

    console.log(
      "UPDATE ATTENDANCE URL:",
      `${BASE_URL}/AdminAttendance/${attendanceId}`
    );

    console.log(
      "UPDATE ATTENDANCE PAYLOAD:",
      payload
    );

    console.log(
      "========================================"
    );

    try {
      const response =
        await axios.put(
          `${BASE_URL}/AdminAttendance/${encodeURIComponent(
            attendanceId.trim()
          )}`,
          payload,
          {
            headers: {
              ...getAuthHeaders(token),
              "Content-Type":
                "application/json",
              Accept:
                "application/json",
            },
          }
        );

      console.log(
        "UPDATE ATTENDANCE RESPONSE:",
        response.data
      );

      return response.data;
    } catch (error) {
      console.error(
        "UPDATE ATTENDANCE ERROR:",
        error
      );

      console.error(
        "UPDATE ATTENDANCE STATUS:",
        (error as AxiosError)?.response
          ?.status
      );

      console.error(
        "UPDATE ATTENDANCE ERROR RESPONSE:",
        (error as AxiosError)?.response
          ?.data
      );

      throw new Error(
        getApiErrorMessage(error)
      );
    }
  };


  /* =====================================================
   ADMIN DASHBOARD
===================================================== */

export interface GetAdminDashboardParams {
  AttendancePeriod?: string;
  DepartmentPeriod?: string;
  DepartmentId?: string;
  ClockInOutCount?: number;
  LateEmployeeCount?: number;
}

/* =====================================================
   GET ADMIN DASHBOARD
   GET /api/AdminDashboard/page-data
===================================================== */

export const getAdminDashboard = async (
  params?: GetAdminDashboardParams
) => {
  const token = getToken();

  try {
    const response = await axios.get(
      `${BASE_URL}/AdminDashboard/page-data`,
      {
        params: {
          AttendancePeriod:
            params?.AttendancePeriod ||
            undefined,

          DepartmentPeriod:
            params?.DepartmentPeriod ||
            undefined,

          DepartmentId:
            params?.DepartmentId ||
            undefined,

          ClockInOutCount:
            params?.ClockInOutCount,

          LateEmployeeCount:
            params?.LateEmployeeCount,
        },

        headers: {
          ...getAuthHeaders(token),
          Accept: "application/json",
        },
      }
    );

    console.log(
      "GET ADMIN DASHBOARD RESPONSE:",
      response.data
    );

    return response.data;
  } catch (error) {
    console.error(
      "GET ADMIN DASHBOARD ERROR:",
      error
    );

    console.error(
      "GET ADMIN DASHBOARD ERROR RESPONSE:",
      (error as AxiosError)?.response?.data
    );

    throw new Error(
      getApiErrorMessage(error)
    );
  }
};


/* =====================================================
   ATTENDANCE LOGOUT
   POST /api/Attendance/logout
===================================================== */

export const logoutAttendance = async () => {
  const token = getToken();

  try {
    const response = await axios.post(
      `${BASE_URL}/Attendance/logout`,
      null,
      {
        headers: {
          ...getAuthHeaders(token),
          Accept: "application/json",
        },
      }
    );

    console.log(
      "ATTENDANCE LOGOUT RESPONSE:",
      response.data
    );

    return response.data;
  } catch (error) {
    console.error(
      "ATTENDANCE LOGOUT ERROR:",
      error
    );

    console.error(
      "ATTENDANCE LOGOUT STATUS:",
      (error as AxiosError)?.response?.status
    );

    console.error(
      "ATTENDANCE LOGOUT ERROR RESPONSE:",
      (error as AxiosError)?.response?.data
    );

    throw new Error(
      getApiErrorMessage(error)
    );
  }
};


/* =====================================================
   DEFAULT EXPORT
===================================================== */

export default {
  /* ROLE */
  getRoles,
  addRole,
  updateRole,
  deleteRole,

  /* EMPLOYEE PROFILE */
  getEmployeeProfile,
  updateEmployeeProfile,

  /* EMPLOYEE */
  addEmployee,
  updateEmployee,
  deleteEmployee,
  getAllEmployees,

  /* DEPARTMENT */
  getDepartments,
  addDepartment,
  updateDepartment,
  deleteDepartment,

  /* DESIGNATION */
  getDesignations,
  addDesignation,
  updateDesignation,
  deleteDesignation,

  /* HOLIDAY */  
  getHolidays,
  addHoliday,
  updateHoliday,
  deleteHoliday,

  /* LEAVE TYPE */
  getAllLeaveTypes,
  addLeaveType,
  updateLeaveType,
  deleteLeaveType,

  /* LEAVE */
  getAllLeave,
  getLeaveById,
  addLeave,
  updateLeave,
  updateLeaveStatus,
  deleteLeave,

  /* LEAVE CHAT */
  getLeaveChat,
  sendLeaveChatMessage,
  deleteLeaveChatMessage,

/* ADMIN DASHBOARD */
getAdminDashboard,

  /* ADMIN ATTENDANCE */
  getAdminAttendance,
  updateAdminAttendance,

  /* ATTENDANCE */
logoutAttendance,

};


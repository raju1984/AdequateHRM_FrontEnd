import axios, { AxiosError } from "axios";

const BASE_URL = "http://jupiterapi.adequateshop.com/api";
const LEAVE_BASE_URL = "http://jupiterapi.adequateshop.com";
const LEAVE_TYPE_BASE_URL = "http://jupiterapi.adequateshop.com";

const getToken = (): string | null => localStorage.getItem("token");

const getAuthHeaders = (token?: string | null) => {
  const authToken = token || getToken();
  if (!authToken) throw new Error("Authentication token not found. Please login again.");
  return { Authorization: `Bearer ${authToken}` };
};

const getApiErrorMessage = (error: unknown): string => {
  const axiosError = error as AxiosError<any>;
  const data = axiosError?.response?.data;
  if (typeof data === "string") return data;
  if (data?.message) return data.message;
  if (data?.Message) return data.Message;
  if (data?.errors) {
    if (typeof data.errors === "object") {
      return Object.entries(data.errors)
        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : String(value)}`)
        .join(" | ");
    }
    return String(data.errors);
  }
  return axiosError?.message || "Something went wrong.";
};

const getJsonConfig = (token?: string | null) => ({
  headers: {
    ...getAuthHeaders(token),
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/* =====================================================
   GENERIC RESPONSE HELPERS
===================================================== */

export const unwrapApiValue = (responseData: any): any => {
  if (!responseData || typeof responseData !== "object") return responseData;
  const candidates = [
    responseData?.data,
    responseData?.Data,
    responseData?.result,
    responseData?.Result,
    responseData?.items,
    responseData?.Items,
    responseData?.records,
    responseData?.Records,
    responseData,
  ];
  return candidates.find((x) => x !== undefined && x !== null) ?? null;
};

export const unwrapApiArray = (responseData: any): any[] => {
  if (Array.isArray(responseData)) return responseData;
  const candidates = [
    responseData?.data,
    responseData?.Data,
    responseData?.result,
    responseData?.Result,
    responseData?.items,
    responseData?.Items,
    responseData?.records,
    responseData?.Records,
    responseData?.users,
    responseData?.Users,
    responseData?.roles,
    responseData?.Roles,
    responseData?.designations,
    responseData?.Designations,
    responseData?.departments,
    responseData?.Departments,
  ];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
    if (candidate && typeof candidate === "object") {
      const nested = [
        candidate.items, candidate.Items, candidate.records, candidate.Records,
        candidate.data, candidate.Data, candidate.users, candidate.Users,
        candidate.roles, candidate.Roles, candidate.designations, candidate.Designations,
        candidate.departments, candidate.Departments,
      ];
      const arr = nested.find(Array.isArray);
      if (arr) return arr;
    }
  }
  return [];
};

export const getValue = <T = any>(obj: any, keys: string[], fallback?: T): T => {
  if (!obj || typeof obj !== "object") return fallback as T;
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null && value !== "") return value as T;
  }
  return fallback as T;
};

/* =====================================================
   ROLE
===================================================== */

export interface GetRolesParams {
  Search?: string; IsActive?: boolean; SortBy?: string; FromDate?: string; ToDate?: string; PageNumber?: number; PageSize?: number;
}
export interface AddRolePayload { roleName: string; isActive: boolean; }
export interface UpdateRolePayload { id: string; roleName: string; isActive: boolean; }

export const getRoles = async (params?: GetRolesParams) => {
  const response = await axios.get(`${BASE_URL}/Role/get-roles`, {
    params: {
      Search: params?.Search?.trim() || undefined,
      IsActive: params?.IsActive,
      SortBy: params?.SortBy || undefined,
      FromDate: params?.FromDate || undefined,
      ToDate: params?.ToDate || undefined,
      PageNumber: params?.PageNumber ?? 1,
      PageSize: params?.PageSize ?? 10,
    },
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const addRole = async (data: AddRolePayload) => {
  const response = await axios.post(`${BASE_URL}/Role/add-role`, data, getJsonConfig());
  return response.data;
};

export const updateRole = async (data: UpdateRolePayload) => {
  const response = await axios.put(`${BASE_URL}/Role/update-role`, data, getJsonConfig());
  return response.data;
};

export const deleteRole = async (id: string) => {
  const response = await axios.delete(`${BASE_URL}/Role/delete-role`, {
    headers: { ...getAuthHeaders(), "Content-Type": "application/json", Accept: "*/*" },
    data: { id },
  });
  return response.data;
};


/* =====================================================
   USER
   Swagger:
   POST   /api/User/add-user
   GET    /api/User/get-users
   GET    /api/User/get-user-by-id/{id}
   PUT    /api/User/update-user/{id}
   DELETE /api/User/delete-user/{id}
===================================================== */

export interface UserEducationPayload {
  institutionName: string;
  location: string;
  startDate: string;
  endDate: string;
  degreeOrCourse: string;
  specialization: string;
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
  fromDate: string;
  toDate: string;
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
  availableStartDate: string;
  desiredPay: number;
  isFullTimeDesired: boolean;
  isPartTimeDesired: boolean;
  isSeasonalOrTemporaryDesired: boolean;
  educations: UserEducationPayload[];
  references: UserReferencePayload[];
  experiences: UserExperiencePayload[];
  permissions: UserPermissionPayload[];
}

export interface UpdateUserPayload extends AddUserPayload {
  id?: string;
  userStatus?: number;
}

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

export interface UserApiModel extends Partial<UpdateUserPayload> {
  id?: string;
  Id?: string;
  firstName?: string;
  FirstName?: string;
  lastName?: string;
  LastName?: string;
  userName?: string;
  UserName?: string;
  email?: string;
  Email?: string;
  phoneNumber?: string;
  PhoneNumber?: string;
  userType?: number;
  UserType?: number;
  userStatus?: number;
  UserStatus?: number;
  roleName?: string;
  RoleName?: string;
  designationName?: string;
  DesignationName?: string;
  departmentName?: string;
  DepartmentName?: string;
  createdAt?: string;
  CreatedAt?: string;
  [key: string]: any;
}

const cleanOptionalParam = (value?: string) =>
  value?.trim() || undefined;

export const getUsers = async (params?: GetUsersParams) => {
  try {
    const response = await axios.get(`${BASE_URL}/User/get-users`, {
      params: {
        Search: cleanOptionalParam(params?.Search),
        UserType: params?.UserType,
        UserStatus: params?.UserStatus,
        SortBy: cleanOptionalParam(params?.SortBy),
        FromDate: cleanOptionalParam(params?.FromDate),
        ToDate: cleanOptionalParam(params?.ToDate),
        PageNumber: params?.PageNumber ?? 1,
        PageSize: params?.PageSize ?? 100,
        RoleId: cleanOptionalParam(params?.RoleId),
      },
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

export const getUserById = async (id: string) => {
  if (!id?.trim()) throw new Error("User ID is required.");
  try {
    const response = await axios.get(
      `${BASE_URL}/User/get-user-by-id/${encodeURIComponent(id.trim())}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

export const addUser = async (data: AddUserPayload) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/User/add-user`,
      data,
      getJsonConfig()
    );
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

export const updateUser = async (id: string, data: UpdateUserPayload) => {
  if (!id?.trim()) throw new Error("User ID is required.");
  try {
    const response = await axios.put(
      `${BASE_URL}/User/update-user/${encodeURIComponent(id.trim())}`,
      data,
      getJsonConfig()
    );
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

export const deleteUser = async (id: string) => {
  if (!id?.trim()) throw new Error("User ID is required.");
  try {
    const response = await axios.delete(
      `${BASE_URL}/User/delete-user/${encodeURIComponent(id.trim())}`,
      { headers: { ...getAuthHeaders(), Accept: "application/json" } }
    );
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

/* =====================================================
   EMPLOYEE PROFILE
===================================================== */

const extractProfileData = (responseData: any): any => {
  if (!responseData || typeof responseData !== "object") return null;
  const candidates = [
    responseData?.data,
    responseData?.Data,
    responseData?.result,
    responseData?.Result,
    responseData?.profile,
    responseData?.Profile,
    responseData,
  ];
  const profile = candidates.find(
    (item) =>
      item && typeof item === "object" && !Array.isArray(item) &&
      (["id", "Id", "firstName", "FirstName", "lastName", "LastName", "email", "Email", "phone", "Phone"] as string[]).some((k) => k in item)
  );
  return profile || candidates.find((item) => item && typeof item === "object" && !Array.isArray(item)) || null;
};

export const getEmployeeProfile = async (idOrToken?: string, maybeToken?: string) => {
  const token = maybeToken || idOrToken || getToken();
  try {
    const response = await axios.get(`${BASE_URL}/Profile/Get-Profile`, { headers: getAuthHeaders(token) });
    return extractProfileData(response.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

export interface UpdateProfilePayload {
  Id: string; FirstName: string; LastName: string; Email: string; Phone: string; Address: string; Country: string;
  State: string; City: string; PostalCode: string; CurrentPassword: string; NewPassword: string; ConfirmPassword: string; ProfilePicture?: File | null;
}

export const updateEmployeeProfile = async (data: UpdateProfilePayload, token: string) => {
  if (!token) throw new Error("Authentication token not found. Please login again.");
  if (!data.Id?.trim()) throw new Error("Profile ID is required.");
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (key !== "ProfilePicture") formData.append(key, value == null ? "" : String(value));
  });
  if (data.ProfilePicture instanceof File) formData.append("ProfilePicture", data.ProfilePicture);
  try {
    const response = await axios.put(`${BASE_URL}/Profile/Update-Profile`, formData, {
      headers: { ...getAuthHeaders(token), Accept: "*/*" },
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

/* =====================================================
   DEPARTMENT
===================================================== */

export interface GetDepartmentsParams { Search?: string; UserStatus?: number; PerpageEntry?: number; PageNumber?: number; PageSize?: number; SortBy?: string; }
export interface AddDepartmentPayload { departmentName: string; isActive: boolean; }
export interface UpdateDepartmentPayload { id: string; departmentName: string; isActive: boolean; }

export const getDepartments = async (params?: GetDepartmentsParams) => {
  const response = await axios.get(`${BASE_URL}/Department/Get-Department`, {
    params: {
      Search: params?.Search || undefined, UserStatus: params?.UserStatus, PerpageEntry: params?.PerpageEntry,
      PageNumber: params?.PageNumber ?? 1, PageSize: params?.PageSize ?? 100, SortBy: params?.SortBy || undefined,
    }, headers: getAuthHeaders(),
  });
  return response.data;
};
export const addDepartment = async (data: AddDepartmentPayload) => (await axios.post(`${BASE_URL}/Department/Add-department`, data, getJsonConfig())).data;
export const updateDepartment = async (data: UpdateDepartmentPayload) => (await axios.put(`${BASE_URL}/Department/Update-Department`, data, getJsonConfig())).data;
export const deleteDepartment = async (id: string) => (await axios.delete(`${BASE_URL}/Department/Delete-Department`, { headers: { ...getAuthHeaders(), "Content-Type": "application/json" }, data: { id } })).data;

/* =====================================================
   DESIGNATION
===================================================== */

export interface GetDesignationsParams { Search?: string; DepartmentId?: string; UserStatus?: number; PageNumber?: number; PageSize?: number; SortBy?: string; }
export interface AddDesignationPayload { designationName: string; departmentId: string; isActive: boolean; }
export interface UpdateDesignationPayload { id: string; designationName: string; departmentId: string; isActive: boolean; }

export const getDesignations = async (params?: GetDesignationsParams) => {
  const response = await axios.get(`${BASE_URL}/Designation/Get-Designation`, {
    params: {
      Search: params?.Search || undefined, DepartmentId: params?.DepartmentId || undefined, UserStatus: params?.UserStatus,
      PageNumber: params?.PageNumber ?? 1, PageSize: params?.PageSize ?? 100, SortBy: params?.SortBy || undefined,
    }, headers: getAuthHeaders(),
  });
  return response.data;
};
export const addDesignation = async (data: AddDesignationPayload) => (await axios.post(`${BASE_URL}/Designation/Add-designation`, data, getJsonConfig())).data;
export const updateDesignation = async (data: UpdateDesignationPayload) => (await axios.put(`${BASE_URL}/Designation/Update-designation`, data, getJsonConfig())).data;
export const deleteDesignation = async (id: string) => (await axios.delete(`${BASE_URL}/Designation/Delete-Designation`, { headers: { ...getAuthHeaders(), "Content-Type": "application/json" }, data: { id } })).data;

/* =====================================================
   HOLIDAY
===================================================== */

export interface GetHolidaysParams { Search?: string; HolidayType?: number; PageNumber?: number; PageSize?: number; SortBy?: string; FinancialYear?: string; }
export interface AddHolidayPayload { title: string; holidayDate: string; holidayType: number; description: string; status: boolean; }
export interface UpdateHolidayPayload { id: string; title: string; holidayDate: string; holidayType: number; description: string; status: boolean; }

export const getHolidays = async (params?: GetHolidaysParams) => (await axios.get(`${BASE_URL}/Holiday/get-holiday`, {
  params: { Search: params?.Search?.trim() || undefined, HolidayType: params?.HolidayType, PageNumber: params?.PageNumber ?? 1, PageSize: params?.PageSize ?? 10, SortBy: params?.SortBy || undefined, FinancialYear: params?.FinancialYear || undefined },
  headers: getAuthHeaders(),
})).data;
export const addHoliday = async (data: AddHolidayPayload) => (await axios.post(`${BASE_URL}/Holiday/Add_Holiday`, data, getJsonConfig())).data;
export const updateHoliday = async (data: UpdateHolidayPayload) => (await axios.put(`${BASE_URL}/Holiday/Update-Holiday`, data, getJsonConfig())).data;
export const deleteHoliday = async (id: string) => (await axios.delete(`${BASE_URL}/Holiday/Delete-Holiday`, { headers: { ...getAuthHeaders(), "Content-Type": "application/json" }, data: { id } })).data;

/* =====================================================
   EMPLOYEE
===================================================== */

export const addEmployee = async (data: FormData) => (await axios.post(`${BASE_URL}/Employee`, data, { headers: getAuthHeaders() })).data;
export const updateEmployee = async (employeeId: string, data: FormData) => (await axios.put(`${BASE_URL}/Employee/${encodeURIComponent(employeeId)}`, data, { headers: { ...getAuthHeaders(), Accept: "*/*" } })).data;
export const deleteEmployee = async (employeeId: string) => (await axios.delete(`${BASE_URL}/Employee/${encodeURIComponent(employeeId)}`, { headers: { ...getAuthHeaders(), Accept: "*/*" } })).data;

export interface GetEmployeesParams { Search?: string; DesignationId?: string; UserStatus?: number; FromDate?: string; ToDate?: string; PageNumber?: number; PageSize?: number; SortBy?: string; }
export const getAllEmployees = async (params?: GetEmployeesParams) => (await axios.get(`${BASE_URL}/Employee/page-data`, {
  params: {
    Search: params?.Search || undefined, DesignationId: params?.DesignationId || undefined, UserStatus: params?.UserStatus,
    FromDate: params?.FromDate || undefined, ToDate: params?.ToDate || undefined, PageNumber: params?.PageNumber ?? 1, PageSize: params?.PageSize ?? 100, SortBy: params?.SortBy || undefined,
  }, headers: getAuthHeaders(),
})).data;

/* =====================================================
   EMPLOYEE DETAILS - NEW
===================================================== */

export interface GetEmployeeDetailsParams {
  FromDate?: string;
  ToDate?: string;
  LeaveTypeId?: string;
  ApprovedById?: string;
  Status?: number;
  SortBy?: string;
  PageNumber?: number;
  PageSize?: number;
}

export interface EmployeePersonalDetailPayload {
  userId: string;
  epfNumber: string;
  gender: number;
  dateOfBirth: string;
  passportNumber: string;
  passportExpiryDate: string;
  nationality: string;
  religion: string;
  maritalStatus: number;
  isSpouseEmployed: boolean;
  numberOfChildren: number;
}

export interface EmployeeFamilyPayload {
  userId: string;
  name: string;
  relationship: string;
  dateOfBirth: string;
  phoneNumber: string;
}

export interface EmployeeEducationPayload {
  userId: string;
  institutionName: string;
  course: string;
  startDate: string;
  endDate: string;
}

export interface EmployeeExperiencePayload {
  userId: string;
  previousCompanyName: string;
  designation: string;
  startDate: string;
  endDate: string;
  isCurrentlyWorking: boolean;
}

export interface EmployeeEmergencyContactPayload {
  userId: string;
  name: string;
  relationship: string;
  phoneNumber: string;
  alternatePhoneNumber: string;
  isPrimary: boolean;
}

const validateEmployeeId = (employeeId: string) => {
  if (!employeeId?.trim()) throw new Error("Employee ID is required.");
};

export const getEmployeeDetails = async (employeeId: string) => {
  validateEmployeeId(employeeId);
  try {
    return (await axios.get(
      `${BASE_URL}/Employee/${encodeURIComponent(employeeId.trim())}/details`,
      { headers: getAuthHeaders() }
    )).data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

export const getEmployeeLeaves = async (
  employeeId: string,
  params: GetEmployeeDetailsParams = {}
) => {
  validateEmployeeId(employeeId);
  try {
    return (await axios.get(
      `${BASE_URL}/Employee/${encodeURIComponent(employeeId.trim())}/leaves`,
      {
        params: {
          FromDate: params.FromDate || undefined,
          ToDate: params.ToDate || undefined,
          LeaveTypeId: params.LeaveTypeId || undefined,
          ApprovedById: params.ApprovedById || undefined,
          Status: params.Status !== undefined ? params.Status : undefined,
          SortBy: params.SortBy || undefined,
          PageNumber: params.PageNumber ?? 1,
          PageSize: params.PageSize ?? 10,
        },
        headers: getAuthHeaders(),
      }
    )).data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

/*
 * Swagger contract supplied:
 * POST /api/Employee/{employeeId}/personal-detail
 */
export const updateEmployeePersonalDetail = async (
  employeeId: string,
  data: EmployeePersonalDetailPayload
) => {
  validateEmployeeId(employeeId);
  try {
    return (await axios.post(
      `${BASE_URL}/Employee/${encodeURIComponent(employeeId.trim())}/personal-detail`,
      data,
      getJsonConfig()
    )).data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

export const getEmployeeFamily = async (employeeId: string) => {
  validateEmployeeId(employeeId);
  return (await axios.get(`${BASE_URL}/Employee/${encodeURIComponent(employeeId.trim())}/family`, { headers: getAuthHeaders() })).data;
};

export const addEmployeeFamily = async (employeeId: string, data: EmployeeFamilyPayload) => {
  validateEmployeeId(employeeId);
  return (await axios.post(`${BASE_URL}/Employee/${encodeURIComponent(employeeId.trim())}/family`, data, getJsonConfig())).data;
};

export const updateEmployeeFamily = async (employeeId: string, familyMemberId: string, data: EmployeeFamilyPayload) => {
  validateEmployeeId(employeeId);
  if (!familyMemberId?.trim()) throw new Error("Family Member ID is required.");
  return (await axios.put(`${BASE_URL}/Employee/${encodeURIComponent(employeeId.trim())}/family/${encodeURIComponent(familyMemberId.trim())}`, data, getJsonConfig())).data;
};

export const deleteEmployeeFamily = async (employeeId: string, familyMemberId: string) => {
  validateEmployeeId(employeeId);
  if (!familyMemberId?.trim()) throw new Error("Family Member ID is required.");
  return (await axios.delete(`${BASE_URL}/Employee/${encodeURIComponent(employeeId.trim())}/family/${encodeURIComponent(familyMemberId.trim())}`, { headers: getAuthHeaders() })).data;
};

export const getEmployeeEducation = async (employeeId: string) => {
  validateEmployeeId(employeeId);
  return (await axios.get(`${BASE_URL}/Employee/${encodeURIComponent(employeeId.trim())}/education`, { headers: getAuthHeaders() })).data;
};

export const addEmployeeEducation = async (employeeId: string, data: EmployeeEducationPayload) => {
  validateEmployeeId(employeeId);
  return (await axios.post(`${BASE_URL}/Employee/${encodeURIComponent(employeeId.trim())}/education`, data, getJsonConfig())).data;
};

export const getEmployeeEducationById = async (employeeId: string, educationId: string) => {
  validateEmployeeId(employeeId);
  if (!educationId?.trim()) throw new Error("Education ID is required.");
  return (await axios.get(`${BASE_URL}/Employee/${encodeURIComponent(employeeId.trim())}/education/${encodeURIComponent(educationId.trim())}`, { headers: getAuthHeaders() })).data;
};

export const updateEmployeeEducation = async (employeeId: string, educationId: string, data: EmployeeEducationPayload) => {
  validateEmployeeId(employeeId);
  if (!educationId?.trim()) throw new Error("Education ID is required.");
  return (await axios.put(`${BASE_URL}/Employee/${encodeURIComponent(employeeId.trim())}/education/${encodeURIComponent(educationId.trim())}`, data, getJsonConfig())).data;
};

export const deleteEmployeeEducation = async (employeeId: string, educationId: string) => {
  validateEmployeeId(employeeId);
  if (!educationId?.trim()) throw new Error("Education ID is required.");
  return (await axios.delete(`${BASE_URL}/Employee/${encodeURIComponent(employeeId.trim())}/education/${encodeURIComponent(educationId.trim())}`, { headers: getAuthHeaders() })).data;
};

export const getEmployeeExperience = async (employeeId: string) => {
  validateEmployeeId(employeeId);
  return (await axios.get(`${BASE_URL}/Employee/${encodeURIComponent(employeeId.trim())}/experience`, { headers: getAuthHeaders() })).data;
};

export const addEmployeeExperience = async (employeeId: string, data: EmployeeExperiencePayload) => {
  validateEmployeeId(employeeId);
  return (await axios.post(`${BASE_URL}/Employee/${encodeURIComponent(employeeId.trim())}/experience`, data, getJsonConfig())).data;
};

export const getEmployeeExperienceById = async (employeeId: string, experienceId: string) => {
  validateEmployeeId(employeeId);
  if (!experienceId?.trim()) throw new Error("Experience ID is required.");
  return (await axios.get(`${BASE_URL}/Employee/${encodeURIComponent(employeeId.trim())}/experience/${encodeURIComponent(experienceId.trim())}`, { headers: getAuthHeaders() })).data;
};

export const updateEmployeeExperience = async (employeeId: string, experienceId: string, data: EmployeeExperiencePayload) => {
  validateEmployeeId(employeeId);
  if (!experienceId?.trim()) throw new Error("Experience ID is required.");
  return (await axios.put(`${BASE_URL}/Employee/${encodeURIComponent(employeeId.trim())}/experience/${encodeURIComponent(experienceId.trim())}`, data, getJsonConfig())).data;
};

export const deleteEmployeeExperience = async (employeeId: string, experienceId: string) => {
  validateEmployeeId(employeeId);
  if (!experienceId?.trim()) throw new Error("Experience ID is required.");
  return (await axios.delete(`${BASE_URL}/Employee/${encodeURIComponent(employeeId.trim())}/experience/${encodeURIComponent(experienceId.trim())}`, { headers: getAuthHeaders() })).data;
};

export const getEmployeeEmergencyContacts = async (employeeId: string) => {
  validateEmployeeId(employeeId);
  return (await axios.get(`${BASE_URL}/Employee/${encodeURIComponent(employeeId.trim())}/emergency-contact`, { headers: getAuthHeaders() })).data;
};

export const addEmployeeEmergencyContact = async (employeeId: string, data: EmployeeEmergencyContactPayload) => {
  validateEmployeeId(employeeId);
  return (await axios.post(`${BASE_URL}/Employee/${encodeURIComponent(employeeId.trim())}/emergency-contact`, data, getJsonConfig())).data;
};

export const getEmployeeEmergencyContactById = async (employeeId: string, contactId: string) => {
  validateEmployeeId(employeeId);
  if (!contactId?.trim()) throw new Error("Contact ID is required.");
  return (await axios.get(`${BASE_URL}/Employee/${encodeURIComponent(employeeId.trim())}/emergency-contact/${encodeURIComponent(contactId.trim())}`, { headers: getAuthHeaders() })).data;
};

export const updateEmployeeEmergencyContact = async (employeeId: string, contactId: string, data: EmployeeEmergencyContactPayload) => {
  validateEmployeeId(employeeId);
  if (!contactId?.trim()) throw new Error("Contact ID is required.");
  return (await axios.put(`${BASE_URL}/Employee/${encodeURIComponent(employeeId.trim())}/emergency-contact/${encodeURIComponent(contactId.trim())}`, data, getJsonConfig())).data;
};

export const deleteEmployeeEmergencyContact = async (employeeId: string, contactId: string) => {
  validateEmployeeId(employeeId);
  if (!contactId?.trim()) throw new Error("Contact ID is required.");
  return (await axios.delete(`${BASE_URL}/Employee/${encodeURIComponent(employeeId.trim())}/emergency-contact/${encodeURIComponent(contactId.trim())}`, { headers: getAuthHeaders() })).data;
};

/* =====================================================
   LEAVE TYPE
===================================================== */

export interface GetLeaveTypesParams { Search?: string; PageNumber?: number; PageSize?: number; SortBy?: string; }
export interface AddLeaveTypePayload { leaveName: string; leaveDays: number; }
export interface UpdateLeaveTypePayload { id: string; leaveName: string; leaveDays: number; isActive: boolean; }

export const getAllLeaveTypes = async (params?: GetLeaveTypesParams) => (await axios.get(`${LEAVE_TYPE_BASE_URL}/get-all-leave-type`, {
  params: { Search: params?.Search?.trim() || undefined, PageNumber: params?.PageNumber ?? 1, PageSize: params?.PageSize ?? 10, SortBy: params?.SortBy || undefined }, headers: getAuthHeaders(),
})).data;
export const addLeaveType = async (data: AddLeaveTypePayload) => (await axios.post(`${LEAVE_BASE_URL}/add-leave-type`, data, getJsonConfig())).data;
export const updateLeaveType = async (data: UpdateLeaveTypePayload) => (await axios.put(`${LEAVE_TYPE_BASE_URL}/update-leave-type`, data, getJsonConfig())).data;
export const deleteLeaveType = async (id: string) => (await axios.delete(`${LEAVE_TYPE_BASE_URL}/delete-leave-type`, { headers: { ...getAuthHeaders(), "Content-Type": "application/json" }, data: { id } })).data;

/* =====================================================
   LEAVE
===================================================== */

export type LeaveAvailType = 1 | 2 | 3;
export type LeaveStatusValue = 0 | 1 | 2;
export interface GetAllLeaveParams { UserId?: string; LeaveTypeMasterId?: string; Status?: number; FromDate?: string; ToDate?: string; Search?: string; SortBy?: string; SortDirection?: string; PageNumber?: number; PageSize?: number; ReviewedByUserId?: string; }
export interface AddLeavePayload { userId: string; leaveTypeMasterId: string; fromDate: string; toDate: string; availType: LeaveAvailType; reason: string; attachment?: string | null; }
export interface UpdateLeavePayload extends AddLeavePayload {}
export interface UpdateLeaveStatusPayload { status: LeaveStatusValue; remarks?: string; }

const validateLeavePayload = (data: AddLeavePayload) => {
  if (!data.userId?.trim()) throw new Error("userId is required.");
  if (!data.leaveTypeMasterId?.trim()) throw new Error("leaveTypeMasterId is required.");
  if (!data.fromDate?.trim()) throw new Error("fromDate is required.");
  if (!data.toDate?.trim()) throw new Error("toDate is required.");
  if (![1, 2, 3].includes(Number(data.availType))) throw new Error("availType must be 1, 2, or 3.");
  if (!data.reason?.trim()) throw new Error("reason is required.");
};

const cleanLeavePayload = (data: AddLeavePayload) => {
  validateLeavePayload(data);
  const payload: Record<string, unknown> = {
    userId: data.userId.trim(), leaveTypeMasterId: data.leaveTypeMasterId.trim(), fromDate: data.fromDate.trim(), toDate: data.toDate.trim(), availType: Number(data.availType), reason: data.reason.trim(),
  };
  if (data.attachment != null && String(data.attachment).trim() !== "") payload.attachment = String(data.attachment).trim();
  return payload;
};

export const getAllLeave = async (params?: GetAllLeaveParams) => {
  try {
    return (await axios.get(`${LEAVE_TYPE_BASE_URL}/get-all-leave`, { params: {
      UserId: params?.UserId || undefined, LeaveTypeMasterId: params?.LeaveTypeMasterId || undefined, Status: params?.Status !== undefined ? params.Status : undefined,
      FromDate: params?.FromDate || undefined, ToDate: params?.ToDate || undefined, Search: params?.Search?.trim() || undefined, SortBy: params?.SortBy || undefined,
      SortDirection: params?.SortDirection || undefined, PageNumber: params?.PageNumber ?? 1, PageSize: params?.PageSize ?? 10, ReviewedByUserId: params?.ReviewedByUserId || undefined,
    }, headers: getAuthHeaders() })).data;
  } catch (error) { throw new Error(getApiErrorMessage(error)); }
};

export const getLeaveById = async (id: string) => {
  if (!id?.trim()) throw new Error("Leave ID is required.");
  try { return (await axios.get(`${LEAVE_TYPE_BASE_URL}/get-leave-by-id/${encodeURIComponent(id.trim())}`, { headers: getAuthHeaders() })).data; }
  catch (error) { throw new Error(getApiErrorMessage(error)); }
};

export const addLeave = async (data: AddLeavePayload) => {
  const payload = cleanLeavePayload(data);
  try { return (await axios.post(`${LEAVE_TYPE_BASE_URL}/add-leave`, payload, getJsonConfig())).data; }
  catch (error) { throw new Error(getApiErrorMessage(error)); }
};

export const updateLeave = async (leaveId: string, data: UpdateLeavePayload) => {
  if (!leaveId?.trim()) throw new Error("Leave ID is required.");
  const payload = cleanLeavePayload(data);
  try { return (await axios.put(`${LEAVE_TYPE_BASE_URL}/update-leave/${encodeURIComponent(leaveId.trim())}`, payload, getJsonConfig())).data; }
  catch (error) { throw new Error(getApiErrorMessage(error)); }
};

export const updateLeaveStatus = async (leaveId: string, reviewedByUserId: string, data: UpdateLeaveStatusPayload) => {
  if (!leaveId?.trim()) throw new Error("Leave ID is required.");
  if (!reviewedByUserId?.trim()) throw new Error("Reviewed By User ID is required.");
  const payload = { status: Number(data.status), remarks: data.remarks?.trim() || "" };
  if (![0, 1, 2].includes(payload.status)) throw new Error("Status must be 0, 1, or 2.");
  try { return (await axios.put(`${LEAVE_TYPE_BASE_URL}/update-leave-status/${encodeURIComponent(leaveId.trim())}/${encodeURIComponent(reviewedByUserId.trim())}`, payload, getJsonConfig())).data; }
  catch (error) { throw new Error(getApiErrorMessage(error)); }
};

export const deleteLeave = async (leaveId: string) => {
  if (!leaveId?.trim()) throw new Error("Leave ID is required.");
  try { return (await axios.delete(`${LEAVE_TYPE_BASE_URL}/delete-leave/${encodeURIComponent(leaveId.trim())}`, { headers: { ...getAuthHeaders(), Accept: "application/json" } })).data; }
  catch (error) { throw new Error(getApiErrorMessage(error)); }
};

/* =====================================================
   LEAVE CHAT
===================================================== */
export interface LeaveChatMessage { id?: string; messageId?: string; leaveId?: string; userId?: string; senderId?: string; senderName?: string; message?: string; createdAt?: string; updatedAt?: string; profilePicture?: string; [key: string]: any; }
export interface SendLeaveChatMessagePayload { message: string; }

export const getLeaveChat = async (leaveId: string) => {
  if (!leaveId?.trim()) throw new Error("Leave ID is required.");
  try { return (await axios.get(`${BASE_URL}/LeaveChat/${encodeURIComponent(leaveId.trim())}`, { headers: { ...getAuthHeaders(), Accept: "application/json" } })).data; }
  catch (error) { throw new Error(getApiErrorMessage(error)); }
};
export const sendLeaveChatMessage = async (leaveId: string, data: SendLeaveChatMessagePayload) => {
  if (!leaveId?.trim()) throw new Error("Leave ID is required.");
  if (!data?.message?.trim()) throw new Error("Message is required.");
  try { return (await axios.post(`${BASE_URL}/LeaveChat/${encodeURIComponent(leaveId.trim())}/send`, { message: data.message.trim() }, getJsonConfig())).data; }
  catch (error) { throw new Error(getApiErrorMessage(error)); }
};
export const deleteLeaveChatMessage = async (messageId: string) => {
  if (!messageId?.trim()) throw new Error("Message ID is required.");
  try { return (await axios.delete(`${BASE_URL}/LeaveChat/message/${encodeURIComponent(messageId.trim())}`, { headers: { ...getAuthHeaders(), Accept: "application/json" } })).data; }
  catch (error) { throw new Error(getApiErrorMessage(error)); }
};

/* =====================================================
   ADMIN ATTENDANCE
===================================================== */
export interface GetAdminAttendanceParams { FromDate?: string; ToDate?: string; DepartmentId?: string; Status?: number; Search?: string; SortBy?: string; PageNumber?: number; PageSize?: number; }
export interface UpdateAdminAttendancePayload { attendanceDate?: string; checkIn?: string; checkOut?: string; breakTime?: number; late?: number; productionHours?: number; status?: number; }
export const getAdminAttendance = async (params?: GetAdminAttendanceParams) => (await axios.get(`${BASE_URL}/AdminAttendance/page-data`, { params: {
  FromDate: params?.FromDate || undefined, ToDate: params?.ToDate || undefined, DepartmentId: params?.DepartmentId || undefined, Status: params?.Status !== undefined ? params.Status : undefined,
  Search: params?.Search?.trim() || undefined, SortBy: params?.SortBy || undefined, PageNumber: params?.PageNumber ?? 1, PageSize: params?.PageSize ?? 10,
}, headers: getAuthHeaders() })).data;
export const updateAdminAttendance = async (attendanceId: string, data: UpdateAdminAttendancePayload) => {
  if (!attendanceId?.trim()) throw new Error("Attendance ID is required.");
  try { return (await axios.put(`${BASE_URL}/AdminAttendance/${encodeURIComponent(attendanceId.trim())}`, {
    attendanceDate: data.attendanceDate, checkIn: data.checkIn || "", checkOut: data.checkOut || "", breakTime: Number(data.breakTime ?? 0), late: Number(data.late ?? 0), productionHours: Number(data.productionHours ?? 0), status: Number(data.status),
  }, getJsonConfig())).data; }
  catch (error) { throw new Error(getApiErrorMessage(error)); }
};

/* =====================================================
   ADMIN DASHBOARD
===================================================== */
export interface GetAdminDashboardParams { AttendancePeriod?: string; DepartmentPeriod?: string; DepartmentId?: string; ClockInOutCount?: number; LateEmployeeCount?: number; }
export const getAdminDashboard = async (params?: GetAdminDashboardParams) => {
  try { return (await axios.get(`${BASE_URL}/AdminDashboard/page-data`, { params: {
    AttendancePeriod: params?.AttendancePeriod || undefined, DepartmentPeriod: params?.DepartmentPeriod || undefined, DepartmentId: params?.DepartmentId || undefined,
    ClockInOutCount: params?.ClockInOutCount, LateEmployeeCount: params?.LateEmployeeCount,
  }, headers: { ...getAuthHeaders(), Accept: "application/json" } })).data; }
  catch (error) { throw new Error(getApiErrorMessage(error)); }
};

/* =====================================================
   ATTENDANCE LOGOUT
===================================================== */
export const logoutAttendance = async () => {
  try { return (await axios.post(`${BASE_URL}/Attendance/logout`, null, { headers: { ...getAuthHeaders(), Accept: "application/json" } })).data; }
  catch (error) { throw new Error(getApiErrorMessage(error)); }
};

/* =====================================================
   DEFAULT EXPORT
===================================================== */

export default {
  getRoles, addRole, updateRole, deleteRole,
  getUsers, getUserById, addUser, updateUser, deleteUser,
  getEmployeeProfile, updateEmployeeProfile,
  addEmployee, updateEmployee, deleteEmployee, getAllEmployees,
  getEmployeeDetails, getEmployeeLeaves,
  updateEmployeePersonalDetail,
  getEmployeeFamily, addEmployeeFamily, updateEmployeeFamily, deleteEmployeeFamily,
  getEmployeeEducation, addEmployeeEducation, getEmployeeEducationById, updateEmployeeEducation, deleteEmployeeEducation,
  getEmployeeExperience, addEmployeeExperience, getEmployeeExperienceById, updateEmployeeExperience, deleteEmployeeExperience,
  getEmployeeEmergencyContacts, addEmployeeEmergencyContact, getEmployeeEmergencyContactById, updateEmployeeEmergencyContact, deleteEmployeeEmergencyContact,
  getDepartments, addDepartment, updateDepartment, deleteDepartment,
  getDesignations, addDesignation, updateDesignation, deleteDesignation,
  getHolidays, addHoliday, updateHoliday, deleteHoliday,
  getAllLeaveTypes, addLeaveType, updateLeaveType, deleteLeaveType,
  getAllLeave, getLeaveById, addLeave, updateLeave, updateLeaveStatus, deleteLeave,
  getLeaveChat, sendLeaveChatMessage, deleteLeaveChatMessage,
  getAdminDashboard, getAdminAttendance, updateAdminAttendance, logoutAttendance,
};

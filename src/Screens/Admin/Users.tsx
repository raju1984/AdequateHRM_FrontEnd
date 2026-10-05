import React, {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  CirclePlus,
  ChevronLeft,
  ChevronRight,
  Shield,
  Pencil,
  Trash2,
  Plus,
  X,
  BriefcaseBusiness,
  GraduationCap,
  UsersRound,
  UserRound,
} from "lucide-react";

import {
  addUser,
  deleteUser,
  getDesignations,
  getRoles,
  getUserById,
  getUsers,
  unwrapApiArray,
  unwrapApiValue,
  updateUser,
  type AddUserPayload,
  type UpdateUserPayload,
  type UserApiModel,
} from "../../services/adminservices";

//  TYPES

type UserRole = "Employee" | "HR" | "Admin" | "Accountant";
type SelectedRole = "HR" | "Employee" | "Accountant" | "Admin";

type UserStatus = "Active" | "Inactive";

interface UserItem {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  department: string;
  designation: string;
  about: string;
  createdDate: string;
  createdAtRaw: string;
  role: UserRole;
  status: UserStatus;
  roleId?: string;
  designationId?: string;
  userType?: number;
  userStatus?: number;
  apiUser?: UserApiModel;
}

//  ADD USER FORM TYPES

interface EducationRow {
  schoolName: string;
  location: string;
  yearsAttended: string;
  degreeReceived: string;
  major: string;
}

interface ReferenceRow {
  name: string;
  title: string;
  company: string;
  phone: string;
}

interface EmploymentRow {
  employer: string;
  jobTitle: string;
  datesEmployed: string;
  workPhone: string;
  startingPayRate: string;
  endingPayRate: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

interface ApplicationForm {
  fullName: string;
  password: string;
  confirmPassword: string;
  country: string;
  address: string;
  city: string;
  state: string;
  zip: string;

  phoneNumber: string;
  emailAddress: string;

  eligibleToWork: string;
  veteran: string;
  convicted: string;

  positionDesired: string; // designation NAME
  designationId: string; // designation ID (API)
  availableStartDate: string;
  desiredPay: string;

  employmentType: string;

  education: EducationRow[];
  references: ReferenceRow[];
  employmentHistory: EmploymentRow[];
}

//  INITIAL DATA

const initialUsers: UserItem[] = [];

//  EMPTY APPLICATION FORM

const createEmptyApplicationForm = (): ApplicationForm => ({
  fullName: "",
  password: "",
  confirmPassword: "",
  country: "India",
  address: "",
  city: "",
  state: "",
  zip: "",

  phoneNumber: "",
  emailAddress: "",

  eligibleToWork: "",
  veteran: "",
  convicted: "",

  positionDesired: "",
  designationId: "",
  availableStartDate: "",
  desiredPay: "",

  employmentType: "",

  education: [
    {
      schoolName: "",
      location: "",
      yearsAttended: "",
      degreeReceived: "",
      major: "",
    },
  ],

  references: [
    { name: "", title: "", company: "", phone: "" },
    { name: "", title: "", company: "", phone: "" },
    { name: "", title: "", company: "", phone: "" },
  ],

  employmentHistory: [
    {
      employer: "",
      jobTitle: "",
      datesEmployed: "",
      workPhone: "",
      startingPayRate: "",
      endingPayRate: "",
      address: "",
      city: "",
      state: "",
      zip: "",
    },
  ],
});


const fallbackDesignations = [
  "Manager",
  "HR Manager",
  "HR Executive",
  "Developer",
  "Designer",
  "Accountant",
  "Sales Executive",
  "Sales Manager",
  "Marketing Executive",
];

//  ROLE BADGE CLASS HELPER

const getRoleBadgeClass = (role: UserRole) => {
  switch (role) {
    case "HR":
      return "users-role-hr";
    case "Admin":
      return "users-role-admin";
    case "Accountant":
      return "users-role-accountant";
    default:
      return "users-role-employee";
  }
};

const ALL_VALUE = "__all__";

const openCalendar = (e: React.MouseEvent<HTMLInputElement>) => {
  try {
    (e.currentTarget as any).showPicker?.();
  } catch {
    // browser support na ho toh default behaviour chalega
  }
};

//  GENERIC LOOKUP HELPERS (roles / designations)

const getItemId = (item: any): string =>
  String(item?.id ?? item?.Id ?? "");

const getItemName = (item: any): string =>
  String(
    item?.name ??
      item?.roleName ??
      item?.designationName ??
      item?.Name ??
      item?.RoleName ??
      item?.DesignationName ??
      ""
  ).trim();

const findIdByName = (items: any[], name: string): string => {
  const normalized = name.trim().toLowerCase();
  if (!normalized) return "";
  const match = items.find(
    (item) => getItemName(item).toLowerCase() === normalized
  );
  return match ? getItemId(match) : "";
};

//  DATE HELPERS

const toIsoDate = (value: string): string => {
  if (!value?.trim()) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
};

// Backend date-time field me "" bhejne se 400 aata hai, isliye fallback = abhi ka time
const isoOrNow = (value: string): string =>
  toIsoDate(value) || new Date().toISOString();

const parseDateRange = (value: string) => {
  const trimmed = (value ?? "").trim();
  const now = new Date().toISOString();

  if (!trimmed) {
    return { fromDate: now, toDate: now, isCurrent: false };
  }

  const isCurrent = /present|current|till date|ongoing/i.test(trimmed);

  // "2022-01-01 - 2025-01-01" / "2022 to 2025" (spaces ke saath)
  let parts = trimmed.split(/\s+(?:-|to|–|—)\s+/i).map((x) => x.trim());

  // "2022-2025" (spaces ke bina, sirf year)
  if (parts.length < 2) {
    const m = trimmed.match(/^(\d{4})\s*(?:-|to|–|—)\s*(\d{4})$/i);
    if (m) parts = [m[1], m[2]];
  }

  if (parts.length >= 2) {
    return {
      fromDate: isoOrNow(parts[0]),
      toDate: isCurrent ? now : isoOrNow(parts[1]),
      isCurrent,
    };
  }

  const single = isoOrNow(trimmed);
  return { fromDate: single, toDate: isCurrent ? now : single, isCurrent };
};

const parseFullName = (value: string) => {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts.shift() || "New",
    lastName: parts.join(" "),
  };
};

// Role detect karne ka logic
const detectRole = (roleName: string, userType: number): UserRole => {
  const lower = roleName.trim().toLowerCase();

  // roleName available ho to pehle usse detect karo
  if (/\badmin\b/.test(lower)) return "Admin";
  if (/\baccountant\b/.test(lower)) return "Accountant";
  if (/\bhr\b/.test(lower) || lower.includes("human resource")) return "HR";
  if (/\bemployee\b/.test(lower)) return "Employee";

  // roleName na mile to userType se detect karo
  if (userType === 0) return "Admin";
  if (userType === 1) return "HR";
  if (userType === 2) return "Employee";
  if (userType === 3) return "Accountant";

  return "Employee";
};
const mapApiUserToItem = (raw: any): UserItem => {
  const firstName = String(raw?.firstName ?? raw?.FirstName ?? "");
  const lastName = String(raw?.lastName ?? raw?.LastName ?? "");
  const name =
    `${firstName} ${lastName}`.trim() ||
    String(raw?.userName ?? raw?.UserName ?? raw?.name ?? raw?.Name ?? "User");
  const userStatus = Number(raw?.userStatus ?? raw?.UserStatus ?? 1);
  const userType = Number(raw?.userType ?? raw?.UserType ?? 0);
  const roleName = String(
    raw?.roleName ??
      raw?.RoleName ??
      raw?.role?.roleName ??
      raw?.role?.name ??
      raw?.Role?.roleName ??
      raw?.Role?.name ??
      ""
  );
  const designationName = String(
    raw?.designationName ??
      raw?.DesignationName ??
      raw?.designation?.designationName ??
      raw?.designation?.name ??
      raw?.Designation?.designationName ??
      raw?.Designation?.name ??
      ""
  );

  const createdRaw = raw?.createdAt ?? raw?.CreatedAt ?? "";
  const createdDateObj = createdRaw ? new Date(createdRaw) : null;
  const validCreated =
    createdDateObj && !Number.isNaN(createdDateObj.getTime());

  return {
    id: String(raw?.id ?? raw?.Id ?? ""),
    firstName,
    lastName,
    username: String(raw?.userName ?? raw?.UserName ?? ""),
    name,
    email: String(raw?.email ?? raw?.Email ?? ""),
    phone: String(
      raw?.phoneNumber ?? raw?.PhoneNumber ?? raw?.phone ?? raw?.Phone ?? ""
    ),
    company: String(raw?.company ?? raw?.Company ?? "Adequate"),
    department: String(
      raw?.departmentName ??
        raw?.DepartmentName ??
        raw?.department?.departmentName ??
        raw?.department?.name ??
        raw?.Department?.departmentName ??
        raw?.Department?.name ??
        ""
    ),
    designation: designationName,
    about: String(raw?.about ?? raw?.About ?? ""),
    createdDate: validCreated
      ? createdDateObj!.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "",
    createdAtRaw: validCreated ? createdDateObj!.toISOString() : "",
    role: detectRole(roleName, userType),
    status: userStatus === 0 ? "Inactive" : "Active",
    roleId: String(
      raw?.roleId ?? raw?.RoleId ?? raw?.role?.id ?? raw?.Role?.id ?? ""
    ),
    designationId: String(
      raw?.designationId ??
        raw?.DesignationId ??
        raw?.designation?.id ??
        raw?.Designation?.id ??
        ""
    ),
    userType,
    userStatus,
    apiUser: raw as UserApiModel,
  };
};

const formatDateOnly = (value: any) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toISOString().slice(0, 10);
};

const formatDateRange = (from: any, to: any) => {
  const start = formatDateOnly(from);
  const end = formatDateOnly(to);
  if (start && end) return `${start} - ${end}`;
  return start || end || "";
};

const mapUserToApplicationForm = (
  user: UserItem,
  raw: any = {}
): ApplicationForm => {
  const educationSource = Array.isArray(raw?.educations) ? raw.educations : [];
  const referenceSource = Array.isArray(raw?.references) ? raw.references : [];
  const experienceSource = Array.isArray(raw?.experiences)
    ? raw.experiences
    : [];

  const blank = createEmptyApplicationForm();

  return {
    fullName: user.name,
    password: "",
    confirmPassword: "",
    country: String(raw?.country ?? raw?.Country ?? "India"),
    address: String(raw?.address ?? raw?.Address ?? ""),
    city: String(raw?.city ?? raw?.City ?? ""),
    state: String(raw?.state ?? raw?.State ?? ""),
    zip: String(
      raw?.postalCode ?? raw?.PostalCode ?? raw?.zip ?? raw?.Zip ?? ""
    ),
    phoneNumber: user.phone,
    emailAddress: user.email,
    eligibleToWork: raw?.isLegallyEligibleToWork === false ? "No" : "Yes",
    veteran: raw?.isVeteran === true ? "Yes" : "No",
    convicted: raw?.isWillingForBackgroundCheck === true ? "Yes" : "No",
    positionDesired: user.designation,
    designationId: String(
      raw?.designationId ?? raw?.DesignationId ?? user.designationId ?? ""
    ),
    availableStartDate: formatDateOnly(
      raw?.availableStartDate ?? raw?.AvailableStartDate
    ),
    desiredPay: raw?.desiredPay != null ? String(raw.desiredPay) : "",
    employmentType: raw?.isFullTimeDesired
      ? "Full time"
      : raw?.isPartTimeDesired
      ? "Part time"
      : raw?.isSeasonalOrTemporaryDesired
      ? "Seasonal/Temporary"
      : "",
    education: educationSource.length
      ? educationSource.map((row: any) => ({
          schoolName: String(row?.institutionName ?? row?.schoolName ?? ""),
          location: String(row?.location ?? ""),
          yearsAttended: formatDateRange(
            row?.startDate ?? row?.fromDate,
            row?.endDate ?? row?.toDate
          ),
          degreeReceived: String(
            row?.degreeOrCourse ?? row?.degreeReceived ?? ""
          ),
          major: String(row?.specialization ?? row?.major ?? ""),
        }))
      : blank.education,
    references: referenceSource.length
      ? referenceSource.map((row: any) => ({
          name: String(row?.name ?? ""),
          title: String(row?.title ?? ""),
          company: String(row?.company ?? ""),
          phone: String(row?.phoneNumber ?? row?.phone ?? ""),
        }))
      : blank.references,
    employmentHistory: experienceSource.length
      ? experienceSource.map((row: any) => ({
          employer: String(row?.companyName ?? row?.employer ?? ""),
          jobTitle: String(row?.jobTitle ?? ""),
          datesEmployed: formatDateRange(
            row?.fromDate ?? row?.startDate,
            row?.toDate ?? row?.endDate
          ),
          workPhone: String(row?.workPhone ?? ""),
          startingPayRate:
            row?.startingPayRate != null ? String(row.startingPayRate) : "",
          endingPayRate:
            row?.endingPayRate != null ? String(row.endingPayRate) : "",
          address: String(row?.address ?? ""),
          city: String(row?.city ?? ""),
          state: String(row?.state ?? ""),
          zip: String(row?.postalCode ?? row?.zip ?? ""),
        }))
      : blank.employmentHistory,
  };
};

//  COMPONENT

const Users: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);

  const [search, setSearch] = useState("");

  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("");

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);

  //  PAGE STATE

  const [showAddPage, setShowAddPage] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<SelectedRole | null>(null);

  //  MODALS

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  //  APPLICATION FORM

  const [applicationForm, setApplicationForm] = useState<ApplicationForm>(
    createEmptyApplicationForm()
  );

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [roles, setRoles] = useState<any[]>([]);
  const [apiDesignations, setApiDesignations] = useState<any[]>([]);

  //  Admin / Accountant => only Personal Information + Position
  const isShortForm = selectedRole === "Admin" || selectedRole === "Accountant";

  //  Designation dropdown options (API se, fallback static)
  const designationOptions = useMemo(
    () =>
      apiDesignations
        .map((item) => ({ id: getItemId(item), name: getItemName(item) }))
        .filter((item) => item.id && item.name),
    [apiDesignations]
  );
  const useApiDesignations = designationOptions.length > 0;

  //  LOAD USERS

  const loadUsers = async (isMounted: () => boolean = () => true) => {
    setLoadingUsers(true);
    try {
      const response = await getUsers({ PageNumber: 1, PageSize: 100 });
      const rows = unwrapApiArray(response);
      if (isMounted()) {
        setUsers(rows.map(mapApiUserToItem).filter((item) => item.id));
        setApiError("");
      }
    } catch (error) {
      if (isMounted()) {
        setApiError(
          error instanceof Error ? error.message : "Unable to load users."
        );
      }
    } finally {
      if (isMounted()) setLoadingUsers(false);
    }
  };

  //  LOAD USERS / ROLES / DESIGNATIONS (on mount)

  useEffect(() => {
    let mounted = true;

    const loadLookups = async () => {
      try {
        const [roleResponse, designationResponse] = await Promise.all([
          getRoles({ PageNumber: 1, PageSize: 100 }),
          getDesignations({ PageNumber: 1, PageSize: 100 }),
        ]);
        if (!mounted) return;
        setRoles(unwrapApiArray(roleResponse));
        setApiDesignations(unwrapApiArray(designationResponse));
      } catch {
        // lookups fail ho jaye toh form fallback list use karega
      }
    };

    void loadUsers(() => mounted);
    void loadLookups();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //  FILTER / SEARCH / SORT

  const filteredUsers = useMemo(() => {
    let result = [...users];

    if (search.trim()) {
      const q = search.trim().toLowerCase();

      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.email.toLowerCase().includes(q) ||
          item.role.toLowerCase().includes(q) ||
          item.status.toLowerCase().includes(q) ||
          item.department.toLowerCase().includes(q) ||
          item.designation.toLowerCase().includes(q)
      );
    }

    if (roleFilter) {
      result = result.filter((item) => item.role === roleFilter);
    }

    if (statusFilter) {
      result = result.filter((item) => item.status === statusFilter);
    }

    if (dateFrom) {
      const from = new Date(`${dateFrom}T00:00:00`).getTime();
      result = result.filter((item) => {
        if (!item.createdAtRaw) return false;
        return new Date(item.createdAtRaw).getTime() >= from;
      });
    }

    if (dateTo) {
      const to = new Date(`${dateTo}T23:59:59.999`).getTime();
      result = result.filter((item) => {
        if (!item.createdAtRaw) return false;
        return new Date(item.createdAtRaw).getTime() <= to;
      });
    }

    if (sortBy === "Last 7 Days" || sortBy === "Last Month") {
      const days = sortBy === "Last 7 Days" ? 7 : 30;
      const limit = Date.now() - days * 24 * 60 * 60 * 1000;

      result = result.filter((item) => {
        if (!item.createdAtRaw) return false;
        return new Date(item.createdAtRaw).getTime() >= limit;
      });
    }

    if (sortBy === "Ascending") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (sortBy === "Descending") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }

    if (sortBy === "Recently Added") {
      result.sort((a, b) => {
        const aTime = a.createdAtRaw ? new Date(a.createdAtRaw).getTime() : 0;
        const bTime = b.createdAtRaw ? new Date(b.createdAtRaw).getTime() : 0;
        if (aTime !== bTime) return bTime - aTime;
        return b.id.localeCompare(a.id, undefined, { numeric: true });
      });
    }

    return result;
  }, [users, search, roleFilter, statusFilter, sortBy, dateFrom, dateTo]);

  //  PAGINATION

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / rowsPerPage));

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const visibleUsers = filteredUsers.slice(
    (safeCurrentPage - 1) * rowsPerPage,
    safeCurrentPage * rowsPerPage
  );

  //  CHECKBOX

  const allVisibleSelected =
    visibleUsers.length > 0 &&
    visibleUsers.every((item) => selected.includes(item.id));

  const handleSelectAll = () => {
    const ids = visibleUsers.map((item) => item.id);

    if (allVisibleSelected) {
      setSelected((prev) => prev.filter((id) => !ids.includes(id)));
    } else {

      
            setSelected((prev) => [...new Set([...prev, ...ids])]);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  //  OPEN ADD USER PAGE

  const openAddPage = () => {
    setApiError("");
    setShowRoleModal(true);
  };

  const handleRoleSelect = (role: SelectedRole) => {
    setEditingUser(null);
    setSelectedRole(role);
    setShowRoleModal(false);
    setApplicationForm(createEmptyApplicationForm());
    setShowAddPage(true);
  };

  const closeRoleModal = () => {
    setShowRoleModal(false);
  };

  const closeAddPage = () => {
    setShowAddPage(false);
    setSelectedRole(null);
    setEditingUser(null);
    setApplicationForm(createEmptyApplicationForm());
    setApiError("");
  };

  //  APPLICATION FORM UPDATE

  function updateApplicationField<K extends keyof ApplicationForm>(
    field: K,
    value: ApplicationForm[K]
  ) {
    setApplicationForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  const handleDesignationChange = (value: string) => {
    if (useApiDesignations) {
      const match = designationOptions.find((item) => item.id === value);
      setApplicationForm((prev) => ({
        ...prev,
        designationId: match?.id ?? "",
        positionDesired: match?.name ?? "",
      }));
    } else {
      setApplicationForm((prev) => ({
        ...prev,
        designationId: "",
        positionDesired: value,
      }));
    }
  };

  //  EDUCATION

  const updateEducation = (
    index: number,
    field: keyof EducationRow,
    value: string
  ) => {
    setApplicationForm((prev) => {
      const education = [...prev.education];
      education[index] = { ...education[index], [field]: value };
      return { ...prev, education };
    });
  };

  const addEducationRow = () => {
    setApplicationForm((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          schoolName: "",
          location: "",
          yearsAttended: "",
          degreeReceived: "",
          major: "",
        },
      ],
    }));
  };

  const removeEducationRow = (index: number) => {
    setApplicationForm((prev) => ({
      ...prev,
      education:
        prev.education.length > 1
          ? prev.education.filter((_, i) => i !== index)
          : prev.education,
    }));
  };

  //  REFERENCES

  const updateReference = (
    index: number,
    field: keyof ReferenceRow,
    value: string
  ) => {
    setApplicationForm((prev) => {
      const references = [...prev.references];
      references[index] = { ...references[index], [field]: value };
      return { ...prev, references };
    });
  };

  const addReferenceRow = () => {
    setApplicationForm((prev) => ({
      ...prev,
      references: [
        ...prev.references,
        { name: "", title: "", company: "", phone: "" },
      ],
    }));
  };

  const removeReferenceRow = (index: number) => {
    setApplicationForm((prev) => ({
      ...prev,
      references:
        prev.references.length > 1
          ? prev.references.filter((_, i) => i !== index)
          : prev.references,
    }));
  };

  //  EMPLOYMENT

  const updateEmployment = (
    index: number,
    field: keyof EmploymentRow,
    value: string
  ) => {
    setApplicationForm((prev) => {
      const employmentHistory = [...prev.employmentHistory];
      employmentHistory[index] = {
        ...employmentHistory[index],
        [field]: value,
      };
      return { ...prev, employmentHistory };
    });
  };

  const addEmploymentRow = () => {
    setApplicationForm((prev) => ({
      ...prev,
      employmentHistory: [
        ...prev.employmentHistory,
        {
          employer: "",
          jobTitle: "",
          datesEmployed: "",
          workPhone: "",
          startingPayRate: "",
          endingPayRate: "",
          address: "",
          city: "",
          state: "",
          zip: "",
        },
      ],
    }));
  };

  const removeEmploymentRow = (index: number) => {
    setApplicationForm((prev) => ({
      ...prev,
      employmentHistory:
        prev.employmentHistory.length > 1
          ? prev.employmentHistory.filter((_, i) => i !== index)
          : prev.employmentHistory,
    }));
  };

  //  SAVE APPLICATION  (POST /User/add-user  |  PUT /User/update-user/{id})

  const handleApplicationSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setApiError("");

    const { firstName, lastName } = parseFullName(applicationForm.fullName);

    // Designation ID: dropdown se, warna naam se dhoondo, warna edit user ki purani ID
    const designationId =
      applicationForm.designationId ||
      findIdByName(apiDesignations, applicationForm.positionDesired) ||
      String(editingUser?.designationId ?? "");

    // Role ID: edit me user ki purani, warna role name se match
    const selectedRoleName: UserRole = (selectedRole ?? "Employee") as UserRole;
    // const selectedRoleId =
    //   String(editingUser?.roleId ?? "") ||
    //   findIdByName(roles, selectedRoleName) ||
    //   (selectedRoleName === "Employee"
    //     ? findIdByName(roles, "User") || findIdByName(roles, "Staff")
    //     : "");

        console.log("ROLES API DATA:", roles);
console.log("SELECTED ROLE NAME:", selectedRoleName);
// console.log("SELECTED ROLE ID:", selectedRoleId);

    if (!applicationForm.fullName.trim()) {
      setApiError("Full name is required.");
      return;
    }
    if (!applicationForm.emailAddress.trim()) {
      setApiError("Email address is required.");
      return;
    }
    if (!editingUser && !applicationForm.password) {
      setApiError("Password is required.");
      return;
    }
    if (
      applicationForm.password &&
      applicationForm.password !== applicationForm.confirmPassword
    ) {
      setApiError("Password and confirm password do not match.");
      return;
    }
    // if (!selectedRoleId) {
    //   setApiError(
    //     `${selectedRoleName} role ID could not be found. Please check the Roles API (role name must match "${selectedRoleName}").`
    //   );
    //   return;
    // }
    if (!designationId) {
      setApiError("Please select a position (Designation) from the list.");
      return;
    }

    // Admin / Accountant => no education, references, employment history
    const educations = isShortForm
      ? []
      : applicationForm.education
          .filter(
            (row) =>
              row.schoolName.trim() ||
              row.degreeReceived.trim() ||
              row.major.trim()
          )
          .map((row) => {
            const range = parseDateRange(row.yearsAttended);
            return {
              institutionName: row.schoolName.trim(),
              location: row.location.trim(),
              startDate: range.fromDate,
              endDate: range.toDate,
              degreeOrCourse: row.degreeReceived.trim(),
              specialization: row.major.trim(),
            };
          });

    const references = isShortForm
      ? []
      : applicationForm.references
          .filter(
            (row) => row.name.trim() || row.title.trim() || row.company.trim()
          )
          .map((row) => ({
            name: row.name.trim(),
            title: row.title.trim(),
            company: row.company.trim(),
            phoneNumber: row.phone.trim(),
          }));

    const experiences = isShortForm
      ? []
      : applicationForm.employmentHistory
          .filter((row) => row.employer.trim() || row.jobTitle.trim())
          .map((row) => {
            const range = parseDateRange(row.datesEmployed);
            return {
              companyName: row.employer.trim(),
              jobTitle: row.jobTitle.trim(),
              fromDate: range.fromDate,
              toDate: range.toDate,
              isCurrentlyWorking: range.isCurrent,
              workPhone: row.workPhone.trim(),
              startingPayRate: Number(row.startingPayRate) || 0,
              endingPayRate: Number(row.endingPayRate) || 0,
              address: row.address.trim(),
              city: row.city.trim(),
              state: row.state.trim(),
              postalCode: row.zip.trim(),
              description: "",
            };
          });

    const email = applicationForm.emailAddress.trim();

    const payload: AddUserPayload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      // Email unique hota hai, isliye userName = email (name se duplicate error aa sakta hai)
      userName: email,
      email,
      phoneNumber: applicationForm.phoneNumber.trim(),
      password: applicationForm.password,
      confirmPassword: applicationForm.confirmPassword,
    userType:
  selectedRoleName === "Admin"
    ? 0
    : selectedRoleName === "HR"
    ? 1
    : selectedRoleName === "Employee"
    ? 2
      : selectedRoleName === "Accountant"
      ? 3
      : 2,
       roleId: null,
      address: applicationForm.address.trim(),
      city: applicationForm.city.trim(),
      state: applicationForm.state.trim(),
      postalCode: applicationForm.zip.trim(),
      country: applicationForm.country.trim(),
      isLegallyEligibleToWork: applicationForm.eligibleToWork === "Yes",
      isVeteran: applicationForm.veteran === "Yes",
      isWillingForBackgroundCheck: applicationForm.convicted === "Yes",
      designationId,
      availableStartDate: isoOrNow(applicationForm.availableStartDate),
      desiredPay: Number(applicationForm.desiredPay) || 0,
      isFullTimeDesired: applicationForm.employmentType === "Full time",
      isPartTimeDesired: applicationForm.employmentType === "Part time",
      isSeasonalOrTemporaryDesired:
        applicationForm.employmentType === "Seasonal/Temporary",
      educations,
      references,
      experiences,
      permissions: [],
    };

    setSaving(true);

    try {
      if (editingUser) {
        const raw: any = editingUser.apiUser ?? {};

        // Edit me username change na karo (purana hi bhejo)
        const updatePayload: UpdateUserPayload = {
          ...payload,
          id: editingUser.id,
          userName: editingUser.username || payload.userName,
          password: applicationForm.password || "",
          confirmPassword: applicationForm.confirmPassword || "",
          userStatus:
            editingUser.userStatus ?? (editingUser.status === "Active" ? 1 : 0),
          permissions: Array.isArray(raw.permissions) ? raw.permissions : [],
        };

        await updateUser(editingUser.id, updatePayload);
      } else {
        const response = await addUser(payload);
        // response se naya user mil jaye toh list me turant dikhao
        const createdRaw = unwrapApiValue(response);
        const created =
          createdRaw && typeof createdRaw === "object" && !Array.isArray(createdRaw)
            ? mapApiUserToItem(createdRaw)
            : null;

        if (created?.id) {
          setUsers((prev) => [...prev, { ...created, role: selectedRoleName }]);
        }
      }

      // Server se fresh list lao taaki list hamesha API ke saath sync rahe
      await loadUsers();
      closeAddPage();
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : editingUser
          ? "Unable to update user."
          : "Unable to create user."
      );
    } finally {
      setSaving(false);
    }
  };

  //  EDIT USER -> GET /User/get-user-by-id/{id}

  const openEditModal = async (user: UserItem) => {
    setApiError("");
    setEditingUser(user);
    setSelectedRole(user.role);
    setApplicationForm(mapUserToApplicationForm(user, user.apiUser ?? {}));
    setShowAddPage(true);

    try {
      const response = await getUserById(user.id);
      const raw = unwrapApiValue(response);
      if (raw && typeof raw === "object" && !Array.isArray(raw)) {
        const mapped = mapApiUserToItem(raw);

        // List me jo role dikh raha tha wahi rakho
        const freshUser: UserItem = {
          ...mapped,
          role: user.role,
          roleId: mapped.roleId || user.roleId,
          designation: mapped.designation || user.designation,
          designationId: mapped.designationId || user.designationId,
          username: mapped.username || user.username,
          createdDate: mapped.createdDate || user.createdDate,
          createdAtRaw: mapped.createdAtRaw || user.createdAtRaw,
        };

        // Designation name detail me na aaye toh lookup list se nikaalo
        if (!freshUser.designation && freshUser.designationId) {
          const found = designationOptions.find(
            (d) => d.id === freshUser.designationId
          );
          if (found) freshUser.designation = found.name;
        }

        setEditingUser(freshUser);
        setSelectedRole(freshUser.role);
        setApplicationForm(mapUserToApplicationForm(freshUser, raw));
        setUsers((prev) =>
          prev.map((item) => (item.id === freshUser.id ? freshUser : item))
        );
      }
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : "Unable to load user details."
      );
    }
  };

  //  DELETE -> DELETE /User/delete-user/{id}

  const openDeleteModal = (id: string) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteId(null);
    setDeleteOpen(false);
  };

  const handleDelete = async () => {
    if (deleteId === null || deleting) return;
    setApiError("");
    setDeleting(true);

    try {
      await deleteUser(deleteId);
      setUsers((prev) => prev.filter((item) => item.id !== deleteId));
      setSelected((prev) => prev.filter((id) => id !== deleteId));
      closeDeleteModal();
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : "Unable to delete user."
      );
      closeDeleteModal();
    } finally {
      setDeleting(false);
    }
  };

  //  Filter dropdown change helper

  const handleFilterChange =
    (setter: (v: string) => void) =>
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      setter(value === ALL_VALUE ? "" : value);
      setCurrentPage(1);
    };

  //  ADD / EDIT USER APPLICATION PAGE

  if (showAddPage) {
    return (
      <>
        <style>
          {`
          * {
            box-sizing: border-box;
          }

          :root {
            --ochre: #c49332;
            --ochre-dark: #ae812b;
            --ochre-light: #fbf6e9;
            --navy: #14213d;
            --text: #3d4758;
            --muted: #687386;
            --border: #d9dee5;
            --soft-bg: #f7f8fa;
          }

          .application-page {
            width: 100%;
            min-height: calc(100vh - 50px);
            padding: 28px 28px 40px;
            background: #f7f8fa;
            color: var(--navy);
            font-family: "Inter", "Segoe UI", Arial, sans-serif;
          }

          .application-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            margin-bottom: 22px;
          }

          .application-heading-wrapper {
            display: flex;
            align-items: flex-start;
            gap: 14px;
          }

          .application-heading-icon {
            width: 44px;
            height: 44px;
            flex: 0 0 44px;
            border-radius: 11px;
            background: var(--ochre-light);
            color: var(--ochre);
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .application-heading {
            margin: 0;
            color: #14213d;
            font-size: 28px;
            line-height: 1.2;
            font-weight: 750;
            letter-spacing: -0.3px;
          }

          .application-subtitle {
            margin: 5px 0 0;
            color: #778196;
            font-size: 14px;
            line-height: 1.5;
          }

          .application-breadcrumb {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 7px;
            color: #7b8595;
            font-size: 13px;
          }

          .application-breadcrumb a {
            color: var(--ochre);
            text-decoration: none;
          }

          .application-back-btn {
            min-height: 42px;
            padding: 0 16px;
            border: 1px solid #d9dee5;
            border-radius: 8px;
            background: #fff;
            color: #26344d;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            display: inline-flex;
            align-items: center;
            gap: 7px;
            transition: .2s ease;
          }

          .application-back-btn:hover {
            border-color: var(--ochre);
            color: var(--ochre-dark);
            background: #fffdf8;
          }

          .application-card {
            width: 100%;
            border: 1px solid #dfe3e8;
            border-radius: 12px;
            background: #fff;
            overflow: hidden;
            box-shadow: 0 4px 18px rgba(20, 33, 61, .045);
          }

          .application-form {
            width: 100%;
          }

          .application-section {
            padding: 22px 20px 26px;
          }

          .application-section + .application-section {
            border-top: 1px solid #e3e7eb;
          }

          .application-section-title {
            min-height: 46px;
            margin: 0 0 18px;
            padding: 0 16px;
            display: flex;
            align-items: center;
            gap: 10px;
            border-radius: 8px;
            background: var(--ochre);
            color: #fff;
            font-size: 17px;
            font-weight: 700;
            letter-spacing: .1px;
            box-shadow: 0 3px 8px rgba(196, 147, 50, .15);
          }

          .application-section-title::before {
            content: "";
            width: 4px;
            height: 20px;
            border-radius: 4px;
            background: rgba(255,255,255,.85);
          }

          .application-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            table-layout: fixed;
            overflow: hidden;
            border: 1px solid var(--border);
            border-radius: 8px;
          }

          .application-table th,
          .application-table td {
            border-right: 1px solid var(--border);
            border-bottom: 1px solid var(--border);
          }

          .application-table tr:last-child td,
          .application-table tr:last-child th {
            border-bottom: 0;
          }

          .application-table th:last-child,
          .application-table td:last-child {
            border-right: 0;
          }

          .application-table th {
            height: 35px;
            padding: 7px 10px;
            background: #f8f9fb;
            color: #5c6675;
            font-size: 12px;
            font-weight: 650;
            text-align: left;
          }

          .application-table td {
            height: 46px;
            padding: 0;
            background: #fff;
          }

          .application-table input,
          .application-table select {
            width: 100%;
            height: 45px;
            padding: 7px 11px;
            border: 0;
            outline: none;
            background: transparent;
            color: #26344d;
            font-family: inherit;
            font-size: 13px;
          }

          .application-table input::placeholder {
            color: #a0a8b5;
          }

          .application-table input:focus,
          .application-table select:focus {
            background: #fffdf7;
            box-shadow: inset 0 0 0 1.5px var(--ochre);
          }

          .personal-input {
            height: 45px !important;
          }

          .question-cell {
            padding: 10px 12px !important;
            height: 65px !important;
          }

          .question-text {
            display: block;
            margin-bottom: 8px;
            color: #5c6675;
            font-size: 12px;
            line-height: 1.35;
            font-weight: 500;
          }

          .radio-group {
            display: flex;
            align-items: center;
            gap: 20px;
          }

          .radio-option {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            color: #4f5967;
            font-size: 12px;
            cursor: pointer;
          }

          .radio-option input {
            width: 14px;
            height: 14px;
            margin: 0;
            accent-color: var(--ochre);
          }

          .position-grid {
            display: grid;
            grid-template-columns: 1.7fr 1fr 1fr;
            border: 1px solid var(--border);
            border-radius: 8px 8px 0 0;
            overflow: hidden;
          }

          .position-field {
            min-height: 82px;
            border-right: 1px solid var(--border);
            background: #fff;
          }

          .position-field:last-child {
            border-right: 0;
          }

          .position-label {
            height: 34px;
            padding: 10px 11px 4px;
            color: #5c6675;
            font-size: 12px;
            font-weight: 600;
          }

          .position-field input,
          .position-field select {
            width: 100%;
            height: 46px;
            padding: 0 11px;
            border: 0;
            outline: none;
            color: #26344d;
            background: transparent;
            font-family: inherit;
            font-size: 13px;
          }

          .position-field select {
            cursor: pointer;
          }

          .position-field input:focus,
          .position-field select:focus {
            background: #fffdf7;
            box-shadow: inset 0 0 0 1.5px var(--ochre);
          }

          .employment-type-row {
            min-height: 58px;
            padding: 12px 13px;
            border-right: 1px solid var(--border);
            border-bottom: 1px solid var(--border);
            border-left: 1px solid var(--border);
            border-radius: 0 0 8px 8px;
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 22px;
            background: #fbfcfd;
          }

          .employment-type-title {
            color: #4d5869;
            font-size: 12px;
            font-weight: 650;
            margin-right: 5px;
          }

          .employment-checkbox {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            color: #596270;
            font-size: 12px;
            cursor: pointer;
          }

          .employment-checkbox input {
            width: 14px;
            height: 14px;
            margin: 0;
            accent-color: var(--ochre);
          }

          .education-actions,
          .reference-actions,
          .employment-actions {
            display: flex;
            justify-content: flex-end;
            margin-top: 11px;
          }

          .small-add-btn {
            min-height: 35px;
            padding: 0 13px;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            border: 1px solid #d7dde4;
            border-radius: 7px;
            background: #fff;
            color: #4d5969;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
            transition: .2s ease;
          }

          .small-add-btn:hover {
            border-color: var(--ochre);
            background: var(--ochre-light);
            color: var(--ochre-dark);
          }

          .row-delete-btn {
            width: 29px;
            height: 29px;
            padding: 0;
            border: 1px solid #f2d5d5;
            border-radius: 6px;
            background: #fff5f5;
            color: #dc3545;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: .2s ease;
          }

          .row-delete-btn:hover {
            border-color: #dc3545;
            background: #ffe9e9;
          }

          .table-with-actions {
            width: 100%;
            overflow-x: auto;
            border-radius: 8px;
          }

          .table-with-actions .application-table {
            min-width: 850px;
          }

          .reference-table th:last-child,
          .reference-table td:last-child {
            width: 52px;
            min-width: 52px;
            text-align: center;
          }

          .reference-table td:last-child {
            padding: 7px;
          }

          .employment-wrapper {
            width: 100%;
            max-width: 100%;
            overflow-x: auto;
            overflow-y: hidden;
            border-radius: 8px;
          }

          .employment-table {
            width: 100%;
            min-width: 1050px;
            table-layout: fixed;
          }

          .employment-table th {
            height: 40px;
            font-size: 12px;
          }

          .employment-table td {
            height: 46px;
          }

          .employment-table th:nth-child(1) { width: 20%; }
          .employment-table th:nth-child(2) { width: 17%; }
          .employment-table th:nth-child(3) { width: 15%; }
          .employment-table th:nth-child(4) { width: 13%; }
          .employment-table th:nth-child(5) { width: 13%; }
          .employment-table th:nth-child(6) { width: 13%; }

          .employment-table th:last-child,
          .employment-table td:last-child {
            width: 55px;
            min-width: 55px;
            max-width: 55px;
            text-align: center;
          }

          .employment-table td:last-child {
            padding: 7px !important;
          }

          .employment-table td:last-child .row-delete-btn {
            margin: 0 auto;
          }

          .application-footer {
            min-height: 78px;
            padding: 17px 24px;
            border-top: 1px solid #dde2e7;
            background: #fff;
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 11px;
          }

          .application-cancel,
          .application-save {
            min-height: 42px;
            padding: 0 21px;
            border-radius: 8px;
            cursor: pointer;
            font-family: inherit;
            font-size: 13px;
            font-weight: 600;
            transition: .2s ease;
          }

          .application-cancel {
            border: 1px solid #d8dee5;
            background: #fff;
            color: #384458;
          }

          .application-cancel:hover {
            background: #f6f7f8;
            border-color: #cbd2da;
          }

          .application-save {
            border: 1px solid var(--ochre);
            background: var(--ochre);
            color: #fff;
            box-shadow: 0 4px 10px rgba(196, 147, 50, .2);
          }

          .application-save:hover {
            background: var(--ochre-dark);
            border-color: var(--ochre-dark);
            transform: translateY(-1px);
          }

          .application-save:disabled,
          .application-cancel:disabled {
            opacity: .6;
            cursor: not-allowed;
            transform: none;
          }

          @media(max-width: 900px) {
            .application-page {
              padding: 22px 16px 30px;
            }

            .application-top {
              align-items: flex-start;
            }

            .position-grid {
              grid-template-columns: 1fr;
            }

            .position-field {
              border-right: 0;
              border-bottom: 1px solid var(--border);
            }

            .position-field:last-child {
              border-bottom: 0;
            }

            .employment-type-row {
              gap: 12px 18px;
            }
          }

          @media(max-width: 650px) {
            .application-page {
              padding: 18px 10px 25px;
            }

            .application-top {
              flex-direction: column;
            }

            .application-heading-wrapper {
              width: 100%;
            }

            .application-heading {
              font-size: 23px;
            }

            .application-back-btn {
              align-self: flex-start;
            }

            .application-section {
              padding: 16px 12px 21px;
            }

            .application-section-title {
              font-size: 15px;
            }

            .application-footer {
              padding: 13px 14px;
            }

            .application-cancel,
            .application-save {
              flex: 1;
            }
          }
          `}
        </style>

        <div className="application-page">
          {/* PAGE HEADER */}

          <div className="application-top">
            <div className="application-heading-wrapper">
              <div className="application-heading-icon">
                <UserRound size={23} />
              </div>

              <div>
                <h1 className="application-heading">
                  {editingUser
                    ? `Edit ${selectedRole ?? "User"}`
                    : selectedRole
                    ? `Add New ${selectedRole}`
                    : "Add New User"}
                </h1>

                <p className="application-subtitle">
                  {isShortForm
                    ? editingUser
                      ? "Update personal information and position details."
                      : "Add personal information and position details."
                    : editingUser
                    ? "Update employee information, education, references and employment history."
                    : "Add employee information, education, references and employment history."}
                </p>

                <div className="application-breadcrumb" />
              </div>
            </div>

            <button
              type="button"
              className="application-back-btn"
              onClick={closeAddPage}
            >
              <ChevronLeft size={16} />
              Back to Users
            </button>
          </div>

          {/* APPLICATION CARD */}

          <div className="application-card">
            <form className="application-form" onSubmit={handleApplicationSubmit}>
              {/* PERSONAL INFORMATION */}

              <section className="application-section">
                <h2 className="application-section-title">
                  <UserRound size={18} />
                  Personal Information
                </h2>

                <table className="application-table">
                  <tbody>
                    <tr>
                      <th colSpan={2}>Name</th>
                      <th>Address</th>
                      <th>City</th>
                      <th>State</th>
                    </tr>

                    <tr>
                      <td colSpan={2}>
                        <input
                          className="personal-input"
                          type="text"
                          placeholder="Full name"
                          value={applicationForm.fullName}
                          onChange={(e) =>
                            updateApplicationField("fullName", e.target.value)
                          }
                        />
                      </td>

                      <td>
                        <input
                          type="text"
                          placeholder="Address"
                          value={applicationForm.address}
                          onChange={(e) =>
                            updateApplicationField("address", e.target.value)
                          }
                        />
                      </td>

                      <td>
                        <input
                          type="text"
                          placeholder="City"
                          value={applicationForm.city}
                          onChange={(e) =>
                            updateApplicationField("city", e.target.value)
                          }
                        />
                      </td>

                      <td>
                        <input
                          type="text"
                          placeholder="State"
                          value={applicationForm.state}
                          onChange={(e) =>
                            updateApplicationField("state", e.target.value)
                          }
                        />
                      </td>
                    </tr>

                    <tr>
                      <th>Zip</th>
                      <th>Phone number</th>
                      <th colSpan={2}>Email address</th>
                      <th>Country</th>
                    </tr>

                    <tr>
                      <td>
                        <input
                          type="text"
                          placeholder="Zip code"
                          value={applicationForm.zip}
                          onChange={(e) =>
                            updateApplicationField("zip", e.target.value)
                          }
                        />
                      </td>

                      <td>
                        <input
                          type="text"
                          placeholder="Phone number"
                          value={applicationForm.phoneNumber}
                          onChange={(e) =>
                            updateApplicationField("phoneNumber", e.target.value)
                          }
                        />
                      </td>

                      <td colSpan={2}>
                        <input
                          type="email"
                          placeholder="Email address"
                          value={applicationForm.emailAddress}
                          onChange={(e) =>
                            updateApplicationField("emailAddress", e.target.value)
                          }
                        />
                      </td>

                      <td>
                        <input
                          type="text"
                          value={applicationForm.country}
                          onChange={(e) =>
                            updateApplicationField("country", e.target.value)
                          }
                        />
                      </td>
                    </tr>

                    <tr>
                      <th>Password</th>
                      <th>Confirm Password</th>
                      <th colSpan={3}>Login credentials</th>
                    </tr>

                    <tr>
                      <td>
                        <input
                          type="password"
                          placeholder={
                            editingUser ? "Leave blank to keep" : "Password"
                          }
                          autoComplete="new-password"
                          value={applicationForm.password}
                          onChange={(e) =>
                            updateApplicationField("password", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="password"
                          placeholder="Confirm password"
                          autoComplete="new-password"
                          value={applicationForm.confirmPassword}
                          onChange={(e) =>
                            updateApplicationField(
                              "confirmPassword",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td colSpan={3}>
                        <small
                          style={{
                            color: "#687386",
                            padding: "0 11px",
                            display: "block",
                          }}
                        >
                          The selected position is mapped to its Designation ID
                          and the {selectedRole ?? "selected"} role is mapped to
                          its Role ID automatically.
                        </small>
                      </td>
                    </tr>

                    <tr>
                      <td colSpan={2} className="question-cell">
                        <span className="question-text">
                          Are you legally eligible to work in the US?
                        </span>

                        <div className="radio-group">
                          <label className="radio-option">
                            <input
                              type="radio"
                              name="eligible"
                              checked={applicationForm.eligibleToWork === "Yes"}
                              onChange={() =>
                                updateApplicationField("eligibleToWork", "Yes")
                              }
                            />
                            Yes
                          </label>

                          <label className="radio-option">
                            <input
                              type="radio"
                              name="eligible"
                              checked={applicationForm.eligibleToWork === "No"}
                              onChange={() =>
                                updateApplicationField("eligibleToWork", "No")
                              }
                            />
                            No
                          </label>
                        </div>
                      </td>

                      <td className="question-cell">
                        <span className="question-text">Are you a veteran?</span>

                        <div className="radio-group">
                          <label className="radio-option">
                            <input
                              type="radio"
                              name="veteran"
                              checked={applicationForm.veteran === "Yes"}
                              onChange={() =>
                                updateApplicationField("veteran", "Yes")
                              }
                            />
                            Yes
                          </label>

                          <label className="radio-option">
                            <input
                              type="radio"
                              name="veteran"
                              checked={applicationForm.veteran === "No"}
                              onChange={() =>
                                updateApplicationField("veteran", "No")
                              }
                            />
                            No
                          </label>
                        </div>
                      </td>

                      <td colSpan={2} className="question-cell">
                        <span className="question-text">
                          If selected for employment are you willing to be
                          subject to a background check?
                        </span>

                        <div className="radio-group">
                          <label className="radio-option">
                            <input
                              type="radio"
                              name="convicted"
                              checked={applicationForm.convicted === "Yes"}
                              onChange={() =>
                                updateApplicationField("convicted", "Yes")
                              }
                            />
                            Yes
                          </label>

                          <label className="radio-option">
                            <input
                              type="radio"
                              name="convicted"
                              checked={applicationForm.convicted === "No"}
                              onChange={() =>
                                updateApplicationField("convicted", "No")
                              }
                            />
                            No
                          </label>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </section>

              {/* POSITION */}

              <section className="application-section">
                <h2 className="application-section-title">
                  <BriefcaseBusiness size={18} />
                  Position
                </h2>

                <div className="position-grid">
                  <div className="position-field">
                    <div className="position-label">
                      Position you are applying for
                    </div>

                    <select
                      value={
                        useApiDesignations
                          ? applicationForm.designationId
                          : applicationForm.positionDesired
                      }
                      onChange={(e) => handleDesignationChange(e.target.value)}
                    >
                      <option value="">Select Position</option>

                      {useApiDesignations
                        ? designationOptions.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))
                        : fallbackDesignations.map((name) => (
                            <option key={name} value={name}>
                              {name}
                            </option>
                          ))}
                    </select>
                  </div>

                  <div className="position-field">
                    <div className="position-label">Available start date</div>

                    <input
                      type="date"
                      value={applicationForm.availableStartDate}
                      onClick={openCalendar}
                      onChange={(e) =>
                        updateApplicationField(
                          "availableStartDate",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="position-field">
                    <div className="position-label">Desired pay</div>

                    <input
                      type="text"
                      placeholder="Enter desired pay"
                      value={applicationForm.desiredPay}
                      onChange={(e) =>
                        updateApplicationField("desiredPay", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="employment-type-row">
                  <span className="employment-type-title">Employment desired</span>

                  <label className="employment-checkbox">
                    <input
                      type="checkbox"
                      checked={applicationForm.employmentType === "Full time"}
                      onChange={(e) =>
                        updateApplicationField(
                          "employmentType",
                          e.target.checked ? "Full time" : ""
                        )
                      }
                    />
                    Full time
                  </label>

                  <label className="employment-checkbox">
                    <input
                      type="checkbox"
                      checked={applicationForm.employmentType === "Part time"}
                      onChange={(e) =>
                        updateApplicationField(
                          "employmentType",
                          e.target.checked ? "Part time" : ""
                        )
                      }
                    />
                    Part time
                  </label>

                  <label className="employment-checkbox">
                    <input
                      type="checkbox"
                      checked={
                        applicationForm.employmentType === "Seasonal/Temporary"
                      }
                      onChange={(e) =>
                        updateApplicationField(
                          "employmentType",
                          e.target.checked ? "Seasonal/Temporary" : ""
                        )
                      }
                    />
                    Seasonal / Temporary
                  </label>
                </div>
              </section>

              {/* Education / References / Employment History
                  Sirf HR & Employee ke liye. Admin & Accountant ke liye hidden. */}

              {!isShortForm && (
                <>
                  {/* EDUCATION */}

                  <section className="application-section">
                    <h2 className="application-section-title">
                      <GraduationCap size={18} />
                      Education
                    </h2>

                    <div className="table-with-actions">
                      <table className="application-table">
                        <thead>
                          <tr>
                            <th>School name</th>
                            <th>Location</th>
                            <th>Years attended</th>
                            <th>Degree received</th>
                            <th>Major</th>
                            <th style={{ width: "52px" }}>#</th>
                          </tr>
                        </thead>

                        <tbody>
                          {applicationForm.education.map((education, index) => (
                            <tr key={index}>
                              <td>
                                <input
                                  type="text"
                                  placeholder="School name"
                                  value={education.schoolName}
                                  onChange={(e) =>
                                    updateEducation(index, "schoolName", e.target.value)
                                  }
                                />
                              </td>

                              <td>
                                <input
                                  type="text"
                                  placeholder="Location"
                                  value={education.location}
                                  onChange={(e) =>
                                    updateEducation(index, "location", e.target.value)
                                  }
                                />
                              </td>

                              <td>
                                <input
                                  type="text"
                                  placeholder="e.g. 2018 - 2022"
                                  value={education.yearsAttended}
                                  onChange={(e) =>
                                    updateEducation(index, "yearsAttended", e.target.value)
                                  }
                                />
                              </td>

                              <td>
                                <input
                                  type="text"
                                  placeholder="Degree"
                                  value={education.degreeReceived}
                                  onChange={(e) =>
                                    updateEducation(index, "degreeReceived", e.target.value)
                                  }
                                />
                              </td>

                              <td>
                                <input
                                  type="text"
                                  placeholder="Major"
                                  value={education.major}
                                  onChange={(e) =>
                                    updateEducation(index, "major", e.target.value)
                                  }
                                />
                              </td>

                              <td style={{ textAlign: "center", padding: "7px" }}>
                                <button
                                  type="button"
                                  className="row-delete-btn"
                                  onClick={() => removeEducationRow(index)}
                                >
                                  <X size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="education-actions">
                      <button
                        type="button"
                        className="small-add-btn"
                        onClick={addEducationRow}
                      >
                        <Plus size={14} />
                        Add Education
                      </button>
                    </div>
                  </section>

                  {/* REFERENCES */}

                  <section className="application-section">
                    <h2 className="application-section-title">
                      <UsersRound size={18} />
                      References
                    </h2>

                    <div className="table-with-actions">
                      <table className="application-table reference-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Title</th>
                            <th>Company</th>
                            <th>Phone</th>
                            <th>#</th>
                          </tr>
                        </thead>

                        <tbody>
                          {applicationForm.references.map((reference, index) => (
                            <tr key={index}>
                              <td>
                                <input
                                  type="text"
                                  placeholder="Reference name"
                                  value={reference.name}
                                  onChange={(e) =>
                                    updateReference(index, "name", e.target.value)
                                  }
                                />
                              </td>

                              <td>
                                <input
                                  type="text"
                                  placeholder="Title"
                                  value={reference.title}
                                  onChange={(e) =>
                                    updateReference(index, "title", e.target.value)
                                  }
                                />
                              </td>

                              <td>
                                <input
                                  type="text"
                                  placeholder="Company"
                                  value={reference.company}
                                  onChange={(e) =>
                                    updateReference(index, "company", e.target.value)
                                  }
                                />
                              </td>

                              <td>
                                <input
                                  type="text"
                                  placeholder="Phone"
                                  value={reference.phone}
                                  onChange={(e) =>
                                    updateReference(index, "phone", e.target.value)
                                  }
                                />
                              </td>

                              <td>
                                <button
                                  type="button"
                                  className="row-delete-btn"
                                  onClick={() => removeReferenceRow(index)}
                                >
                                  <X size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="reference-actions">
                      <button
                        type="button"
                        className="small-add-btn"
                        onClick={addReferenceRow}
                      >
                        <Plus size={14} />
                        Add Reference
                      </button>
                    </div>
                  </section>

                  {/* EMPLOYMENT HISTORY */}

                  <section className="application-section">
                    <h2 className="application-section-title">
                      <BriefcaseBusiness size={18} />
                      Employment History
                    </h2>

                    <div className="employment-wrapper">
                      <table className="application-table employment-table">
                        <thead>
                          <tr>
                            <th>Employer</th>
                            <th>Job title</th>
                            <th>Dates employed</th>
                            <th>Work phone</th>
                            <th>Starting pay rate</th>
                            <th>Ending pay rate</th>
                            <th>#</th>
                          </tr>
                        </thead>

                        <tbody>
                          {applicationForm.employmentHistory.map(
                            (employment, index) => (
                              <React.Fragment key={index}>
                                <tr>
                                  <td>
                                    <input
                                      type="text"
                                      placeholder="Employer"
                                      value={employment.employer}
                                      onChange={(e) =>
                                        updateEmployment(index, "employer", e.target.value)
                                      }
                                    />
                                  </td>

                                  <td>
                                    <input
                                      type="text"
                                      placeholder="Job title"
                                      value={employment.jobTitle}
                                      onChange={(e) =>
                                        updateEmployment(index, "jobTitle", e.target.value)
                                      }
                                    />
                                  </td>

                                  <td>
                                    <input
                                      type="text"
                                      placeholder="e.g. 2022 - 2025"
                                      value={employment.datesEmployed}
                                      onChange={(e) =>
                                        updateEmployment(index, "datesEmployed", e.target.value)
                                      }
                                    />
                                  </td>

                                  <td>
                                    <input
                                      type="text"
                                      placeholder="Work phone"
                                      value={employment.workPhone}
                                      onChange={(e) =>
                                        updateEmployment(index, "workPhone", e.target.value)
                                      }
                                    />
                                  </td>

                                  <td>
                                    <input
                                      type="text"
                                      placeholder="Starting rate"
                                      value={employment.startingPayRate}
                                      onChange={(e) =>
                                        updateEmployment(index, "startingPayRate", e.target.value)
                                      }
                                    />
                                  </td>

                                  <td>
                                    <input
                                      type="text"
                                      placeholder="Ending rate"
                                      value={employment.endingPayRate}
                                      onChange={(e) =>
                                        updateEmployment(index, "endingPayRate", e.target.value)
                                      }
                                    />
                                  </td>

                                  <td
                                    style={{
                                      width: "55px",
                                      textAlign: "center",
                                      padding: "7px",
                                    }}
                                  >
                                    <button
                                      type="button"
                                      className="row-delete-btn"
                                      onClick={() => removeEmploymentRow(index)}
                                    >
                                      <X size={14} />
                                    </button>
                                  </td>
                                </tr>

                                <tr>
                                  <th>Address</th>
                                  <th>City</th>
                                  <th>State</th>
                                  <th>Zip</th>
                                  <th colSpan={3}>Employment details</th>
                                </tr>

                                <tr>
                                  <td>
                                    <input
                                      type="text"
                                      placeholder="Address"
                                      value={employment.address}
                                      onChange={(e) =>
                                        updateEmployment(index, "address", e.target.value)
                                      }
                                    />
                                  </td>

                                  <td>
                                    <input
                                      type="text"
                                      placeholder="City"
                                      value={employment.city}
                                      onChange={(e) =>
                                        updateEmployment(index, "city", e.target.value)
                                      }
                                    />
                                  </td>

                                  <td>
                                    <input
                                      type="text"
                                      placeholder="State"
                                      value={employment.state}
                                      onChange={(e) =>
                                        updateEmployment(index, "state", e.target.value)
                                      }
                                    />
                                  </td>

                                  <td>
                                    <input
                                      type="text"
                                      placeholder="Zip"
                                      value={employment.zip}
                                      onChange={(e) =>
                                        updateEmployment(index, "zip", e.target.value)
                                      }
                                    />
                                  </td>

                                  <td colSpan={3}>
                                    <small
                                      style={{
                                        color: "#a0a8b5",
                                        padding: "0 11px",
                                        display: "block",
                                        fontSize: "12px",
                                      }}
                                    >
                                      Tip: write "Present" in Dates employed if
                                      currently working here.
                                    </small>
                                  </td>
                                </tr>
                              </React.Fragment>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="employment-actions">
                      <button
                        type="button"
                        className="small-add-btn"
                        onClick={addEmploymentRow}
                      >
                        <Plus size={14} />
                        Add Employment
                      </button>
                    </div>
                  </section>
                </>
              )}

              {/* API ERROR */}

              {apiError && (
                <div
                  style={{
                    margin: "0 20px 16px",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    background: "#fff5f5",
                    border: "1px solid #f2d5d5",
                    color: "#dc3545",
                    fontSize: "13px",
                  }}
                >
                  {apiError}
                </div>
              )}

              {/* FOOTER */}

              <div className="application-footer">
                <button
                  type="button"
                  className="application-cancel"
                  onClick={closeAddPage}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="application-save"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingUser
                    ? "Update User"
                    : "Save User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </>
    );
  }

  //  USERS LIST PAGE

  return (
    <>
      <style>
        {`
        .users-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          padding: 15px;
          background: rgba(15, 25, 42, .48);
          backdrop-filter: blur(2px);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .users-delete-modal {
          width: 400px;
          max-width: calc(100vw - 30px);
          padding: 28px 30px;
          border-radius: 11px;
          background: #fff;
          text-align: center;
          box-shadow: 0 20px 55px rgba(0,0,0,.22);
        }

        .users-delete-icon {
          width: 62px;
          height: 62px;
          margin: 0 auto 15px;
          border-radius: 10px;
          background: #fbe4e4;
          color: #e32929;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .users-delete-modal h3 {
          margin: 0 0 7px;
          color: #1d2b48;
          font-size: 20px;
        }

        .users-delete-modal p {
          max-width: 330px;
          margin: 0 auto 19px;
          color: #596375;
          font-size: 13px;
          line-height: 1.6;
        }

        .users-delete-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .users-delete-cancel,
        .users-delete-confirm {
          min-height: 40px;
          padding: 0 18px;
          border: 0;
          border-radius: 7px;
          font-size: 13px;
          cursor: pointer;
        }

        .users-delete-cancel {
          background: #f4f5f7;
          color: #344054;
        }

        .users-delete-confirm {
          background: #e32929;
          color: #fff;
        }

        .users-delete-confirm:hover {
          background: #c91f1f;
        }

        .users-delete-confirm:disabled,
        .users-delete-cancel:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        .users-page {
          width: 100%;
          min-height: calc(100vh - 50px);
          padding: 24px 25px 25px;
          background: #f8f9fb;
          color: #10203f;
          font-family: "Inter","Segoe UI",sans-serif;
        }

        .users-page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 26px;
        }

        .users-page-title {
          margin: 0 0 5px;
          color: #0f1e3c;
          font-size: 24px;
          line-height: 1.2;
          font-weight: 700;
        }

        .users-breadcrumb {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #677386;
          font-size: 12px;
        }

        .users-breadcrumb a {
          color: #315c75;
          display: inline-flex;
          text-decoration: none;
        }

        .users-api-error {
          margin-bottom: 14px;
          padding: 10px 14px;
          border-radius: 8px;
          background: #fff5f5;
          border: 1px solid #f2d5d5;
          color: #dc3545;
          font-size: 13px;
        }

        .users-role-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 2000;
          padding: 20px;
          background: rgba(15, 27, 49, 0.42);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .users-role-modal {
          width: 460px;
          max-width: calc(100vw - 32px);
          max-height: calc(100vh - 40px);
          overflow-y: auto;
          position: relative;
          padding: 32px 30px 28px;
          border-radius: 10px;
          background: #fff;
          box-shadow: 0 20px 55px rgba(15, 27, 49, 0.22);
          text-align: center;
          animation: usersRoleModalIn 0.16s ease-out;
        }

        @keyframes usersRoleModalIn {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .users-role-modal-close {
          position: absolute;
          top: 13px;
          right: 13px;
          width: 30px;
          height: 30px;
          padding: 0;
          border: 0;
          border-radius: 50%;
          background: #f4f5f7;
          color: #687386;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .users-role-modal-close:hover {
          background: #e9ebef;
          color: #17243d;
        }

        .users-role-modal-icon {
          width: 58px;
          height: 58px;
          margin: 0 auto 16px;
          border-radius: 50%;
          background: #f8efdc;
          color: #c39237;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .users-role-modal h3 {
          margin: 0 0 8px;
          color: #17243d;
          font-size: 20px;
          font-weight: 700;
        }

        .users-role-modal-subtitle {
          margin: 0 auto 22px;
          color: #687386;
          font-size: 13px;
          line-height: 1.6;
        }

        .users-role-options {
          display: flex;
          flex-direction: column;
          gap: 10px;
          text-align: left;
        }

        .users-role-option {
          width: 100%;
          min-height: 68px;
          padding: 10px 14px;
          border: 1px solid #e0e4e9;
          border-radius: 7px;
          background: #fff;
          display: flex;
          align-items: center;
          gap: 13px;
          text-align: left;
          cursor: pointer;
          transition: 0.15s ease;
        }

        .users-role-option:hover {
          border-color: #c39237;
          background: #fffaf1;
        }

        .users-role-option-icon {
          width: 42px;
          height: 42px;
          flex: 0 0 42px;
          border-radius: 6px;
          background: #f7f8fa;
          color: #c39237;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .users-role-option div:last-child {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .users-role-option strong {
          color: #17243d;
          font-size: 14px;
          font-weight: 600;
        }

        .users-role-option span {
          color: #7a8494;
          font-size: 11px;
        }

        .users-role-modal-cancel {
          width: 100%;
          height: 38px;
          margin-top: 18px;
          border: 1px solid #dce1e7;
          border-radius: 5px;
          background: #fff;
          color: #596679;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .users-role-modal-cancel:hover {
          background: #f7f8fa;
        }

        .users-add-btn {
          height: 39px;
          padding: 0 15px;
          border: 0;
          border-radius: 5px;
          background: #c39237;
          color: white;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .users-add-btn:hover {
          background: #b58430;
        }

        .users-card {
          width: 100%;
          overflow: hidden;
          border: 1px solid #dde2e8;
          border-radius: 5px;
          background: #fff;
        }

        .users-card-header {
          min-height: 71px;
          padding: 14px 20px;
          border-bottom: 1px solid #dde2e8;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
        }

        .users-card-header h5 {
          margin: 0;
          color: #0d1c38;
          font-size: 15px;
          font-weight: 600;
        }

        .users-filters {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .users-filter {
          height: 38px;
          padding: 0 11px;
          border: 1px solid #dce1e7;
          border-radius: 5px;
          outline: none;
          background: #fff;
          color: #14213b;
          font-size: 13px;
          cursor: pointer;
        }

        .users-filter:focus {
          border-color: #c39237;
        }

        .users-date-range {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .users-date-range span {
          color: #677386;
          font-size: 12px;
        }

        .users-date-input {
          width: 135px;
          height: 38px;
          padding: 0 8px;
          border: 1px solid #dce1e7;
          border-radius: 5px;
          outline: none;
          background: #fff;
          color: #14213b;
          font-size: 12px;
          font-family: inherit;
          cursor: pointer;
        }

        .users-date-input:focus {
          border-color: #c39237;
        }

        .users-date-clear {
          width: 26px;
          height: 26px;
          padding: 0;
          border: 0;
          border-radius: 50%;
          background: #f4f5f7;
          color: #687386;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .users-date-clear:hover {
          background: #e9ebef;
          color: #17243d;
        }

        .users-role-filter {
          width: 120px;
        }

        .users-status-filter {
          width: 105px;
        }

        .users-sort-filter {
          width: 150px;
        }

        .users-toolbar {
          min-height: 61px;
          padding: 10px 16px;
          border-bottom: 1px solid #e2e5e9;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .users-row-control {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #26354d;
          font-size: 13px;
        }

        .users-row-select {
          width: 49px;
          height: 29px;
          padding: 0 5px;
          border: 1px solid #dce1e7;
          border-radius: 6px;
          outline: none;
          background: #fff;
          font-size: 12px;
        }

        .users-search {
          width: 160px;
          height: 30px;
          padding: 0 14px;
          border: 1px solid #dce1e7;
          border-radius: 5px;
          outline: none;
          background: #fff;
          color: #26344d;
          font-size: 12px;
        }

        .users-search::placeholder {
          color: #8c97a9;
        }

        .users-table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .users-table {
          width: 100%;
          min-width: 950px;
          margin: 0;
          border-collapse: collapse;
        }

        .users-table thead {
          background: #e1e4e9;
        }

        .users-table th {
          height: 43px;
          padding: 0 14px;
          vertical-align: middle;
          color: #06142e;
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
        }

        .users-table td {
          height: 53px;
          padding: 0 14px;
          vertical-align: middle;
          border-bottom: 1px solid #dfe3e8;
          background: #fff;
          color: #596679;
          font-size: 13px;
          white-space: nowrap;
        }

        .users-check-col {
          width: 58px;
          text-align: center;
        }

        .users-checkbox {
          width: 17px;
          height: 17px;
          margin: 0;
          cursor: pointer;
        }

        .users-sort {
          float: right;
          margin-left: 8px;
          color: #cbd1d9;
          font-size: 10px;
        }

        .users-user-cell {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .users-avatar {
          width: 33px;
          height: 33px;
          flex: 0 0 33px;
          position: relative;
          border-radius: 50%;
          background: #d7d7d7;
        }

        .users-avatar::after {
          content: "...";
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #aaa;
          font-size: 8px;
        }

        .users-name {
          color: #06142e;
          font-size: 13px;
          font-weight: 500;
        }

        .users-role-badge {
          min-height: 32px;
          padding: 0 9px;
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 500;
        }

        .users-role-employee {
          background: #ffedf5;
          color: #ff3486;
        }

        .users-role-hr {
          background: #f0ddf3;
          color: #bc46c6;
        }

        .users-role-admin {
          background: #e3f0ff;
          color: #1a73e8;
        }

        .users-role-accountant {
          background: #e0f6ee;
          color: #0f9d6b;
        }

        .users-status {
          height: 19px;
          min-width: 57px;
          padding: 0 7px;
          border-radius: 4px;
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          font-size: 10px;
          line-height: 1;
          font-weight: 600;
        }

        .users-status-active {
          background: #00bd61;
        }

        .users-status-inactive {
          min-width: 64px;
          background: #ef0b0b;
        }

        .users-status-dot {
          width: 4px !important;
          height: 4px !important;
          min-width: 4px !important;
          min-height: 4px !important;
          flex: 0 0 4px !important;
          padding: 0 !important;
          margin: 0 !important;
          border-radius: 50% !important;
          background: #fff !important;
        }

        .users-actions {
          display: inline-flex;
          align-items: center;
          gap: 13px;
        }

        .users-action-btn {
          width: 20px;
          height: 25px;
          padding: 0;
          border: 0;
          background: transparent;
          color: #647286;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .users-action-btn:hover {
          color: #17233f;
        }

        .users-table-footer {
          height: 57px;
          padding: 0 16px;
          border-top: 1px solid #dfe3e8;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #596679;
          font-size: 13px;
        }

        .users-pagination {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .users-page-arrow {
          width: 22px;
          height: 28px;
          padding: 0;
          border: 0;
          background: transparent;
          color: #a2a9b4;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .users-page-arrow:disabled {
          opacity: .4;
          cursor: default;
        }

        .users-current-page {
          width: 27px;
          height: 27px;
          border-radius: 50%;
          background: #c39237;
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }

        @media(max-width:1100px) {
          .users-card-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .users-filters {
            width: 100%;
            flex-wrap: wrap;
          }
        }

        @media(max-width:650px) {
          .users-page {
            padding: 18px 12px;
          }

          .users-toolbar {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }

          .users-search {
            width: 100%;
          }

          .users-filters {
            flex-direction: column;
            align-items: stretch;
          }

          .users-date-range {
            width: 100%;
          }

          .users-date-input {
            flex: 1;
            width: auto;
          }

          .users-role-filter,
          .users-status-filter,
          .users-sort-filter {
            width: 100%;
          }
        }
        `}
      </style>

      <div className="users-page">
        {/* HEADER */}

        <div className="users-page-header">
          <div>
            <h1 className="users-page-title">Users</h1>

            <div className="users-breadcrumb">
              <Link to="/admin/dashboard">
                <i className="ti ti-home" />
              </Link>

              <span>/</span>

              <span>Users</span>
            </div>
          </div>

          <button type="button" className="users-add-btn" onClick={openAddPage}>
            <CirclePlus size={15} />
            Add User
          </button>
        </div>

        {/* API ERROR (list page) */}

        {apiError && <div className="users-api-error">{apiError}</div>}

        {/* ROLE SELECTION MODAL */}

        {showRoleModal && (
          <div
            className="users-role-modal-overlay"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                closeRoleModal();
              }
            }}
          >
            <div
              className="users-role-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="select-user-role-title"
            >
              <button
                type="button"
                className="users-role-modal-close"
                aria-label="Close role selection"
                onClick={closeRoleModal}
              >
                <X size={18} />
              </button>

              <div className="users-role-modal-icon">
                <UserRound size={27} />
              </div>

              <h3 id="select-user-role-title">What role are you selecting?</h3>

              <p className="users-role-modal-subtitle">
                Select a role to continue adding a new user.
              </p>

              <div className="users-role-options">
                <button
                  type="button"
                  className="users-role-option"
                  onClick={() => handleRoleSelect("HR")}
                >
                  <div className="users-role-option-icon">
                    <UsersRound size={22} />
                  </div>

                  <div>
                    <strong>HR</strong>
                    <span>Human Resources</span>
                  </div>
                </button>

                <button
                  type="button"
                  className="users-role-option"
                  onClick={() => handleRoleSelect("Employee")}
                >
                  <div className="users-role-option-icon">
                    <UserRound size={22} />
                  </div>

                  <div>
                    <strong>Employee</strong>
                    <span>Add an employee</span>
                  </div>
                </button>

                <button
                  type="button"
                  className="users-role-option"
                  onClick={() => handleRoleSelect("Admin")}
                >
                  <div className="users-role-option-icon">
                    <Shield size={22} />
                  </div>

                  <div>
                    <strong>Admin</strong>
                    <span>Administrator profile</span>
                  </div>
                </button>

                <button
                  type="button"
                  className="users-role-option"
                  onClick={() => handleRoleSelect("Accountant")}
                >
                  <div className="users-role-option-icon">
                    <BriefcaseBusiness size={22} />
                  </div>

                  <div>
                    <strong>Accountant</strong>
                    <span>Accountant profile</span>
                  </div>
                </button>
              </div>

              <button
                type="button"
                className="users-role-modal-cancel"
                onClick={closeRoleModal}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* USERS CARD */}

        <div className="users-card">
          <div className="users-card-header">
            <h5>Users List</h5>

            <div className="users-filters">
              {/* DATE RANGE */}
              <div className="users-date-range">
                <input
                  type="date"
                  className="users-date-input"
                  title="From date"
                  value={dateFrom}
                  max={dateTo || undefined}
                  onClick={openCalendar}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setCurrentPage(1);
                  }}
                />

                <span>to</span>

                <input
                  type="date"
                  className="users-date-input"
                  title="To date"
                  value={dateTo}
                  min={dateFrom || undefined}
                  onClick={openCalendar}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setCurrentPage(1);
                  }}
                />

                {(dateFrom || dateTo) && (
                  <button
                    type="button"
                    className="users-date-clear"
                    title="Clear dates"
                    onClick={() => {
                      setDateFrom("");
                      setDateTo("");
                      setCurrentPage(1);
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* USER TYPE */}
              <select
                className="users-filter users-role-filter"
                value={roleFilter}
                onChange={handleFilterChange(setRoleFilter)}
              >
                <option value="" disabled hidden>
                  User Type
                </option>
                <option value={ALL_VALUE}>All</option>
                <option value="Employee">Employee</option>
                <option value="HR">HR</option>
                <option value="Admin">Admin</option>
                <option value="Accountant">Accountant</option>
              </select>

              {/* STATUS */}
              <select
                className="users-filter users-status-filter"
                value={statusFilter}
                onChange={handleFilterChange(setStatusFilter)}
              >
                <option value="" disabled hidden>
                  Status
                </option>
                <option value={ALL_VALUE}>All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              {/* SORT BY */}
              <select
                className="users-filter users-sort-filter"
                value={sortBy}
                onChange={handleFilterChange(setSortBy)}
              >
                <option value="" disabled hidden>
                  Sort By
                </option>
                <option value={ALL_VALUE}>Default</option>
                <option value="Recently Added">Recently Added</option>
                <option value="Ascending">Ascending</option>
                <option value="Descending">Descending</option>
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last Month">Last Month</option>
              </select>
            </div>
          </div>

          {/* TOOLBAR */}

          <div className="users-toolbar">
            <div className="users-row-control">
              <span>Row Per Page</span>

              <select
                className="users-row-select"
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={40}>40</option>
              </select>

              <span>Entries</span>
            </div>

            <input
              type="text"
              className="users-search"
              placeholder="Search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* TABLE */}

          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th className="users-check-col">
                    <input
                      type="checkbox"
                      className="users-checkbox"
                      checked={allVisibleSelected}
                      onChange={handleSelectAll}
                    />
                  </th>

                  <th>
                    Name
                    <span className="users-sort">↑↓</span>
                  </th>

                  <th>
                    Email
                    <span className="users-sort">↑↓</span>
                  </th>

                  <th>
                    Created Date
                    <span className="users-sort">↑↓</span>
                  </th>

                  <th>
                    User type
                    <span className="users-sort">↑↓</span>
                  </th>

                  <th>
                    Status
                    <span className="users-sort">↑↓</span>
                  </th>

                  <th>
                    <span className="users-sort">↑↓</span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {loadingUsers ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{ height: "90px", textAlign: "center" }}
                    >
                      Loading users...
                    </td>
                  </tr>
                ) : (
                  visibleUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="users-check-col">
                        <input
                          type="checkbox"
                          className="users-checkbox"
                          checked={selected.includes(user.id)}
                          onChange={() => toggleSelect(user.id)}
                        />
                      </td>

                      <td>
                        <div className="users-user-cell">
                          <div className="users-avatar" />
                          <div className="users-name">{user.name}</div>
                        </div>
                      </td>

                      <td>{user.email}</td>

                      <td>{user.createdDate}</td>

                      <td>
                        <span
                          className={`users-role-badge ${getRoleBadgeClass(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`users-status ${
                            user.status === "Active"
                              ? "users-status-active"
                              : "users-status-inactive"
                          }`}
                        >
                          <span className="users-status-dot" />
                          {user.status}
                        </span>
                      </td>

                      <td>
                        <div className="users-actions">
                          <button
                            type="button"
                            className="users-action-btn"
                            title="Permissions"
                          >
                            <Shield size={15} />
                          </button>

                          <button
                            type="button"
                            className="users-action-btn"
                            title={`Edit ${user.role}`}
                            onClick={() => openEditModal(user)}
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            type="button"
                            className="users-action-btn"
                            title="Delete"
                            onClick={() => openDeleteModal(user.id)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}

                {!loadingUsers && visibleUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      style={{ height: "90px", textAlign: "center" }}
                    >
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER */}

          <div className="users-table-footer">
            <div>
              Showing{" "}
              {filteredUsers.length === 0
                ? 0
                : (safeCurrentPage - 1) * rowsPerPage + 1}
              {" - "}
              {Math.min(safeCurrentPage * rowsPerPage, filteredUsers.length)}
              {" of "}
              {filteredUsers.length}
              {" entries"}
            </div>

            <div className="users-pagination">
              <button
                type="button"
                className="users-page-arrow"
                disabled={safeCurrentPage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              >
                <ChevronLeft size={16} />
              </button>

              <span className="users-current-page">{safeCurrentPage}</span>

              <button
                type="button"
                className="users-page-arrow"
                disabled={safeCurrentPage === totalPages}
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DELETE MODAL */}

      {deleteOpen && (
        <div className="users-modal-overlay">
          <div className="users-delete-modal">
            <div className="users-delete-icon">
              <Trash2 size={31} strokeWidth={2.2} />
            </div>

            <h3>Confirm Delete</h3>

            <p>
              You want to delete this user, this can't be undone once you
              delete.
            </p>

            <div className="users-delete-actions">
              <button
                type="button"
                className="users-delete-cancel"
                onClick={closeDeleteModal}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="users-delete-confirm"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Users;

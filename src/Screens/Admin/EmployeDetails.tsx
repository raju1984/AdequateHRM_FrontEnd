import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiEdit2,
  FiChevronDown,
  FiPhone,
  FiMail,
  FiCalendar,
  FiMapPin,
  FiBriefcase,
  FiUser,
  FiInfo,
  FiPlusCircle,
  FiX,
  FiUpload,
} from "react-icons/fi";
import {
  getEmployeeDetails,
  getEmployeeLeaves,
  updateEmployeePersonalDetail,
  addEmployeeFamily,
  updateEmployeeFamily,
  addEmployeeEducation,
  updateEmployeeEducation,
  addEmployeeExperience,
  updateEmployeeExperience,
  addEmployeeEmergencyContact,
  updateEmployeeEmergencyContact,
  updateEmployee,
  getDepartments,
  getDesignations,
  unwrapApiArray,
  unwrapApiValue,
  getValue,
} from "../../services/adminservices";

type EmployeeFromList = {
  uuid?: string;
  id?: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  department?: string;
  departmentId?: string;
  des?: string;
  designationId?: string;
  date?: string;
  rawJoiningDate?: string;
  about?: string;
  status?: "Active" | "Inactive";
  image?: string;
  employeeCode?: string;
  birthday?: string;
  dateOfBirth?: string;
  address?: string;
  genderCode?: string;
};

type LeaveRow = {
  id: string;
  reason: string;
  requestDate: string;
  from: string;
  to: string;
  approver: string;
  role: string;
  leaveTypeId?: string;
  approvedById?: string;
  status?: number | string;
};

type PersonalInfo = {
  passportNo: string;
  passportExpiryDate: string;
  nationality: string;
  religion: string;
  maritalStatus: string;
  employmentSpouse: string;
  children: string;
  dateOfBirth: string;
  panNo: string;
};

type EmergencyContact = {
  id?: string;
  name: string;
  relationship: string;
  phone1: string;
  phone2: string;
};

type BankInfo = {
  bankName: string;
  accountNo: string;
  ifscCode: string;
  branchAddress: string;
};

type FamilyInfo = {
  id?: string;
  name: string;
  relationship: string;
  phone: string;
  dateOfBirth: string;
};

type EducationInfo = {
  id?: string;
  institutionName: string;
  course: string;
  startDate: string;
  endDate: string;
};

type ExperienceInfo = {
  id?: string;
  companyName: string;
  designation: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
};

type EmployeeEditForm = {
  firstName: string;
  lastName: string;
  employeeId: string;
  joiningDate: string;
  username: string;
  email: string;

  // Password fields removed.
  // Birthday replaces Password.
  birthday: string;

  // Address replaces Confirm Password.
  address: string;

  phoneNumber: string;
  genderCode: string;

  company: string;
  department: string;
  designation: string;
  about: string;
  profileImage: string;

  departmentId?: string;
  designationId?: string;
};

type PermissionState = {
  dashboard: boolean;
  employees: boolean;
  attendance: boolean;
  leaves: boolean;
  payroll: boolean;
  reports: boolean;
};

type DetailModalName =
  | "employee"
  | "personal"
  | "emergency"
  | "bank"
  | "family"
  | "education"
  | "experience"
  | null;

const fallbackLeaveRows: LeaveRow[] = [
  {
    id: "1",
    reason: "Medical Leave",
    requestDate: "01 Jan 2024",
    from: "14 Jan 2024",
    to: "15 Jan 2024",
    approver: "Douglas",
    role: "Manager",
  },
  {
    id: "2",
    reason: "Annual Leave",
    requestDate: "10 Jan 2024",
    from: "21 Jan 2024",
    to: "25 Jan 2024",
    approver: "Douglas",
    role: "Manager",
  },
  {
    id: "3",
    reason: "Medical Leave",
    requestDate: "10 Jan 2024",
    from: "20 Jan 2024",
    to: "22 Feb 2024",
    approver: "Warren",
    role: "Admin",
  },
  {
    id: "4",
    reason: "Annual Leave",
    requestDate: "01 Mar 2024",
    from: "15 Mar 2024",
    to: "17 Mar 2024",
    approver: "Douglas",
    role: "Manager",
  },
  {
    id: "5",
    reason: "Casual Leave",
    requestDate: "15 Mar 2024",
    from: "12 Apr 2024",
    to: "16 Apr 2024",
    approver: "Douglas",
    role: "Manager",
  },
  {
    id: "6",
    reason: "Medical Leave",
    requestDate: "01 May 2024",
    from: "20 May 2024",
    to: "21 Mar 2024",
    approver: "Warren",
    role: "Admin",
  },
  {
    id: "7",
    reason: "Casual Leave",
    requestDate: "29 May 2024",
    from: "06 Jul 2024",
    to: "06 Jul 2024",
    approver: "Douglas",
    role: "Manager",
  },
  {
    id: "8",
    reason: "Medical Leave",
    requestDate: "25 Aug 2024",
    from: "02 Sep 2024",
    to: "04 Sep 2024",
    approver: "Douglas",
    role: "Manager",
  },
  {
    id: "9",
    reason: "Annual Leave",
    requestDate: "01 Nov 2024",
    from: "15 Nov 2024",
    to: "15 Nov 2024",
    approver: "Warren",
    role: "Admin",
  },
  {
    id: "10",
    reason: "Casual Leave",
    requestDate: "01 Nov 2024",
    from: "10 Dec 2024",
    to: "11 Dec 2024",
    approver: "Douglas",
    role: "Manager",
  },
];

const toDisplayDate = (value: any, fallback = "") => {
  if (!value) return fallback;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatApiDate = (value: string) => {
  if (!value) return "";

  const d = new Date(value);

  return Number.isNaN(d.getTime()) ? value : d.toISOString();
};

/**
 * Converts any date value to yyyy-MM-dd.
 * Used for the native date input so the calendar works correctly.
 */
const toInputDate = (value: any) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    // Also handle values such as "24th July 2000"
    const parsed = new Date(String(value).replace(/(\d+)(st|nd|rd|th)/, "$1"));

    if (Number.isNaN(parsed.getTime())) {
      return "";
    }

    return parsed.toISOString().slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
};

const MARITAL_STATUS_OPTIONS = [
  { value: "0", label: "Single" },
  { value: "1", label: "Married" },
  { value: "2", label: "Divorced" },
  { value: "3", label: "Widowed" },
] as const;

const normalizeMaritalStatus = (value: any) => {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const raw = String(value).trim();

  // Support API responses that return either enum numbers or enum names.
  const byNumber = MARITAL_STATUS_OPTIONS.find(
    (option) => option.value === raw
  );

  if (byNumber) {
    return byNumber.value;
  }

  const byLabel = MARITAL_STATUS_OPTIONS.find(
    (option) => option.label.toLowerCase() === raw.toLowerCase()
  );

  return byLabel?.value ?? "";
};

const normalizeMaritalStatusForApi = (value: string) => {
  if (value === "") {
    return null;
  }

  const numericValue = Number(value);

  return Number.isInteger(numericValue)
    ? numericValue
    : null;
};

const normalizeLeaveRows = (raw: any): LeaveRow[] => {
  const items = unwrapApiArray(raw);

  if (!items.length) return [];

  return items.map((item: any, index: number) => ({
    id: String(
      getValue(item, ["id", "Id", "leaveId", "LeaveId"], index + 1)
    ),
    reason: String(
      getValue(
        item,
        [
          "reason",
          "Reason",
          "leaveReason",
          "LeaveReason",
          "leaveTypeName",
          "LeaveTypeName",
        ],
        "Leave"
      )
    ),
    requestDate: toDisplayDate(
      getValue(item, [
        "requestDate",
        "RequestDate",
        "dateOfRequest",
        "DateOfRequest",
      ]),
      ""
    ),
    from: toDisplayDate(
      getValue(item, ["from", "From", "fromDate", "FromDate"]),
      ""
    ),
    to: toDisplayDate(
      getValue(item, ["to", "To", "toDate", "ToDate"]),
      ""
    ),
    approver: String(
      getValue(
        item,
        [
          "approver",
          "Approver",
          "approvedByName",
          "ApprovedByName",
          "reviewedByName",
          "ReviewedByName",
        ],
        "-"
      )
    ),
    role: String(
      getValue(
        item,
        ["role", "Role", "approvedByRole", "ApprovedByRole"],
        ""
      )
    ),
    leaveTypeId: getValue(item, [
      "leaveTypeId",
      "LeaveTypeId",
      "leaveTypeMasterId",
      "LeaveTypeMasterId",
    ]),
    approvedById: getValue(item, [
      "approvedById",
      "ApprovedById",
      "reviewedByUserId",
      "ReviewedByUserId",
    ]),
    status: getValue(item, ["status", "Status"]),
  }));
};

const normalizeFamily = (raw: any): FamilyInfo[] => {
  return unwrapApiArray(raw).map((item: any) => ({
    id: getValue(item, [
      "id",
      "Id",
      "familyMemberId",
      "FamilyMemberId",
    ]),
    name: String(
      getValue(
        item,
        ["name", "Name", "familyMemberName", "FamilyMemberName"],
        ""
      )
    ),
    relationship: String(
      getValue(item, ["relationship", "Relationship"], "")
    ),
    phone: String(
      getValue(
        item,
        ["phoneNumber", "PhoneNumber", "phone", "Phone"],
        ""
      )
    ),
    dateOfBirth: toDisplayDate(
      getValue(item, ["dateOfBirth", "DateOfBirth"]),
      ""
    ),
  }));
};

const normalizeEducation = (raw: any): EducationInfo[] => {
  return unwrapApiArray(raw).map((item: any) => ({
    id: getValue(item, [
      "id",
      "Id",
      "educationId",
      "EducationId",
    ]),
    institutionName: String(
      getValue(
        item,
        [
          "institutionName",
          "InstitutionName",
          "schoolName",
          "SchoolName",
        ],
        ""
      )
    ),
    course: String(
      getValue(
        item,
        [
          "course",
          "Course",
          "degreeReceived",
          "DegreeReceived",
          "major",
          "Major",
        ],
        ""
      )
    ),
    startDate: toDisplayDate(
      getValue(item, [
        "startDate",
        "StartDate",
        "fromDate",
        "FromDate",
      ]),
      String(getValue(item, ["startYear", "StartYear"], ""))
    ),
    endDate: toDisplayDate(
      getValue(item, [
        "endDate",
        "EndDate",
        "toDate",
        "ToDate",
      ]),
      String(getValue(item, ["endYear", "EndYear"], ""))
    ),
  }));
};

const normalizeExperience = (raw: any): ExperienceInfo[] => {
  return unwrapApiArray(raw).map((item: any) => ({
    id: getValue(item, [
      "id",
      "Id",
      "experienceId",
      "ExperienceId",
    ]),
    companyName: String(
      getValue(
        item,
        [
          "previousCompanyName",
          "PreviousCompanyName",
          "companyName",
          "CompanyName",
          "company",
          "Company",
        ],
        ""
      )
    ),
    designation: String(
      getValue(
        item,
        ["designation", "Designation", "jobTitle", "JobTitle"],
        ""
      )
    ),
    startDate: toDisplayDate(
      getValue(item, [
        "startDate",
        "StartDate",
        "fromDate",
        "FromDate",
      ]),
      ""
    ),
    endDate: toDisplayDate(
      getValue(item, [
        "endDate",
        "EndDate",
        "toDate",
        "ToDate",
      ]),
      ""
    ),
    currentlyWorking: Boolean(
      getValue(
        item,
        ["currentlyWorking", "CurrentlyWorking", "isCurrent", "IsCurrent"],
        false
      )
    ),
  }));
};

const normalizeEmergency = (raw: any): EmergencyContact[] => {
  return unwrapApiArray(raw).map((item: any) => ({
    id: getValue(item, [
      "id",
      "Id",
      "contactId",
      "ContactId",
    ]),
    name: String(
      getValue(
        item,
        ["name", "Name", "contactName", "ContactName"],
        ""
      )
    ),
    relationship: String(
      getValue(
        item,
        ["relationship", "Relationship", "relation", "Relation"],
        ""
      )
    ),
    phone1: String(
      getValue(
        item,
        [
          "phoneNo1",
          "PhoneNo1",
          "phone1",
          "Phone1",
          "phone",
          "Phone",
        ],
        ""
      )
    ),
    phone2: String(
      getValue(
        item,
        ["phoneNo2", "PhoneNo2", "phone2", "Phone2"],
        ""
      )
    ),
  }));
};

const normalizePersonal = (raw: any): PersonalInfo => {
  const obj = unwrapApiValue(raw) || {};

  return {
    passportNo: String(
      getValue(obj, ["passportNo", "PassportNo"], "")
    ),

    passportExpiryDate: toDisplayDate(
      getValue(obj, [
        "passportExpiryDate",
        "PassportExpiryDate",
      ]),
      ""
    ),

    nationality: String(
      getValue(obj, ["nationality", "Nationality"], "")
    ),

    religion: String(
      getValue(obj, ["religion", "Religion"], "")
    ),

    maritalStatus: String(
      getValue(obj, ["maritalStatus", "MaritalStatus"], "")
    ),

    employmentSpouse: String(
      getValue(
        obj,
        [
          "employmentSpouse",
          "EmploymentSpouse",
          "employmentOfSpouse",
          "EmploymentOfSpouse",
        ],
        ""
      )
    ),

    children: String(
      getValue(
        obj,
        [
          "noOfChildren",
          "NoOfChildren",
          "children",
          "Children",
        ],
        ""
      )
    ),

    dateOfBirth: toDisplayDate(
      getValue(obj, [
        "dateOfBirth",
        "DateOfBirth",
        "birthday",
        "Birthday",
      ]),
      ""
    ),

    panNo: String(
      getValue(
        obj,
        ["panNo", "PanNo", "PANNo", "PAN", "pan"],
        ""
      )
    ),
  };
};

const normalizeBank = (raw: any): BankInfo | null => {
  const root = unwrapApiValue(raw) || {};

  const bank =
    root?.bankInformation ||
    root?.BankInformation ||
    root?.bankDetails ||
    root?.BankDetails ||
    root?.bank ||
    root?.Bank ||
    root;

  if (!bank || typeof bank !== "object") return null;

  const result = {
    bankName: String(
      getValue(bank, ["bankName", "BankName"], "")
    ),
    accountNo: String(
      getValue(
        bank,
        [
          "accountNo",
          "AccountNo",
          "bankAccountNo",
          "BankAccountNo",
          "accountNumber",
          "AccountNumber",
        ],
        ""
      )
    ),
    ifscCode: String(
      getValue(
        bank,
        ["ifscCode", "IFSCCode", "ifsc", "IFSC"],
        ""
      )
    ),
    branchAddress: String(
      getValue(
        bank,
        [
          "branchAddress",
          "BranchAddress",
          "branch",
          "Branch",
        ],
        ""
      )
    ),
  };

  return result.bankName ||
    result.accountNo ||
    result.ifscCode ||
    result.branchAddress
    ? result
    : null;
};

const normalizeLookupArray = (
  raw: any,
  collectionKey?: string
): any[] => {
  if (Array.isArray(raw)) return raw;

  const value = unwrapApiValue(raw);

  if (Array.isArray(value)) return value;

  if (value && typeof value === "object") {
    if (
      collectionKey &&
      Array.isArray(value[collectionKey])
    ) {
      return value[collectionKey];
    }

    const nested =
      value.items ||
      value.Items ||
      value.records ||
      value.Records ||
      value.data ||
      value.Data;

    return Array.isArray(nested) ? nested : [];
  }

  return [];
};

const getLookupId = (item: any) =>
  String(
    getValue(
      item,
      [
        "id",
        "Id",
        "departmentId",
        "DepartmentId",
        "designationId",
        "DesignationId",
      ],
      ""
    )
  );

const getDepartmentName = (item: any) =>
  String(
    getValue(
      item,
      [
        "departmentName",
        "DepartmentName",
        "name",
        "Name",
      ],
      ""
    )
  );

const getDesignationName = (item: any) =>
  String(
    getValue(
      item,
      [
        "name",
        "Name",
        "designationName",
        "DesignationName",
      ],
      ""
    )
  );

const EmployeDetails: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const employeeFromState = (
    location.state as {
      employee?: EmployeeFromList;
    } | null
  )?.employee;

  const resolvedEmployeeId =
    employeeFromState?.uuid ||
    employeeFromState?.id ||
    params.employeeId ||
    "";

  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState("");
  const [saving, setSaving] =
    useState<DetailModalName>(null);

  const [departments, setDepartments] =
    useState<any[]>([]);

  const [designations, setDesignations] =
    useState<any[]>([]);

  const [userId, setUserId] = useState<string>(
    employeeFromState?.userId || ""
  );

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [approvedBy, setApprovedBy] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("7");

  const [employeeInfo, setEmployeeInfo] =
    useState({
      firstName:
        employeeFromState?.firstName ||
        employeeFromState?.name?.split(" ")[0] ||
        "Stephan",

      lastName:
        employeeFromState?.lastName ||
        employeeFromState?.name
          ?.split(" ")
          .slice(1)
          .join(" ") ||
        "Peralt",

      employeeId:
        (employeeFromState as any)?.employeeCode ||
        employeeFromState?.id ||
        resolvedEmployeeId ||
        "EMP -0024",

      joiningDate:
        employeeFromState?.date ||
        employeeFromState?.rawJoiningDate ||
        "1st Jan 2023",

      username:
        employeeFromState?.name
          ?.toLowerCase()
          .replace(/\s+/g, "") ||
        "stephan",

      email:
        employeeFromState?.email ||
        "perralt12@example.com",

      phoneNumber:
        employeeFromState?.phone ||
        "(163) 2459 315",

      company:
        employeeFromState?.company ||
        "Adequate",

      department:
        employeeFromState?.department ||
        "IT",

      departmentId:
        employeeFromState?.departmentId ||
        "",

      designation:
        employeeFromState?.des ||
        "Software Developer",

      designationId:
        employeeFromState?.designationId ||
        "",

      about:
        employeeFromState?.about ||
        "As an award winning designer, I deliver exceptional quality work and bring value to your brand! With 10 years of experience and 350+ projects completed worldwide with satisfied customers, I developed the 360° brand approach, which helped me to create numerous brands that are relevant, meaningful and loved.",

      profileImage:
        employeeFromState?.image || "",

      birthday:
        employeeFromState?.birthday ||
        employeeFromState?.dateOfBirth ||
        "",

      address:
        employeeFromState?.address ||
        "",

      genderCode:
        employeeFromState?.genderCode ||
        "",
    });

  const [employeeEditModalOpen, setEmployeeEditModalOpen] =
    useState(false);

  const [employeeEditTab, setEmployeeEditTab] =
    useState<
      "Basic Information" | "Permissions"
    >("Basic Information");

  const [employeeEditForm, setEmployeeEditForm] =
    useState<EmployeeEditForm>({
      firstName: employeeInfo.firstName,
      lastName: employeeInfo.lastName,
      employeeId: employeeInfo.employeeId,
      joiningDate: employeeInfo.joiningDate,
      username: employeeInfo.username,
      email: employeeInfo.email,

      birthday: toInputDate(employeeInfo.birthday),

      address: employeeInfo.address,

      phoneNumber: employeeInfo.phoneNumber,

      genderCode: employeeInfo.genderCode,

      company: employeeInfo.company,
      department: employeeInfo.department,
      designation: employeeInfo.designation,
      about: employeeInfo.about,
      profileImage: employeeInfo.profileImage,
    });

  const [profileFile, setProfileFile] =
    useState<File | null>(null);

  const [permissions, setPermissions] =
    useState<PermissionState>({
      dashboard: true,
      employees: true,
      attendance: true,
      leaves: true,
      payroll: false,
      reports: false,
    });

  const [personalInfo, setPersonalInfo] =
    useState<PersonalInfo>({
      passportNo: "",
      passportExpiryDate: "",
      nationality: "",
      religion: "",
      maritalStatus: "",
      employmentSpouse: "",
      children: "",
      dateOfBirth: "",
      panNo: "",
    });

  const [personalModalOpen, setPersonalModalOpen] =
    useState(false);

  const [personalForm, setPersonalForm] =
    useState<PersonalInfo>(personalInfo);

  const [emergencyContacts, setEmergencyContacts] =
    useState<{
      primary: EmergencyContact;
      secondary: EmergencyContact;
    }>({
      primary: {
        name: "Adrian Peralt",
        relationship: "Father",
        phone1: "+1 127 2685 598",
        phone2: "",
      },

      secondary: {
        name: "Karen Wills",
        relationship: "Mother",
        phone1: "+1 989 7774 787",
        phone2: "",
      },
    });

  const [emergencyModalOpen, setEmergencyModalOpen] =
    useState(false);

  const [emergencyForm, setEmergencyForm] =
    useState<{
      primary: EmergencyContact;
      secondary: EmergencyContact;
    }>(emergencyContacts);

  const [bankInfo, setBankInfo] =
    useState<BankInfo>({
      bankName: "Swiz International Bank",
      accountNo: "159843014641",
      ifscCode: "ICI245O4",
      branchAddress: "Alabama USA",
    });

  const [bankModalOpen, setBankModalOpen] =
    useState(false);

  const [bankForm, setBankForm] =
    useState<BankInfo>(bankInfo);

  const [familyInfo, setFamilyInfo] =
    useState<FamilyInfo>({
      name: "Hendry Peralt",
      relationship: "Brother",
      phone: "+1 265 6956 961",
      dateOfBirth: "25 May 2029",
    });

  const [familyModalOpen, setFamilyModalOpen] =
    useState(false);

  const [familyForm, setFamilyForm] =
    useState<FamilyInfo>(familyInfo);

  const [educationInfo, setEducationInfo] =
    useState<EducationInfo[]>([
      {
        institutionName: "Oxford University",
        course: "Computer Science",
        startDate: "2020",
        endDate: "2022",
      },
      {
        institutionName: "Cambridge University",
        course: "Computer Network & Systems",
        startDate: "2016",
        endDate: "2019",
      },
      {
        institutionName: "Oxford School",
        course: "Grade X",
        startDate: "2012",
        endDate: "2016",
      },
    ]);

  const [educationModalOpen, setEducationModalOpen] =
    useState(false);

  const [educationForm, setEducationForm] =
    useState<EducationInfo>(
      educationInfo[0]
    );

  const [selectedEducationId, setSelectedEducationId] =
    useState<string | undefined>(undefined);

  const [experienceInfo, setExperienceInfo] =
    useState<ExperienceInfo[]>([
      {
        companyName: "Google",
        designation: "UI/UX Developer",
        startDate: "Jan 2013",
        endDate: "",
        currentlyWorking: true,
      },
      {
        companyName: "Salesforce",
        designation: "Web Developer",
        startDate: "Dec 2012",
        endDate: "Jan 2015",
        currentlyWorking: false,
      },
      {
        companyName: "HubSpot",
        designation: "Software Developer",
        startDate: "Dec 2011",
        endDate: "Jan 2012",
        currentlyWorking: false,
      },
    ]);

  const [experienceModalOpen, setExperienceModalOpen] =
    useState(false);

  const [experienceForm, setExperienceForm] =
    useState<ExperienceInfo>(
      experienceInfo[0]
    );

  const [selectedExperienceId, setSelectedExperienceId] =
    useState<string | undefined>(undefined);

  const [leaveRows, setLeaveRows] =
    useState<LeaveRow[]>(fallbackLeaveRows);

  useEffect(() => {
    let cancelled = false;

    const loadLookups = async () => {
      try {
        const [
          departmentRaw,
          designationRaw,
        ] = await Promise.all([
          getDepartments({
            PageNumber: 1,
            PageSize: 100,
          }),

          getDesignations({
            PageNumber: 1,
            PageSize: 100,
          }),
        ]);

        if (cancelled) return;

        setDepartments(
          normalizeLookupArray(
            departmentRaw,
            "departments"
          )
        );

        setDesignations(
          normalizeLookupArray(
            designationRaw,
            "designations"
          )
        );
      } catch (error) {
        console.error(
          "Failed to load departments/designations:",
          error
        );
      }
    };

    loadLookups();

    if (!resolvedEmployeeId) {
      setLoading(false);
      setLoadingError(
        "Employee ID is missing."
      );

      return () => {
        cancelled = true;
      };
    }

    const loadEmployee = async () => {
      setLoading(true);
      setLoadingError("");

      try {
        const [
          detailRaw,
          leavesRaw,
        ] = await Promise.all([
          getEmployeeDetails(
            resolvedEmployeeId
          ),

          getEmployeeLeaves(
            resolvedEmployeeId,
            {
              PageNumber: 1,
              PageSize: 100,
            }
          ),
        ]);

        if (cancelled) return;

        const detail =
          unwrapApiValue(detailRaw) || {};

        const employeeObject =
          detail?.employee ||
          detail?.Employee ||
          detail?.employeeDetails ||
          detail?.EmployeeDetails ||
          detail;

        const fullName = String(
          getValue(
            employeeObject,
            ["fullName", "FullName"],
            ""
          )
        );

        const nameParts = fullName
          .trim()
          .split(/\s+/)
          .filter(Boolean);

        const apiUserId = String(
          getValue(
            employeeObject,
            [
              "userId",
              "UserId",
              "id",
              "Id",
            ],
            ""
          )
        );

        setUserId(apiUserId);

        const birthdayValue = getValue(
          employeeObject,
          [
            "birthday",
            "Birthday",
            "dateOfBirth",
            "DateOfBirth",
          ],
          ""
        );

        const addressValue = getValue(
          employeeObject,
          [
            "address",
            "Address",
            "currentAddress",
            "CurrentAddress",
          ],
          ""
        );

        const genderCodeValue = getValue(
          employeeObject,
          [
            "genderCode",
            "GenderCode",
            "gender",
            "Gender",
          ],
          ""
        );

        setEmployeeInfo((prev) => ({
          ...prev,

          firstName: String(
            getValue(
              employeeObject,
              ["firstName", "FirstName"],
              nameParts[0] ||
                prev.firstName
            )
          ),

          lastName: String(
            getValue(
              employeeObject,
              ["lastName", "LastName"],
              nameParts
                .slice(1)
                .join(" ") ||
                prev.lastName
            )
          ),

          employeeId: String(
            getValue(
              employeeObject,
              [
                "employeeCode",
                "EmployeeCode",
                "employeeId",
                "EmployeeId",
              ],
              prev.employeeId
            )
          ),

          joiningDate: toDisplayDate(
            getValue(
              employeeObject,
              [
                "joiningDate",
                "JoiningDate",
                "dateOfJoin",
                "DateOfJoin",
              ]
            ),
            prev.joiningDate
          ),

          username: String(
            getValue(
              employeeObject,
              [
                "username",
                "Username",
                "userName",
                "UserName",
              ],
              prev.username
            )
          ),

          email: String(
            getValue(
              employeeObject,
              ["email", "Email"],
              prev.email
            )
          ),

          phoneNumber: String(
            getValue(
              employeeObject,
              [
                "phoneNumber",
                "PhoneNumber",
                "phone",
                "Phone",
              ],
              prev.phoneNumber
            )
          ),

          company: String(
            getValue(
              employeeObject,
              [
                "company",
                "Company",
                "companyName",
                "CompanyName",
              ],
              prev.company
            )
          ),

          department: String(
            getValue(
              employeeObject,
              [
                "department",
                "Department",
                "departmentName",
                "DepartmentName",
              ],
              prev.department
            )
          ),

          departmentId: String(
            getValue(
              employeeObject,
              [
                "departmentId",
                "DepartmentId",
              ],
              prev.departmentId
            )
          ),

          designation: String(
            getValue(
              employeeObject,
              [
                "designation",
                "Designation",
                "des",
                "Des",
                "designationName",
                "DesignationName",
              ],
              prev.designation
            )
          ),

          designationId: String(
            getValue(
              employeeObject,
              [
                "designationId",
                "DesignationId",
              ],
              prev.designationId
            )
          ),

          about: String(
            getValue(
              employeeObject,
              ["about", "About"],
              prev.about
            )
          ),

          profileImage: String(
            getValue(
              employeeObject,
              [
                "profilePicture",
                "ProfilePicture",
                "image",
                "Image",
                "profileImage",
                "ProfileImage",
              ],
              prev.profileImage
            )
          ),

          birthday: String(
            birthdayValue || prev.birthday
          ),

          address: String(
            addressValue || prev.address
          ),

          genderCode: String(
            genderCodeValue ||
              prev.genderCode
          ),
        }));

        const personalRaw = getValue(
          employeeObject,
          [
            "personalDetail",
            "PersonalDetail",
          ],
          null
        );

        setPersonalInfo(
          personalRaw
            ? normalizePersonal(
                personalRaw
              )
            : {
                passportNo: "",
                passportExpiryDate: "",
                nationality: "",
                religion: "",
                maritalStatus: "",
                employmentSpouse: "",
                children: "",
                dateOfBirth: "",
                panNo: "",
              }
        );

        const families =
          normalizeFamily(
            getValue(
              employeeObject,
              [
                "familyMembers",
                "FamilyMembers",
              ],
              []
            )
          );

        setFamilyInfo(
          families[0] || {
            name: "",
            relationship: "",
            phone: "",
            dateOfBirth: "",
          }
        );

        const educations =
          normalizeEducation(
            getValue(
              employeeObject,
              [
                "educations",
                "Educations",
              ],
              []
            )
          );

        setEducationInfo(
          educations
        );

        setEducationForm(
          educations[0] || {
            institutionName: "",
            course: "",
            startDate: "",
            endDate: "",
          }
        );

        setSelectedEducationId(
          educations[0]?.id
        );

        const experiences =
          normalizeExperience(
            getValue(
              employeeObject,
              [
                "experiences",
                "Experiences",
              ],
              []
            )
          );

        setExperienceInfo(
          experiences
        );

        setExperienceForm(
          experiences[0] || {
            companyName: "",
            designation: "",
            startDate: "",
            endDate: "",
            currentlyWorking: false,
          }
        );

        setSelectedExperienceId(
          experiences[0]?.id
        );

        const contacts =
          normalizeEmergency(
            getValue(
              employeeObject,
              [
                "emergencyContacts",
                "EmergencyContacts",
              ],
              []
            )
          );

        setEmergencyContacts({
          primary:
            contacts[0] || {
              name: "",
              relationship: "",
              phone1: "",
              phone2: "",
            },

          secondary:
            contacts[1] || {
              name: "",
              relationship: "",
              phone1: "",
              phone2: "",
            },
        });

        setBankInfo(
          normalizeBank(detailRaw) || {
            bankName: "",
            accountNo: "",
            ifscCode: "",
            branchAddress: "",
          }
        );

        setLeaveRows(
          normalizeLeaveRows(
            leavesRaw
          )
        );
      } catch (error) {
        if (!cancelled) {
          setLoadingError(
            error instanceof Error
              ? error.message
              : "Employee details could not be loaded."
          );

          setLeaveRows([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadEmployee();

    return () => {
      cancelled = true;
    };
  }, [resolvedEmployeeId]);

  useEffect(() => {
    if (
      !departments.length &&
      !designations.length
    ) {
      return;
    }

    const matchedDepartment =
      departments.find(
        (item) =>
          getDepartmentName(item)
            .trim()
            .toLowerCase() ===
          employeeInfo.department
            .trim()
            .toLowerCase()
      );

    const matchedDesignation =
      designations.find(
        (item) =>
          getDesignationName(item)
            .trim()
            .toLowerCase() ===
            employeeInfo.designation
              .trim()
              .toLowerCase() &&
          (!employeeInfo.department ||
            !item?.departmentName ||
            item.departmentName
              .trim()
              .toLowerCase() ===
              employeeInfo.department
                .trim()
                .toLowerCase())
      );

    if (
      matchedDepartment ||
      matchedDesignation
    ) {
      const departmentId =
        getLookupId(
          matchedDepartment
        ) ||
        employeeInfo.departmentId;

      const designationId =
        getLookupId(
          matchedDesignation
        ) ||
        employeeInfo.designationId;

      setEmployeeInfo((prev) => ({
        ...prev,
        departmentId,
        designationId,
      }));

      setEmployeeEditForm((prev) => ({
        ...prev,
        department:
          prev.department ||
          employeeInfo.department,
        designation:
          prev.designation ||
          employeeInfo.designation,
        departmentId,
        designationId,
      }));
    }
  }, [
    departments,
    designations,
    employeeInfo.department,
    employeeInfo.designation,
  ]);

  const displayName =
    `${employeeInfo.firstName} ${employeeInfo.lastName}`.trim();

  const displayId =
    employeeInfo.employeeId ||
    resolvedEmployeeId ||
    "EMP -0024";

  const designation =
    employeeInfo.designation ||
    "Software Developer";

  const email =
    employeeInfo.email ||
    "perralt12@example.com";

  const phone =
    employeeInfo.phoneNumber ||
    "(163) 2459 315";

  const joinDate =
    employeeInfo.joiningDate ||
    "1st Jan 2023";

  const about =
    employeeInfo.about || "";

  const visibleLeaves = useMemo(() => {
    const q =
      search.trim().toLowerCase();

    const statusMap: Record<
      string,
      number
    > = {
      Pending: 0,
      Approved: 1,
      Rejected: 2,
    };

    return leaveRows
      .filter((row) => {
        const searchOk =
          !q ||
          row.reason
            .toLowerCase()
            .includes(q) ||
          row.approver
            .toLowerCase()
            .includes(q);

        const typeOk =
          !leaveType ||
          row.reason === leaveType;

        const approvedOk =
          !approvedBy ||
          row.approver === approvedBy;

        const statusOk =
          !status ||
          Number(row.status) ===
            statusMap[status];

        return (
          searchOk &&
          typeOk &&
          approvedOk &&
          statusOk
        );
      })
      .slice(0, rowsPerPage);
  }, [
    leaveRows,
    search,
    leaveType,
    approvedBy,
    status,
    sort,
    rowsPerPage,
  ]);

  const openEditEmployeeModal = () => {
    setEmployeeEditForm({
      firstName:
        employeeInfo.firstName,

      lastName:
        employeeInfo.lastName,

      employeeId:
        employeeInfo.employeeId,

      joiningDate:
        employeeInfo.joiningDate,

      username:
        employeeInfo.username,

      email:
        employeeInfo.email,

      birthday:
        toInputDate(
          employeeInfo.birthday
        ),

      address:
        employeeInfo.address,

      phoneNumber:
        employeeInfo.phoneNumber,

      genderCode:
        employeeInfo.genderCode,

      company:
        employeeInfo.company,

      department:
        employeeInfo.department,

      designation:
        employeeInfo.designation,

      about:
        employeeInfo.about,

      profileImage:
        employeeInfo.profileImage,

      departmentId:
        employeeInfo.departmentId,

      designationId:
        employeeInfo.designationId,
    });

    setProfileFile(null);

    setEmployeeEditTab(
      "Basic Information"
    );

    setEmployeeEditModalOpen(true);
  };

  const saveEmployeeInfo = async () => {
    if (!resolvedEmployeeId) {
      return alert(
        "Employee ID is required."
      );
    }

    if (
      !employeeEditForm.firstName.trim()
    ) {
      return alert(
        "First Name is required."
      );
    }

    if (
      !employeeEditForm.employeeId.trim()
    ) {
      return alert(
        "Employee ID is required."
      );
    }

    if (
      !employeeEditForm.joiningDate.trim()
    ) {
      return alert(
        "Joining Date is required."
      );
    }

    if (
      !employeeEditForm.username.trim()
    ) {
      return alert(
        "Username is required."
      );
    }

    if (
      !employeeEditForm.email.trim()
    ) {
      return alert(
        "Email is required."
      );
    }

    if (
      !employeeEditForm.phoneNumber.trim()
    ) {
      return alert(
        "Phone Number is required."
      );
    }

    if (
      !employeeEditForm.address.trim()
    ) {
      return alert(
        "Address is required."
      );
    }

    if (
      !employeeEditForm.genderCode.trim()
    ) {
      return alert(
        "Gender Code is required."
      );
    }

    if (
      !employeeEditForm.birthday
    ) {
      return alert(
        "Birthday is required."
      );
    }

    if (
      !employeeEditForm.company.trim()
    ) {
      return alert(
        "Company is required."
      );
    }

    if (
      !employeeEditForm.about.trim()
    ) {
      return alert(
        "About is required."
      );
    }

    setSaving("employee");

    try {
      const formData =
        new FormData();

      formData.append(
        "Id",
        resolvedEmployeeId
      );

      formData.append(
        "EmployeeCode",
        employeeEditForm.employeeId.trim()
      );

      formData.append(
        "EmployeeId",
        employeeEditForm.employeeId.trim()
      );

      formData.append(
        "FirstName",
        employeeEditForm.firstName.trim()
      );

      formData.append(
        "LastName",
        employeeEditForm.lastName.trim()
      );

      formData.append(
        "JoiningDate",
        employeeEditForm.joiningDate.trim()
      );

      formData.append(
        "Username",
        employeeEditForm.username.trim()
      );

      formData.append(
        "Email",
        employeeEditForm.email.trim()
      );

      formData.append(
        "PhoneNumber",
        employeeEditForm.phoneNumber.trim()
      );

      formData.append(
        "Phone",
        employeeEditForm.phoneNumber.trim()
      );

      /*
       * NEW FIELD
       * Password removed.
       */
      formData.append(
        "Birthday",
        employeeEditForm.birthday
          ? formatApiDate(
              employeeEditForm.birthday
            )
          : ""
      );

      /*
       * NEW FIELD
       * Confirm Password removed.
       */
      formData.append(
        "Address",
        employeeEditForm.address.trim()
      );

      /*
       * NEW FIELD
       * Company field in UI remains present,
       * but the requested replacement is Gender Code.
       */
      formData.append(
        "GenderCode",
        employeeEditForm.genderCode.trim()
      );

      formData.append(
        "Company",
        employeeEditForm.company.trim()
      );

      formData.append(
        "Department",
        employeeEditForm.department || ""
      );

      formData.append(
        "Designation",
        employeeEditForm.designation || ""
      );

      formData.append(
        "About",
        employeeEditForm.about.trim()
      );

      const selectedDepartment =
        departments.find(
          (item) =>
            getLookupId(item) ===
              employeeInfo.departmentId ||
            getDepartmentName(item)
              .toLowerCase() ===
              employeeEditForm.department
                .trim()
                .toLowerCase()
        );

      const selectedDesignation =
        designations.find(
          (item) =>
            getLookupId(item) ===
              employeeInfo.designationId ||
            getDesignationName(item)
              .toLowerCase() ===
              employeeEditForm.designation
                .trim()
                .toLowerCase()
        );

      const departmentId =
        getLookupId(
          selectedDepartment
        ) ||
        employeeEditForm.departmentId ||
        employeeInfo.departmentId;

      const designationId =
        getLookupId(
          selectedDesignation
        ) ||
        employeeEditForm.designationId ||
        employeeInfo.designationId;

      if (departmentId) {
        formData.append(
          "DepartmentId",
          departmentId
        );
      }

      if (designationId) {
        formData.append(
          "DesignationId",
          designationId
        );
      }

      if (profileFile) {
        formData.append(
          "ProfilePicture",
          profileFile
        );
      }

      await updateEmployee(
        resolvedEmployeeId,
        formData
      );

      setEmployeeInfo((prev) => ({
        ...prev,

        firstName:
          employeeEditForm.firstName.trim(),

        lastName:
          employeeEditForm.lastName.trim(),

        employeeId:
          employeeEditForm.employeeId.trim(),

        joiningDate:
          employeeEditForm.joiningDate.trim(),

        username:
          employeeEditForm.username.trim(),

        email:
          employeeEditForm.email.trim(),

        phoneNumber:
          employeeEditForm.phoneNumber.trim(),

        company:
          employeeEditForm.company.trim(),

        department:
          employeeEditForm.department,

        departmentId,

        designation:
          employeeEditForm.designation,

        designationId,

        about:
          employeeEditForm.about.trim(),

        profileImage:
          employeeEditForm.profileImage,

        birthday:
          employeeEditForm.birthday,

        address:
          employeeEditForm.address.trim(),

        genderCode:
          employeeEditForm.genderCode.trim(),
      }));

      setEmployeeEditModalOpen(false);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Employee update failed."
      );
    } finally {
      setSaving(null);
    }
  };

  const handleProfileImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert(
        "Please select a valid image file."
      );

      e.target.value = "";

      return;
    }

    if (
      file.size >=
      4 * 1024 * 1024
    ) {
      alert(
        "Image size should be below 4 MB."
      );

      e.target.value = "";

      return;
    }

    setProfileFile(file);

    setEmployeeEditForm(
      (prev) => ({
        ...prev,
        profileImage:
          URL.createObjectURL(file),
      })
    );
  };

  const openPersonalModal = async () => {
    setPersonalForm({
      ...personalInfo,
      passportExpiryDate: toInputDate(
        personalInfo.passportExpiryDate
      ),
      maritalStatus: normalizeMaritalStatus(
        personalInfo.maritalStatus
      ),
    });

    setPersonalModalOpen(true);
  };

  const savePersonalInfo = async () => {
    if (!resolvedEmployeeId) {
      return alert(
        "Employee ID is required."
      );
    }

    setSaving("personal");

    try {
      await updateEmployeePersonalDetail(
        resolvedEmployeeId,
        {
          userId:
            userId ||
            resolvedEmployeeId,

          passportNo:
            personalForm.passportNo.trim(),

          passportExpiryDate:
            formatApiDate(
              personalForm.passportExpiryDate
            ),

          nationality:
            personalForm.nationality.trim(),

          religion:
            personalForm.religion.trim(),

          maritalStatus:
            normalizeMaritalStatusForApi(
              personalForm.maritalStatus
            ),

          employmentSpouse:
            personalForm.employmentSpouse.trim(),

          noOfChildren:
            Number(
              personalForm.children || 0
            ),

          dateOfBirth:
            personalForm.dateOfBirth
              ? formatApiDate(
                  personalForm.dateOfBirth
                )
              : "",

          panNo:
            personalForm.panNo.trim(),
        } as any
      );

      setPersonalInfo({
        ...personalForm,
        passportExpiryDate: toDisplayDate(
          personalForm.passportExpiryDate
        ),
        maritalStatus: (() => {
          const selected = MARITAL_STATUS_OPTIONS.find(
            (option) =>
              option.value ===
              personalForm.maritalStatus
          );

          return selected?.label ?? "";
        })(),
      });

      setPersonalModalOpen(false);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Personal information update failed."
      );
    } finally {
      setSaving(null);
    }
  };

  const openEmergencyModal = () => {
    setEmergencyForm({
      primary: {
        ...emergencyContacts.primary,
      },

      secondary: {
        ...emergencyContacts.secondary,
      },
    });

    setEmergencyModalOpen(true);
  };

  const saveEmergencyContacts = async () => {
    if (!resolvedEmployeeId) {
      return alert(
        "Employee ID is required."
      );
    }

    setSaving("emergency");

    try {
      const contacts = [
        emergencyForm.primary,
        emergencyForm.secondary,
      ];

      const current = [
        emergencyContacts.primary,
        emergencyContacts.secondary,
      ];

      for (
        let i = 0;
        i < contacts.length;
        i += 1
      ) {
        const contact =
          contacts[i];

        if (
          !contact.name.trim() &&
          !contact.phone1.trim()
        ) {
          continue;
        }

        const payload = {
          userId:
            userId ||
            resolvedEmployeeId,

          name:
            contact.name.trim(),

          relationship:
            contact.relationship.trim(),

          phoneNumber:
            contact.phone1.trim(),

          alternatePhoneNumber:
            contact.phone2.trim(),

          isPrimary: i === 0,
        } as any;

        if (current[i]?.id) {
          await updateEmployeeEmergencyContact(
            resolvedEmployeeId,
            current[i].id as string,
            payload
          );
        } else {
          const response =
            await addEmployeeEmergencyContact(
              resolvedEmployeeId,
              payload
            );

          const created =
            unwrapApiValue(
              response
            ) || {};

          contact.id =
            getValue(
              created,
              [
                "id",
                "Id",
                "contactId",
                "ContactId",
              ]
            );
        }
      }

      setEmergencyContacts({
        primary: {
          ...emergencyForm.primary,
        },

        secondary: {
          ...emergencyForm.secondary,
        },
      });

      setEmergencyModalOpen(false);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Emergency contact update failed."
      );
    } finally {
      setSaving(null);
    }
  };

  const openBankModal = () => {
    setBankForm({
      ...bankInfo,
    });

    setBankModalOpen(true);
  };

  const saveBankInfo = () => {
    setBankInfo({
      ...bankForm,
    });

    setBankModalOpen(false);
  };

  const openFamilyModal = () => {
    setFamilyForm({
      ...familyInfo,
    });

    setFamilyModalOpen(true);
  };

  const saveFamilyInfo = async () => {
    if (!resolvedEmployeeId) {
      return alert(
        "Employee ID is required."
      );
    }

    setSaving("family");

    try {
      const payload = {
        userId:
          userId ||
          resolvedEmployeeId,

        name:
          familyForm.name.trim(),

        relationship:
          familyForm.relationship.trim(),

        dateOfBirth:
          formatApiDate(
            familyForm.dateOfBirth
          ),

        phoneNumber:
          familyForm.phone.trim(),
      } as any;

      if (familyForm.id) {
        await updateEmployeeFamily(
          resolvedEmployeeId,
          familyForm.id,
          payload
        );
      } else {
        const response =
          await addEmployeeFamily(
            resolvedEmployeeId,
            payload
          );

        const created =
          unwrapApiValue(
            response
          ) || {};

        familyForm.id =
          getValue(
            created,
            [
              "id",
              "Id",
              "familyMemberId",
              "FamilyMemberId",
            ]
          );
      }

      setFamilyInfo({
        ...familyForm,
      });

      setFamilyModalOpen(false);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Family information update failed."
      );
    } finally {
      setSaving(null);
    }
  };

  const openEducationModal = (
    item?: EducationInfo
  ) => {
    const selected =
      item ||
      educationInfo[0] || {
        institutionName: "",
        course: "",
        startDate: "",
        endDate: "",
      };

    setEducationForm({
      ...selected,
    });

    setSelectedEducationId(
      selected.id
    );

    setEducationModalOpen(true);
  };

  const saveEducationInfo = async () => {
    if (!resolvedEmployeeId) {
      return alert(
        "Employee ID is required."
      );
    }

    setSaving("education");

    try {
      const payload = {
        userId:
          userId ||
          resolvedEmployeeId,

        institutionName:
          educationForm.institutionName.trim(),

        course:
          educationForm.course.trim(),

        startDate:
          formatApiDate(
            educationForm.startDate
          ),

        endDate:
          formatApiDate(
            educationForm.endDate
          ),
      } as any;

      if (selectedEducationId) {
        await updateEmployeeEducation(
          resolvedEmployeeId,
          selectedEducationId,
          payload
        );
      } else {
        const response =
          await addEmployeeEducation(
            resolvedEmployeeId,
            payload
          );

        const created =
          unwrapApiValue(
            response
          ) || {};

        educationForm.id =
          getValue(
            created,
            [
              "id",
              "Id",
              "educationId",
              "EducationId",
            ]
          );
      }

      setEducationInfo((prev) => {
        const next = {
          ...educationForm,
        };

        const found =
          prev.findIndex(
            (x) =>
              x.id &&
              next.id &&
              x.id === next.id
          );

        if (found >= 0) {
          const clone = [
            ...prev,
          ];

          clone[found] = next;

          return clone;
        }

        return [
          next,
          ...prev,
        ];
      });

      setEducationModalOpen(false);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Education information update failed."
      );
    } finally {
      setSaving(null);
    }
  };

  const openExperienceModal = (
    item?: ExperienceInfo
  ) => {
    const selected =
      item ||
      experienceInfo[0] || {
        companyName: "",
        designation: "",
        startDate: "",
        endDate: "",
        currentlyWorking: false,
      };

    setExperienceForm({
      ...selected,
    });

    setSelectedExperienceId(
      selected.id
    );

    setExperienceModalOpen(true);
  };

  const saveExperienceInfo = async () => {
    if (!resolvedEmployeeId) {
      return alert(
        "Employee ID is required."
      );
    }

    setSaving("experience");

    try {
      const payload = {
        userId:
          userId ||
          resolvedEmployeeId,

        previousCompanyName:
          experienceForm.companyName.trim(),

        designation:
          experienceForm.designation.trim(),

        startDate:
          formatApiDate(
            experienceForm.startDate
          ),

        endDate:
          experienceForm.currentlyWorking
            ? ""
            : formatApiDate(
                experienceForm.endDate
              ),

        currentlyWorking:
          experienceForm.currentlyWorking,
      } as any;

      if (selectedExperienceId) {
        await updateEmployeeExperience(
          resolvedEmployeeId,
          selectedExperienceId,
          payload
        );
      } else {
        const response =
          await addEmployeeExperience(
            resolvedEmployeeId,
            payload
          );

        const created =
          unwrapApiValue(
            response
          ) || {};

        experienceForm.id =
          getValue(
            created,
            [
              "id",
              "Id",
              "experienceId",
              "ExperienceId",
            ]
          );
      }

      setExperienceInfo((prev) => {
        const next = {
          ...experienceForm,
        };

        const found =
          prev.findIndex(
            (x) =>
              x.id &&
              next.id &&
              x.id === next.id
          );

        if (found >= 0) {
          const clone = [
            ...prev,
          ];

          clone[found] = next;

          return clone;
        }

        return [
          next,
          ...prev,
        ];
      });

      setExperienceModalOpen(false);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Experience information update failed."
      );
    } finally {
      setSaving(null);
    }
  };

  const primaryContact =
    emergencyContacts.primary;

  const secondaryContact =
    emergencyContacts.secondary;

  return (
    <>
      <style>{`
        *{box-sizing:border-box}
        .ed-page{min-height:100vh;background:#f6f7f9;padding:24px 22px 0;font-family:Inter,Arial,sans-serif;color:#0f2448}
        .ed-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}
        .ed-back{border:0;background:transparent;display:flex;align-items:center;gap:9px;font-size:14px;color:#0f2448;cursor:pointer;padding:0}
        .ed-gold-btn{height:39px;padding:0 15px;border:0;border-radius:6px;background:#c39236;color:white;font-weight:600;display:flex;align-items:center;gap:8px;cursor:pointer}
        .ed-grid{display:grid;grid-template-columns:338px minmax(0,1fr);gap:24px;align-items:start}
        .ed-left-card,.ed-card,.ed-emergency{background:white;border:1px solid #e0e4ea;border-radius:5px;box-shadow:0 1px 2px rgba(16,24,40,.03)}
        .ed-left-card{overflow:hidden}.ed-cover{height:91px;background:linear-gradient(135deg,#f25a00 0%,#ffb31b 52%,#ff5200 100%);position:relative}
        .ed-avatar{width:56px;height:56px;border-radius:50%;border:2px solid white;background:#d9d9d9;position:absolute;left:50%;bottom:-29px;transform:translateX(-50%);display:flex;align-items:center;justify-content:center;overflow:hidden;color:#8a8f98;font-size:10px}
        .ed-avatar img{width:100%;height:100%;object-fit:cover}.ed-profile-body{padding:37px 17px 15px;text-align:center}
        .ed-name{font-size:16px;font-weight:700;color:#0f2448;display:flex;justify-content:center;align-items:center;gap:5px;margin-bottom:8px}.ed-verified{color:#11c768;font-size:14px}
        .ed-badges{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-bottom:16px}.ed-pill{font-size:11px;padding:3px 10px;border-radius:4px;background:#eef1f3;color:#2f455f}.ed-pill.blue{background:#edf5f7;color:#49788c}
        .ed-info-list{display:grid;gap:10px;text-align:left}.ed-info-row{display:grid;grid-template-columns:20px 1fr auto;align-items:start;gap:4px;font-size:13px;color:#657184}.ed-info-row strong{color:#111827;font-weight:500}
        .ed-edit-btn{margin:17px auto 0;height:40px;padding:0 38px;border:0;border-radius:5px;background:#121b2e;color:#fff;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:7px}
        .ed-section{border-top:1px solid #e7e9ed;padding:18px 16px}.ed-section-title{display:flex;justify-content:space-between;align-items:center;font-weight:600;font-size:13px;margin-bottom:15px;color:#1d2d4a}
        .ed-section-edit{border:0;background:transparent;color:#637086;cursor:pointer;padding:2px;display:flex;align-items:center;justify-content:center}.ed-section-edit:hover{color:#c39236}
        .ed-mini-grid{display:grid;gap:11px}.ed-mini-row{display:grid;grid-template-columns:22px 1fr auto;gap:4px;align-items:start;color:#687587;font-size:13px}.ed-mini-row span:last-child{color:#222;text-align:right;max-width:180px}
        .ed-emergency-wrap{margin-top:27px}.ed-emergency-title{display:flex;justify-content:space-between;align-items:center;font-size:13px;font-weight:600;margin-bottom:13px;color:#263650}.ed-emergency-title button{border:0;background:transparent;color:#637086;cursor:pointer;display:flex;align-items:center;justify-content:center}.ed-emergency-title button:hover{color:#c39236}
        .ed-em-row{display:grid;grid-template-columns:1fr auto;gap:20px;padding:17px 16px;border-bottom:1px solid #e7e9ed;font-size:13px}.ed-em-row:last-child{border-bottom:0}.ed-label{color:#6b7585;font-size:12px;margin-bottom:5px}.red-dot{display:inline-block;width:5px;height:5px;border-radius:50%;background:red;margin:0 5px}
        .ed-right{display:grid;gap:24px}.ed-card-head{min-height:68px;padding:0 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #e4e7ec;font-weight:600}.ed-card-actions{display:flex;align-items:center;gap:13px}.ed-icon-btn{border:0;background:transparent;color:#12304f;cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center}.ed-icon-btn:hover{color:#c39236}
        .ed-card-body{padding:28px 20px;color:#607087;font-size:13px;line-height:1.55}.ed-four{display:grid;grid-template-columns:repeat(4,1fr);gap:24px}.ed-field-label{color:#758195;font-size:12px}.ed-field-value{color:#0f2448;margin-top:2px}
        .ed-two-cards{display:grid;grid-template-columns:1fr 1fr;gap:24px}.ed-edu-row,.ed-exp-row{display:flex;justify-content:space-between;gap:15px;margin-bottom:18px}.ed-edu-row:last-child,.ed-exp-row:last-child{margin-bottom:0}.ed-edu-main,.ed-exp-main{color:#0f2448}.ed-muted{color:#738095;font-size:12px}.ed-substrong{font-weight:600;margin-top:3px}.ed-date{white-space:nowrap;color:#1f2937;font-size:12px}
        .ed-leave-card{overflow:hidden}.ed-leave-title{font-size:16px;font-weight:600;padding:17px 20px 8px}.ed-filters{display:flex;gap:15px;flex-wrap:wrap;padding:8px 20px 15px}.ed-select,.ed-date-select{height:36px;border:1px solid #dfe3e8;border-radius:6px;background:white;padding:0 10px;color:#1e2c45;font-size:13px}.ed-date-select{min-width:195px}
        .ed-table-tools{display:flex;justify-content:space-between;align-items:center;padding:13px 16px;border-top:1px solid #eceef1;border-bottom:1px solid #e4e7eb}.ed-entries{display:flex;align-items:center;gap:8px;color:#344054;font-size:13px}.ed-search{width:160px;height:31px;border:1px solid #dfe3e8;border-radius:6px;padding:0 12px;outline:none}.ed-table-wrap{width:100%;overflow:visible}.ed-table{width:100%;border-collapse:collapse;table-layout:fixed}.ed-table th{height:43px;background:#e6e8ec;text-align:left;padding:0 10px;font-size:13px;color:#0f172a}.ed-table td{height:54px;border-bottom:1px solid #e5e7eb;padding:0 10px;font-size:13px;color:#657184;overflow-wrap:anywhere}
        .ed-table th:first-child,.ed-table td:first-child{width:42px;text-align:center}.ed-table th:nth-child(2),.ed-table td:nth-child(2){width:22%}.ed-table th:nth-child(3),.ed-table td:nth-child(3){width:20%}.ed-table th:nth-child(4),.ed-table td:nth-child(4){width:17%}.ed-table th:nth-child(5),.ed-table td:nth-child(5){width:17%}.ed-table th:nth-child(6),.ed-table td:nth-child(6){width:24%}.ed-table input[type=checkbox]{width:16px;height:16px}.ed-reason{color:#62738b}.info-blue{color:#1677ff;margin-left:4px}.ed-approver{display:flex;align-items:center;gap:8px;color:#0f172a}.ed-mini-avatar{width:32px;height:32px;border-radius:50%;background:#d6d7d9}.ed-role{font-size:11px;color:#748095}
        .ed-table-footer{height:58px;display:flex;align-items:center;justify-content:space-between;padding:0 16px;color:#64748b;font-size:13px}.ed-pagination{display:flex;align-items:center;gap:16px}.ed-page-circle{width:27px;height:27px;border-radius:50%;background:#c39236;color:#fff;display:flex;align-items:center;justify-content:center}
        .ed-footer{margin:24px -22px 0;padding:18px 8px;border-top:1px solid #e5e7eb;background:white;display:flex;justify-content:space-between;color:#687587;font-size:13px}.gold{color:#c39236}
        .ed-loading{padding:30px;background:#fff;border:1px solid #e0e4ea;border-radius:6px;color:#667085}.ed-error{margin-bottom:15px;padding:12px 14px;background:#fff2f2;border:1px solid #f2b8b8;color:#b42318;border-radius:6px;font-size:13px}
        .ed-modal-overlay{position:fixed;inset:0;background:rgba(15,23,42,.48);display:flex;align-items:center;justify-content:center;padding:20px;z-index:9999}.ed-modal{width:100%;max-width:650px;max-height:calc(100vh - 40px);overflow-y:auto;background:#fff;border-radius:8px;box-shadow:0 20px 50px rgba(0,0,0,.18);animation:edModalIn .18s ease-out}.ed-modal.employee-edit-modal{max-width:820px}.ed-modal.emergency-modal{max-width:700px}.ed-modal.bank-modal,.ed-modal.family-modal{max-width:600px}.ed-modal.education-modal,.ed-modal.experience-modal{max-width:650px}
        @keyframes edModalIn{from{opacity:0;transform:translateY(8px) scale(.99)}to{opacity:1;transform:translateY(0) scale(1)}}
        .ed-modal-header{min-height:64px;padding:0 22px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #e7e9ed}.ed-modal-title-wrap{display:flex;flex-direction:column;gap:3px}.ed-modal-title{font-size:17px;font-weight:700;color:#16233c}.ed-modal-subtitle{font-size:12px;color:#7a8799}.ed-modal-close{width:32px;height:32px;border:0;border-radius:5px;background:transparent;color:#667085;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:19px}.ed-modal-close:hover{background:#f2f4f7;color:#1d2939}.ed-modal-body{padding:22px}
        .ed-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px 20px}.ed-form-group{display:flex;flex-direction:column;gap:7px}.ed-form-group.full{grid-column:1/-1}.ed-form-label{font-size:13px;font-weight:500;color:#344054}.ed-required{color:#e11d48;margin-left:2px}.ed-form-input,.ed-form-select{width:100%;height:40px;border:1px solid #d9dee7;border-radius:6px;background:#fff;padding:0 12px;outline:none;font-size:13px;color:#1d2939;transition:border-color .15s,box-shadow .15s}.ed-form-input::placeholder{color:#98a2b3}.ed-form-input:focus,.ed-form-select:focus{border-color:#c39236;box-shadow:0 0 0 3px rgba(195,146,54,.1)}.ed-form-input[type="date"]{cursor:pointer}.ed-form-input[type="date"]::-webkit-calendar-picker-indicator{cursor:pointer;opacity:.75}.ed-form-select{cursor:pointer}.ed-form-textarea{width:100%;min-height:105px;resize:vertical;border:1px solid #d9dee7;border-radius:6px;background:white;padding:10px 12px;outline:none;font-size:13px;color:#1d2939}.ed-form-textarea:focus{border-color:#c39236;box-shadow:0 0 0 3px rgba(195,146,54,.1)}
        .ed-employee-tabs{display:flex;gap:4px;border-bottom:1px solid #e4e7ec;padding:0 22px}.ed-employee-tab{border:0;background:transparent;padding:14px 18px;font-size:13px;color:#667085;font-weight:600;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px}.ed-employee-tab.active{color:#c39236;border-bottom-color:#c39236}
        .ed-profile-upload{display:flex;align-items:center;gap:18px;margin-bottom:20px}.ed-profile-preview{width:82px;height:82px;border-radius:50%;border:1px solid #e1e5eb;background:#f2f4f7;overflow:hidden;display:flex;align-items:center;justify-content:center;color:#98a2b3;font-size:11px;flex-shrink:0}.ed-profile-preview img{width:100%;height:100%;object-fit:cover}.ed-upload-content{display:flex;flex-direction:column;gap:7px}.ed-upload-title{font-size:13px;font-weight:600;color:#344054}.ed-upload-subtitle{font-size:12px;color:#98a2b3}.ed-upload-btn{width:fit-content;height:34px;padding:0 12px;border:1px solid #d0d5dd;border-radius:6px;background:white;color:#344054;font-size:12px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:6px}.ed-hidden-file{display:none}
        .ed-permission-title{font-size:14px;font-weight:700;color:#172b4d;margin-bottom:4px}.ed-permission-description{font-size:12px;color:#7a8799;margin-bottom:18px}.ed-permission-list{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.ed-permission-item{border:1px solid #e4e7ec;border-radius:7px;padding:14px;display:flex;align-items:center;gap:10px}.ed-permission-item input{width:16px;height:16px;accent-color:#c39236;cursor:pointer}.ed-permission-item label{cursor:pointer;font-size:13px;color:#344054}
        .ed-contact-section{border:1px solid #e4e7ec;border-radius:7px;padding:18px;margin-bottom:18px}.ed-contact-section:last-child{margin-bottom:0}.ed-contact-section-title{font-size:14px;font-weight:700;color:#172b4d;margin-bottom:17px}.ed-checkbox-row{display:flex;align-items:center;gap:9px;margin-top:2px}.ed-checkbox-row input{width:16px;height:16px;accent-color:#c39236;cursor:pointer}.ed-checkbox-label{font-size:13px;color:#344054;cursor:pointer;user-select:none}.ed-input-disabled{background:#f2f4f7;cursor:not-allowed;color:#98a2b3}
        .ed-modal-footer{min-height:70px;padding:14px 22px;border-top:1px solid #e7e9ed;display:flex;justify-content:flex-end;align-items:center;gap:10px}.ed-cancel-btn,.ed-save-btn{height:38px;min-width:88px;padding:0 18px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer}.ed-cancel-btn{border:1px solid #d0d5dd;background:white;color:#344054}.ed-save-btn{border:1px solid #c39236;background:#c39236;color:white}.ed-save-btn:disabled{opacity:.65;cursor:not-allowed}
        @media(max-width:1050px){.ed-grid{grid-template-columns:1fr}.ed-two-cards{grid-template-columns:1fr}}@media(max-width:700px){.ed-page{padding:16px 12px 0}.ed-four{grid-template-columns:1fr 1fr}.ed-top{gap:12px}.ed-filters{flex-direction:column}.ed-select,.ed-date-select{width:100%}.ed-table-tools{flex-direction:column;align-items:stretch;gap:10px}.ed-search{width:100%}.ed-footer{margin:20px -12px 0;flex-direction:column;gap:8px}.ed-form-grid{grid-template-columns:1fr}.ed-form-group.full{grid-column:auto}.ed-modal{max-height:calc(100vh - 20px)}.ed-modal-body{padding:18px}.ed-modal-header{padding:0 18px}.ed-modal-footer{padding:14px 18px}.ed-em-row{grid-template-columns:1fr}.ed-profile-upload{align-items:flex-start}.ed-permission-list{grid-template-columns:1fr}.ed-employee-tabs{padding:0 12px}.ed-employee-tab{padding-left:12px;padding-right:12px}}
      `}</style>

      <div className="ed-page">
        <div className="ed-top">
          <button
            className="ed-back"
            onClick={() =>
              navigate("/admin/employees")
            }
          >
            <FiArrowLeft /> Employee Details
          </button>
        </div>

        {loadingError && (
          <div className="ed-error">
            {loadingError}
          </div>
        )}

        <div className="ed-grid">
          <div>
            <div className="ed-left-card">
              <div className="ed-cover">
                <div className="ed-avatar">
                  {employeeInfo.profileImage ? (
                    <img
                      src={
                        employeeInfo.profileImage
                      }
                      alt={displayName}
                    />
                  ) : (
                    "300 x 300"
                  )}
                </div>
              </div>

              <div className="ed-profile-body">
                <div className="ed-name">
                  {displayName}
                  <FiCheckCircle className="ed-verified" />
                </div>

                <div className="ed-badges">
                  <span className="ed-pill">
                    • {designation}
                  </span>

                  <span className="ed-pill blue">
                    10+ years of Experience
                  </span>
                </div>

                <div className="ed-info-list">
                  <div className="ed-info-row">
                    <FiBriefcase />
                    <span>
                      Employee ID
                    </span>
                    <strong>
                      {displayId}
                    </strong>
                  </div>

                  <div className="ed-info-row">
                    <FiUser />
                    <span>
                      EPF ID
                    </span>
                    <strong>
                      EPF1001
                    </strong>
                  </div>

                  <div className="ed-info-row">
                    <FiCalendar />
                    <span>
                      Date Of Join
                    </span>
                    <strong>
                      {joinDate}
                    </strong>
                  </div>
                </div>

                <button
                  className="ed-edit-btn"
                  type="button"
                  onClick={
                    openEditEmployeeModal
                  }
                >
                  <FiEdit2 /> Edit Info
                </button>
              </div>

              <div className="ed-section">
                <div className="ed-section-title">
                  <span>
                    Basic information
                  </span>

                  <button
                    className="ed-section-edit"
                    type="button"
                    onClick={
                      openEditEmployeeModal
                    }
                  >
                    <FiEdit2 />
                  </button>
                </div>

                <div className="ed-mini-grid">
                  <div className="ed-mini-row">
                    <FiPhone />
                    <span>Phone</span>
                    <span>{phone}</span>
                  </div>

                  <div className="ed-mini-row">
                    <FiMail />
                    <span>Email</span>
                    <span
                      style={{
                        color: "#1677ff",
                      }}
                    >
                      {email}
                    </span>
                  </div>

                  <div className="ed-mini-row">
                    <FiUser />
                    <span>Gender</span>
                    <span>
                      {employeeInfo.genderCode ||
                        "Male"}
                    </span>
                  </div>

                  <div className="ed-mini-row">
                    <FiCalendar />
                    <span>Birthday</span>
                    <span>
                      {employeeInfo.birthday ||
                        "24th July 2000"}
                    </span>
                  </div>

                  <div className="ed-mini-row">
                    <FiMapPin />
                    <span>Address</span>
                    <span>
                      {employeeInfo.address ||
                        "1861 Bayonne Ave, Manchester, NJ, 08759"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="ed-section">
                <div className="ed-section-title">
                  <span>
                    Personal Information
                  </span>

                  <button
                    className="ed-section-edit"
                    type="button"
                    onClick={
                      openPersonalModal
                    }
                  >
                    <FiEdit2 />
                  </button>
                </div>

                <div className="ed-mini-grid">
                  <div className="ed-mini-row">
                    <FiBriefcase />
                    <span>
                      Passport No
                    </span>
                    <span>
                      {
                        personalInfo.passportNo
                      }
                    </span>
                  </div>

                  <div className="ed-mini-row">
                    <FiCalendar />
                    <span>
                      Passport Exp Date
                    </span>
                    <span>
                      {
                        personalInfo.passportExpiryDate
                      }
                    </span>
                  </div>

                  <div className="ed-mini-row">
                    <FiBriefcase />
                    <span>
                      PAN No
                    </span>
                    <span>
                      {personalInfo.panNo ||
                        "-"}
                    </span>
                  </div>

                  <div className="ed-mini-row">
                    <FiUser />
                    <span>
                      Nationality
                    </span>
                    <span>
                      {
                        personalInfo.nationality
                      }
                    </span>
                  </div>

                  <div className="ed-mini-row">
                    <FiUser />
                    <span>
                      Religion
                    </span>
                    <span>
                      {
                        personalInfo.religion
                      }
                    </span>
                  </div>

                  <div className="ed-mini-row">
                    <FiUser />
                    <span>
                      Marital status
                    </span>
                    <span>
                      {
                        personalInfo.maritalStatus
                      }
                    </span>
                  </div>

                  <div className="ed-mini-row">
                    <FiBriefcase />
                    <span>
                      Employment of spouse
                    </span>
                    <span>
                      {
                        personalInfo.employmentSpouse
                      }
                    </span>
                  </div>

                  <div className="ed-mini-row">
                    <FiUser />
                    <span>
                      No. of children
                    </span>
                    <span>
                      {
                        personalInfo.children
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="ed-emergency-wrap">
              <div className="ed-emergency-title">
                <span>
                  Emergency Contact Number
                </span>

                <button
                  type="button"
                  onClick={
                    openEmergencyModal
                  }
                >
                  <FiEdit2 />
                </button>
              </div>

              <div className="ed-emergency">
                <div className="ed-em-row">
                  <div>
                    <div className="ed-label">
                      Primary
                    </div>

                    <div>
                      {
                        primaryContact.name
                      }

                      <span className="red-dot"></span>

                      {
                        primaryContact.relationship
                      }
                    </div>
                  </div>

                  <div>
                    {
                      primaryContact.phone1
                    }
                  </div>
                </div>

                <div className="ed-em-row">
                  <div>
                    <div className="ed-label">
                      Secondary
                    </div>

                    <div>
                      {
                        secondaryContact.name
                      }

                      <span className="red-dot"></span>

                      {
                        secondaryContact.relationship
                      }
                    </div>
                  </div>

                  <div>
                    {
                      secondaryContact.phone1
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="ed-right">
            <div className="ed-card">
              <div className="ed-card-head">
                <span>
                  About Employee
                </span>

                <div className="ed-card-actions">
                  <button
                    className="ed-icon-btn"
                    type="button"
                    onClick={
                      openEditEmployeeModal
                    }
                  >
                    <FiEdit2 />
                  </button>

                  <FiChevronDown />
                </div>
              </div>

              <div className="ed-card-body">
                {about}
              </div>
            </div>

            <div className="ed-card">
              <div className="ed-card-head">
                <span>
                  Bank Information
                </span>

                <div className="ed-card-actions">
                  <button
                    className="ed-icon-btn"
                    type="button"
                    onClick={
                      openBankModal
                    }
                  >
                    <FiEdit2 />
                  </button>

                  <FiChevronDown />
                </div>
              </div>

              <div className="ed-card-body ed-four">
                <div>
                  <div className="ed-field-label">
                    Bank Name
                  </div>

                  <div className="ed-field-value">
                    {bankInfo.bankName}
                  </div>
                </div>

                <div>
                  <div className="ed-field-label">
                    Bank account no
                  </div>

                  <div className="ed-field-value">
                    {bankInfo.accountNo}
                  </div>
                </div>

                <div>
                  <div className="ed-field-label">
                    IFSC Code
                  </div>

                  <div className="ed-field-value">
                    {bankInfo.ifscCode}
                  </div>
                </div>

                <div>
                  <div className="ed-field-label">
                    Branch
                  </div>

                  <div className="ed-field-value">
                    {bankInfo.branchAddress}
                  </div>
                </div>
              </div>
            </div>

            <div className="ed-card">
              <div className="ed-card-head">
                <span>
                  Family Information
                </span>

                <div className="ed-card-actions">
                  <button
                    className="ed-icon-btn"
                    type="button"
                    onClick={
                      openFamilyModal
                    }
                  >
                    <FiEdit2 />
                  </button>

                  <FiChevronDown />
                </div>
              </div>

              <div className="ed-card-body ed-four">
                <div>
                  <div className="ed-field-label">
                    Name
                  </div>

                  <div className="ed-field-value">
                    {familyInfo.name}
                  </div>
                </div>

                <div>
                  <div className="ed-field-label">
                    Relationship
                  </div>

                  <div className="ed-field-value">
                    {
                      familyInfo.relationship
                    }
                  </div>
                </div>

                <div>
                  <div className="ed-field-label">
                    Phone
                  </div>

                  <div className="ed-field-value">
                    {familyInfo.phone}
                  </div>
                </div>

                <div>
                  <div className="ed-field-label">
                    Date Of Birth
                  </div>

                  <div className="ed-field-value">
                    {
                      familyInfo.dateOfBirth
                    }
                  </div>
                </div>
              </div>
            </div>

            <div className="ed-two-cards">
              <div className="ed-card">
                <div className="ed-card-head">
                  <span>
                    Education Details
                  </span>

                  <div className="ed-card-actions">
                    <button
                      className="ed-icon-btn"
                      type="button"
                      onClick={() =>
                        openEducationModal(
                          educationInfo[0]
                        )
                      }
                    >
                      <FiEdit2 />
                    </button>

                    <FiChevronDown />
                  </div>
                </div>

                <div className="ed-card-body">
                  {educationInfo.map(
                    (item, index) => (
                      <div
                        className="ed-edu-row"
                        key={
                          item.id ||
                          `${item.institutionName}-${index}`
                        }
                      >
                        <div className="ed-edu-main">
                          <div className="ed-muted">
                            {
                              item.institutionName
                            }
                          </div>

                          <div className="ed-substrong">
                            {item.course}
                          </div>
                        </div>

                        <div className="ed-date">
                          {item.startDate} -{" "}
                          {item.endDate}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="ed-card">
                <div className="ed-card-head">
                  <span>
                    Experience
                  </span>

                  <div className="ed-card-actions">
                    <button
                      className="ed-icon-btn"
                      type="button"
                      onClick={() =>
                        openExperienceModal(
                          experienceInfo[0]
                        )
                      }
                    >
                      <FiEdit2 />
                    </button>

                    <FiChevronDown />
                  </div>
                </div>

                <div className="ed-card-body">
                  {experienceInfo.map(
                    (item, index) => (
                      <div
                        className="ed-exp-row"
                        key={
                          item.id ||
                          `${item.companyName}-${index}`
                        }
                      >
                        <div className="ed-exp-main">
                          <div className="ed-substrong">
                            {
                              item.companyName
                            }
                          </div>

                          <div
                            className="ed-pill blue"
                            style={{
                              display:
                                "inline-block",
                              marginTop: 5,
                            }}
                          >
                            •{" "}
                            {
                              item.designation
                            }
                          </div>
                        </div>

                        <div className="ed-date">
                          {item.startDate} -{" "}
                          {item.currentlyWorking
                            ? "Present"
                            : item.endDate}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="ed-card ed-leave-card">
              <div className="ed-leave-title">
                Leave List
              </div>

              <div className="ed-filters">
                <select className="ed-date-select">
                  <option>
                    08/27/2026 - 09/02/2026
                  </option>
                  <option>
                    Today
                  </option>
                  <option>
                    Yesterday
                  </option>
                  <option>
                    Last 7 Days
                  </option>
                  <option>
                    Last 30 Days
                  </option>
                  <option>
                    This Year
                  </option>
                  <option>
                    Next Year
                  </option>
                  <option>
                    Custom Range
                  </option>
                </select>

                <select
                  className="ed-select"
                  value={leaveType}
                  onChange={(e) =>
                    setLeaveType(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Leave Type
                  </option>
                  <option>
                    Medical Leave
                  </option>
                  <option>
                    Annual Leave
                  </option>
                  <option>
                    Casual Leave
                  </option>
                </select>

                <select
                  className="ed-select"
                  value={approvedBy}
                  onChange={(e) =>
                    setApprovedBy(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Approved By
                  </option>
                  <option>
                    Douglas
                  </option>
                  <option>
                    Warren
                  </option>
                </select>

                <select
                  className="ed-select"
                  value={status}
                  onChange={(e) =>
                    setStatus(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Select Status
                  </option>
                  <option>
                    Approved
                  </option>
                  <option>
                    Pending
                  </option>
                  <option>
                    Rejected
                  </option>
                </select>

                <select
                  className="ed-select"
                  value={sort}
                  onChange={(e) =>
                    setSort(
                      e.target.value
                    )
                  }
                >
                  <option value="7">
                    Sort By : Last 7 Days
                  </option>
                  <option value="30">
                    Sort By : Last 30 Days
                  </option>
                </select>
              </div>

              <div className="ed-table-tools">
                <div className="ed-entries">
                  Row Per Page{" "}
                  <select
                    className="ed-select"
                    value={rowsPerPage}
                    onChange={(e) =>
                      setRowsPerPage(
                        Number(
                          e.target.value
                        )
                      )
                    }
                  >
                    <option>
                      10
                    </option>
                    <option>
                      20
                    </option>
                    <option>
                      50
                    </option>
                  </select>{" "}
                  Entries
                </div>

                <input
                  className="ed-search"
                  placeholder="Search"
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="ed-table-wrap">
                <table className="ed-table">
                  <thead>
                    <tr>
                      <th>
                        <input type="checkbox" />
                      </th>
                      <th>
                        Leave Reason
                      </th>
                      <th>
                        Date of request
                      </th>
                      <th>
                        From
                      </th>
                      <th>
                        To
                      </th>
                      <th>
                        Approved By
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {visibleLeaves.map(
                      (row) => (
                        <tr
                          key={row.id}
                        >
                          <td>
                            <input
                              type="checkbox"
                            />
                          </td>

                          <td>
                            <span className="ed-reason">
                              {row.reason}
                            </span>

                            <FiInfo className="info-blue" />
                          </td>

                          <td>
                            {
                              row.requestDate
                            }
                          </td>

                          <td>
                            {row.from}
                          </td>

                          <td>
                            {row.to}
                          </td>

                          <td>
                            <div className="ed-approver">
                              <div className="ed-mini-avatar"></div>

                              <div>
                                <div>
                                  {
                                    row.approver
                                  }
                                </div>

                                <div className="ed-role">
                                  {
                                    row.role
                                  }
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <div className="ed-table-footer">
                <span>
                  Showing 1 -{" "}
                  {visibleLeaves.length}{" "}
                  of{" "}
                  {visibleLeaves.length}{" "}
                  entries
                </span>

                <div className="ed-pagination">
                  <span>
                    ‹
                  </span>

                  <span className="ed-page-circle">
                    1
                  </span>

                  <span>
                    ›
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="ed-footer">
          <span>
            2014 - 2025 © SmartHR.
          </span>

          <span>
            Designed & Developed By{" "}
            <span className="gold">
              Dreams
            </span>
          </span>
        </div>
      </div>

      {/* =====================================================
          EDIT EMPLOYEE MODAL
      ===================================================== */}

      {employeeEditModalOpen && (
        <div
          className="ed-modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              setEmployeeEditModalOpen(
                false
              );
            }
          }}
        >
          <div className="ed-modal employee-edit-modal">
            <div className="ed-modal-header">
              <div className="ed-modal-title-wrap">
                <div className="ed-modal-title">
                  Edit Employee
                </div>

                <div className="ed-modal-subtitle">
                  Employee ID :{" "}
                  {
                    employeeEditForm.employeeId
                  }
                </div>
              </div>

              <button
                className="ed-modal-close"
                type="button"
                onClick={() =>
                  setEmployeeEditModalOpen(
                    false
                  )
                }
              >
                <FiX />
              </button>
            </div>

            <div className="ed-employee-tabs">
              <button
                className={`ed-employee-tab ${
                  employeeEditTab ===
                  "Basic Information"
                    ? "active"
                    : ""
                }`}
                type="button"
                onClick={() =>
                  setEmployeeEditTab(
                    "Basic Information"
                  )
                }
              >
                Basic Information
              </button>

              <button
                className={`ed-employee-tab ${
                  employeeEditTab ===
                  "Permissions"
                    ? "active"
                    : ""
                }`}
                type="button"
                onClick={() =>
                  setEmployeeEditTab(
                    "Permissions"
                  )
                }
              >
                Permissions
              </button>
            </div>

            <div className="ed-modal-body">
              {employeeEditTab ===
                "Basic Information" && (
                <>
                  <div className="ed-profile-upload">
                    <div className="ed-profile-preview">
                      {employeeEditForm.profileImage ? (
                        <img
                          src={
                            employeeEditForm.profileImage
                          }
                          alt="Profile Preview"
                        />
                      ) : (
                        "Profile"
                      )}
                    </div>

                    <div className="ed-upload-content">
                      <div className="ed-upload-title">
                        Upload Profile Image
                      </div>

                      <div className="ed-upload-subtitle">
                        Image should be below 4 mb
                      </div>

                      <label className="ed-upload-btn">
                        <FiUpload /> Upload Image

                        <input
                          className="ed-hidden-file"
                          type="file"
                          accept="image/*"
                          onChange={
                            handleProfileImageChange
                          }
                        />
                      </label>
                    </div>
                  </div>

                  <div className="ed-form-grid">
                    <div className="ed-form-group">
                      <label className="ed-form-label">
                        First Name
                        <span className="ed-required">
                          *
                        </span>
                      </label>

                      <input
                        className="ed-form-input"
                        placeholder="Enter first name"
                        value={
                          employeeEditForm.firstName
                        }
                        onChange={(e) =>
                          setEmployeeEditForm(
                            (p) => ({
                              ...p,
                              firstName:
                                e.target.value,
                            })
                          )
                        }
                      />
                    </div>

                    <div className="ed-form-group">
                      <label className="ed-form-label">
                        Last Name
                      </label>

                      <input
                        className="ed-form-input"
                        placeholder="Enter last name"
                        value={
                          employeeEditForm.lastName
                        }
                        onChange={(e) =>
                          setEmployeeEditForm(
                            (p) => ({
                              ...p,
                              lastName:
                                e.target.value,
                            })
                          )
                        }
                      />
                    </div>

                    <div className="ed-form-group">
                      <label className="ed-form-label">
                        Employee ID
                        <span className="ed-required">
                          *
                        </span>
                      </label>

                      <input
                        className="ed-form-input"
                        placeholder="Enter employee ID"
                        value={
                          employeeEditForm.employeeId
                        }
                        onChange={(e) =>
                          setEmployeeEditForm(
                            (p) => ({
                              ...p,
                              employeeId:
                                e.target.value,
                            })
                          )
                        }
                      />
                    </div>

                    <div className="ed-form-group">
                      <label className="ed-form-label">
                        Joining Date
                        <span className="ed-required">
                          *
                        </span>
                      </label>

                      <input
                        className="ed-form-input"
                        placeholder="Enter joining date"
                        value={
                          employeeEditForm.joiningDate
                        }
                        onChange={(e) =>
                          setEmployeeEditForm(
                            (p) => ({
                              ...p,
                              joiningDate:
                                e.target.value,
                            })
                          )
                        }
                      />
                    </div>

                    <div className="ed-form-group">
                      <label className="ed-form-label">
                        Username
                        <span className="ed-required">
                          *
                        </span>
                      </label>

                      <input
                        className="ed-form-input"
                        placeholder="Enter username"
                        value={
                          employeeEditForm.username
                        }
                        onChange={(e) =>
                          setEmployeeEditForm(
                            (p) => ({
                              ...p,
                              username:
                                e.target.value,
                            })
                          )
                        }
                      />
                    </div>

                    <div className="ed-form-group">
                      <label className="ed-form-label">
                        Email
                        <span className="ed-required">
                          *
                        </span>
                      </label>

                      <input
                        type="email"
                        className="ed-form-input"
                        placeholder="Enter email address"
                        value={
                          employeeEditForm.email
                        }
                        onChange={(e) =>
                          setEmployeeEditForm(
                            (p) => ({
                              ...p,
                              email:
                                e.target.value,
                            })
                          )
                        }
                      />
                    </div>

                    {/* PASSWORD REPLACED WITH BIRTHDAY */}
                    <div className="ed-form-group">
                      <label className="ed-form-label">
                        Birthday
                        <span className="ed-required">
                          *
                        </span>
                      </label>

                      <input
                        type="date"
                        className="ed-form-input"
                        value={
                          employeeEditForm.birthday
                        }
                        onChange={(e) =>
                          setEmployeeEditForm(
                            (p) => ({
                              ...p,
                              birthday:
                                e.target.value,
                            })
                          )
                        }
                      />
                    </div>

                    {/* CONFIRM PASSWORD REPLACED WITH ADDRESS */}
                    <div className="ed-form-group">
                      <label className="ed-form-label">
                        Address
                        <span className="ed-required">
                          *
                        </span>
                      </label>

                      <input
                        className="ed-form-input"
                        placeholder="Enter address"
                        value={
                          employeeEditForm.address
                        }
                        onChange={(e) =>
                          setEmployeeEditForm(
                            (p) => ({
                              ...p,
                              address:
                                e.target.value,
                            })
                          )
                        }
                      />
                    </div>

                    <div className="ed-form-group">
                      <label className="ed-form-label">
                        Phone Number
                        <span className="ed-required">
                          *
                        </span>
                      </label>

                      <input
                        className="ed-form-input"
                        placeholder="Enter phone number"
                        value={
                          employeeEditForm.phoneNumber
                        }
                        onChange={(e) =>
                          setEmployeeEditForm(
                            (p) => ({
                              ...p,
                              phoneNumber:
                                e.target.value,
                            })
                          )
                        }
                      />
                    </div>

                    {/* COMPANY REPLACED WITH GENDER CODE */}
                    <div className="ed-form-group">
                      <label className="ed-form-label">
                        Gender Code
                        <span className="ed-required">
                          *
                        </span>
                      </label>

                      <input
                        className="ed-form-input"
                        placeholder="Enter gender code"
                        value={
                          employeeEditForm.genderCode
                        }
                        onChange={(e) =>
                          setEmployeeEditForm(
                            (p) => ({
                              ...p,
                              genderCode:
                                e.target.value,
                            })
                          )
                        }
                      />
                    </div>

                    <div className="ed-form-group">
                      <label className="ed-form-label">
                        Department
                      </label>

                      <select
                        className="ed-form-select"
                        value={
                          employeeEditForm.department
                        }
                        onChange={(e) => {
                          const value =
                            e.target.value;

                          const item =
                            departments.find(
                              (d) =>
                                getDepartmentName(
                                  d
                                ) === value
                            );

                          const departmentId =
                            getLookupId(
                              item
                            );

                          setEmployeeEditForm(
                            (p) => ({
                              ...p,
                              department:
                                value,
                              departmentId,
                              designation:
                                "",
                              designationId:
                                "",
                            })
                          );

                          setEmployeeInfo(
                            (p) => ({
                              ...p,
                              departmentId,
                              designationId:
                                "",
                            })
                          );
                        }}
                      >
                        <option value="">
                          Select Department
                        </option>

                        {departments
                          .filter(
                            (item) =>
                              item?.isActive !==
                              false
                          )
                          .map(
                            (
                              item,
                              index
                            ) => (
                              <option
                                key={
                                  getLookupId(
                                    item
                                  ) ||
                                  index
                                }
                                value={getDepartmentName(
                                  item
                                )}
                              >
                                {getDepartmentName(
                                  item
                                )}
                              </option>
                            )
                          )}
                      </select>
                    </div>

                    <div className="ed-form-group">
                      <label className="ed-form-label">
                        Designation
                      </label>

                      <select
                        className="ed-form-select"
                        value={
                          employeeEditForm.designation
                        }
                        onChange={(e) => {
                          const value =
                            e.target.value;

                          const item =
                            designations.find(
                              (d) =>
                                getDesignationName(
                                  d
                                ) === value
                            );

                          const designationId =
                            getLookupId(
                              item
                            );

                          setEmployeeEditForm(
                            (p) => ({
                              ...p,
                              designation:
                                value,
                              designationId,
                            })
                          );

                          setEmployeeInfo(
                            (p) => ({
                              ...p,
                              designationId,
                            })
                          );
                        }}
                      >
                        <option value="">
                          Select Designation
                        </option>

                        {designations
                          .filter(
                            (item) =>
                              item?.isActive !==
                                false &&
                              (!employeeEditForm.department ||
                                !item?.departmentName ||
                                item.departmentName
                                  .toLowerCase() ===
                                  employeeEditForm.department.toLowerCase())
                          )
                          .map(
                            (
                              item,
                              index
                            ) => (
                              <option
                                key={
                                  getLookupId(
                                    item
                                  ) ||
                                  index
                                }
                                value={getDesignationName(
                                  item
                                )}
                              >
                                {getDesignationName(
                                  item
                                )}
                              </option>
                            )
                          )}
                      </select>
                    </div>

                    <div className="ed-form-group full">
                      <label className="ed-form-label">
                        About
                        <span className="ed-required">
                          *
                        </span>
                      </label>

                      <textarea
                        className="ed-form-textarea"
                        placeholder="Enter about employee"
                        value={
                          employeeEditForm.about
                        }
                        onChange={(e) =>
                          setEmployeeEditForm(
                            (p) => ({
                              ...p,
                              about:
                                e.target.value,
                            })
                          )
                        }
                      />
                    </div>
                  </div>
                </>
              )}

              {employeeEditTab ===
                "Permissions" && (
                <div>
                  <div className="ed-permission-title">
                    Permissions
                  </div>

                  <div className="ed-permission-description">
                    Select the permissions assigned
                    to this employee.
                  </div>

                  <div className="ed-permission-list">
                    {([
                      [
                        "dashboard",
                        "Dashboard",
                      ],
                      [
                        "employees",
                        "Employees",
                      ],
                      [
                        "attendance",
                        "Attendance",
                      ],
                      [
                        "leaves",
                        "Leaves",
                      ],
                      [
                        "payroll",
                        "Payroll",
                      ],
                      [
                        "reports",
                        "Reports",
                      ],
                    ] as const).map(
                      ([key, label]) => (
                        <div
                          className="ed-permission-item"
                          key={key}
                        >
                          <input
                            id={`perm-${key}`}
                            type="checkbox"
                            checked={
                              permissions[
                                key
                              ]
                            }
                            onChange={(e) =>
                              setPermissions(
                                (p) => ({
                                  ...p,
                                  [key]:
                                    e.target
                                      .checked,
                                })
                              )
                            }
                          />

                          <label
                            htmlFor={`perm-${key}`}
                          >
                            {label}
                          </label>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="ed-modal-footer">
              <button
                className="ed-cancel-btn"
                type="button"
                onClick={() =>
                  setEmployeeEditModalOpen(
                    false
                  )
                }
              >
                Cancel
              </button>

              <button
                className="ed-save-btn"
                type="button"
                onClick={
                  saveEmployeeInfo
                }
                disabled={
                  saving === "employee"
                }
              >
                {saving === "employee"
                  ? "Saving..."
                  : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          PERSONAL
      ===================================================== */}

      {personalModalOpen && (
        <div
          className="ed-modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              setPersonalModalOpen(
                false
              );
            }
          }}
        >
          <div className="ed-modal">
            <div className="ed-modal-header">
              <div className="ed-modal-title">
                Edit Personal Info
              </div>

              <button
                className="ed-modal-close"
                type="button"
                onClick={() =>
                  setPersonalModalOpen(
                    false
                  )
                }
              >
                <FiX />
              </button>
            </div>

            <div className="ed-modal-body">
              <div className="ed-form-grid">
                <div className="ed-form-group">
                  <label className="ed-form-label">
                    Passport No
                    <span className="ed-required">
                      *
                    </span>
                  </label>

                  <input
                    className="ed-form-input"
                    placeholder="Enter passport number"
                    value={
                      personalForm.passportNo
                    }
                    onChange={(e) =>
                      setPersonalForm(
                        (p) => ({
                          ...p,
                          passportNo:
                            e.target.value,
                        })
                      )
                    }
                  />
                </div>

                <div className="ed-form-group">
                  <label className="ed-form-label">
                    Passport Expiry Date
                    <span className="ed-required">
                      *
                    </span>
                  </label>

                  <input
                    type="date"
                    className="ed-form-input"
                    value={
                      personalForm.passportExpiryDate
                    }
                    onClick={(e) =>
                      (
                        e.currentTarget as HTMLInputElement
                      ).showPicker?.()
                    }
                    onChange={(e) =>
                      setPersonalForm(
                        (p) => ({
                          ...p,
                          passportExpiryDate:
                            e.target.value,
                        })
                      )
                    }
                  />
                </div>

                <div className="ed-form-group">
                  <label className="ed-form-label">
                    Nationality
                    <span className="ed-required">
                      *
                    </span>
                  </label>

                  <input
                    className="ed-form-input"
                    placeholder="Enter nationality"
                    value={
                      personalForm.nationality
                    }
                    onChange={(e) =>
                      setPersonalForm(
                        (p) => ({
                          ...p,
                          nationality:
                            e.target.value,
                        })
                      )
                    }
                  />
                </div>

                <div className="ed-form-group">
                  <label className="ed-form-label">
                    Religion
                  </label>

                  <input
                    className="ed-form-input"
                    placeholder="Enter religion"
                    value={
                      personalForm.religion
                    }
                    onChange={(e) =>
                      setPersonalForm(
                        (p) => ({
                          ...p,
                          religion:
                            e.target.value,
                        })
                      )
                    }
                  />
                </div>

                <div className="ed-form-group">
                  <label className="ed-form-label">
                    Marital status
                    <span className="ed-required">
                      *
                    </span>
                  </label>

                  <select
                    className="ed-form-select"
                    value={
                      personalForm.maritalStatus
                    }
                    onChange={(e) =>
                      setPersonalForm(
                        (p) => ({
                          ...p,
                          maritalStatus:
                            e.target.value,
                        })
                      )
                    }
                  >
                    <option value="">
                      Select
                    </option>

                    {MARITAL_STATUS_OPTIONS.map(
                      (option) => (
                        <option
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="ed-form-group">
                  <label className="ed-form-label">
                    Employment spouse
                  </label>

                  <input
                    className="ed-form-input"
                    placeholder="Enter employment spouse"
                    value={
                      personalForm.employmentSpouse
                    }
                    onChange={(e) =>
                      setPersonalForm(
                        (p) => ({
                          ...p,
                          employmentSpouse:
                            e.target.value,
                        })
                      )
                    }
                  />
                </div>

                <div className="ed-form-group">
                  <label className="ed-form-label">
                    No. of children
                  </label>

                  <input
                    type="number"
                    min="0"
                    className="ed-form-input"
                    placeholder="Enter number of children"
                    value={
                      personalForm.children
                    }
                    onChange={(e) =>
                      setPersonalForm(
                        (p) => ({
                          ...p,
                          children:
                            e.target.value,
                        })
                      )
                    }
                  />
                </div>

                {/* NEW PAN FIELD */}
                <div className="ed-form-group">
                  <label className="ed-form-label">
                    PAN No.
                  </label>

                  <input
                    className="ed-form-input"
                    placeholder="Enter PAN number"
                    value={
                      personalForm.panNo
                    }
                    onChange={(e) =>
                      setPersonalForm(
                        (p) => ({
                          ...p,
                          panNo:
                            e.target.value,
                        })
                      )
                    }
                  />
                </div>
              </div>
            </div>

            <div className="ed-modal-footer">
              <button
                className="ed-cancel-btn"
                type="button"
                onClick={() =>
                  setPersonalModalOpen(
                    false
                  )
                }
              >
                Cancel
              </button>

              <button
                className="ed-save-btn"
                type="button"
                onClick={
                  savePersonalInfo
                }
                disabled={
                  saving === "personal"
                }
              >
                {saving === "personal"
                  ? "Saving..."
                  : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          EMERGENCY
      ===================================================== */}

      {emergencyModalOpen && (
        <div
          className="ed-modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              setEmergencyModalOpen(
                false
              );
            }
          }}
        >
          <div className="ed-modal emergency-modal">
            <div className="ed-modal-header">
              <div className="ed-modal-title">
                Emergency Contact Details
              </div>

              <button
                className="ed-modal-close"
                type="button"
                onClick={() =>
                  setEmergencyModalOpen(
                    false
                  )
                }
              >
                <FiX />
              </button>
            </div>

            <div className="ed-modal-body">
              {[
                [
                  "Primary Contact Details",
                  "primary",
                ],
                [
                  "Secondary Contact Details",
                  "secondary",
                ],
              ].map(
                ([title, key]) => {
                  const contact =
                    emergencyForm[
                      key as
                        | "primary"
                        | "secondary"
                    ];

                  return (
                    <div
                      className="ed-contact-section"
                      key={key}
                    >
                      <div className="ed-contact-section-title">
                        {title}
                      </div>

                      <div className="ed-form-grid">
                        <div className="ed-form-group">
                          <label className="ed-form-label">
                            Name
                            <span className="ed-required">
                              *
                            </span>
                          </label>

                          <input
                            className="ed-form-input"
                            placeholder="Enter name"
                            value={
                              contact.name
                            }
                            onChange={(e) =>
                              setEmergencyForm(
                                (p) => ({
                                  ...p,
                                  [key]: {
                                    ...p[
                                      key as
                                        | "primary"
                                        | "secondary"
                                    ],
                                    name:
                                      e.target
                                        .value,
                                  },
                                })
                              )
                            }
                          />
                        </div>

                        <div className="ed-form-group">
                          <label className="ed-form-label">
                            Relationship
                          </label>

                          <input
                            className="ed-form-input"
                            placeholder="Enter relationship"
                            value={
                              contact.relationship
                            }
                            onChange={(e) =>
                              setEmergencyForm(
                                (p) => ({
                                  ...p,
                                  [key]: {
                                    ...p[
                                      key as
                                        | "primary"
                                        | "secondary"
                                    ],
                                    relationship:
                                      e.target
                                        .value,
                                  },
                                })
                              )
                            }
                          />
                        </div>

                        <div className="ed-form-group">
                          <label className="ed-form-label">
                            Phone No 1
                            <span className="ed-required">
                              *
                            </span>
                          </label>

                          <input
                            className="ed-form-input"
                            placeholder="Enter phone number"
                            value={
                              contact.phone1
                            }
                            onChange={(e) =>
                              setEmergencyForm(
                                (p) => ({
                                  ...p,
                                  [key]: {
                                    ...p[
                                      key as
                                        | "primary"
                                        | "secondary"
                                    ],
                                    phone1:
                                      e.target
                                        .value,
                                  },
                                })
                              )
                            }
                          />
                        </div>

                        <div className="ed-form-group">
                          <label className="ed-form-label">
                            Phone No 2
                          </label>

                          <input
                            className="ed-form-input"
                            placeholder="Enter alternate phone number"
                            value={
                              contact.phone2
                            }
                            onChange={(e) =>
                              setEmergencyForm(
                                (p) => ({
                                  ...p,
                                  [key]: {
                                    ...p[
                                      key as
                                        | "primary"
                                        | "secondary"
                                    ],
                                    phone2:
                                      e.target
                                        .value,
                                  },
                                })
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            <div className="ed-modal-footer">
              <button
                className="ed-cancel-btn"
                type="button"
                onClick={() =>
                  setEmergencyModalOpen(
                    false
                  )
                }
              >
                Cancel
              </button>

              <button
                className="ed-save-btn"
                type="button"
                onClick={
                  saveEmergencyContacts
                }
                disabled={
                  saving === "emergency"
                }
              >
                {saving === "emergency"
                  ? "Saving..."
                  : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          BANK
      ===================================================== */}

      {bankModalOpen && (
        <div
          className="ed-modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              setBankModalOpen(
                false
              );
            }
          }}
        >
          <div className="ed-modal bank-modal">
            <div className="ed-modal-header">
              <div className="ed-modal-title">
                Bank Details
              </div>

              <button
                className="ed-modal-close"
                type="button"
                onClick={() =>
                  setBankModalOpen(
                    false
                  )
                }
              >
                <FiX />
              </button>
            </div>

            <div className="ed-modal-body">
              <div className="ed-form-grid">
                <div className="ed-form-group full">
                  <label className="ed-form-label">
                    Bank Details
                    <span className="ed-required">
                      *
                    </span>
                  </label>

                  <input
                    className="ed-form-input"
                    placeholder="Enter bank name"
                    value={
                      bankForm.bankName
                    }
                    onChange={(e) =>
                      setBankForm(
                        (p) => ({
                          ...p,
                          bankName:
                            e.target.value,
                        })
                      )
                    }
                  />
                </div>

                <div className="ed-form-group">
                  <label className="ed-form-label">
                    Bank account No
                  </label>

                  <input
                    className="ed-form-input"
                    placeholder="Enter bank account number"
                    value={
                      bankForm.accountNo
                    }
                    onChange={(e) =>
                      setBankForm(
                        (p) => ({
                          ...p,
                          accountNo:
                            e.target.value,
                        })
                      )
                    }
                  />
                </div>

                <div className="ed-form-group">
                  <label className="ed-form-label">
                    IFSC Code
                  </label>

                  <input
                    className="ed-form-input"
                    placeholder="Enter IFSC code"
                    value={
                      bankForm.ifscCode
                    }
                    onChange={(e) =>
                      setBankForm(
                        (p) => ({
                          ...p,
                          ifscCode:
                            e.target.value,
                        })
                      )
                    }
                  />
                </div>

                <div className="ed-form-group full">
                  <label className="ed-form-label">
                    Branch Address
                  </label>

                  <input
                    className="ed-form-input"
                    placeholder="Enter branch address"
                    value={
                      bankForm.branchAddress
                    }
                    onChange={(e) =>
                      setBankForm(
                        (p) => ({
                          ...p,
                          branchAddress:
                            e.target.value,
                        })
                      )
                    }
                  />
                </div>
              </div>
            </div>

            <div className="ed-modal-footer">
              <button
                className="ed-cancel-btn"
                type="button"
                onClick={() =>
                  setBankModalOpen(
                    false
                  )
                }
              >
                Cancel
              </button>

              <button
                className="ed-save-btn"
                type="button"
                onClick={
                  saveBankInfo
                }
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          FAMILY
      ===================================================== */}

      {familyModalOpen && (
        <div
          className="ed-modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              setFamilyModalOpen(
                false
              );
            }
          }}
        >
          <div className="ed-modal family-modal">
            <div className="ed-modal-header">
              <div className="ed-modal-title">
                Family Information
              </div>

              <button
                className="ed-modal-close"
                type="button"
                onClick={() =>
                  setFamilyModalOpen(
                    false
                  )
                }
              >
                <FiX />
              </button>
            </div>

            <div className="ed-modal-body">
              <div className="ed-form-grid">
                <div className="ed-form-group">
                  <label className="ed-form-label">
                    Name
                    <span className="ed-required">
                      *
                    </span>
                  </label>

                  <input
                    className="ed-form-input"
                    placeholder="Enter family member name"
                    value={
                      familyForm.name
                    }
                    onChange={(e) =>
                      setFamilyForm(
                        (p) => ({
                          ...p,
                          name:
                            e.target.value,
                        })
                      )
                    }
                  />
                </div>

                <div className="ed-form-group">
                  <label className="ed-form-label">
                    Relationship
                  </label>

                  <input
                    className="ed-form-input"
                    placeholder="Enter relationship"
                    value={
                      familyForm.relationship
                    }
                    onChange={(e) =>
                      setFamilyForm(
                        (p) => ({
                          ...p,
                          relationship:
                            e.target.value,
                        })
                      )
                    }
                  />
                </div>

                <div className="ed-form-group">
                  <label className="ed-form-label">
                    Phone
                  </label>

                  <input
                    className="ed-form-input"
                    placeholder="Enter phone number"
                    value={
                      familyForm.phone
                    }
                    onChange={(e) =>
                      setFamilyForm(
                        (p) => ({
                          ...p,
                          phone:
                            e.target.value,
                        })
                      )
                    }
                  />
                </div>

                <div className="ed-form-group">
                  <label className="ed-form-label">
                    Date Of Birth
                    <span className="ed-required">
                      *
                    </span>
                  </label>

                  <input
  type="date"
  className="ed-form-input"
  value={familyForm.dateOfBirth}
  onClick={(e) =>
    (e.currentTarget as HTMLInputElement).showPicker?.()
  }
  onChange={(e) =>
    setFamilyForm((p) => ({
      ...p,
      dateOfBirth: e.target.value,
    }))
  }
/>
                </div>
              </div>
            </div>

            <div className="ed-modal-footer">
              <button
                className="ed-cancel-btn"
                type="button"
                onClick={() =>
                  setFamilyModalOpen(
                    false
                  )
                }
              >
                Cancel
              </button>

              <button
                className="ed-save-btn"
                type="button"
                onClick={
                  saveFamilyInfo
                }
                disabled={
                  saving === "family"
                }
              >
                {saving === "family"
                  ? "Saving..."
                  : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          EDUCATION
      ===================================================== */}

      {educationModalOpen && (
        <div
          className="ed-modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              setEducationModalOpen(
                false
              );
            }
          }}
        >
          <div className="ed-modal education-modal">
            <div className="ed-modal-header">
              <div className="ed-modal-title">
                Education Information
              </div>

              <button
                className="ed-modal-close"
                type="button"
                onClick={() =>
                  setEducationModalOpen(
                    false
                  )
                }
              >
                <FiX />
              </button>
            </div>

            <div className="ed-modal-body">
              <div className="ed-form-grid">
                <div className="ed-form-group full">
                  <label className="ed-form-label">
                    Institution Name
                    <span className="ed-required">
                      *
                    </span>
                  </label>

                  <input
                    className="ed-form-input"
                    placeholder="Enter institution name"
                    value={
                      educationForm.institutionName
                    }
                    onChange={(e) =>
                      setEducationForm(
                        (p) => ({
                          ...p,
                          institutionName:
                            e.target.value,
                        })
                      )
                    }
                  />
                </div>

                <div className="ed-form-group full">
                  <label className="ed-form-label">
                    Course
                    <span className="ed-required">
                      *
                    </span>
                  </label>

                  <input
                    className="ed-form-input"
                    placeholder="Enter course"
                    value={
                      educationForm.course
                    }
                    onChange={(e) =>
                      setEducationForm(
                        (p) => ({
                          ...p,
                          course:
                            e.target.value,
                        })
                      )
                    }
                  />
                </div>

                <div className="ed-form-group">
                  <label className="ed-form-label">
                    Start Date
                    <span className="ed-required">
                      *
                    </span>
                  </label>

                 <input
  type="date"
  className="ed-form-input"
  value={educationForm.startDate}
  onClick={(e) =>
    (e.currentTarget as HTMLInputElement).showPicker?.()
  }
  onChange={(e) =>
    setEducationForm((p) => ({
      ...p,
      startDate: e.target.value,
    }))
  }
/>
                </div>

                <div className="ed-form-group">
                  <label className="ed-form-label">
                    End Date
                    <span className="ed-required">
                      *
                    </span>
                  </label>
<input
  type="date"
  className="ed-form-input"
  value={educationForm.endDate}
  onClick={(e) =>
    (e.currentTarget as HTMLInputElement).showPicker?.()
  }
  onChange={(e) =>
    setEducationForm((p) => ({
      ...p,
      endDate: e.target.value,
    }))
  }
/>
                </div>
              </div>
            </div>

            <div className="ed-modal-footer">
              <button
                className="ed-cancel-btn"
                type="button"
                onClick={() =>
                  setEducationModalOpen(
                    false
                  )
                }
              >
                Cancel
              </button>

              <button
                className="ed-save-btn"
                type="button"
                onClick={
                  saveEducationInfo
                }
                disabled={
                  saving === "education"
                }
              >
                {saving === "education"
                  ? "Saving..."
                  : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          EXPERIENCE
      ===================================================== */}

      {experienceModalOpen && (
        <div
          className="ed-modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              setExperienceModalOpen(
                false
              );
            }
          }}
        >
          <div className="ed-modal experience-modal">
            <div className="ed-modal-header">
              <div className="ed-modal-title">
                Company Information
              </div>

              <button
                className="ed-modal-close"
                type="button"
                onClick={() =>
                  setExperienceModalOpen(
                    false
                  )
                }
              >
                <FiX />
              </button>
            </div>

            <div className="ed-modal-body">
              <div className="ed-form-grid">
                <div className="ed-form-group full">
                  <label className="ed-form-label">
                    Previous Company Name
                    <span className="ed-required">
                      *
                    </span>
                  </label>

                  <input
                    className="ed-form-input"
                    placeholder="Enter previous company name"
                    value={
                      experienceForm.companyName
                    }
                    onChange={(e) =>
                      setExperienceForm(
                        (p) => ({
                          ...p,
                          companyName:
                            e.target.value,
                        })
                      )
                    }
                  />
                </div>

                <div className="ed-form-group full">
                  <label className="ed-form-label">
                    Designation
                    <span className="ed-required">
                      *
                    </span>
                  </label>

                  <input
                    className="ed-form-input"
                    placeholder="Enter designation"
                    value={
                      experienceForm.designation
                    }
                    onChange={(e) =>
                      setExperienceForm(
                        (p) => ({
                          ...p,
                          designation:
                            e.target.value,
                        })
                      )
                    }
                  />
                </div>

                <div className="ed-form-group">
                  <label className="ed-form-label">
                    Start Date
                    <span className="ed-required">
                      *
                    </span>
                  </label>

                 <input
  type="date"
  className="ed-form-input"
  value={experienceForm.startDate}
  onClick={(e) =>
    (e.currentTarget as HTMLInputElement).showPicker?.()
  }
  onChange={(e) =>
    setExperienceForm((p) => ({
      ...p,
      startDate: e.target.value,
    }))
  }
/>
                </div>

                <div className="ed-form-group">
                  <label className="ed-form-label">
                    End Date
                  </label>

                 <input
  type="date"
  className={`ed-form-input ${
    experienceForm.currentlyWorking
      ? "ed-input-disabled"
      : ""
  }`}
  disabled={experienceForm.currentlyWorking}
  value={experienceForm.endDate}
  onClick={(e) => {
    if (!experienceForm.currentlyWorking) {
      (e.currentTarget as HTMLInputElement).showPicker?.();
    }
  }}
  onChange={(e) =>
    setExperienceForm((p) => ({
      ...p,
      endDate: e.target.value,
    }))
  }
/>
                </div>

                <div className="ed-form-group full">
                  <div className="ed-checkbox-row">
                    <input
                      id="currently-working"
                      type="checkbox"
                      checked={
                        experienceForm.currentlyWorking
                      }
                      onChange={(e) =>
                        setExperienceForm(
                          (p) => ({
                            ...p,
                            currentlyWorking:
                              e.target.checked,
                            endDate:
                              e.target
                                .checked
                                ? ""
                                : p.endDate,
                          })
                        )
                      }
                    />

                    <label
                      htmlFor="currently-working"
                      className="ed-checkbox-label"
                    >
                      Check if you working
                      present
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="ed-modal-footer">
              <button
                className="ed-cancel-btn"
                type="button"
                onClick={() =>
                  setExperienceModalOpen(
                    false
                  )
                }
              >
                Cancel
              </button>

              <button
                className="ed-save-btn"
                type="button"
                onClick={
                  saveExperienceInfo
                }
                disabled={
                  saving ===
                  "experience"
                }
              >
                {saving ===
                "experience"
                  ? "Saving..."
                  : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeDetails;
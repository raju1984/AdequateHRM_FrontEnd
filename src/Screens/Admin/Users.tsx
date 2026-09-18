import React, {
  FormEvent,
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
  CalendarDays,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

/* =========================================
   TYPES
========================================= */

type UserRole = "Employee" | "HR";

type UserStatus = "Active" | "Inactive";

interface UserItem {
  id: number;

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

  role: UserRole;

  status: UserStatus;
}

interface UserForm {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  company: string;
  department: string;
  designation: string;
  about: string;
}

/* =========================================
   ADD USER FORM TYPES
========================================= */

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
  address: string;
  city: string;
  state: string;
  zip: string;

  phoneNumber: string;
  emailAddress: string;

  eligibleToWork: string;
  veteran: string;
  convicted: string;

  positionDesired: string;
  availableStartDate: string;
  desiredPay: string;

  employmentType: string;

  education: EducationRow[];
  references: ReferenceRow[];
  employmentHistory: EmploymentRow[];
}

/* =========================================
   INITIAL DATA
========================================= */

const initialUsers: UserItem[] = [
  {
    id: 1,
    firstName: "Anthony",
    lastName: "Lewis",
    username: "anthony",
    name: "Anthony Lewis",
    email: "anthony@example.com",
    phone: "988765544",
    company: "Adequate",
    department: "IT",
    designation: "Developer",
    about:
      "Frontend developer working on HR management applications.",
    createdDate: "12 Sep 2024",
    role: "Employee",
    status: "Active",
  },

  {
    id: 2,
    firstName: "Brian",
    lastName: "Villalobos",
    username: "brian",
    name: "Brian Villalobos",
    email: "brian@example.com",
    phone: "987654321",
    company: "Adequate",
    department: "Sales",
    designation: "Sales Executive",
    about:
      "Responsible for sales activities and customer relationships.",
    createdDate: "24 Oct 2024",
    role: "Employee",
    status: "Active",
  },

  {
    id: 3,
    firstName: "Sophie",
    lastName: "Headrick",
    username: "sophie",
    name: "Sophie Headrick",
    email: "sophie@example.com",
    phone: "987654322",
    company: "Adequate",
    department: "HR",
    designation: "HR Executive",
    about:
      "Handles employee management and HR related activities.",
    createdDate: "18 Feb 2024",
    role: "HR",
    status: "Active",
  },

  {
    id: 4,
    firstName: "Stephan",
    lastName: "Peralt",
    username: "stephan",
    name: "Stephan Peralt",
    email: "peral@example.com",
    phone: "987654323",
    company: "Adequate",
    department: "Finance",
    designation: "Accountant",
    about:
      "Handles accounting and financial operations.",
    createdDate: "17 Oct 2024",
    role: "Employee",
    status: "Active",
  },

  {
    id: 5,
    firstName: "Thomas",
    lastName: "Bordelon",
    username: "thomas",
    name: "Thomas Bordelon",
    email: "thomas@example.com",
    phone: "987654324",
    company: "Adequate",
    department: "HR",
    designation: "HR Manager",
    about:
      "Manages HR operations and employee relations.",
    createdDate: "20 Jul 2024",
    role: "HR",
    status: "Active",
  },

  {
    id: 6,
    firstName: "Doglas",
    lastName: "Martini",
    username: "doglas",
    name: "Doglas Martini",
    email: "martniwr@example.com",
    phone: "987654325",
    company: "Adequate",
    department: "Operations",
    designation: "Manager",
    about:
      "Manages daily business operations.",
    createdDate: "10 Apr 2024",
    role: "Employee",
    status: "Active",
  },

  {
    id: 7,
    firstName: "Cameron",
    lastName: "Drake",
    username: "cameron",
    name: "Cameron Drake",
    email: "cameron@example.com",
    phone: "987654326",
    company: "Adequate",
    department: "Marketing",
    designation: "Marketing Executive",
    about:
      "Works on marketing campaigns and brand activities.",
    createdDate: "29 Aug 2024",
    role: "HR",
    status: "Active",
  },

  {
    id: 8,
    firstName: "Harvey",
    lastName: "Smith",
    username: "harvey",
    name: "Harvey Smith",
    email: "harvey@example.com",
    phone: "987654327",
    company: "Adequate",
    department: "IT",
    designation: "Designer",
    about:
      "Works on UI and visual design requirements.",
    createdDate: "22 Feb 2024",
    role: "Employee",
    status: "Inactive",
  },

  {
    id: 9,
    firstName: "Michael",
    lastName: "Walker",
    username: "michael",
    name: "Michael Walker",
    email: "michael@example.com",
    phone: "987654328",
    company: "Adequate",
    department: "Sales",
    designation: "Sales Manager",
    about:
      "Manages sales team and business development.",
    createdDate: "03 Nov 2024",
    role: "HR",
    status: "Active",
  },

  {
    id: 10,
    firstName: "Doris",
    lastName: "Crowley",
    username: "doris",
    name: "Doris Crowley",
    email: "doris@example.com",
    phone: "987654329",
    company: "Adequate",
    department: "Operations",
    designation: "Manager",
    about:
      "Handles operations and team coordination.",
    createdDate: "17 Dec 2024",
    role: "HR",
    status: "Active",
  },
];

/* =========================================
   EMPTY USER FORM
========================================= */

const emptyForm: UserForm = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  company: "",
  department: "",
  designation: "",
  about: "",
};

/* =========================================
   EMPTY APPLICATION FORM
========================================= */

const createEmptyApplicationForm =
  (): ApplicationForm => ({
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
      {
        name: "",
        title: "",
        company: "",
        phone: "",
      },
      {
        name: "",
        title: "",
        company: "",
        phone: "",
      },
      {
        name: "",
        title: "",
        company: "",
        phone: "",
      },
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

/* =========================================
   DROPDOWN DATA
========================================= */

const departments = [
  "IT",
  "HR",
  "Finance",
  "Sales",
  "Marketing",
  "Operations",
];

const designations = [
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

/* =========================================
   COMPONENT
========================================= */

const Users: React.FC = () => {
  const [users, setUsers] =
    useState<UserItem[]>(initialUsers);

  const [search, setSearch] =
    useState("");

  const [roleFilter, setRoleFilter] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  const [sortBy, setSortBy] =
    useState("Last 7 Days");

  const [rowsPerPage, setRowsPerPage] =
    useState(10);

  const [currentPage, setCurrentPage] =
    useState(1);

  const [selected, setSelected] =
    useState<number[]>([]);

  /* =========================================
     PAGE STATE
  ========================================= */

  const [showAddPage, setShowAddPage] =
    useState(false);

  /* =========================================
     MODALS
  ========================================= */

  const [editOpen, setEditOpen] =
    useState(false);

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  const [editingUser, setEditingUser] =
    useState<UserItem | null>(null);

  const [deleteId, setDeleteId] =
    useState<number | null>(null);

  /* =========================================
     USER FORM
  ========================================= */

  const [form, setForm] =
    useState<UserForm>(emptyForm);

  /* =========================================
     APPLICATION FORM
  ========================================= */

  const [
    applicationForm,
    setApplicationForm,
  ] = useState<ApplicationForm>(
    createEmptyApplicationForm()
  );

  /* =========================================
     FILTER / SEARCH / SORT
  ========================================= */

  const filteredUsers = useMemo(() => {
    let result = [...users];

    if (search.trim()) {
      const q = search
        .trim()
        .toLowerCase();

      result = result.filter(
        (item) =>
          item.name
            .toLowerCase()
            .includes(q) ||
          item.email
            .toLowerCase()
            .includes(q) ||
          item.role
            .toLowerCase()
            .includes(q) ||
          item.status
            .toLowerCase()
            .includes(q) ||
          item.department
            .toLowerCase()
            .includes(q) ||
          item.designation
            .toLowerCase()
            .includes(q)
      );
    }

    if (roleFilter) {
      result = result.filter(
        (item) =>
          item.role === roleFilter
      );
    }

    if (statusFilter) {
      result = result.filter(
        (item) =>
          item.status === statusFilter
      );
    }

    if (sortBy === "Ascending") {
      result.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    if (sortBy === "Descending") {
      result.sort((a, b) =>
        b.name.localeCompare(a.name)
      );
    }

    if (sortBy === "Recently Added") {
      result.sort((a, b) => b.id - a.id);
    }

    return result;
  }, [
    users,
    search,
    roleFilter,
    statusFilter,
    sortBy,
  ]);

  /* =========================================
     PAGINATION
  ========================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredUsers.length /
        rowsPerPage
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const visibleUsers =
    filteredUsers.slice(
      (safeCurrentPage - 1) *
        rowsPerPage,
      safeCurrentPage *
        rowsPerPage
    );

  /* =========================================
     CHECKBOX
  ========================================= */

  const allVisibleSelected =
    visibleUsers.length > 0 &&
    visibleUsers.every((item) =>
      selected.includes(item.id)
    );

  const handleSelectAll = () => {
    const ids = visibleUsers.map(
      (item) => item.id
    );

    if (allVisibleSelected) {
      setSelected((prev) =>
        prev.filter(
          (id) => !ids.includes(id)
        )
      );
    } else {
      setSelected((prev) => [
        ...new Set([
          ...prev,
          ...ids,
        ]),
      ]);
    }
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter(
            (item) => item !== id
          )
        : [...prev, id]
    );
  };

  /* =========================================
     OPEN ADD USER PAGE
  ========================================= */

  const openAddPage = () => {
    setApplicationForm(
      createEmptyApplicationForm()
    );

    setShowAddPage(true);
  };

  const closeAddPage = () => {
    setShowAddPage(false);

    setApplicationForm(
      createEmptyApplicationForm()
    );
  };

  /* =========================================
     APPLICATION FORM UPDATE
  ========================================= */

  const updateApplicationField = <
    K extends keyof ApplicationForm
  >(
    field: K,
    value: ApplicationForm[K]
  ) => {
    setApplicationForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* =========================================
     EDUCATION
  ========================================= */

  const updateEducation = (
    index: number,
    field: keyof EducationRow,
    value: string
  ) => {
    setApplicationForm((prev) => {
      const education = [
        ...prev.education,
      ];

      education[index] = {
        ...education[index],
        [field]: value,
      };

      return {
        ...prev,
        education,
      };
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

  const removeEducationRow = (
    index: number
  ) => {
    setApplicationForm((prev) => ({
      ...prev,

      education:
        prev.education.length > 1
          ? prev.education.filter(
              (_, i) => i !== index
            )
          : prev.education,
    }));
  };

  /* =========================================
     REFERENCES
  ========================================= */

  const updateReference = (
    index: number,
    field: keyof ReferenceRow,
    value: string
  ) => {
    setApplicationForm((prev) => {
      const references = [
        ...prev.references,
      ];

      references[index] = {
        ...references[index],
        [field]: value,
      };

      return {
        ...prev,
        references,
      };
    });
  };

  const addReferenceRow = () => {
    setApplicationForm((prev) => ({
      ...prev,

      references: [
        ...prev.references,

        {
          name: "",
          title: "",
          company: "",
          phone: "",
        },
      ],
    }));
  };

  const removeReferenceRow = (
    index: number
  ) => {
    setApplicationForm((prev) => ({
      ...prev,

      references:
        prev.references.length > 1
          ? prev.references.filter(
              (_, i) => i !== index
            )
          : prev.references,
    }));
  };

  /* =========================================
     EMPLOYMENT
  ========================================= */

  const updateEmployment = (
    index: number,
    field: keyof EmploymentRow,
    value: string
  ) => {
    setApplicationForm((prev) => {
      const employmentHistory = [
        ...prev.employmentHistory,
      ];

      employmentHistory[index] = {
        ...employmentHistory[index],
        [field]: value,
      };

      return {
        ...prev,
        employmentHistory,
      };
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

  const removeEmploymentRow = (
    index: number
  ) => {
    setApplicationForm((prev) => ({
      ...prev,

      employmentHistory:
        prev.employmentHistory.length > 1
          ? prev.employmentHistory.filter(
              (_, i) => i !== index
            )
          : prev.employmentHistory,
    }));
  };

  /* =========================================
     SAVE APPLICATION
  ========================================= */

  const handleApplicationSubmit = (
    e: FormEvent
  ) => {
    e.preventDefault();

    const fullName =
      applicationForm.positionDesired.trim() ||
      "New User";

    const newUser: UserItem = {
      id:
        users.length > 0
          ? Math.max(
              ...users.map(
                (item) => item.id
              )
            ) + 1
          : 1,

      firstName: fullName,
      lastName: "",

      username:
        fullName
          .toLowerCase()
          .replace(/\s+/g, ""),

      name: fullName,

      email:
        applicationForm.emailAddress.trim(),

      phone:
        applicationForm.phoneNumber.trim(),

      company: "",

      department: "",

      designation:
        applicationForm.positionDesired.trim(),

      about: "",

      createdDate:
        new Date().toLocaleDateString(
          "en-GB",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        ),

      role: "Employee",

      status: "Active",
    };

    setUsers((prev) => [
      ...prev,
      newUser,
    ]);

    closeAddPage();
  };

  /* =========================================
     EDIT USER
  ========================================= */

  const openEditModal = (
    user: UserItem
  ) => {
    setEditingUser(user);

    setForm({
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      password: "",
      confirmPassword: "",
      phone: user.phone,
      company: user.company,
      department: user.department,
      designation: user.designation,
      about: user.about,
    });

    setEditOpen(true);
  };

  const closeEditModal = () => {
    setEditOpen(false);

    setEditingUser(null);

    setForm({
      ...emptyForm,
    });
  };

  const updateForm = (
    field: keyof UserForm,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditUser = (
    e: FormEvent
  ) => {
    e.preventDefault();

    if (!editingUser) return;

    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.email.trim()
    ) {
      return;
    }

    if (
      form.password &&
      form.password !==
        form.confirmPassword
    ) {
      return;
    }

    setUsers((prev) =>
      prev.map((item) =>
        item.id === editingUser.id
          ? {
              ...item,

              firstName:
                form.firstName.trim(),

              lastName:
                form.lastName.trim(),

              username:
                form.username.trim(),

              name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),

              email:
                form.email.trim(),

              phone:
                form.phone.trim(),

              company:
                form.company.trim(),

              department:
                form.department,

              designation:
                form.designation,

              about:
                form.about.trim(),
            }
          : item
      )
    );

    closeEditModal();
  };

  /* =========================================
     DELETE
  ========================================= */

  const openDeleteModal = (
    id: number
  ) => {
    setDeleteId(id);

    setDeleteOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteId(null);

    setDeleteOpen(false);
  };

  const handleDelete = () => {
    if (deleteId === null) return;

    setUsers((prev) =>
      prev.filter(
        (item) => item.id !== deleteId
      )
    );

    setSelected((prev) =>
      prev.filter(
        (id) => id !== deleteId
      )
    );

    closeDeleteModal();
  };

  /* =========================================
     ADD USER APPLICATION PAGE
  ========================================= */

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

          /* =================================
             HEADER
          ================================= */

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

          /* =================================
             MAIN CARD
          ================================= */

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

          /* =================================
             SECTIONS
          ================================= */

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

          /* =================================
             FORM TABLE
          ================================= */

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

          /* =================================
             PERSONAL INFORMATION
          ================================= */

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

          /* =================================
             POSITION
          ================================= */

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

          /* =================================
             ADD BUTTONS
          ================================= */

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

          /* =================================
             REFERENCES
          ================================= */

          .reference-table th:last-child,
          .reference-table td:last-child {
            width: 52px;
            min-width: 52px;
            text-align: center;
          }

          .reference-table td:last-child {
            padding: 7px;
          }

          /* =================================
             EMPLOYMENT HISTORY
          ================================= */

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

          .employment-table th:nth-child(1) {
            width: 20%;
          }

          .employment-table th:nth-child(2) {
            width: 17%;
          }

          .employment-table th:nth-child(3) {
            width: 15%;
          }

          .employment-table th:nth-child(4) {
            width: 13%;
          }

          .employment-table th:nth-child(5) {
            width: 13%;
          }

          .employment-table th:nth-child(6) {
            width: 13%;
          }

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

          /* =================================
             FOOTER
          ================================= */

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

          /* =================================
             EDIT MODAL
          ================================= */

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

          .users-form-modal {
            width: 800px;
            max-width: calc(100vw - 30px);
            max-height: calc(100vh - 30px);
            overflow-y: auto;
            border-radius: 10px;
            background: #fff;
            box-shadow: 0 20px 55px rgba(0,0,0,.22);
          }

          .users-modal-header {
            height: 68px;
            padding: 0 20px;
            border-bottom: 1px solid #e3e7eb;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .users-modal-header h3 {
            margin: 0;
            color: #1e2b49;
            font-size: 20px;
            font-weight: 700;
          }

          .users-modal-close {
            width: 32px;
            height: 32px;
            border: 0;
            border-radius: 7px;
            background: #f5f6f8;
            color: #667085;
            cursor: pointer;
            font-size: 22px;
          }

          .users-modal-close:hover {
            background: #f0f1f3;
            color: #14213d;
          }

          .users-modal-body {
            padding: 23px;
          }

          .users-form-grid {
            display: grid;
            grid-template-columns: repeat(2,minmax(0,1fr));
            gap: 18px 24px;
          }

          .users-form-group label {
            display: block;
            margin-bottom: 7px;
            color: #263452;
            font-size: 13px;
            font-weight: 600;
          }

          .users-required {
            color: #e53935;
            margin-left: 3px;
          }

          .users-form-group input,
          .users-form-group select {
            width: 100%;
            height: 42px;
            padding: 0 11px;
            border: 1px solid #dce1e7;
            border-radius: 7px;
            outline: none;
            background: #fff;
            color: #26344d;
            font-size: 13px;
            font-family: inherit;
          }

          .users-form-group input:focus,
          .users-form-group select:focus,
          .users-about:focus {
            border-color: var(--ochre);
            box-shadow: 0 0 0 3px rgba(196,147,50,.1);
          }

          .users-about-group {
            grid-column: 1 / -1;
          }

          .users-about {
            width: 100%;
            min-height: 85px;
            padding: 11px;
            resize: vertical;
            border: 1px solid #dce1e7;
            border-radius: 7px;
            outline: none;
            font-family: inherit;
            font-size: 13px;
          }

          .users-modal-footer {
            min-height: 68px;
            padding: 11px 23px;
            border-top: 1px solid #e4e7eb;
            background: #fff;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
          }

          .users-modal-cancel,
          .users-modal-save {
            min-height: 40px;
            padding: 0 18px;
            border-radius: 7px;
            font-size: 13px;
            cursor: pointer;
          }

          .users-modal-cancel {
            border: 1px solid #dfe3e8;
            background: #fff;
            color: #26344d;
          }

          .users-modal-save {
            border: 1px solid var(--ochre);
            background: var(--ochre);
            color: #fff;
            font-weight: 600;
          }

          .users-modal-save:hover {
            background: var(--ochre-dark);
          }

          /* =================================
             DELETE MODAL
          ================================= */

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
            color: #172033;
          }

          .users-delete-confirm {
            background: #e32929;
            color: #fff;
            font-weight: 600;
          }

          /* =================================
             RESPONSIVE - ADD USER
          ================================= */

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

          /* =================================
             USERS LIST
          ================================= */

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
          }

          .users-date-filter {
            width: 195px;
          }

          .users-role-filter {
            width: 77px;
          }

          .users-status-filter {
            width: 91px;
          }

          .users-sort-filter {
            width: 178px;
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

          @media(max-width:900px) {
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

            .users-form-grid {
              grid-template-columns: 1fr;
            }

            .users-about-group {
              grid-column: auto;
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
            }

            .users-date-filter,
            .users-role-filter,
            .users-status-filter,
            .users-sort-filter {
              width: 100%;
            }
          }
          `}
        </style>

        <div className="application-page">

          {/* =====================================
              PAGE HEADER
          ===================================== */}

          <div className="application-top">

            <div className="application-heading-wrapper">

              <div className="application-heading-icon">
                <UserRound size={23} />
              </div>

              <div>

                <h1 className="application-heading">
                  Add New User
                </h1>

                <p className="application-subtitle">
                  Add employee information, education,
                  references and employment history.
                </p>

                <div className="application-breadcrumb">

                  {/* <Link to="/admin/dashboard">
                    <i className="ti ti-home" />
                  </Link> */}

                  {/* <span>/</span>

                  <button
                    type="button"
                    onClick={closeAddPage}
                    style={{
                      border: 0,
                      background: "transparent",
                      padding: 0,
                      color: "#c49332",
                      cursor: "pointer",
                      fontSize: "13px",
                    }}
                  >
                    Users
                  </button>

                  <span>/</span>

                  <span>Add User</span> */}

                </div>

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

          {/* =====================================
              APPLICATION CARD
          ===================================== */}

          <div className="application-card">

            <form
              className="application-form"
              onSubmit={
                handleApplicationSubmit
              }
            >

              {/* =================================
                  PERSONAL INFORMATION
              ================================= */}

              <section className="application-section">

                <h2 className="application-section-title">
                  <UserRound size={18} />
                  Personal Information
                </h2>

                <table className="application-table">

                  <tbody>

                    <tr>
                      <th colSpan={2}>
                        Name
                      </th>

                      <th>
                        Address
                      </th>

                      <th>
                        City
                      </th>

                      <th>
                        State
                      </th>
                    </tr>

                    <tr>
                      <td colSpan={2}>
                        <input
                          className="personal-input"
                          type="text"
                          placeholder="Full name"
                        />
                      </td>

                      <td>
                        <input
                          type="text"
                          placeholder="Address"
                          value={
                            applicationForm.address
                          }
                          onChange={(e) =>
                            updateApplicationField(
                              "address",
                              e.target.value
                            )
                          }
                        />
                      </td>

                      <td>
                        <input
                          type="text"
                          placeholder="City"
                          value={
                            applicationForm.city
                          }
                          onChange={(e) =>
                            updateApplicationField(
                              "city",
                              e.target.value
                            )
                          }
                        />
                      </td>

                      <td>
                        <input
                          type="text"
                          placeholder="State"
                          value={
                            applicationForm.state
                          }
                          onChange={(e) =>
                            updateApplicationField(
                              "state",
                              e.target.value
                            )
                          }
                        />
                      </td>
                    </tr>

                    <tr>
                      <th>
                        Zip
                      </th>

                      <th>
                        Phone number
                      </th>

                      <th colSpan={2}>
                        Email address
                      </th>

                      <th>
                        Country
                      </th>
                    </tr>

                    <tr>
                      <td>
                        <input
                          type="text"
                          placeholder="Zip code"
                          value={
                            applicationForm.zip
                          }
                          onChange={(e) =>
                            updateApplicationField(
                              "zip",
                              e.target.value
                            )
                          }
                        />
                      </td>

                      <td>
                        <input
                          type="text"
                          placeholder="Phone number"
                          value={
                            applicationForm.phoneNumber
                          }
                          onChange={(e) =>
                            updateApplicationField(
                              "phoneNumber",
                              e.target.value
                            )
                          }
                        />
                      </td>

                      <td colSpan={2}>
                        <input
                          type="email"
                          placeholder="Email address"
                          value={
                            applicationForm.emailAddress
                          }
                          onChange={(e) =>
                            updateApplicationField(
                              "emailAddress",
                              e.target.value
                            )
                          }
                        />
                      </td>

                      <td>
                        <input
                          type="text"
                          defaultValue="India"
                        />
                      </td>
                    </tr>

                    <tr>

                      <td
                        colSpan={2}
                        className="question-cell"
                      >

                        <span className="question-text">
                          Are you legally eligible to work in the US?
                        </span>

                        <div className="radio-group">

                          <label className="radio-option">
                            <input
                              type="radio"
                              name="eligible"
                              checked={
                                applicationForm.eligibleToWork ===
                                "Yes"
                              }
                              onChange={() =>
                                updateApplicationField(
                                  "eligibleToWork",
                                  "Yes"
                                )
                              }
                            />
                            Yes
                          </label>

                          <label className="radio-option">
                            <input
                              type="radio"
                              name="eligible"
                              checked={
                                applicationForm.eligibleToWork ===
                                "No"
                              }
                              onChange={() =>
                                updateApplicationField(
                                  "eligibleToWork",
                                  "No"
                                )
                              }
                            />
                            No
                          </label>

                        </div>

                      </td>

                      <td
                        className="question-cell"
                      >

                        <span className="question-text">
                          Are you a veteran?
                        </span>

                        <div className="radio-group">

                          <label className="radio-option">
                            <input
                              type="radio"
                              name="veteran"
                              checked={
                                applicationForm.veteran ===
                                "Yes"
                              }
                              onChange={() =>
                                updateApplicationField(
                                  "veteran",
                                  "Yes"
                                )
                              }
                            />
                            Yes
                          </label>

                          <label className="radio-option">
                            <input
                              type="radio"
                              name="veteran"
                              checked={
                                applicationForm.veteran ===
                                "No"
                              }
                              onChange={() =>
                                updateApplicationField(
                                  "veteran",
                                  "No"
                                )
                              }
                            />
                            No
                          </label>

                        </div>

                      </td>

                      <td
                        colSpan={2}
                        className="question-cell"
                      >

                        <span className="question-text">
                          If selected for employment are you willing to be subject to a background check?
                        </span>

                        <div className="radio-group">

                          <label className="radio-option">
                            <input
                              type="radio"
                              name="convicted"
                              checked={
                                applicationForm.convicted ===
                                "Yes"
                              }
                              onChange={() =>
                                updateApplicationField(
                                  "convicted",
                                  "Yes"
                                )
                              }
                            />
                            Yes
                          </label>

                          <label className="radio-option">
                            <input
                              type="radio"
                              name="convicted"
                              checked={
                                applicationForm.convicted ===
                                "No"
                              }
                              onChange={() =>
                                updateApplicationField(
                                  "convicted",
                                  "No"
                                )
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

              {/* =================================
                  POSITION
              ================================= */}

              <section className="application-section">

                <h2 className="application-section-title">
                  <BriefcaseBusiness size={18} />
                  Position
                </h2>

                <div className="position-grid">

                  {/* POSITION DROPDOWN */}
                  <div className="position-field">

                    <div className="position-label">
                      Position you are applying for
                    </div>

                    <select
                      value={
                        applicationForm.positionDesired
                      }
                      onChange={(e) =>
                        updateApplicationField(
                          "positionDesired",
                          e.target.value
                        )
                      }
                    >

                      <option value="">
                        Select Position
                      </option>

                      {designations.map(
                        (designation) => (
                          <option
                            key={designation}
                            value={designation}
                          >
                            {designation}
                          </option>
                        )
                      )}

                    </select>

                  </div>

                  <div className="position-field">

                    <div className="position-label">
                      Available start date
                    </div>

                    <input
                      type="date"
                      value={
                        applicationForm.availableStartDate
                      }
                      onChange={(e) =>
                        updateApplicationField(
                          "availableStartDate",
                          e.target.value
                        )
                      }
                    />

                  </div>

                  <div className="position-field">

                    <div className="position-label">
                      Desired pay
                    </div>

                    <input
                      type="text"
                      placeholder="Enter desired pay"
                      value={
                        applicationForm.desiredPay
                      }
                      onChange={(e) =>
                        updateApplicationField(
                          "desiredPay",
                          e.target.value
                        )
                      }
                    />

                  </div>

                </div>

                <div className="employment-type-row">

                  <span className="employment-type-title">
                    Employment desired
                  </span>

                  <label className="employment-checkbox">

                    <input
                      type="checkbox"
                      checked={
                        applicationForm.employmentType ===
                        "Full time"
                      }
                      onChange={(e) =>
                        updateApplicationField(
                          "employmentType",
                          e.target.checked
                            ? "Full time"
                            : ""
                        )
                      }
                    />

                    Full time

                  </label>

                  <label className="employment-checkbox">

                    <input
                      type="checkbox"
                      checked={
                        applicationForm.employmentType ===
                        "Part time"
                      }
                      onChange={(e) =>
                        updateApplicationField(
                          "employmentType",
                          e.target.checked
                            ? "Part time"
                            : ""
                        )
                      }
                    />

                    Part time

                  </label>

                  <label className="employment-checkbox">

                    <input
                      type="checkbox"
                      checked={
                        applicationForm.employmentType ===
                        "Seasonal/Temporary"
                      }
                      onChange={(e) =>
                        updateApplicationField(
                          "employmentType",
                          e.target.checked
                            ? "Seasonal/Temporary"
                            : ""
                        )
                      }
                    />

                    Seasonal / Temporary

                  </label>

                </div>

              </section>

              {/* =================================
                  EDUCATION
              ================================= */}

              <section className="application-section">

                <h2 className="application-section-title">
                  <GraduationCap size={18} />
                  Education
                </h2>

                <div className="table-with-actions">

                  <table className="application-table">

                    <thead>

                      <tr>

                        <th>
                          School name
                        </th>

                        <th>
                          Location
                        </th>

                        <th>
                          Years attended
                        </th>

                        <th>
                          Degree received
                        </th>

                        <th>
                          Major
                        </th>

                        <th
                          style={{
                            width: "52px",
                          }}
                        >
                          #
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {applicationForm.education.map(
                        (
                          education,
                          index
                        ) => (

                          <tr key={index}>

                            <td>
                              <input
                                type="text"
                                placeholder="School name"
                                value={
                                  education.schoolName
                                }
                                onChange={(e) =>
                                  updateEducation(
                                    index,
                                    "schoolName",
                                    e.target.value
                                  )
                                }
                              />
                            </td>

                            <td>
                              <input
                                type="text"
                                placeholder="Location"
                                value={
                                  education.location
                                }
                                onChange={(e) =>
                                  updateEducation(
                                    index,
                                    "location",
                                    e.target.value
                                  )
                                }
                              />
                            </td>

                            <td>
                              <input
                                type="text"
                                placeholder="Years"
                                value={
                                  education.yearsAttended
                                }
                                onChange={(e) =>
                                  updateEducation(
                                    index,
                                    "yearsAttended",
                                    e.target.value
                                  )
                                }
                              />
                            </td>

                            <td>
                              <input
                                type="text"
                                placeholder="Degree"
                                value={
                                  education.degreeReceived
                                }
                                onChange={(e) =>
                                  updateEducation(
                                    index,
                                    "degreeReceived",
                                    e.target.value
                                  )
                                }
                              />
                            </td>

                            <td>
                              <input
                                type="text"
                                placeholder="Major"
                                value={
                                  education.major
                                }
                                onChange={(e) =>
                                  updateEducation(
                                    index,
                                    "major",
                                    e.target.value
                                  )
                                }
                              />
                            </td>

                            <td
                              style={{
                                textAlign:
                                  "center",
                                padding:
                                  "7px",
                              }}
                            >

                              <button
                                type="button"
                                className="row-delete-btn"
                                onClick={() =>
                                  removeEducationRow(
                                    index
                                  )
                                }
                              >
                                <X size={14} />
                              </button>

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

                <div className="education-actions">

                  <button
                    type="button"
                    className="small-add-btn"
                    onClick={
                      addEducationRow
                    }
                  >
                    <Plus size={14} />
                    Add Education
                  </button>

                </div>

              </section>

              {/* =================================
                  REFERENCES
              ================================= */}

              <section className="application-section">

                <h2 className="application-section-title">
                  <UsersRound size={18} />
                  References
                </h2>

                <div className="table-with-actions">

                  <table className="application-table reference-table">

                    <thead>

                      <tr>

                        <th>
                          Name
                        </th>

                        <th>
                          Title
                        </th>

                        <th>
                          Company
                        </th>

                        <th>
                          Phone
                        </th>

                        <th>
                          #
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {applicationForm.references.map(
                        (
                          reference,
                          index
                        ) => (

                          <tr key={index}>

                            <td>
                              <input
                                type="text"
                                placeholder="Reference name"
                                value={
                                  reference.name
                                }
                                onChange={(e) =>
                                  updateReference(
                                    index,
                                    "name",
                                    e.target.value
                                  )
                                }
                              />
                            </td>

                            <td>
                              <input
                                type="text"
                                placeholder="Title"
                                value={
                                  reference.title
                                }
                                onChange={(e) =>
                                  updateReference(
                                    index,
                                    "title",
                                    e.target.value
                                  )
                                }
                              />
                            </td>

                            <td>
                              <input
                                type="text"
                                placeholder="Company"
                                value={
                                  reference.company
                                }
                                onChange={(e) =>
                                  updateReference(
                                    index,
                                    "company",
                                    e.target.value
                                  )
                                }
                              />
                            </td>

                            <td>
                              <input
                                type="text"
                                placeholder="Phone"
                                value={
                                  reference.phone
                                }
                                onChange={(e) =>
                                  updateReference(
                                    index,
                                    "phone",
                                    e.target.value
                                  )
                                }
                              />
                            </td>

                            <td>

                              <button
                                type="button"
                                className="row-delete-btn"
                                onClick={() =>
                                  removeReferenceRow(
                                    index
                                  )
                                }
                              >
                                <X size={14} />
                              </button>

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

                <div className="reference-actions">

                  <button
                    type="button"
                    className="small-add-btn"
                    onClick={
                      addReferenceRow
                    }
                  >
                    <Plus size={14} />
                    Add Reference
                  </button>

                </div>

              </section>

              {/* =================================
                  EMPLOYMENT HISTORY
              ================================= */}

              <section className="application-section">

                <h2 className="application-section-title">
                  <BriefcaseBusiness size={18} />
                  Employment History
                </h2>

                <div className="employment-wrapper">

                  <table className="application-table employment-table">

                    <thead>

                      <tr>

                        <th>
                          Employer
                        </th>

                        <th>
                          Job title
                        </th>

                        <th>
                          Dates employed
                        </th>

                        <th>
                          Work phone
                        </th>

                        <th>
                          Starting pay rate
                        </th>

                        <th>
                          Ending pay rate
                        </th>

                        <th>
                          #
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {applicationForm.employmentHistory.map(
                        (
                          employment,
                          index
                        ) => (

                          <React.Fragment
                            key={index}
                          >

                            <tr>

                              <td>
                                <input
                                  type="text"
                                  placeholder="Employer"
                                  value={
                                    employment.employer
                                  }
                                  onChange={(e) =>
                                    updateEmployment(
                                      index,
                                      "employer",
                                      e.target.value
                                    )
                                  }
                                />
                              </td>

                              <td>
                                <input
                                  type="text"
                                  placeholder="Job title"
                                  value={
                                    employment.jobTitle
                                  }
                                  onChange={(e) =>
                                    updateEmployment(
                                      index,
                                      "jobTitle",
                                      e.target.value
                                    )
                                  }
                                />
                              </td>

                              <td>
                                <input
                                  type="text"
                                  placeholder="e.g. 2022 - 2025"
                                  value={
                                    employment.datesEmployed
                                  }
                                  onChange={(e) =>
                                    updateEmployment(
                                      index,
                                      "datesEmployed",
                                      e.target.value
                                    )
                                  }
                                />
                              </td>

                              <td>
                                <input
                                  type="text"
                                  placeholder="Work phone"
                                  value={
                                    employment.workPhone
                                  }
                                  onChange={(e) =>
                                    updateEmployment(
                                      index,
                                      "workPhone",
                                      e.target.value
                                    )
                                  }
                                />
                              </td>

                              <td>
                                <input
                                  type="text"
                                  placeholder="Starting rate"
                                  value={
                                    employment.startingPayRate
                                  }
                                  onChange={(e) =>
                                    updateEmployment(
                                      index,
                                      "startingPayRate",
                                      e.target.value
                                    )
                                  }
                                />
                              </td>

                              <td>
                                <input
                                  type="text"
                                  placeholder="Ending rate"
                                  value={
                                    employment.endingPayRate
                                  }
                                  onChange={(e) =>
                                    updateEmployment(
                                      index,
                                      "endingPayRate",
                                      e.target.value
                                    )
                                  }
                                />
                              </td>

                              <td
                                style={{
                                  width:
                                    "55px",
                                  textAlign:
                                    "center",
                                  padding:
                                    "7px",
                                }}
                              >

                                <button
                                  type="button"
                                  className="row-delete-btn"
                                  onClick={() =>
                                    removeEmploymentRow(
                                      index
                                    )
                                  }
                                >
                                  <X size={14} />
                                </button>

                              </td>

                            </tr>

                            <tr>

                              <th>
                                Address
                              </th>

                              <th>
                                City
                              </th>

                              <th>
                                State
                              </th>

                              <th>
                                Zip
                              </th>

                              <th colSpan={3}>
                                Employment details
                              </th>

                            </tr>

                            <tr>

                              <td>
                                <input
                                  type="text"
                                  placeholder="Address"
                                  value={
                                    employment.address
                                  }
                                  onChange={(e) =>
                                    updateEmployment(
                                      index,
                                      "address",
                                      e.target.value
                                    )
                                  }
                                />
                              </td>

                              <td>
                                <input
                                  type="text"
                                  placeholder="City"
                                  value={
                                    employment.city
                                  }
                                  onChange={(e) =>
                                    updateEmployment(
                                      index,
                                      "city",
                                      e.target.value
                                    )
                                  }
                                />
                              </td>

                              <td>
                                <input
                                  type="text"
                                  placeholder="State"
                                  value={
                                    employment.state
                                  }
                                  onChange={(e) =>
                                    updateEmployment(
                                      index,
                                      "state",
                                      e.target.value
                                    )
                                  }
                                />
                              </td>

                              <td>
                                <input
                                  type="text"
                                  placeholder="Zip"
                                  value={
                                    employment.zip
                                  }
                                  onChange={(e) =>
                                    updateEmployment(
                                      index,
                                      "zip",
                                      e.target.value
                                    )
                                  }
                                />
                              </td>

                              <td colSpan={3}>

                                <input
                                  type="text"
                                  placeholder="Additional employment information"
                                />

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
                    onClick={
                      addEmploymentRow
                    }
                  >
                    <Plus size={14} />
                    Add Employment
                  </button>

                </div>

              </section>

              {/* =================================
                  FOOTER
              ================================= */}

              <div className="application-footer">

                <button
                  type="button"
                  className="application-cancel"
                  onClick={
                    closeAddPage
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="application-save"
                >
                  Save User
                </button>

              </div>

            </form>

          </div>

        </div>
      </>
    );
  }

  /* =========================================
     USERS LIST PAGE
  ========================================= */

  return (
    <>
      <style>
        {`
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
        }

        .users-date-filter {
          width: 195px;
        }

        .users-role-filter {
          width: 77px;
        }

        .users-status-filter {
          width: 91px;
        }

        .users-sort-filter {
          width: 178px;
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

        

        @media(max-width:900px) {
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

          .users-form-grid {
            grid-template-columns: 1fr;
          }

          .users-about-group {
            grid-column: auto;
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
          }

          .users-date-filter,
          .users-role-filter,
          .users-status-filter,
          .users-sort-filter {
            width: 100%;
          }
        }
        `}
      </style>

      <div className="users-page">

        {/* =====================================
            HEADER
        ===================================== */}

        <div className="users-page-header">

          <div>

            <h1 className="users-page-title">
              Users
            </h1>

            <div className="users-breadcrumb">

              <Link to="/admin/dashboard">
                <i className="ti ti-home" />
              </Link>

              <span>/</span>

              <span>
                Users
              </span>

            </div>

          </div>

          <button
            type="button"
            className="users-add-btn"
            onClick={
              openAddPage
            }
          >
            <CirclePlus size={15} />
            Add User
          </button>

        </div>

        {/* =====================================
            USERS CARD
        ===================================== */}

        <div className="users-card">

          <div className="users-card-header">

            <h5>
              Users List
            </h5>

            <div className="users-filters">

              <select
                className="users-filter users-date-filter"
                defaultValue="range"
              >
                <option value="range">
                  08/28/2026 - 09/03/20
                </option>

                <option value="week">
                  Last 7 Days
                </option>

                <option value="month">
                  Last Month
                </option>
              </select>

              <select
                className="users-filter users-role-filter"
                value={
                  roleFilter
                }
                onChange={(e) => {
                  setRoleFilter(
                    e.target.value
                  );
                  setCurrentPage(1);
                }}
              >
                <option value="">
                  Role
                </option>

                <option value="Employee">
                  Employee
                </option>

                <option value="HR">
                  HR
                </option>
              </select>

              <select
                className="users-filter users-status-filter"
                value={
                  statusFilter
                }
                onChange={(e) => {
                  setStatusFilter(
                    e.target.value
                  );
                  setCurrentPage(1);
                }}
              >
                <option value="">
                  Status
                </option>

                <option value="Active">
                  Active
                </option>

                <option value="Inactive">
                  Inactive
                </option>
              </select>

              <select
                className="users-filter users-sort-filter"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(
                    e.target.value
                  );
                  setCurrentPage(1);
                }}
              >
                <option value="Last 7 Days">
                  Sort By : Last 7 Days
                </option>

                <option value="Recently Added">
                  Recently Added
                </option>

                <option value="Ascending">
                  Ascending
                </option>

                <option value="Descending">
                  Descending
                </option>

                <option value="Last Month">
                  Last Month
                </option>
              </select>

            </div>

          </div>

          {/* =====================================
              TOOLBAR
          ===================================== */}

          <div className="users-toolbar">

            <div className="users-row-control">

              <span>
                Row Per Page
              </span>

              <select
                className="users-row-select"
                value={
                  rowsPerPage
                }
                onChange={(e) => {
                  setRowsPerPage(
                    Number(
                      e.target.value
                    )
                  );
                  setCurrentPage(1);
                }}
              >
                <option value={10}>
                  10
                </option>

                <option value={20}>
                  20
                </option>

                <option value={30}>
                  30
                </option>

                <option value={40}>
                  40
                </option>
              </select>

              <span>
                Entries
              </span>

            </div>

            <input
              type="text"
              className="users-search"
              placeholder="Search"
              value={search}
              onChange={(e) => {
                setSearch(
                  e.target.value
                );
                setCurrentPage(1);
              }}
            />

          </div>

          {/* =====================================
              TABLE
          ===================================== */}

          <div className="users-table-wrapper">

            <table className="users-table">

              <thead>

                <tr>

                  <th className="users-check-col">

                    <input
                      type="checkbox"
                      className="users-checkbox"
                      checked={
                        allVisibleSelected
                      }
                      onChange={
                        handleSelectAll
                      }
                    />

                  </th>

                  <th>
                    Name
                    <span className="users-sort">
                      ↑↓
                    </span>
                  </th>

                  <th>
                    Email
                    <span className="users-sort">
                      ↑↓
                    </span>
                  </th>

                  <th>
                    Created Date
                    <span className="users-sort">
                      ↑↓
                    </span>
                  </th>

                  <th>
                    Role
                    <span className="users-sort">
                      ↑↓
                    </span>
                  </th>

                  <th>
                    Status
                    <span className="users-sort">
                      ↑↓
                    </span>
                  </th>

                  <th>
                    <span className="users-sort">
                      ↑↓
                    </span>
                  </th>

                </tr>

              </thead>

              <tbody>

                {visibleUsers.map(
                  (user) => (

                    <tr key={user.id}>

                      <td className="users-check-col">

                        <input
                          type="checkbox"
                          className="users-checkbox"
                          checked={selected.includes(
                            user.id
                          )}
                          onChange={() =>
                            toggleSelect(
                              user.id
                            )
                          }
                        />

                      </td>

                      <td>

                        <div className="users-user-cell">

                          <div className="users-avatar" />

                          <div className="users-name">
                            {user.name}
                          </div>

                        </div>

                      </td>

                      <td>
                        {user.email}
                      </td>

                      <td>
                        {user.createdDate}
                      </td>

                      <td>

                        <span
                          className={`users-role-badge ${
                            user.role ===
                            "Employee"
                              ? "users-role-employee"
                              : "users-role-hr"
                          }`}
                        >
                          {user.role}
                        </span>

                      </td>

                      <td>

                        <span
                          className={`users-status ${
                            user.status ===
                            "Active"
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
                            title="Edit"
                            onClick={() =>
                              openEditModal(
                                user
                              )
                            }
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            type="button"
                            className="users-action-btn"
                            title="Delete"
                            onClick={() =>
                              openDeleteModal(
                                user.id
                              )
                            }
                          >
                            <Trash2 size={15} />
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

                {visibleUsers.length ===
                  0 && (

                  <tr>

                    <td
                      colSpan={7}
                      style={{
                        height:
                          "90px",
                        textAlign:
                          "center",
                      }}
                    >
                      No users found
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

          {/* =====================================
              FOOTER
          ===================================== */}

          <div className="users-table-footer">

            <div>

              Showing{" "}

              {filteredUsers.length ===
              0
                ? 0
                : (safeCurrentPage -
                    1) *
                    rowsPerPage +
                  1}

              {" - "}

              {Math.min(
                safeCurrentPage *
                  rowsPerPage,
                filteredUsers.length
              )}

              {" of "}

              {filteredUsers.length}

              {" entries"}

            </div>

            <div className="users-pagination">

              <button
                type="button"
                className="users-page-arrow"
                disabled={
                  safeCurrentPage ===
                  1
                }
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.max(
                        1,
                        page - 1
                      )
                  )
                }
              >
                <ChevronLeft size={16} />
              </button>

              <span className="users-current-page">
                {safeCurrentPage}
              </span>

              <button
                type="button"
                className="users-page-arrow"
                disabled={
                  safeCurrentPage ===
                  totalPages
                }
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.min(
                        totalPages,
                        page + 1
                      )
                  )
                }
              >
                <ChevronRight size={16} />
              </button>

            </div>

          </div>

        </div>

      </div>

      {/* =========================================
          EDIT USER MODAL
      ========================================= */}

      {editOpen &&
        editingUser && (

          <div className="users-modal-overlay">

            <div className="users-form-modal">

              <div className="users-modal-header">

                <h3>
                  Edit User
                </h3>

                <button
                  type="button"
                  className="users-modal-close"
                  onClick={
                    closeEditModal
                  }
                >
                  ×
                </button>

              </div>

              <form
                onSubmit={
                  handleEditUser
                }
              >

                <div className="users-modal-body">

                  <div className="users-form-grid">

                    <UserInput
                      label="First Name"
                      required
                      value={
                        form.firstName
                      }
                      onChange={(value) =>
                        updateForm(
                          "firstName",
                          value
                        )
                      }
                    />

                    <UserInput
                      label="Last Name"
                      value={
                        form.lastName
                      }
                      onChange={(value) =>
                        updateForm(
                          "lastName",
                          value
                        )
                      }
                    />

                    <UserInput
                      label="Username"
                      required
                      value={
                        form.username
                      }
                      onChange={(value) =>
                        updateForm(
                          "username",
                          value
                        )
                      }
                    />

                    <UserInput
                      label="Email"
                      required
                      value={
                        form.email
                      }
                      onChange={(value) =>
                        updateForm(
                          "email",
                          value
                        )
                      }
                    />

                    <UserInput
                      label="Phone Number"
                      value={
                        form.phone
                      }
                      onChange={(value) =>
                        updateForm(
                          "phone",
                          value
                        )
                      }
                    />

                    <UserInput
                      label="Company"
                      value={
                        form.company
                      }
                      onChange={(value) =>
                        updateForm(
                          "company",
                          value
                        )
                      }
                    />

                    <SelectInput
                      label="Department"
                      value={
                        form.department
                      }
                      placeholder="Select Department"
                      options={
                        departments
                      }
                      onChange={(value) =>
                        updateForm(
                          "department",
                          value
                        )
                      }
                    />

                    <SelectInput
                      label="Designation"
                      value={
                        form.designation
                      }
                      placeholder="Select Designation"
                      options={
                        designations
                      }
                      onChange={(value) =>
                        updateForm(
                          "designation",
                          value
                        )
                      }
                    />

                    <div className="users-form-group users-about-group">

                      <label>
                        About
                      </label>

                      <textarea
                        className="users-about"
                        rows={3}
                        value={
                          form.about
                        }
                        onChange={(e) =>
                          updateForm(
                            "about",
                            e.target.value
                          )
                        }
                      />

                    </div>

                  </div>

                </div>

                <div className="users-modal-footer">

                  <button
                    type="button"
                    className="users-modal-cancel"
                    onClick={
                      closeEditModal
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="users-modal-save"
                  >
                    Save Changes
                  </button>

                </div>

              </form>

            </div>

          </div>

        )}

      {/* =========================================
          DELETE MODAL
      ========================================= */}

      {deleteOpen && (

        <div className="users-modal-overlay">

          <div className="users-delete-modal">

            <div className="users-delete-icon">

              <Trash2
                size={31}
                strokeWidth={2.2}
              />

            </div>

            <h3>
              Confirm Delete
            </h3>

            <p>
              You want to delete all
              the marked items, this
              cant be undone once you
              delete.
            </p>

            <div className="users-delete-actions">

              <button
                type="button"
                className="users-delete-cancel"
                onClick={
                  closeDeleteModal
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="users-delete-confirm"
                onClick={
                  handleDelete
                }
              >
                Yes, Delete
              </button>

            </div>

          </div>

        </div>

      )}

    </>
  );
};

/* =========================================
   REUSABLE INPUT
========================================= */

interface UserInputProps {
  label: string;
  value: string;
  required?: boolean;
  onChange: (value: string) => void;
}

const UserInput = ({
  label,
  value,
  required = false,
  onChange,
}: UserInputProps) => {
  return (
    <div className="users-form-group">

      <label>

        {label}

        {required && (
          <span className="users-required">
            *
          </span>
        )}

      </label>

      <input
        type="text"
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
      />

    </div>
  );
};

/* =========================================
   REUSABLE SELECT
========================================= */

interface SelectInputProps {
  label: string;
  value: string;
  placeholder: string;
  options: string[];
  required?: boolean;
  onChange: (value: string) => void;
}

const SelectInput = ({
  label,
  value,
  placeholder,
  options,
  required = false,
  onChange,
}: SelectInputProps) => {
  return (
    <div className="users-form-group">

      <label>

        {label}

        {required && (
          <span className="users-required">
            *
          </span>
        )}

      </label>

      <select
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
      >

        <option value="">
          {placeholder}
        </option>

        {options.map(
          (option) => (

            <option
              key={option}
              value={option}
            >
              {option}
            </option>

          )
        )}

      </select>

    </div>
  );
};

export default Users;
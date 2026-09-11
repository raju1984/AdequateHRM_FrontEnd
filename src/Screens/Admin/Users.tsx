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
  Eye,
  EyeOff,
} from "lucide-react";

/* =========================================
   TYPES
========================================= */

type UserRole = "Employee" | "HR";

type UserStatus =
  | "Active"
  | "Inactive";

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
   EMPTY FORM
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
    useState<UserItem[]>(
      initialUsers
    );

  const [search, setSearch] =
    useState("");

  const [roleFilter, setRoleFilter] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("");

  const [sortBy, setSortBy] =
    useState("Last 7 Days");

  const [
    rowsPerPage,
    setRowsPerPage,
  ] = useState(10);

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const [selected, setSelected] =
    useState<number[]>([]);

  /* =========================================
     MODALS
  ========================================= */

  const [addOpen, setAddOpen] =
    useState(false);

  const [editOpen, setEditOpen] =
    useState(false);

  const [
    deleteOpen,
    setDeleteOpen,
  ] = useState(false);

  const [
    editingUser,
    setEditingUser,
  ] = useState<UserItem | null>(
    null
  );

  const [deleteId, setDeleteId] =
    useState<number | null>(null);

  /* =========================================
     FORM
  ========================================= */

  const [form, setForm] =
    useState<UserForm>(emptyForm);

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  /* =========================================
     FILTER / SEARCH / SORT
  ========================================= */

  const filteredUsers =
    useMemo(() => {
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
            item.status ===
            statusFilter
        );
      }

      if (
        sortBy === "Ascending"
      ) {
        result.sort((a, b) =>
          a.name.localeCompare(
            b.name
          )
        );
      }

      if (
        sortBy === "Descending"
      ) {
        result.sort((a, b) =>
          b.name.localeCompare(
            a.name
          )
        );
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

  const safeCurrentPage =
    Math.min(
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
    const ids =
      visibleUsers.map(
        (item) => item.id
      );

    if (allVisibleSelected) {
      setSelected((prev) =>
        prev.filter(
          (id) =>
            !ids.includes(id)
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

  const toggleSelect = (
    id: number
  ) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter(
            (item) =>
              item !== id
          )
        : [...prev, id]
    );
  };

  /* =========================================
     ADD USER
  ========================================= */

  const openAddModal = () => {
    setForm({
      ...emptyForm,
    });

    setShowPassword(false);

    setShowConfirmPassword(false);

    setAddOpen(true);
  };

  const closeAddModal = () => {
    setAddOpen(false);

    setForm({
      ...emptyForm,
    });

    setShowPassword(false);

    setShowConfirmPassword(false);
  };

  const handleAddUser = (
    e: FormEvent
  ) => {
    e.preventDefault();

    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.email.trim() ||
      !form.department ||
      !form.designation
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

    const newUser: UserItem = {
      id:
        users.length > 0
          ? Math.max(
              ...users.map(
                (item) =>
                  item.id
              )
            ) + 1
          : 1,

      firstName:
        form.firstName.trim(),

      lastName:
        form.lastName.trim(),

      username:
        form.username.trim(),

      name: `${form.firstName.trim()} ${form.lastName.trim()}`,

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

      createdDate:
        "03 Sep 2026",

      role: "Employee",

      status: "Active",
    };

    setUsers((prev) => [
      ...prev,
      newUser,
    ]);

    closeAddModal();
  };

  /* =========================================
     EDIT USER
  ========================================= */

  const openEditModal = (
    user: UserItem
  ) => {
    setEditingUser(user);

    setForm({
      firstName:
        user.firstName,

      lastName:
        user.lastName,

      username:
        user.username,

      email:
        user.email,

      password: "",

      confirmPassword: "",

      phone:
        user.phone,

      company:
        user.company,

      department:
        user.department,

      designation:
        user.designation,

      about:
        user.about,
    });

    setShowPassword(false);

    setShowConfirmPassword(false);

    setEditOpen(true);
  };

  const closeEditModal = () => {
    setEditOpen(false);

    setEditingUser(null);

    setForm({
      ...emptyForm,
    });

    setShowPassword(false);

    setShowConfirmPassword(false);
  };

  const handleEditUser = (
    e: FormEvent
  ) => {
    e.preventDefault();

    if (!editingUser) {
      return;
    }

    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.email.trim() ||
      !form.department ||
      !form.designation
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
        item.id ===
        editingUser.id
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

  const closeDeleteModal =
    () => {
      setDeleteId(null);

      setDeleteOpen(false);
    };

  const handleDelete = () => {
    if (deleteId === null) {
      return;
    }

    setUsers((prev) =>
      prev.filter(
        (item) =>
          item.id !== deleteId
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
     FORM UPDATE
  ========================================= */

  const updateForm = (
    field: keyof UserForm,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <>
      {/* =====================================
          SAME FILE CSS
      ===================================== */}

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

        /* ==============================
           HEADER
        ============================== */

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

        /* ==============================
           CARD
        ============================== */

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

        /* ==============================
           TOOLBAR
        ============================== */

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

        /* ==============================
           TABLE
        ============================== */

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

        /* USER */

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

        /* ==============================
           ROLE BADGE
        ============================== */

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

        /* ==============================
           STATUS
        ============================== */

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

        /* ==============================
           ACTIONS
        ============================== */

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

        /* ==============================
           TABLE FOOTER
        ============================== */

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

        /* =========================================
           MODAL OVERLAY
        ========================================= */

        .users-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          padding: 15px;
          background: rgba(0,0,0,.42);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* =========================================
           ADD / EDIT MODAL
        ========================================= */

        .users-form-modal {
          width: 800px;
          max-width: calc(100vw - 30px);
          max-height: calc(100vh - 30px);
          overflow-y: auto;
          border-radius: 5px;
          background: #fff;
          box-shadow: 0 15px 45px rgba(0,0,0,.22);
        }

        .users-modal-header {
          height: 64px;
          padding: 0 17px;
          position: sticky;
          top: 0;
          z-index: 10;
          border-bottom: 1px solid #e3e7eb;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .users-modal-header h3 {
          margin: 0;
          color: #1e2b49;
          font-size: 20px;
          font-weight: 600;
        }

        .users-modal-close {
          width: 28px;
          height: 28px;
          padding: 0;
          border: 0;
          background: transparent;
          color: #667085;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          line-height: 1;
          cursor: pointer;
        }

        .users-modal-close:hover {
          color: #172033;
        }

        .users-modal-body {
          padding: 20px;
        }

        .users-form-grid {
          display: grid;
          grid-template-columns: repeat(2,minmax(0,1fr));
          gap: 16px 24px;
        }

        .users-form-group label {
          display: block;
          margin-bottom: 7px;
          color: #263452;
          font-size: 13px;
          font-weight: 500;
        }

        .users-required {
          color: #e53935;
          margin-left: 2px;
        }

        .users-form-group input,
        .users-form-group select {
          width: 100%;
          height: 39px;
          padding: 0 10px;
          border: 1px solid #dce1e7;
          border-radius: 5px;
          outline: none;
          background: #fff;
          color: #26344d;
          font-size: 13px;
        }

        .users-form-group input:focus,
        .users-form-group select:focus,
        .users-about:focus {
          border-color: #c39237;
          box-shadow: 0 0 0 2px rgba(195,146,55,.08);
        }

        .users-form-group select {
          cursor: pointer;
        }

        /* PASSWORD */

        .users-password-wrap {
          position: relative;
        }

        .users-password-wrap input {
          padding-right: 40px;
        }

        .users-password-eye {
          width: 35px;
          height: 39px;
          position: absolute;
          right: 0;
          top: 0;
          padding: 0;
          border: 0;
          background: transparent;
          color: #697587;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        /* =========================================
           ABOUT
        ========================================= */

        .users-about-group {
          grid-column: 1 / -1;
          margin-top: 0;
        }

        .users-about {
          width: 100%;
          min-height: 78px;
          padding: 10px;
          resize: vertical;
          border: 1px solid #dce1e7;
          border-radius: 5px;
          outline: none;
          background: #fff;
          color: #26344d;
          font-family: inherit;
          font-size: 13px;
          line-height: 1.5;
        }

        .users-about::placeholder {
          color: #9aa3b2;
        }

        /* =========================================
           MODAL FOOTER
        ========================================= */

        .users-modal-footer {
          min-height: 64px;
          padding: 10px 20px;
          position: sticky;
          bottom: 0;
          z-index: 10;
          border-top: 1px solid #e4e7eb;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
        }

        .users-modal-cancel,
        .users-modal-save {
          height: 39px;
          padding: 0 17px;
          border-radius: 5px;
          font-size: 13px;
          cursor: pointer;
        }

        .users-modal-cancel {
          border: 1px solid #dfe3e8;
          background: #fff;
          color: #172033;
        }

        .users-modal-cancel:hover {
          background: #f7f8fa;
        }

        .users-modal-save {
          border: 1px solid #c39237;
          background: #c39237;
          color: #fff;
          font-weight: 600;
        }

        .users-modal-save:hover {
          background: #b58430;
          border-color: #b58430;
        }

        /* =========================================
           DELETE
        ========================================= */

        .users-delete-modal {
          width: 400px;
          max-width: calc(100vw - 30px);
          padding: 17px 30px;
          border-radius: 5px;
          background: #fff;
          text-align: center;
          box-shadow: 0 15px 45px rgba(0,0,0,.2);
        }

        .users-delete-icon {
          width: 58px;
          height: 58px;
          margin: 0 auto 14px;
          border-radius: 4px;
          background: #f6cccc;
          color: #f10f18;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .users-delete-modal h3 {
          margin: 0 0 6px;
          color: #1d2b48;
          font-size: 19px;
          font-weight: 600;
        }

        .users-delete-modal p {
          max-width: 330px;
          margin: 0 auto 17px;
          color: #3e4654;
          font-size: 13px;
          line-height: 1.5;
        }

        .users-delete-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }

        .users-delete-cancel,
        .users-delete-confirm {
          height: 39px;
          padding: 0 16px;
          border: 0;
          border-radius: 5px;
          font-size: 13px;
          cursor: pointer;
        }

        .users-delete-cancel {
          background: #f6f7f8;
          color: #172033;
        }

        .users-delete-confirm {
          background: #f10d16;
          color: #fff;
          font-weight: 600;
        }

        /* =========================================
           RESPONSIVE
        ========================================= */

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

          .users-date-filter,
          .users-role-filter,
          .users-status-filter,
          .users-sort-filter {
            width: 100%;
          }

          .users-filters {
            flex-direction: column;
          }

          .users-form-modal {
            max-height: calc(100vh - 20px);
          }
        }
        `}
      </style>

      {/* =========================================
          PAGE
      ========================================= */}

      <div className="users-page">

        {/* HEADER */}

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
              openAddModal
            }
          >
            <CirclePlus
              size={15}
            />

            Add User
          </button>
        </div>

        {/* =========================================
            USERS CARD
        ========================================= */}

        <div className="users-card">

          {/* CARD HEADER */}

          <div className="users-card-header">
            <h5>
              Users List
            </h5>

            <div className="users-filters">

              {/* DATE */}

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

              {/* ROLE */}

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

              {/* STATUS */}

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

              {/* SORT */}

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

          {/* TOOLBAR */}

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

          {/* TABLE */}

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

                      {/* CHECKBOX */}

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

                      {/* NAME */}

                      <td>
                        <div className="users-user-cell">
                          <div className="users-avatar" />

                          <div className="users-name">
                            {user.name}
                          </div>
                        </div>
                      </td>

                      {/* EMAIL */}

                      <td>
                        {user.email}
                      </td>

                      {/* CREATED */}

                      <td>
                        {
                          user.createdDate
                        }
                      </td>

                      {/* ROLE */}

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

                      {/* STATUS */}

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

                      {/* ACTION */}

                      <td>
                        <div className="users-actions">

                          <button
                            type="button"
                            className="users-action-btn"
                            title="Permissions"
                          >
                            <Shield
                              size={15}
                            />
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
                            <Pencil
                              size={15}
                            />
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
                            <Trash2
                              size={15}
                            />
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

          {/* FOOTER */}

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
              )}{" "}
              of{" "}
              {
                filteredUsers.length
              }{" "}
              entries
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
                <ChevronLeft
                  size={16}
                />
              </button>

              <span className="users-current-page">
                {
                  safeCurrentPage
                }
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
                <ChevronRight
                  size={16}
                />
              </button>

            </div>
          </div>
        </div>
      </div>

      {/* =============================================
          ADD USER MODAL
      ============================================= */}

      {addOpen && (
        <div className="users-modal-overlay">

          <div className="users-form-modal">

            {/* HEADER */}

            <div className="users-modal-header">

              <h3>
                Add New User
              </h3>

              <button
                type="button"
                className="users-modal-close"
                onClick={
                  closeAddModal
                }
              >
                ×
              </button>

            </div>

            <form
              onSubmit={
                handleAddUser
              }
            >

              <div className="users-modal-body">

                <div className="users-form-grid">

                  {/* FIRST NAME */}

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

                  {/* LAST NAME */}

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

                  {/* USERNAME */}

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

                  {/* EMAIL */}

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

                  {/* PASSWORD */}

                  <div className="users-form-group">

                    <label>
                      Password
                    </label>

                    <div className="users-password-wrap">

                      <input
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        value={
                          form.password
                        }
                        onChange={(e) =>
                          updateForm(
                            "password",
                            e.target
                              .value
                          )
                        }
                      />

                      <button
                        type="button"
                        className="users-password-eye"
                        onClick={() =>
                          setShowPassword(
                            !showPassword
                          )
                        }
                      >
                        {showPassword ? (
                          <Eye
                            size={16}
                          />
                        ) : (
                          <EyeOff
                            size={16}
                          />
                        )}
                      </button>

                    </div>
                  </div>

                  {/* CONFIRM PASSWORD */}

                  <div className="users-form-group">

                    <label>
                      Confirm Password
                    </label>

                    <div className="users-password-wrap">

                      <input
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        value={
                          form.confirmPassword
                        }
                        onChange={(e) =>
                          updateForm(
                            "confirmPassword",
                            e.target
                              .value
                          )
                        }
                      />

                      <button
                        type="button"
                        className="users-password-eye"
                        onClick={() =>
                          setShowConfirmPassword(
                            !showConfirmPassword
                          )
                        }
                      >
                        {showConfirmPassword ? (
                          <Eye
                            size={16}
                          />
                        ) : (
                          <EyeOff
                            size={16}
                          />
                        )}
                      </button>

                    </div>
                  </div>

                  {/* PHONE */}

                  <UserInput
                    label="Phone Number"
                    required
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

                  {/* COMPANY */}

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

                  {/* DEPARTMENT */}

                  <SelectInput
                    label="Department"
                    required
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

                  {/* DESIGNATION */}

                  <SelectInput
                    label="Designation"
                    required
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

                  {/* ABOUT */}

                  <div className="users-form-group users-about-group">

                    <label>
                      About
                    </label>

                    <textarea
                      className="users-about"
                      rows={3}
                      placeholder="Write something about the user..."
                      value={
                        form.about
                      }
                      onChange={(e) =>
                        updateForm(
                          "about",
                          e.target
                            .value
                        )
                      }
                    />

                  </div>

                </div>
              </div>

              {/* FOOTER */}

              <div className="users-modal-footer">

                <button
                  type="button"
                  className="users-modal-cancel"
                  onClick={
                    closeAddModal
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="users-modal-save"
                >
                  Save User
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

      {/* =============================================
          EDIT USER MODAL
      ============================================= */}

      {editOpen &&
        editingUser && (
          <div className="users-modal-overlay">

            <div className="users-form-modal">

              {/* HEADER */}

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

                    {/* FIRST NAME */}

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

                    {/* LAST NAME */}

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

                    {/* USERNAME */}

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

                    {/* EMAIL */}

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

                    {/* PASSWORD */}

                    <div className="users-form-group">

                      <label>
                        Password
                      </label>

                      <div className="users-password-wrap">

                        <input
                          type={
                            showPassword
                              ? "text"
                              : "password"
                          }
                          value={
                            form.password
                          }
                          onChange={(e) =>
                            updateForm(
                              "password",
                              e.target
                                .value
                            )
                          }
                        />

                        <button
                          type="button"
                          className="users-password-eye"
                          onClick={() =>
                            setShowPassword(
                              !showPassword
                            )
                          }
                        >
                          {showPassword ? (
                            <Eye
                              size={16}
                            />
                          ) : (
                            <EyeOff
                              size={16}
                            />
                          )}
                        </button>

                      </div>
                    </div>

                    {/* CONFIRM PASSWORD */}

                    <div className="users-form-group">

                      <label>
                        Confirm Password
                      </label>

                      <div className="users-password-wrap">

                        <input
                          type={
                            showConfirmPassword
                              ? "text"
                              : "password"
                          }
                          value={
                            form.confirmPassword
                          }
                          onChange={(e) =>
                            updateForm(
                              "confirmPassword",
                              e.target
                                .value
                            )
                          }
                        />

                        <button
                          type="button"
                          className="users-password-eye"
                          onClick={() =>
                            setShowConfirmPassword(
                              !showConfirmPassword
                            )
                          }
                        >
                          {showConfirmPassword ? (
                            <Eye
                              size={16}
                            />
                          ) : (
                            <EyeOff
                              size={16}
                            />
                          )}
                        </button>

                      </div>
                    </div>

                    {/* PHONE */}

                    <UserInput
                      label="Phone Number"
                      required
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

                    {/* COMPANY */}

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

                    {/* DEPARTMENT */}

                    <SelectInput
                      label="Department"
                      required
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

                    {/* DESIGNATION */}

                    <SelectInput
                      label="Designation"
                      required
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

                    {/* ABOUT */}

                    <div className="users-form-group users-about-group">

                      <label>
                        About
                      </label>

                      <textarea
                        className="users-about"
                        rows={3}
                        placeholder="Write something about the user..."
                        value={
                          form.about
                        }
                        onChange={(e) =>
                          updateForm(
                            "about",
                            e.target
                              .value
                          )
                        }
                      />

                    </div>

                  </div>
                </div>

                {/* FOOTER */}

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

      {/* =============================================
          DELETE MODAL
      ============================================= */}

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
   REUSABLE TEXT INPUT
========================================= */

interface UserInputProps {
  label: string;

  value: string;

  required?: boolean;

  onChange: (
    value: string
  ) => void;
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
   REUSABLE SELECT INPUT
========================================= */

interface SelectInputProps {
  label: string;

  value: string;

  placeholder: string;

  options: string[];

  required?: boolean;

  onChange: (
    value: string
  ) => void;
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
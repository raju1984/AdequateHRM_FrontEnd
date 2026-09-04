import React, { useMemo, useState } from "react";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Home,
  Search,
  Trash2,
  X,
  Plus,
} from "lucide-react";
import { Link } from "react-router-dom";

/* =====================================================
   TYPES
===================================================== */

interface SalaryType {
  id: number;
  empId: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  designation: string;
  joiningDate: string;
  salary: string;

  basic: string;
  da: string;
  hra: string;
  conveyance: string;

  allowance: string;
  medicalAllowance: string;
  earningOthers: string;

  tds: string;
  esi: string;
  pf: string;
  leave: string;

  professionalTax: string;
  labourWelfare: string;
  deductionOthers: string;
}

/* =====================================================
   INITIAL DATA
===================================================== */

const salaryData: SalaryType[] = [
  {
    id: 1,
    empId: "Emp-001",
    name: "Anthony Lewis",
    role: "Finance",
    email: "anthony@example.com",
    phone: "(123) 4567 890",
    designation: "Finance",
    joiningDate: "12 Sep 2024",
    salary: "$40000",

    basic: "$40000",
    da: "$16000",
    hra: "$2666",
    conveyance: "$2000",

    allowance: "$1000",
    medicalAllowance: "$2000",
    earningOthers: "",

    tds: "$4000",
    esi: "$2000",
    pf: "$3000",
    leave: "$1000",

    professionalTax: "$800",
    labourWelfare: "$500",
    deductionOthers: "$100",
  },

  {
    id: 2,
    empId: "Emp-002",
    name: "Brian Villalobos",
    role: "Developer",
    email: "brian@example.com",
    phone: "(179) 7382 829",
    designation: "Developer",
    joiningDate: "24 Oct 2024",
    salary: "$35000",

    basic: "$35000",
    da: "$14000",
    hra: "$2300",
    conveyance: "$2000",

    allowance: "$1000",
    medicalAllowance: "$1800",
    earningOthers: "",

    tds: "$3500",
    esi: "$1800",
    pf: "$2800",
    leave: "$800",

    professionalTax: "$700",
    labourWelfare: "$500",
    deductionOthers: "$100",
  },

  {
    id: 3,
    empId: "Emp-003",
    name: "Harvey Smith",
    role: "Developer",
    email: "harvey@example.com",
    phone: "(184) 2719 738",
    designation: "Executive",
    joiningDate: "18 Feb 2024",
    salary: "$20000",

    basic: "$20000",
    da: "$8000",
    hra: "$1500",
    conveyance: "$1500",

    allowance: "$800",
    medicalAllowance: "$1200",
    earningOthers: "",

    tds: "$2000",
    esi: "$1000",
    pf: "$1800",
    leave: "$500",

    professionalTax: "$500",
    labourWelfare: "$300",
    deductionOthers: "$100",
  },

  {
    id: 4,
    empId: "Emp-004",
    name: "Stephan Peralt",
    role: "Executive Officer",
    email: "peral@example.com",
    phone: "(193) 7839 748",
    designation: "Executive",
    joiningDate: "17 Oct 2024",
    salary: "$22000",

    basic: "$22000",
    da: "$8800",
    hra: "$1650",
    conveyance: "$1500",

    allowance: "$800",
    medicalAllowance: "$1200",
    earningOthers: "",

    tds: "$2200",
    esi: "$1100",
    pf: "$1900",
    leave: "$500",

    professionalTax: "$500",
    labourWelfare: "$300",
    deductionOthers: "$100",
  },

  {
    id: 5,
    empId: "Emp-005",
    name: "Doglas Martini",
    role: "Manager",
    email: "martniwr@example.com",
    phone: "(183) 9302 890",
    designation: "Manager",
    joiningDate: "20 Jul 2024",
    salary: "$25000",

    basic: "$25000",
    da: "$10000",
    hra: "$1875",
    conveyance: "$1800",

    allowance: "$900",
    medicalAllowance: "$1500",
    earningOthers: "",

    tds: "$2500",
    esi: "$1300",
    pf: "$2100",
    leave: "$600",

    professionalTax: "$600",
    labourWelfare: "$350",
    deductionOthers: "$100",
  },

  {
    id: 6,
    empId: "Emp-006",
    name: "Linda Ray",
    role: "Finance",
    email: "ray456@example.com",
    phone: "(120) 3728 039",
    designation: "Finance",
    joiningDate: "10 Apr 2024",
    salary: "$30000",

    basic: "$30000",
    da: "$12000",
    hra: "$2250",
    conveyance: "$1800",

    allowance: "$900",
    medicalAllowance: "$1600",
    earningOthers: "",

    tds: "$3000",
    esi: "$1500",
    pf: "$2400",
    leave: "$700",

    professionalTax: "$650",
    labourWelfare: "$400",
    deductionOthers: "$100",
  },

  {
    id: 7,
    empId: "Emp-007",
    name: "Elliot Murray",
    role: "Developer",
    email: "murray@example.com",
    phone: "(102) 8480 832",
    designation: "Finance",
    joiningDate: "29 Aug 2024",
    salary: "$35000",

    basic: "$35000",
    da: "$14000",
    hra: "$2625",
    conveyance: "$2000",

    allowance: "$1000",
    medicalAllowance: "$1800",
    earningOthers: "",

    tds: "$3500",
    esi: "$1800",
    pf: "$2800",
    leave: "$800",

    professionalTax: "$700",
    labourWelfare: "$450",
    deductionOthers: "$100",
  },

  {
    id: 8,
    empId: "Emp-008",
    name: "Rebecca Smith",
    role: "Executive",
    email: "smith@example.com",
    phone: "(162) 8920 713",
    designation: "Executive",
    joiningDate: "22 Feb 2024",
    salary: "$45000",

    basic: "$45000",
    da: "$18000",
    hra: "$3375",
    conveyance: "$2200",

    allowance: "$1200",
    medicalAllowance: "$2200",
    earningOthers: "",

    tds: "$4500",
    esi: "$2200",
    pf: "$3500",
    leave: "$1000",

    professionalTax: "$900",
    labourWelfare: "$500",
    deductionOthers: "$100",
  },

  {
    id: 9,
    empId: "Emp-009",
    name: "Connie Waters",
    role: "Developer",
    email: "connie@example.com",
    phone: "(189) 0920 723",
    designation: "Developer",
    joiningDate: "03 Nov 2024",
    salary: "$50000",

    basic: "$50000",
    da: "$20000",
    hra: "$3750",
    conveyance: "$2500",

    allowance: "$1500",
    medicalAllowance: "$2500",
    earningOthers: "",

    tds: "$5000",
    esi: "$2500",
    pf: "$4000",
    leave: "$1200",

    professionalTax: "$1000",
    labourWelfare: "$600",
    deductionOthers: "$100",
  },

  {
    id: 10,
    empId: "Emp-010",
    name: "Lori Broaddus",
    role: "Finance",
    email: "broaddus@example.com",
    phone: "(168) 8392 823",
    designation: "Finance",
    joiningDate: "17 Dec 2024",
    salary: "$25000",

    basic: "$25000",
    da: "$10000",
    hra: "$1875",
    conveyance: "$1800",

    allowance: "$900",
    medicalAllowance: "$1500",
    earningOthers: "",

    tds: "$2500",
    esi: "$1300",
    pf: "$2100",
    leave: "$600",

    professionalTax: "$600",
    labourWelfare: "$350",
    deductionOthers: "$100",
  },
];

/* =====================================================
   COMPONENT
===================================================== */

const EmployeSalary: React.FC = () => {
  const [data, setData] = useState<SalaryType[]>(salaryData);

  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const [designationFilter, setDesignationFilter] =
    useState("Designation");

  const [sortFilter, setSortFilter] =
    useState("Sort By : Last 7 Days");

  const [dateFilter, setDateFilter] =
    useState("08/27/2026 - 09/02/2026");

  /* =====================================================
     EDIT MODAL
  ===================================================== */

  const [showEditModal, setShowEditModal] = useState(false);

  const [editingEmployee, setEditingEmployee] =
    useState<SalaryType | null>(null);

  const [editForm, setEditForm] = useState<SalaryType | null>(
    null
  );

  /* =====================================================
     DELETE MODAL
  ===================================================== */

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [deletingEmployee, setDeletingEmployee] =
    useState<SalaryType | null>(null);

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredData = useMemo(() => {
    let result = [...data];

    if (search.trim()) {
      const searchValue = search.toLowerCase();

      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(searchValue) ||
          item.empId.toLowerCase().includes(searchValue) ||
          item.email.toLowerCase().includes(searchValue) ||
          item.phone.toLowerCase().includes(searchValue) ||
          item.designation
            .toLowerCase()
            .includes(searchValue)
      );
    }

    if (designationFilter !== "Designation") {
      result = result.filter(
        (item) =>
          item.designation === designationFilter
      );
    }

    if (sortFilter === "Ascending") {
      result.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    if (sortFilter === "Descending") {
      result.sort((a, b) =>
        b.name.localeCompare(a.name)
      );
    }

    return result;
  }, [
    data,
    search,
    designationFilter,
    sortFilter,
  ]);

  const visibleData = filteredData.slice(
    0,
    rowsPerPage
  );

  /* =====================================================
     CHECKBOX
  ===================================================== */

  const handleSelectAll = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.checked) {
      setSelectedRows(
        visibleData.map((item) => item.id)
      );
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id)
        ? prev.filter((rowId) => rowId !== id)
        : [...prev, id]
    );
  };

  /* =====================================================
     EDIT
  ===================================================== */

  const handleEdit = (item: SalaryType) => {
    setEditingEmployee(item);

    setEditForm({
      ...item,
    });

    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingEmployee(null);
    setEditForm(null);
  };

  const handleEditChange = (
    field: keyof SalaryType,
    value: string
  ) => {
    setEditForm((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const handleSaveSalary = () => {
    if (!editForm || !editingEmployee) return;

    setData((prev) =>
      prev.map((item) =>
        item.id === editingEmployee.id
          ? {
              ...editForm,
            }
          : item
      )
    );

    closeEditModal();
  };

  /* =====================================================
     DELETE
  ===================================================== */

  const handleDeleteClick = (item: SalaryType) => {
    setDeletingEmployee(item);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingEmployee(null);
  };

  const confirmDelete = () => {
    if (!deletingEmployee) return;

    setData((prev) =>
      prev.filter(
        (item) =>
          item.id !== deletingEmployee.id
      )
    );

    setSelectedRows((prev) =>
      prev.filter(
        (id) => id !== deletingEmployee.id
      )
    );

    closeDeleteModal();
  };

  const designationOptions = [
    "Designation",
    "Finance",
    "Developer",
    "Executive",
    "Manager",
  ];

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
        }

        /* =================================================
           PAGE
        ================================================= */

        .employee-salary-page {
          width: 100%;
          height: calc(100vh - 48px);
          min-height: 0;
          overflow-y: auto;
          overflow-x: hidden;
          background: #f5f6f8;
          padding: 24px;
          color: #172033;
          font-family: Arial, Helvetica, sans-serif;
        }

        .employee-salary-page::-webkit-scrollbar {
          width: 6px;
        }

        .employee-salary-page::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 20px;
        }

        /* =================================================
           PAGE HEADER
        ================================================= */

        .salary-page-header {
          margin-bottom: 25px;
        }

        .salary-page-title {
          margin: 0 0 7px;
          font-size: 24px;
          font-weight: 700;
          color: #17233d;
        }

        .salary-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #6b7280;
        }

        .salary-home-link {
          color: #527589;
          display: flex;
          text-decoration: none;
        }

        /* =================================================
           CARD
        ================================================= */

        .salary-card {
          background: #fff;
          border: 1px solid #e0e4e9;
          border-radius: 6px;
          overflow: hidden;
        }

        .salary-card-header {
          min-height: 71px;
          padding: 15px 19px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e2e5e9;
          gap: 20px;
        }

        .salary-card-title {
          margin: 0;
          font-size: 15px;
          font-weight: 600;
          color: #17243b;
        }

        .salary-filter-group {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .salary-select-wrapper {
          position: relative;
        }

        .salary-filter-select {
          height: 39px;
          border: 1px solid #dce1e7;
          border-radius: 5px;
          background: #fff;
          color: #142138;
          font-size: 13px;
          padding: 0 36px 0 12px;
          appearance: none;
          outline: none;
        }

        .salary-date-filter {
          width: 195px;
        }

        .salary-designation-filter {
          width: 125px;
        }

        .salary-sort-filter {
          width: 180px;
        }

        .salary-select-icon {
          position: absolute;
          right: 11px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
        }

        /* =================================================
           TOOLBAR
        ================================================= */

        .salary-toolbar {
          min-height: 60px;
          padding: 10px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e3e7eb;
        }

        .salary-row-control {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #48576a;
        }

        .salary-row-select-wrapper {
          position: relative;
        }

        .salary-row-select {
          width: 50px;
          height: 30px;
          border: 1px solid #dbe0e6;
          border-radius: 5px;
          background: #fff;
          appearance: none;
          padding: 0 20px 0 8px;
          outline: none;
        }

        .salary-row-chevron {
          position: absolute;
          right: 5px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
        }

        .salary-search-wrapper {
          position: relative;
          width: 160px;
        }

        .salary-search {
          width: 100%;
          height: 31px;
          border: 1px solid #dae0e7;
          border-radius: 5px;
          padding: 0 32px 0 11px;
          font-size: 12px;
          outline: none;
        }

        .salary-search-icon {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #99a2af;
          pointer-events: none;
        }

        /* =================================================
           TABLE
        ================================================= */

        .salary-table-scroll {
          overflow-x: auto;
        }

        .salary-table {
          width: 100%;
          min-width: 1050px;
          border-collapse: collapse;
          table-layout: fixed;
        }

        .salary-table thead {
          background: #e4e7eb;
        }

        .salary-table th {
          height: 43px;
          padding: 0 11px;
          font-size: 13px;
          color: #101d31;
          font-weight: 600;
          text-align: left;
          border-bottom: 1px solid #dce0e5;
          white-space: nowrap;
        }

        .salary-table td {
          height: 62px;
          padding: 7px 11px;
          border-bottom: 1px solid #e2e6eb;
          color: #5b687a;
          font-size: 13px;
          background: white;
        }

        .salary-table tbody tr:hover td {
          background: #fafafa;
        }

        .salary-table th:nth-child(1),
        .salary-table td:nth-child(1) {
          width: 60px;
          text-align: center;
        }

        .salary-table th:nth-child(2),
        .salary-table td:nth-child(2) {
          width: 100px;
        }

        .salary-table th:nth-child(3),
        .salary-table td:nth-child(3) {
          width: 190px;
        }

        .salary-table th:nth-child(4),
        .salary-table td:nth-child(4) {
          width: 195px;
        }

        .salary-table th:nth-child(5),
        .salary-table td:nth-child(5) {
          width: 140px;
        }

        .salary-table th:nth-child(6),
        .salary-table td:nth-child(6) {
          width: 160px;
        }

        .salary-table th:nth-child(7),
        .salary-table td:nth-child(7) {
          width: 125px;
        }

        .salary-table th:nth-child(8),
        .salary-table td:nth-child(8) {
          width: 100px;
        }

        .salary-table th:nth-child(9),
        .salary-table td:nth-child(9) {
          width: 85px;
        }

        .salary-header-with-sort {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .salary-sort-icon {
          color: #c3c9d1;
        }

        .salary-checkbox {
          width: 18px;
          height: 18px;
          accent-color: #bd9138;
          cursor: pointer;
        }

        /* =================================================
           EMPLOYEE
        ================================================= */

        .salary-employee {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .salary-avatar {
          width: 33px;
          height: 33px;
          flex: 0 0 33px;
          border-radius: 50%;
          background: #d4d4d4;
          display: flex;
          justify-content: center;
          align-items: center;
          color: #eee;
          font-size: 8px;
        }

        .salary-employee-name {
          display: block;
          color: #0d1b30;
          font-weight: 500;
          margin-bottom: 4px;
        }

        .salary-employee-role {
          display: block;
          color: #687588;
          font-size: 12px;
        }

        /* =================================================
           DESIGNATION
        ================================================= */

        .table-designation-wrapper {
          position: relative;
          width: 118px;
        }

        .table-designation-select {
          width: 100%;
          height: 40px;
          border: 1px solid #dce1e7;
          border-radius: 5px;
          appearance: none;
          background: white;
          padding: 0 29px 0 20px;
          font-size: 13px;
          outline: none;
        }

        .table-designation-chevron {
          position: absolute;
          right: 9px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
        }

        /* =================================================
           ACTIONS
        ================================================= */

        .salary-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .salary-action-button {
          border: none;
          background: transparent;
          color: #5d6c7f;
          padding: 3px;
          cursor: pointer;
        }

        .salary-action-button:hover {
          color: #bd9138;
        }

        .salary-delete-button:hover {
          color: #ef1111;
        }

        /* =================================================
           FOOTER
        ================================================= */

        .salary-table-footer {
          height: 59px;
          padding: 0 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13px;
          color: #647185;
        }

        .salary-pagination {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .salary-page-button {
          border: none;
          background: transparent;
          color: #a5adb8;
          width: 27px;
          height: 27px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .salary-current-page {
          width: 27px;
          height: 27px;
          border-radius: 50%;
          background: #bd9138;
          color: #fff;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        /* =================================================
           COMMON MODAL OVERLAY
        ================================================= */

        .salary-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: rgba(0, 0, 0, 0.46);
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 11px 24px 24px;
          overflow-y: auto;
        }

        /* =================================================
           EDIT SALARY MODAL
        ================================================= */

        .edit-salary-modal {
          width: 800px;
          max-width: 100%;
          background: #fff;
          border-radius: 5px;
          box-shadow: 0 14px 45px rgba(0, 0, 0, 0.25);
          overflow: hidden;
          animation: salaryModalOpen .16s ease-out;
        }

        @keyframes salaryModalOpen {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .edit-salary-header {
          height: 63px;
          padding: 0 17px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #e0e4e9;
        }

        .edit-salary-title {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #273653;
        }

        .edit-close {
          width: 20px;
          height: 20px;
          border: none;
          border-radius: 50%;
          background: #707987;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          cursor: pointer;
        }

        .edit-salary-body {
          padding: 19px 17px 9px;
        }

        .salary-form-top {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 18px;
        }

        .salary-form-label {
          display: block;
          margin-bottom: 9px;
          color: #293751;
          font-size: 14px;
        }

        .salary-form-input,
        .salary-form-select {
          width: 100%;
          height: 38px;
          border: 1px solid #dce1e7;
          border-radius: 5px;
          background: white;
          padding: 0 11px;
          color: #293548;
          font-size: 14px;
          outline: none;
        }

        .salary-form-input:focus,
        .salary-form-select:focus {
          border-color: #bd9138;
        }

        .salary-edit-select {
          position: relative;
        }

        .salary-form-select {
          appearance: none;
          padding-right: 35px;
        }

        .salary-edit-select-icon {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: #596677;
        }

        .salary-section-heading-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 2px 0 26px;
        }

        .salary-section-heading {
          font-size: 14px;
          color: #293751;
          font-weight: 400;
        }

        .salary-add-new {
          border: none;
          background: transparent;
          color: #bc8730;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 0;
          font-size: 14px;
          cursor: pointer;
        }

        .salary-form-grid-four {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-bottom: 18px;
        }

        .salary-form-grid-three {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-bottom: 17px;
        }

        .salary-field {
          min-width: 0;
        }

        .salary-modal-footer {
          height: 64px;
          padding: 0 13px;
          border-top: 1px solid #e2e5e9;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 9px;
        }

        .salary-cancel-btn {
          height: 39px;
          padding: 0 15px;
          border: none;
          border-radius: 5px;
          background: #f6f7f8;
          color: #283348;
          font-size: 14px;
          cursor: pointer;
        }

        .salary-save-btn {
          height: 39px;
          padding: 0 16px;
          border: none;
          border-radius: 5px;
          background: #bd9138;
          color: #fff;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }

        .salary-save-btn:hover {
          background: #aa802f;
        }

        /* =================================================
           DELETE MODAL
        ================================================= */

        .delete-modal-overlay {
          align-items: center;
          padding: 20px;
        }

        .salary-delete-modal {
          width: 400px;
          max-width: 100%;
          background: #fff;
          border-radius: 4px;
          padding: 16px 25px 16px;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.24);
          text-align: center;
          animation: deleteModalOpen .15s ease-out;
        }

        @keyframes deleteModalOpen {
          from {
            opacity: 0;
            transform: scale(.98);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .delete-icon-box {
          width: 58px;
          height: 59px;
          margin: 0 auto 14px;
          background: #facdce;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #f11111;
        }

        .delete-modal-title {
          margin: 0 0 5px;
          color: #293854;
          font-size: 19px;
          font-weight: 600;
        }

        .delete-modal-text {
          width: 315px;
          max-width: 100%;
          margin: 0 auto 17px;
          color: #353b45;
          font-size: 14px;
          line-height: 21px;
        }

        .delete-buttons {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
        }

        .delete-cancel-btn {
          min-width: 73px;
          height: 39px;
          border: none;
          border-radius: 5px;
          background: #f7f8f9;
          color: #252e3e;
          font-size: 14px;
          cursor: pointer;
        }

        .delete-confirm-btn {
          min-width: 99px;
          height: 39px;
          border: none;
          border-radius: 5px;
          background: #ef0707;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .delete-confirm-btn:hover {
          background: #d90000;
        }

        /* =================================================
           RESPONSIVE
        ================================================= */

        @media (max-width: 900px) {
          .salary-card-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .salary-filter-group {
            flex-wrap: wrap;
          }

          .salary-form-grid-four,
          .salary-form-grid-three {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .employee-salary-page {
            padding: 15px 10px;
          }

          .salary-filter-group {
            width: 100%;
            flex-direction: column;
          }

          .salary-select-wrapper,
          .salary-filter-select {
            width: 100% !important;
          }

          .salary-toolbar {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .salary-search-wrapper {
            width: 100%;
          }

          .salary-modal-overlay {
            padding: 10px;
          }

          .salary-form-top,
          .salary-form-grid-four,
          .salary-form-grid-three {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .salary-section-heading-row {
            margin-bottom: 15px;
          }
        }
      `}</style>

      {/* =================================================
          MAIN PAGE
      ================================================= */}

      <div className="employee-salary-page">
        {/* PAGE HEADER */}

        <div className="salary-page-header">
          <h1 className="salary-page-title">
            Employee Salary
          </h1>

          <div className="salary-breadcrumb">
            <Link
              to="/HR/HrDashboard"
              className="salary-home-link"
            >
              <Home size={13} />
            </Link>

            <span>/</span>

            <span>Employee Salary</span>
          </div>
        </div>

        {/* SALARY CARD */}

        <div className="salary-card">
          {/* CARD HEADER */}

          <div className="salary-card-header">
            <h2 className="salary-card-title">
              Employee Salary List
            </h2>

            <div className="salary-filter-group">
              {/* DATE */}

              <div className="salary-select-wrapper">
                <select
                  className="
                    salary-filter-select
                    salary-date-filter
                  "
                  value={dateFilter}
                  onChange={(e) =>
                    setDateFilter(e.target.value)
                  }
                >
                  <option value="08/27/2026 - 09/02/2026">
                    08/27/2026 - 09/02/2026
                  </option>

                  <option value="Last 7 Days">
                    Last 7 Days
                  </option>

                  <option value="Last 30 Days">
                    Last 30 Days
                  </option>

                  <option value="This Month">
                    This Month
                  </option>
                </select>

                <ChevronDown
                  size={15}
                  className="salary-select-icon"
                />
              </div>

              {/* DESIGNATION */}

              <div className="salary-select-wrapper">
                <select
                  className="
                    salary-filter-select
                    salary-designation-filter
                  "
                  value={designationFilter}
                  onChange={(e) =>
                    setDesignationFilter(
                      e.target.value
                    )
                  }
                >
                  {designationOptions.map(
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

                <ChevronDown
                  size={15}
                  className="salary-select-icon"
                />
              </div>

              {/* SORT */}

              <div className="salary-select-wrapper">
                <select
                  className="
                    salary-filter-select
                    salary-sort-filter
                  "
                  value={sortFilter}
                  onChange={(e) =>
                    setSortFilter(e.target.value)
                  }
                >
                  <option value="Sort By : Last 7 Days">
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

                <ChevronDown
                  size={15}
                  className="salary-select-icon"
                />
              </div>
            </div>
          </div>

          {/* TOOLBAR */}

          <div className="salary-toolbar">
            <div className="salary-row-control">
              <span>Row Per Page</span>

              <div className="salary-row-select-wrapper">
                <select
                  className="salary-row-select"
                  value={rowsPerPage}
                  onChange={(e) =>
                    setRowsPerPage(
                      Number(e.target.value)
                    )
                  }
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={30}>30</option>
                  <option value={40}>40</option>
                  <option value={50}>50</option>
                </select>

                <ChevronDown
                  size={13}
                  className="salary-row-chevron"
                />
              </div>

              <span>Entries</span>
            </div>

            <div className="salary-search-wrapper">
              <input
                className="salary-search"
                value={search}
                placeholder="Search"
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

              <Search
                size={14}
                className="salary-search-icon"
              />
            </div>
          </div>

          {/* TABLE */}

          <div className="salary-table-scroll">
            <table className="salary-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      className="salary-checkbox"
                      checked={
                        visibleData.length > 0 &&
                        visibleData.every((item) =>
                          selectedRows.includes(item.id)
                        )
                      }
                      onChange={handleSelectAll}
                    />
                  </th>

                  <th>
                    <div className="salary-header-with-sort">
                      Emp ID
                      <ArrowUpDown
                        size={13}
                        className="salary-sort-icon"
                      />
                    </div>
                  </th>

                  <th>
                    <div className="salary-header-with-sort">
                      Name
                      <ArrowUpDown
                        size={13}
                        className="salary-sort-icon"
                      />
                    </div>
                  </th>

                  <th>
                    <div className="salary-header-with-sort">
                      Email
                      <ArrowUpDown
                        size={13}
                        className="salary-sort-icon"
                      />
                    </div>
                  </th>

                  <th>
                    <div className="salary-header-with-sort">
                      Phone
                      <ArrowUpDown
                        size={13}
                        className="salary-sort-icon"
                      />
                    </div>
                  </th>

                  <th>
                    <div className="salary-header-with-sort">
                      Designation
                      <ArrowUpDown
                        size={13}
                        className="salary-sort-icon"
                      />
                    </div>
                  </th>

                  <th>
                    <div className="salary-header-with-sort">
                      Joining Date
                      <ArrowUpDown
                        size={13}
                        className="salary-sort-icon"
                      />
                    </div>
                  </th>

                  <th>
                    <div className="salary-header-with-sort">
                      Salary
                      <ArrowUpDown
                        size={13}
                        className="salary-sort-icon"
                      />
                    </div>
                  </th>

                  <th />
                </tr>
              </thead>

              <tbody>
                {visibleData.map((item) => (
                  <tr key={item.id}>
                    {/* CHECKBOX */}

                    <td>
                      <input
                        type="checkbox"
                        className="salary-checkbox"
                        checked={selectedRows.includes(
                          item.id
                        )}
                        onChange={() =>
                          handleSelectRow(item.id)
                        }
                      />
                    </td>

                    {/* ID */}

                    <td>{item.empId}</td>

                    {/* EMPLOYEE */}

                    <td>
                      <div className="salary-employee">
                        <div className="salary-avatar">
                          •••
                        </div>

                        <div>
                          <span className="salary-employee-name">
                            {item.name}
                          </span>

                          <span className="salary-employee-role">
                            {item.role}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* EMAIL */}

                    <td>{item.email}</td>

                    {/* PHONE */}

                    <td>{item.phone}</td>

                    {/* DESIGNATION */}

                    <td>
                      <div className="table-designation-wrapper">
                        <select
                          className="table-designation-select"
                          value={item.designation}
                          onChange={(e) => {
                            const value =
                              e.target.value;

                            setData((prev) =>
                              prev.map((salary) =>
                                salary.id === item.id
                                  ? {
                                      ...salary,
                                      designation:
                                        value,
                                    }
                                  : salary
                              )
                            );
                          }}
                        >
                          <option value="Finance">
                            Finance
                          </option>

                          <option value="Developer">
                            Developer
                          </option>

                          <option value="Executive">
                            Executive
                          </option>

                          <option value="Manager">
                            Manager
                          </option>
                        </select>

                        <ChevronDown
                          size={15}
                          className="table-designation-chevron"
                        />
                      </div>
                    </td>

                    {/* JOINING */}

                    <td>
                      {item.joiningDate}
                    </td>

                    {/* SALARY */}

                    <td>{item.salary}</td>

                    {/* ACTIONS */}

                    <td>
                      <div className="salary-actions">
                        {/* EDIT */}

                        <button
                          type="button"
                          title="Edit Employee Salary"
                          className="salary-action-button"
                          onClick={() =>
                            handleEdit(item)
                          }
                        >
                          <Edit3 size={15} />
                        </button>

                        {/* DELETE */}

                        <button
                          type="button"
                          title="Delete"
                          className="
                            salary-action-button
                            salary-delete-button
                          "
                          onClick={() =>
                            handleDeleteClick(item)
                          }
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {visibleData.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      style={{
                        height: "120px",
                        textAlign: "center",
                      }}
                    >
                      No employee salary records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER */}

          <div className="salary-table-footer">
            <span>
              Showing{" "}
              {visibleData.length === 0 ? 0 : 1} -{" "}
              {visibleData.length} of{" "}
              {filteredData.length} entries
            </span>

            <div className="salary-pagination">
              <button
                type="button"
                className="salary-page-button"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="salary-current-page">
                1
              </span>

              <button
                type="button"
                className="salary-page-button"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          EDIT EMPLOYEE SALARY MODAL
      ================================================= */}

      {showEditModal && editForm && (
        <div
          className="salary-modal-overlay"
          onMouseDown={(e) => {
            if (e.currentTarget === e.target) {
              closeEditModal();
            }
          }}
        >
          <div
            className="edit-salary-modal"
            onMouseDown={(e) =>
              e.stopPropagation()
            }
          >
            {/* HEADER */}

            <div className="edit-salary-header">
              <h2 className="edit-salary-title">
                Edit Employee Salary
              </h2>

              <button
                type="button"
                className="edit-close"
                onClick={closeEditModal}
              >
                <X size={13} strokeWidth={3} />
              </button>
            </div>

            {/* BODY */}

            <div className="edit-salary-body">
              {/* EMPLOYEE + NET SALARY */}

              <div className="salary-form-top">
                <div className="salary-field">
                  <label className="salary-form-label">
                    Employee Name
                  </label>

                  <div className="salary-edit-select">
                    <select
                      className="salary-form-select"
                      value={editForm.name}
                      onChange={(e) => {
                        const employee =
                          data.find(
                            (item) =>
                              item.name ===
                              e.target.value
                          );

                        if (employee) {
                          setEditForm({
                            ...employee,
                            id: editForm.id,
                          });
                        }
                      }}
                    >
                      {data.map((employee) => (
                        <option
                          value={employee.name}
                          key={employee.id}
                        >
                          {employee.name}
                        </option>
                      ))}
                    </select>

                    <ChevronDown
                      size={15}
                      className="salary-edit-select-icon"
                    />
                  </div>
                </div>

                <div className="salary-field">
                  <label className="salary-form-label">
                    Net Salary
                  </label>

                  <input
                    className="salary-form-input"
                    value={editForm.salary}
                    onChange={(e) =>
                      handleEditChange(
                        "salary",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>

              {/* ==========================================
                  EARNINGS
              ========================================== */}

              <div className="salary-section-heading-row">
                <span className="salary-section-heading">
                  Earnings
                </span>

                <button
                  type="button"
                  className="salary-add-new"
                >
                  <Plus size={15} />
                  Add New
                </button>
              </div>

              <div className="salary-form-grid-four">
                {/* BASIC */}

                <div className="salary-field">
                  <label className="salary-form-label">
                    Basic
                  </label>

                  <input
                    className="salary-form-input"
                    value={editForm.basic}
                    onChange={(e) =>
                      handleEditChange(
                        "basic",
                        e.target.value
                      )
                    }
                  />
                </div>

                {/* DA */}

                <div className="salary-field">
                  <label className="salary-form-label">
                    DA(40%)
                  </label>

                  <input
                    className="salary-form-input"
                    value={editForm.da}
                    onChange={(e) =>
                      handleEditChange(
                        "da",
                        e.target.value
                      )
                    }
                  />
                </div>

                {/* HRA */}

                <div className="salary-field">
                  <label className="salary-form-label">
                    HRA(15%)
                  </label>

                  <input
                    className="salary-form-input"
                    value={editForm.hra}
                    onChange={(e) =>
                      handleEditChange(
                        "hra",
                        e.target.value
                      )
                    }
                  />
                </div>

                {/* CONVEYANCE */}

                <div className="salary-field">
                  <label className="salary-form-label">
                    Conveyance
                  </label>

                  <input
                    className="salary-form-input"
                    value={editForm.conveyance}
                    onChange={(e) =>
                      handleEditChange(
                        "conveyance",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>

              {/* ALLOWANCE ROW */}

              <div className="salary-form-grid-three">
                <div className="salary-field">
                  <label className="salary-form-label">
                    Allowance
                  </label>

                  <input
                    className="salary-form-input"
                    value={editForm.allowance}
                    onChange={(e) =>
                      handleEditChange(
                        "allowance",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="salary-field">
                  <label className="salary-form-label">
                    Medical Allowance
                  </label>

                  <input
                    className="salary-form-input"
                    value={
                      editForm.medicalAllowance
                    }
                    onChange={(e) =>
                      handleEditChange(
                        "medicalAllowance",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="salary-field">
                  <label className="salary-form-label">
                    Others
                  </label>

                  <input
                    className="salary-form-input"
                    value={
                      editForm.earningOthers
                    }
                    onChange={(e) =>
                      handleEditChange(
                        "earningOthers",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>

              {/* ==========================================
                  DEDUCTIONS
              ========================================== */}

              <div className="salary-section-heading-row">
                <span className="salary-section-heading">
                  Deductions
                </span>

                <button
                  type="button"
                  className="salary-add-new"
                >
                  <Plus size={15} />
                  Add New
                </button>
              </div>

              {/* FIRST DEDUCTION ROW */}

              <div className="salary-form-grid-four">
                <div className="salary-field">
                  <label className="salary-form-label">
                    TDS
                  </label>

                  <input
                    className="salary-form-input"
                    value={editForm.tds}
                    onChange={(e) =>
                      handleEditChange(
                        "tds",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="salary-field">
                  <label className="salary-form-label">
                    ESI
                  </label>

                  <input
                    className="salary-form-input"
                    value={editForm.esi}
                    onChange={(e) =>
                      handleEditChange(
                        "esi",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="salary-field">
                  <label className="salary-form-label">
                    PF
                  </label>

                  <input
                    className="salary-form-input"
                    value={editForm.pf}
                    onChange={(e) =>
                      handleEditChange(
                        "pf",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="salary-field">
                  <label className="salary-form-label">
                    Leave
                  </label>

                  <input
                    className="salary-form-input"
                    value={editForm.leave}
                    onChange={(e) =>
                      handleEditChange(
                        "leave",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>

              {/* SECOND DEDUCTION ROW */}

              <div className="salary-form-grid-three">
                <div className="salary-field">
                  <label className="salary-form-label">
                    Prof.Tax
                  </label>

                  <input
                    className="salary-form-input"
                    value={
                      editForm.professionalTax
                    }
                    onChange={(e) =>
                      handleEditChange(
                        "professionalTax",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="salary-field">
                  <label className="salary-form-label">
                    Labour Welfare
                  </label>

                  <input
                    className="salary-form-input"
                    value={
                      editForm.labourWelfare
                    }
                    onChange={(e) =>
                      handleEditChange(
                        "labourWelfare",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="salary-field">
                  <label className="salary-form-label">
                    Others
                  </label>

                  <input
                    className="salary-form-input"
                    value={
                      editForm.deductionOthers
                    }
                    onChange={(e) =>
                      handleEditChange(
                        "deductionOthers",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
            </div>

            {/* FOOTER */}

            <div className="salary-modal-footer">
              <button
                type="button"
                className="salary-cancel-btn"
                onClick={closeEditModal}
              >
                Cancel
              </button>

              <button
                type="button"
                className="salary-save-btn"
                onClick={handleSaveSalary}
              >
              Add Employee Salary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          DELETE CONFIRMATION MODAL
      ================================================= */}

      {showDeleteModal && deletingEmployee && (
        <div
          className="
            salary-modal-overlay
            delete-modal-overlay
          "
          onMouseDown={(e) => {
            if (e.currentTarget === e.target) {
              closeDeleteModal();
            }
          }}
        >
          <div
            className="salary-delete-modal"
            onMouseDown={(e) =>
              e.stopPropagation()
            }
          >
            {/* DELETE ICON */}

            <div className="delete-icon-box">
              <Trash2
                size={31}
                strokeWidth={2.5}
              />
            </div>

            {/* TITLE */}

            <h2 className="delete-modal-title">
              Confirm Delete
            </h2>

            {/* TEXT */}

            <p className="delete-modal-text">
              You want to delete all the marked items,
              this cant be undone once you delete.
            </p>

            {/* BUTTONS */}

            <div className="delete-buttons">
              <button
                type="button"
                className="delete-cancel-btn"
                onClick={closeDeleteModal}
              >
                Cancel
              </button>

              <button
                type="button"
                className="delete-confirm-btn"
                onClick={confirmDelete}
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

export default EmployeSalary;
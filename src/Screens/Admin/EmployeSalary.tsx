import React, {
  FormEvent,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";

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
}

interface SalaryForm {
  employee: string;
  netSalary: string;

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

  profTax: string;
  labourWelfare: string;
  deductionOthers: string;
}

const initialSalaryData: SalaryType[] = [
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
  },
  {
    id: 8,
    empId: "Emp-008",
    name: "Rebecca Smtih",
    role: "Executive",
    email: "smtih@example.com",
    phone: "(162) 8920 713",
    designation: "Executive",
    joiningDate: "22 Feb 2024",
    salary: "$45000",
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
  },
];

const designationOptions = [
  "Finance",
  "Developer",
  "Executive",
  "Manager",
];

const emptySalaryForm: SalaryForm = {
  employee: "",
  netSalary: "",

  basic: "",
  da: "",
  hra: "",
  conveyance: "",

  allowance: "",
  medicalAllowance: "",
  earningOthers: "",

  tds: "",
  esi: "",
  pf: "",
  leave: "",

  profTax: "",
  labourWelfare: "",
  deductionOthers: "",
};

const EmployeSalary: React.FC = () => {
  const [salaryData, setSalaryData] =
    useState<SalaryType[]>(initialSalaryData);

  const [search, setSearch] =
    useState("");

  const [rowsPerPage, setRowsPerPage] =
    useState(10);

  const [selectedRows, setSelectedRows] =
    useState<number[]>([]);

  const [
    designationFilter,
    setDesignationFilter,
  ] = useState("");

  const [sortBy, setSortBy] =
    useState("Last 7 Days");

  const [currentPage, setCurrentPage] =
    useState(1);

  /* =========================
     MODALS
  ========================= */

  const [addOpen, setAddOpen] =
    useState(false);

  const [editOpen, setEditOpen] =
    useState(false);

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  const [editingItem, setEditingItem] =
    useState<SalaryType | null>(null);

  const [deleteId, setDeleteId] =
    useState<number | null>(null);

  const [salaryForm, setSalaryForm] =
    useState<SalaryForm>(
      emptySalaryForm
    );

  /* =========================
     FILTER
  ========================= */

  const filteredData = useMemo(() => {
    let data = [...salaryData];

    if (search.trim()) {
      const query =
        search
          .trim()
          .toLowerCase();

      data = data.filter(
        (item) =>
          item.name
            .toLowerCase()
            .includes(query) ||
          item.empId
            .toLowerCase()
            .includes(query) ||
          item.email
            .toLowerCase()
            .includes(query) ||
          item.phone
            .toLowerCase()
            .includes(query) ||
          item.designation
            .toLowerCase()
            .includes(query)
      );
    }

    if (designationFilter) {
      data = data.filter(
        (item) =>
          item.designation ===
          designationFilter
      );
    }

    if (sortBy === "Ascending") {
      data.sort((a, b) =>
        a.name.localeCompare(
          b.name
        )
      );
    }

    if (sortBy === "Descending") {
      data.sort((a, b) =>
        b.name.localeCompare(
          a.name
        )
      );
    }

    return data;
  }, [
    salaryData,
    search,
    designationFilter,
    sortBy,
  ]);

  /* =========================
     PAGINATION
  ========================= */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredData.length /
        rowsPerPage
    )
  );

  const safeCurrentPage =
    Math.min(
      currentPage,
      totalPages
    );

  const visibleData =
    filteredData.slice(
      (safeCurrentPage - 1) *
        rowsPerPage,

      safeCurrentPage *
        rowsPerPage
    );

  /* =========================
     SELECT
  ========================= */

  const allVisibleSelected =
    visibleData.length > 0 &&
    visibleData.every(
      (item) =>
        selectedRows.includes(
          item.id
        )
    );

  const handleSelectAll = () => {
    const visibleIds =
      visibleData.map(
        (item) => item.id
      );

    if (allVisibleSelected) {
      setSelectedRows(
        (previous) =>
          previous.filter(
            (id) =>
              !visibleIds.includes(
                id
              )
          )
      );
    } else {
      setSelectedRows(
        (previous) => [
          ...new Set([
            ...previous,
            ...visibleIds,
          ]),
        ]
      );
    }
  };

  const handleSelectRow = (
    id: number
  ) => {
    setSelectedRows(
      (previous) =>
        previous.includes(id)
          ? previous.filter(
              (row) =>
                row !== id
            )
          : [
              ...previous,
              id,
            ]
    );
  };

  /* =========================
     DESIGNATION
  ========================= */

  const updateDesignation = (
    id: number,
    designation: string
  ) => {
    setSalaryData(
      (previous) =>
        previous.map(
          (item) =>
            item.id === id
              ? {
                  ...item,
                  designation,
                }
              : item
        )
    );
  };

  /* =========================
     ADD MODAL
  ========================= */

  const openAddModal = () => {
    setSalaryForm(
      emptySalaryForm
    );

    setAddOpen(true);
  };

  const closeAddModal = () => {
    setAddOpen(false);

    setSalaryForm(
      emptySalaryForm
    );
  };

  const handleAddSalary = (
    e: FormEvent
  ) => {
    e.preventDefault();

    if (
      !salaryForm.employee ||
      !salaryForm.netSalary
    ) {
      return;
    }

    const employee =
      salaryData.find(
        (item) =>
          item.name ===
          salaryForm.employee
      );

    if (!employee) return;

    setSalaryData(
      (previous) =>
        previous.map(
          (item) =>
            item.id ===
            employee.id
              ? {
                  ...item,

                  salary:
                    salaryForm
                      .netSalary
                      .startsWith(
                        "$"
                      )
                      ? salaryForm
                          .netSalary
                      : `$${salaryForm.netSalary}`,
                }
              : item
        )
    );

    closeAddModal();
  };

  /* =========================
     EDIT MODAL
  ========================= */

  const openEditModal = (
    item: SalaryType
  ) => {
    setEditingItem(item);

    setSalaryForm({
      employee:
        item.name,

      netSalary:
        item.salary,

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

      profTax: "$800",
      labourWelfare: "$500",
      deductionOthers: "$100",
    });

    setEditOpen(true);
  };

  const closeEditModal = () => {
    setEditOpen(false);

    setEditingItem(null);

    setSalaryForm(
      emptySalaryForm
    );
  };

  const handleEditSalary = (
    e: FormEvent
  ) => {
    e.preventDefault();

    if (!editingItem) {
      return;
    }

    setSalaryData(
      (previous) =>
        previous.map(
          (item) =>
            item.id ===
            editingItem.id
              ? {
                  ...item,

                  name:
                    salaryForm.employee ||
                    item.name,

                  salary:
                    salaryForm.netSalary ||
                    item.salary,
                }
              : item
        )
    );

    closeEditModal();
  };

  /* =========================
     DELETE
  ========================= */

  const openDeleteModal = (
    id: number
  ) => {
    setDeleteId(id);

    setDeleteOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteOpen(false);

    setDeleteId(null);
  };

  const handleDelete = () => {
    if (
      deleteId === null
    ) {
      return;
    }

    setSalaryData(
      (previous) =>
        previous.filter(
          (item) =>
            item.id !==
            deleteId
        )
    );

    setSelectedRows(
      (previous) =>
        previous.filter(
          (id) =>
            id !== deleteId
        )
    );

    closeDeleteModal();
  };

  /* =========================
     FORM UPDATE
  ========================= */

  const updateForm = (
    field: keyof SalaryForm,
    value: string
  ) => {
    setSalaryForm(
      (previous) => ({
        ...previous,
        [field]: value,
      })
    );
  };

  return (
    <>
      <style>
        {`
        .salary-page {
          width: 100%;
          min-height: calc(100vh - 50px);
          padding: 24px 25px 25px;
          background: #f8f9fb;
          color: #10203f;
          font-family: "Inter", "Segoe UI", sans-serif;
        }

        /* =========================
           HEADER
        ========================= */

        .salary-page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 26px;
        }

        .salary-page-title {
          margin: 0 0 5px;
          color: #10203f;
          font-size: 24px;
          font-weight: 700;
        }

        .salary-breadcrumb {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #667386;
          font-size: 12px;
        }

        .salary-breadcrumb a {
          display: inline-flex;
          color: #315c75;
          text-decoration: none;
        }

        .salary-add-btn {
          height: 40px;
          padding: 0 15px;
          border: 0;
          border-radius: 5px;
          background: #c39237;
          color: #fff;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 7px;

          font-size: 14px;
          font-weight: 600;

          cursor: pointer;
        }

        /* =========================
           CARD
        ========================= */

        .salary-card {
          width: 100%;
          overflow: hidden;

          border: 1px solid #dde2e8;
          border-radius: 5px;

          background: #fff;
        }

        /* =========================
           CARD HEADER
        ========================= */

        .salary-card-header {
          min-height: 71px;
          padding: 14px 20px;

          border-bottom: 1px solid #dde2e8;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 20px;
        }

        .salary-card-header h5 {
          margin: 0;
          color: #0b1a37;
          font-size: 15px;
          font-weight: 600;
        }

        .salary-filters {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .salary-filter {
          height: 39px;
          padding: 0 11px;

          border: 1px solid #dce1e7;
          border-radius: 5px;

          outline: none;

          background: #fff;
          color: #14213b;

          font-size: 13px;
        }

        .salary-date-filter {
          width: 195px;
        }

        .salary-designation-filter {
          width: 125px;
        }

        .salary-sort-filter {
          width: 178px;
        }

        /* =========================
           TOOLBAR
        ========================= */

        .salary-toolbar {
          min-height: 61px;
          padding: 10px 16px;

          border-bottom: 1px solid #e2e5e9;

          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .salary-row-control {
          display: flex;
          align-items: center;

          gap: 9px;

          color: #26354d;

          font-size: 13px;
        }

        .salary-row-select {
          width: 49px;
          height: 29px;

          padding: 0 5px;

          border: 1px solid #dce1e7;
          border-radius: 6px;

          background: #fff;

          font-size: 12px;
        }

        .salary-search {
          width: 160px;
          height: 30px;

          padding: 0 14px;

          border: 1px solid #dce1e7;
          border-radius: 5px;

          outline: none;

          font-size: 12px;
        }

        /* =================================================
           TABLE SCROLL

           IMPORTANT:
           Action column sticky nahi hai.
           Puri table horizontal scroll hogi.
           Right scroll karoge tab Edit/Delete dikhenge.
        ================================================= */

        .salary-table-wrapper {
          width: 100%;

          overflow-x: auto;
          overflow-y: hidden;

          scrollbar-width: thin;
          scrollbar-color: #c7ccd3 #f1f2f4;
        }

        .salary-table-wrapper::-webkit-scrollbar {
          height: 8px;
        }

        .salary-table-wrapper::-webkit-scrollbar-track {
          background: #f1f2f4;
        }

        .salary-table-wrapper::-webkit-scrollbar-thumb {
          background: #c7ccd3;
          border-radius: 10px;
        }

        .salary-table {
          width: 100%;

          /*
            Table ko screen se wide rakha hai
            taaki horizontal scroll aaye.
          */

          min-width: 1260px;

          border-collapse: collapse;

          margin: 0;
        }

        .salary-table thead {
          background: #e1e4e9;
        }

        .salary-table th {
          height: 43px;

          padding: 0 12px;

          vertical-align: middle;

          color: #06142e;

          font-size: 13px;
          font-weight: 600;

          white-space: nowrap;
        }

        .salary-table td {
          height: 63px;

          padding: 0 12px;

          vertical-align: middle;

          border-bottom: 1px solid #dfe3e8;

          background: #fff;

          color: #596679;

          font-size: 13px;

          white-space: nowrap;
        }

        .salary-checkbox-column {
          width: 55px;
          min-width: 55px;

          text-align: center;
        }

        .salary-checkbox {
          width: 17px;
          height: 17px;

          cursor: pointer;
        }

        .salary-sort-icon {
          float: right;

          margin-left: 7px;

          color: #cbd1d9;

          font-size: 10px;
        }

        /* =========================
           TABLE COLUMN WIDTHS
        ========================= */

        .salary-emp-id-column {
          min-width: 100px;
        }

        .salary-name-column {
          min-width: 190px;
        }

        .salary-email-column {
          min-width: 195px;
        }

        .salary-phone-column {
          min-width: 150px;
        }

        .salary-designation-column {
          min-width: 150px;
        }

        .salary-joining-column {
          min-width: 125px;
        }

        .salary-salary-column {
          min-width: 105px;
        }

        /*
          Action normal column hai.
          NO sticky.
          NO position fixed.
          NO right:0.
        */

        .salary-action-column {
          width: 85px;
          min-width: 85px;
        }

        /* =========================
           EMPLOYEE
        ========================= */

        .salary-employee {
          display: flex;
          align-items: center;

          gap: 9px;
        }

        .salary-avatar {
          width: 33px;
          height: 33px;

          min-width: 33px;

          border-radius: 50%;

          background: #d7d7d7;

          position: relative;
        }

        .salary-avatar::after {
          content: "...";

          position: absolute;

          inset: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          color: #aaa;

          font-size: 8px;
        }

        .salary-name {
          margin-bottom: 2px;

          color: #06142e;

          font-size: 13px;
          font-weight: 500;
        }

        .salary-role {
          color: #758195;

          font-size: 12px;
        }

        /* =========================
           DESIGNATION
        ========================= */

        .salary-designation-select {
          min-width: 106px;

          height: 40px;

          padding: 0 10px;

          border: 1px solid #dce1e7;
          border-radius: 5px;

          outline: none;

          background: #fff;

          color: #07142d;

          font-size: 13px;

          cursor: pointer;
        }

        /* =========================
           ACTIONS
        ========================= */

        .salary-actions {
          display: inline-flex;
          align-items: center;

          gap: 13px;
        }

        .salary-action-btn {
          width: 21px;
          height: 26px;

          padding: 0;

          border: 0;

          background: transparent;

          color: #657286;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          cursor: pointer;
        }

        .salary-action-btn:hover {
          color: #111827;
        }

        /* =========================
           TABLE FOOTER
        ========================= */

        .salary-table-footer {
          height: 57px;

          padding: 0 16px;

          border-top: 5px solid #f0f1f3;

          display: flex;
          align-items: center;
          justify-content: space-between;

          color: #596679;

          font-size: 13px;
        }

        .salary-pagination {
          display: flex;
          align-items: center;

          gap: 16px;
        }

        .salary-page-arrow {
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

        .salary-page-arrow:disabled {
          opacity: .4;
          cursor: default;
        }

        .salary-current-page {
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

        /* =========================
           MODAL OVERLAY
        ========================= */

        .salary-modal-overlay {
          position: fixed;

          inset: 0;

          z-index: 99999;

          padding: 10px 15px;

          display: flex;
          align-items: center;
          justify-content: center;

          background: rgba(0, 0, 0, .42);
        }

        /* =========================
           ADD / EDIT MODAL
        ========================= */

        .salary-form-modal {
          width: 800px;

          max-width: calc(100vw - 30px);
          max-height: calc(100vh - 20px);

          overflow-y: auto;

          border-radius: 5px;

          background: #fff;

          box-shadow:
            0 15px 45px
            rgba(0,0,0,.22);
        }

        .salary-modal-header {
          height: 64px;

          padding: 0 17px;

          position: sticky;

          top: 0;

          z-index: 5;

          border-bottom: 1px solid #e3e7eb;

          background: #fff;

          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .salary-modal-header h3 {
          margin: 0;

          color: #1e2b49;

          font-size: 20px;
          font-weight: 600;
        }

        .salary-modal-close {
          width: 20px;
          height: 20px;

          padding: 0;

          border: 0;
          border-radius: 50%;

          background: #747d8a;

          color: #fff;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 14px;

          cursor: pointer;
        }

        .salary-modal-body {
          padding: 17px;
        }

        .salary-main-grid {
          display: grid;

          grid-template-columns:
            repeat(2, minmax(0,1fr));

          gap: 17px 24px;

          margin-bottom: 17px;
        }

        .salary-form-group label {
          display: block;

          margin-bottom: 8px;

          color: #263452;

          font-size: 13px;
          font-weight: 500;
        }

        .salary-form-group input,
        .salary-form-group select {
          width: 100%;
          height: 38px;

          padding: 0 10px;

          border: 1px solid #dce1e7;
          border-radius: 5px;

          outline: none;

          background: #fff;

          color: #26344d;

          font-size: 13px;
        }

        .salary-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          margin: 4px 0 17px;

          color: #263452;

          font-size: 13px;
          font-weight: 500;
        }

        .salary-add-new {
          padding: 0;

          border: 0;

          background: transparent;

          color: #c39237;

          display: inline-flex;
          align-items: center;

          gap: 7px;

          font-size: 13px;

          cursor: pointer;
        }

        .salary-field-grid {
          display: grid;

          grid-template-columns:
            repeat(4, minmax(0,1fr));

          gap: 17px 24px;

          margin-bottom: 17px;
        }

        .salary-modal-footer {
          min-height: 64px;

          padding: 10px 13px;

          position: sticky;

          bottom: 0;

          z-index: 5;

          border-top: 1px solid #e4e7eb;

          background: #fff;

          display: flex;
          align-items: center;
          justify-content: flex-end;

          gap: 8px;
        }

        .salary-modal-cancel,
        .salary-modal-save {
          height: 39px;

          padding: 0 15px;

          border: 0;
          border-radius: 5px;

          font-size: 13px;

          cursor: pointer;
        }

        .salary-modal-cancel {
          background: #f7f8f9;
          color: #172033;
        }

        .salary-modal-save {
          background: #c39237;
          color: #fff;

          font-weight: 600;
        }

        /* =========================
           DELETE MODAL
        ========================= */

        .salary-delete-modal {
          width: 400px;

          max-width: calc(100vw - 30px);

          padding: 17px 30px;

          border-radius: 5px;

          background: #fff;

          text-align: center;

          box-shadow:
            0 15px 45px
            rgba(0,0,0,.2);
        }

        .salary-delete-icon {
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

        .salary-delete-modal h3 {
          margin: 0 0 6px;

          color: #1d2b48;

          font-size: 19px;
          font-weight: 600;
        }

        .salary-delete-modal p {
          max-width: 330px;

          margin: 0 auto 17px;

          color: #3e4654;

          font-size: 13px;

          line-height: 1.5;
        }

        .salary-delete-actions {
          display: flex;
          justify-content: center;

          gap: 16px;
        }

        .salary-delete-cancel,
        .salary-delete-confirm {
          height: 39px;

          padding: 0 16px;

          border: 0;
          border-radius: 5px;

          font-size: 13px;

          cursor: pointer;
        }

        .salary-delete-cancel {
          background: #f6f7f8;
          color: #172033;
        }

        .salary-delete-confirm {
          background: #f10d16;
          color: #fff;

          font-weight: 600;
        }

        @media(max-width:900px) {
          .salary-card-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .salary-filters {
            width: 100%;
            flex-wrap: wrap;
          }

          .salary-field-grid {
            grid-template-columns:
              repeat(2,1fr);
          }
        }

        @media(max-width:650px) {
          .salary-main-grid,
          .salary-field-grid {
            grid-template-columns: 1fr;
          }

          .salary-toolbar {
            flex-direction: column;
            align-items: stretch;

            gap: 10px;
          }

          .salary-search {
            width: 100%;
          }
        }
        `}
      </style>

      <div className="salary-page">
        {/* HEADER */}

        <div className="salary-page-header">
          <div>
            <h1 className="salary-page-title">
              Employee Salary
            </h1>

            <div className="salary-breadcrumb">
              <Link to="/admin/dashboard">
                <i className="ti ti-home" />
              </Link>

              <span>/</span>

              <span>
                Employee Salary
              </span>
            </div>
          </div>

          <button
            type="button"
            className="salary-add-btn"
            onClick={openAddModal}
          >
            <PlusCircle size={15} />

            Add Salary
          </button>
        </div>

        {/* CARD */}

        <div className="salary-card">
          {/* CARD HEADER */}

          <div className="salary-card-header">
            <h5>
              Employee Salary List
            </h5>

            <div className="salary-filters">
              <select
                className="salary-filter salary-date-filter"
                defaultValue="range"
              >
                <option value="range">
                  08/28/2026 - 09/03/20
                </option>

                <option value="today">
                  Today
                </option>

                <option value="7">
                  Last 7 Days
                </option>

                <option value="30">
                  Last 30 Days
                </option>
              </select>

              <select
                className="salary-filter salary-designation-filter"
                value={designationFilter}
                onChange={(e) => {
                  setDesignationFilter(
                    e.target.value
                  );

                  setCurrentPage(1);
                }}
              >
                <option value="">
                  Designation
                </option>

                {designationOptions.map(
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

              <select
                className="salary-filter salary-sort-filter"
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
              </select>
            </div>
          </div>

          {/* TOOLBAR */}

          <div className="salary-toolbar">
            <div className="salary-row-control">
              <span>
                Row Per Page
              </span>

              <select
                className="salary-row-select"
                value={rowsPerPage}
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

                <option value={50}>
                  50
                </option>
              </select>

              <span>
                Entries
              </span>
            </div>

            <input
              className="salary-search"
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
              HORIZONTAL SCROLL TABLE
          ===================================== */}

          <div className="salary-table-wrapper">
            <table className="salary-table">
              <thead>
                <tr>
                  <th className="salary-checkbox-column">
                    <input
                      type="checkbox"
                      className="salary-checkbox"
                      checked={allVisibleSelected}
                      onChange={handleSelectAll}
                    />
                  </th>

                  <th className="salary-emp-id-column">
                    Emp ID
                    <span className="salary-sort-icon">
                      ↑↓
                    </span>
                  </th>

                  <th className="salary-name-column">
                    Name
                    <span className="salary-sort-icon">
                      ↑↓
                    </span>
                  </th>

                  <th className="salary-email-column">
                    Email
                    <span className="salary-sort-icon">
                      ↑↓
                    </span>
                  </th>

                  <th className="salary-phone-column">
                    Phone
                    <span className="salary-sort-icon">
                      ↑↓
                    </span>
                  </th>

                  <th className="salary-designation-column">
                    Designation
                    <span className="salary-sort-icon">
                      ↑↓
                    </span>
                  </th>

                  <th className="salary-joining-column">
                    Joining Date
                    <span className="salary-sort-icon">
                      ↑↓
                    </span>
                  </th>

                  <th className="salary-salary-column">
                    Salary
                    <span className="salary-sort-icon">
                      ↑↓
                    </span>
                  </th>

                  {/* NORMAL ACTION COLUMN */}

                  <th className="salary-action-column">
                    <span className="salary-sort-icon">
                      ↑↓
                    </span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {visibleData.map(
                  (item) => (
                    <tr key={item.id}>
                      <td className="salary-checkbox-column">
                        <input
                          type="checkbox"
                          className="salary-checkbox"
                          checked={selectedRows.includes(
                            item.id
                          )}
                          onChange={() =>
                            handleSelectRow(
                              item.id
                            )
                          }
                        />
                      </td>

                      <td>
                        {item.empId}
                      </td>

                      <td>
                        <div className="salary-employee">
                          <div className="salary-avatar" />

                          <div>
                            <div className="salary-name">
                              {item.name}
                            </div>

                            <div className="salary-role">
                              {item.role}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        {item.email}
                      </td>

                      <td>
                        {item.phone}
                      </td>

                      <td>
                        <select
                          className="salary-designation-select"
                          value={
                            item.designation
                          }
                          onChange={(e) =>
                            updateDesignation(
                              item.id,
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
                      </td>

                      <td>
                        {item.joiningDate}
                      </td>

                      <td>
                        {item.salary}
                      </td>

                      {/* =========================
                          EDIT / DELETE
                          TABLE KE END ME
                      ========================= */}

                      <td className="salary-action-column">
                        <div className="salary-actions">
                          <button
                            type="button"
                            className="salary-action-btn"
                            title="Edit"
                            onClick={() =>
                              openEditModal(
                                item
                              )
                            }
                          >
                            <Pencil
                              size={15}
                            />
                          </button>

                          <button
                            type="button"
                            className="salary-action-btn"
                            title="Delete"
                            onClick={() =>
                              openDeleteModal(
                                item.id
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

                {visibleData.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      style={{
                        height: "90px",
                        textAlign: "center",
                      }}
                    >
                      No salary records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* TABLE FOOTER */}

          <div className="salary-table-footer">
            <div>
              Showing{" "}
              {filteredData.length === 0
                ? 0
                : (safeCurrentPage - 1) *
                    rowsPerPage +
                  1}
              {" - "}
              {Math.min(
                safeCurrentPage *
                  rowsPerPage,
                filteredData.length
              )}{" "}
              of{" "}
              {filteredData.length}{" "}
              entries
            </div>

            <div className="salary-pagination">
              <button
                type="button"
                className="salary-page-arrow"
                disabled={
                  safeCurrentPage === 1
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

              <span className="salary-current-page">
                {safeCurrentPage}
              </span>

              <button
                type="button"
                className="salary-page-arrow"
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

      {/* =================================================
          ADD SALARY MODAL
      ================================================= */}

      {addOpen && (
        <div className="salary-modal-overlay">
          <div className="salary-form-modal">
            <div className="salary-modal-header">
              <h3>
                Add Employee Salary
              </h3>

              <button
                type="button"
                className="salary-modal-close"
                onClick={closeAddModal}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddSalary}>
              <div className="salary-modal-body">
                <div className="salary-main-grid">
                  <div className="salary-form-group">
                    <label>
                      Employee Name
                    </label>

                    <select
                      value={
                        salaryForm.employee
                      }
                      onChange={(e) =>
                        updateForm(
                          "employee",
                          e.target.value
                        )
                      }
                    >
                      <option value="">
                        Select
                      </option>

                      {salaryData.map(
                        (employee) => (
                          <option
                            key={employee.id}
                            value={employee.name}
                          >
                            {employee.name}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <SalaryInput
                    label="Net Salary"
                    value={
                      salaryForm.netSalary
                    }
                    onChange={(value) =>
                      updateForm(
                        "netSalary",
                        value
                      )
                    }
                  />
                </div>

                {/* EARNINGS */}

                <div className="salary-section-header">
                  <span>
                    Earnings
                  </span>

                  <button
                    type="button"
                    className="salary-add-new"
                  >
                    <Plus size={14} />
                    Add New
                  </button>
                </div>

                <div className="salary-field-grid">
                  <SalaryInput
                    label="Basic"
                    value={salaryForm.basic}
                    onChange={(value) =>
                      updateForm(
                        "basic",
                        value
                      )
                    }
                  />

                  <SalaryInput
                    label="DA(40%)"
                    value={salaryForm.da}
                    onChange={(value) =>
                      updateForm(
                        "da",
                        value
                      )
                    }
                  />

                  <SalaryInput
                    label="HRA(15%)"
                    value={salaryForm.hra}
                    onChange={(value) =>
                      updateForm(
                        "hra",
                        value
                      )
                    }
                  />

                  <SalaryInput
                    label="Conveyance"
                    value={
                      salaryForm.conveyance
                    }
                    onChange={(value) =>
                      updateForm(
                        "conveyance",
                        value
                      )
                    }
                  />

                  <SalaryInput
                    label="Allowance"
                    value={
                      salaryForm.allowance
                    }
                    onChange={(value) =>
                      updateForm(
                        "allowance",
                        value
                      )
                    }
                  />

                  <SalaryInput
                    label="Medical Allowance"
                    value={
                      salaryForm.medicalAllowance
                    }
                    onChange={(value) =>
                      updateForm(
                        "medicalAllowance",
                        value
                      )
                    }
                  />

                  <SalaryInput
                    label="Others"
                    value={
                      salaryForm.earningOthers
                    }
                    onChange={(value) =>
                      updateForm(
                        "earningOthers",
                        value
                      )
                    }
                  />
                </div>

                {/* DEDUCTIONS */}

                <div className="salary-section-header">
                  <span>
                    Deductions
                  </span>

                  <button
                    type="button"
                    className="salary-add-new"
                  >
                    <Plus size={14} />
                    Add New
                  </button>
                </div>

                <div className="salary-field-grid">
                  <SalaryInput
                    label="TDS"
                    value={salaryForm.tds}
                    onChange={(value) =>
                      updateForm(
                        "tds",
                        value
                      )
                    }
                  />

                  <SalaryInput
                    label="ESI"
                    value={salaryForm.esi}
                    onChange={(value) =>
                      updateForm(
                        "esi",
                        value
                      )
                    }
                  />

                  <SalaryInput
                    label="PF"
                    value={salaryForm.pf}
                    onChange={(value) =>
                      updateForm(
                        "pf",
                        value
                      )
                    }
                  />

                  <SalaryInput
                    label="Leave"
                    value={salaryForm.leave}
                    onChange={(value) =>
                      updateForm(
                        "leave",
                        value
                      )
                    }
                  />

                  <SalaryInput
                    label="Prof.Tax"
                    value={
                      salaryForm.profTax
                    }
                    onChange={(value) =>
                      updateForm(
                        "profTax",
                        value
                      )
                    }
                  />

                  <SalaryInput
                    label="Labour Welfare"
                    value={
                      salaryForm.labourWelfare
                    }
                    onChange={(value) =>
                      updateForm(
                        "labourWelfare",
                        value
                      )
                    }
                  />

                  <SalaryInput
                    label="Others"
                    value={
                      salaryForm.deductionOthers
                    }
                    onChange={(value) =>
                      updateForm(
                        "deductionOthers",
                        value
                      )
                    }
                  />
                </div>
              </div>

              <div className="salary-modal-footer">
                <button
                  type="button"
                  className="salary-modal-cancel"
                  onClick={closeAddModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="salary-modal-save"
                >
                  Add Employee Salary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================
          EDIT SALARY MODAL
      ================================================= */}

      {editOpen &&
        editingItem && (
          <div className="salary-modal-overlay">
            <div className="salary-form-modal">
              <div className="salary-modal-header">
                <h3>
                  Edit Employee Salary
                </h3>

                <button
                  type="button"
                  className="salary-modal-close"
                  onClick={
                    closeEditModal
                  }
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={
                  handleEditSalary
                }
              >
                <div className="salary-modal-body">
                  <div className="salary-main-grid">
                    <div className="salary-form-group">
                      <label>
                        Employee Name
                      </label>

                      <select
                        value={
                          salaryForm.employee
                        }
                        onChange={(e) =>
                          updateForm(
                            "employee",
                            e.target.value
                          )
                        }
                      >
                        {salaryData.map(
                          (employee) => (
                            <option
                              key={employee.id}
                              value={employee.name}
                            >
                              {employee.name}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <SalaryInput
                      label="Net Salary"
                      value={
                        salaryForm.netSalary
                      }
                      onChange={(value) =>
                        updateForm(
                          "netSalary",
                          value
                        )
                      }
                    />
                  </div>

                  <div className="salary-section-header">
                    <span>
                      Earnings
                    </span>

                    <button
                      type="button"
                      className="salary-add-new"
                    >
                      <Plus size={14} />
                      Add New
                    </button>
                  </div>

                  <div className="salary-field-grid">
                    <SalaryInput
                      label="Basic"
                      value={salaryForm.basic}
                      onChange={(value) =>
                        updateForm(
                          "basic",
                          value
                        )
                      }
                    />

                    <SalaryInput
                      label="DA(40%)"
                      value={salaryForm.da}
                      onChange={(value) =>
                        updateForm(
                          "da",
                          value
                        )
                      }
                    />

                    <SalaryInput
                      label="HRA(15%)"
                      value={salaryForm.hra}
                      onChange={(value) =>
                        updateForm(
                          "hra",
                          value
                        )
                      }
                    />

                    <SalaryInput
                      label="Conveyance"
                      value={
                        salaryForm.conveyance
                      }
                      onChange={(value) =>
                        updateForm(
                          "conveyance",
                          value
                        )
                      }
                    />

                    <SalaryInput
                      label="Allowance"
                      value={
                        salaryForm.allowance
                      }
                      onChange={(value) =>
                        updateForm(
                          "allowance",
                          value
                        )
                      }
                    />

                    <SalaryInput
                      label="Medical Allowance"
                      value={
                        salaryForm.medicalAllowance
                      }
                      onChange={(value) =>
                        updateForm(
                          "medicalAllowance",
                          value
                        )
                      }
                    />

                    <SalaryInput
                      label="Others"
                      value={
                        salaryForm.earningOthers
                      }
                      onChange={(value) =>
                        updateForm(
                          "earningOthers",
                          value
                        )
                      }
                    />
                  </div>

                  <div className="salary-section-header">
                    <span>
                      Deductions
                    </span>

                    <button
                      type="button"
                      className="salary-add-new"
                    >
                      <Plus size={14} />
                      Add New
                    </button>
                  </div>

                  <div className="salary-field-grid">
                    <SalaryInput
                      label="TDS"
                      value={salaryForm.tds}
                      onChange={(value) =>
                        updateForm(
                          "tds",
                          value
                        )
                      }
                    />

                    <SalaryInput
                      label="ESI"
                      value={salaryForm.esi}
                      onChange={(value) =>
                        updateForm(
                          "esi",
                          value
                        )
                      }
                    />

                    <SalaryInput
                      label="PF"
                      value={salaryForm.pf}
                      onChange={(value) =>
                        updateForm(
                          "pf",
                          value
                        )
                      }
                    />

                    <SalaryInput
                      label="Leave"
                      value={salaryForm.leave}
                      onChange={(value) =>
                        updateForm(
                          "leave",
                          value
                        )
                      }
                    />

                    <SalaryInput
                      label="Prof.Tax"
                      value={
                        salaryForm.profTax
                      }
                      onChange={(value) =>
                        updateForm(
                          "profTax",
                          value
                        )
                      }
                    />

                    <SalaryInput
                      label="Labour Welfare"
                      value={
                        salaryForm.labourWelfare
                      }
                      onChange={(value) =>
                        updateForm(
                          "labourWelfare",
                          value
                        )
                      }
                    />

                    <SalaryInput
                      label="Others"
                      value={
                        salaryForm.deductionOthers
                      }
                      onChange={(value) =>
                        updateForm(
                          "deductionOthers",
                          value
                        )
                      }
                    />
                  </div>
                </div>

                <div className="salary-modal-footer">
                  <button
                    type="button"
                    className="salary-modal-cancel"
                    onClick={
                      closeEditModal
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="salary-modal-save"
                  >
                    Add Employee Salary
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      {/* =================================================
          DELETE MODAL
      ================================================= */}

      {deleteOpen && (
        <div className="salary-modal-overlay">
          <div className="salary-delete-modal">
            <div className="salary-delete-icon">
              <Trash2
                size={31}
                strokeWidth={2.2}
              />
            </div>

            <h3>
              Confirm Delete
            </h3>

            <p>
              You want to delete all the marked
              items, this cant be undone once you
              delete.
            </p>

            <div className="salary-delete-actions">
              <button
                type="button"
                className="salary-delete-cancel"
                onClick={
                  closeDeleteModal
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="salary-delete-confirm"
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

/* =========================
   REUSABLE INPUT
========================= */

interface SalaryInputProps {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
}

const SalaryInput = ({
  label,
  value,
  onChange,
}: SalaryInputProps) => {
  return (
    <div className="salary-form-group">
      <label>
        {label}
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

export default EmployeSalary;
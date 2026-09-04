// Departments.tsx

import React, { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";

interface Department {
  id: number;
  name: string;
  employees: number;
  status: "Active" | "Inactive";
}

type SortKey = "name" | "employees" | "status";
type SortDir = "asc" | "desc";

const initialData: Department[] = [
  { id: 1, name: "Finance", employees: 20, status: "Active" },
  {
    id: 2,
    name: "Application Development",
    employees: 30,
    status: "Active",
  },
  {
    id: 3,
    name: "IT Management",
    employees: 15,
    status: "Inactive",
  },
  {
    id: 4,
    name: "Web Development",
    employees: 20,
    status: "Active",
  },
  {
    id: 5,
    name: "Sales",
    employees: 20,
    status: "Inactive",
  },
  {
    id: 6,
    name: "UI / UX",
    employees: 30,
    status: "Active",
  },
  {
    id: 7,
    name: "Account Management",
    employees: 15,
    status: "Active",
  },
  {
    id: 8,
    name: "Marketing",
    employees: 10,
    status: "Inactive",
  },
  {
    id: 9,
    name: "Administration",
    employees: 5,
    status: "Active",
  },
  {
    id: 10,
    name: "Business Development",
    employees: 7,
    status: "Inactive",
  },
];

const Departments = () => {
  const [departments, setDepartments] =
    useState<Department[]>(initialData);

  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [sortKey, setSortKey] =
    useState<SortKey>("name");

  const [sortDir, setSortDir] =
    useState<SortDir>("asc");

  const [selected, setSelected] =
    useState<number[]>([]);

  const [statusFilter, setStatusFilter] =
    useState("");

  // MODALS
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] =
    useState(false);

  // FORM
  const [departmentName, setDepartmentName] =
    useState("");

  const [departmentStatus, setDepartmentStatus] =
    useState<"Active" | "Inactive" | "">("");

  const [editingDepartment, setEditingDepartment] =
    useState<Department | null>(null);

  const [deleteId, setDeleteId] =
    useState<number | null>(null);

  // ==========================
  // SORT
  // ==========================

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((previous) =>
        previous === "asc" ? "desc" : "asc"
      );
    } else {
      setSortKey(key);
      setSortDir("asc");
    }

    setCurrentPage(1);
  };

  const SortIcon = ({
    col,
  }: {
    col: SortKey;
  }) => (
    <span className="sort-icon">
      {sortKey === col
        ? sortDir === "asc"
          ? "↑"
          : "↓"
        : "↑↓"}
    </span>
  );

  // ==========================
  // FILTER + SORT
  // ==========================

  const filtered = useMemo(() => {
    let data = [...departments];

    if (search.trim()) {
      data = data.filter((department) =>
        department.name
          .toLowerCase()
          .includes(search.trim().toLowerCase())
      );
    }

    if (statusFilter) {
      data = data.filter(
        (department) =>
          department.status === statusFilter
      );
    }

    data.sort((a, b) => {
      let valA: string | number = a[sortKey];
      let valB: string | number = b[sortKey];

      if (typeof valA === "string") {
        valA = valA.toLowerCase();
      }

      if (typeof valB === "string") {
        valB = valB.toLowerCase();
      }

      if (valA < valB) {
        return sortDir === "asc" ? -1 : 1;
      }

      if (valA > valB) {
        return sortDir === "asc" ? 1 : -1;
      }

      return 0;
    });

    return data;
  }, [
    departments,
    search,
    statusFilter,
    sortKey,
    sortDir,
  ]);

  // ==========================
  // PAGINATION
  // ==========================

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / rowsPerPage)
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const paginated = filtered.slice(
    (safeCurrentPage - 1) * rowsPerPage,
    safeCurrentPage * rowsPerPage
  );

  // ==========================
  // CHECKBOX
  // ==========================

  const toggleSelect = (id: number) => {
    setSelected((previous) =>
      previous.includes(id)
        ? previous.filter(
            (selectedId) =>
              selectedId !== id
          )
        : [...previous, id]
    );
  };

  const allCurrentPageSelected =
    paginated.length > 0 &&
    paginated.every((department) =>
      selected.includes(department.id)
    );

  const handleSelectAll = () => {
    const currentIds = paginated.map(
      (department) => department.id
    );

    if (allCurrentPageSelected) {
      setSelected((previous) =>
        previous.filter(
          (id) => !currentIds.includes(id)
        )
      );
    } else {
      setSelected((previous) => [
        ...new Set([
          ...previous,
          ...currentIds,
        ]),
      ]);
    }
  };

  // ==========================
  // ADD MODAL
  // ==========================

  const openAddModal = () => {
    setDepartmentName("");
    setDepartmentStatus("");
    setAddOpen(true);
  };

  const closeAddModal = () => {
    setAddOpen(false);
    setDepartmentName("");
    setDepartmentStatus("");
  };

  const handleAddDepartment = (
    e: FormEvent
  ) => {
    e.preventDefault();

    if (
      !departmentName.trim() ||
      !departmentStatus
    ) {
      return;
    }

    const newDepartment: Department = {
      id:
        departments.length > 0
          ? Math.max(
              ...departments.map(
                (department) =>
                  department.id
              )
            ) + 1
          : 1,

      name: departmentName.trim(),
      employees: 0,
      status: departmentStatus,
    };

    setDepartments((previous) => [
      ...previous,
      newDepartment,
    ]);

    closeAddModal();
  };

  // ==========================
  // EDIT MODAL
  // ==========================

  const openEditModal = (
    department: Department
  ) => {
    setEditingDepartment(department);

    setDepartmentName(department.name);
    setDepartmentStatus(
      department.status
    );

    setEditOpen(true);
  };

  const closeEditModal = () => {
    setEditOpen(false);
    setEditingDepartment(null);

    setDepartmentName("");
    setDepartmentStatus("");
  };

  const handleEditDepartment = (
    e: FormEvent
  ) => {
    e.preventDefault();

    if (
      !editingDepartment ||
      !departmentName.trim() ||
      !departmentStatus
    ) {
      return;
    }

    setDepartments((previous) =>
      previous.map((department) =>
        department.id ===
        editingDepartment.id
          ? {
              ...department,
              name: departmentName.trim(),
              status: departmentStatus,
            }
          : department
      )
    );

    closeEditModal();
  };

  // ==========================
  // DELETE MODAL
  // ==========================

  const openDeleteModal = (id: number) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteOpen(false);
    setDeleteId(null);
  };

  const handleDeleteDepartment = () => {
    if (deleteId === null) return;

    setDepartments((previous) =>
      previous.filter(
        (department) =>
          department.id !== deleteId
      )
    );

    setSelected((previous) =>
      previous.filter(
        (id) => id !== deleteId
      )
    );

    closeDeleteModal();
  };

  return (
    <>
      {/* ================================
          SINGLE FILE CSS
      ================================= */}

      <style>
        {`
        .departments-page {
          width: 100%;
        }

        .department-top {
          margin-bottom: 14px;
        }

        .department-title {
          margin: 0 0 4px;
          color: #17233e;
          font-size: 18px;
          font-weight: 600;
        }

        .department-add-btn {
          height: 38px;
          padding: 0 14px;
          border: none;
          border-radius: 5px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          background: #bd9039;
          color: #fff;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
        }

        .department-add-btn:hover {
          background: #ad8230;
          color: #fff;
        }

        .department-card {
          overflow: hidden;
          border: 1px solid #e1e5eb;
          border-radius: 4px;
          background: #fff;
        }

        .department-card-header {
          min-height: 62px;
          padding: 14px 18px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .department-card-header h5 {
          margin: 0;
          color: #17233e;
          font-size: 14px;
          font-weight: 600;
        }

        .department-filter-area {
          display: flex;
          gap: 10px;
        }

        .department-filter {
          height: 34px;
          border: 1px solid #dfe3e8;
          border-radius: 5px;
          background: white;
          color: #1b2943;
          font-size: 12px;
          padding: 0 10px;
          outline: none;
        }

        .status-filter {
          width: 120px;
        }

        .sort-filter {
          width: 165px;
        }

        .department-controls {
          min-height: 55px;
          padding: 10px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #e5e7eb;
        }

        .rows-area {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #49566a;
          font-size: 12px;
        }

        .rows-area select {
          width: 58px;
          height: 30px;
          border: 1px solid #dfe3e8;
          border-radius: 5px;
          background: white;
          font-size: 12px;
          padding: 0 7px;
          outline: none;
        }

        .department-search {
          width: 180px;
          height: 30px;
          padding: 0 10px;
          border: 1px solid #dfe3e8;
          border-radius: 5px;
          outline: none;
          font-size: 12px;
        }

        .department-table {
          width: 100%;
          margin: 0;
        }

        .department-table thead {
          background: #e5e7eb;
        }

        .department-table th {
          height: 42px;
          padding: 0 14px !important;
          vertical-align: middle;
          color: #101d38;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
        }

        .department-table td {
          height: 48px;
          padding: 0 14px !important;
          vertical-align: middle;
          color: #13213a;
          font-size: 12px;
          white-space: nowrap;
        }

        .department-table tbody tr {
          border-bottom: 1px solid #e7e9ed;
        }

        .department-table tbody tr:last-child {
          border-bottom: none;
        }

        .department-checkbox {
          width: 15px;
          height: 15px;
          cursor: pointer;
        }

        .sort-icon {
          margin-left: 4px;
          color: #9da5b2;
          font-size: 9px;
          cursor: pointer;
        }

        /* ==========================
           STATUS BADGE
        ========================== */

        .department-status-badge {
          height: 18px;
          min-width: 52px;
          padding: 0 6px;

          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;

          border-radius: 4px;

          color: #fff;
          font-size: 10px;
          font-weight: 600;
          line-height: 1;
        }

        .department-status-active {
          background: #00bd61;
        }

        .department-status-inactive {
          background: #ef0707;
        }

        .department-status-dot {
          width: 4px !important;
          height: 4px !important;
          min-width: 4px !important;
          min-height: 4px !important;

          flex: 0 0 4px;

          display: block;

          padding: 0 !important;
          margin: 0 !important;

          border: 0 !important;
          border-radius: 50% !important;

          background: #fff !important;
        }

        /* ==========================
           ACTION ICON
        ========================== */

        .department-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .department-action-btn {
          width: 26px;
          height: 26px;

          padding: 0;

          border: none;
          background: transparent;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          color: #536174;
          font-size: 16px;

          cursor: pointer;
        }

        .department-action-btn:hover {
          color: #111827;
        }

        .department-delete-btn,
        .department-delete-btn i {
          color: #000 !important;
        }

        /* ==========================
           PAGINATION
        ========================== */

        .department-footer {
          min-height: 52px;
          padding: 10px 16px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          color: #596579;
          font-size: 12px;
        }

        .department-pagination {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .page-btn {
          width: 27px;
          height: 27px;

          padding: 0;

          border: 1px solid #e2e6eb;
          border-radius: 4px;

          background: white;
          color: #536174;

          display: flex;
          align-items: center;
          justify-content: center;

          cursor: pointer;
        }

        .page-btn.active {
          border-color: #bd9039;
          background: #bd9039;
          color: white;
        }

        .page-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* ==================================
           CUSTOM MODAL BACKDROP
        ================================== */

        .department-modal-overlay {
          position: fixed;
          inset: 0;

          z-index: 99999;

          padding: 20px;

          display: flex;
          align-items: center;
          justify-content: center;

          background: rgba(0, 0, 0, 0.42);
        }

        /* ==================================
           ADD / EDIT MODAL
        ================================== */

        .department-form-modal {
          width: 500px;
          max-width: 100%;

          overflow: hidden;

          border-radius: 5px;
          background: #fff;

          box-shadow: 0 10px 35px rgba(0,0,0,.18);
        }

        .department-modal-header {
          height: 64px;
          padding: 0 17px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          border-bottom: 1px solid #e3e7eb;
        }

        .department-modal-header h3 {
          margin: 0;

          color: #1e2b49;

          font-size: 20px;
          font-weight: 600;
        }

        .department-modal-close {
          width: 21px;
          height: 21px;

          padding: 0;

          border: 0;
          border-radius: 50%;

          background: #747c89;
          color: #fff;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 13px;
          line-height: 1;

          cursor: pointer;
        }

        .department-modal-body {
          padding: 17px;
        }

        .department-form-group {
          margin-bottom: 17px;
        }

        .department-form-group:last-child {
          margin-bottom: 0;
        }

        .department-form-group label {
          display: block;

          margin-bottom: 8px;

          color: #263452;

          font-size: 13px;
          font-weight: 500;
        }

        .department-form-group input,
        .department-form-group select {
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

        .department-form-group input:focus,
        .department-form-group select:focus {
          border-color: #bd9039;
        }

        .department-modal-footer {
          min-height: 64px;
          padding: 10px 12px;

          display: flex;
          align-items: center;
          justify-content: flex-end;

          gap: 8px;

          border-top: 1px solid #e4e7eb;
        }

        .department-modal-cancel {
          height: 39px;

          padding: 0 15px;

          border: 0;
          border-radius: 5px;

          background: #f8f9fa;
          color: #172033;

          font-size: 13px;
          font-weight: 500;

          cursor: pointer;
        }

        .department-modal-save {
          height: 39px;

          padding: 0 15px;

          border: 0;
          border-radius: 5px;

          background: #bd9039;
          color: #fff;

          font-size: 13px;
          font-weight: 600;

          cursor: pointer;
        }

        .department-modal-save:hover {
          background: #aa8030;
        }

        /* ==================================
           DELETE MODAL
        ================================== */

        .department-delete-modal {
          width: 400px;
          max-width: 100%;

          padding: 16px 30px 17px;

          border-radius: 5px;

          background: #fff;

          text-align: center;

          box-shadow: 0 10px 35px rgba(0,0,0,.18);
        }

        .delete-modal-icon {
          width: 58px;
          height: 58px;

          margin: 0 auto 14px;

          border-radius: 4px;

          display: flex;
          align-items: center;
          justify-content: center;

          background: #f6cccc;
          color: #f10f18;

          font-size: 30px;
        }

        .delete-modal-icon i {
          color: #f10f18;
          font-size: 30px;
        }

        .department-delete-modal h3 {
          margin: 0 0 6px;

          color: #1d2b48;

          font-size: 19px;
          font-weight: 600;
        }

        .department-delete-modal p {
          max-width: 330px;

          margin: 0 auto 17px;

          color: #3e4654;

          font-size: 13px;
          line-height: 1.5;
        }

        .delete-actions {
          display: flex;
          align-items: center;
          justify-content: center;

          gap: 16px;
        }

        .delete-cancel-btn {
          height: 39px;
          padding: 0 16px;

          border: 0;
          border-radius: 5px;

          background: #f6f7f8;
          color: #172033;

          font-size: 13px;
          font-weight: 500;

          cursor: pointer;
        }

        .delete-confirm-btn {
          height: 39px;
          padding: 0 16px;

          border: 0;
          border-radius: 5px;

          background: #f10d16;
          color: #fff;

          font-size: 13px;
          font-weight: 600;

          cursor: pointer;
        }

        .delete-confirm-btn:hover {
          background: #dc0710;
        }

        @media (max-width: 768px) {
          .department-card-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .department-filter-area {
            width: 100%;
            flex-direction: column;
          }

          .status-filter,
          .sort-filter {
            width: 100%;
          }

          .department-controls {
            align-items: flex-start;
            flex-direction: column;
            gap: 10px;
          }

          .department-search {
            width: 100%;
          }
        }
      `}
      </style>

      <div className="departments-page">
        {/* ==========================
            TOP HEADER
        ========================== */}

        <div className="d-md-flex d-block align-items-center justify-content-between department-top">
          <div>
            <h2 className="department-title">
              Departments
            </h2>

            <nav>
              <ol
                className="breadcrumb mb-0"
                style={{ fontSize: "12px" }}
              >
                <li className="breadcrumb-item">
                  <Link to="/admin/dashboard">
                    <i className="ti ti-smart-home" />
                  </Link>
                </li>

                <li className="breadcrumb-item active">
                  Departments
                </li>
              </ol>
            </nav>
          </div>

          {/* ADD DEPARTMENT BUTTON */}

          <button
            type="button"
            className="department-add-btn"
            onClick={openAddModal}
          >
            <i className="ti ti-circle-plus" />
            Add Department
          </button>
        </div>

        {/* ==========================
            CARD
        ========================== */}

        <div className="department-card">
          {/* HEADER */}

          <div className="department-card-header">
            <h5>Department List</h5>

            <div className="department-filter-area">
              <select
                className="department-filter status-filter"
                value={statusFilter}
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
                className="department-filter sort-filter"
                defaultValue=""
                onChange={(e) => {
                  if (
                    e.target.value ===
                    "Ascending"
                  ) {
                    setSortKey("name");
                    setSortDir("asc");
                  }

                  if (
                    e.target.value ===
                    "Descending"
                  ) {
                    setSortKey("name");
                    setSortDir("desc");
                  }

                  setCurrentPage(1);
                }}
              >
                <option value="">
                  Sort By : Last 7 Days
                </option>

                <option value="Ascending">
                  Ascending
                </option>

                <option value="Descending">
                  Descending
                </option>

                <option value="Month">
                  This Month
                </option>

                <option value="Year">
                  This Year
                </option>
              </select>
            </div>
          </div>

          {/* ==========================
              CONTROLS
          ========================== */}

          <div className="department-controls">
            <div className="rows-area">
              <span>
                Rows per page
              </span>

              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(
                    Number(e.target.value)
                  );

                  setCurrentPage(1);
                }}
              >
                {[10, 20, 30, 40, 50].map(
                  (number) => (
                    <option
                      key={number}
                      value={number}
                    >
                      {number}
                    </option>
                  )
                )}
              </select>

              <span>
                Entries
              </span>
            </div>

            <input
              type="text"
              className="department-search"
              placeholder="Search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* ==========================
              TABLE
          ========================== */}

          <div className="table-responsive">
            <table className="table department-table">
              <thead>
                <tr>
                  <th style={{ width: "55px" }}>
                    <input
                      type="checkbox"
                      className="department-checkbox"
                      checked={
                        allCurrentPageSelected
                      }
                      onChange={
                        handleSelectAll
                      }
                    />
                  </th>

                  <th
                    onClick={() =>
                      handleSort("name")
                    }
                    style={{
                      cursor: "pointer",
                    }}
                  >
                    Department
                    <SortIcon col="name" />
                  </th>

                  <th
                    onClick={() =>
                      handleSort(
                        "employees"
                      )
                    }
                    style={{
                      cursor: "pointer",
                    }}
                  >
                    Employees
                    <SortIcon col="employees" />
                  </th>

                  <th
                    onClick={() =>
                      handleSort("status")
                    }
                    style={{
                      cursor: "pointer",
                    }}
                  >
                    Status
                    <SortIcon col="status" />
                  </th>

                  <th
                    style={{
                      width: "100px",
                    }}
                  >
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginated.map((dept) => (
                  <tr key={dept.id}>
                    <td>
                      <input
                        type="checkbox"
                        className="department-checkbox"
                        checked={selected.includes(
                          dept.id
                        )}
                        onChange={() =>
                          toggleSelect(
                            dept.id
                          )
                        }
                      />
                    </td>

                    <td>
                      {dept.name}
                    </td>

                    <td>
                      {dept.employees}
                    </td>

                    {/* STATUS */}

                    <td>
                      <span
                        className={`department-status-badge ${
                          dept.status ===
                          "Active"
                            ? "department-status-active"
                            : "department-status-inactive"
                        }`}
                      >
                        <span className="department-status-dot" />

                        {dept.status}
                      </span>
                    </td>

                    {/* ACTION */}

                    <td>
                      <div className="department-actions">
                        {/* EDIT */}

                        <button
                          type="button"
                          className="department-action-btn"
                          title="Edit"
                          onClick={() =>
                            openEditModal(
                              dept
                            )
                          }
                        >
                          <i className="ti ti-edit" />
                        </button>

                        {/* DELETE */}

                        <button
                          type="button"
                          className="department-action-btn department-delete-btn"
                          title="Delete"
                          onClick={() =>
                            openDeleteModal(
                              dept.id
                            )
                          }
                        >
                          <i className="ti ti-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {paginated.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center"
                      style={{
                        height: "80px",
                      }}
                    >
                      No departments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ==========================
              FOOTER
          ========================== */}

          <div className="department-footer">
            <div>
              Showing{" "}
              {filtered.length === 0
                ? 0
                : (safeCurrentPage -
                    1) *
                    rowsPerPage +
                  1}
              {" - "}
              {Math.min(
                safeCurrentPage *
                  rowsPerPage,
                filtered.length
              )}{" "}
              of {filtered.length} entries
            </div>

            <div className="department-pagination">
              <button
                type="button"
                className="page-btn"
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
                <i className="ti ti-chevron-left" />
              </button>

              <button
                type="button"
                className="page-btn active"
              >
                {safeCurrentPage}
              </button>

              <button
                type="button"
                className="page-btn"
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
                <i className="ti ti-chevron-right" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================
          ADD DEPARTMENT MODAL
          Screenshot 1
      ==================================================== */}

      {addOpen && (
        <div className="department-modal-overlay">
          <div className="department-form-modal">
            <div className="department-modal-header">
              <h3>
                Add Department
              </h3>

              <button
                type="button"
                className="department-modal-close"
                onClick={
                  closeAddModal
                }
              >
                ×
              </button>
            </div>

            <form
              onSubmit={
                handleAddDepartment
              }
            >
              <div className="department-modal-body">
                <div className="department-form-group">
                  <label>
                    Department Name
                  </label>

                  <input
                    type="text"
                    value={
                      departmentName
                    }
                    onChange={(e) =>
                      setDepartmentName(
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="department-form-group">
                  <label>
                    Status
                  </label>

                  <select
                    value={
                      departmentStatus
                    }
                    onChange={(e) =>
                      setDepartmentStatus(
                        e.target
                          .value as
                          | "Active"
                          | "Inactive"
                          | ""
                      )
                    }
                  >
                    <option value="">
                      Select
                    </option>

                    <option value="Active">
                      Active
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>
                  </select>
                </div>
              </div>

              <div className="department-modal-footer">
                <button
                  type="button"
                  className="department-modal-cancel"
                  onClick={
                    closeAddModal
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="department-modal-save"
                >
                  Add Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================
          EDIT DEPARTMENT MODAL
          Screenshot 2
      ==================================================== */}

      {editOpen &&
        editingDepartment && (
          <div className="department-modal-overlay">
            <div className="department-form-modal">
              <div className="department-modal-header">
                <h3>
                  Edit Department
                </h3>

                <button
                  type="button"
                  className="department-modal-close"
                  onClick={
                    closeEditModal
                  }
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={
                  handleEditDepartment
                }
              >
                <div className="department-modal-body">
                  <div className="department-form-group">
                    <label>
                      Department Name
                    </label>

                    <input
                      type="text"
                      value={
                        departmentName
                      }
                      onChange={(e) =>
                        setDepartmentName(
                          e.target
                            .value
                        )
                      }
                    />
                  </div>

                  <div className="department-form-group">
                    <label>
                      Status
                    </label>

                    <select
                      value={
                        departmentStatus
                      }
                      onChange={(e) =>
                        setDepartmentStatus(
                          e.target
                            .value as
                            | "Active"
                            | "Inactive"
                        )
                      }
                    >
                      <option value="Active">
                        Active
                      </option>

                      <option value="Inactive">
                        Inactive
                      </option>
                    </select>
                  </div>
                </div>

                <div className="department-modal-footer">
                  <button
                    type="button"
                    className="department-modal-cancel"
                    onClick={
                      closeEditModal
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="department-modal-save"
                  >
                    Save Department
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      {/* ====================================================
          DELETE MODAL
          Screenshot 3
      ==================================================== */}

      {deleteOpen && (
        <div className="department-modal-overlay">
          <div className="department-delete-modal">
            <div className="delete-modal-icon">
              <i className="ti ti-trash-x" />
            </div>

            <h3>
              Confirm Delete
            </h3>

            <p>
              You want to delete all the
              marked items, this cant be
              undone once you delete.
            </p>

            <div className="delete-actions">
              <button
                type="button"
                className="delete-cancel-btn"
                onClick={
                  closeDeleteModal
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="delete-confirm-btn"
                onClick={
                  handleDeleteDepartment
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

export default Departments;
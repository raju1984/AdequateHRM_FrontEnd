// Designations.tsx

import React, { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";

interface Designation {
  id: number;
  designation: string;
  department: string;
  employees: number;
  status: "Active" | "Inactive";
}

type FormStatus = "" | "Active" | "Inactive";

const initialData: Designation[] = [
  {
    id: 1,
    designation: "Accountant",
    department: "Finance",
    employees: 10,
    status: "Active",
  },
  {
    id: 2,
    designation: "App Developer",
    department: "Application Development",
    employees: 15,
    status: "Active",
  },
  {
    id: 3,
    designation: "Technician",
    department: "IT Management",
    employees: 8,
    status: "Active",
  },
  {
    id: 4,
    designation: "Web Developer",
    department: "Web Development",
    employees: 10,
    status: "Active",
  },
  {
    id: 5,
    designation: "Sales Executive Officer",
    department: "Sales",
    employees: 10,
    status: "Active",
  },
  {
    id: 6,
    designation: "Designer",
    department: "UI / UX",
    employees: 15,
    status: "Active",
  },
  {
    id: 7,
    designation: "Account Manager",
    department: "Account Management",
    employees: 8,
    status: "Active",
  },
  {
    id: 8,
    designation: "SEO Analyst",
    department: "Marketing",
    employees: 10,
    status: "Inactive",
  },
  {
    id: 9,
    designation: "Admin",
    department: "Administration",
    employees: 5,
    status: "Active",
  },
  {
    id: 10,
    designation: "Business Analyst",
    department: "Business Development",
    employees: 7,
    status: "Active",
  },
];

const departments = [
  "Finance",
  "Application Development",
  "IT Management",
  "Web Development",
  "Sales",
  "UI / UX",
  "Account Management",
  "Marketing",
  "Administration",
  "Business Development",
];

const Designations = () => {
  const [data, setData] =
    useState<Designation[]>(initialData);

  const [selectedDepartment, setSelectedDepartment] =
    useState("Department");

  const [selectedStatus, setSelectedStatus] =
    useState("Select Status");

  const [sortBy, setSortBy] =
    useState("Last 7 Days");

  const [entries, setEntries] =
    useState(10);

  const [search, setSearch] =
    useState("");

  const [selected, setSelected] =
    useState<number[]>([]);

  // MODALS
  const [addOpen, setAddOpen] =
    useState(false);

  const [editOpen, setEditOpen] =
    useState(false);

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  // FORM
  const [designationName, setDesignationName] =
    useState("");

  const [departmentName, setDepartmentName] =
    useState("");

  const [formStatus, setFormStatus] =
    useState<FormStatus>("");

  const [editingItem, setEditingItem] =
    useState<Designation | null>(null);

  const [deleteId, setDeleteId] =
    useState<number | null>(null);

  // =============================
  // FILTER / SORT
  // =============================

  const filteredData = useMemo(() => {
    let result = [...data];

    if (
      selectedDepartment !== "Department" &&
      selectedDepartment !== "All"
    ) {
      result = result.filter(
        (item) =>
          item.department === selectedDepartment
      );
    }

    if (
      selectedStatus !== "Select Status"
    ) {
      result = result.filter(
        (item) =>
          item.status === selectedStatus
      );
    }

    if (search.trim()) {
      const query =
        search.trim().toLowerCase();

      result = result.filter(
        (item) =>
          item.designation
            .toLowerCase()
            .includes(query) ||
          item.department
            .toLowerCase()
            .includes(query)
      );
    }

    if (sortBy === "Ascending") {
      result.sort((a, b) =>
        a.designation.localeCompare(
          b.designation
        )
      );
    }

    if (sortBy === "Descending") {
      result.sort((a, b) =>
        b.designation.localeCompare(
          a.designation
        )
      );
    }

    return result.slice(0, entries);
  }, [
    data,
    selectedDepartment,
    selectedStatus,
    sortBy,
    entries,
    search,
  ]);

  // =============================
  // CHECKBOX
  // =============================

  const allSelected =
    filteredData.length > 0 &&
    filteredData.every((item) =>
      selected.includes(item.id)
    );

  const handleSelectAll = () => {
    const visibleIds =
      filteredData.map(
        (item) => item.id
      );

    if (allSelected) {
      setSelected((previous) =>
        previous.filter(
          (id) =>
            !visibleIds.includes(id)
        )
      );
    } else {
      setSelected((previous) => [
        ...new Set([
          ...previous,
          ...visibleIds,
        ]),
      ]);
    }
  };

  const toggleSelect = (
    id: number
  ) => {
    setSelected((previous) =>
      previous.includes(id)
        ? previous.filter(
            (item) => item !== id
          )
        : [...previous, id]
    );
  };

  // =============================
  // ADD
  // =============================

  const openAddModal = () => {
    setDesignationName("");
    setDepartmentName("");
    setFormStatus("");
    setAddOpen(true);
  };

  const closeAddModal = () => {
    setAddOpen(false);
    setDesignationName("");
    setDepartmentName("");
    setFormStatus("");
  };

  const handleAdd = (
    e: FormEvent
  ) => {
    e.preventDefault();

    if (
      !designationName.trim() ||
      !departmentName.trim() ||
      !formStatus
    ) {
      return;
    }

    const newDesignation: Designation = {
      id:
        data.length > 0
          ? Math.max(
              ...data.map(
                (item) => item.id
              )
            ) + 1
          : 1,

      designation:
        designationName.trim(),

      department:
        departmentName.trim(),

      employees: 0,

      status: formStatus,
    };

    setData((previous) => [
      ...previous,
      newDesignation,
    ]);

    closeAddModal();
  };

  // =============================
  // EDIT
  // =============================

  const openEditModal = (
    item: Designation
  ) => {
    setEditingItem(item);

    setDesignationName(
      item.designation
    );

    setDepartmentName(
      item.department
    );

    setFormStatus(
      item.status
    );

    setEditOpen(true);
  };

  const closeEditModal = () => {
    setEditOpen(false);
    setEditingItem(null);

    setDesignationName("");
    setDepartmentName("");
    setFormStatus("");
  };

  const handleEdit = (
    e: FormEvent
  ) => {
    e.preventDefault();

    if (
      !editingItem ||
      !designationName.trim() ||
      !departmentName.trim() ||
      !formStatus
    ) {
      return;
    }

    setData((previous) =>
      previous.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,

              designation:
                designationName.trim(),

              department:
                departmentName.trim(),

              status: formStatus,
            }
          : item
      )
    );

    closeEditModal();
  };

  // =============================
  // DELETE
  // =============================

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

    setData((previous) =>
      previous.filter(
        (item) =>
          item.id !== deleteId
      )
    );

    setSelected((previous) =>
      previous.filter(
        (id) =>
          id !== deleteId
      )
    );

    closeDeleteModal();
  };

  return (
    <>
      {/* =============================
          CSS - SAME FILE
      ============================= */}

      <style>
        {`
          .designation-page {
            width: 100%;
          }

          .designation-header {
            margin-bottom: 14px;
          }

          .designation-header h2 {
            margin: 0 0 5px;
            color: #17233e;
            font-size: 18px;
            font-weight: 600;
          }

          .designation-add-btn {
            height: 38px;
            padding: 0 14px;

            border: 0;
            border-radius: 5px;

            background: #bd9039;
            color: #fff;

            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 7px;

            font-size: 13px;
            font-weight: 500;

            cursor: pointer;
          }

          .designation-add-btn:hover {
            background: #ad8230;
            color: #fff;
          }

          .designation-card {
            overflow: hidden;

            border: 1px solid #e1e5eb;
            border-radius: 5px;

            background: #fff;
          }

          /* HEADER */

          .designation-card-header {
            min-height: 62px;
            padding: 14px 18px;

            border-bottom: 1px solid #e5e7eb;

            display: flex;
            align-items: center;
            justify-content: space-between;

            gap: 15px;
          }

          .designation-card-header h5 {
            margin: 0;

            color: #17233e;

            font-size: 14px;
            font-weight: 600;
          }

          .designation-filters {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .designation-filter {
            height: 34px;

            padding: 0 10px;

            border: 1px solid #dce1e7;
            border-radius: 5px;

            outline: none;

            background: #fff;
            color: #1d2a42;

            font-size: 12px;
          }

          .department-filter {
            width: 180px;
          }

          .status-filter {
            width: 140px;
          }

          .sort-filter {
            width: 190px;
          }

          /* TOOLBAR */

          .designation-toolbar {
            min-height: 55px;

            padding: 10px 16px;

            border-bottom: 1px solid #e5e7eb;

            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .designation-rows {
            display: flex;
            align-items: center;
            gap: 8px;

            color: #4d596b;

            font-size: 12px;
          }

          .designation-rows select {
            width: 60px;
            height: 30px;

            border: 1px solid #dce1e7;
            border-radius: 5px;

            padding: 0 7px;

            background: #fff;

            font-size: 12px;
          }

          .designation-search {
            width: 180px;
            height: 30px;

            padding: 0 10px;

            border: 1px solid #dce1e7;
            border-radius: 5px;

            outline: none;

            font-size: 12px;
          }

          /* TABLE */

          .designation-table {
            width: 100%;
            margin: 0;
          }

          .designation-table thead {
            background: #e5e7eb;
          }

          .designation-table th {
            height: 42px;

            padding: 0 14px !important;

            vertical-align: middle;

            color: #101d38;

            font-size: 12px;
            font-weight: 600;

            white-space: nowrap;
          }

          .designation-table td {
            height: 49px;

            padding: 0 14px !important;

            vertical-align: middle;

            color: #13213a;

            font-size: 12px;

            white-space: nowrap;
          }

          .designation-table tbody tr {
            border-bottom: 1px solid #e7e9ed;
          }

          .designation-checkbox {
            width: 15px;
            height: 15px;

            cursor: pointer;
          }

          .designation-name {
            font-weight: 500;
            color: #17233e;
          }

          /* =============================
             STATUS BADGE
          ============================= */

          .designation-status {
            min-width: 53px;
            height: 18px;

            padding: 0 6px;

            border-radius: 4px;

            display: inline-flex;
            align-items: center;
            justify-content: center;

            gap: 4px;

            color: #fff;

            font-size: 10px;
            font-weight: 600;

            line-height: 1;
          }

          .designation-status-active {
            background: #00bd61;
          }

          .designation-status-inactive {
            background: #ef0707;
          }

          .designation-dot {
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

            background: #ffffff !important;
          }

          /* ACTION */

          .designation-actions {
            display: inline-flex;
            align-items: center;
            gap: 8px;
          }

          .designation-action-btn {
            width: 27px;
            height: 27px;

            padding: 0;

            border: 0;

            background: transparent;

            display: inline-flex;
            align-items: center;
            justify-content: center;

            color: #536174;

            font-size: 16px;

            cursor: pointer;
          }

          .designation-action-btn:hover {
            color: #111827;
          }

          .designation-delete-btn,
          .designation-delete-btn i {
            color: #000 !important;
          }

          /* ==================================
             MODAL OVERLAY
          ================================== */

          .designation-modal-overlay {
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

          .designation-form-modal {
            width: 500px;
            max-width: 100%;

            overflow: hidden;

            border-radius: 5px;

            background: #fff;

            box-shadow: 0 10px 35px rgba(0,0,0,.18);
          }

          .designation-modal-header {
            height: 64px;

            padding: 0 17px;

            border-bottom: 1px solid #e3e7eb;

            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .designation-modal-header h3 {
            margin: 0;

            color: #1e2b49;

            font-size: 20px;
            font-weight: 600;
          }

          .designation-modal-close {
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

            cursor: pointer;
          }

          .designation-modal-body {
            padding: 17px;
          }

          .designation-form-group {
            margin-bottom: 17px;
          }

          .designation-form-group:last-child {
            margin-bottom: 0;
          }

          .designation-form-group label {
            display: block;

            margin-bottom: 8px;

            color: #263452;

            font-size: 13px;
            font-weight: 500;
          }

          .designation-form-group input,
          .designation-form-group select {
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

          .designation-form-group input:focus,
          .designation-form-group select:focus {
            border-color: #bd9039;
          }

          .designation-modal-footer {
            min-height: 64px;

            padding: 10px 12px;

            border-top: 1px solid #e4e7eb;

            display: flex;
            align-items: center;
            justify-content: flex-end;

            gap: 8px;
          }

          .designation-modal-cancel {
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

          .designation-modal-save {
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

          /* ==================================
             DELETE MODAL
          ================================== */

          .designation-delete-modal {
            width: 400px;
            max-width: 100%;

            padding: 16px 30px 17px;

            border-radius: 5px;

            background: #fff;

            text-align: center;

            box-shadow: 0 10px 35px rgba(0,0,0,.18);
          }

          .designation-delete-icon {
            width: 58px;
            height: 58px;

            margin: 0 auto 14px;

            border-radius: 4px;

            background: #f6cccc;
            color: #f10f18;

            display: flex;
            align-items: center;
            justify-content: center;

            font-size: 30px;
          }

          .designation-delete-icon i {
            color: #f10f18;
            font-size: 30px;
          }

          .designation-delete-modal h3 {
            margin: 0 0 6px;

            color: #1d2b48;

            font-size: 19px;
            font-weight: 600;
          }

          .designation-delete-modal p {
            max-width: 330px;

            margin: 0 auto 17px;

            color: #3e4654;

            font-size: 13px;
            line-height: 1.5;
          }

          .designation-delete-actions {
            display: flex;
            align-items: center;
            justify-content: center;

            gap: 16px;
          }

          .designation-delete-cancel {
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

          .designation-delete-confirm {
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

          @media (max-width: 768px) {
            .designation-card-header {
              align-items: flex-start;
              flex-direction: column;
            }

            .designation-filters {
              width: 100%;
              flex-direction: column;
            }

            .department-filter,
            .status-filter,
            .sort-filter {
              width: 100%;
            }

            .designation-toolbar {
              align-items: flex-start;
              flex-direction: column;
              gap: 10px;
            }

            .designation-search {
              width: 100%;
            }
          }
        `}
      </style>

      <div className="designation-page">
        {/* =============================
            HEADER
        ============================= */}

        <div className="d-md-flex d-block align-items-center justify-content-between designation-header">
          <div>
            <h2>
              Designations
            </h2>

            <nav>
              <ol
                className="breadcrumb mb-0"
                style={{
                  fontSize: "12px",
                }}
              >
                <li className="breadcrumb-item">
                  <Link to="/admin/dashboard">
                    <i className="ti ti-smart-home" />
                  </Link>
                </li>

                <li className="breadcrumb-item active">
                  Designations
                </li>
              </ol>
            </nav>
          </div>

          <button
            type="button"
            className="designation-add-btn"
            onClick={openAddModal}
          >
            <i className="ti ti-circle-plus" />

            Add Designation
          </button>
        </div>

        {/* =============================
            CARD
        ============================= */}

        <div className="designation-card">
          <div className="designation-card-header">
            <h5>
              Designation List
            </h5>

            <div className="designation-filters">
              {/* DEPARTMENT */}

              <select
                className="designation-filter department-filter"
                value={selectedDepartment}
                onChange={(e) =>
                  setSelectedDepartment(
                    e.target.value
                  )
                }
              >
                <option>
                  Department
                </option>

                <option>
                  All
                </option>

                {departments.map(
                  (department) => (
                    <option
                      key={department}
                      value={department}
                    >
                      {department}
                    </option>
                  )
                )}
              </select>

              {/* STATUS */}

              <select
                className="designation-filter status-filter"
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(
                    e.target.value
                  )
                }
              >
                <option>
                  Select Status
                </option>

                <option>
                  Active
                </option>

                <option>
                  Inactive
                </option>
              </select>

              {/* SORT */}

              <select
                className="designation-filter sort-filter"
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value
                  )
                }
              >
                <option value="Last 7 Days">
                  Sort By : Last 7 Days
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

                <option value="Last Year">
                  Last Year
                </option>
              </select>
            </div>
          </div>

          {/* =============================
              ROW CONTROL
          ============================= */}

          <div className="designation-toolbar">
            <div className="designation-rows">
              <span>
                Row per page
              </span>

              <select
                value={entries}
                onChange={(e) =>
                  setEntries(
                    Number(
                      e.target.value
                    )
                  )
                }
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
                entries
              </span>
            </div>

            <input
              type="text"
              className="designation-search"
              placeholder="Search"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />
          </div>

          {/* =============================
              TABLE
          ============================= */}

          <div className="table-responsive">
            <table className="table designation-table">
              <thead>
                <tr>
                  <th
                    style={{
                      width: "55px",
                    }}
                  >
                    <input
                      type="checkbox"
                      className="designation-checkbox"
                      checked={allSelected}
                      onChange={
                        handleSelectAll
                      }
                    />
                  </th>

                  <th>
                    Designation
                  </th>

                  <th>
                    Department
                  </th>

                  <th>
                    No of Employees
                  </th>

                  <th>
                    Status
                  </th>

                  <th
                    style={{
                      width: "100px",
                    }}
                  />
                </tr>
              </thead>

              <tbody>
                {filteredData.map(
                  (item) => (
                    <tr key={item.id}>
                      <td>
                        <input
                          type="checkbox"
                          className="designation-checkbox"
                          checked={selected.includes(
                            item.id
                          )}
                          onChange={() =>
                            toggleSelect(
                              item.id
                            )
                          }
                        />
                      </td>

                      <td className="designation-name">
                        {item.designation}
                      </td>

                      <td>
                        {item.department}
                      </td>

                      <td>
                        {item.employees}
                      </td>

                      {/* STATUS */}

                      <td>
                        <span
                          className={`designation-status ${
                            item.status ===
                            "Active"
                              ? "designation-status-active"
                              : "designation-status-inactive"
                          }`}
                        >
                          <span className="designation-dot" />

                          {item.status}
                        </span>
                      </td>

                      {/* ACTION */}

                      <td>
                        <div className="designation-actions">
                          {/* EDIT */}

                          <button
                            type="button"
                            className="designation-action-btn"
                            title="Edit"
                            onClick={() =>
                              openEditModal(
                                item
                              )
                            }
                          >
                            <i className="ti ti-edit" />
                          </button>

                          {/* DELETE */}

                          <button
                            type="button"
                            className="designation-action-btn designation-delete-btn"
                            title="Delete"
                            onClick={() =>
                              openDeleteModal(
                                item.id
                              )
                            }
                          >
                            <i className="ti ti-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}

                {filteredData.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center"
                      style={{
                        height: "80px",
                      }}
                    >
                      No designations found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ==================================================
          ADD DESIGNATION MODAL
      ================================================== */}

      {addOpen && (
        <div className="designation-modal-overlay">
          <div className="designation-form-modal">
            <div className="designation-modal-header">
              <h3>
                Add Designation
              </h3>

              <button
                type="button"
                className="designation-modal-close"
                onClick={
                  closeAddModal
                }
              >
                ×
              </button>
            </div>

            <form
              onSubmit={
                handleAdd
              }
            >
              <div className="designation-modal-body">
                {/* DESIGNATION NAME */}

                <div className="designation-form-group">
                  <label>
                    Designation Name
                  </label>

                  <input
                    type="text"
                    value={
                      designationName
                    }
                    onChange={(e) =>
                      setDesignationName(
                        e.target.value
                      )
                    }
                  />
                </div>

                {/* DEPARTMENT */}

                <div className="designation-form-group">
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

                {/* STATUS */}

                <div className="designation-form-group">
                  <label>
                    Status
                  </label>

                  <select
                    value={
                      formStatus
                    }
                    onChange={(e) =>
                      setFormStatus(
                        e.target
                          .value as FormStatus
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

              <div className="designation-modal-footer">
                <button
                  type="button"
                  className="designation-modal-cancel"
                  onClick={
                    closeAddModal
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="designation-modal-save"
                >
                  Add Designation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================
          EDIT DESIGNATION MODAL
      ================================================== */}

      {editOpen &&
        editingItem && (
          <div className="designation-modal-overlay">
            <div className="designation-form-modal">
              <div className="designation-modal-header">
                <h3>
                  Edit Designation
                </h3>

                <button
                  type="button"
                  className="designation-modal-close"
                  onClick={
                    closeEditModal
                  }
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={
                  handleEdit
                }
              >
                <div className="designation-modal-body">
                  {/* DESIGNATION */}

                  <div className="designation-form-group">
                    <label>
                      Designation Name
                    </label>

                    <input
                      type="text"
                      value={
                        designationName
                      }
                      onChange={(e) =>
                        setDesignationName(
                          e.target
                            .value
                        )
                      }
                    />
                  </div>

                  {/* DEPARTMENT */}

                  <div className="designation-form-group">
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

                  {/* STATUS */}

                  <div className="designation-form-group">
                    <label>
                      Status
                    </label>

                    <select
                      value={
                        formStatus
                      }
                      onChange={(e) =>
                        setFormStatus(
                          e.target
                            .value as FormStatus
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

                <div className="designation-modal-footer">
                  <button
                    type="button"
                    className="designation-modal-cancel"
                    onClick={
                      closeEditModal
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="designation-modal-save"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      {/* ==================================================
          DELETE CONFIRMATION MODAL
      ================================================== */}

      {deleteOpen && (
        <div className="designation-modal-overlay">
          <div className="designation-delete-modal">
            <div className="designation-delete-icon">
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

            <div className="designation-delete-actions">
              <button
                type="button"
                className="designation-delete-cancel"
                onClick={
                  closeDeleteModal
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="designation-delete-confirm"
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

export default Designations;
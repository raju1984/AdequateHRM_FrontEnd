import React, { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Pencil,
  Trash2,
  CirclePlus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type LeaveStatus = "Active" | "Inactive";

interface LeaveTypeItem {
  id: number;
  type: string;
  days: number;
  status: LeaveStatus;
}

const initialLeaveTypes: LeaveTypeItem[] = [
  {
    id: 1,
    type: "Annual Leave",
    days: 12,
    status: "Active",
  },
  {
    id: 2,
    type: "Medical Leave",
    days: 12,
    status: "Active",
  },
  {
    id: 3,
    type: "Casual Leave",
    days: 12,
    status: "Active",
  },
  {
    id: 4,
    type: "Other Leave",
    days: 12,
    status: "Active",
  },
];

const LeaveType = () => {
  const [leaveTypes, setLeaveTypes] =
    useState<LeaveTypeItem[]>(initialLeaveTypes);

  const [selected, setSelected] =
    useState<number[]>([]);

  const [search, setSearch] =
    useState("");

  const [rowsPerPage, setRowsPerPage] =
    useState(10);

  const [currentPage, setCurrentPage] =
    useState(1);

  /* MODALS */

  const [addOpen, setAddOpen] =
    useState(false);

  const [editOpen, setEditOpen] =
    useState(false);

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  const [editingItem, setEditingItem] =
    useState<LeaveTypeItem | null>(null);

  const [deleteId, setDeleteId] =
    useState<number | null>(null);

  /* FORM */

  const [leaveTypeName, setLeaveTypeName] =
    useState("");

  const [numberOfDays, setNumberOfDays] =
    useState("");

  /* FILTER */

  const filteredData = useMemo(() => {
    if (!search.trim()) {
      return leaveTypes;
    }

    const query =
      search.trim().toLowerCase();

    return leaveTypes.filter(
      (item) =>
        item.type
          .toLowerCase()
          .includes(query) ||
        item.status
          .toLowerCase()
          .includes(query) ||
        item.days
          .toString()
          .includes(query)
    );
  }, [leaveTypes, search]);

  /* PAGINATION */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredData.length /
        rowsPerPage
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const visibleData = filteredData.slice(
    (safeCurrentPage - 1) *
      rowsPerPage,
    safeCurrentPage * rowsPerPage
  );

  /* SELECT */

  const allVisibleSelected =
    visibleData.length > 0 &&
    visibleData.every((item) =>
      selected.includes(item.id)
    );

  const handleSelectAll = () => {
    const visibleIds =
      visibleData.map(
        (item) => item.id
      );

    if (allVisibleSelected) {
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

  const handleSelect = (
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

  /* =============================
     ADD
  ============================= */

  const openAddModal = () => {
    setLeaveTypeName("");
    setNumberOfDays("");
    setAddOpen(true);
  };

  const closeAddModal = () => {
    setAddOpen(false);

    setLeaveTypeName("");
    setNumberOfDays("");
  };

  const handleAddLeaveType = (
    e: FormEvent
  ) => {
    e.preventDefault();

    if (
      !leaveTypeName.trim() ||
      !numberOfDays.trim()
    ) {
      return;
    }

    const newLeaveType: LeaveTypeItem = {
      id:
        leaveTypes.length > 0
          ? Math.max(
              ...leaveTypes.map(
                (item) => item.id
              )
            ) + 1
          : 1,

      type:
        leaveTypeName.trim(),

      days:
        Number(numberOfDays),

      status: "Active",
    };

    setLeaveTypes((previous) => [
      ...previous,
      newLeaveType,
    ]);

    closeAddModal();
  };

  /* =============================
     EDIT
  ============================= */

  const openEditModal = (
    item: LeaveTypeItem
  ) => {
    setEditingItem(item);

    setLeaveTypeName(
      item.type
    );

    setNumberOfDays(
      item.days.toString()
    );

    setEditOpen(true);
  };

  const closeEditModal = () => {
    setEditOpen(false);

    setEditingItem(null);

    setLeaveTypeName("");
    setNumberOfDays("");
  };

  const handleEditLeaveType = (
    e: FormEvent
  ) => {
    e.preventDefault();

    if (
      !editingItem ||
      !leaveTypeName.trim() ||
      !numberOfDays.trim()
    ) {
      return;
    }

    setLeaveTypes((previous) =>
      previous.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              type:
                leaveTypeName.trim(),
              days:
                Number(numberOfDays),
            }
          : item
      )
    );

    closeEditModal();
  };

  /* =============================
     DELETE
  ============================= */

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
    if (deleteId === null) {
      return;
    }

    setLeaveTypes((previous) =>
      previous.filter(
        (item) =>
          item.id !== deleteId
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
      {/* =====================================
          SINGLE FILE CSS
      ===================================== */}

      <style>
        {`
        .leave-type-page {
          width: 100%;
          min-height: 100vh;

          padding:
            23px 18px 25px;

          background: #f8f9fb;

          color: #10203f;

          font-family:
            "Inter",
            "Segoe UI",
            sans-serif;
        }

        /* =========================
           HEADER
        ========================= */

        .leave-type-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;

          margin-bottom: 25px;
        }

        .leave-type-header h1 {
          margin: 0 0 5px;

          color: #10203f;

          font-size: 24px;
          font-weight: 700;
        }

        .leave-type-breadcrumb {
          display: flex;
          align-items: center;

          gap: 9px;

          color: #667386;

          font-size: 12px;
        }

        .leave-type-breadcrumb a {
          display: inline-flex;
          align-items: center;

          color: #315c75;

          text-decoration: none;
        }

        .leave-type-add-btn {
          height: 40px;

          padding:
            0 15px;

          border: 0;
          border-radius: 5px;

          background: #c39137;
          color: #fff;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 7px;

          font-size: 14px;
          font-weight: 600;

          cursor: pointer;
        }

        .leave-type-add-btn:hover {
          background:
            #b5822e;
        }

        /* =========================
           CARD
        ========================= */

        .leave-type-card {
          width: 100%;

          overflow: hidden;

          border:
            1px solid #dde2e8;

          border-radius: 5px;

          background: #fff;

          box-shadow:
            0 1px 2px
            rgba(0,0,0,.03);
        }

        .leave-type-card-title {
          height: 52px;

          padding:
            0 20px;

          border-bottom:
            1px solid #dde2e8;

          display: flex;
          align-items: center;
        }

        .leave-type-card-title h5 {
          margin: 0;

          color: #10203f;

          font-size: 15px;
          font-weight: 600;
        }

        /* =========================
           TOOLBAR
        ========================= */

        .leave-type-toolbar {
          min-height: 61px;

          padding:
            10px 16px;

          border-bottom:
            1px solid #e2e5e9;

          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .leave-type-row-control {
          display: flex;
          align-items: center;

          gap: 9px;

          color: #26354d;

          font-size: 13px;
        }

        .leave-type-row-select {
          width: 49px;
          height: 29px;

          padding:
            0 5px;

          border:
            1px solid #dce1e7;

          border-radius: 6px;

          outline: none;

          background: #fff;

          color: #465368;

          font-size: 12px;
        }

        .leave-type-search {
          width: 160px;
          height: 30px;

          padding:
            0 14px;

          border:
            1px solid #dce1e7;

          border-radius: 5px;

          outline: none;

          background: #fff;

          font-size: 12px;
        }

        .leave-type-search::placeholder {
          color: #8994a6;
        }

        /* =========================
           TABLE
        ========================= */

        .leave-type-table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .leave-type-table {
          width: 100%;
          min-width: 700px;

          border-collapse:
            collapse;

          margin: 0;
        }

        .leave-type-table thead {
          background: #e1e4e9;
        }

        .leave-type-table th {
          height: 43px;

          padding:
            0 20px;

          vertical-align: middle;

          color: #06142e;

          font-size: 13px;
          font-weight: 600;

          white-space: nowrap;
        }

        .leave-type-table td {
          height: 47px;

          padding:
            0 20px;

          vertical-align: middle;

          border-bottom:
            1px solid #dfe3e8;

          background: #fff;

          color: #536174;

          font-size: 13px;

          white-space: nowrap;
        }

        .leave-type-table tbody tr:last-child td {
          border-bottom: none;
        }

        .leave-type-check-column {
          width: 70px;
          text-align: center;
        }

        .leave-type-checkbox {
          width: 18px;
          height: 18px;

          margin: 0;

          cursor: pointer;
        }

        .leave-type-name {
          color: #0b1933 !important;

          font-weight: 500;
        }

        .leave-type-sort {
          float: right;

          color: #cbd1d9;

          font-size: 11px;
        }

        /* =========================
           STATUS
        ========================= */

        .leave-type-status {
          height: 20px;
          min-width: 59px;

          padding:
            0 8px;

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

        .leave-type-status-active {
          background: #00bd61;
        }

        .leave-type-status-inactive {
          background: #ef0707;
        }

        .leave-type-status-dot {
          width: 4px !important;
          height: 4px !important;

          min-width: 4px !important;
          min-height: 4px !important;

          flex:
            0 0 4px !important;

          padding: 0 !important;
          margin: 0 !important;

          border: 0 !important;
          border-radius:
            50% !important;

          background:
            #fff !important;
        }

        /* =========================
           ACTION
        ========================= */

        .leave-type-actions {
          display:
            inline-flex;

          align-items: center;

          gap: 12px;
        }

        .leave-type-action-btn {
          width: 23px;
          height: 25px;

          padding: 0;

          border: 0;

          background:
            transparent;

          color: #657286;

          display:
            inline-flex;

          align-items: center;
          justify-content: center;

          cursor: pointer;
        }

        .leave-type-action-btn:hover {
          color: #17233f;
        }

        /* =========================
           FOOTER
        ========================= */

        .leave-type-footer {
          height: 57px;

          padding:
            0 16px;

          border-top:
            1px solid #dfe3e8;

          display: flex;
          align-items: center;
          justify-content:
            space-between;

          color: #596679;

          font-size: 13px;
        }

        .leave-type-pagination {
          display: flex;
          align-items: center;

          gap: 16px;
        }

        .leave-type-page-arrow {
          width: 22px;
          height: 28px;

          padding: 0;

          border: 0;

          background:
            transparent;

          color: #a2a9b4;

          display:
            inline-flex;

          align-items: center;
          justify-content: center;

          cursor: pointer;
        }

        .leave-type-page-arrow:disabled {
          opacity: .4;
          cursor: default;
        }

        .leave-type-current-page {
          width: 27px;
          height: 27px;

          border-radius: 50%;

          background: #c39137;
          color: #fff;

          display:
            inline-flex;

          align-items: center;
          justify-content: center;

          font-size: 12px;
        }

        /* =================================
           MODAL OVERLAY
        ================================= */

        .leave-type-modal-overlay {
          position: fixed;

          inset: 0;

          z-index: 99999;

          padding: 16px;

          display: flex;
          align-items: center;
          justify-content: center;

          background:
            rgba(0,0,0,.42);
        }

        /* =================================
           ADD / EDIT MODAL
        ================================= */

        .leave-type-form-modal {
          width: 500px;

          max-width:
            calc(100vw - 30px);

          overflow: hidden;

          border-radius: 5px;

          background: #fff;

          box-shadow:
            0 15px 45px
            rgba(0,0,0,.2);
        }

        .leave-type-modal-header {
          min-height: 64px;

          padding:
            0 16px;

          border-bottom:
            1px solid #e2e6eb;

          display: flex;
          align-items: center;
          justify-content:
            space-between;
        }

        .leave-type-modal-header h3 {
          margin: 0;

          color: #1e2b49;

          font-size: 20px;
          font-weight: 600;
        }

        .leave-type-modal-close {
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
          line-height: 1;

          cursor: pointer;
        }

        .leave-type-modal-body {
          padding:
            17px 16px 12px;
        }

        .leave-type-form-group {
          margin-bottom: 17px;
        }

        .leave-type-form-group:last-child {
          margin-bottom: 0;
        }

        .leave-type-form-group label {
          display: block;

          margin-bottom: 8px;

          color: #263452;

          font-size: 13px;
          font-weight: 500;
        }

        .leave-type-required {
          margin-left: 3px;

          color: #ef1d26;
        }

        .leave-type-form-group input {
          width: 100%;
          height: 38px;

          padding:
            0 10px;

          border:
            1px solid #dce1e7;

          border-radius: 5px;

          outline: none;

          background: #fff;

          color: #26344d;

          font-size: 13px;
        }

        .leave-type-form-group input:focus {
          border-color:
            #c39137;
        }

        .leave-type-modal-footer {
          min-height: 64px;

          padding:
            10px 13px;

          border-top:
            1px solid #e4e7eb;

          display: flex;
          align-items: center;
          justify-content:
            flex-end;

          gap: 8px;
        }

        .leave-type-modal-cancel,
        .leave-type-modal-save {
          height: 39px;

          padding:
            0 15px;

          border: 0;
          border-radius: 5px;

          font-size: 13px;

          cursor: pointer;
        }

        .leave-type-modal-cancel {
          background: #f7f8f9;

          color: #172033;
        }

        .leave-type-modal-save {
          background: #c39137;

          color: #fff;

          font-weight: 600;
        }

        .leave-type-modal-save:hover {
          background: #b5822e;
        }

        /* =================================
           DELETE MODAL
        ================================= */

        .leave-type-delete-modal {
          width: 400px;

          max-width:
            calc(100vw - 30px);

          padding:
            17px 30px;

          border-radius: 5px;

          background: #fff;

          text-align: center;

          box-shadow:
            0 15px 45px
            rgba(0,0,0,.2);
        }

        .leave-type-delete-icon {
          width: 58px;
          height: 58px;

          margin:
            0 auto 14px;

          border-radius: 4px;

          background: #f6cccc;

          color: #f10f18;

          display: flex;
          align-items: center;
          justify-content: center;
        }

        .leave-type-delete-modal h3 {
          margin: 0 0 6px;

          color: #1d2b48;

          font-size: 19px;
          font-weight: 600;
        }

        .leave-type-delete-modal p {
          max-width: 330px;

          margin:
            0 auto 17px;

          color: #3e4654;

          font-size: 13px;

          line-height: 1.5;
        }

        .leave-type-delete-actions {
          display: flex;

          align-items: center;
          justify-content: center;

          gap: 16px;
        }

        .leave-type-delete-cancel,
        .leave-type-delete-confirm {
          height: 39px;

          padding:
            0 16px;

          border: 0;
          border-radius: 5px;

          font-size: 13px;

          cursor: pointer;
        }

        .leave-type-delete-cancel {
          background: #f6f7f8;

          color: #172033;
        }

        .leave-type-delete-confirm {
          background: #f10d16;

          color: #fff;

          font-weight: 600;
        }

        @media(max-width:768px) {
          .leave-type-page {
            padding:
              18px 12px;
          }

          .leave-type-toolbar {
            flex-direction:
              column;

            align-items:
              stretch;

            gap: 10px;
          }

          .leave-type-search {
            width: 100%;
          }
        }
      `}
      </style>

      <div className="leave-type-page">
        {/* =============================
            HEADER
        ============================= */}

        <div className="leave-type-header">
          <div>
            <h1>
              Leave Type
            </h1>

            <div className="leave-type-breadcrumb">
              <Link to="/Admin/Dashboard">
                <i className="ti ti-home" />
              </Link>

              <span>/</span>

              <span>
                Leave Type
              </span>
            </div>
          </div>

          <button
            type="button"
            className="leave-type-add-btn"
            onClick={
              openAddModal
            }
          >
            <CirclePlus
              size={15}
            />

            Add Leave Type
          </button>
        </div>

        {/* =============================
            CARD
        ============================= */}

        <div className="leave-type-card">
          {/* TITLE */}

          <div className="leave-type-card-title">
            <h5>
              Leave Type
            </h5>
          </div>

          {/* =============================
              TOOLBAR
          ============================= */}

          <div className="leave-type-toolbar">
            <div className="leave-type-row-control">
              <span>
                Row Per Page
              </span>

              <select
                className="leave-type-row-select"
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
              className="leave-type-search"
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

          {/* =============================
              TABLE
          ============================= */}

          <div className="leave-type-table-wrapper">
            <table className="leave-type-table">
              <thead>
                <tr>
                  <th className="leave-type-check-column">
                    <input
                      type="checkbox"
                      className="leave-type-checkbox"
                      checked={
                        allVisibleSelected
                      }
                      onChange={
                        handleSelectAll
                      }
                    />
                  </th>

                  <th>
                    Leave Type

                    <span className="leave-type-sort">
                      ↑↓
                    </span>
                  </th>

                  <th>
                    Leave Days

                    <span className="leave-type-sort">
                      ↑↓
                    </span>
                  </th>

                  <th>
                    Status

                    <span className="leave-type-sort">
                      ↑↓
                    </span>
                  </th>

                  <th>
                    <span className="leave-type-sort">
                      ↑↓
                    </span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {visibleData.map(
                  (item) => (
                    <tr
                      key={
                        item.id
                      }
                    >
                      <td className="leave-type-check-column">
                        <input
                          type="checkbox"
                          className="leave-type-checkbox"
                          checked={selected.includes(
                            item.id
                          )}
                          onChange={() =>
                            handleSelect(
                              item.id
                            )
                          }
                        />
                      </td>

                      {/* LEAVE TYPE */}

                      <td className="leave-type-name">
                        {item.type}
                      </td>

                      {/* DAYS */}

                      <td>
                        {item.days}
                      </td>

                      {/* STATUS */}

                      <td>
                        <span
                          className={`leave-type-status ${
                            item.status ===
                            "Active"
                              ? "leave-type-status-active"
                              : "leave-type-status-inactive"
                          }`}
                        >
                          <span className="leave-type-status-dot" />

                          {
                            item.status
                          }
                        </span>
                      </td>

                      {/* ACTION */}

                      <td>
                        <div className="leave-type-actions">
                          {/* EDIT */}

                          <button
                            type="button"
                            className="leave-type-action-btn"
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

                          {/* DELETE */}

                          <button
                            type="button"
                            className="leave-type-action-btn"
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

                {visibleData.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        textAlign:
                          "center",

                        height:
                          "80px",
                      }}
                    >
                      No leave types
                      found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* =============================
              FOOTER
          ============================= */}

          <div className="leave-type-footer">
            <div>
              Showing{" "}
              {filteredData.length ===
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

                filteredData.length
              )}{" "}
              of{" "}
              {
                filteredData.length
              }{" "}
              entries
            </div>

            <div className="leave-type-pagination">
              <button
                type="button"
                className="leave-type-page-arrow"
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

              <span className="leave-type-current-page">
                {
                  safeCurrentPage
                }
              </span>

              <button
                type="button"
                className="leave-type-page-arrow"
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

      {/* ==================================================
          ADD LEAVE TYPE MODAL
          SCREENSHOT 2
      ================================================== */}

      {addOpen && (
        <div className="leave-type-modal-overlay">
          <div className="leave-type-form-modal">
            <div className="leave-type-modal-header">
              <h3>
                Add Leave Type
              </h3>

              <button
                type="button"
                className="leave-type-modal-close"
                onClick={
                  closeAddModal
                }
              >
                ×
              </button>
            </div>

            <form
              onSubmit={
                handleAddLeaveType
              }
            >
              <div className="leave-type-modal-body">
                {/* LEAVE TYPE */}

                <div className="leave-type-form-group">
                  <label>
                    Leave Type

                    <span className="leave-type-required">
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    value={
                      leaveTypeName
                    }
                    onChange={(e) =>
                      setLeaveTypeName(
                        e.target.value
                      )
                    }
                    required
                  />
                </div>

                {/* DAYS */}

                <div className="leave-type-form-group">
                  <label>
                    Number of days

                    <span className="leave-type-required">
                      *
                    </span>
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={
                      numberOfDays
                    }
                    onChange={(e) =>
                      setNumberOfDays(
                        e.target.value
                      )
                    }
                    required
                  />
                </div>
              </div>

              <div className="leave-type-modal-footer">
                <button
                  type="button"
                  className="leave-type-modal-cancel"
                  onClick={
                    closeAddModal
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="leave-type-modal-save"
                >
                  Add Leave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================
          EDIT LEAVE TYPE MODAL
          SCREENSHOT 3
      ================================================== */}

      {editOpen &&
        editingItem && (
          <div className="leave-type-modal-overlay">
            <div className="leave-type-form-modal">
              <div className="leave-type-modal-header">
                <h3>
                  Edit Leave Type
                </h3>

                <button
                  type="button"
                  className="leave-type-modal-close"
                  onClick={
                    closeEditModal
                  }
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={
                  handleEditLeaveType
                }
              >
                <div className="leave-type-modal-body">
                  {/* LEAVE TYPE */}

                  <div className="leave-type-form-group">
                    <label>
                      Leave Type

                      <span className="leave-type-required">
                        *
                      </span>
                    </label>

                    <input
                      type="text"
                      value={
                        leaveTypeName
                      }
                      onChange={(e) =>
                        setLeaveTypeName(
                          e.target
                            .value
                        )
                      }
                      required
                    />
                  </div>

                  {/* DAYS */}

                  <div className="leave-type-form-group">
                    <label>
                      Number of days

                      <span className="leave-type-required">
                        *
                      </span>
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={
                        numberOfDays
                      }
                      onChange={(e) =>
                        setNumberOfDays(
                          e.target
                            .value
                        )
                      }
                      required
                    />
                  </div>
                </div>

                <div className="leave-type-modal-footer">
                  <button
                    type="button"
                    className="leave-type-modal-cancel"
                    onClick={
                      closeEditModal
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="leave-type-modal-save"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      {/* ==================================================
          DELETE MODAL
          SCREENSHOT 4
      ================================================== */}

      {deleteOpen && (
        <div className="leave-type-modal-overlay">
          <div className="leave-type-delete-modal">
            <div className="leave-type-delete-icon">
              <Trash2
                size={31}
                strokeWidth={2.2}
              />
            </div>

            <h3>
              Confirm Delete
            </h3>

            <p>
              You want to delete all the
              marked items, this cant be
              undone once you delete.
            </p>

            <div className="leave-type-delete-actions">
              <button
                type="button"
                className="leave-type-delete-cancel"
                onClick={
                  closeDeleteModal
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="leave-type-delete-confirm"
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

export default LeaveType;
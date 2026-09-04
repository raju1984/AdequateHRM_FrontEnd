import React, {
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  CirclePlus,
  ChevronLeft,
  ChevronRight,
  Shield,
  Pencil,
  Trash2,
} from "lucide-react";

type RoleStatus =
  | "Active"
  | "Inactive";

interface Role {
  id: number;
  name: string;
  createdDate: string;
  status: RoleStatus;
}

interface RoleForm {
  name: string;
  status: RoleStatus | "";
}

const initialRoles: Role[] = [
  {
    id: 1,
    name: "Admin",
    createdDate: "12 Sep 2024",
    status: "Active",
  },
  {
    id: 2,
    name: "HR Manager",
    createdDate: "24 Oct 2024",
    status: "Active",
  },
  {
    id: 3,
    name: "Recruitment Manager",
    createdDate: "18 Feb 2024",
    status: "Active",
  },
  {
    id: 4,
    name: "Payroll Manager",
    createdDate: "17 Oct 2024",
    status: "Active",
  },
  {
    id: 5,
    name: "Leave Manager",
    createdDate: "20 Jul 2024",
    status: "Active",
  },
  {
    id: 6,
    name: "Performance Manager",
    createdDate: "10 Apr 2024",
    status: "Active",
  },
  {
    id: 7,
    name: "Reports Analyst",
    createdDate: "29 Aug 2024",
    status: "Active",
  },
  {
    id: 8,
    name: "Employee",
    createdDate: "22 Feb 2024",
    status: "Inactive",
  },
  {
    id: 9,
    name: "Client",
    createdDate: "03 Nov 2024",
    status: "Active",
  },
  {
    id: 10,
    name: "Department Head",
    createdDate: "17 Dec 2024",
    status: "Active",
  },
];

const Roles: React.FC = () => {
  const navigate = useNavigate();

  const [roles, setRoles] =
    useState<Role[]>(initialRoles);

  const [search, setSearch] =
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

  const [
    selectedIds,
    setSelectedIds,
  ] = useState<number[]>([]);

  const [
    showAddModal,
    setShowAddModal,
  ] = useState(false);

  const [
    showEditModal,
    setShowEditModal,
  ] = useState(false);

  const [
    showDeleteModal,
    setShowDeleteModal,
  ] = useState(false);

  const [
    selectedRole,
    setSelectedRole,
  ] = useState<Role | null>(
    null
  );

  const [
    addForm,
    setAddForm,
  ] = useState<RoleForm>({
    name: "",
    status: "",
  });

  const [
    editForm,
    setEditForm,
  ] = useState<RoleForm>({
    name: "",
    status: "",
  });

  const filteredRoles =
    useMemo(() => {
      let result = [...roles];

      const text =
        search
          .trim()
          .toLowerCase();

      if (text) {
        result = result.filter(
          (role) =>
            role.name
              .toLowerCase()
              .includes(text) ||
            role.createdDate
              .toLowerCase()
              .includes(text) ||
            role.status
              .toLowerCase()
              .includes(text)
        );
      }

      if (statusFilter) {
        result = result.filter(
          (role) =>
            role.status ===
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

      if (
        sortBy ===
        "Recently Added"
      ) {
        result.sort(
          (a, b) =>
            b.id - a.id
        );
      }

      return result;
    }, [
      roles,
      search,
      statusFilter,
      sortBy,
    ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredRoles.length /
        rowsPerPage
    )
  );

  const safeCurrentPage =
    Math.min(
      currentPage,
      totalPages
    );

  const visibleRoles =
    filteredRoles.slice(
      (safeCurrentPage - 1) *
        rowsPerPage,
      safeCurrentPage *
        rowsPerPage
    );

  const allVisibleSelected =
    visibleRoles.length > 0 &&
    visibleRoles.every(
      (role) =>
        selectedIds.includes(
          role.id
        )
    );

  const handleSelectAll = () => {
    const visibleIds =
      visibleRoles.map(
        (role) => role.id
      );

    if (allVisibleSelected) {
      setSelectedIds(
        (previous) =>
          previous.filter(
            (id) =>
              !visibleIds.includes(
                id
              )
          )
      );
    } else {
      setSelectedIds(
        (previous) => [
          ...new Set([
            ...previous,
            ...visibleIds,
          ]),
        ]
      );
    }
  };

  const handleSelectRole = (
    id: number
  ) => {
    setSelectedIds(
      (previous) =>
        previous.includes(id)
          ? previous.filter(
              (item) =>
                item !== id
            )
          : [
              ...previous,
              id,
            ]
    );
  };

  const openAddModal = () => {
    setAddForm({
      name: "",
      status: "",
    });

    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);

    setAddForm({
      name: "",
      status: "",
    });
  };

  const handleAddRole = () => {
    if (
      !addForm.name.trim() ||
      !addForm.status
    ) {
      return;
    }

    const newRole: Role = {
      id:
        roles.length > 0
          ? Math.max(
              ...roles.map(
                (role) =>
                  role.id
              )
            ) + 1
          : 1,
      name:
        addForm.name.trim(),
      createdDate:
        "03 Sep 2026",
      status:
        addForm.status,
    };

    setRoles(
      (previous) => [
        ...previous,
        newRole,
      ]
    );

    closeAddModal();
  };

  const openEditModal = (
    role: Role
  ) => {
    setSelectedRole(role);

    setEditForm({
      name: role.name,
      status:
        role.status,
    });

    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedRole(null);
  };

  const handleUpdateRole = () => {
    if (
      !selectedRole ||
      !editForm.name.trim() ||
      !editForm.status
    ) {
      return;
    }

    setRoles((previous) =>
      previous.map((role) =>
        role.id ===
        selectedRole.id
          ? {
              ...role,
              name:
                editForm.name.trim(),
              status:
                editForm.status as RoleStatus,
            }
          : role
      )
    );

    closeEditModal();
  };

  const openDeleteModal = (
    role: Role
  ) => {
    setSelectedRole(role);
    setShowDeleteModal(true);
  };

  const closeDeleteModal =
    () => {
      setShowDeleteModal(false);
      setSelectedRole(null);
    };

  const handleDeleteRole =
    () => {
      if (!selectedRole) {
        return;
      }

      setRoles((previous) =>
        previous.filter(
          (role) =>
            role.id !==
            selectedRole.id
        )
      );

      setSelectedIds(
        (previous) =>
          previous.filter(
            (id) =>
              id !==
              selectedRole.id
          )
      );

      closeDeleteModal();
    };

  return (
    <>
      <style>
        {`
        .roles-page {
          width: 100%;
          min-height: calc(100vh - 50px);
          padding: 25px 25px 24px;
          background: #f8f9fb;
          color: #10203f;
          font-family: "Inter","Segoe UI",sans-serif;
        }

        .roles-page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 26px;
        }

        .roles-page-title {
          margin: 0 0 6px;
          color: #14233f;
          font-size: 24px;
          line-height: 1.2;
          font-weight: 700;
        }

        /* BREADCRUMB EXACT SCREENSHOT STYLE */

        .roles-breadcrumb {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 3px;
          font-size: 12px;
        }

        .roles-breadcrumb-home {
          border: none;
          padding: 0;
          margin: 0;
          background: transparent;
          color: #526b7d;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .roles-breadcrumb-home i {
          font-size: 13px;
          line-height: 1;
          font-weight: 400;
        }

        .roles-breadcrumb-slash {
          color: #c3cad3;
          font-size: 12px;
        }

        .roles-breadcrumb-text {
          color: #172b4d;
          font-size: 12px;
          font-weight: 400;
        }

        .roles-add-btn {
          height: 39px;
          margin-top: 4px;
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

        .roles-card {
          width: 100%;
          overflow: hidden;
          border: 1px solid #dde2e8;
          border-radius: 5px;
          background: #fff;
          box-shadow:
            0 1px 2px
            rgba(0,0,0,.03);
        }

        .roles-card-header {
          min-height: 72px;
          padding: 14px 20px;
          border-bottom:
            1px solid #dde2e8;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .roles-card-title {
          margin: 0;
          color: #14233f;
          font-size: 15px;
          font-weight: 600;
        }

        .roles-filters {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .roles-filter {
          height: 38px;
          padding: 0 11px;
          border:
            1px solid #dce1e7;
          border-radius: 5px;
          outline: none;
          background: #fff;
          color: #14213b;
          font-size: 13px;
        }

        .roles-date-filter {
          width: 195px;
        }

        .roles-status-filter {
          width: 90px;
        }

        .roles-sort-filter {
          width: 178px;
        }

        .roles-toolbar {
          min-height: 61px;
          padding: 10px 16px;
          border-bottom:
            1px solid #e2e5e9;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .roles-row-control {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #26354d;
          font-size: 13px;
        }

        .roles-row-select {
          width: 49px;
          height: 29px;
          padding: 0 5px;
          border:
            1px solid #dce1e7;
          border-radius: 6px;
          outline: none;
          background: #fff;
          color: #465368;
          font-size: 12px;
        }

        .roles-search {
          width: 160px;
          height: 30px;
          padding: 0 14px;
          border:
            1px solid #dce1e7;
          border-radius: 5px;
          outline: none;
          background: #fff;
          color: #26344d;
          font-size: 12px;
        }

        .roles-table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .roles-table {
          width: 100%;
          min-width: 850px;
          margin: 0;
          border-collapse:
            collapse;
        }

        .roles-table thead {
          background: #e1e4e9;
        }

        .roles-table th {
          height: 43px;
          padding: 0 16px;
          vertical-align: middle;
          color: #06142e;
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
        }

        .roles-table td {
          height: 47px;
          padding: 0 16px;
          vertical-align: middle;
          border-bottom:
            1px solid #dfe3e8;
          background: #fff;
          color: #637083;
          font-size: 13px;
          white-space: nowrap;
        }

        .roles-check-column {
          width: 110px;
          padding-left: 20px !important;
        }

        .roles-role-column {
          width: 31%;
        }

        .roles-created-column {
          width: 22%;
        }

        .roles-status-column {
          width: 19%;
        }

        .roles-action-column {
          width: 22%;
        }

        .roles-checkbox {
          width: 18px;
          height: 18px;
          margin: 0;
          accent-color: #c39237;
          cursor: pointer;
        }

        .roles-sort-icon {
          float: right;
          margin-left: 8px;
          color: #cbd1d9;
          font-size: 10px;
        }

        .roles-status {
          height: 18px;
          min-width: 57px;
          padding:
            0 7px;
          border-radius: 4px;
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 600;
          line-height: 1;
        }

        .roles-status-active {
          background: #00bd61;
        }

        .roles-status-inactive {
          min-width: 65px;
          background: #ef0909;
        }

        .roles-status-dot {
          width: 4px !important;
          height: 4px !important;
          min-width: 4px !important;
          min-height: 4px !important;
          flex: 0 0 4px !important;
          margin: 0 !important;
          padding: 0 !important;
          border-radius: 50% !important;
          background: #fff !important;
        }

        .roles-actions {
          display: inline-flex;
          align-items: center;
          gap: 14px;
        }

        .roles-action-btn {
          width: 20px;
          height: 25px;
          padding: 0;
          border: 0;
          background: transparent;
          color: #506c82;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .roles-table-footer {
          min-height: 57px;
          padding: 0 16px;
          border-top:
            1px solid #dfe3e8;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #596679;
          font-size: 13px;
        }

        .roles-pagination {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .roles-page-arrow {
          width: 22px;
          height: 28px;
          padding: 0;
          border: 0;
          background: transparent;
          color: #9da5b1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .roles-current-page {
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

        .roles-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          padding: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            rgba(0,0,0,.42);
        }

        .roles-form-modal {
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

        .roles-modal-header {
          height: 64px;
          padding:
            0 16px;
          border-bottom:
            1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .roles-modal-header h3 {
          margin: 0;
          color: #253858;
          font-size: 20px;
          font-weight: 600;
        }

        .roles-modal-close {
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
          font-size: 14px;
          cursor: pointer;
        }

        .roles-modal-body {
          padding:
            18px 16px;
        }

        .roles-form-group {
          margin-bottom: 17px;
        }

        .roles-form-group label {
          display: block;
          margin-bottom: 8px;
          color: #253858;
          font-size: 14px;
          font-weight: 500;
        }

        .roles-form-group input,
        .roles-form-group select {
          width: 100%;
          height: 40px;
          padding:
            0 10px;
          border:
            1px solid #d9dee7;
          border-radius: 5px;
          outline: none;
          background: #fff;
          color: #26344d;
          font-size: 14px;
        }

        .roles-modal-footer {
          padding: 12px;
          border-top:
            1px solid #e5e7eb;
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }

        .roles-modal-cancel,
        .roles-modal-save {
          height: 40px;
          padding:
            0 16px;
          border: 0;
          border-radius: 5px;
          font-size: 14px;
          cursor: pointer;
        }

        .roles-modal-cancel {
          background: #f8f9fa;
          color: #172b4d;
        }

        .roles-modal-save {
          background: #c49135;
          color: #fff;
          font-weight: 600;
        }

        .roles-delete-modal {
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

        .roles-delete-icon {
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

        .roles-delete-modal h3 {
          margin:
            0 0 6px;
          color: #1d2b48;
          font-size: 19px;
          font-weight: 600;
        }

        .roles-delete-modal p {
          max-width: 330px;
          margin:
            0 auto 17px;
          color: #3e4654;
          font-size: 13px;
          line-height: 1.5;
        }

        .roles-delete-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }

        .roles-delete-cancel,
        .roles-delete-confirm {
          height: 39px;
          padding:
            0 16px;
          border: 0;
          border-radius: 5px;
          font-size: 13px;
          cursor: pointer;
        }

        .roles-delete-cancel {
          background: #f6f7f8;
          color: #172033;
        }

        .roles-delete-confirm {
          background: #f10d16;
          color: #fff;
          font-weight: 600;
        }
        `}
      </style>

      <div className="roles-page">
        <div className="roles-page-header">
          <div>
            <h1 className="roles-page-title">
              Roles
            </h1>

            <div className="roles-breadcrumb">
              <button
                type="button"
                className="roles-breadcrumb-home"
                onClick={() =>
                  navigate(
                    "/admin/dashboard"
                  )
                }
              >
                <i className="ti ti-smart-home"></i>
              </button>

              <span className="roles-breadcrumb-slash">
                /
              </span>

              <span className="roles-breadcrumb-text">
                Roles
              </span>
            </div>
          </div>

          <button
            type="button"
            className="roles-add-btn"
            onClick={
              openAddModal
            }
          >
            <CirclePlus
              size={15}
            />

            Add Roles
          </button>
        </div>

        <div className="roles-card">
          <div className="roles-card-header">
            <h5 className="roles-card-title">
              Roles List
            </h5>

            <div className="roles-filters">
              <select
                className="roles-filter roles-date-filter"
                defaultValue="range"
              >
                <option value="range">
                  08/28/2026 - 09/03/20
                </option>

                <option value="7">
                  Last 7 Days
                </option>

                <option value="30">
                  Last 30 Days
                </option>

                <option value="month">
                  Last Month
                </option>
              </select>

              <select
                className="roles-filter roles-status-filter"
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
                className="roles-filter roles-sort-filter"
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

          <div className="roles-toolbar">
            <div className="roles-row-control">
              <span>
                Row Per Page
              </span>

              <select
                className="roles-row-select"
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
              </select>

              <span>
                Entries
              </span>
            </div>

            <input
              type="text"
              className="roles-search"
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

          <div className="roles-table-wrapper">
            <table className="roles-table">
              <thead>
                <tr>
                  <th className="roles-check-column">
                    <input
                      type="checkbox"
                      className="roles-checkbox"
                      checked={
                        allVisibleSelected
                      }
                      onChange={
                        handleSelectAll
                      }
                    />
                  </th>

                  <th className="roles-role-column">
                    Role

                    <span className="roles-sort-icon">
                      ↑↓
                    </span>
                  </th>

                  <th className="roles-created-column">
                    Created Date

                    <span className="roles-sort-icon">
                      ↑↓
                    </span>
                  </th>

                  <th className="roles-status-column">
                    Status

                    <span className="roles-sort-icon">
                      ↑↓
                    </span>
                  </th>

                  <th className="roles-action-column">
                    <span className="roles-sort-icon">
                      ↑↓
                    </span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {visibleRoles.map(
                  (role) => (
                    <tr
                      key={role.id}
                    >
                      <td className="roles-check-column">
                        <input
                          type="checkbox"
                          className="roles-checkbox"
                          checked={selectedIds.includes(
                            role.id
                          )}
                          onChange={() =>
                            handleSelectRole(
                              role.id
                            )
                          }
                        />
                      </td>

                      <td>
                        {role.name}
                      </td>

                      <td>
                        {
                          role.createdDate
                        }
                      </td>

                      <td>
                        <span
                          className={`roles-status ${
                            role.status ===
                            "Active"
                              ? "roles-status-active"
                              : "roles-status-inactive"
                          }`}
                        >
                          <span className="roles-status-dot" />

                          {
                            role.status
                          }
                        </span>
                      </td>

                      <td>
                        <div className="roles-actions">
                          <button
                            type="button"
                            className="roles-action-btn"
                            title="Permissions"
                          >
                            <Shield
                              size={15}
                            />
                          </button>

                          <button
                            type="button"
                            className="roles-action-btn"
                            title="Edit"
                            onClick={() =>
                              openEditModal(
                                role
                              )
                            }
                          >
                            <Pencil
                              size={15}
                            />
                          </button>

                          <button
                            type="button"
                            className="roles-action-btn"
                            title="Delete"
                            onClick={() =>
                              openDeleteModal(
                                role
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
              </tbody>
            </table>
          </div>

          <div className="roles-table-footer">
            <div>
              Showing{" "}
              {filteredRoles.length ===
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
                filteredRoles.length
              )}{" "}
              of{" "}
              {
                filteredRoles.length
              }{" "}
              entries
            </div>

            <div className="roles-pagination">
              <button
                type="button"
                className="roles-page-arrow"
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

              <span className="roles-current-page">
                {
                  safeCurrentPage
                }
              </span>

              <button
                type="button"
                className="roles-page-arrow"
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

      {showAddModal && (
        <div className="roles-modal-overlay">
          <div className="roles-form-modal">
            <div className="roles-modal-header">
              <h3>
                Add Role
              </h3>

              <button
                type="button"
                className="roles-modal-close"
                onClick={
                  closeAddModal
                }
              >
                ×
              </button>
            </div>

            <div className="roles-modal-body">
              <div className="roles-form-group">
                <label>
                  Role Name
                </label>

                <input
                  type="text"
                  value={
                    addForm.name
                  }
                  onChange={(e) =>
                    setAddForm(
                      (previous) => ({
                        ...previous,
                        name:
                          e.target
                            .value,
                      })
                    )
                  }
                />
              </div>

              <div className="roles-form-group">
                <label>
                  Status
                </label>

                <select
                  value={
                    addForm.status
                  }
                  onChange={(e) =>
                    setAddForm(
                      (previous) => ({
                        ...previous,
                        status:
                          e.target
                            .value as RoleForm["status"],
                      })
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

            <div className="roles-modal-footer">
              <button
                type="button"
                className="roles-modal-cancel"
                onClick={
                  closeAddModal
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="roles-modal-save"
                onClick={
                  handleAddRole
                }
              >
                Add Role
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal &&
        selectedRole && (
          <div className="roles-modal-overlay">
            <div className="roles-form-modal">
              <div className="roles-modal-header">
                <h3>
                  Edit Role
                </h3>

                <button
                  type="button"
                  className="roles-modal-close"
                  onClick={
                    closeEditModal
                  }
                >
                  ×
                </button>
              </div>

              <div className="roles-modal-body">
                <div className="roles-form-group">
                  <label>
                    Role Name
                  </label>

                  <input
                    type="text"
                    value={
                      editForm.name
                    }
                    onChange={(e) =>
                      setEditForm(
                        (
                          previous
                        ) => ({
                          ...previous,
                          name:
                            e.target
                              .value,
                        })
                      )
                    }
                  />
                </div>

                <div className="roles-form-group">
                  <label>
                    Status
                  </label>

                  <select
                    value={
                      editForm.status
                    }
                    onChange={(e) =>
                      setEditForm(
                        (
                          previous
                        ) => ({
                          ...previous,
                          status:
                            e.target
                              .value as RoleForm["status"],
                        })
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

              <div className="roles-modal-footer">
                <button
                  type="button"
                  className="roles-modal-cancel"
                  onClick={
                    closeEditModal
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="roles-modal-save"
                  onClick={
                    handleUpdateRole
                  }
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

      {showDeleteModal &&
        selectedRole && (
          <div className="roles-modal-overlay">
            <div className="roles-delete-modal">
              <div className="roles-delete-icon">
                <Trash2
                  size={31}
                  strokeWidth={
                    2.2
                  }
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

              <div className="roles-delete-actions">
                <button
                  type="button"
                  className="roles-delete-cancel"
                  onClick={
                    closeDeleteModal
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="roles-delete-confirm"
                  onClick={
                    handleDeleteRole
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

export default Roles;
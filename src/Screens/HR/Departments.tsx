import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  addDepartment,
  deleteDepartment,
  getDepartments,
  updateDepartment,
} from "../../services/hrservices";

interface Department {
  id: string;
  name: string;
  employees: number;
  status: "Active" | "Inactive";
  createdAt: string;
}

const Departments: React.FC = () => {
  /* =====================================================
     STATES
  ===================================================== */

  const [departments, setDepartments] =
    useState<Department[]>([]);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [rowsPerPage, setRowsPerPage] =
    useState(10);

  const [currentPage, setCurrentPage] =
    useState(1);

  const [sortOrder, setSortOrder] =
    useState("latest");

  const [selectedIds, setSelectedIds] =
    useState<string[]>([]);

  const [showModal, setShowModal] =
    useState(false);

  const [
    editingDepartment,
    setEditingDepartment,
  ] = useState<Department | null>(null);

  const [
    showDeleteModal,
    setShowDeleteModal,
  ] = useState(false);

  const [
    deleteDepartmentId,
    setDeleteDepartmentId,
  ] = useState<string | null>(null);

  const [
    departmentName,
    setDepartmentName,
  ] = useState("");

  const [
    departmentStatus,
    setDepartmentStatus,
  ] =
    useState<"Active" | "Inactive">(
      "Active"
    );

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  /* =====================================================
     GET DEPARTMENTS
  ===================================================== */

  const loadDepartments =
    useCallback(async () => {
      try {
        setLoading(true);

        const response =
          await getDepartments({
            PageNumber: 1,
            PageSize: 100,
          });

        console.log(
          "Get Department Response:",
          response
        );

        /*
          Actual API response:

          {
            data: {
              departments: [],
              totalRecords: 7,
              currentPage: 1,
              pageSize: 100,
              totalPages: 1
            },
            isSuccess: true,
            message: "...",
            statusCode: 200
          }
        */

        const list =
          Array.isArray(
            response?.data
              ?.departments
          )
            ? response.data
                .departments
            : [];

        console.log(
          "Department List:",
          list
        );

        const mappedDepartments: Department[] =
          list.map(
            (item: any) => {
              return {
                id: String(
                  item.id ??
                    item.departmentId ??
                    ""
                ),

                name:
                  item.departmentName ??
                  item.name ??
                  "",

                employees:
                  Number(
                    item.noOfEmployees ??
                      item.employeeCount ??
                      item.employees ??
                      0
                  ),

                status:
                  item.isActive ===
                    true ||
                  item.isActive ===
                    1
                    ? "Active"
                    : "Inactive",

                createdAt:
                  item.createdAt ??
                  item.createdDate ??
                  item.creationDate ??
                  "",
              };
            }
          );

        console.log(
          "Mapped Departments:",
          mappedDepartments
        );

        setDepartments(
          mappedDepartments
        );

        setSelectedIds([]);
      } catch (error: any) {
        console.error(
          "Get Departments Error:",
          error
        );

        console.error(
          "Get Departments API Response:",
          error?.response?.data
        );

        setDepartments([]);
      } finally {
        setLoading(false);
      }
    }, []);

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredDepartments =
    useMemo(() => {
      let data = [
        ...departments,
      ];

      if (search.trim()) {
        const value =
          search
            .trim()
            .toLowerCase();

        data = data.filter(
          (department) =>
            department.name
              .toLowerCase()
              .includes(value)
        );
      }

      if (
        statusFilter !== "All"
      ) {
        data = data.filter(
          (department) =>
            department.status ===
            statusFilter
        );
      }

      if (
        sortOrder === "latest"
      ) {
        data.reverse();
      }

      return data;
    }, [
      departments,
      search,
      statusFilter,
      sortOrder,
    ]);

  /* =====================================================
     PAGINATION
  ===================================================== */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredDepartments.length /
        rowsPerPage
    )
  );

  const startIndex =
    (currentPage - 1) *
    rowsPerPage;

  const paginatedDepartments =
    filteredDepartments.slice(
      startIndex,
      startIndex +
        rowsPerPage
    );

  useEffect(() => {
    if (
      currentPage >
      totalPages
    ) {
      setCurrentPage(
        totalPages
      );
    }
  }, [
    currentPage,
    totalPages,
  ]);

  /* =====================================================
     ADD MODAL
  ===================================================== */

  const openAddModal = () => {
    setEditingDepartment(null);

    setDepartmentName("");

    setDepartmentStatus(
      "Active"
    );

    setShowModal(true);
  };

  /* =====================================================
     EDIT MODAL
  ===================================================== */

  const openEditModal = (
    department: Department
  ) => {
    setEditingDepartment(
      department
    );

    setDepartmentName(
      department.name
    );

    setDepartmentStatus(
      department.status
    );

    setShowModal(true);
  };

  /* =====================================================
     CLOSE ADD / EDIT MODAL
  ===================================================== */

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);

    setEditingDepartment(
      null
    );

    setDepartmentName("");

    setDepartmentStatus(
      "Active"
    );
  };

  /* =====================================================
     ADD / UPDATE
  ===================================================== */

  const handleSaveDepartment =
    async () => {
      const name =
        departmentName.trim();

      if (!name) {
        alert(
          "Please enter department name"
        );

        return;
      }

      try {
        setSaving(true);

        /* =============================
           UPDATE
        ============================= */

        if (
          editingDepartment
        ) {
          const payload = {
            id:
              editingDepartment.id,

            departmentName:
              name,

            isActive:
              departmentStatus ===
              "Active",
          };

          console.log(
            "Update Department Payload:",
            payload
          );

          const response =
            await updateDepartment(
              payload
            );

          console.log(
            "Update Department Response:",
            response
          );
        }

        /* =============================
           ADD
        ============================= */

        else {
          const payload = {
            departmentName:
              name,

            isActive:
              departmentStatus ===
              "Active",
          };

          console.log(
            "Add Department Payload:",
            payload
          );

          const response =
            await addDepartment(
              payload
            );

          console.log(
            "Add Department Response:",
            response
          );
        }

        setShowModal(false);

        setEditingDepartment(
          null
        );

        setDepartmentName("");

        setDepartmentStatus(
          "Active"
        );

        /*
          Add / Update ke baad
          latest table data
        */
        await loadDepartments();
      } catch (error: any) {
        console.error(
          editingDepartment
            ? "Update Department Error:"
            : "Add Department Error:",
          error
        );

        console.error(
          "API Error:",
          error?.response?.data
        );

        alert(
          error?.response?.data
            ?.message ||
            error?.response?.data
              ?.Message ||
            (editingDepartment
              ? "Unable to update department."
              : "Unable to add department.")
        );
      } finally {
        setSaving(false);
      }
    };

  /* =====================================================
     DELETE MODAL
  ===================================================== */

  const openDeleteModal = (
    id: string
  ) => {
    setDeleteDepartmentId(
      id
    );

    setShowDeleteModal(true);
  };

  const closeDeleteModal =
    () => {
      if (deleting) return;

      setShowDeleteModal(
        false
      );

      setDeleteDepartmentId(
        null
      );
    };

  /* =====================================================
     DELETE
  ===================================================== */

  const confirmDelete =
    async () => {
      if (
        !deleteDepartmentId
      ) {
        return;
      }

      try {
        setDeleting(true);

        console.log(
          "Delete Department Id:",
          deleteDepartmentId
        );

        const response =
          await deleteDepartment(
            deleteDepartmentId
          );

        console.log(
          "Delete Department Response:",
          response
        );

        setShowDeleteModal(
          false
        );

        setDeleteDepartmentId(
          null
        );

        await loadDepartments();
      } catch (error: any) {
        console.error(
          "Delete Department Error:",
          error
        );

        console.error(
          "Delete Department API Response:",
          error?.response?.data
        );

        alert(
          error?.response?.data
            ?.message ||
            error?.response?.data
              ?.Message ||
            "Unable to delete department."
        );
      } finally {
        setDeleting(false);
      }
    };

  /* =====================================================
     SELECT ROW
  ===================================================== */

  const handleSelectRow = (
    id: string
  ) => {
    setSelectedIds(
      (prev) =>
        prev.includes(id)
          ? prev.filter(
              (
                selectedId
              ) =>
                selectedId !==
                id
            )
          : [...prev, id]
    );
  };

  /* =====================================================
     SELECT ALL
  ===================================================== */

  const allCurrentPageSelected =
    paginatedDepartments.length >
      0 &&
    paginatedDepartments.every(
      (department) =>
        selectedIds.includes(
          department.id
        )
    );

  const handleSelectAll =
    () => {
      const currentIds =
        paginatedDepartments.map(
          (department) =>
            department.id
        );

      if (
        allCurrentPageSelected
      ) {
        setSelectedIds(
          (prev) =>
            prev.filter(
              (id) =>
                !currentIds.includes(
                  id
                )
            )
        );
      } else {
        setSelectedIds(
          (prev) =>
            Array.from(
              new Set([
                ...prev,
                ...currentIds,
              ])
            )
        );
      }
    };

  /* =====================================================
     PAGE CHANGE
  ===================================================== */

  const goToPage = (
    page: number
  ) => {
    if (
      page < 1 ||
      page > totalPages
    ) {
      return;
    }

    setCurrentPage(page);
  };

  return (
    <>
      <style>{`
        .department-page {
          min-height: 100%;
          padding: 26px 26px 40px;
          background: #f7f8fa;
          font-family: Inter, Arial, sans-serif;
          color: #101828;
        }

        .department-page * {
          box-sizing: border-box;
        }

        .department-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
        }

        .department-title {
          margin: 0;
          font-size: 25px;
          line-height: 1.2;
          font-weight: 700;
          color: #172b4d;
        }

        .department-breadcrumb {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-top: 10px;
          color: #667085;
          font-size: 13px;
        }

        .department-breadcrumb i {
          color: #58768f;
          font-size: 14px;
        }

        .breadcrumb-slash {
          color: #c5cad3;
        }

        .add-department-btn {
          height: 40px;
          border: none;
          border-radius: 6px;
          background: #c39136;
          color: #fff;
          padding: 0 17px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s ease;
          box-shadow: none;
        }

        .add-department-btn:hover {
          background: #aa7b28;
        }

        .department-card {
          background: #fff;
          border: 1px solid #e3e6eb;
          border-radius: 6px;
          box-shadow: 0 1px 2px rgba(16, 24, 40, 0.03);
          overflow: hidden;
        }

        .department-card-header {
          min-height: 71px;
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          border-bottom: 1px solid #e9ebef;
        }

        .department-list-title {
          font-size: 16px;
          font-weight: 600;
          color: #172b4d;
        }

        .department-header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .department-select {
          height: 40px;
          border: 1px solid #dfe3e8;
          border-radius: 6px;
          background: #fff;
          color: #172b4d;
          padding: 0 38px 0 14px;
          font-size: 13px;
          outline: none;
          cursor: pointer;
        }

        .department-toolbar {
          min-height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          gap: 20px;
          border-bottom: 1px solid #e6e8ed;
        }

        .rows-control {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 13px;
          color: #475467;
          white-space: nowrap;
        }

        .rows-select {
          height: 34px;
          border: 1px solid #dfe3e8;
          border-radius: 6px;
          padding: 0 9px;
          background: #fff;
          color: #475467;
          outline: none;
        }

        .department-search {
          width: 160px;
          height: 31px;
          padding: 0 13px;
          border: 1px solid #dfe3e8;
          border-radius: 6px;
          outline: none;
          font-size: 13px;
          color: #344054;
        }

        .department-search::placeholder {
          color: #98a2b3;
        }

        .department-search:focus,
        .department-select:focus,
        .rows-select:focus {
          border-color: #c39136;
        }

        .department-table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .department-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          min-width: 850px;
        }

        .department-table th {
          height: 43px;
          padding: 0 15px;
          text-align: left;
          background: #e6e8ec;
          color: #101828;
          font-size: 13px;
          font-weight: 600;
          border-bottom: 1px solid #dadee5;
        }

        .department-table td {
          height: 47px;
          padding: 0 15px;
          background: #fff;
          border-bottom: 1px solid #e3e6eb;
          color: #101828;
          font-size: 13px;
          vertical-align: middle;
        }

        .department-table tbody tr:hover td {
          background: #fcfcfd;
        }

        .checkbox-column {
          width: 72px;
          text-align: center !important;
        }

        .department-column {
          width: 33%;
        }

        .employee-column {
          width: 25%;
        }

        .status-column {
          width: 20%;
        }

        .action-column {
          width: 130px;
        }

        .department-checkbox {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #c39136;
        }

        .sortable-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .sort-icon {
          color: #cfd5de;
          font-size: 15px;
        }

        .employee-count {
          color: #667085;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          min-width: 56px;
          justify-content: center;
          border-radius: 4px;
          padding: 3px 7px;
          font-size: 11px;
          line-height: 1;
          font-weight: 600;
          color: #fff;
        }

        .status-active {
          background: #04c95b;
        }

        .status-inactive {
          background: #f01717;
        }

        .status-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #fff;
        }

        .action-buttons {
          display: flex;
          align-items: center;
          gap: 21px;
        }

        .table-action-btn {
          border: none;
          background: transparent;
          color: #55738c;
          font-size: 16px;
          padding: 0;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .table-action-btn:hover {
          color: #c39136;
        }

        .department-footer {
          min-height: 56px;
          padding: 13px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          color: #667085;
          font-size: 13px;
        }

        .pagination {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .pagination-arrow {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          color: #98a2b3;
          cursor: pointer;
          font-size: 15px;
        }

        .pagination-arrow:disabled {
          cursor: not-allowed;
          opacity: 0.45;
        }

        .pagination-page {
          width: 29px;
          height: 29px;
          border: none;
          border-radius: 50%;
          background: #c39136;
          color: #fff;
          font-weight: 600;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .empty-department {
          height: 160px !important;
          text-align: center !important;
          color: #98a2b3 !important;
        }

        .department-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(16, 24, 40, 0.45);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .department-modal {
          width: 100%;
          max-width: 460px;
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 20px 50px rgba(16, 24, 40, 0.18);
          overflow: hidden;
        }

        .department-modal-header {
          padding: 18px 22px;
          border-bottom: 1px solid #eaecf0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .department-modal-title {
          margin: 0;
          font-size: 18px;
          font-weight: 650;
          color: #172b4d;
        }

        .modal-close {
          border: none;
          background: transparent;
          font-size: 21px;
          color: #667085;
          cursor: pointer;
        }

        .department-modal-body {
          padding: 22px;
        }

        .department-form-group {
          margin-bottom: 18px;
        }

        .department-form-label {
          display: block;
          margin-bottom: 7px;
          font-size: 13px;
          font-weight: 600;
          color: #344054;
        }

        .required-star {
          color: #e53935;
        }

        .department-form-input,
        .department-form-select {
          width: 100%;
          height: 42px;
          border: 1px solid #d0d5dd;
          border-radius: 6px;
          padding: 0 12px;
          font-size: 14px;
          color: #344054;
          background: #fff;
          outline: none;
        }

        .department-form-input:focus,
        .department-form-select:focus {
          border-color: #c39136;
          box-shadow: 0 0 0 3px rgba(195, 145, 54, 0.08);
        }

        .department-modal-footer {
          padding: 15px 22px;
          border-top: 1px solid #eaecf0;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .modal-cancel-btn,
        .modal-save-btn {
          height: 39px;
          border-radius: 6px;
          padding: 0 17px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .modal-cancel-btn {
          border: 1px solid #d0d5dd;
          background: #fff;
          color: #344054;
        }

        .modal-save-btn {
          border: 1px solid #c39136;
          background: #c39136;
          color: #fff;
        }

        .modal-save-btn:disabled,
        .modal-cancel-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* DELETE MODAL */

        .department-delete-overlay {
          position: fixed;
          inset: 0;
          z-index: 11000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(0, 0, 0, 0.48);
        }

        .department-delete-modal {
          width: 400px;
          max-width: 100%;
          min-height: 230px;
          padding: 17px 30px;
          background: #ffffff;
          border: 1px solid #d9dee5;
          border-radius: 5px;
          box-shadow: 0 8px 30px rgba(16, 24, 40, 0.18);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .department-delete-icon-box {
          width: 58px;
          height: 58px;
          margin-bottom: 13px;
          border-radius: 5px;
          background: #ffd5d5;
          color: #f01616;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
        }

        .department-delete-title {
          margin: 0 0 5px;
          color: #263556;
          font-size: 20px;
          line-height: 26px;
          font-weight: 600;
        }

        .department-delete-text {
          max-width: 320px;
          margin: 0;
          color: #344054;
          font-size: 14px;
          line-height: 21px;
        }

        .department-delete-actions {
          margin-top: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }

        .department-delete-cancel,
        .department-delete-confirm {
          height: 39px;
          padding: 0 15px;
          border-radius: 5px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }

        .department-delete-cancel {
          border: 1px solid #f2f4f7;
          background: #f8f9fb;
          color: #344054;
        }

        .department-delete-confirm {
          border: 1px solid #ef1010;
          background: #ef1010;
          color: #ffffff;
        }

        .department-delete-cancel:disabled,
        .department-delete-confirm:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .department-page {
            padding: 20px 15px 30px;
          }

          .department-header,
          .department-card-header,
          .department-toolbar,
          .department-footer {
            align-items: stretch;
            flex-direction: column;
          }

          .department-header-actions {
            flex-wrap: wrap;
          }

          .add-department-btn {
            align-self: flex-start;
          }

          .department-search {
            width: 100%;
          }
        }
      `}</style>

      <div className="department-page">
        {/* PAGE HEADING */}

        <div className="department-header">
          <div>
            <h1 className="department-title">
              Departments
            </h1>

            <div className="department-breadcrumb">
              <i className="ti ti-home"></i>

              <span className="breadcrumb-slash">
                /
              </span>

              <span>
                Departments
              </span>
            </div>
          </div>

          <button
            type="button"
            className="add-department-btn"
            onClick={openAddModal}
          >
            <i className="ti ti-circle-plus"></i>

            Add Department
          </button>
        </div>

        {/* CARD */}

        <div className="department-card">
          <div className="department-card-header">
            <div className="department-list-title">
              Department List
            </div>

            <div className="department-header-actions">
              <select
                className="department-select"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(
                    e.target.value
                  );

                  setCurrentPage(1);
                }}
              >
                <option value="All">
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
                className="department-select"
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(
                    e.target.value
                  );

                  setCurrentPage(1);
                }}
              >
                <option value="latest">
                  Sort By : Last 7 Days
                </option>

                <option value="oldest">
                  Sort By : Oldest
                </option>
              </select>
            </div>
          </div>

          {/* TOOLBAR */}

          <div className="department-toolbar">
            <div className="rows-control">
              <span>
                Row Per Page
              </span>

              <select
                className="rows-select"
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

                <option value={50}>
                  50
                </option>
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
                setSearch(
                  e.target.value
                );

                setCurrentPage(1);
              }}
            />
          </div>

          {/* TABLE */}

          <div className="department-table-wrapper">
            <table className="department-table">
              <thead>
                <tr>
                  <th className="checkbox-column">
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

                  <th className="department-column">
                    <div className="sortable-header">
                      <span>
                        Department
                      </span>

                      <i className="ti ti-arrows-sort sort-icon"></i>
                    </div>
                  </th>

                  <th className="employee-column">
                    <div className="sortable-header">
                      <span>
                        No of Employees
                      </span>

                      <i className="ti ti-arrows-sort sort-icon"></i>
                    </div>
                  </th>

                  <th className="status-column">
                    <div className="sortable-header">
                      <span>
                        Status
                      </span>

                      <i className="ti ti-arrows-sort sort-icon"></i>
                    </div>
                  </th>

                  <th className="action-column">
                    <i className="ti ti-arrows-sort sort-icon"></i>
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="empty-department"
                    >
                      Loading departments...
                    </td>
                  </tr>
                ) : paginatedDepartments.length >
                  0 ? (
                  paginatedDepartments.map(
                    (department) => (
                      <tr
                        key={
                          department.id
                        }
                      >
                        <td className="checkbox-column">
                          <input
                            type="checkbox"
                            className="department-checkbox"
                            checked={selectedIds.includes(
                              department.id
                            )}
                            onChange={() =>
                              handleSelectRow(
                                department.id
                              )
                            }
                          />
                        </td>

                        <td>
                          {
                            department.name
                          }
                        </td>

                        <td>
                          <span className="employee-count">
                            {department.employees
                              .toString()
                              .padStart(
                                2,
                                "0"
                              )}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`status-badge ${
                              department.status ===
                              "Active"
                                ? "status-active"
                                : "status-inactive"
                            }`}
                          >
                            <span className="status-dot"></span>

                            {
                              department.status
                            }
                          </span>
                        </td>

                        <td>
                          <div className="action-buttons">
                            <button
                              type="button"
                              className="table-action-btn"
                              title="Edit"
                              onClick={() =>
                                openEditModal(
                                  department
                                )
                              }
                            >
                              <i className="ti ti-edit"></i>
                            </button>

                            <button
                              type="button"
                              className="table-action-btn"
                              title="Delete"
                              onClick={() =>
                                openDeleteModal(
                                  department.id
                                )
                              }
                            >
                              <i className="ti ti-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="empty-department"
                    >
                      No departments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER */}

          <div className="department-footer">
            <div>
              Showing{" "}
              {filteredDepartments.length ===
              0
                ? 0
                : startIndex +
                  1}{" "}
              -{" "}
              {Math.min(
                startIndex +
                  rowsPerPage,

                filteredDepartments.length
              )}{" "}
              of{" "}
              {
                filteredDepartments.length
              }{" "}
              entries
            </div>

            <div className="pagination">
              <button
                className="pagination-arrow"
                type="button"
                disabled={
                  currentPage === 1
                }
                onClick={() =>
                  goToPage(
                    currentPage - 1
                  )
                }
              >
                <i className="ti ti-chevron-left"></i>
              </button>

              <div className="pagination-page">
                {currentPage}
              </div>

              <button
                className="pagination-arrow"
                type="button"
                disabled={
                  currentPage ===
                  totalPages
                }
                onClick={() =>
                  goToPage(
                    currentPage + 1
                  )
                }
              >
                <i className="ti ti-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}

      {showModal && (
        <div
          className="department-modal-overlay"
          onMouseDown={
            closeModal
          }
        >
          <div
            className="department-modal"
            onMouseDown={(e) =>
              e.stopPropagation()
            }
          >
            <div className="department-modal-header">
              <h3 className="department-modal-title">
                {editingDepartment
                  ? "Edit Department"
                  : "Add Department"}
              </h3>

              <button
                type="button"
                className="modal-close"
                disabled={saving}
                onClick={closeModal}
              >
                <i className="ti ti-x"></i>
              </button>
            </div>

            <div className="department-modal-body">
              <div className="department-form-group">
                <label className="department-form-label">
                  Department Name{" "}
                  <span className="required-star">
                    *
                  </span>
                </label>

                <input
                  type="text"
                  className="department-form-input"
                  placeholder="Enter Department Name"
                  value={
                    departmentName
                  }
                  disabled={saving}
                  onChange={(e) =>
                    setDepartmentName(
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="department-form-group">
                <label className="department-form-label">
                  Status
                </label>

                <select
                  className="department-form-select"
                  value={
                    departmentStatus
                  }
                  disabled={saving}
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
                className="modal-cancel-btn"
                disabled={saving}
                onClick={closeModal}
              >
                Cancel
              </button>

              <button
                type="button"
                className="modal-save-btn"
                disabled={saving}
                onClick={
                  handleSaveDepartment
                }
              >
                {saving
                  ? editingDepartment
                    ? "Updating..."
                    : "Adding..."
                  : editingDepartment
                  ? "Update"
                  : "Add Department"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}

      {showDeleteModal && (
        <div
          className="department-delete-overlay"
          onMouseDown={
            closeDeleteModal
          }
        >
          <div
            className="department-delete-modal"
            onMouseDown={(e) =>
              e.stopPropagation()
            }
          >
            <div className="department-delete-icon-box">
              <i className="ti ti-trash"></i>
            </div>

            <h3 className="department-delete-title">
              Confirm Delete
            </h3>

            <p className="department-delete-text">
              You want to delete this
              department, this can't be
              undone once you delete.
            </p>

            <div className="department-delete-actions">
              <button
                type="button"
                className="department-delete-cancel"
                disabled={deleting}
                onClick={
                  closeDeleteModal
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="department-delete-confirm"
                disabled={deleting}
                onClick={
                  confirmDelete
                }
              >
                {deleting
                  ? "Deleting..."
                  : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Departments;
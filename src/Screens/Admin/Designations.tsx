import React, {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";

import {
  addDesignation,
  deleteDesignation,
  getDesignations,
  getDepartments,
  updateDesignation,
} from "../../services/adminservices";

/* =====================================================
   TYPES
===================================================== */

interface DepartmentOption {
  id: string;
  name: string;
}

interface Designation {
  id: string;
  designation: string;
  departmentId: string;
  department: string;
  employees: number;
  status: "Active" | "Inactive";
}

type FormStatus =
  | ""
  | "Active"
  | "Inactive";

/* =====================================================
   HELPERS
===================================================== */

const getValue = (
  item: any,
  ...keys: string[]
) => {
  for (const key of keys) {
    if (
      item?.[key] !== undefined &&
      item?.[key] !== null
    ) {
      return item[key];
    }
  }

  return undefined;
};

/* =====================================================
   DEPARTMENT RESPONSE
===================================================== */

const extractDepartmentList = (
  response: any
): any[] => {
  const candidates = [
    response?.data?.items,
    response?.data?.records,
    response?.data?.departments,
    response?.data?.result,

    response?.items,
    response?.records,
    response?.departments,
    response?.result,

    response?.data,
  ];

  return (
    candidates.find(
      (value) =>
        Array.isArray(value)
    ) ?? []
  );
};

const formatDepartment = (
  item: any
): DepartmentOption => {
  return {
    id: String(
      getValue(
        item,
        "id",
        "Id",
        "departmentId",
        "DepartmentId"
      ) ?? ""
    ),

    name:
      getValue(
        item,
        "departmentName",
        "DepartmentName",
        "name",
        "Name"
      ) ?? "",
  };
};

/* =====================================================
   DESIGNATION RESPONSE
===================================================== */

const extractDesignationList = (
  response: any
): any[] => {
  const candidates = [
    response?.data?.items,
    response?.data?.records,
    response?.data?.designations,
    response?.data?.result,

    response?.items,
    response?.records,
    response?.designations,
    response?.result,

    response?.data,
  ];

  return (
    candidates.find(
      (value) =>
        Array.isArray(value)
    ) ?? []
  );
};

const formatDesignation = (
  item: any,
  departments: DepartmentOption[]
): Designation => {
  const departmentId = String(
    getValue(
      item,
      "departmentId",
      "DepartmentId"
    ) ?? ""
  );

  const departmentFromApi =
    getValue(
      item,
      "departmentName",
      "DepartmentName"
    );

  const matchedDepartment =
    departments.find(
      (department) =>
        department.id === departmentId
    );

  const status =
    getValue(
      item,
      "isActive",
      "IsActive"
    ) === false ||
    getValue(
      item,
      "status",
      "Status"
    ) === "Inactive"
      ? "Inactive"
      : "Active";

  return {
    id: String(
      getValue(
        item,
        "id",
        "Id",
        "designationId",
        "DesignationId"
      ) ?? ""
    ),

    designation:
      getValue(
        item,
        "designationName",
        "DesignationName",
        "designation",
        "Designation",
        "name",
        "Name"
      ) ?? "",

    departmentId,

    department:
      departmentFromApi ??
      matchedDepartment?.name ??
      "",

    employees: Number(
      getValue(
        item,
        "employees",
        "Employees",
        "employeeCount",
        "EmployeeCount",
        "noOfEmployees",
        "NoOfEmployees"
      ) ?? 0
    ),

    status,
  };
};

/* =====================================================
   COMPONENT
===================================================== */

const Designations = () => {
  /* ===================================================
     DATA
  =================================================== */

  const [data, setData] =
    useState<Designation[]>([]);

  const [
    departmentOptions,
    setDepartmentOptions,
  ] = useState<DepartmentOption[]>([]);

  /* ===================================================
     FILTERS
  =================================================== */

  const [
    selectedDepartment,
    setSelectedDepartment,
  ] = useState("Department");

  const [
    selectedStatus,
    setSelectedStatus,
  ] = useState("Select Status");

  const [sortBy, setSortBy] =
    useState("Last 7 Days");

  const [entries, setEntries] =
    useState(10);

  const [search, setSearch] =
    useState("");

  /* ===================================================
     PAGINATION
  =================================================== */

  const [currentPage, setCurrentPage] =
    useState(1);

  const [totalRecords, setTotalRecords] =
    useState(0);

  /* ===================================================
     SELECTION
  =================================================== */

  const [selected, setSelected] =
    useState<string[]>([]);

  /* ===================================================
     LOADING / ERROR
  =================================================== */

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  /* ===================================================
     MODALS
  =================================================== */

  const [addOpen, setAddOpen] =
    useState(false);

  const [editOpen, setEditOpen] =
    useState(false);

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  /* ===================================================
     FORM
  =================================================== */

  const [
    designationName,
    setDesignationName,
  ] = useState("");

  const [
    departmentId,
    setDepartmentId,
  ] = useState("");

  const [
    formStatus,
    setFormStatus,
  ] = useState<FormStatus>("");

  const [
    editingItem,
    setEditingItem,
  ] = useState<Designation | null>(
    null
  );

  const [
    deleteId,
    setDeleteId,
  ] = useState<string | null>(null);

  /* ===================================================
     ERROR HELPER
  =================================================== */

  const getApiError = (
    err: any,
    fallback: string
  ) => {
    return (
      err?.response?.data?.message ||
      err?.response?.data?.Message ||
      err?.response?.data?.title ||
      err?.response?.data?.Title ||
      err?.response?.data?.error ||
      err?.message ||
      fallback
    );
  };

  /* ===================================================
     LOAD DEPARTMENTS
  =================================================== */

  const loadDepartmentOptions =
    async () => {
      try {
        const response =
          await getDepartments({
            PageNumber: 1,
            PageSize: 100,
          });

        const list =
          extractDepartmentList(
            response
          );

        const formatted =
          list
            .map(formatDepartment)
            .filter(
              (item) =>
                item.id &&
                item.name
            );

        setDepartmentOptions(
          formatted
        );
      } catch (err) {
        console.error(
          "Get departments for designation error:",
          err
        );
      }
    };

  /* ===================================================
     LOAD DESIGNATIONS
  =================================================== */

  const loadDesignations =
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getDesignations({
            Search:
              search.trim() ||
              undefined,

            DepartmentId:
              selectedDepartment !==
                "Department" &&
              selectedDepartment !==
                "All"
                ? selectedDepartment
                : undefined,

            UserStatus:
              selectedStatus ===
              "Active"
                ? 1
                : selectedStatus ===
                  "Inactive"
                ? 0
                : undefined,

            PageNumber:
              currentPage,

            PageSize:
              entries,

            SortBy:
              sortBy ===
              "Ascending"
                ? "DesignationName"
                : sortBy ===
                  "Descending"
                ? "DesignationName_desc"
                : undefined,
          });

        console.log(
          "DESIGNATION LIST RESPONSE:",
          response
        );

        const list =
          extractDesignationList(
            response
          );

        const formatted =
          list.map((item) =>
            formatDesignation(
              item,
              departmentOptions
            )
          );

        setData(formatted);

        /* =============================================
           TOTAL COUNT
        ============================================= */

        const total = Number(
          getValue(
            response,
            "totalCount",
            "TotalCount",
            "totalRecords",
            "TotalRecords",
            "count",
            "Count"
          ) ??
            getValue(
              response?.data,
              "totalCount",
              "TotalCount",
              "totalRecords",
              "TotalRecords",
              "count",
              "Count"
            ) ??
            formatted.length
        );

        setTotalRecords(
          total || formatted.length
        );

        setSelected([]);
      } catch (err: any) {
        console.error(
          "Get designations API error:",
          err
        );

        setData([]);

        setTotalRecords(0);

        setError(
          getApiError(
            err,
            "Failed to load designations."
          )
        );
      } finally {
        setLoading(false);
      }
    };

  /* ===================================================
     INITIAL LOAD DEPARTMENTS
  =================================================== */

  useEffect(() => {
    loadDepartmentOptions();
  }, []);

  /* ===================================================
     LOAD DESIGNATIONS
  =================================================== */

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        loadDesignations();
      }, 350);

    return () =>
      window.clearTimeout(
        timer
      );
  }, [
    search,
    selectedDepartment,
    selectedStatus,
    sortBy,
    entries,
    currentPage,
    departmentOptions,
  ]);

  /* ===================================================
     FILTER LOCAL DATA
  =================================================== */

  const filteredData =
    useMemo(() => {
      let result = [...data];

      if (
        search.trim()
      ) {
        const query =
          search
            .trim()
            .toLowerCase();

        result =
          result.filter(
            (item) =>
              item.designation
                .toLowerCase()
                .includes(query) ||
              item.department
                .toLowerCase()
                .includes(query)
          );
      }

      return result;
    }, [
      data,
      search,
    ]);

  /* ===================================================
     CHECKBOX
  =================================================== */

  const allSelected =
    filteredData.length > 0 &&
    filteredData.every(
      (item) =>
        selected.includes(item.id)
    );

  const handleSelectAll =
    () => {
      const visibleIds =
        filteredData.map(
          (item) => item.id
        );

      if (allSelected) {
        setSelected(
          (previous) =>
            previous.filter(
              (id) =>
                !visibleIds.includes(
                  id
                )
            )
        );
      } else {
        setSelected(
          (previous) => [
            ...new Set([
              ...previous,
              ...visibleIds,
            ]),
          ]
        );
      }
    };

  const toggleSelect = (
    id: string
  ) => {
    setSelected(
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

  /* ===================================================
     ADD
  =================================================== */

  const openAddModal =
    () => {
      setDesignationName("");
      setDepartmentId("");
      setFormStatus("");
      setError("");
      setAddOpen(true);
    };

  const closeAddModal =
    () => {
      setAddOpen(false);
      setDesignationName("");
      setDepartmentId("");
      setFormStatus("");
    };

  const handleAdd =
    async (
      e: FormEvent
    ) => {
      e.preventDefault();

      if (
        !designationName.trim() ||
        !departmentId ||
        !formStatus
      ) {
        setError(
          "Please enter designation name, department and status."
        );
        return;
      }

      try {
        setSaving(true);
        setError("");

        await addDesignation({
          designationName:
            designationName.trim(),

          departmentId,

          isActive:
            formStatus ===
            "Active",
        });

        closeAddModal();

        setCurrentPage(1);

        await loadDesignations();
      } catch (err: any) {
        console.error(
          "Add designation API error:",
          err
        );

        setError(
          getApiError(
            err,
            "Failed to add designation."
          )
        );
      } finally {
        setSaving(false);
      }
    };

  /* ===================================================
     EDIT
  =================================================== */

  const openEditModal =
    (
      item: Designation
    ) => {
      setEditingItem(item);

      setDesignationName(
        item.designation
      );

      setDepartmentId(
        item.departmentId
      );

      setFormStatus(
        item.status
      );

      setError("");

      setEditOpen(true);
    };

  const closeEditModal =
    () => {
      setEditOpen(false);

      setEditingItem(null);

      setDesignationName("");

      setDepartmentId("");

      setFormStatus("");
    };

  const handleEdit =
    async (
      e: FormEvent
    ) => {
      e.preventDefault();

      if (
        !editingItem ||
        !designationName.trim() ||
        !departmentId ||
        !formStatus
      ) {
        setError(
          "Please enter designation name, department and status."
        );
        return;
      }

      try {
        setSaving(true);
        setError("");

        await updateDesignation({
          id: editingItem.id,

          designationName:
            designationName.trim(),

          departmentId,

          isActive:
            formStatus ===
            "Active",
        });

        closeEditModal();

        await loadDesignations();
      } catch (err: any) {
        console.error(
          "Update designation API error:",
          err
        );

        setError(
          getApiError(
            err,
            "Failed to update designation."
          )
        );
      } finally {
        setSaving(false);
      }
    };

  /* ===================================================
     DELETE
  =================================================== */

  const openDeleteModal =
    (id: string) => {
      setDeleteId(id);
      setError("");
      setDeleteOpen(true);
    };

  const closeDeleteModal =
    () => {
      setDeleteId(null);
      setDeleteOpen(false);
    };

  const handleDelete =
    async () => {
      if (!deleteId) {
        return;
      }

      try {
        setSaving(true);
        setError("");

        await deleteDesignation(
          deleteId
        );

        setSelected(
          (previous) =>
            previous.filter(
              (id) =>
                id !== deleteId
            )
        );

        closeDeleteModal();

        await loadDesignations();
      } catch (err: any) {
        console.error(
          "Delete designation API error:",
          err
        );

        setError(
          getApiError(
            err,
            "Failed to delete designation."
          )
        );
      } finally {
        setSaving(false);
      }
    };

  /* ===================================================
     PAGINATION
  =================================================== */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalRecords /
          entries
      )
    );

  const showingFrom =
    totalRecords === 0
      ? 0
      : (currentPage - 1) *
          entries +
        1;

  const showingTo =
    totalRecords === 0
      ? 0
      : Math.min(
          currentPage *
            entries,
          totalRecords
        );

  /* ===================================================
     JSX
  =================================================== */

  return (
    <>
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

          .designation-footer {
            min-height: 52px;
            padding: 10px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            color: #596579;
            font-size: 12px;
          }

          .designation-pagination {
            display: flex;
            align-items: center;
            gap: 7px;
          }

          .designation-page-btn {
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

          .designation-page-btn.active {
            border-color: #bd9039;
            background: #bd9039;
            color: white;
          }

          .designation-page-btn:disabled {
            opacity: 0.4;
            cursor: not-allowed;
          }

          .designation-error {
            margin-bottom: 12px;
            padding: 10px 12px;
            border: 1px solid #f1b7b7;
            border-radius: 5px;
            background: #fff5f5;
            color: #b42318;
            font-size: 12px;
          }

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

          .designation-modal-save:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }

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

          .designation-delete-confirm:disabled {
            opacity: 0.7;
            cursor: not-allowed;
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

            .designation-footer {
              align-items: flex-start;
              flex-direction: column;
              gap: 10px;
            }
          }
        `}
      </style>

      <div className="designation-page">

        {/* =================================================
            HEADER
        ================================================= */}

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
            onClick={
              openAddModal
            }
          >
            <i className="ti ti-circle-plus" />

            Add Designation
          </button>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="designation-error">
            {error}
          </div>
        )}

        {/* =================================================
            CARD
        ================================================= */}

        <div className="designation-card">

          {/* HEADER */}

          <div className="designation-card-header">

            <h5>
              Designation List
            </h5>

            <div className="designation-filters">

              {/* DEPARTMENT */}

              <select
                className="designation-filter department-filter"
                value={
                  selectedDepartment
                }
                onChange={(e) => {
                  setSelectedDepartment(
                    e.target.value
                  );

                  setCurrentPage(1);
                }}
              >
                <option value="Department">
                  Department
                </option>

                <option value="All">
                  All
                </option>

                {departmentOptions.map(
                  (
                    department
                  ) => (
                    <option
                      key={
                        department.id
                      }
                      value={
                        department.id
                      }
                    >
                      {
                        department.name
                      }
                    </option>
                  )
                )}
              </select>

              {/* STATUS */}

              <select
                className="designation-filter status-filter"
                value={
                  selectedStatus
                }
                onChange={(e) => {
                  setSelectedStatus(
                    e.target.value
                  );

                  setCurrentPage(1);
                }}
              >
                <option value="Select Status">
                  Select Status
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
                className="designation-filter sort-filter"
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

          {/* =================================================
              TOOLBAR
          ================================================= */}

          <div className="designation-toolbar">

            <div className="designation-rows">

              <span>
                Row per page
              </span>

              <select
                value={entries}
                onChange={(e) => {
                  setEntries(
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
                entries
              </span>

            </div>

            <input
              type="text"
              className="designation-search"
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

          {/* =================================================
              TABLE
          ================================================= */}

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
                      checked={
                        allSelected
                      }
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
                  >
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center"
                      style={{
                        height: "80px",
                      }}
                    >
                      Loading designations...
                    </td>
                  </tr>
                ) : (
                  filteredData.map(
                    (item) => (
                      <tr
                        key={
                          item.id
                        }
                      >

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
                          {
                            item.designation
                          }
                        </td>

                        <td>
                          {
                            item.department ||
                            "-"
                          }
                        </td>

                        <td>
                          {
                            item.employees
                          }
                        </td>

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

                            {
                              item.status
                            }

                          </span>

                        </td>

                        <td>

                          <div className="designation-actions">

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
                  )
                )}

                {!loading &&
                  filteredData.length ===
                    0 && (
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

          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="designation-footer">

            <div>
              Showing{" "}
              {showingFrom}
              {" - "}
              {showingTo}
              {" of "}
              {totalRecords}
              {" entries"}
            </div>

            <div className="designation-pagination">

              <button
                type="button"
                className="designation-page-btn"
                disabled={
                  currentPage <= 1 ||
                  loading
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
                className="designation-page-btn active"
              >
                {
                  currentPage
                }
              </button>

              <button
                type="button"
                className="designation-page-btn"
                disabled={
                  currentPage >=
                    totalPages ||
                  loading ||
                  filteredData.length <
                    entries
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

      {/* =================================================
          ADD DESIGNATION MODAL
      ================================================= */}

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
                        e.target.value
                      )
                    }
                    placeholder="Enter designation name"
                  />

                </div>

                {/* DEPARTMENT */}

                <div className="designation-form-group">

                  <label>
                    Department Name
                  </label>

                  <select
                    value={
                      departmentId
                    }
                    onChange={(e) =>
                      setDepartmentId(
                        e.target.value
                      )
                    }
                  >

                    <option value="">
                      Select Department
                    </option>

                    {departmentOptions.map(
                      (
                        department
                      ) => (
                        <option
                          key={
                            department.id
                          }
                          value={
                            department.id
                          }
                        >
                          {
                            department.name
                          }
                        </option>
                      )
                    )}

                  </select>

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
                  disabled={
                    saving
                  }
                >
                  {saving
                    ? "Saving..."
                    : "Add Designation"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =================================================
          EDIT DESIGNATION MODAL
      ================================================= */}

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

                    <select
                      value={
                        departmentId
                      }
                      onChange={(e) =>
                        setDepartmentId(
                          e.target.value
                        )
                      }
                    >

                      <option value="">
                        Select Department
                      </option>

                      {departmentOptions.map(
                        (
                          department
                        ) => (
                          <option
                            key={
                              department.id
                            }
                            value={
                              department.id
                            }
                          >
                            {
                              department.name
                            }
                          </option>
                        )
                      )}

                    </select>

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
                    disabled={
                      saving
                    }
                  >
                    {saving
                      ? "Saving..."
                      : "Save Changes"}
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
                disabled={
                  saving
                }
              >
                {saving
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

export default Designations;
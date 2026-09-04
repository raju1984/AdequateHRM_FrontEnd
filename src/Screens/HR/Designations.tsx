import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import {
  addDesignation,
  deleteDesignation,
  getDepartments,
  getDesignations,
  updateDesignation,
} from "../../services/hrservices";

/* =====================================================
   TYPES
===================================================== */

interface DepartmentOption {
  id: string;
  name: string;
}

interface DesignationRow {
  id: string;
  designation: string;
  departmentId: string;
  department: string;
  employees: number;
  status: "Active" | "Inactive";
  createdAt: string;
}

/* =====================================================
   HELPERS
===================================================== */

const getArrayFromResponse = (
  response: any,
  possibleKeys: string[]
) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  for (const key of possibleKeys) {
    if (Array.isArray(response?.[key])) {
      return response[key];
    }

    if (
      Array.isArray(
        response?.data?.[key]
      )
    ) {
      return response.data[key];
    }
  }

  if (
    Array.isArray(response?.data?.data)
  ) {
    return response.data.data;
  }

  if (
    Array.isArray(response?.data?.items)
  ) {
    return response.data.items;
  }

  if (
    Array.isArray(response?.items)
  ) {
    return response.items;
  }

  return [];
};

const getDesignationStatus = (
  item: any
): "Active" | "Inactive" => {
  if (
    typeof item?.isActive === "boolean"
  ) {
    return item.isActive
      ? "Active"
      : "Inactive";
  }

  if (
    typeof item?.IsActive === "boolean"
  ) {
    return item.IsActive
      ? "Active"
      : "Inactive";
  }

  const status =
    item?.userStatus ??
    item?.UserStatus ??
    item?.status ??
    item?.Status;

  if (typeof status === "string") {
    return status
      .toLowerCase()
      .includes("inactive")
      ? "Inactive"
      : "Active";
  }

  if (status === 2 || status === 0) {
    return "Inactive";
  }

  return "Active";
};

const getErrorMessage = (
  error: any,
  fallback: string
) => {
  const backendErrors =
    error?.response?.data?.errors;

  if (backendErrors) {
    return Object.entries(
      backendErrors
    )
      .map(([field, messages]) => {
        if (Array.isArray(messages)) {
          return `${field}: ${messages.join(
            ", "
          )}`;
        }

        return `${field}: ${String(
          messages
        )}`;
      })
      .join("\n");
  }

  return (
    error?.response?.data?.message ||
    error?.response?.data?.title ||
    error?.message ||
    fallback
  );
};

/* =====================================================
   COMPONENT
===================================================== */

const Designation: React.FC = () => {
  const navigate = useNavigate();

  /* ===================================================
     DATA
  =================================================== */

  const [
    designations,
    setDesignations,
  ] = useState<DesignationRow[]>([]);

  const [
    departments,
    setDepartments,
  ] = useState<DepartmentOption[]>([]);

  /* ===================================================
     LOADING
  =================================================== */

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    departmentLoading,
    setDepartmentLoading,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  /* ===================================================
     FILTERS
  =================================================== */

  const [search, setSearch] =
    useState("");

  const [
    departmentFilter,
    setDepartmentFilter,
  ] = useState("All");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("All");

  const [sortBy, setSortBy] =
    useState("latest");

  const [
    rowsPerPage,
    setRowsPerPage,
  ] = useState(10);

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  /* ===================================================
     SELECTED ROWS
  =================================================== */

  const [
    selectedRows,
    setSelectedRows,
  ] = useState<string[]>([]);

  /* ===================================================
     ADD / EDIT MODAL
  =================================================== */

  const [
    showModal,
    setShowModal,
  ] = useState(false);

  const [
    editingDesignation,
    setEditingDesignation,
  ] =
    useState<DesignationRow | null>(
      null
    );

  const [
    designationName,
    setDesignationName,
  ] = useState("");

  const [
    departmentId,
    setDepartmentId,
  ] = useState("");

  const [
    designationStatus,
    setDesignationStatus,
  ] =
    useState<
      "Active" | "Inactive"
    >("Active");

  /* ===================================================
     DELETE MODAL
  =================================================== */

  const [
    showDeleteModal,
    setShowDeleteModal,
  ] = useState(false);

  const [
    deleteDesignationId,
    setDeleteDesignationId,
  ] =
    useState<string | null>(null);

  /* ===================================================
     FETCH DEPARTMENTS
  =================================================== */

  const fetchDepartments =
    async () => {
      try {
        setDepartmentLoading(true);

        const response =
          await getDepartments({
            Search: "",
            PageNumber: 1,
            PageSize: 100,
          });

        console.log(
          "GET DEPARTMENTS RESPONSE:",
          response
        );

        const rawDepartments =
          getArrayFromResponse(
            response,
            [
              "departments",
              "Departments",
              "departmentList",
              "DepartmentList",
              "records",
              "Records",
              "items",
              "Items",
            ]
          );

        const formattedDepartments: DepartmentOption[] =
          rawDepartments
            .map((item: any) => ({
              id:
                item.id ??
                item.Id ??
                item.departmentId ??
                item.DepartmentId ??
                "",

              name:
                item.departmentName ??
                item.DepartmentName ??
                item.name ??
                item.Name ??
                "",
            }))
            .filter(
              (
                item: DepartmentOption
              ) =>
                Boolean(item.id) &&
                Boolean(item.name)
            );

        setDepartments(
          formattedDepartments
        );
      } catch (error: any) {
        console.error(
          "GET DEPARTMENTS ERROR:",
          error
        );

        setDepartments([]);
      } finally {
        setDepartmentLoading(false);
      }
    };

  /* ===================================================
     FETCH DESIGNATIONS
  =================================================== */

  const fetchDesignations =
    async () => {
      try {
        setLoading(true);

        /*
          We fetch a reasonably large list once and
          keep search/filter/pagination on the frontend.
          This avoids depending on an undocumented
          SortBy format while still using the GET API.
        */
        const response =
          await getDesignations({
            PageNumber: 1,
            PageSize: 500,
          });

        console.log(
          "GET DESIGNATIONS RESPONSE:",
          response
        );

        const rawDesignations =
          getArrayFromResponse(
            response,
            [
              "designations",
              "Designations",
              "designationList",
              "DesignationList",
              "records",
              "Records",
              "items",
              "Items",
            ]
          );

        const formattedDesignations: DesignationRow[] =
          rawDesignations
            .map(
              (
                item: any,
                index: number
              ) => {
                const mappedDepartmentId =
                  item.departmentId ??
                  item.DepartmentId ??
                  item.department?.id ??
                  item.Department?.Id ??
                  "";

                const departmentFromApi =
                  item.departmentName ??
                  item.DepartmentName ??
                  item.department?.departmentName ??
                  item.department?.name ??
                  item.Department?.DepartmentName ??
                  item.Department?.Name ??
                  "";

                const departmentFromList =
                  departments.find(
                    (department) =>
                      department.id ===
                      mappedDepartmentId
                  )?.name || "";

                return {
                  id:
                    item.id ??
                    item.Id ??
                    item.designationId ??
                    item.DesignationId ??
                    `designation-${index}`,

                  designation:
                    item.designationName ??
                    item.DesignationName ??
                    item.designation ??
                    item.Designation ??
                    item.name ??
                    item.Name ??
                    "",

                  departmentId:
                    mappedDepartmentId,

                  department:
                    departmentFromApi ||
                    departmentFromList ||
                    "-",

                  employees: Number(
                    item.employeeCount ??
                      item.EmployeeCount ??
                      item.noOfEmployees ??
                      item.NoOfEmployees ??
                      item.totalEmployees ??
                      item.TotalEmployees ??
                      item.employees ??
                      item.Employees ??
                      0
                  ),

                  status:
                    getDesignationStatus(
                      item
                    ),

                  createdAt:
                    item.createdAt ??
                    item.CreatedAt ??
                    item.createdDate ??
                    item.CreatedDate ??
                    item.modifiedAt ??
                    item.ModifiedAt ??
                    "",
                };
              }
            )
            .filter(
              (
                item: DesignationRow
              ) =>
                Boolean(item.id) &&
                Boolean(
                  item.designation
                )
            );

        setDesignations(
          formattedDesignations
        );
      } catch (error: any) {
        console.error(
          "GET DESIGNATIONS ERROR:",
          error
        );

        alert(
          getErrorMessage(
            error,
            "Unable to load designations"
          )
        );

        setDesignations([]);
      } finally {
        setLoading(false);
      }
    };

  /* ===================================================
     PAGE LOAD
  =================================================== */

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchDesignations();
  }, [departments.length]);

  /* ===================================================
     FILTERED DATA
  =================================================== */

  const filteredDesignations =
    useMemo(() => {
      let data = [...designations];

      if (search.trim()) {
        const value = search
          .trim()
          .toLowerCase();

        data = data.filter(
          (item) =>
            item.designation
              .toLowerCase()
              .includes(value) ||
            item.department
              .toLowerCase()
              .includes(value)
        );
      }

      if (
        departmentFilter !== "All"
      ) {
        data = data.filter(
          (item) =>
            item.departmentId ===
            departmentFilter
        );
      }

      if (statusFilter !== "All") {
        data = data.filter(
          (item) =>
            item.status ===
            statusFilter
        );
      }

      data.sort((a, b) => {
        const first =
          a.createdAt
            ? new Date(
                a.createdAt
              ).getTime()
            : 0;

        const second =
          b.createdAt
            ? new Date(
                b.createdAt
              ).getTime()
            : 0;

        if (
          first === 0 &&
          second === 0
        ) {
          return sortBy === "latest"
            ? b.designation.localeCompare(
                a.designation
              )
            : a.designation.localeCompare(
                b.designation
              );
        }

        return sortBy === "latest"
          ? second - first
          : first - second;
      });

      return data;
    }, [
      designations,
      search,
      departmentFilter,
      statusFilter,
      sortBy,
    ]);

  /* ===================================================
     PAGINATION
  =================================================== */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredDesignations.length /
        rowsPerPage
    )
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex =
    (currentPage - 1) *
    rowsPerPage;

  const paginatedDesignations =
    filteredDesignations.slice(
      startIndex,
      startIndex + rowsPerPage
    );

  /* ===================================================
     CHECKBOX
  =================================================== */

  const allSelected =
    paginatedDesignations.length >
      0 &&
    paginatedDesignations.every(
      (item) =>
        selectedRows.includes(item.id)
    );

  const handleSelectAll = () => {
    const currentIds =
      paginatedDesignations.map(
        (item) => item.id
      );

    if (allSelected) {
      setSelectedRows((prev) =>
        prev.filter(
          (id) =>
            !currentIds.includes(id)
        )
      );
      return;
    }

    setSelectedRows((prev) =>
      Array.from(
        new Set([
          ...prev,
          ...currentIds,
        ])
      )
    );
  };

  const handleSelectRow = (
    id: string
  ) => {
    setSelectedRows((prev) =>
      prev.includes(id)
        ? prev.filter(
            (item) => item !== id
          )
        : [...prev, id]
    );
  };

  /* ===================================================
     ADD MODAL
  =================================================== */

  const openAddModal = () => {
    setEditingDesignation(null);
    setDesignationName("");
    setDepartmentId("");
    setDesignationStatus("Active");
    setShowModal(true);
  };

  /* ===================================================
     EDIT MODAL
  =================================================== */

  const openEditModal = (
    item: DesignationRow
  ) => {
    setEditingDesignation(item);

    setDesignationName(
      item.designation
    );

    setDepartmentId(
      item.departmentId
    );

    setDesignationStatus(
      item.status
    );

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingDesignation(null);
    setDesignationName("");
    setDepartmentId("");
    setDesignationStatus("Active");
  };

  /* ===================================================
     ADD / UPDATE DESIGNATION
  =================================================== */

  const handleSave = async () => {
    if (!departmentId) {
      alert(
        "Please select department."
      );
      return;
    }

    if (!designationName.trim()) {
      alert(
        "Please enter designation."
      );
      return;
    }

    try {
      setSaving(true);

      let response: any;

      if (editingDesignation) {
        response =
          await updateDesignation({
            id:
              editingDesignation.id,
            designationName:
              designationName.trim(),
            departmentId,
            isActive:
              designationStatus ===
              "Active",
          });
      } else {
        response =
          await addDesignation({
            designationName:
              designationName.trim(),
            departmentId,
            isActive:
              designationStatus ===
              "Active",
          });
      }

      console.log(
        editingDesignation
          ? "UPDATE DESIGNATION RESPONSE:"
          : "ADD DESIGNATION RESPONSE:",
        response
      );

      if (
        response?.isSuccess ===
          false ||
        response?.statusCode >= 400
      ) {
        alert(
          response?.message ||
            "Unable to save designation"
        );
        return;
      }

      alert(
        response?.message ||
          (editingDesignation
            ? "Designation updated successfully"
            : "Designation added successfully")
      );

      closeModal();

      await fetchDesignations();
    } catch (error: any) {
      console.error(
        "SAVE DESIGNATION ERROR:",
        error
      );

      alert(
        getErrorMessage(
          error,
          editingDesignation
            ? "Unable to update designation"
            : "Unable to add designation"
        )
      );
    } finally {
      setSaving(false);
    }
  };

  /* ===================================================
     DELETE
  =================================================== */

  const openDeleteModal = (
    id: string
  ) => {
    setDeleteDesignationId(id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (deleting) {
      return;
    }

    setShowDeleteModal(false);
    setDeleteDesignationId(null);
  };

  const confirmDelete =
    async () => {
      if (!deleteDesignationId) {
        return;
      }

      try {
        setDeleting(true);

        const response =
          await deleteDesignation(
            deleteDesignationId
          );

        console.log(
          "DELETE DESIGNATION RESPONSE:",
          response
        );

        if (
          response?.isSuccess ===
            false ||
          response?.statusCode >=
            400
        ) {
          alert(
            response?.message ||
              "Unable to delete designation"
          );
          return;
        }

        alert(
          response?.message ||
            "Designation deleted successfully"
        );

        setSelectedRows((prev) =>
          prev.filter(
            (item) =>
              item !==
              deleteDesignationId
          )
        );

        setShowDeleteModal(false);
        setDeleteDesignationId(null);

        await fetchDesignations();
      } catch (error: any) {
        console.error(
          "DELETE DESIGNATION ERROR:",
          error
        );

        alert(
          getErrorMessage(
            error,
            "Unable to delete designation"
          )
        );
      } finally {
        setDeleting(false);
      }
    };

  return (
    <>
      <style>
        {`
          * { box-sizing: border-box; }

          .designation-page {
            width: 100%;
            min-height: calc(100vh - 70px);
            background: #f7f8fa;
            padding: 22px 20px 35px;
            font-family: Inter, Arial, sans-serif;
          }

          .designation-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 25px;
          }

          .designation-main-title {
            margin: 0;
            color: #102a56;
            font-size: 24px;
            line-height: 30px;
            font-weight: 700;
          }

          .designation-breadcrumb {
            margin-top: 8px;
            display: flex;
            align-items: center;
            gap: 9px;
            font-size: 12px;
            color: #101828;
          }

          .designation-home-button {
            padding: 0;
            border: none;
            outline: none;
            background: transparent;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: #537389;
            cursor: pointer;
            font-size: 13px;
          }

          .breadcrumb-slash {
            color: #b8c0cc;
          }

          .add-designation-button {
            height: 40px;
            padding: 0 16px;
            border: none;
            border-radius: 6px;
            background: #c39136;
            color: white;
            font-size: 14px;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            cursor: pointer;
          }

          .add-designation-button:disabled {
            opacity: .65;
            cursor: not-allowed;
          }

          .designation-card {
            width: 100%;
            background: #ffffff;
            border: 1px solid #dfe3e8;
            border-radius: 6px;
            overflow: hidden;
            box-shadow: 0 1px 2px rgba(16, 24, 40, 0.03);
          }

          .designation-card-header {
            min-height: 71px;
            padding: 16px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #e3e6eb;
          }

          .designation-list-heading {
            color: #102a56;
            font-size: 16px;
            font-weight: 600;
          }

          .designation-filters {
            display: flex;
            align-items: center;
            gap: 15px;
          }

          .designation-filter-select {
            height: 40px;
            border: 1px solid #dfe3e8;
            background: #ffffff;
            color: #101828;
            border-radius: 6px;
            padding: 0 38px 0 14px;
            font-size: 13px;
            outline: none;
            cursor: pointer;
          }

          .designation-filter-select.department { width: 150px; }
          .designation-filter-select.status { width: 134px; }
          .designation-filter-select.sort { width: 178px; }

          .designation-toolbar {
            min-height: 61px;
            padding: 12px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid #e1e5ea;
          }

          .designation-row-control {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #344054;
            font-size: 13px;
          }

          .designation-row-select {
            height: 31px;
            padding: 0 8px;
            background: white;
            border: 1px solid #dfe3e8;
            border-radius: 6px;
            color: #344054;
            font-size: 13px;
            outline: none;
          }

          .designation-search-input {
            height: 31px;
            width: 160px;
            border: 1px solid #dfe3e8;
            border-radius: 6px;
            outline: none;
            padding: 0 13px;
            font-size: 12px;
            color: #344054;
          }

          .designation-table-wrapper {
            overflow-x: auto;
            width: 100%;
          }

          .designation-table {
            width: 100%;
            min-width: 900px;
            border-collapse: collapse;
            table-layout: fixed;
          }

          .designation-table thead {
            background: #e6e8ec;
          }

          .designation-table th {
            height: 43px;
            background: #e6e8ec;
            color: #101828;
            padding: 0 15px;
            font-size: 13px;
            font-weight: 600;
            text-align: left;
            border-bottom: 1px solid #dadee5;
          }

          .designation-table td {
            height: 47px;
            background: #ffffff;
            color: #101828;
            padding: 0 15px;
            border-bottom: 1px solid #e0e4e9;
            font-size: 13px;
            vertical-align: middle;
          }

          .checkbox-col {
            width: 70px;
            text-align: center !important;
          }

          .designation-col { width: 23%; }
          .department-col { width: 25%; }
          .employee-col { width: 18%; }
          .status-col { width: 15%; }
          .action-col { width: 110px; }

          .designation-checkbox {
            width: 18px;
            height: 18px;
            cursor: pointer;
            accent-color: #c39136;
          }

          .table-heading-with-sort {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
          }

          .table-sort-icon {
            font-size: 14px;
            color: #cfd5dd;
          }

          .department-text,
          .employee-number {
            color: #667085;
          }

          .designation-status {
            min-width: 57px;
            padding: 3px 7px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
            border-radius: 4px;
            color: #ffffff;
            font-size: 10px;
            line-height: 12px;
            font-weight: 600;
          }

          .designation-status.active { background: #04c95b; }
          .designation-status.inactive { background: #f11717; }

          .designation-status-dot {
            width: 4px;
            height: 4px;
            background: #ffffff;
            border-radius: 50%;
          }

          .designation-action-wrapper {
            display: flex;
            align-items: center;
            gap: 21px;
          }

          .designation-action-button {
            border: none;
            background: transparent;
            padding: 0;
            font-size: 16px;
            color: #55738c;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }

          .designation-footer {
            min-height: 56px;
            padding: 12px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: #667085;
            font-size: 13px;
          }

          .designation-pagination {
            display: flex;
            align-items: center;
            gap: 13px;
          }

          .designation-pagination-arrow {
            width: 26px;
            height: 26px;
            border: none;
            outline: none;
            background: transparent;
            color: #98a2b3;
            font-size: 14px;
            cursor: pointer;
          }

          .designation-pagination-arrow:disabled {
            cursor: not-allowed;
            opacity: 0.45;
          }

          .designation-current-page {
            width: 27px;
            height: 27px;
            border-radius: 50%;
            background: #c39136;
            color: #ffffff;
            border: none;
            font-size: 12px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
          }

          .designation-no-data {
            height: 150px !important;
            text-align: center !important;
            color: #98a2b3 !important;
          }

          .designation-modal-overlay,
          .designation-delete-overlay {
            position: fixed;
            inset: 0;
            z-index: 9999;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            background: rgba(16, 24, 40, 0.45);
          }

          .designation-modal {
            width: 100%;
            max-width: 460px;
            border-radius: 8px;
            background: white;
            overflow: hidden;
            box-shadow: 0 20px 50px rgba(16, 24, 40, 0.18);
          }

          .designation-modal-header {
            height: 62px;
            padding: 0 21px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid #eaecf0;
          }

          .designation-modal-title {
            color: #102a56;
            font-size: 18px;
            font-weight: 600;
            margin: 0;
          }

          .designation-modal-close {
            padding: 0;
            border: none;
            background: transparent;
            font-size: 21px;
            color: #667085;
            cursor: pointer;
          }

          .designation-modal-body {
            padding: 22px;
          }

          .designation-form-group {
            margin-bottom: 18px;
          }

          .designation-form-group:last-child {
            margin-bottom: 0;
          }

          .designation-form-label {
            display: block;
            margin-bottom: 7px;
            color: #344054;
            font-size: 13px;
            font-weight: 600;
          }

          .required-star { color: #ef4444; }

          .designation-form-control {
            width: 100%;
            height: 42px;
            padding: 0 12px;
            border: 1px solid #d0d5dd;
            border-radius: 6px;
            outline: none;
            background: #ffffff;
            color: #344054;
            font-size: 13px;
          }

          .designation-modal-footer {
            padding: 14px 22px;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            border-top: 1px solid #eaecf0;
          }

          .designation-cancel-button,
          .designation-save-button {
            height: 39px;
            padding: 0 17px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
          }

          .designation-cancel-button {
            background: white;
            border: 1px solid #d0d5dd;
            color: #344054;
          }

          .designation-save-button {
            background: #c39136;
            border: 1px solid #c39136;
            color: white;
          }

          .designation-save-button:disabled,
          .designation-cancel-button:disabled {
            opacity: .65;
            cursor: not-allowed;
          }

          .designation-delete-overlay {
            z-index: 11000;
            background: rgba(0, 0, 0, 0.48);
          }

          .designation-delete-modal {
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

          .designation-delete-icon-box {
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

          .designation-delete-title {
            margin: 0 0 5px;
            color: #263556;
            font-size: 20px;
            line-height: 26px;
            font-weight: 600;
          }

          .designation-delete-text {
            max-width: 320px;
            margin: 0;
            color: #344054;
            font-size: 14px;
            line-height: 21px;
          }

          .designation-delete-actions {
            margin-top: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16px;
          }

          .designation-delete-cancel,
          .designation-delete-confirm {
            height: 39px;
            padding: 0 15px;
            border-radius: 5px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
          }

          .designation-delete-cancel {
            border: 1px solid #f2f4f7;
            background: #f8f9fb;
            color: #344054;
          }

          .designation-delete-confirm {
            border: 1px solid #ef1010;
            background: #ef1010;
            color: #ffffff;
          }

          .designation-delete-cancel:disabled,
          .designation-delete-confirm:disabled {
            opacity: .65;
            cursor: not-allowed;
          }

          @media (max-width: 900px) {
            .designation-card-header {
              align-items: flex-start;
              flex-direction: column;
              gap: 14px;
            }

            .designation-filters {
              width: 100%;
              flex-wrap: wrap;
            }
          }

          @media (max-width: 768px) {
            .designation-page {
              padding: 18px 14px 30px;
            }

            .designation-top {
              flex-direction: column;
              gap: 15px;
            }

            .designation-toolbar {
              align-items: stretch;
              flex-direction: column;
              gap: 12px;
            }

            .designation-search-input,
            .designation-filter-select.department,
            .designation-filter-select.status,
            .designation-filter-select.sort {
              width: 100%;
            }

            .designation-filters {
              flex-direction: column;
            }

            .designation-footer {
              flex-direction: column;
              align-items: flex-start;
              gap: 12px;
            }
          }
        `}
      </style>

      <div className="designation-page">
        <div className="designation-top">
          <div>
            <h1 className="designation-main-title">
              Designations
            </h1>

            <div className="designation-breadcrumb">
              <button
                type="button"
                className="designation-home-button"
                title="Go to Dashboard"
                onClick={() =>
                  navigate(
                    "/Hr/HrDashboard"
                  )
                }
              >
                <i className="ti ti-home"></i>
              </button>

              <span className="breadcrumb-slash">
                /
              </span>

              <span>
                Designations
              </span>
            </div>
          </div>

          <button
            type="button"
            className="add-designation-button"
            onClick={openAddModal}
            disabled={
              departmentLoading
            }
          >
            <i className="ti ti-circle-plus"></i>

            <span>
              Add Designation
            </span>
          </button>
        </div>

        <div className="designation-card">
          <div className="designation-card-header">
            <div className="designation-list-heading">
              Designation List
            </div>

            <div className="designation-filters">
              <select
                className="designation-filter-select department"
                value={departmentFilter}
                onChange={(e) => {
                  setDepartmentFilter(
                    e.target.value
                  );
                  setCurrentPage(1);
                }}
              >
                <option value="All">
                  Department
                </option>

                {departments.map(
                  (department) => (
                    <option
                      key={department.id}
                      value={department.id}
                    >
                      {department.name}
                    </option>
                  )
                )}
              </select>

              <select
                className="designation-filter-select status"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(
                    e.target.value
                  );
                  setCurrentPage(1);
                }}
              >
                <option value="All">
                  Select Status
                </option>

                <option value="Active">
                  Active
                </option>

                <option value="Inactive">
                  Inactive
                </option>
              </select>

              <select
                className="designation-filter-select sort"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(
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

          <div className="designation-toolbar">
            <div className="designation-row-control">
              <span>
                Row Per Page
              </span>

              <select
                className="designation-row-select"
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
              className="designation-search-input"
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

          <div className="designation-table-wrapper">
            <table className="designation-table">
              <thead>
                <tr>
                  <th className="checkbox-col">
                    <input
                      type="checkbox"
                      className="designation-checkbox"
                      checked={allSelected}
                      onChange={
                        handleSelectAll
                      }
                    />
                  </th>

                  <th className="designation-col">
                    <div className="table-heading-with-sort">
                      <span>
                        Designation
                      </span>
                      <i className="ti ti-arrows-sort table-sort-icon"></i>
                    </div>
                  </th>

                  <th className="department-col">
                    <div className="table-heading-with-sort">
                      <span>
                        Department
                      </span>
                      <i className="ti ti-arrows-sort table-sort-icon"></i>
                    </div>
                  </th>

                  <th className="employee-col">
                    <div className="table-heading-with-sort">
                      <span>
                        No of Employees
                      </span>
                      <i className="ti ti-arrows-sort table-sort-icon"></i>
                    </div>
                  </th>

                  <th className="status-col">
                    <div className="table-heading-with-sort">
                      <span>
                        Status
                      </span>
                      <i className="ti ti-arrows-sort table-sort-icon"></i>
                    </div>
                  </th>

                  <th className="action-col"></th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="designation-no-data"
                    >
                      Loading designations...
                    </td>
                  </tr>
                ) : paginatedDesignations.length >
                  0 ? (
                  paginatedDesignations.map(
                    (item) => (
                      <tr key={item.id}>
                        <td className="checkbox-col">
                          <input
                            type="checkbox"
                            className="designation-checkbox"
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
                          {item.designation}
                        </td>

                        <td>
                          <span className="department-text">
                            {
                              item.department
                            }
                          </span>
                        </td>

                        <td>
                          <span className="employee-number">
                            {item.employees
                              .toString()
                              .padStart(
                                2,
                                "0"
                              )}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`designation-status ${
                              item.status ===
                              "Active"
                                ? "active"
                                : "inactive"
                            }`}
                          >
                            <span className="designation-status-dot"></span>
                            {item.status}
                          </span>
                        </td>

                        <td>
                          <div className="designation-action-wrapper">
                            <button
                              type="button"
                              title="Edit"
                              className="designation-action-button"
                              onClick={() =>
                                openEditModal(
                                  item
                                )
                              }
                            >
                              <i className="ti ti-edit"></i>
                            </button>

                            <button
                              type="button"
                              title="Delete"
                              className="designation-action-button"
                              onClick={() =>
                                openDeleteModal(
                                  item.id
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
                      colSpan={6}
                      className="designation-no-data"
                    >
                      No designations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="designation-footer">
            <div>
              Showing{" "}
              {filteredDesignations.length ===
              0
                ? 0
                : startIndex + 1}{" "}
              -{" "}
              {Math.min(
                startIndex +
                  rowsPerPage,
                filteredDesignations.length
              )}{" "}
              of{" "}
              {
                filteredDesignations.length
              }{" "}
              entries
            </div>

            <div className="designation-pagination">
              <button
                type="button"
                className="designation-pagination-arrow"
                disabled={
                  currentPage === 1
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
                <i className="ti ti-chevron-left"></i>
              </button>

              <span className="designation-current-page">
                {currentPage}
              </span>

              <button
                type="button"
                className="designation-pagination-arrow"
                disabled={
                  currentPage ===
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
                <i className="ti ti-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div
          className="designation-modal-overlay"
          onMouseDown={closeModal}
        >
          <div
            className="designation-modal"
            onMouseDown={(e) =>
              e.stopPropagation()
            }
          >
            <div className="designation-modal-header">
              <h3 className="designation-modal-title">
                {editingDesignation
                  ? "Edit Designation"
                  : "Add Designation"}
              </h3>

              <button
                type="button"
                className="designation-modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                <i className="ti ti-x"></i>
              </button>
            </div>

            <div className="designation-modal-body">
              <div className="designation-form-group">
                <label className="designation-form-label">
                  Department{" "}
                  <span className="required-star">
                    *
                  </span>
                </label>

                <select
                  className="designation-form-control"
                  value={departmentId}
                  onChange={(e) =>
                    setDepartmentId(
                      e.target.value
                    )
                  }
                  disabled={
                    departmentLoading ||
                    saving
                  }
                >
                  <option value="">
                    {departmentLoading
                      ? "Loading..."
                      : "Select Department"}
                  </option>

                  {departments.map(
                    (department) => (
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

              <div className="designation-form-group">
                <label className="designation-form-label">
                  Designation{" "}
                  <span className="required-star">
                    *
                  </span>
                </label>

                <input
                  type="text"
                  className="designation-form-control"
                  value={designationName}
                  onChange={(e) =>
                    setDesignationName(
                      e.target.value
                    )
                  }
                  placeholder="Enter Designation"
                  disabled={saving}
                />
              </div>

              <div className="designation-form-group">
                <label className="designation-form-label">
                  Status
                </label>

                <select
                  className="designation-form-control"
                  value={
                    designationStatus
                  }
                  onChange={(e) =>
                    setDesignationStatus(
                      e.target
                        .value as
                        | "Active"
                        | "Inactive"
                    )
                  }
                  disabled={saving}
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

            <div className="designation-modal-footer">
              <button
                type="button"
                className="designation-cancel-button"
                onClick={closeModal}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="designation-save-button"
                onClick={handleSave}
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingDesignation
                  ? "Update"
                  : "Add Designation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div
          className="designation-delete-overlay"
          onMouseDown={
            closeDeleteModal
          }
        >
          <div
            className="designation-delete-modal"
            onMouseDown={(e) =>
              e.stopPropagation()
            }
          >
            <div className="designation-delete-icon-box">
              <i className="ti ti-trash"></i>
            </div>

            <h3 className="designation-delete-title">
              Confirm Delete
            </h3>

            <p className="designation-delete-text">
              You want to delete this
              designation, this can't be
              undone once you delete.
            </p>

            <div className="designation-delete-actions">
              <button
                type="button"
                className="designation-delete-cancel"
                onClick={
                  closeDeleteModal
                }
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="designation-delete-confirm"
                onClick={
                  confirmDelete
                }
                disabled={deleting}
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

export default Designation;

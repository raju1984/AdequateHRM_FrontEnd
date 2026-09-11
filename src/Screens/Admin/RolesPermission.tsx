
import React, {
  useEffect,
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

import {
  getRoles,
  addRole,
  updateRole,
  deleteRole,
} from "../../services/hrservices";

/* =====================================================
   TYPES
===================================================== */

type RoleStatus =
  | "Active"
  | "Inactive";

interface Role {
  id: string;
  name: string;
  createdDate: string;
  status: RoleStatus;
}

interface RoleForm {
  name: string;
  status: RoleStatus | "";
}

/* =====================================================
   PERMISSION TYPES
===================================================== */

type PermissionKey =
  | "read"
  | "write"
  | "create"
  | "delete"
  | "import"
  | "export";

interface ModulePermission {
  read: boolean;
  write: boolean;
  create: boolean;
  delete: boolean;
  import: boolean;
  export: boolean;
}

type PermissionsState = Record<
  string,
  ModulePermission
>;

/* =====================================================
   CONSTANTS
===================================================== */

const GOLD = "#c39237";

const PERMISSION_MODULES = [
  "Employee",
  "Holidays",
  "Leaves",
  "Events",
];

/* =====================================================
   DEFAULT PERMISSIONS
===================================================== */

const createDefaultPermissions =
  (): PermissionsState => ({
    Employee: {
      read: false,
      write: false,
      create: false,
      delete: false,
      import: false,
      export: false,
    },

    Holidays: {
      read: false,
      write: false,
      create: false,
      delete: false,
      import: false,
      export: false,
    },

    Leaves: {
      read: false,
      write: false,
      create: false,
      delete: false,
      import: false,
      export: false,
    },

    Events: {
      read: false,
      write: false,
      create: false,
      delete: false,
      import: false,
      export: false,
    },
  });

/* =====================================================
   RESPONSE HELPERS
===================================================== */

const extractRoles = (
  response: any
): any[] => {
  if (!response) {
    return [];
  }

  const candidates = [
    response?.data,
    response?.data?.data,
    response?.data?.items,
    response?.data?.records,
    response?.data?.roles,
    response?.data?.roleList,
    response?.items,
    response?.records,
    response?.roles,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  if (Array.isArray(response)) {
    return response;
  }

  return [];
};

const normalizeRole = (
  item: any
): Role => {
  const active =
    item?.isActive ??
    item?.IsActive ??
    item?.active ??
    item?.Active ??
    false;

  return {
    id: String(
      item?.id ??
        item?.Id ??
        ""
    ),

    name:
      item?.roleName ??
      item?.RoleName ??
      item?.name ??
      item?.Name ??
      "",

    createdDate:
      item?.createdDate ??
      item?.CreatedDate ??
      item?.createdAt ??
      item?.CreatedAt ??
      item?.dateCreated ??
      item?.DateCreated ??
      "",

    status:
      active === true ||
      active === 1 ||
      active === "true"
        ? "Active"
        : "Inactive",
  };
};

const formatDate = (
  value: string
) => {
  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

/* =====================================================
   COMPONENT
===================================================== */

const Roles: React.FC = () => {
  const navigate = useNavigate();

  /* ===================================================
     STATE
  =================================================== */

  const [
    roles,
    setRoles,
  ] = useState<Role[]>([]);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("");

  const [
    sortBy,
    setSortBy,
  ] = useState("Last 7 Days");

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
  ] = useState<string[]>([]);

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

  /* ===================================================
     ADD ROLE PERMISSIONS
  =================================================== */

  const [
    addPermissions,
    setAddPermissions,
  ] = useState<PermissionsState>(
    createDefaultPermissions
  );

  /* ===================================================
     EDIT ROLE PERMISSIONS
  =================================================== */

  const [
    editPermissions,
    setEditPermissions,
  ] = useState<PermissionsState>(
    createDefaultPermissions
  );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  /* ===================================================
     LOAD ROLES
  =================================================== */

  const loadRoles = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getRoles({
          PageNumber: 1,
          PageSize: 100,
        });

      console.log(
        "ROLE API RESPONSE =>",
        response
      );

      const apiRoles =
        extractRoles(response);

      console.log(
        "ROLE ARRAY =>",
        apiRoles
      );

      const normalizedRoles =
        apiRoles
          .map(normalizeRole)
          .filter(
            (role) =>
              role.id &&
              role.name
          );

      console.log(
        "NORMALIZED ROLES =>",
        normalizedRoles
      );

      setRoles(
        normalizedRoles
      );

      setSelectedIds(
        (previous) =>
          previous.filter(
            (id) =>
              normalizedRoles.some(
                (role) =>
                  role.id === id
              )
          )
      );
    } catch (err: any) {
      console.error(
        "GET ROLES ERROR =>",
        err
      );

      setError(
        err?.response?.data
          ?.message ||
          err?.message ||
          "Failed to load roles."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  /* ===================================================
     FILTER + SORT
  =================================================== */

  const filteredRoles =
    useMemo(() => {
      let result = [
        ...roles,
      ];

      const text =
        search
          .trim()
          .toLowerCase();

      if (text) {
        result =
          result.filter(
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
        result =
          result.filter(
            (role) =>
              role.status ===
              statusFilter
          );
      }

      if (
        sortBy ===
        "Ascending"
      ) {
        result.sort(
          (a, b) =>
            a.name.localeCompare(
              b.name
            )
        );
      }

      if (
        sortBy ===
        "Descending"
      ) {
        result.sort(
          (a, b) =>
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
            b.id.localeCompare(
              a.id
            )
        );
      }

      return result;
    }, [
      roles,
      search,
      statusFilter,
      sortBy,
    ]);

  /* ===================================================
     PAGINATION
  =================================================== */

  const totalPages =
    Math.max(
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

  /* ===================================================
     SELECT ALL
  =================================================== */

  const handleSelectAll =
    () => {
      const visibleIds =
        visibleRoles.map(
          (role) =>
            role.id
        );

      if (
        allVisibleSelected
      ) {
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

  /* ===================================================
     SELECT ROLE
  =================================================== */

  const handleSelectRole = (
    id: string
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

  /* ===================================================
     ADD PERMISSION CHECKBOX
  =================================================== */

  const handleAddPermissionChange = (
    moduleName: string,
    permission: PermissionKey
  ) => {
    setAddPermissions(
      (previous) => ({
        ...previous,

        [moduleName]: {
          ...previous[moduleName],

          [permission]:
            !previous[moduleName][
              permission
            ],
        },
      })
    );
  };

  /* ===================================================
     EDIT PERMISSION CHECKBOX
  =================================================== */

  const handleEditPermissionChange = (
    moduleName: string,
    permission: PermissionKey
  ) => {
    setEditPermissions(
      (previous) => ({
        ...previous,

        [moduleName]: {
          ...previous[moduleName],

          [permission]:
            !previous[moduleName][
              permission
            ],
        },
      })
    );
  };

  /* ===================================================
     ADD MODAL
  =================================================== */

  const openAddModal = () => {
    setAddForm({
      name: "",
      status: "",
    });

    setAddPermissions(
      createDefaultPermissions()
    );

    setError("");
    setSuccess("");

    setShowAddModal(true);
  };

  const closeAddModal = () => {
    if (saving) {
      return;
    }

    setShowAddModal(false);

    setAddForm({
      name: "",
      status: "",
    });

    setAddPermissions(
      createDefaultPermissions()
    );
  };

  /* ===================================================
     ADD ROLE API
  =================================================== */

  const handleAddRole =
    async () => {
      if (
        !addForm.name.trim() ||
        !addForm.status
      ) {
        setError(
          "Please enter role name and select status."
        );
        return;
      }

      try {
        setSaving(true);
        setError("");

        const payload = {
          roleName:
            addForm.name.trim(),

          isActive:
            addForm.status ===
            "Active",
        };

        console.log(
          "ADD ROLE PAYLOAD =>",
          payload
        );

        console.log(
          "ADD ROLE PERMISSIONS =>",
          addPermissions
        );

        /*
          Current role API accepts
          roleName + isActive.

          Permissions are maintained
          separately until backend
          permission API is available.
        */

        const response =
          await addRole(
            payload
          );

        console.log(
          "ADD ROLE RESULT =>",
          response
        );

        setShowAddModal(
          false
        );

        setAddForm({
          name: "",
          status: "",
        });

        setAddPermissions(
          createDefaultPermissions()
        );

        setSuccess(
          "Role added successfully."
        );

        setCurrentPage(1);

        await loadRoles();
      } catch (err: any) {
        console.error(
          "ADD ROLE ERROR =>",
          err
        );

        setError(
          err?.response?.data
            ?.message ||
            err?.message ||
            "Failed to add role."
        );
      } finally {
        setSaving(false);
      }
    };

  /* ===================================================
     EDIT MODAL
  =================================================== */

  const openEditModal = (
    role: Role
  ) => {
    setSelectedRole(role);

    setEditForm({
      name: role.name,
      status: role.status,
    });

    /*
      Reset permissions for edit modal.

      If backend later returns saved permissions,
      they can be mapped here.
    */
    setEditPermissions(
      createDefaultPermissions()
    );

    setError("");
    setSuccess("");

    setShowEditModal(true);
  };

  const closeEditModal = () => {
    if (saving) {
      return;
    }

    setShowEditModal(false);
    setSelectedRole(null);

    setEditForm({
      name: "",
      status: "",
    });

    setEditPermissions(
      createDefaultPermissions()
    );
  };

  /* ===================================================
     UPDATE ROLE API
  =================================================== */

  const handleUpdateRole =
    async () => {
      if (
        !selectedRole
      ) {
        return;
      }

      if (
        !editForm.name.trim() ||
        !editForm.status
      ) {
        setError(
          "Please enter role name and select status."
        );
        return;
      }

      try {
        setSaving(true);
        setError("");

        const payload = {
          id: selectedRole.id,

          roleName:
            editForm.name.trim(),

          isActive:
            editForm.status ===
            "Active",
        };

        console.log(
          "UPDATE ROLE PAYLOAD =>",
          payload
        );

        console.log(
          "UPDATE ROLE PERMISSIONS =>",
          editPermissions
        );

        const response =
          await updateRole(
            payload
          );

        console.log(
          "UPDATE ROLE RESULT =>",
          response
        );

        setShowEditModal(
          false
        );

        setSelectedRole(null);

        setEditForm({
          name: "",
          status: "",
        });

        setEditPermissions(
          createDefaultPermissions()
        );

        setSuccess(
          "Role updated successfully."
        );

        await loadRoles();
      } catch (err: any) {
        console.error(
          "UPDATE ROLE ERROR =>",
          err
        );

        setError(
          err?.response?.data
            ?.message ||
            err?.message ||
            "Failed to update role."
        );
      } finally {
        setSaving(false);
      }
    };

  /* ===================================================
     DELETE MODAL
  =================================================== */

  const openDeleteModal = (
    role: Role
  ) => {
    setSelectedRole(role);

    setError("");
    setSuccess("");

    setShowDeleteModal(true);
  };

  const closeDeleteModal =
    () => {
      if (deleting) {
        return;
      }

      setShowDeleteModal(
        false
      );

      setSelectedRole(null);
    };

  /* ===================================================
     DELETE ROLE API
  =================================================== */

  const handleDeleteRole =
    async () => {
      if (
        !selectedRole
      ) {
        return;
      }

      try {
        setDeleting(true);
        setError("");

        console.log(
          "DELETE ROLE ID =>",
          selectedRole.id
        );

        const response =
          await deleteRole(
            selectedRole.id
          );

        console.log(
          "DELETE ROLE RESULT =>",
          response
        );

        setSelectedIds(
          (previous) =>
            previous.filter(
              (id) =>
                id !==
                selectedRole.id
            )
        );

        setShowDeleteModal(
          false
        );

        setSelectedRole(null);

        setSuccess(
          "Role deleted successfully."
        );

        await loadRoles();
      } catch (err: any) {
        console.error(
          "DELETE ROLE ERROR =>",
          err
        );

        setError(
          err?.response?.data
            ?.message ||
            err?.message ||
            "Failed to delete role."
        );
      } finally {
        setDeleting(false);
      }
    };

  /* =====================================================
     PERMISSION TABLE
  ===================================================== */

  const renderPermissionTable = (
    permissions: PermissionsState,
    onChange: (
      moduleName: string,
      permission: PermissionKey
    ) => void
  ) => {
    return (
      <div className="roles-permissions-wrapper">
        <div className="roles-permissions-table-wrapper">

          <table className="roles-permissions-table">

            <thead>
              <tr>
                <th>
                  Module Permissions
                </th>

                <th>
                  Read
                </th>

                <th>
                  Write
                </th>

                <th>
                  Create
                </th>

                <th>
                  Delete
                </th>

                <th>
                  Import
                </th>

                <th>
                  Export
                </th>
              </tr>
            </thead>

            <tbody>
              {PERMISSION_MODULES.map(
                (moduleName) => (
                  <tr
                    key={
                      moduleName
                    }
                  >

                    <td>
                      {
                        moduleName
                      }
                    </td>

                    <td>
                      <input
                        type="checkbox"
                        className="roles-permission-checkbox"
                        checked={
                          permissions[
                            moduleName
                          ].read
                        }
                        onChange={() =>
                          onChange(
                            moduleName,
                            "read"
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="checkbox"
                        className="roles-permission-checkbox"
                        checked={
                          permissions[
                            moduleName
                          ].write
                        }
                        onChange={() =>
                          onChange(
                            moduleName,
                            "write"
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="checkbox"
                        className="roles-permission-checkbox"
                        checked={
                          permissions[
                            moduleName
                          ].create
                        }
                        onChange={() =>
                          onChange(
                            moduleName,
                            "create"
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="checkbox"
                        className="roles-permission-checkbox"
                        checked={
                          permissions[
                            moduleName
                          ].delete
                        }
                        onChange={() =>
                          onChange(
                            moduleName,
                            "delete"
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="checkbox"
                        className="roles-permission-checkbox"
                        checked={
                          permissions[
                            moduleName
                          ].import
                        }
                        onChange={() =>
                          onChange(
                            moduleName,
                            "import"
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="checkbox"
                        className="roles-permission-checkbox"
                        checked={
                          permissions[
                            moduleName
                          ].export
                        }
                        onChange={() =>
                          onChange(
                            moduleName,
                            "export"
                          )
                        }
                      />
                    </td>

                  </tr>
                )
              )}
            </tbody>

          </table>

        </div>
      </div>
    );
  };

  /* ===================================================
     JSX
  =================================================== */

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
          background: ${GOLD};
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .roles-add-btn:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        .roles-card {
          width: 100%;
          overflow: hidden;
          border: 1px solid #dde2e8;
          border-radius: 5px;
          background: #fff;
          box-shadow: 0 1px 2px rgba(0,0,0,.03);
        }

        .roles-card-header {
          min-height: 72px;
          padding: 14px 20px;
          border-bottom: 1px solid #dde2e8;
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
          border: 1px solid #dce1e7;
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
          border-bottom: 1px solid #e2e5e9;
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
          border: 1px solid #dce1e7;
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
          border: 1px solid #dce1e7;
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
          border-collapse: collapse;
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
          border-bottom: 1px solid #dfe3e8;
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
          accent-color: ${GOLD};
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
          padding: 0 7px;
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

        .roles-action-btn:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

        .roles-table-footer {
          min-height: 57px;
          padding: 0 16px;
          border-top: 1px solid #dfe3e8;
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

        .roles-page-arrow:disabled {
          opacity: .4;
          cursor: not-allowed;
        }

        .roles-current-page {
          width: 27px;
          height: 27px;
          border-radius: 50%;
          background: ${GOLD};
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }

        .roles-loading {
          height: 120px;
          text-align: center;
          color: #637083;
          font-size: 13px;
        }

        .roles-empty {
          height: 120px;
          text-align: center;
          color: #7b8794;
          font-size: 13px;
        }

        .roles-empty td {
          height: 120px;
        }

        .roles-message {
          margin-bottom: 15px;
          padding: 11px 14px;
          border-radius: 5px;
          font-size: 13px;
        }

        .roles-success {
          border: 1px solid #b7e4c7;
          background: #eaf8ef;
          color: #18743a;
        }

        .roles-error {
          border: 1px solid #f2b8b5;
          background: #fff0ef;
          color: #b42318;
        }

        /* =================================================
           MODAL
        ================================================= */

        .roles-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          padding: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,.42);
        }

        .roles-form-modal {
          width: 700px;
          max-width: calc(100vw - 30px);
          max-height: calc(100vh - 30px);
          overflow-y: auto;
          border-radius: 5px;
          background: #fff;
          box-shadow: 0 15px 45px rgba(0,0,0,.2);
        }

        .roles-modal-header {
          height: 64px;
          padding: 0 16px;
          border-bottom: 1px solid #e5e7eb;
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
          padding: 18px 16px 8px;
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
          padding: 0 10px;
          border: 1px solid #d9dee7;
          border-radius: 5px;
          outline: none;
          background: #fff;
          color: #26344d;
          font-size: 14px;
          box-sizing: border-box;
        }

        .roles-form-group input:focus,
        .roles-form-group select:focus {
          border-color: ${GOLD};
        }

        /* =================================================
           PERMISSIONS
        ================================================= */

        .roles-permissions-wrapper {
          margin-top: 8px;
          margin-bottom: 8px;
          border: 1px solid #d9dee7;
          border-radius: 5px;
          overflow: hidden;
        }

        .roles-permissions-table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .roles-permissions-table {
          width: 100%;
          min-width: 650px;
          border-collapse: collapse;
          table-layout: fixed;
        }

        .roles-permissions-table thead {
          background: #e1e4e9;
        }

        .roles-permissions-table th {
          height: 38px;
          padding: 0 7px;
          color: #06142e;
          font-size: 11px;
          font-weight: 600;
          text-align: center;
          white-space: nowrap;
          border-bottom: 1px solid #d9dee7;
        }

        .roles-permissions-table th:first-child {
          width: 175px;
          text-align: left;
          padding-left: 12px;
        }

        .roles-permissions-table td {
          height: 39px;
          padding: 0 7px;
          color: #26344d;
          font-size: 11px;
          text-align: center;
          border-bottom: 1px solid #dfe3e8;
          background: #fff;
        }

        .roles-permissions-table tbody tr:last-child td {
          border-bottom: none;
        }

        .roles-permissions-table td:first-child {
          text-align: left;
          padding-left: 12px;
          color: #172b4d;
          font-size: 12px;
          font-weight: 400;
        }

        /*
          SMALL PERMISSION CHECKBOXES
        */

        .roles-permission-checkbox {
          width: 12px !important;
          height: 12px !important;
          min-width: 12px !important;
          min-height: 12px !important;
          max-width: 12px !important;
          max-height: 12px !important;
          margin: 0 !important;
          padding: 0 !important;
          accent-color: ${GOLD};
          cursor: pointer;
          vertical-align: middle;
          appearance: auto;
          box-sizing: border-box;
        }

        .roles-modal-footer {
          padding: 12px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          background: #fff;
        }

        .roles-modal-cancel,
        .roles-modal-save {
          height: 40px;
          padding: 0 16px;
          border: 0;
          border-radius: 5px;
          font-size: 14px;
          cursor: pointer;
        }

        .roles-modal-cancel {
          background: #f8f9fa;
          color: #172b4d;
          border: 1px solid #d9dee7;
        }

        .roles-modal-save {
          background: ${GOLD};
          color: #fff;
          font-weight: 600;
        }

        .roles-modal-save:disabled,
        .roles-modal-cancel:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        /* =================================================
           DELETE MODAL
        ================================================= */

        .roles-delete-modal {
          width: 400px;
          max-width: calc(100vw - 30px);
          padding: 17px 30px;
          border-radius: 5px;
          background: #fff;
          text-align: center;
          box-shadow: 0 15px 45px rgba(0,0,0,.2);
        }

        .roles-delete-icon {
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

        .roles-delete-modal h3 {
          margin: 0 0 6px;
          color: #1d2b48;
          font-size: 19px;
          font-weight: 600;
        }

        .roles-delete-modal p {
          max-width: 330px;
          margin: 0 auto 17px;
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
          padding: 0 16px;
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

        .roles-delete-confirm:disabled,
        .roles-delete-cancel:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        @media (max-width: 900px) {
          .roles-card-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .roles-filters {
            width: 100%;
            flex-wrap: wrap;
          }

          .roles-filter {
            flex: 1;
            min-width: 130px;
          }
        }

        @media (max-width: 600px) {
          .roles-page {
            padding: 15px;
          }

          .roles-page-header {
            gap: 15px;
            flex-direction: column;
          }

          .roles-add-btn {
            align-self: flex-end;
          }

          .roles-toolbar {
            align-items: flex-start;
            gap: 10px;
            flex-direction: column;
          }

          .roles-search {
            width: 100%;
          }

          .roles-form-modal {
            width: 100%;
          }
        }
        `}
      </style>

      <div className="roles-page">

        {/* =================================================
            HEADER
        ================================================= */}

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
            <CirclePlus size={15} />
            Add Roles
          </button>

        </div>

        {/* =================================================
            SUCCESS / ERROR
        ================================================= */}

        {success && (
          <div className="roles-message roles-success">
            {success}
          </div>
        )}

        {error && (
          <div className="roles-message roles-error">
            {error}
          </div>
        )}

        {/* =================================================
            CARD
        ================================================= */}

        <div className="roles-card">

          {/* CARD HEADER */}

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
                  08/28/2026 - 09/03/2026
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

                  setCurrentPage(
                    1
                  );
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

                  setCurrentPage(
                    1
                  );
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

                  setCurrentPage(
                    1
                  );
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

                setCurrentPage(
                  1
                );
              }}
            />

          </div>

          {/* TABLE */}

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
                      disabled={
                        loading ||
                        visibleRoles.length ===
                          0
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
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="roles-loading"
                    >
                      Loading roles...
                    </td>
                  </tr>
                ) : visibleRoles.length ===
                  0 ? (
                  <tr className="roles-empty">
                    <td colSpan={5}>
                      No roles found
                    </td>
                  </tr>
                ) : (
                  visibleRoles.map(
                    (role) => (
                      <tr
                        key={
                          role.id
                        }
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
                          {
                            role.name
                          }
                        </td>

                        <td>
                          {formatDate(
                            role.createdDate
                          )}
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

                            {/* PERMISSIONS */}
                            <button
                              type="button"
                              className="roles-action-btn"
                              title="Permissions"
                              onClick={() =>
                                openEditModal(
                                  role
                                )
                              }
                              disabled={
                                saving ||
                                deleting
                              }
                            >
                              <Shield
                                size={15}
                              />
                            </button>

                            {/* EDIT */}
                            <button
                              type="button"
                              className="roles-action-btn"
                              title="Edit"
                              onClick={() =>
                                openEditModal(
                                  role
                                )
                              }
                              disabled={
                                saving ||
                                deleting
                              }
                            >
                              <Pencil
                                size={15}
                              />
                            </button>

                            {/* DELETE */}
                            <button
                              type="button"
                              className="roles-action-btn"
                              title="Delete"
                              onClick={() =>
                                openDeleteModal(
                                  role
                                )
                              }
                              disabled={
                                saving ||
                                deleting
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
                  )
                )}

              </tbody>

            </table>

          </div>

          {/* FOOTER */}

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
              )}

              {" "}of{" "}

              {
                filteredRoles.length
              }

              {" "}entries

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

      {/* =================================================
          ADD ROLE MODAL
      ================================================= */}

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
                disabled={
                  saving
                }
              >
                ×
              </button>

            </div>

            <div className="roles-modal-body">

              {/* ROLE NAME */}

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
                  placeholder="Enter role name"
                />

              </div>

              {/* STATUS */}

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

              {/* MODULE PERMISSIONS */}

              <div className="roles-form-group">

                <label>
                  Module Permissions
                </label>

                {renderPermissionTable(
                  addPermissions,
                  handleAddPermissionChange
                )}

              </div>

            </div>

            {/* MODAL FOOTER */}

            <div className="roles-modal-footer">

              <button
                type="button"
                className="roles-modal-cancel"
                onClick={
                  closeAddModal
                }
                disabled={
                  saving
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
                disabled={
                  saving
                }
              >
                {saving
                  ? "Adding..."
                  : "Add Role"}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =================================================
          EDIT ROLE MODAL
          SAME STRUCTURE AS ADD ROLE
      ================================================= */}

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
                  disabled={
                    saving
                  }
                >
                  ×
                </button>

              </div>

              <div className="roles-modal-body">

                {/* ROLE NAME */}

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
                    placeholder="Enter role name"
                  />

                </div>

                {/* STATUS */}

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

                {/* MODULE PERMISSIONS */}

                <div className="roles-form-group">

                  <label>
                    Module Permissions
                  </label>

                  {renderPermissionTable(
                    editPermissions,
                    handleEditPermissionChange
                  )}

                </div>

              </div>

              {/* MODAL FOOTER */}

              <div className="roles-modal-footer">

                <button
                  type="button"
                  className="roles-modal-cancel"
                  onClick={
                    closeEditModal
                  }
                  disabled={
                    saving
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
                  disabled={
                    saving
                  }
                >
                  {saving
                    ? "Saving..."
                    : "Save"}
                </button>

              </div>

            </div>

          </div>
        )}

      {/* =================================================
          DELETE MODAL
      ================================================= */}

      {showDeleteModal &&
        selectedRole && (
          <div className="roles-modal-overlay">

            <div className="roles-delete-modal">

              <div className="roles-delete-icon">

                <Trash2
                  size={31}
                  strokeWidth={2.2}
                />

              </div>

              <h3>
                Confirm Delete
              </h3>

              <p>
                You want to delete
                <strong>
                  {" "}
                  {selectedRole.name}
                </strong>
                . This can't be
                undone once you
                delete.
              </p>

              <div className="roles-delete-actions">

                <button
                  type="button"
                  className="roles-delete-cancel"
                  onClick={
                    closeDeleteModal
                  }
                  disabled={
                    deleting
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
                  disabled={
                    deleting
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

export default Roles;

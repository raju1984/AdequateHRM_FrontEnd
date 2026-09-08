import React, { useEffect, useMemo, useState } from "react";
import {
  PlusCircle,
  Shield,
  Pencil,
  Trash2,
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  House,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  addRole,
  getRoles,
  updateRole,
  deleteRole,
} from "../../services/hrservices";

/* ============================================================
   TYPES
============================================================ */

interface RoleType {
  id: string | number;
  role: string;
  createdDate: string;
  status: "Active" | "Inactive";
}

/* ============================================================
   CONSTANTS
============================================================ */

const goldColor = "#c49332";
const textDark = "#1f2a44";
const textMuted = "#667085";
const borderColor = "#e2e6eb";

/* ============================================================
   FORMAT DATE
============================================================ */

const formatRoleDate = (value: any): string => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* ============================================================
   NORMALIZE GET ROLES RESPONSE
============================================================ */

const normalizeRolesResponse = (response: any): RoleType[] => {
  const candidates = [
    response?.data?.items,
    response?.data?.roles,
    response?.data?.records,

    response?.items,
    response?.roles,
    response?.records,

    response?.data,
  ];

  const rawRoles =
    candidates.find((value) => Array.isArray(value)) || [];

  return rawRoles.map((item: any, index: number) => ({
    id:
      item?.id ??
      item?.roleId ??
      item?.RoleId ??
      item?.Id ??
      index + 1,

    role:
      item?.roleName ??
      item?.RoleName ??
      item?.role ??
      item?.Role ??
      "",

    createdDate: formatRoleDate(
      item?.createdDate ??
        item?.CreatedDate ??
        item?.createdOn ??
        item?.CreatedOn
    ),

    status:
      item?.isActive === false ||
      item?.IsActive === false ||
      item?.status === "Inactive" ||
      item?.Status === "Inactive"
        ? "Inactive"
        : "Active",
  }));
};

/* ============================================================
   ROLES COMPONENT
============================================================ */

const Roles: React.FC = () => {
  /* ============================================================
     TABLE STATES
  ============================================================ */

  const [rolesData, setRolesData] = useState<RoleType[]>([]);

  const [search, setSearch] = useState("");

  const [selectedRows, setSelectedRows] = useState<
    Array<string | number>
  >([]);

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [currentPage, setCurrentPage] = useState(1);

  const [statusFilter, setStatusFilter] = useState("Status");

  const [sortBy, setSortBy] = useState(
    "Sort By : Last 7 Days"
  );

  /* ============================================================
     LOADING / ERROR STATES
  ============================================================ */

  const [loadingRoles, setLoadingRoles] = useState(false);

  const [addRoleLoading, setAddRoleLoading] =
    useState(false);

  const [editRoleLoading, setEditRoleLoading] =
    useState(false);

  const [deleteRoleLoading, setDeleteRoleLoading] =
    useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  /* ============================================================
     ADD MODAL
  ============================================================ */

  const [showAddModal, setShowAddModal] =
    useState(false);

  const [newRoleName, setNewRoleName] =
    useState("");

  const [newRoleStatus, setNewRoleStatus] =
    useState<"Active" | "Inactive">("Active");

  /* ============================================================
     EDIT MODAL
  ============================================================ */

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [editingRole, setEditingRole] =
    useState<RoleType | null>(null);

  const [editRoleName, setEditRoleName] =
    useState("");

  const [editRoleStatus, setEditRoleStatus] =
    useState<"Active" | "Inactive">("Active");

  /* ============================================================
     DELETE MODAL
  ============================================================ */

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [deleteRoleData, setDeleteRoleData] =
    useState<RoleType | null>(null);

  /* ============================================================
     GET ROLES
  ============================================================ */

  const fetchRoles = async () => {
    try {
      setLoadingRoles(true);
      setErrorMessage("");

      const response = await getRoles({
        Search: search.trim() || undefined,

        IsActive:
          statusFilter === "Active"
            ? true
            : statusFilter === "Inactive"
            ? false
            : undefined,

        PageNumber: 1,

        PageSize: 1000,
      });

      console.log("GET ROLES RESPONSE:", response);

      const apiRoles =
        normalizeRolesResponse(response);

      setRolesData(apiRoles);

      setSelectedRows([]);
    } catch (error: any) {
      console.error(
        "Get roles API error:",
        error
      );

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.title ||
        error?.response?.data?.error ||
        "Failed to load roles.";

      setErrorMessage(message);

      setRolesData([]);
    } finally {
      setLoadingRoles(false);
    }
  };

  /* ============================================================
     INITIAL / SEARCH / STATUS API CALL
  ============================================================ */

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchRoles();
    }, 350);

    return () =>
      window.clearTimeout(timer);
  }, [search, statusFilter]);

  /* ============================================================
     SORT
  ============================================================ */

  const filteredData = useMemo(() => {
    let result = [...rolesData];

    if (sortBy === "Ascending") {
      result.sort((a, b) =>
        a.role.localeCompare(b.role)
      );
    }

    if (sortBy === "Descending") {
      result.sort((a, b) =>
        b.role.localeCompare(a.role)
      );
    }

    if (sortBy === "Recently Added") {
      result = [...result].sort((a, b) => {
        const aTime = new Date(
          a.createdDate
        ).getTime();

        const bTime = new Date(
          b.createdDate
        ).getTime();

        if (
          Number.isNaN(aTime) ||
          Number.isNaN(bTime)
        ) {
          return 0;
        }

        return bTime - aTime;
      });
    }

    return result;
  }, [rolesData, sortBy]);

  /* ============================================================
     RESET PAGE
  ============================================================ */

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    rowsPerPage,
    statusFilter,
    sortBy,
  ]);

  /* ============================================================
     PAGINATION
  ============================================================ */

  const visibleData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredData.length / rowsPerPage
    )
  );

  /* ============================================================
     SELECT ALL
  ============================================================ */

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

  /* ============================================================
     SELECT SINGLE ROW
  ============================================================ */

  const handleSelectRow = (
    id: string | number
  ) => {
    setSelectedRows((prev) =>
      prev.includes(id)
        ? prev.filter(
            (item) => item !== id
          )
        : [...prev, id]
    );
  };

  const isAllSelected =
    visibleData.length > 0 &&
    visibleData.every((item) =>
      selectedRows.includes(item.id)
    );

  /* ============================================================
     ADD ROLE
  ============================================================ */

  const handleAddRole = async () => {
    if (!newRoleName.trim()) {
      setErrorMessage(
        "Please enter a role name."
      );
      return;
    }

    try {
      setAddRoleLoading(true);
      setErrorMessage("");

      console.log("ADD ROLE DATA:", {
        roleName: newRoleName.trim(),
        isActive:
          newRoleStatus === "Active",
      });

      await addRole({
        roleName: newRoleName.trim(),

        isActive:
          newRoleStatus === "Active",
      });

      setNewRoleName("");

      setNewRoleStatus("Active");

      setShowAddModal(false);

      await fetchRoles();
    } catch (error: any) {
      console.error(
        "Add role API error:",
        error
      );

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.title ||
        error?.response?.data?.error ||
        "Failed to add role.";

      setErrorMessage(message);
    } finally {
      setAddRoleLoading(false);
    }
  };

  /* ============================================================
     OPEN EDIT MODAL
  ============================================================ */

  const openEditModal = (
    role: RoleType
  ) => {
    setEditingRole(role);

    setEditRoleName(role.role);

    setEditRoleStatus(role.status);

    setErrorMessage("");

    setShowEditModal(true);
  };

  /* ============================================================
     CLOSE EDIT MODAL
  ============================================================ */

  const closeEditModal = () => {
    if (editRoleLoading) return;

    setEditingRole(null);

    setEditRoleName("");

    setEditRoleStatus("Active");

    setShowEditModal(false);
  };

  /* ============================================================
     SAVE EDIT ROLE - API
  ============================================================ */

  const handleSaveEdit = async () => {
    if (!editingRole) {
      return;
    }

    if (!editRoleName.trim()) {
      setErrorMessage(
        "Please enter a role name."
      );
      return;
    }

    try {
      setEditRoleLoading(true);
      setErrorMessage("");

      const payload = {
        id: editingRole.id,

        roleName: editRoleName.trim(),

        isActive:
          editRoleStatus === "Active",
      };

      console.log(
        "UPDATE ROLE DATA:",
        payload
      );

      const response =
        await updateRole(payload);

      console.log(
        "UPDATE ROLE RESPONSE:",
        response
      );

      setShowEditModal(false);

      setEditingRole(null);

      setEditRoleName("");

      setEditRoleStatus("Active");

      /*
       * Reload data from backend
       * so table always shows latest data.
       */
      await fetchRoles();
    } catch (error: any) {
      console.error(
        "Update role API error:",
        error
      );

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.title ||
        error?.response?.data?.error ||
        "Failed to update role.";

      setErrorMessage(message);
    } finally {
      setEditRoleLoading(false);
    }
  };

  /* ============================================================
     OPEN DELETE MODAL
  ============================================================ */

  const openDeleteModal = (
    role: RoleType
  ) => {
    setDeleteRoleData(role);

    setErrorMessage("");

    setShowDeleteModal(true);
  };

  /* ============================================================
     CLOSE DELETE MODAL
  ============================================================ */

  const closeDeleteModal = () => {
    if (deleteRoleLoading) return;

    setDeleteRoleData(null);

    setShowDeleteModal(false);
  };

  /* ============================================================
     DELETE ROLE - API
  ============================================================ */

  const handleDeleteRole = async () => {
    if (!deleteRoleData) {
      return;
    }

    try {
      setDeleteRoleLoading(true);
      setErrorMessage("");

      console.log(
        "DELETE ROLE ID:",
        deleteRoleData.id
      );

      const response =
        await deleteRole(
          deleteRoleData.id
        );

      console.log(
        "DELETE ROLE RESPONSE:",
        response
      );

      setSelectedRows((prev) =>
        prev.filter(
          (id) =>
            id !== deleteRoleData.id
        )
      );

      setShowDeleteModal(false);

      setDeleteRoleData(null);

      /*
       * Reload from backend after delete.
       */
      await fetchRoles();
    } catch (error: any) {
      console.error(
        "Delete role API error:",
        error
      );

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.title ||
        error?.response?.data?.error ||
        "Failed to delete role.";

      setErrorMessage(message);
    } finally {
      setDeleteRoleLoading(false);
    }
  };

  /* ============================================================
     STYLES
  ============================================================ */

  const checkboxStyle: React.CSSProperties = {
    width: 18,
    height: 18,
    cursor: "pointer",
    accentColor: goldColor,
  };

  const actionButtonStyle: React.CSSProperties = {
    border: "none",
    background: "transparent",
    padding: 0,
    color: "#52657b",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    background: "rgba(0, 0, 0, 0.44)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  };

  /* ============================================================
     RETURN
  ============================================================ */

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f7f8fa",
        padding: "24px",
        fontFamily:
          "'Inter', 'Nunito Sans', 'Segoe UI', Arial, sans-serif",
        color: textDark,
      }}
    >
      {/* ========================================================
          PAGE HEADER
      ======================================================== */}

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 25,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 24,
              lineHeight: "30px",
              fontWeight: 700,
              color: "#14213d",
            }}
          >
            Roles
          </h1>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: 8,
              gap: 8,
              fontSize: 12,
            }}
          >
            <Link
              to="/Hr/HrDashboard"
              style={{
                display: "inline-flex",
                alignItems: "center",
                color: "#50647d",
                textDecoration: "none",
              }}
            >
              <House
                size={12}
                strokeWidth={1.7}
              />
            </Link>

            <span
              style={{
                color: "#b7bec8",
              }}
            >
              /
            </span>

            <span
              style={{
                color: "#1d2b43",
                fontWeight: 500,
              }}
            >
              Roles
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            setShowAddModal(true)
          }
          style={{
            height: 39,
            minWidth: 115,
            border: "none",
            borderRadius: 6,
            backgroundColor: goldColor,
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            padding: "0 15px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            cursor: "pointer",
          }}
        >
          <PlusCircle size={14} />
          Add Roles
        </button>
      </div>

      {/* ========================================================
          ERROR MESSAGE
      ======================================================== */}

      {errorMessage &&
        !showAddModal &&
        !showEditModal &&
        !showDeleteModal && (
          <div
            style={{
              marginBottom: 14,
              padding: "10px 12px",
              border:
                "1px solid #f5c2c0",
              borderRadius: 6,
              background: "#fff5f5",
              color: "#b42318",
              fontSize: 13,
            }}
          >
            {errorMessage}
          </div>
        )}

      {/* ========================================================
          CARD
      ======================================================== */}

      <div
        style={{
          width: "100%",
          backgroundColor: "#fff",
          border: `1px solid ${borderColor}`,
          borderRadius: 6,
          overflow: "hidden",
          boxShadow:
            "0 1px 2px rgba(16,24,40,.03)",
        }}
      >
        {/* ======================================================
            HEADER FILTERS
        ====================================================== */}

        <div
          style={{
            minHeight: 71,
            padding:
              "16px 16px 16px 20px",
            borderBottom:
              `1px solid ${borderColor}`,
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            gap: 20,
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "#14213d",
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            Roles List
          </h2>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 15,
            }}
          >
            {/* DATE */}

            <button
              type="button"
              style={{
                width: 195,
                height: 38,
                background: "#fff",
                border:
                  `1px solid ${borderColor}`,
                borderRadius: 6,
                color: "#16243d",
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
                padding: "0 10px",
                cursor: "pointer",
              }}
            >
              <span>
                08/27/2026 - 09/02/20
              </span>

              <ChevronDown
                size={15}
                color="#91a0b3"
              />
            </button>

            {/* STATUS */}

            <div
              style={{
                position: "relative",
                width: 90,
                height: 38,
              }}
            >
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
                style={{
                  width: "100%",
                  height: "100%",
                  background: "#fff",
                  border:
                    `1px solid ${borderColor}`,
                  borderRadius: 6,
                  color: "#15223a",
                  fontSize: 13,
                  outline: "none",
                  padding:
                    "0 31px 0 14px",
                  cursor: "pointer",
                  appearance: "none",
                }}
              >
                <option>Status</option>
                <option>Active</option>
                <option>
                  Inactive
                </option>
              </select>

              <ChevronDown
                size={15}
                color="#10213d"
                style={{
                  pointerEvents:
                    "none",
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform:
                    "translateY(-50%)",
                }}
              />
            </div>

            {/* SORT */}

            <div
              style={{
                position: "relative",
                width: 178,
                height: 38,
              }}
            >
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value
                  )
                }
                style={{
                  width: "100%",
                  height: "100%",
                  background: "#fff",
                  border:
                    `1px solid ${borderColor}`,
                  borderRadius: 6,
                  color: "#15223a",
                  fontSize: 13,
                  outline: "none",
                  padding:
                    "0 32px 0 13px",
                  appearance: "none",
                  cursor: "pointer",
                }}
              >
                <option>
                  Sort By : Last 7 Days
                </option>

                <option>
                  Recently Added
                </option>

                <option>
                  Ascending
                </option>

                <option>
                  Descending
                </option>

                <option>
                  Last Month
                </option>
              </select>

              <ChevronDown
                size={15}
                color="#10213d"
                style={{
                  pointerEvents:
                    "none",
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform:
                    "translateY(-50%)",
                }}
              />
            </div>
          </div>
        </div>

        {/* ======================================================
            SEARCH
        ====================================================== */}

        <div
          style={{
            height: 60,
            padding: "0 16px",
            borderBottom:
              `1px solid ${borderColor}`,
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              fontSize: 13,
              color: "#35445c",
            }}
          >
            <span>
              Row Per Page
            </span>

            <div
              style={{
                position: "relative",
                width: 49,
                height: 28,
              }}
            >
              <select
                value={rowsPerPage}
                onChange={(e) =>
                  setRowsPerPage(
                    Number(
                      e.target.value
                    )
                  )
                }
                style={{
                  width: "100%",
                  height: "100%",
                  border:
                    `1px solid ${borderColor}`,
                  borderRadius: 6,
                  outline: "none",
                  background: "#fff",
                  color: "#27364d",
                  fontSize: 13,
                  padding:
                    "0 20px 0 9px",
                  appearance: "none",
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

              <ChevronDown
                size={13}
                color="#637083"
                style={{
                  position:
                    "absolute",
                  right: 6,
                  top: "50%",
                  transform:
                    "translateY(-50%)",
                  pointerEvents:
                    "none",
                }}
              />
            </div>

            <span>
              Entries
            </span>
          </div>

          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                fetchRoles();
              }
            }}
            style={{
              width: 160,
              height: 30,
              padding: "0 11px",
              border:
                `1px solid ${borderColor}`,
              borderRadius: 5,
              outline: "none",
              fontSize: 12,
            }}
          />
        </div>

        {/* ======================================================
            TABLE
        ====================================================== */}

        <div
          style={{
            width: "100%",
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              minWidth: 950,
              borderCollapse:
                "collapse",
              tableLayout: "fixed",
              fontSize: 13,
            }}
          >
            <colgroup>
              <col
                style={{
                  width: "10%",
                }}
              />

              <col
                style={{
                  width: "30%",
                }}
              />

              <col
                style={{
                  width: "21%",
                }}
              />

              <col
                style={{
                  width: "18%",
                }}
              />

              <col
                style={{
                  width: "21%",
                }}
              />
            </colgroup>

            <thead>
              <tr
                style={{
                  height: 43,
                  background:
                    "#e9ebef",
                }}
              >
                <th
                  style={{
                    paddingLeft: 20,
                    textAlign: "left",
                    borderBottom:
                      `1px solid ${borderColor}`,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={
                      isAllSelected
                    }
                    onChange={
                      handleSelectAll
                    }
                    style={
                      checkboxStyle
                    }
                  />
                </th>

                <TableHeader
                  title="Role"
                />

                <TableHeader
                  title="Created Date"
                />

                <TableHeader
                  title="Status"
                />

                <th
                  style={{
                    borderBottom:
                      `1px solid ${borderColor}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "flex-end",
                      paddingRight: 5,
                    }}
                  >
                    <ArrowUpDown
                      size={13}
                      color="#d0d5dd"
                    />
                  </div>
                </th>
              </tr>
            </thead>

            <tbody>
              {/* LOADING */}

              {loadingRoles && (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      height: 100,
                      textAlign:
                        "center",
                      color: textMuted,
                    }}
                  >
                    Loading roles...
                  </td>
                </tr>
              )}

              {/* ERROR */}

              {!loadingRoles &&
                errorMessage &&
                rolesData.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        height: 100,
                        textAlign:
                          "center",
                        color: "#d92d20",
                      }}
                    >
                      {errorMessage}
                    </td>
                  </tr>
                )}

              {/* DATA */}

              {!loadingRoles &&
                !(
                  errorMessage &&
                  rolesData.length === 0
                ) &&
                visibleData.map(
                  (item) => (
                    <tr
                      key={item.id}
                      style={{
                        height: 47,
                        background:
                          "#fff",
                      }}
                    >
                      <td
                        style={{
                          paddingLeft: 20,
                          borderBottom:
                            `1px solid ${borderColor}`,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(
                            item.id
                          )}
                          onChange={() =>
                            handleSelectRow(
                              item.id
                            )
                          }
                          style={
                            checkboxStyle
                          }
                        />
                      </td>

                      <td
                        style={{
                          color:
                            "#687287",
                          borderBottom:
                            `1px solid ${borderColor}`,
                        }}
                      >
                        {item.role}
                      </td>

                      <td
                        style={{
                          color:
                            "#687287",
                          borderBottom:
                            `1px solid ${borderColor}`,
                        }}
                      >
                        {
                          item.createdDate
                        }
                      </td>

                      <td
                        style={{
                          borderBottom:
                            `1px solid ${borderColor}`,
                        }}
                      >
                        <StatusBadge
                          status={
                            item.status
                          }
                        />
                      </td>

                      <td
                        style={{
                          borderBottom:
                            `1px solid ${borderColor}`,
                        }}
                      >
                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: 20,
                          }}
                        >
                          {/* PERMISSIONS */}

                          <button
                            type="button"
                            title="Permissions"
                            style={
                              actionButtonStyle
                            }
                          >
                            <Shield
                              size={15}
                              strokeWidth={
                                1.6
                              }
                            />
                          </button>

                          {/* EDIT */}

                          <button
                            type="button"
                            title="Edit"
                            style={{
                              ...actionButtonStyle,
                              opacity:
                                editRoleLoading ||
                                deleteRoleLoading
                                  ? 0.5
                                  : 1,
                              cursor:
                                editRoleLoading ||
                                deleteRoleLoading
                                  ? "not-allowed"
                                  : "pointer",
                            }}
                            disabled={
                              editRoleLoading ||
                              deleteRoleLoading
                            }
                            onClick={() =>
                              openEditModal(
                                item
                              )
                            }
                          >
                            <Pencil
                              size={15}
                              strokeWidth={
                                1.6
                              }
                            />
                          </button>

                          {/* DELETE */}

                          <button
                            type="button"
                            title="Delete"
                            style={{
                              ...actionButtonStyle,
                              opacity:
                                editRoleLoading ||
                                deleteRoleLoading
                                  ? 0.5
                                  : 1,
                              cursor:
                                editRoleLoading ||
                                deleteRoleLoading
                                  ? "not-allowed"
                                  : "pointer",
                            }}
                            disabled={
                              editRoleLoading ||
                              deleteRoleLoading
                            }
                            onClick={() =>
                              openDeleteModal(
                                item
                              )
                            }
                          >
                            <Trash2
                              size={15}
                              strokeWidth={
                                1.6
                              }
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}

              {/* NO DATA */}

              {!loadingRoles &&
                !errorMessage &&
                visibleData.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        height: 100,
                        textAlign:
                          "center",
                        color: textMuted,
                      }}
                    >
                      No roles found
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>

        {/* ======================================================
            FOOTER
        ====================================================== */}

        <div
          style={{
            height: 57,
            padding: "0 17px",
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
          }}
        >
          <span
            style={{
              color: "#5b687c",
              fontSize: 13,
            }}
          >
            {filteredData.length === 0
              ? "Showing 0 - 0 of 0 entries"
              : `Showing ${
                  (currentPage - 1) *
                    rowsPerPage +
                  1
                } - ${Math.min(
                  currentPage *
                    rowsPerPage,
                  filteredData.length
                )} of ${
                  filteredData.length
                } entries`}
          </span>

          <div
            style={{
              display: "flex",
              alignItems:
                "center",
              gap: 14,
            }}
          >
            <button
              type="button"
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
              style={{
                border: "none",
                background:
                  "transparent",
                padding: 0,
                display: "flex",
                cursor:
                  currentPage === 1
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  currentPage === 1
                    ? 0.45
                    : 1,
              }}
            >
              <ChevronLeft
                size={14}
                color="#a3adb9"
              />
            </button>

            <div
              style={{
                width: 26,
                height: 26,
                borderRadius:
                  "50%",
                background:
                  goldColor,
                color: "#fff",
                fontSize: 12,
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
              }}
            >
              {currentPage}
            </div>

            <button
              type="button"
              disabled={
                currentPage >=
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
              style={{
                border: "none",
                background:
                  "transparent",
                padding: 0,
                display: "flex",
                cursor:
                  currentPage >=
                  totalPages
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  currentPage >=
                  totalPages
                    ? 0.45
                    : 1,
              }}
            >
              <ChevronRight
                size={14}
                color="#a3adb9"
              />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          ADD ROLE MODAL
      ======================================================== */}

      {showAddModal && (
        <div
          style={overlayStyle}
          onClick={() =>
            !addRoleLoading &&
            setShowAddModal(false)
          }
        >
          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            style={{
              width: "100%",
              maxWidth: 500,
              background: "#fff",
              borderRadius: 6,
              boxShadow:
                "0 20px 45px rgba(15,23,42,.18)",
            }}
          >
            <ModalHeader
              title="Add Role"
              onClose={() =>
                !addRoleLoading &&
                setShowAddModal(false)
              }
            />

            <div
              style={{
                padding: "18px 17px",
              }}
            >
              <FormLabel>
                Role Name
              </FormLabel>

              <input
                value={newRoleName}
                onChange={(e) =>
                  setNewRoleName(
                    e.target.value
                  )
                }
                placeholder="Enter role name"
                style={inputStyle}
              />

              <div
                style={{
                  height: 18,
                }}
              />

              <FormLabel>
                Status
              </FormLabel>

              <div
                style={{
                  position:
                    "relative",
                }}
              >
                <select
                  value={newRoleStatus}
                  onChange={(e) =>
                    setNewRoleStatus(
                      e.target
                        .value as
                        | "Active"
                        | "Inactive"
                    )
                  }
                  style={{
                    ...inputStyle,
                    appearance:
                      "none",
                    cursor:
                      "pointer",
                    paddingRight: 38,
                  }}
                >
                  <option value="Active">
                    Active
                  </option>

                  <option value="Inactive">
                    Inactive
                  </option>
                </select>

                <ChevronDown
                  size={15}
                  color="#667085"
                  style={
                    selectArrowStyle
                  }
                />
              </div>

              {errorMessage && (
                <div
                  style={{
                    marginTop: 12,
                    color:
                      "#b42318",
                    fontSize: 13,
                  }}
                >
                  {errorMessage}
                </div>
              )}
            </div>

            <ModalFooter
              onCancel={() =>
                setShowAddModal(false)
              }
              onSave={handleAddRole}
              saving={addRoleLoading}
            />
          </div>
        </div>
      )}

      {/* ========================================================
          EDIT ROLE MODAL
      ======================================================== */}

      {showEditModal && (
        <div
          style={overlayStyle}
          onClick={closeEditModal}
        >
          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            style={{
              width: "100%",
              maxWidth: 500,
              backgroundColor:
                "#ffffff",
              borderRadius: 6,
              overflow: "hidden",
              boxShadow:
                "0 20px 50px rgba(15,23,42,.22)",
            }}
          >
            {/* HEADER */}

            <div
              style={{
                height: 64,
                padding: "0 17px",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "space-between",
                borderBottom:
                  `1px solid ${borderColor}`,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 20,
                  color: "#202c47",
                  fontWeight: 600,
                }}
              >
                Edit Role
              </h2>

              <button
                type="button"
                onClick={
                  closeEditModal
                }
                disabled={
                  editRoleLoading
                }
                style={{
                  width: 20,
                  height: 20,
                  border: "none",
                  borderRadius:
                    "50%",
                  background:
                    "#707784",
                  color: "#fff",
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  padding: 0,
                  cursor:
                    editRoleLoading
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    editRoleLoading
                      ? 0.5
                      : 1,
                }}
              >
                <X
                  size={13}
                  strokeWidth={3}
                />
              </button>
            </div>

            {/* BODY */}

            <div
              style={{
                padding: "17px",
              }}
            >
              <FormLabel>
                Role Name
              </FormLabel>

              <input
                type="text"
                value={editRoleName}
                onChange={(e) =>
                  setEditRoleName(
                    e.target.value
                  )
                }
                style={inputStyle}
                disabled={
                  editRoleLoading
                }
              />

              <div
                style={{
                  height: 18,
                }}
              />

              <FormLabel>
                Status
              </FormLabel>

              <div
                style={{
                  position:
                    "relative",
                }}
              >
                <select
                  value={editRoleStatus}
                  onChange={(e) =>
                    setEditRoleStatus(
                      e.target
                        .value as
                        | "Active"
                        | "Inactive"
                    )
                  }
                  disabled={
                    editRoleLoading
                  }
                  style={{
                    ...inputStyle,
                    appearance:
                      "none",
                    cursor:
                      editRoleLoading
                        ? "not-allowed"
                        : "pointer",
                    paddingRight: 38,
                  }}
                >
                  <option value="Active">
                    Active
                  </option>

                  <option value="Inactive">
                    Inactive
                  </option>
                </select>

                <ChevronDown
                  size={16}
                  color="#566173"
                  style={
                    selectArrowStyle
                  }
                />
              </div>

              {errorMessage && (
                <div
                  style={{
                    marginTop: 12,
                    color:
                      "#b42318",
                    fontSize: 13,
                  }}
                >
                  {errorMessage}
                </div>
              )}
            </div>

            {/* FOOTER */}

            <div
              style={{
                minHeight: 63,
                padding:
                  "12px 13px",
                borderTop:
                  `1px solid ${borderColor}`,
                display: "flex",
                justifyContent:
                  "flex-end",
                alignItems:
                  "center",
                gap: 8,
              }}
            >
              <button
                type="button"
                onClick={
                  closeEditModal
                }
                disabled={
                  editRoleLoading
                }
                style={{
                  height: 38,
                  minWidth: 73,
                  padding:
                    "0 15px",
                  border: "none",
                  borderRadius: 5,
                  background:
                    "#f6f7f9",
                  color:
                    "#111827",
                  fontSize: 14,
                  cursor:
                    editRoleLoading
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    editRoleLoading
                      ? 0.6
                      : 1,
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleSaveEdit
                }
                disabled={
                  editRoleLoading
                }
                style={{
                  height: 38,
                  minWidth: 60,
                  padding:
                    "0 15px",
                  border: "none",
                  borderRadius: 5,
                  background:
                    goldColor,
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor:
                    editRoleLoading
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    editRoleLoading
                      ? 0.7
                      : 1,
                }}
              >
                {editRoleLoading
                  ? "Saving..."
                  : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          DELETE CONFIRMATION MODAL
      ======================================================== */}

      {showDeleteModal && (
        <div
          style={overlayStyle}
          onClick={
            closeDeleteModal
          }
        >
          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            style={{
              width: "100%",
              maxWidth: 400,
              minHeight: 230,
              backgroundColor:
                "#ffffff",
              borderRadius: 5,
              padding:
                "16px 20px",
              boxSizing:
                "border-box",
              boxShadow:
                "0 20px 50px rgba(15,23,42,.20)",
              display: "flex",
              flexDirection:
                "column",
              alignItems:
                "center",
            }}
          >
            {/* RED TRASH BOX */}

            <div
              style={{
                width: 58,
                height: 59,
                marginTop: 0,
                borderRadius: 4,
                background:
                  "#f7cccc",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
              }}
            >
              <Trash2
                size={29}
                strokeWidth={2.6}
                color="#ef1010"
              />
            </div>

            {/* HEADING */}

            <h2
              style={{
                margin:
                  "14px 0 4px",
                fontSize: 19,
                lineHeight:
                  "24px",
                fontWeight: 600,
                color:
                  "#202c47",
              }}
            >
              Confirm Delete
            </h2>

            {/* TEXT */}

            <p
              style={{
                margin: 0,
                maxWidth: 320,
                textAlign:
                  "center",
                color:
                  "#333333",
                fontSize: 14,
                lineHeight:
                  "22px",
                fontWeight: 400,
              }}
            >
              You want to delete
              this role, this
              can't be
              <br />
              undone once you
              delete.
            </p>

            {errorMessage && (
              <div
                style={{
                  marginTop: 10,
                  color:
                    "#b42318",
                  fontSize: 13,
                  textAlign:
                    "center",
                }}
              >
                {errorMessage}
              </div>
            )}

            {/* BUTTONS */}

            <div
              style={{
                display: "flex",
                alignItems:
                  "center",
                gap: 15,
                marginTop: 15,
              }}
            >
              <button
                type="button"
                onClick={
                  closeDeleteModal
                }
                disabled={
                  deleteRoleLoading
                }
                style={{
                  height: 39,
                  minWidth: 73,
                  border: "none",
                  borderRadius: 5,
                  background:
                    "#f6f7f9",
                  color:
                    "#111827",
                  fontSize: 14,
                  cursor:
                    deleteRoleLoading
                      ? "not-allowed"
                      : "pointer",
                  padding:
                    "0 15px",
                  opacity:
                    deleteRoleLoading
                      ? 0.6
                      : 1,
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleDeleteRole
                }
                disabled={
                  deleteRoleLoading
                }
                style={{
                  height: 39,
                  minWidth: 99,
                  border: "none",
                  borderRadius: 5,
                  background:
                    "#ef1111",
                  color:
                    "#ffffff",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor:
                    deleteRoleLoading
                      ? "not-allowed"
                      : "pointer",
                  padding:
                    "0 15px",
                  opacity:
                    deleteRoleLoading
                      ? 0.7
                      : 1,
                }}
              >
                {deleteRoleLoading
                  ? "Deleting..."
                  : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================
   SMALL COMPONENTS
============================================================ */

interface TableHeaderProps {
  title: string;
}

const TableHeader: React.FC<
  TableHeaderProps
> = ({ title }) => {
  return (
    <th
      style={{
        height: 43,
        padding: 0,
        color: "#0e192e",
        fontSize: 13,
        fontWeight: 600,
        textAlign: "left",
        borderBottom:
          `1px solid ${borderColor}`,
        background:
          "#e9ebef",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems:
            "center",
          justifyContent:
            "space-between",
          paddingRight: 14,
        }}
      >
        <span>{title}</span>

        <ArrowUpDown
          size={13}
          strokeWidth={1.6}
          color="#d0d5dd"
        />
      </div>
    </th>
  );
};

/* ============================================================
   STATUS BADGE
============================================================ */

interface StatusBadgeProps {
  status:
    | "Active"
    | "Inactive";
}

const StatusBadge: React.FC<
  StatusBadgeProps
> = ({ status }) => {
  return (
    <span
      style={{
        minWidth:
          status === "Inactive"
            ? 65
            : 57,
        height: 19,
        padding: "0 8px",
        borderRadius: 4,
        backgroundColor:
          status === "Active"
            ? "#08c55c"
            : "#e80000",
        color: "#ffffff",
        display:
          "inline-flex",
        alignItems:
          "center",
        justifyContent:
          "center",
        gap: 5,
        fontSize: 10,
        fontWeight: 600,
      }}
    >
      <span
        style={{
          width: 4,
          height: 4,
          borderRadius:
            "50%",
          background:
            "#fff",
        }}
      />

      {status}
    </span>
  );
};

/* ============================================================
   MODAL HEADER
============================================================ */

interface ModalHeaderProps {
  title: string;
  onClose: () => void;
}

const ModalHeader: React.FC<
  ModalHeaderProps
> = ({
  title,
  onClose,
}) => {
  return (
    <div
      style={{
        height: 60,
        padding: "0 18px",
        borderBottom:
          `1px solid ${borderColor}`,
        display: "flex",
        alignItems:
          "center",
        justifyContent:
          "space-between",
      }}
    >
      <h2
        style={{
          margin: 0,
          fontSize: 19,
          fontWeight: 600,
          color: textDark,
        }}
      >
        {title}
      </h2>

      <button
        type="button"
        onClick={onClose}
        style={{
          width: 21,
          height: 21,
          borderRadius:
            "50%",
          border: "none",
          background:
            "#707784",
          color: "#fff",
          padding: 0,
          display: "flex",
          alignItems:
            "center",
          justifyContent:
            "center",
          cursor: "pointer",
        }}
      >
        <X
          size={13}
          strokeWidth={3}
        />
      </button>
    </div>
  );
};

/* ============================================================
   FORM LABEL
============================================================ */

const FormLabel: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <label
      style={{
        display: "block",
        marginBottom: 9,
        fontSize: 14,
        lineHeight:
          "18px",
        color:
          "#273550",
        fontWeight: 500,
      }}
    >
      {children}
    </label>
  );
};

/* ============================================================
   MODAL FOOTER
============================================================ */

interface ModalFooterProps {
  onCancel: () => void;
  onSave: () => void;
  saving?: boolean;
}

const ModalFooter: React.FC<
  ModalFooterProps
> = ({
  onCancel,
  onSave,
  saving = false,
}) => {
  return (
    <div
      style={{
        minHeight: 63,
        padding:
          "12px 13px",
        borderTop:
          `1px solid ${borderColor}`,
        display: "flex",
        justifyContent:
          "flex-end",
        alignItems:
          "center",
        gap: 8,
      }}
    >
      <button
        type="button"
        onClick={onCancel}
        disabled={saving}
        style={{
          height: 38,
          minWidth: 73,
          border: "none",
          borderRadius: 5,
          background:
            "#f6f7f9",
          color:
            "#111827",
          fontSize: 14,
          cursor: saving
            ? "not-allowed"
            : "pointer",
          opacity: saving
            ? 0.6
            : 1,
        }}
      >
        Cancel
      </button>

      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        style={{
          height: 38,
          minWidth: 60,
          border: "none",
          borderRadius: 5,
          background:
            goldColor,
          color:
            "#ffffff",
          fontSize: 14,
          fontWeight: 600,
          cursor: saving
            ? "not-allowed"
            : "pointer",
          opacity: saving
            ? 0.7
            : 1,
        }}
      >
        {saving
          ? "Saving..."
          : "Save"}
      </button>
    </div>
  );
};

/* ============================================================
   COMMON STYLES
============================================================ */

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 38,
  boxSizing:
    "border-box",
  padding: "0 10px",
  border:
    `1px solid ${borderColor}`,
  borderRadius: 5,
  outline: "none",
  background:
    "#ffffff",
  color:
    "#333b4f",
  fontSize: 14,
  fontFamily:
    "'Inter', 'Nunito Sans', 'Segoe UI', Arial, sans-serif",
};

const selectArrowStyle: React.CSSProperties = {
  pointerEvents:
    "none",
  position:
    "absolute",
  right: 10,
  top: "50%",
  transform:
    "translateY(-50%)",
};



export default Roles;
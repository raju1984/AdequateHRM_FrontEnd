import React, { useMemo, useState } from "react";
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

interface RoleType {
  id: number;
  role: string;
  createdDate: string;
  status: "Active" | "Inactive";
}

const initialRolesData: RoleType[] = [
  {
    id: 1,
    role: "Admin",
    createdDate: "12 Sep 2024",
    status: "Active",
  },
  {
    id: 2,
    role: "HR Manager",
    createdDate: "24 Oct 2024",
    status: "Active",
  },
  {
    id: 3,
    role: "Recruitment Manager",
    createdDate: "18 Feb 2024",
    status: "Active",
  },
  {
    id: 4,
    role: "Payroll Manager",
    createdDate: "17 Oct 2024",
    status: "Active",
  },
  {
    id: 5,
    role: "Leave Manager",
    createdDate: "20 Jul 2024",
    status: "Active",
  },
  {
    id: 6,
    role: "Performance Manager",
    createdDate: "10 Apr 2024",
    status: "Active",
  },
  {
    id: 7,
    role: "Reports Analyst",
    createdDate: "29 Aug 2024",
    status: "Active",
  },
  {
    id: 8,
    role: "Employee",
    createdDate: "22 Feb 2024",
    status: "Inactive",
  },
  {
    id: 9,
    role: "Client",
    createdDate: "03 Nov 2024",
    status: "Active",
  },
  {
    id: 10,
    role: "Department Head",
    createdDate: "17 Dec 2024",
    status: "Active",
  },
];

const goldColor = "#c49332";
const textDark = "#1f2a44";
const textMuted = "#667085";
const borderColor = "#e2e6eb";

const Roles: React.FC = () => {
  const [rolesData, setRolesData] =
    useState<RoleType[]>(initialRolesData);

  const [search, setSearch] = useState("");
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [statusFilter, setStatusFilter] = useState("Status");
  const [sortBy, setSortBy] = useState("Sort By : Last 7 Days");

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleStatus, setNewRoleStatus] =
    useState<"Active" | "Inactive">("Active");

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleType | null>(
    null
  );
  const [editRoleName, setEditRoleName] = useState("");
  const [editRoleStatus, setEditRoleStatus] =
    useState<"Active" | "Inactive">("Active");

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteRole, setDeleteRole] = useState<RoleType | null>(
    null
  );

  const filteredData = useMemo(() => {
    let result = rolesData.filter((item) =>
      item.role.toLowerCase().includes(search.toLowerCase().trim())
    );

    if (statusFilter === "Active") {
      result = result.filter((item) => item.status === "Active");
    }

    if (statusFilter === "Inactive") {
      result = result.filter((item) => item.status === "Inactive");
    }

    if (sortBy === "Ascending") {
      result = [...result].sort((a, b) =>
        a.role.localeCompare(b.role)
      );
    }

    if (sortBy === "Descending") {
      result = [...result].sort((a, b) =>
        b.role.localeCompare(a.role)
      );
    }

    return result;
  }, [rolesData, search, statusFilter, sortBy]);

  const visibleData = filteredData.slice(0, rowsPerPage);

  const handleSelectAll = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.checked) {
      setSelectedRows(visibleData.map((item) => item.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const isAllSelected =
    visibleData.length > 0 &&
    visibleData.every((item) =>
      selectedRows.includes(item.id)
    );

  // ============================================================
  // ADD ROLE
  // ============================================================

  const handleAddRole = () => {
    if (!newRoleName.trim()) return;

    const newRole: RoleType = {
      id:
        rolesData.length > 0
          ? Math.max(...rolesData.map((item) => item.id)) + 1
          : 1,
      role: newRoleName.trim(),
      createdDate: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      status: newRoleStatus,
    };

    setRolesData((prev) => [...prev, newRole]);

    setNewRoleName("");
    setNewRoleStatus("Active");
    setShowAddModal(false);
  };

  // ============================================================
  // EDIT ROLE
  // ============================================================

  const openEditModal = (role: RoleType) => {
    setEditingRole(role);
    setEditRoleName(role.role);
    setEditRoleStatus(role.status);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setEditingRole(null);
    setEditRoleName("");
    setEditRoleStatus("Active");
    setShowEditModal(false);
  };

  const handleSaveEdit = () => {
    if (!editingRole || !editRoleName.trim()) return;

    setRolesData((prev) =>
      prev.map((item) =>
        item.id === editingRole.id
          ? {
              ...item,
              role: editRoleName.trim(),
              status: editRoleStatus,
            }
          : item
      )
    );

    closeEditModal();
  };

  // ============================================================
  // DELETE ROLE
  // ============================================================

  const openDeleteModal = (role: RoleType) => {
    setDeleteRole(role);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setDeleteRole(null);
    setShowDeleteModal(false);
  };

  const handleDeleteRole = () => {
    if (!deleteRole) return;

    setRolesData((prev) =>
      prev.filter((item) => item.id !== deleteRole.id)
    );

    setSelectedRows((prev) =>
      prev.filter((id) => id !== deleteRole.id)
    );

    closeDeleteModal();
  };

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
              <House size={12} strokeWidth={1.7} />
            </Link>

            <span style={{ color: "#b7bec8" }}>/</span>

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
          onClick={() => setShowAddModal(true)}
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
          CARD
      ======================================================== */}

      <div
        style={{
          width: "100%",
          backgroundColor: "#fff",
          border: `1px solid ${borderColor}`,
          borderRadius: 6,
          overflow: "hidden",
          boxShadow: "0 1px 2px rgba(16,24,40,.03)",
        }}
      >
        {/* Header Filters */}

        <div
          style={{
            minHeight: 71,
            padding: "16px 16px 16px 20px",
            borderBottom: `1px solid ${borderColor}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
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
            {/* Date */}

            <button
              type="button"
              style={{
                width: 195,
                height: 38,
                background: "#fff",
                border: `1px solid ${borderColor}`,
                borderRadius: 6,
                color: "#16243d",
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 10px",
                cursor: "pointer",
              }}
            >
              <span>08/27/2026 - 09/02/20</span>

              <ChevronDown
                size={15}
                color="#91a0b3"
              />
            </button>

            {/* Status */}

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
                  setStatusFilter(e.target.value)
                }
                style={{
                  width: "100%",
                  height: "100%",
                  background: "#fff",
                  border: `1px solid ${borderColor}`,
                  borderRadius: 6,
                  color: "#15223a",
                  fontSize: 13,
                  outline: "none",
                  padding: "0 31px 0 14px",
                  cursor: "pointer",
                  appearance: "none",
                }}
              >
                <option>Status</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>

              <ChevronDown
                size={15}
                color="#10213d"
                style={{
                  pointerEvents: "none",
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
            </div>

            {/* Sort */}

            <div
              style={{
                position: "relative",
                width: 178,
                height: 38,
              }}
            >
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  width: "100%",
                  height: "100%",
                  background: "#fff",
                  border: `1px solid ${borderColor}`,
                  borderRadius: 6,
                  color: "#15223a",
                  fontSize: 13,
                  outline: "none",
                  padding: "0 32px 0 13px",
                  appearance: "none",
                  cursor: "pointer",
                }}
              >
                <option>Sort By : Last 7 Days</option>
                <option>Recently Added</option>
                <option>Ascending</option>
                <option>Descending</option>
                <option>Last Month</option>
              </select>

              <ChevronDown
                size={15}
                color="#10213d"
                style={{
                  pointerEvents: "none",
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Search */}

        <div
          style={{
            height: 60,
            padding: "0 16px",
            borderBottom: `1px solid ${borderColor}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
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
            <span>Row Per Page</span>

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
                  setRowsPerPage(Number(e.target.value))
                }
                style={{
                  width: "100%",
                  height: "100%",
                  border: `1px solid ${borderColor}`,
                  borderRadius: 6,
                  outline: "none",
                  background: "#fff",
                  color: "#27364d",
                  fontSize: 13,
                  padding: "0 20px 0 9px",
                  appearance: "none",
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>

              <ChevronDown
                size={13}
                color="#637083"
                style={{
                  position: "absolute",
                  right: 6,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              />
            </div>

            <span>Entries</span>
          </div>

          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: 160,
              height: 30,
              padding: "0 11px",
              border: `1px solid ${borderColor}`,
              borderRadius: 5,
              outline: "none",
              fontSize: 12,
            }}
          />
        </div>

        {/* ======================================================
            TABLE
        ====================================================== */}

        <div style={{ width: "100%", overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              minWidth: 950,
              borderCollapse: "collapse",
              tableLayout: "fixed",
              fontSize: 13,
            }}
          >
            <colgroup>
              <col style={{ width: "10%" }} />
              <col style={{ width: "30%" }} />
              <col style={{ width: "21%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: "21%" }} />
            </colgroup>

            <thead>
              <tr
                style={{
                  height: 43,
                  background: "#e9ebef",
                }}
              >
                <th
                  style={{
                    paddingLeft: 20,
                    textAlign: "left",
                    borderBottom: `1px solid ${borderColor}`,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    style={checkboxStyle}
                  />
                </th>

                <TableHeader title="Role" />

                <TableHeader title="Created Date" />

                <TableHeader title="Status" />

                <th
                  style={{
                    borderBottom: `1px solid ${borderColor}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
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
              {visibleData.map((item) => (
                <tr
                  key={item.id}
                  style={{
                    height: 47,
                    background: "#fff",
                  }}
                >
                  <td
                    style={{
                      paddingLeft: 20,
                      borderBottom: `1px solid ${borderColor}`,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(item.id)}
                      onChange={() =>
                        handleSelectRow(item.id)
                      }
                      style={checkboxStyle}
                    />
                  </td>

                  <td
                    style={{
                      color: "#687287",
                      borderBottom: `1px solid ${borderColor}`,
                    }}
                  >
                    {item.role}
                  </td>

                  <td
                    style={{
                      color: "#687287",
                      borderBottom: `1px solid ${borderColor}`,
                    }}
                  >
                    {item.createdDate}
                  </td>

                  <td
                    style={{
                      borderBottom: `1px solid ${borderColor}`,
                    }}
                  >
                    <StatusBadge status={item.status} />
                  </td>

                  <td
                    style={{
                      borderBottom: `1px solid ${borderColor}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 20,
                      }}
                    >
                      <button
                        type="button"
                        title="Permissions"
                        style={actionButtonStyle}
                      >
                        <Shield
                          size={15}
                          strokeWidth={1.6}
                        />
                      </button>

                      {/* EDIT */}

                      <button
                        type="button"
                        title="Edit"
                        style={actionButtonStyle}
                        onClick={() =>
                          openEditModal(item)
                        }
                      >
                        <Pencil
                          size={15}
                          strokeWidth={1.6}
                        />
                      </button>

                      {/* DELETE */}

                      <button
                        type="button"
                        title="Delete"
                        style={actionButtonStyle}
                        onClick={() =>
                          openDeleteModal(item)
                        }
                      >
                        <Trash2
                          size={15}
                          strokeWidth={1.6}
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {visibleData.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      height: 100,
                      textAlign: "center",
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

        {/* Footer */}

        <div
          style={{
            height: 57,
            padding: "0 17px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
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
              : `Showing 1 - ${Math.min(
                  rowsPerPage,
                  filteredData.length
                )} of ${filteredData.length} entries`}
          </span>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <ChevronLeft
              size={14}
              color="#a3adb9"
            />

            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: goldColor,
                color: "#fff",
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              1
            </div>

            <ChevronRight
              size={14}
              color="#a3adb9"
            />
          </div>
        </div>
      </div>

      {/* ========================================================
          ADD ROLE MODAL
      ======================================================== */}

      {showAddModal && (
        <div
          style={overlayStyle}
          onClick={() => setShowAddModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
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
              onClose={() => setShowAddModal(false)}
            />

            <div
              style={{
                padding: "18px 17px",
              }}
            >
              <FormLabel>Role Name</FormLabel>

              <input
                value={newRoleName}
                onChange={(e) =>
                  setNewRoleName(e.target.value)
                }
                placeholder="Enter role name"
                style={inputStyle}
              />

              <div style={{ height: 18 }} />

              <FormLabel>Status</FormLabel>

              <div style={{ position: "relative" }}>
                <select
                  value={newRoleStatus}
                  onChange={(e) =>
                    setNewRoleStatus(
                      e.target.value as
                        | "Active"
                        | "Inactive"
                    )
                  }
                  style={{
                    ...inputStyle,
                    appearance: "none",
                  }}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">
                    Inactive
                  </option>
                </select>

                <ChevronDown
                  size={15}
                  color="#667085"
                  style={selectArrowStyle}
                />
              </div>
            </div>

            <ModalFooter
              onCancel={() => setShowAddModal(false)}
              onSave={handleAddRole}
            />
          </div>
        </div>
      )}

      {/* ========================================================
          EDIT ROLE MODAL
          EXACT SCREENSHOT STYLE
      ======================================================== */}

      {showEditModal && (
        <div
          style={overlayStyle}
          onClick={closeEditModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 500,
              backgroundColor: "#ffffff",
              borderRadius: 6,
              overflow: "hidden",
              boxShadow:
                "0 20px 50px rgba(15,23,42,.22)",
            }}
          >
            {/* Header */}

            <div
              style={{
                height: 64,
                padding: "0 17px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: `1px solid ${borderColor}`,
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
                onClick={closeEditModal}
                style={{
                  width: 20,
                  height: 20,
                  border: "none",
                  borderRadius: "50%",
                  background: "#707784",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                <X size={13} strokeWidth={3} />
              </button>
            </div>

            {/* Body */}

            <div
              style={{
                padding: "17px",
              }}
            >
              <FormLabel>Role Name</FormLabel>

              <input
                type="text"
                value={editRoleName}
                onChange={(e) =>
                  setEditRoleName(e.target.value)
                }
                style={inputStyle}
              />

              <div style={{ height: 18 }} />

              <FormLabel>Status</FormLabel>

              <div style={{ position: "relative" }}>
                <select
                  value={editRoleStatus}
                  onChange={(e) =>
                    setEditRoleStatus(
                      e.target.value as
                        | "Active"
                        | "Inactive"
                    )
                  }
                  style={{
                    ...inputStyle,
                    appearance: "none",
                    cursor: "pointer",
                    paddingRight: 38,
                  }}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">
                    Inactive
                  </option>
                </select>

                <ChevronDown
                  size={16}
                  color="#566173"
                  style={selectArrowStyle}
                />
              </div>
            </div>

            {/* Footer */}

            <div
              style={{
                minHeight: 63,
                padding: "12px 13px",
                borderTop: `1px solid ${borderColor}`,
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 8,
              }}
            >
              <button
                type="button"
                onClick={closeEditModal}
                style={{
                  height: 38,
                  minWidth: 73,
                  padding: "0 15px",
                  border: "none",
                  borderRadius: 5,
                  background: "#f6f7f9",
                  color: "#111827",
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveEdit}
                style={{
                  height: 38,
                  minWidth: 60,
                  padding: "0 15px",
                  border: "none",
                  borderRadius: 5,
                  background: goldColor,
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          DELETE CONFIRMATION MODAL
          EXACT SCREENSHOT STYLE
      ======================================================== */}

      {showDeleteModal && (
        <div
          style={overlayStyle}
          onClick={closeDeleteModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 400,
              minHeight: 230,
              backgroundColor: "#ffffff",
              borderRadius: 5,
              padding: "16px 20px",
              boxSizing: "border-box",
              boxShadow:
                "0 20px 50px rgba(15,23,42,.20)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* Red Trash Box */}

            <div
              style={{
                width: 58,
                height: 59,
                marginTop: 0,
                borderRadius: 4,
                background: "#f7cccc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Trash2
                size={29}
                strokeWidth={2.6}
                color="#ef1010"
              />
            </div>

            {/* Heading */}

            <h2
              style={{
                margin: "14px 0 4px",
                fontSize: 19,
                lineHeight: "24px",
                fontWeight: 600,
                color: "#202c47",
              }}
            >
              Confirm Delete
            </h2>

            {/* Text */}

            <p
              style={{
                margin: 0,
                maxWidth: 320,
                textAlign: "center",
                color: "#333333",
                fontSize: 14,
                lineHeight: "22px",
                fontWeight: 400,
              }}
            >
              You want to delete all the marked items,
              this cant be
              <br />
              undone once you delete.
            </p>

            {/* Buttons */}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 15,
                marginTop: 15,
              }}
            >
              <button
                type="button"
                onClick={closeDeleteModal}
                style={{
                  height: 39,
                  minWidth: 73,
                  border: "none",
                  borderRadius: 5,
                  background: "#f6f7f9",
                  color: "#111827",
                  fontSize: 14,
                  cursor: "pointer",
                  padding: "0 15px",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteRole}
                style={{
                  height: 39,
                  minWidth: 99,
                  border: "none",
                  borderRadius: 5,
                  background: "#ef1111",
                  color: "#ffffff",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: "0 15px",
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// SMALL COMPONENTS
// ============================================================

interface TableHeaderProps {
  title: string;
}

const TableHeader: React.FC<TableHeaderProps> = ({
  title,
}) => {
  return (
    <th
      style={{
        height: 43,
        padding: 0,
        color: "#0e192e",
        fontSize: 13,
        fontWeight: 600,
        textAlign: "left",
        borderBottom: `1px solid ${borderColor}`,
        background: "#e9ebef",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
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

interface StatusBadgeProps {
  status: "Active" | "Inactive";
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
}) => {
  return (
    <span
      style={{
        minWidth: status === "Inactive" ? 65 : 57,
        height: 19,
        padding: "0 8px",
        borderRadius: 4,
        backgroundColor:
          status === "Active" ? "#08c55c" : "#e80000",
        color: "#ffffff",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        fontSize: 10,
        fontWeight: 600,
      }}
    >
      <span
        style={{
          width: 4,
          height: 4,
          borderRadius: "50%",
          background: "#fff",
        }}
      />

      {status}
    </span>
  );
};

interface ModalHeaderProps {
  title: string;
  onClose: () => void;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  onClose,
}) => {
  return (
    <div
      style={{
        height: 60,
        padding: "0 18px",
        borderBottom: `1px solid ${borderColor}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
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
          borderRadius: "50%",
          border: "none",
          background: "#707784",
          color: "#fff",
          padding: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <X size={13} strokeWidth={3} />
      </button>
    </div>
  );
};

const FormLabel: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <label
      style={{
        display: "block",
        marginBottom: 9,
        fontSize: 14,
        lineHeight: "18px",
        color: "#273550",
        fontWeight: 500,
      }}
    >
      {children}
    </label>
  );
};

interface ModalFooterProps {
  onCancel: () => void;
  onSave: () => void;
}

const ModalFooter: React.FC<ModalFooterProps> = ({
  onCancel,
  onSave,
}) => {
  return (
    <div
      style={{
        minHeight: 63,
        padding: "12px 13px",
        borderTop: `1px solid ${borderColor}`,
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: 8,
      }}
    >
      <button
        type="button"
        onClick={onCancel}
        style={{
          height: 38,
          minWidth: 73,
          border: "none",
          borderRadius: 5,
          background: "#f6f7f9",
          color: "#111827",
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        Cancel
      </button>

      <button
        type="button"
        onClick={onSave}
        style={{
          height: 38,
          minWidth: 60,
          border: "none",
          borderRadius: 5,
          background: goldColor,
          color: "#ffffff",
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Save
      </button>
    </div>
  );
};

// ============================================================
// COMMON STYLES
// ============================================================

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 38,
  boxSizing: "border-box",
  padding: "0 10px",
  border: `1px solid ${borderColor}`,
  borderRadius: 5,
  outline: "none",
  background: "#ffffff",
  color: "#333b4f",
  fontSize: 14,
  fontFamily:
    "'Inter', 'Nunito Sans', 'Segoe UI', Arial, sans-serif",
};

const selectArrowStyle: React.CSSProperties = {
  pointerEvents: "none",
  position: "absolute",
  right: 10,
  top: "50%",
  transform: "translateY(-50%)",
};

export default Roles;
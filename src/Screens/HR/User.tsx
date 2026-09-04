import React, { useMemo, useState } from "react";
import {
  PlusCircle,
  ArrowUpDown,
  Shield,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Home,
  Search,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

/* =====================================================
   TYPES
===================================================== */

interface PermissionRow {
  module: string;
  read: boolean;
  write: boolean;
  create: boolean;
  delete: boolean;
  import: boolean;
  export: boolean;
}

interface UserType {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  createdDate: string;
  role: string;
  status: string;
  permissions: PermissionRow[];
}

interface UserFormType {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  role: string;
  permissions: PermissionRow[];
}

/* =====================================================
   DEFAULT PERMISSIONS
===================================================== */

const createDefaultPermissions = (): PermissionRow[] => [
  {
    module: "Employee",
    read: false,
    write: false,
    create: false,
    delete: false,
    import: false,
    export: false,
  },
  {
    module: "Holidays",
    read: false,
    write: false,
    create: false,
    delete: false,
    import: false,
    export: false,
  },
  {
    module: "Leaves",
    read: false,
    write: false,
    create: false,
    delete: false,
    import: false,
    export: false,
  },
  {
    module: "Events",
    read: false,
    write: false,
    create: false,
    delete: false,
    import: false,
    export: false,
  },
];

/* =====================================================
   INITIAL DATA
===================================================== */

const initialUserData: UserType[] = [
  {
    id: 1,
    firstName: "Anthony",
    lastName: "Lewis",
    username: "anthony",
    name: "Anthony Lewis",
    email: "anthony@example.com",
    phone: "988765544",
    createdDate: "12 Sep 2024",
    role: "Employee",
    status: "Active",
    permissions: [
      {
        module: "Employee",
        read: false,
        write: false,
        create: true,
        delete: false,
        import: false,
        export: false,
      },
      {
        module: "Holidays",
        read: false,
        write: false,
        create: false,
        delete: false,
        import: false,
        export: false,
      },
      {
        module: "Leaves",
        read: false,
        write: false,
        create: false,
        delete: false,
        import: false,
        export: false,
      },
      {
        module: "Events",
        read: false,
        write: false,
        create: false,
        delete: false,
        import: false,
        export: false,
      },
    ],
  },
  {
    id: 2,
    firstName: "Brian",
    lastName: "Villalobos",
    username: "brian",
    name: "Brian Villalobos",
    email: "brian@example.com",
    phone: "987650002",
    createdDate: "24 Oct 2024",
    role: "Employee",
    status: "Active",
    permissions: createDefaultPermissions(),
  },
  {
    id: 3,
    firstName: "Sophie",
    lastName: "Headrick",
    username: "sophie",
    name: "Sophie Headrick",
    email: "sophie@example.com",
    phone: "987650003",
    createdDate: "18 Feb 2024",
    role: "HR",
    status: "Active",
    permissions: createDefaultPermissions(),
  },
  {
    id: 4,
    firstName: "Stephan",
    lastName: "Peralt",
    username: "stephan",
    name: "Stephan Peralt",
    email: "peral@example.com",
    phone: "987650004",
    createdDate: "17 Oct 2024",
    role: "Employee",
    status: "Active",
    permissions: createDefaultPermissions(),
  },
  {
    id: 5,
    firstName: "Thomas",
    lastName: "Bordelon",
    username: "thomas",
    name: "Thomas Bordelon",
    email: "thomas@example.com",
    phone: "987650005",
    createdDate: "20 Jul 2024",
    role: "HR",
    status: "Active",
    permissions: createDefaultPermissions(),
  },
  {
    id: 6,
    firstName: "Doglas",
    lastName: "Martini",
    username: "doglas",
    name: "Doglas Martini",
    email: "martniwr@example.com",
    phone: "987650006",
    createdDate: "10 Apr 2024",
    role: "Employee",
    status: "Active",
    permissions: createDefaultPermissions(),
  },
];

/* =====================================================
   EMPTY FORM
===================================================== */

const createEmptyForm = (): UserFormType => ({
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  role: "",
  permissions: createDefaultPermissions(),
});

/* =====================================================
   COMPONENT
===================================================== */

const User: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>(initialUserData);

  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const [roleFilter, setRoleFilter] = useState("Role");
  const [statusFilter, setStatusFilter] = useState("Status");
  const [sortFilter, setSortFilter] = useState(
    "Sort By : Last 7 Days"
  );
  const [dateFilter, setDateFilter] = useState(
    "08/27/2026 - 09/02/2026"
  );

  /* =====================================================
     MODALS
  ===================================================== */

  const [showAddModal, setShowAddModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [editingUser, setEditingUser] =
    useState<UserType | null>(null);

  const [deletingUser, setDeletingUser] =
    useState<UserType | null>(null);

  const [userForm, setUserForm] =
    useState<UserFormType>(createEmptyForm());

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredData = useMemo(() => {
    let data = [...users];

    if (search.trim()) {
      const value = search.toLowerCase();

      data = data.filter(
        (item) =>
          item.name.toLowerCase().includes(value) ||
          item.email.toLowerCase().includes(value) ||
          item.role.toLowerCase().includes(value)
      );
    }

    if (roleFilter !== "Role") {
      data = data.filter((item) => item.role === roleFilter);
    }

    if (statusFilter !== "Status") {
      data = data.filter(
        (item) => item.status === statusFilter
      );
    }

    if (sortFilter === "Ascending") {
      data.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    if (sortFilter === "Descending") {
      data.sort((a, b) =>
        b.name.localeCompare(a.name)
      );
    }

    return data;
  }, [
    users,
    search,
    roleFilter,
    statusFilter,
    sortFilter,
  ]);

  const visibleData = filteredData.slice(
    0,
    rowsPerPage
  );

  /* =====================================================
     CHECKBOXES
  ===================================================== */

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

  const handleSelectRow = (id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id)
        ? prev.filter((rowId) => rowId !== id)
        : [...prev, id]
    );
  };

  /* =====================================================
     FORM
  ===================================================== */

  const handleFormChange = (
    field: keyof Omit<UserFormType, "permissions">,
    value: string
  ) => {
    setUserForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePermissionChange = (
    rowIndex: number,
    field:
      | "read"
      | "write"
      | "create"
      | "delete"
      | "import"
      | "export"
  ) => {
    setUserForm((prev) => ({
      ...prev,
      permissions: prev.permissions.map(
        (permission, index) =>
          index === rowIndex
            ? {
                ...permission,
                [field]: !permission[field],
              }
            : permission
      ),
    }));
  };

  /* =====================================================
     ADD
  ===================================================== */

  const openAddModal = () => {
    setUserForm(createEmptyForm());
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setUserForm(createEmptyForm());
  };

  const handleAddUser = () => {
    const name =
      `${userForm.firstName} ${userForm.lastName}`.trim();

    if (!name || !userForm.email) return;

    const newUser: UserType = {
      id:
        users.length > 0
          ? Math.max(...users.map((item) => item.id)) + 1
          : 1,
      firstName: userForm.firstName,
      lastName: userForm.lastName,
      username: userForm.username,
      name,
      email: userForm.email,
      phone: userForm.phone,
      createdDate: "02 Sep 2026",
      role: userForm.role || "Employee",
      status: "Active",
      permissions: userForm.permissions,
    };

    setUsers((prev) => [...prev, newUser]);

    closeAddModal();
  };

  /* =====================================================
     EDIT
  ===================================================== */

  const openEditModal = (user: UserType) => {
    setEditingUser(user);

    setUserForm({
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      password: "",
      confirmPassword: "",
      phone: user.phone,
      role: user.role,
      permissions: user.permissions.map((permission) => ({
        ...permission,
      })),
    });

    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
    setUserForm(createEmptyForm());
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;

    const name =
      `${userForm.firstName} ${userForm.lastName}`.trim();

    setUsers((prev) =>
      prev.map((user) =>
        user.id === editingUser.id
          ? {
              ...user,
              firstName: userForm.firstName,
              lastName: userForm.lastName,
              username: userForm.username,
              name,
              email: userForm.email,
              phone: userForm.phone,
              role: userForm.role,
              permissions: userForm.permissions,
            }
          : user
      )
    );

    closeEditModal();
  };

  /* =====================================================
     DELETE
  ===================================================== */

  const openDeleteModal = (user: UserType) => {
    setDeletingUser(user);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setDeletingUser(null);
    setShowDeleteModal(false);
  };

  const confirmDelete = () => {
    if (!deletingUser) return;

    setUsers((prev) =>
      prev.filter(
        (user) => user.id !== deletingUser.id
      )
    );

    setSelectedRows((prev) =>
      prev.filter((id) => id !== deletingUser.id)
    );

    closeDeleteModal();
  };

  /* =====================================================
     BADGE
  ===================================================== */

  const getRoleClass = (role: string) =>
    role === "HR"
      ? "user-role-badge hr"
      : "user-role-badge employee";

  /* =====================================================
     USER FORM MODAL
  ===================================================== */

  const renderUserModal = (
    mode: "add" | "edit"
  ) => {
    const isEdit = mode === "edit";

    return (
      <div
        className="user-modal-overlay"
        onMouseDown={(e) => {
          if (e.currentTarget === e.target) {
            isEdit
              ? closeEditModal()
              : closeAddModal();
          }
        }}
      >
        <div
          className="user-form-modal"
          onMouseDown={(e) =>
            e.stopPropagation()
          }
        >
          {/* HEADER */}

          <div className="user-form-modal-header">
            <h2>
              {isEdit ? "Edit User" : "Add User"}
            </h2>

            <button
              type="button"
              className="user-modal-close"
              onClick={
                isEdit
                  ? closeEditModal
                  : closeAddModal
              }
            >
              <X size={13} strokeWidth={3} />
            </button>
          </div>

          {/* BODY */}

          <div className="user-form-modal-body">
            {/* ROW 1 */}

            <div className="user-form-row">
              <div>
                <label>First Name</label>

                <input
                  value={userForm.firstName}
                  onChange={(e) =>
                    handleFormChange(
                      "firstName",
                      e.target.value
                    )
                  }
                />
              </div>

              <div>
                <label>Last Name</label>

                <input
                  value={userForm.lastName}
                  onChange={(e) =>
                    handleFormChange(
                      "lastName",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            {/* ROW 2 */}

            <div className="user-form-row">
              <div>
                <label>User Name</label>

                <input
                  value={userForm.username}
                  onChange={(e) =>
                    handleFormChange(
                      "username",
                      e.target.value
                    )
                  }
                />
              </div>

              <div>
                <label>Email</label>

                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) =>
                    handleFormChange(
                      "email",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            {/* PASSWORD */}

            <div className="user-form-row">
              <div>
                <label>Password</label>

                <div className="password-input-wrapper">
                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={userForm.password}
                    onChange={(e) =>
                      handleFormChange(
                        "password",
                        e.target.value
                      )
                    }
                  />

                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                  >
                    {showPassword ? (
                      <Eye size={17} />
                    ) : (
                      <EyeOff size={17} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label>
                  Confirm Password
                </label>

                <div className="password-input-wrapper">
                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      userForm.confirmPassword
                    }
                    onChange={(e) =>
                      handleFormChange(
                        "confirmPassword",
                        e.target.value
                      )
                    }
                  />

                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                  >
                    {showConfirmPassword ? (
                      <Eye size={17} />
                    ) : (
                      <EyeOff size={17} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* PHONE / ROLE */}

            <div className="user-form-row">
              <div>
                <label>Phone</label>

                <input
                  value={userForm.phone}
                  onChange={(e) =>
                    handleFormChange(
                      "phone",
                      e.target.value
                    )
                  }
                />
              </div>

              <div>
                <label>Role</label>

                <div className="user-role-select-wrap">
                  <select
                    value={userForm.role}
                    onChange={(e) =>
                      handleFormChange(
                        "role",
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Select
                    </option>

                    <option value="Employee">
                      Employee
                    </option>

                    <option value="HR">
                      HR
                    </option>
                  </select>

                  <ChevronDown
                    size={15}
                    className="user-role-select-chevron"
                  />
                </div>
              </div>
            </div>

            {/* PERMISSIONS */}

            <div className="permissions-table-wrap">
              <table className="permissions-table">
                <thead>
                  <tr>
                    <th>Module Permissions</th>
                    <th>Read</th>
                    <th>Write</th>
                    <th>Create</th>
                    <th>Delete</th>
                    <th>Import</th>
                    <th>Export</th>
                  </tr>
                </thead>

                <tbody>
                  {userForm.permissions.map(
                    (permission, index) => (
                      <tr key={permission.module}>
                        <td>
                          {permission.module}
                        </td>

                        {(
                          [
                            "read",
                            "write",
                            "create",
                            "delete",
                            "import",
                            "export",
                          ] as const
                        ).map((field) => (
                          <td key={field}>
                            <input
                              type="checkbox"
                              className="permission-checkbox"
                              checked={
                                permission[
                                  field
                                ]
                              }
                              onChange={() =>
                                handlePermissionChange(
                                  index,
                                  field
                                )
                              }
                            />
                          </td>
                        ))}
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* FOOTER */}

          <div className="user-form-modal-footer">
            <button
              type="button"
              className="user-cancel-btn"
              onClick={
                isEdit
                  ? closeEditModal
                  : closeAddModal
              }
            >
              Cancel
            </button>

            <button
              type="button"
              className="user-save-btn"
              onClick={
                isEdit
                  ? handleUpdateUser
                  : handleAddUser
              }
            >
              {isEdit
                ? "Save Changes"
                : "Add User"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        .users-page {
          min-height: 100vh;
          background: #f5f6f8;
          padding: 22px 20px 30px;
          color: #172033;
          font-family: Arial, Helvetica, sans-serif;
        }

        /* PAGE HEADER */

        .users-page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 25px;
        }

        .users-page-title {
          margin: 0 0 6px;
          font-size: 24px;
          font-weight: 700;
          color: #162238;
        }

        .users-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #64748b;
        }

        .users-home-link {
          display: flex;
          color: #59798c;
          text-decoration: none;
        }

        /* ADD USER */

        .add-user-button {
          height: 39px;
          border: 0;
          border-radius: 5px;
          background: #bd9138;
          color: white;
          padding: 0 15px;
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        /* CARD */

        .users-card {
          background: #fff;
          border: 1px solid #dfe3e8;
          border-radius: 5px;
          overflow: hidden;
        }

        .users-card-header {
          min-height: 71px;
          padding: 15px 19px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          border-bottom: 1px solid #e1e5ea;
        }

        .users-card-title {
          margin: 0;
          font-size: 15px;
          font-weight: 600;
          color: #17243b;
        }

        .users-filters {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .users-select-wrapper {
          position: relative;
        }

        .users-filter-select {
          height: 39px;
          border: 1px solid #dce1e7;
          border-radius: 5px;
          background: white;
          appearance: none;
          padding: 0 35px 0 12px;
          outline: none;
          color: #142138;
          font-size: 13px;
        }

        .users-date-select {
          width: 195px;
        }

        .users-role-select {
          width: 77px;
        }

        .users-status-select {
          width: 91px;
        }

        .users-sort-select {
          width: 177px;
        }

        .users-select-chevron {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
        }

        /* TOOLBAR */

        .users-toolbar {
          min-height: 60px;
          padding: 10px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e4e7eb;
        }

        .users-row-control {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #435166;
        }

        .users-row-select {
          width: 50px;
          height: 30px;
          border: 1px solid #dce1e7;
          border-radius: 6px;
          outline: none;
        }

        .users-search-wrapper {
          position: relative;
          width: 160px;
        }

        .users-search-input {
          width: 100%;
          height: 31px;
          border: 1px solid #dce1e7;
          border-radius: 5px;
          padding: 0 30px 0 11px;
          font-size: 12px;
          outline: none;
        }

        .users-search-icon {
          position: absolute;
          right: 9px;
          top: 50%;
          transform: translateY(-50%);
          color: #9aa3af;
        }

        /* TABLE */

        .users-table-wrapper {
          overflow-x: auto;
        }

        .users-table {
          width: 100%;
          min-width: 950px;
          border-collapse: collapse;
          table-layout: fixed;
        }

        .users-table thead {
          background: #e4e7eb;
        }

        .users-table th {
          height: 43px;
          padding: 0 11px;
          font-size: 13px;
          font-weight: 600;
          text-align: left;
          color: #101d31;
        }

        .users-table td {
          height: 53px;
          padding: 6px 11px;
          border-bottom: 1px solid #e1e5ea;
          font-size: 13px;
          color: #5a687a;
        }

        .users-table th:nth-child(1),
        .users-table td:nth-child(1) {
          width: 70px;
          text-align: center;
        }

        .users-table th:nth-child(2),
        .users-table td:nth-child(2) {
          width: 220px;
        }

        .users-table th:nth-child(3),
        .users-table td:nth-child(3) {
          width: 225px;
        }

        .users-table th:nth-child(4),
        .users-table td:nth-child(4) {
          width: 145px;
        }

        .users-table th:nth-child(5),
        .users-table td:nth-child(5) {
          width: 125px;
        }

        .users-table th:nth-child(6),
        .users-table td:nth-child(6) {
          width: 125px;
        }

        .users-table th:nth-child(7),
        .users-table td:nth-child(7) {
          width: 145px;
        }

        .users-table-sort {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .users-sort-icon {
          color: #c4cad2;
        }

        .users-checkbox {
          width: 18px;
          height: 18px;
          accent-color: #bd9138;
        }

        .user-name-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .user-avatar {
          width: 33px;
          height: 33px;
          border-radius: 50%;
          background: #d4d4d4;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #eee;
          font-size: 8px;
        }

        .user-name-text {
          color: #0e1b30;
          font-weight: 500;
        }

        /* ROLE */

        .user-role-badge {
          min-height: 32px;
          padding: 0 9px;
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
          font-size: 11px;
        }

        .user-role-badge.employee {
          background: #ffe8f0;
          color: #ff3d79;
        }

        .user-role-badge.hr {
          background: #efd9f2;
          color: #bd4ec7;
        }

        /* STATUS */

        .user-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 9px;
          border-radius: 4px;
          background: #00bd5f;
          color: white;
          font-size: 11px;
          font-weight: 600;
        }

        .user-status-badge::before {
          content: "";
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: white;
        }

        /* ACTIONS */

        .users-actions {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .users-action-btn {
          border: 0;
          background: transparent;
          color: #5a6a7d;
          padding: 2px;
          cursor: pointer;
        }

        .users-action-btn:hover {
          color: #bd9138;
        }

        .users-delete-btn:hover {
          color: red;
        }

        /* FOOTER */

        .users-table-footer {
          min-height: 57px;
          padding: 0 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13px;
          color: #647185;
        }

        .users-pagination {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .users-page-button {
          width: 28px;
          height: 28px;
          border: 0;
          background: transparent;
          color: #a3acb7;
        }

        .users-current-page {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #bd9138;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }

        /* =================================================
           ADD / EDIT MODAL
        ================================================= */

        .user-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: rgba(0,0,0,.46);
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 15px 18px;
          overflow-y: auto;
        }

        .user-form-modal {
          width: 800px;
          max-width: 100%;
          background: white;
          border-radius: 5px;
          overflow: hidden;
          box-shadow: 0 14px 45px rgba(0,0,0,.27);
        }

        .user-form-modal-header {
          height: 63px;
          padding: 0 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e2e6eb;
        }

        .user-form-modal-header h2 {
          margin: 0;
          color: #273653;
          font-size: 20px;
          font-weight: 600;
        }

        .user-modal-close {
          width: 20px;
          height: 20px;
          border: 0;
          border-radius: 50%;
          background: #6f7886;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          cursor: pointer;
        }

        .user-form-modal-body {
          padding: 18px 16px 10px;
        }

        .user-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 17px;
        }

        .user-form-row label {
          display: block;
          margin-bottom: 9px;
          font-size: 14px;
          color: #293751;
        }

        .user-form-row input,
        .user-form-row select {
          width: 100%;
          height: 39px;
          border: 1px solid #dce1e7;
          border-radius: 5px;
          background: white;
          padding: 0 11px;
          color: #293548;
          font-size: 14px;
          outline: none;
        }

        .user-form-row input:focus,
        .user-form-row select:focus {
          border-color: #bd9138;
        }

        .password-input-wrapper {
          position: relative;
        }

        .password-input-wrapper input {
          padding-right: 40px;
        }

        .eye-btn {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          border: 0;
          background: transparent;
          padding: 0;
          color: #15223a;
          display: flex;
          cursor: pointer;
        }

        .user-role-select-wrap {
          position: relative;
        }

        .user-role-select-wrap select {
          appearance: none;
          padding-right: 35px;
        }

        .user-role-select-chevron {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
        }

        /* PERMISSIONS */

        .permissions-table-wrap {
          width: 100%;
          overflow-x: auto;
        }

        .permissions-table {
          width: 100%;
          min-width: 700px;
          border-collapse: collapse;
          border: 1px solid #dfe3e8;
        }

        .permissions-table thead {
          background: #e4e7eb;
        }

        .permissions-table th {
          height: 39px;
          padding: 0 19px;
          text-align: left;
          color: #273247;
          font-size: 14px;
          font-weight: 600;
          white-space: nowrap;
        }

        .permissions-table th:not(:first-child) {
          text-align: center;
        }

        .permissions-table td {
          height: 39px;
          border-bottom: 1px solid #e3e6eb;
          padding: 0 19px;
          color: #2f3848;
          font-size: 14px;
        }

        .permissions-table td:not(:first-child) {
          text-align: center;
        }

        .permissions-table th:first-child,
        .permissions-table td:first-child {
          width: 190px;
        }

        .permission-checkbox {
          width: 19px;
          height: 19px;
          accent-color: #bd9138;
          cursor: pointer;
        }

        .user-form-modal-footer {
          min-height: 62px;
          padding: 0 13px;
          border-top: 1px solid #e2e5e9;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
        }

        .user-cancel-btn {
          height: 39px;
          border: 0;
          border-radius: 5px;
          padding: 0 15px;
          background: #f5f6f7;
          color: #273247;
          font-size: 14px;
          cursor: pointer;
        }

        .user-save-btn {
          height: 39px;
          border: 0;
          border-radius: 5px;
          padding: 0 17px;
          background: #bd9138;
          color: white;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }

        /* =================================================
           DELETE MODAL
        ================================================= */

        .delete-user-overlay {
          position: fixed;
          inset: 0;
          z-index: 100000;
          background: rgba(0,0,0,.46);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        .delete-user-modal {
          width: 400px;
          max-width: 100%;
          background: white;
          border-radius: 5px;
          padding: 17px 25px;
          text-align: center;
          box-shadow: 0 14px 40px rgba(0,0,0,.25);
        }

        .delete-user-icon-box {
          width: 58px;
          height: 58px;
          margin: 0 auto 15px;
          border-radius: 4px;
          background: #facaca;
          color: #ef1010;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .delete-user-title {
          margin: 0 0 7px;
          font-size: 19px;
          font-weight: 600;
          color: #293854;
        }

        .delete-user-text {
          max-width: 310px;
          margin: 0 auto 17px;
          font-size: 14px;
          line-height: 21px;
          color: #3a4049;
        }

        .delete-user-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }

        .delete-user-cancel {
          min-width: 74px;
          height: 39px;
          border: 0;
          border-radius: 5px;
          background: #f6f7f8;
          color: #263044;
          font-size: 14px;
          cursor: pointer;
        }

        .delete-user-confirm {
          min-width: 99px;
          height: 39px;
          border: 0;
          border-radius: 5px;
          background: #ef0909;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        @media (max-width: 850px) {
          .users-card-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .users-filters {
            flex-wrap: wrap;
          }

          .user-form-row {
            grid-template-columns: 1fr;
            gap: 14px;
          }
        }
      `}</style>

      {/* =================================================
          PAGE
      ================================================= */}

      <div className="users-page">
        <div className="users-page-header">
          <div>
            <h1 className="users-page-title">
              Users
            </h1>

            <div className="users-breadcrumb">
              <Link
                to="/HR/HrDashboard"
                className="users-home-link"
              >
                <Home size={13} />
              </Link>

              <span>/</span>

              <span>Users</span>
            </div>
          </div>

          <button
            type="button"
            className="add-user-button"
            onClick={openAddModal}
          >
            <PlusCircle size={14} />
            Add User
          </button>
        </div>

        {/* CARD */}

        <div className="users-card">
          <div className="users-card-header">
            <h2 className="users-card-title">
              Users List
            </h2>

            <div className="users-filters">
              <div className="users-select-wrapper">
                <select
                  value={dateFilter}
                  onChange={(e) =>
                    setDateFilter(e.target.value)
                  }
                  className="
                    users-filter-select
                    users-date-select
                  "
                >
                  <option>
                    08/27/2026 - 09/02/2026
                  </option>

                  <option>
                    Last 7 Days
                  </option>

                  <option>
                    Last 30 Days
                  </option>
                </select>

                <ChevronDown
                  size={15}
                  className="users-select-chevron"
                />
              </div>

              <div className="users-select-wrapper">
                <select
                  value={roleFilter}
                  onChange={(e) =>
                    setRoleFilter(e.target.value)
                  }
                  className="
                    users-filter-select
                    users-role-select
                  "
                >
                  <option>Role</option>
                  <option>Employee</option>
                  <option>HR</option>
                </select>

                <ChevronDown
                  size={15}
                  className="users-select-chevron"
                />
              </div>

              <div className="users-select-wrapper">
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value)
                  }
                  className="
                    users-filter-select
                    users-status-select
                  "
                >
                  <option>Status</option>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>

                <ChevronDown
                  size={15}
                  className="users-select-chevron"
                />
              </div>

              <div className="users-select-wrapper">
                <select
                  value={sortFilter}
                  onChange={(e) =>
                    setSortFilter(e.target.value)
                  }
                  className="
                    users-filter-select
                    users-sort-select
                  "
                >
                  <option>
                    Sort By : Last 7 Days
                  </option>

                  <option>
                    Ascending
                  </option>

                  <option>
                    Descending
                  </option>
                </select>

                <ChevronDown
                  size={15}
                  className="users-select-chevron"
                />
              </div>
            </div>
          </div>

          {/* TOOLBAR */}

          <div className="users-toolbar">
            <div className="users-row-control">
              <span>Row Per Page</span>

              <select
                className="users-row-select"
                value={rowsPerPage}
                onChange={(e) =>
                  setRowsPerPage(
                    Number(e.target.value)
                  )
                }
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
              </select>

              <span>Entries</span>
            </div>

            <div className="users-search-wrapper">
              <input
                className="users-search-input"
                placeholder="Search"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

              <Search
                size={14}
                className="users-search-icon"
              />
            </div>
          </div>

          {/* TABLE */}

          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      className="users-checkbox"
                      checked={
                        visibleData.length > 0 &&
                        visibleData.every((item) =>
                          selectedRows.includes(item.id)
                        )
                      }
                      onChange={handleSelectAll}
                    />
                  </th>

                  <th>
                    <div className="users-table-sort">
                      Name
                      <ArrowUpDown
                        size={13}
                        className="users-sort-icon"
                      />
                    </div>
                  </th>

                  <th>
                    <div className="users-table-sort">
                      Email
                      <ArrowUpDown
                        size={13}
                        className="users-sort-icon"
                      />
                    </div>
                  </th>

                  <th>
                    <div className="users-table-sort">
                      Created Date
                      <ArrowUpDown
                        size={13}
                        className="users-sort-icon"
                      />
                    </div>
                  </th>

                  <th>
                    <div className="users-table-sort">
                      Role
                      <ArrowUpDown
                        size={13}
                        className="users-sort-icon"
                      />
                    </div>
                  </th>

                  <th>
                    <div className="users-table-sort">
                      Status
                      <ArrowUpDown
                        size={13}
                        className="users-sort-icon"
                      />
                    </div>
                  </th>

                  <th />
                </tr>
              </thead>

              <tbody>
                {visibleData.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <input
                        type="checkbox"
                        className="users-checkbox"
                        checked={selectedRows.includes(
                          item.id
                        )}
                        onChange={() =>
                          handleSelectRow(item.id)
                        }
                      />
                    </td>

                    <td>
                      <div className="user-name-cell">
                        <div className="user-avatar">
                          •••
                        </div>

                        <span className="user-name-text">
                          {item.name}
                        </span>
                      </div>
                    </td>

                    <td>
                      {item.email}
                    </td>

                    <td>
                      {item.createdDate}
                    </td>

                    <td>
                      <span
                        className={getRoleClass(
                          item.role
                        )}
                      >
                        {item.role}
                      </span>
                    </td>

                    <td>
                      <span className="user-status-badge">
                        {item.status}
                      </span>
                    </td>

                    <td>
                      <div className="users-actions">
                        {/* PERMISSIONS */}

                        <button
                          type="button"
                          className="users-action-btn"
                          title="Permissions"
                        >
                          <Shield size={15} />
                        </button>

                        {/* EDIT */}

                        <button
                          type="button"
                          className="users-action-btn"
                          title="Edit User"
                          onClick={() =>
                            openEditModal(item)
                          }
                        >
                          <Pencil size={15} />
                        </button>

                        {/* DELETE */}

                        <button
                          type="button"
                          className="
                            users-action-btn
                            users-delete-btn
                          "
                          title="Delete User"
                          onClick={() =>
                            openDeleteModal(item)
                          }
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* FOOTER */}

          <div className="users-table-footer">
            <span>
              Showing{" "}
              {visibleData.length === 0 ? 0 : 1} -{" "}
              {visibleData.length} of{" "}
              {filteredData.length} entries
            </span>

            <div className="users-pagination">
              <button className="users-page-button">
                <ChevronLeft size={16} />
              </button>

              <span className="users-current-page">
                1
              </span>

              <button className="users-page-button">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          ADD USER MODAL
      ================================================= */}

      {showAddModal &&
        renderUserModal("add")}

      {/* =================================================
          EDIT USER MODAL
      ================================================= */}

      {showEditModal &&
        editingUser &&
        renderUserModal("edit")}

      {/* =================================================
          DELETE MODAL
      ================================================= */}

      {showDeleteModal &&
        deletingUser && (
          <div
            className="delete-user-overlay"
            onMouseDown={(e) => {
              if (
                e.currentTarget === e.target
              ) {
                closeDeleteModal();
              }
            }}
          >
            <div
              className="delete-user-modal"
              onMouseDown={(e) =>
                e.stopPropagation()
              }
            >
              <div className="delete-user-icon-box">
                <Trash2
                  size={31}
                  strokeWidth={2.5}
                />
              </div>

              <h2 className="delete-user-title">
                Confirm Delete
              </h2>

              <p className="delete-user-text">
                You want to delete all the marked
                items, this cant be undone once you
                delete.
              </p>

              <div className="delete-user-actions">
                <button
                  type="button"
                  className="delete-user-cancel"
                  onClick={closeDeleteModal}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="delete-user-confirm"
                  onClick={confirmDelete}
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

export default User;
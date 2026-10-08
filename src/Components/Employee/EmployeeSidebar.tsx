
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import logo from "../../assets/img/logo.webp";
import { logoutAttendance } from "../../services/employeservices";
import { getMyPermissions } from "../../services/adminservices";

// =====================================================
// TYPES
// =====================================================

interface EmployeePermission {
  pageId: string;
  code: string;
  name: string;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
}

interface SidebarMenuItem {
  label: string;
  path: string;
  icon: string;
  permissionCodes: string[];
}

// =====================================================
// EMPLOYEE SIDEBAR MENU
// Permission codes must match backend codes.
// =====================================================

const sidebarMenus: SidebarMenuItem[] = [
  {
    label: "Dashboard",
    path: "/Employee/EmployeDashboard",
    icon: "ti ti-category-2",
    permissionCodes: ["DASHBOARD"],
  },
  {
    label: "Leave",
    path: "/Employee/leave",
    icon: "ti ti-calendar-month",
    permissionCodes: ["LEAVE", "LEAVES"],
  },
  {
    label: "Attendance",
    path: "/Employee/Attendance",
    icon: "ti ti-calendar-month",
    permissionCodes: ["ATTENDANCE"],
  },
  {
    label: "Payslip",
    path: "/Employee/Payslip",
    icon: "ti ti-calendar-month",
    permissionCodes: ["PAYSLIP", "PAYSLIPS", "PAYROLL"],
  },
  {
    label: "Holidays",
    path: "/Employee/Holidays",
    icon: "ti ti-calendar-event",
    permissionCodes: ["HOLIDAY", "HOLIDAYS"],
  },
  {
    label: "Profile",
    path: "/Employee/profiles",
    icon: "ti ti-user-circle",
    permissionCodes: ["PROFILE", "MY_PROFILE"],
  },
];

// =====================================================
// EMPLOYEE SIDEBAR COMPONENT
// =====================================================

const EmployeeSidebar: React.FC = () => {
  const navigate = useNavigate();

  const [permissions, setPermissions] = useState<
    EmployeePermission[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [permissionError, setPermissionError] = useState("");

  // =====================================================
  // FETCH EMPLOYEE PERMISSIONS
  // =====================================================

  useEffect(() => {
    let isMounted = true;

    const fetchEmployeePermissions = async () => {
      try {
        setLoading(true);
        setPermissionError("");

        const response = await getMyPermissions();

        console.log(
          "EMPLOYEE MY PERMISSIONS RESPONSE:",
          response
        );

        // getMyPermissions returns response.data,
        // but also support an Axios-style wrapper.
        const apiResponse =
          response?.statusCode !== undefined ||
          response?.isSuccess !== undefined
            ? response
            : response?.data ?? response;

        if (apiResponse?.isSuccess === false) {
          throw new Error(
            apiResponse?.message ||
              "Failed to fetch permissions."
          );
        }

        const data = apiResponse?.data ?? apiResponse;

        if (
          data?.userType !== undefined &&
          Number(data.userType) !== 2
        ) {
          throw new Error(
            "Logged-in user is not an Employee."
          );
        }

        if (!Array.isArray(data?.permissions)) {
          throw new Error(
            "Permission API returned an invalid response."
          );
        }

        const employeePermissions: EmployeePermission[] =
          data.permissions.map((item: any) => ({
            pageId: String(item.pageId ?? ""),
            code: String(item.code ?? "")
              .trim()
              .toUpperCase(),
            name: String(item.name ?? ""),
            canRead: item.canRead === true,
            canWrite: item.canWrite === true,
            canDelete: item.canDelete === true,
          }));

        if (isMounted) {
          setPermissions(employeePermissions);
        }
      } catch (error: any) {
        console.error(
          "EMPLOYEE PERMISSION ERROR:",
          error
        );

        if (isMounted) {
          setPermissions([]);
          setPermissionError(
            error?.message ||
              "Unable to load employee permissions."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchEmployeePermissions();

    return () => {
      isMounted = false;
    };
  }, []);

  // =====================================================
  // CHECK MODULE READ PERMISSION
  // =====================================================

  const hasPermission = (codes: string[]): boolean => {
    return permissions.some(
      (permission) =>
        permission.canRead === true &&
        codes.includes(permission.code)
    );
  };

  // =====================================================
  // FILTER SIDEBAR MENUS
  // =====================================================

  const visibleMenus = sidebarMenus.filter((menu) =>
    hasPermission(menu.permissionCodes)
  );

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = async (
    e: React.MouseEvent<HTMLAnchorElement>
  ) => {
    e.preventDefault();

    try {
      // Existing attendance logout API
      await logoutAttendance();
    } catch (error) {
      console.error(
        "Attendance logout API failed:",
        error
      );
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");

      navigate("/Employee/EmployeLogin", {
        replace: true,
      });
    }
  };

  // =====================================================
  // NAVLINK STYLE
  // =====================================================

  const navStyle = ({
    isActive,
  }: {
    isActive: boolean;
  }): React.CSSProperties => ({
    height: "48px",
    padding: "0 14px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    borderRadius: "10px",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 600,
    transition: "0.3s",

    background: isActive
      ? "#d9a441"
      : "transparent",

    color: isActive
      ? "#ffffff"
      : "#667085",

    boxShadow: isActive
      ? "0 4px 12px rgba(217,164,65,0.25)"
      : "none",
  });

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div
      className="sidebar"
      id="sidebar"
      style={{
        width: "260px",
        height: "100vh",
        background: "#ffffff",
        borderRight: "1px solid #e5e7eb",
        position: "fixed",
        left: 0,
        top: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* =====================================================
          LOGO
      ===================================================== */}

      <div
        className="sidebar-logo"
        style={{
          height: "78px",
          minHeight: "78px",
          display: "flex",
          alignItems: "center",
          padding: "0 22px",
          borderBottom: "1px solid #eceef2",
          background: "#fff",
          zIndex: 10,
        }}
      >
        <NavLink
          to="/Employee/EmployeDashboard"
          className="logo logo-normal"
        >
          <img
            src={logo}
            alt="Logo"
            style={{
              width: "140px",
              objectFit: "contain",
            }}
          />
        </NavLink>
      </div>

      {/* =====================================================
          SIDEBAR MENU
      ===================================================== */}

      <div
        className="sidebar-inner slimscroll"
        style={{
          padding: "18px 14px",
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <div
          id="sidebar-menu"
          className="sidebar-menu"
        >
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
            }}
          >
            {/* LOADING */}

            {loading && (
              <li
                style={{
                  padding: "12px 14px",
                  fontSize: "13px",
                  color: "#667085",
                }}
              >
                Loading permissions...
              </li>
            )}

            {/* API ERROR */}

            {!loading && permissionError && (
              <li
                role="alert"
                style={{
                  padding: "12px 14px",
                  fontSize: "12px",
                  color: "#b42318",
                }}
              >
                {permissionError}
              </li>
            )}

            {/* DYNAMIC PERMISSION MENUS */}

            {!loading &&
              visibleMenus.map((menu) => (
                <li
                  key={menu.path}
                  style={{
                    marginBottom: "6px",
                  }}
                >
                  <NavLink
                    to={menu.path}
                    style={navStyle}
                  >
                    <i className={menu.icon}></i>
                    <span>{menu.label}</span>
                  </NavLink>
                </li>
              ))}

            {/* NO PERMISSIONS */}

            {!loading &&
              !permissionError &&
              visibleMenus.length === 0 && (
                <li
                  style={{
                    padding: "12px 14px",
                    color: "#667085",
                    fontSize: "12px",
                  }}
                >
                  No modules assigned.
                </li>
              )}

            {/* =====================================================
                LOGOUT - ALWAYS VISIBLE
            ===================================================== */}

            <li
              style={{
                marginBottom: "6px",
              }}
            >
              <NavLink
                to="/Employee/EmployeLogin"
                onClick={handleLogout}
                style={navStyle}
              >
                <i className="ti ti-logout"></i>
                <span>Logout</span>
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSidebar;

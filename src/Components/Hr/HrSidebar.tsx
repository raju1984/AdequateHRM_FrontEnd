import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../../assets/img/logo.webp";
import { attendanceLogout } from "../../services/hrservices";

const HrSidebar: React.FC = () => {
  const navigate = useNavigate();

  const GOLD = "#c5963b";
  const TEXT = "#526072";
  const ICON = "#34788d";
  const SECTION = "#98a2b3";
  const HOVER = "#e9eaec";

  const navStyle = ({
    isActive,
  }: {
    isActive: boolean;
  }): React.CSSProperties => ({
    width: "100%",
    height: "43px",
    display: "flex",
    alignItems: "center",
    gap: "11px",
    padding: "0 14px",
    boxSizing: "border-box",
    borderRadius: "6px",
    textDecoration: "none",
    fontSize: "15px",
    lineHeight: "20px",
    fontWeight: isActive ? 600 : 400,
    background: isActive ? GOLD : "transparent",
    color: isActive ? "#ffffff" : TEXT,
    boxShadow: "none",
    transition: "0.15s ease",
    cursor: "pointer",
  });

  const menuItemStyle: React.CSSProperties = {
    margin: 0,
    marginBottom: "4px",
    padding: 0,
  };

  const sectionStyle: React.CSSProperties = {
    marginTop: "25px",
    marginBottom: "12px",
    paddingLeft: "0px",
    color: SECTION,
    fontSize: "10px",
    lineHeight: "14px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0px",
  };

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = async (
    e: React.MouseEvent<HTMLAnchorElement>
  ) => {
    e.preventDefault();

    try {
      // Call attendance logout API
      await attendanceLogout();
    } catch (error) {
      // Even if API fails, continue with local logout
      console.error(
        "Attendance logout API failed:",
        error
      );
    } finally {
      // Clear authentication/session data
      localStorage.removeItem("token");
      localStorage.removeItem("userId");

      // Redirect to login page
      navigate("/HR/HrLogin", { replace: true });
    }
  };

  return (
    <>
      <style>
        {`
          #sidebar {
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
          }

          #sidebar .sidebar-scroll::-webkit-scrollbar {
            width: 5px;
          }

          #sidebar .sidebar-scroll::-webkit-scrollbar-track {
            background: transparent;
          }

          #sidebar .sidebar-scroll::-webkit-scrollbar-thumb {
            background: #dedede;
            border-radius: 10px;
          }

          #sidebar .sidebar-scroll {
            scrollbar-width: thin;
            scrollbar-color: #dedede transparent;
          }

          #sidebar .hr-menu-link:not(.active):hover {
            background: ${HOVER} !important;
            color: #465365 !important;
          }

          #sidebar .hr-menu-link i {
            width: 18px;
            min-width: 18px;
            height: 18px;

            display: inline-flex;
            align-items: center;
            justify-content: center;

            font-size: 17px;
            line-height: 1;

            color: ${ICON};
          }

          #sidebar .hr-menu-link.active i {
            color: #ffffff !important;
          }

          #sidebar .hr-menu-link span {
            white-space: nowrap;
          }
        `}
      </style>

      <div
        id="sidebar"
        style={{
          width: "250px",
          height: "100vh",
          background: "#ffffff",
          borderRight: "1px solid #e5e7eb",
          position: "fixed",
          left: 0,
          top: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          zIndex: 1000,
          boxSizing: "border-box",
        }}
      >
        {/* =====================================================
            LOGO
        ===================================================== */}

        <div
          style={{
            height: "68px",
            minHeight: "68px",
            display: "flex",
            alignItems: "center",
            padding: "0 15px",
            background: "#ffffff",
            flexShrink: 0,
            boxSizing: "border-box",
          }}
        >
          <NavLink
            to="/Hr/HrDashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              textDecoration: "none",
            }}
          >
            <img
              src={logo}
              alt="Adequate Infosoft Pvt. Ltd."
              style={{
                width: "155px",
                height: "auto",
                objectFit: "contain",
                display: "block",
              }}
            />
          </NavLink>
        </div>

        {/* =====================================================
            SCROLL AREA
        ===================================================== */}

        <div
          className="sidebar-scroll"
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            padding: "2px 14px 14px 16px",
            boxSizing: "border-box",
          }}
        >
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
            }}
          >
            {/* =================================================
                DASHBOARD
            ================================================= */}

            <li style={menuItemStyle}>
              <NavLink
                to="/Hr/HrDashboard"
                className={({ isActive }) =>
                  `hr-menu-link ${
                    isActive ? "active" : ""
                  }`
                }
                style={navStyle}
              >
                <i className="ti ti-home"></i>
                <span>Dashboard</span>
              </NavLink>
            </li>

            {/* =================================================
                EMPLOYEES SECTION
            ================================================= */}

            <li style={sectionStyle}>EMPLOYEES</li>

            {/* Employees */}

            <li style={menuItemStyle}>
              <NavLink
                to="/Hr/Employee"
                className={({ isActive }) =>
                  `hr-menu-link ${
                    isActive ? "active" : ""
                  }`
                }
                style={navStyle}
              >
                <i className="ti ti-users"></i>
                <span>Employees</span>
              </NavLink>
            </li>

            {/* Departments */}

            <li style={menuItemStyle}>
              <NavLink
                to="/HR/Departments"
                className={({ isActive }) =>
                  `hr-menu-link ${
                    isActive ? "active" : ""
                  }`
                }
                style={navStyle}
              >
                <i className="ti ti-category-2"></i>
                <span>Departments</span>
              </NavLink>
            </li>

            {/* Designations */}

            <li style={menuItemStyle}>
              <NavLink
                to="/HR/Designation"
                className={({ isActive }) =>
                  `hr-menu-link ${
                    isActive ? "active" : ""
                  }`
                }
                style={navStyle}
              >
                <i className="ti ti-user-cog"></i>
                <span>Designations</span>
              </NavLink>
            </li>

            {/* Holidays */}

            <li style={menuItemStyle}>
              <NavLink
                to="/HR/Holiday"
                className={({ isActive }) =>
                  `hr-menu-link ${
                    isActive ? "active" : ""
                  }`
                }
                style={navStyle}
              >
                <i className="ti ti-truck"></i>
                <span>Holidays</span>
              </NavLink>
            </li>

            {/* =================================================
                LEAVES SECTION
            ================================================= */}

            <li style={sectionStyle}>LEAVES</li>

            {/* Leaves */}

            <li style={menuItemStyle}>
              <NavLink
                to="/HR/Leave"
                className={({ isActive }) =>
                  `hr-menu-link ${
                    isActive ? "active" : ""
                  }`
                }
                style={navStyle}
              >
                <i className="ti ti-calendar-month"></i>
                <span>Leaves</span>
              </NavLink>
            </li>

            {/* Leave Type */}

            <li style={menuItemStyle}>
              <NavLink
                to="/HR/LeaveTyp"
                className={({ isActive }) =>
                  `hr-menu-link ${
                    isActive ? "active" : ""
                  }`
                }
                style={navStyle}
              >
                <i className="ti ti-settings"></i>
                <span>Leave Type</span>
              </NavLink>
            </li>

            {/* Attendance */}

            <li style={menuItemStyle}>
              <NavLink
                to="/HR/Atendance"
                className={({ isActive }) =>
                  `hr-menu-link ${
                    isActive ? "active" : ""
                  }`
                }
                style={navStyle}
              >
                <i className="ti ti-calendar-event"></i>
                <span>Attendance</span>
              </NavLink>
            </li>

            {/* Employee Salary */}

            <li style={menuItemStyle}>
              <NavLink
                to="/HR/EmployeeSalary"
                className={({ isActive }) =>
                  `hr-menu-link ${
                    isActive ? "active" : ""
                  }`
                }
                style={navStyle}
              >
                <i className="ti ti-receipt"></i>
                <span>Employee Salary</span>
              </NavLink>
            </li>

            {/* =================================================
                USER MANAGEMENT SECTION
            ================================================= */}

            <li
              style={{
                ...sectionStyle,
                marginTop: "26px",
              }}
            >
              USER MANAGEMENT
            </li>

            {/* Users */}

            <li style={menuItemStyle}>
              <NavLink
                to="/HR/User"
                className={({ isActive }) =>
                  `hr-menu-link ${
                    isActive ? "active" : ""
                  }`
                }
                style={navStyle}
              >
                <i className="ti ti-users"></i>
                <span>Users</span>
              </NavLink>
            </li>

            {/* Roles & Permissions */}

            <li style={menuItemStyle}>
              <NavLink
                to="/HR/Roles"
                className={({ isActive }) =>
                  `hr-menu-link ${
                    isActive ? "active" : ""
                  }`
                }
                style={navStyle}
              >
                <i className="ti ti-sparkles"></i>
                <span>Roles & Permissions</span>
              </NavLink>
            </li>

            {/* Profile */}

            <li style={menuItemStyle}>
              <NavLink
                to="/HR/Profilee"
                className={({ isActive }) =>
                  `hr-menu-link ${
                    isActive ? "active" : ""
                  }`
                }
                style={navStyle}
              >
                <i className="ti ti-user-circle"></i>
                <span>Profile</span>
              </NavLink>
            </li>

            {/* =================================================
                LOGOUT
            ================================================= */}

            <li
              style={{
                ...menuItemStyle,
                marginTop: "4px",
              }}
            >
              <NavLink
                to="/HR/HrLogin"
                onClick={handleLogout}
                className="hr-menu-link"
                style={() => ({
                  ...navStyle({
                    isActive: false,
                  }),
                  background: "transparent",
                  color: TEXT,
                  fontWeight: 400,
                })}
              >
                <i className="ti ti-logout-2"></i>
                <span>Logout</span>
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default HrSidebar;



import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

import logo from "../../assets/img/logo.webp";
import { logoutAttendance } from "../../services/employeservices";

const EmployeeSidebar: React.FC = () => {
  const navigate = useNavigate(); 

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = async (
    e: React.MouseEvent<HTMLAnchorElement>
  ) => {
    e.preventDefault();

    try {
      // Call Attendance Logout / Punch Out API
      await logoutAttendance();
    } catch (error) {
      // Even if API fails, logout locally
      console.error("Attendance logout API failed:", error);
    } finally {
      // Clear authentication/session data
      localStorage.removeItem("token");
      localStorage.removeItem("userId");

      // Redirect to Employee Login
      navigate("/Employee/EmployeLogin", {
        replace: true,
      });
    }
  };

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

    background: isActive ? "#d9a441" : "transparent",
    color: isActive ? "#ffffff" : "#667085",

    boxShadow: isActive
      ? "0 4px 12px rgba(217,164,65,0.25)"
      : "none",
  });

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
          MENU
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
            {/* DASHBOARD */}
            <li style={{ marginBottom: "6px" }}>
              <NavLink
                to="/Employee/EmployeDashboard"
                style={navStyle}
              >
                <i className="ti ti-category-2"></i>
                <span>Dashboard</span>
              </NavLink>
            </li>

            {/* LEAVE */}
            <li style={{ marginBottom: "6px" }}>
              <NavLink
                to="/Employee/leave"
                style={navStyle}
              >
                <i className="ti ti-calendar-month"></i>
                <span>Leave</span>
              </NavLink>
            </li>

            {/* ATTENDANCE */}
            <li style={{ marginBottom: "6px" }}>
              <NavLink
                to="/Employee/Attendance"
                style={navStyle}
              >
                <i className="ti ti-calendar-month"></i>
                <span>Attendance</span>
              </NavLink>
            </li>

            {/* PAYSLIP */}
            <li style={{ marginBottom: "6px" }}>
              <NavLink
                to="/Employee/Payslip"
                style={navStyle}
              >
                <i className="ti ti-calendar-month"></i>
                <span>Payslip</span>
              </NavLink>
            </li>

            {/* HOLIDAYS */}
            <li style={{ marginBottom: "6px" }}>
              <NavLink
                to="/Employee/Holidays"
                style={navStyle}
              >
                <i className="ti ti-calendar-event"></i>
                <span>Holidays</span>
              </NavLink>
            </li>

            {/* PROFILE */}
            <li style={{ marginBottom: "6px" }}>
              <NavLink
                to="/Employee/profiles"
                style={navStyle}
              >
                <i className="ti ti-user-circle"></i>
                <span>Profile</span>
              </NavLink>
            </li>

            {/* LOGOUT */}
            <li style={{ marginBottom: "6px" }}>
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


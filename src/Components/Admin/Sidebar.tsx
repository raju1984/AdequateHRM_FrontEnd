// Sidebar.tsx

import React from "react";
import { NavLink } from "react-router-dom";

import logo from "../../assets/img/logo.webp";

const Sidebar = () => {
  return (
    <>
      <style>
        {`
          .sidebar {
            width: 250px;
            height: 100vh;
            position: fixed;
            top: 0;
            left: 0;
            z-index: 1000;

            display: flex;
            flex-direction: column;

            background: #ffffff;
            border-right: 1px solid #e5e7eb;
            overflow: hidden;
          }

          /* =========================
             LOGO
          ========================= */

          .sidebar-logo {
            height: 65px;
            min-height: 65px;

            display: flex;
            align-items: center;

            padding: 0 16px;

            background: #fff;
          }

          .sidebar-logo .logo-normal {
            display: flex;
            align-items: center;
          }

          .sidebar-logo .logo-normal img {
            width: 155px;
            height: auto;
            object-fit: contain;
          }

          .sidebar-logo .logo-small {
            display: none;
          }

          /* =========================
             SCROLL
          ========================= */

          .sidebar-inner {
            flex: 1;

            padding: 0 15px 18px;

            overflow-y: auto;
            overflow-x: hidden;

            scrollbar-width: thin;
            scrollbar-color: #dedede transparent;
          }

          .sidebar-inner::-webkit-scrollbar {
            width: 5px;
          }

          .sidebar-inner::-webkit-scrollbar-track {
            background: transparent;
          }

          .sidebar-inner::-webkit-scrollbar-thumb {
            background: #dedede;
            border-radius: 20px;
          }

          /* =========================
             LIST
          ========================= */

          .sidebar-menu ul {
            list-style: none;
            padding: 0;
            margin: 0;
          }

          .sidebar-menu li {
            margin: 0;
            padding: 0;
          }

          /* =========================
             LINKS
          ========================= */

          .sidebar-menu li > a {
            width: 100%;
            height: 43px;

            padding: 0 16px;

            display: flex;
            align-items: center;

            gap: 10px;

            border-radius: 5px;

            color: #536174;
            text-decoration: none;

            font-size: 15px;
            font-weight: 400;

            transition:
              background-color 0.15s ease,
              color 0.15s ease;
          }

          .sidebar-menu li > a i {
            width: 16px;

            color: #31738a;

            font-size: 17px;
            line-height: 1;

            display: inline-flex;
            align-items: center;
            justify-content: center;

            flex-shrink: 0;
          }

          .sidebar-menu li > a span {
            white-space: nowrap;
          }

          /* =========================
             HOVER
          ========================= */

          .sidebar-menu li > a:hover {
            background: #f6f6f6;
            color: #334155;
          }

          /* =========================
             ACTIVE
          ========================= */

          .sidebar-menu li > a.active {
            background: #c39339;
            color: #ffffff;
            font-weight: 600;
          }

          .sidebar-menu li > a.active i {
            color: #ffffff;
          }

          /* =========================
             SECTION TITLES
          ========================= */

          .sidebar-menu .menu-title {
            height: auto;

            margin: 18px 0 7px;

            padding: 0;

            color: #929eaf;

            font-size: 10px;
            font-weight: 600;

            text-transform: uppercase;
          }

          .sidebar-menu .menu-title span {
            display: block;
          }

          /* =========================
             MOBILE
          ========================= */

          @media (max-width: 991px) {
            .sidebar {
              width: 250px;
            }
          }
        `}
      </style>

      <div
        className="sidebar"
        id="sidebar"
      >
        {/* =============================
            LOGO
        ============================= */}

        <div className="sidebar-logo">
          <NavLink
            to="/admin/dashboard"
            className="logo logo-normal"
          >
            <img
              src={logo}
              alt="Adequate Infosoft"
            />
          </NavLink>

          <NavLink
            to="/admin/dashboard"
            className="logo-small"
          >
            <img
              src={logo}
              alt="Adequate Infosoft"
            />
          </NavLink>
        </div>

        {/* =============================
            SIDEBAR MENU
        ============================= */}

        <div className="sidebar-inner">
          <div
            id="sidebar-menu"
            className="sidebar-menu"
          >
            <ul>
              {/* =========================
                  DASHBOARD
              ========================= */}

              <li>
                <NavLink
                  to="/admin/dashboard"
                  className={({ isActive }) =>
                    isActive ? "active" : ""
                  }
                >
                  <i className="ti ti-smart-home" />

                  <span>
                    Dashboard
                  </span>
                </NavLink>
              </li>

              {/* =========================
                  EMPLOYEES TITLE
              ========================= */}

              <li className="menu-title">
                <span>
                  Employees
                </span>
              </li>

              {/* EMPLOYEES */}

              <li>
                <NavLink
                  to="/admin/employees"
                  className={({ isActive }) =>
                    isActive ? "active" : ""
                  }
                >
                  <i className="ti ti-users" />

                  <span>
                    Employees
                  </span>
                </NavLink>
              </li>

              {/* DEPARTMENTS */}

              <li>
                <NavLink
                  to="/admin/departments"
                  className={({ isActive }) =>
                    isActive ? "active" : ""
                  }
                >
                  <i className="ti ti-category-plus" />

                  <span>
                    Departments
                  </span>
                </NavLink>
              </li>

              {/* DESIGNATIONS */}

              <li>
                <NavLink
                  to="/admin/designations"
                  className={({ isActive }) =>
                    isActive ? "active" : ""
                  }
                >
                  <i className="ti ti-user-star" />

                  <span>
                    Designations
                  </span>
                </NavLink>
              </li>

              {/* HOLIDAYS */}

              <li>
                <NavLink
                  to="/admin/holidays"
                  className={({ isActive }) =>
                    isActive ? "active" : ""
                  }
                >
                  <i className="ti ti-camper" />

                  <span>
                    Holidays
                  </span>
                </NavLink>
              </li>

              {/* =========================
                  LEAVES TITLE
              ========================= */}

              <li className="menu-title">
                <span>
                  Leaves
                </span>
              </li>

              {/* LEAVES */}

              <li>
                <NavLink
                  to="/admin/Leaves"
                  className={({ isActive }) =>
                    isActive ? "active" : ""
                  }
                >
                  <i className="ti ti-calendar-month" />

                  <span>
                    Leaves
                  </span>
                </NavLink>
              </li>

              {/* LEAVE TYPE */}

              <li>
                <NavLink
                  to="/admin/LeaveType"
                  className={({ isActive }) =>
                    isActive ? "active" : ""
                  }
                >
                  <i className="ti ti-settings" />

                  <span>
                    Leave Type
                  </span>
                </NavLink>
              </li>

              {/* ATTENDANCE */}

              <li>
                <NavLink
                  to="/admin/attendance"
                  className={({ isActive }) =>
                    isActive ? "active" : ""
                  }
                >
                  <i className="ti ti-calendar-event" />

                  <span>
                    Attendance
                  </span>
                </NavLink>
              </li>

              {/* EMPLOYEE SALARY */}

              <li>
                <NavLink
                  to="/admin/employeSalary"
                  className={({ isActive }) =>
                    isActive ? "active" : ""
                  }
                >
                  <i className="ti ti-receipt-rupee" />

                  <span>
                    Employee Salary
                  </span>
                </NavLink>
              </li>

              {/* =========================
                  USER MANAGEMENT TITLE
              ========================= */}

              <li className="menu-title">
                <span>
                  User Management
                </span>
              </li>

              {/* USERS */}

              <li>
                <NavLink
                  to="/admin/users"
                  className={({ isActive }) =>
                    isActive ? "active" : ""
                  }
                >
                  <i className="ti ti-users" />

                  <span>
                    Users
                  </span>
                </NavLink>
              </li>

              {/* ROLES & PERMISSIONS */}

              <li>
                <NavLink
                  to="/admin/RolesPermission"
                  className={({ isActive }) =>
                    isActive ? "active" : ""
                  }
                >
                  <i className="ti ti-sparkles" />

                  <span>
                    Roles & Permissions
                  </span>
                </NavLink>
              </li>

              {/* PROFILE */}

              <li>
                <NavLink
                  to="/admin/Profile"
                  className={({ isActive }) =>
                    isActive ? "active" : ""
                  }
                >
                  <i className="ti ti-user-circle" />

                  <span>
                    Profile
                  </span>
                </NavLink>
              </li>

              {/* LOGOUT */}

              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    isActive ? "active" : ""
                  }
                >
                  <i className="ti ti-logout" />

                  <span>
                    Logout
                  </span>
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
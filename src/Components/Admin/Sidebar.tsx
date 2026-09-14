
// Sidebar.tsx

import React from "react";
import { NavLink } from "react-router-dom";

import logo from "../../assets/img/logo.webp";

const Sidebar = () => {
  return (
    <>
      <style>
        {`
          /* =========================================================
             SIDEBAR
          ========================================================= */

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

          /* =========================================================
             LOGO - FIXED / NON SCROLLING
          ========================================================= */

          .sidebar-logo {
            width: 100%;
            height: 65px;
            min-height: 65px;

            flex: 0 0 65px;

            display: flex;
            align-items: center;

            padding: 0 16px;

            background: #ffffff;

            border-bottom: 1px solid #f0f0f0;

            position: relative;
            z-index: 10;

            box-sizing: border-box;
          }

          .sidebar-logo .logo-normal {
            width: 100%;

            display: flex;
            align-items: center;
          }

          .sidebar-logo .logo-normal img {
            display: block;

            width: 155px;
            max-width: 100%;
            height: auto;

            object-fit: contain;
          }

          /* Small logo hidden for now */
          .sidebar-logo .logo-small {
            display: none;
          }

          /* =========================================================
             SIDEBAR SCROLL AREA
             ONLY THIS AREA WILL SCROLL
          ========================================================= */

          .sidebar-inner {
            flex: 1 1 auto;

            min-height: 0;

            padding: 8px 15px 18px;

            overflow-y: auto;
            overflow-x: hidden;

            box-sizing: border-box;

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

          .sidebar-inner::-webkit-scrollbar-thumb:hover {
            background: #c8c8c8;
          }

          /* =========================================================
             SIDEBAR MENU
          ========================================================= */

          .sidebar-menu {
            width: 100%;
          }

          .sidebar-menu ul {
            list-style: none;

            padding: 0;
            margin: 0;
          }

          .sidebar-menu li {
            margin: 0;
            padding: 0;
          }

          /* =========================================================
             LINKS
          ========================================================= */

          .sidebar-menu li > a {
            width: 100%;
            height: 43px;

            padding: 0 16px;

            display: flex;
            align-items: center;

            gap: 10px;

            border-radius: 5px;

            box-sizing: border-box;

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
            min-width: 16px;

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

            overflow: hidden;
            text-overflow: ellipsis;
          }

          /* =========================================================
             HOVER
          ========================================================= */

          .sidebar-menu li > a:hover {
            background: #f6f6f6;
            color: #334155;
          }

          /* =========================================================
             ACTIVE
          ========================================================= */

          .sidebar-menu li > a.active {
            background: #c39339;
            color: #ffffff;

            font-weight: 600;
          }

          .sidebar-menu li > a.active i {
            color: #ffffff;
          }

          /* =========================================================
             MENU TITLES
          ========================================================= */

          .sidebar-menu .menu-title {
            height: auto;

            margin: 18px 0 7px;
            padding: 0 16px;

            color: #929eaf;

            font-size: 10px;
            font-weight: 600;

            line-height: 1.4;

            text-transform: uppercase;
          }

          .sidebar-menu .menu-title span {
            display: block;

            white-space: nowrap;
          }

          /* =========================================================
             MOBILE
          ========================================================= */

          @media (max-width: 991px) {
            .sidebar {
              width: 250px;
            }

            .sidebar-logo {
              height: 65px;
              min-height: 65px;
              flex-basis: 65px;
            }
          }
        `}
      </style>

      <div className="sidebar" id="sidebar">

        {/* =====================================================
            FIXED LOGO AREA
            This section will NEVER scroll.
        ===================================================== */}

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

        {/* =====================================================
            SCROLLABLE MENU AREA
            Only this section scrolls.
        ===================================================== */}

        <div className="sidebar-inner">
          <div
            id="sidebar-menu"
            className="sidebar-menu"
          >
            <ul>

              {/* =================================================
                  DASHBOARD
              ================================================= */}

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

              {/* =================================================
                  EMPLOYEES
              ================================================= */}

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

              {/* =================================================
                  LEAVES
              ================================================= */}

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

              {/* =================================================
                  USER MANAGEMENT
              ================================================= */}

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


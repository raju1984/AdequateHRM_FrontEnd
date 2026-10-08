
import { NavLink } from "react-router-dom";

import logo from "../../assets/img/logo.webp";

const AccountantSidebar = () => {
  return (
    <>
      <style>
        {`
          /* SIDEBAR */
          .accountant-sidebar {
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

          /* FIXED LOGO */
          .accountant-sidebar .sidebar-logo {
            width: 100%;
            height: 65px;
            min-height: 65px;
            flex: 0 0 65px;
            display: flex;
            align-items: center;
            padding: 0 16px;
            background: #ffffff;
            border-bottom: 1px solid #f0f0f0;
            box-sizing: border-box;
          }

          .accountant-sidebar .logo-normal {
            width: 100%;
            display: flex;
            align-items: center;
          }

          .accountant-sidebar .logo-normal img {
            display: block;
            width: 155px;
            max-width: 100%;
            height: auto;
            object-fit: contain;
          }

          /* SCROLLABLE MENU */
          .accountant-sidebar .sidebar-inner {
            flex: 1 1 auto;
            min-height: 0;
            padding: 8px 15px 18px;
            overflow-y: auto;
            overflow-x: hidden;
            box-sizing: border-box;
            scrollbar-width: thin;
            scrollbar-color: #dedede transparent;
          }

          .accountant-sidebar .sidebar-inner::-webkit-scrollbar {
            width: 5px;
          }

          .accountant-sidebar .sidebar-inner::-webkit-scrollbar-thumb {
            background: #dedede;
            border-radius: 20px;
          }

          /* MENU */
          .accountant-sidebar .sidebar-menu {
            width: 100%;
          }

          .accountant-sidebar .sidebar-menu ul {
            list-style: none;
            padding: 0;
            margin: 0;
          }

          .accountant-sidebar .sidebar-menu li {
            margin: 0;
            padding: 0;
          }

          /* MENU LINKS */
          .accountant-sidebar .sidebar-menu li > a {
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

          /* ICONS */
          .accountant-sidebar .sidebar-menu li > a i {
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

          .accountant-sidebar .sidebar-menu li > a span {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          /* HOVER */
          .accountant-sidebar .sidebar-menu li > a:hover {
            background: #f6f6f6;
            color: #334155;
          }

          /* ACTIVE MENU */
          .accountant-sidebar .sidebar-menu li > a.active {
            background: #c39339;
            color: #ffffff;
            font-weight: 600;
          }

          .accountant-sidebar .sidebar-menu li > a.active i {
            color: #ffffff;
          }

          /* MENU TITLE */
          .accountant-sidebar .sidebar-menu .menu-title {
            margin: 18px 0 7px;
            padding: 0 16px;
            color: #929eaf;
            font-size: 10px;
            font-weight: 600;
            line-height: 1.4;
            text-transform: uppercase;
          }

          .accountant-sidebar .sidebar-menu .menu-title span {
            display: block;
            white-space: nowrap;
          }

          /* MOBILE */
          @media (max-width: 991px) {
            .accountant-sidebar {
              width: 250px;
            }
          }
        `}
      </style>

      <div
        className="accountant-sidebar"
        id="accountant-sidebar"
      >
        {/* FIXED LOGO */}
        <div className="sidebar-logo">
          <NavLink
            to="/Accountant/AccountantDashboard"
            className="logo-normal"
          >
            <img
              src={logo}
              alt="Adequate Infosoft"
            />
          </NavLink>
        </div>

        {/* SCROLLABLE MENU */}
        <div className="sidebar-inner">
          <div className="sidebar-menu">
            <ul>

              {/* ACCOUNTANT TITLE */}
              <li className="menu-title">
                <span>Accountant</span>
              </li>

              {/* EMPLOYEE SALARY */}
              <li>
                <NavLink
  to="/Accountant/EmployeeSalary"
  className={({ isActive }) =>
    isActive ? "active" : ""
  }
>
  <i className="ti ti-receipt-rupee" />
  <span>Employee Salary</span>
</NavLink>
              </li>

              {/* ATTENDANCE */}
              <li>
                <NavLink
  to="/Accountant/Attendance"
  className={({ isActive }) =>
    isActive ? "active" : ""
  }
>
  <i className="ti ti-calendar-event" />
  <span>Attendance</span>
</NavLink>
              </li>

              {/* LEAVES */}
              <li>
                <NavLink
                  to="/Accountant/Leaves"
                  className={({ isActive }) =>
                    isActive ? "active" : ""
                  }
                >
                  <i className="ti ti-calendar-month" />
                  <span>Leaves</span>
                </NavLink>
              </li>

              {/* HOLIDAYS */}
              <li>
                <NavLink
                  to="/Accountant/Holidays"
                  className={({ isActive }) =>
                    isActive ? "active" : ""
                  }
                >
                  <i className="ti ti-camper" />
                  <span>Holidays</span>
                </NavLink>
              </li>

            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountantSidebar;

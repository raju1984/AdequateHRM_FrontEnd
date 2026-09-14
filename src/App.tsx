  import React from "react";
  import { BrowserRouter, Routes, Route } from "react-router-dom";

  // ======================================================
  // HOME
  // ======================================================

  import Home from "./Screens/Home";
  import SelectRole from "./Screens/SelectRole";

  // ======================================================
  // ADMIN
  // ======================================================

  import DashboardLayout from "./Components/Admin/DashboardLayout";

  import AdminLogin from "./Screens/Admin/AdminLogin";
  import ForgotPassword from "./Screens/Admin/ForgotPassword";
  import AdminSignup from "./Screens/Admin/AdminSignup";

  import Dashboard from "./Screens/Admin/Dashboard";
  import Employees from "./Screens/Admin/Employees";
  import Departments from "./Screens/Admin/Departments";
  import Designations from "./Screens/Admin/Designations";
  import AdminHolidays from "./Screens/Admin/Holidays";
  import Leaves from "./Screens/Admin/Leaves";
  import LeaveType from "./Screens/Admin/LeaveType";
  import Attendance from "./Screens/Admin/Attendance";
  import EmployeSalary from "./Screens/Admin/EmployeSalary";
  import Users from "./Screens/Admin/Users";
  import RolesPermission from "./Screens/Admin/RolesPermission";
  import Profile from "./Screens/Admin/Profile";
  import EmployeDetails from "./Screens/Admin/EmployeDetails";

  // ======================================================
  // HR
  // ======================================================

  import Hrlogin from "./Screens/HR/HrLogin";
  import HrSignup from "./Screens/HR/HrSignup";
  import ForgetPassword from "./Screens/HR/ForgetPassword";

  import HrLayout from "./Components/Hr/HrLayout";

  import HrDashboard from "./Screens/HR/HrDashboard";
  import Employee from "./Screens/HR/Employee";
  import EmployeeDetails from "./Screens/HR/EmployeeDetails";

  import HrDepartments from "./Screens/HR/Departments";
  import HrDesignation from "./Screens/HR/Designations";
  import HrHoliday from "./Screens/HR/Holiday";
  import Leave from "./Screens/HR/Leave";
  import LeaveTyp from "./Screens/HR/LeaveTyp";
  import Atendance from "./Screens/HR/Atendance";
  import EmployeeSalary from "./Screens/HR/EmployeeSalary";
  import User from "./Screens/HR/User";
  import Roles from "./Screens/HR/Roles";
  import Profilee from "./Screens/HR/Profilee";

  import HROTP from "./Screens/HR/HROTP";
  import HRResetPassword from "./Screens/HR/HRResetPassword";

  // ======================================================
  // EMPLOYEE
  // ======================================================

  import EmployeLogin from "./Screens/Employee/EmployeLogin";
  import ForgetPasswordEmp from "./Screens/Employee/forgetPassword";
  import Signup from "./Screens/Employee/Signup";

  import EmployeeLayout from "./Components/Employee/EmployeeLayout";

  import EmployeDashboard from "./Screens/Employee/EmployeDasboard";
  import LEAVE from "./Screens/Employee/LEAVE";
  import AttendancePage from "./Screens/Employee/AttendancePage";
  import EmployeeHolidays from "./Screens/Employee/Holidays";
  import Profiles from "./Screens/Employee/Profiles";
  import Payslip from "./Screens/Employee/Payslip";
  import Viewpayslip from "./Screens/Employee/Viewpayslip";

  import OTP from "./Screens/Employee/OTP";
  import ResetPassword from "./Screens/Employee/ResetPassword";

  function App() {
    return (
      <BrowserRouter>
        <Routes>
          {/* ==================================================
              HOME
          ================================================== */}

          <Route path="/" element={<Home />} />

          <Route
            path="/admin/selectRole"
            element={<SelectRole />}
          />

          {/* ==================================================
              ADMIN AUTH
          ================================================== */}

          <Route
            path="/admin/adminLogin"
            element={<AdminLogin />}
          />

          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

          <Route
            path="/admin/signup"
            element={<AdminSignup />}
          />

          {/* ==================================================
              ADMIN - HEADER + SIDEBAR
          ================================================== */}

          <Route
            path="/admin/dashboard"
            element={
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            }
          />

          <Route
            path="/admin/employees"
            element={
              <DashboardLayout>
                <Employees />
              </DashboardLayout>
            }
          />

          <Route
            path="/admin/departments"
            element={
              <DashboardLayout>
                <Departments />
              </DashboardLayout>
            }
          />

          <Route
            path="/admin/designations"
            element={
              <DashboardLayout>
                <Designations />
              </DashboardLayout>
            }
          />

          <Route
            path="/admin/holidays"
            element={
              <DashboardLayout>
                <AdminHolidays />
              </DashboardLayout>
            }
          />

          <Route
            path="/admin/leaves"
            element={
              <DashboardLayout>
                <Leaves />
              </DashboardLayout>
            }
          />

          <Route
            path="/admin/leavetype"
            element={
              <DashboardLayout>
                <LeaveType />
              </DashboardLayout>
            }
          />

          <Route
            path="/admin/attendance"
            element={
              <DashboardLayout>
                <Attendance />
              </DashboardLayout>
            }
          />

          <Route
            path="/admin/employesalary"
            element={
              <DashboardLayout>
                <EmployeSalary />
              </DashboardLayout>
            }
          />

          <Route
            path="/admin/users"
            element={
              <DashboardLayout>
                <Users />
              </DashboardLayout>
            }
          />

          <Route
            path="/admin/rolespermission"
            element={
              <DashboardLayout>
                <RolesPermission />
              </DashboardLayout>
            }
          />

          <Route
            path="/admin/profile"
            element={
              <DashboardLayout>
                <Profile />
              </DashboardLayout>
            }
          />

      
<Route
  path="/Admin/EmployeeDetails/:employeeId"
  element={
    <DashboardLayout>
      <EmployeDetails />
    </DashboardLayout>
  }
/>


          {/* ==================================================
              HR AUTH
              NO HEADER / SIDEBAR
          ================================================== */}

          <Route
            path="/Hr/Hrlogin"
            element={<Hrlogin />}
          />

          <Route
            path="/Hr/HrSignup"
            element={<HrSignup />}
          />

          <Route
            path="/Hr/ForgetPassword"
            element={<ForgetPassword />}
          />

          <Route
            path="/Hr/HROTP"
            element={<HROTP />}
          />

          <Route
            path="/Hr/HRResetPassword"
            element={<HRResetPassword />}
          />

          {/* ==================================================
              HR - HEADER + SIDEBAR
          ================================================== */}

          <Route path="/Hr" element={<HrLayout />}>
            {/* HR Dashboard */}
            <Route
              path="HrDashboard"
              element={<HrDashboard />}
            />

            {/* Employees */}
            <Route
              path="Employee"
              element={<Employee />}
            />

            <Route
              path="EmployeeDetails/:employeeId"
              element={<EmployeeDetails />}
            />

            {/* Departments */}
            <Route
              path="Departments"
              element={<HrDepartments />}
            />

            {/* Designations */}
          <Route
    path="Designation"
    element={<HrDesignation />}
  />
            {/* Holidays */}
            <Route
              path="Holiday"
              element={<HrHoliday />}
            />

            {/* Leaves */}
            <Route
              path="Leave"
              element={<Leave />}
            />

            {/* Leave Type */}
            <Route
              path="LeaveTyp"
              element={<LeaveTyp />}
            />

            {/* Attendance */}
            <Route
              path="Atendance"
              element={<Atendance />}
            />

            {/* Employee Salary */}
            <Route
              path="EmployeeSalary"
              element={<EmployeeSalary />}
            />

            {/* Users */}
            <Route
              path="User"
              element={<User />}
            />

            {/* Roles */}
            <Route
              path="Roles"
              element={<Roles />}
            />

            {/* Profile */}
            <Route
              path="Profilee"
              element={<Profilee />}
            />
          </Route>

          {/* ==================================================
              EMPLOYEE AUTH
              NO HEADER / SIDEBAR
          ================================================== */}

          <Route
            path="/Employee/EmployeLogin"
            element={<EmployeLogin />}
          />

          <Route
            path="/Employee/ForgetPassword"
            element={<ForgetPasswordEmp />}
          />

          <Route
            path="/Employee/Signup"
            element={<Signup />}
          />

          <Route
            path="/Employee/OTP"
            element={<OTP />}
          />

          <Route
            path="/Employee/ResetPassword"
            element={<ResetPassword />}
          />

          {/* ==================================================
              EMPLOYEE - HEADER + SIDEBAR
          ================================================== */}

          <Route
            path="/Employee"
            element={<EmployeeLayout />}
          >
            <Route
              path="EmployeDashboard"
              element={<EmployeDashboard />}
            />

            <Route
              path="leave"
              element={<LEAVE />}
            />

            <Route
              path="Attendance"
              element={<AttendancePage />}
            />

            <Route
              path="Holidays"
              element={<EmployeeHolidays />}
            />

            <Route
              path="profiles"
              element={<Profiles />}
            />

            <Route
              path="payslip"
              element={<Payslip />}
            />

            <Route
              path="viewpayslip"
              element={<Viewpayslip />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    );
  }

  export default App;
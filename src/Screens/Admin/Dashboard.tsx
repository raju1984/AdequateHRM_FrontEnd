
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import { getAdminDashboard } from "../../services/adminservices";

import profileImg from "../../assets/img/profiles/avatar-31.jpg";
import avatar24 from "../../assets/img/profiles/avatar-24.jpg";
import avatar23 from "../../assets/img/profiles/avatar-23.jpg";
import avatar27 from "../../assets/img/profiles/avatar-27.jpg";
import avatar29 from "../../assets/img/profiles/avatar-29.jpg";
import avatar30 from "../../assets/img/profiles/avatar-30.jpg";
import avatar14 from "../../assets/img/profiles/avatar-14.jpg";

/* =====================================================
   TYPES
===================================================== */

interface DashboardResponse {
  statusCode: number;
  message: string;
  data: DashboardData;
  isSuccess: boolean;
}

interface DashboardData {
  welcome: {
    adminId: string;
    name: string;
    profilePicture: string | null;
    pendingApprovals: number;
    leaveRequests: number;
  };

  summary: {
    attendanceOverview: {
      presentToday: number;
      totalEmployees: number;
    };
    totalEmployees: number;
    totalDepartments: number;
    leaves: number;
    users: number;
  };

  employeesByDepartment: {
    period: string;
    data: {
      departmentId: string;
      department: string;
      totalEmployees: number;
      joinedInPeriod: number;
    }[];
    joinedCurrentPeriod: number;
    joinedPreviousPeriod: number;
    growthPercentage: number;
  };

  employeeStatus: any | null;

  topPerformer: any | null;

  attendanceOverview: {
    period: string;
    totalAttendance: number;

    present: {
      count: number;
      percentage: number;
    };

    late: {
      count: number;
      percentage: number;
    };

    permission: {
      count: number;
      percentage: number;
    };

    absent: {
      count: number;
      percentage: number;

      employees: {
        employeeId: string;
        employeeCode: string;
        name: string;
        profilePicture: string | null;
        department: string | null;
        designation: string | null;
      }[];
    };
  };

  clockInOut: {
    attendanceId: string;
    employeeId: string;
    employeeCode: string;
    name: string;
    profilePicture: string | null;
    departmentId: string | null;
    department: string | null;
    designation: string | null;
    date: string;
    checkIn: string | null;
    checkOut: string | null;
    breakMinutes: number;
    lateMinutes: number;
    productionHours: number;
    overtimeMinutes: number;
  }[];

  lateEmployees: {
    attendanceId: string;
    employeeId: string;
    employeeCode: string;
    name: string;
    profilePicture: string | null;
    designation: string | null;
    department: string | null;
    checkInTime: string | null;
    lateMinutes: number;
    date: string;
  }[];

  departments: {
    id: string;
    name: string;
  }[];
}

/* =====================================================
   HELPERS
===================================================== */

const formatTime = (dateString: string | null) => {
  if (!dateString) return "--:--";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "--:--";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const formatHours = (hours: number) => {
  if (!hours) return "0 Hrs";
  return `${hours.toFixed(2)} Hrs`;
};

const getProfileImage = (
  profilePicture: string | null | undefined,
  fallback: string
) => {
  if (!profilePicture) return fallback;

  /*
   * If API already returns a complete URL, use it.
   */
  if (
    profilePicture.startsWith("http://") ||
    profilePicture.startsWith("https://")
  ) {
    return profilePicture;
  }

  /*
   * API response currently returns paths such as:
   * ProfilePictures/xxx.png
   * Uploads/ProfilePictures/xxx.png
   */
  return `http://jupiterapi.adequateshop.com/${profilePicture}`;
};

/* =====================================================
   DASHBOARD
===================================================== */

const Dashboard = () => {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] =
    useState<DashboardData | null>(null);

  const [dashboardLoading, setDashboardLoading] =
    useState(false);

  const [dashboardError, setDashboardError] =
    useState("");

  /* =====================================================
     GET DASHBOARD API
  ===================================================== */

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setDashboardLoading(true);
        setDashboardError("");

        const response =
          (await getAdminDashboard({
            AttendancePeriod: "Today",
            DepartmentPeriod: "This Week",
            ClockInOutCount: 10,
            LateEmployeeCount: 10,
          })) as DashboardResponse;

        console.log(
          "DASHBOARD API RESPONSE:",
          response
        );

        if (response?.data) {
          setDashboardData(response.data);
        } else {
          throw new Error(
            "Dashboard data not found."
          );
        }
      } catch (error: any) {
        console.error(
          "DASHBOARD API ERROR:",
          error
        );

        setDashboardError(
          error?.message ||
            "Failed to load dashboard data."
        );
      } finally {
        setDashboardLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  /* =====================================================
     LOADING
  ===================================================== */

  if (dashboardLoading && !dashboardData) {
    return (
      <div
        className="page-content dashboard-exact"
        style={{
          paddingTop: 30,
          textAlign: "center",
        }}
      >
        <div className="card">
          <div className="card-body py-5">
            <div
              className="spinner-border"
              role="status"
            />

            <p className="mt-3 mb-0">
              Loading dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (dashboardError && !dashboardData) {
    return (
      <div
        className="page-content dashboard-exact"
        style={{ paddingTop: 30 }}
      >
        <div className="card">
          <div className="card-body">
            <div className="alert alert-danger mb-0">
              {dashboardError}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /*
   * Until API data is loaded.
   */
  if (!dashboardData) {
    return null;
  }

  const {
    welcome,
    summary,
    employeesByDepartment,
    employeeStatus,
    topPerformer,
    attendanceOverview,
    clockInOut,
    lateEmployees,
  } = dashboardData;

  /* =====================================================
     DERIVED DATA
  ===================================================== */

  const departmentData =
    employeesByDepartment?.data?.map(
      (item) => ({
        name: item.department,
        employees: item.totalEmployees,
      })
    ) || [];

  const attendancePresent =
    attendanceOverview?.present?.percentage || 0;

  const attendanceLate =
    attendanceOverview?.late?.percentage || 0;

  const attendancePermission =
    attendanceOverview?.permission?.percentage || 0;

  const attendanceAbsent =
    attendanceOverview?.absent?.percentage || 0;

  const totalAttendance =
    attendanceOverview?.totalAttendance || 0;

  const totalEmployees =
    summary?.totalEmployees || 0;

  const totalDepartments =
    summary?.totalDepartments || 0;

  const totalLeaves =
    summary?.leaves || 0;

  const totalUsers =
    summary?.users || 0;

  const presentToday =
    summary?.attendanceOverview?.presentToday || 0;

  /* =====================================================
     EMPLOYEE STATUS
  ===================================================== */

  const hasEmployeeStatus =
    employeeStatus !== null &&
    employeeStatus !== undefined;

  /* =====================================================
     TOP PERFORMER
  ===================================================== */

  const hasTopPerformer =
    topPerformer !== null &&
    topPerformer !== undefined;

  return (
    <div
      className="page-content dashboard-exact"
      style={{ paddingTop: 5 }}
    >
      <style>{`

        .dashboard-exact {
          color: #0f2348;
        }

        .dashboard-exact .card {
          border: 1px solid #e6e9ee;
          border-radius: 6px;
          box-shadow: 0 1px 2px rgba(16,24,40,.04);
          background: #fff;
        }

        .dashboard-exact .card-header {
          min-height: 60px;
          padding: 16px 20px;
          background: #fff;
          border-bottom: 1px solid #e6e9ee;
        }

        .dashboard-exact .card-header h5 {
          font-size: 16px;
          font-weight: 600;
          color: #09224b;
          margin: 0;
        }

        .dashboard-exact .btn-filter {
          min-height: 30px;
          padding: 4px 10px;
          border: 1px solid #dfe3e8;
          border-radius: 5px;
          background: #fff;
          color: #0a2349;
          font-size: 12px;
          line-height: 20px;
        }

        .dashboard-exact .welcome-card .card-body {
          min-height: 98px;
          padding: 20px;
        }

        .dashboard-exact .welcome-avatar {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          object-fit: cover;
          background: #d9d9d9;
        }

        /*
         * TOP SUMMARY CARDS
         */

        .dashboard-exact .top-summary-row {
          display: flex;
          flex-wrap: wrap;
          gap: 24px;
        }

        .dashboard-exact .top-summary-card {
          flex: 1 1 0;
          min-width: 0;
        }

        .dashboard-exact .top-summary-card .metric-card {
          width: 100%;
        }

        .dashboard-exact .metric-card {
          min-height: 173px;
        }

        .dashboard-exact .metric-card .card-body {
          padding: 20px;
        }

        .dashboard-exact .metric-icon {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          margin-bottom: 10px;
        }

        .dashboard-exact .metric-title {
          font-size: 13px;
          color: #5b6474;
          margin-bottom: 2px;
        }

        .dashboard-exact .metric-value {
          font-size: 21px;
          font-weight: 600;
          color: #0b234b;
          margin-top: 4px;
        }

        /*
         * Make top cards clickable
         */

        .dashboard-exact .metric-card-clickable {
          cursor: pointer;
          text-decoration: none;
          color: inherit;
          display: block;
          transition:
            transform 0.15s ease,
            box-shadow 0.15s ease;
        }

        .dashboard-exact .metric-card-clickable:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 16px rgba(16,24,40,.10);
        }

        .dashboard-exact .section-gap {
          margin-bottom: 24px;
        }

        .dashboard-exact .dept-card .card-body {
          padding: 20px 20px 16px;
        }

        .dashboard-exact .dept-note {
          font-size: 13px;
          color: #7b8495;
          margin: 7px 0 5px;
        }

        .dashboard-exact .status-card .card-body {
          padding: 20px;
        }

        .dashboard-exact .status-total-label {
          font-size: 13px;
          color: #6c7587;
        }

        .dashboard-exact .status-total-number {
          font-size: 20px;
          font-weight: 600;
          color: #0b234b;
        }

        .dashboard-exact .status-strip {
          height: 24px;
          border-radius: 6px;
          overflow: hidden;
          display: flex;
          margin: 14px 0 16px;
        }

        .dashboard-exact .status-grid {
          border: 1px solid #dfe3e8;
        }

        .dashboard-exact .status-cell {
          min-height: 87px;
          padding: 10px 12px;
        }

        .dashboard-exact .status-cell:nth-child(1),
        .dashboard-exact .status-cell:nth-child(3) {
          border-right: 1px solid #dfe3e8;
        }

        .dashboard-exact .status-cell:nth-child(1),
        .dashboard-exact .status-cell:nth-child(2) {
          border-bottom: 1px solid #dfe3e8;
        }

        .dashboard-exact .status-label {
          font-size: 13px;
          color: #5e6879;
          margin-bottom: 8px;
        }

        .dashboard-exact .status-big {
          font-size: 36px;
          line-height: 1;
          font-weight: 600;
          color: #0b234b;
          margin: 0;
        }

        .dashboard-exact .performer-title {
          font-size: 13px;
          font-weight: 600;
          color: #0b234b;
          margin: 14px 0 10px;
        }

        .dashboard-exact .performer-box {
          border: 1px solid #c89435;
          border-radius: 6px;
          background: #fff3ea;
          min-height: 61px;
          padding: 8px 10px;
        }

        .dashboard-exact .performer-box h6 {
          font-size: 13px;
          margin-bottom: 2px;
          color: #0b234b;
        }

        .dashboard-exact .performer-box p {
          font-size: 12px;
          margin: 0;
          color: #667085;
        }

        .dashboard-exact .view-all-btn {
          min-height: 34px;
          font-size: 12px;
          background: #f7f8fa;
          color: #0b234b;
          border: 0;
        }

        .dashboard-exact .attendance-card .card-body,
        .dashboard-exact .clock-card .card-body {
          padding: 18px 20px 20px;
        }

        .dashboard-exact .gauge-wrap {
          position: relative;
          width: 300px;
          height: 205px;
          margin: 0 auto 8px;
        }

        .dashboard-exact .gauge-text {
          position: absolute;
          left: 0;
          right: 0;
          top: 103px;
          text-align: center;
        }

        .dashboard-exact .gauge-text p {
          margin: 0;
          font-size: 13px;
          color: #7a8290;
        }

        .dashboard-exact .gauge-text strong {
          display: block;
          margin-top: 2px;
          font-size: 21px;
          color: #1f2d4d;
        }

        .dashboard-exact .attendance-status-title {
          font-size: 14px;
          font-weight: 600;
          margin: 0 0 12px;
          color: #0b234b;
        }

        .dashboard-exact .status-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          font-size: 13px;
        }

        .dashboard-exact .absent-box {
          background: #f8f9fb;
          border-radius: 5px;
          min-height: 42px;
          padding: 8px 10px;
        }

        .dashboard-exact .stacked-avatar {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: 2px solid #fff;
          object-fit: cover;
          margin-left: -7px;
        }

        .dashboard-exact .stacked-avatar:first-child {
          margin-left: 0;
        }

        .dashboard-exact .clock-person {
          border: 1px dashed #d9dee7;
          border-radius: 6px;
          padding: 8px 10px;
          min-height: 61px;
          margin-bottom: 14px;
        }

        .dashboard-exact .clock-person img {
          width: 42px;
          height: 42px;
          object-fit: cover;
        }

        .dashboard-exact .clock-person h6 {
          font-size: 13px;
          color: #0b234b;
          margin: 0 0 2px;
        }

        .dashboard-exact .clock-person p {
          font-size: 12px;
          color: #6d7685;
          margin: 0;
        }

        .dashboard-exact .time-pill {
          min-width: 51px;
          height: 20px;
          border-radius: 5px;
          padding: 1px 7px;
          color: #fff;
          font-size: 11px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .dashboard-exact .clock-expanded {
          border: 1px solid #dfe3e8;
          border-radius: 6px;
          padding: 8px 10px 7px;
          margin-top: 8px;
        }

        .dashboard-exact .clock-stat p {
          font-size: 12px;
          margin: 0 0 2px;
          color: #5d6675;
        }

        .dashboard-exact .clock-stat h6 {
          font-size: 12px;
          margin: 0;
          color: #0b234b;
          font-weight: 500;
        }

        .dashboard-exact .late-title {
          font-size: 13px;
          font-weight: 600;
          color: #0b234b;
          margin: 8px 0 10px;
        }

        .dashboard-exact .tiny-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          display: inline-block;
          margin-right: 6px;
        }

        /*
         * Responsive
         */

        @media (max-width: 1199px) {
          .dashboard-exact .top-summary-card {
            flex: 0 0 calc(50% - 12px);
          }
        }

        @media (max-width: 575px) {
          .dashboard-exact .top-summary-card {
            flex: 0 0 100%;
          }

          .dashboard-exact .gauge-wrap {
            width: 100%;
            max-width: 300px;
          }
        }

      `}</style>

      {/* =====================================================
          BREADCRUMB
      ===================================================== */}

      <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-4">
        <div>
          <h2
            className="mb-1 fs-24"
            style={{ color: "#0b234b" }}
          >
            Dashboard
          </h2>

          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <a href="/">
                  <i className="ti ti-smart-home" />
                </a>
              </li>

              <li className="breadcrumb-item active">
                Dashboard
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* =====================================================
          WELCOME
      ===================================================== */}

      <div className="card welcome-card mb-4">
        <div className="card-body d-flex align-items-center">
          <img
            src={getProfileImage(
              welcome?.profilePicture,
              profileImg
            )}
            className="welcome-avatar"
            alt="profile"
            onError={(event) => {
              event.currentTarget.src = profileImg;
            }}
          />

          <div className="ms-3">
            <h3
              className="mb-2"
              style={{
                fontSize: 21,
                fontWeight: 600,
                color: "#0b234b",
              }}
            >
              Welcome Back,{" "}
              {welcome?.name || "Admin"}

              <i
                className="ti ti-edit-circle ms-1"
                style={{
                  color: "#87909d",
                  fontSize: 18,
                }}
              />
            </h3>

            <p
              className="mb-0"
              style={{
                fontSize: 14,
                color: "#657084",
              }}
            >
              You have{" "}
              <span
                style={{
                  color: "#c39032",
                  textDecoration: "underline",
                }}
              >
                {welcome?.pendingApprovals || 0}
              </span>{" "}
              Pending Approvals &amp;{" "}
              <span
                style={{
                  color: "#c39032",
                  textDecoration: "underline",
                }}
              >
                {welcome?.leaveRequests || 0}
              </span>{" "}
              Leave Requests
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          SUMMARY CARDS - ALL 5 IN SAME ROW
      ===================================================== */}

      <div className="top-summary-row mb-4">

        {/* Attendance */}
        <div className="top-summary-card">
          <div
            className="card metric-card metric-card-clickable"
            onClick={() =>
              navigate("/admin/attendance")
            }
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" ||
                event.key === " "
              ) {
                navigate("/admin/attendance");
              }
            }}
          >
            <div className="card-body">
              <span
                className="metric-icon"
                style={{
                  background: "#c49336",
                }}
              >
                <i className="ti ti-calendar-share fs-18" />
              </span>

              <div className="metric-title">
                Attendance Overview
              </div>

              <div className="metric-value">
                {presentToday}/{totalEmployees}
              </div>
            </div>
          </div>
        </div>

        {/* Employees */}
        <div className="top-summary-card">
          <div
            className="card metric-card metric-card-clickable"
            onClick={() =>
              navigate("/admin/employees")
            }
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" ||
                event.key === " "
              ) {
                navigate("/admin/employees");
              }
            }}
          >
            <div className="card-body">
              <span
                className="metric-icon"
                style={{
                  background: "#34798a",
                }}
              >
                <i className="ti ti-users fs-18" />
              </span>

              <div className="metric-title">
                Total Employee
              </div>

              <div className="metric-value">
                {totalEmployees}
              </div>
            </div>
          </div>
        </div>

        {/* Departments */}
        <div className="top-summary-card">
          <div
            className="card metric-card metric-card-clickable"
            onClick={() =>
              navigate("/admin/departments")
            }
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" ||
                event.key === " "
              ) {
                navigate("/admin/departments");
              }
            }}
          >
            <div className="card-body">
              <span
                className="metric-icon"
                style={{
                  background: "#1677ff",
                }}
              >
                <i className="ti ti-category-plus fs-18" />
              </span>

              <div className="metric-title">
                Total Departments
              </div>

              <div className="metric-value">
                {String(
                  totalDepartments
                ).padStart(2, "0")}
              </div>
            </div>
          </div>
        </div>

        {/* Leaves */}
        <div className="top-summary-card">
          <div
            className="card metric-card metric-card-clickable"
            onClick={() =>
              navigate("/admin/leaves")
            }
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" ||
                event.key === " "
              ) {
                navigate("/admin/leaves");
              }
            }}
          >
            <div className="card-body">
              <span
                className="metric-icon"
                style={{
                  background: "#f6358c",
                }}
              >
                <i className="ti ti-forms fs-18" />
              </span>

              <div className="metric-title">
                Leaves
              </div>

              <div className="metric-value">
                {totalLeaves}
              </div>
            </div>
          </div>
        </div>

        {/* Users */}
        <div className="top-summary-card">
          <div
            className="card metric-card metric-card-clickable"
            onClick={() =>
              navigate("/admin/users")
            }
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" ||
                event.key === " "
              ) {
                navigate("/admin/users");
              }
            }}
          >
            <div className="card-body">
              <span
                className="metric-icon"
                style={{
                  background: "#ad3cc4",
                }}
              >
                <i className="ti ti-user fs-18" />
              </span>

              <div className="metric-title">
                Users
              </div>

              <div className="metric-value">
                {String(totalUsers).padStart(2, "0")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          EMPLOYEES BY DEPARTMENT
      ===================================================== */}

      <div className="card dept-card mb-4">
        <div className="card-header d-flex align-items-center justify-content-between">
          <h5>
            Employees By Department
          </h5>

          <button className="btn-filter">
            <i className="ti ti-calendar me-1" />
            This Week
          </button>
        </div>

        <div className="card-body">
          <div
            style={{
              width: "100%",
              height: 225,
            }}
          >
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                layout="vertical"
                data={departmentData}
                margin={{
                  top: 5,
                  right: 12,
                  left: 4,
                  bottom: 0,
                }}
                barCategoryGap={16}
              >
                <CartesianGrid
                  stroke="#e7eaf0"
                  strokeDasharray="5 5"
                  horizontal={true}
                  vertical={false}
                />

                <XAxis
                  type="number"
                  domain={[0, "dataMax + 1"]}
                  axisLine={{
                    stroke: "#d7dce4",
                  }}
                  tickLine={false}
                  tick={{
                    fontSize: 11,
                    fill: "#111",
                  }}
                />

                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  width={100}
                  tick={{
                    fontSize: 11,
                    fill: "#111",
                  }}
                />

                <Tooltip />

                <Bar
                  dataKey="employees"
                  fill="#ff7a45"
                  barSize={11}
                  radius={[
                    6,
                    6,
                    6,
                    6,
                  ]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="dept-note">
            <span
              style={{
                color: "#c49336",
                fontSize: 16,
              }}
            >
              •
            </span>
            &nbsp; No of Employees increased by{" "}
            <strong
              style={{
                color:
                  employeesByDepartment.growthPercentage >=
                  0
                    ? "#00b85a"
                    : "#ef1111",
              }}
            >
              {employeesByDepartment.growthPercentage >=
              0
                ? "+"
                : ""}
              {
                employeesByDepartment.growthPercentage
              }
              %
            </strong>{" "}
            from last Week
          </p>
        </div>
      </div>

      {/* =====================================================
          EMPLOYEE STATUS
      ===================================================== */}

      <div className="card status-card mb-4">
        <div className="card-header d-flex align-items-center justify-content-between">
          <h5>Employee Status</h5>

          <button className="btn-filter">
            <i className="ti ti-calendar me-1" />
            This Week
          </button>
        </div>

        <div className="card-body">
          {!hasEmployeeStatus ? (
            <div
              className="text-center py-4"
              style={{
                color: "#7b8495",
                fontSize: 13,
              }}
            >
              Employee status data is not available
              from the API.
            </div>
          ) : (
            <div>
              <div className="text-muted">
                Employee status data loaded.
              </div>
            </div>
          )}

          {/* Top Performer */}

          <div className="performer-title">
            Top Performer
          </div>

          {!hasTopPerformer ? (
            <div className="performer-box d-flex align-items-center">
              <i
                className="ti ti-award-filled me-2"
                style={{
                  color: "#c49336",
                  fontSize: 22,
                }}
              />

              <div>
                <h6>
                  No top performer data
                </h6>

                <p>
                  Top performer information is not
                  available from the API.
                </p>
              </div>
            </div>
          ) : (
            <div className="performer-box">
              Top performer data available.
            </div>
          )}

          <Link
            to="/admin/employees"
            className="btn view-all-btn w-100 mt-4"
          >
            View All Employees
          </Link>
        </div>
      </div>

      {/* =====================================================
          BOTTOM ROW
      ===================================================== */}

      <div className="row g-4">

        {/* =====================================================
            ATTENDANCE OVERVIEW
        ===================================================== */}

        <div className="col-xl-6 d-flex">
          <div className="card attendance-card flex-fill">

            <div className="card-header d-flex align-items-center justify-content-between">
              <h5>
                Attendance Overview
              </h5>

              <button className="btn-filter">
                <i className="ti ti-calendar me-1" />
                Today
              </button>
            </div>

            <div className="card-body">

              {/* Gauge */}

              <div className="gauge-wrap">
                <svg
                  width="300"
                  height="175"
                  viewBox="0 0 300 175"
                  aria-hidden="true"
                >
                  {/* Present */}

                  <path
                    d="M 42 150 A 108 108 0 0 1 258 150"
                    pathLength="100"
                    fill="none"
                    stroke="#08c85b"
                    strokeWidth="52"
                    strokeLinecap="round"
                    strokeDasharray={`${attendancePresent} ${
                      100 - attendancePresent
                    }`}
                    strokeDashoffset="0"
                  />

                  {/* Late */}

                  <path
                    d="M 42 150 A 108 108 0 0 1 258 150"
                    pathLength="100"
                    fill="none"
                    stroke="#347889"
                    strokeWidth="52"
                    strokeLinecap="round"
                    strokeDasharray={`${attendanceLate} ${
                      100 - attendanceLate
                    }`}
                    strokeDashoffset="-25"
                  />

                  {/* Permission */}

                  <path
                    d="M 42 150 A 108 108 0 0 1 258 150"
                    pathLength="100"
                    fill="none"
                    stroke="#ffbd0a"
                    strokeWidth="52"
                    strokeLinecap="round"
                    strokeDasharray={`${attendancePermission} ${
                      100 - attendancePermission
                    }`}
                    strokeDashoffset="-50"
                  />

                  {/* Absent */}

                  <path
                    d="M 42 150 A 108 108 0 0 1 258 150"
                    pathLength="100"
                    fill="none"
                    stroke="#f20d0d"
                    strokeWidth="52"
                    strokeLinecap="round"
                    strokeDasharray={`${attendanceAbsent} ${
                      100 - attendanceAbsent
                    }`}
                    strokeDashoffset="-75"
                  />
                </svg>

                <div className="gauge-text">
                  <p>Total Attendance</p>

                  <strong>
                    {totalAttendance}
                  </strong>
                </div>
              </div>

              {/* Status */}

              <div className="attendance-status-title">
                Status
              </div>

              <div className="status-row">
                <span>
                  <span
                    className="tiny-dot"
                    style={{
                      background: "#08c85b",
                    }}
                  />
                  Present
                </span>

                <strong>
                  {attendancePresent}%
                </strong>
              </div>

              <div className="status-row">
                <span>
                  <span
                    className="tiny-dot"
                    style={{
                      background: "#347889",
                    }}
                  />
                  Late
                </span>

                <strong>
                  {attendanceLate}%
                </strong>
              </div>

              <div className="status-row">
                <span>
                  <span
                    className="tiny-dot"
                    style={{
                      background: "#ffbd0a",
                    }}
                  />
                  Permission
                </span>

                <strong>
                  {attendancePermission}%
                </strong>
              </div>

              <div
                className="status-row"
                style={{
                  marginBottom: 16,
                }}
              >
                <span>
                  <span
                    className="tiny-dot"
                    style={{
                      background: "#f20d0d",
                    }}
                  />
                  Absent
                </span>

                <strong>
                  {attendanceAbsent}%
                </strong>
              </div>

              {/* Absent employees */}

              <div className="absent-box d-flex align-items-center justify-content-between">

                <div className="d-flex align-items-center">

                  <span
                    style={{
                      fontSize: 12,
                      color: "#6b7585",
                      marginRight: 8,
                    }}
                  >
                    Total Absenties
                  </span>

                  <div className="d-flex align-items-center">

                    {attendanceOverview?.absent?.employees
                      ?.slice(0, 4)
                      .map(
                        (
                          employee,
                          index
                        ) => (
                          <img
                            key={
                              employee.employeeId
                            }
                            src={getProfileImage(
                              employee.profilePicture,
                              [
                                avatar27,
                                avatar30,
                                avatar14,
                                avatar29,
                              ][
                                index % 4
                              ]
                            )}
                            className="stacked-avatar"
                            alt={
                              employee.name
                            }
                            title={
                              employee.name
                            }
                            onError={(
                              event
                            ) => {
                              event.currentTarget.src =
                                [
                                  avatar27,
                                  avatar30,
                                  avatar14,
                                  avatar29,
                                ][
                                  index % 4
                                ];
                            }}
                          />
                        )
                      )}

                    {attendanceOverview?.absent?.employees
                      ?.length >
                      4 && (
                      <span
                        className="stacked-avatar d-inline-flex align-items-center justify-content-center"
                        style={{
                          background:
                            "#c49336",
                          color:
                            "#fff",
                          fontSize: 10,
                        }}
                      >
                        +
                        {attendanceOverview
                          .absent
                          .employees
                          .length -
                          4}
                      </span>
                    )}
                  </div>
                </div>

                <Link
                  to="/admin/attendance"
                  style={{
                    fontSize: 12,
                    color: "#c49336",
                    textDecoration:
                      "underline",
                  }}
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            CLOCK IN / OUT
        ===================================================== */}

        <div className="col-xl-6 d-flex">
          <div className="card clock-card flex-fill">

            <div className="card-header d-flex align-items-center justify-content-between">
              <h5>Clock-In/Out</h5>

              <div className="d-flex align-items-center gap-3">

                <button
                  className="btn border-0 p-0"
                  style={{
                    fontSize: 13,
                    color: "#0b234b",
                    background:
                      "transparent",
                  }}
                >
                  All Departments{" "}
                  <i className="ti ti-chevron-down ms-1" />
                </button>

                <button className="btn-filter">
                  <i className="ti ti-calendar me-1" />
                  Today
                </button>

              </div>
            </div>

            <div className="card-body">

              {/* Clock In/Out records */}

              {clockInOut?.length > 0 ? (
                clockInOut.map(
                  (
                    employee,
                    index
                  ) => (
                    <div
                      className="clock-person d-flex align-items-center justify-content-between"
                      key={
                        employee.attendanceId
                      }
                    >
                      <div className="d-flex align-items-center">

                        <img
                          src={getProfileImage(
                            employee.profilePicture,
                            [
                              avatar24,
                              avatar23,
                              avatar27,
                            ][
                              index % 3
                            ]
                          )}
                          className="rounded-circle"
                          alt={
                            employee.name
                          }
                          onError={(
                            event
                          ) => {
                            event.currentTarget.src =
                              [
                                avatar24,
                                avatar23,
                                avatar27,
                              ][
                                index % 3
                              ];
                          }}
                        />

                        <div className="ms-2">

                          <h6>
                            {employee.name ||
                              "Unknown Employee"}
                          </h6>

                          <p>
                            {employee.designation ||
                              employee.department ||
                              "Employee"}
                          </p>

                        </div>
                      </div>

                      <div className="d-flex align-items-center">

                        <i
                          className="ti ti-clock-share me-2"
                          style={{
                            color:
                              "#687587",
                            fontSize:
                              15,
                          }}
                        />

                        <span
                          className="time-pill"
                          style={{
                            background:
                              employee.checkIn
                                ? "#08c85b"
                                : "#f20d0d",
                          }}
                        >
                          •{" "}
                          {formatTime(
                            employee.checkIn
                          )}
                        </span>

                      </div>
                    </div>
                  )
                )
              ) : (
                <div
                  className="text-center py-4"
                  style={{
                    color: "#7b8495",
                    fontSize: 13,
                  }}
                >
                  No clock-in/out records found.
                </div>
              )}

              {/* =================================================
                  LATE
              ================================================= */}

              <div className="late-title">
                Late
              </div>

              {lateEmployees?.length > 0 ? (
                lateEmployees.map(
                  (
                    employee,
                    index
                  ) => (
                    <div
                      className="clock-person d-flex align-items-center justify-content-between"
                      style={{
                        marginBottom: 14,
                      }}
                      key={
                        employee.attendanceId
                      }
                    >
                      <div className="d-flex align-items-center">

                        <img
                          src={getProfileImage(
                            employee.profilePicture,
                            [
                              avatar29,
                              avatar30,
                              avatar14,
                            ][
                              index % 3
                            ]
                          )}
                          className="rounded-circle"
                          alt={
                            employee.name
                          }
                          onError={(
                            event
                          ) => {
                            event.currentTarget.src =
                              [
                                avatar29,
                                avatar30,
                                avatar14,
                              ][
                                index % 3
                              ];
                          }}
                        />

                        <div className="ms-2">

                          <div className="d-flex align-items-center gap-2">

                            <h6>
                              {employee.name ||
                                "Unknown Employee"}
                            </h6>

                            <span
                              style={{
                                background:
                                  "#f20d0d",
                                color:
                                  "#fff",
                                fontSize:
                                  10,
                                fontWeight:
                                  600,
                                borderRadius:
                                  10,
                                padding:
                                  "2px 7px",
                              }}
                            >
                              <i className="ti ti-clock me-1" />
                              {
                                employee.lateMinutes
                              }{" "}
                              Min
                            </span>

                          </div>

                          <p>
                            {employee.designation ||
                              employee.department ||
                              "Employee"}
                          </p>

                        </div>
                      </div>

                      <div className="d-flex align-items-center">

                        <i
                          className="ti ti-clock-share me-2"
                          style={{
                            color:
                              "#687587",
                            fontSize:
                              15,
                          }}
                        />

                        <span
                          className="time-pill"
                          style={{
                            background:
                              "#f20d0d",
                          }}
                        >
                          •{" "}
                          {formatTime(
                            employee.checkInTime
                          )}
                        </span>

                      </div>
                    </div>
                  )
                )
              ) : (
                <div
                  className="text-center py-3"
                  style={{
                    color: "#7b8495",
                    fontSize: 13,
                  }}
                >
                  No late employees found.
                </div>
              )}

              <button
                onClick={() =>
                  navigate(
                    "/admin/attendance"
                  )
                }
                className="btn view-all-btn w-100"
              >
                View All Attendance
              </button>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;



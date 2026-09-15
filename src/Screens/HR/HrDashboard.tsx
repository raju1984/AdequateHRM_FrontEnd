import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import "../../assets/css/HrDashboard.css";

import {
  CalendarDays,
  Users,
  Grid2X2,
  FileText,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Medal,
  Clock3,
} from "lucide-react";

import avatar27 from "../../assets/img/profiles/avatar-27.jpg";
import avatar30 from "../../assets/img/profiles/avatar-30.jpg";
import avatar14 from "../../assets/img/profiles/avatar-14.jpg";
import avatar29 from "../../assets/img/profiles/avatar-29.jpg";

import { getHRDashboard } from "../../services/hrservices";

const HrDashboard = () => {
  const navigate = useNavigate();

  // =====================================================
  // CALENDAR
  // =====================================================

  const [currentDate, setCurrentDate] = useState(() => new Date());

  const today = new Date();

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  const prevMonthDays = new Date(
    year,
    month,
    0
  ).getDate();

  const calendarDays: {
    day: number;
    currentMonth: boolean;
  }[] = [];

  // Previous month dates
  for (let i = firstDayOfMonth; i > 0; i--) {
    calendarDays.push({
      day: prevMonthDays - i + 1,
      currentMonth: false,
    });
  }

  // Current month dates
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      currentMonth: true,
    });
  }

  // Complete 6 week calendar
  let nextDay = 1;

  while (calendarDays.length < 42) {
    calendarDays.push({
      day: nextDay,
      currentMonth: false,
    });

    nextDay++;
  }

  // =====================================================
  // API STATE
  // =====================================================

  const [dashboardData, setDashboardData] =
    useState<any>(null);

  const [dashboardLoading, setDashboardLoading] =
    useState(true);

  const [dashboardError, setDashboardError] =
    useState("");

  // =====================================================
  // FETCH HR DASHBOARD
  // =====================================================

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setDashboardLoading(true);
        setDashboardError("");

        const response = await getHRDashboard({
          AttendancePeriod: "Today",
          RecentAttendanceCount: 10,
          LateEmployeeCount: 10,
        });

        console.log(
          "HR DASHBOARD RESPONSE:",
          response
        );

        /*
         * API response:
         *
         * {
         *   statusCode: 200,
         *   message: "...",
         *   data: {...},
         *   isSuccess: true
         * }
         *
         * Keep the inner data object.
         */
        setDashboardData(
          response?.data ?? response
        );
      } catch (error: any) {
        console.error(
          "HR DASHBOARD API ERROR:",
          error
        );

        setDashboardError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to load dashboard data."
        );
      } finally {
        setDashboardLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // =====================================================
  // SAFE API DATA
  // =====================================================

  const data = dashboardData || {};

  /*
   * These mappings support the dashboard response shape
   * already available from your API examples.
   *
   * If HRDashboard returns slightly different property
   * names, console.log above will show the exact response.
   */

  const welcome = data?.welcome || {};

  const summary = data?.summary || {};

  const attendanceOverview =
    data?.attendanceOverview ||
    summary?.attendanceOverview ||
    {};

  const employeesByDepartment =
    data?.employeesByDepartment || {};

  const employeeStatus =
    data?.employeeStatus || {};

  const topPerformer =
    data?.topPerformer || {};

  const clockInOut =
    Array.isArray(data?.clockInOut)
      ? data.clockInOut
      : [];

  const lateEmployees =
    Array.isArray(data?.lateEmployees)
      ? data.lateEmployees
      : [];

  // =====================================================
  // DASHBOARD VALUES
  // =====================================================

  const totalEmployees =
    summary?.totalEmployees ??
    data?.totalEmployees ??
    25;

  const totalDepartments =
    summary?.totalDepartments ??
    data?.totalDepartments ??
    8;

  const leaves =
    summary?.leaves ??
    data?.leaves ??
    25;

  const presentToday =
    attendanceOverview?.presentToday ??
    attendanceOverview?.present?.count ??
    summary?.attendanceOverview?.presentToday ??
    20;

  const attendanceTotal =
    attendanceOverview?.totalAttendance ??
    summary?.attendanceOverview?.totalEmployees ??
    totalEmployees;

  // =====================================================
  // ATTENDANCE STATUS
  // =====================================================

  const presentPercentage =
    attendanceOverview?.present?.percentage ??
    59;

  const latePercentage =
    attendanceOverview?.late?.percentage ??
    21;

  const permissionPercentage =
    attendanceOverview?.permission?.percentage ??
    2;

  const absentPercentage =
    attendanceOverview?.absent?.percentage ??
    15;

  const absentEmployees =
    Array.isArray(
      attendanceOverview?.absent?.employees
    )
      ? attendanceOverview.absent.employees
      : [];

  // =====================================================
  // EMPLOYEE STATUS
  // =====================================================

  const employeeStatusTotal =
    employeeStatus?.totalEmployee ??
    employeeStatus?.totalEmployees ??
    totalEmployees;

  const fullTime =
    employeeStatus?.fulltime ??
    employeeStatus?.fullTime ??
    employeeStatus?.fullTimeEmployees ??
    112;

  const contract =
    employeeStatus?.contract ??
    employeeStatus?.contractEmployees ??
    112;

  const probation =
    employeeStatus?.probation ??
    employeeStatus?.probationEmployees ??
    12;

  const wfh =
    employeeStatus?.wfh ??
    employeeStatus?.WFH ??
    employeeStatus?.wfhEmployees ??
    4;

  const fullTimePercentage =
    employeeStatus?.fulltimePercentage ??
    employeeStatus?.fullTimePercentage ??
    48;

  const contractPercentage =
    employeeStatus?.contractPercentage ??
    20;

  const probationPercentage =
    employeeStatus?.probationPercentage ??
    22;

  const wfhPercentage =
    employeeStatus?.wfhPercentage ??
    20;

  // =====================================================
  // TOP PERFORMER
  // =====================================================

  const performerName =
    topPerformer?.name ||
    topPerformer?.employeeName ||
    "Daniel Esbella";

  const performerDesignation =
    topPerformer?.designation ||
    topPerformer?.role ||
    "IOS Developer";

  const performerPerformance =
    topPerformer?.performancePercentage ??
    topPerformer?.performance ??
    topPerformer?.percentage ??
    99;

  // =====================================================
  // DEPARTMENT DATA
  // =====================================================

  const departmentList = Array.isArray(
    employeesByDepartment?.data
  )
    ? employeesByDepartment.data
    : [];

  // =====================================================
  // UPCOMING EVENTS
  // =====================================================

  const events = [
    {
      title: "Meeting with Team Dev",
      date: "15 Mar 2025",
      color: "#b948dd",
    },
    {
      title: "Design System With Client",
      date: "24 Mar 2025",
      color: "#ff3f99",
    },
    {
      title: "UI/UX Team Call",
      date: "28 Mar 2025",
      color: "#00c853",
    },
  ];

  // =====================================================
  // LOADING
  // =====================================================

  if (dashboardLoading) {
    return (
      <div className="hr-dashboard">
        <div className="hr-page-header">
          <h1>Dashboard</h1>

          <div className="hr-breadcrumb">
            <span className="home-icon">
              <i className="ti ti-home"></i>
            </span>

            <span>/</span>

            <span>Dashboard</span>
          </div>
        </div>

        <div
          style={{
            padding: "40px",
            textAlign: "center",
          }}
        >
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="hr-dashboard">

      {/* =====================================================
          PAGE TITLE
      ====================================================== */}

      <div className="hr-page-header">
        <h1>Dashboard</h1>

        <div className="hr-breadcrumb">
          <span className="home-icon">
            <i className="ti ti-home"></i>
          </span>

          <span>/</span>

          <span>Dashboard</span>
        </div>
      </div>

      {/* =====================================================
          API ERROR
      ====================================================== */}

      {dashboardError && (
        <div
          style={{
            padding: "12px 16px",
            marginBottom: "16px",
            borderRadius: "8px",
            background: "#fff1f1",
            color: "#d11a2a",
            border: "1px solid #f1cccc",
          }}
        >
          {dashboardError}
        </div>
      )}

      {/* =====================================================
          WELCOME CARD
      ====================================================== */}

      <div className="hr-welcome-card">

        <div className="welcome-avatar">
          {welcome?.profilePicture ? (
            <img
              src={welcome.profilePicture}
              alt="Profile"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "50%",
              }}
            />
          ) : (
            <span>300 × 300</span>
          )}
        </div>

        <div className="welcome-info">

          <div className="welcome-title-row">

            <h2>
              Welcome Back,{" "}
              {welcome?.name || "Adrian"}
            </h2>

            <span className="welcome-edit">
              <i className="ti ti-edit"></i>
            </span>

          </div>

          <p>
            You have{" "}
            <span className="gold-text">
              {welcome?.pendingApprovals ?? 21}
            </span>{" "}
            Pending Approvals &{" "}
            <span className="gold-text">
              {welcome?.leaveRequests ?? 14}
            </span>{" "}
            Leave Requests
          </p>

        </div>

      </div>

      {/* =====================================================
          MAIN GRID
      ====================================================== */}

      <div className="hr-main-grid">

        {/* =====================================================
            LEFT AREA
        ====================================================== */}

        <div className="hr-left-area">

          {/* =====================================================
              TOP STAT CARDS
          ====================================================== */}

          <div className="hr-stats-grid">

            {/* ATTENDANCE */}

            <div className="hr-stat-card">

              <div className="hr-stat-icon stat-gold">
                <CalendarDays size={20} />
              </div>

              <p className="hr-stat-title">
                Attendance
                <br />
                Overview
              </p>

              <h3>
                {presentToday}/{totalEmployees}
              </h3>

              <span
                className="hr-stat-link"
                onClick={() =>
                  navigate("/HR/Atendance")
                }
              >
                View Details
              </span>

            </div>

            {/* EMPLOYEE */}

            <div className="hr-stat-card">

              <div className="hr-stat-icon stat-teal">
                <Users size={20} />
              </div>

              <p className="hr-stat-title">
                Total Employee
              </p>

              <h3>
                {totalEmployees}
              </h3>

            <span
  className="hr-stat-link"
  onClick={() => navigate("/Hr/Employee")}
>
  View All
</span>

            </div>

            {/* DEPARTMENTS */}

            <div className="hr-stat-card">

              <div className="hr-stat-icon stat-blue">
                <Grid2X2 size={20} />
              </div>

              <p className="hr-stat-title">
                Total Departments
              </p>

              <h3>
                {String(totalDepartments).padStart(
                  2,
                  "0"
                )}
              </h3>

             <span
  className="hr-stat-link"
  onClick={() => navigate("/HR/Departments")}
>
  View All
</span>

            </div>

            {/* LEAVES */}

            <div className="hr-stat-card">

              <div className="hr-stat-icon stat-pink">
                <FileText size={20} />
              </div>

              <p className="hr-stat-title">
                Leaves
              </p>

              <h3>
                {leaves}
              </h3>

             <span
  className="hr-stat-link"
  onClick={() => navigate("/HR/Leave")}
>
  View All
</span>

            </div>

          </div>

          {/* =====================================================
              EMPLOYEE STATUS
          ====================================================== */}

          <div className="employee-status-card">

            <div className="employee-status-header">

              <h2>
                Employee Status
              </h2>

              <button type="button">
                <Calendar size={13} />
                This Week
              </button>

            </div>

            <div className="employee-status-body">

              <div className="employee-total">

                <span>
                  Total Employee
                </span>

                <strong>
                  {employeeStatusTotal}
                </strong>

              </div>

              {/* PROGRESS */}

              <div className="employee-progress">

                <div
                  className="emp-fulltime"
                  style={{
                    width: `${fullTimePercentage}%`,
                  }}
                ></div>

                <div
                  className="emp-contract"
                  style={{
                    width: `${contractPercentage}%`,
                  }}
                ></div>

                <div
                  className="emp-probation"
                  style={{
                    width: `${probationPercentage}%`,
                  }}
                ></div>

                <div
                  className="emp-wfh"
                  style={{
                    width: `${wfhPercentage}%`,
                  }}
                ></div>

              </div>

              {/* STATUS BOXES */}

              <div className="employment-box-grid">

                <div className="employment-box">

                  <div className="employment-label">

                    <span
                      className="employment-color"
                      style={{
                        background: "#c89636",
                      }}
                    ></span>

                    Fulltime (
                    {fullTimePercentage}%)

                  </div>

                  <strong>
                    {fullTime}
                  </strong>

                </div>

                <div className="employment-box employment-right">

                  <div className="employment-label">

                    <span
                      className="employment-color"
                      style={{
                        background: "#3c7886",
                      }}
                    ></span>

                    Contract (
                    {contractPercentage}%)

                  </div>

                  <strong>
                    {contract}
                  </strong>

                </div>

                <div className="employment-box">

                  <div className="employment-label">

                    <span
                      className="employment-color"
                      style={{
                        background: "#ef1111",
                      }}
                    ></span>

                    Probation (
                    {probationPercentage}%)

                  </div>

                  <strong>
                    {probation}
                  </strong>

                </div>

                <div className="employment-box employment-right">

                  <div className="employment-label">

                    <span
                      className="employment-color"
                      style={{
                        background: "#f63591",
                      }}
                    ></span>

                    WFH (
                    {wfhPercentage}%)

                  </div>

                  <strong>
                    {String(wfh).padStart(2, "0")}
                  </strong>

                </div>

              </div>

              {/* TOP PERFORMER */}

              <div className="top-performer-section">

                <h3>
                  Top Performer
                </h3>

                <div className="performer-card">

                  <div className="performer-person">

                    <Medal
                      size={20}
                      className="medal"
                    />

                    <div className="performer-avatar">
                      {topPerformer?.profilePicture ? (
                        <img
                          src={
                            topPerformer.profilePicture
                          }
                          alt={
                            performerName
                          }
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit:
                              "cover",
                            borderRadius:
                              "50%",
                          }}
                        />
                      ) : (
                        <span>300</span>
                      )}
                    </div>

                    <div>

                      <h4>
                        {performerName}
                      </h4>

                      <p>
                        {performerDesignation}
                      </p>

                    </div>

                  </div>

                  <div className="performer-score">

                    <span>
                      Performance
                    </span>

                    <strong>
                      {performerPerformance}%
                    </strong>

                  </div>

                </div>

              </div>

            <button
  type="button"
  className="view-employees-btn"
  onClick={() => navigate("/Hr/Employee")}
>
  View All Employees
</button>

            </div>

          </div>

          {/* =====================================================
              BOTTOM AREA
          ====================================================== */}

          <div className="hr-bottom-grid">

            {/* =====================================================
                ATTENDANCE OVERVIEW
            ====================================================== */}

            <div className="attendance-overview-card">

              <div className="small-card-header">

                <h2>
                  Attendance Overview
                </h2>

                <button type="button">
                  <Calendar size={13} />
                  Today
                </button>

              </div>

              <div className="attendance-body">

                <div className="attendance-chart">

                  <div className="arc arc-teal"></div>

                  <div className="arc arc-green"></div>

                  <div className="arc arc-yellow"></div>

                  <div className="arc arc-red"></div>

                  <div className="attendance-center">

                    <p>
                      Total Attendance
                    </p>

                    <h2>
                      {attendanceTotal}
                    </h2>

                  </div>

                </div>

                <div className="status-title">
                  Status
                </div>

                <div className="attendance-status-list">

                  <div className="status-row">

                    <div>
                      <span className="status-dot present"></span>
                      Present
                    </div>

                    <strong>
                      {presentPercentage}%
                    </strong>

                  </div>

                  <div className="status-row">

                    <div>
                      <span className="status-dot late"></span>
                      Late
                    </div>

                    <strong>
                      {latePercentage}%
                    </strong>

                  </div>

                  <div className="status-row">

                    <div>
                      <span className="status-dot permission"></span>
                      Permission
                    </div>

                    <strong>
                      {permissionPercentage}%
                    </strong>

                  </div>

                  <div className="status-row">

                    <div>
                      <span className="status-dot absent"></span>
                      Absent
                    </div>

                    <strong>
                      {absentPercentage}%
                    </strong>

                  </div>

                </div>

                <div className="absentees-row">

                  <span>
                    Total Absentees
                  </span>

                  <div className="absentee-images">

                    {absentEmployees.length > 0 ? (
                      absentEmployees
                        .slice(0, 4)
                        .map(
                          (
                            employee: any,
                            index: number
                          ) => (
                            <img
                              key={
                                employee?.employeeId ||
                                index
                              }
                              src={
                                employee?.profilePicture ||
                                [
                                  avatar27,
                                  avatar30,
                                  avatar14,
                                  avatar29,
                                ][index]
                              }
                              alt={
                                employee?.name ||
                                "Employee"
                              }
                            />
                          )
                        )
                    ) : (
                      <>
                        <img
                          src={avatar27}
                          alt=""
                        />

                        <img
                          src={avatar30}
                          alt=""
                        />

                        <img
                          src={avatar14}
                          alt=""
                        />

                        <img
                          src={avatar29}
                          alt=""
                        />
                      </>
                    )}

                    {absentEmployees.length > 4 && (
                      <span className="plus-avatar">
                        +
                        {absentEmployees.length - 4}
                      </span>
                    )}

                    {absentEmployees.length === 0 && (
                      <span className="plus-avatar">
                        +1
                      </span>
                    )}

                  </div>

                  <Link
                    to="/HR/Atendance"
                    className="view-details-link"
                  >
                    View Details
                  </Link>

                </div>

              </div>

            </div>

            {/* =====================================================
                CLOCK IN OUT
            ====================================================== */}

            <div className="clock-card">

              <div className="clock-card-header">

                <h2>
                  Clock-In/Out
                </h2>

                <div className="clock-filters">

                  <span>
                    All Departments
                  </span>

                  <ChevronRight
                    size={14}
                    className="department-arrow"
                  />

                  <button type="button">
                    <Calendar size={13} />
                    Today
                  </button>

                </div>

              </div>

              <div className="clock-card-body">

                {/* API CLOCK-IN/OUT EMPLOYEES */}

                {clockInOut.length > 0 ? (
                  clockInOut
                    .slice(0, 3)
                    .map(
                      (
                        employee: any,
                        index: number
                      ) => {

                        const employeeAvatar =
                          employee?.profilePicture ||
                          [
                            avatar27,
                            avatar30,
                            avatar14,
                          ][index];

                        const checkIn =
                          employee?.checkIn ||
                          employee?.checkInTime;

                        const formattedTime =
                          checkIn
                            ? new Date(
                                checkIn
                              ).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: false,
                                }
                              )
                            : "--:--";

                        return (
                          <div
                            className={`clock-person ${
                              index === 0
                                ? "dashed"
                                : ""
                            }`}
                            key={
                              employee?.attendanceId ||
                              employee?.employeeId ||
                              index
                            }
                          >

                            <div className="clock-user">

                              <img
                                src={
                                  employeeAvatar
                                }
                                alt={
                                  employee?.name ||
                                  "Employee"
                                }
                              />

                              <div>

                                <h4>
                                  {employee?.name ||
                                    "Employee"}
                                </h4>

                                <p>
                                  {employee?.designation ||
                                    "Employee"}
                                </p>

                              </div>

                            </div>

                            <div className="clock-time-wrapper">

                              <Clock3 size={14} />

                              <span className="time-green">
                                •{" "}
                                {formattedTime}
                              </span>

                            </div>

                          </div>
                        );
                      }
                    )
                ) : (
                  <>
                    {/* FALLBACK */}

                    <div className="clock-person dashed">

                      <div className="clock-user">

                        <img
                          src={avatar27}
                          alt="Daniel"
                        />

                        <div>

                          <h4>
                            Daniel Esbella
                          </h4>

                          <p>
                            UI/UX Designer
                          </p>

                        </div>

                      </div>

                      <div className="clock-time-wrapper">

                        <Clock3 size={14} />

                        <span className="time-green">
                          • 09:15
                        </span>

                      </div>

                    </div>

                    <div className="clock-person">

                      <div className="clock-user">

                        <img
                          src={avatar30}
                          alt="Doglas"
                        />

                        <div>

                          <h4>
                            Doglas Martini
                          </h4>

                          <p>
                            Project Manager
                          </p>

                        </div>

                      </div>

                      <div className="clock-time-wrapper">

                        <Clock3 size={14} />

                        <span className="time-green">
                          • 09:36
                        </span>

                      </div>

                    </div>

                    <div className="clock-expanded">

                      <div className="clock-person no-bottom">

                        <div className="clock-user">

                          <img
                            src={avatar14}
                            alt="Brian"
                          />

                          <div>

                            <h4>
                              Brian Villalobos
                            </h4>

                            <p>
                              PHP Developer
                            </p>

                          </div>

                        </div>

                        <div className="clock-time-wrapper">

                          <Clock3 size={14} />

                          <span className="time-green">
                            • 09:15
                          </span>

                        </div>

                      </div>

                      <div className="clock-details-row">

                        <div>

                          <p className="detail-green">
                            • Clock In
                          </p>

                          <strong>
                            10:30 AM
                          </strong>

                        </div>

                        <div>

                          <p className="detail-red">
                            • Clock Out
                          </p>

                          <strong>
                            09:45 AM
                          </strong>

                        </div>

                        <div>

                          <p className="detail-yellow">
                            • Production
                          </p>

                          <strong>
                            09:21 Hrs
                          </strong>

                        </div>

                      </div>

                    </div>
                  </>
                )}

                {/* =====================================================
                    LATE EMPLOYEES
                ====================================================== */}

                <div className="late-section">

                  <h3>
                    Late
                  </h3>

                  {lateEmployees.length > 0 ? (
                    lateEmployees
                      .slice(0, 3)
                      .map(
                        (
                          employee: any,
                          index: number
                        ) => {

                          const lateAvatar =
                            employee?.profilePicture ||
                            [
                              avatar29,
                              avatar30,
                              avatar14,
                            ][index];

                          const checkIn =
                            employee?.checkInTime;

                          const lateTime =
                            checkIn
                              ? new Date(
                                  checkIn
                                ).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute:
                                      "2-digit",
                                    hour12:
                                      false,
                                  }
                                )
                              : "--:--";

                          return (
                            <div
                              className="clock-person dashed"
                              key={
                                employee?.attendanceId ||
                                employee?.employeeId ||
                                index
                              }
                            >

                              <div className="clock-user">

                                <img
                                  src={lateAvatar}
                                  alt={
                                    employee?.name ||
                                    "Employee"
                                  }
                                />

                                <div>

                                  <h4>
                                    {employee?.name ||
                                      "Employee"}
                                  </h4>

                                  <p>
                                    {employee?.designation ||
                                      employee?.department ||
                                      "Employee"}
                                  </p>

                                </div>

                              </div>

                              <div className="clock-time-wrapper">

                                <Clock3 size={14} />

                                <span className="time-red">
                                  • {lateTime}
                                </span>

                              </div>

                            </div>
                          );
                        }
                      )
                  ) : (
                    <div className="clock-person dashed">

                      <div className="clock-user">

                        <img
                          src={avatar29}
                          alt="Anthony"
                        />

                        <div>

                          <h4>
                            Anthony Lewis...
                          </h4>

                          <p>
                            Marketing Head
                          </p>

                        </div>

                      </div>

                      <div className="clock-time-wrapper">

                        <Clock3 size={14} />

                        <span className="time-red">
                          • 08:35
                        </span>

                      </div>

                    </div>
                  )}

                </div>

                <button
                  type="button"
                  className="view-attendance-btn"
                  onClick={() =>
                    navigate("/HR/Atendance")
                  }
                >
                  View All Attendance
                </button>

              </div>

            </div>

          </div>

        </div>

        {/* =====================================================
            RIGHT CALENDAR
        ====================================================== */}

        <div className="hr-right-area">

          <div className="calendar-card">

            <div className="calendar-header">

              <button
                type="button"
                className="calendar-arrow"
                onClick={handlePrevMonth}
              >
                <ChevronLeft size={18} />
              </button>

              <h2>
                {monthNames[month]}{" "}
                {year}
              </h2>

              <button
                type="button"
                className="calendar-arrow"
                onClick={handleNextMonth}
              >
                <ChevronRight size={18} />
              </button>

            </div>

            <div className="calendar-days">

              {[
                "Su",
                "Mo",
                "Tu",
                "We",
                "Th",
                "Fr",
                "Sa",
              ].map((day) => (
                <strong key={day}>
                  {day}
                </strong>
              ))}

            </div>

            <div className="calendar-grid">

              {calendarDays.map(
                (date, index) => {

                  const selected =
                    date.currentMonth &&
                    date.day === today.getDate() &&
                    month ===
                      today.getMonth() &&
                    year ===
                      today.getFullYear();

                  return (
                    <div
                      key={index}
                      className="calendar-cell"
                    >

                      <span
                        className={`calendar-number ${
                          !date.currentMonth
                            ? "other-month"
                            : ""
                        } ${
                          selected
                            ? "selected-date"
                            : ""
                        }`}
                      >
                        {date.day}
                      </span>

                    </div>
                  );
                }
              )}

            </div>

            {/* EVENTS */}

            <div className="events-divider"></div>

            <div className="events-title">

              <h3>
                Upcoming Event
              </h3>

              <span>
                {events.length}
              </span>

            </div>

            <div className="events-list">

              {events.map(
                (event, index) => (
                  <div
                    className="event-item"
                    key={index}
                  >

                    <span
                      className="event-border"
                      style={{
                        background:
                          event.color,
                      }}
                    ></span>

                    <div>

                      <h4>
                        {event.title}
                      </h4>

                      <p>

                        <Calendar
                          size={12}
                        />

                        {event.date}

                      </p>

                    </div>

                  </div>
                )
              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default HrDashboard;
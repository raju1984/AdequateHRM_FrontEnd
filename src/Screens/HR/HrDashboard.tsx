import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

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

const HrDashboard = () => {
  const navigate = useNavigate();
  // Real current date/month from the user's device
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
    setCurrentDate(
      new Date(year, month - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(year, month + 1, 1)
    );
  };

  const firstDayOfMonth = new Date(
    year,
    month,
    1
  ).getDay();

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
  for (
    let i = firstDayOfMonth;
    i > 0;
    i--
  ) {
    calendarDays.push({
      day: prevMonthDays - i + 1,
      currentMonth: false,
    });
  }

  // Current month dates
  for (
    let i = 1;
    i <= daysInMonth;
    i++
  ) {
    calendarDays.push({
      day: i,
      currentMonth: true,
    });
  }

  // Complete 6 week calendar like screenshot
  let nextDay = 1;

  while (calendarDays.length < 42) {
    calendarDays.push({
      day: nextDay,
      currentMonth: false,
    });

    nextDay++;
  }

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

  return (
    <div className="hr-dashboard">

      {/* =========================
          PAGE TITLE
      ========================== */}

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

      {/* =========================
          WELCOME CARD
      ========================== */}

      <div className="hr-welcome-card">

        <div className="welcome-avatar">
          <span>300 × 300</span>
        </div>

        <div className="welcome-info">

          <div className="welcome-title-row">
            <h2>
              Welcome Back, Adrian
            </h2>

            <span className="welcome-edit">
              <i className="ti ti-edit"></i>
            </span>
          </div>

          <p>
            You have{" "}
            <span className="gold-text">
              21
            </span>{" "}
            Pending Approvals &{" "}
            <span className="gold-text">
              14
            </span>{" "}
            Leave Requests
          </p>

        </div>

      </div>

      {/* =========================
          MAIN GRID
      ========================== */}

      <div className="hr-main-grid">

        {/* =========================
            LEFT AREA
        ========================== */}

        <div className="hr-left-area">

          {/* TOP STAT CARDS */}

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
                20/25
              </h3>

              <span
                className="hr-stat-link"
                onClick={() =>
                  navigate(
                    "/HR/Atendance"
                  )
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

              <h3>25</h3>

              <span className="hr-stat-link">
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

              <h3>08</h3>

              <span className="hr-stat-link">
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

              <h3>25</h3>

              <span className="hr-stat-link">
                View All
              </span>

            </div>

          </div>

          {/* =========================
              EMPLOYEE STATUS
          ========================== */}

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
                  154
                </strong>

              </div>

              {/* PROGRESS */}

              <div className="employee-progress">

                <div className="emp-fulltime"></div>
                <div className="emp-contract"></div>
                <div className="emp-probation"></div>
                <div className="emp-wfh"></div>

              </div>

              {/* STATUS BOXES */}

              <div className="employment-box-grid">

                <div className="employment-box">

                  <div className="employment-label">

                    <span
                      className="employment-color"
                      style={{
                        background:
                          "#c89636",
                      }}
                    ></span>

                    Fulltime (48%)

                  </div>

                  <strong>
                    112
                  </strong>

                </div>

                <div className="employment-box employment-right">

                  <div className="employment-label">

                    <span
                      className="employment-color"
                      style={{
                        background:
                          "#3c7886",
                      }}
                    ></span>

                    Contract (20%)

                  </div>

                  <strong>
                    112
                  </strong>

                </div>

                <div className="employment-box">

                  <div className="employment-label">

                    <span
                      className="employment-color"
                      style={{
                        background:
                          "#ef1111",
                      }}
                    ></span>

                    Probation (22%)

                  </div>

                  <strong>
                    12
                  </strong>

                </div>

                <div className="employment-box employment-right">

                  <div className="employment-label">

                    <span
                      className="employment-color"
                      style={{
                        background:
                          "#f63591",
                      }}
                    ></span>

                    WFH (20%)

                  </div>

                  <strong>
                    04
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
                      <span>300</span>
                    </div>

                    <div>
                      <h4>
                        Daniel Esbella
                      </h4>

                      <p>
                        IOS Developer
                      </p>
                    </div>

                  </div>

                  <div className="performer-score">

                    <span>
                      Performance
                    </span>

                    <strong>
                      99%
                    </strong>

                  </div>

                </div>

              </div>

              <button
                type="button"
                className="view-employees-btn"
              >
                View All Employees
              </button>

            </div>

          </div>

          {/* =========================
              BOTTOM AREA
          ========================== */}

          <div className="hr-bottom-grid">

            {/* ATTENDANCE OVERVIEW */}

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
                      120
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
                      59%
                    </strong>

                  </div>

                  <div className="status-row">

                    <div>
                      <span className="status-dot late"></span>
                      Late
                    </div>

                    <strong>
                      21%
                    </strong>

                  </div>

                  <div className="status-row">

                    <div>
                      <span className="status-dot permission"></span>
                      Permission
                    </div>

                    <strong>
                      2%
                    </strong>

                  </div>

                  <div className="status-row">

                    <div>
                      <span className="status-dot absent"></span>
                      Absent
                    </div>

                    <strong>
                      15%
                    </strong>

                  </div>

                </div>

                <div className="absentees-row">

                  <span>
                    Total Absentees
                  </span>

                  <div className="absentee-images">

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

                    <span className="plus-avatar">
                      +1
                    </span>

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

            {/* CLOCK IN OUT */}

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

                {/* Employee 1 */}

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

                {/* Employee 2 */}

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

                {/* Employee 3 */}

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

                {/* LATE */}

                <div className="late-section">

                  <h3>
                    Late
                  </h3>

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

                </div>

                <button
                  type="button"
                  className="view-attendance-btn"
                  onClick={() =>
                    navigate(
                      "/HR/Atendance"
                    )
                  }
                >
                  View All Attendance
                </button>

              </div>

            </div>

          </div>

        </div>

        {/* =========================
            RIGHT CALENDAR
        ========================== */}

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
                    month === today.getMonth() &&
                    year === today.getFullYear();

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
                15
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
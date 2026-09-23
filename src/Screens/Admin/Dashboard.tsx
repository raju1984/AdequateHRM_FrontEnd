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

import profileImg from "../../assets/img/profiles/avatar-31.jpg";
import avatar24 from "../../assets/img/profiles/avatar-24.jpg";
import avatar23 from "../../assets/img/profiles/avatar-23.jpg";
import avatar27 from "../../assets/img/profiles/avatar-27.jpg";
import avatar29 from "../../assets/img/profiles/avatar-29.jpg";
import avatar30 from "../../assets/img/profiles/avatar-30.jpg";
import avatar14 from "../../assets/img/profiles/avatar-14.jpg";

const departmentData = [
  { name: "UI/UX", employees: 80 },
  { name: "Developer", employees: 110 },
  { name: "IT", employees: 80 },
  { name: "HR", employees: 20 },
  { name: "Testing", employees: 60 },
  { name: "Telecaller", employees: 100 },
];

const Dashboard = () => {
  const navigate = useNavigate();

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
          white-space: nowrap;
        }

        .dashboard-exact .btn-filter:hover {
          background: #f8f9fb;
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

        .dashboard-exact .metric-card {
          min-height: 173px;
        }

        .dashboard-exact .clickable-metric-card {
          cursor: pointer;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            border-color 0.2s ease;
        }

        .dashboard-exact .clickable-metric-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(16,24,40,.10);
          border-color: #d5dbe4;
        }

        .dashboard-exact .clickable-metric-card:active {
          transform: translateY(0);
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
          margin-bottom: 0;
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

        .dashboard-exact .view-all-btn:hover {
          background: #eef0f3;
          color: #0b234b;
        }

        /* =====================================================
           ATTENDANCE OVERVIEW
        ===================================================== */

        .dashboard-exact .attendance-card {
          min-height: 100%;
        }

        .dashboard-exact .attendance-card .card-body {
          padding: 18px 20px 20px;
        }

        .dashboard-exact .attendance-chart-wrap {
          position: relative;
          width: 100%;
          height: 205px;
          margin: 0 auto 3px;
          overflow: hidden;
        }

        .dashboard-exact .attendance-chart {
          width: 100%;
          height: 175px;
          display: block;
        }

        .dashboard-exact .attendance-chart path {
          fill: none;
          stroke-width: 52;
          stroke-linecap: round;
        }

        .dashboard-exact .attendance-center-text {
          position: absolute;
          left: 0;
          right: 0;
          top: 103px;
          text-align: center;
          pointer-events: none;
        }

        .dashboard-exact .attendance-center-text p {
          margin: 0;
          font-size: 13px;
          color: #7a8290;
        }

        .dashboard-exact .attendance-center-text h3 {
          display: block;
          margin: 2px 0 0;
          font-size: 21px;
          line-height: 1.2;
          font-weight: 600;
          color: #1f2d4d;
        }

        .dashboard-exact .attendance-status-title {
          font-size: 14px;
          font-weight: 600;
          margin: 0 0 12px;
          color: #0b234b;
        }

        .dashboard-exact .attendance-status-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 13px;
        }

        .dashboard-exact .attendance-status-row:last-of-type {
          margin-bottom: 16px;
        }

        .dashboard-exact .attendance-status-left {
          display: inline-flex;
          align-items: center;
          color: #5e6879;
        }

        .dashboard-exact .attendance-status-right {
          color: #3f4858;
          font-size: 13px;
          font-weight: 500;
        }

        .dashboard-exact .attendance-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          display: inline-block;
          margin-right: 7px;
          flex-shrink: 0;
        }

        .dashboard-exact .absent-box {
          background: #f8f9fb;
          border-radius: 5px;
          min-height: 42px;
          padding: 8px 10px;
        }

        .dashboard-exact .absent-label {
          font-size: 13px;
          color: #5e6879;
          margin-right: 8px;
          white-space: nowrap;
        }

        .dashboard-exact .avatar-list-stacked {
          display: flex;
          align-items: center;
        }

        .dashboard-exact .stacked-avatar {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: 2px solid #fff;
          object-fit: cover;
          margin-left: -7px;
          flex-shrink: 0;
        }

        .dashboard-exact .stacked-avatar:first-child {
          margin-left: 0;
        }

        .dashboard-exact .stacked-more {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #c49336;
          color: #fff;
          font-size: 10px;
          font-weight: 500;
        }

        .dashboard-exact .attendance-details-link {
          font-size: 13px;
          color: #c49336;
          text-decoration: underline;
          white-space: nowrap;
        }

        /* =====================================================
           CLOCK IN / OUT
        ===================================================== */

        .dashboard-exact .clock-card {
          min-height: 100%;
        }

        .dashboard-exact .clock-card .card-body {
          padding: 18px 20px 20px;
        }

        .dashboard-exact .clock-header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .dashboard-exact .department-filter {
          border: 0;
          background: transparent;
          color: #0b234b;
          font-size: 13px;
          padding: 4px 0;
          white-space: nowrap;
        }

        .dashboard-exact .department-filter:focus {
          outline: none;
          box-shadow: none;
        }

        .dashboard-exact .clock-person {
          border: 1px dashed #d9dee7;
          border-radius: 6px;
          padding: 8px 10px;
          min-height: 61px;
          margin-bottom: 14px;
        }

        .dashboard-exact .clock-person:last-of-type {
          margin-bottom: 0;
        }

        .dashboard-exact .clock-avatar {
          width: 42px;
          height: 42px;
          object-fit: cover;
          flex-shrink: 0;
        }

        .dashboard-exact .clock-person h6 {
          font-size: 14px;
          line-height: 18px;
          color: #0b234b;
          margin: 0 0 2px;
          font-weight: 500;
        }

        .dashboard-exact .clock-person p {
          font-size: 13px;
          line-height: 17px;
          color: #6d7685;
          margin: 0;
        }

        .dashboard-exact .clock-right {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .dashboard-exact .clock-share-icon {
          color: #687587;
          font-size: 16px;
          margin-right: 8px;
        }

        .dashboard-exact .time-pill {
          min-width: 51px;
          height: 20px;
          border-radius: 5px;
          padding: 1px 7px;
          color: #fff;
          font-size: 10px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          line-height: 18px;
          white-space: nowrap;
        }

        .dashboard-exact .time-pill i {
          font-size: 5px;
          margin-right: 4px;
        }

        .dashboard-exact .clock-expanded-person {
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

        .dashboard-exact .clock-stat-dot {
          font-size: 8px;
          margin-right: 4px;
        }

        .dashboard-exact .late-title {
          font-size: 13px;
          font-weight: 600;
          color: #0b234b;
          margin: 8px 0 10px;
        }

        .dashboard-exact .late-person {
          margin-bottom: 14px;
        }

        .dashboard-exact .late-name-row {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .dashboard-exact .late-badge {
          background: #08c85b;
          color: #fff;
          font-size: 10px;
          font-weight: 600;
          border-radius: 10px;
          padding: 2px 7px;
          line-height: 15px;
          white-space: nowrap;
        }

        .dashboard-exact .late-badge i {
          font-size: 9px;
          margin-right: 3px;
        }

        @media (max-width: 1399px) {
          .dashboard-exact .clock-header-actions {
            gap: 4px;
          }

          .dashboard-exact .department-filter {
            font-size: 12px;
          }
        }

        @media (max-width: 575px) {
          .dashboard-exact .attendance-card .card-header,
          .dashboard-exact .clock-card .card-header {
            padding: 14px 15px;
          }

          .dashboard-exact .attendance-card .card-body,
          .dashboard-exact .clock-card .card-body {
            padding: 15px;
          }

          .dashboard-exact .clock-header-actions {
            flex-wrap: wrap;
            justify-content: flex-end;
          }

          .dashboard-exact .department-filter {
            max-width: 120px;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .dashboard-exact .absent-box {
            flex-wrap: wrap;
            gap: 8px;
          }

          .dashboard-exact .attendance-chart-wrap {
            height: 190px;
          }
        }

        @media (min-width: 1200px) {
          .dashboard-exact .top-metric-col {
            width: 25%;
          }
        }
      `}</style>

      {/* Breadcrumb */}
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
              <li className="breadcrumb-item"></li>

              <li className="breadcrumb-item active">
                Dashboard
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Welcome */}
      <div className="card welcome-card mb-4">
        <div className="card-body d-flex align-items-center">
          <img
            src={profileImg}
            className="welcome-avatar"
            alt="profile"
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
              Welcome Back, Adrian
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
                21
              </span>{" "}
              Pending Approvals &amp;{" "}
              <span
                style={{
                  color: "#c39032",
                  textDecoration: "underline",
                }}
              >
                14
              </span>{" "}
              Leave Requests
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================
          TOP METRIC CARDS
      ========================================================= */}
      <div className="row g-4 mb-4">

        {/* Attendance Overview */}
        <div className="col-xl-3 col-md-6 d-flex top-metric-col">
          <div
            className="card flex-fill metric-card clickable-metric-card"
            onClick={() => navigate("/admin/attendance")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                navigate("/admin/attendance");
              }
            }}
          >
            <div className="card-body">
              <span
                className="metric-icon"
                style={{ background: "#c49336" }}
              >
                <i className="ti ti-calendar-share fs-18" />
              </span>

              <div className="metric-title">
                Attendance Overview
              </div>

              <div className="metric-value">
                20/25
              </div>
            </div>
          </div>
        </div>

        {/* Total Employee */}
        <div className="col-xl-3 col-md-6 d-flex top-metric-col">
          <div
            className="card flex-fill metric-card clickable-metric-card"
            onClick={() => navigate("/admin/employees")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                navigate("/admin/employees");
              }
            }}
          >
            <div className="card-body">
              <span
                className="metric-icon"
                style={{ background: "#34798a" }}
              >
                <i className="ti ti-users fs-18" />
              </span>

              <div className="metric-title">
                Total Employee
              </div>

              <div className="metric-value">
                25
              </div>
            </div>
          </div>
        </div>

        {/* Total Departments */}
        <div className="col-xl-3 col-md-6 d-flex top-metric-col">
          <div
            className="card flex-fill metric-card clickable-metric-card"
            onClick={() => navigate("/admin/departments")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                navigate("/admin/departments");
              }
            }}
          >
            <div className="card-body">
              <span
                className="metric-icon"
                style={{ background: "#1677ff" }}
              >
                <i className="ti ti-category-plus fs-18" />
              </span>

              <div className="metric-title">
                Total Departments
              </div>

              <div className="metric-value">
                08
              </div>
            </div>
          </div>
        </div>

        {/* Leaves */}
        <div className="col-xl-3 col-md-6 d-flex top-metric-col">
          <div
            className="card flex-fill metric-card clickable-metric-card"
            onClick={() => navigate("/admin/leaves")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                navigate("/admin/leaves");
              }
            }}
          >
            <div className="card-body">
              <span
                className="metric-icon"
                style={{ background: "#f6358c" }}
              >
                <i className="ti ti-forms fs-18" />
              </span>

              <div className="metric-title">
                Leaves
              </div>

              <div className="metric-value">
                25
              </div>
            </div>
          </div>
        </div>

        {/* Users */}
        <div className="col-xl-3 col-md-6 d-flex">
          <div
            className="card flex-fill metric-card clickable-metric-card"
            onClick={() => navigate("/admin/users")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                navigate("/admin/users");
              }
            }}
          >
            <div className="card-body">
              <span
                className="metric-icon"
                style={{ background: "#ad3cc4" }}
              >
                <i className="ti ti-user fs-18" />
              </span>

              <div className="metric-title">
                Users
              </div>

              <div className="metric-value">
                05
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          EMPLOYEES BY DEPARTMENT
      ========================================================= */}
      <div className="card dept-card mb-4">
        <div className="card-header d-flex align-items-center justify-content-between">
          <h5>Employees By Department</h5>

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
            <ResponsiveContainer width="100%" height="100%">
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
                  domain={[0, 110]}
                  ticks={[
                    0,
                    10,
                    20,
                    30,
                    40,
                    50,
                    60,
                    70,
                    80,
                    90,
                    100,
                    110,
                  ]}
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
                  width={80}
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
                  radius={[6, 6, 6, 6]}
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
            <strong style={{ color: "#00b85a" }}>
              +20%
            </strong>{" "}
            from last Week
          </p>
        </div>
      </div>

      {/* =========================================================
          EMPLOYEE STATUS
      ========================================================= */}
      <div className="card status-card mb-4">
        <div className="card-header d-flex align-items-center justify-content-between">
          <h5>Employee Status</h5>

          <button className="btn-filter">
            <i className="ti ti-calendar me-1" />
            This Week
          </button>
        </div>

        <div className="card-body">
          <div className="d-flex align-items-center justify-content-between">
            <span className="status-total-label">
              Total Employee
            </span>

            <span className="status-total-number">
              154
            </span>
          </div>

          <div className="status-strip">
            <div
              style={{
                width: "40%",
                background: "#ffbb00",
              }}
            />

            <div
              style={{
                width: "20%",
                background: "#3f7887",
              }}
            />

            <div
              style={{
                width: "10%",
                background: "#ef1111",
              }}
            />

            <div
              style={{
                width: "30%",
                background: "#f7368f",
              }}
            />
          </div>

          <div className="row gx-0 status-grid">
            <div className="col-6 status-cell">
              <div className="status-label">
                <i
                  className="ti ti-square-filled me-2"
                  style={{ color: "#c89533" }}
                />
                Fulltime (48%)
              </div>

              <h2 className="status-big">
                112
              </h2>
            </div>

            <div className="col-6 status-cell text-end">
              <div className="status-label">
                <i
                  className="ti ti-square-filled me-2"
                  style={{ color: "#347889" }}
                />
                Contract (20%)
              </div>

              <h2 className="status-big">
                112
              </h2>
            </div>

            <div className="col-6 status-cell">
              <div className="status-label">
                <i
                  className="ti ti-square-filled me-2"
                  style={{ color: "#ef1111" }}
                />
                Probation (22%)
              </div>

              <h2 className="status-big">
                12
              </h2>
            </div>

            <div className="col-6 status-cell text-end">
              <div className="status-label">
                <i
                  className="ti ti-square-filled me-2"
                  style={{ color: "#f7368f" }}
                />
                WFH (20%)
              </div>

              <h2 className="status-big">
                04
              </h2>
            </div>
          </div>

          <div className="performer-title">
            Top Performer
          </div>

          <div className="performer-box d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <i
                className="ti ti-award-filled me-2"
                style={{
                  color: "#c49336",
                  fontSize: 22,
                }}
              />

              <img
                src={avatar24}
                alt="Daniel"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "1px solid #fff",
                }}
              />

              <div className="ms-2">
                <h6>Daniel Esbella</h6>
                <p>IOS Developer</p>
              </div>
            </div>

            <div className="text-end">
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: "#6c7482",
                }}
              >
                Performance
              </p>

              <strong
                style={{
                  fontSize: 16,
                  color: "#c49336",
                }}
              >
                99%
              </strong>
            </div>
          </div>

          <Link
            to="/admin/employees"
            className="btn view-all-btn w-100 mt-4"
          >
            View All Employees
          </Link>
        </div>
      </div>

      {/* =========================================================
          BOTTOM ROW
          Reference HTML uses col-xxl-4 / col-xl-6
      ========================================================= */}
      <div className="row g-4">

        {/* =====================================================
            ATTENDANCE OVERVIEW
        ===================================================== */}
        <div className="col-xxl-4 col-xl-6 d-flex">
          <div className="card attendance-card flex-fill">

            {/* Header */}
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap">
              <h5 className="mb-2 mb-xl-0">
                Attendance Overview
              </h5>

              <div className="dropdown mb-0">
                <button
                  type="button"
                  className="btn-filter"
                >
                  <i className="ti ti-calendar me-1" />
                  Today
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="card-body">

              {/* Reference-style semi donut */}
              <div className="attendance-chart-wrap"> 
                <svg
                  className="attendance-chart"
                  viewBox="0 0 300 175"
                  preserveAspectRatio="xMidYMid meet"
                  aria-hidden="true"
                >
                  {/* Base / Late */}
                  <path
                    d="M 42 150 A 108 108 0 0 1 258 150"
                    pathLength="100"
                    stroke="#347889"
                    strokeDasharray="30 70"
                    strokeDashoffset="0"
                  />

                  {/* Present */}
                  <path
                    d="M 42 150 A 108 108 0 0 1 258 150"
                    pathLength="100"
                    stroke="#08c85b"
                    strokeDasharray="20 80"
                    strokeDashoffset="-33"
                  />

                  {/* Permission */}
                  <path
                    d="M 42 150 A 108 108 0 0 1 258 150"
                    pathLength="100"
                    stroke="#ffbd0a"
                    strokeDasharray="27 73"
                    strokeDashoffset="-56"
                  />

                  {/* Absent */}
                  <path
                    d="M 42 150 A 108 108 0 0 1 258 150"
                    pathLength="100"
                    stroke="#f20d0d"
                    strokeDasharray="10 90"
                    strokeDashoffset="-88"
                  />
                </svg>

                <div className="attendance-center-text">
                  <p>Total Attendance</p>
                  <h3>120</h3>
                </div>
              </div>

              {/* Status */}
              <h6 className="attendance-status-title">
                Status
              </h6>

              <div className="attendance-status-row">
                <span className="attendance-status-left">
                  <span
                    className="attendance-dot"
                    style={{
                      background: "#08c85b",
                    }}
                  />
                  Present
                </span>

                <span className="attendance-status-right">
                  59%
                </span>
              </div>

              <div className="attendance-status-row">
                <span className="attendance-status-left">
                  <span
                    className="attendance-dot"
                    style={{
                      background: "#347889",
                    }}
                  />
                  Late
                </span>

                <span className="attendance-status-right">
                  21%
                </span>
              </div>

              <div className="attendance-status-row">
                <span className="attendance-status-left">
                  <span
                    className="attendance-dot"
                    style={{
                      background: "#ffbd0a",
                    }}
                  />
                  Permission
                </span>

                <span className="attendance-status-right">
                  2%
                </span>
              </div>

              <div className="attendance-status-row">
                <span className="attendance-status-left">
                  <span
                    className="attendance-dot"
                    style={{
                      background: "#f20d0d",
                    }}
                  />
                  Absent
                </span>

                <span className="attendance-status-right">
                  15%
                </span>
              </div>

              {/* Total Absenties */}
              <div className="absent-box d-flex align-items-center justify-content-between flex-wrap">

                <div className="d-flex align-items-center">
                  <span className="absent-label">
                    Total Absenties
                  </span>

                  <div className="avatar-list-stacked">
                    <img
                      src={avatar27}
                      className="stacked-avatar"
                      alt=""
                    />

                    <img
                      src={avatar30}
                      className="stacked-avatar"
                      alt=""
                    />

                    <img
                      src={avatar14}
                      className="stacked-avatar"
                      alt=""
                    />

                    <img
                      src={avatar29}
                      className="stacked-avatar"
                      alt=""
                    />

                    <span className="stacked-avatar stacked-more">
                      +1
                    </span>
                  </div>
                </div>

                <Link
                  to="/admin/leaves"
                  className="attendance-details-link"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            CLOCK-IN / OUT
        ===================================================== */}
        <div className="col-xxl-4 col-xl-6 d-flex">
          <div className="card clock-card flex-fill">

            {/* Header */}
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap">

              <h5 className="mb-2 mb-xl-0">
                Clock-In/Out
              </h5>

              <div className="clock-header-actions mb-0">

                <div className="dropdown">
                  <button
                    type="button"
                    className="department-filter"
                  >
                    All Departments
                    <i className="ti ti-chevron-down ms-1" />
                  </button>
                </div>

                <div className="dropdown">
                  <button
                    type="button"
                    className="btn-filter"
                  >
                    <i className="ti ti-calendar me-1" />
                    Today
                  </button>
                </div>

              </div>
            </div>

            {/* Body */}
            <div className="card-body">

              {/* Daniel */}
              <div className="clock-person d-flex align-items-center justify-content-between">

                <div className="d-flex align-items-center overflow-hidden">
                  <img
                    src={avatar24}
                    className="clock-avatar rounded-circle"
                    alt="Daniel Esbella"
                  />

                  <div className="ms-2 overflow-hidden">
                    <h6 className="text-truncate">
                      Daniel Esbella
                    </h6>

                    <p>
                      UI/UX Designer
                    </p>
                  </div>
                </div>

                <div className="clock-right">
                  <i className="ti ti-clock-share clock-share-icon" />

                  <span
                    className="time-pill"
                    style={{
                      background: "#08c85b",
                    }}
                  >
                    <i className="ti ti-circle-filled" />
                    09:15
                  </span>
                </div>
              </div>

              {/* Doglas */}
              <div className="clock-person d-flex align-items-center justify-content-between">

                <div className="d-flex align-items-center overflow-hidden">
                  <img
                    src={avatar23}
                    className="clock-avatar rounded-circle"
                    alt="Doglas Martini"
                  />

                  <div className="ms-2 overflow-hidden">
                    <h6 className="text-truncate">
                      Doglas Martini
                    </h6>

                    <p>
                      Project Manager
                    </p>
                  </div>
                </div>

                <div className="clock-right">
                  <i className="ti ti-clock-share clock-share-icon" />

                  <span
                    className="time-pill"
                    style={{
                      background: "#08c85b",
                    }}
                  >
                    <i className="ti ti-circle-filled" />
                    09:36
                  </span>
                </div>
              </div>

              {/* Brian - Expanded */}
              <div
                className="clock-person"
                style={{
                  paddingBottom: 7,
                }}
              >

                <div className="d-flex align-items-center justify-content-between">

                  <div className="d-flex align-items-center overflow-hidden">
                    <img
                      src={avatar27}
                      className="clock-avatar rounded-circle"
                      alt="Brian Villalobos"
                    />

                    <div className="ms-2 overflow-hidden">
                      <h6 className="text-truncate">
                        Brian Villalobos
                      </h6>

                      <p>
                        PHP Developer
                      </p>
                    </div>
                  </div>

                  <div className="clock-right">
                    <i className="ti ti-clock-share clock-share-icon" />

                    <span
                      className="time-pill"
                      style={{
                        background: "#08c85b",
                      }}
                    >
                      <i className="ti ti-circle-filled" />
                      09:15
                    </span>
                  </div>

                </div>

                {/* Expanded information */}
                <div className="clock-expanded-person">

                  <div className="row gx-2">

                    <div className="col-4 clock-stat">
                      <p>
                        <span
                          className="clock-stat-dot"
                          style={{
                            color: "#08c85b",
                          }}
                        >
                          <i className="ti ti-circle-filled" />
                        </span>
                        Clock In
                      </p>

                      <h6>
                        10:30 AM
                      </h6>
                    </div>

                    <div className="col-4 clock-stat">
                      <p>
                        <span
                          className="clock-stat-dot"
                          style={{
                            color: "#f20d0d",
                          }}
                        >
                          <i className="ti ti-circle-filled" />
                        </span>
                        Clock Out
                      </p>

                      <h6>
                        09:45 AM
                      </h6>
                    </div>

                    <div className="col-4 clock-stat">
                      <p>
                        <span
                          className="clock-stat-dot"
                          style={{
                            color: "#ffbd0a",
                          }}
                        >
                          <i className="ti ti-circle-filled" />
                        </span>
                        Production
                      </p>

                      <h6>
                        09:21 Hrs
                      </h6>
                    </div>

                  </div>
                </div>
              </div>

              {/* Late */}
              <div className="late-title">
                Late
              </div>

              <div className="clock-person late-person d-flex align-items-center justify-content-between">

                <div className="d-flex align-items-center overflow-hidden">

                  <img
                    src={avatar29}
                    className="clock-avatar rounded-circle"
                    alt="Anthony Lewis"
                  />

                  <div className="ms-2 overflow-hidden">

                    <div className="late-name-row">

                      <h6 className="text-truncate mb-0">
                        Anthony Lewis
                      </h6>

                      <span className="late-badge">
                        <i className="ti ti-clock-hour-11" />
                        30 Min
                      </span>

                    </div>

                    <p>
                      Marketing Head
                    </p>

                  </div>
                </div>

                <div className="clock-right">
                  <i className="ti ti-clock-share clock-share-icon" />

                  <span
                    className="time-pill"
                    style={{
                      background: "#f20d0d",
                    }}
                  >
                    <i className="ti ti-circle-filled" />
                    08:35
                  </span>
                </div>

              </div>

              {/* View All */}
              <button
                type="button"
                onClick={() =>
                  navigate("/admin/attendance")
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
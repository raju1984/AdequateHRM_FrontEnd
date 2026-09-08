
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import avatar27 from "../../assets/img/profiles/avatar-27.jpg";

import {
  getEmployeeAttendance,
  logoutAttendance,
  type AttendancePageParams,
} from "../../services/employeservices";

type AttendanceStatus = "Present" | "Absent";

interface AttendanceRow {
  id?: string;
  date: string;
  checkIn: string;
  status: AttendanceStatus;
  checkOut: string;
  breakTime: string;
  late: string;
  overtime: string;
  productionHours: string;
  productionColor: "green" | "blue" | "red";
  raw?: any;
}

const AttendancePage: React.FC = () => {
  const navigate = useNavigate();

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortFilter, setSortFilter] = useState("Last 7 Days");

  const [attendanceData, setAttendanceData] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [punchingOut, setPunchingOut] = useState(false);
  const [error, setError] = useState("");

  /* =====================================================
     HELPERS
  ===================================================== */

  const getValue = (
    item: any,
    keys: string[],
    fallback = "-"
  ): any => {
    for (const key of keys) {
      if (
        item &&
        item[key] !== undefined &&
        item[key] !== null &&
        item[key] !== ""
      ) {
        return item[key];
      }
    }

    return fallback;
  };

  const formatDate = (value: any): string => {
    if (!value || value === "-") return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (value: any): string => {
    if (!value || value === "-") return "-";

    const valueString = String(value);

    // Already formatted time
    if (
      valueString.includes("AM") ||
      valueString.includes("PM")
    ) {
      return valueString;
    }

    const date = new Date(value);

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return valueString;
  };

  const normalizeStatus = (value: any): AttendanceStatus => {
    const status = String(value ?? "")
      .trim()
      .toLowerCase();

    if (
      status === "absent" ||
      status === "2" ||
      status === "false"
    ) {
      return "Absent";
    }

    return "Present";
  };

  const normalizeProductionColor = (
    value: any
  ): "green" | "blue" | "red" => {
    const text = String(value ?? "").toLowerCase();

    if (text.includes("red")) return "red";
    if (text.includes("blue")) return "blue";

    return "green";
  };

  const extractAttendanceArray = (response: any): any[] => {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.Data)) {
      return response.Data;
    }

    if (Array.isArray(response?.items)) {
      return response.items;
    }

    if (Array.isArray(response?.Items)) {
      return response.Items;
    }

    if (Array.isArray(response?.result)) {
      return response.result;
    }

    if (Array.isArray(response?.Result)) {
      return response.Result;
    }

    if (Array.isArray(response?.data?.items)) {
      return response.data.items;
    }

    if (Array.isArray(response?.data?.Items)) {
      return response.data.Items;
    }

    return [];
  };

  const mapAttendanceItem = (
    item: any
  ): AttendanceRow => {
    const statusValue = getValue(item, [
      "status",
      "Status",
      "attendanceStatus",
      "AttendanceStatus",
      "statusName",
      "StatusName",
    ]);

    const productionValue = getValue(item, [
      "productionHours",
      "ProductionHours",
      "productiveHours",
      "ProductiveHours",
      "productionHour",
      "ProductionHour",
    ]);

    return {
      id: String(
        getValue(
          item,
          [
            "id",
            "Id",
            "attendanceId",
            "AttendanceId",
            "employeeAttendanceId",
            "EmployeeAttendanceId",
          ],
          ""
        )
      ),

      date: formatDate(
        getValue(item, [
          "date",
          "Date",
          "attendanceDate",
          "AttendanceDate",
          "createdDate",
          "CreatedDate",
        ])
      ),

      checkIn: formatTime(
        getValue(item, [
          "checkIn",
          "CheckIn",
          "checkInTime",
          "CheckInTime",
          "inTime",
          "InTime",
          "punchIn",
          "PunchIn",
        ])
      ),

      status: normalizeStatus(statusValue),

      checkOut: formatTime(
        getValue(item, [
          "checkOut",
          "CheckOut",
          "checkOutTime",
          "CheckOutTime",
          "outTime",
          "OutTime",
          "punchOut",
          "PunchOut",
        ])
      ),

      breakTime: String(
        getValue(item, [
          "breakTime",
          "BreakTime",
          "breakHours",
          "BreakHours",
          "totalBreak",
          "TotalBreak",
        ])
      ),

      late: String(
        getValue(item, [
          "late",
          "Late",
          "lateTime",
          "LateTime",
          "lateMinutes",
          "LateMinutes",
        ])
      ),

      overtime: String(
        getValue(item, [
          "overtime",
          "Overtime",
          "overTime",
          "OverTime",
          "overtimeMinutes",
          "OvertimeMinutes",
        ])
      ),

      productionHours: String(productionValue),

      productionColor: normalizeProductionColor(
        getValue(item, [
          "productionColor",
          "ProductionColor",
          "color",
          "Color",
        ])
      ),

      raw: item,
    };
  };

  /* =====================================================
     GET ATTENDANCE
  ===================================================== */

  const loadAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const params: AttendancePageParams = {
        PageNumber: 1,
        PageSize: 100,
      };

      /*
       * Status API ko tab bhej rahe hain jab filter selected hai.
       *
       * NOTE:
       * Agar backend me Present/Absent ka numeric enum different hai,
       * to yahan backend ke according mapping change kar sakte hain.
       */
      if (statusFilter) {
        params.Status =
          statusFilter === "Present" ? 1 : 2;
      }

      /*
       * SortBy ko backend ke expected value ke according
       * bheja ja sakta hai.
       */
      if (sortFilter) {
        params.SortBy = sortFilter;
      }

      const response = await getEmployeeAttendance(params);

      const apiData = extractAttendanceArray(response);

      const mappedData = apiData.map(
        mapAttendanceItem
      );

      setAttendanceData(mappedData);
    } catch (err: any) {
      console.error(
        "Get employee attendance error:",
        err
      );

      setAttendanceData([]);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.Message ||
          err?.message ||
          "Unable to load attendance data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [statusFilter, sortFilter]);

  /* =====================================================
     SEARCH + FRONTEND FILTER
  ===================================================== */

  const filteredData = useMemo(() => {
    let data = [...attendanceData];

    if (search.trim()) {
      const value = search.toLowerCase().trim();

      data = data.filter((item) =>
        Object.values(item).some((field) =>
          String(field ?? "")
            .toLowerCase()
            .includes(value)
        )
      );
    }

    return data.slice(0, rowsPerPage);
  }, [
    attendanceData,
    search,
    rowsPerPage,
  ]);

  /* =====================================================
     PUNCH OUT
  ===================================================== */

  const handlePunchOut = async () => {
    try {
      setPunchingOut(true);
      setError("");

      await logoutAttendance();

      /*
       * Logout API successful hone ke baad
       * latest attendance data dobara fetch.
       */
      await loadAttendance();
    } catch (err: any) {
      console.error(
        "Attendance logout error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.Message ||
          err?.message ||
          "Unable to punch out."
      );
    } finally {
      setPunchingOut(false);
    }
  };

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="attendance-page">
      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="attendance-page-header">
        <h2>Attendance</h2>

        <div className="attendance-breadcrumb">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/Employee/EmployeDashboard"
              )
            }
          >
            <i className="ti ti-home"></i>
          </button>

          <span>/</span>
          <span className="active">
            Attendance
          </span>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="attendance-error">
          <i className="ti ti-alert-circle"></i>
          <span>{error}</span>

          <button
            type="button"
            onClick={loadAttendance}
          >
            Retry
          </button>
        </div>
      )}

      {/* =========================
          TOP SECTION
      ========================= */}

      <div className="row g-4 top-attendance-row">
        {/* LEFT CARD */}

        <div className="col-xl-3 col-lg-4 d-flex">
          <div className="card attendance-main-card flex-fill">
            <div className="card-body">
              <div className="text-center attendance-greeting">
                <p>Good Morning, Adrian</p>
                <h4>
                  08:35 AM, 11 Mar 2025
                </h4>
              </div>

              {/* PROFILE CIRCLE */}

              <div className="attendance-circle">
                <div className="attendance-circle-inner">
                  <img
                    src={avatar27}
                    alt="Profile"
                  />
                </div>
              </div>

              <div className="text-center">
                <div className="production-badge">
                  Production : 3.45 hrs
                </div>

                <div className="punch-info">
                  <i className="ti ti-fingerprint"></i>
                  <span>
                    Punch In at 10.00 AM
                  </span>
                </div>

                <button
                  type="button"
                  className="punch-out-btn"
                  onClick={handlePunchOut}
                  disabled={punchingOut}
                >
                  {punchingOut
                    ? "Punching Out..."
                    : "Punch Out"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}

        <div className="col-xl-9 col-lg-8 d-flex">
          <div className="row g-4 flex-fill">
            <SummaryCard
              icon="ti ti-clock-stop"
              iconClass="gold"
              value="8.36"
              total="9"
              title="Total Hours Today"
              percentage="5% This Week"
              direction="up"
            />

            <SummaryCard
              icon="ti ti-clock-up"
              iconClass="dark"
              value="10"
              total="40"
              title="Total Hours Week"
              percentage="7% Last Week"
              direction="up"
            />

            <SummaryCard
              icon="ti ti-calendar-up"
              iconClass="blue"
              value="75"
              total="98"
              title="Total Hours Month"
              percentage="8% Last Month"
              direction="down"
            />

            <SummaryCard
              icon="ti ti-calendar-star"
              iconClass="pink"
              value="1500"
              total="3285"
              title="Total Hours Year"
              percentage="6% Last Month"
              direction="down"
            />

            {/* TIMELINE */}

            <div className="col-12">
              <div className="card timeline-card">
                <div className="card-body">
                  <div className="row timeline-info-row">
                    <TimelineInfo
                      dotClass="blue-dot"
                      title="Today"
                      value="10 Oct, 2025"
                    />

                    <TimelineInfo
                      dotClass="gray-dot"
                      title="Total Working hours"
                      value="12h 36m"
                    />

                    <TimelineInfo
                      dotClass="green-dot"
                      title="Productive Hours"
                      value="08h 36m"
                    />

                    <TimelineInfo
                      dotClass="yellow-dot"
                      title="Break hours"
                      value="22m 15s"
                    />
                  </div>

                  <div className="timeline-progress">
                    <div className="timeline-blank large" />
                    <div className="timeline-segment productive s1" />
                    <div className="timeline-segment break s2" />
                    <div className="timeline-segment productive s3" />
                    <div className="timeline-segment break s4" />
                    <div className="timeline-segment productive s5" />
                    <div className="timeline-segment break s6" />
                    <div className="timeline-segment blue s7" />
                    <div className="timeline-segment blue s8" />
                    <div className="timeline-blank final" />
                  </div>

                  <div className="timeline-hours">
                    {[
                      "06:00",
                      "07:00",
                      "08:00",
                      "09:00",
                      "10:00",
                      "11:00",
                      "12:00",
                      "01:00",
                      "02:00",
                      "03:00",
                      "04:00",
                      "05:00",
                      "06:00",
                      "07:00",
                      "08:00",
                      "09:00",
                      "10:00",
                      "11:00",
                    ].map(
                      (time, index) => (
                        <span
                          key={`${time}-${index}`}
                        >
                          {time}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          EMPLOYEE ATTENDANCE TABLE
      ========================= */}

      <div className="card employee-attendance-card">
        <div className="employee-attendance-header">
          <h5>Employee Attendance</h5>

          <div className="attendance-filters">
            <select
              className="attendance-filter-control date-filter"
              defaultValue="date"
            >
              <option value="date">
                08/28/2026 - 09/03/2026
              </option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="attendance-filter-control"
            >
              <option value="">
                Select Status
              </option>

              <option value="Present">
                Present
              </option>

              <option value="Absent">
                Absent
              </option>
            </select>

            <select
              value={sortFilter}
              onChange={(e) =>
                setSortFilter(
                  e.target.value
                )
              }
              className="attendance-filter-control sort-filter"
            >
              <option value="Last 7 Days">
                Sort By : Last 7 Days
              </option>

              <option value="Recently Added">
                Recently Added
              </option>

              <option value="Ascending">
                Ascending
              </option>

              <option value="Descending">
                Descending
              </option>

              <option value="Last Month">
                Last Month
              </option>
            </select>
          </div>
        </div>

        {/* TABLE CONTROLS */}

        <div className="table-top-controls">
          <div className="entries-control">
            <span>Row Per Page</span>

            <select
              value={rowsPerPage}
              onChange={(e) =>
                setRowsPerPage(
                  Number(e.target.value)
                )
              }
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>

            <span>Entries</span>
          </div>

          <input
            className="attendance-search"
            placeholder="Search"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        {/* TABLE */}

        <div className="table-responsive">
          <table className="attendance-table">
            <thead>
              <tr>
                <SortableHeader title="Date" />
                <SortableHeader title="Check In" />
                <SortableHeader title="Status" />
                <SortableHeader title="Check Out" />
                <SortableHeader title="Break" />
                <SortableHeader title="Late" />
                <SortableHeader title="Overtime" />
                <SortableHeader title="Production Hours" />
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="attendance-loading"
                  >
                    <div className="attendance-loader">
                      <span className="spinner-border spinner-border-sm"></span>
                      Loading attendance...
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="attendance-empty"
                  >
                    <i className="ti ti-calendar-off"></i>
                    <span>
                      No attendance records found
                    </span>
                  </td>
                </tr>
              ) : (
                filteredData.map(
                  (row, index) => (
                    <tr
                      key={
                        row.id ||
                        `${row.date}-${index}`
                      }
                    >
                      <td>{row.date}</td>

                      <td>
                        {row.checkIn}
                      </td>

                      <td>
                        <span
                          className={`attendance-status ${
                            row.status ===
                            "Present"
                              ? "present"
                              : "absent"
                          }`}
                        >
                          <span className="status-dot">
                            •
                          </span>

                          {row.status}
                        </span>
                      </td>

                      <td>
                        {row.checkOut}
                      </td>

                      <td>
                        {row.breakTime}
                      </td>

                      <td>
                        {row.late}
                      </td>

                      <td>
                        {row.overtime}
                      </td>

                      <td>
                        <span
                          className={`production-hours ${row.productionColor}`}
                        >
                          <i className="ti ti-clock-hour-11"></i>

                          {row.productionHours}
                        </span>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}

        <div className="attendance-table-footer">
          <span>
            Showing{" "}
            {filteredData.length > 0
              ? `1 - ${filteredData.length}`
              : "0"}{" "}
            of {attendanceData.length}{" "}
            entries
          </span>

          <div className="pagination-box">
            <button type="button">
              <i className="ti ti-chevron-left"></i>
            </button>

            <button
              type="button"
              className="active-page"
            >
              1
            </button>

            <button type="button">
              <i className="ti ti-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      {/* =========================
          CSS
      ========================= */}

      <style>{`
        .attendance-page {
          min-height: calc(100vh - 50px);
          background: #f7f8fa;
          padding: 24px;
          font-family: "Inter", Arial, sans-serif;
          color: #10264c;
        }

        .attendance-page-header {
          margin-bottom: 25px;
        }

        .attendance-page-header h2 {
          margin: 0 0 8px;
          font-size: 24px;
          line-height: 30px;
          font-weight: 700;
          color: #10264c;
        }

        .attendance-breadcrumb {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 12px;
          color: #94a0b2;
        }

        .attendance-breadcrumb button {
          border: 0;
          background: transparent;
          padding: 0;
          color: #68758a;
          font-size: 13px;
        }

        .attendance-breadcrumb .active {
          color: #10264c;
        }

        .top-attendance-row {
          margin-bottom: 24px;
        }

        .card {
          border: 1px solid #dde2e8;
          border-radius: 5px;
          box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
          background: #fff;
        }

        /* ERROR */

        .attendance-error {
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 42px;
          margin-bottom: 20px;
          padding: 10px 14px;
          border: 1px solid #f5c2c7;
          border-radius: 5px;
          background: #fff1f2;
          color: #b42318;
          font-size: 13px;
        }

        .attendance-error i {
          font-size: 17px;
        }

        .attendance-error button {
          margin-left: auto;
          border: 0;
          border-radius: 4px;
          background: #b42318;
          color: #fff;
          padding: 5px 12px;
          font-size: 12px;
        }

        /* LEFT ATTENDANCE CARD */

        .attendance-main-card {
          width: 100%;
        }

        .attendance-main-card .card-body {
          padding: 19px 20px 29px;
        }

        .attendance-greeting p {
          font-size: 13px;
          color: #657084;
          margin: 0 0 6px;
          font-weight: 400;
        }

        .attendance-greeting h4 {
          font-size: 18px;
          line-height: 24px;
          font-weight: 600;
          color: #10264c;
          margin: 0 0 17px;
        }

        .attendance-circle {
          position: relative;
          width: 110px;
          height: 110px;
          margin: 0 auto 16px;
          border-radius: 50%;
          background:
            conic-gradient(
              #08b85b 0deg 234deg,
              #d0d0d0 234deg 360deg
            );
          padding: 4px;
        }

        .attendance-circle-inner {
          width: 100%;
          height: 100%;
          background: #d0d0d0;
          border-radius: 50%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .attendance-circle-inner img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }

        .production-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 28px;
          padding: 5px 12px;
          border-radius: 4px;
          background: #bd8d32;
          color: #fff;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 13px;
        }

        .punch-info {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: #10264c;
          font-size: 14px;
          margin-bottom: 17px;
        }

        .punch-info i {
          color: #bd8d32;
          font-size: 15px;
        }

        .punch-out-btn {
          width: 100%;
          height: 39px;
          border: 0;
          border-radius: 5px;
          background: #111a2d;
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          transition: opacity 0.2s ease;
        }

        .punch-out-btn:hover {
          opacity: 0.92;
        }

        .punch-out-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        /* SUMMARY CARDS */

        .summary-column {
          display: flex;
        }

        .summary-card {
          width: 100%;
          min-height: 169px;
        }

        .summary-card .card-body {
          padding: 20px;
        }

        .summary-top {
          padding-bottom: 10px;
          border-bottom: 1px solid #e1e5eb;
        }

        .summary-icon {
          width: 24px;
          height: 24px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          color: #fff;
          margin-bottom: 10px;
          font-size: 12px;
        }

        .summary-icon.gold {
          background: #bd8d32;
        }

        .summary-icon.dark {
          background: #121b2c;
        }

        .summary-icon.blue {
          background: #1579f6;
        }

        .summary-icon.pink {
          background: #fa3b92;
        }

        .summary-number {
          margin: 0 0 8px;
          font-size: 24px;
          line-height: 28px;
          font-weight: 700;
          color: #10264c;
        }

        .summary-number span {
          color: #69758a;
          font-size: 20px;
          font-weight: 600;
        }

        .summary-title {
          color: #647084;
          font-size: 13px;
          margin: 0;
          white-space: nowrap;
        }

        .summary-bottom {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #69758a;
          font-size: 12px;
          padding-top: 9px;
          white-space: nowrap;
        }

        .summary-arrow {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 12px;
          font-weight: 700;
        }

        .summary-arrow.up {
          background: #09c762;
        }

        .summary-arrow.down {
          background: #ef1717;
        }

        /* TIMELINE CARD */

        .timeline-card .card-body {
          padding: 21px 20px;
        }

        .timeline-info-row {
          margin-bottom: 10px;
        }

        .timeline-info-label {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 13px;
          color: #69758a;
          margin-bottom: 5px;
        }

        .timeline-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex: 0 0 6px;
        }

        .blue-dot {
          background: #1976f3;
        }

        .gray-dot {
          background: #e4e5e7;
        }

        .green-dot {
          background: #0cca63;
        }

        .yellow-dot {
          background: #ffb508;
        }

        .timeline-info-value {
          font-size: 20px;
          line-height: 24px;
          font-weight: 500;
          color: #10264c;
          margin: 0;
        }

        .timeline-progress {
          height: 24px;
          width: 100%;
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 5px 0 13px;
          overflow: hidden;
        }

        .timeline-blank,
        .timeline-segment {
          height: 24px;
          border-radius: 4px;
          flex-shrink: 0;
        }

        .timeline-blank {
          background: transparent;
        }

        .timeline-blank.large {
          width: 11%;
        }

        .timeline-blank.final {
          flex: 1;
        }

        .timeline-segment.productive {
          background: #09c963;
        }

        .timeline-segment.break {
          background: #ffb70a;
        }

        .timeline-segment.blue {
          background: #2384f6;
        }

        .timeline-segment.s1 {
          width: 12%;
        }

        .timeline-segment.s2 {
          width: 3.5%;
        }

        .timeline-segment.s3 {
          width: 18%;
        }

        .timeline-segment.s4 {
          width: 11%;
        }

        .timeline-segment.s5 {
          width: 15%;
        }

        .timeline-segment.s6 {
          width: 3.5%;
        }

        .timeline-segment.s7 {
          width: 2%;
        }

        .timeline-segment.s8 {
          width: 1.5%;
        }

        .timeline-hours {
          display: flex;
          justify-content: space-between;
          width: 100%;
          font-size: 10px;
          color: #69758a;
        }

        /* TABLE CARD */

        .employee-attendance-card {
          overflow: hidden;
          margin-top: 0;
        }

        .employee-attendance-header {
          min-height: 71px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          padding: 15px 19px;
          border-bottom: 1px solid #e0e4e9;
          flex-wrap: wrap;
        }

        .employee-attendance-header h5 {
          margin: 0;
          font-size: 15px;
          line-height: 20px;
          font-weight: 600;
          color: #10264c;
        }

        .attendance-filters {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .attendance-filter-control {
          height: 39px;
          min-width: 133px;
          border: 1px solid #dce1e7;
          background: #fff;
          border-radius: 5px;
          padding: 0 12px;
          color: #10264c;
          font-size: 13px;
          outline: none;
        }

        .date-filter {
          min-width: 195px;
        }

        .sort-filter {
          min-width: 177px;
        }

        /* TABLE TOP */

        .table-top-controls {
          min-height: 55px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 16px;
          background: #fff;
        }

        .entries-control {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #24334d;
        }

        .entries-control select {
          height: 30px;
          border: 1px solid #dce1e7;
          border-radius: 5px;
          background: #fff;
          color: #10264c;
          padding: 0 7px;
          outline: none;
        }

        .attendance-search {
          width: 160px;
          height: 31px;
          border: 1px solid #dce1e7;
          border-radius: 5px;
          background: #fff;
          padding: 0 13px;
          font-size: 12px;
          outline: none;
        }

        .attendance-search::placeholder {
          color: #98a1b1;
        }

        /* TABLE */

        .attendance-table {
          width: 100%;
          border-collapse: collapse;
        }

        .attendance-table thead {
          background: #e5e7ea;
        }

        .attendance-table th {
          height: 42px;
          padding: 10px 20px;
          color: #0d1a32;
          font-size: 13px;
          font-weight: 600;
          text-align: left;
          white-space: nowrap;
        }

        .attendance-table td {
          height: 42px;
          padding: 9px 20px;
          color: #607087;
          font-size: 13px;
          border-bottom: 1px solid #dfe3e8;
          white-space: nowrap;
        }

        .sortable-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .sort-arrows {
          color: #d2d6dc;
          font-size: 13px;
        }

        .attendance-status {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          min-width: 69px;
          justify-content: flex-start;
          height: 19px;
          padding: 1px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 500;
        }

        .attendance-status.present {
          background: #cff3df;
          color: #00a94f;
        }

        .attendance-status.absent {
          background: #fee0e2;
          color: #e90012;
        }

        .status-dot {
          font-size: 14px;
          line-height: 10px;
        }

        .production-hours {
          height: 18px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 7px;
          border-radius: 4px;
          color: white;
          font-size: 10px;
          font-weight: 600;
        }

        .production-hours.green {
          background: #05c960;
        }

        .production-hours.blue {
          background: #2180f4;
        }

        .production-hours.red {
          background: #ec1010;
        }

        .production-hours i {
          font-size: 10px;
        }

        /* LOADING / EMPTY */

        .attendance-loading,
        .attendance-empty {
          height: 180px !important;
          text-align: center !important;
          color: #69758a !important;
        }

        .attendance-loader,
        .attendance-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
        }

        .attendance-empty {
          flex-direction: column;
          font-size: 13px;
        }

        .attendance-empty i {
          font-size: 30px;
          color: #b3bbc7;
        }

        /* TABLE FOOTER */

        .attendance-table-footer {
          min-height: 55px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 9px 16px;
          color: #69758a;
          font-size: 13px;
        }

        .pagination-box {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .pagination-box button {
          border: 0;
          background: transparent;
          min-width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #99a3b1;
          font-size: 13px;
        }

        .pagination-box .active-page {
          border-radius: 50%;
          background: #bd8d32;
          color: white;
        }

        /* RESPONSIVE */

        @media (max-width: 1199px) {
          .summary-title,
          .summary-bottom {
            white-space: normal;
          }

          .timeline-hours {
            overflow-x: auto;
            gap: 26px;
            justify-content: flex-start;
          }
        }

        @media (max-width: 767px) {
          .attendance-page {
            padding: 16px;
          }

          .employee-attendance-header,
          .table-top-controls {
            align-items: stretch;
            flex-direction: column;
          }

          .attendance-filters {
            width: 100%;
          }

          .attendance-filter-control,
          .date-filter,
          .sort-filter {
            width: 100%;
          }

          .attendance-search {
            width: 100%;
          }

          .attendance-error {
            align-items: flex-start;
            flex-wrap: wrap;
          }

          .attendance-error button {
            margin-left: 27px;
          }
        }
      `}</style>
    </div>
  );
};

/* =====================================================
   SUMMARY CARD
===================================================== */

interface SummaryCardProps {
  icon: string;
  iconClass: string;
  value: string;
  total: string;
  title: string;
  percentage: string;
  direction: "up" | "down";
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  icon,
  iconClass,
  value,
  total,
  title,
  percentage,
  direction,
}) => {
  return (
    <div className="col-xl-3 col-md-6 summary-column">
      <div className="card summary-card">
        <div className="card-body">
          <div className="summary-top">
            <span
              className={`summary-icon ${iconClass}`}
            >
              <i className={icon}></i>
            </span>

            <h2 className="summary-number">
              {value} /{" "}
              <span>{total}</span>
            </h2>

            <p className="summary-title">
              {title}
            </p>
          </div>

          <div className="summary-bottom">
            <span
              className={`summary-arrow ${direction}`}
            >
              {direction === "up"
                ? "↑"
                : "↓"}
            </span>

            <span>{percentage}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =====================================================
   TIMELINE INFO
===================================================== */

interface TimelineInfoProps {
  dotClass: string;
  title: string;
  value: string;
}

const TimelineInfo: React.FC<TimelineInfoProps> = ({
  dotClass,
  title,
  value,
}) => {
  return (
    <div className="col-xl-3 col-md-6">
      <div>
        <div className="timeline-info-label">
          <span
            className={`timeline-dot ${dotClass}`}
          ></span>

          <span>{title}</span>
        </div>

        <h3 className="timeline-info-value">
          {value}
        </h3>
      </div>
    </div>
  );
};

/* =====================================================
   SORTABLE TABLE HEADER
===================================================== */

const SortableHeader = ({
  title,
}: {
  title: string;
}) => {
  return (
    <th>
      <div className="sortable-title">
        <span>{title}</span>
        <span className="sort-arrows">
          ↕
        </span>
      </div>
    </th>
  );
};

export default AttendancePage;


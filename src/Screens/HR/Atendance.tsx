import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Clock3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Home,
  Search,
  ArrowUpDown,
  CalendarDays,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
  getAttendance,
  getAttendanceDashboard,
  getAttendanceById,
  AttendanceStatus,
} from "../../services/hrservices";

/* =====================================================
   TYPES
===================================================== */

interface AttendanceType {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentName: string;
  attendanceDate: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  breakInMinutes: number;
  lateInMinutes: number;
  totalProductionHours: number;
  status: number;
}

interface EditFormType {
  date: string;
  checkIn: string;
  checkOut: string;
  break: string;
  late: string;
  hours: string;
  status: string;
}

interface AttendanceApiData {
  attendanceList: AttendanceType[];
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

/* =====================================================
   DATE HELPERS
===================================================== */

const toUTCDateTime = (
  date: string,
  endOfDay = false
): string | undefined => {
  if (!date) {
    return undefined;
  }

  const utcDate = new Date(
    `${date}T${
      endOfDay
        ? "23:59:59.999"
        : "00:00:00.000"
    }Z`
  );

  if (Number.isNaN(utcDate.getTime())) {
    return undefined;
  }

  return utcDate.toISOString();
};

const getUTCDateOnly = (
  date: Date
): string => {
  const year =
    date.getUTCFullYear();

  const month = String(
    date.getUTCMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getUTCDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/* =====================================================
   VALUE HELPER
===================================================== */

const getValue = (
  item: any,
  keys: string[],
  fallback: any = ""
) => {
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

/* =====================================================
   STATUS
===================================================== */

/*
  IMPORTANT:

  Backend currently returns numeric status.

  Based on your existing AttendanceStatus enum:
  
  0 = Present
  1 = Absent
  2 = Late

  If Swagger/backend enum is different,
  change ONLY these values in hrservices.tsx.
*/

const getStatusLabel = (
  status: number
): string => {
  if (
    status === AttendanceStatus.Present
  ) {
    return "Present";
  }

  if (
    status === AttendanceStatus.Absent
  ) {
    return "Absent";
  }

  if (
    status === AttendanceStatus.Late
  ) {
    return "Late";
  }

  return `Status ${status}`;
};

/* =====================================================
   TIME FORMAT
===================================================== */

const formatTime = (
  value: string | null
): string => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }
  );
};

/* =====================================================
   DATE FORMAT
===================================================== */

const formatDate = (
  value: string | null
): string => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    }
  );
};

/* =====================================================
   BREAK FORMAT
===================================================== */

const formatMinutes = (
  value: number
): string => {
  if (
    value === undefined ||
    value === null
  ) {
    return "-";
  }

  return `${value} min`;
};

/* =====================================================
   PRODUCTION HOURS
===================================================== */

const formatProductionHours = (
  value: number
): string => {
  if (
    value === undefined ||
    value === null
  ) {
    return "0 Hrs";
  }

  return `${value} Hrs`;
};

/* =====================================================
   RESPONSE DATA
===================================================== */

const getAttendanceResponseData = (
  response: any
): AttendanceApiData => {
  const data =
    response?.data ||
    response?.Data ||
    {};

  return {
    attendanceList:
      Array.isArray(
        data.attendanceList
      )
        ? data.attendanceList
        : [],

    totalRecords:
      Number(
        data.totalRecords
      ) || 0,

    totalPages:
      Number(
        data.totalPages
      ) || 1,

    currentPage:
      Number(
        data.currentPage
      ) || 1,

    pageSize:
      Number(
        data.pageSize
      ) || 10,
  };
};

/* =====================================================
   COMPONENT
===================================================== */

const Atendance: React.FC = () => {
  const navigate =
    useNavigate();

  /* ===================================================
     DATA
  =================================================== */

  const [
    attendanceData,
    setAttendanceData,
  ] = useState<
    AttendanceType[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  /* ===================================================
     PAGINATION
  =================================================== */

  const [
    rowsPerPage,
    setRowsPerPage,
  ] = useState(10);

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const [
    totalRecords,
    setTotalRecords,
  ] = useState(0);

  const [
    totalPagesFromApi,
    setTotalPagesFromApi,
  ] = useState(1);

  /* ===================================================
     FILTERS
  =================================================== */

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState(
    "Select Status"
  );

  const [
    departmentFilter,
    setDepartmentFilter,
  ] = useState(
    "Department"
  );

  const [
    dateFilter,
    setDateFilter,
  ] = useState(
    "08/27/2026 - 09/02/2026"
  );

  const [
    sortFilter,
    setSortFilter,
  ] = useState(
    "Sort By : Last 7 Days"
  );

  const [
    selectedRows,
    setSelectedRows,
  ] = useState<string[]>(
    []
  );

  /* ===================================================
     DASHBOARD
  =================================================== */

  const [
    dashboardData,
    setDashboardData,
  ] = useState<any>(null);

  const [
    dashboardLoading,
    setDashboardLoading,
  ] = useState(false);

  /* ===================================================
     DETAIL MODAL
  =================================================== */

  const [
    showEditModal,
    setShowEditModal,
  ] = useState(false);

  const [
    editingAttendance,
    setEditingAttendance,
  ] = useState<
    AttendanceType | null
  >(null);

  const [
    editForm,
    setEditForm,
  ] = useState<EditFormType>({
    date: "",
    checkIn: "",
    checkOut: "",
    break: "",
    late: "",
    hours: "",
    status: "",
  });

  const [
    editLoading,
    setEditLoading,
  ] = useState(false);

  /* ===================================================
     DATE PARAMS
  =================================================== */

  const getDateParams =
    useCallback(() => {
      if (
        dateFilter ===
        "08/27/2026 - 09/02/2026"
      ) {
        return {
          FromDate:
            toUTCDateTime(
              "2026-08-27",
              false
            ),

          ToDate:
            toUTCDateTime(
              "2026-09-02",
              true
            ),
        };
      }

      if (
        dateFilter ===
        "09/02/2026"
      ) {
        return {
          FromDate:
            toUTCDateTime(
              "2026-09-02",
              false
            ),

          ToDate:
            toUTCDateTime(
              "2026-09-02",
              true
            ),
        };
      }

      if (
        dateFilter ===
        "09/01/2026"
      ) {
        return {
          FromDate:
            toUTCDateTime(
              "2026-09-01",
              false
            ),

          ToDate:
            toUTCDateTime(
              "2026-09-01",
              true
            ),
        };
      }

      if (
        dateFilter ===
        "Last 7 Days"
      ) {
        const today =
          new Date();

        const toDate =
          getUTCDateOnly(
            today
          );

        const from =
          new Date();

        from.setUTCDate(
          from.getUTCDate() - 6
        );

        const fromDate =
          getUTCDateOnly(
            from
          );

        return {
          FromDate:
            toUTCDateTime(
              fromDate,
              false
            ),

          ToDate:
            toUTCDateTime(
              toDate,
              true
            ),
        };
      }

      if (
        dateFilter ===
        "Last 30 Days"
      ) {
        const today =
          new Date();

        const toDate =
          getUTCDateOnly(
            today
          );

        const from =
          new Date();

        from.setUTCDate(
          from.getUTCDate() - 29
        );

        const fromDate =
          getUTCDateOnly(
            from
          );

        return {
          FromDate:
            toUTCDateTime(
              fromDate,
              false
            ),

          ToDate:
            toUTCDateTime(
              toDate,
              true
            ),
        };
      }

      if (
        dateFilter ===
        "This Month"
      ) {
        const now =
          new Date();

        const year =
          now.getUTCFullYear();

        const month =
          String(
            now.getUTCMonth() + 1
          ).padStart(2, "0");

        const firstDay =
          `${year}-${month}-01`;

        const today =
          getUTCDateOnly(
            now
          );

        return {
          FromDate:
            toUTCDateTime(
              firstDay,
              false
            ),

          ToDate:
            toUTCDateTime(
              today,
              true
            ),
        };
      }

      return {
        FromDate: undefined,
        ToDate: undefined,
      };
    }, [dateFilter]);

  /* ===================================================
     SORT PARAMS
  =================================================== */

  const getSortParams =
    useCallback(() => {
      if (
        sortFilter ===
        "Ascending"
      ) {
        return {
          SortBy: "Name",
          IsAscending: true,
        };
      }

      if (
        sortFilter ===
        "Descending"
      ) {
        return {
          SortBy: "Name",
          IsAscending: false,
        };
      }

      if (
        sortFilter ===
        "Recently Added"
      ) {
        return {
          SortBy: "Date",
          IsAscending: false,
        };
      }

      if (
        sortFilter ===
        "Last Month"
      ) {
        return {
          SortBy: "Date",
          IsAscending: false,
        };
      }

      if (
        sortFilter ===
        "Last 7 Days"
      ) {
        return {
          SortBy: "Date",
          IsAscending: false,
        };
      }

      return {};
    }, [sortFilter]);

  /* ===================================================
     STATUS PARAM
  =================================================== */

  const getStatusParam =
    useCallback(() => {
      if (
        statusFilter ===
        "Present"
      ) {
        return AttendanceStatus.Present;
      }

      if (
        statusFilter ===
        "Absent"
      ) {
        return AttendanceStatus.Absent;
      }

      if (
        statusFilter ===
        "Late"
      ) {
        return AttendanceStatus.Late;
      }

      return undefined;
    }, [statusFilter]);

  /* ===================================================
     DASHBOARD API
  =================================================== */

  const loadDashboard =
    useCallback(async () => {
      try {
        setDashboardLoading(
          true
        );

        const response =
          await getAttendanceDashboard();

        setDashboardData(
          response
        );
      } catch (err) {
        console.error(
          "Attendance dashboard error:",
          err
        );
      } finally {
        setDashboardLoading(
          false
        );
      }
    }, []);

  /* ===================================================
     ATTENDANCE API
  =================================================== */

  const loadAttendance =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const dateParams =
          getDateParams();

        const sortParams =
          getSortParams();

        const status =
          getStatusParam();

        const response =
          await getAttendance({
            Search:
              search.trim() ||
              undefined,

            FromDate:
              dateParams.FromDate,

            ToDate:
              dateParams.ToDate,

            /*
              DepartmentId intentionally
              not sent because current
              dropdown contains department names,
              not UUIDs.
            */

            Status: status,

            SortBy:
              sortParams.SortBy,

            IsAscending:
              sortParams.IsAscending,

            PageNumber:
              currentPage,

            PageSize:
              rowsPerPage,
          });

        console.log(
          "Attendance API Response:",
          response
        );

        /*
          ACTUAL API STRUCTURE:

          response
            .data
              .attendanceList
              .totalRecords
              .totalPages
              .currentPage
              .pageSize
        */

        const apiData =
          getAttendanceResponseData(
            response
          );

        setAttendanceData(
          apiData.attendanceList
        );

        setTotalRecords(
          apiData.totalRecords
        );

        setTotalPagesFromApi(
          apiData.totalPages
        );
      } catch (err: any) {
        console.error(
          "Attendance API error:",
          err
        );

        const apiMessage =
          err?.response?.data
            ?.message ||
          err?.response?.data
            ?.Message ||
          err?.message ||
          "Unable to load attendance.";

        setError(
          apiMessage
        );

        setAttendanceData(
          []
        );

        setTotalRecords(0);

        setTotalPagesFromApi(
          1
        );
      } finally {
        setLoading(false);
      }
    }, [
      search,
      getDateParams,
      getSortParams,
      getStatusParam,
      currentPage,
      rowsPerPage,
    ]);

  /* ===================================================
     INITIAL DASHBOARD
  =================================================== */

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  /* ===================================================
     LOAD ATTENDANCE
  =================================================== */

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  /* ===================================================
     RESET PAGE WHEN FILTER CHANGES
  =================================================== */

  useEffect(() => {
    setCurrentPage(1);
    setSelectedRows([]);
  }, [
    search,
    statusFilter,
    departmentFilter,
    dateFilter,
    sortFilter,
    rowsPerPage,
  ]);

  /* ===================================================
     DEPARTMENT FILTER
  =================================================== */

  const filteredData =
    useMemo(() => {
      if (
        departmentFilter ===
        "Department"
      ) {
        return attendanceData;
      }

      return attendanceData.filter(
        (item) =>
          item.departmentName ===
          departmentFilter
      );
    }, [
      attendanceData,
      departmentFilter,
    ]);

  /* ===================================================
     SELECT ROW
  =================================================== */

  const toggleRow = (
    id: string
  ) => {
    setSelectedRows(
      (prev) =>
        prev.includes(id)
          ? prev.filter(
              (rowId) =>
                rowId !== id
            )
          : [
              ...prev,
              id,
            ]
    );
  };

  /* ===================================================
     SELECT ALL
  =================================================== */

  const toggleAll = () => {
    const ids =
      filteredData.map(
        (item) => item.id
      );

    if (
      ids.length > 0 &&
      ids.every((id) =>
        selectedRows.includes(id)
      )
    ) {
      setSelectedRows([]);
    } else {
      setSelectedRows(ids);
    }
  };

  /* ===================================================
     GET ATTENDANCE BY ID
  =================================================== */

  const handleEdit = async (
    item: AttendanceType
  ) => {
    try {
      setEditingAttendance(
        item
      );

      setEditForm({
        date:
          formatDate(
            item.attendanceDate
          ),

        checkIn:
          formatTime(
            item.checkInTime
          ),

        checkOut:
          formatTime(
            item.checkOutTime
          ),

        break:
          formatMinutes(
            item.breakInMinutes
          ),

        late:
          formatMinutes(
            item.lateInMinutes
          ),

        hours:
          formatProductionHours(
            item.totalProductionHours
          ),

        status:
          getStatusLabel(
            item.status
          ),
      });

      setShowEditModal(
        true
      );

      setEditLoading(
        true
      );

      const response =
        await getAttendanceById(
          item.id
        );

      /*
        Actual API may return:

        {
          statusCode: 200,
          data: {...}
        }
      */

      const data =
        response?.data ||
        response?.Data ||
        response?.result ||
        response?.Result ||
        response;

      if (
        data &&
        typeof data === "object"
      ) {
        const detail: AttendanceType =
          {
            id: String(
              data.id ??
                item.id
            ),

            employeeId:
              String(
                data.employeeId ??
                  item.employeeId
              ),

            employeeName:
              String(
                data.employeeName ??
                  item.employeeName
              ),

            departmentName:
              String(
                data.departmentName ??
                  item.departmentName ??
                  ""
              ),

            attendanceDate:
              data.attendanceDate ??
              item.attendanceDate,

            checkInTime:
              data.checkInTime ??
              item.checkInTime,

            checkOutTime:
              data.checkOutTime ??
              item.checkOutTime,

            breakInMinutes:
              Number(
                data.breakInMinutes ??
                  item.breakInMinutes ??
                  0
              ),

            lateInMinutes:
              Number(
                data.lateInMinutes ??
                  item.lateInMinutes ??
                  0
              ),

            totalProductionHours:
              Number(
                data.totalProductionHours ??
                  item.totalProductionHours ??
                  0
              ),

            status:
              Number(
                data.status ??
                  item.status
              ),
          };

        setEditingAttendance(
          detail
        );

        setEditForm({
          date:
            formatDate(
              detail.attendanceDate
            ),

          checkIn:
            formatTime(
              detail.checkInTime
            ),

          checkOut:
            formatTime(
              detail.checkOutTime
            ),

          break:
            formatMinutes(
              detail.breakInMinutes
            ),

          late:
            formatMinutes(
              detail.lateInMinutes
            ),

          hours:
            formatProductionHours(
              detail.totalProductionHours
            ),

          status:
            getStatusLabel(
              detail.status
            ),
        });
      }
    } catch (err) {
      console.error(
        "Get attendance by id error:",
        err
      );
    } finally {
      setEditLoading(
        false
      );
    }
  };

  /* ===================================================
     CLOSE MODAL
  =================================================== */

  const handleCloseModal =
    () => {
      setShowEditModal(
        false
      );

      setEditingAttendance(
        null
      );
    };

  /* ===================================================
     STATUS CLASS
  =================================================== */

  const getStatusClass = (
    status: number
  ) => {
    if (
      status ===
      AttendanceStatus.Present
    ) {
      return "attendance-status present";
    }

    if (
      status ===
      AttendanceStatus.Late
    ) {
      return "attendance-status late";
    }

    if (
      status ===
      AttendanceStatus.Absent
    ) {
      return "attendance-status absent";
    }

    return "attendance-status unknown";
  };

  /* ===================================================
     HOURS CLASS
  =================================================== */

  const getHoursClass = (
    status: number
  ) => {
    if (
      status ===
      AttendanceStatus.Absent
    ) {
      return "production-badge red";
    }

    if (
      status ===
      AttendanceStatus.Late
    ) {
      return "production-badge blue";
    }

    return "production-badge green";
  };

  /* ===================================================
     DASHBOARD VALUE
  =================================================== */

  const getDashboardValue = (
    keys: string[],
    fallback: string
  ) => {
    const value =
      getValue(
        dashboardData,
        keys,
        undefined
      );

    if (
      value !== undefined &&
      value !== null
    ) {
      return String(value);
    }

    const nested =
      dashboardData?.data ||
      dashboardData?.Data ||
      dashboardData?.result ||
      dashboardData?.Result;

    const nestedValue =
      getValue(
        nested,
        keys,
        undefined
      );

    if (
      nestedValue !== undefined &&
      nestedValue !== null
    ) {
      return String(
        nestedValue
      );
    }

    return fallback;
  };

  /* ===================================================
     DASHBOARD COUNTS
  =================================================== */

  const presentCount =
    getDashboardValue(
      [
        "present",
        "Present",
        "presentCount",
        "PresentCount",
        "totalPresent",
        "TotalPresent",
      ],
      "0"
    );

  const lateCount =
    getDashboardValue(
      [
        "late",
        "Late",
        "lateCount",
        "LateCount",
        "lateLogin",
        "LateLogin",
      ],
      "0"
    );

  const uninformedCount =
    getDashboardValue(
      [
        "uninformed",
        "Uninformed",
        "uninformedCount",
        "UninformedCount",
      ],
      "0"
    );

  const permissionCount =
    getDashboardValue(
      [
        "permission",
        "Permission",
        "permissionCount",
        "PermissionCount",
      ],
      "0"
    );

  const absentCount =
    getDashboardValue(
      [
        "absent",
        "Absent",
        "absentCount",
        "AbsentCount",
        "totalAbsent",
        "TotalAbsent",
      ],
      "0"
    );

  const totalEmployees =
    getDashboardValue(
      [
        "totalEmployees",
        "TotalEmployees",
        "employeeCount",
        "EmployeeCount",
        "totalEmployee",
        "TotalEmployee",
      ],
      "0"
    );

  /* ===================================================
     PAGINATION
  =================================================== */

  const totalPages =
    Math.max(
      1,
      totalPagesFromApi
    );

  const goToPreviousPage =
    () => {
      if (
        currentPage > 1
      ) {
        setCurrentPage(
          (prev) =>
            prev - 1
        );
      }
    };

  const goToNextPage =
    () => {
      if (
        currentPage <
        totalPages
      ) {
        setCurrentPage(
          (prev) =>
            prev + 1
        );
      }
    };

  const startEntry =
    totalRecords === 0
      ? 0
      : (currentPage - 1) *
          rowsPerPage +
        1;

  const endEntry =
    totalRecords === 0
      ? 0
      : Math.min(
          currentPage *
            rowsPerPage,
          totalRecords
        );

  /* ===================================================
     JSX
  =================================================== */

  return (
    <div className="attendance-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .attendance-page {
          min-height: 100vh;
          background: #f5f6f8;
          padding: 28px 24px 30px;
          color: #1f2937;
          font-family: Arial, Helvetica, sans-serif;
        }

        .attendance-content {
          width: 100%;
          margin: 0 auto;
        }

        .attendance-header {
          margin-bottom: 24px;
        }

        .attendance-title {
          margin: 0 0 7px;
          font-size: 27px;
          line-height: 1.2;
          font-weight: 700;
          color: #172033;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #64748b;
          font-size: 13px;
        }

        .breadcrumb-home {
          display: flex;
          align-items: center;
          color: #648596;
          cursor: pointer;
        }

        .breadcrumb-current {
          color: #27364a;
        }

        .today-card {
          background: #ffffff;
          border: 1px solid #e9ebef;
          border-radius: 7px;
          padding: 20px;
          margin-bottom: 23px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.02);
        }

        .today-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 25px;
        }

        .today-heading {
          margin: 0 0 7px;
          font-size: 18px;
          font-weight: 600;
          color: #19263a;
        }

        .today-subtitle {
          margin: 0;
          font-size: 13px;
          color: #68758a;
        }

        .absent-summary {
          display: flex;
          align-items: center;
          gap: 15px;
          color: #182438;
          font-size: 14px;
          font-weight: 600;
        }

        .avatar-stack {
          display: flex;
          align-items: center;
        }

        .stack-avatar {
          width: 23px;
          height: 23px;
          border-radius: 50%;
          background: #d8d8d8;
          border: 2px solid white;
          margin-left: -5px;
        }

        .stack-avatar:first-child {
          margin-left: 0;
        }

        .stack-more {
          width: 26px;
          height: 26px;
          margin-left: -4px;
          border-radius: 50%;
          background: #bd9138;
          color: white;
          border: 2px solid white;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 12px;
          font-weight: 600;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          border: 1px solid #dfe3e8;
          border-radius: 4px;
          overflow: hidden;
        }

        .stat-item {
          min-height: 78px;
          padding: 16px 17px 13px;
          border-right: 1px solid #dfe3e8;
        }

        .stat-item:last-child {
          border-right: 0;
        }

        .stat-label {
          display: block;
          font-size: 13px;
          color: #475569;
          margin-bottom: 7px;
        }

        .stat-value-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stat-value {
          font-size: 17px;
          font-weight: 600;
          color: #263449;
        }

        .stat-change {
          border-radius: 4px;
          padding: 3px 8px;
          font-size: 10px;
          color: white;
          font-weight: 600;
        }

        .stat-change.up {
          background: #08bd65;
        }

        .stat-change.down {
          background: #ed0808;
        }

        .attendance-table-card {
          background: #ffffff;
          border: 1px solid #e1e5ea;
          border-radius: 6px;
          overflow: hidden;
        }

        .filter-header {
          min-height: 71px;
          padding: 15px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #e1e5ea;
          gap: 20px;
        }

        .table-heading {
          margin: 0;
          font-size: 17px;
          font-weight: 600;
          color: #172033;
          white-space: nowrap;
        }

        .filter-list {
          display: flex;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .custom-select-wrapper {
          position: relative;
        }

        .custom-select {
          appearance: none;
          -webkit-appearance: none;
          height: 39px;
          border: 1px solid #dce1e7;
          border-radius: 5px;
          background: white;
          padding: 0 35px 0 12px;
          font-size: 13px;
          color: #182438;
          outline: none;
          cursor: pointer;
        }

        .custom-select:focus {
          border-color: #bd9138;
        }

        .select-arrow {
          pointer-events: none;
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #657286;
        }

        .date-select {
          width: 195px;
        }

        .department-select {
          width: 125px;
        }

        .status-select {
          width: 133px;
        }

        .sort-select {
          width: 178px;
        }

        .table-toolbar {
          min-height: 59px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 11px 16px;
          border-bottom: 1px solid #e3e6eb;
        }

        .rows-control {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #4c596b;
        }

        .rows-select {
          width: 49px;
          height: 30px;
          padding: 0 5px;
          border: 1px solid #dce1e7;
          border-radius: 5px;
          background: white;
          color: #39475a;
          outline: none;
        }

        .search-wrapper {
          position: relative;
          width: 160px;
        }

        .search-input {
          width: 100%;
          height: 31px;
          border: 1px solid #dce1e7;
          border-radius: 5px;
          padding: 0 32px 0 11px;
          font-size: 12px;
          color: #334155;
          outline: none;
        }

        .search-input:focus {
          border-color: #bd9138;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .attendance-table {
          width: 100%;
          min-width: 1000px;
          border-collapse: collapse;
          table-layout: fixed;
        }

        .attendance-table thead {
          background: #e8eaee;
        }

        .attendance-table th {
          height: 43px;
          padding: 0 12px;
          font-size: 13px;
          font-weight: 600;
          color: #19263a;
          text-align: left;
          white-space: nowrap;
          border-bottom: 1px solid #dce0e5;
        }

        .attendance-table th:first-child {
          width: 55px;
          text-align: center;
        }

        .attendance-table th:nth-child(2) {
          width: 235px;
        }

        .attendance-table th:nth-child(3) {
          width: 120px;
        }

        .attendance-table th:nth-child(4) {
          width: 115px;
        }

        .attendance-table th:nth-child(5) {
          width: 115px;
        }

        .attendance-table th:nth-child(6) {
          width: 90px;
        }

        .attendance-table th:nth-child(7) {
          width: 90px;
        }

        .attendance-table th:nth-child(8) {
          width: 150px;
        }

        .attendance-table th:nth-child(9) {
          width: 55px;
        }

        .sortable-header {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .sort-icon {
          color: #bdc4cd;
        }

        .attendance-table td {
          height: 62px;
          padding: 7px 12px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 13px;
          color: #526074;
          vertical-align: middle;
        }

        .attendance-table tbody tr:hover {
          background: #fafafa;
        }

        .checkbox-cell {
          text-align: center;
        }

        .row-checkbox,
        .header-checkbox {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #bd9138;
        }

        .employee-cell {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .employee-avatar {
          flex: 0 0 auto;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #d9d9d9;
          display: flex;
          justify-content: center;
          align-items: center;
          color: #eeeeee;
          font-size: 11px;
        }

        .employee-info {
          min-width: 0;
        }

        .employee-name {
          display: block;
          color: #162236;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 3px;
        }

        .employee-team {
          display: block;
          color: #66748a;
          font-size: 11px;
        }

        .attendance-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
        }

        .attendance-status::before {
          content: "";
          width: 5px;
          height: 5px;
          border-radius: 50%;
        }

        .attendance-status.present {
          background: #d7f6e7;
          color: #00a85a;
        }

        .attendance-status.present::before {
          background: #00b85c;
        }

        .attendance-status.absent {
          background: #ffe1e1;
          color: #ef2020;
        }

        .attendance-status.absent::before {
          background: #ef2020;
        }

        .attendance-status.late {
          background: #fff0d4;
          color: #b97800;
        }

        .attendance-status.late::before {
          background: #e2a000;
        }

        .attendance-status.unknown {
          background: #edf0f3;
          color: #596579;
        }

        .attendance-status.unknown::before {
          background: #7c8797;
        }

        .production-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 8px;
          border-radius: 4px;
          color: white;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
        }

        .production-badge.green {
          background: #00bd5f;
        }

        .production-badge.red {
          background: #f00000;
        }

        .production-badge.blue {
          background: #177cf0;
        }

        .hours-cell {
          white-space: nowrap;
        }

        .edit-button {
          border: 0;
          background: transparent;
          color: #506176;
          padding: 5px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .edit-button:hover {
          color: #bd9138;
        }

        .table-footer {
          height: 56px;
          padding: 0 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #64748b;
          font-size: 13px;
        }

        .pagination {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .pagination-button {
          width: 28px;
          height: 28px;
          border: 0;
          background: transparent;
          color: #9aa3b0;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
        }

        .pagination-button:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .pagination-current {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #bd9138;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
        }

        .edit-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.47);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }

        .edit-modal {
          width: 500px;
          max-width: 100%;
          background: #ffffff;
          border-radius: 5px;
          box-shadow: 0 15px 45px rgba(0, 0, 0, 0.25);
          overflow: hidden;
          animation: modalOpen 0.18s ease-out;
        }

        @keyframes modalOpen {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.99);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .edit-modal-header {
          height: 62px;
          padding: 0 17px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #e2e6eb;
        }

        .edit-modal-title {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #263653;
        }

        .modal-close-button {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: none;
          background: #6d7787;
          color: white;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          padding: 0;
        }

        .modal-close-button:hover {
          background: #4f5969;
        }

        .edit-modal-body {
          padding: 18px 17px 16px;
        }

        .edit-field {
          margin-bottom: 17px;
        }

        .edit-field:last-child {
          margin-bottom: 0;
        }

        .edit-label {
          display: block;
          margin-bottom: 9px;
          font-size: 14px;
          color: #253450;
          font-weight: 400;
        }

        .edit-input-wrapper {
          position: relative;
        }

        .edit-input {
          width: 100%;
          height: 39px;
          border: 1px solid #dce1e7;
          border-radius: 5px;
          background: #ffffff;
          color: #29364c;
          padding: 0 12px;
          font-size: 14px;
          outline: none;
        }

        .edit-input.with-icon {
          padding-right: 40px;
        }

        .edit-input-icon {
          position: absolute;
          right: 11px;
          top: 50%;
          transform: translateY(-50%);
          color: #9aa5b5;
          pointer-events: none;
        }

        .edit-two-column {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .edit-select-wrapper {
          position: relative;
        }

        .edit-select {
          width: 100%;
          height: 39px;
          border: 1px solid #dce1e7;
          border-radius: 5px;
          background: #ffffff;
          color: #29364c;
          padding: 0 38px 0 12px;
          font-size: 14px;
          outline: none;
          appearance: none;
          -webkit-appearance: none;
        }

        .edit-select-arrow {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #58667a;
          pointer-events: none;
        }

        .edit-modal-footer {
          height: 64px;
          border-top: 1px solid #e3e6eb;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 9px;
          padding: 0 13px;
        }

        .cancel-button {
          height: 39px;
          padding: 0 15px;
          border: none;
          border-radius: 5px;
          background: #f6f7f8;
          color: #253047;
          font-size: 14px;
          cursor: pointer;
        }

        .loading-row {
          text-align: center;
          height: 120px;
          color: #7b8798;
        }

        .error-message {
          padding: 10px 16px;
          background: #fff1f1;
          border-bottom: 1px solid #ffd4d4;
          color: #d32323;
          font-size: 13px;
        }

        .dashboard-loading {
          color: #94a3b8;
          font-size: 11px;
          margin-left: 5px;
        }

        @media (max-width: 1100px) {
          .filter-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .filter-list {
            width: 100%;
            justify-content: flex-start;
          }

          .stats-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .stat-item:nth-child(3) {
            border-right: 0;
          }

          .stat-item:nth-child(4),
          .stat-item:nth-child(5) {
            border-top: 1px solid #dfe3e8;
          }
        }

        @media (max-width: 700px) {
          .attendance-page {
            padding: 20px 12px;
          }

          .today-header {
            align-items: flex-start;
            flex-direction: column;
            gap: 15px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .stat-item {
            border-right: 0;
            border-bottom: 1px solid #dfe3e8;
          }

          .stat-item:last-child {
            border-bottom: 0;
          }

          .stat-item:nth-child(4),
          .stat-item:nth-child(5) {
            border-top: 0;
          }

          .table-toolbar {
            align-items: flex-start;
            flex-direction: column;
            gap: 10px;
          }

          .filter-list {
            flex-direction: column;
            align-items: stretch;
          }

          .custom-select-wrapper,
          .custom-select {
            width: 100% !important;
          }

          .edit-modal-overlay {
            padding: 10px;
          }

          .edit-modal {
            width: 100%;
          }

          .edit-two-column {
            grid-template-columns: 1fr;
            gap: 0;
          }
        }
      `}</style>

      <div className="attendance-content">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="attendance-header">
          <h1 className="attendance-title">
            Attendance
          </h1>

          <div className="breadcrumb">
            <span
              className="breadcrumb-home"
              onClick={() =>
                navigate(
                  "/HR/HrDashboard"
                )
              }
            >
              <Home size={13} />
            </span>

            <span>/</span>

            <span className="breadcrumb-current">
              Attendance
            </span>
          </div>
        </div>

        {/* =================================================
            TODAY CARD
        ================================================= */}

        <div className="today-card">
          <div className="today-header">
            <div>
              <h2 className="today-heading">
                Attendance Details Today
              </h2>

              <p className="today-subtitle">
                Data from the{" "}
                {totalEmployees}{" "}
                total no of employees

                {dashboardLoading && (
                  <span className="dashboard-loading">
                    Loading...
                  </span>
                )}
              </p>
            </div>

            <div className="absent-summary">
              <span>
                Total Absenties today
              </span>

              <div className="avatar-stack">
                <span className="stack-avatar" />
                <span className="stack-avatar" />
                <span className="stack-avatar" />
                <span className="stack-avatar" />
                <span className="stack-avatar" />

                <span className="stack-more">
                  +{absentCount}
                </span>
              </div>
            </div>
          </div>

          <div className="stats-grid">

            <div className="stat-item">
              <span className="stat-label">
                Present
              </span>

              <div className="stat-value-row">
                <span className="stat-value">
                  {presentCount}
                </span>

                <span className="stat-change up">
                  ↗ +1%
                </span>
              </div>
            </div>

            <div className="stat-item">
              <span className="stat-label">
                Late Login
              </span>

              <div className="stat-value-row">
                <span className="stat-value">
                  {lateCount}
                </span>

                <span className="stat-change down">
                  ↘ -1%
                </span>
              </div>
            </div>

            <div className="stat-item">
              <span className="stat-label">
                Uninformed
              </span>

              <div className="stat-value-row">
                <span className="stat-value">
                  {uninformedCount}
                </span>

                <span className="stat-change down">
                  ↘ -12%
                </span>
              </div>
            </div>

            <div className="stat-item">
              <span className="stat-label">
                Permission
              </span>

              <div className="stat-value-row">
                <span className="stat-value">
                  {permissionCount}
                </span>

                <span className="stat-change up">
                  ↗ +1%
                </span>
              </div>
            </div>

            <div className="stat-item">
              <span className="stat-label">
                Absent
              </span>

              <div className="stat-value-row">
                <span className="stat-value">
                  {absentCount}
                </span>

                <span className="stat-change down">
                  ↘ -19%
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="attendance-table-card">

          <div className="filter-header">

            <h2 className="table-heading">
              Attendance
            </h2>

            <div className="filter-list">

              {/* DATE */}

              <div className="custom-select-wrapper">
                <select
                  className="custom-select date-select"
                  value={dateFilter}
                  onChange={(e) =>
                    setDateFilter(
                      e.target.value
                    )
                  }
                >
                  <option>
                    08/27/2026 - 09/02/2026
                  </option>

                  <option>
                    09/02/2026
                  </option>

                  <option>
                    09/01/2026
                  </option>

                  <option>
                    Last 7 Days
                  </option>

                  <option>
                    Last 30 Days
                  </option>

                  <option>
                    This Month
                  </option>
                </select>

                <ChevronDown
                  className="select-arrow"
                  size={15}
                />
              </div>

              {/* DEPARTMENT */}

              <div className="custom-select-wrapper">
                <select
                  className="custom-select department-select"
                  value={
                    departmentFilter
                  }
                  onChange={(e) =>
                    setDepartmentFilter(
                      e.target.value
                    )
                  }
                >
                  <option>
                    Department
                  </option>

                  <option>
                    UI/UX Team
                  </option>

                  <option>
                    Development
                  </option>

                  <option>
                    HR
                  </option>

                  <option>
                    Management
                  </option>

                  <option>
                    Finance
                  </option>
                </select>

                <ChevronDown
                  className="select-arrow"
                  size={15}
                />
              </div>

              {/* STATUS */}

              <div className="custom-select-wrapper">
                <select
                  className="custom-select status-select"
                  value={
                    statusFilter
                  }
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value
                    )
                  }
                >
                  <option>
                    Select Status
                  </option>

                  <option>
                    Present
                  </option>

                  <option>
                    Absent
                  </option>

                  <option>
                    Late
                  </option>
                </select>

                <ChevronDown
                  className="select-arrow"
                  size={15}
                />
              </div>

              {/* SORT */}

              <div className="custom-select-wrapper">
                <select
                  className="custom-select sort-select"
                  value={
                    sortFilter
                  }
                  onChange={(e) =>
                    setSortFilter(
                      e.target.value
                    )
                  }
                >
                  <option>
                    Sort By : Last 7 Days
                  </option>

                  <option>
                    Recently Added
                  </option>

                  <option>
                    Ascending
                  </option>

                  <option>
                    Descending
                  </option>

                  <option>
                    Last Month
                  </option>

                  <option>
                    Last 7 Days
                  </option>
                </select>

                <ChevronDown
                  className="select-arrow"
                  size={15}
                />
              </div>

            </div>
          </div>

          {/* ERROR */}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* TOOLBAR */}

          <div className="table-toolbar">

            <div className="rows-control">
              <span>
                Row Per Page
              </span>

              <select
                className="rows-select"
                value={
                  rowsPerPage
                }
                onChange={(e) =>
                  setRowsPerPage(
                    Number(
                      e.target.value
                    )
                  )
                }
              >
                <option value={10}>
                  10
                </option>

                <option value={20}>
                  20
                </option>

                <option value={30}>
                  30
                </option>

                <option value={40}>
                  40
                </option>

                <option value={50}>
                  50
                </option>
              </select>

              <span>
                Entries
              </span>
            </div>

            <div className="search-wrapper">

              <Search
                size={14}
                style={{
                  position:
                    "absolute",
                  right: "10px",
                  top: "8px",
                  color:
                    "#9aa3b0",
                  pointerEvents:
                    "none",
                }}
              />

              <input
                className="search-input"
                placeholder="Search"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />

            </div>
          </div>

          {/* TABLE */}

          <div className="table-wrapper">

            <table className="attendance-table">

              <thead>
                <tr>

                  <th>
                    <input
                      type="checkbox"
                      className="header-checkbox"
                      checked={
                        filteredData.length >
                          0 &&
                        filteredData.every(
                          (item) =>
                            selectedRows.includes(
                              item.id
                            )
                        )
                      }
                      onChange={
                        toggleAll
                      }
                    />
                  </th>

                  <th>
                    <div className="sortable-header">
                      <span>
                        Employee
                      </span>

                      <ArrowUpDown
                        size={13}
                        className="sort-icon"
                      />
                    </div>
                  </th>

                  <th>
                    <div className="sortable-header">
                      <span>
                        Status
                      </span>

                      <ArrowUpDown
                        size={13}
                        className="sort-icon"
                      />
                    </div>
                  </th>

                  <th>
                    <div className="sortable-header">
                      <span>
                        Check In
                      </span>

                      <ArrowUpDown
                        size={13}
                        className="sort-icon"
                      />
                    </div>
                  </th>

                  <th>
                    <div className="sortable-header">
                      <span>
                        Check Out
                      </span>

                      <ArrowUpDown
                        size={13}
                        className="sort-icon"
                      />
                    </div>
                  </th>

                  <th>
                    <div className="sortable-header">
                      <span>
                        Break
                      </span>

                      <ArrowUpDown
                        size={13}
                        className="sort-icon"
                      />
                    </div>
                  </th>

                  <th>
                    <div className="sortable-header">
                      <span>
                        Late
                      </span>

                      <ArrowUpDown
                        size={13}
                        className="sort-icon"
                      />
                    </div>
                  </th>

                  <th>
                    <div className="sortable-header">
                      <span>
                        Production Hours
                      </span>

                      <ArrowUpDown
                        size={13}
                        className="sort-icon"
                      />
                    </div>
                  </th>

                  <th />

                </tr>
              </thead>

              <tbody>

                {loading && (
                  <tr>
                    <td
                      colSpan={9}
                      className="loading-row"
                    >
                      Loading attendance...
                    </td>
                  </tr>
                )}

                {!loading &&
                  filteredData.map(
                    (item) => (
                      <tr
                        key={
                          item.id
                        }
                      >

                        <td className="checkbox-cell">
                          <input
                            type="checkbox"
                            className="row-checkbox"
                            checked={selectedRows.includes(
                              item.id
                            )}
                            onChange={() =>
                              toggleRow(
                                item.id
                              )
                            }
                          />
                        </td>

                        <td>
                          <div className="employee-cell">

                            <div className="employee-avatar">
                              •••
                            </div>

                            <div className="employee-info">

                              <span className="employee-name">
                                {
                                  item.employeeName ||
                                  "-"
                                }
                              </span>

                              <span className="employee-team">
                                {
                                  item.departmentName ||
                                  "-"
                                }
                              </span>

                            </div>

                          </div>
                        </td>

                        <td>
                          <span
                            className={getStatusClass(
                              item.status
                            )}
                          >
                            {
                              getStatusLabel(
                                item.status
                              )
                            }
                          </span>
                        </td>

                        <td>
                          {
                            formatTime(
                              item.checkInTime
                            )
                          }
                        </td>

                        <td>
                          {
                            formatTime(
                              item.checkOutTime
                            )
                          }
                        </td>

                        <td>
                          {
                            formatMinutes(
                              item.breakInMinutes
                            )
                          }
                        </td>

                        <td>
                          {
                            formatMinutes(
                              item.lateInMinutes
                            )
                          }
                        </td>

                        <td className="hours-cell">
                          <span
                            className={getHoursClass(
                              item.status
                            )}
                          >
                            <Clock3
                              size={11}
                            />

                            {
                              formatProductionHours(
                                item.totalProductionHours
                              )
                            }
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="edit-button"
                            onClick={() =>
                              handleEdit(
                                item
                              )
                            }
                            title="View Attendance"
                          >
                            <Edit3
                              size={15}
                            />
                          </button>
                        </td>

                      </tr>
                    )
                  )}

                {!loading &&
                  filteredData.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={9}
                        style={{
                          textAlign:
                            "center",
                          height:
                            "120px",
                          color:
                            "#7b8798",
                        }}
                      >
                        No attendance records found
                      </td>
                    </tr>
                  )}

              </tbody>
            </table>
          </div>

          {/* FOOTER */}

          <div className="table-footer">

            <span>
              Showing{" "}
              {startEntry} -{" "}
              {endEntry} of{" "}
              {totalRecords}{" "}
              entries
            </span>

            <div className="pagination">

              <button
                type="button"
                className="pagination-button"
                disabled={
                  currentPage <= 1
                }
                onClick={
                  goToPreviousPage
                }
              >
                <ChevronLeft
                  size={16}
                />
              </button>

              <span className="pagination-current">
                {currentPage}
              </span>

              <button
                type="button"
                className="pagination-button"
                disabled={
                  currentPage >=
                  totalPages
                }
                onClick={
                  goToNextPage
                }
              >
                <ChevronRight
                  size={16}
                />
              </button>

            </div>
          </div>

        </div>
      </div>

      {/* =================================================
          ATTENDANCE DETAIL MODAL
      ================================================= */}

      {showEditModal &&
        editingAttendance && (
          <div
            className="edit-modal-overlay"
            onMouseDown={(e) => {
              if (
                e.target ===
                e.currentTarget
              ) {
                handleCloseModal();
              }
            }}
          >

            <div
              className="edit-modal"
              onMouseDown={(e) =>
                e.stopPropagation()
              }
            >

              <div className="edit-modal-header">

                <h2 className="edit-modal-title">
                  Attendance Details
                </h2>

                <button
                  type="button"
                  className="modal-close-button"
                  onClick={
                    handleCloseModal
                  }
                >
                  <X
                    size={13}
                    strokeWidth={3}
                  />
                </button>

              </div>

              <div className="edit-modal-body">

                {editLoading && (
                  <div
                    style={{
                      marginBottom:
                        "12px",
                      color:
                        "#8a95a5",
                      fontSize:
                        "12px",
                    }}
                  >
                    Loading attendance details...
                  </div>
                )}

                {/* EMPLOYEE */}

                <div className="edit-field">

                  <label className="edit-label">
                    Employee
                  </label>

                  <input
                    type="text"
                    className="edit-input"
                    value={
                      editingAttendance.employeeName
                    }
                    readOnly
                  />

                </div>

                {/* DATE */}

                <div className="edit-field">

                  <label className="edit-label">
                    Date
                  </label>

                  <div className="edit-input-wrapper">

                    <input
                      type="text"
                      className="edit-input with-icon"
                      value={
                        editForm.date
                      }
                      readOnly
                    />

                    <CalendarDays
                      size={16}
                      className="edit-input-icon"
                    />

                  </div>

                </div>

                {/* CHECK IN / CHECK OUT */}

                <div className="edit-two-column">

                  <div className="edit-field">

                    <label className="edit-label">
                      Check In
                    </label>

                    <div className="edit-input-wrapper">

                      <input
                        type="text"
                        className="edit-input with-icon"
                        value={
                          editForm.checkIn
                        }
                        readOnly
                      />

                      <Clock3
                        size={17}
                        className="edit-input-icon"
                      />

                    </div>

                  </div>

                  <div className="edit-field">

                    <label className="edit-label">
                      Check Out
                    </label>

                    <div className="edit-input-wrapper">

                      <input
                        type="text"
                        className="edit-input with-icon"
                        value={
                          editForm.checkOut
                        }
                        readOnly
                      />

                      <Clock3
                        size={17}
                        className="edit-input-icon"
                      />

                    </div>

                  </div>

                </div>

                {/* BREAK / LATE */}

                <div className="edit-two-column">

                  <div className="edit-field">

                    <label className="edit-label">
                      Break
                    </label>

                    <input
                      type="text"
                      className="edit-input"
                      value={
                        editForm.break
                      }
                      readOnly
                    />

                  </div>

                  <div className="edit-field">

                    <label className="edit-label">
                      Late
                    </label>

                    <input
                      type="text"
                      className="edit-input"
                      value={
                        editForm.late
                      }
                      readOnly
                    />

                  </div>

                </div>

                {/* PRODUCTION HOURS */}

                <div className="edit-field">

                  <label className="edit-label">
                    Production Hours
                  </label>

                  <div className="edit-input-wrapper">

                    <input
                      type="text"
                      className="edit-input with-icon"
                      value={
                        editForm.hours
                      }
                      readOnly
                    />

                    <Clock3
                      size={17}
                      className="edit-input-icon"
                    />

                  </div>

                </div>

                {/* STATUS */}

                <div className="edit-field">

                  <label className="edit-label">
                    Status
                  </label>

                  <input
                    type="text"
                    className="edit-input"
                    value={
                      editForm.status
                    }
                    readOnly
                  />

                </div>

              </div>

              <div className="edit-modal-footer">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={
                    handleCloseModal
                  }
                >
                  Close
                </button>

              </div>

            </div>
          </div>
        )}

    </div>
  );
};

export default Atendance;
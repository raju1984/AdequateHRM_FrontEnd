import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import avatar02 from "../../assets/img/profiles/avatar-02.jpg";
import avatar03 from "../../assets/img/profiles/avatar-03.jpg";
import avatar05 from "../../assets/img/profiles/avatar-05.jpg";
import avatar06 from "../../assets/img/profiles/avatar-06.jpg";
import avatar07 from "../../assets/img/profiles/avatar-07.jpg";

import user49 from "../../assets/img/users/user-49.jpg";
import user09 from "../../assets/img/users/user-09.jpg";
import user01 from "../../assets/img/users/user-01.jpg";
import user33 from "../../assets/img/users/user-33.jpg";
import user34 from "../../assets/img/users/user-34.jpg";
import user02 from "../../assets/img/users/user-02.jpg";
import user35 from "../../assets/img/users/user-35.jpg";
import user30 from "../../assets/img/users/user-30.jpg";
import user36 from "../../assets/img/users/user-36.jpg";
import user38 from "../../assets/img/users/user-38.jpg";

import {
  getAdminAttendance,
  getDepartments,
  updateAdminAttendance,
} from "../../services/adminservices";

/* =====================================================
   TYPES
===================================================== */

interface Employee {
  id: string;
  name: string;
  team: string;
  departmentId: string;
  status: "Present" | "Absent";
  checkIn: string;
  checkOut: string;
  breakTime: string;
  late: string;
  hours: string;
  badge: "success" | "danger" | "primary";
  image: string;
  attendanceDate: string;
}

interface Department {
  id: string;
  name: string;
}

interface EditForm {
  date: string;
  checkIn: string;
  checkOut: string;
  breakTime: string;
  late: string;
  hours: string;
  status: "Present" | "Absent";
}

interface ApiDepartment {
  id?: string;
  Id?: string;
  departmentId?: string;
  DepartmentId?: string;

  name?: string;
  Name?: string;
  departmentName?: string;
  DepartmentName?: string;
}

interface ApiAttendance {
  id?: string;
  Id?: string;

  attendanceId?: string;
  AttendanceId?: string;

  employeeId?: string;
  EmployeeId?: string;

  userId?: string;
  UserId?: string;

  firstName?: string;
  FirstName?: string;

  lastName?: string;
  LastName?: string;

  employeeName?: string;
  EmployeeName?: string;

  name?: string;
  Name?: string;

  departmentName?: string;
  DepartmentName?: string;

  team?: string;
  Team?: string;

  departmentId?: string;
  DepartmentId?: string;

  status?: number | string | boolean;
  Status?: number | string | boolean;

  checkIn?: string;
  CheckIn?: string;

  checkOut?: string;
  CheckOut?: string;

  breakTime?: string;
  BreakTime?: string;

  break?: string;
  Break?: string;

  late?: string;
  Late?: string;

  productionHours?: string;
  ProductionHours?: string;

  hours?: string;
  Hours?: string;

  attendanceDate?: string;
  AttendanceDate?: string;

  date?: string;
  Date?: string;

  profilePicture?: string;
  ProfilePicture?: string;

  image?: string;
  Image?: string;
}

/* =====================================================
   HELPERS
===================================================== */

const avatarFallbacks = [
  user49,
  user09,
  user01,
  user33,
  user34,
  user02,
  user35,
  user30,
  user36,
  user38,
];

const getArrayFromResponse = (
  response: any
): any[] => {
  if (!response) {
    return [];
  }

  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.Data)) {
    return response.Data;
  }

  if (Array.isArray(response.items)) {
    return response.items;
  }

  if (Array.isArray(response.Items)) {
    return response.Items;
  }

  if (Array.isArray(response.result)) {
    return response.result;
  }

  if (Array.isArray(response.Result)) {
    return response.Result;
  }

  if (
    response.data &&
    typeof response.data === "object"
  ) {
    if (Array.isArray(response.data.items)) {
      return response.data.items;
    }

    if (Array.isArray(response.data.Items)) {
      return response.data.Items;
    }

    if (Array.isArray(response.data.result)) {
      return response.data.result;
    }

    if (Array.isArray(response.data.Result)) {
      return response.data.Result;
    }
  }

  return [];
};

const getResponseTotal = (
  response: any,
  fallback: number
): number => {
  const possibleValues = [
    response?.totalCount,
    response?.TotalCount,
    response?.totalRecords,
    response?.TotalRecords,
    response?.total,
    response?.Total,
    response?.data?.totalCount,
    response?.data?.TotalCount,
    response?.data?.totalRecords,
    response?.data?.TotalRecords,
    response?.data?.total,
    response?.data?.Total,
    response?.result?.totalCount,
    response?.result?.TotalCount,
  ];

  const found = possibleValues.find(
    (value) =>
      value !== undefined &&
      value !== null &&
      !Number.isNaN(Number(value))
  );

  return found !== undefined
    ? Number(found)
    : fallback;
};

const getValue = (
  obj: any,
  keys: string[]
): any => {
  for (const key of keys) {
    if (
      obj?.[key] !== undefined &&
      obj?.[key] !== null
    ) {
      return obj[key];
    }
  }

  return undefined;
};

const formatDisplayValue = (
  value: any,
  fallback = "-"
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return fallback;
  }

  return String(value);
};

const normalizeStatus = (
  value: any
): "Present" | "Absent" => {
  if (
    value === true ||
    value === "true" ||
    value === "Present" ||
    value === "present" ||
    Number(value) === 1
  ) {
    return "Present";
  }

  return "Absent";
};

const statusToApiValue = (
  status: "Present" | "Absent"
) => {
  /*
    Swagger mein Status integer hai
    aur 0/1/2 indicate kiya gaya hai.

    Common mapping:
    0 = All
    1 = Present
    2 = Absent
  */

  return status === "Present" ? 1 : 2;
};

const formatDateForInput = (
  value: string
) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.substring(0, 10);
  }

  return date.toISOString().split("T")[0];
};

const formatDateForApi = (
  value: string,
  endOfDay = false
) => {
  if (!value) {
    return undefined;
  }

  const date = new Date(
    `${value}T${
      endOfDay
        ? "23:59:59.999"
        : "00:00:00.000"
    }`
  );

  return date.toISOString();
};

const normalizeAttendance = (
  item: ApiAttendance,
  index: number
): Employee => {
  const id = String(
    getValue(item, [
      "id",
      "Id",
      "attendanceId",
      "AttendanceId",
    ]) ??
      getValue(item, [
        "employeeId",
        "EmployeeId",
        "userId",
        "UserId",
      ]) ??
      index
  );

  const employeeName =
    getValue(item, [
      "employeeName",
      "EmployeeName",
      "name",
      "Name",
    ]) ||
    [
      getValue(item, [
        "firstName",
        "FirstName",
      ]),
      getValue(item, [
        "lastName",
        "LastName",
      ]),
    ]
      .filter(Boolean)
      .join(" ");

  const status = normalizeStatus(
    getValue(item, [
      "status",
      "Status",
    ])
  );

  const hours =
    getValue(item, [
      "productionHours",
      "ProductionHours",
      "hours",
      "Hours",
    ]);

  const image =
    getValue(item, [
      "profilePicture",
      "ProfilePicture",
      "image",
      "Image",
    ]) ||
    avatarFallbacks[
      index % avatarFallbacks.length
    ];

  return {
    id,

    name:
      employeeName ||
      "Unknown Employee",

    team:
      getValue(item, [
        "departmentName",
        "DepartmentName",
        "team",
        "Team",
      ]) ||
      "Department",

    departmentId: String(
      getValue(item, [
        "departmentId",
        "DepartmentId",
      ]) || ""
    ),

    status,

    checkIn: formatDisplayValue(
      getValue(item, [
        "checkIn",
        "CheckIn",
      ])
    ),

    checkOut: formatDisplayValue(
      getValue(item, [
        "checkOut",
        "CheckOut",
      ])
    ),

    breakTime: formatDisplayValue(
      getValue(item, [
        "breakTime",
        "BreakTime",
        "break",
        "Break",
      ])
    ),

    late: formatDisplayValue(
      getValue(item, [
        "late",
        "Late",
      ])
    ),

    hours: formatDisplayValue(
      hours,
      "0.00 Hrs"
    ),

    badge:
      status === "Absent"
        ? "danger"
        : index % 4 === 0
        ? "primary"
        : "success",

    image,

    attendanceDate: formatDateForInput(
      String(
        getValue(item, [
          "attendanceDate",
          "AttendanceDate",
          "date",
          "Date",
        ]) || ""
      )
    ),
  };
};

const normalizeDepartment = (
  item: ApiDepartment
): Department | null => {
  const id = getValue(item, [
    "id",
    "Id",
    "departmentId",
    "DepartmentId",
  ]);

  const name = getValue(item, [
    "name",
    "Name",
    "departmentName",
    "DepartmentName",
  ]);

  if (!id || !name) {
    return null;
  }

  return {
    id: String(id),
    name: String(name),
  };
};

/* =====================================================
   COMPONENT
===================================================== */

const Attendance = () => {
  const navigate = useNavigate();

  /* ===================================================
     PAGINATION
  =================================================== */

  const [rowsPerPage, setRowsPerPage] =
    useState(10);

  const [currentPage, setCurrentPage] =
    useState(1);

  /* ===================================================
     FILTERS
  =================================================== */

  const [search, setSearch] =
    useState("");

  const [department, setDepartment] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  const [fromDate, setFromDate] =
    useState("2026-08-28");

  const [toDate, setToDate] =
    useState("2026-09-03");

  const [sortBy, setSortBy] =
    useState("");

  /* ===================================================
     DATA
  =================================================== */

  const [employees, setEmployees] =
    useState<Employee[]>([]);

  const [departments, setDepartments] =
    useState<Department[]>([]);

  const [totalRecords, setTotalRecords] =
    useState(0);

  /* ===================================================
     LOADING / ERROR
  =================================================== */

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  /* ===================================================
     MODAL
  =================================================== */

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [
    selectedEmployeeId,
    setSelectedEmployeeId,
  ] = useState<string | null>(null);

  const [editForm, setEditForm] =
    useState<EditForm>({
      date: "",
      checkIn: "",
      checkOut: "",
      breakTime: "",
      late: "",
      hours: "",
      status: "Present",
    });

  /* ===================================================
     LOAD DEPARTMENTS
  =================================================== */

  const loadDepartments =
    useCallback(async () => {
      try {
        const response =
          await getDepartments({
            PageNumber: 1,
            PageSize: 100,
          });

        const apiDepartments =
          getArrayFromResponse(response);

        const normalized =
          apiDepartments
            .map(normalizeDepartment)
            .filter(
              (
                item
              ): item is Department =>
                item !== null
            );

        setDepartments(normalized);
      } catch (err) {
        console.error(
          "DEPARTMENT API ERROR:",
          err
        );
      }
    }, []);

  /* ===================================================
     LOAD ATTENDANCE
  =================================================== */

  const loadAttendance =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const statusValue =
          statusFilter === ""
            ? undefined
            : statusFilter === "Present"
            ? 1
            : 2;

        const response =
          await getAdminAttendance({
            FromDate:
              formatDateForApi(fromDate),

            ToDate:
              formatDateForApi(
                toDate,
                true
              ),

            DepartmentId:
              department || undefined,

            Status:
              statusValue,

            Search:
              search.trim() || undefined,

            SortBy:
              sortBy || undefined,

            PageNumber:
              currentPage,

            PageSize:
              rowsPerPage,
          });

        console.log(
          "NORMALIZED ATTENDANCE RESPONSE:",
          response
        );

        const apiRows =
          getArrayFromResponse(response);

        const normalizedRows =
          apiRows.map(
            normalizeAttendance
          );

        setEmployees(
          normalizedRows
        );

        setTotalRecords(
          getResponseTotal(
            response,
            normalizedRows.length
          )
        );
      } catch (err: any) {
        console.error(
          "ATTENDANCE API ERROR:",
          err
        );

        setEmployees([]);
        setTotalRecords(0);

        setError(
          err?.response?.data?.message ||
            err?.response?.data?.Message ||
            err?.message ||
            "Unable to load attendance records."
        );
      } finally {
        setLoading(false);
      }
    }, [
      fromDate,
      toDate,
      department,
      statusFilter,
      search,
      sortBy,
      currentPage,
      rowsPerPage,
    ]);

  /* ===================================================
     INITIAL LOAD
  =================================================== */

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  /* ===================================================
     ATTENDANCE LOAD
  =================================================== */

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  /* ===================================================
     RESET PAGE WHEN FILTER CHANGES
  =================================================== */

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    department,
    statusFilter,
    fromDate,
    toDate,
    sortBy,
    rowsPerPage,
  ]);

  /* ===================================================
     STATISTICS
  =================================================== */

  const statistics = useMemo(() => {
    const present =
      employees.filter(
        (item) =>
          item.status === "Present"
      ).length;

    const absent =
      employees.filter(
        (item) =>
          item.status === "Absent"
      ).length;

    const late =
      employees.filter(
        (item) =>
          item.late !== "-" &&
          item.late !== "" &&
          item.late !== "0 Min"
      ).length;

    return [
      {
        title: "Present",
        count: String(present),
        percentage: "+1%",
        positive: true,
      },

      {
        title: "Late Login",
        count: String(late),
        percentage: "-1%",
        positive: false,
      },

      {
        title: "Uninformed",
        count: "0",
        percentage: "-12%",
        positive: false,
      },

      {
        title: "Permission",
        count: "0",
        percentage: "+1%",
        positive: true,
      },

      {
        title: "Absent",
        count: String(absent),
        percentage: "-19%",
        positive: false,
      },
    ];
  }, [employees]);

  /* ===================================================
     EDIT MODAL
  =================================================== */

  const openEditModal = (
    employee: Employee
  ) => {
    setSelectedEmployeeId(
      employee.id
    );

    setEditForm({
      date:
        employee.attendanceDate ||
        fromDate,

      checkIn:
        employee.checkIn === "-"
          ? ""
          : employee.checkIn,

      checkOut:
        employee.checkOut === "-"
          ? ""
          : employee.checkOut,

      breakTime:
        employee.breakTime === "-"
          ? ""
          : employee.breakTime,

      late:
        employee.late === "-"
          ? ""
          : employee.late,

      hours:
        employee.hours ===
        "0.00 Hrs"
          ? ""
          : employee.hours,

      status:
        employee.status,
    });

    setShowEditModal(true);
  };

  const closeEditModal = () => {
    if (saving) {
      return;
    }

    setShowEditModal(false);
    setSelectedEmployeeId(null);
  };

  /* ===================================================
     EDIT CHANGE
  =================================================== */

  const handleEditChange = (
    field: keyof EditForm,
    value: string
  ) => {
    setEditForm(
      (previous) => ({
        ...previous,
        [field]: value,
      })
    );
  };

  /* ===================================================
     SAVE ATTENDANCE
  =================================================== */

  const handleSaveChanges =
    async () => {
      if (
        selectedEmployeeId ===
        null
      ) {
        return;
      }

      try {
        setSaving(true);
        setError("");

        const absent =
          editForm.status ===
          "Absent";

        /*
        PUT body

        NOTE:
        Agar Swagger ke PUT body mein exact
        property names different hain to yahi
        payload modify karna hoga.
        */

       const payload = {
  attendanceDate: editForm.date
    ? new Date(
        `${editForm.date}T00:00:00`
      ).toISOString()
    : undefined,

  checkIn: absent
    ? ""
    : editForm.checkIn || "",

  checkOut: absent
    ? ""
    : editForm.checkOut || "",

  breakTime: absent
    ? ""
    : editForm.breakTime || "",

  late: absent
    ? ""
    : editForm.late || "",

  productionHours: absent
    ? "0.00 Hrs"
    : editForm.hours || "0.00 Hrs",

  status: statusToApiValue(
    editForm.status
  ),
};

        console.log(
          "PUT ATTENDANCE PAYLOAD:",
          payload
        );

        await updateAdminAttendance(
          selectedEmployeeId,
          payload
        );

        setShowEditModal(false);
        setSelectedEmployeeId(null);

        await loadAttendance();
      } catch (err: any) {
        console.error(
          "UPDATE ATTENDANCE ERROR:",
          err
        );

        setError(
          err?.response?.data?.message ||
            err?.response?.data?.Message ||
            err?.message ||
            "Unable to update attendance."
        );
      } finally {
        setSaving(false);
      }
    };

  /* ===================================================
     PAGINATION
  =================================================== */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalRecords /
          rowsPerPage
      )
    );

  const pageStart =
    totalRecords === 0
      ? 0
      : (currentPage - 1) *
          rowsPerPage +
        1;

  const pageEnd =
    Math.min(
      currentPage *
        rowsPerPage,
      totalRecords
    );

  const goToPreviousPage =
    () => {
      setCurrentPage(
        (previous) =>
          Math.max(
            1,
            previous - 1
          )
      );
    };

  const goToNextPage = () => {
    setCurrentPage(
      (previous) =>
        Math.min(
          totalPages,
          previous + 1
        )
    );
  };

  /* ===================================================
     STYLES
  =================================================== */

  const commonInputStyle: React.CSSProperties =
    {
      height: "38px",
      border:
        "1px solid #d9dee7",
      borderRadius: "5px",
      boxShadow: "none",
      fontSize: "14px",
      color: "#344054",
      backgroundColor:
        "#ffffff",
    };

  const labelStyle: React.CSSProperties =
    {
      display: "block",
      marginBottom: "8px",
      fontSize: "14px",
      fontWeight: 500,
      color: "#253858",
    };

  const tableCellStyle: React.CSSProperties =
    {
      fontSize: "14px",
      color: "#667085",
      whiteSpace: "nowrap",
      verticalAlign: "middle",
      height: "59px",
      borderColor:
        "#e9edf2",
    };

  const tableHeaderStyle: React.CSSProperties =
    {
      background: "#e9edf2",
      fontSize: "13px",
      fontWeight: 600,
      color: "#111827",
      whiteSpace:
        "nowrap",
      verticalAlign:
        "middle",
      height: "44px",
    };

  const sortIcon = (
    <i
      className="ti ti-arrows-sort ms-2"
      style={{
        color: "#c8cfd8",
        fontSize: "14px",
      }}
    />
  );

  /* ===================================================
     UI
  =================================================== */

  return (
    <>
      <div
        style={{
          background: "#f5f6f8",
          minHeight:
            "100vh",
          padding:
            "22px 24px 30px",
          color: "#1f2937",
        }}
      >
        {/* PAGE TITLE */}

        <div
          style={{
            marginBottom:
              "24px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "25px",
              lineHeight:
                "32px",
              fontWeight: 700,
              color:
                "#172b4d",
            }}
          >
            Attendance
          </h2>

          <div
            style={{
              display:
                "flex",
              alignItems:
                "center",
              marginTop: "7px",
              gap: "8px",
              fontSize:
                "13px",
              color:
                "#667085",
            }}
          >
            <i
              className="ti ti-smart-home"
              onClick={() =>
                navigate(
                  "/admin/Dashboard"
                )
              }
              style={{
                cursor:
                  "pointer",
                color:
                  "#607d8b",
                fontSize:
                  "14px",
              }}
            />

            <span
              style={{
                color:
                  "#c0c7d0",
              }}
            >
              /
            </span>

            <span
              style={{
                color:
                  "#253858",
              }}
            >
              Attendance
            </span>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div
            style={{
              marginBottom:
                "16px",
              padding:
                "12px 15px",
              border:
                "1px solid #f5c2c7",
              borderRadius:
                "6px",
              background:
                "#f8d7da",
              color:
                "#842029",
              fontSize:
                "14px",
            }}
          >
            {error}

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              style={{
                float:
                  "right",
                border:
                  "none",
                background:
                  "transparent",
                color:
                  "#842029",
                fontWeight:
                  700,
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* ATTENDANCE DETAILS */}

        <div
          style={{
            background:
              "#ffffff",
            border:
              "1px solid #edf0f3",
            borderRadius:
              "7px",
            boxShadow:
              "0 1px 2px rgba(16,24,40,.03)",
            marginBottom:
              "22px",
            padding:
              "18px 19px 20px",
          }}
        >
          <div
            style={{
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "space-between",
              flexWrap:
                "wrap",
              gap: "18px",
              marginBottom:
                "24px",
            }}
          >
            <div>
              <h4
                style={{
                  margin:
                    "0 0 4px",
                  fontSize:
                    "18px",
                  lineHeight:
                    "26px",
                  fontWeight: 700,
                  color:
                    "#172b4d",
                }}
              >
                Attendance
                Details
                Today
              </h4>

              <p
                style={{
                  margin: 0,
                  fontSize:
                    "14px",
                  color:
                    "#697586",
                }}
              >
                Data from the
                attendance
                records
              </p>
            </div>

            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                gap: "22px",
              }}
            >
              <span
                style={{
                  fontSize:
                    "14px",
                  fontWeight: 600,
                  color:
                    "#172b4d",
                }}
              >
                Total Absenties
                today
              </span>

              <div
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  paddingLeft:
                    "7px",
                }}
              >
                {[
                  avatar02,
                  avatar03,
                  avatar05,
                  avatar06,
                  avatar07,
                ].map(
                  (
                    image,
                    index
                  ) => (
                    <img
                      key={index}
                      src={image}
                      alt=""
                      style={{
                        width:
                          "25px",
                        height:
                          "25px",
                        borderRadius:
                          "50%",
                        objectFit:
                          "cover",
                        border:
                          "1.5px solid #fff",
                        marginLeft:
                          index ===
                          0
                            ? 0
                            : "-8px",
                      }}
                    />
                  )
                )}

                <div
                  style={{
                    width:
                      "25px",
                    height:
                      "25px",
                    borderRadius:
                      "50%",
                    background:
                      "#bf8b30",
                    color:
                      "#fff",
                    border:
                      "1.5px solid #fff",
                    marginLeft:
                      "-8px",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    fontSize:
                      "11px",
                    fontWeight:
                      600,
                  }}
                >
                  +1
                </div>
              </div>
            </div>
          </div>

          {/* STATS */}

          <div
            className="attendance-stats"
            style={{
              border:
                "1px solid #dfe4ea",
              borderRadius:
                "5px",
              overflow:
                "hidden",
              display:
                "grid",
              gridTemplateColumns:
                "repeat(5, 1fr)",
            }}
          >
            {statistics.map(
              (
                item,
                index
              ) => (
                <div
                  key={
                    item.title
                  }
                  style={{
                    padding:
                      "17px 16px 15px",
                    minHeight:
                      "78px",
                    borderRight:
                      index ===
                      statistics.length -
                        1
                        ? "none"
                        : "1px solid #dfe4ea",
                  }}
                >
                  <div
                    style={{
                      color:
                        "#5f6b7a",
                      fontSize:
                        "14px",
                      marginBottom:
                        "5px",
                    }}
                  >
                    {
                      item.title
                    }
                  </div>

                  <div
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "space-between",
                    }}
                  >
                    <span
                      style={{
                        fontSize:
                          "17px",
                        fontWeight:
                          500,
                        color:
                          "#172b4d",
                      }}
                    >
                      {
                        item.count
                      }
                    </span>

                    <span
                      style={{
                        background:
                          item.positive
                            ? "#05b958"
                            : "#ec0505",
                        color:
                          "#fff",
                        borderRadius:
                          "4px",
                        padding:
                          "2px 7px",
                        minWidth:
                          "47px",
                        textAlign:
                          "center",
                        fontSize:
                          "11px",
                        lineHeight:
                          "15px",
                        fontWeight:
                          600,
                      }}
                    >
                      <i
                        className={`ti ${
                          item.positive
                            ? "ti-trending-up"
                            : "ti-trending-down"
                        }`}
                        style={{
                          fontSize:
                            "10px",
                          marginRight:
                            "3px",
                        }}
                      />

                      {
                        item.percentage
                      }
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* TABLE CARD */}

        <div
          style={{
            background:
              "#fff",
            border:
              "1px solid #edf0f3",
            borderRadius:
              "7px",
            boxShadow:
              "0 1px 2px rgba(16,24,40,.03)",
            overflow:
              "hidden",
          }}
        >
          {/* TABLE HEADER */}

          <div
            style={{
              minHeight:
                "72px",
              padding:
                "16px 19px",
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "space-between",
              gap: "16px",
              flexWrap:
                "wrap",
              borderBottom:
                "1px solid #e6e9ed",
            }}
          >
            <h5
              style={{
                margin: 0,
                fontSize:
                  "16px",
                fontWeight:
                  700,
                color:
                  "#172b4d",
              }}
            >
              Attendance
            </h5>

            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                gap: "10px",
                flexWrap:
                  "wrap",
              }}
            >
              {/* FROM DATE */}

              <input
                type="date"
                value={
                  fromDate
                }
                onChange={(
                  e
                ) => {
                  setFromDate(
                    e.target
                      .value
                  );
                  setCurrentPage(
                    1
                  );
                }}
                className="form-control"
                style={{
                  width:
                    "145px",
                  height:
                    "40px",
                  border:
                    "1px solid #dfe3e8",
                  borderRadius:
                    "6px",
                  fontSize:
                    "14px",
                  boxShadow:
                    "none",
                }}
              />

              <span
                style={{
                  color:
                    "#667085",
                }}
              >
                -
              </span>

              {/* TO DATE */}

              <input
                type="date"
                value={
                  toDate
                }
                onChange={(
                  e
                ) => {
                  setToDate(
                    e.target
                      .value
                  );
                  setCurrentPage(
                    1
                  );
                }}
                className="form-control"
                style={{
                  width:
                    "145px",
                  height:
                    "40px",
                  border:
                    "1px solid #dfe3e8",
                  borderRadius:
                    "6px",
                  fontSize:
                    "14px",
                  boxShadow:
                    "none",
                }}
              />

              {/* DEPARTMENT */}

              <select
                value={
                  department
                }
                onChange={(
                  e
                ) => {
                  setDepartment(
                    e.target
                      .value
                  );
                  setCurrentPage(
                    1
                  );
                }}
                className="form-select"
                style={{
                  width:
                    "155px",
                  height:
                    "40px",
                  border:
                    "1px solid #dfe3e8",
                  borderRadius:
                    "6px",
                  fontSize:
                    "14px",
                  boxShadow:
                    "none",
                }}
              >
                <option value="">
                  Department
                </option>

                {departments.map(
                  (
                    item
                  ) => (
                    <option
                      key={
                        item.id
                      }
                      value={
                        item.id
                      }
                    >
                      {
                        item.name
                      }
                    </option>
                  )
                )}
              </select>

              {/* STATUS */}

              <select
                value={
                  statusFilter
                }
                onChange={(
                  e
                ) => {
                  setStatusFilter(
                    e.target
                      .value
                  );
                  setCurrentPage(
                    1
                  );
                }}
                className="form-select"
                style={{
                  width:
                    "134px",
                  height:
                    "40px",
                  border:
                    "1px solid #dfe3e8",
                  borderRadius:
                    "6px",
                  fontSize:
                    "14px",
                  boxShadow:
                    "none",
                }}
              >
                <option value="">
                  Select
                  Status
                </option>

                <option value="Present">
                  Present
                </option>

                <option value="Absent">
                  Absent
                </option>
              </select>

              {/* SORT */}

              <select
                value={
                  sortBy
                }
                onChange={(
                  e
                ) => {
                  setSortBy(
                    e.target
                      .value
                  );
                  setCurrentPage(
                    1
                  );
                }}
                className="form-select"
                style={{
                  width:
                    "177px",
                  height:
                    "40px",
                  border:
                    "1px solid #dfe3e8",
                  borderRadius:
                    "6px",
                  fontSize:
                    "14px",
                  boxShadow:
                    "none",
                }}
              >
                <option value="">
                  Sort By :
                  Last 7 Days
                </option>

                <option value="Name">
                  Name
                </option>

                <option value="CheckIn">
                  Check In
                </option>

                <option value="CheckOut">
                  Check Out
                </option>

                <option value="Status">
                  Status
                </option>
              </select>
            </div>
          </div>

          {/* ROW PER PAGE */}

          <div
            style={{
              minHeight:
                "59px",
              padding:
                "12px 16px",
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "space-between",
              flexWrap:
                "wrap",
              gap: "20px",
              borderBottom:
                "1px solid #e9edf2",
            }}
          >
            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                gap: "8px",
                fontSize:
                  "14px",
                color:
                  "#344054",
              }}
            >
              <span>
                Row Per Page
              </span>

              <select
                value={
                  rowsPerPage
                }
                onChange={(
                  e
                ) =>
                  setRowsPerPage(
                    Number(
                      e.target
                        .value
                    )
                  )
                }
                className="form-select form-select-sm"
                style={{
                  width:
                    "50px",
                  height:
                    "30px",
                  padding:
                    "2px 22px 2px 8px",
                  fontSize:
                    "13px",
                  boxShadow:
                    "none",
                }}
              >
                <option value={5}>
                  5
                </option>

                <option value={10}>
                  10
                </option>

                <option value={20}>
                  20
                </option>

                <option value={50}>
                  50
                </option>
              </select>

              <span>
                Entries
              </span>
            </div>

            {/* SEARCH */}

            <div
              style={{
                position:
                  "relative",
              }}
            >
              <input
                type="text"
                placeholder="Search"
                value={
                  search
                }
                onChange={(
                  e
                ) => {
                  setSearch(
                    e.target
                      .value
                  );
                  setCurrentPage(
                    1
                  );
                }}
                className="form-control"
                style={{
                  width:
                    "160px",
                  height:
                    "31px",
                  borderRadius:
                    "5px",
                  fontSize:
                    "13px",
                  boxShadow:
                    "none",
                }}
              />
            </div>
          </div>

          {/* TABLE */}

          <div className="table-responsive">
            <table
              className="table mb-0"
              style={{
                minWidth:
                  "1000px",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      ...tableHeaderStyle,
                      width:
                        "65px",
                      paddingLeft:
                        "20px",
                    }}
                  >
                    <input
                      type="checkbox"
                    />
                  </th>

                  <th
                    style={{
                      ...tableHeaderStyle,
                      minWidth:
                        "195px",
                    }}
                  >
                    Employee{" "}
                    {sortIcon}
                  </th>

                  <th
                    style={{
                      ...tableHeaderStyle,
                      minWidth:
                        "120px",
                    }}
                  >
                    Status{" "}
                    {sortIcon}
                  </th>

                  <th
                    style={{
                      ...tableHeaderStyle,
                      minWidth:
                        "113px",
                    }}
                  >
                    Check In{" "}
                    {sortIcon}
                  </th>

                  <th
                    style={{
                      ...tableHeaderStyle,
                      minWidth:
                        "120px",
                    }}
                  >
                    Check Out{" "}
                    {sortIcon}
                  </th>

                  <th
                    style={{
                      ...tableHeaderStyle,
                      minWidth:
                        "90px",
                    }}
                  >
                    Break{" "}
                    {sortIcon}
                  </th>

                  <th
                    style={{
                      ...tableHeaderStyle,
                      minWidth:
                        "90px",
                    }}
                  >
                    Late{" "}
                    {sortIcon}
                  </th>

                  <th
                    style={{
                      ...tableHeaderStyle,
                      minWidth:
                        "175px",
                    }}
                  >
                    Production
                    Hours{" "}
                    {sortIcon}
                  </th>

                  <th
                    style={{
                      ...tableHeaderStyle,
                      width:
                        "70px",
                    }}
                  />
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={9}
                      style={{
                        padding:
                          "50px",
                        textAlign:
                          "center",
                        color:
                          "#667085",
                      }}
                    >
                      <div
                        className="spinner-border"
                        role="status"
                        style={{
                          width:
                            "25px",
                          height:
                            "25px",
                        }}
                      />

                      <div
                        style={{
                          marginTop:
                            "10px",
                        }}
                      >
                        Loading
                        attendance...
                      </div>
                    </td>
                  </tr>
                ) : employees.length >
                  0 ? (
                  employees.map(
                    (
                      employee
                    ) => (
                      <tr
                        key={
                          employee.id
                        }
                      >
                        <td
                          style={{
                            ...tableCellStyle,
                            paddingLeft:
                              "20px",
                          }}
                        >
                          <input
                            type="checkbox"
                          />
                        </td>

                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          <div
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap: "9px",
                            }}
                          >
                            <img
                              src={
                                employee.image
                              }
                              alt={
                                employee.name
                              }
                              style={{
                                width:
                                  "32px",
                                height:
                                  "32px",
                                borderRadius:
                                  "50%",
                                objectFit:
                                  "cover",
                              }}
                            />

                            <div>
                              <div
                                style={{
                                  color:
                                    "#111827",
                                  fontSize:
                                    "14px",
                                  lineHeight:
                                    "18px",
                                  fontWeight:
                                    500,
                                }}
                              >
                                {
                                  employee.name
                                }
                              </div>

                              <div
                                style={{
                                  color:
                                    "#667085",
                                  fontSize:
                                    "12px",
                                  lineHeight:
                                    "17px",
                                }}
                              >
                                {
                                  employee.team
                                }
                              </div>
                            </div>
                          </div>
                        </td>

                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          <span
                            style={{
                              display:
                                "inline-flex",
                              alignItems:
                                "center",
                              gap: "6px",
                              color:
                                employee.status ===
                                "Present"
                                  ? "#00a84f"
                                  : "#e1261c",
                              background:
                                employee.status ===
                                "Present"
                                  ? "#d5f5e3"
                                  : "#fde2e1",
                              padding:
                                "3px 10px",
                              borderRadius:
                                "4px",
                              fontSize:
                                "11px",
                              fontWeight:
                                500,
                            }}
                          >
                            <span
                              style={{
                                width:
                                  "4px",
                                height:
                                  "4px",
                                borderRadius:
                                  "50%",
                                background:
                                  employee.status ===
                                  "Present"
                                    ? "#00b85a"
                                    : "#ef2116",
                              }}
                            />

                            {
                              employee.status
                            }
                          </span>
                        </td>

                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          {
                            employee.checkIn
                          }
                        </td>

                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          {
                            employee.checkOut
                          }
                        </td>

                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          {
                            employee.breakTime
                          }
                        </td>

                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          {
                            employee.late
                          }
                        </td>

                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          <span
                            className={`badge bg-${employee.badge}`}
                            style={{
                              display:
                                "inline-flex",
                              alignItems:
                                "center",
                              gap: "4px",
                              borderRadius:
                                "4px",
                              padding:
                                "3px 8px",
                              fontSize:
                                "11px",
                              fontWeight:
                                600,
                              color:
                                "#fff",
                            }}
                          >
                            <i className="ti ti-clock-hour-11" />

                            {
                              employee.hours
                            }
                          </span>
                        </td>

                        <td
                          style={{
                            ...tableCellStyle,
                            textAlign:
                              "center",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(
                                employee
                              )
                            }
                            className="btn"
                            style={{
                              border:
                                "none",
                              background:
                                "transparent",
                              padding:
                                "4px 6px",
                              color:
                                "#41627d",
                              boxShadow:
                                "none",
                            }}
                          >
                            <i
                              className="ti ti-edit"
                              style={{
                                fontSize:
                                  "16px",
                              }}
                            />
                          </button>
                        </td>
                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <td
                      colSpan={9}
                      style={{
                        padding:
                          "40px",
                        textAlign:
                          "center",
                        color:
                          "#667085",
                      }}
                    >
                      No attendance
                      records
                      found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}

          <div
            style={{
              minHeight:
                "57px",
              borderTop:
                "1px solid #e9edf2",
              padding:
                "0 16px",
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "space-between",
              gap: "15px",
            }}
          >
            <div
              style={{
                fontSize:
                  "14px",
                color:
                  "#526173",
              }}
            >
              Showing{" "}
              {pageStart} -{" "}
              {pageEnd} of{" "}
              {totalRecords}{" "}
              entries
            </div>

            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                gap: "16px",
              }}
            >
              <button
                type="button"
                disabled={
                  currentPage ===
                  1
                }
                onClick={
                  goToPreviousPage
                }
                style={{
                  border:
                    "none",
                  background:
                    "transparent",
                  color:
                    currentPage ===
                    1
                      ? "#d0d5dd"
                      : "#98a2b3",
                  cursor:
                    currentPage ===
                    1
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                <i className="ti ti-chevron-left" />
              </button>

              <button
                type="button"
                style={{
                  width:
                    "27px",
                  height:
                    "27px",
                  borderRadius:
                    "50%",
                  border:
                    "none",
                  background:
                    "#bf8b30",
                  color:
                    "#fff",
                  fontSize:
                    "12px",
                }}
              >
                {currentPage}
              </button>

              <button
                type="button"
                disabled={
                  currentPage >=
                  totalPages
                }
                onClick={
                  goToNextPage
                }
                style={{
                  border:
                    "none",
                  background:
                    "transparent",
                  color:
                    currentPage >=
                    totalPages
                      ? "#d0d5dd"
                      : "#98a2b3",
                  cursor:
                    currentPage >=
                    totalPages
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                <i className="ti ti-chevron-right" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          EDIT ATTENDANCE MODAL
      ================================================= */}

      {showEditModal && (
        <>
          {/* BACKDROP */}

          <div
            onClick={
              closeEditModal
            }
            style={{
              position:
                "fixed",
              inset: 0,
              background:
                "rgba(0,0,0,.42)",
              zIndex: 9998,
            }}
          />

          {/* MODAL */}

          <div
            className="attendance-edit-modal"
            style={{
              position:
                "fixed",
              top: "50%",
              left: "50%",
              transform:
                "translate(-50%, -50%)",
              width: "500px",
              maxWidth:
                "calc(100vw - 30px)",
              maxHeight:
                "calc(100vh - 30px)",
              overflowY:
                "auto",
              background:
                "#fff",
              borderRadius:
                "5px",
              boxShadow:
                "0 15px 40px rgba(0,0,0,.2)",
              zIndex: 9999,
            }}
          >
            {/* MODAL HEADER */}

            <div
              style={{
                height:
                  "64px",
                padding:
                  "0 16px",
                borderBottom:
                  "1px solid #e5e7eb",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "space-between",
              }}
            >
              <h4
                style={{
                  margin: 0,
                  fontSize:
                    "20px",
                  fontWeight:
                    600,
                  color:
                    "#253858",
                }}
              >
                Edit Attendance
              </h4>

              <button
                type="button"
                onClick={
                  closeEditModal
                }
                disabled={
                  saving
                }
                style={{
                  width:
                    "20px",
                  height:
                    "20px",
                  padding: 0,
                  border:
                    "none",
                  borderRadius:
                    "50%",
                  background:
                    "#747c89",
                  color:
                    "#fff",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  cursor:
                    saving
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                <i
                  className="ti ti-x"
                  style={{
                    fontSize:
                      "12px",
                  }}
                />
              </button>
            </div>

            {/* MODAL BODY */}

            <div
              style={{
                padding:
                  "16px",
              }}
            >
              {/* DATE */}

              <div
                style={{
                  marginBottom:
                    "16px",
                }}
              >
                <label
                  style={
                    labelStyle
                  }
                >
                  Date
                </label>

                <input
                  type="date"
                  value={
                    editForm.date
                  }
                  onChange={(
                    e
                  ) =>
                    handleEditChange(
                      "date",
                      e.target
                        .value
                    )
                  }
                  className="form-control attendance-date-input"
                  style={{
                    ...commonInputStyle,
                    width:
                      "100%",
                  }}
                />
              </div>

              {/* CHECK IN / CHECK OUT */}

              <div
                className="modal-two-column"
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: "24px",
                  marginBottom:
                    "16px",
                }}
              >
                <div>
                  <label
                    style={
                      labelStyle
                    }
                  >
                    Check In
                  </label>

                  <div
                    style={{
                      position:
                        "relative",
                    }}
                  >
                    <input
                      type="text"
                      value={
                        editForm.checkIn
                      }
                      disabled={
                        editForm.status ===
                        "Absent"
                      }
                      onChange={(
                        e
                      ) =>
                        handleEditChange(
                          "checkIn",
                          e.target
                            .value
                        )
                      }
                      className="form-control"
                      style={{
                        ...commonInputStyle,
                        width:
                          "100%",
                        padding:
                          "0 40px 0 16px",
                        background:
                          editForm.status ===
                          "Absent"
                            ? "#f5f5f5"
                            : "#fff",
                      }}
                    />

                    <i
                      className="ti ti-clock"
                      style={{
                        position:
                          "absolute",
                        right:
                          "12px",
                        top:
                          "50%",
                        transform:
                          "translateY(-50%)",
                        fontSize:
                          "17px",
                        color:
                          "#98a2b3",
                        pointerEvents:
                          "none",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    style={
                      labelStyle
                    }
                  >
                    Check Out
                  </label>

                  <div
                    style={{
                      position:
                        "relative",
                    }}
                  >
                    <input
                      type="text"
                      value={
                        editForm.checkOut
                      }
                      disabled={
                        editForm.status ===
                        "Absent"
                      }
                      onChange={(
                        e
                      ) =>
                        handleEditChange(
                          "checkOut",
                          e.target
                            .value
                        )
                      }
                      className="form-control"
                      style={{
                        ...commonInputStyle,
                        width:
                          "100%",
                        padding:
                          "0 40px 0 16px",
                        background:
                          editForm.status ===
                          "Absent"
                            ? "#f5f5f5"
                            : "#fff",
                      }}
                    />

                    <i
                      className="ti ti-clock"
                      style={{
                        position:
                          "absolute",
                        right:
                          "12px",
                        top:
                          "50%",
                        transform:
                          "translateY(-50%)",
                        fontSize:
                          "17px",
                        color:
                          "#98a2b3",
                        pointerEvents:
                          "none",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* BREAK / LATE */}

              <div
                className="modal-two-column"
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: "24px",
                  marginBottom:
                    "16px",
                }}
              >
                <div>
                  <label
                    style={
                      labelStyle
                    }
                  >
                    Break
                  </label>

                  <input
                    type="text"
                    value={
                      editForm.breakTime
                    }
                    disabled={
                      editForm.status ===
                      "Absent"
                    }
                    onChange={(
                      e
                    ) =>
                      handleEditChange(
                        "breakTime",
                        e.target
                          .value
                      )
                    }
                    className="form-control"
                    style={{
                      ...commonInputStyle,
                      width:
                        "100%",
                      background:
                        editForm.status ===
                        "Absent"
                          ? "#f5f5f5"
                          : "#fff",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={
                      labelStyle
                    }
                  >
                    Late
                  </label>

                  <input
                    type="text"
                    value={
                      editForm.late
                    }
                    disabled={
                      editForm.status ===
                      "Absent"
                    }
                    onChange={(
                      e
                    ) =>
                      handleEditChange(
                        "late",
                        e.target
                          .value
                      )
                    }
                    className="form-control"
                    style={{
                      ...commonInputStyle,
                      width:
                        "100%",
                      background:
                        editForm.status ===
                        "Absent"
                          ? "#f5f5f5"
                          : "#fff",
                    }}
                  />
                </div>
              </div>

              {/* PRODUCTION HOURS */}

              <div
                style={{
                  marginBottom:
                    "16px",
                }}
              >
                <label
                  style={
                    labelStyle
                  }
                >
                  Production
                  Hours
                </label>

                <div
                  style={{
                    position:
                      "relative",
                  }}
                >
                  <input
                    type="text"
                    value={
                      editForm.hours
                    }
                    disabled={
                      editForm.status ===
                      "Absent"
                    }
                    onChange={(
                      e
                    ) =>
                      handleEditChange(
                        "hours",
                        e.target
                          .value
                      )
                    }
                    className="form-control"
                    style={{
                      ...commonInputStyle,
                      width:
                        "100%",
                      padding:
                        "0 40px 0 16px",
                      background:
                        editForm.status ===
                        "Absent"
                          ? "#f5f5f5"
                          : "#fff",
                    }}
                  />

                  <i
                    className="ti ti-clock"
                    style={{
                      position:
                        "absolute",
                      right:
                        "12px",
                      top:
                        "50%",
                      transform:
                        "translateY(-50%)",
                      fontSize:
                        "17px",
                      color:
                        "#98a2b3",
                      pointerEvents:
                        "none",
                    }}
                  />
                </div>
              </div>

              {/* STATUS */}

              <div>
                <label
                  style={
                    labelStyle
                  }
                >
                  Status
                </label>

                <select
                  value={
                    editForm.status
                  }
                  onChange={(
                    e
                  ) =>
                    handleEditChange(
                      "status",
                      e.target
                        .value as
                        | "Present"
                        | "Absent"
                    )
                  }
                  className="form-select"
                  style={{
                    ...commonInputStyle,
                    width:
                      "100%",
                  }}
                >
                  <option value="Present">
                    Present
                  </option>

                  <option value="Absent">
                    Absent
                  </option>
                </select>
              </div>
            </div>

            {/* MODAL FOOTER */}

            <div
              style={{
                borderTop:
                  "1px solid #e5e7eb",
                padding:
                  "12px",
                display:
                  "flex",
                justifyContent:
                  "flex-end",
                alignItems:
                  "center",
                gap: "8px",
              }}
            >
              <button
                type="button"
                onClick={
                  closeEditModal
                }
                disabled={
                  saving
                }
                style={{
                  height:
                    "40px",
                  padding:
                    "0 16px",
                  border:
                    "none",
                  borderRadius:
                    "5px",
                  background:
                    "#f8f9fa",
                  color:
                    "#172b4d",
                  fontSize:
                    "14px",
                  fontWeight:
                    500,
                  cursor:
                    saving
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleSaveChanges
                }
                disabled={
                  saving
                }
                style={{
                  height:
                    "40px",
                  padding:
                    "0 17px",
                  border:
                    "none",
                  borderRadius:
                    "5px",
                  background:
                    saving
                      ? "#d8b778"
                      : "#c49135",
                  color:
                    "#fff",
                  fontSize:
                    "14px",
                  fontWeight:
                    600,
                  cursor:
                    saving
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* =================================================
          CSS
      ================================================= */}

      <style>
        {`
          .table > :not(caption) > * > * {
            border-bottom-color: #e9edf2;
          }

          .table tbody tr:hover {
            background-color: #fafbfc;
          }

          .form-control:focus,
          .form-select:focus {
            border-color: #c7ced7 !important;
            box-shadow: none !important;
          }

          .form-select {
            cursor: pointer;
          }

          input[type="checkbox"] {
            width: 18px;
            height: 18px;
            cursor: pointer;
            accent-color: #bf8b30;
          }

          .attendance-date-input::-webkit-calendar-picker-indicator {
            opacity: 0.55;
            cursor: pointer;
          }

          @media (max-width: 992px) {
            .attendance-stats {
              grid-template-columns: repeat(2, 1fr) !important;
            }
          }

          @media (max-width: 600px) {
            .attendance-stats {
              grid-template-columns: 1fr !important;
            }

            .modal-two-column {
              grid-template-columns: 1fr !important;
              gap: 16px !important;
            }

            .attendance-edit-modal {
              width: calc(100vw - 24px) !important;
            }
          }
        `}
      </style>
    </>
  );
};

export default Attendance
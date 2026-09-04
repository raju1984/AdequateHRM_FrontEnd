import React, { useMemo, useState } from "react";
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

interface Employee {
  id: number;
  name: string;
  team: string;
  status: "Present" | "Absent";
  checkIn: string;
  checkOut: string;
  breakTime: string;
  late: string;
  hours: string;
  badge: "success" | "danger" | "primary";
  image: string;
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

const Attendance = () => {
  const navigate = useNavigate();

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(
    null
  );

  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: 1,
      name: "Anthony Lewis",
      team: "UI/UX Team",
      status: "Present",
      checkIn: "09:00 AM",
      checkOut: "06:45 PM",
      breakTime: "30 Min",
      late: "32 Min",
      hours: "8.55 Hrs",
      badge: "success",
      image: user49,
    },
    {
      id: 2,
      name: "Brian Villalobos",
      team: "Development",
      status: "Present",
      checkIn: "09:00 AM",
      checkOut: "06:12 PM",
      breakTime: "20 Min",
      late: "20 Min",
      hours: "7.54 Hrs",
      badge: "danger",
      image: user09,
    },
    {
      id: 3,
      name: "Harvey Smith",
      team: "HR",
      status: "Present",
      checkIn: "09:00 AM",
      checkOut: "06:13 PM",
      breakTime: "50 Min",
      late: "23 Min",
      hours: "8.45 Hrs",
      badge: "success",
      image: user01,
    },
    {
      id: 4,
      name: "Stephan Peralt",
      team: "Management",
      status: "Present",
      checkIn: "09:00 AM",
      checkOut: "06:23 PM",
      breakTime: "41 Min",
      late: "50 Min",
      hours: "8.35 Hrs",
      badge: "success",
      image: user33,
    },
    {
      id: 5,
      name: "Doglas Martini",
      team: "Development",
      status: "Present",
      checkIn: "09:00 AM",
      checkOut: "06:43 PM",
      breakTime: "23 Min",
      late: "10 Min",
      hours: "8.22 Hrs",
      badge: "success",
      image: user34,
    },
    {
      id: 6,
      name: "Linda Ray",
      team: "UI/UX Team",
      status: "Present",
      checkIn: "09:00 AM",
      checkOut: "07:15 PM",
      breakTime: "03 Min",
      late: "30 Min",
      hours: "8.32 Hrs",
      badge: "success",
      image: user02,
    },
    {
      id: 7,
      name: "Elliot Murray",
      team: "UI/UX Team",
      status: "Present",
      checkIn: "09:00 AM",
      checkOut: "07:13 PM",
      breakTime: "32 Min",
      late: "41 Min",
      hours: "9.15 Hrs",
      badge: "primary",
      image: user35,
    },
    {
      id: 8,
      name: "Rebecca Smith",
      team: "UI/UX Team",
      status: "Present",
      checkIn: "09:00 AM",
      checkOut: "09:17 PM",
      breakTime: "14 Min",
      late: "12 Min",
      hours: "9.25 Hrs",
      badge: "success",
      image: user30,
    },
    {
      id: 9,
      name: "Connie Waters",
      team: "Management",
      status: "Present",
      checkIn: "09:00 AM",
      checkOut: "08:15 PM",
      breakTime: "12 Min",
      late: "03 Min",
      hours: "8.35 Hrs",
      badge: "success",
      image: user36,
    },
    {
      id: 10,
      name: "Lori Broaddus",
      team: "Finance",
      status: "Absent",
      checkIn: "-",
      checkOut: "-",
      breakTime: "-",
      late: "-",
      hours: "0.00 Hrs",
      badge: "danger",
      image: user38,
    },
  ]);

  const [editForm, setEditForm] = useState<EditForm>({
    date: "",
    checkIn: "",
    checkOut: "",
    breakTime: "",
    late: "",
    hours: "",
    status: "Present",
  });

  const statistics = [
    {
      title: "Present",
      count: "250",
      percentage: "+1%",
      positive: true,
    },
    {
      title: "Late Login",
      count: "45",
      percentage: "-1%",
      positive: false,
    },
    {
      title: "Uninformed",
      count: "15",
      percentage: "-12%",
      positive: false,
    },
    {
      title: "Permission",
      count: "03",
      percentage: "+1%",
      positive: true,
    },
    {
      title: "Absent",
      count: "12",
      percentage: "-19%",
      positive: false,
    },
  ];

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const text = search.trim().toLowerCase();

      const matchesSearch =
        !text ||
        employee.name.toLowerCase().includes(text) ||
        employee.team.toLowerCase().includes(text) ||
        employee.status.toLowerCase().includes(text);

      const matchesDepartment =
        !department || employee.team === department;

      const matchesStatus =
        !statusFilter || employee.status === statusFilter;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [employees, search, department, statusFilter]);

  const visibleEmployees = filteredEmployees.slice(0, rowsPerPage);

  const openEditModal = (employee: Employee) => {
    setSelectedEmployeeId(employee.id);

    setEditForm({
      date: "",
      checkIn: employee.checkIn === "-" ? "" : employee.checkIn,
      checkOut: employee.checkOut === "-" ? "" : employee.checkOut,
      breakTime: employee.breakTime === "-" ? "" : employee.breakTime,
      late: employee.late === "-" ? "" : employee.late,
      hours: employee.hours === "0.00 Hrs" ? "" : employee.hours,
      status: employee.status,
    });

    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedEmployeeId(null);
  };

  const handleEditChange = (
    field: keyof EditForm,
    value: string
  ) => {
    setEditForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSaveChanges = () => {
    if (selectedEmployeeId === null) return;

    setEmployees((previousEmployees) =>
      previousEmployees.map((employee) => {
        if (employee.id !== selectedEmployeeId) {
          return employee;
        }

        const absent = editForm.status === "Absent";

        return {
          ...employee,
          status: editForm.status,
          checkIn: absent ? "-" : editForm.checkIn || "-",
          checkOut: absent ? "-" : editForm.checkOut || "-",
          breakTime: absent ? "-" : editForm.breakTime || "-",
          late: absent ? "-" : editForm.late || "-",
          hours: absent ? "0.00 Hrs" : editForm.hours || "0.00 Hrs",
          badge:
            absent
              ? "danger"
              : employee.badge === "danger"
              ? "success"
              : employee.badge,
        };
      })
    );

    closeEditModal();
  };

  const commonInputStyle: React.CSSProperties = {
    height: "38px",
    border: "1px solid #d9dee7",
    borderRadius: "5px",
    boxShadow: "none",
    fontSize: "14px",
    color: "#344054",
    backgroundColor: "#ffffff",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: 500,
    color: "#253858",
  };

  const tableCellStyle: React.CSSProperties = {
    fontSize: "14px",
    color: "#667085",
    whiteSpace: "nowrap",
    verticalAlign: "middle",
    height: "59px",
    borderColor: "#e9edf2",
  };

  const tableHeaderStyle: React.CSSProperties = {
    background: "#e9edf2",
    fontSize: "13px",
    fontWeight: 600,
    color: "#111827",
    whiteSpace: "nowrap",
    verticalAlign: "middle",
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

  return (
    <>
      <div
        style={{
          background: "#f5f6f8",
          minHeight: "100vh",
          padding: "22px 24px 30px",
          color: "#1f2937",
        }}
      >
        {/* PAGE TITLE */}

        <div style={{ marginBottom: "24px" }}>
          <h2
            style={{
              margin: 0,
              fontSize: "25px",
              lineHeight: "32px",
              fontWeight: 700,
              color: "#172b4d",
            }}
          >
            Attendance
          </h2>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: "7px",
              gap: "8px",
              fontSize: "13px",
              color: "#667085",
            }}
          >
            <i
              className="ti ti-smart-home"
              onClick={() => navigate("/admin/Dashboard")}
              style={{
                cursor: "pointer",
                color: "#607d8b",
                fontSize: "14px",
              }}
            />

            <span style={{ color: "#c0c7d0" }}>/</span>

            <span style={{ color: "#253858" }}>Attendance</span>
          </div>
        </div>

        {/* ATTENDANCE DETAILS */}

        <div
          style={{
            background: "#ffffff",
            border: "1px solid #edf0f3",
            borderRadius: "7px",
            boxShadow: "0 1px 2px rgba(16,24,40,.03)",
            marginBottom: "22px",
            padding: "18px 19px 20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "18px",
              marginBottom: "24px",
            }}
          >
            <div>
              <h4
                style={{
                  margin: "0 0 4px",
                  fontSize: "18px",
                  lineHeight: "26px",
                  fontWeight: 700,
                  color: "#172b4d",
                }}
              >
                Attendance Details Today
              </h4>

              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: "#697586",
                }}
              >
                Data from the 800+ total no of employees
              </p>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "22px",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#172b4d",
                }}
              >
                Total Absenties today
              </span>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: "7px",
                }}
              >
                {[avatar02, avatar03, avatar05, avatar06, avatar07].map(
                  (image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt=""
                      style={{
                        width: "25px",
                        height: "25px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "1.5px solid #fff",
                        marginLeft: index === 0 ? 0 : "-8px",
                      }}
                    />
                  )
                )}

                <div
                  style={{
                    width: "25px",
                    height: "25px",
                    borderRadius: "50%",
                    background: "#bf8b30",
                    color: "#fff",
                    border: "1.5px solid #fff",
                    marginLeft: "-8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: 600,
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
              border: "1px solid #dfe4ea",
              borderRadius: "5px",
              overflow: "hidden",
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
            }}
          >
            {statistics.map((item, index) => (
              <div
                key={item.title}
                style={{
                  padding: "17px 16px 15px",
                  minHeight: "78px",
                  borderRight:
                    index === statistics.length - 1
                      ? "none"
                      : "1px solid #dfe4ea",
                }}
              >
                <div
                  style={{
                    color: "#5f6b7a",
                    fontSize: "14px",
                    marginBottom: "5px",
                  }}
                >
                  {item.title}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      fontSize: "17px",
                      fontWeight: 500,
                      color: "#172b4d",
                    }}
                  >
                    {item.count}
                  </span>

                  <span
                    style={{
                      background: item.positive ? "#05b958" : "#ec0505",
                      color: "#fff",
                      borderRadius: "4px",
                      padding: "2px 7px",
                      minWidth: "47px",
                      textAlign: "center",
                      fontSize: "11px",
                      lineHeight: "15px",
                      fontWeight: 600,
                    }}
                  >
                    <i
                      className={`ti ${
                        item.positive
                          ? "ti-trending-up"
                          : "ti-trending-down"
                      }`}
                      style={{
                        fontSize: "10px",
                        marginRight: "3px",
                      }}
                    />

                    {item.percentage}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TABLE CARD */}

        <div
          style={{
            background: "#fff",
            border: "1px solid #edf0f3",
            borderRadius: "7px",
            boxShadow: "0 1px 2px rgba(16,24,40,.03)",
            overflow: "hidden",
          }}
        >
          {/* TABLE HEADER */}

          <div
            style={{
              minHeight: "72px",
              padding: "16px 19px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
              borderBottom: "1px solid #e6e9ed",
            }}
          >
            <h5
              style={{
                margin: 0,
                fontSize: "16px",
                fontWeight: 700,
                color: "#172b4d",
              }}
            >
              Attendance
            </h5>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "195px",
                }}
              >
                <input
                  type="text"
                  readOnly
                  value="08/28/2026 - 09/03/2026"
                  className="form-control"
                  style={{
                    height: "40px",
                    paddingRight: "34px",
                    border: "1px solid #dfe3e8",
                    borderRadius: "6px",
                    boxShadow: "none",
                    fontSize: "14px",
                  }}
                />

                <i
                  className="ti ti-chevron-down"
                  style={{
                    position: "absolute",
                    right: "11px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#52677d",
                    pointerEvents: "none",
                  }}
                />
              </div>

              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="form-select"
                style={{
                  width: "125px",
                  height: "40px",
                  border: "1px solid #dfe3e8",
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxShadow: "none",
                }}
              >
                <option value="">Department</option>
                <option value="UI/UX Team">UI/UX Team</option>
                <option value="Development">Development</option>
                <option value="HR">HR</option>
                <option value="Management">Management</option>
                <option value="Finance">Finance</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-select"
                style={{
                  width: "134px",
                  height: "40px",
                  border: "1px solid #dfe3e8",
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxShadow: "none",
                }}
              >
                <option value="">Select Status</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
              </select>

              <select
                className="form-select"
                style={{
                  width: "177px",
                  height: "40px",
                  border: "1px solid #dfe3e8",
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxShadow: "none",
                }}
              >
                <option>Sort By : Last 7 Days</option>
              </select>
            </div>
          </div>

          {/* ROW PER PAGE */}

          <div
            style={{
              minHeight: "59px",
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "20px",
              borderBottom: "1px solid #e9edf2",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                color: "#344054",
              }}
            >
              <span>Row Per Page</span>

              <select
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                className="form-select form-select-sm"
                style={{
                  width: "50px",
                  height: "30px",
                  padding: "2px 22px 2px 8px",
                  fontSize: "13px",
                  boxShadow: "none",
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>

              <span>Entries</span>
            </div>

            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control"
              style={{
                width: "160px",
                height: "31px",
                borderRadius: "5px",
                fontSize: "13px",
                boxShadow: "none",
              }}
            />
          </div>

          {/* TABLE */}

          <div className="table-responsive">
            <table
              className="table mb-0"
              style={{
                minWidth: "1000px",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      ...tableHeaderStyle,
                      width: "65px",
                      paddingLeft: "20px",
                    }}
                  >
                    <input type="checkbox" />
                  </th>

                  <th
                    style={{
                      ...tableHeaderStyle,
                      minWidth: "195px",
                    }}
                  >
                    Employee {sortIcon}
                  </th>

                  <th
                    style={{
                      ...tableHeaderStyle,
                      minWidth: "120px",
                    }}
                  >
                    Status {sortIcon}
                  </th>

                  <th
                    style={{
                      ...tableHeaderStyle,
                      minWidth: "113px",
                    }}
                  >
                    Check In {sortIcon}
                  </th>

                  <th
                    style={{
                      ...tableHeaderStyle,
                      minWidth: "120px",
                    }}
                  >
                    Check Out {sortIcon}
                  </th>

                  <th
                    style={{
                      ...tableHeaderStyle,
                      minWidth: "90px",
                    }}
                  >
                    Break {sortIcon}
                  </th>

                  <th
                    style={{
                      ...tableHeaderStyle,
                      minWidth: "90px",
                    }}
                  >
                    Late {sortIcon}
                  </th>

                  <th
                    style={{
                      ...tableHeaderStyle,
                      minWidth: "175px",
                    }}
                  >
                    Production Hours {sortIcon}
                  </th>

                  <th
                    style={{
                      ...tableHeaderStyle,
                      width: "70px",
                    }}
                  />
                </tr>
              </thead>

              <tbody>
                {visibleEmployees.length > 0 ? (
                  visibleEmployees.map((employee) => (
                    <tr key={employee.id}>
                      <td
                        style={{
                          ...tableCellStyle,
                          paddingLeft: "20px",
                        }}
                      >
                        <input type="checkbox" />
                      </td>

                      <td style={tableCellStyle}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "9px",
                          }}
                        >
                          <img
                            src={employee.image}
                            alt={employee.name}
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />

                          <div>
                            <div
                              style={{
                                color: "#111827",
                                fontSize: "14px",
                                lineHeight: "18px",
                                fontWeight: 500,
                              }}
                            >
                              {employee.name}
                            </div>

                            <div
                              style={{
                                color: "#667085",
                                fontSize: "12px",
                                lineHeight: "17px",
                              }}
                            >
                              {employee.team}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={tableCellStyle}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            color:
                              employee.status === "Present"
                                ? "#00a84f"
                                : "#e1261c",
                            background:
                              employee.status === "Present"
                                ? "#d5f5e3"
                                : "#fde2e1",
                            padding: "3px 10px",
                            borderRadius: "4px",
                            fontSize: "11px",
                            fontWeight: 500,
                          }}
                        >
                          <span
                            style={{
                              width: "4px",
                              height: "4px",
                              borderRadius: "50%",
                              background:
                                employee.status === "Present"
                                  ? "#00b85a"
                                  : "#ef2116",
                            }}
                          />

                          {employee.status}
                        </span>
                      </td>

                      <td style={tableCellStyle}>
                        {employee.checkIn}
                      </td>

                      <td style={tableCellStyle}>
                        {employee.checkOut}
                      </td>

                      <td style={tableCellStyle}>
                        {employee.breakTime}
                      </td>

                      <td style={tableCellStyle}>
                        {employee.late}
                      </td>

                      <td style={tableCellStyle}>
                        <span
                          className={`badge bg-${employee.badge}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            borderRadius: "4px",
                            padding: "3px 8px",
                            fontSize: "11px",
                            fontWeight: 600,
                            color: "#fff",
                          }}
                        >
                          <i className="ti ti-clock-hour-11" />

                          {employee.hours}
                        </span>
                      </td>

                      <td
                        style={{
                          ...tableCellStyle,
                          textAlign: "center",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => openEditModal(employee)}
                          className="btn"
                          style={{
                            border: "none",
                            background: "transparent",
                            padding: "4px 6px",
                            color: "#41627d",
                            boxShadow: "none",
                          }}
                        >
                          <i
                            className="ti ti-edit"
                            style={{
                              fontSize: "16px",
                            }}
                          />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={9}
                      style={{
                        padding: "30px",
                        textAlign: "center",
                        color: "#667085",
                      }}
                    >
                      No attendance records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}

          <div
            style={{
              height: "57px",
              borderTop: "1px solid #e9edf2",
              padding: "0 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                color: "#526173",
              }}
            >
              Showing {filteredEmployees.length ? 1 : 0} -{" "}
              {Math.min(rowsPerPage, filteredEmployees.length)} of{" "}
              {filteredEmployees.length} entries
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <button
                type="button"
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#98a2b3",
                }}
              >
                <i className="ti ti-chevron-left" />
              </button>

              <button
                type="button"
                style={{
                  width: "27px",
                  height: "27px",
                  borderRadius: "50%",
                  border: "none",
                  background: "#bf8b30",
                  color: "#fff",
                  fontSize: "12px",
                }}
              >
                1
              </button>

              <button
                type="button"
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#98a2b3",
                }}
              >
                <i className="ti ti-chevron-right" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= EDIT ATTENDANCE MODAL ================= */}

      {showEditModal && (
        <>
          {/* BACKDROP */}

          <div
            onClick={closeEditModal}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,.42)",
              zIndex: 9998,
            }}
          />

          {/* MODAL */}

          <div
            className="attendance-edit-modal"
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "500px",
              maxWidth: "calc(100vw - 30px)",
              maxHeight: "calc(100vh - 30px)",
              overflowY: "auto",
              background: "#fff",
              borderRadius: "5px",
              boxShadow: "0 15px 40px rgba(0,0,0,.2)",
              zIndex: 9999,
            }}
          >
            {/* MODAL HEADER */}

            <div
              style={{
                height: "64px",
                padding: "0 16px",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h4
                style={{
                  margin: 0,
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "#253858",
                }}
              >
                Edit Attendance
              </h4>

              <button
                type="button"
                onClick={closeEditModal}
                style={{
                  width: "20px",
                  height: "20px",
                  padding: 0,
                  border: "none",
                  borderRadius: "50%",
                  background: "#747c89",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i
                  className="ti ti-x"
                  style={{
                    fontSize: "12px",
                  }}
                />
              </button>
            </div>

            {/* MODAL BODY */}

            <div
              style={{
                padding: "16px",
              }}
            >
              {/* DATE */}

              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Date</label>

                <div style={{ position: "relative" }}>
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) =>
                      handleEditChange("date", e.target.value)
                    }
                    className="form-control attendance-date-input"
                    style={{
                      ...commonInputStyle,
                      width: "100%",
                      paddingRight: "40px",
                    }}
                  />
                </div>
              </div>

              {/* CHECK IN / CHECK OUT */}

              <div
                className="modal-two-column"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "24px",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <label style={labelStyle}>Check In</label>

                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      value={editForm.checkIn}
                      onChange={(e) =>
                        handleEditChange(
                          "checkIn",
                          e.target.value
                        )
                      }
                      className="form-control"
                      style={{
                        ...commonInputStyle,
                        width: "100%",
                        padding: "0 40px 0 16px",
                      }}
                    />

                    <i
                      className="ti ti-clock"
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: "17px",
                        color: "#98a2b3",
                        pointerEvents: "none",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Check Out</label>

                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      value={editForm.checkOut}
                      onChange={(e) =>
                        handleEditChange(
                          "checkOut",
                          e.target.value
                        )
                      }
                      className="form-control"
                      style={{
                        ...commonInputStyle,
                        width: "100%",
                        padding: "0 40px 0 16px",
                      }}
                    />

                    <i
                      className="ti ti-clock"
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: "17px",
                        color: "#98a2b3",
                        pointerEvents: "none",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* BREAK / LATE */}

              <div
                className="modal-two-column"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "24px",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <label style={labelStyle}>Break</label>

                  <input
                    type="text"
                    value={editForm.breakTime}
                    onChange={(e) =>
                      handleEditChange(
                        "breakTime",
                        e.target.value
                      )
                    }
                    className="form-control"
                    style={{
                      ...commonInputStyle,
                      width: "100%",
                    }}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Late</label>

                  <input
                    type="text"
                    value={editForm.late}
                    onChange={(e) =>
                      handleEditChange("late", e.target.value)
                    }
                    className="form-control"
                    style={{
                      ...commonInputStyle,
                      width: "100%",
                    }}
                  />
                </div>
              </div>

              {/* PRODUCTION HOURS */}

              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>
                  Production Hours
                </label>

                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    value={editForm.hours}
                    onChange={(e) =>
                      handleEditChange("hours", e.target.value)
                    }
                    className="form-control"
                    style={{
                      ...commonInputStyle,
                      width: "100%",
                      padding: "0 40px 0 16px",
                    }}
                  />

                  <i
                    className="ti ti-clock"
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: "17px",
                      color: "#98a2b3",
                      pointerEvents: "none",
                    }}
                  />
                </div>
              </div>

              {/* STATUS */}

              <div>
                <label style={labelStyle}>Status</label>

                <select
                  value={editForm.status}
                  onChange={(e) =>
                    handleEditChange(
                      "status",
                      e.target.value as "Present" | "Absent"
                    )
                  }
                  className="form-select"
                  style={{
                    ...commonInputStyle,
                    width: "100%",
                  }}
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>
            </div>

            {/* MODAL FOOTER */}

            <div
              style={{
                borderTop: "1px solid #e5e7eb",
                padding: "12px",
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <button
                type="button"
                onClick={closeEditModal}
                style={{
                  height: "40px",
                  padding: "0 16px",
                  border: "none",
                  borderRadius: "5px",
                  background: "#f8f9fa",
                  color: "#172b4d",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveChanges}
                style={{
                  height: "40px",
                  padding: "0 17px",
                  border: "none",
                  borderRadius: "5px",
                  background: "#c49135",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </>
      )}

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

export default Attendance;
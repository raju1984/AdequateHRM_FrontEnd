

import React, { useEffect, useState } from "react";

import userImg from "../../assets/img/profiles/avatar-27.jpg";



import { getEmployeeDashboard } from "../../services/employeservices";



const EmployeDasboard = () => {

  const [activeLeaveTab, setActiveLeaveTab] = useState<

    "earned" | "general"

  >("earned");



  const [dashboardData, setDashboardData] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");



  // =====================================================

  // GET EMPLOYEE DASHBOARD

  // =====================================================



  useEffect(() => {

    const fetchDashboard = async () => {

      try {

        setLoading(true);

        setError("");



        const response = await getEmployeeDashboard();



        setDashboardData(

          response?.data ?? response

        );

      } catch (err: any) {

        console.error(

          "EMPLOYEE DASHBOARD API ERROR:",

          err

        );



        setError(

          err?.response?.data?.message ||

            err?.message ||

            "Failed to load dashboard."

        );

      } finally {

        setLoading(false);

      }

    };



    fetchDashboard();

  }, []);



  // API response fields (no sample/fake employee data)
  const data = dashboardData || {};
  const employee = data.employee ?? {};
  const leave = data.leaveDetails ?? {};
  const earnedLeave = leave.earnedLeave ?? {};
  const generalLeave = leave.generalLeave ?? {};
  const attendance = data.attendance ?? {};
  const attendanceSummary = data.attendanceSummary ?? {};
  const latestLeaveStatus = data.latestLeaveStatus ?? null;

  const display = (value: unknown): string =>
    value === null || value === undefined || value === "" ? "—" : String(value);
  const formatDate = (value: unknown): string => {
    if (typeof value !== "string" || !value || value.startsWith("0001-01-01")) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };
  const formatTime = (value: unknown): string => {
    if (typeof value !== "string" || !value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };
  const hours = (value: unknown): string =>
    typeof value === "number" ? value.toFixed(2) : display(value);
  const employeeName = display(employee.name);
  const employeeId = display(employee.employeeCode || employee.employeeId);
  const department = display(employee.department);
  const designation = display(employee.designation);
  const dateOfJoining = formatDate(employee.dateOfJoining);
  const uan = display(employee.uanNumber);
  const phone = display(employee.contactNumber);
  const email = display(employee.email);
  const salary = typeof employee.salary === "number" ? `₹${employee.salary.toLocaleString("en-IN")}` : "—";
  const status = display(employee.status);
  const profilePicture = employee.profilePicture || userImg;
  const reportingManagerName = "—"; // Not supplied by dashboard API

  const earnedTotal = earnedLeave.totalAllocated ?? 0;
  const earnedMonthly = earnedLeave.monthlyAccrual ?? 0;
  const earnedAvailed = earnedLeave.availed ?? 0;
  const earnedRemaining = earnedLeave.remaining ?? 0;
  const earnedCarryForward = earnedLeave.carryForward === true ? "Yes" : earnedLeave.carryForward === false ? "No" : "—";
  const generalTotal = generalLeave.totalAllocated ?? 0;
  const generalMonthly = generalLeave.monthlyAccrual ?? 0;
  const generalAvailed = generalLeave.availed ?? 0;
  const generalRemaining = generalLeave.remaining ?? 0;
  const generalCarryForward = generalLeave.carryForward === true ? "Yes" : generalLeave.carryForward === false ? "No" : "—";

  const attendanceDate = formatDate(attendance.date);
  const punchIn = formatTime(attendance.checkInTime);
  const punchOut = formatTime(attendance.checkOutTime);
  const totalHours = hours(attendance.totalHours);
  const productionHours = hours(attendance.productiveHours);
  const todayHours = hours(attendanceSummary.todayHours);
  const weekHours = hours(attendanceSummary.weekHours);
  const monthHours = hours(attendanceSummary.monthHours);
  const yearHours = hours(attendanceSummary.yearHours);
  const todayHoursTotal = "—";
  const weekHoursTotal = "—";
  const monthHoursTotal = "—";
  const yearHoursTotal = "—";
  const breakMinutes = attendance.breakMinutes ?? 0;

  // =====================================================

  // STAT CARD

  // =====================================================



  const statCard = (

    icon: string,

    iconBg: string,

    value: string,

    total: string,

    title: string,

    percentage: string,

    direction: "up" | "down"

  ) => {

    void total; void percentage; void direction;



    return (

      <div className="col-xl-3 col-md-6 mb-3">

        <div className="card h-100 border-0 shadow-sm">

          <div className="card-body">

            <div className="border-bottom pb-3 mb-3">

              <span

                style={{

                  width: "28px",

                  height: "28px",

                  background: iconBg,

                  borderRadius: "6px",

                  display: "flex",

                  alignItems: "center",

                  justifyContent: "center",

                  color: "#fff",

                  marginBottom: "15px",

                }}

              >

                <i className={icon}></i>

              </span>



              <h2

                style={{

                  fontWeight: 700,

                  color: "#16213e",

                  marginBottom: "8px",

                }}

              >

                {value}

              </h2>



              <p

                style={{

                  color: "#667085",

                  margin: 0,

                }}

              >

                {title}

              </p>

            </div>
          </div>
        </div>
      </div>
    );

  };



  // =====================================================

  // LOADING

  // =====================================================



  if (loading) {

    return (

      <div

        style={{

          padding: "40px",

          background: "#f7f8fa",

          minHeight: "100vh",

          display: "flex",

          alignItems: "center",

          justifyContent: "center",

        }}

      >

        <div

          style={{

            fontSize: "16px",

            fontWeight: 600,

            color: "#16213e",

          }}

        >

          Loading dashboard...

        </div>

      </div>

    );

  }



  // =====================================================

  // DASHBOARD

  // =====================================================



  return (

    <div

      style={{

        padding: "24px",

        background: "#f7f8fa",

        minHeight: "100vh",

      }}

    >

      {/* =========================

          PAGE HEADER

      ========================== */}



      <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">

        <div className="my-auto mb-2">

          <h2

            className="mb-1"

            style={{

              fontWeight: 700,

              color: "#16213e",

            }}

          >

            Dashboard

          </h2>



          <nav>

            <ol className="breadcrumb mb-0">

              <li className="breadcrumb-item">

                <i className="ti ti-home"></i>

              </li>



              <li className="breadcrumb-item">

                Dashboard

              </li>



              <li className="breadcrumb-item active">

                Dashboard

              </li>

            </ol>

          </nav>

        </div>

      </div>



      {/* =========================

          API ERROR

      ========================== */}



      {error && (

        <div

          className="alert alert-danger mb-4"

          style={{

            borderRadius: "6px",

          }}

        >

          {error}

        </div>

      )}



      {/* =========================

          ALERT

      ========================== */}
      {latestLeaveStatus?.status && (
        <div className="alert alert-info mb-4" role="status">
          Latest leave: <strong>{display(latestLeaveStatus.status)}</strong>
          {latestLeaveStatus.fromDate && ` (${formatDate(latestLeaveStatus.fromDate)} – ${formatDate(latestLeaveStatus.toDate)})`}
        </div>
      )}

      {/* =========================

          PROFILE + LEAVE

      ========================== */}



      <div className="row">

        {/* PROFILE CARD */}



        <div className="col-xl-4 d-flex">

          <div

            className="card flex-fill border-0 shadow-sm"

            style={{

              overflow: "hidden",

            }}

          >

            <div

              className="card-header"

              style={{

                background: "#202426",

                padding: "18px 20px",

                border: "none",

              }}

            >

              <div className="d-flex align-items-center">

                <span

                  style={{

                    width: "45px",

                    height: "45px",

                    borderRadius: "50%",

                    border: "2px solid #fff",

                    overflow: "hidden",

                    flexShrink: 0,

                    marginRight: "12px",

                  }}

                >

                  <img

                    src={profilePicture}

                    alt="Employee"

                    style={{

                      width: "100%",

                      height: "100%",

                      objectFit: "cover",

                    }}

                    onError={(e) => {

                      e.currentTarget.src = userImg;

                    }}

                  />

                </span>



                <div>

                  <h5

                    className="mb-1"

                    style={{

                      color: "#fff",

                      fontWeight: 700,

                    }}

                  >

                    {employeeName}

                  </h5>



                  <p

                    className="mb-0"

                    style={{

                      color: "#fff",

                      fontSize: "12px",

                    }}

                  >

                    {designation}

                  </p>

                </div>



                <div className="ms-auto text-end">

                  <h5

                    className="mb-1"

                    style={{

                      color: "#fff",

                      fontWeight: 700,

                    }}

                  >

                    {reportingManagerName}

                  </h5>



                  <p

                    className="mb-0"

                    style={{

                      color: "#fff",

                      fontSize: "12px",

                    }}

                  >

                    Reporting Manager

                  </p>

                </div>

              </div>

            </div>



            <div

              className="card-body"

              style={{

                padding: "22px 20px",

              }}

            >

              <div className="row">

                <div className="col-6">

                  <div className="mb-3">

                    <span

                      className="d-block mb-1"

                      style={{

                        fontSize: "13px",

                        color: "#667085",

                      }}

                    >

                      Employee ID

                    </span>



                    <p className="mb-0 text-dark">

                      {employeeId}

                    </p>

                  </div>



                  <div className="mb-3">

                    <span

                      className="d-block mb-1"

                      style={{

                        fontSize: "13px",

                        color: "#667085",

                      }}

                    >

                      Name

                    </span>



                    <p className="mb-0 text-dark">

                      {employeeName}

                    </p>

                  </div>



                  <div className="mb-3">

                    <span

                      className="d-block mb-1"

                      style={{

                        fontSize: "13px",

                        color: "#667085",

                      }}

                    >

                      Department

                    </span>



                    <p className="mb-0 text-dark">

                      {department}

                    </p>

                  </div>



                  <div className="mb-3">

                    <span

                      className="d-block mb-1"

                      style={{

                        fontSize: "13px",

                        color: "#667085",

                      }}

                    >

                      Designation

                    </span>



                    <p className="mb-0 text-dark">

                      {designation}

                    </p>

                  </div>



                  <div>

                    <span

                      className="d-block mb-1"

                      style={{

                        fontSize: "13px",

                        color: "#667085",

                      }}

                    >

                      Date of Joining

                    </span>



                    <p className="mb-0 text-dark">

                      {dateOfJoining}

                    </p>

                  </div>

                </div>



                <div className="col-6">

                  <div className="mb-3">

                    <span

                      className="d-block mb-1"

                      style={{

                        fontSize: "13px",

                        color: "#667085",

                      }}

                    >

                      UAN No.

                    </span>



                    <p className="mb-0 text-dark">

                      {uan}

                    </p>

                  </div>



                  <div className="mb-3">

                    <span

                      className="d-block mb-1"

                      style={{

                        fontSize: "13px",

                        color: "#667085",

                      }}

                    >

                      Contact Number

                    </span>



                    <p className="mb-0 text-dark">

                      {phone}

                    </p>

                  </div>



                  <div className="mb-3">

                    <span

                      className="d-block mb-1"

                      style={{

                        fontSize: "13px",

                        color: "#667085",

                      }}

                    >

                      Email

                    </span>



                    <p

                      className="mb-0 text-dark"

                      style={{

                        wordBreak: "break-word",

                      }}

                    >

                      {email}

                    </p>

                  </div>



                  <div className="mb-3">

                    <span

                      className="d-block mb-1"

                      style={{

                        fontSize: "13px",

                        color: "#667085",

                      }}

                    >

                      Salary

                    </span>



                    <p className="mb-0 text-dark">

                      {salary}

                    </p>

                  </div>



                  <div>

                    <span

                      className="d-block mb-1"

                      style={{

                        fontSize: "13px",

                        color: "#667085",

                      }}

                    >

                      Status

                    </span>



                    <p className="mb-0 text-dark">

                      {status}

                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>



        {/* =========================

            LEAVE DETAILS

        ========================== */}



        <div className="col-xl-8 d-flex">

          <div className="card flex-fill border-0 shadow-sm">

            <div

              className="card-header bg-white"

              style={{

                padding: "16px 20px",

              }}

            >

              <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">

                <h5

                  className="mb-0"

                  style={{

                    fontWeight: 700,

                    color: "#16213e",

                  }}

                >

                  Leave Details

                </h5>



                <div

                  style={{

                    display: "flex",

                    gap: "8px",

                  }}

                >

                  <button

                    type="button"

                    onClick={() =>

                      setActiveLeaveTab("earned")

                    }

                    style={{

                      padding: "10px 18px",

                      border: "none",

                      borderRadius: "5px",

                      cursor: "pointer",

                      fontWeight: 500,

                      background:

                        activeLeaveTab === "earned"

                          ? "#c49336"

                          : "transparent",

                      color:

                        activeLeaveTab === "earned"

                          ? "#fff"

                          : "#101828",

                    }}

                  >

                    Earned Leave

                  </button>



                  <button

                    type="button"

                    onClick={() =>

                      setActiveLeaveTab("general")

                    }

                    style={{

                      padding: "10px 18px",

                      border: "none",

                      borderRadius: "5px",

                      cursor: "pointer",

                      fontWeight: 500,

                      background:

                        activeLeaveTab === "general"

                          ? "#c49336"

                          : "transparent",

                      color:

                        activeLeaveTab === "general"

                          ? "#fff"

                          : "#101828",

                    }}

                  >

                    General Leave

                  </button>

                </div>

              </div>

            </div>



            <div

              className="card-body"

              style={{

                padding: "22px",

              }}

            >

              {/* EARNED LEAVE */}



              {activeLeaveTab === "earned" && (

                <div>

                  <h3

                    style={{

                      fontWeight: 700,

                      color: "#16213e",

                    }}

                  >

                    Earned Leave (EL)

                  </h3>



                  <div className="row mt-3">

                    <div className="col-sm-6">

                      <div className="mb-4">

                        <span

                          className="d-block mb-1"

                          style={{

                            color: "#667085",

                          }}

                        >

                          Total Allocated

                        </span>



                        <h4>{earnedTotal}</h4>

                      </div>

                    </div>



                    <div className="col-sm-6">

                      <div className="mb-4">

                        <span

                          className="d-block mb-1"

                          style={{

                            color: "#667085",

                          }}

                        >

                          Monthly Accrual

                        </span>



                        <h4>{earnedMonthly}</h4>

                      </div>

                    </div>



                    <div className="col-sm-6">

                      <div className="mb-4">

                        <span

                          className="d-block mb-1"

                          style={{

                            color: "#667085",

                          }}

                        >

                          Availed

                        </span>



                        <h4>{earnedAvailed}</h4>

                      </div>

                    </div>



                    <div className="col-sm-6">

                      <div className="mb-4">

                        <span

                          className="d-block mb-1"

                          style={{

                            color: "#667085",

                          }}

                        >

                          Remaining

                        </span>



                        <h4>{earnedRemaining}</h4>

                      </div>

                    </div>



                    <div className="col-sm-6">

                      <div className="mb-4">

                        <span

                          className="d-block mb-1"

                          style={{

                            color: "#667085",

                          }}

                        >

                          Carry Forward

                        </span>



                        <h4>{earnedCarryForward}</h4>

                      </div>

                    </div>

                  </div>



                  <div className="d-flex">

                    <button

                      type="button"

                      className="btn btn-dark ms-auto"

                      data-bs-toggle="modal"

                      data-bs-target="#add_leaves"

                    >

                      Apply New Leave

                    </button>

                  </div>

                </div>

              )}



              {/* GENERAL LEAVE */}



              {activeLeaveTab === "general" && (

                <div>

                  <h3

                    style={{

                      fontWeight: 700,

                      color: "#16213e",

                    }}

                  >

                    General Leave (GL)

                  </h3>



                  <div className="row mt-3">

                    <div className="col-sm-6">

                      <div className="mb-4">

                        <span

                          className="d-block mb-1"

                          style={{

                            color: "#667085",

                          }}

                        >

                          Total Allocated

                        </span>



                        <h4>{generalTotal}</h4>

                      </div>

                    </div>



                    <div className="col-sm-6">

                      <div className="mb-4">

                        <span

                          className="d-block mb-1"

                          style={{

                            color: "#667085",

                          }}

                        >

                          Monthly Accrual

                        </span>



                        <h4>{generalMonthly}</h4>

                      </div>

                    </div>



                    <div className="col-sm-6">

                      <div className="mb-4">

                        <span

                          className="d-block mb-1"

                          style={{

                            color: "#667085",

                          }}

                        >

                          Availed

                        </span>



                        <h4>{generalAvailed}</h4>

                      </div>

                    </div>



                    <div className="col-sm-6">

                      <div className="mb-4">

                        <span

                          className="d-block mb-1"

                          style={{

                            color: "#667085",

                          }}

                        >

                          Remaining

                        </span>



                        <h4>{generalRemaining}</h4>

                      </div>

                    </div>



                    <div className="col-sm-6">

                      <div className="mb-4">

                        <span

                          className="d-block mb-1"

                          style={{

                            color: "#667085",

                          }}

                        >

                          Carry Forward

                        </span>



                        <h4>{generalCarryForward}</h4>

                      </div>

                    </div>

                  </div>



                  <div className="d-flex">

                    <button

                      type="button"

                      className="btn btn-dark ms-auto"

                      data-bs-toggle="modal"

                      data-bs-target="#add_leaves"

                    >

                      Apply New Leave

                    </button>

                  </div>

                </div>

              )}

            </div>

          </div>

        </div>

      </div>



      {/* =========================

          ATTENDANCE SECTION

      ========================== */}



      <div className="row mt-4">

        {/* ATTENDANCE CARD */}



        <div className="col-xl-4 d-flex">

          <div

            className="card flex-fill"

            style={{

              border: "1px solid #c6963c",

              borderRadius: "8px",

              boxShadow: "none",

            }}

          >

            <div

              className="card-body text-center"

              style={{

                padding: "20px",

              }}

            >

              <h6

                style={{

                  color: "#667085",

                  fontWeight: 500,

                  marginBottom: "6px",

                }}

              >

                Attendance

              </h6>



              <h3

                style={{

                  fontWeight: 700,

                  color: "#0f172a",

                  marginBottom: "25px",

                  fontSize: "19px",

                }}

              >

                {punchIn}, {attendanceDate}

              </h3>



              <div

                style={{

                  width: "130px",

                  height: "130px",

                  borderRadius: "50%",

                  border: "4px solid #12c75d",

                  borderLeftColor: "#eef1f4",

                  margin: "0 auto 18px",

                  display: "flex",

                  alignItems: "center",

                  justifyContent: "center",

                }}

              >

                <div>

                  <div

                    style={{

                      fontSize: "13px",

                      color: "#667085",

                    }}

                  >

                    Total Hours

                  </div>



                  <h4

                    style={{

                      margin: 0,

                      fontWeight: 700,

                    }}

                  >

                    {totalHours}

                  </h4>

                </div>

              </div>



              <div

                style={{

                  background: "#1d2226",

                  color: "#fff",

                  display: "inline-block",

                  padding: "7px 14px",

                  borderRadius: "5px",

                  fontSize: "13px",

                  fontWeight: 600,

                  marginBottom: "16px",

                }}

              >

                Production : {productionHours} hrs

              </div>



              <div

                style={{

                  marginBottom: "24px",

                  color: "#0f172a",

                  fontWeight: 500,

                }}

              >

                <i

                  className="ti ti-fingerprint me-2"

                  style={{

                    color: "#c6963c",

                  }}

                ></i>



                {attendance.isCheckedIn ? `Punch In at ${punchIn}` : "Not checked in"}

              </div>



              <button

                type="button"

                className="btn w-100"
                  disabled
                  title="Attendance action API is not integrated"

                style={{

                  background: "#c6963c",

                  color: "#fff",

                  height: "40px",

                  borderRadius: "6px",

                  fontWeight: 600,

                  border: "none",

                }}

              >

                {punchOut

                  ? "Punch In"

                  : "Punch Out"}

              </button>

            </div>

          </div>

        </div>



        {/* RIGHT SECTION */}



        <div className="col-xl-8 d-flex">

          <div className="row flex-fill">

            {statCard(

              "ti ti-clock",

              "#c6963c",

              String(todayHours),

              String(todayHoursTotal),

              "Total Hours Today",

              "5% This Week",

              "up"

            )}



            {statCard(

              "ti ti-clock",

              "#111827",

              String(weekHours),

              String(weekHoursTotal),

              "Total Hours Week",

              "7% Last Week",

              "up"

            )}



            {statCard(

              "ti ti-calendar",

              "#0d6efd",

              String(monthHours),

              String(monthHoursTotal),

              "Total Hours Month",

              "8% Last Month",

              "down"

            )}



            {statCard(

              "ti ti-briefcase",

              "#ff3f9f",

              String(yearHours),

              String(yearHoursTotal),

              "Total Hours Year",

              "6% Last Year",

              "down"

            )}



            {/* =========================

                TIMELINE

            ========================== */}



            <div className="col-md-12">

              <div className="card border-0 shadow-sm">

                <div

                  className="card-body"

                  style={{

                    padding: "22px",

                  }}

                >

                  <div className="row mb-4">

                    <div className="col-xl-3 col-md-6 mb-3 mb-xl-0">

                      <p

                        style={{

                          color: "#667085",

                          marginBottom: "6px",

                        }}

                      >

                        Today

                      </p>



                      <h3

                        style={{

                          fontWeight: 500,

                          color: "#16213e",

                        }}

                      >

                        {attendanceDate}

                      </h3>

                    </div>



                    <div className="col-xl-3 col-md-6 mb-3 mb-xl-0">

                      <p

                        style={{

                          color: "#667085",

                          marginBottom: "6px",

                        }}

                      >

                        <span

                          style={{

                            color: "#e5e7eb",

                          }}

                        >

                          ●

                        </span>{" "}

                        Total Working hours

                      </p>



                      <h3

                        style={{

                          fontWeight: 500,

                          color: "#16213e",

                        }}

                      >

                        {todayHours}h

                      </h3>

                    </div>



                    <div className="col-xl-3 col-md-6 mb-3 mb-xl-0">

                      <p

                        style={{

                          color: "#667085",

                          marginBottom: "6px",

                        }}

                      >

                        <span

                          style={{

                            color: "#12c75d",

                          }}

                        >

                          ●

                        </span>{" "}

                        Productive Hours

                      </p>



                      <h3

                        style={{

                          fontWeight: 500,

                          color: "#16213e",

                        }}

                      >

                        {productionHours} hrs

                      </h3>

                    </div>



                    <div className="col-xl-3 col-md-6">

                      <p

                        style={{

                          color: "#667085",

                          marginBottom: "6px",

                        }}

                      >

                        <span

                          style={{

                            color: "#f5b800",

                          }}

                        >

                          ●

                        </span>{" "}

                        Break hours

                      </p>



                      <h3

                        style={{

                          fontWeight: 500,

                          color: "#16213e",

                        }}

                      >

                        {breakMinutes} min

                      </h3>

                    </div>

                  </div>



                  {/* PROGRESS BAR */}



                  <div

                    style={{

                      display: "flex",

                      alignItems: "center",

                      gap: "8px",

                      marginBottom: "14px",

                      paddingLeft: "80px",

                      paddingRight: "60px",

                    }}

                  >

                    <div

                      style={{

                        height: "24px",

                        width: "18%",

                        background: "#12c75d",

                        borderRadius: "5px",

                      }}

                    ></div>



                    <div

                      style={{

                        height: "24px",

                        width: "5%",

                        background: "#f5b800",

                        borderRadius: "5px",

                      }}

                    ></div>



                    <div

                      style={{

                        height: "24px",

                        width: "20%",

                        background: "#12c75d",

                        borderRadius: "5px",

                      }}

                    ></div>



                    <div

                      style={{

                        height: "24px",

                        width: "12%",

                        background: "#f5b800",

                        borderRadius: "5px",

                      }}

                    ></div>



                    <div

                      style={{

                        height: "24px",

                        width: "16%",

                        background: "#12c75d",

                        borderRadius: "5px",

                      }}

                    ></div>



                    <div

                      style={{

                        height: "24px",

                        width: "5%",

                        background: "#f5b800",

                        borderRadius: "5px",

                      }}

                    ></div>



                    <div

                      style={{

                        height: "24px",

                        width: "3%",

                        background: "#3b82f6",

                        borderRadius: "5px",

                      }}

                    ></div>



                    <div

                      style={{

                        height: "24px",

                        width: "2%",

                        background: "#3b82f6",

                        borderRadius: "5px",

                      }}

                    ></div>

                  </div>



                  {/* TIME */}



                  <div

                    style={{

                      display: "flex",

                      justifyContent: "space-between",

                      fontSize: "11px",

                      color: "#667085",

                    }}

                  >

                    <span>06:00</span>

                    <span>07:00</span>

                    <span>08:00</span>

                    <span>09:00</span>

                    <span>10:00</span>

                    <span>11:00</span>

                    <span>12:00</span>

                    <span>01:00</span>

                    <span>02:00</span>

                    <span>03:00</span>

                    <span>04:00</span>

                    <span>05:00</span>

                    <span>06:00</span>

                    <span>07:00</span>

                    <span>08:00</span>

                    <span>09:00</span>

                    <span>10:00</span>

                    <span>11:00</span>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>

  );
};

export default EmployeDasboard;

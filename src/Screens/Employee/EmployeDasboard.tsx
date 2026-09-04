import React, { useState } from "react";
import userImg from "../../assets/img/profiles/avatar-27.jpg";

const Dashboard = () => {
  const [activeLeaveTab, setActiveLeaveTab] = useState<
    "earned" | "general"
  >("earned");

  const statCard = (
    icon: string,
    iconBg: string,
    value: string,
    total: string,
    title: string,
    percentage: string,
    direction: "up" | "down"
  ) => {
    const isUp = direction === "up";

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
                {value} /{" "}
                <span
                  style={{
                    fontSize: "22px",
                    color: "#667085",
                    fontWeight: 600,
                  }}
                >
                  {total}
                </span>
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

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#667085",
                fontSize: "13px",
              }}
            >
              <span
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background: isUp ? "#12c75d" : "#e11d20",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                }}
              >
                {isUp ? "↑" : "↓"}
              </span>

              {percentage}
            </div>
          </div>
        </div>
      </div>
    );
  };

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
          ALERT
      ========================== */}

      <div
        className="alert alert-dismissible fade show mb-4"
        style={{
          background: "#eef7fb",
          color: "#2f6f89",
          border: "none",
          borderRadius: "6px",
          padding: "14px 50px 14px 16px",
          position: "relative",
        }}
      >
        Your Leave Request on “24th April 2024” has been
        Approved!!!

        <button
          type="button"
          data-bs-dismiss="alert"
          aria-label="Close"
          style={{
            position: "absolute",
            right: "15px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "transparent",
            border: "none",
            padding: 0,
            cursor: "pointer",
            color: "#667085",
            fontSize: "26px",
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>

      {/* =========================
          PROFILE + LEAVE SECTION
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
                    src={userImg}
                    alt="Employee"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
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
                    Anjali Verma
                  </h5>

                  <p
                    className="mb-0"
                    style={{
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  >
                    HR Manager
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
                    Asher Miller
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
                      EMP001
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
                      Anjali Verma
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
                      HR
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
                      HR Manager
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
                      2020-08-01
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
                      100234567890
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
                      +91 9123456780
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
                      anjali.verma@company.com
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
                      90,000
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
                      Active
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

                        <h4>20</h4>
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

                        <h4>1.5</h4>
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

                        <h4>8</h4>
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

                        <h4>12</h4>
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

                        <h4>Yes</h4>
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

                        <h4>10</h4>
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

                        <h4>1</h4>
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

                        <h4>2</h4>
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

                        <h4>08</h4>
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

                        <h4>
                          No (Lapses at Year End)
                        </h4>
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
                08:35 AM, 11 Mar 2025
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
                    5:45:32
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
                Production : 3.45 hrs
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

                Punch In at 10.00 AM
              </div>

              <button
                type="button"
                className="btn w-100"
                style={{
                  background: "#c6963c",
                  color: "#fff",
                  height: "40px",
                  borderRadius: "6px",
                  fontWeight: 600,
                  border: "none",
                }}
              >
                Punch Out
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
              "8.36",
              "9",
              "Total Hours Today",
              "5% This Week",
              "up"
            )}

            {statCard(
              "ti ti-clock",
              "#111827",
              "10",
              "40",
              "Total Hours Week",
              "7% Last Week",
              "up"
            )}

            {statCard(
              "ti ti-calendar",
              "#0d6efd",
              "75",
              "98",
              "Total Hours Month",
              "8% Last Month",
              "down"
            )}

            {statCard(
              "ti ti-briefcase",
              "#ff3f9f",
              "1500",
              "3285",
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
                        10 Oct, 2025
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
                        12h 36m
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
                        08h 36m
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
                        22m 15s
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

      {/* =========================
          APPLY LEAVE MODAL
      ========================== */}

      <div
        className="modal fade"
        id="add_leaves"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div
            className="modal-content"
            style={{
              borderRadius: "14px",
              border: "none",
            }}
          >
            {/* HEADER */}

            <div
              className="modal-header"
              style={{
                borderBottom: "1px solid #e5e7eb",
                padding: "20px 24px",
              }}
            >
              <h4
                style={{
                  margin: 0,
                  fontWeight: 700,
                  color: "#111827",
                }}
              >
                Add Leave
              </h4>

              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            {/* BODY */}

            <div
              className="modal-body"
              style={{
                padding: "24px",
              }}
            >
              <div className="row">
                {/* LEAVE REASON */}

                <div className="col-md-12 mb-3">
                  <label
                    className="form-label"
                    style={{
                      fontWeight: 600,
                    }}
                  >
                    Leave Reason
                  </label>

                  <select
                    className="form-select"
                    defaultValue=""
                    style={{
                      height: "48px",
                      borderRadius: "8px",
                    }}
                  >
                    <option value="" disabled>
                      Select Leave Reason
                    </option>

                    <option>Annual Leave</option>
                    <option>Medical Leave</option>
                    <option>Emergency Leave</option>
                    <option>Compassionate Leave</option>
                    <option>Unpaid Leave</option>
                    <option>Paternity Leave</option>
                    <option>Maternity Leave</option>
                  </select>
                </div>

                {/* FROM */}

                <div className="col-md-6 mb-3">
                  <label
                    className="form-label"
                    style={{
                      fontWeight: 600,
                    }}
                  >
                    From
                  </label>

                  <input
                    type="date"
                    className="form-control"
                    style={{
                      height: "48px",
                      borderRadius: "8px",
                    }}
                  />
                </div>

                {/* TO */}

                <div className="col-md-6 mb-3">
                  <label
                    className="form-label"
                    style={{
                      fontWeight: 600,
                    }}
                  >
                    To
                  </label>

                  <input
                    type="date"
                    className="form-control"
                    style={{
                      height: "48px",
                      borderRadius: "8px",
                    }}
                  />
                </div>

                {/* LEAVE TYPE */}

                <div className="col-md-6 mb-3">
                  <label
                    className="form-label"
                    style={{
                      fontWeight: 600,
                    }}
                  >
                    Leave Type
                  </label>

                  <select
                    className="form-select"
                    defaultValue=""
                    style={{
                      height: "48px",
                      borderRadius: "8px",
                    }}
                  >
                    <option value="" disabled>
                      Select Leave Type
                    </option>

                    <option>Full Day</option>
                    <option>First Half</option>
                    <option>Second Half</option>
                  </select>
                </div>

                {/* NO OF DAYS */}

                <div className="col-md-6 mb-3">
                  <label
                    className="form-label"
                    style={{
                      fontWeight: 600,
                    }}
                  >
                    No of Days
                  </label>

                  <input
                    type="number"
                    placeholder="Enter Number of Days"
                    className="form-control"
                    style={{
                      height: "48px",
                      borderRadius: "8px",
                    }}
                  />
                </div>

                {/* UPLOAD FILE */}

                <div className="col-md-12 mb-3">
                  <label
                    className="form-label"
                    style={{
                      fontWeight: 600,
                    }}
                  >
                    Upload File
                  </label>

                  <input
                    type="file"
                    className="form-control"
                    style={{
                      height: "48px",
                      borderRadius: "8px",
                      paddingTop: "10px",
                    }}
                  />
                </div>

                {/* REASON */}

                <div className="col-md-12 mb-3">
                  <label
                    className="form-label"
                    style={{
                      fontWeight: 600,
                    }}
                  >
                    Reason
                  </label>

                  <textarea
                    placeholder="Write Reason..."
                    className="form-control"
                    rows={4}
                    style={{
                      borderRadius: "8px",
                      resize: "none",
                    }}
                  ></textarea>
                </div>
              </div>
            </div>

            {/* FOOTER */}

            <div
              className="modal-footer"
              style={{
                borderTop: "1px solid #e5e7eb",
                padding: "20px 24px",
              }}
            >
              <button
                type="button"
                className="btn btn-light"
                data-bs-dismiss="modal"
                style={{
                  height: "44px",
                  padding: "0 22px",
                  borderRadius: "8px",
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn"
                data-bs-dismiss="modal"
                style={{
                  background: "#c6963c",
                  color: "#fff",
                  height: "44px",
                  padding: "0 22px",
                  borderRadius: "8px",
                  fontWeight: 600,
                  border: "none",
                }}
              >
                Add Leave
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
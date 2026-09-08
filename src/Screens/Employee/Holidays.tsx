import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import { getHolidays } from "../../services/employeservices";

type HolidayStatus = "ACTIVE" | "INACTIVE";

type HolidayType = "HR" | "COMPLIANCE";

type Holiday = {
  id: string;
  title: string;
  date: string;
  description: string;
  status: HolidayStatus;
  type: HolidayType;
};

type HolidayApiItem = {
  id?: string;
  holidayId?: string;
  title?: string;
  holidayDate?: string;
  date?: string;
  description?: string;
  isActive?: boolean;
  status?: string;
  holidayType?: string | number;
};

type HolidayApiResponse = {
  statusCode?: number;
  message?: string;
  data?: {
    year?: number;
    holidays?: HolidayApiItem[];
    groupedHolidays?: {
      HrHoliday?: HolidayApiItem[];
      ComplianceHoliday?: HolidayApiItem[];
    };
    pagination?: {
      pageNumber?: number;
      pageSize?: number;
      totalRecords?: number;
      totalPages?: number;
    };
  };
  isSuccess?: boolean;
};

/**
 * Get actual access token from localStorage.
 *
 * Supports:
 * 1. localStorage token = plain JWT string
 * 2. localStorage token = JSON object containing accessToken
 */
const getAccessToken = (): string => {
  const storedToken = localStorage.getItem("token");

  if (!storedToken) {
    return "";
  }

  // Normal JWT string
  if (
    storedToken.startsWith("eyJ") ||
    (!storedToken.startsWith("{") &&
      !storedToken.startsWith('"'))
  ) {
    return storedToken;
  }

  // Token accidentally stored as JSON
  try {
    const parsedToken = JSON.parse(storedToken);

    if (typeof parsedToken === "string") {
      return parsedToken;
    }

    if (
      parsedToken?.accessToken &&
      typeof parsedToken.accessToken === "string"
    ) {
      return parsedToken.accessToken;
    }

    if (
      parsedToken?.tokens?.accessToken &&
      typeof parsedToken.tokens.accessToken === "string"
    ) {
      return parsedToken.tokens.accessToken;
    }

    if (
      parsedToken?.data?.accessToken &&
      typeof parsedToken.data.accessToken === "string"
    ) {
      return parsedToken.data.accessToken;
    }
  } catch (error) {
    console.error("Unable to parse stored token.");
  }

  return "";
};

const Holidays: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const [entries, setEntries] = useState<number>(10);

  const [search, setSearch] = useState<string>("");

  const [activeTab, setActiveTab] =
    useState<HolidayType>("HR");

  const [holidays, setHolidays] = useState<Holiday[]>([]);

  const [loading, setLoading] = useState<boolean>(false);

  const [error, setError] = useState<string>("");

  const [currentPage, setCurrentPage] =
    useState<number>(1);

  const [totalRecords, setTotalRecords] =
    useState<number>(0);

  const [totalPages, setTotalPages] =
    useState<number>(1);

  /**
   * API:
   * HR = 0
   * Compliance = 1
   */
  const holidayType =
    activeTab === "HR" ? 0 : 1;

  /**
   * Format API date.
   */
  const formatDate = (
    dateValue?: string
  ): string => {
    if (!dateValue) {
      return "-";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /**
   * Convert API holiday type into UI type.
   */
  const mapHolidayType = (
    value?: string | number
  ): HolidayType => {
    if (
      value === 1 ||
      value === "1" ||
      value === "ComplianceHoliday" ||
      value === "Compliance" ||
      value === "COMPLIANCE"
    ) {
      return "COMPLIANCE";
    }

    return "HR";
  };

  /**
   * Convert API holiday object into UI object.
   */
  const mapHoliday = (
    item: HolidayApiItem
  ): Holiday => {
    const isActive =
      item.isActive === true ||
      item.status?.toLowerCase() ===
        "active";

    return {
      id:
        item.id ??
        item.holidayId ??
        "",

      title:
        item.title ??
        "-",

      date: formatDate(
        item.holidayDate ??
          item.date
      ),

      description:
        item.description ??
        "-",

      status: isActive
        ? "ACTIVE"
        : "INACTIVE",

      type: mapHolidayType(
        item.holidayType
      ),
    };
  };

  /**
   * Fetch holidays from API.
   */
  const fetchHolidays = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const token = getAccessToken();

        console.log(
          "TOKEN EXISTS:",
          !!token
        );

        if (!token) {
          setError(
            "Authentication token not found. Please login again."
          );

          setHolidays([]);
          setTotalRecords(0);
          setTotalPages(1);

          return;
        }

        const requestParams = {
          Year: currentYear,

          HolidayType:
            holidayType,

          Search:
            search.trim(),

          SortBy:
            "holidayDate",

          PageNumber:
            currentPage,

          PageSize:
            entries,
        };

        console.log(
          "HOLIDAY REQUEST PARAMS:",
          requestParams
        );

        const response =
          await getHolidays(
            token,
            requestParams
          );

        console.log(
          "HOLIDAY API RESPONSE:",
          response
        );

        const apiResponse =
          response?.data as HolidayApiResponse;

        /**
         * Actual API response:
         *
         * data: {
         *   holidays: [...]
         *   pagination: {...}
         * }
         */
        const apiData =
          apiResponse?.data;

        let list: HolidayApiItem[] =
          [];

        if (
          Array.isArray(
            apiData?.holidays
          )
        ) {
          list =
            apiData.holidays;
        } else if (
          Array.isArray(
            apiData?.groupedHolidays
              ?.HrHoliday
          ) &&
          holidayType === 0
        ) {
          list =
            apiData.groupedHolidays
              ?.HrHoliday ?? [];
        } else if (
          Array.isArray(
            apiData?.groupedHolidays
              ?.ComplianceHoliday
          ) &&
          holidayType === 1
        ) {
          list =
            apiData.groupedHolidays
              ?.ComplianceHoliday ?? [];
        }

        /**
         * Extra safety:
         * API may return both holiday types.
         * Filter according to selected tab.
         */
        const filteredList =
          list.filter((item) => {
            return (
              mapHolidayType(
                item.holidayType
              ) ===
              (holidayType === 0
                ? "HR"
                : "COMPLIANCE")
            );
          });

        const mappedData =
          filteredList.map(
            mapHoliday
          );

        setHolidays(mappedData);

        /**
         * Pagination comes from:
         *
         * data.pagination
         */
        const pagination =
          apiData?.pagination;

        const total =
          Number(
            pagination?.totalRecords
          ) || mappedData.length;

        const pages =
          Number(
            pagination?.totalPages
          ) ||
          Math.max(
            1,
            Math.ceil(
              total / entries
            )
          );

        setTotalRecords(total);
        setTotalPages(pages);

        console.log(
          "HOLIDAY LIST:",
          mappedData
        );

        console.log(
          "TOTAL RECORDS:",
          total
        );

        console.log(
          "TOTAL PAGES:",
          pages
        );
      } catch (err: any) {
        console.error(
          "Get Holidays Error:",
          err
        );

        console.error(
          "HTTP STATUS:",
          err?.response?.status
        );

        console.error(
          "API ERROR:",
          err?.response?.data
        );

        if (
          err?.response?.status ===
          401
        ) {
          setError(
            "Session expired or unauthorized. Please login again."
          );
        } else {
          setError(
            err?.response?.data
              ?.message ||
              err?.message ||
              "Failed to load holidays."
          );
        }

        setHolidays([]);
        setTotalRecords(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [
      currentYear,
      holidayType,
      search,
      currentPage,
      entries,
    ]
  );

  /**
   * Load holidays.
   */
  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  /**
   * Change HR / Compliance tab.
   */
  const handleTabChange = (
    tab: HolidayType
  ) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearch("");
    setError("");
  };

  /**
   * Search.
   */
  const handleSearch = (
    value: string
  ) => {
    setSearch(value);
    setCurrentPage(1);
  };

  /**
   * Rows per page.
   */
  const handleEntriesChange = (
    value: number
  ) => {
    setEntries(value);
    setCurrentPage(1);
  };

  /**
   * Previous page.
   */
  const handlePrevious = () => {
    if (
      currentPage > 1 &&
      !loading
    ) {
      setCurrentPage(
        (previous) =>
          previous - 1
      );
    }
  };

  /**
   * Next page.
   */
  const handleNext = () => {
    if (
      currentPage <
        totalPages &&
      !loading
    ) {
      setCurrentPage(
        (previous) =>
          previous + 1
      );
    }
  };

  /**
   * Status badge.
   */
  const getStatusBadge = (
    status: HolidayStatus
  ) => {
    const active =
      status === "ACTIVE";

    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: active
            ? "#00c875"
            : "#dc3545",
          color: "#fff",
          borderRadius: "4px",
          padding: "4px 13px",
          fontSize: "12px",
          fontWeight: 600,
          minWidth: "68px",
        }}
      >
        <span
          style={{
            width: "5px",
            height: "5px",
            background: "#fff",
            borderRadius: "50%",
            marginRight: "6px",
          }}
        />

        {active
          ? "Active"
          : "Inactive"}
      </span>
    );
  };

  const visibleData =
    useMemo(
      () => holidays,
      [holidays]
    );

  /**
   * Pagination text.
   */
  const startEntry =
    totalRecords === 0
      ? 0
      : (currentPage - 1) *
          entries +
        1;

  const endEntry =
    totalRecords === 0
      ? 0
      : Math.min(
          currentPage * entries,
          totalRecords
        );

  return (
    <div
      className="container-fluid"
      style={{
        paddingTop: "30px",
        paddingLeft: "24px",
        paddingRight: "24px",
        background: "#f8f9fa",
        minHeight: "100vh",
      }}
    >
      {/* PAGE HEADER */}
      <div
        className="mb-4"
      >
        <h2
          style={{
            fontWeight: 700,
            color: "#172554",
            marginBottom: "6px",
          }}
        >
          Holidays
        </h2>

        <div
          className="d-flex align-items-center"
          style={{
            fontSize: "13px",
            color: "#64748b",
          }}
        >
          <Link
            to="/Employee/EmployeDashboard"
            className="text-decoration-none"
            style={{
              color: "#64748b",
            }}
          >
            <i className="ti ti-home" />
          </Link>

          <span className="mx-2">
            /
          </span>

          <span>
            Holidays
          </span>
        </div>
      </div>

      {/* TABS */}
      <div
        className="mb-3"
      >
        <button
          type="button"
          onClick={() =>
            handleTabChange(
              "HR"
            )
          }
          className="btn me-2"
          style={{
            background:
              activeTab === "HR"
                ? "#C89435"
                : "transparent",

            color:
              activeTab === "HR"
                ? "#fff"
                : "#64748b",

            border:
              activeTab === "HR"
                ? "1px solid #C89435"
                : "1px solid transparent",

            borderRadius:
              "7px",

            padding:
              "9px 17px",

            fontWeight: 500,

            boxShadow:
              "none",
          }}
        >
          HR Holiday
        </button>

        <button
          type="button"
          onClick={() =>
            handleTabChange(
              "COMPLIANCE"
            )
          }
          className="btn"
          style={{
            background:
              activeTab ===
              "COMPLIANCE"
                ? "#C89435"
                : "transparent",

            color:
              activeTab ===
              "COMPLIANCE"
                ? "#fff"
                : "#64748b",

            border:
              activeTab ===
              "COMPLIANCE"
                ? "1px solid #C89435"
                : "1px solid transparent",

            borderRadius:
              "7px",

            padding:
              "9px 17px",

            fontWeight: 500,

            boxShadow:
              "none",
          }}
        >
          Compliance Holiday
        </button>
      </div>

      {/* MAIN CARD */}
      <div
        className="card"
        style={{
          borderRadius:
            "6px",

          border:
            "1px solid #e1e5ea",

          boxShadow:
            "0 1px 3px rgba(0,0,0,0.04)",

          overflow:
            "hidden",
        }}
      >
        {/* CARD HEADER */}
        <div
          className="card-header"
          style={{
            background:
              "#fff",

            padding:
              "17px 20px",

            borderBottom:
              "1px solid #e5e7eb",
          }}
        >
          <h5
            style={{
              margin: 0,
              fontWeight: 600,
              color: "#172554",
              fontSize:
                "16px",
            }}
          >
            {activeTab === "HR"
              ? "HR / Gazetted Holidays"
              : "Compliance Holidays"}
          </h5>
        </div>

        {/* CARD BODY */}
        <div
          className="card-body"
          style={{
            padding:
              "0",
          }}
        >
          {/* FILTER BAR */}
          <div
            className="d-flex justify-content-between align-items-center"
            style={{
              padding:
                "15px 16px",

              minHeight:
                "60px",

              background:
                "#fff",
            }}
          >
            {/* LEFT */}
            <div
              className="d-flex align-items-center"
              style={{
                gap: "9px",
              }}
            >
              <span
                style={{
                  fontSize:
                    "13px",
                  color:
                    "#334155",
                }}
              >
                Row Per Page
              </span>

              <select
                value={entries}
                onChange={(e) =>
                  handleEntriesChange(
                    Number(
                      e.target
                        .value
                    )
                  )
                }
                className="form-select"
                style={{
                  width:
                    "49px",
                  height:
                    "31px",
                  padding:
                    "3px 6px",
                  fontSize:
                    "13px",
                  borderColor:
                    "#d9dee5",
                  color:
                    "#334155",
                  borderRadius:
                    "6px",
                }}
              >
                <option
                  value={10}
                >
                  10
                </option>

                <option
                  value={20}
                >
                  20
                </option>

                <option
                  value={30}
                >
                  30
                </option>

                <option
                  value={50}
                >
                  50
                </option>
              </select>

              <span
                style={{
                  fontSize:
                    "13px",
                  color:
                    "#334155",
                }}
              >
                Entries
              </span>
            </div>

            {/* SEARCH */}
            <div>
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) =>
                  handleSearch(
                    e.target
                      .value
                  )
                }
                className="form-control"
                style={{
                  width:
                    "160px",
                  height:
                    "31px",
                  fontSize:
                    "13px",
                  borderColor:
                    "#d9dee5",
                  borderRadius:
                    "6px",
                }}
              />
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div
              className="alert alert-danger d-flex justify-content-between align-items-center mb-0 mx-3"
              role="alert"
            >
              <span>
                {error}
              </span>

              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={() =>
                  setError("")
                }
              >
                ×
              </button>
            </div>
          )}

          {/* TABLE */}
          <div
            className="table-responsive"
          >
            <table
              className="table align-middle mb-0"
              style={{
                borderCollapse:
                  "collapse",
                width:
                  "100%",
              }}
            >
              <thead
                style={{
                  background:
                    "#e9ecf1",
                }}
              >
                <tr>
                  {/* S NO */}
                  <th
                    style={{
                      width:
                        "76px",
                      padding:
                        "11px 20px",
                      color:
                        "#0f172a",
                      fontSize:
                        "13px",
                      fontWeight:
                        600,
                      whiteSpace:
                        "nowrap",
                    }}
                  >
                    S No.
                    <span
                      style={{
                        color:
                          "#cbd1d9",
                        marginLeft:
                          "6px",
                        fontSize:
                          "11px",
                      }}
                    >
                      ↕
                    </span>
                  </th>

                  {/* TITLE */}
                  <th
                    style={{
                      width:
                        "210px",
                      padding:
                        "11px 20px",
                      color:
                        "#0f172a",
                      fontSize:
                        "13px",
                      fontWeight:
                        600,
                    }}
                  >
                    Title

                    <span
                      style={{
                        color:
                          "#cbd1d9",
                        marginLeft:
                          "6px",
                        fontSize:
                          "11px",
                      }}
                    >
                      ↕
                    </span>
                  </th>

                  {/* DATE */}
                  <th
                    style={{
                      width:
                        "125px",
                      padding:
                        "11px 20px",
                      color:
                        "#0f172a",
                      fontSize:
                        "13px",
                      fontWeight:
                        600,
                    }}
                  >
                    Date

                    <span
                      style={{
                        color:
                          "#cbd1d9",
                        marginLeft:
                          "6px",
                        fontSize:
                          "11px",
                      }}
                    >
                      ↕
                    </span>
                  </th>

                  {/* DESCRIPTION */}
                  <th
                    style={{
                      padding:
                        "11px 20px",
                      color:
                        "#0f172a",
                      fontSize:
                        "13px",
                      fontWeight:
                        600,
                    }}
                  >
                    Description

                    <span
                      style={{
                        color:
                          "#cbd1d9",
                        marginLeft:
                          "6px",
                        fontSize:
                          "11px",
                      }}
                    >
                      ↕
                    </span>
                  </th>

                  {/* STATUS */}
                  <th
                    style={{
                      width:
                        "110px",
                      padding:
                        "11px 20px",
                      color:
                        "#0f172a",
                      fontSize:
                        "13px",
                      fontWeight:
                        600,
                    }}
                  >
                    Status

                    <span
                      style={{
                        color:
                          "#cbd1d9",
                        marginLeft:
                          "6px",
                        fontSize:
                          "11px",
                      }}
                    >
                      ↕
                    </span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {/* LOADING */}
                {loading ? (
                  <tr>
                    <td
                      colSpan={
                        5
                      }
                      className="text-center"
                      style={{
                        padding:
                          "50px",
                      }}
                    >
                      <div
                        className="spinner-border"
                        role="status"
                        style={{
                          width:
                            "28px",
                          height:
                            "28px",
                        }}
                      >
                        <span className="visually-hidden">
                          Loading...
                        </span>
                      </div>

                      <div
                        style={{
                          marginTop:
                            "10px",
                          color:
                            "#64748b",
                          fontSize:
                            "13px",
                        }}
                      >
                        Loading
                        holidays...
                      </div>
                    </td>
                  </tr>
                ) : visibleData.length >
                  0 ? (
                  visibleData.map(
                    (
                      item,
                      index
                    ) => (
                      <tr
                        key={
                          item.id ||
                          `${item.title}-${index}`
                        }
                        style={{
                          borderBottom:
                            "1px solid #e5e7eb",
                        }}
                      >
                        {/* S NO */}
                        <td
                          style={{
                            padding:
                              "11px 20px",
                            color:
                              "#526174",
                            fontSize:
                              "13px",
                          }}
                        >
                          {startEntry +
                            index}
                        </td>

                        {/* TITLE */}
                        <td
                          style={{
                            padding:
                              "11px 20px",
                            color:
                              "#0f172a",
                            fontSize:
                              "13px",
                            fontWeight:
                              500,
                          }}
                        >
                          {item.title}
                        </td>

                        {/* DATE */}
                        <td
                          style={{
                            padding:
                              "11px 20px",
                            color:
                              "#64748b",
                            fontSize:
                              "13px",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {item.date}
                        </td>

                        {/* DESCRIPTION */}
                        <td
                          style={{
                            padding:
                              "11px 20px",
                            color:
                              "#64748b",
                            fontSize:
                              "13px",
                          }}
                        >
                          {item.description}
                        </td>

                        {/* STATUS */}
                        <td
                          style={{
                            padding:
                              "11px 20px",
                          }}
                        >
                          {getStatusBadge(
                            item.status
                          )}
                        </td>
                      </tr>
                    )
                  )
                ) : (
                  /* EMPTY */
                  <tr>
                    <td
                      colSpan={
                        5
                      }
                      className="text-center"
                      style={{
                        padding:
                          "50px",
                        color:
                          "#64748b",
                        fontSize:
                          "13px",
                      }}
                    >
                      No Holidays
                      Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div
            className="d-flex justify-content-between align-items-center"
            style={{
              padding:
                "13px 16px",

              borderTop:
                "1px solid #e5e7eb",

              background:
                "#fff",

              fontSize:
                "13px",
            }}
          >
            {/* SHOWING */}
            <div
              style={{
                color:
                  "#526174",
              }}
            >
              Showing{" "}
              <strong
                style={{
                  color:
                    "#334155",
                }}
              >
                {startEntry}
              </strong>{" "}
              -{" "}
              <strong
                style={{
                  color:
                    "#334155",
                }}
              >
                {endEntry}
              </strong>{" "}
              of{" "}
              <strong
                style={{
                  color:
                    "#334155",
                }}
              >
                {totalRecords}
              </strong>{" "}
              entries
            </div>

            {/* PAGINATION BUTTONS */}
            <div
              className="d-flex align-items-center"
              style={{
                gap:
                  "6px",
              }}
            >
              {/* PREVIOUS */}
              <button
                type="button"
                className="btn btn-sm"
                disabled={
                  currentPage <=
                    1 ||
                  loading
                }
                onClick={
                  handlePrevious
                }
                style={{
                  width:
                    "32px",
                  height:
                    "32px",
                  border:
                    "none",
                  background:
                    "transparent",
                  color:
                    currentPage <=
                    1
                      ? "#cbd1d9"
                      : "#64748b",
                  fontSize:
                    "18px",
                  padding:
                    "0",
                }}
              >
                ‹
              </button>

              {/* CURRENT PAGE */}
              <button
                type="button"
                className="btn btn-sm"
                style={{
                  width:
                    "30px",
                  height:
                    "30px",
                  borderRadius:
                    "50%",
                  background:
                    "#C89435",
                  color:
                    "#fff",
                  border:
                    "none",
                  padding:
                    "0",
                  fontSize:
                    "13px",
                }}
              >
                {currentPage}
              </button>

              {/* NEXT */}
              <button
                type="button"
                className="btn btn-sm"
                disabled={
                  currentPage >=
                    totalPages ||
                  loading
                }
                onClick={
                  handleNext
                }
                style={{
                  width:
                    "32px",
                  height:
                    "32px",
                  border:
                    "none",
                  background:
                    "transparent",
                  color:
                    currentPage >=
                    totalPages
                      ? "#cbd1d9"
                      : "#64748b",
                  fontSize:
                    "18px",
                  padding:
                    "0",
                }}
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Holidays;
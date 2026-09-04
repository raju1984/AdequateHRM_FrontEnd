import React, { useEffect ,useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getHolidays } from "../../services/employeservices";

type HolidayStatus = "ACTIVE" | "INACTIVE";

type Holiday = {
  id: string;
  title: string;
  date: string;
  description: string;
  status: HolidayStatus;
  statusCode: number;
  type: "HR" | "COMPLIANCE";
};

const initialHolidays: Holiday[] = [
  {
    id: "1",
    title: "Republic Day",
    date: "26 Jan 2025",
    description:
      "National holiday to honor the Constitution of India",
    status: "ACTIVE",
    statusCode: 1,
    type: "HR",
  },
  {
    id: "2",
    title: "Mahavir Jayanti",
    date: "10 Apr 2025",
    description:
      "Birth anniversary of Lord Mahavir",
    status: "ACTIVE",
    statusCode: 1,
    type: "HR",
  },
  {
    id: "3",
    title: "Maha Shivratri",
    date: "26 Feb 2025",
    description:
      "Hindu festival dedicated to Lord Shiva",
    status: "ACTIVE",
    statusCode: 1,
    type: "HR",
  },
  {
    id: "4",
    title: "Janmashtami",
    date: "16 Aug 2025",
    description:
      "Celebrates the birth of Lord Krishna",
    status: "ACTIVE",
    statusCode: 1,
    type: "HR",
  },
 
];

const Holidays: React.FC = () => {
  const [entries, setEntries] = useState(10);
  const [search, setSearch] = useState("");

const [selected, setSelected] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const [activeTab, setActiveTab] =
    useState<"HR" | "COMPLIANCE">("HR");

  const [holidays, setHolidays] = useState<Holiday[]>([]);

  const [editingHoliday, setEditingHoliday] =
    useState<Holiday | null>(null);

  const [deletingHoliday, setDeletingHoliday] =
    useState<Holiday | null>(null);

  const filteredData = useMemo(() => {
    return holidays
      .filter((item) => item.type === activeTab)
      .filter((item) => {
        const value = search.toLowerCase();

        return (
          item.title.toLowerCase().includes(value) ||
          item.date.toLowerCase().includes(value) ||
          item.description.toLowerCase().includes(value)
        );
      });
  }, [holidays, activeTab, search]);

  const visibleData = useMemo(() => {
    return filteredData.slice(0, entries);
  }, [filteredData, entries]);

  const handleEdit = (holiday: Holiday) => {
    setEditingHoliday(holiday);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelected([]);
    } else {
      setSelected(visibleData.map((item) => item.id));
    }

    setSelectAll(!selectAll);
  };

const toggleSelect = (id: string) => {
        setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const getStatusBadge = (
    status: HolidayStatus
  ) => {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#10c469",
          color: "#fff",
          borderRadius: "5px",
          padding: "4px 14px",
          fontSize: "12px",
          fontWeight: 600,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            background: "#fff",
            borderRadius: "50%",
            marginRight: 6,
          }}
        ></span>

        {status === "ACTIVE"
          ? "Active"
          : "Inactive"}
      </span>
    );
  };


  useEffect(() => {
  fetchHolidays();
}, []);

const fetchHolidays = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) return;

    const response = await getHolidays(token);

    console.log(response.data);

    const holidayData = response.data.data.map((item: any) => ({
      id: item.id,
      title: item.title,
      date: new Date(item.holidayDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      description: item.description,
      status: item.isActive ? "ACTIVE" : "INACTIVE",
      statusCode: item.isActive ? 1 : 0,
      type: item.holidayType === 0 ? "HR" : "COMPLIANCE",
    }));

    setHolidays(holidayData);
  } catch (error) {
    console.log(error);
  }
};


  return (
  <div
    className="container-fluid"
    style={{
      paddingTop: "30px",
      paddingLeft: "24px",
      paddingRight: "24px",
      background: "#fafbfc",
      minHeight: "100vh",
    }}
  >
    {/* Header */}

    <div className="mb-4">
      <h2
        style={{
          fontWeight: 700,
          color: "#1b2559",
          marginBottom: "6px",
        }}
      >
        Holidays
      </h2>

      <div
        className="d-flex align-items-center"
        style={{
          fontSize: "13px",
          color: "#7a7a7a",
        }}
      >
        <Link
          to="/Employee/EmployeDashboard"
          className="text-decoration-none"
          style={{
            color: "#7a7a7a",
          }}
        >
          <i className="ti ti-home"></i>
        </Link>

        <span className="mx-2">/</span>

        <span>Holidays</span>
      </div>
    </div>

    {/* Tabs */}

    <div className="mb-3">
      <button
        onClick={() => setActiveTab("HR")}
        className="btn me-2"
        style={{
          background:
            activeTab === "HR"
              ? "#C89435"
              : "#fff",
          color:
            activeTab === "HR"
              ? "#fff"
              : "#4d5b7c",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "8px 18px",
          fontWeight: 500,
          boxShadow: "none",
        }}
      >
        HR Holiday
      </button>

      <button
        onClick={() =>
          setActiveTab("COMPLIANCE")
        }
        className="btn"
        style={{
          background:
            activeTab === "COMPLIANCE"
              ? "#C89435"
              : "#fff",
          color:
            activeTab === "COMPLIANCE"
              ? "#fff"
              : "#4d5b7c",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "8px 18px",
          fontWeight: 500,
          boxShadow: "none",
        }}
      >
        Compliance Holiday
      </button>
    </div>

    {/* Card */}

    <div
      className="card"
      style={{
        borderRadius: "10px",
        border: "1px solid #e8e8e8",
        boxShadow: "none",
      }}
    >
      <div
        className="card-header"
        style={{
          background: "#fff",
          padding: "18px 20px",
          borderBottom: "1px solid #ececec",
        }}
      >
        <h5
          style={{
            margin: 0,
            fontWeight: 600,
            color: "#1b2559",
          }}
        >
          HR / Gazetted Holidays
        </h5>
      </div>

      <div
        className="card-body"
        style={{
          paddingBottom: 0,
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">

          <div className="d-flex align-items-center">

            <span
              style={{
                fontSize: "14px",
                marginRight: "10px",
              }}
            >
              Row Per Page
            </span>

            <select
              value={entries}
              onChange={(e) =>
                setEntries(Number(e.target.value))
              }
              className="form-select"
              style={{
                width: "70px",
                height: "34px",
                fontSize: "14px",
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
            </select>

            <span
              style={{
                marginLeft: "10px",
                fontSize: "14px",
              }}
            >
              Entries
            </span>

          </div>

          <div>

            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="form-control"
              style={{
                width: "160px",
                height: "34px",
                fontSize: "14px",
              }}
            />

          </div>

        </div>

        <div className="table-responsive">

          <table
            className="table align-middle mb-0"
            style={{
              borderCollapse: "collapse",
            }}
          >
            <thead
              style={{
                background: "#f1f3f7",
              }}
            >
              <tr>

                <th
                  style={{
                    width: "70px",
                    padding: "14px",
                  }}
                >
                  S No.
                </th>

                <th>Title</th>

                <th>Date</th>

                <th>Description</th>

                <th
                  style={{
                    width: "120px",
                  }}
                >
                  Status
                </th>

              </tr>
            </thead>

           <tbody>
  {visibleData.length > 0 ? (
    visibleData.map((item, index) => (
      <tr
        key={item.id}
        style={{
          borderBottom: "1px solid #f1f1f1",
        }}
      >
        <td style={{ padding: "16px" }}>
          {index + 1}
        </td>

        <td
          style={{
            fontWeight: 500,
            color: "#1b2559",
          }}
        >
          {item.title}
        </td>

        <td>{item.date}</td>

        <td
          style={{
            color: "#6c757d",
            maxWidth: "350px",
          }}
        >
          {item.description}
        </td>

        <td>{getStatusBadge(item.status)}</td>

      </tr>

      
    ))
  ) : (
    <tr>
      <td
        colSpan={6}
        className="text-center py-5"
      >
        No Holidays Found
      </td>
    </tr>
  )}
</tbody>

</table>

</div>

<div
  className="d-flex justify-content-between align-items-center px-3 py-3"
  style={{
    borderTop: "1px solid #ececec",
    fontSize: "14px",
  }}
>
  <div>
    Showing{" "}
    <strong>
      {visibleData.length}
    </strong>{" "}
    of{" "}
    <strong>
      {filteredData.length}
    </strong>{" "}
    entries
  </div>

  <div className="d-flex align-items-center gap-2">

    <button
      className="btn btn-light btn-sm"
      disabled
    >
      Previous
    </button>

    <button
      className="btn btn-sm"
      style={{
        background: "#C89435",
        color: "#fff",
        width: "36px",
      }}
    >
      1
    </button>

    <button
      className="btn btn-light btn-sm"
      disabled
    >
      Next
    </button>

  </div>
</div>

</div>

</div>
    </div>
  );
};

export default Holidays;

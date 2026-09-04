import React, { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";

type HolidayStatus = "ACTIVE" | "INACTIVE";
type HolidayType = "HR" | "COMPLIANCE";

interface Holiday {
  id: number;
  title: string;
  date: string;
  description: string;
  status: HolidayStatus;
  type: HolidayType;
}

interface HolidayForm {
  title: string;
  date: string;
  description: string;
  status: HolidayStatus;
  type: HolidayType;
}

const initialHolidays: Holiday[] = [
  {
    id: 1,
    title: "New Year",
    date: "01 Jan 2024",
    description: "First day of the new year",
    status: "ACTIVE",
    type: "HR",
  },
  {
    id: 2,
    title: "Martin Luther King Jr. Day",
    date: "15 Jan 2024",
    description: "Celebrating the civil rights leader",
    status: "ACTIVE",
    type: "HR",
  },
  {
    id: 3,
    title: "President's Day",
    date: "19 Feb 2024",
    description: "Honoring past US Presidents",
    status: "ACTIVE",
    type: "HR",
  },
  {
    id: 4,
    title: "Good Friday",
    date: "29 Mar 2024",
    description: "Holiday before Easter",
    status: "ACTIVE",
    type: "HR",
  },
  {
    id: 5,
    title: "Easter Monday",
    date: "01 Apr 2024",
    description: "Holiday after Easter",
    status: "ACTIVE",
    type: "HR",
  },
  {
    id: 6,
    title: "Memorial Day",
    date: "27 Apr 2024",
    description: "Honors military personnel",
    status: "ACTIVE",
    type: "HR",
  },
  {
    id: 7,
    title: "Independence Day",
    date: "04 Jul 2024",
    description: "Celebrates Independence",
    status: "ACTIVE",
    type: "HR",
  },
  {
    id: 8,
    title: "Labour Day",
    date: "02 Sep 2024",
    description: "Honors working people",
    status: "INACTIVE",
    type: "HR",
  },
  {
    id: 9,
    title: "Veterans Day",
    date: "11 Nov 2024",
    description: "Honors military veterans",
    status: "ACTIVE",
    type: "HR",
  },
  {
    id: 10,
    title: "Christmas Day",
    date: "25 Dec 2024",
    description: "Celebration of Christmas",
    status: "ACTIVE",
    type: "HR",
  },

  {
    id: 11,
    title: "Compliance Review Day",
    date: "10 Jan 2024",
    description: "Annual compliance review",
    status: "ACTIVE",
    type: "COMPLIANCE",
  },
  {
    id: 12,
    title: "Policy Awareness Day",
    date: "15 Mar 2024",
    description: "Company policy awareness",
    status: "ACTIVE",
    type: "COMPLIANCE",
  },
];

const emptyForm: HolidayForm = {
  title: "",
  date: "",
  description: "",
  status: "ACTIVE",
  type: "HR",
};

const Holidays: React.FC = () => {
  const [holidays, setHolidays] =
    useState<Holiday[]>(initialHolidays);

  const [activeTab, setActiveTab] =
    useState<HolidayType>("HR");

  const [entries, setEntries] = useState(10);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [selected, setSelected] =
    useState<number[]>([]);

  /* ===========================
     MODALS
  =========================== */

  const [addOpen, setAddOpen] =
    useState(false);

  const [editOpen, setEditOpen] =
    useState(false);

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [deleteId, setDeleteId] =
    useState<number | null>(null);

  const [form, setForm] =
    useState<HolidayForm>(emptyForm);

  /* ===========================
     FILTER
  =========================== */

  const filteredData = useMemo(() => {
    let result = holidays.filter(
      (holiday) =>
        holiday.type === activeTab
    );

    if (search.trim()) {
      const query =
        search.trim().toLowerCase();

      result = result.filter(
        (holiday) =>
          holiday.title
            .toLowerCase()
            .includes(query) ||
          holiday.date
            .toLowerCase()
            .includes(query) ||
          holiday.description
            .toLowerCase()
            .includes(query)
      );
    }

    return result;
  }, [
    holidays,
    activeTab,
    search,
  ]);

  /* ===========================
     PAGINATION
  =========================== */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredData.length / entries
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const visibleData = filteredData.slice(
    (safeCurrentPage - 1) * entries,
    safeCurrentPage * entries
  );

  /* ===========================
     CHECKBOX
  =========================== */

  const allVisibleSelected =
    visibleData.length > 0 &&
    visibleData.every((holiday) =>
      selected.includes(holiday.id)
    );

  const handleSelectAll = () => {
    const visibleIds = visibleData.map(
      (holiday) => holiday.id
    );

    if (allVisibleSelected) {
      setSelected((previous) =>
        previous.filter(
          (id) =>
            !visibleIds.includes(id)
        )
      );
    } else {
      setSelected((previous) => [
        ...new Set([
          ...previous,
          ...visibleIds,
        ]),
      ]);
    }
  };

  const toggleSelect = (
    id: number
  ) => {
    setSelected((previous) =>
      previous.includes(id)
        ? previous.filter(
            (item) => item !== id
          )
        : [...previous, id]
    );
  };

  /* ===========================
     DATE HELPERS
  =========================== */

  const displayDateToInput = (
    date: string
  ) => {
    const months: {
      [key: string]: string;
    } = {
      Jan: "01",
      Feb: "02",
      Mar: "03",
      Apr: "04",
      May: "05",
      Jun: "06",
      Jul: "07",
      Aug: "08",
      Sep: "09",
      Oct: "10",
      Nov: "11",
      Dec: "12",
    };

    const parts = date.split(" ");

    if (parts.length !== 3) {
      return "";
    }

    const [day, month, year] =
      parts;

    return `${year}-${
      months[month]
    }-${day.padStart(2, "0")}`;
  };

  const inputDateToDisplay = (
    date: string
  ) => {
    if (!date) return "";

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const [year, month, day] =
      date.split("-");

    return `${day} ${
      months[Number(month) - 1]
    } ${year}`;
  };

  /* ===========================
     ADD
  =========================== */

  const openAddModal = () => {
    setForm({
      ...emptyForm,
      type: activeTab,
    });

    setAddOpen(true);
  };

  const closeAddModal = () => {
    setAddOpen(false);
    setForm(emptyForm);
  };

  const handleAdd = (
    e: FormEvent
  ) => {
    e.preventDefault();

    if (
      !form.title.trim() ||
      !form.date ||
      !form.description.trim()
    ) {
      return;
    }

    const newHoliday: Holiday = {
      id:
        holidays.length > 0
          ? Math.max(
              ...holidays.map(
                (holiday) =>
                  holiday.id
              )
            ) + 1
          : 1,

      title: form.title.trim(),

      date:
        inputDateToDisplay(
          form.date
        ),

      description:
        form.description.trim(),

      status: form.status,

      type: form.type,
    };

    setHolidays((previous) => [
      ...previous,
      newHoliday,
    ]);

    setActiveTab(form.type);

    closeAddModal();
  };

  /* ===========================
     EDIT
  =========================== */

  const openEditModal = (
    holiday: Holiday
  ) => {
    setEditingId(holiday.id);

    setForm({
      title: holiday.title,

      date:
        displayDateToInput(
          holiday.date
        ),

      description:
        holiday.description,

      status: holiday.status,

      type: holiday.type,
    });

    setEditOpen(true);
  };

  const closeEditModal = () => {
    setEditOpen(false);

    setEditingId(null);

    setForm(emptyForm);
  };

  const handleEdit = (
    e: FormEvent
  ) => {
    e.preventDefault();

    if (
      editingId === null ||
      !form.title.trim() ||
      !form.date ||
      !form.description.trim()
    ) {
      return;
    }

    setHolidays((previous) =>
      previous.map((holiday) =>
        holiday.id === editingId
          ? {
              ...holiday,

              title:
                form.title.trim(),

              date:
                inputDateToDisplay(
                  form.date
                ),

              description:
                form.description.trim(),

              status:
                form.status,

              type:
                form.type,
            }
          : holiday
      )
    );

    setActiveTab(form.type);

    closeEditModal();
  };

  /* ===========================
     DELETE
  =========================== */

  const openDeleteModal = (
    id: number
  ) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteOpen(false);
    setDeleteId(null);
  };

  const handleDelete = () => {
    if (deleteId === null) {
      return;
    }

    setHolidays((previous) =>
      previous.filter(
        (holiday) =>
          holiday.id !== deleteId
      )
    );

    setSelected((previous) =>
      previous.filter(
        (id) => id !== deleteId
      )
    );

    closeDeleteModal();
  };

  return (
    <>
      <style>
        {`
        .holiday-page {
          width: 100%;
          padding: 24px 25px 25px;
          background: #f8f9fb;
          min-height: calc(100vh - 50px);
          color: #111c38;
        }

        /* =================================
           HEADER
        ================================= */

        .holiday-page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .holiday-page-title {
          margin: 0 0 5px;
          font-size: 24px;
          line-height: 1.2;
          font-weight: 700;
          color: #0d1b3a;
        }

        .holiday-breadcrumb {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #677386;
          font-size: 12px;
        }

        .holiday-breadcrumb a {
          display: inline-flex;
          color: #315c75;
          text-decoration: none;
        }

        .holiday-add-btn {
          height: 40px;
          padding: 0 15px;
          border: 0;
          border-radius: 5px;
          background: #c29238;
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        /* =================================
           TABS
        ================================= */

        .holiday-tabs {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }

        .holiday-tab {
          height: 37px;
          padding: 0 16px;
          border: 0;
          border-radius: 5px;
          background: transparent;
          color: #5c6677;
          font-size: 14px;
          cursor: pointer;
        }

        .holiday-tab.active {
          background: #c29238;
          color: #fff;
        }

        /* =================================
           CARD
        ================================= */

        .holiday-card {
          width: 100%;
          overflow: hidden;
          border: 1px solid #dde2e8;
          border-radius: 5px;
          background: #fff;
        }

        .holiday-card-header {
          height: 52px;
          padding: 0 20px;
          border-bottom: 1px solid #dde2e8;
          display: flex;
          align-items: center;
        }

        .holiday-card-header h5 {
          margin: 0;
          color: #071632;
          font-size: 16px;
          font-weight: 600;
        }

        /* =================================
           CONTROLS
        ================================= */

        .holiday-table-controls {
          min-height: 61px;
          padding: 10px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #e2e5e9;
        }

        .holiday-entries {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #26354d;
          font-size: 13px;
        }

        .holiday-entry-select {
          width: 49px;
          height: 29px;
          padding: 0 7px;
          border: 1px solid #dce1e7;
          border-radius: 6px;
          outline: none;
          background: #fff;
          font-size: 12px;
        }

        .holiday-search {
          width: 160px;
          height: 30px;
          padding: 0 14px;
          border: 1px solid #dce1e7;
          border-radius: 5px;
          outline: none;
          font-size: 12px;
        }

        /* =================================
           TABLE
        ================================= */

        .holiday-table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .holiday-table {
          width: 100%;
          min-width: 900px;
          margin: 0;
          border-collapse: collapse;
        }

        .holiday-table thead {
          background: #e1e4e9;
        }

        .holiday-table th {
          height: 42px;
          padding: 0 16px;
          vertical-align: middle;
          color: #06142e;
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
        }

        .holiday-table td {
          height: 47px;
          padding: 0 16px;
          vertical-align: middle;
          border-bottom: 1px solid #dfe3e8;
          background: #fff;
          color: #5d6879;
          font-size: 13px;
          white-space: nowrap;
        }

        .holiday-checkbox-column {
          width: 60px;
          text-align: center;
        }

        .holiday-title-cell {
          color: #000d27 !important;
          font-weight: 500;
        }

        .holiday-checkbox {
          width: 17px;
          height: 17px;
          cursor: pointer;
        }

        .holiday-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .holiday-sort {
          color: #cdd2da;
          font-size: 12px;
        }

        /* =================================
           STATUS
        ================================= */

        .holiday-status {
          height: 21px;
          min-width: 67px;
          padding: 0 8px;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 6px;

          border-radius: 4px;

          color: #fff;

          font-size: 11px;
          font-weight: 600;

          line-height: 1;
        }

        .holiday-status-active {
          background: #00bf63;
        }

        .holiday-status-inactive {
          min-width: 75px;
          background: #ef0a0a;
        }

        .holiday-status-dot {
          width: 4px !important;
          height: 4px !important;

          min-width: 4px !important;
          min-height: 4px !important;

          flex: 0 0 4px !important;

          display: block !important;

          padding: 0 !important;
          margin: 0 !important;

          border-radius: 50% !important;

          background: #fff !important;
        }

        /* =================================
           ACTION
        ================================= */

        .holiday-actions {
          display: inline-flex;
          align-items: center;
          gap: 15px;
        }

        .holiday-action-btn {
          width: 20px;
          height: 25px;

          padding: 0;

          border: 0;

          background: transparent;
          color: #687587;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          font-size: 15px;

          cursor: pointer;
        }

        /* =================================
           TABLE FOOTER
        ================================= */

        .holiday-table-footer {
          height: 57px;

          padding: 0 16px;

          border-top: 1px solid #dfe3e8;

          display: flex;
          align-items: center;
          justify-content: space-between;

          color: #596679;

          font-size: 13px;
        }

        .holiday-pagination {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .holiday-page-arrow {
          border: 0;
          background: transparent;
          color: #9ca5b2;
          cursor: pointer;
        }

        .holiday-current-page {
          width: 27px;
          height: 27px;

          border-radius: 50%;

          background: #c29238;
          color: #fff;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          font-size: 12px;
        }

        /* =================================
           MODAL OVERLAY
        ================================= */

        .holiday-modal-overlay {
          position: fixed;

          inset: 0;

          z-index: 99999;

          padding: 10px;

          display: flex;
          align-items: center;
          justify-content: center;

          background: rgba(0,0,0,.42);
        }

        /* =================================
           ADD / EDIT MODAL
        ================================= */

        .holiday-form-modal {
          width: 500px;
          max-width: calc(100vw - 30px);

          overflow: hidden;

          border-radius: 5px;

          background: #fff;

          box-shadow:
            0 15px 45px rgba(0,0,0,.2);
        }

        .holiday-modal-header {
          height: 63px;

          padding: 0 16px;

          border-bottom:
            1px solid #e1e5ea;

          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .holiday-modal-header h3 {
          margin: 0;

          color: #1e2b49;

          font-size: 20px;
          font-weight: 600;
        }

        .holiday-modal-close {
          width: 20px;
          height: 20px;

          padding: 0;

          border: 0;
          border-radius: 50%;

          background: #747d8a;
          color: #fff;

          display: flex;
          align-items: center;
          justify-content: center;

          line-height: 1;

          font-size: 14px;

          cursor: pointer;
        }

        .holiday-modal-body {
          padding: 17px 16px 7px;
        }

        .holiday-form-group {
          margin-bottom: 17px;
        }

        .holiday-form-group label {
          display: block;

          margin-bottom: 8px;

          color: #263452;

          font-size: 13px;
          font-weight: 500;
        }

        .holiday-form-group input,
        .holiday-form-group select,
        .holiday-form-group textarea {
          width: 100%;

          border:
            1px solid #dce1e7;

          border-radius: 5px;

          outline: none;

          background: #fff;

          color: #26344d;

          font-size: 13px;
        }

        .holiday-form-group input,
        .holiday-form-group select {
          height: 39px;

          padding: 0 10px;
        }

        .holiday-form-group textarea {
          height: 86px;

          padding: 10px;

          resize: none;
        }

        .holiday-form-group input:focus,
        .holiday-form-group select:focus,
        .holiday-form-group textarea:focus {
          border-color: #c29238;
        }

        .holiday-date-wrapper {
          position: relative;
        }

        .holiday-date-wrapper input {
          padding-right: 40px;
        }

        .holiday-date-wrapper i {
          position: absolute;

          right: 12px;
          top: 50%;

          transform:
            translateY(-50%);

          pointer-events: none;

          color: #2f3b50;

          font-size: 16px;
        }

        .holiday-modal-footer {
          min-height: 64px;

          padding: 10px 12px;

          border-top:
            1px solid #e4e7eb;

          display: flex;
          align-items: center;
          justify-content: flex-end;

          gap: 8px;
        }

        .holiday-modal-cancel {
          height: 39px;

          padding: 0 15px;

          border: 0;
          border-radius: 5px;

          background: #f7f8f9;
          color: #172033;

          font-size: 13px;

          cursor: pointer;
        }

        .holiday-modal-save {
          height: 39px;

          padding: 0 15px;

          border: 0;
          border-radius: 5px;

          background: #c29238;
          color: #fff;

          font-size: 13px;
          font-weight: 600;

          cursor: pointer;
        }

        /* =================================
           DELETE MODAL
        ================================= */

        .holiday-delete-modal {
          width: 400px;
          max-width:
            calc(100vw - 30px);

          padding: 16px 30px 17px;

          border-radius: 5px;

          background: #fff;

          text-align: center;

          box-shadow:
            0 15px 45px
            rgba(0,0,0,.2);
        }

        .holiday-delete-icon {
          width: 58px;
          height: 58px;

          margin: 0 auto 14px;

          border-radius: 4px;

          background: #f6cccc;

          color: #f10f18;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 30px;
        }

        .holiday-delete-icon i {
          color: #f10f18;

          font-size: 30px;
        }

        .holiday-delete-modal h3 {
          margin: 0 0 6px;

          color: #1d2b48;

          font-size: 19px;
          font-weight: 600;
        }

        .holiday-delete-modal p {
          max-width: 330px;

          margin: 0 auto 17px;

          color: #3e4654;

          font-size: 13px;

          line-height: 1.5;
        }

        .holiday-delete-actions {
          display: flex;
          justify-content: center;

          gap: 16px;
        }

        .holiday-delete-cancel {
          height: 39px;

          padding: 0 16px;

          border: 0;
          border-radius: 5px;

          background: #f6f7f8;

          color: #172033;

          font-size: 13px;

          cursor: pointer;
        }

        .holiday-delete-confirm {
          height: 39px;

          padding: 0 16px;

          border: 0;
          border-radius: 5px;

          background: #f10d16;

          color: #fff;

          font-size: 13px;
          font-weight: 600;

          cursor: pointer;
        }

        @media(max-width:768px) {
          .holiday-page {
            padding: 20px 15px;
          }

          .holiday-table-controls {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }

          .holiday-search {
            width: 100%;
          }
        }
      `}
      </style>

      <div className="holiday-page">
        {/* ===========================
            HEADER
        =========================== */}

        <div className="holiday-page-header">
          <div>
            <h1 className="holiday-page-title">
              Holidays
            </h1>

            <div className="holiday-breadcrumb">
              <Link to="/admin/dashboard">
                <i className="ti ti-home" />
              </Link>

              <span>/</span>

              <span>
                Holidays
              </span>
            </div>
          </div>

          <button
            type="button"
            className="holiday-add-btn"
            onClick={openAddModal}
          >
            <i className="ti ti-circle-plus" />

            Add Holiday
          </button>
        </div>

        {/* ===========================
            TABS
        =========================== */}

        <div className="holiday-tabs">
          <button
            type="button"
            className={`holiday-tab ${
              activeTab === "HR"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setActiveTab("HR");
              setCurrentPage(1);
              setSelected([]);
            }}
          >
            HR Holiday
          </button>

          <button
            type="button"
            className={`holiday-tab ${
              activeTab === "COMPLIANCE"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setActiveTab(
                "COMPLIANCE"
              );

              setCurrentPage(1);
              setSelected([]);
            }}
          >
            Compliance Holiday
          </button>
        </div>

        {/* ===========================
            CARD
        =========================== */}

        <div className="holiday-card">
          <div className="holiday-card-header">
            <h5>
              Holidays List
            </h5>
          </div>

          {/* CONTROLS */}

          <div className="holiday-table-controls">
            <div className="holiday-entries">
              <span>
                Row Per Page
              </span>

              <select
                className="holiday-entry-select"
                value={entries}
                onChange={(e) => {
                  setEntries(
                    Number(
                      e.target.value
                    )
                  );

                  setCurrentPage(1);
                }}
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

            <input
              type="text"
              className="holiday-search"
              placeholder="Search"
              value={search}
              onChange={(e) => {
                setSearch(
                  e.target.value
                );

                setCurrentPage(1);
              }}
            />
          </div>

          {/* ===========================
              TABLE
          =========================== */}

          <div className="holiday-table-wrapper">
            <table className="holiday-table">
              <thead>
                <tr>
                  <th className="holiday-checkbox-column">
                    <input
                      type="checkbox"
                      className="holiday-checkbox"
                      checked={
                        allVisibleSelected
                      }
                      onChange={
                        handleSelectAll
                      }
                    />
                  </th>

                  <th>
                    <div className="holiday-heading">
                      Title
                      <span className="holiday-sort">
                        ↑↓
                      </span>
                    </div>
                  </th>

                  <th>
                    <div className="holiday-heading">
                      Date
                      <span className="holiday-sort">
                        ↑↓
                      </span>
                    </div>
                  </th>

                  <th>
                    <div className="holiday-heading">
                      Description

                      <span className="holiday-sort">
                        ↑↓
                      </span>
                    </div>
                  </th>

                  <th>
                    <div className="holiday-heading">
                      Status

                      <span className="holiday-sort">
                        ↑↓
                      </span>
                    </div>
                  </th>

                  <th />
                </tr>
              </thead>

              <tbody>
                {visibleData.map(
                  (holiday) => (
                    <tr key={holiday.id}>
                      <td className="holiday-checkbox-column">
                        <input
                          type="checkbox"
                          className="holiday-checkbox"
                          checked={selected.includes(
                            holiday.id
                          )}
                          onChange={() =>
                            toggleSelect(
                              holiday.id
                            )
                          }
                        />
                      </td>

                      <td className="holiday-title-cell">
                        {holiday.title}
                      </td>

                      <td>
                        {holiday.date}
                      </td>

                      <td>
                        {holiday.description}
                      </td>

                      <td>
                        <span
                          className={`holiday-status ${
                            holiday.status ===
                            "ACTIVE"
                              ? "holiday-status-active"
                              : "holiday-status-inactive"
                          }`}
                        >
                          <span className="holiday-status-dot" />

                          {holiday.status ===
                          "ACTIVE"
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      {/* =================
                          ACTION
                      ================= */}

                      <td>
                        <div className="holiday-actions">
                          {/* EDIT */}

                          <button
                            type="button"
                            className="holiday-action-btn"
                            title="Edit"
                            onClick={() =>
                              openEditModal(
                                holiday
                              )
                            }
                          >
                            <i className="ti ti-edit" />
                          </button>

                          {/* DELETE */}

                          <button
                            type="button"
                            className="holiday-action-btn"
                            title="Delete"
                            onClick={() =>
                              openDeleteModal(
                                holiday.id
                              )
                            }
                          >
                            <i className="ti ti-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}

                {visibleData.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        textAlign:
                          "center",
                        height: "80px",
                      }}
                    >
                      No holidays found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ===========================
              TABLE FOOTER
          =========================== */}

          <div className="holiday-table-footer">
            <div>
              Showing{" "}
              {filteredData.length ===
              0
                ? 0
                : (safeCurrentPage -
                    1) *
                    entries +
                  1}
              {" - "}
              {Math.min(
                safeCurrentPage *
                  entries,
                filteredData.length
              )}{" "}
              of{" "}
              {
                filteredData.length
              }{" "}
              entries
            </div>

            <div className="holiday-pagination">
              <button
                type="button"
                className="holiday-page-arrow"
                disabled={
                  safeCurrentPage === 1
                }
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.max(
                        1,
                        page - 1
                      )
                  )
                }
              >
                <i className="ti ti-chevron-left" />
              </button>

              <span className="holiday-current-page">
                {safeCurrentPage}
              </span>

              <button
                type="button"
                className="holiday-page-arrow"
                disabled={
                  safeCurrentPage ===
                  totalPages
                }
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.min(
                        totalPages,
                        page + 1
                      )
                  )
                }
              >
                <i className="ti ti-chevron-right" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          ADD HOLIDAY MODAL
          SCREENSHOT 1
      ================================================= */}

      {addOpen && (
        <div className="holiday-modal-overlay">
          <div className="holiday-form-modal">
            <div className="holiday-modal-header">
              <h3>
                Add Holiday
              </h3>

              <button
                type="button"
                className="holiday-modal-close"
                onClick={
                  closeAddModal
                }
              >
                ×
              </button>
            </div>

            <form
              onSubmit={
                handleAdd
              }
            >
              <div className="holiday-modal-body">
                {/* TITLE */}

                <div className="holiday-form-group">
                  <label>
                    Title
                  </label>

                  <input
                    type="text"
                    value={
                      form.title
                    }
                    onChange={(e) =>
                      setForm(
                        (previous) => ({
                          ...previous,

                          title:
                            e.target
                              .value,
                        })
                      )
                    }
                  />
                </div>

                {/* DATE */}

                <div className="holiday-form-group">
                  <label>
                    Date
                  </label>

                  <div className="holiday-date-wrapper">
                    <input
                      type="date"
                      value={
                        form.date
                      }
                      onChange={(e) =>
                        setForm(
                          (
                            previous
                          ) => ({
                            ...previous,

                            date:
                              e
                                .target
                                .value,
                          })
                        )
                      }
                    />

                    <i className="ti ti-calendar-event" />
                  </div>
                </div>

                {/* HOLIDAY TYPE */}

                <div className="holiday-form-group">
                  <label>
                    Holiday Type
                  </label>

                  <select
                    value={
                      form.type
                    }
                    onChange={(e) =>
                      setForm(
                        (previous) => ({
                          ...previous,

                          type:
                            e.target
                              .value as HolidayType,
                        })
                      )
                    }
                  >
                    <option value="HR">
                      HR Holiday
                    </option>

                    <option value="COMPLIANCE">
                      Compliance Holiday
                    </option>
                  </select>
                </div>

                {/* DESCRIPTION */}

                <div className="holiday-form-group">
                  <label>
                    Description
                  </label>

                  <textarea
                    value={
                      form.description
                    }
                    onChange={(e) =>
                      setForm(
                        (previous) => ({
                          ...previous,

                          description:
                            e.target
                              .value,
                        })
                      )
                    }
                  />
                </div>

                {/* STATUS */}

                <div className="holiday-form-group">
                  <label>
                    Status
                  </label>

                  <select
                    value={
                      form.status
                    }
                    onChange={(e) =>
                      setForm(
                        (previous) => ({
                          ...previous,

                          status:
                            e.target
                              .value as HolidayStatus,
                        })
                      )
                    }
                  >
                    <option value="ACTIVE">
                      Active
                    </option>

                    <option value="INACTIVE">
                      Inactive
                    </option>
                  </select>
                </div>
              </div>

              <div className="holiday-modal-footer">
                <button
                  type="button"
                  className="holiday-modal-cancel"
                  onClick={
                    closeAddModal
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="holiday-modal-save"
                >
                  Add Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================
          EDIT HOLIDAY MODAL
          SCREENSHOT 2
      ================================================= */}

      {editOpen &&
        editingId !== null && (
          <div className="holiday-modal-overlay">
            <div className="holiday-form-modal">
              <div className="holiday-modal-header">
                <h3>
                  Edit Holiday
                </h3>

                <button
                  type="button"
                  className="holiday-modal-close"
                  onClick={
                    closeEditModal
                  }
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={
                  handleEdit
                }
              >
                <div className="holiday-modal-body">
                  {/* TITLE */}

                  <div className="holiday-form-group">
                    <label>
                      Title
                    </label>

                    <input
                      type="text"
                      value={
                        form.title
                      }
                      onChange={(e) =>
                        setForm(
                          (
                            previous
                          ) => ({
                            ...previous,

                            title:
                              e
                                .target
                                .value,
                          })
                        )
                      }
                    />
                  </div>

                  {/* DATE */}

                  <div className="holiday-form-group">
                    <label>
                      Date
                    </label>

                    <div className="holiday-date-wrapper">
                      <input
                        type="date"
                        value={
                          form.date
                        }
                        onChange={(e) =>
                          setForm(
                            (
                              previous
                            ) => ({
                              ...previous,

                              date:
                                e
                                  .target
                                  .value,
                            })
                          )
                        }
                      />

                      <i className="ti ti-calendar-event" />
                    </div>
                  </div>

                  {/* TYPE */}

                  <div className="holiday-form-group">
                    <label>
                      Holiday Type
                    </label>

                    <select
                      value={
                        form.type
                      }
                      onChange={(e) =>
                        setForm(
                          (
                            previous
                          ) => ({
                            ...previous,

                            type:
                              e
                                .target
                                .value as HolidayType,
                          })
                        )
                      }
                    >
                      <option value="HR">
                        HR Holiday
                      </option>

                      <option value="COMPLIANCE">
                        Compliance Holiday
                      </option>
                    </select>
                  </div>

                  {/* DESCRIPTION */}

                  <div className="holiday-form-group">
                    <label>
                      Description
                    </label>

                    <textarea
                      value={
                        form.description
                      }
                      onChange={(e) =>
                        setForm(
                          (
                            previous
                          ) => ({
                            ...previous,

                            description:
                              e
                                .target
                                .value,
                          })
                        )
                      }
                    />
                  </div>

                  {/* STATUS */}

                  <div className="holiday-form-group">
                    <label>
                      Status
                    </label>

                    <select
                      value={
                        form.status
                      }
                      onChange={(e) =>
                        setForm(
                          (
                            previous
                          ) => ({
                            ...previous,

                            status:
                              e
                                .target
                                .value as HolidayStatus,
                          })
                        )
                      }
                    >
                      <option value="ACTIVE">
                        Active
                      </option>

                      <option value="INACTIVE">
                        Inactive
                      </option>
                    </select>
                  </div>
                </div>

                <div className="holiday-modal-footer">
                  <button
                    type="button"
                    className="holiday-modal-cancel"
                    onClick={
                      closeEditModal
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="holiday-modal-save"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      {/* =================================================
          DELETE MODAL
          SCREENSHOT 3
      ================================================= */}

      {deleteOpen && (
        <div className="holiday-modal-overlay">
          <div className="holiday-delete-modal">
            <div className="holiday-delete-icon">
              <i className="ti ti-trash-x" />
            </div>

            <h3>
              Confirm Delete
            </h3>

            <p>
              You want to delete all the
              marked items, this cant be
              undone once you delete.
            </p>

            <div className="holiday-delete-actions">
              <button
                type="button"
                className="holiday-delete-cancel"
                onClick={
                  closeDeleteModal
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="holiday-delete-confirm"
                onClick={
                  handleDelete
                }
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Holidays;
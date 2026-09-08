import React, {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";

import {
  addHoliday,
  deleteHoliday,
  getHolidays,
  updateHoliday,
} from "../../services/adminservices";

/* =====================================================
   TYPES
===================================================== */

type HolidayStatus =
  | "ACTIVE"
  | "INACTIVE";

type HolidayType =
  | "HR"
  | "COMPLIANCE";

interface Holiday {
  id: string;
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

/* =====================================================
   EMPTY FORM
===================================================== */

const emptyForm: HolidayForm = {
  title: "",
  date: "",
  description: "",
  status: "ACTIVE",
  type: "HR",
};

/* =====================================================
   HOLIDAY TYPE HELPERS

   API:
   0 = HR
   1 = Compliance
===================================================== */

const holidayTypeToNumber = (
  type: HolidayType
) => {
  return type === "HR" ? 0 : 1;
};

const numberToHolidayType = (
  type: any
): HolidayType => {
  if (
    type === 1 ||
    type === "1" ||
    type === "COMPLIANCE" ||
    type === "Compliance"
  ) {
    return "COMPLIANCE";
  }

  return "HR";
};

/* =====================================================
   DATE HELPERS
===================================================== */

/*
  API Date:
  2026-09-07T06:56:24.477Z

  Input:
  2026-09-07

  Display:
  07 Sep 2026
*/

const formatApiDate = (
  date: any
): string => {
  if (!date) {
    return "";
  }

  const parsedDate =
    new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return String(date);
  }

  const day =
    String(
      parsedDate.getDate()
    ).padStart(2, "0");

  const month =
    parsedDate.toLocaleString(
      "en-US",
      {
        month: "short",
      }
    );

  const year =
    parsedDate.getFullYear();

  return `${day} ${month} ${year}`;
};

const formatDateForInput = (
  date: string
): string => {
  if (!date) {
    return "";
  }

  /*
    Already yyyy-mm-dd
  */
  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      date
    )
  ) {
    return date;
  }

  const parsedDate =
    new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return "";
  }

  const year =
    parsedDate.getFullYear();

  const month =
    String(
      parsedDate.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      parsedDate.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/*
  API wants ISO date.
*/
const inputDateToApiDate = (
  date: string
) => {
  if (!date) {
    return "";
  }

  return `${date}T00:00:00.000Z`;
};

/* =====================================================
   RESPONSE HELPERS
===================================================== */

const extractHolidayList = (
  response: any
): any[] => {
  const candidates = [
    response?.data?.items,
    response?.data?.records,
    response?.data?.holidays,
    response?.data?.result,

    response?.items,
    response?.records,
    response?.holidays,
    response?.result,

    response?.data,

    response,
  ];

  for (
    const candidate of candidates
  ) {
    if (
      Array.isArray(candidate)
    ) {
      return candidate;
    }
  }

  return [];
};

/* =====================================================
   FORMAT API HOLIDAY
===================================================== */

const formatHoliday = (
  item: any
): Holiday => {
  const id =
    item?.id ??
    item?.Id ??
    item?.holidayId ??
    item?.HolidayId ??
    "";

  const title =
    item?.title ??
    item?.Title ??
    "";

  const description =
    item?.description ??
    item?.Description ??
    "";

  const holidayDate =
    item?.holidayDate ??
    item?.HolidayDate ??
    item?.date ??
    item?.Date ??
    "";

  const holidayType =
    item?.holidayType ??
    item?.HolidayType ??
    0;

  const isActive =
    item?.isActive ??
    item?.IsActive ??
    item?.status ??
    item?.Status ??
    true;

  return {
    id: String(id),

    title: String(title),

    date:
      formatApiDate(
        holidayDate
      ),

    description:
      String(description),

    status:
      isActive === true ||
      isActive === 1 ||
      isActive === "1" ||
      isActive === "true" ||
      isActive === "ACTIVE" ||
      isActive === "Active"
        ? "ACTIVE"
        : "INACTIVE",

    type:
      numberToHolidayType(
        holidayType
      ),
  };
};

/* =====================================================
   COMPONENT
===================================================== */

const Holidays: React.FC = () => {
  /* ===================================================
     DATA
  =================================================== */

  const [holidays, setHolidays] =
    useState<Holiday[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  /* ===================================================
     TAB
  =================================================== */

  const [activeTab, setActiveTab] =
    useState<HolidayType>("HR");

  /* ===================================================
     TABLE
  =================================================== */

  const [entries, setEntries] =
    useState(10);

  const [search, setSearch] =
    useState("");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [totalEntries, setTotalEntries] =
    useState(0);

  /* ===================================================
     CHECKBOX
  =================================================== */

  const [selected, setSelected] =
    useState<string[]>([]);

  /* ===================================================
     MODALS
  =================================================== */

  const [addOpen, setAddOpen] =
    useState(false);

  const [editOpen, setEditOpen] =
    useState(false);

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [deleteId, setDeleteId] =
    useState<string | null>(null);

  /* ===================================================
     FORM
  =================================================== */

  const [form, setForm] =
    useState<HolidayForm>(
      emptyForm
    );

  /* ===================================================
     SORT
  =================================================== */

  const [sortBy, setSortBy] =
    useState("");

  /* ===================================================
     ERROR
  =================================================== */

  const [error, setError] =
    useState("");

  /* ===================================================
     LOAD HOLIDAYS
  =================================================== */

  const loadHolidays =
    async (
      page = currentPage
    ) => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getHolidays({
            Search:
              search.trim() ||
              undefined,

            HolidayType:
              holidayTypeToNumber(
                activeTab
              ),

            PageNumber: page,

            PageSize: entries,

            SortBy:
              sortBy || undefined,
          });

        console.log(
          "HOLIDAY API RESPONSE:",
          response
        );

        const list =
          extractHolidayList(
            response
          );

        const formatted =
          list.map(
            formatHoliday
          );

        setHolidays(
          formatted
        );

        /*
          Try to get total records
          from common API response structures.
        */

        const total =
          response?.data?.totalCount ??
          response?.data?.totalRecords ??
          response?.data?.total ??
          response?.totalCount ??
          response?.totalRecords ??
          response?.total ??
          formatted.length;

        setTotalEntries(
          Number(total) ||
            formatted.length
        );
      } catch (err: any) {
        console.error(
          "GET HOLIDAY ERROR:",
          err
        );

        setHolidays([]);

        setTotalEntries(0);

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load holidays."
        );
      } finally {
        setLoading(false);
      }
    };

  /* ===================================================
     INITIAL / FILTER LOAD
  =================================================== */

  useEffect(() => {
    const timer =
      setTimeout(() => {
        loadHolidays(
          currentPage
        );
      }, 350);

    return () =>
      clearTimeout(timer);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    search,
    entries,
    currentPage,
    sortBy,
  ]);

  /* ===================================================
     FILTERED DATA

     API already filters by type/search.
     This additional filter keeps UI safe.
  =================================================== */

  const filteredData =
    useMemo(() => {
      return holidays.filter(
        (holiday) =>
          holiday.type ===
          activeTab
      );
    }, [
      holidays,
      activeTab,
    ]);

  /* ===================================================
     PAGINATION

     Backend pagination is being used.
  =================================================== */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalEntries /
          entries
      )
    );

  const safeCurrentPage =
    Math.min(
      currentPage,
      totalPages
    );

  /* ===================================================
     CHECKBOX
  =================================================== */

  const allVisibleSelected =
    filteredData.length > 0 &&
    filteredData.every(
      (holiday) =>
        selected.includes(
          holiday.id
        )
    );

  const handleSelectAll =
    () => {
      const visibleIds =
        filteredData.map(
          (holiday) =>
            holiday.id
        );

      if (
        allVisibleSelected
      ) {
        setSelected(
          (previous) =>
            previous.filter(
              (id) =>
                !visibleIds.includes(
                  id
                )
            )
        );
      } else {
        setSelected(
          (previous) => [
            ...new Set([
              ...previous,
              ...visibleIds,
            ]),
          ]
        );
      }
    };

  const toggleSelect = (
    id: string
  ) => {
    setSelected(
      (previous) =>
        previous.includes(id)
          ? previous.filter(
              (item) =>
                item !== id
            )
          : [
              ...previous,
              id,
            ]
    );
  };

  /* ===================================================
     SORT
  =================================================== */

  const handleSort = (
    field: string
  ) => {
    setSortBy(
      sortBy === field
        ? ""
        : field
    );

    setCurrentPage(1);
  };

  /* ===================================================
     ADD MODAL
  =================================================== */

  const openAddModal =
    () => {
      setForm({
        ...emptyForm,

        type: activeTab,
      });

      setError("");

      setAddOpen(true);
    };

  const closeAddModal =
    () => {
      setAddOpen(false);

      setForm(
        emptyForm
      );

      setError("");
    };

  /* ===================================================
     ADD HOLIDAY
  =================================================== */

  const handleAdd = async (
    e: FormEvent
  ) => {
    e.preventDefault();

    if (
      !form.title.trim() ||
      !form.date ||
      !form.description.trim()
    ) {
      setError(
        "Please fill all required fields."
      );

      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        title:
          form.title.trim(),

        holidayDate:
          inputDateToApiDate(
            form.date
          ),

        holidayType:
          holidayTypeToNumber(
            form.type
          ),

        description:
          form.description.trim(),

        status:
          form.status ===
          "ACTIVE",
      };

      console.log(
        "ADD HOLIDAY PAYLOAD:",
        payload
      );

      await addHoliday(
        payload
      );

      closeAddModal();

      setActiveTab(
        form.type
      );

      setCurrentPage(1);

      await loadHolidays(
        1
      );
    } catch (err: any) {
      console.error(
        "ADD HOLIDAY ERROR:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to add holiday."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ===================================================
     EDIT MODAL
  =================================================== */

  const openEditModal = (
    holiday: Holiday
  ) => {
    setEditingId(
      holiday.id
    );

    setForm({
      title:
        holiday.title,

      date:
        formatDateForInput(
          holiday.date
        ),

      description:
        holiday.description,

      status:
        holiday.status,

      type:
        holiday.type,
    });

    setError("");

    setEditOpen(true);
  };

  const closeEditModal =
    () => {
      setEditOpen(false);

      setEditingId(null);

      setForm(
        emptyForm
      );

      setError("");
    };

  /* ===================================================
     UPDATE HOLIDAY
  =================================================== */

  const handleEdit = async (
    e: FormEvent
  ) => {
    e.preventDefault();

    if (
      !editingId ||
      !form.title.trim() ||
      !form.date ||
      !form.description.trim()
    ) {
      setError(
        "Please fill all required fields."
      );

      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        id:
          editingId,

        title:
          form.title.trim(),

        holidayDate:
          inputDateToApiDate(
            form.date
          ),

        holidayType:
          holidayTypeToNumber(
            form.type
          ),

        description:
          form.description.trim(),

        status:
          form.status ===
          "ACTIVE",
      };

      console.log(
        "UPDATE HOLIDAY PAYLOAD:",
        payload
      );

      await updateHoliday(
        payload
      );

      closeEditModal();

      setActiveTab(
        form.type
      );

      await loadHolidays(
        currentPage
      );
    } catch (err: any) {
      console.error(
        "UPDATE HOLIDAY ERROR:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update holiday."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ===================================================
     DELETE MODAL
  =================================================== */

  const openDeleteModal = (
    id: string
  ) => {
    setDeleteId(id);

    setError("");

    setDeleteOpen(true);
  };

  const closeDeleteModal =
    () => {
      setDeleteOpen(false);

      setDeleteId(null);

      setError("");
    };

  /* ===================================================
     DELETE HOLIDAY
  =================================================== */

  const handleDelete =
    async () => {
      if (!deleteId) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        console.log(
          "DELETE HOLIDAY ID:",
          deleteId
        );

        await deleteHoliday(
          deleteId
        );

        setSelected(
          (previous) =>
            previous.filter(
              (id) =>
                id !== deleteId
            )
        );

        closeDeleteModal();

        /*
          If last item of current
          page is deleted, go back
          one page.
        */

        const nextPage =
          filteredData.length ===
            1 &&
          currentPage > 1
            ? currentPage - 1
            : currentPage;

        setCurrentPage(
          nextPage
        );

        await loadHolidays(
          nextPage
        );
      } catch (err: any) {
        console.error(
          "DELETE HOLIDAY ERROR:",
          err
        );

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to delete holiday."
        );
      } finally {
        setLoading(false);
      }
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

        .holiday-add-btn:disabled,
        .holiday-modal-save:disabled,
        .holiday-delete-confirm:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

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

        .holiday-heading.sortable {
          cursor: pointer;
        }

        .holiday-sort {
          color: #cdd2da;
          font-size: 12px;
        }

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

        .holiday-action-btn:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

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

        .holiday-page-arrow:disabled {
          opacity: .4;
          cursor: not-allowed;
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

        .holiday-loading {
          text-align: center;
          height: 80px;
          color: #687587;
        }

        .holiday-error {
          margin: 12px 16px;
          padding: 10px 12px;
          border-radius: 5px;
          background: #fff0f0;
          border: 1px solid #ffd2d2;
          color: #d00b14;
          font-size: 13px;
        }

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

        .holiday-form-modal {
          width: 500px;
          max-width: calc(100vw - 30px);
          overflow: hidden;
          border-radius: 5px;
          background: #fff;
          box-shadow: 0 15px 45px rgba(0,0,0,.2);
        }

        .holiday-modal-header {
          height: 63px;
          padding: 0 16px;
          border-bottom: 1px solid #e1e5ea;
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
          border: 1px solid #dce1e7;
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
          transform: translateY(-50%);
          pointer-events: none;
          color: #2f3b50;
          font-size: 16px;
        }

        .holiday-modal-footer {
          min-height: 64px;
          padding: 10px 12px;
          border-top: 1px solid #e4e7eb;
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

        .holiday-delete-modal {
          width: 400px;
          max-width: calc(100vw - 30px);
          padding: 16px 30px 17px;
          border-radius: 5px;
          background: #fff;
          text-align: center;
          box-shadow: 0 15px 45px rgba(0,0,0,.2);
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

          .holiday-page-header {
            flex-direction: column;
            gap: 15px;
          }

          .holiday-table-controls {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }

          .holiday-search {
            width: 100%;
          }

          .holiday-table-footer {
            gap: 15px;
            flex-direction: column;
            justify-content: center;
            height: auto;
            padding: 12px 16px;
          }
        }
      `}
      </style>

      <div className="holiday-page">

        {/* =================================================
            HEADER
        ================================================= */}

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
            onClick={
              openAddModal
            }
            disabled={loading}
          >
            <i className="ti ti-circle-plus" />

            Add Holiday
          </button>

        </div>

        {/* =================================================
            TABS
        ================================================= */}

        <div className="holiday-tabs">

          <button
            type="button"
            className={`holiday-tab ${
              activeTab === "HR"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setActiveTab(
                "HR"
              );

              setCurrentPage(1);

              setSelected([]);
            }}
          >
            HR Holiday
          </button>

          <button
            type="button"
            className={`holiday-tab ${
              activeTab ===
              "COMPLIANCE"
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

        {/* =================================================
            CARD
        ================================================= */}

        <div className="holiday-card">

          <div className="holiday-card-header">
            <h5>
              Holidays List
            </h5>
          </div>

          {/* =================================================
              CONTROLS
          ================================================= */}

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

          {/* ERROR */}

          {error && (
            <div className="holiday-error">
              {error}
            </div>
          )}

          {/* =================================================
              TABLE
          ================================================= */}

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

                  {/* TITLE */}

                  <th>

                    <div
                      className="holiday-heading sortable"
                      onClick={() =>
                        handleSort(
                          "Title"
                        )
                      }
                    >
                      Title

                      <span className="holiday-sort">
                        ↑↓
                      </span>
                    </div>

                  </th>

                  {/* DATE */}

                  <th>

                    <div
                      className="holiday-heading sortable"
                      onClick={() =>
                        handleSort(
                          "HolidayDate"
                        )
                      }
                    >
                      Date

                      <span className="holiday-sort">
                        ↑↓
                      </span>
                    </div>

                  </th>

                  {/* DESCRIPTION */}

                  <th>

                    <div
                      className="holiday-heading sortable"
                      onClick={() =>
                        handleSort(
                          "Description"
                        )
                      }
                    >
                      Description

                      <span className="holiday-sort">
                        ↑↓
                      </span>
                    </div>

                  </th>

                  {/* STATUS */}

                  <th>

                    <div
                      className="holiday-heading sortable"
                      onClick={() =>
                        handleSort(
                          "IsActive"
                        )
                      }
                    >
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

                {loading ? (

                  <tr>
                    <td
                      colSpan={6}
                      className="holiday-loading"
                    >
                      Loading holidays...
                    </td>
                  </tr>

                ) : filteredData.length >
                  0 ? (

                  filteredData.map(
                    (holiday) => (

                      <tr
                        key={
                          holiday.id
                        }
                      >

                        {/* CHECKBOX */}

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

                        {/* TITLE */}

                        <td className="holiday-title-cell">
                          {
                            holiday.title
                          }
                        </td>

                        {/* DATE */}

                        <td>
                          {
                            holiday.date
                          }
                        </td>

                        {/* DESCRIPTION */}

                        <td>
                          {
                            holiday.description
                          }
                        </td>

                        {/* STATUS */}

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

                        {/* ACTION */}

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
                              disabled={
                                loading
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
                              disabled={
                                loading
                              }
                            >
                              <i className="ti ti-trash" />
                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )

                ) : (

                  <tr>

                    <td
                      colSpan={6}
                      style={{
                        textAlign:
                          "center",
                        height:
                          "80px",
                      }}
                    >
                      No holidays found
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

          {/* =================================================
              FOOTER
          ================================================= */}

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

              {filteredData.length ===
              0
                ? 0
                : (safeCurrentPage -
                    1) *
                    entries +
                  filteredData.length}

              {" "}of{" "}

              {
                totalEntries
              }

              {" "}entries
            </div>

            <div className="holiday-pagination">

              <button
                type="button"
                className="holiday-page-arrow"
                disabled={
                  safeCurrentPage ===
                    1 ||
                  loading
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
                {
                  safeCurrentPage
                }
              </span>

              <button
                type="button"
                className="holiday-page-arrow"
                disabled={
                  safeCurrentPage ===
                    totalPages ||
                  loading
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
                        (
                          previous
                        ) => ({
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
                              e.target
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
                        (
                          previous
                        ) => ({
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
                        (
                          previous
                        ) => ({
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
                        (
                          previous
                        ) => ({
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
                  disabled={
                    loading
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="holiday-modal-save"
                  disabled={
                    loading
                  }
                >
                  {loading
                    ? "Adding..."
                    : "Add Holiday"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =================================================
          EDIT HOLIDAY MODAL
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
                                e.target
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
                          (
                            previous
                          ) => ({
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
                          (
                            previous
                          ) => ({
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
                          (
                            previous
                          ) => ({
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
                      closeEditModal
                    }
                    disabled={
                      loading
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="holiday-modal-save"
                    disabled={
                      loading
                    }
                  >
                    {loading
                      ? "Saving..."
                      : "Save Changes"}
                  </button>

                </div>

              </form>

            </div>

          </div>

        )}

      {/* =================================================
          DELETE MODAL
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

            {error && (
              <div
                className="holiday-error"
                style={{
                  margin:
                    "0 0 15px",
                  textAlign:
                    "left",
                }}
              >
                {error}
              </div>
            )}

            <div className="holiday-delete-actions">

              <button
                type="button"
                className="holiday-delete-cancel"
                onClick={
                  closeDeleteModal
                }
                disabled={
                  loading
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
                disabled={
                  loading
                }
              >
                {loading
                  ? "Deleting..."
                  : "Yes, Delete"}
              </button>

            </div>

          </div>

        </div>

      )}

    </>
  );
};

export default Holidays;
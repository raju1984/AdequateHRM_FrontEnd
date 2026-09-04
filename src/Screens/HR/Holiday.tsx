import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  addHoliday as addHolidayApi,
  deleteHoliday as deleteHolidayApi,
  getHolidayById,
  getHolidays,
  updateHoliday as updateHolidayApi,
} from "../../services/hrservices";

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

const Holidays: React.FC = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [entries, setEntries] = useState(10);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<HolidayType>("HR");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortBy, setSortBy] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [deletingHoliday, setDeletingHoliday] = useState<Holiday | null>(null);

  const [form, setForm] = useState({
    title: "",
    date: "",
    description: "",
    status: "ACTIVE" as HolidayStatus,
    type: "HR" as HolidayType,
  });

  const getErrorMessage = (error: any, fallback: string) => {
    const backendErrors = error?.response?.data?.errors;

    if (backendErrors) {
      return Object.entries(backendErrors)
        .map(([field, messages]) =>
          `${field}: ${
            Array.isArray(messages) ? messages.join(", ") : String(messages)
          }`
        )
        .join("\n");
    }

    return (
      error?.response?.data?.message ||
      error?.response?.data?.title ||
      error?.message ||
      fallback
    );
  };

  const getArrayFromResponse = (response: any) => {
    const candidates = [
      response,
      response?.data,
      response?.holidays,
      response?.Holidays,
      response?.data?.holidays,
      response?.data?.Holidays,
      response?.items,
      response?.Items,
      response?.data?.items,
      response?.data?.Items,
      response?.records,
      response?.Records,
      response?.data?.records,
      response?.data?.Records,
      response?.data?.data,
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) return candidate;
    }

    return [];
  };

  const getTotalFromResponse = (response: any, fallback: number) => {
    const candidates = [
      response?.totalRecords,
      response?.TotalRecords,
      response?.totalCount,
      response?.TotalCount,
      response?.count,
      response?.Count,
      response?.data?.totalRecords,
      response?.data?.TotalRecords,
      response?.data?.totalCount,
      response?.data?.TotalCount,
      response?.data?.count,
      response?.data?.Count,
    ];

    for (const value of candidates) {
      const parsed = Number(value);
      if (Number.isFinite(parsed) && parsed >= 0) return parsed;
    }

    return fallback;
  };

  const mapHoliday = (item: any): Holiday => {
    const rawType =
      item?.holidayType ??
      item?.HolidayType ??
      item?.type ??
      item?.Type ??
      0;

    const rawStatus =
      item?.isActive ??
      item?.IsActive ??
      item?.status ??
      item?.Status ??
      true;

    return {
      id:
        item?.id ??
        item?.Id ??
        item?.holidayId ??
        item?.HolidayId ??
        "",
      title: item?.title ?? item?.Title ?? "",
      date:
        item?.holidayDate ??
        item?.HolidayDate ??
        item?.date ??
        item?.Date ??
        "",
      description:
        item?.description ??
        item?.Description ??
        "",
      status:
        rawStatus === false ||
        rawStatus === 0 ||
        String(rawStatus).toLowerCase() === "inactive"
          ? "INACTIVE"
          : "ACTIVE",
      type: Number(rawType) === 1 ? "COMPLIANCE" : "HR",
    };
  };

  const toApiHolidayType = (type: HolidayType) =>
    type === "COMPLIANCE" ? 1 : 0;

  const toApiDate = (value: string) => {
    if (!value) return "";
    return new Date(`${value}T00:00:00`).toISOString();
  };

  const toInputDate = (value: string) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value.includes("T") ? value.split("T")[0] : value;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  function formatDate(value: string) {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const fetchHolidays = async () => {
    try {
      setLoading(true);

      const response = await getHolidays({
        Search: search.trim() || undefined,
        HolidayType: toApiHolidayType(activeTab),
        PageNumber: currentPage,
        PageSize: entries,
        SortBy: sortBy || undefined,
      });

      console.log("GET HOLIDAYS RESPONSE:", response);

      const raw = getArrayFromResponse(response);
      const formatted = raw.map(mapHoliday).filter((item) => Boolean(item.id));

      setHolidays(formatted);
      setTotalRecords(getTotalFromResponse(response, formatted.length));
    } catch (error: any) {
      console.error("GET HOLIDAYS ERROR:", error);
      console.error("GET HOLIDAYS BACKEND:", error?.response?.data);
      setHolidays([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(
      () => fetchHolidays(),
      search ? 400 : 0
    );

    return () => window.clearTimeout(timer);
  }, [search, activeTab, currentPage, entries, sortBy]);

  useEffect(() => {
    setCurrentPage(1);
    setSelected([]);
  }, [activeTab, entries]);

  const visibleData = useMemo(() => holidays, [holidays]);

  const allVisibleSelected =
    visibleData.length > 0 &&
    visibleData.every((item) => selected.includes(item.id));

  const handleSelectAll = (checked: boolean) => {
    const visibleIds = visibleData.map((item) => item.id);

    if (checked) {
      setSelected((prev) => Array.from(new Set([...prev, ...visibleIds])));
    } else {
      setSelected((prev) => prev.filter((id) => !visibleIds.includes(id)));
    }
  };

  const toggleSelect = (id: string, checked: boolean) => {
    setSelected((prev) =>
      checked
        ? prev.includes(id)
          ? prev
          : [...prev, id]
        : prev.filter((x) => x !== id)
    );
  };

  const openAdd = () => {
    setForm({
      title: "",
      date: "",
      description: "",
      status: "ACTIVE",
      type: activeTab,
    });
    setShowAddModal(true);
  };

  const handleAddHoliday = async () => {
    if (!form.title.trim() || !form.date) {
      alert("Please enter title and holiday date");
      return;
    }

    try {
      setSaving(true);

      const response = await addHolidayApi({
        title: form.title.trim(),
        holidayDate: toApiDate(form.date),
        holidayType: toApiHolidayType(form.type),
        description: form.description.trim(),
        status: form.status === "ACTIVE",
      });

      if (response?.isSuccess === false || response?.statusCode >= 400) {
        alert(response?.message || "Unable to add holiday");
        return;
      }

      alert(response?.message || "Holiday added successfully");
      setShowAddModal(false);
      setActiveTab(form.type);
      setCurrentPage(1);
      await fetchHolidays();
    } catch (error: any) {
      console.error("ADD HOLIDAY ERROR:", error);
      alert(getErrorMessage(error, "Unable to add holiday"));
    } finally {
      setSaving(false);
    }
  };

  const openEdit = async (item: Holiday) => {
    try {
      setEditingHoliday(item);

      const response = await getHolidayById(item.id);
      console.log("GET HOLIDAY BY ID RESPONSE:", response);

      const raw =
        response?.data?.data ??
        response?.data ??
        response;

      const fullHoliday = mapHoliday(raw);

      setForm({
        title: fullHoliday.title || item.title,
        date: toInputDate(fullHoliday.date || item.date),
        description: fullHoliday.description || item.description,
        status: fullHoliday.status || item.status,
        type: fullHoliday.type || item.type,
      });

      setShowEditModal(true);
    } catch (error: any) {
      console.error("GET HOLIDAY BY ID ERROR:", error);

      setForm({
        title: item.title,
        date: toInputDate(item.date),
        description: item.description,
        status: item.status,
        type: item.type,
      });

      setShowEditModal(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingHoliday || !form.title.trim() || !form.date) {
      alert("Please enter title and holiday date");
      return;
    }

    try {
      setSaving(true);

      const response = await updateHolidayApi({
        id: editingHoliday.id,
        title: form.title.trim(),
        description: form.description.trim(),
        holidayDate: toApiDate(form.date),
        holidayType: toApiHolidayType(form.type),
        isActive: form.status === "ACTIVE",
      });

      if (response?.isSuccess === false || response?.statusCode >= 400) {
        alert(response?.message || "Unable to update holiday");
        return;
      }

      alert(response?.message || "Holiday updated successfully");
      setShowEditModal(false);
      setEditingHoliday(null);
      setActiveTab(form.type);
      await fetchHolidays();
    } catch (error: any) {
      console.error("UPDATE HOLIDAY ERROR:", error);
      alert(getErrorMessage(error, "Unable to update holiday"));
    } finally {
      setSaving(false);
    }
  };

  const openDelete = (item: Holiday) => {
    setDeletingHoliday(item);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingHoliday) return;

    try {
      setDeleting(true);

      const response = await deleteHolidayApi(deletingHoliday.id);

      if (response?.isSuccess === false || response?.statusCode >= 400) {
        alert(response?.message || "Unable to delete holiday");
        return;
      }

      alert(response?.message || "Holiday deleted successfully");
      setSelected((prev) =>
        prev.filter((id) => id !== deletingHoliday.id)
      );

      setDeletingHoliday(null);
      setShowDeleteModal(false);

      if (holidays.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        await fetchHolidays();
      }
    } catch (error: any) {
      console.error("DELETE HOLIDAY ERROR:", error);
      alert(getErrorMessage(error, "Unable to delete holiday"));
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalRecords / entries));
  const safePage = Math.min(currentPage, totalPages);

  const showFrom =
    totalRecords === 0
      ? 0
      : (safePage - 1) * entries + 1;

  const showTo = Math.min(safePage * entries, totalRecords);

  return (
    <>
      <style>{`
        .hol-page{
          padding:24px 24px 32px;
          min-height:100vh;
          background:#f7f8fa;
          color:#152647;
          font-family:Inter,Arial,sans-serif;
        }

        .hol-header{
          display:flex;
          justify-content:space-between;
          align-items:flex-start;
          margin-bottom:26px;
        }

        .hol-title{
          margin:0;
          font-size:26px;
          line-height:1.2;
          font-weight:700;
          color:#152647;
        }

        .hol-breadcrumb{
          display:flex;
          align-items:center;
          gap:9px;
          margin-top:8px;
          font-size:12px;
          color:#5f6c80;
        }

        .hol-breadcrumb a{
          color:#5f6c80;
          text-decoration:none;
        }

        .hol-add-btn{
          height:40px;
          padding:0 16px;
          border:0;
          border-radius:6px;
          background:#c39236;
          color:#fff;
          font-size:14px;
          font-weight:600;
          display:inline-flex;
          align-items:center;
          gap:8px;
          cursor:pointer;
        }

        .hol-tabs{
          display:flex;
          gap:8px;
          margin-bottom:16px;
        }

        .hol-tab{
          height:38px;
          padding:0 16px;
          border:0;
          border-radius:6px;
          background:transparent;
          color:#607087;
          font-size:14px;
          cursor:pointer;
        }

        .hol-tab.active{
          background:#c39236;
          color:#fff;
          font-weight:600;
        }

        .hol-card{
          background:#fff;
          border:1px solid #dfe3e8;
          border-radius:6px;
          overflow:hidden;
          box-shadow:0 1px 2px rgba(16,24,40,.02);
        }

        .hol-card-title{
          padding:16px 20px;
          border-bottom:1px solid #e1e5ea;
          font-size:15px;
          font-weight:700;
          color:#142444;
        }

        .hol-toolbar{
          display:flex;
          justify-content:space-between;
          align-items:center;
          padding:15px 16px;
          background:#fff;
        }

        .hol-entries{
          display:flex;
          align-items:center;
          gap:8px;
          font-size:13px;
          color:#344054;
        }

        .hol-entries select{
          width:49px;
          height:31px;
          border:1px solid #d8dee6;
          border-radius:6px;
          padding:0 6px;
          background:#fff;
          color:#24324a;
          outline:none;
        }

        .hol-search{
          width:160px;
          height:31px;
          border:1px solid #d8dee6;
          border-radius:6px;
          padding:0 12px;
          outline:none;
          font-size:13px;
          color:#344054;
        }

        .hol-table-wrap{
          width:100%;
          overflow:hidden;
        }

        .hol-table{
          width:100%;
          border-collapse:collapse;
          table-layout:fixed;
        }

        .hol-table th{
          height:43px;
          background:#e4e7eb;
          color:#0d1b34;
          text-align:left;
          font-size:13px;
          font-weight:700;
          border-bottom:1px solid #dfe3e8;
          padding:0 12px;
          vertical-align:middle;
        }

        .hol-table td{
          height:47px;
          border-bottom:1px solid #e3e6eb;
          padding:0 12px;
          font-size:13px;
          color:#667085;
          vertical-align:middle;
        }

        .hol-table th:nth-child(1),
        .hol-table td:nth-child(1){
          width:7%;
          text-align:center;
        }

        .hol-table th:nth-child(2),
        .hol-table td:nth-child(2){ width:24%; }

        .hol-table th:nth-child(3),
        .hol-table td:nth-child(3){ width:14%; }

        .hol-table th:nth-child(4),
        .hol-table td:nth-child(4){ width:29%; }

        .hol-table th:nth-child(5),
        .hol-table td:nth-child(5){ width:14%; }

        .hol-table th:nth-child(6),
        .hol-table td:nth-child(6){
          width:12%;
          text-align:center;
        }

        .hol-table td:nth-child(2){
          color:#0b1527;
          font-weight:500;
        }

        .hol-table input[type="checkbox"]{
          width:18px;
          height:18px;
          cursor:pointer;
          accent-color:#c39236;
        }

        .sort-mark{
          float:right;
          color:#cbd1da;
          font-size:12px;
        }

        .hol-status{
          display:inline-flex;
          align-items:center;
          gap:6px;
          border-radius:4px;
          padding:3px 10px;
          font-size:12px;
          line-height:1.25;
          font-weight:600;
          white-space:nowrap;
        }

        .hol-status.active{
          background:#04c65a;
          color:#fff;
        }

        .hol-status.inactive{
          background:#ef1717;
          color:#fff;
        }

        .hol-actions{
          display:flex;
          align-items:center;
          justify-content:center;
          gap:8px;
        }

        .hol-action{
          width:26px;
          height:26px;
          border:0;
          background:transparent;
          color:#53657d;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          cursor:pointer;
          font-size:16px;
          padding:0;
        }

        .hol-footer{
          height:57px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          padding:0 16px;
          font-size:13px;
          color:#607087;
          background:#fff;
        }

        .hol-pagination{
          display:flex;
          align-items:center;
          gap:17px;
        }

        .hol-page-arrow{
          border:0;
          background:transparent;
          color:#a6afbc;
          font-size:18px;
          padding:0;
        }

        .hol-page-number{
          width:27px;
          height:27px;
          border-radius:50%;
          background:#c39236;
          color:#fff;
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:12px;
        }

        .hol-empty{
          height:80px!important;
          text-align:center;
          color:#98a2b3!important;
        }

        .hol-modal-backdrop{
          position:fixed;
          inset:0;
          z-index:9999;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:20px;
          background:rgba(15,23,42,.45);
        }

        .hol-modal{
          width:100%;
          max-width:500px;
          background:#fff;
          border-radius:8px;
          box-shadow:0 24px 60px rgba(15,23,42,.22);
          overflow:hidden;
        }

        .hol-modal-head{
          height:60px;
          padding:0 20px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          border-bottom:1px solid #e5e7eb;
        }

        .hol-modal-head h3{
          margin:0;
          font-size:18px;
          color:#17233c;
        }

        .hol-close{
          border:0;
          background:transparent;
          font-size:24px;
          color:#667085;
          cursor:pointer;
        }

        .hol-modal-body{
          padding:20px;
        }

        .hol-field{
          margin-bottom:16px;
        }

        .hol-field label{
          display:block;
          margin-bottom:7px;
          font-size:13px;
          font-weight:600;
          color:#344054;
        }

        .hol-field input,
        .hol-field select,
        .hol-field textarea{
          width:100%;
          border:1px solid #d8dee6;
          border-radius:6px;
          padding:10px 12px;
          font-size:13px;
          outline:none;
          background:#fff;
        }

        .hol-field textarea{
          min-height:90px;
          resize:vertical;
        }

        .hol-modal-footer{
          display:flex;
          justify-content:flex-end;
          gap:10px;
          padding:14px 20px;
          border-top:1px solid #e5e7eb;
        }

        .hol-btn{
          min-width:90px;
          height:38px;
          border-radius:6px;
          border:1px solid #d8dee6;
          background:#fff;
          color:#344054;
          cursor:pointer;
          font-weight:600;
        }

        .hol-btn.gold{
          background:#c39236;
          color:#fff;
          border-color:#c39236;
        }

        .hol-delete-box{
          text-align:center;
          padding:32px 28px;
        }

        .hol-delete-icon{
          width:62px;
          height:62px;
          margin:0 auto 18px;
          border-radius:8px;
          background:#fdeaea;
          display:flex;
          align-items:center;
          justify-content:center;
          color:#ef4444;
          font-size:30px;
        }

        .hol-delete-box h3{
          margin:0;
          font-size:22px;
          color:#2d3250;
        }

        .hol-delete-box p{
          margin:14px auto 22px;
          max-width:340px;
          color:#667085;
          font-size:14px;
          line-height:1.55;
        }

        .hol-delete-actions{
          display:flex;
          justify-content:center;
          gap:12px;
        }

        .hol-btn.danger{
          background:#ef4444;
          border-color:#ef4444;
          color:#fff;
        }

        @media(max-width:800px){
          .hol-page{padding:18px 12px 28px}
          .hol-header{gap:12px}
          .hol-toolbar{gap:10px}
          .hol-search{width:140px}
          .hol-table th,.hol-table td{font-size:12px;padding:0 8px}
        }
      `}</style>

      <div className="hol-page">
        <div className="hol-header">
          <div>
            <h1 className="hol-title">Holidays</h1>
            <div className="hol-breadcrumb">
              <Link to="/Hr/HrDashboard">
                <i className="ti ti-smart-home"></i>
              </Link>
              <span>/</span>
              <span>Holidays</span>
            </div>
          </div>

          <button className="hol-add-btn" type="button" onClick={openAdd}>
            <i className="ti ti-circle-plus"></i>
            Add Holiday
          </button>
        </div>

        <div className="hol-tabs">
          <button
            type="button"
            className={`hol-tab ${activeTab === "HR" ? "active" : ""}`}
            onClick={() => setActiveTab("HR")}
          >
            HR Holiday
          </button>

          <button
            type="button"
            className={`hol-tab ${activeTab === "COMPLIANCE" ? "active" : ""}`}
            onClick={() => setActiveTab("COMPLIANCE")}
          >
            Compliance Holiday
          </button>
        </div>

        <div className="hol-card">
          <div className="hol-card-title">Holidays List</div>

          <div className="hol-toolbar">
            <div className="hol-entries">
              <span>Row Per Page</span>
              <select
                value={entries}
                onChange={(e) => setEntries(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={40}>40</option>
                <option value={50}>50</option>
              </select>
              <span>Entries</span>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  height: 31,
                  border: "1px solid #d8dee6",
                  borderRadius: 6,
                  padding: "0 8px",
                  background: "#fff",
                }}
              >
                <option value="">Sort By</option>
                <option value="new">Newest</option>
                <option value="old">Oldest</option>
              </select>

              <input
                className="hol-search"
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                  setSelected([]);
                }}
              />
            </div>
          </div>

          <div className="hol-table-wrap">
            <table className="hol-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th>Title <span className="sort-mark">↕</span></th>
                  <th>Date <span className="sort-mark">↕</span></th>
                  <th>Description <span className="sort-mark">↕</span></th>
                  <th>Status <span className="sort-mark">↕</span></th>
                  <th><span className="sort-mark">↕</span></th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td className="hol-empty" colSpan={6}>
                      Loading holidays...
                    </td>
                  </tr>
                ) : visibleData.length > 0 ? (
                  visibleData.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selected.includes(item.id)}
                          onChange={(e) =>
                            toggleSelect(item.id, e.target.checked)
                          }
                        />
                      </td>

                      <td>{item.title}</td>
                      <td>{formatDate(item.date)}</td>
                      <td>{item.description || "-"}</td>

                      <td>
                        <span
                          className={`hol-status ${
                            item.status === "ACTIVE" ? "active" : "inactive"
                          }`}
                        >
                          <span>•</span>
                          {item.status === "ACTIVE" ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td>
                        <div className="hol-actions">
                          <button
                            type="button"
                            className="hol-action"
                            title="Edit"
                            onClick={() => openEdit(item)}
                          >
                            <i className="ti ti-edit"></i>
                          </button>

                          <button
                            type="button"
                            className="hol-action"
                            title="Delete"
                            onClick={() => openDelete(item)}
                          >
                            <i className="ti ti-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="hol-empty" colSpan={6}>
                      No holidays found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="hol-footer">
            <span>
              Showing {showFrom} - {showTo} of {totalRecords} entries
            </span>

            <div className="hol-pagination">
              <button
                className="hol-page-arrow"
                type="button"
                disabled={safePage <= 1}
                onClick={() =>
                  setCurrentPage((prev) => Math.max(1, prev - 1))
                }
              >
                ‹
              </button>

              <span className="hol-page-number">{safePage}</span>

              <button
                className="hol-page-arrow"
                type="button"
                disabled={safePage >= totalPages}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="hol-modal-backdrop">
          <div className="hol-modal">
            <div className="hol-modal-head">
              <h3>Add Holiday</h3>
              <button
                className="hol-close"
                onClick={() => !saving && setShowAddModal(false)}
              >
                ×
              </button>
            </div>

            <div className="hol-modal-body">
              <div className="hol-field">
                <label>Title</label>
                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  placeholder="Enter holiday title"
                />
              </div>

              <div className="hol-field">
                <label>Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm({ ...form, date: e.target.value })
                  }
                />
              </div>

              <div className="hol-field">
                <label>Holiday Type</label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      type: e.target.value as HolidayType,
                    })
                  }
                >
                  <option value="HR">HR Holiday</option>
                  <option value="COMPLIANCE">Compliance Holiday</option>
                </select>
              </div>

              <div className="hol-field">
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>

              <div className="hol-field">
                <label>Status</label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as HolidayStatus,
                    })
                  }
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            <div className="hol-modal-footer">
              <button
                className="hol-btn"
                type="button"
                disabled={saving}
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>

              <button
                className="hol-btn gold"
                type="button"
                disabled={saving}
                onClick={handleAddHoliday}
              >
                {saving ? "Adding..." : "Add Holiday"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="hol-modal-backdrop">
          <div className="hol-modal">
            <div className="hol-modal-head">
              <h3>Edit Holiday</h3>
              <button
                className="hol-close"
                onClick={() => !saving && setShowEditModal(false)}
              >
                ×
              </button>
            </div>

            <div className="hol-modal-body">
              <div className="hol-field">
                <label>Title</label>
                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                />
              </div>

              <div className="hol-field">
                <label>Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm({ ...form, date: e.target.value })
                  }
                />
              </div>

              <div className="hol-field">
                <label>Holiday Type</label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      type: e.target.value as HolidayType,
                    })
                  }
                >
                  <option value="HR">HR Holiday</option>
                  <option value="COMPLIANCE">Compliance Holiday</option>
                </select>
              </div>

              <div className="hol-field">
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>

              <div className="hol-field">
                <label>Status</label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as HolidayStatus,
                    })
                  }
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            <div className="hol-modal-footer">
              <button
                className="hol-btn"
                type="button"
                disabled={saving}
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>

              <button
                className="hol-btn gold"
                type="button"
                disabled={saving}
                onClick={handleSaveEdit}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="hol-modal-backdrop">
          <div className="hol-modal">
            <div className="hol-delete-box">
              <div className="hol-delete-icon">
                <i className="ti ti-trash"></i>
              </div>

              <h3>Confirm Delete</h3>

              <p>
                You want to delete this holiday, this can't be undone once you
                delete.
              </p>

              <div className="hol-delete-actions">
                <button
                  className="hol-btn"
                  type="button"
                  disabled={deleting}
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>

                <button
                  className="hol-btn danger"
                  type="button"
                  disabled={deleting}
                  onClick={handleConfirmDelete}
                >
                  {deleting ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Holidays;

import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2, X } from "lucide-react";

import {
  addLeaveType,
  deleteLeaveType,
  getAllLeaveTypes,
  getLeaveTypeById,
  updateLeaveType,
} from "../../services/hrservices";

type LeaveStatus = "Active" | "Inactive";

type LeaveTypeItem = {
  id: string;
  type: string;
  days: number;
  status: LeaveStatus;
};

const initialLeaveTypes: LeaveTypeItem[] = [];

const LeaveType: React.FC = () => {
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeItem[]>(initialLeaveTypes);
  const [selected, setSelected] = useState<string[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortBy, setSortBy] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [editingItem, setEditingItem] = useState<LeaveTypeItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<LeaveTypeItem | null>(null);

  const [form, setForm] = useState({
    type: "",
    days: "",
    status: "Active" as LeaveStatus,
  });

  const getErrorMessage = (error: any, fallback: string) => {
    const backendErrors = error?.response?.data?.errors;

    if (backendErrors) {
      return Object.entries(backendErrors)
        .map(([field, messages]) =>
          `${field}: ${
            Array.isArray(messages)
              ? messages.join(", ")
              : String(messages)
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

  const getArrayFromResponse = (response: any): any[] => {
    const directCandidates = [
      response,
      response?.data,
      response?.leaveTypes,
      response?.LeaveTypes,
      response?.leaveType,
      response?.LeaveType,
      response?.leaveTypeList,
      response?.LeaveTypeList,
      response?.data?.leaveTypes,
      response?.data?.LeaveTypes,
      response?.data?.leaveType,
      response?.data?.LeaveType,
      response?.data?.leaveTypeList,
      response?.data?.LeaveTypeList,
      response?.items,
      response?.Items,
      response?.data?.items,
      response?.data?.Items,
      response?.records,
      response?.Records,
      response?.data?.records,
      response?.data?.Records,
      response?.result,
      response?.Result,
      response?.data?.result,
      response?.data?.Result,
      response?.data?.data,
    ];

    for (const candidate of directCandidates) {
      if (Array.isArray(candidate)) {
        return candidate;
      }
    }

    const findFirstArray = (value: any, depth = 0): any[] => {
      if (!value || depth > 5) {
        return [];
      }

      if (Array.isArray(value)) {
        return value;
      }

      if (typeof value !== "object") {
        return [];
      }

      for (const key of Object.keys(value)) {
        const nested = value[key];

        if (Array.isArray(nested)) {
          return nested;
        }

        if (nested && typeof nested === "object") {
          const found = findFirstArray(nested, depth + 1);
          if (found.length > 0) {
            return found;
          }
        }
      }

      return [];
    };

    return findFirstArray(response);
  };

  const getTotalFromResponse = (
    response: any,
    fallback: number
  ) => {
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
      response?.data?.data?.totalRecords,
      response?.data?.data?.TotalRecords,
      response?.data?.data?.totalCount,
      response?.data?.data?.TotalCount,
    ];

    for (const value of candidates) {
      const parsed = Number(value);

      if (Number.isFinite(parsed) && parsed >= 0) {
        return parsed;
      }
    }

    return fallback;
  };

  const mapLeaveType = (item: any): LeaveTypeItem => {
    const isActive =
      item?.isActive ??
      item?.IsActive ??
      item?.status ??
      item?.Status ??
      true;

    const rawId =
      item?.id ??
      item?.Id ??
      item?.leaveTypeId ??
      item?.LeaveTypeId ??
      item?.leaveId ??
      item?.LeaveId ??
      "";

    const rawName =
      item?.leaveName ??
      item?.LeaveName ??
      item?.leaveTypeName ??
      item?.LeaveTypeName ??
      item?.name ??
      item?.Name ??
      item?.type ??
      item?.Type ??
      "";

    const rawDays =
      item?.leaveDays ??
      item?.LeaveDays ??
      item?.days ??
      item?.Days ??
      item?.numberOfDays ??
      item?.NumberOfDays ??
      0;

    return {
      id: String(rawId || ""),
      type: String(rawName || ""),
      days: Number(rawDays || 0),
      status:
        isActive === false ||
        isActive === 0 ||
        String(isActive).toLowerCase() === "inactive" ||
        String(isActive).toLowerCase() === "false"
          ? "Inactive"
          : "Active",
    };
  };

  const fetchLeaveTypes = async () => {
    try {
      setLoading(true);

      const response = await getAllLeaveTypes({
        search: search.trim(),
        pageNumber: currentPage,
        pageSize: rowsPerPage,
        sortBy,
      });

      console.log("GET ALL LEAVE TYPE RESPONSE:", response);
      console.log("GET ALL LEAVE TYPE DATA:", response?.data);

      const raw = getArrayFromResponse(response);

      console.log("RAW LEAVE TYPES:", raw);

      const formatted = raw
        .map(mapLeaveType)
        .filter(
          (item) =>
            Boolean(item.id) &&
            Boolean(item.type)
        );

      console.log(
        "FORMATTED LEAVE TYPES:",
        formatted
      );

      setLeaveTypes(formatted);
      setTotalRecords(getTotalFromResponse(response, formatted.length));
    } catch (error: any) {
      console.error("GET ALL LEAVE TYPE ERROR:", error);
      console.error("GET ALL LEAVE TYPE STATUS:", error?.response?.status);
      console.error("GET ALL LEAVE TYPE BACKEND:", error?.response?.data);
      console.error(
        "GET ALL LEAVE TYPE VALIDATION ERRORS:",
        JSON.stringify(error?.response?.data?.errors ?? {}, null, 2)
      );
      setLeaveTypes([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(
      () => fetchLeaveTypes(),
      search ? 400 : 0
    );

    return () => window.clearTimeout(timer);
  }, [search, currentPage, rowsPerPage, sortBy]);

  const filteredRows = useMemo(() => leaveTypes, [leaveTypes]);
  const visibleRows = filteredRows;

  const allSelected =
    visibleRows.length > 0 &&
    visibleRows.every((item) => selected.includes(item.id));

  const handleSelectAll = (checked: boolean) => {
    const ids = visibleRows.map((item) => item.id);

    if (checked) {
      setSelected((prev) => Array.from(new Set([...prev, ...ids])));
    } else {
      setSelected((prev) => prev.filter((id) => !ids.includes(id)));
    }
  };

  const handleSelect = (id: string, checked: boolean) => {
    setSelected((prev) =>
      checked
        ? prev.includes(id)
          ? prev
          : [...prev, id]
        : prev.filter((x) => x !== id)
    );
  };

  const openAddModal = () => {
    setForm({
      type: "",
      days: "",
      status: "Active",
    });
    setShowAddModal(true);
  };

  const handleAdd = async () => {
    if (!form.type.trim() || !form.days.trim()) {
      alert("Please fill all required fields");
      return;
    }

    const leaveDays = Number(form.days);

    if (!Number.isFinite(leaveDays) || leaveDays <= 0) {
      alert("Number of days must be greater than 0");
      return;
    }

    try {
      setSaving(true);

      const response = await addLeaveType({
        leaveName: form.type.trim(),
        leaveDays,
      });

      if (response?.isSuccess === false || response?.statusCode >= 400) {
        alert(response?.message || "Unable to add leave type");
        return;
      }

      alert(response?.message || "Leave type added successfully");
      setShowAddModal(false);
      setCurrentPage(1);
      await fetchLeaveTypes();
    } catch (error: any) {
      console.error("ADD LEAVE TYPE ERROR:", error);
      alert(getErrorMessage(error, "Unable to add leave type"));
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = async (item: LeaveTypeItem) => {
    try {
      setEditingItem(item);

      const response = await getLeaveTypeById(item.id);
      console.log("GET LEAVE TYPE BY ID RESPONSE:", response);

      const raw =
        response?.data?.data ??
        response?.data ??
        response;

      const fullItem = mapLeaveType(raw);

      setForm({
        type: fullItem.type || item.type,
        days: String(fullItem.days || item.days),
        status: fullItem.status || item.status,
      });

      setShowEditModal(true);
    } catch (error: any) {
      console.error("GET LEAVE TYPE BY ID ERROR:", error);

      setForm({
        type: item.type,
        days: String(item.days),
        status: item.status,
      });

      setShowEditModal(true);
    }
  };

  const handleEditSave = async () => {
    if (!editingItem || !form.type.trim() || !form.days.trim()) {
      alert("Please fill all required fields");
      return;
    }

    const leaveDays = Number(form.days);

    if (!Number.isFinite(leaveDays) || leaveDays <= 0) {
      alert("Number of days must be greater than 0");
      return;
    }

    try {
      setSaving(true);

      const response = await updateLeaveType({
        id: editingItem.id,
        leaveName: form.type.trim(),
        leaveDays,
        isActive: form.status === "Active",
      });

      if (response?.isSuccess === false || response?.statusCode >= 400) {
        alert(response?.message || "Unable to update leave type");
        return;
      }

      alert(response?.message || "Leave type updated successfully");
      setShowEditModal(false);
      setEditingItem(null);
      await fetchLeaveTypes();
    } catch (error: any) {
      console.error("UPDATE LEAVE TYPE ERROR:", error);
      alert(getErrorMessage(error, "Unable to update leave type"));
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (item: LeaveTypeItem) => {
    setDeletingItem(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;

    try {
      setDeleting(true);

      const response = await deleteLeaveType(deletingItem.id);

      if (response?.isSuccess === false || response?.statusCode >= 400) {
        alert(response?.message || "Unable to delete leave type");
        return;
      }

      alert(response?.message || "Leave type deleted successfully");

      setSelected((prev) =>
        prev.filter((id) => id !== deletingItem.id)
      );

      setShowDeleteModal(false);
      setDeletingItem(null);

      if (leaveTypes.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        await fetchLeaveTypes();
      }
    } catch (error: any) {
      console.error("DELETE LEAVE TYPE ERROR:", error);
      alert(getErrorMessage(error, "Unable to delete leave type"));
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.max(
    1,
    Math.ceil(totalRecords / rowsPerPage)
  );

  const safePage = Math.min(currentPage, totalPages);

  const showFrom =
    totalRecords === 0
      ? 0
      : (safePage - 1) * rowsPerPage + 1;

  const showTo = Math.min(
    safePage * rowsPerPage,
    totalRecords
  );

  return (
    <>
      <style>{`
        .lt-page{
          min-height:100vh;
          background:#f6f7f9;
          padding:24px 24px 32px;
          font-family:Inter,Arial,sans-serif;
          color:#172442;
        }

        .lt-header{
          display:flex;
          justify-content:space-between;
          align-items:flex-start;
          margin-bottom:28px;
        }

        .lt-title{
          margin:0;
          font-size:25px;
          line-height:1.2;
          font-weight:700;
          color:#172442;
        }

        .lt-breadcrumb{
          display:flex;
          align-items:center;
          gap:9px;
          margin-top:8px;
          font-size:12px;
          color:#59697e;
        }

        .lt-breadcrumb a{
          color:#59697e;
          text-decoration:none;
        }

        .lt-add-btn{
          height:40px;
          padding:0 16px;
          border:0;
          border-radius:6px;
          background:#c18d2f;
          color:#fff;
          font-size:14px;
          font-weight:600;
          display:flex;
          align-items:center;
          gap:8px;
          cursor:pointer;
        }

        .lt-card{
          background:#fff;
          border:1px solid #dde2e8;
          border-radius:6px;
          overflow:hidden;
          box-shadow:0 1px 2px rgba(16,24,40,.03);
        }

        .lt-card-title{
          height:52px;
          padding:0 20px;
          display:flex;
          align-items:center;
          border-bottom:1px solid #e2e5ea;
          font-size:15px;
          font-weight:700;
          color:#172442;
        }

        .lt-toolbar{
          height:62px;
          padding:0 16px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          border-bottom:1px solid #e4e7ec;
        }

        .lt-entries{
          display:flex;
          align-items:center;
          gap:8px;
          font-size:13px;
          color:#344054;
        }

        .lt-entries select{
          width:49px;
          height:31px;
          border:1px solid #d8dee6;
          border-radius:6px;
          background:#fff;
          padding:0 6px;
          outline:none;
          color:#1f2b43;
        }

        .lt-search{
          width:160px;
          height:31px;
          border:1px solid #d8dee6;
          border-radius:6px;
          padding:0 12px;
          font-size:13px;
          outline:none;
        }

        .lt-table-wrap{
          width:100%;
          overflow:hidden;
        }

        .lt-table{
          width:100%;
          border-collapse:collapse;
          table-layout:fixed;
        }

        .lt-table th{
          height:43px;
          background:#e3e6ea;
          color:#0f172a;
          font-size:13px;
          font-weight:700;
          text-align:left;
          padding:0 12px;
          border-bottom:1px solid #dbe0e6;
          vertical-align:middle;
        }

        .lt-table td{
          height:47px;
          padding:0 12px;
          border-bottom:1px solid #e3e6eb;
          font-size:13px;
          color:#627087;
          vertical-align:middle;
        }

        .lt-table th:nth-child(1),
        .lt-table td:nth-child(1){
          width:7%;
          text-align:center;
        }

        .lt-table th:nth-child(2),
        .lt-table td:nth-child(2){
          width:26%;
        }

        .lt-table th:nth-child(3),
        .lt-table td:nth-child(3){
          width:23%;
        }

        .lt-table th:nth-child(4),
        .lt-table td:nth-child(4){
          width:21%;
        }

        .lt-table th:nth-child(5),
        .lt-table td:nth-child(5){
          width:23%;
          text-align:center;
        }

        .lt-table td:nth-child(2){
          color:#101828;
          font-weight:500;
        }

        .lt-table input[type="checkbox"]{
          width:18px;
          height:18px;
          accent-color:#c18d2f;
          cursor:pointer;
        }

        .lt-sort{
          float:right;
          color:#cbd1d9;
          font-size:12px;
        }

        .lt-status{
          display:inline-flex;
          align-items:center;
          gap:5px;
          padding:3px 10px;
          border-radius:4px;
          font-size:12px;
          font-weight:600;
        }

        .lt-status.active{
          background:#08c95f;
          color:#fff;
        }

        .lt-status.inactive{
          background:#ef1717;
          color:#fff;
        }

        .lt-actions{
          display:flex;
          align-items:center;
          justify-content:center;
          gap:12px;
        }

        .lt-action-btn{
          border:0;
          background:transparent;
          color:#5f6f84;
          padding:0;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          cursor:pointer;
        }

        .lt-footer{
          height:57px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          padding:0 16px;
          font-size:13px;
          color:#607087;
          background:#fff;
        }

        .lt-pagination{
          display:flex;
          align-items:center;
          gap:18px;
        }

        .lt-arrow{
          border:0;
          background:transparent;
          color:#a8b0bb;
          font-size:18px;
          padding:0;
        }

        .lt-page-no{
          width:27px;
          height:27px;
          border-radius:50%;
          background:#c18d2f;
          color:#fff;
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:12px;
        }

        .lt-overlay{
          position:fixed;
          inset:0;
          z-index:9999;
          background:rgba(0,0,0,.45);
          display:flex;
          align-items:center;
          justify-content:center;
          padding:20px;
        }

        .lt-modal{
          width:min(500px,94vw);
          background:#fff;
          border-radius:6px;
          overflow:hidden;
          box-shadow:0 20px 60px rgba(0,0,0,.24);
        }

        .lt-modal-head{
          height:64px;
          padding:0 16px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          border-bottom:1px solid #e4e7ec;
        }

        .lt-modal-head h3{
          margin:0;
          font-size:22px;
          font-weight:700;
          color:#22304f;
        }

        .lt-close{
          width:20px;
          height:20px;
          border-radius:50%;
          border:0;
          background:#7c8491;
          color:#fff;
          display:flex;
          align-items:center;
          justify-content:center;
          cursor:pointer;
          padding:0;
        }

        .lt-modal-body{
          padding:18px 16px 16px;
        }

        .lt-field{
          margin-bottom:18px;
        }

        .lt-field:last-child{
          margin-bottom:0;
        }

        .lt-field label{
          display:block;
          margin-bottom:8px;
          font-size:14px;
          color:#293754;
        }

        .lt-field label span{
          color:#ef4444;
        }

        .lt-field input,
        .lt-field select{
          width:100%;
          height:38px;
          border:1px solid #d8dee6;
          border-radius:5px;
          background:#fff;
          padding:0 10px;
          outline:none;
          font-size:14px;
          color:#253354;
        }

        .lt-modal-footer{
          padding:12px 14px;
          border-top:1px solid #e5e7eb;
          display:flex;
          justify-content:flex-end;
          gap:8px;
        }

        .lt-btn{
          height:39px;
          border-radius:6px;
          border:0;
          padding:0 16px;
          font-size:14px;
          font-weight:500;
          cursor:pointer;
        }

        .lt-btn.light{
          background:#f6f7f9;
          color:#111827;
        }

        .lt-btn.gold{
          background:#c18d2f;
          color:#fff;
        }

        .lt-delete-modal{
          width:min(400px,92vw);
        }

        .lt-delete-body{
          text-align:center;
          padding:17px 28px 15px;
        }

        .lt-delete-icon{
          width:58px;
          height:58px;
          margin:0 auto 15px;
          border-radius:4px;
          background:#fde1e1;
          color:#ef1717;
          display:flex;
          align-items:center;
          justify-content:center;
        }

        .lt-delete-body h3{
          margin:0 0 8px;
          font-size:21px;
          color:#22304f;
          font-weight:700;
        }

        .lt-delete-body p{
          margin:0 auto 18px;
          max-width:335px;
          color:#374151;
          line-height:1.5;
          font-size:14px;
        }

        .lt-delete-actions{
          display:flex;
          justify-content:center;
          gap:16px;
        }

        .lt-btn.danger{
          background:#ef1717;
          color:#fff;
        }

        @media(max-width:700px){
          .lt-page{padding:18px 12px}
          .lt-toolbar{gap:10px;align-items:stretch;flex-direction:column;height:auto;padding:12px}
          .lt-search{width:100%}
          .lt-table th,.lt-table td{font-size:12px;padding:0 8px}
        }
      `}</style>

      <div className="lt-page">
        <div className="lt-header">
          <div>
            <h1 className="lt-title">Leave Type</h1>

            <div className="lt-breadcrumb">
              <Link to="/Hr/HrDashboard">
                <i className="ti ti-smart-home"></i>
              </Link>
              <span>/</span>
              <span>Leave Type</span>
            </div>
          </div>

          <button
            className="lt-add-btn"
            type="button"
            onClick={openAddModal}
          >
            <span>+</span>
            Add Leave Type
          </button>
        </div>

        <div className="lt-card">
          <div className="lt-card-title">Leave Type</div>

          <div className="lt-toolbar">
            <div className="lt-entries">
              <span>Row Per Page</span>

              <select
                value={rowsPerPage}
                onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={40}>40</option>
              </select>

              <span>Entries</span>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <select
                className="lt-search"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Sort By</option>
                <option value="name">Name</option>
                <option value="days">Days</option>
              </select>

              <input
                className="lt-search"
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>

          <div className="lt-table-wrap">
            <table className="lt-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>

                  <th>
                    Leave Type
                    <span className="lt-sort">↕</span>
                  </th>

                  <th>
                    Leave Days
                    <span className="lt-sort">↕</span>
                  </th>

                  <th>
                    Status
                    <span className="lt-sort">↕</span>
                  </th>

                  <th>
                    <span className="lt-sort">↕</span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", height: 70 }}>
                      Loading leave types...
                    </td>
                  </tr>
                ) : visibleRows.length > 0 ? (
                  visibleRows.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.includes(item.id)}
                        onChange={(e) =>
                          handleSelect(item.id, e.target.checked)
                        }
                      />
                    </td>

                    <td>{item.type}</td>

                    <td>{item.days}</td>

                    <td>
                      <span
                        className={`lt-status ${
                          item.status === "Active"
                            ? "active"
                            : "inactive"
                        }`}
                      >
                        <span>•</span>
                        {item.status}
                      </span>
                    </td>

                    <td>
                      <div className="lt-actions">
                        <button
                          type="button"
                          className="lt-action-btn"
                          onClick={() => openEditModal(item)}
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          type="button"
                          className="lt-action-btn"
                          onClick={() => openDeleteModal(item)}
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", height: 70 }}>
                      No leave types found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="lt-footer">
            <span>
              Showing {showFrom} - {showTo} of{" "}
              {totalRecords} entries
            </span>

            <div className="lt-pagination">
              <button
                className="lt-arrow"
                type="button"
                disabled={safePage <= 1}
                onClick={() =>
                  setCurrentPage((prev) => Math.max(1, prev - 1))
                }
              >
                ‹
              </button>

              <span className="lt-page-no">{safePage}</span>

              <button
                className="lt-arrow"
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
        <div className="lt-overlay">
          <div className="lt-modal">
            <div className="lt-modal-head">
              <h3>Add Leave Type</h3>

              <button
                className="lt-close"
                type="button"
                disabled={saving} onClick={() => setShowAddModal(false)}
              >
                <X size={14} />
              </button>
            </div>

            <div className="lt-modal-body">
              <div className="lt-field">
                <label>
                  Leave Type <span>*</span>
                </label>

                <input
                  type="text"
                  value={form.type}
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value })
                  }
                />
              </div>

              <div className="lt-field">
                <label>
                  Number of days <span>*</span>
                </label>

                <input
                  type="number"
                  value={form.days}
                  onChange={(e) =>
                    setForm({ ...form, days: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="lt-modal-footer">
              <button
                className="lt-btn light"
                type="button"
                disabled={saving} onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>

              <button
                className="lt-btn gold"
                type="button"
                disabled={saving} onClick={handleAdd}
              >
                Add Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingItem && (
        <div className="lt-overlay">
          <div className="lt-modal">
            <div className="lt-modal-head">
              <h3>Edit Leave Type</h3>

              <button
                className="lt-close"
                type="button"
                disabled={saving} onClick={() => setShowEditModal(false)}
              >
                <X size={14} />
              </button>
            </div>

            <div className="lt-modal-body">
              <div className="lt-field">
                <label>
                  Leave Type <span>*</span>
                </label>

                <input
                  type="text"
                  value={form.type}
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value })
                  }
                />
              </div>

              <div className="lt-field">
                <label>
                  Number of days <span>*</span>
                </label>

                <input
                  type="number"
                  value={form.days}
                  onChange={(e) =>
                    setForm({ ...form, days: e.target.value })
                  }
                />
              </div>

              <div className="lt-field">
                <label>Status</label>

                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as LeaveStatus,
                    })
                  }
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="lt-modal-footer">
              <button
                className="lt-btn light"
                type="button"
                disabled={saving} onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>

              <button
                className="lt-btn gold"
                type="button"
                disabled={saving} onClick={handleEditSave}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && deletingItem && (
        <div className="lt-overlay">
          <div className="lt-modal lt-delete-modal">
            <div className="lt-delete-body">
              <div className="lt-delete-icon">
                <Trash2 size={30} />
              </div>

              <h3>Confirm Delete</h3>

              <p>
                You want to delete all the marked items, this cant be
                undone once you delete.
              </p>

              <div className="lt-delete-actions">
                <button
                  className="lt-btn light"
                  type="button"
                  disabled={deleting} onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>

                <button
                  className="lt-btn danger"
                  type="button"
                  disabled={deleting} onClick={confirmDelete}
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LeaveType;

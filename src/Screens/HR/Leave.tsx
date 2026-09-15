import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  MessageSquareMore,
  Pencil,
  Trash2,
  CircleUserRound,
  Info,
  X,
  Send,
} from "lucide-react";

import {
  getAllLeaves,
  addLeave,
  updateLeave,
  updateLeaveStatus,
  deleteLeave,
  getAllEmployees,
  getAllLeaveTypes,
  getLeaveChatMessages,
  sendLeaveChatMessage,
  deleteLeaveChatMessage,
} from "../../services/hrservices";

/* =====================================================
   TYPES
===================================================== */

type LeaveStatus = "Approved" | "Declined" | "New";

type LeaveItem = {
  id: string;
  userId: string;
  name: string;
  role: string;
  leaveTypeMasterId: string;
  type: string; // leave type name, e.g. "Medical Leave"
  from: string; // formatted display date
  to: string; // formatted display date
  fromRaw: string; // raw ISO date, needed to re-open edit form / re-send to API
  toRaw: string;
  days: string; // formatted "X Day(s)" for display
  availType: number; // 1 = Full Day, 2 = First Half, 3 = Second Half (confirm with backend)
  status: LeaveStatus;
  statusCode: number; // raw numeric status from API
  reason?: string;
};

type EmployeeOption = {
  id: string;
  name: string;
  role: string;
};

type LeaveTypeOption = {
  id: string;
  name: string;
};

type ChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  sentAt: string;
  mine: boolean;
};

/* =====================================================
   STATUS + AVAIL TYPE MAPPING
   NOTE: Confirm these numeric codes match your backend's
   enum values for Status and AvailType. Adjust as needed.
===================================================== */

// Confirmed from real API response: status 1 => statusName "Pending", status 2 => statusName "Approved".
// Declined wasn't present in the sample payloads — 3 is a best guess, confirm with backend/Swagger.
const STATUS_CODE_TO_LABEL: Record<number, LeaveStatus> = {
  1: "New", // "Pending" in API terms, shown as "New" in this UI
  2: "Approved",
  3: "Declined",
};

const STATUS_LABEL_TO_CODE: Record<LeaveStatus, number> = {
  New: 1,
  Approved: 2,
  Declined: 3,
};

// Maps directly off statusName when available, since it's more reliable than guessing codes.
const STATUS_NAME_TO_LABEL: Record<string, LeaveStatus> = {
  Pending: "New",
  New: "New",
  Approved: "Approved",
  Declined: "Declined",
  Rejected: "Declined",
};

// ⚠️ UNVERIFIED — "1 = Full Day" is confirmed from a real GET /get-all-leave record
// ("availType": 1, "availTypeName": "Full Day"). The values 2 and 3 for First/Second
// Half are guesses and are the likely cause of the "AvailType is invalid" error on
// add-leave. Check the /add-leave Swagger schema (or the AvailType enum definition)
// for the real values and update both maps below to match.
const AVAIL_TYPE_TO_LABEL: Record<number, string> = {
  1: "Full Day",
  2: "First Half",
  3: "Second Half",
};

const AVAIL_LABEL_TO_TYPE: Record<string, number> = {
  "Full Day": 1,
  "First Half": 2,
  "Second Half": 3,
};

/* =====================================================
   HELPERS
===================================================== */

// Pull a field off an API object trying several common casings,
// since the exact response shape from get-all-leave isn't confirmed.
const pick = (obj: any, ...keys: string[]) => {
  for (const k of keys) {
    if (obj?.[k] !== undefined && obj?.[k] !== null) return obj[k];
  }
  return undefined;
};

const formatDisplayDate = (raw?: string) => {
  if (!raw) return "-";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const toInputDate = (raw?: string) => {
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10); // yyyy-mm-dd for <input type="date">
};

const calcDaysLabel = (fromRaw?: string, toRaw?: string, fallback?: number) => {
  if (fromRaw && toRaw) {
    const f = new Date(fromRaw);
    const t = new Date(toRaw);
    if (!Number.isNaN(f.getTime()) && !Number.isNaN(t.getTime()) && t >= f) {
      const diff = Math.floor((t.getTime() - f.getTime()) / 86400000) + 1;
      return `${diff} ${diff === 1 ? "Day" : "Days"}`;
    }
  }
  if (fallback !== undefined) {
    return `${fallback} ${fallback === 1 ? "Day" : "Days"}`;
  }
  return "-";
};

// Normalizes one raw API leave record (from GET /get-all-leave) into the shape the UI uses.
const mapApiLeave = (raw: any): LeaveItem => {
  const id = String(pick(raw, "id", "Id", "leaveId", "LeaveId"));
  const userId = String(pick(raw, "userId", "UserId") ?? "");
  const name = pick(raw, "employeeName", "EmployeeName", "userName", "name") ?? "Unknown";
  const role =
    pick(raw, "designationName", "DesignationName", "designation", "role") ??
    pick(raw, "departmentName", "DepartmentName") ??
    "-";
  const leaveTypeMasterId = String(pick(raw, "leaveTypeMasterId", "LeaveTypeMasterId") ?? "");
  const type = pick(raw, "leaveName", "LeaveName", "leaveTypeName", "leaveType") ?? "-";
  const fromRaw = pick(raw, "fromDate", "FromDate");
  const toRaw = pick(raw, "toDate", "ToDate");
  const noOfDays = pick(raw, "noOfDays", "NoOfDays", "totalDays", "TotalDays");
  const availType = Number(pick(raw, "availType", "AvailType") ?? 1);
  const statusCode = Number(pick(raw, "status", "Status") ?? 1);
  const statusName = pick(raw, "statusName", "StatusName");
  const reason = pick(raw, "reason", "Reason") ?? "";

  return {
    id,
    userId,
    name,
    role,
    leaveTypeMasterId,
    type,
    from: formatDisplayDate(fromRaw),
    to: formatDisplayDate(toRaw),
    fromRaw: fromRaw ?? "",
    toRaw: toRaw ?? "",
    days: calcDaysLabel(fromRaw, toRaw, noOfDays),
    availType,
    // Prefer the human-readable statusName from the API when present; fall back to the numeric code map.
    status: (statusName && STATUS_NAME_TO_LABEL[statusName]) || STATUS_CODE_TO_LABEL[statusCode] || "New",
    statusCode,
    reason,
  };
};

// TODO: point this at however you actually store the logged-in user's id (auth context, redux, etc.)
const getCurrentUserId = () => localStorage.getItem("userId") || "";

// Normalizes one raw chat message from GET /api/LeaveChat/{leaveId}.
// Response shape isn't confirmed — adjust the pick() keys once you see the real payload.
const mapChatMessage = (raw: any): ChatMessage => {
  const currentUserId = getCurrentUserId();
  const senderId = String(pick(raw, "senderId", "SenderId", "userId", "UserId") ?? "");
  return {
    id: String(pick(raw, "id", "Id", "messageId", "MessageId")),
    senderId,
    senderName: pick(raw, "senderName", "SenderName", "userName", "UserName") ?? "User",
    message: pick(raw, "message", "Message") ?? "",
    sentAt: pick(raw, "sentAt", "SentAt", "createdAt", "CreatedAt") ?? "",
    mine: !!currentUserId && senderId === currentUserId,
  };
};

const formatChatTime = (raw?: string) => {
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

/* =====================================================
   COMPONENT
===================================================== */

const Leaves: React.FC = () => {
  const [leaveData, setLeaveData] = useState<LeaveItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeOption[]>([]);

  const [selected, setSelected] = useState<string[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [sortBy, setSortBy] = useState("7");

  const [activeLeave, setActiveLeave] = useState<LeaveItem | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [addForm, setAddForm] = useState({
    employeeId: "",
    leaveTypeMasterId: "",
    from: "",
    to: "",
    availTypeLabel: "",
    days: "",
    reason: "",
  });

  const [editForm, setEditForm] = useState({
    employeeId: "",
    leaveTypeMasterId: "",
    from: "",
    to: "",
    availTypeLabel: "",
    days: "",
    reason: "",
  });

  /* -------------------------------------------------
     DATA FETCHING
  ------------------------------------------------- */

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await getAllLeaves({
        Search: search || undefined,
        SortDirection: sortBy === "name" ? "asc" : undefined,
        SortBy: sortBy === "name" ? "userName" : undefined,
        PageNumber: 1,
        PageSize: rowsPerPage,
      });

      // Confirmed shape: { statusCode, message, data: { items: [...], pageNumber, ... }, isSuccess }
      const rawList: any[] =
        pick(res, "data")?.items ??
        pick(res, "Data")?.Items ??
        pick(res, "data", "Data", "items", "Items") ??
        res ??
        [];
      setLeaveData(rawList.map(mapApiLeave));
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to load leaves.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowsPerPage, sortBy]);

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await getAllEmployees({ PageSize: 500 });
      // Confirmed shape: { data: { employees: [...], designations: [...], summary: {...} } }
      const rawList: any[] =
        pick(res, "data")?.employees ??
        pick(res, "data", "Data", "items", "Items") ??
        res ??
        [];
      setEmployees(
        rawList.map((e) => ({
          id: String(pick(e, "id", "Id", "userId", "UserId")),
          name:
            pick(e, "fullName", "FullName") ||
            `${pick(e, "firstName", "FirstName") ?? ""} ${pick(e, "lastName", "LastName") ?? ""}`.trim(),
          role: pick(e, "designation", "designationName", "DesignationName", "Designation") ?? "Employee",
        }))
      );
    } catch {
      // Non-fatal: Add/Edit employee dropdown will just be empty.
    }
  }, []);

  const fetchLeaveTypes = useCallback(async () => {
    try {
      const res = await getAllLeaveTypes({ pageSize: 100 });
      // Same wrapper pattern as get-all-leave: { data: { items: [...] } }.
      // Falls back to a flatter shape in case the API doesn't nest it that way.
      const rawList: any[] =
        pick(res, "data")?.items ??
        pick(res, "Data")?.Items ??
        pick(res, "data", "Data", "items", "Items") ??
        res ??
        [];
      setLeaveTypes(
        rawList.map((t) => ({
          id: String(pick(t, "id", "Id", "leaveTypeMasterId", "LeaveTypeMasterId")),
          name: pick(t, "leaveName", "LeaveName", "leaveTypeName", "LeaveTypeName") ?? "Leave",
        }))
      );
    } catch (err: any) {
      // Non-fatal: Add/Edit leave-type dropdown will just be empty.
      console.error("Failed to load leave types:", err?.message || err);
    }
  }, []);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  useEffect(() => {
    fetchEmployees();
    fetchLeaveTypes();
  }, [fetchEmployees, fetchLeaveTypes]);

  /* -------------------------------------------------
     DERIVED / FILTERED ROWS
  ------------------------------------------------- */

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = leaveData.filter((item) => {
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.role.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q);

      const matchesType = !leaveType || item.type === leaveType;
      return matchesSearch && matchesType;
    });

    if (sortBy === "name") {
      rows = [...rows].sort((a, b) => a.name.localeCompare(b.name));
    }
    return rows;
  }, [leaveData, search, leaveType, sortBy]);

  const visibleRows = filteredRows.slice(0, rowsPerPage);

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

  const statusClass = (status: LeaveStatus) => {
    if (status === "Approved") return "approved";
    if (status === "Declined") return "declined";
    return "new";
  };

  /* -------------------------------------------------
     STATUS UPDATE (approve / decline / new)
  ------------------------------------------------- */

  const updateStatus = async (item: LeaveItem, status: LeaveStatus) => {
    // Optimistic UI update
    setLeaveData((prev) =>
      prev.map((x) => (x.id === item.id ? { ...x, status, statusCode: STATUS_LABEL_TO_CODE[status] } : x))
    );

    // TODO: replace with however you actually identify the logged-in reviewer.
    const reviewedByUserId = localStorage.getItem("userId") || "";

    try {
      await updateLeaveStatus(item.id, reviewedByUserId, {
        status: STATUS_LABEL_TO_CODE[status],
        remarks: "",
      });
    } catch (err: any) {
      // Roll back on failure
      setLeaveData((prev) =>
        prev.map((x) => (x.id === item.id ? { ...x, status: item.status, statusCode: item.statusCode } : x))
      );
      alert(err?.message || "Failed to update leave status.");
    }
  };

  /* -------------------------------------------------
     ADD LEAVE
  ------------------------------------------------- */

  const openAdd = () => {
    setAddForm({
      employeeId: "",
      leaveTypeMasterId: "",
      from: "",
      to: "",
      availTypeLabel: "",
      days: "",
      reason: "",
    });
    setAddOpen(true);
  };

  const closeAdd = () => setAddOpen(false);

  const handleAddFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setAddForm((prev) => {
      const next = { ...prev, [name]: value };

      if ((name === "from" || name === "to") && next.from && next.to) {
        const fromDate = new Date(`${next.from}T00:00:00`);
        const toDate = new Date(`${next.to}T00:00:00`);

        if (!Number.isNaN(fromDate.getTime()) && !Number.isNaN(toDate.getTime()) && toDate >= fromDate) {
          const diff = Math.floor((toDate.getTime() - fromDate.getTime()) / 86400000) + 1;
          next.days = String(diff);
        } else {
          next.days = "";
        }
      }

      return next;
    });
  };

  const handleAddLeave = async () => {
    if (
      !addForm.employeeId ||
      !addForm.leaveTypeMasterId ||
      !addForm.from ||
      !addForm.to ||
      !addForm.availTypeLabel ||
      !addForm.reason.trim()
    ) {
      alert("Please fill all required fields, including Reason.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        UserId: addForm.employeeId,
        LeaveTypeMasterId: addForm.leaveTypeMasterId,
        FromDate: addForm.from,
        ToDate: addForm.to,
        AvailType: AVAIL_LABEL_TO_TYPE[addForm.availTypeLabel] ?? 1,
        Reason: addForm.reason.trim(),
      };
      // Leave this in while you're confirming the AvailType enum against Swagger.
      console.log("ADD LEAVE PAYLOAD:", payload);
      await addLeave(payload);
      setAddOpen(false);
      await fetchLeaves();
    } catch (err: any) {
      alert(err?.message || "Failed to add leave.");
    } finally {
      setSaving(false);
    }
  };

  /* -------------------------------------------------
     VIEW
  ------------------------------------------------- */

  const openView = (item: LeaveItem) => {
    setActiveLeave(item);
    setViewOpen(true);
  };

  /* -------------------------------------------------
     CHAT
     GET    /api/LeaveChat/{leaveId}
     POST   /api/LeaveChat/{leaveId}/send        { message }
     DELETE /api/LeaveChat/message/{messageId}
  ------------------------------------------------- */

  const fetchChatMessages = useCallback(async (leaveId: string) => {
    setChatLoading(true);
    setChatError(null);
    try {
      const res = await getLeaveChatMessages(leaveId);
      // TODO: confirm actual wrapper shape once you see a real response — adjust the pick() path if needed.
      const rawList: any[] =
        pick(res, "data")?.items ??
        pick(res, "data")?.messages ??
        pick(res, "data", "Data", "items", "Items", "messages", "Messages") ??
        res ??
        [];
      setChatMessages(rawList.map(mapChatMessage));
    } catch (err: any) {
      setChatError(err?.message || "Failed to load chat messages.");
    } finally {
      setChatLoading(false);
    }
  }, []);

  const openChat = (item: LeaveItem) => {
    setActiveLeave(item);
    setChatMessages([]);
    setChatInput("");
    setChatOpen(true);
    fetchChatMessages(item.id);
  };

  const handleSendChatMessage = async () => {
    const text = chatInput.trim();
    if (!text || !activeLeave || chatSending) return;

    setChatSending(true);
    setChatError(null);
    try {
      await sendLeaveChatMessage(activeLeave.id, { message: text });
      setChatInput("");
      await fetchChatMessages(activeLeave.id);
    } catch (err: any) {
      setChatError(err?.message || "Failed to send message.");
    } finally {
      setChatSending(false);
    }
  };

  const handleChatKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendChatMessage();
    }
  };

  const handleDeleteChatMessage = async (messageId: string) => {
    if (!activeLeave) return;
    // Optimistic removal
    setChatMessages((prev) => prev.filter((m) => m.id !== messageId));
    try {
      await deleteLeaveChatMessage(messageId);
    } catch (err: any) {
      setChatError(err?.message || "Failed to delete message.");
      // Re-fetch to restore accurate state on failure
      await fetchChatMessages(activeLeave.id);
    }
  };

  /* -------------------------------------------------
     EDIT
  ------------------------------------------------- */

  const openEdit = (item: LeaveItem) => {
    setActiveLeave(item);
    setEditForm({
      employeeId: item.userId,
      leaveTypeMasterId: item.leaveTypeMasterId,
      from: toInputDate(item.fromRaw),
      to: toInputDate(item.toRaw),
      availTypeLabel: AVAIL_TYPE_TO_LABEL[item.availType] ?? "Full Day",
      days: item.days.split(" ")[0] ?? "",
      reason: item.reason ?? "",
    });
    setEditOpen(true);
  };

  const handleEditFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setEditForm((prev) => {
      const next = { ...prev, [name]: value };

      if ((name === "from" || name === "to") && next.from && next.to) {
        const fromDate = new Date(`${next.from}T00:00:00`);
        const toDate = new Date(`${next.to}T00:00:00`);

        if (!Number.isNaN(fromDate.getTime()) && !Number.isNaN(toDate.getTime()) && toDate >= fromDate) {
          const diff = Math.floor((toDate.getTime() - fromDate.getTime()) / 86400000) + 1;
          next.days = String(diff);
        }
      }

      return next;
    });
  };

  const saveEdit = async () => {
    if (!activeLeave) return;

    if (
      !editForm.employeeId ||
      !editForm.leaveTypeMasterId ||
      !editForm.from ||
      !editForm.to ||
      !editForm.availTypeLabel
    ) {
      alert("Please fill all required fields");
      return;
    }

    setSaving(true);
    try {
      await updateLeave(activeLeave.id, {
        UserId: editForm.employeeId,
        LeaveTypeMasterId: editForm.leaveTypeMasterId,
        FromDate: editForm.from,
        ToDate: editForm.to,
        AvailType: AVAIL_LABEL_TO_TYPE[editForm.availTypeLabel] ?? 1,
        Reason: editForm.reason.trim(),
      });
      setEditOpen(false);
      await fetchLeaves();
    } catch (err: any) {
      alert(err?.message || "Failed to update leave.");
    } finally {
      setSaving(false);
    }
  };

  /* -------------------------------------------------
     DELETE
  ------------------------------------------------- */

  const openDelete = (item: LeaveItem) => {
    setActiveLeave(item);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!activeLeave) return;
    setSaving(true);
    try {
      await deleteLeave(activeLeave.id);
      setDeleteOpen(false);
      setActiveLeave(null);
      await fetchLeaves();
    } catch (err: any) {
      alert(err?.message || "Failed to delete leave.");
    } finally {
      setSaving(false);
    }
  };

  /* -------------------------------------------------
     RENDER
  ------------------------------------------------- */

  return (
    <>
      <style>{`
        .leave-page{min-height:100vh;background:#f5f6f8;padding:24px 20px 26px;color:#14223d;font-family:Inter,Arial,sans-serif}
        .leave-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:28px}
        .leave-title{margin:0;font-size:25px;line-height:1.2;font-weight:700;color:#172442}
        .leave-breadcrumb{display:flex;align-items:center;gap:9px;margin-top:9px;font-size:12px;color:#52627a}
        .leave-breadcrumb a{color:#52627a;text-decoration:none}
        .leave-add{height:40px;border:0;border-radius:6px;background:#c18d2f;color:#fff;padding:0 16px;font-size:14px;font-weight:600;display:inline-flex;align-items:center;gap:8px;cursor:pointer}
        .leave-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:24px;margin-bottom:24px}
        .leave-stat{height:88px;border:1px solid #dde2e8;border-radius:5px;background:#fff;position:relative;overflow:hidden;display:flex;align-items:center;box-shadow:0 1px 2px rgba(16,24,40,.03)}
        .leave-stat-shape{width:124px;height:100%;position:relative;display:flex;align-items:center;padding-left:20px;flex-shrink:0}
        .leave-stat-shape::after{content:"";position:absolute;right:-18px;top:-18px;width:55px;height:125px;background:rgba(255,255,255,.74);transform:rotate(-27deg)}
        .leave-stat-shape.green{background:#05c95d}.leave-stat-shape.pink{background:#fb3492}.leave-stat-shape.yellow{background:#ffbd12}.leave-stat-shape.blue{background:#1cc0dc}
        .leave-stat-icon{width:34px;height:34px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;position:relative;z-index:2}
        .leave-stat-shape.green .leave-stat-icon{color:#05c95d}.leave-stat-shape.pink .leave-stat-icon{color:#fb3492}.leave-stat-shape.yellow .leave-stat-icon{color:#ffbd12}.leave-stat-shape.blue .leave-stat-icon{color:#1d7cf2}
        .leave-stat-text{flex:1;padding:0 18px;text-align:right}.leave-stat-label{font-size:14px;color:#6f7785;margin-bottom:3px}.leave-stat-value{font-size:19px;font-weight:600;color:#15233f}
        .leave-card{background:#fff;border:1px solid #dce1e7;border-radius:5px;overflow:hidden;box-shadow:0 1px 2px rgba(16,24,40,.03)}
        .leave-card-top{min-height:70px;padding:16px 20px;border-bottom:1px solid #e3e6eb;display:flex;align-items:center;justify-content:space-between;gap:16px}
        .leave-list-title{font-size:15px;font-weight:700;color:#172442}.leave-filters{display:flex;align-items:center;gap:16px}
        .leave-select{height:36px;border:1px solid #d8dee6;border-radius:6px;background:#fff;padding:0 11px;color:#18243e;font-size:13px;outline:none}
        .leave-date-select{width:195px}.leave-type-select{width:110px}.leave-sort-select{width:167px}
        .leave-tools{min-height:62px;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #e5e7eb}
        .leave-entries{display:flex;align-items:center;gap:8px;font-size:13px;color:#344054}
        .leave-entries select{width:49px;height:31px;border:1px solid #d8dee6;border-radius:6px;background:#fff;padding:0 6px;outline:none}
        .leave-search{width:160px;height:31px;border:1px solid #d8dee6;border-radius:6px;padding:0 12px;font-size:13px;outline:none}
        .leave-table-wrap{width:100%;overflow:hidden}
        .leave-table{width:100%;border-collapse:collapse;table-layout:fixed}
        .leave-table th{height:43px;background:#e3e6ea;color:#0e1a31;font-size:13px;font-weight:700;text-align:left;padding:0 10px;border-bottom:1px solid #d8dde5;vertical-align:middle}
        .leave-table td{height:59px;padding:0 10px;border-bottom:1px solid #e3e6eb;color:#5f6f86;font-size:13px;vertical-align:middle}
        .leave-table th:nth-child(1),.leave-table td:nth-child(1){width:6%;text-align:center}.leave-table th:nth-child(2),.leave-table td:nth-child(2){width:17%}.leave-table th:nth-child(3),.leave-table td:nth-child(3){width:14%}.leave-table th:nth-child(4),.leave-table td:nth-child(4){width:12%}.leave-table th:nth-child(5),.leave-table td:nth-child(5){width:12%}.leave-table th:nth-child(6),.leave-table td:nth-child(6){width:11%}.leave-table th:nth-child(7),.leave-table td:nth-child(7){width:13%}.leave-table th:nth-child(8),.leave-table td:nth-child(8){width:15%}
        .leave-table input[type=checkbox]{width:18px;height:18px;cursor:pointer;accent-color:#c18d2f}
        .leave-employee{display:flex;align-items:center;gap:9px}.leave-avatar{width:34px;height:34px;border-radius:50%;background:#d7d9dc;display:flex;align-items:center;justify-content:center;color:#a8adb4;font-size:9px;flex-shrink:0}
        .leave-name{color:#0e172a;font-size:13px;font-weight:500;line-height:1.25}.leave-role{color:#788397;font-size:11px;margin-top:2px}
        .leave-type-cell{display:flex;align-items:center;gap:5px}
        .leave-info-wrap{position:relative;display:inline-flex;align-items:center}
        .leave-info-icon{color:#1677ff;flex-shrink:0;cursor:pointer}
        .leave-info-tooltip{
          position:absolute;
          left:50%;
          bottom:calc(100% + 9px);
          transform:translateX(-50%);
          width:200px;
          padding:8px 10px;
          border-radius:5px;
          background:#1f1f1f;
          color:#fff;
          font-size:12px;
          line-height:1.45;
          font-weight:500;
          text-align:center;
          white-space:normal;
          opacity:0;
          visibility:hidden;
          pointer-events:none;
          z-index:999;
          box-shadow:0 4px 12px rgba(0,0,0,.18);
          transition:opacity .15s ease,visibility .15s ease;
        }
        .leave-info-tooltip::after{
          content:"";
          position:absolute;
          top:100%;
          left:50%;
          transform:translateX(-50%);
          border:6px solid transparent;
          border-top-color:#1f1f1f;
        }
        .leave-info-wrap:hover .leave-info-tooltip{
          opacity:1;
          visibility:visible;
        }
        .leave-status-select{height:32px;min-width:115px;border:1px solid #d9dee5;border-radius:6px;background:#fff;padding:0 30px 0 30px;color:#121c31;font-size:13px;outline:none;cursor:pointer}
        .leave-status-wrap{position:relative;display:inline-block}.leave-status-dot{position:absolute;left:10px;top:50%;width:8px;height:8px;border-radius:50%;transform:translateY(-50%);z-index:2;pointer-events:none}
        .leave-status-dot.approved{background:#24c875;box-shadow:0 0 0 4px #e6f8ef}.leave-status-dot.declined{background:#f35c6a;box-shadow:0 0 0 4px #fde9eb}.leave-status-dot.new{background:#c34ad3;box-shadow:0 0 0 4px #f5e9f7}
        .leave-actions{display:flex;align-items:center;gap:16px}.leave-action{border:0;background:transparent;color:#617087;display:inline-flex;align-items:center;justify-content:center;padding:0;cursor:pointer}
        .leave-footer{height:60px;display:flex;align-items:center;justify-content:space-between;padding:0 16px;font-size:13px;color:#667085;background:#fff;border-top:1px solid #e3e6eb}.leave-pagination{display:flex;align-items:center;gap:17px}.leave-page-arrow{border:0;background:transparent;color:#a2abb8;font-size:18px;padding:0}.leave-page-number{width:27px;height:27px;border-radius:50%;background:#c18d2f;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px}

        .custom-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;display:flex;align-items:center;justify-content:center;padding:24px}
        .custom-modal{width:min(800px,95vw);background:#fff;border-radius:6px;box-shadow:0 20px 60px rgba(0,0,0,.25);overflow:hidden}
        .custom-modal.small{width:min(400px,92vw)}
        .custom-modal-head{height:64px;border-bottom:1px solid #e4e7ec;padding:0 16px;display:flex;align-items:center;justify-content:space-between}
        .custom-modal-head h3{margin:0;font-size:22px;color:#22304f}
        .custom-close{border:0;background:#7c8491;color:#fff;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0}
        .view-grid{display:grid;grid-template-columns:1fr 1fr;gap:28px 70px;padding:30px 16px 24px}
        .view-label{font-size:14px;color:#4b5563;margin-bottom:4px}.view-value{font-size:18px;font-weight:600;color:#253354}
        .chat-modal{height:475px;display:flex;flex-direction:column}
        .chat-profile{height:74px;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;padding:0 16px;gap:12px}
        .chat-avatar{width:46px;height:46px;border-radius:50%;background:#d3d5d8;position:relative;display:flex;align-items:center;justify-content:center;font-size:8px;color:#a4a8ad}
        .online-dot{width:10px;height:10px;background:#14c865;border:2px solid #fff;border-radius:50%;position:absolute;right:-1px;bottom:2px}
        .chat-name{font-size:14px;font-weight:600;color:#16223b}.chat-online{font-size:14px;color:#111827}
        .chat-body{flex:1;padding:16px;overflow-y:auto}
        .chat-row{display:flex;align-items:flex-end;gap:10px;margin-bottom:18px}.chat-row.right{justify-content:flex-end}
        .chat-bubble{max-width:440px;background:#f7f8fa;border-radius:16px;padding:16px;font-size:14px;line-height:1.45;color:#111827}.chat-row.right .chat-bubble{background:#f7f8fa;max-width:240px}
        .chat-meta{font-size:12px;color:#6b7280;margin-top:3px}.chat-row.right .chat-meta{text-align:right}
        .chat-input-wrap{padding:10px 16px;border-top:1px solid #e5e7eb}.chat-input{height:48px;background:#f8f9fa;border-radius:8px;padding:0 8px 0 10px;display:flex;align-items:center;gap:8px}
        .chat-input input{flex:1;border:0;background:transparent;outline:none;font-size:14px}.send-btn{width:34px;height:34px;border-radius:8px;border:0;background:#c18d2f;color:#fff;display:flex;align-items:center;justify-content:center}
        .edit-form{padding:18px 16px;display:grid;grid-template-columns:1fr 1fr;gap:18px 24px}.edit-field{display:flex;flex-direction:column;gap:7px}.edit-field.full{grid-column:1/-1}.edit-field label{font-size:14px;color:#293754}.edit-field input,.edit-field select,.edit-field textarea{height:38px;border:1px solid #d8dee6;border-radius:5px;padding:0 10px;font-size:14px;outline:none}.edit-field textarea{height:86px;padding-top:10px;resize:none}
        .modal-footer-custom{display:flex;justify-content:flex-end;gap:8px;padding:12px 14px;border-top:1px solid #e5e7eb}.btn-light-custom,.btn-gold-custom,.btn-danger-custom{height:38px;border-radius:6px;border:0;padding:0 16px;font-size:14px}.btn-light-custom{background:#f4f5f7;color:#111827}.btn-gold-custom{background:#c18d2f;color:#fff}.btn-gold-custom:disabled{opacity:.6;cursor:not-allowed}.btn-danger-custom{background:#ef1717;color:#fff}.btn-danger-custom:disabled{opacity:.6;cursor:not-allowed}
        .delete-body{text-align:center;padding:18px 28px}.delete-icon{width:58px;height:58px;margin:0 auto 16px;border-radius:4px;background:#fde3e3;color:#ef1717;display:flex;align-items:center;justify-content:center}.delete-body h3{font-size:21px;color:#22304f;margin:0 0 8px}.delete-body p{font-size:14px;line-height:1.5;color:#374151;margin:0 auto 18px;max-width:330px}.delete-actions{display:flex;justify-content:center;gap:16px}

        .add-leave-modal{width:min(800px,95vw)}
        .add-leave-form{padding:18px 16px 16px;display:grid;grid-template-columns:1fr 1fr;gap:18px 24px}
        .add-leave-field{display:flex;flex-direction:column;gap:8px}
        .add-leave-field.full{grid-column:1/-1}
        .add-leave-field label{font-size:14px;color:#293754}
        .add-leave-field input,.add-leave-field select,.add-leave-field textarea{width:100%;height:38px;border:1px solid #d8dee6;border-radius:5px;padding:0 10px;font-size:14px;color:#1f2937;background:#fff;outline:none;box-sizing:border-box}
        .add-leave-field textarea{height:86px;padding-top:10px;resize:none}
        .add-leave-field input::placeholder{color:#9aa4b2}

        .leave-status-banner{padding:10px 16px;font-size:13px;border-radius:5px;margin-bottom:16px}
        .leave-status-banner.error{background:#fde3e3;color:#a11212}
        .leave-status-banner.loading{background:#eef2f8;color:#334155}

        @media(max-width:1050px){.leave-stats{grid-template-columns:repeat(2,1fr)}.leave-card-top{align-items:flex-start;flex-direction:column}.leave-filters{width:100%;flex-wrap:wrap}}
        @media(max-width:700px){.leave-page{padding:18px 12px 24px}.leave-stats{grid-template-columns:1fr}.leave-header{gap:12px}.leave-tools{gap:10px;flex-direction:column;align-items:stretch}.leave-search{width:100%}.leave-table{font-size:11px}.view-grid,.edit-form{grid-template-columns:1fr}}
      `}</style>

      <div className="leave-page">
        <div className="leave-header">
          <div>
            <h1 className="leave-title">Leaves</h1>
            <div className="leave-breadcrumb">
              <Link to="/Hr/HrDashboard"><i className="ti ti-smart-home"></i></Link>
              <span>/</span><span>Leaves</span>
            </div>
          </div>
          <button type="button" className="leave-add" onClick={openAdd}><span>+</span>Add Leave</button>
        </div>

        {errorMsg && <div className="leave-status-banner error">{errorMsg}</div>}
        {loading && <div className="leave-status-banner loading">Loading leaves…</div>}

        <div className="leave-stats">
          {[
            ["green", "Total Present", "180/200"],
            ["pink", "Planned Leaves", "10"],
            ["yellow", "Unplanned Leaves", "10"],
            ["blue", "Pending Requests", String(leaveData.filter((l) => l.status === "New").length)],
          ].map(([c, t, v]) => (
            <div className="leave-stat" key={t}>
              <div className={`leave-stat-shape ${c}`}><div className="leave-stat-icon"><CircleUserRound size={18} /></div></div>
              <div className="leave-stat-text"><div className="leave-stat-label">{t}</div><div className="leave-stat-value">{v}</div></div>
            </div>
          ))}
        </div>

        <div className="leave-card">
          <div className="leave-card-top">
            <div className="leave-list-title">Leave List</div>
            <div className="leave-filters">
              <select className="leave-select leave-date-select" defaultValue="range">
                <option value="range">08/27/2026 - 09/02/20</option><option>Today</option><option>Yesterday</option><option>Last 7 Days</option><option>Last 30 Days</option>
              </select>
              <select className="leave-select leave-type-select" value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
                <option value="">Leave Type</option>
                {leaveTypes.map((t) => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
              </select>
              <select className="leave-select leave-sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="7">Sort By : Last 7 Days</option><option value="30">Sort By : Last 30 Days</option><option value="name">Sort By : Name</option>
              </select>
            </div>
          </div>

          <div className="leave-tools">
            <div className="leave-entries">Row Per Page
              <select value={rowsPerPage} onChange={(e) => setRowsPerPage(Number(e.target.value))}><option value={10}>10</option><option value={20}>20</option><option value={30}>30</option></select>
              Entries
            </div>
            <input className="leave-search" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <div className="leave-table-wrap">
            <table className="leave-table">
              <thead><tr>
                <th><input type="checkbox" checked={allSelected} onChange={(e) => handleSelectAll(e.target.checked)} /></th>
                <th>Employee</th><th>Leave Type</th><th>From</th><th>To</th><th>No of Days</th><th>Status</th><th></th>
              </tr></thead>
              <tbody>
                {visibleRows.map((item) => (
                  <tr key={item.id}>
                    <td><input type="checkbox" checked={selected.includes(item.id)} onChange={(e) => handleSelect(item.id, e.target.checked)} /></td>
                    <td><div className="leave-employee"><div className="leave-avatar">300 x 300</div><div><div className="leave-name">{item.name}</div><div className="leave-role">{item.role}</div></div></div></td>
                    <td>
                      <div className="leave-type-cell">
                        {item.type}
                        <span className="leave-info-wrap">
                          <Info className="leave-info-icon" size={14} />
                          <span className="leave-info-tooltip">
                            {item.reason?.trim() || "No reason provided."}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td>{item.from}</td><td>{item.to}</td><td>{item.days}</td>
                    <td>
                      <div className="leave-status-wrap">
                        <span className={`leave-status-dot ${statusClass(item.status)}`} />
                        <select
                          className="leave-status-select"
                          value={item.status}
                          onChange={(e) => updateStatus(item, e.target.value as LeaveStatus)}
                        >
                          <option>Approved</option><option>Declined</option><option>New</option>
                        </select>
                      </div>
                    </td>
                    <td>
                      <div className="leave-actions">
                        <button className="leave-action" onClick={() => openView(item)}><Eye size={15} /></button>
                        <button className="leave-action" onClick={() => openChat(item)}><MessageSquareMore size={15} /></button>
                        <button className="leave-action" onClick={() => openEdit(item)}><Pencil size={15} /></button>
                        <button className="leave-action" onClick={() => openDelete(item)}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && visibleRows.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "24px 0" }}>No leaves found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="leave-footer">
            <span>Showing {visibleRows.length ? 1 : 0} - {visibleRows.length} of {filteredRows.length} entries</span>
            <div className="leave-pagination"><button className="leave-page-arrow">‹</button><span className="leave-page-number">1</span><button className="leave-page-arrow">›</button></div>
          </div>
        </div>
      </div>

      {addOpen && (
        <div className="custom-modal-overlay">
          <div className="custom-modal add-leave-modal">
            <div className="custom-modal-head">
              <h3>Add Leave</h3>
              <button className="custom-close" type="button" onClick={closeAdd}>
                <X size={14} />
              </button>
            </div>

            <div className="add-leave-form">
              <div className="add-leave-field">
                <label>Employee</label>
                <select name="employeeId" value={addForm.employeeId} onChange={handleAddFormChange}>
                  <option value="">Select</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>

              <div className="add-leave-field">
                <label>Leave Reason</label>
                <select name="leaveTypeMasterId" value={addForm.leaveTypeMasterId} onChange={handleAddFormChange}>
                  <option value="">Select Leave Reason</option>
                  {leaveTypes.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="add-leave-field">
                <label>From</label>
                <input name="from" type="date" value={addForm.from} onChange={handleAddFormChange} />
              </div>

              <div className="add-leave-field">
                <label>To</label>
                <input name="to" type="date" min={addForm.from || undefined} value={addForm.to} onChange={handleAddFormChange} />
              </div>

              <div className="add-leave-field">
                <label>Leave Type</label>
                <select name="availTypeLabel" value={addForm.availTypeLabel} onChange={handleAddFormChange}>
                  <option value="">Select</option>
                  <option value="Full Day">Full Day</option>
                  <option value="First Half">First Half</option>
                  <option value="Second Half">Second Half</option>
                </select>
              </div>

              <div className="add-leave-field">
                <label>No of Days</label>
                <input name="days" value={addForm.days} readOnly />
              </div>

              <div className="add-leave-field full">
                <label>Reason *</label>
                <textarea name="reason" value={addForm.reason} onChange={handleAddFormChange} required />
              </div>
            </div>

            <div className="modal-footer-custom">
              <button className="btn-light-custom" type="button" onClick={closeAdd}>Cancel</button>
              <button className="btn-gold-custom" type="button" onClick={handleAddLeave} disabled={saving}>
                {saving ? "Adding…" : "Add Leave"}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewOpen && activeLeave && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <div className="custom-modal-head"><h3>View Leave</h3><button className="custom-close" onClick={() => setViewOpen(false)}><X size={14} /></button></div>
            <div className="view-grid">
              <div><div className="view-label">Leave Reason</div><div className="view-value">{activeLeave.type}</div></div>
              <div><div className="view-label">From</div><div className="view-value">{activeLeave.from}</div></div>
              <div><div className="view-label">To</div><div className="view-value">{activeLeave.to}</div></div>
              <div><div className="view-label">Leave Type</div><div className="view-value">{AVAIL_TYPE_TO_LABEL[activeLeave.availType] ?? "-"}</div></div>
              <div><div className="view-label">No of Days</div><div className="view-value">{activeLeave.days}</div></div>
              <div><div className="view-label">Reason</div><div className="view-value">{activeLeave.reason || "-"}</div></div>
            </div>
          </div>
        </div>
      )}

      {chatOpen && activeLeave && (
        <div className="custom-modal-overlay">
          <div className="custom-modal chat-modal">
            <div className="chat-profile">
              <div className="chat-avatar">300 x 300<span className="online-dot" /></div>
              <div><div className="chat-name">{activeLeave.name}</div><div className="chat-online">{activeLeave.type}</div></div>
              <button className="custom-close" style={{ marginLeft: "auto" }} onClick={() => setChatOpen(false)}><X size={14} /></button>
            </div>

            <div className="chat-body">
              {chatError && <div className="leave-status-banner error">{chatError}</div>}
              {chatLoading && chatMessages.length === 0 && (
                <div className="leave-status-banner loading">Loading messages…</div>
              )}
              {!chatLoading && chatMessages.length === 0 && !chatError && (
                <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, marginTop: 24 }}>
                  No messages yet. Say hi 👋
                </div>
              )}
              {chatMessages.map((m) => (
                <div className={`chat-row ${m.mine ? "right" : ""}`} key={m.id}>
                  {!m.mine && <div className="chat-avatar">300 x 300</div>}
                  <div>
                    <div className="chat-bubble" style={{ position: "relative" }}>
                      {m.message}
                      {m.mine && (
                        <button
                          type="button"
                          onClick={() => handleDeleteChatMessage(m.id)}
                          title="Delete message"
                          style={{
                            border: 0,
                            background: "transparent",
                            color: "#9aa4b2",
                            cursor: "pointer",
                            padding: 0,
                            marginLeft: 8,
                            verticalAlign: "middle",
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                    <div className="chat-meta">
                      {m.mine ? "You" : m.senderName} &nbsp;•&nbsp; {formatChatTime(m.sentAt)}
                    </div>
                  </div>
                  {m.mine && <div className="chat-avatar">300 x 300</div>}
                </div>
              ))}
            </div>

            <div className="chat-input-wrap">
              <div className="chat-input">
                <input
                  placeholder="Type Your Message"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleChatKeyDown}
                  disabled={chatSending}
                />
                <button className="send-btn" onClick={handleSendChatMessage} disabled={chatSending || !chatInput.trim()}>
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editOpen && activeLeave && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <div className="custom-modal-head"><h3>Edit Leave</h3><button className="custom-close" onClick={() => setEditOpen(false)}><X size={14} /></button></div>
            <div className="edit-form">
              <div className="edit-field">
                <label>Employee</label>
                <select name="employeeId" value={editForm.employeeId} onChange={handleEditFormChange}>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
              <div className="edit-field">
                <label>Leave Reason</label>
                <select name="leaveTypeMasterId" value={editForm.leaveTypeMasterId} onChange={handleEditFormChange}>
                  {leaveTypes.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="edit-field"><label>From</label><input name="from" type="date" value={editForm.from} onChange={handleEditFormChange} /></div>
              <div className="edit-field"><label>To</label><input name="to" type="date" min={editForm.from || undefined} value={editForm.to} onChange={handleEditFormChange} /></div>
              <div className="edit-field">
                <label>Leave Type</label>
                <select name="availTypeLabel" value={editForm.availTypeLabel} onChange={handleEditFormChange}>
                  <option value="Full Day">Full Day</option>
                  <option value="First Half">First Half</option>
                  <option value="Second Half">Second Half</option>
                </select>
              </div>
              <div className="edit-field"><label>No of Days</label><input value={editForm.days} readOnly /></div>
              <div className="edit-field full"><label>Reason</label><textarea name="reason" value={editForm.reason} onChange={handleEditFormChange} /></div>
            </div>
            <div className="modal-footer-custom">
              <button className="btn-light-custom" onClick={() => setEditOpen(false)}>Cancel</button>
              <button className="btn-gold-custom" onClick={saveEdit} disabled={saving}>{saving ? "Saving…" : "Save Changes"}</button>
            </div>
          </div>
        </div>
      )}

      {deleteOpen && activeLeave && (
        <div className="custom-modal-overlay">
          <div className="custom-modal small">
            <div className="delete-body">
              <div className="delete-icon"><Trash2 size={30} /></div>
              <h3>Confirm Delete</h3>
              <p>You want to delete this leave request, this can't be undone once you delete.</p>
              <div className="delete-actions">
                <button className="btn-light-custom" onClick={() => setDeleteOpen(false)}>Cancel</button>
                <button className="btn-danger-custom" onClick={confirmDelete} disabled={saving}>{saving ? "Deleting…" : "Yes, Delete"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Leaves;

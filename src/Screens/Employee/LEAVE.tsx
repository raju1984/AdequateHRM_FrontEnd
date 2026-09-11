
import React, {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  addLeave,
  deleteLeave,
  getLeaveById,
  getLeaveTypes,
  getMyLeaves,
  updateLeave,
  type LeavePayload,
  type MyLeavesParams,
} from "../../services/employeservices";

// =====================================================
// TYPES
// =====================================================

type LeaveStatus =
  | "Approved"
  | "Reject"
  | "New";

/*
 * NOTE: The backend's status enum wasn't visible in the Swagger
 * screenshots (only request query params were shown), so this mapping
 * is a best guess. Confirm the real values against your API and adjust
 * here if needed.
 */
const STATUS_TO_CODE: Record<LeaveStatus, number> = {
  New: 0,
  Approved: 1,
  Reject: 2,
};

const STATUS_FROM_CODE: Record<number, LeaveStatus> = {
  0: "New",
  1: "Approved",
  2: "Reject",
};

/*
 * AvailType enum, also a best guess pending confirmation from the
 * backend team / a real response payload.
 */
const AVAIL_TYPE_OPTIONS: { label: string; value: number }[] = [
  { label: "First Half", value: 1 },
  { label: "Second Half", value: 2 },
  { label: "Full Day", value: 3 },
];

const availTypeLabel = (value: number): string =>
  AVAIL_TYPE_OPTIONS.find((option) => option.value === value)?.label ||
  "Full Day";

interface LeaveTypeOption {
  id: string;
  name: string;
}

interface LeaveItem {
  id: string;
  leaveTypeId: string;
  leaveTypeName: string;
  requestDate: string;
  from: string;
  fromRaw: string;
  to: string;
  toRaw: string;
  approvedBy: string;
  approvedByRole: string;
  days: string;
  availType: number;
  status: LeaveStatus;
  employee?: string;
  department?: string;
  description: string;
  raw: any;
}

interface LeaveForm {
  leaveTypeId: string;
  from: string;
  to: string;
  availType: number;
  days: string;
  reasonText: string;
  attachment: File | null;
}

const emptyForm: LeaveForm = {
  leaveTypeId: "",
  from: "",
  to: "",
  availType: 3,
  days: "",
  reasonText: "",
  attachment: null,
};

// =====================================================
// HELPERS
// =====================================================

const pickField = (
  obj: any,
  keys: string[],
  fallback: any = undefined
) => {
  for (const key of keys) {
    if (
      obj?.[key] !== undefined &&
      obj?.[key] !== null &&
      obj?.[key] !== ""
    ) {
      return obj[key];
    }
  }

  return fallback;
};

const formatDisplayDate = (value?: string) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// =====================================================
// DATE HELPERS
// =====================================================

/*
 * API date -> DD/MM/YYYY
 *
 * Example:
 * 2026-09-12T00:00:00 -> 12/09/2026
 */
const formatDateForInput = (value?: string) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

/*
 * Automatically format user typing.
 *
 * Example:
 * 12       -> 12
 * 1209     -> 12/09
 * 12092026 -> 12/09/2026
 */
const formatDateTyping = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)}/${digits.slice(
    2,
    4
  )}/${digits.slice(4, 8)}`;
};

/*
 * DD/MM/YYYY -> YYYY-MM-DD
 */
const parseDDMMYYYY = (value: string): string | null => {
  const match =
    /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(
      value.trim()
    );

  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  const date = new Date(
    year,
    month - 1,
    day
  );

  /*
   * This also catches invalid dates like:
   * 31/02/2026
   * 32/01/2026
   * 29/13/2026
   */
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return `${year}-${String(month).padStart(
    2,
    "0"
  )}-${String(day).padStart(2, "0")}`;
};

/*
 * DD/MM/YYYY -> ISO datetime for API
 */
const toIsoDateTime = (value: string) => {
  const isoDate = parseDDMMYYYY(value);

  if (!isoDate) {
    throw new Error(
      "Please enter a valid date in DD/MM/YYYY format."
    );
  }

  const date = new Date(
    `${isoDate}T00:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    throw new Error(
      "Invalid date. Please use DD/MM/YYYY format."
    );
  }

  return date.toISOString();
};

// =====================================================
// LEAVE NORMALIZATION
// =====================================================

const normalizeLeave = (raw: any): LeaveItem => {
  const id = pickField(
    raw,
    ["id", "leaveId", "Id", "LeaveId"],
    ""
  );

  const leaveTypeId = pickField(
    raw,
    [
      "leaveTypeMasterId",
      "leaveTypeId",
      "LeaveTypeMasterId",
    ],
    ""
  );

  const leaveTypeName = pickField(
    raw,
    [
      "leaveTypeName",
      "leaveType",
      "LeaveTypeName",
      "leaveTypeMasterName",
    ],
    "Leave"
  );

  const fromRaw = pickField(
    raw,
    ["fromDate", "FromDate"],
    ""
  );

  const toRaw = pickField(
    raw,
    ["toDate", "ToDate"],
    ""
  );

  const requestDateRaw = pickField(
    raw,
    [
      "requestDate",
      "createdOn",
      "createdDate",
      "RequestDate",
    ],
    ""
  );

  const approvedBy = pickField(
    raw,
    [
      "approvedByName",
      "approvedBy",
      "ApprovedByName",
    ],
    "-"
  );

  const approvedByRole = pickField(
    raw,
    [
      "approvedByRole",
      "role",
      "ApprovedByRole",
    ],
    ""
  );

  const availType = Number(
    pickField(
      raw,
      ["availType", "AvailType"],
      3
    )
  );

  const statusRaw = pickField(
    raw,
    ["status", "Status"],
    0
  );

  const description = pickField(
    raw,
    ["reason", "description", "Reason"],
    ""
  );

  const employee = pickField(
    raw,
    [
      "employeeName",
      "userName",
      "employee",
      "EmployeeName",
    ],
    undefined
  );

  const department = pickField(
    raw,
    [
      "department",
      "departmentName",
      "Department",
    ],
    undefined
  );

  let noOfDays = pickField(
    raw,
    ["noOfDays", "days", "NoOfDays"],
    undefined
  );

  if (
    noOfDays === undefined &&
    fromRaw &&
    toRaw
  ) {
    const from = new Date(fromRaw);
    const to = new Date(toRaw);

    const diffDays =
      Math.round(
        (to.getTime() - from.getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1;

    noOfDays =
      diffDays > 0 ? diffDays : 1;
  }

  return {
    id: String(id),
    leaveTypeId: String(leaveTypeId),
    leaveTypeName,
    requestDate:
      formatDisplayDate(requestDateRaw),
    from: formatDisplayDate(fromRaw),
    fromRaw,
    to: formatDisplayDate(toRaw),
    toRaw,
    approvedBy,
    approvedByRole,
    days: `${noOfDays ?? 1} Days`,
    availType,
    status:
      STATUS_FROM_CODE[
        Number(statusRaw)
      ] ?? "New",
    employee,
    department,
    description,
    raw,
  };
};

// =====================================================
// LEAVE TYPE NORMALIZATION
// =====================================================

const normalizeLeaveType = (
  raw: any
): LeaveTypeOption => ({
  id: String(
    pickField(
      raw,
      [
        "id",
        "leaveTypeMasterId",
        "Id",
      ],
      ""
    )
  ),

  /*
   * IMPORTANT:
   * API response uses "leaveName".
   */
  name: pickField(
    raw,
    [
      "name",
      "leaveName",
      "leaveTypeName",
      "Name",
    ],
    "Leave"
  ),
});

// =====================================================
// RESPONSE HELPERS
// =====================================================

const extractListAndTotal = (
  payload: any
) => {
  const container =
    payload?.data ?? payload;

  const items =
    container?.items ??
    container?.data ??
    (Array.isArray(container)
      ? container
      : []);

  const total =
    container?.totalCount ??
    container?.totalRecords ??
    container?.total ??
    (Array.isArray(items)
      ? items.length
      : 0);

  return {
    items: Array.isArray(items)
      ? items
      : [],
    total: Number(total) || 0,
  };
};

const extractList = (payload: any) => {
  const container =
    payload?.data ?? payload;

  const items =
    container?.items ??
    (Array.isArray(container)
      ? container
      : []);

  return Array.isArray(items)
    ? items
    : [];
};

// =====================================================
// COMPONENT
// =====================================================

const Leave: React.FC = () => {
  const navigate = useNavigate();

  const [leaveData, setLeaveData] =
    useState<LeaveItem[]>([]);

  const [totalCount, setTotalCount] =
    useState(0);

  const [leaveTypes, setLeaveTypes] =
    useState<LeaveTypeOption[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [activeTab, setActiveTab] =
    useState<
      "myLeaves" | "employeeLeaves"
    >("myLeaves");

  const [search, setSearch] =
    useState("");

  const [leaveTypeFilter, setLeaveTypeFilter] =
    useState("");

  const [approvedFilter, setApprovedFilter] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  const [sortBy, setSortBy] =
    useState("");

  const [rowsPerPage, setRowsPerPage] =
    useState(10);

  const [currentPage, setCurrentPage] =
    useState(1);

  const [selectedIds, setSelectedIds] =
    useState<string[]>([]);

  const [showAddModal, setShowAddModal] =
    useState(false);

  const [showChatModal, setShowChatModal] =
    useState(false);

  const [showViewModal, setShowViewModal] =
    useState(false);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [selectedLeave, setSelectedLeave] =
    useState<LeaveItem | null>(null);

  const [form, setForm] =
    useState<LeaveForm>(emptyForm);

  const [chatMessage, setChatMessage] =
    useState("");

  // ===================================================
  // LOAD LEAVE TYPES
  // ===================================================

  useEffect(() => {
    const loadLeaveTypes = async () => {
      try {
        const token =
          localStorage.getItem("token");

        if (!token) return;

        const response =
          await getLeaveTypes(token);

        const list =
          extractList(response);

        setLeaveTypes(
          list.map(normalizeLeaveType)
        );
      } catch (err) {
        console.error(
          "Failed to load leave types",
          err
        );
      }
    };

    loadLeaveTypes();
  }, []);

  const leaveTypeNameById =
    useMemo(() => {
      const map = new Map<
        string,
        string
      >();

      leaveTypes.forEach((item) =>
        map.set(item.id, item.name)
      );

      return map;
    }, [leaveTypes]);

  // ===================================================
  // LOAD LEAVES
  // ===================================================

  const fetchLeaves =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const token =
          localStorage.getItem("token");

        if (!token) {
          throw new Error(
            "Authentication token is missing. Please login again."
          );
        }

        const params: MyLeavesParams = {
          PageNumber: currentPage,
          PageSize: rowsPerPage,
        };

        if (leaveTypeFilter) {
          params.LeaveTypeId =
            leaveTypeFilter;
        }

        if (statusFilter) {
          params.Status =
            STATUS_TO_CODE[
              statusFilter as LeaveStatus
            ];
        }

        if (sortBy) {
          params.SortBy = sortBy;
        }

        const response =
          await getMyLeaves(
            token,
            params
          );

        const {
          items,
          total,
        } =
          extractListAndTotal(
            response
          );

        setLeaveData(
          items.map(normalizeLeave)
        );

        setTotalCount(total);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load leaves."
        );

        setLeaveData([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    }, [
      currentPage,
      rowsPerPage,
      leaveTypeFilter,
      statusFilter,
      sortBy,
    ]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  // ===================================================
  // CLIENT-SIDE REFINEMENT
  // ===================================================

  const filteredData = useMemo(() => {
    let data = [...leaveData];

    const query =
      search.trim().toLowerCase();

    if (query) {
      data = data.filter(
        (item) =>
          item.leaveTypeName
            .toLowerCase()
            .includes(query) ||
          item.employee
            ?.toLowerCase()
            .includes(query) ||
          item.approvedBy
            .toLowerCase()
            .includes(query) ||
          item.status
            .toLowerCase()
            .includes(query)
      );
    }

    if (approvedFilter) {
      data = data.filter(
        (item) =>
          item.approvedBy ===
          approvedFilter
      );
    }

    return data;
  }, [
    leaveData,
    search,
    approvedFilter,
  ]);

  const approvedByOptions =
    useMemo(() => {
      const names = new Set(
        leaveData
          .map(
            (item) =>
              item.approvedBy
          )
          .filter(Boolean)
      );

      return Array.from(names);
    }, [leaveData]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalCount / rowsPerPage
    )
  );

  const safePage = Math.min(
    currentPage,
    totalPages
  );

  const visibleData =
    filteredData;

  const allSelected =
    visibleData.length > 0 &&
    visibleData.every((item) =>
      selectedIds.includes(item.id)
    );

  const handleSelectAll = () => {
    const ids =
      visibleData.map(
        (item) => item.id
      );

    if (allSelected) {
      setSelectedIds((prev) =>
        prev.filter(
          (id) =>
            !ids.includes(id)
        )
      );
    } else {
      setSelectedIds((prev) => [
        ...new Set([
          ...prev,
          ...ids,
        ]),
      ]);
    }
  };

  const toggleSelect = (
    id: string
  ) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter(
            (item) => item !== id
          )
        : [...prev, id]
    );
  };

  // ===================================================
  // CHAT MODAL
  // ===================================================

  const openChatModal = (
    item: LeaveItem
  ) => {
    setSelectedLeave(item);
    setChatMessage("");
    setShowChatModal(true);
  };

  const closeChatModal = () => {
    setShowChatModal(false);
    setSelectedLeave(null);
  };

  // ===================================================
  // VIEW MODAL
  // ===================================================

  const openViewModal = async (
    item: LeaveItem
  ) => {
    setSelectedLeave(item);
    setShowViewModal(true);

    try {
      const token =
        localStorage.getItem("token");

      if (!token) return;

      const response =
        await getLeaveById(
          item.id,
          token
        );

      const raw =
        response?.data ??
        response;

      setSelectedLeave(
        normalizeLeave(raw)
      );
    } catch (err) {
      console.error(
        "Failed to load leave detail",
        err
      );
    }
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedLeave(null);
  };

  // ===================================================
  // EDIT MODAL
  // ===================================================

  const openEditModal = (
    item: LeaveItem
  ) => {
    setSelectedLeave(item);

    setForm({
      leaveTypeId:
        item.leaveTypeId,

      from: formatDateForInput(
        item.fromRaw
      ),

      to: formatDateForInput(
        item.toRaw
      ),

      availType:
        item.availType,

      days: item.days.replace(
        /[^0-9]/g,
        ""
      ),

      reasonText:
        item.description,

      attachment: null,
    });

    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedLeave(null);
    setForm(emptyForm);
  };

  const handleEditLeave = async (
    e: FormEvent
  ) => {
    e.preventDefault();

    if (!selectedLeave) return;

    if (
      !form.leaveTypeId ||
      !form.from ||
      !form.to ||
      !form.reasonText
    ) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Authentication token is missing. Please login again."
        );
      }

      const userId =
        localStorage.getItem(
          "userId"
        ) || undefined;

      const payload: LeavePayload =
        {
          UserId: userId,

          LeaveTypeMasterId:
            form.leaveTypeId,

          FromDate:
            toIsoDateTime(
              form.from
            ),

          ToDate:
            toIsoDateTime(
              form.to
            ),

          AvailType:
            form.availType,

          Reason:
            form.reasonText,

          Attachment:
            form.attachment,
        };

      await updateLeave(
        selectedLeave.id,
        payload,
        token
      );

      closeEditModal();

      await fetchLeaves();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update leave."
      );
    } finally {
      setSaving(false);
    }
  };

  // ===================================================
  // DELETE MODAL
  // ===================================================

  const openDeleteModal = (
    item: LeaveItem
  ) => {
    setSelectedLeave(item);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedLeave(null);
  };

  const handleDeleteLeave =
    async () => {
      if (!selectedLeave) return;

      setSaving(true);
      setError(null);

      try {
        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          throw new Error(
            "Authentication token is missing. Please login again."
          );
        }

        await deleteLeave(
          selectedLeave.id,
          token
        );

        setSelectedIds((prev) =>
          prev.filter(
            (id) =>
              id !==
              selectedLeave.id
          )
        );

        setShowDeleteModal(false);
        setSelectedLeave(null);

        await fetchLeaves();
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to delete leave."
        );
      } finally {
        setSaving(false);
      }
    };

  // ===================================================
  // ADD MODAL
  // ===================================================

  const handleAddLeave = async (
    e: FormEvent
  ) => {
    e.preventDefault();

    if (
      !form.leaveTypeId ||
      !form.from ||
      !form.to ||
      !form.reasonText
    ) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Authentication token is missing. Please login again."
        );
      }

      const userId =
        localStorage.getItem(
          "userId"
        ) || undefined;

      const payload: LeavePayload =
        {
          UserId: userId,

          LeaveTypeMasterId:
            form.leaveTypeId,

          FromDate:
            toIsoDateTime(
              form.from
            ),

          ToDate:
            toIsoDateTime(
              form.to
            ),

          AvailType:
            form.availType,

          Reason:
            form.reasonText,

          Attachment:
            form.attachment,
        };

      await addLeave(
        payload,
        token
      );

      setShowAddModal(false);
      setForm(emptyForm);
      setCurrentPage(1);

      await fetchLeaves();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to add leave."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>
        {`
        * {
          box-sizing: border-box;
        }

        .leave-page {
          width: 100%;
          min-height: calc(100vh - 50px);
          padding: 24px 25px 25px;
          background: #f8f9fb;
          color: #10203f;
          font-family: "Inter","Segoe UI",sans-serif;
        }

        .leave-page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 28px;
        }

        .leave-page-title {
          margin: 0 0 6px;
          color: #10203f;
          font-size: 24px;
          font-weight: 700;
        }

        .leave-breadcrumb {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
        }

        .leave-home {
          padding: 0;
          border: 0;
          background: transparent;
          color: #526b7d;
          cursor: pointer;
        }

        .leave-home i {
          font-size: 13px;
        }

        .leave-slash {
          color: #c3cad3;
        }

        .add-leave-btn {
          height: 40px;
          padding: 0 15px;
          border: 0;
          border-radius: 5px;
          background: #c39237;
          color: #fff;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .leave-summary {
          display: flex;
          gap: 24px;
          margin-bottom: 23px;
        }

        .leave-summary-card {
          width: 247px;
          height: 111px;
          position: relative;
          overflow: hidden;
          padding: 22px 20px;
          border: 1px solid #dde2e8;
          border-radius: 5px;
          background: #fff;
          box-shadow: 0 1px 2px rgba(0,0,0,.07);
        }

        .summary-title,
        .summary-count,
        .summary-remaining {
          position: relative;
          z-index: 3;
        }

        .summary-title {
          color: #677386;
          font-size: 13px;
        }

        .summary-count {
          color: #10203f;
          font-size: 18px;
          font-weight: 600;
        }

        .summary-remaining {
          display: inline-flex;
          padding: 3px 7px;
          border-radius: 4px;
          font-size: 10px;
        }

        .summary-remaining.grey {
          background: #edf2f4;
          color: #4b7380;
        }

        .summary-remaining.blue {
          background: #dcecff;
          color: #1680ff;
        }

        .summary-background {
          width: 90px;
          height: 90px;
          position: absolute;
          top: -12px;
          right: 9px;
          border-radius: 50%;
        }

        .summary-background.grey {
          background: #e9eaeb;
        }

        .summary-background.blue {
          background: #dcecff;
        }

        .summary-icon {
          width: 80px;
          height: 80px;
          position: absolute;
          top: -1px;
          right: -2px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
        }

        .summary-icon.dark {
          background: #20252b;
        }

        .summary-icon.blue {
          background: #2687f8;
        }

        .summary-icon i {
          font-size: 30px;
        }

        .leave-tabs {
          display: flex;
          gap: 9px;
          margin-bottom: 16px;
        }

        .leave-tab {
          height: 37px;
          padding: 0 16px;
          border: 0;
          border-radius: 5px;
          background: transparent;
          color: #657286;
          font-size: 13px;
          cursor: pointer;
        }

        .leave-tab.active {
          background: #c39237;
          color: #fff;
          font-weight: 500;
        }

        .leave-tab-note {
          margin: -8px 0 16px;
          color: #8a94a3;
          font-size: 12px;
        }

        .leave-error-banner {
          margin: 0 0 16px;
          padding: 10px 14px;
          border: 1px solid #f3b6b6;
          border-radius: 5px;
          background: #fdeaea;
          color: #a31414;
          font-size: 13px;
        }

        .leave-list-card {
          width: 100%;
          overflow: hidden;
          border: 1px solid #dde2e8;
          border-radius: 5px;
          background: #fff;
        }

        .leave-list-header {
          min-height: 71px;
          padding: 14px 20px;
          border-bottom: 1px solid #dde2e8;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .leave-list-header h5 {
          margin: 0;
          color: #13213e;
          font-size: 15px;
          font-weight: 600;
        }

        .leave-filters {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .leave-filter {
          height: 39px;
          padding: 0 10px;
          border: 1px solid #dce1e7;
          border-radius: 5px;
          outline: none;
          background: #fff;
          color: #11203d;
          font-size: 13px;
        }

        .leave-date-filter {
          width: 195px;
        }

        .leave-type-filter {
          width: 140px;
        }

        .leave-approved-filter {
          width: 140px;
        }

        .leave-status-filter {
          width: 123px;
        }

        .leave-sort-filter {
          width: 167px;
        }

        .leave-toolbar {
          min-height: 61px;
          padding: 10px 16px;
          border-bottom: 1px solid #e1e5e9;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .leave-row-control {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #26354d;
          font-size: 13px;
        }

        .leave-row-select {
          width: 49px;
          height: 29px;
          border: 1px solid #dce1e7;
          border-radius: 6px;
          background: #fff;
          font-size: 12px;
        }

        .leave-search {
          width: 160px;
          height: 30px;
          padding: 0 14px;
          border: 1px solid #dce1e7;
          border-radius: 5px;
          outline: none;
          font-size: 12px;
        }

        .leave-table-scroll {
          width: 100%;
          overflow-x: auto;
          overflow-y: hidden;
          scrollbar-width: thin;
          scrollbar-color: #c8cdd4 #f1f2f4;
        }

        .leave-table-scroll::-webkit-scrollbar {
          height: 7px;
        }

        .leave-table-scroll::-webkit-scrollbar-track {
          background: #f0f1f3;
        }

        .leave-table-scroll::-webkit-scrollbar-thumb {
          background: #c8cdd4;
          border-radius: 10px;
        }

        .leave-table {
          width: 100%;
          min-width: 1420px;
          margin: 0;
          border-collapse: collapse;
        }

        .leave-table.employee {
          min-width: 1580px;
        }

        .leave-table thead {
          background: #e1e4e9;
        }

        .leave-table th {
          height: 43px;
          padding: 0 13px;
          vertical-align: middle;
          color: #07152e;
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
        }

        .leave-table td {
          height: 63px;
          padding: 0 13px;
          vertical-align: middle;
          border-bottom: 1px solid #dfe3e8;
          background: #fff;
          color: #5b687a;
          font-size: 13px;
          white-space: nowrap;
        }

        .checkbox-col {
          width: 60px;
          min-width: 60px;
          text-align: center;
        }

        .leave-checkbox {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .sort-icon {
          float: right;
          margin-left: 8px;
          color: #cbd1d9;
          font-size: 10px;
        }

        .user-box {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .user-avatar {
          width: 33px;
          height: 33px;
          min-width: 33px;
          position: relative;
          border-radius: 50%;
          background: #d6d6d6;
        }

        .user-avatar::after {
          content: "...";
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #aaa;
          font-size: 8px;
        }

        .user-name {
          margin-bottom: 2px;
          color: #06142e;
          font-size: 13px;
          font-weight: 500;
        }

        .user-role {
          color: #7a8595;
          font-size: 11px;
        }

        .reason-box {
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }

        .reason-box i {
          color: #087fff;
          font-size: 13px;
        }

        .status-badge {
          height: 31px;
          padding: 0 10px;
          border: 1px solid #dce1e7;
          border-radius: 5px;
          background: #fff;
          color: #07142e;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
        }

        .status-dot-wrap {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .status-dot-wrap::after {
          content: "";
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .status-approved {
          background: #d8f8e8;
        }

        .status-approved::after {
          background: #20c77a;
        }

        .status-reject {
          background: #ffdcdc;
        }

        .status-reject::after {
          background: #ef4949;
        }

        .status-new {
          background: #f3ddf7;
        }

        .status-new::after {
          background: #bd4fd0;
        }

        .action-column {
          min-width: 235px;
          width: 235px;
        }

        .leave-actions {
          display: inline-flex;
          align-items: center;
          gap: 14px;
        }

        .action-icon {
          width: 20px;
          height: 25px;
          padding: 0;
          border: 0;
          background: transparent;
          color: #506b80;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .action-icon:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

        .action-icon i {
          font-size: 15px;
        }

        .approve-btn,
        .reject-btn {
          height: 29px;
          padding: 0 11px;
          border: 0;
          border-radius: 5px;
          color: #fff;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .approve-btn {
          background: #08bf62;
        }

        .reject-btn {
          background: #f20e0e;
        }

        .leave-footer {
          min-height: 57px;
          padding: 0 16px;
          border-top: 5px solid #f0f1f3;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #596679;
          font-size: 13px;
        }

        .pagination {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .pagination button {
          padding: 0;
          border: 0;
          background: transparent;
          color: #a2a9b4;
          font-size: 20px;
          cursor: pointer;
        }

        .pagination button:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

        .page-number {
          width: 27px;
          height: 27px;
          border-radius: 50%;
          background: #c39237;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }

        .modal-overlay-custom {
          position: fixed;
          inset: 0;
          z-index: 99999;
          padding: 15px;
          background: rgba(0,0,0,.43);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-card-custom {
          width: 800px;
          max-width: calc(100vw - 30px);
          overflow: hidden;
          border-radius: 5px;
          background: #fff;
          box-shadow: 0 15px 45px rgba(0,0,0,.22);
        }

        .custom-modal-header {
          height: 64px;
          padding: 0 17px;
          border-bottom: 1px solid #e3e7eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .custom-modal-header h3 {
          margin: 0;
          color: #1e2b49;
          font-size: 20px;
          font-weight: 600;
        }

        .modal-close-custom {
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
          font-size: 14px;
          line-height: 1;
          cursor: pointer;
        }

        .chat-modal {
          width: 800px;
          height: 477px;
          max-width: calc(100vw - 30px);
          max-height: calc(100vh - 30px);
          border-radius: 5px;
          overflow: hidden;
          background: #fff;
          display: flex;
          flex-direction: column;
        }

        .chat-header {
          height: 63px;
          padding: 8px 16px;
          border-bottom: 1px solid #e4e7eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .chat-user {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .chat-avatar {
          width: 45px;
          height: 45px;
          position: relative;
          border-radius: 50%;
          background: #d7d7d7;
        }

        .chat-avatar::after {
          content: "300 × 300";
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #aaa;
          font-size: 6px;
        }

        .chat-online-dot {
          width: 10px;
          height: 10px;
          position: absolute;
          right: -1px;
          bottom: 2px;
          border: 2px solid #fff;
          border-radius: 50%;
          background: #08c56a;
          z-index: 2;
        }

        .chat-name {
          color: #06142e;
          font-size: 14px;
          font-weight: 500;
        }

        .chat-online {
          color: #06142e;
          font-size: 12px;
        }

        .chat-body {
          flex: 1;
          overflow-y: auto;
          padding: 15px 48px 18px;
        }

        .chat-left-row {
          display: flex;
          align-items: flex-end;
          gap: 9px;
          margin-bottom: 12px;
        }

        .chat-left-content {
          max-width: 460px;
        }

        .chat-left-message,
        .chat-small-message {
          background: #f6f7f8;
          color: #06142e;
          font-size: 13px;
        }

        .chat-left-message {
          padding: 16px;
          border-radius: 18px 18px 18px 0;
          line-height: 1.55;
        }

        .chat-small-message {
          padding: 14px 16px;
          border-radius: 18px 18px 18px 0;
        }

        .chat-meta {
          margin-top: 4px;
          color: #667386;
          font-size: 12px;
        }

        .chat-meta strong {
          color: #24415d;
          font-weight: 500;
        }

        .chat-separator {
          margin: 0 7px;
          color: #d9dde2;
        }

        .chat-right-row {
          display: flex;
          justify-content: flex-end;
          margin-top: 35px;
        }

        .chat-right-content {
          display: flex;
          align-items: flex-end;
          gap: 9px;
        }

        .chat-right-box {
          max-width: 245px;
        }

        .chat-right-message {
          padding: 17px 16px;
          border-radius: 18px 18px 0 18px;
          background: #f6f7f8;
          color: #06142e;
          font-size: 13px;
          line-height: 1.45;
        }

        .chat-right-meta {
          margin-top: 4px;
          text-align: right;
          color: #667386;
          font-size: 12px;
        }

        .chat-check {
          margin-right: 7px;
          color: #07c76a;
        }

        .chat-footer {
          padding: 10px 16px;
          border-top: 1px solid #e4e7eb;
        }

        .chat-input {
          height: 48px;
          padding: 0 9px;
          border-radius: 8px;
          background: #f7f8f9;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .chat-input input {
          flex: 1;
          border: 0;
          outline: none;
          background: transparent;
          color: #596679;
          font-size: 13px;
        }

        .chat-send {
          width: 33px;
          height: 33px;
          padding: 0;
          border: 0;
          border-radius: 8px;
          background: #c39237;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .view-body {
          padding: 33px 16px 22px;
        }

        .view-grid {
          display: grid;
          grid-template-columns: repeat(2,1fr);
          gap: 26px 70px;
        }

        .view-label {
          margin-bottom: 4px;
          color: #464e5a;
          font-size: 13px;
        }

        .view-value {
          color: #253452;
          font-size: 18px;
          font-weight: 600;
        }

        .form-modal {
          max-height: calc(100vh - 25px);
          overflow-y: auto;
        }

        .form-modal-body {
          padding: 20px 16px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2,minmax(0,1fr));
          gap: 17px 24px;
        }

        .form-full {
          grid-column: 1 / -1;
        }

        .form-field label {
          display: block;
          margin-bottom: 8px;
          color: #263452;
          font-size: 13px;
          font-weight: 500;
        }

        .form-field input,
        .form-field select,
        .form-field textarea {
          width: 100%;
          border: 1px solid #dce1e7;
          border-radius: 5px;
          outline: none;
          background: #fff;
          color: #26344d;
          font-size: 13px;
        }

        .form-field input,
        .form-field select {
          height: 39px;
          padding: 0 10px;
        }

        .form-field textarea {
          min-height: 84px;
          padding: 10px;
          resize: none;
        }

        .form-footer {
          min-height: 64px;
          padding: 10px 13px;
          border-top: 1px solid #e4e7eb;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 8px;
        }

        .cancel-btn,
        .save-btn {
          height: 39px;
          padding: 0 15px;
          border: 0;
          border-radius: 5px;
          font-size: 13px;
          cursor: pointer;
        }

        .cancel-btn {
          background: #f7f8f9;
          color: #172033;
        }

        .save-btn {
          background: #c39237;
          color: #fff;
          font-weight: 600;
        }

        .save-btn:disabled,
        .delete-confirm-btn:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        .delete-modal {
          width: 400px;
          max-width: calc(100vw - 30px);
          padding: 17px 30px;
          border-radius: 5px;
          background: #fff;
          text-align: center;
          box-shadow: 0 15px 45px rgba(0,0,0,.22);
        }

        .delete-icon-box {
          width: 58px;
          height: 58px;
          margin: 0 auto 14px;
          border-radius: 4px;
          background: #f7cccc;
          color: #f20d17;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .delete-icon-box i {
          font-size: 31px;
        }

        .delete-modal-title {
          margin: 0 0 6px;
          color: #1d2b48;
          font-size: 19px;
          font-weight: 600;
        }

        .delete-modal-text {
          max-width: 330px;
          margin: 0 auto 17px;
          color: #3e4654;
          font-size: 13px;
          line-height: 1.55;
        }

        .delete-modal-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }

        .delete-cancel-btn,
        .delete-confirm-btn {
          height: 39px;
          padding: 0 16px;
          border: 0;
          border-radius: 5px;
          font-size: 13px;
          cursor: pointer;
        }

        .delete-cancel-btn {
          background: #f6f7f8;
          color: #172033;
        }

        .delete-confirm-btn {
          background: #f10d16;
          color: #fff;
          font-weight: 600;
        }

        @media(max-width:900px) {
          .leave-list-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .leave-filters {
            flex-wrap: wrap;
          }
        }

        @media(max-width:650px) {
          .leave-page {
            padding: 18px 12px;
          }

          .leave-summary {
            flex-direction: column;
          }

          .leave-summary-card {
            width: 100%;
          }

          .leave-toolbar {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }

          .leave-search {
            width: 100%;
          }

          .form-grid,
          .view-grid {
            grid-template-columns: 1fr;
          }

          .form-full {
            grid-column: auto;
          }
        }
        `}
      </style>

      <div className="leave-page">

        <div className="leave-page-header">

          <div>
            <h1 className="leave-page-title">
              Leaves
            </h1>

            <div className="leave-breadcrumb">

              <button
                type="button"
                className="leave-home"
                onClick={() =>
                  navigate(
                    "/Employee/EmployeDashboard"
                  )
                }
              >
                <i className="ti ti-smart-home" />
              </button>

              <span className="leave-slash">
                /
              </span>

              <span>
                Leaves
              </span>
            </div>
          </div>

          <button
            type="button"
            className="add-leave-btn"
            onClick={() => {
              setForm(emptyForm);
              setShowAddModal(true);
            }}
          >
            <i className="ti ti-circle-plus" />
            Add Leave
          </button>
        </div>

        <div className="leave-summary">

          <div className="leave-summary-card">

            <div className="summary-background grey" />

            <div className="summary-icon dark">
              <i className="ti ti-calendar-event" />
            </div>

            <div className="summary-title">
              Earned Leave (EL)
            </div>

            <div className="summary-count">
              20
            </div>

            <span className="summary-remaining grey">
              Remaining Leaves : 12
            </span>
          </div>

          <div className="leave-summary-card">

            <div className="summary-background blue" />

            <div className="summary-icon blue">
              <i className="ti ti-vaccine" />
            </div>

            <div className="summary-title">
              General Leave (GL)
            </div>

            <div className="summary-count">
              10
            </div>

            <span className="summary-remaining blue">
              Remaining Leaves : 8
            </span>
          </div>
        </div>

        <div className="leave-tabs">

          <button
            type="button"
            className={`leave-tab ${
              activeTab === "myLeaves"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setActiveTab("myLeaves");
              setCurrentPage(1);
              setSelectedIds([]);
            }}
          >
            My Leaves
          </button>

          <button
            type="button"
            className={`leave-tab ${
              activeTab === "employeeLeaves"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setActiveTab(
                "employeeLeaves"
              );
              setCurrentPage(1);
              setSelectedIds([]);
            }}
          >
            Employee Leaves
          </button>
        </div>

        {activeTab ===
          "employeeLeaves" && (
          <div className="leave-tab-note">
            Showing data from the "my-leaves" endpoint — wire in a
            dedicated all-employees endpoint here once it's available.
          </div>
        )}

        {error && (
          <div className="leave-error-banner">
            {error}
          </div>
        )}

        <div className="leave-list-card">

          <div className="leave-list-header">

            <h5>
              Leave List
            </h5>

            <div className="leave-filters">

              <select
                className="leave-filter leave-date-filter"
                defaultValue="range"
              >
                <option value="range">
                  08/28/2026 - 09/03/20
                </option>
              </select>

              <select
                className="leave-filter leave-type-filter"
                value={leaveTypeFilter}
                onChange={(e) => {
                  setLeaveTypeFilter(
                    e.target.value
                  );
                  setCurrentPage(1);
                }}
              >
                <option value="">
                  Leave Type
                </option>

                {leaveTypes.map(
                  (type) => (
                    <option
                      key={type.id}
                      value={type.id}
                    >
                      {type.name}
                    </option>
                  )
                )}
              </select>

              <select
                className="leave-filter leave-approved-filter"
                value={approvedFilter}
                onChange={(e) => {
                  setApprovedFilter(
                    e.target.value
                  );
                  setCurrentPage(1);
                }}
              >
                <option value="">
                  Approved By
                </option>

                {approvedByOptions.map(
                  (name) => (
                    <option
                      key={name}
                      value={name}
                    >
                      {name}
                    </option>
                  )
                )}
              </select>

              <select
                className="leave-filter leave-status-filter"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(
                    e.target.value
                  );
                  setCurrentPage(1);
                }}
              >
                <option value="">
                  Select Status
                </option>

                <option value="Approved">
                  Approved
                </option>

                <option value="Reject">
                  Reject
                </option>

                <option value="New">
                  New
                </option>
              </select>

              <select
                className="leave-filter leave-sort-filter"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(
                    e.target.value
                  );
                  setCurrentPage(1);
                }}
              >
                <option value="">
                  Sort By
                </option>

                <option value="Ascending">
                  Ascending
                </option>

                <option value="Descending">
                  Descending
                </option>
              </select>
            </div>
          </div>

          <div className="leave-toolbar">

            <div className="leave-row-control">

              <span>
                Row Per Page
              </span>

              <select
                className="leave-row-select"
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(
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
              </select>

              <span>
                Entries
              </span>
            </div>

            <input
              type="text"
              className="leave-search"
              placeholder="Search"
              value={search}
              onChange={(e) => {
                setSearch(
                  e.target.value
                );
              }}
            />
          </div>

          <div className="leave-table-scroll">

            <table
              className={`leave-table ${
                activeTab ===
                "employeeLeaves"
                  ? "employee"
                  : ""
              }`}
            >
              <thead>
                <tr>

                  <th className="checkbox-col">
                    <input
                      type="checkbox"
                      className="leave-checkbox"
                      checked={
                        allSelected
                      }
                      onChange={
                        handleSelectAll
                      }
                    />
                  </th>

                  {activeTab ===
                    "employeeLeaves" && (
                    <th>
                      Name
                      <span className="sort-icon">
                        ↑↓
                      </span>
                    </th>
                  )}

                  <th>
                    Leave Reason
                    <span className="sort-icon">
                      ↑↓
                    </span>
                  </th>

                  <th>
                    Date of request
                    <span className="sort-icon">
                      ↑↓
                    </span>
                  </th>

                  <th>
                    From
                    <span className="sort-icon">
                      ↑↓
                    </span>
                  </th>

                  <th>
                    To
                    <span className="sort-icon">
                      ↑↓
                    </span>
                  </th>

                  <th>
                    Approved By
                    <span className="sort-icon">
                      ↑↓
                    </span>
                  </th>

                  <th>
                    No of Days
                    <span className="sort-icon">
                      ↑↓
                    </span>
                  </th>

                  <th>
                    Status
                    <span className="sort-icon">
                      ↑↓
                    </span>
                  </th>

                  <th className="action-column" />
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td
                      colSpan={
                        activeTab ===
                        "employeeLeaves"
                          ? 10
                          : 9
                      }
                      style={{
                        height:
                          "90px",
                        textAlign:
                          "center",
                      }}
                    >
                      Loading leaves...
                    </td>
                  </tr>
                )}

                {!loading &&
                  visibleData.map(
                    (item) => (
                      <tr
                        key={item.id}
                      >

                        <td className="checkbox-col">
                          <input
                            type="checkbox"
                            className="leave-checkbox"
                            checked={selectedIds.includes(
                              item.id
                            )}
                            onChange={() =>
                              toggleSelect(
                                item.id
                              )
                            }
                          />
                        </td>

                        {activeTab ===
                          "employeeLeaves" && (
                          <td>
                            <UserDisplay
                              name={
                                item.employee ||
                                "-"
                              }
                              role={
                                item.department ||
                                ""
                              }
                            />
                          </td>
                        )}

                        <td>
                          <div className="reason-box">
                            {item.leaveTypeName}
                            <i className="ti ti-info-circle" />
                          </div>
                        </td>

                        <td>
                          {
                            item.requestDate
                          }
                        </td>

                        <td>
                          {item.from}
                        </td>

                        <td>
                          {item.to}
                        </td>

                        <td>
                          <UserDisplay
                            name={
                              item.approvedBy
                            }
                            role={
                              item.approvedByRole
                            }
                          />
                        </td>

                        <td>
                          {item.days}
                        </td>

                        <td>
                          <StatusBadge
                            status={
                              item.status
                            }
                          />
                        </td>

                        <td className="action-column">

                          <div className="leave-actions">

                            {activeTab ===
                              "employeeLeaves" &&
                              item.status ===
                                "New" && (
                                <>
                                  <button
                                    type="button"
                                    className="approve-btn"
                                    onClick={() =>
                                      openChatModal(
                                        item
                                      )
                                    }
                                  >
                                    Approve
                                  </button>

                                  <button
                                    type="button"
                                    className="reject-btn"
                                    onClick={() =>
                                      openChatModal(
                                        item
                                      )
                                    }
                                  >
                                    Reject
                                  </button>
                                </>
                              )}

                            {!(
                              activeTab ===
                                "employeeLeaves" &&
                              item.status ===
                                "New"
                            ) && (
                              <button
                                type="button"
                                className="action-icon"
                                title="Message"
                                onClick={() =>
                                  openChatModal(
                                    item
                                  )
                                }
                              >
                                <i className="ti ti-messages" />
                              </button>
                            )}

                            <button
                              type="button"
                              className="action-icon"
                              title="View"
                              onClick={() =>
                                openViewModal(
                                  item
                                )
                              }
                            >
                              <i className="ti ti-eye" />
                            </button>

                            <button
                              type="button"
                              className="action-icon"
                              title="Edit"
                              onClick={() =>
                                openEditModal(
                                  item
                                )
                              }
                            >
                              <i className="ti ti-edit" />
                            </button>

                            <button
                              type="button"
                              className="action-icon"
                              title="Delete"
                              disabled={
                                saving
                              }
                              onClick={() =>
                                openDeleteModal(
                                  item
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

                {!loading &&
                  visibleData.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={
                          activeTab ===
                          "employeeLeaves"
                            ? 10
                            : 9
                        }
                        style={{
                          height:
                            "90px",
                          textAlign:
                            "center",
                        }}
                      >
                        No leave records found
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>

          <div className="leave-footer">

            <div>
              Showing{" "}
              {totalCount === 0
                ? 0
                : (safePage - 1) *
                    rowsPerPage +
                  1}
              {" - "}
              {Math.min(
                safePage *
                  rowsPerPage,
                totalCount
              )}{" "}
              of{" "}
              {totalCount} entries
            </div>

            <div className="pagination">

              <button
                type="button"
                disabled={
                  safePage === 1
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
                ‹
              </button>

              <span className="page-number">
                {safePage}
              </span>

              <button
                type="button"
                disabled={
                  safePage ===
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
                ›
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CHAT MODAL */}

      {showChatModal &&
        selectedLeave && (
          <div className="modal-overlay-custom">

            <div className="chat-modal">

              <div className="chat-header">

                <div className="chat-user">

                  <div className="chat-avatar">
                    <span className="chat-online-dot" />
                  </div>

                  <div>
                    <div className="chat-name">
                      {selectedLeave.employee ||
                        "-"}
                    </div>

                    <div className="chat-online">
                      Online
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="modal-close-custom"
                  onClick={
                    closeChatModal
                  }
                >
                  ×
                </button>
              </div>

              <div className="chat-body">

                <div className="chat-left-row">

                  <div className="chat-left-content">

                    <div className="chat-left-message">
                      Hi, I wanted to update you on this leave request.
                    </div>

                    <div className="chat-meta">
                      <strong>
                        {selectedLeave.employee ||
                          "Employee"}
                      </strong>

                      <span className="chat-separator">
                        ●
                      </span>

                      08:00 AM
                    </div>
                  </div>

                  <span>
                    ⋮
                  </span>
                </div>

                <div className="chat-right-row">

                  <div className="chat-right-content">

                    <div className="chat-right-box">

                      <div className="chat-right-message">
                        Sure, let me know if you need anything else.
                      </div>

                      <div className="chat-right-meta">
                        <span className="chat-check">
                          ✓✓
                        </span>

                        08:00 AM

                        <span className="chat-separator">
                          ●
                        </span>

                        You
                      </div>
                    </div>

                    <div className="chat-avatar" />
                  </div>
                </div>
              </div>

              <div className="chat-footer">

                <div className="chat-input">

                  <input
                    type="text"
                    placeholder="Type Your Message"
                    value={
                      chatMessage
                    }
                    onChange={(e) =>
                      setChatMessage(
                        e.target.value
                      )
                    }
                  />

                  <button
                    type="button"
                    className="chat-send"
                    onClick={() =>
                      setChatMessage("")
                    }
                  >
                    <i className="ti ti-send" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* VIEW MODAL */}

      {showViewModal &&
        selectedLeave && (
          <div className="modal-overlay-custom">

            <div className="modal-card-custom">

              <div className="custom-modal-header">

                <h3>
                  View Leave
                </h3>

                <button
                  type="button"
                  className="modal-close-custom"
                  onClick={
                    closeViewModal
                  }
                >
                  ×
                </button>
              </div>

              <div className="view-body">

                <div className="view-grid">

                  <ViewItem
                    label="Leave Reason"
                    value={
                      selectedLeave.leaveTypeName
                    }
                  />

                  <ViewItem
                    label="From"
                    value={
                      selectedLeave.from
                    }
                  />

                  <ViewItem
                    label="To"
                    value={
                      selectedLeave.to
                    }
                  />

                  <ViewItem
                    label="Leave Type"
                    value={availTypeLabel(
                      selectedLeave.availType
                    )}
                  />

                  <ViewItem
                    label="No of Days"
                    value={
                      selectedLeave.days
                        .replace(
                          /[^0-9]/g,
                          ""
                        )
                        .padStart(
                          2,
                          "0"
                        )
                    }
                  />

                  <ViewItem
                    label="Reason"
                    value={
                      selectedLeave.description ||
                      "-"
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}

      {/* EDIT MODAL */}

      {showEditModal &&
        selectedLeave && (
          <div className="modal-overlay-custom">

            <div className="modal-card-custom form-modal">

              <div className="custom-modal-header">

                <h3>
                  Edit Leave
                </h3>

                <button
                  type="button"
                  className="modal-close-custom"
                  onClick={
                    closeEditModal
                  }
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={
                  handleEditLeave
                }
              >

                <div className="form-modal-body">

                  <div className="form-grid">

                    <div className="form-field form-full">
                      <label>
                        Leave Reason
                      </label>

                      <select
                        value={
                          form.leaveTypeId
                        }
                        onChange={(e) =>
                          setForm(
                            (prev) => ({
                              ...prev,
                              leaveTypeId:
                                e.target.value,
                            })
                          )
                        }
                      >
                        <option value="">
                          Select Leave Reason
                        </option>

                        {leaveTypes.map(
                          (type) => (
                            <option
                              key={
                                type.id
                              }
                              value={
                                type.id
                              }
                            >
                              {
                                type.name
                              }
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    {/* FROM - DD/MM/YYYY */}

                    <div className="form-field">
  <label>From</label>

  <div className="date-input-wrapper">
    <input
      type="date"
      value={ddmmyyyyToISO(form.from) || ""}
      onChange={(e) => {
        setForm((prev) => ({
          ...prev,
          from: isoToDDMMYYYY(e.target.value),
        }));
      }}
    />
  </div>
</div>

                    {/* TO - DD/MM/YYYY */}

                    <div className="form-field">
                      <label>
                        To
                      </label>

                      <input
                        type="text"
                        placeholder="DD/MM/YYYY"
                        inputMode="numeric"
                        maxLength={10}
                        value={
                          form.to
                        }
                        onChange={(
                          e
                        ) => {
                          setForm(
                            (prev) => ({
                              ...prev,
                              to:
                                formatDateTyping(
                                  e.target
                                    .value
                                ),
                            })
                          );
                        }}
                      />
                    </div>

                    <div className="form-field">
                      <label>
                        Leave Type
                      </label>

                      <select
                        value={
                          form.availType
                        }
                        onChange={(e) =>
                          setForm(
                            (prev) => ({
                              ...prev,
                              availType:
                                Number(
                                  e.target
                                    .value
                                ),
                            })
                          )
                        }
                      >
                        {AVAIL_TYPE_OPTIONS.map(
                          (option) => (
                            <option
                              key={
                                option.value
                              }
                              value={
                                option.value
                              }
                            >
                              {
                                option.label
                              }
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div className="form-field">
                      <label>
                        No of Days
                      </label>

                      <input
                        type="text"
                        readOnly
                        value={
                          form.days
                            ? form.days.padStart(
                                2,
                                "0"
                              )
                            : ""
                        }
                      />
                    </div>

                    <div className="form-field form-full">
                      <label>
                        Upload File
                      </label>

                      <input
                        type="file"
                        onChange={(e) =>
                          setForm(
                            (prev) => ({
                              ...prev,
                              attachment:
                                e
                                  .target
                                  .files?.[0] ||
                                null,
                            })
                          )
                        }
                      />
                    </div>

                    <div className="form-field form-full">
                      <label>
                        Reason
                      </label>

                      <textarea
                        value={
                          form.reasonText
                        }
                        onChange={(e) =>
                          setForm(
                            (prev) => ({
                              ...prev,
                              reasonText:
                                e.target
                                  .value,
                            })
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="form-footer">

                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={
                      closeEditModal
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="save-btn"
                    disabled={
                      saving
                    }
                  >
                    {saving
                      ? "Saving..."
                      : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      {/* DELETE MODAL */}

      {showDeleteModal &&
        selectedLeave && (
          <div className="modal-overlay-custom">

            <div className="delete-modal">

              <div className="delete-icon-box">
                <i className="ti ti-trash-x" />
              </div>

              <h3 className="delete-modal-title">
                Confirm Delete
              </h3>

              <p className="delete-modal-text">
                You want to delete this leave request, this can't be undone once you delete.
              </p>

              <div className="delete-modal-actions">

                <button
                  type="button"
                  className="delete-cancel-btn"
                  onClick={
                    closeDeleteModal
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="delete-confirm-btn"
                  disabled={
                    saving
                  }
                  onClick={
                    handleDeleteLeave
                  }
                >
                  {saving
                    ? "Deleting..."
                    : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

      {/* ADD MODAL */}

      {showAddModal && (
        <div className="modal-overlay-custom">

          <div className="modal-card-custom form-modal">

            <div className="custom-modal-header">

              <h3>
                Add Leave
              </h3>

              <button
                type="button"
                className="modal-close-custom"
                onClick={() => {
                  setShowAddModal(
                    false
                  );
                  setForm(
                    emptyForm
                  );
                }}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={
                handleAddLeave
              }
            >

              <div className="form-modal-body">

                <div className="form-grid">

                  <div className="form-field form-full">
                    <label>
                      Leave Reason
                    </label>

                    <select
                      value={
                        form.leaveTypeId
                      }
                      onChange={(e) =>
                        setForm(
                          (prev) => ({
                            ...prev,
                            leaveTypeId:
                              e.target.value,
                          })
                        )
                      }
                    >
                      <option value="">
                        Select Leave Reason
                      </option>

                      {leaveTypes.map(
                        (type) => (
                          <option
                            key={
                              type.id
                            }
                            value={
                              type.id
                            }
                          >
                            {
                              type.name
                            }
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  {/* FROM - DD/MM/YYYY */}

                  <div className="form-field">
                    <label>
                      From
                    </label>

                    <input
                      type="text"
                      placeholder="DD/MM/YYYY"
                      inputMode="numeric"
                      maxLength={10}
                      value={
                        form.from
                      }
                      onChange={(e) =>
                        setForm(
                          (prev) => ({
                            ...prev,
                            from:
                              formatDateTyping(
                                e.target
                                  .value
                              ),
                          })
                        )
                      }
                    />
                  </div>

                  {/* TO - DD/MM/YYYY */}

                  <div className="form-field">
                    <label>
                      To
                    </label>

                    <input
                      type="text"
                      placeholder="DD/MM/YYYY"
                      inputMode="numeric"
                      maxLength={10}
                      value={
                        form.to
                      }
                      onChange={(e) =>
                        setForm(
                          (prev) => ({
                            ...prev,
                            to:
                              formatDateTyping(
                                e.target
                                  .value
                              ),
                          })
                        )
                      }
                    />
                  </div>

                  <div className="form-field">
                    <label>
                      Leave Type
                    </label>

                    <select
                      value={
                        form.availType
                      }
                      onChange={(e) =>
                        setForm(
                          (prev) => ({
                            ...prev,
                            availType:
                              Number(
                                e.target
                                  .value
                              ),
                          })
                        )
                      }
                    >
                      {AVAIL_TYPE_OPTIONS.map(
                        (option) => (
                          <option
                            key={
                              option.value
                            }
                            value={
                              option.value
                            }
                          >
                            {
                              option.label
                            }
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div className="form-field">
                    <label>
                      No of Days
                    </label>

                    <input
                      type="number"
                      value={
                        form.days
                      }
                      onChange={(e) =>
                        setForm(
                          (prev) => ({
                            ...prev,
                            days:
                              e.target
                                .value,
                          })
                        )
                      }
                    />
                  </div>

                  <div className="form-field form-full">
                    <label>
                      Upload File
                    </label>

                    <input
                      type="file"
                      onChange={(e) =>
                        setForm(
                          (prev) => ({
                            ...prev,
                            attachment:
                              e
                                .target
                                .files?.[0] ||
                              null,
                          })
                        )
                      }
                    />
                  </div>

                  <div className="form-field form-full">
                    <label>
                      Reason
                    </label>

                    <textarea
                      value={
                        form.reasonText
                      }
                      onChange={(e) =>
                        setForm(
                          (prev) => ({
                            ...prev,
                            reasonText:
                              e.target
                                .value,
                          })
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="form-footer">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowAddModal(
                      false
                    );
                    setForm(
                      emptyForm
                    );
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-btn"
                  disabled={
                    saving
                  }
                >
                  {saving
                    ? "Saving..."
                    : "Add Leave"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

interface UserDisplayProps {
  name: string;
  role: string;
}

const UserDisplay = ({
  name,
  role,
}: UserDisplayProps) => {
  return (
    <div className="user-box">

      <div className="user-avatar" />

      <div>
        <div className="user-name">
          {name}
        </div>

        <div className="user-role">
          {role}
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({
  status,
}: {
  status: LeaveStatus;
}) => {
  return (
    <span className="status-badge">

      <span
        className={`status-dot-wrap ${
          status === "Approved"
            ? "status-approved"
            : status === "Reject"
            ? "status-reject"
            : "status-new"
        }`}
      />

      {status}
    </span>
  );
};

interface ViewItemProps {
  label: string;
  value: string;
}

const ViewItem = ({
  label,
  value,
}: ViewItemProps) => {
  return (
    <div>
      <div className="view-label">
        {label}
      </div>

      <div className="view-value">
        {value}
      </div>
    </div>
  );
};

export default Leave;


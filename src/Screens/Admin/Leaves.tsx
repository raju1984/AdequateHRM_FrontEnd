import React, { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  MessageSquareMore,
  Pencil,
  Trash2,
  Info,
  UserRoundCheck,
  Send,
  MoreVertical,
} from "lucide-react";

type LeaveStatus = "Approved" | "Declined" | "New";
type LeaveTypeOption = "Full Day" | "First Half" | "Second Half";

interface LeaveItem {
  id: number;
  name: string;
  role: string;
  type: string;
  from: string;
  to: string;
  days: string;
  status: LeaveStatus;
  leaveType: LeaveTypeOption;
  reason: string;
}

interface LeaveForm {
  employee: string;
  leaveReason: string;
  from: string;
  to: string;
  leaveType: LeaveTypeOption | "";
  noOfDays: string;
  reason: string;
}

const initialLeaveData: LeaveItem[] = [
  {
    id: 1,
    name: "Anthony Lewis",
    role: "Finance",
    type: "Medical Leave",
    from: "14 Jan 2024",
    to: "15 Jan 2024",
    days: "2 Days",
    status: "Declined",
    leaveType: "First Half",
    reason: "Going to Hospital",
  },
  {
    id: 2,
    name: "Brian Villalobos",
    role: "Developer",
    type: "Casual Leave",
    from: "21 Jan 2024",
    to: "25 Jan 2024",
    days: "5 Days",
    status: "Approved",
    leaveType: "Full Day",
    reason: "Personal work",
  },
  {
    id: 3,
    name: "Harvey Smith",
    role: "Developer",
    type: "Medical Leave",
    from: "20 Feb 2024",
    to: "22 Feb 2024",
    days: "3 Days",
    status: "New",
    leaveType: "Full Day",
    reason: "Health issue",
  },
  {
    id: 4,
    name: "Stephan Peralt",
    role: "Executive Officer",
    type: "Annual Leave",
    from: "15 Mar 2024",
    to: "17 Mar 2024",
    days: "3 Days",
    status: "Approved",
    leaveType: "Full Day",
    reason: "Family vacation",
  },
  {
    id: 5,
    name: "Doglas Martini",
    role: "Manager",
    type: "Casual Leave",
    from: "12 Apr 2024",
    to: "16 Apr 2024",
    days: "5 Days",
    status: "Approved",
    leaveType: "Full Day",
    reason: "Personal work",
  },
  {
    id: 6,
    name: "Linda Ray",
    role: "Finance",
    type: "Medical Leave",
    from: "20 Apr 2024",
    to: "21 Apr 2024",
    days: "2 Days",
    status: "Approved",
    leaveType: "First Half",
    reason: "Doctor appointment",
  },
  {
    id: 7,
    name: "Elliot Murray",
    role: "Developer",
    type: "Casual Leave",
    from: "06 Jul 2024",
    to: "06 Jul 2024",
    days: "1 Day",
    status: "Approved",
    leaveType: "Second Half",
    reason: "Personal work",
  },
  {
    id: 8,
    name: "Rebecca Smtih",
    role: "Executive",
    type: "Medical Leave",
    from: "02 Sep 2024",
    to: "04 Sep 2024",
    days: "3 Days",
    status: "Approved",
    leaveType: "Full Day",
    reason: "Medical treatment",
  },
  {
    id: 9,
    name: "Connie Waters",
    role: "Developer",
    type: "Annual Leave",
    from: "15 Nov 2024",
    to: "15 Nov 2024",
    days: "1 Day",
    status: "Approved",
    leaveType: "Full Day",
    reason: "Family event",
  },
  {
    id: 10,
    name: "Lori Broaddus",
    role: "Finance",
    type: "Casual Leave",
    from: "10 Dec 2024",
    to: "11 Dec 2024",
    days: "2 Days",
    status: "Approved",
    leaveType: "Full Day",
    reason: "Personal work",
  },
];

const emptyForm: LeaveForm = {
  employee: "",
  leaveReason: "",
  from: "",
  to: "",
  leaveType: "",
  noOfDays: "",
  reason: "",
};

const employees = [
  "Anthony Lewis",
  "Brian Villalobos",
  "Harvey Smith",
  "Stephan Peralt",
  "Doglas Martini",
  "Linda Ray",
  "Elliot Murray",
  "Rebecca Smtih",
  "Connie Waters",
  "Lori Broaddus",
];

const Leaves = () => {
  const [leaveData, setLeaveData] =
    useState<LeaveItem[]>(initialLeaveData);

  const [selected, setSelected] = useState<number[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState("Last 7 Days");
  const [currentPage, setCurrentPage] = useState(1);

  const [addOpen, setAddOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [activeLeave, setActiveLeave] =
    useState<LeaveItem | null>(null);

  const [deleteId, setDeleteId] =
    useState<number | null>(null);

  const [form, setForm] =
    useState<LeaveForm>(emptyForm);

  const [chatText, setChatText] = useState("");

  const filteredData = useMemo(() => {
    let result = [...leaveData];

    if (search.trim()) {
      const q = search.toLowerCase().trim();

      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.role.toLowerCase().includes(q) ||
          item.type.toLowerCase().includes(q) ||
          item.status.toLowerCase().includes(q)
      );
    }

    if (leaveTypeFilter) {
      result = result.filter(
        (item) => item.type === leaveTypeFilter
      );
    }

    if (sortBy === "Ascending") {
      result.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    if (sortBy === "Descending") {
      result.sort((a, b) =>
        b.name.localeCompare(a.name)
      );
    }

    return result;
  }, [
    leaveData,
    search,
    leaveTypeFilter,
    sortBy,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / rowsPerPage)
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const visibleData = filteredData.slice(
    (safeCurrentPage - 1) * rowsPerPage,
    safeCurrentPage * rowsPerPage
  );

  const allVisibleSelected =
    visibleData.length > 0 &&
    visibleData.every((item) =>
      selected.includes(item.id)
    );

  const handleSelectAll = () => {
    const ids = visibleData.map((item) => item.id);

    if (allVisibleSelected) {
      setSelected((prev) =>
        prev.filter((id) => !ids.includes(id))
      );
    } else {
      setSelected((prev) => [
        ...new Set([...prev, ...ids]),
      ]);
    }
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const getStatusColor = (status: LeaveStatus) => {
    if (status === "Approved") return "#25c875";
    if (status === "Declined") return "#ff5b5b";
    return "#c65ad9";
  };

  const openAddModal = () => {
    setForm(emptyForm);
    setAddOpen(true);
  };

  const openViewModal = (item: LeaveItem) => {
    setActiveLeave(item);
    setViewOpen(true);
  };

  const openChatModal = (item: LeaveItem) => {
    setActiveLeave(item);
    setChatOpen(true);
  };

  const openEditModal = (item: LeaveItem) => {
    setActiveLeave(item);

    setForm({
      employee: item.name,
      leaveReason: item.type,
      from: "",
      to: item.to,
      leaveType: item.leaveType,
      noOfDays: item.days.replace(/\D/g, ""),
      reason: item.reason,
    });

    setEditOpen(true);
  };

  const openDeleteModal = (id: number) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const handleAddLeave = (e: FormEvent) => {
    e.preventDefault();

    if (
      !form.employee ||
      !form.leaveReason ||
      !form.from ||
      !form.to ||
      !form.leaveType ||
      !form.noOfDays
    ) {
      return;
    }

    const role =
      leaveData.find(
        (item) => item.name === form.employee
      )?.role || "Employee";

    const newLeave: LeaveItem = {
      id:
        leaveData.length > 0
          ? Math.max(
              ...leaveData.map((item) => item.id)
            ) + 1
          : 1,
      name: form.employee,
      role,
      type: form.leaveReason,
      from: form.from,
      to: form.to,
      days: `${form.noOfDays} ${
        Number(form.noOfDays) === 1 ? "Day" : "Days"
      }`,
      status: "New",
      leaveType: form.leaveType,
      reason: form.reason,
    };

    setLeaveData((prev) => [...prev, newLeave]);
    setAddOpen(false);
    setForm(emptyForm);
  };

  const handleEditLeave = (e: FormEvent) => {
    e.preventDefault();

    if (!activeLeave) return;

    setLeaveData((prev) =>
      prev.map((item) =>
        item.id === activeLeave.id
          ? {
              ...item,
              name: form.employee || item.name,
              type: form.leaveReason || item.type,
              to: form.to || item.to,
              days: form.noOfDays
                ? `${form.noOfDays} ${
                    Number(form.noOfDays) === 1
                      ? "Day"
                      : "Days"
                  }`
                : item.days,
              leaveType:
                form.leaveType || item.leaveType,
              reason: form.reason,
            }
          : item
      )
    );

    setEditOpen(false);
    setActiveLeave(null);
  };

  const handleDelete = () => {
    if (deleteId === null) return;

    setLeaveData((prev) =>
      prev.filter((item) => item.id !== deleteId)
    );

    setSelected((prev) =>
      prev.filter((id) => id !== deleteId)
    );

    setDeleteId(null);
    setDeleteOpen(false);
  };

  return (
    <>
      <style>
        {`
        .leave-page {
          width: 100%;
          min-height: 100vh;
          padding: 24px 23px 25px;
          background: #f8f9fb;
          color: #14213d;
        }

        .leave-page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 26px;
        }

        .leave-page-title {
          margin: 0 0 5px;
          font-size: 24px;
          font-weight: 700;
          color: #0d1c3b;
        }

        .leave-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #677386;
          font-size: 12px;
        }

        .leave-breadcrumb a {
          display: inline-flex;
          color: #315c75;
          text-decoration: none;
        }

        .leave-add-btn {
          height: 39px;
          padding: 0 15px;
          border: 0;
          border-radius: 5px;
          background: #c39237;
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .leave-summary-grid {
          display: grid;
          grid-template-columns: repeat(4,minmax(0,1fr));
          gap: 24px;
          margin-bottom: 24px;
        }

        .leave-summary-card {
          height: 87px;
          position: relative;
          overflow: hidden;
          border: 1px solid #dde2e8;
          border-radius: 5px;
          background: #fff;
          box-shadow: 0 1px 3px rgba(20,32,52,.08);
          display: flex;
          align-items: center;
        }

        .leave-summary-left {
          width: 102px;
          height: 100%;
          position: relative;
          display: flex;
          align-items: center;
        }

        .leave-summary-shape {
          width: 100px;
          height: 100%;
          border-radius: 0 58px 58px 0;
          position: absolute;
          left: 0;
          top: 0;
        }

        .leave-summary-light {
          width: 56px;
          height: 120%;
          position: absolute;
          right: -15px;
          top: -10px;
          transform: skewX(25deg);
          background: rgba(255,255,255,.78);
        }

        .leave-summary-icon {
          width: 34px;
          height: 34px;
          position: relative;
          z-index: 2;
          margin-left: 20px;
          border-radius: 50%;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .leave-summary-content {
          flex: 1;
          padding-right: 20px;
          text-align: right;
        }

        .leave-summary-title {
          margin-bottom: 2px;
          color: #697386;
          font-size: 13px;
        }

        .leave-summary-value {
          color: #10203e;
          font-size: 20px;
          font-weight: 600;
        }

        .leave-list-card {
          border: 1px solid #dde2e8;
          border-radius: 5px;
          background: #fff;
          overflow: hidden;
        }

        .leave-list-header {
          min-height: 71px;
          padding: 16px 20px;
          border-bottom: 1px solid #dde2e8;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .leave-list-header h5 {
          margin: 0;
          color: #071632;
          font-size: 15px;
          font-weight: 600;
        }

        .leave-filters {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .leave-filter-box {
          height: 38px;
          padding: 0 11px;
          border: 1px solid #dce1e7;
          border-radius: 5px;
          background: #fff;
          color: #17233f;
          font-size: 13px;
          outline: none;
        }

        .leave-date-filter { width: 195px; }
        .leave-type-filter { width: 110px; }
        .leave-sort-filter { width: 166px; }

        .leave-toolbar {
          min-height: 61px;
          padding: 10px 16px;
          border-bottom: 1px solid #e2e5e9;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .leave-rows {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #26354d;
          font-size: 13px;
        }

        .leave-rows select {
          width: 49px;
          height: 29px;
          padding: 0 5px;
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

        .leave-table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .leave-table {
          width: 100%;
          min-width: 1050px;
          border-collapse: collapse;
        }

        .leave-table thead {
          background: #e1e4e9;
        }

        .leave-table th {
          height: 43px;
          padding: 0 14px;
          color: #06142e;
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
        }

        .leave-table td {
          height: 59px;
          padding: 0 14px;
          border-bottom: 1px solid #dfe3e8;
          background: #fff;
          color: #5c6879;
          font-size: 13px;
          white-space: nowrap;
        }

        .leave-check-col {
          width: 55px;
          text-align: center;
        }

        .leave-checkbox {
          width: 17px;
          height: 17px;
          cursor: pointer;
        }

        .leave-sort {
          float: right;
          color: #cbd1d9;
          font-size: 11px;
        }

        .leave-employee {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .leave-avatar {
          width: 33px;
          height: 33px;
          border-radius: 50%;
          background: #d7d7d7;
          position: relative;
          flex-shrink: 0;
        }

        .leave-avatar::after {
          content: "...";
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #aaa;
          font-size: 8px;
        }

        .leave-employee-name {
          margin-bottom: 2px;
          color: #06142e;
          font-size: 13px;
          font-weight: 500;
        }

        .leave-employee-role {
          color: #7a8494;
          font-size: 11px;
        }

        .leave-type-cell {
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }

        .leave-info-icon {
          color: #0d6efd;
        }

        .leave-status-wrap {
          position: relative;
          width: max-content;
        }

        .leave-status-dot {
          width: 9px;
          height: 9px;
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          border-radius: 50%;
          z-index: 2;
          pointer-events: none;
        }

        .leave-status-select {
          height: 33px;
          min-width: 116px;
          padding: 0 30px;
          border: 1px solid #dce1e7;
          border-radius: 5px;
          background: #fff;
          color: #09152d;
          font-size: 13px;
          outline: none;
        }

        .leave-actions {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .leave-action-btn {
          width: 20px;
          height: 24px;
          padding: 0;
          border: 0;
          background: transparent;
          color: #647286;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .leave-table-footer {
          height: 57px;
          padding: 0 16px;
          border-top: 5px solid #f0f1f3;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #596679;
          font-size: 13px;
        }

        .leave-pagination {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .leave-pagination button {
          border: 0;
          background: transparent;
          color: #a2a9b4;
        }

        .leave-current-page {
          width: 27px;
          height: 27px;
          border-radius: 50%;
          background: #c39237 !important;
          color: #fff !important;
        }

        /* MODALS */

        .leave-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          padding: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,.42);
        }

        .leave-form-modal {
          width: 800px;
          max-width: calc(100vw - 30px);
          overflow: hidden;
          border-radius: 5px;
          background: #fff;
          box-shadow: 0 15px 45px rgba(0,0,0,.22);
        }

        .leave-modal-header {
          min-height: 63px;
          padding: 0 17px;
          border-bottom: 1px solid #e3e7eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .leave-modal-header h3 {
          margin: 0;
          color: #1e2b49;
          font-size: 20px;
          font-weight: 600;
        }

        .leave-modal-close {
          width: 20px;
          height: 20px;
          border: 0;
          border-radius: 50%;
          background: #747d8a;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .leave-modal-body {
          padding: 17px;
        }

        .leave-form-grid {
          display: grid;
          grid-template-columns: repeat(2,1fr);
          gap: 17px 23px;
        }

        .leave-form-group label {
          display: block;
          margin-bottom: 8px;
          color: #263452;
          font-size: 13px;
          font-weight: 500;
        }

        .leave-form-group input,
        .leave-form-group select,
        .leave-form-group textarea {
          width: 100%;
          border: 1px solid #dce1e7;
          border-radius: 5px;
          outline: none;
          background: #fff;
          color: #26344d;
          font-size: 13px;
        }

        .leave-form-group input,
        .leave-form-group select {
          height: 38px;
          padding: 0 10px;
        }

        .leave-form-group textarea {
          height: 87px;
          padding: 10px;
          resize: none;
        }

        .leave-form-full {
          grid-column: 1/-1;
        }

        .leave-modal-footer {
          min-height: 64px;
          padding: 10px 13px;
          border-top: 1px solid #e4e7eb;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 8px;
        }

        .leave-modal-cancel,
        .leave-modal-save {
          height: 39px;
          padding: 0 15px;
          border: 0;
          border-radius: 5px;
          font-size: 13px;
          cursor: pointer;
        }

        .leave-modal-cancel {
          background: #f7f8f9;
          color: #172033;
        }

        .leave-modal-save {
          background: #c39237;
          color: #fff;
          font-weight: 600;
        }

        /* VIEW */

        .leave-view-modal {
          width: 800px;
          max-width: calc(100vw - 30px);
          background: #fff;
          border-radius: 5px;
          overflow: hidden;
        }

        .leave-view-content {
          padding: 34px 17px 27px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          row-gap: 28px;
          column-gap: 65px;
        }

        .leave-view-label {
          margin-bottom: 3px;
          color: #3c4658;
          font-size: 13px;
        }

        .leave-view-value {
          color: #25324f;
          font-size: 17px;
          font-weight: 600;
        }

        /* CHAT */

        .leave-chat-modal {
          width: 800px;
          max-width: calc(100vw - 30px);
          height: 475px;
          background: #fff;
          border-radius: 5px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .chat-header {
          min-height: 62px;
          padding: 8px 17px;
          border-bottom: 1px solid #e4e7eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .chat-user {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .chat-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #d5d5d5;
          position: relative;
        }

        .chat-online {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #00bd61;
          position: absolute;
          right: 0;
          bottom: 0;
          border: 2px solid #fff;
        }

        .chat-name {
          color: #13213e;
          font-size: 14px;
          font-weight: 500;
        }

        .chat-status {
          color: #111827;
          font-size: 12px;
        }

        .chat-body {
          flex: 1;
          overflow-y: auto;
          padding: 17px 75px;
        }

        .chat-row {
          display: flex;
          margin-bottom: 16px;
        }

        .chat-row.right {
          justify-content: flex-end;
        }

        .chat-bubble {
          max-width: 440px;
          padding: 14px 16px;
          border-radius: 0 17px 17px 17px;
          background: #f5f6f7;
          color: #111827;
          font-size: 13px;
          line-height: 1.5;
        }

        .chat-row.right .chat-bubble {
          border-radius: 17px 17px 0 17px;
        }

        .chat-meta {
          margin-top: 4px;
          color: #697386;
          font-size: 12px;
        }

        .chat-input-bar {
          min-height: 68px;
          padding: 9px 17px;
          border-top: 1px solid #e4e7eb;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .chat-input {
          flex: 1;
          height: 48px;
          padding: 0 10px;
          border: 1px solid #edf0f3;
          border-radius: 8px;
          outline: none;
          background: #fafafa;
          font-size: 13px;
        }

        .chat-send {
          width: 34px;
          height: 34px;
          border: 0;
          border-radius: 8px;
          background: #c39237;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* DELETE */

        .leave-delete-modal {
          width: 400px;
          max-width: calc(100vw - 30px);
          padding: 17px 30px;
          border-radius: 5px;
          background: #fff;
          text-align: center;
        }

        .leave-delete-icon {
          width: 58px;
          height: 58px;
          margin: 0 auto 14px;
          border-radius: 4px;
          background: #f6cccc;
          color: #f10f18;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .leave-delete-modal h3 {
          margin: 0 0 6px;
          color: #1d2b48;
          font-size: 19px;
          font-weight: 600;
        }

        .leave-delete-modal p {
          margin: 0 auto 17px;
          max-width: 320px;
          color: #3e4654;
          font-size: 13px;
          line-height: 1.5;
        }

        .leave-delete-actions {
          display: flex;
          justify-content: center;
          gap: 16px;
        }

        .leave-delete-cancel,
        .leave-delete-confirm {
          height: 39px;
          padding: 0 16px;
          border: 0;
          border-radius: 5px;
          font-size: 13px;
        }

        .leave-delete-cancel {
          background: #f6f7f8;
        }

        .leave-delete-confirm {
          background: #f10d16;
          color: #fff;
          font-weight: 600;
        }

        @media(max-width:900px){
          .leave-summary-grid {
            grid-template-columns: repeat(2,1fr);
          }

          .leave-form-grid {
            grid-template-columns:1fr;
          }

          .leave-form-full {
            grid-column:auto;
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
              <Link to="/admin/dashboard">
                <i className="ti ti-home" />
              </Link>

              <span>/</span>
              <span>Leaves</span>
            </div>
          </div>

          <button
            type="button"
            className="leave-add-btn"
            onClick={openAddModal}
          >
            <i className="ti ti-circle-plus" />
            Add Leave
          </button>
        </div>

        <div className="leave-summary-grid">
          {[
            {
              title: "Total Present",
              value: "180/200",
              color: "#05c95a",
            },
            {
              title: "Planned Leaves",
              value: "10",
              color: "#ff328f",
            },
            {
              title: "Unplanned Leaves",
              value: "10",
              color: "#ffbe0b",
            },
            {
              title: "Pending Requests",
              value: "15",
              color: "#20bdd9",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="leave-summary-card"
            >
              <div className="leave-summary-left">
                <div
                  className="leave-summary-shape"
                  style={{ background: item.color }}
                />

                <div className="leave-summary-light" />

                <div
                  className="leave-summary-icon"
                  style={{ color: item.color }}
                >
                  <UserRoundCheck size={18} />
                </div>
              </div>

              <div className="leave-summary-content">
                <div className="leave-summary-title">
                  {item.title}
                </div>

                <div className="leave-summary-value">
                  {item.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="leave-list-card">
          <div className="leave-list-header">
            <h5>Leave List</h5>

            <div className="leave-filters">
              <select className="leave-filter-box leave-date-filter">
                <option>
                  08/28/2026 - 09/03/20
                </option>
              </select>

              <select
                className="leave-filter-box leave-type-filter"
                value={leaveTypeFilter}
                onChange={(e) => {
                  setLeaveTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Leave Type</option>
                <option value="Medical Leave">
                  Medical Leave
                </option>
                <option value="Casual Leave">
                  Casual Leave
                </option>
                <option value="Annual Leave">
                  Annual Leave
                </option>
              </select>

              <select
                className="leave-filter-box leave-sort-filter"
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value)
                }
              >
                <option value="Last 7 Days">
                  Sort By : Last 7 Days
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
            <div className="leave-rows">
              <span>Row Per Page</span>

              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(
                    Number(e.target.value)
                  );
                  setCurrentPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
              </select>

              <span>Entries</span>
            </div>

            <input
              className="leave-search"
              placeholder="Search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="leave-table-wrapper">
            <table className="leave-table">
              <thead>
                <tr>
                  <th className="leave-check-col">
                    <input
                      type="checkbox"
                      className="leave-checkbox"
                      checked={allVisibleSelected}
                      onChange={handleSelectAll}
                    />
                  </th>

                  <th>
                    Employee
                    <span className="leave-sort">
                      ↑↓
                    </span>
                  </th>

                  <th>
                    Leave Type
                    <span className="leave-sort">
                      ↑↓
                    </span>
                  </th>

                  <th>
                    From
                    <span className="leave-sort">
                      ↑↓
                    </span>
                  </th>

                  <th>
                    To
                    <span className="leave-sort">
                      ↑↓
                    </span>
                  </th>

                  <th>
                    No of Days
                    <span className="leave-sort">
                      ↑↓
                    </span>
                  </th>

                  <th>
                    Status
                    <span className="leave-sort">
                      ↑↓
                    </span>
                  </th>

                  <th>
                    <span className="leave-sort">
                      ↑↓
                    </span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {visibleData.map((item) => (
                  <tr key={item.id}>
                    <td className="leave-check-col">
                      <input
                        type="checkbox"
                        className="leave-checkbox"
                        checked={selected.includes(
                          item.id
                        )}
                        onChange={() =>
                          toggleSelect(item.id)
                        }
                      />
                    </td>

                    <td>
                      <div className="leave-employee">
                        <div className="leave-avatar" />

                        <div>
                          <div className="leave-employee-name">
                            {item.name}
                          </div>

                          <div className="leave-employee-role">
                            {item.role}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="leave-type-cell">
                        {item.type}
                        <Info
                          size={13}
                          className="leave-info-icon"
                        />
                      </div>
                    </td>

                    <td>{item.from}</td>
                    <td>{item.to}</td>
                    <td>{item.days}</td>

                    <td>
                      <div className="leave-status-wrap">
                        <span
                          className="leave-status-dot"
                          style={{
                            background:
                              getStatusColor(item.status),
                          }}
                        />

                        <select
                          className="leave-status-select"
                          value={item.status}
                          onChange={(e) => {
                            const status =
                              e.target
                                .value as LeaveStatus;

                            setLeaveData((prev) =>
                              prev.map((leave) =>
                                leave.id === item.id
                                  ? {
                                      ...leave,
                                      status,
                                    }
                                  : leave
                              )
                            );
                          }}
                        >
                          <option value="Approved">
                            Approved
                          </option>
                          <option value="Declined">
                            Declined
                          </option>
                          <option value="New">
                            New
                          </option>
                        </select>
                      </div>
                    </td>

                    <td>
                      <div className="leave-actions">
                        <button
                          type="button"
                          className="leave-action-btn"
                          onClick={() =>
                            openViewModal(item)
                          }
                        >
                          <Eye size={15} />
                        </button>

                        <button
                          type="button"
                          className="leave-action-btn"
                          onClick={() =>
                            openChatModal(item)
                          }
                        >
                          <MessageSquareMore
                            size={15}
                          />
                        </button>

                        <button
                          type="button"
                          className="leave-action-btn"
                          onClick={() =>
                            openEditModal(item)
                          }
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          type="button"
                          className="leave-action-btn"
                          onClick={() =>
                            openDeleteModal(item.id)
                          }
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="leave-table-footer">
            <div>
              Showing{" "}
              {filteredData.length === 0
                ? 0
                : (safeCurrentPage - 1) *
                    rowsPerPage +
                  1}
              {" - "}
              {Math.min(
                safeCurrentPage * rowsPerPage,
                filteredData.length
              )}{" "}
              of {filteredData.length} entries
            </div>

            <div className="leave-pagination">
              <button
                disabled={safeCurrentPage === 1}
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.max(1, page - 1)
                  )
                }
              >
                ‹
              </button>

              <button className="leave-current-page">
                {safeCurrentPage}
              </button>

              <button
                disabled={
                  safeCurrentPage === totalPages
                }
                onClick={() =>
                  setCurrentPage((page) =>
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

      {/* ADD LEAVE */}

      {addOpen && (
        <div className="leave-modal-overlay">
          <div className="leave-form-modal">
            <div className="leave-modal-header">
              <h3>Add Leave</h3>

              <button
                className="leave-modal-close"
                onClick={() => setAddOpen(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddLeave}>
              <div className="leave-modal-body">
                <div className="leave-form-grid">
                  <div className="leave-form-group">
                    <label>Employee</label>

                    <select
                      value={form.employee}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          employee: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select</option>

                      {employees.map((employee) => (
                        <option
                          key={employee}
                          value={employee}
                        >
                          {employee}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="leave-form-group">
                    <label>Leave Reason</label>

                    <select
                      value={form.leaveReason}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          leaveReason:
                            e.target.value,
                        }))
                      }
                    >
                      <option value="">
                        Select Leave Reason
                      </option>
                      <option value="Medical Leave">
                        Medical Leave
                      </option>
                      <option value="Casual Leave">
                        Casual Leave
                      </option>
                      <option value="Annual Leave">
                        Annual Leave
                      </option>
                    </select>
                  </div>

                  <div className="leave-form-group">
                    <label>From</label>

                    <input
                      type="date"
                      value={form.from}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          from: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="leave-form-group">
                    <label>To</label>

                    <input
                      type="date"
                      value={form.to}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          to: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="leave-form-group">
                    <label>Leave Type</label>

                    <select
                      value={form.leaveType}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          leaveType:
                            e.target
                              .value as LeaveTypeOption,
                        }))
                      }
                    >
                      <option value="">Select</option>
                      <option value="Full Day">
                        Full Day
                      </option>
                      <option value="First Half">
                        First Half
                      </option>
                      <option value="Second Half">
                        Second Half
                      </option>
                    </select>
                  </div>

                  <div className="leave-form-group">
                    <label>No of Days</label>

                    <input
                      type="number"
                      value={form.noOfDays}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          noOfDays: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="leave-form-group leave-form-full">
                    <label>Reason</label>

                    <textarea
                      value={form.reason}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          reason: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="leave-modal-footer">
                <button
                  type="button"
                  className="leave-modal-cancel"
                  onClick={() => setAddOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="leave-modal-save"
                >
                  Add Leave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW LEAVE */}

      {viewOpen && activeLeave && (
        <div className="leave-modal-overlay">
          <div className="leave-view-modal">
            <div className="leave-modal-header">
              <h3>View Leave</h3>

              <button
                className="leave-modal-close"
                onClick={() => {
                  setViewOpen(false);
                  setActiveLeave(null);
                }}
              >
                ×
              </button>
            </div>

            <div className="leave-view-content">
              <div>
                <div className="leave-view-label">
                  Leave Reason
                </div>

                <div className="leave-view-value">
                  {activeLeave.type}
                </div>
              </div>

              <div>
                <div className="leave-view-label">
                  From
                </div>

                <div className="leave-view-value">
                  {activeLeave.from}
                </div>
              </div>

              <div>
                <div className="leave-view-label">
                  To
                </div>

                <div className="leave-view-value">
                  {activeLeave.to}
                </div>
              </div>

              <div>
                <div className="leave-view-label">
                  Leave Type
                </div>

                <div className="leave-view-value">
                  {activeLeave.leaveType}
                </div>
              </div>

              <div>
                <div className="leave-view-label">
                  No of Days
                </div>

                <div className="leave-view-value">
                  {activeLeave.days.replace(
                    /\D/g,
                    ""
                  )}
                </div>
              </div>

              <div>
                <div className="leave-view-label">
                  Reason
                </div>

                <div className="leave-view-value">
                  {activeLeave.reason}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHAT */}

      {chatOpen && activeLeave && (
        <div className="leave-modal-overlay">
          <div className="leave-chat-modal">
            <div className="chat-header">
              <div className="chat-user">
                <div className="chat-avatar">
                  <span className="chat-online" />
                </div>

                <div>
                  <div className="chat-name">
                    {activeLeave.name}
                  </div>

                  <div className="chat-status">
                    Online
                  </div>
                </div>
              </div>

              <button
                className="leave-modal-close"
                onClick={() => {
                  setChatOpen(false);
                  setActiveLeave(null);
                }}
              >
                ×
              </button>
            </div>

            <div className="chat-body">
              <div className="chat-row">
                <div>
                  <div className="chat-bubble">
                    Hi John, I wanted to update you
                    on a new company policy regarding
                    remote work.
                  </div>

                  <div className="chat-meta">
                    {activeLeave.name} &nbsp; •
                    &nbsp; 08:00 AM
                  </div>
                </div>
              </div>

              <div className="chat-row">
                <div>
                  <div className="chat-bubble">
                    Do you have a moment?
                  </div>

                  <div className="chat-meta">
                    {activeLeave.name} &nbsp; •
                    &nbsp; 08:00 AM
                  </div>
                </div>
              </div>

              <div className="chat-row right">
                <div>
                  <div className="chat-bubble">
                    Sure, Sarah. What’s the new
                    policy?
                  </div>

                  <div
                    className="chat-meta"
                    style={{
                      textAlign: "right",
                    }}
                  >
                    ✓✓ &nbsp; 08:00 AM &nbsp; •
                    &nbsp; You
                  </div>
                </div>
              </div>
            </div>

            <div className="chat-input-bar">
              <input
                className="chat-input"
                placeholder="Type Your Message"
                value={chatText}
                onChange={(e) =>
                  setChatText(e.target.value)
                }
              />

              <button className="chat-send">
                <Send size={17} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT LEAVE */}

      {editOpen && activeLeave && (
        <div className="leave-modal-overlay">
          <div className="leave-form-modal">
            <div className="leave-modal-header">
              <h3>Edit Leave</h3>

              <button
                className="leave-modal-close"
                onClick={() => {
                  setEditOpen(false);
                  setActiveLeave(null);
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleEditLeave}>
              <div className="leave-modal-body">
                <div className="leave-form-grid">
                  <div className="leave-form-group">
                    <label>Employee</label>

                    <select
                      value={form.employee}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          employee: e.target.value,
                        }))
                      }
                    >
                      {employees.map((employee) => (
                        <option
                          key={employee}
                          value={employee}
                        >
                          {employee}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="leave-form-group">
                    <label>Leave Reason</label>

                    <select
                      value={form.leaveReason}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          leaveReason:
                            e.target.value,
                        }))
                      }
                    >
                      <option value="">
                        Select Leave Reason
                      </option>
                      <option value="Medical Leave">
                        Medical Leave
                      </option>
                      <option value="Casual Leave">
                        Casual Leave
                      </option>
                      <option value="Annual Leave">
                        Annual Leave
                      </option>
                    </select>
                  </div>

                  <div className="leave-form-group">
                    <label>From</label>

                    <input
                      type="date"
                      value={form.from}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          from: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="leave-form-group">
                    <label>To</label>

                    <input
                      type="text"
                      value={form.to}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          to: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="leave-form-group">
                    <label>Leave Type</label>

                    <select
                      value={form.leaveType}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          leaveType:
                            e.target
                              .value as LeaveTypeOption,
                        }))
                      }
                    >
                      <option value="Full Day">
                        Full Day
                      </option>
                      <option value="First Half">
                        First Half
                      </option>
                      <option value="Second Half">
                        Second Half
                      </option>
                    </select>
                  </div>

                  <div className="leave-form-group">
                    <label>No of Days</label>

                    <input
                      type="text"
                      value={form.noOfDays}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          noOfDays: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="leave-form-group leave-form-full">
                    <label>Reason</label>

                    <textarea
                      value={form.reason}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          reason: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="leave-modal-footer">
                <button
                  type="button"
                  className="leave-modal-cancel"
                  onClick={() => {
                    setEditOpen(false);
                    setActiveLeave(null);
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="leave-modal-save"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE */}

      {deleteOpen && (
        <div className="leave-modal-overlay">
          <div className="leave-delete-modal">
            <div className="leave-delete-icon">
              <Trash2 size={31} />
            </div>

            <h3>
              Confirm Delete
            </h3>

            <p>
              You want to delete all the marked
              items, this cant be undone once you
              delete.
            </p>

            <div className="leave-delete-actions">
              <button
                type="button"
                className="leave-delete-cancel"
                onClick={() => {
                  setDeleteOpen(false);
                  setDeleteId(null);
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                className="leave-delete-confirm"
                onClick={handleDelete}
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

export default Leaves;
import React, { useMemo, useState } from "react";
import {
  Clock3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Home,
  Search,
  ArrowUpDown,
  CalendarDays,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AttendanceType {
  id: number;
  name: string;
  team: string;
  status: "Present" | "Absent" | "Late";
  checkIn: string;
  checkOut: string;
  break: string;
  late: string;
  hours: string;
  hoursType?: "green" | "red" | "blue";
  date?: string;
}

const initialData: AttendanceType[] = [
  {
    id: 1,
    name: "Anthony Lewis",
    team: "UI/UX Team",
    status: "Present",
    checkIn: "09:00 AM",
    checkOut: "06:45 PM",
    break: "30 Min",
    late: "32 Min",
    hours: "08:55 AM",
    hoursType: "green",
    date: "",
  },
  {
    id: 2,
    name: "Brian Villalobos",
    team: "Development",
    status: "Present",
    checkIn: "09:00 AM",
    checkOut: "06:12 PM",
    break: "20 Min",
    late: "20 Min",
    hours: "07:54 Hrs",
    hoursType: "red",
    date: "",
  },
  {
    id: 3,
    name: "Harvey Smith",
    team: "HR",
    status: "Present",
    checkIn: "09:00 AM",
    checkOut: "06:13 PM",
    break: "50 Min",
    late: "23 Min",
    hours: "08:45 Hrs",
    hoursType: "green",
    date: "",
  },
  {
    id: 4,
    name: "Stephan Peralt",
    team: "Management",
    status: "Present",
    checkIn: "09:00 AM",
    checkOut: "06:23 PM",
    break: "41 Min",
    late: "50 Min",
    hours: "08:35 Hrs",
    hoursType: "green",
    date: "",
  },
  {
    id: 5,
    name: "Doglas Martini",
    team: "Development",
    status: "Present",
    checkIn: "09:00 AM",
    checkOut: "06:43 PM",
    break: "23 Min",
    late: "10 Min",
    hours: "08:22 Hrs",
    hoursType: "green",
    date: "",
  },
  {
    id: 6,
    name: "Linda Ray",
    team: "UI/UX Team",
    status: "Present",
    checkIn: "09:00 AM",
    checkOut: "07:15 PM",
    break: "03 Min",
    late: "30 Min",
    hours: "08:32 Hrs",
    hoursType: "green",
    date: "",
  },
  {
    id: 7,
    name: "Elliot Murray",
    team: "UI/UX Team",
    status: "Present",
    checkIn: "09:00 AM",
    checkOut: "07:13 PM",
    break: "32 Min",
    late: "41 Min",
    hours: "09:15 Hrs",
    hoursType: "blue",
    date: "",
  },
  {
    id: 8,
    name: "Rebecca Smith",
    team: "UI/UX Team",
    status: "Present",
    checkIn: "09:00 AM",
    checkOut: "09:17 PM",
    break: "14 Min",
    late: "12 Min",
    hours: "09:25 Hrs",
    hoursType: "green",
    date: "",
  },
  {
    id: 9,
    name: "Connie Waters",
    team: "Management",
    status: "Present",
    checkIn: "09:00 AM",
    checkOut: "08:15 PM",
    break: "12 Min",
    late: "03 Min",
    hours: "08:35 Hrs",
    hoursType: "green",
    date: "",
  },
  {
    id: 10,
    name: "Lori Broaddus",
    team: "Finance",
    status: "Absent",
    checkIn: "-",
    checkOut: "-",
    break: "-",
    late: "-",
    hours: "00:00 Hrs",
    hoursType: "red",
    date: "",
  },
];

interface EditFormType {
  date: string;
  checkIn: string;
  checkOut: string;
  break: string;
  late: string;
  hours: string;
  status: "Present" | "Absent" | "Late";
}

const Atendance: React.FC = () => {
  const navigate = useNavigate();

  const [attendanceData, setAttendanceData] =
    useState<AttendanceType[]>(initialData);

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("Select Status");
  const [departmentFilter, setDepartmentFilter] =
    useState("Department");

  const [dateFilter, setDateFilter] = useState(
    "08/27/2026 - 09/02/2026"
  );

  const [sortFilter, setSortFilter] = useState(
    "Sort By : Last 7 Days"
  );

  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  /* =========================
     EDIT MODAL STATES
  ========================= */

  const [showEditModal, setShowEditModal] = useState(false);

  const [editingAttendance, setEditingAttendance] =
    useState<AttendanceType | null>(null);

  const [editForm, setEditForm] = useState<EditFormType>({
    date: "",
    checkIn: "",
    checkOut: "",
    break: "",
    late: "",
    hours: "",
    status: "Present",
  });

  /* =========================
     FILTER DATA
  ========================= */

  const filteredData = useMemo(() => {
    let data = [...attendanceData];

    if (search.trim()) {
      data = data.filter(
        (item) =>
          item.name
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          item.team
            .toLowerCase()
            .includes(search.toLowerCase())
      );
    }

    if (statusFilter !== "Select Status") {
      data = data.filter(
        (item) => item.status === statusFilter
      );
    }

    if (departmentFilter !== "Department") {
      data = data.filter(
        (item) => item.team === departmentFilter
      );
    }

    if (sortFilter === "Ascending") {
      data.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    if (sortFilter === "Descending") {
      data.sort((a, b) =>
        b.name.localeCompare(a.name)
      );
    }

    return data;
  }, [
    attendanceData,
    search,
    statusFilter,
    departmentFilter,
    sortFilter,
  ]);

  const visibleData = filteredData.slice(0, rowsPerPage);

  /* =========================
     CHECKBOX
  ========================= */

  const toggleRow = (id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id)
        ? prev.filter((rowId) => rowId !== id)
        : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (
      visibleData.length > 0 &&
      selectedRows.length === visibleData.length
    ) {
      setSelectedRows([]);
    } else {
      setSelectedRows(
        visibleData.map((item) => item.id)
      );
    }
  };

  /* =========================
     OPEN EDIT MODAL
  ========================= */

  const handleEdit = (item: AttendanceType) => {
    setEditingAttendance(item);

    setEditForm({
      date: item.date || "",
      checkIn: item.checkIn === "-" ? "" : item.checkIn,
      checkOut:
        item.checkOut === "-" ? "" : item.checkOut,
      break: item.break === "-" ? "" : item.break,
      late: item.late === "-" ? "" : item.late,
      hours: item.hours,
      status: item.status,
    });

    setShowEditModal(true);
  };

  /* =========================
     CLOSE MODAL
  ========================= */

  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditingAttendance(null);
  };

  /* =========================
     FORM CHANGE
  ========================= */

  const handleEditChange = (
    field: keyof EditFormType,
    value: string
  ) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* =========================
     SAVE CHANGES
  ========================= */

  const handleSaveChanges = () => {
    if (!editingAttendance) return;

    setAttendanceData((prev) =>
      prev.map((item) => {
        if (item.id !== editingAttendance.id) {
          return item;
        }

        return {
          ...item,
          date: editForm.date,
          checkIn: editForm.checkIn || "-",
          checkOut: editForm.checkOut || "-",
          break: editForm.break || "-",
          late: editForm.late || "-",
          hours: editForm.hours || "00:00 Hrs",
          status: editForm.status,
          hoursType:
            editForm.status === "Absent"
              ? "red"
              : item.hoursType || "green",
        };
      })
    );

    handleCloseModal();
  };

  /* =========================
     STATUS CLASS
  ========================= */

  const getStatusClass = (
    status: AttendanceType["status"]
  ) => {
    if (status === "Present") {
      return "attendance-status present";
    }

    if (status === "Late") {
      return "attendance-status late";
    }

    return "attendance-status absent";
  };

  /* =========================
     HOURS CLASS
  ========================= */

  const getHoursClass = (type?: string) => {
    if (type === "red") {
      return "production-badge red";
    }

    if (type === "blue") {
      return "production-badge blue";
    }

    return "production-badge green";
  };

  return (
    <div className="attendance-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .attendance-page {
          min-height: 100vh;
          background: #f5f6f8;
          padding: 28px 24px 30px;
          color: #1f2937;
          font-family: Arial, Helvetica, sans-serif;
        }

        .attendance-content {
          width: 100%;
          margin: 0 auto;
        }

        /* =====================================
           HEADER
        ===================================== */

        .attendance-header {
          margin-bottom: 24px;
        }

        .attendance-title {
          margin: 0 0 7px;
          font-size: 27px;
          line-height: 1.2;
          font-weight: 700;
          color: #172033;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #64748b;
          font-size: 13px;
        }

        .breadcrumb-home {
          display: flex;
          align-items: center;
          color: #648596;
          cursor: pointer;
        }

        .breadcrumb-current {
          color: #27364a;
        }

        /* =====================================
           TOP CARD
        ===================================== */

        .today-card {
          background: #ffffff;
          border: 1px solid #e9ebef;
          border-radius: 7px;
          padding: 20px;
          margin-bottom: 23px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.02);
        }

        .today-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 25px;
        }

        .today-heading {
          margin: 0 0 7px;
          font-size: 18px;
          font-weight: 600;
          color: #19263a;
        }

        .today-subtitle {
          margin: 0;
          font-size: 13px;
          color: #68758a;
        }

        .absent-summary {
          display: flex;
          align-items: center;
          gap: 15px;
          color: #182438;
          font-size: 14px;
          font-weight: 600;
        }

        .avatar-stack {
          display: flex;
          align-items: center;
        }

        .stack-avatar {
          width: 23px;
          height: 23px;
          border-radius: 50%;
          background: #d8d8d8;
          border: 2px solid white;
          margin-left: -5px;
        }

        .stack-avatar:first-child {
          margin-left: 0;
        }

        .stack-more {
          width: 26px;
          height: 26px;
          margin-left: -4px;
          border-radius: 50%;
          background: #bd9138;
          color: white;
          border: 2px solid white;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 12px;
          font-weight: 600;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          border: 1px solid #dfe3e8;
          border-radius: 4px;
          overflow: hidden;
        }

        .stat-item {
          min-height: 78px;
          padding: 16px 17px 13px;
          border-right: 1px solid #dfe3e8;
        }

        .stat-item:last-child {
          border-right: 0;
        }

        .stat-label {
          display: block;
          font-size: 13px;
          color: #475569;
          margin-bottom: 7px;
        }

        .stat-value-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stat-value {
          font-size: 17px;
          font-weight: 600;
          color: #263449;
        }

        .stat-change {
          border-radius: 4px;
          padding: 3px 8px;
          font-size: 10px;
          color: white;
          font-weight: 600;
        }

        .stat-change.up {
          background: #08bd65;
        }

        .stat-change.down {
          background: #ed0808;
        }

        /* =====================================
           TABLE CARD
        ===================================== */

        .attendance-table-card {
          background: #ffffff;
          border: 1px solid #e1e5ea;
          border-radius: 6px;
          overflow: hidden;
        }

        .filter-header {
          min-height: 71px;
          padding: 15px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #e1e5ea;
          gap: 20px;
        }

        .table-heading {
          margin: 0;
          font-size: 17px;
          font-weight: 600;
          color: #172033;
          white-space: nowrap;
        }

        .filter-list {
          display: flex;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .custom-select-wrapper {
          position: relative;
        }

        .custom-select {
          appearance: none;
          -webkit-appearance: none;
          height: 39px;
          border: 1px solid #dce1e7;
          border-radius: 5px;
          background: white;
          padding: 0 35px 0 12px;
          font-size: 13px;
          color: #182438;
          outline: none;
          cursor: pointer;
        }

        .custom-select:focus {
          border-color: #bd9138;
        }

        .select-arrow {
          pointer-events: none;
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #657286;
        }

        .date-select {
          width: 195px;
        }

        .department-select {
          width: 125px;
        }

        .status-select {
          width: 133px;
        }

        .sort-select {
          width: 178px;
        }

        /* =====================================
           TOOLBAR
        ===================================== */

        .table-toolbar {
          min-height: 59px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 11px 16px;
          border-bottom: 1px solid #e3e6eb;
        }

        .rows-control {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #4c596b;
        }

        .rows-select {
          width: 49px;
          height: 30px;
          padding: 0 5px;
          border: 1px solid #dce1e7;
          border-radius: 5px;
          background: white;
          color: #39475a;
          outline: none;
        }

        .search-wrapper {
          position: relative;
          width: 160px;
        }

        .search-input {
          width: 100%;
          height: 31px;
          border: 1px solid #dce1e7;
          border-radius: 5px;
          padding: 0 32px 0 11px;
          font-size: 12px;
          color: #334155;
          outline: none;
        }

        .search-input:focus {
          border-color: #bd9138;
        }

        /* =====================================
           TABLE
        ===================================== */

        .table-wrapper {
          overflow-x: auto;
        }

        .attendance-table {
          width: 100%;
          min-width: 1000px;
          border-collapse: collapse;
          table-layout: fixed;
        }

        .attendance-table thead {
          background: #e8eaee;
        }

        .attendance-table th {
          height: 43px;
          padding: 0 12px;
          font-size: 13px;
          font-weight: 600;
          color: #19263a;
          text-align: left;
          white-space: nowrap;
          border-bottom: 1px solid #dce0e5;
        }

        .attendance-table th:first-child {
          width: 55px;
          text-align: center;
        }

        .attendance-table th:nth-child(2) {
          width: 235px;
        }

        .attendance-table th:nth-child(3) {
          width: 120px;
        }

        .attendance-table th:nth-child(4) {
          width: 115px;
        }

        .attendance-table th:nth-child(5) {
          width: 115px;
        }

        .attendance-table th:nth-child(6) {
          width: 90px;
        }

        .attendance-table th:nth-child(7) {
          width: 90px;
        }

        .attendance-table th:nth-child(8) {
          width: 150px;
        }

        .attendance-table th:nth-child(9) {
          width: 55px;
        }

        .sortable-header {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .sort-icon {
          color: #bdc4cd;
        }

        .attendance-table td {
          height: 62px;
          padding: 7px 12px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 13px;
          color: #526074;
          vertical-align: middle;
        }

        .attendance-table tbody tr:hover {
          background: #fafafa;
        }

        .checkbox-cell {
          text-align: center;
        }

        .row-checkbox,
        .header-checkbox {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #bd9138;
        }

        .employee-cell {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .employee-avatar {
          flex: 0 0 auto;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #d9d9d9;
          display: flex;
          justify-content: center;
          align-items: center;
          color: #eeeeee;
          font-size: 11px;
        }

        .employee-info {
          min-width: 0;
        }

        .employee-name {
          display: block;
          color: #162236;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 3px;
        }

        .employee-team {
          display: block;
          color: #66748a;
          font-size: 11px;
        }

        .attendance-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
        }

        .attendance-status::before {
          content: "";
          width: 5px;
          height: 5px;
          border-radius: 50%;
        }

        .attendance-status.present {
          background: #d7f6e7;
          color: #00a85a;
        }

        .attendance-status.present::before {
          background: #00b85c;
        }

        .attendance-status.absent {
          background: #ffe1e1;
          color: #ef2020;
        }

        .attendance-status.absent::before {
          background: #ef2020;
        }

        .attendance-status.late {
          background: #fff0d4;
          color: #b97800;
        }

        .attendance-status.late::before {
          background: #e2a000;
        }

        .production-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 8px;
          border-radius: 4px;
          color: white;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
        }

        .production-badge.green {
          background: #00bd5f;
        }

        .production-badge.red {
          background: #f00000;
        }

        .production-badge.blue {
          background: #177cf0;
        }

        .hours-cell {
          white-space: nowrap;
        }

        .edit-button {
          border: 0;
          background: transparent;
          color: #506176;
          padding: 5px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .edit-button:hover {
          color: #bd9138;
        }

        /* =====================================
           FOOTER
        ===================================== */

        .table-footer {
          height: 56px;
          padding: 0 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #64748b;
          font-size: 13px;
        }

        .pagination {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .pagination-button {
          width: 28px;
          height: 28px;
          border: 0;
          background: transparent;
          color: #9aa3b0;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
        }

        .pagination-current {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #bd9138;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
        }

        /* =====================================
           EDIT MODAL OVERLAY
        ===================================== */

        .edit-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.47);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }

        /* =====================================
           EDIT MODAL
        ===================================== */

        .edit-modal {
          width: 500px;
          max-width: 100%;
          background: #ffffff;
          border-radius: 5px;
          box-shadow: 0 15px 45px rgba(0, 0, 0, 0.25);
          overflow: hidden;
          animation: modalOpen 0.18s ease-out;
        }

        @keyframes modalOpen {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.99);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .edit-modal-header {
          height: 62px;
          padding: 0 17px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #e2e6eb;
        }

        .edit-modal-title {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #263653;
        }

        .modal-close-button {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: none;
          background: #6d7787;
          color: white;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          padding: 0;
        }

        .modal-close-button:hover {
          background: #4f5969;
        }

        .edit-modal-body {
          padding: 18px 17px 16px;
        }

        .edit-field {
          margin-bottom: 17px;
        }

        .edit-field:last-child {
          margin-bottom: 0;
        }

        .edit-label {
          display: block;
          margin-bottom: 9px;
          font-size: 14px;
          color: #253450;
          font-weight: 400;
        }

        .edit-input-wrapper {
          position: relative;
        }

        .edit-input {
          width: 100%;
          height: 39px;
          border: 1px solid #dce1e7;
          border-radius: 5px;
          background: #ffffff;
          color: #29364c;
          padding: 0 12px;
          font-size: 14px;
          outline: none;
        }

        .edit-input:focus {
          border-color: #bd9138;
          box-shadow: 0 0 0 1px rgba(189,145,56,0.08);
        }

        .edit-input.with-icon {
          padding-right: 40px;
        }

        .edit-input-icon {
          position: absolute;
          right: 11px;
          top: 50%;
          transform: translateY(-50%);
          color: #9aa5b5;
          pointer-events: none;
        }

        .edit-two-column {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .edit-select-wrapper {
          position: relative;
        }

        .edit-select {
          width: 100%;
          height: 39px;
          border: 1px solid #dce1e7;
          border-radius: 5px;
          background: #ffffff;
          color: #29364c;
          padding: 0 38px 0 12px;
          font-size: 14px;
          outline: none;
          appearance: none;
          -webkit-appearance: none;
          cursor: pointer;
        }

        .edit-select:focus {
          border-color: #bd9138;
        }

        .edit-select-arrow {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #58667a;
          pointer-events: none;
        }

        .edit-modal-footer {
          height: 64px;
          border-top: 1px solid #e3e6eb;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 9px;
          padding: 0 13px;
        }

        .cancel-button {
          height: 39px;
          padding: 0 15px;
          border: none;
          border-radius: 5px;
          background: #f6f7f8;
          color: #253047;
          font-size: 14px;
          cursor: pointer;
        }

        .cancel-button:hover {
          background: #eceef1;
        }

        .save-button {
          height: 39px;
          padding: 0 15px;
          border: none;
          border-radius: 5px;
          background: #bd9138;
          color: white;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }

        .save-button:hover {
          background: #a98030;
        }

        @media (max-width: 1100px) {
          .filter-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .filter-list {
            width: 100%;
            justify-content: flex-start;
          }

          .stats-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .stat-item:nth-child(3) {
            border-right: 0;
          }

          .stat-item:nth-child(4),
          .stat-item:nth-child(5) {
            border-top: 1px solid #dfe3e8;
          }
        }

        @media (max-width: 700px) {
          .attendance-page {
            padding: 20px 12px;
          }

          .today-header {
            align-items: flex-start;
            flex-direction: column;
            gap: 15px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .stat-item {
            border-right: 0;
            border-bottom: 1px solid #dfe3e8;
          }

          .stat-item:last-child {
            border-bottom: 0;
          }

          .stat-item:nth-child(4),
          .stat-item:nth-child(5) {
            border-top: 0;
          }

          .table-toolbar {
            align-items: flex-start;
            flex-direction: column;
            gap: 10px;
          }

          .filter-list {
            flex-direction: column;
            align-items: stretch;
          }

          .custom-select-wrapper,
          .custom-select {
            width: 100% !important;
          }

          .edit-modal-overlay {
            padding: 10px;
          }

          .edit-modal {
            width: 100%;
          }

          .edit-two-column {
            grid-template-columns: 1fr;
            gap: 0;
          }
        }
      `}</style>

      <div className="attendance-content">

        {/* =====================================
            HEADER
        ===================================== */}

        <div className="attendance-header">
          <h1 className="attendance-title">
            Attendance
          </h1>

          <div className="breadcrumb">
            <span
              className="breadcrumb-home"
              onClick={() =>
                navigate("/HR/HrDashboard")
              }
            >
              <Home size={13} />
            </span>

            <span>/</span>

            <span className="breadcrumb-current">
              Attendance
            </span>
          </div>
        </div>

        {/* =====================================
            TODAY CARD
        ===================================== */}

        <div className="today-card">
          <div className="today-header">
            <div>
              <h2 className="today-heading">
                Attendance Details Today
              </h2>

              <p className="today-subtitle">
                Data from the 800+ total no of employees
              </p>
            </div>

            <div className="absent-summary">
              <span>Total Absenties today</span>

              <div className="avatar-stack">
                <span className="stack-avatar" />
                <span className="stack-avatar" />
                <span className="stack-avatar" />
                <span className="stack-avatar" />
                <span className="stack-avatar" />

                <span className="stack-more">
                  +1
                </span>
              </div>
            </div>
          </div>

          <div className="stats-grid">

            <div className="stat-item">
              <span className="stat-label">
                Present
              </span>

              <div className="stat-value-row">
                <span className="stat-value">
                  250
                </span>

                <span className="stat-change up">
                  ↗ +1%
                </span>
              </div>
            </div>

            <div className="stat-item">
              <span className="stat-label">
                Late Login
              </span>

              <div className="stat-value-row">
                <span className="stat-value">
                  45
                </span>

                <span className="stat-change down">
                  ↘ -1%
                </span>
              </div>
            </div>

            <div className="stat-item">
              <span className="stat-label">
                Uninformed
              </span>

              <div className="stat-value-row">
                <span className="stat-value">
                  15
                </span>

                <span className="stat-change down">
                  ↘ -12%
                </span>
              </div>
            </div>

            <div className="stat-item">
              <span className="stat-label">
                Permission
              </span>

              <div className="stat-value-row">
                <span className="stat-value">
                  03
                </span>

                <span className="stat-change up">
                  ↗ +1%
                </span>
              </div>
            </div>

            <div className="stat-item">
              <span className="stat-label">
                Absent
              </span>

              <div className="stat-value-row">
                <span className="stat-value">
                  12
                </span>

                <span className="stat-change down">
                  ↘ -19%
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* =====================================
            TABLE CARD
        ===================================== */}

        <div className="attendance-table-card">

          {/* FILTER HEADER */}

          <div className="filter-header">

            <h2 className="table-heading">
              Attendance
            </h2>

            <div className="filter-list">

              {/* DATE */}

              <div className="custom-select-wrapper">
                <select
                  className="custom-select date-select"
                  value={dateFilter}
                  onChange={(e) =>
                    setDateFilter(e.target.value)
                  }
                >
                  <option>
                    08/27/2026 - 09/02/2026
                  </option>

                  <option>
                    09/02/2026
                  </option>

                  <option>
                    09/01/2026
                  </option>

                  <option>
                    Last 7 Days
                  </option>

                  <option>
                    Last 30 Days
                  </option>

                  <option>
                    This Month
                  </option>
                </select>

                <ChevronDown
                  className="select-arrow"
                  size={15}
                />
              </div>

              {/* DEPARTMENT */}

              <div className="custom-select-wrapper">
                <select
                  className="custom-select department-select"
                  value={departmentFilter}
                  onChange={(e) =>
                    setDepartmentFilter(
                      e.target.value
                    )
                  }
                >
                  <option>
                    Department
                  </option>

                  <option>
                    UI/UX Team
                  </option>

                  <option>
                    Development
                  </option>

                  <option>
                    HR
                  </option>

                  <option>
                    Management
                  </option>

                  <option>
                    Finance
                  </option>
                </select>

                <ChevronDown
                  className="select-arrow"
                  size={15}
                />
              </div>

              {/* STATUS */}

              <div className="custom-select-wrapper">
                <select
                  className="custom-select status-select"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value
                    )
                  }
                >
                  <option>
                    Select Status
                  </option>

                  <option>
                    Present
                  </option>

                  <option>
                    Absent
                  </option>

                  <option>
                    Late
                  </option>
                </select>

                <ChevronDown
                  className="select-arrow"
                  size={15}
                />
              </div>

              {/* SORT */}

              <div className="custom-select-wrapper">
                <select
                  className="custom-select sort-select"
                  value={sortFilter}
                  onChange={(e) =>
                    setSortFilter(
                      e.target.value
                    )
                  }
                >
                  <option>
                    Sort By : Last 7 Days
                  </option>

                  <option>
                    Recently Added
                  </option>

                  <option>
                    Ascending
                  </option>

                  <option>
                    Descending
                  </option>

                  <option>
                    Last Month
                  </option>

                  <option>
                    Last 7 Days
                  </option>
                </select>

                <ChevronDown
                  className="select-arrow"
                  size={15}
                />
              </div>

            </div>
          </div>

          {/* TOOLBAR */}

          <div className="table-toolbar">

            <div className="rows-control">
              <span>
                Row Per Page
              </span>

              <select
                className="rows-select"
                value={rowsPerPage}
                onChange={(e) =>
                  setRowsPerPage(
                    Number(e.target.value)
                  )
                }
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

            <div className="search-wrapper">

              <Search
                size={14}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "8px",
                  color: "#9aa3b0",
                  pointerEvents: "none",
                }}
              />

              <input
                className="search-input"
                placeholder="Search"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

            </div>
          </div>

          {/* TABLE */}

          <div className="table-wrapper">

            <table className="attendance-table">

              <thead>
                <tr>

                  <th>
                    <input
                      type="checkbox"
                      className="header-checkbox"
                      checked={
                        visibleData.length > 0 &&
                        selectedRows.length ===
                          visibleData.length
                      }
                      onChange={toggleAll}
                    />
                  </th>

                  <th>
                    <div className="sortable-header">
                      <span>
                        Employee
                      </span>

                      <ArrowUpDown
                        size={13}
                        className="sort-icon"
                      />
                    </div>
                  </th>

                  <th>
                    <div className="sortable-header">
                      <span>
                        Status
                      </span>

                      <ArrowUpDown
                        size={13}
                        className="sort-icon"
                      />
                    </div>
                  </th>

                  <th>
                    <div className="sortable-header">
                      <span>
                        Check In
                      </span>

                      <ArrowUpDown
                        size={13}
                        className="sort-icon"
                      />
                    </div>
                  </th>

                  <th>
                    <div className="sortable-header">
                      <span>
                        Check Out
                      </span>

                      <ArrowUpDown
                        size={13}
                        className="sort-icon"
                      />
                    </div>
                  </th>

                  <th>
                    <div className="sortable-header">
                      <span>
                        Break
                      </span>

                      <ArrowUpDown
                        size={13}
                        className="sort-icon"
                      />
                    </div>
                  </th>

                  <th>
                    <div className="sortable-header">
                      <span>
                        Late
                      </span>

                      <ArrowUpDown
                        size={13}
                        className="sort-icon"
                      />
                    </div>
                  </th>

                  <th>
                    <div className="sortable-header">
                      <span>
                        Production Hours
                      </span>

                      <ArrowUpDown
                        size={13}
                        className="sort-icon"
                      />
                    </div>
                  </th>

                  <th />

                </tr>
              </thead>

              <tbody>

                {visibleData.map((item) => (

                  <tr key={item.id}>

                    {/* CHECKBOX */}

                    <td className="checkbox-cell">
                      <input
                        type="checkbox"
                        className="row-checkbox"
                        checked={selectedRows.includes(
                          item.id
                        )}
                        onChange={() =>
                          toggleRow(item.id)
                        }
                      />
                    </td>

                    {/* EMPLOYEE */}

                    <td>
                      <div className="employee-cell">

                        <div className="employee-avatar">
                          •••
                        </div>

                        <div className="employee-info">

                          <span className="employee-name">
                            {item.name}
                          </span>

                          <span className="employee-team">
                            {item.team}
                          </span>

                        </div>
                      </div>
                    </td>

                    {/* STATUS */}

                    <td>
                      <span
                        className={getStatusClass(
                          item.status
                        )}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* CHECK IN */}

                    <td>
                      {item.checkIn}
                    </td>

                    {/* CHECK OUT */}

                    <td>
                      {item.checkOut}
                    </td>

                    {/* BREAK */}

                    <td>
                      {item.break}
                    </td>

                    {/* LATE */}

                    <td>
                      {item.late}
                    </td>

                    {/* PRODUCTION */}

                    <td className="hours-cell">
                      <span
                        className={getHoursClass(
                          item.hoursType
                        )}
                      >
                        <Clock3 size={11} />
                        {item.hours}
                      </span>
                    </td>

                    {/* EDIT */}

                    <td>

                      <button
                        type="button"
                        className="edit-button"
                        onClick={() =>
                          handleEdit(item)
                        }
                        title="Edit Attendance"
                      >
                        <Edit3 size={15} />
                      </button>

                    </td>

                  </tr>

                ))}

                {visibleData.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      style={{
                        textAlign: "center",
                        height: "120px",
                        color: "#7b8798",
                      }}
                    >
                      No attendance records found
                    </td>
                  </tr>
                )}

              </tbody>

            </table>
          </div>

          {/* FOOTER */}

          <div className="table-footer">

            <span>
              Showing{" "}
              {visibleData.length === 0
                ? 0
                : 1}{" "}
              - {visibleData.length} of{" "}
              {filteredData.length} entries
            </span>

            <div className="pagination">

              <button className="pagination-button">
                <ChevronLeft size={16} />
              </button>

              <span className="pagination-current">
                1
              </span>

              <button className="pagination-button">
                <ChevronRight size={16} />
              </button>

            </div>
          </div>

        </div>
      </div>

      {/* =================================================
          EDIT ATTENDANCE MODAL
      ================================================= */}

      {showEditModal && editingAttendance && (

        <div
          className="edit-modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget
            ) {
              handleCloseModal();
            }
          }}
        >

          <div
            className="edit-modal"
            onMouseDown={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="edit-modal-header">

              <h2 className="edit-modal-title">
                Edit Attendance
              </h2>

              <button
                type="button"
                className="modal-close-button"
                onClick={handleCloseModal}
              >
                <X size={13} strokeWidth={3} />
              </button>

            </div>

            {/* MODAL BODY */}

            <div className="edit-modal-body">

              {/* DATE */}

              <div className="edit-field">

                <label className="edit-label">
                  Date
                </label>

                <div className="edit-input-wrapper">

                  <input
                    type="text"
                    className="edit-input with-icon"
                    placeholder=""
                    value={editForm.date}
                    onChange={(e) =>
                      handleEditChange(
                        "date",
                        e.target.value
                      )
                    }
                  />

                  <CalendarDays
                    size={16}
                    className="edit-input-icon"
                  />

                </div>
              </div>

              {/* CHECK IN / CHECK OUT */}

              <div className="edit-two-column">

                <div className="edit-field">

                  <label className="edit-label">
                    Check In
                  </label>

                  <div className="edit-input-wrapper">

                    <input
                      type="text"
                      className="edit-input with-icon"
                      value={
                        editForm.checkIn
                      }
                      onChange={(e) =>
                        handleEditChange(
                          "checkIn",
                          e.target.value
                        )
                      }
                    />

                    <Clock3
                      size={17}
                      className="edit-input-icon"
                    />

                  </div>

                </div>

                <div className="edit-field">

                  <label className="edit-label">
                    Check Out
                  </label>

                  <div className="edit-input-wrapper">

                    <input
                      type="text"
                      className="edit-input with-icon"
                      value={
                        editForm.checkOut
                      }
                      onChange={(e) =>
                        handleEditChange(
                          "checkOut",
                          e.target.value
                        )
                      }
                    />

                    <Clock3
                      size={17}
                      className="edit-input-icon"
                    />

                  </div>

                </div>

              </div>

              {/* BREAK / LATE */}

              <div className="edit-two-column">

                <div className="edit-field">

                  <label className="edit-label">
                    Break
                  </label>

                  <input
                    type="text"
                    className="edit-input"
                    value={editForm.break}
                    onChange={(e) =>
                      handleEditChange(
                        "break",
                        e.target.value
                      )
                    }
                  />

                </div>

                <div className="edit-field">

                  <label className="edit-label">
                    Late
                  </label>

                  <input
                    type="text"
                    className="edit-input"
                    value={editForm.late}
                    onChange={(e) =>
                      handleEditChange(
                        "late",
                        e.target.value
                      )
                    }
                  />

                </div>

              </div>

              {/* PRODUCTION HOURS */}

              <div className="edit-field">

                <label className="edit-label">
                  Production Hours
                </label>

                <div className="edit-input-wrapper">

                  <input
                    type="text"
                    className="edit-input with-icon"
                    value={editForm.hours}
                    onChange={(e) =>
                      handleEditChange(
                        "hours",
                        e.target.value
                      )
                    }
                  />

                  <Clock3
                    size={17}
                    className="edit-input-icon"
                  />

                </div>

              </div>

              {/* STATUS */}

              <div className="edit-field">

                <label className="edit-label">
                  Status
                </label>

                <div className="edit-select-wrapper">

                  <select
                    className="edit-select"
                    value={editForm.status}
                    onChange={(e) =>
                      handleEditChange(
                        "status",
                        e.target.value
                      )
                    }
                  >
                    <option value="Present">
                      Present
                    </option>

                    <option value="Absent">
                      Absent
                    </option>

                    <option value="Late">
                      Late
                    </option>
                  </select>

                  <ChevronDown
                    size={16}
                    className="edit-select-arrow"
                  />

                </div>

              </div>

            </div>

            {/* MODAL FOOTER */}

            <div className="edit-modal-footer">

              <button
                type="button"
                className="cancel-button"
                onClick={handleCloseModal}
              >
                Cancel
              </button>

              <button
                type="button"
                className="save-button"
                onClick={handleSaveChanges}
              >
                Save Changes
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default Atendance;
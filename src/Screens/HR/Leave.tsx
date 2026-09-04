import React, { useMemo, useState } from "react";
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

type LeaveStatus = "Approved" | "Declined" | "New";

type LeaveItem = {
  id: number;
  name: string;
  role: string;
  type: string;
  from: string;
  to: string;
  days: string;
  status: LeaveStatus;
  reason?: string;
};

const initialLeaveData: LeaveItem[] = [
  { id: 1, name: "Anthony Lewis", role: "Finance", type: "Medical Leave", from: "14 Jan 2024", to: "15 Jan 2024", days: "2 Days", status: "Declined" },
  { id: 2, name: "Brian Villalobos", role: "Developer", type: "Casual Leave", from: "21 Jan 2024", to: "25 Jan 2024", days: "5 Days", status: "Approved" },
  { id: 3, name: "Harvey Smith", role: "Developer", type: "Medical Leave", from: "20 Feb 2024", to: "22 Feb 2024", days: "3 Days", status: "New" },
  { id: 4, name: "Stephan Peralt", role: "Executive Officer", type: "Annual Leave", from: "15 Mar 2024", to: "17 Mar 2024", days: "3 Days", status: "Approved" },
  { id: 5, name: "Doglas Martini", role: "Manager", type: "Casual Leave", from: "12 Apr 2024", to: "16 Apr 2024", days: "5 Days", status: "Approved" },
  { id: 6, name: "Linda Ray", role: "Finance", type: "Medical Leave", from: "20 Apr 2024", to: "21 Apr 2024", days: "2 Days", status: "Approved" },
  { id: 7, name: "Elliot Murray", role: "Developer", type: "Casual Leave", from: "06 Jul 2024", to: "06 Jul 2024", days: "1 Day", status: "Approved" },
  { id: 8, name: "Rebecca Smtih", role: "Executive Admin", type: "Medical Leave", from: "02 Sep 2024", to: "04 Sep 2024", days: "3 Days", status: "Approved" },
  { id: 9, name: "Connie Waters", role: "Developer", type: "Annual Leave", from: "15 Nov 2024", to: "15 Nov 2024", days: "1 Day", status: "Approved" },
  { id: 10, name: "Lori Broaddus", role: "Finance", type: "Casual Leave", from: "10 Dec 2024", to: "11 Dec 2024", days: "2 Days", status: "Approved" },
];

const Leaves: React.FC = () => {
  const [leaveData, setLeaveData] = useState<LeaveItem[]>(initialLeaveData);
  const [selected, setSelected] = useState<number[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [sortBy, setSortBy] = useState("7");
  const [activeLeave, setActiveLeave] = useState<LeaveItem | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const [addForm, setAddForm] = useState({
    employee: "",
    leaveReason: "",
    from: "",
    to: "",
    leaveType: "",
    days: "",
    reason: "",
  });

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

  const handleSelect = (id: number, checked: boolean) => {
    setSelected((prev) =>
      checked
        ? prev.includes(id)
          ? prev
          : [...prev, id]
        : prev.filter((x) => x !== id)
    );
  };

  const updateStatus = (id: number, status: LeaveStatus) => {
    setLeaveData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
  };

  const statusClass = (status: LeaveStatus) => {
    if (status === "Approved") return "approved";
    if (status === "Declined") return "declined";
    return "new";
  };

  const openAdd = () => {
    setAddForm({
      employee: "",
      leaveReason: "",
      from: "",
      to: "",
      leaveType: "",
      days: "",
      reason: "",
    });
    setAddOpen(true);
  };

  const closeAdd = () => {
    setAddOpen(false);
  };

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

  const handleAddLeave = () => {
    if (
      !addForm.employee ||
      !addForm.leaveReason ||
      !addForm.from ||
      !addForm.to ||
      !addForm.leaveType
    ) {
      alert("Please fill all required fields");
      return;
    }

    const employee = leaveData.find((item) => item.name === addForm.employee);

    const newLeave: LeaveItem = {
      id: Date.now(),
      name: addForm.employee,
      role: employee?.role || "Employee",
      type: addForm.leaveReason,
      from: new Date(`${addForm.from}T00:00:00`).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      to: new Date(`${addForm.to}T00:00:00`).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      days: `${addForm.days || "1"} ${Number(addForm.days || 1) === 1 ? "Day" : "Days"}`,
      status: "New",
      reason: addForm.reason.trim(),
    };

    setLeaveData((prev) => [newLeave, ...prev]);
    setAddOpen(false);
  };

  const openView = (item: LeaveItem) => {
    setActiveLeave(item);
    setViewOpen(true);
  };

  const openChat = (item: LeaveItem) => {
    setActiveLeave(item);
    setChatOpen(true);
  };

  const openEdit = (item: LeaveItem) => {
    setActiveLeave(item);
    setEditOpen(true);
  };

  const openDelete = (item: LeaveItem) => {
    setActiveLeave(item);
    setDeleteOpen(true);
  };

  const saveEdit = () => {
    if (!activeLeave) return;
    setLeaveData((prev) =>
      prev.map((x) => (x.id === activeLeave.id ? activeLeave : x))
    );
    setEditOpen(false);
  };

  const confirmDelete = () => {
    if (!activeLeave) return;
    setLeaveData((prev) => prev.filter((x) => x.id !== activeLeave.id));
    setDeleteOpen(false);
    setActiveLeave(null);
  };

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
        .modal-footer-custom{display:flex;justify-content:flex-end;gap:8px;padding:12px 14px;border-top:1px solid #e5e7eb}.btn-light-custom,.btn-gold-custom,.btn-danger-custom{height:38px;border-radius:6px;border:0;padding:0 16px;font-size:14px}.btn-light-custom{background:#f4f5f7;color:#111827}.btn-gold-custom{background:#c18d2f;color:#fff}.btn-danger-custom{background:#ef1717;color:#fff}
        .delete-body{text-align:center;padding:18px 28px}.delete-icon{width:58px;height:58px;margin:0 auto 16px;border-radius:4px;background:#fde3e3;color:#ef1717;display:flex;align-items:center;justify-content:center}.delete-body h3{font-size:21px;color:#22304f;margin:0 0 8px}.delete-body p{font-size:14px;line-height:1.5;color:#374151;margin:0 auto 18px;max-width:330px}.delete-actions{display:flex;justify-content:center;gap:16px}

        .add-leave-modal{width:min(800px,95vw)}
        .add-leave-form{padding:18px 16px 16px;display:grid;grid-template-columns:1fr 1fr;gap:18px 24px}
        .add-leave-field{display:flex;flex-direction:column;gap:8px}
        .add-leave-field.full{grid-column:1/-1}
        .add-leave-field label{font-size:14px;color:#293754}
        .add-leave-field input,.add-leave-field select,.add-leave-field textarea{width:100%;height:38px;border:1px solid #d8dee6;border-radius:5px;padding:0 10px;font-size:14px;color:#1f2937;background:#fff;outline:none;box-sizing:border-box}
        .add-leave-field textarea{height:86px;padding-top:10px;resize:none}
        .add-leave-field input::placeholder{color:#9aa4b2}

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

        <div className="leave-stats">
          {[
            ["green","Total Present","180/200"],
            ["pink","Planned Leaves","10"],
            ["yellow","Unplanned Leaves","10"],
            ["blue","Pending Requests","15"],
          ].map(([c,t,v]) => (
            <div className="leave-stat" key={t}>
              <div className={`leave-stat-shape ${c}`}><div className="leave-stat-icon"><CircleUserRound size={18}/></div></div>
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
              <select className="leave-select leave-type-select" value={leaveType} onChange={(e)=>setLeaveType(e.target.value)}>
                <option value="">Leave Type</option><option>Medical Leave</option><option>Casual Leave</option><option>Annual Leave</option>
              </select>
              <select className="leave-select leave-sort-select" value={sortBy} onChange={(e)=>setSortBy(e.target.value)}>
                <option value="7">Sort By : Last 7 Days</option><option value="30">Sort By : Last 30 Days</option><option value="name">Sort By : Name</option>
              </select>
            </div>
          </div>

          <div className="leave-tools">
            <div className="leave-entries">Row Per Page
              <select value={rowsPerPage} onChange={(e)=>setRowsPerPage(Number(e.target.value))}><option value={10}>10</option><option value={20}>20</option><option value={30}>30</option></select>
              Entries
            </div>
            <input className="leave-search" placeholder="Search" value={search} onChange={(e)=>setSearch(e.target.value)}/>
          </div>

          <div className="leave-table-wrap">
            <table className="leave-table">
              <thead><tr>
                <th><input type="checkbox" checked={allSelected} onChange={(e)=>handleSelectAll(e.target.checked)}/></th>
                <th>Employee</th><th>Leave Type</th><th>From</th><th>To</th><th>No of Days</th><th>Status</th><th></th>
              </tr></thead>
              <tbody>
                {visibleRows.map((item)=>(
                  <tr key={item.id}>
                    <td><input type="checkbox" checked={selected.includes(item.id)} onChange={(e)=>handleSelect(item.id,e.target.checked)}/></td>
                    <td><div className="leave-employee"><div className="leave-avatar">300 x 300</div><div><div className="leave-name">{item.name}</div><div className="leave-role">{item.role}</div></div></div></td>
                    <td>
                      <div className="leave-type-cell">
                        {item.type}
                        <span className="leave-info-wrap">
                          <Info className="leave-info-icon" size={14}/>
                          <span className="leave-info-tooltip">
                            {item.reason?.trim() ||
                              (item.type === "Medical Leave"
                                ? "I am currently experiencing a fever and need medical leave."
                                : item.type === "Casual Leave"
                                ? "I need leave due to personal work."
                                : "I am planning to take annual leave.")}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td>{item.from}</td><td>{item.to}</td><td>{item.days}</td>
                    <td>
                      <div className="leave-status-wrap">
                        <span className={`leave-status-dot ${statusClass(item.status)}`}/>
                        <select className="leave-status-select" value={item.status} onChange={(e)=>updateStatus(item.id,e.target.value as LeaveStatus)}>
                          <option>Approved</option><option>Declined</option><option>New</option>
                        </select>
                      </div>
                    </td>
                    <td>
                      <div className="leave-actions">
                        <button className="leave-action" onClick={()=>openView(item)}><Eye size={15}/></button>
                        <button className="leave-action" onClick={()=>openChat(item)}><MessageSquareMore size={15}/></button>
                        <button className="leave-action" onClick={()=>openEdit(item)}><Pencil size={15}/></button>
                        <button className="leave-action" onClick={()=>openDelete(item)}><Trash2 size={15}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="leave-footer">
            <span>Showing {visibleRows.length?1:0} - {visibleRows.length} of {filteredRows.length} entries</span>
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
                <X size={14}/>
              </button>
            </div>

            <div className="add-leave-form">
              <div className="add-leave-field">
                <label>Employee</label>
                <select name="employee" value={addForm.employee} onChange={handleAddFormChange}>
                  <option value="">Select</option>
                  {Array.from(new Map(leaveData.map((item) => [item.name, item])).values()).map((item) => (
                    <option key={item.name} value={item.name}>{item.name}</option>
                  ))}
                </select>
              </div>

              <div className="add-leave-field">
                <label>Leave Reason</label>
                <select name="leaveReason" value={addForm.leaveReason} onChange={handleAddFormChange}>
                  <option value="">Select Leave Reason</option>
                  <option value="Medical Leave">Medical Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Annual Leave">Annual Leave</option>
                </select>
              </div>

              <div className="add-leave-field">
                <label>From</label>
                <input name="from" type="date" value={addForm.from} onChange={handleAddFormChange}/>
              </div>

              <div className="add-leave-field">
                <label>To</label>
                <input name="to" type="date" min={addForm.from || undefined} value={addForm.to} onChange={handleAddFormChange}/>
              </div>

              <div className="add-leave-field">
                <label>Leave Type</label>
                <select name="leaveType" value={addForm.leaveType} onChange={handleAddFormChange}>
                  <option value="">Select</option>
                  <option value="Full Day">Full Day</option>
                  <option value="First Half">First Half</option>
                  <option value="Second Half">Second Half</option>
                </select>
              </div>

              <div className="add-leave-field">
                <label>No of Days</label>
                <input name="days" value={addForm.days} readOnly/>
              </div>

              <div className="add-leave-field full">
                <label>Reason</label>
                <textarea name="reason" value={addForm.reason} onChange={handleAddFormChange}/>
              </div>
            </div>

            <div className="modal-footer-custom">
              <button className="btn-light-custom" type="button" onClick={closeAdd}>Cancel</button>
              <button className="btn-gold-custom" type="button" onClick={handleAddLeave}>Add Leave</button>
            </div>
          </div>
        </div>
      )}

      {viewOpen && activeLeave && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <div className="custom-modal-head"><h3>View Leave</h3><button className="custom-close" onClick={()=>setViewOpen(false)}><X size={14}/></button></div>
            <div className="view-grid">
              <div><div className="view-label">Leave Reason</div><div className="view-value">{activeLeave.type}</div></div>
              <div><div className="view-label">From</div><div className="view-value">01-10-2025</div></div>
              <div><div className="view-label">To</div><div className="view-value">15-01-2024</div></div>
              <div><div className="view-label">Leave Type</div><div className="view-value">First Half</div></div>
              <div><div className="view-label">No of Days</div><div className="view-value">01</div></div>
              <div><div className="view-label">Reason</div><div className="view-value">Going to Hospital</div></div>
            </div>
          </div>
        </div>
      )}

      {chatOpen && activeLeave && (
        <div className="custom-modal-overlay">
          <div className="custom-modal chat-modal">
            <div className="chat-profile">
              <div className="chat-avatar">300 x 300<span className="online-dot"/></div>
              <div><div className="chat-name">{activeLeave.name}</div><div className="chat-online">Online</div></div>
              <button className="custom-close" style={{marginLeft:"auto"}} onClick={()=>setChatOpen(false)}><X size={14}/></button>
            </div>
            <div className="chat-body">
              <div className="chat-row">
                <div className="chat-avatar">300 x 300</div>
                <div><div className="chat-bubble">Hi John, I wanted to update you on a new company policy regarding remote work.</div><div className="chat-meta">{activeLeave.name} &nbsp;•&nbsp; 08:00 AM</div></div>
              </div>
              <div className="chat-row">
                <div className="chat-avatar">300 x 300</div>
                <div><div className="chat-bubble">Do you have a moment?</div><div className="chat-meta">{activeLeave.name} &nbsp;•&nbsp; 08:00 AM</div></div>
              </div>
              <div className="chat-row right">
                <div><div className="chat-bubble">Sure, Sarah. What’s the new policy?</div><div className="chat-meta">✓✓ &nbsp; 08:00 AM &nbsp;•&nbsp; You</div></div>
                <div className="chat-avatar">300 x 300</div>
              </div>
            </div>
            <div className="chat-input-wrap"><div className="chat-input"><input placeholder="Type Your Message"/><button className="send-btn"><Send size={16}/></button></div></div>
          </div>
        </div>
      )}

      {editOpen && activeLeave && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <div className="custom-modal-head"><h3>Edit Leave</h3><button className="custom-close" onClick={()=>setEditOpen(false)}><X size={14}/></button></div>
            <div className="edit-form">
              <div className="edit-field"><label>Employee</label><select value={activeLeave.name} onChange={(e)=>setActiveLeave({...activeLeave,name:e.target.value})}>{leaveData.map(x=><option key={x.id}>{x.name}</option>)}</select></div>
              <div className="edit-field"><label>Leave Reason</label><select value={activeLeave.type} onChange={(e)=>setActiveLeave({...activeLeave,type:e.target.value})}><option>Medical Leave</option><option>Casual Leave</option><option>Annual Leave</option></select></div>
              <div className="edit-field"><label>From</label><input placeholder="dd/mm/yyyy"/></div>
              <div className="edit-field"><label>To</label><input value="15-01-2024" readOnly/></div>
              <div className="edit-field"><label>Leave Type</label><select><option>First Half</option><option>Second Half</option><option>Full Day</option></select></div>
              <div className="edit-field"><label>No of Days</label><input value="01" readOnly/></div>
              <div className="edit-field full"><label>Reason</label><textarea defaultValue="Going to Hospital"/></div>
            </div>
            <div className="modal-footer-custom"><button className="btn-light-custom" onClick={()=>setEditOpen(false)}>Cancel</button><button className="btn-gold-custom" onClick={saveEdit}>Save Changes</button></div>
          </div>
        </div>
      )}

      {deleteOpen && activeLeave && (
        <div className="custom-modal-overlay">
          <div className="custom-modal small">
            <div className="delete-body">
              <div className="delete-icon"><Trash2 size={30}/></div>
              <h3>Confirm Delete</h3>
              <p>You want to delete all the marked items, this cant be undone once you delete.</p>
              <div className="delete-actions"><button className="btn-light-custom" onClick={()=>setDeleteOpen(false)}>Cancel</button><button className="btn-danger-custom" onClick={confirmDelete}>Yes, Delete</button></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Leaves;

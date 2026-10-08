import React, { useMemo, useState } from "react";

type HolidayType = "HR Holiday" | "Compliance Holiday";
type HolidayStatus = "Active" | "Inactive";
type Holiday = { id: number; title: string; date: string; description: string; type: HolidayType; status: HolidayStatus };
type HolidayForm = Omit<Holiday, "id">;

const original: Holiday[] = [
  ["New Year", "2024-01-01", "First day of the new year", "Active"],
  ["Martin Luther King Jr. Day", "2024-01-15", "Celebrating the civil rights leader", "Active"],
  ["President's Day", "2024-02-19", "Honoring past US Presidents", "Active"],
  ["Good Friday", "2024-03-29", "Holiday before Easter", "Active"],
  ["Easter Monday", "2024-04-01", "Holiday after Easter", "Active"],
  ["Memorial Day", "2024-04-27", "Honors military personnel", "Active"],
  ["Independence Day", "2024-07-04", "Celebrates Independence", "Active"],
  ["Labour Day", "2024-09-02", "Honors working people", "Inactive"],
  ["Veterans Day", "2024-11-11", "Honors military veterans", "Active"],
  ["Christmas Day", "2024-12-25", "Celebration of Christmas", "Active"],
].map(([title, date, description, status], index) => ({ id: index + 1, title, date, description, status: status as HolidayStatus, type: "HR Holiday" as HolidayType }));

const emptyForm = (type: HolidayType): HolidayForm => ({ title: "", date: "", description: "", type, status: "Active" });
const displayDate = (date: string) => {
  const [y, m, d] = date.split("-").map(Number);
  if (!y || !m || !d) return date;
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const Holidays: React.FC = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([...original, ...original.map(h => ({ ...h, id: h.id + 100, type: "Compliance Holiday" as HolidayType }))]);
  const [tab, setTab] = useState<HolidayType>("HR Holiday");
  const [modal, setModal] = useState<"add" | "edit" | "delete" | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<HolidayForm>(emptyForm("HR Holiday"));
  const [selected, setSelected] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const visible = useMemo(() => holidays.filter(h => h.type === tab && `${h.title} ${h.date} ${h.description} ${h.status}`.toLowerCase().includes(search.toLowerCase())), [holidays, tab, search]);
  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize));
  const rows = visible.slice((page - 1) * pageSize, page * pageSize);
  const allChecked = rows.length > 0 && rows.every(h => selected.includes(h.id));
  const close = () => { setModal(null); setEditingId(null); };
  const startAdd = () => { setForm(emptyForm(tab)); setEditingId(null); setModal("add"); };
  const startEdit = (h: Holiday) => { setForm({ title: h.title, date: h.date, description: h.description, type: h.type, status: h.status }); setEditingId(h.id); setModal("edit"); };
  const startDelete = (id: number) => { setEditingId(id); setModal("delete"); };
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date) return;
    if (modal === "edit" && editingId !== null) setHolidays(prev => prev.map(h => h.id === editingId ? { ...form, id: editingId } : h));
    else setHolidays(prev => [...prev, { ...form, id: Math.max(0, ...prev.map(h => h.id)) + 1 }]);
    close();
  };
  const deleteItems = () => {
    const ids = editingId !== null ? [editingId] : selected;
    setHolidays(prev => prev.filter(h => !ids.includes(h.id)));
    setSelected(prev => prev.filter(id => !ids.includes(id)));
    close();
  };
  const changeTab = (t: HolidayType) => { setTab(t); setPage(1); setSelected([]); setSearch(""); };
  return (
    <div className="accountant-holidays">
      <style>{`
        .accountant-holidays { min-height:100vh; padding:24px; background:#f8fafc; color:#212b36; font-family:Inter,Arial,sans-serif; font-size:14px; }
        .accountant-holidays * { box-sizing:border-box; }
        .accountant-holidays .top { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; margin-bottom:24px; }
        .accountant-holidays h2 { margin:0 0 8px; font-size:24px; font-weight:700; color:#202c39; }
        .accountant-holidays .breadcrumb { color:#6b7280; font-size:13px; display:flex; gap:9px; align-items:center; }
        .accountant-holidays .breadcrumb i { color:#ff6b35; }
        .accountant-holidays .btn { border:1px solid transparent; padding:9px 15px; border-radius:5px; cursor:pointer; font-size:13px; font-weight:600; display:inline-flex; align-items:center; gap:7px; justify-content:center; }
        .accountant-holidays .primary { background:#f26522; color:white; }
        .accountant-holidays .primary:hover { background:#df5312; }
        .accountant-holidays .light { background:#f5f6f8; border-color:#e5e7eb; color:#334155; }
        .accountant-holidays .danger { background:#e3342f; color:white; }
        .accountant-holidays .tabs { display:flex; gap:8px; margin-bottom:20px; flex-wrap:wrap; }
        .accountant-holidays .tab { background:transparent; color:#374151; padding:10px 18px; border:0; border-radius:5px; cursor:pointer; font-weight:600; }
        .accountant-holidays .tab.active { background:#f26522; color:white; }
        .accountant-holidays .card { background:white; border:1px solid #e8edf2; border-radius:7px; overflow:hidden; box-shadow:0 2px 4px rgba(17,24,39,.025); }
        .accountant-holidays .card-header { padding:19px 22px; border-bottom:1px solid #e8edf2; display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap; }
        .accountant-holidays h5 { font-size:17px; margin:0; font-weight:700; }
        .accountant-holidays .table-wrap { overflow-x:auto; }
        .accountant-holidays table { width:100%; border-collapse:collapse; text-align:left; min-width:740px; }
        .accountant-holidays thead { background:#f8fafc; }
        .accountant-holidays th { color:#374151; font-size:13px; font-weight:600; padding:14px 18px; white-space:nowrap; }
        .accountant-holidays td { padding:15px 18px; border-top:1px solid #edf0f4; color:#626e7c; vertical-align:middle; }
        .accountant-holidays .holiday-title { font-weight:600; color:#253247; background:none; border:0; padding:0; cursor:pointer; text-align:left; }
        .accountant-holidays input[type=checkbox] { width:16px; height:16px; accent-color:#f26522; cursor:pointer; }
        .accountant-holidays .badge { display:inline-flex; align-items:center; gap:5px; border-radius:4px; padding:5px 9px; font-weight:600; font-size:12px; }
        .accountant-holidays .badge.active { background:#e7f8ed; color:#1d9b57; }
        .accountant-holidays .badge.inactive { background:#feeceb; color:#db4242; }
        .accountant-holidays .actions { display:flex; gap:15px; }
        .accountant-holidays .icon-btn { padding:2px; background:none; border:0; color:#64748b; cursor:pointer; font-size:18px; }
        .accountant-holidays .icon-btn:hover { color:#f26522; }
        .accountant-holidays .footer { padding:16px 20px; border-top:1px solid #e8edf2; display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap; color:#64748b; font-size:13px; }
        .accountant-holidays .pagination { display:flex; align-items:center; gap:6px; }
        .accountant-holidays .pagination button { border:1px solid #e5e7eb; background:white; border-radius:4px; padding:6px 11px; cursor:pointer; }
        .accountant-holidays .pagination button.current { background:#f26522; color:white; border-color:#f26522; }
        .accountant-holidays .pagination button:disabled { opacity:.4; cursor:not-allowed; }
        .accountant-holidays .search { padding:8px 12px; border:1px solid #dfe5ec; border-radius:5px; outline:none; min-width:200px; }
        .accountant-holidays .overlay { position:fixed; inset:0; z-index:3000; background:rgba(18,28,42,.55); display:flex; align-items:center; justify-content:center; padding:20px; }
        .accountant-holidays .modal-box { background:#fff; border-radius:9px; width:100%; max-width:500px; box-shadow:0 15px 50px rgba(0,0,0,.18); max-height:90vh; overflow:auto; }
        .accountant-holidays .modal-head { padding:18px 22px; border-bottom:1px solid #edf0f4; display:flex; justify-content:space-between; align-items:center; }
        .accountant-holidays .modal-head h4 { margin:0; font-size:19px; }
        .accountant-holidays .modal-body { padding:20px 22px 4px; }
        .accountant-holidays .field { margin-bottom:17px; }
        .accountant-holidays .field label { display:block; font-weight:600; margin-bottom:8px; font-size:13px; }
        .accountant-holidays .field input,.accountant-holidays .field textarea,.accountant-holidays .field select { width:100%; padding:10px 12px; border:1px solid #dce3ea; border-radius:5px; background:white; color:#334155; font:inherit; }
        .accountant-holidays .modal-footer { border-top:1px solid #edf0f4; padding:16px 22px; display:flex; justify-content:flex-end; gap:10px; }
        .accountant-holidays .delete-content { padding:30px 24px; text-align:center; }
        .accountant-holidays .delete-content h4 { font-size:20px; margin:10px 0; }
        .accountant-holidays .delete-content p { color:#64748b; line-height:1.5; }
        @media(max-width:650px) { .accountant-holidays { padding:14px; } .accountant-holidays .card-header { padding:15px; } }
      `}</style>
      <div className="top">
        <div><h2>Holidays</h2><div className="breadcrumb"><i className="ti ti-smart-home" /> <span>/</span> Holidays</div></div>
        <button type="button" className="btn primary" onClick={startAdd}><i className="ti ti-circle-plus" /> Add Holiday</button>
      </div>
      <div className="tabs">
        {(["HR Holiday", "Compliance Holiday"] as HolidayType[]).map(t => <button type="button" key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => changeTab(t)}>{t}</button>)}
      </div>
      <div className="card">
        <div className="card-header"><h5>Holidays List</h5><div style={{display:"flex", gap:8, alignItems:"center"}}><input className="search" aria-label="Search holidays" placeholder="Search holidays..." value={search} onChange={e => {setSearch(e.target.value); setPage(1);}} />{selected.length > 0 && <button type="button" className="btn danger" onClick={() => {setEditingId(null);setModal("delete");}}><i className="ti ti-trash" /> Delete Selected ({selected.length})</button>}</div></div>
        <div className="table-wrap"><table><thead><tr><th><input type="checkbox" aria-label="Select all" checked={allChecked} onChange={e => setSelected(prev => e.target.checked ? [...new Set([...prev, ...rows.map(h => h.id)])] : prev.filter(id => !rows.some(h => h.id === id)))} /></th><th>Title</th><th>Date</th><th>Description</th><th>Status</th><th></th></tr></thead><tbody>
          {rows.map(h => <tr key={h.id}><td><input type="checkbox" aria-label={`Select ${h.title}`} checked={selected.includes(h.id)} onChange={e => setSelected(prev => e.target.checked ? [...prev, h.id] : prev.filter(id => id !== h.id))} /></td><td><button type="button" className="holiday-title" onClick={() => startEdit(h)}>{h.title}</button></td><td>{displayDate(h.date)}</td><td>{h.description}</td><td><span className={`badge ${h.status.toLowerCase()}`}><i className="ti ti-point-filled" />{h.status}</span></td><td><div className="actions"><button type="button" title="Edit holiday" className="icon-btn" onClick={() => startEdit(h)}><i className="ti ti-edit" /></button><button type="button" title="Delete holiday" className="icon-btn" onClick={() => startDelete(h.id)}><i className="ti ti-trash" /></button></div></td></tr>)}
          {rows.length === 0 && <tr><td colSpan={6} style={{textAlign:"center", padding:32}}>No holidays found</td></tr>}
        </tbody></table></div>
        <div className="footer"><div>Showing {visible.length ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, visible.length)} of {visible.length} entries &nbsp; <select aria-label="Rows per page" value={pageSize} onChange={e => {setPageSize(Number(e.target.value));setPage(1);}}>{[5,10,25,50].map(n => <option key={n} value={n}>{n} / page</option>)}</select></div><div className="pagination"><button type="button" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>{Array.from({length:pageCount},(_,i) => <button type="button" key={i} className={page === i+1 ? "current" : ""} onClick={() => setPage(i+1)}>{i+1}</button>)}<button type="button" disabled={page === pageCount} onClick={() => setPage(p => p + 1)}>Next</button></div></div>
      </div>
      {(modal === "add" || modal === "edit") && <div className="overlay" onMouseDown={e => {if(e.target === e.currentTarget) close();}}><div className="modal-box" role="dialog" aria-modal="true" aria-label={modal === "add" ? "Add Holiday" : "Edit Holiday"}><div className="modal-head"><h4>{modal === "add" ? "Add Holiday" : "Edit Holiday"}</h4><button type="button" className="icon-btn" onClick={close}><i className="ti ti-x" /></button></div><form onSubmit={save}><div className="modal-body"><div className="field"><label>Title</label><input required value={form.title} onChange={e => setForm({...form,title:e.target.value})} /></div><div className="field"><label>Date</label><input required type="date" value={form.date} onChange={e => setForm({...form,date:e.target.value})} /></div><div className="field"><label>Holiday Type</label><select value={form.type} onChange={e => setForm({...form,type:e.target.value as HolidayType})}><option>HR Holiday</option><option>Compliance Holiday</option></select></div><div className="field"><label>Description</label><textarea rows={3} value={form.description} onChange={e => setForm({...form,description:e.target.value})} /></div><div className="field"><label>Status</label><select value={form.status} onChange={e => setForm({...form,status:e.target.value as HolidayStatus})}><option>Active</option><option>Inactive</option></select></div></div><div className="modal-footer"><button type="button" className="btn light" onClick={close}>Cancel</button><button type="submit" className="btn primary">{modal === "add" ? "Add Holiday" : "Save Changes"}</button></div></form></div></div>}
      {modal === "delete" && <div className="overlay" onMouseDown={e => {if(e.target === e.currentTarget) close();}}><div className="modal-box" role="dialog" aria-modal="true" aria-label="Confirm Delete"><div className="delete-content"><i className="ti ti-trash-x" style={{fontSize:44,color:"#dc3545"}} /><h4>Confirm Delete</h4><p>You want to delete all the marked items, this cant be undone once you delete.</p><div style={{display:"flex",justifyContent:"center",gap:12,marginTop:22}}><button type="button" className="btn light" onClick={close}>Cancel</button><button type="button" className="btn danger" onClick={deleteItems}>Yes, Delete</button></div></div></div></div>}
    </div>
  );
};

export default Holidays;

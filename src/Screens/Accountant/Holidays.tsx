import React, { useMemo, useState } from "react";
import { FiHome, FiPlusCircle, FiEdit2, FiTrash2, FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";

type HolidayType = "HR Holiday" | "Compliance Holiday";
type HolidayStatus = "Active" | "Inactive";
type Holiday = { id: number; title: string; date: string; description: string; type: HolidayType; status: HolidayStatus };
type HolidayForm = Omit<Holiday, "id">;

const sample: Holiday[] = [
  ["Good Friday", "2026-04-03", "Religious holiday commemorating the crucifixion of Jesus Christ"],
  ["Id-ul-Zuha", "2026-05-27", "Religious holiday observed by Muslims to commemorate the spirit of sacrifice."],
  ["Muharram", "2026-06-26", "Religious observance marking the beginning of the Islamic New Year"],
  ["Independence Day", "2026-08-15", "National holiday commemorating India's independence."],
  ["Raksha Bandhan", "2026-08-28", "Traditional Indian festival celebrating the bond of love and protection between brothers and sisters."],
  ["Gandhi Jayanti", "2026-10-02", "National holiday commemorating the birth anniversary of Mahatma Gandhi."],
  ["Dussehra", "2026-10-20", "Festival celebrating the victory of good over evil."],
  ["Diwali", "2026-11-08", "Festival of lights celebrated across India."],
  ["Christmas", "2026-12-25", "Christmas Day celebration."],
].map(([title, date, description], index) => ({ id: index + 1, title, date, description, type: "HR Holiday" as HolidayType, status: "Active" as HolidayStatus }));

const emptyForm = (type: HolidayType): HolidayForm => ({ title: "", date: "", description: "", type, status: "Active" });
const displayDate = (date: string) => { const [y,m,d] = date.split("-").map(Number); return y && m && d ? new Date(y,m-1,d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : date; };
const financialYear = (date: string) => { const y = Number(date.slice(0,4)), m = Number(date.slice(5,7)); const start = m >= 4 ? y : y - 1; return `${start}-${start + 1}`; };

export default function Holidays() {
  const [holidays, setHolidays] = useState<Holiday[]>(sample);
  const [tab, setTab] = useState<HolidayType>("HR Holiday");
  const [year, setYear] = useState("2026-2027");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<number[]>([]);
  const [modal, setModal] = useState<"add"|"edit"|"delete"|null>(null);
  const [editingId, setEditingId] = useState<number|null>(null);
  const [form, setForm] = useState<HolidayForm>(emptyForm(tab));
  const years = useMemo(() => [...new Set(["2026-2027",...holidays.map(h => financialYear(h.date))])].sort().reverse(),[holidays]);
  const filtered = useMemo(() => holidays.filter(h => h.type === tab && financialYear(h.date) === year && `${h.title} ${h.date} ${h.description} ${h.status}`.toLowerCase().includes(search.toLowerCase())),[holidays,tab,year,search]);
  const pages = Math.max(1,Math.ceil(filtered.length/pageSize));
  const currentPage = Math.min(page,pages);
  const rows = filtered.slice((currentPage-1)*pageSize,currentPage*pageSize);
  const allChecked = rows.length > 0 && rows.every(h => selected.includes(h.id));
  const close = () => { setModal(null); setEditingId(null); };
  const add = () => { setForm(emptyForm(tab)); setEditingId(null); setModal("add"); };
  const edit = (h: Holiday) => { setForm({title:h.title,date:h.date,description:h.description,type:h.type,status:h.status}); setEditingId(h.id); setModal("edit"); };
  const remove = (id: number|null) => { setEditingId(id); setModal("delete"); };
  const save = (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); if (!form.title.trim() || !form.date) return; if(modal === "edit" && editingId !== null) setHolidays(prev => prev.map(h => h.id === editingId ? {...form,id:editingId} : h)); else setHolidays(prev => [...prev,{...form,id:Math.max(0,...prev.map(h=>h.id))+1}]); setTab(form.type); setYear(financialYear(form.date)); setSearch(""); setPage(1); close(); };
  const confirmDelete = () => { const ids = editingId === null ? selected : [editingId]; setHolidays(prev => prev.filter(h => !ids.includes(h.id))); setSelected(prev => prev.filter(id => !ids.includes(id))); close(); };
  return <div className="holiday-page">
    <style>{`
      .holiday-page{background:#f6f7f9;min-height:100vh;padding:25px 48px;font-family:Arial,Helvetica,sans-serif;color:#071c3f;font-size:12px}
      .holiday-page *{box-sizing:border-box}.holiday-page button,.holiday-page input,.holiday-page select,.holiday-page textarea{font:inherit}
      .holiday-page button{cursor:pointer}.holiday-page .hp-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:23px}
      .holiday-page h1{font-size:22px;font-weight:500;margin:0 0 6px}.holiday-page .hp-crumb{display:flex;align-items:center;gap:10px;color:#62738c;font-size:11px}
      .holiday-page .hp-crumb a{color:#005b9a}.holiday-page .hp-primary{border:0;background:#c99734;color:white;border-radius:4px;padding:11px 14px;font-weight:600;display:inline-flex;align-items:center;gap:7px}
      .holiday-page .hp-tabs{display:flex;gap:8px;margin-bottom:15px}.holiday-page .hp-tab{border:0;background:transparent;padding:10px 15px;border-radius:4px;color:#526480}.holiday-page .hp-tab.active{background:#c99734;color:white}
      .holiday-page .hp-card{background:white;border:1px solid #dce2eb;border-radius:5px;overflow:hidden}.holiday-page .hp-cardhead{min-height:46px;padding:8px 18px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #dce2eb;gap:12px}
      .holiday-page .hp-cardhead h2{font-size:14px;font-weight:500;margin:0}.holiday-page .hp-year{display:flex;align-items:center;gap:12px}.holiday-page select,.holiday-page .hp-search{background:white;border:1px solid #dce2eb;border-radius:5px;padding:7px 10px;color:#152d50;outline:none}
      .holiday-page .hp-toolbar{height:53px;display:flex;align-items:center;justify-content:space-between;padding:0 15px;gap:10px}.holiday-page .hp-perpage{display:flex;align-items:center;gap:9px}.holiday-page .hp-perpage select{padding:6px}.holiday-page .hp-search{width:144px;height:30px;font-size:11px}
      .holiday-page .hp-scroll{overflow-x:auto}.holiday-page table{width:100%;min-width:800px;border-collapse:collapse;text-align:left}.holiday-page thead{background:#e0e3e8}.holiday-page th{height:39px;font-weight:600;color:#061c3a;padding:0 15px;white-space:nowrap}.holiday-page td{height:42px;padding:7px 15px;border-bottom:1px solid #dce2eb;color:#647391;font-size:11px}
      .holiday-page th:first-child,.holiday-page td:first-child{width:53px}.holiday-page th:nth-child(2){width:13%}.holiday-page th:nth-child(3){width:10%}.holiday-page th:nth-child(5){width:9%}.holiday-page th:last-child{width:70px}
      .holiday-page .hp-title{color:#071c3f;font-weight:600;background:none;border:0;padding:0;text-align:left}.holiday-page input[type=checkbox]{width:15px;height:15px;accent-color:#c99734;cursor:pointer}
      .holiday-page .hp-status{background:#00be5d;color:white;border-radius:3px;padding:4px 10px;display:inline-block;font-weight:600;font-size:10px}.holiday-page .hp-status.inactive{background:#e34b4b}
      .holiday-page .hp-actions{display:flex;gap:16px}.holiday-page .hp-icon{border:0;background:none;color:#597293;padding:2px;display:inline-flex}.holiday-page .hp-footer{padding:14px 16px;display:flex;align-items:center;justify-content:space-between;gap:10px;color:#66768f}
      .holiday-page .hp-pages{display:flex;align-items:center;gap:8px}.holiday-page .hp-pages button{border:1px solid #dce2eb;background:white;padding:5px 9px;border-radius:4px;color:#233a58}.holiday-page .hp-pages button.active{background:#c99734;color:white;border-color:#c99734}.holiday-page .hp-pages button:disabled{opacity:.4;cursor:default}
      .holiday-page .hp-danger{background:#e14949;color:white;border:0;border-radius:4px;padding:8px 12px}.holiday-page .hp-overlay{position:fixed;inset:0;background:#0006;z-index:3000;display:flex;align-items:center;justify-content:center;padding:15px}
      .holiday-page .hp-modal{width:min(100%,500px);background:white;border-radius:7px;box-shadow:0 12px 35px #0002;max-height:90vh;overflow:auto}.holiday-page .hp-modalhead{padding:17px 20px;border-bottom:1px solid #e3e8ee;display:flex;justify-content:space-between;align-items:center}.holiday-page .hp-modalhead h3{font-size:17px;margin:0}.holiday-page .hp-fields{padding:18px 20px;display:grid;gap:13px}.holiday-page .hp-fields label{display:grid;gap:6px;color:#43546d}.holiday-page .hp-fields input,.holiday-page .hp-fields textarea,.holiday-page .hp-fields select{width:100%;border:1px solid #dce2eb;border-radius:4px;padding:9px;background:white}.holiday-page .hp-modalfoot{padding:14px 20px;border-top:1px solid #e3e8ee;display:flex;justify-content:flex-end;gap:10px}.holiday-page .hp-cancel{border:1px solid #dce2eb;background:white;border-radius:4px;padding:9px 13px}
      @media(max-width:700px){.holiday-page{padding:16px}.holiday-page .hp-top{gap:10px}.holiday-page .hp-cardhead,.holiday-page .hp-toolbar{flex-wrap:wrap;height:auto;padding:12px}.holiday-page .hp-footer{flex-wrap:wrap}}
    `}</style>
    <div className="hp-top"><div><h1>Holidays</h1><div className="hp-crumb"><Link to="/Accountant/AccountantDashboard"><FiHome size={16}/></Link><span>/</span><span>Holidays</span></div></div><button className="hp-primary" onClick={add}><FiPlusCircle/> Add Holiday</button></div>
    <div className="hp-tabs">{(["HR Holiday","Compliance Holiday"] as HolidayType[]).map(t=><button key={t} className={`hp-tab ${tab===t?"active":""}`} onClick={()=>{setTab(t);setPage(1);setSelected([]);}}>{t}</button>)}</div>
    <section className="hp-card"><div className="hp-cardhead"><h2>Holidays List</h2><div className="hp-year"><span>Financial Year</span><select aria-label="Financial Year" value={year} onChange={e=>{setYear(e.target.value);setPage(1);setSelected([]);}}>{years.map(y=><option key={y}>{y}</option>)}</select></div></div>
    <div className="hp-toolbar"><div className="hp-perpage">Row Per Page <select aria-label="Rows per page" value={pageSize} onChange={e=>{setPageSize(Number(e.target.value));setPage(1);}}>{[5,10,20,50].map(n=><option key={n}>{n}</option>)}</select> Entries {selected.length>0&&<button className="hp-danger" onClick={()=>remove(null)}>Delete Selected ({selected.length})</button>}</div><input className="hp-search" placeholder="Search" aria-label="Search holidays" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/></div>
    <div className="hp-scroll"><table><thead><tr><th><input type="checkbox" aria-label="Select all" checked={allChecked} onChange={e=>setSelected(prev=>e.target.checked?[...new Set([...prev,...rows.map(h=>h.id)])]:prev.filter(id=>!rows.some(h=>h.id===id)))}/></th><th>Title　<span style={{color:"#c4ccd7"}}>↕</span></th><th>Date　<span style={{color:"#c4ccd7"}}>↕</span></th><th>Description</th><th>Status　<span style={{color:"#c4ccd7"}}>↕</span></th><th></th></tr></thead><tbody>{rows.map(h=><tr key={h.id}><td><input type="checkbox" aria-label={`Select ${h.title}`} checked={selected.includes(h.id)} onChange={e=>setSelected(prev=>e.target.checked?[...new Set([...prev,h.id])]:prev.filter(id=>id!==h.id))}/></td><td><button className="hp-title" onClick={()=>edit(h)}>{h.title}</button></td><td>{displayDate(h.date)}</td><td>{h.description}</td><td><span className={`hp-status ${h.status.toLowerCase()}`}>• {h.status}</span></td><td><div className="hp-actions"><button className="hp-icon" title="Edit" onClick={()=>edit(h)}><FiEdit2/></button><button className="hp-icon" title="Delete" onClick={()=>remove(h.id)}><FiTrash2/></button></div></td></tr>)}{rows.length===0&&<tr><td colSpan={6} style={{textAlign:"center",padding:25}}>No holidays found</td></tr>}</tbody></table></div>
    <div className="hp-footer"><span>Showing {filtered.length?(currentPage-1)*pageSize+1:0} to {Math.min(currentPage*pageSize,filtered.length)} of {filtered.length} entries</span><div className="hp-pages"><button disabled={currentPage===1} onClick={()=>setPage(currentPage-1)}><FiChevronLeft/></button>{Array.from({length:pages},(_,i)=><button key={i} className={currentPage===i+1?"active":""} onClick={()=>setPage(i+1)}>{i+1}</button>)}<button disabled={currentPage===pages} onClick={()=>setPage(currentPage+1)}><FiChevronRight/></button></div></div></section>
    {(modal==="add"||modal==="edit")&&<div className="hp-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)close();}}><div className="hp-modal"><div className="hp-modalhead"><h3>{modal==="add"?"Add Holiday":"Edit Holiday"}</h3><button className="hp-icon" onClick={close}><FiX size={20}/></button></div><form onSubmit={save}><div className="hp-fields"><label>Title<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label><label>Date<input type="date" required value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></label><label>Holiday Type<select value={form.type} onChange={e=>setForm({...form,type:e.target.value as HolidayType})}><option>HR Holiday</option><option>Compliance Holiday</option></select></label><label>Description<textarea rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label><label>Status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value as HolidayStatus})}><option>Active</option><option>Inactive</option></select></label></div><div className="hp-modalfoot"><button type="button" className="hp-cancel" onClick={close}>Cancel</button><button type="submit" className="hp-primary">{modal==="add"?"Add Holiday":"Save Changes"}</button></div></form></div></div>}
    {modal==="delete"&&<div className="hp-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)close();}}><div className="hp-modal"><div className="hp-modalhead"><h3>Confirm Delete</h3><button className="hp-icon" onClick={close}><FiX size={20}/></button></div><div style={{padding:24,textAlign:"center"}}>Are you sure you want to delete the selected holiday record(s)?</div><div className="hp-modalfoot"><button className="hp-cancel" onClick={close}>Cancel</button><button className="hp-danger" onClick={confirmDelete}>Yes, Delete</button></div></div></div>}
  </div>;
}

import { useMemo, useState, type FormEvent } from "react";

import { Link } from "react-router-dom";

import { FiChevronLeft, FiChevronRight, FiClock, FiEdit2, FiHome, FiX } from "react-icons/fi";



type AttendanceStatus = "Present" | "Absent";

type Employee = {

  id: number; name: string; department: string; status: AttendanceStatus;

  checkIn: string; checkOut: string; breakTime: string; late: string;

  hours: string; hourColor: "green" | "red" | "blue";

};



const initialEmployees: Employee[] = [

  { id: 1, name: "Anthony Lewis", department: "UI/UX Team", status: "Present", checkIn: "09:00 AM", checkOut: "06:45 PM", breakTime: "30 Min", late: "32 Min", hours: "8.55 Hrs", hourColor: "green" },

  { id: 2, name: "Brian Villalobos", department: "Development", status: "Present", checkIn: "09:00 AM", checkOut: "06:12 PM", breakTime: "20 Min", late: "20 Min", hours: "7.54 Hrs", hourColor: "red" },

  { id: 3, name: "Harvey Smith", department: "HR", status: "Present", checkIn: "09:00 AM", checkOut: "06:13 PM", breakTime: "50 Min", late: "23 Min", hours: "8.45 Hrs", hourColor: "green" },

  { id: 4, name: "Stephan Peralt", department: "Management", status: "Present", checkIn: "09:00 AM", checkOut: "06:23 PM", breakTime: "41 Min", late: "50 Min", hours: "8.35 Hrs", hourColor: "green" },

  { id: 5, name: "Doglas Martini", department: "Development", status: "Present", checkIn: "09:00 AM", checkOut: "06:43 PM", breakTime: "23 Min", late: "10 Min", hours: "8.22 Hrs", hourColor: "green" },

  { id: 6, name: "Linda Ray", department: "UI/UX Team", status: "Present", checkIn: "09:00 AM", checkOut: "07:15 PM", breakTime: "03 Min", late: "30 Min", hours: "8.32 Hrs", hourColor: "green" },

  { id: 7, name: "Elliot Murray", department: "UI/UX Team", status: "Present", checkIn: "09:00 AM", checkOut: "07:13 PM", breakTime: "32 Min", late: "41 Min", hours: "9.15 Hrs", hourColor: "blue" },

  { id: 8, name: "Rebecca Smith", department: "UI/UX Team", status: "Present", checkIn: "09:00 AM", checkOut: "09:17 PM", breakTime: "14 Min", late: "12 Min", hours: "9.25 Hrs", hourColor: "green" },

  { id: 9, name: "Connie Waters", department: "Management", status: "Present", checkIn: "09:00 AM", checkOut: "08:15 PM", breakTime: "12 Min", late: "03 Min", hours: "8.35 Hrs", hourColor: "green" },

  { id: 10, name: "Lori Broaddus", department: "Finance", status: "Absent", checkIn: "-", checkOut: "-", breakTime: "-", late: "-", hours: "0.00 Hrs", hourColor: "red" },

];



const metrics = [

  { label: "Present", value: "250", change: "+1%", good: true },

  { label: "Late Login", value: "45", change: "-1%", good: false },

  { label: "Uninformed", value: "15", change: "-12%", good: false },

  { label: "Permisson", value: "03", change: "+1%", good: true },

  { label: "Absent", value: "12", change: "-19%", good: false },

];






export default function Attendance() {

  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);

  const [search, setSearch] = useState("");

  const [department, setDepartment] = useState("");

  const [status, setStatus] = useState("");

  const [sort, setSort] = useState("Last 7 Days");

  const [dateFrom, setDateFrom] = useState("2026-10-03");

  const [dateTo, setDateTo] = useState("2026-10-09");

  const [pageSize, setPageSize] = useState(10);

  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState<number[]>([]);

  const [editing, setEditing] = useState<Employee | null>(null);



  const filtered = useMemo(() => {

    let list = employees.filter((employee) =>

      `${employee.name} ${employee.department} ${employee.status}`.toLowerCase().includes(search.toLowerCase()) &&

      (!department || employee.department === department) &&

      (!status || employee.status === status)

    );

    if (sort === "Ascending") list = [...list].sort((a, b) => a.name.localeCompare(b.name));

    if (sort === "Descending") list = [...list].sort((a, b) => b.name.localeCompare(a.name));

    // Demo records do not have individual dates; the date inputs are visual only.

    return list;

  }, [employees, search, department, status, sort]);



  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const currentPage = Math.min(page, pages);

  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const allChecked = visible.length > 0 && visible.every((employee) => selected.includes(employee.id));

  const resetPage = () => setPage(1);



  const saveEdit = (event: FormEvent<HTMLFormElement>) => {

    event.preventDefault();

    if (!editing) return;

    setEmployees((previous) => previous.map((employee) => employee.id === editing.id ? editing : employee));

    setEditing(null);

  };



  return (

    <div className="accountant-attendance">

      <style>{`

        .accountant-attendance{padding:24px;background:#f7f8fa;min-height:100vh;color:#102448;font-family:Arial,Helvetica,sans-serif;font-size:13px}

        .accountant-attendance *{box-sizing:border-box}

        .accountant-attendance .at-title{font-size:24px;font-weight:700;margin:0 0 7px}

        .accountant-attendance .at-breadcrumb{display:flex;align-items:center;gap:11px;margin-bottom:26px;font-size:12px}

        .accountant-attendance .at-breadcrumb a{color:#253852;text-decoration:none}

        .accountant-attendance .at-card{background:white;border:1px solid #e4e8ee;border-radius:6px;overflow:hidden;margin-bottom:22px}

        .accountant-attendance .at-summary{padding:20px}

        .accountant-attendance .at-summary-head{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:27px}

        .accountant-attendance .at-summary-head h3{font-size:18px;margin:0 0 7px;font-weight:700}

        .accountant-attendance .at-summary-head p{color:#788497;font-size:14px;margin:0}

        .accountant-attendance .at-absentees{display:flex;align-items:center;gap:22px;font-weight:600;white-space:nowrap}

        .accountant-attendance .at-avatar-stack{display:flex;align-items:center;padding-left:7px}

        .accountant-attendance .at-avatar-stack span{width:24px;height:24px;margin-left:-9px;border:1px solid white;background:#c8c8c8;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:9px}

        .accountant-attendance .at-avatar-stack span:last-child{background:#bc8d3b;width:27px;height:27px;font-size:11px}

        .accountant-attendance .at-metrics{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));border:1px solid #e0e5ec;border-radius:4px}

        .accountant-attendance .at-metric{padding:18px 16px;min-width:0;border-right:1px solid #e0e5ec}

        .accountant-attendance .at-metric:last-child{border-right:0}

        .accountant-attendance .at-metric-label{color:#69798f;font-size:14px;margin-bottom:7px}

        .accountant-attendance .at-metric-bottom{display:flex;align-items:center;justify-content:space-between;gap:6px}

        .accountant-attendance .at-metric-value{font-size:16px;color:#102448;font-weight:500}

        .accountant-attendance .at-change{font-size:11px;color:white;padding:3px 7px;border-radius:4px;font-weight:700;white-space:nowrap}

        .accountant-attendance .at-change.good{background:#00c46b}.accountant-attendance .at-change.bad{background:#ed0505}

        .accountant-attendance .at-list-head{padding:16px 20px;min-height:72px;display:flex;align-items:center;justify-content:space-between;gap:15px;border-bottom:1px solid #e2e6ec}

        .accountant-attendance .at-list-head h3{font-size:16px;font-weight:700;margin:0}

        .accountant-attendance .at-filters{display:flex;align-items:center;gap:15px;flex-wrap:wrap}

        .accountant-attendance .at-control{height:39px;padding:0 13px;background:white;border:1px solid #dce2e9;border-radius:5px;color:#102448;font-size:13px;outline:none}

        .accountant-attendance .at-select{appearance:none;padding-right:32px;background-image:url("data:image/svg+xml,%3Csvg xmlns='http\://www\.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%230d2548' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center}

        .accountant-attendance .at-date-range{display:flex;align-items:center;gap:9px;flex-wrap:wrap}
        .accountant-attendance .at-date-field{display:flex;align-items:center;gap:7px;font-size:12px;color:#52627a;white-space:nowrap}
        .accountant-attendance .at-date-field input{width:132px;height:39px;padding:0 9px;border:1px solid #dce2e9;border-radius:6px;background:#fff;color:#102448;font-size:12px;outline:none;color-scheme:light}
        .accountant-attendance .at-date-field input:focus{border-color:#bc8d3b}
        .accountant-attendance .at-date-separator{color:#728097}
        .accountant-attendance .at-datebox{display:flex;align-items:center;gap:4px;border:1px solid #dce2e9;border-radius:5px;height:39px;padding:0 9px;position:relative;min-width:196px}

        .accountant-attendance .at-datebox span{white-space:nowrap;font-size:13px}

        .accountant-attendance .at-datebox input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer}

        .accountant-attendance .at-datebox svg{margin-left:auto;flex-shrink:0}

        .accountant-attendance .at-toolbar{height:60px;padding:0 16px;display:flex;align-items:center;justify-content:space-between;gap:12px;border-bottom:1px solid #e1e5eb}

        .accountant-attendance .at-per-page{display:flex;align-items:center;gap:9px;white-space:nowrap}

        .accountant-attendance .at-per-page select{height:28px;padding:0 7px;border:1px solid #dfe4ec;border-radius:5px;color:#34425b;background:#fff}

        .accountant-attendance .at-search{width:160px;height:31px;border:1px solid #dfe4ec;border-radius:5px;padding:0 12px;outline:none}

        .accountant-attendance .at-table-wrap{overflow-x:auto}

        .accountant-attendance .at-table{width:100%;min-width:970px;border-collapse:collapse;text-align:left;font-size:13px}

        .accountant-attendance .at-table thead{background:#e5e8ed}

        .accountant-attendance .at-table th{height:43px;padding:0 16px;color:#0b1b35;font-weight:600;white-space:nowrap}

        .accountant-attendance .at-table th .at-sort-arrow{float:right;color:#c6cdd7;font-size:16px;font-weight:400}

        .accountant-attendance .at-table td{height:59px;padding:8px 16px;border-bottom:1px solid #e2e7ed;color:#687891;white-space:nowrap}

        .accountant-attendance .at-table tbody tr:last-child td{border-bottom:0}

        .accountant-attendance .at-table input[type=checkbox]{width:17px;height:17px;accent-color:#bd903b;cursor:pointer}

        .accountant-attendance .at-employee{display:flex;align-items:center;gap:9px}

        .accountant-attendance .at-employee-avatar{width:32px;height:32px;flex-shrink:0;border-radius:50%;background:#ccc;color:#b6b6b6;font-size:10px;display:flex;align-items:center;justify-content:center}

        .accountant-attendance .at-employee-name{color:#091d3b;font-size:14px;margin-bottom:5px}

        .accountant-attendance .at-employee-team{font-size:12px;color:#728097}

        .accountant-attendance .at-status{display:inline-flex;align-items:center;gap:6px;border-radius:4px;padding:4px 9px;font-size:11px;font-weight:600}

        .accountant-attendance .at-status.present{background:#d4f6e4;color:#00b65b}

        .accountant-attendance .at-status.absent{background:#fde6e7;color:#e3212a}

        .accountant-attendance .at-dot{width:5px;height:5px;border-radius:50%;background:currentColor}

        .accountant-attendance .at-hours{display:inline-flex;align-items:center;gap:4px;padding:4px 7px;color:white;font-size:11px;font-weight:700;border-radius:4px}

        .accountant-attendance .at-hours.green{background:#00bf61}.accountant-attendance .at-hours.red{background:#ef0505}.accountant-attendance .at-hours.blue{background:#2488ff}

        .accountant-attendance .at-edit{border:0;background:transparent;color:#526a8a;cursor:pointer;padding:5px}

        .accountant-attendance .at-footer{height:58px;padding:0 17px;display:flex;align-items:center;justify-content:space-between;color:#66758b;font-size:13px}

        .accountant-attendance .at-pagination{display:flex;align-items:center;gap:15px}

        .accountant-attendance .at-pagination button{border:0;background:transparent;color:#9aa5b3;cursor:pointer;display:flex;align-items:center;justify-content:center}

        .accountant-attendance .at-pagination button:disabled{opacity:.45;cursor:default}

        .accountant-attendance .at-page-current{background:#b88d3c;color:#fff;width:27px;height:27px;border-radius:50%;display:flex;align-items:center;justify-content:center}

        .accountant-attendance .at-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:3000;padding:16px}

        .accountant-attendance .at-modal{background:white;border-radius:8px;width:min(100%,520px);padding:22px;box-shadow:0 15px 45px #0002}

        .accountant-attendance .at-modal-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}

        .accountant-attendance .at-modal-header h3{margin:0;font-size:19px}

        .accountant-attendance .at-modal-grid{display:grid;grid-template-columns:1fr 1fr;gap:13px}

        .accountant-attendance .at-modal-grid label{display:flex;flex-direction:column;gap:6px;color:#53647c}

        .accountant-attendance .at-modal-grid input,.accountant-attendance .at-modal-grid select{height:36px;border:1px solid #dce2e9;border-radius:5px;padding:0 10px;background:white}

        .accountant-attendance .at-modal-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:20px}

        .accountant-attendance .at-modal-actions button{padding:10px 16px;border-radius:5px;border:1px solid #dce2e9;cursor:pointer}

        .accountant-attendance .at-modal-actions button[type=submit]{background:#b88d3c;color:#fff;border-color:#b88d3c}

        @media(max-width:1050px){.accountant-attendance .at-list-head{align-items:flex-start;flex-direction:column}.accountant-attendance .at-metrics{overflow-x:auto;grid-template-columns:repeat(5,minmax(160px,1fr))}}

        @media(max-width:650px){.accountant-attendance{padding:15px}.accountant-attendance .at-summary-head{align-items:flex-start;flex-direction:column}.accountant-attendance .at-modal-grid{grid-template-columns:1fr}.accountant-attendance .at-filters{gap:8px}}

      `}</style>



      <h1 className="at-title">Attendance</h1>

      <div className="at-breadcrumb"><Link to="/Accountant/AccountantDashboard" aria-label="Dashboard"><FiHome size={12}/></Link><span>/</span><span>Attendance</span></div>



      <section className="at-card at-summary">

        <div className="at-summary-head">

          <div><h3>Attendance Details Today</h3><p>Data from the 800+ total no of employees</p></div>

          <div className="at-absentees"><span>Total Absenties today</span><div className="at-avatar-stack">{[1,2,3,4,5].map((i)=><span key={i}>···</span>)}<span>+1</span></div></div>

        </div>

        <div className="at-metrics">{metrics.map((metric)=><div className="at-metric" key={metric.label}><div className="at-metric-label">{metric.label}</div><div className="at-metric-bottom"><span className="at-metric-value">{metric.value}</span><span className={`at-change ${metric.good ? "good" : "bad"}`}>⌁ {metric.change}</span></div></div>)}</div>

      </section>



      <section className="at-card">

        <div className="at-list-head">

          <h3>Attendance</h3>

          <div className="at-filters">

            <div className="at-date-range">
                <label className="at-date-field">
                  <span>From Date</span>
                  <input type="date" aria-label="From Date" value={dateFrom} max={dateTo || undefined} onChange={(e) => { setDateFrom(e.target.value); resetPage(); }} />
                </label>
                <span className="at-date-separator">-</span>
                <label className="at-date-field">
                  <span>To Date</span>
                  <input type="date" aria-label="To Date" value={dateTo} min={dateFrom || undefined} onChange={(e) => { setDateTo(e.target.value); resetPage(); }} />
                </label>
              </div>

            <select className="at-control at-select" aria-label="Department" value={department} onChange={(e)=>{setDepartment(e.target.value);resetPage();}}><option value="">Department</option>{[...new Set(employees.map((e)=>e.department))].map((d)=><option key={d} value={d}>{d}</option>)}</select>

            <select className="at-control at-select" aria-label="Select Status" value={status} onChange={(e)=>{setStatus(e.target.value);resetPage();}}><option value="">Select Status</option><option value="Present">Present</option><option value="Absent">Absent</option></select>

            <select className="at-control at-select" aria-label="Sort By" value={sort} onChange={(e)=>{setSort(e.target.value);resetPage();}}>{["Last 7 Days","Recently Added","Ascending","Descending","Last Month"].map((s)=><option key={s} value={s}>{s === "Last 7 Days" ? "Sort By : Last 7 Days" : s}</option>)}</select>

          </div>

        </div>

        <div className="at-toolbar"><div className="at-per-page">Row Per Page <select aria-label="Rows per page" value={pageSize} onChange={(e)=>{setPageSize(Number(e.target.value));resetPage();}}>{[5,10,20,50].map((n)=><option key={n} value={n}>{n}</option>)}</select> Entries</div><input className="at-search" aria-label="Search employees" placeholder="Search" value={search} onChange={(e)=>{setSearch(e.target.value);resetPage();}}/></div>

        <div className="at-table-wrap"><table className="at-table"><thead><tr><th><input type="checkbox" aria-label="Select all" checked={allChecked} onChange={(e)=>setSelected((old)=>e.target.checked?[...new Set([...old,...visible.map((r)=>r.id)])]:old.filter((id)=>!visible.some((r)=>r.id===id)))}/></th>{["Employee","Status","Check In","Check Out","Break","Late","Production Hours",""].map((heading)=><th key={heading}>{heading}{heading && <span className="at-sort-arrow">↕</span>}</th>)}</tr></thead><tbody>{visible.map((employee)=><tr key={employee.id}><td><input type="checkbox" aria-label={`Select ${employee.name}`} checked={selected.includes(employee.id)} onChange={(e)=>setSelected((old)=>e.target.checked?[...old,employee.id]:old.filter((id)=>id!==employee.id))}/></td><td><div className="at-employee"><span className="at-employee-avatar">···</span><div><div className="at-employee-name">{employee.name}</div><div className="at-employee-team">{employee.department}</div></div></div></td><td><span className={`at-status ${employee.status.toLowerCase()}`}><span className="at-dot"/>{employee.status}</span></td><td>{employee.checkIn}</td><td>{employee.checkOut}</td><td>{employee.breakTime}</td><td>{employee.late}</td><td><span className={`at-hours ${employee.hourColor}`}><FiClock size={11}/>{employee.hours}</span></td><td><button type="button" className="at-edit" title={`Edit ${employee.name}`} onClick={()=>setEditing({...employee})}><FiEdit2 size={15}/></button></td></tr>)}{visible.length===0&&<tr><td colSpan={9} style={{textAlign:"center",padding:24}}>No attendance records found</td></tr>}</tbody></table></div>

        <div className="at-footer"><span>Showing {filtered.length?(currentPage-1)*pageSize+1:0} - {Math.min(currentPage*pageSize,filtered.length)} of {filtered.length} entries</span><div className="at-pagination"><button type="button" aria-label="Previous page" disabled={currentPage<=1} onClick={()=>setPage(currentPage-1)}><FiChevronLeft/></button><span className="at-page-current">{currentPage}</span><button type="button" aria-label="Next page" disabled={currentPage>=pages} onClick={()=>setPage(currentPage+1)}><FiChevronRight/></button></div></div>

      </section>



      {editing && <div className="at-overlay" onMouseDown={(e)=>{if(e.target===e.currentTarget)setEditing(null);}}><div className="at-modal"><div className="at-modal-header"><h3>Edit Attendance</h3><button type="button" className="at-edit" aria-label="Close" onClick={()=>setEditing(null)}><FiX size={20}/></button></div><form onSubmit={saveEdit}><div className="at-modal-grid">{([ ["checkIn","Check In"],["checkOut","Check Out"],["breakTime","Break"],["late","Late"],["hours","Production Hours"] ] as const).map(([key,label])=><label key={key}>{label}<input value={editing[key]} onChange={(e)=>setEditing({...editing,[key]:e.target.value})}/></label>)}<label>Status<select value={editing.status} onChange={(e)=>setEditing({...editing,status:e.target.value as AttendanceStatus,hourColor:e.target.value==="Absent"?"red":"green"})}><option>Present</option><option>Absent</option></select></label></div><div className="at-modal-actions"><button type="button" onClick={()=>setEditing(null)}>Cancel</button><button type="submit">Save Changes</button></div></form></div></div>}

    </div>

  );

}

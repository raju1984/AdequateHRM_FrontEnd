import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

type AttendanceRow = { id:number; name:string; team:string; image:string; status:'Present'|'Absent'; checkIn:string; checkOut:string; breakTime:string; late:string; hours:string; hourColor:'success'|'danger'|'info' };
const originalRows: AttendanceRow[] = [
  [1,'Anthony Lewis','UI/UX Team','user-49.jpg','Present','09:00 AM','06:45 PM','30 Min','32 Min','8.55 Hrs','success'],
  [2,'Brian Villalobos','Development','user-09.jpg','Present','09:00 AM','06:12 PM','20 Min','20 Min','7.54 Hrs','danger'],
  [3,'Harvey Smith','HR','user-01.jpg','Present','09:00 AM','06:13 PM','50 Min','23 Min','8.45 Hrs','success'],
  [4,'Stephan Peralt','Management','user-33.jpg','Present','09:00 AM','06:23 PM','41 Min','50 Min','8.35 Hrs','success'],
  [5,'Doglas Martini','Development','user-34.jpg','Present','09:00 AM','06:43 PM','23 Min','10 Min','8.22 Hrs','success'],
  [6,'Linda Ray','UI/UX Team','user-02.jpg','Present','09:00 AM','07:15 PM','03 Min','30 Min','8.32 Hrs','success'],
  [7,'Elliot Murray','UI/UX Team','user-35.jpg','Present','09:00 AM','07:13 PM','32 Min','41 Min','9.15 Hrs','info'],
  [8,'Rebecca Smtih','UI/UX Team','user-30.jpg','Present','09:00 AM','09:17 PM','14 Min','12 Min','9.25 Hrs','success'],
  [9,'Connie Waters','Management','user-36.jpg','Present','09:00 AM','08:15 PM','12 Min','03 Min','8.35 Hrs','success'],
  [10,'Lori Broaddus','Finance','user-38.jpg','Absent','-','-','-','-','0.00 Hrs','danger'],
].map(([id,name,team,image,status,checkIn,checkOut,breakTime,late,hours,hourColor])=>({id,name,team,image,status,checkIn,checkOut,breakTime,late,hours,hourColor} as AttendanceRow));

const assets='/assets/img/';
const summaries = [
  {label:'Present',value:'250',change:'+1%',positive:true},
  {label:'Late Login',value:'45',change:'-1%',positive:false},
  {label:'Uninformed',value:'15',change:'-12%',positive:false},
  {label:'Permisson',value:'03',change:'+1%',positive:true},
  {label:'Absent',value:'12',change:'-19%',positive:false},
];
const inputKeys=['date','checkIn','checkOut','breakTime','late','hours'] as const;
type EditValues = Record<(typeof inputKeys)[number],string> & {status:'Present'|'Absent'};
const initialEdit:EditValues={date:'15 Apr 2025',checkIn:'09:00 AM',checkOut:'06:45 PM',breakTime:'30 Min',late:'32 Min',hours:'8.55 Hrs',status:'Present'};
export default function Attendance(){
  const [rows,setRows]=useState(originalRows);
  const [department,setDepartment]=useState('');
  const [status,setStatus]=useState('');
  const [sort,setSort]=useState('Last 7 Days');
  const [dateFrom,setDateFrom]=useState('');
  const [dateTo,setDateTo]=useState('');
  const [selected,setSelected]=useState<number[]>([]);
  const [editId,setEditId]=useState<number|null>(null);
  const [reportId,setReportId]=useState<number|null>(null);
  const [edit,setEdit]=useState<EditValues>(initialEdit);
  const [page,setPage]=useState(1);
  const [pageSize,setPageSize]=useState(10);
  const filtered=useMemo(()=>{
    let result=rows.filter(r=>(!department||r.team===department)&&(!status||r.status===status));
    if(sort==='Ascending') result=[...result].sort((a,b)=>a.name.localeCompare(b.name));
    if(sort==='Desending') result=[...result].sort((a,b)=>b.name.localeCompare(a.name));
    if(sort==='Recently Added') result=[...result].reverse();
    return result;
  },[rows,department,status,sort]);
  const pages=Math.max(1,Math.ceil(filtered.length/pageSize));
  const visible=filtered.slice((Math.min(page,pages)-1)*pageSize,Math.min(page,pages)*pageSize);
  const allChecked=visible.length>0&&visible.every(r=>selected.includes(r.id));
  const openEdit=(r:AttendanceRow)=>{setEditId(r.id);setEdit({...initialEdit,checkIn:r.checkIn,checkOut:r.checkOut,breakTime:r.breakTime,late:r.late,hours:r.hours,status:r.status});};
  const saveEdit=(event:FormEvent<HTMLFormElement>)=>{event.preventDefault();setRows(prev=>prev.map(r=>r.id===editId?{...r,status:edit.status,checkIn:edit.checkIn,checkOut:edit.checkOut,breakTime:edit.breakTime,late:edit.late,hours:edit.hours,hourColor:edit.status==='Absent'?'danger':r.hourColor}:r));setEditId(null);};
  const report=rows.find(r=>r.id===reportId);
  return <><style>{`.accountant-attendance { background:#f5f6fa; min-height:100vh; color:#202c3c; }
.accountant-attendance .card { background:#fff; border:1px solid #e9edf2; border-radius:5px; box-shadow:0 1px 2px rgba(0,0,0,.025); margin-bottom:24px; }
.accountant-attendance .card-header { background:#fff; border-bottom:1px solid #e9edf2; padding:16px 20px; }
.accountant-attendance .card-body { padding:20px; }
.accountant-attendance h2 { font-size:20px; font-weight:600; }
.accountant-attendance h4 { font-size:18px; font-weight:600; }
.accountant-attendance h5 { font-size:16px; font-weight:600; }
.accountant-attendance h6 { font-size:14px; font-weight:600; }
.accountant-attendance p { color:#6c7684; }
.accountant-attendance .breadcrumb { font-size:13px; }
.accountant-attendance .attendance-avatars { display:flex; align-items:center; }
.accountant-attendance .avatar { width:36px; height:36px; display:inline-flex; align-items:center; justify-content:center; border-radius:50%; overflow:hidden; background:#edf2f6; flex-shrink:0; }
.accountant-attendance .avatar img { width:100%; height:100%; object-fit:cover; }
.accountant-attendance .attendance-avatars .avatar { width:32px; height:32px; margin-left:-8px; border:2px solid white; }
.accountant-attendance .attendance-avatars .avatar:first-child { margin-left:0; }
.accountant-attendance .badge { padding:5px 8px; font-size:11px; font-weight:600; border-radius:4px; }
.accountant-attendance .badge-success { background:#1baf77; color:#fff; }
.accountant-attendance .badge-danger { background:#e74646; color:#fff; }
.accountant-attendance .badge-info { background:#20a8d8; color:#fff; }
.accountant-attendance .badge-success-transparent { background:#e3f7ec; color:#15945c; }
.accountant-attendance .badge-danger-transparent { background:#ffeded; color:#d64141; }
.accountant-attendance .attendance-summary .col-md { min-width:135px; }
.accountant-attendance .attendance-filters { gap:10px; }
.accountant-attendance .attendance-filters .form-select { width:auto; min-width:128px; font-size:13px; }
.accountant-attendance .attendance-date-range { display:flex; align-items:center; gap:6px; }
.accountant-attendance .attendance-date-range input { width:140px; font-size:12px; }
.accountant-attendance .attendance-table { margin-bottom:0; white-space:nowrap; font-size:13px; }
.accountant-attendance .attendance-table th { padding:14px 15px; background:#f5f7fa; font-weight:600; color:#333c49; }
.accountant-attendance .attendance-table td { padding:13px 15px; vertical-align:middle; border-color:#eef0f3; }
.accountant-attendance .attendance-table .avatar-md { width:40px; height:40px; }
.accountant-attendance .attendance-name { border:0; padding:0; background:none; color:#263446; font-weight:600; }
.accountant-attendance .attendance-name:hover { color:#c39339; }
.accountant-attendance .attendance-icon-button { border:0; background:transparent; color:#66758b; padding:6px; font-size:17px; }
.accountant-attendance .attendance-icon-button:hover { color:#c39339; }
.attendance-modal-overlay { position:fixed; inset:0; z-index:2000; background:rgba(0,0,0,.52); display:flex; align-items:center; justify-content:center; padding:18px; overflow:auto; }
.attendance-modal-overlay .modal-dialog { width:100%; max-width:500px; margin:auto; }
.attendance-modal-overlay .modal-dialog.modal-lg { max-width:800px; }
.attendance-modal-overlay .modal-content { border-radius:6px; background:#fff; overflow:hidden; }
.attendance-modal-overlay .modal-header,.attendance-modal-overlay .modal-footer { padding:16px 20px; }
.attendance-modal-overlay .modal-body { padding:20px; max-height:70vh; overflow:auto; }
.attendance-modal-overlay .form-label { font-weight:500; }
.attendance-modal-overlay .attendance-timeline { overflow-x:auto; gap:10px; font-size:10px; }
@media(max-width:850px){.accountant-attendance .attendance-filters{width:100%;}.accountant-attendance .attendance-date-range{flex-wrap:wrap}.accountant-attendance .attendance-summary .col-md{border-bottom:1px solid #eee;}}
`}</style><div className="accountant-attendance content p-3 p-md-4">
    <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3"><div className="my-auto mb-2"><h2 className="mb-1">Attendance</h2><nav><ol className="breadcrumb mb-0"><li className="breadcrumb-item"><Link to="/Accountant/AccountantDashboard"><i className="ti ti-smart-home"/></Link></li><li className="breadcrumb-item active">Attendance</li></ol></nav></div></div>
    <div className="card border-0"><div className="card-body"><div className="row align-items-center mb-4"><div className="col-md-5"><div className="mb-3 mb-md-0"><h4 className="mb-1">Attendance Details Today</h4><p className="mb-0">Data from the 800+ total no of employees</p></div></div><div className="col-md-7"><div className="d-flex align-items-center justify-content-md-end flex-wrap gap-2"><h6 className="mb-0">Total Absenties today</h6><div className="avatar-list-stacked avatar-group-sm ms-md-4 attendance-avatars">{['02','03','05','06','07'].map(n=><span className="avatar avatar-rounded" key={n}><img src={`${assets}profiles/avatar-${n}.jpg`} alt="Absent employee"/></span>)}<span className="avatar bg-primary avatar-rounded text-white fs-12">+1</span></div></div></div></div><div className="border rounded"><div className="row gx-0 attendance-summary">{summaries.map((s,i)=><div className={`col-md col-sm-4 ${i!==summaries.length-1?'border-end':''}`} key={s.label}><div className="p-3"><span className="fw-medium mb-1 d-block">{s.label}</span><div className="d-flex align-items-center justify-content-between"><h5 className="mb-0">{s.value}</h5><span className={`badge ${s.positive?'badge-success':'badge-danger'} d-inline-flex align-items-center`}><i className="ti ti-arrow-wave-right-down me-1"/>{s.change}</span></div></div></div>)}</div></div></div></div>
    <div className="card"><div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3"><h5 className="mb-0">Attendance</h5><div className="d-flex my-xl-auto right-content align-items-center flex-wrap row-gap-3 attendance-filters"><div className="attendance-date-range"><input aria-label="From date" title="From date" type="date" className="form-control" value={dateFrom} onChange={e=>setDateFrom(e.target.value)}/><span>-</span><input aria-label="To date" title="To date" type="date" className="form-control" value={dateTo} min={dateFrom||undefined} onChange={e=>setDateTo(e.target.value)}/></div><select className="form-select" aria-label="Department" value={department} onChange={e=>{setDepartment(e.target.value);setPage(1)}}><option value="">Department</option>{['Finance','Application Development','IT Management','UI/UX Team','Development','HR','Management'].map(d=><option key={d}>{d}</option>)}</select><select className="form-select" aria-label="Select Status" value={status} onChange={e=>{setStatus(e.target.value);setPage(1)}}><option value="">Select Status</option><option>Present</option><option>Absent</option></select><select className="form-select" aria-label="Sort By" value={sort} onChange={e=>setSort(e.target.value)}>{['Last 7 Days','Recently Added','Ascending','Desending','Last Month'].map(s=><option key={s}>{s}</option>)}</select></div></div>
    <div className="card-body p-0"><div className="custom-datatable-filter table-responsive"><table className="table datatable attendance-table"><thead className="thead-light"><tr><th><input className="form-check-input" type="checkbox" aria-label="Select all" checked={allChecked} onChange={e=>setSelected(prev=>e.target.checked?[...new Set([...prev,...visible.map(r=>r.id)])]:prev.filter(id=>!visible.some(r=>r.id===id)))}/></th>{['Employee','Status','Check In','Check Out','Break','Late','Production Hours',''].map((label,i)=><th key={i}>{label}</th>)}</tr></thead><tbody>{visible.map(r=><tr key={r.id}><td><input type="checkbox" className="form-check-input" aria-label={`Select ${r.name}`} checked={selected.includes(r.id)} onChange={e=>setSelected(prev=>e.target.checked?[...prev,r.id]:prev.filter(id=>id!==r.id))}/></td><td><div className="d-flex align-items-center file-name-icon"><button type="button" className="avatar avatar-md border avatar-rounded p-0" onClick={()=>setReportId(r.id)}><img src={`${assets}users/${r.image}`} className="img-fluid" alt={r.name}/></button><div className="ms-2"><h6 className="fw-medium mb-0"><button type="button" className="attendance-name" onClick={()=>setReportId(r.id)}>{r.name}</button></h6><span className="fs-12 fw-normal text-muted">{r.team}</span></div></div></td><td><span className={`badge badge-${r.status==='Present'?'success':'danger'}-transparent d-inline-flex align-items-center`}><i className="ti ti-point-filled me-1"/>{r.status}</span></td><td>{r.checkIn}</td><td>{r.checkOut}</td><td>{r.breakTime}</td><td>{r.late}</td><td><span className={`badge badge-${r.hourColor} d-inline-flex align-items-center`}><i className="ti ti-clock-hour-11 me-1"/>{r.hours}</span></td><td><button type="button" className="attendance-icon-button" title="Edit Attendance" onClick={()=>openEdit(r)}><i className="ti ti-edit"/></button></td></tr>)}{visible.length===0&&<tr><td colSpan={9} className="text-center py-4">No attendance records found</td></tr>}</tbody></table></div></div><div className="card-footer d-flex flex-wrap justify-content-between align-items-center gap-2"><div className="d-flex align-items-center gap-2 text-muted small">Showing {filtered.length?Math.min((page-1)*pageSize+1,filtered.length):0} to {Math.min(page*pageSize,filtered.length)} of {filtered.length} entries <select className="form-select form-select-sm w-auto" value={pageSize} onChange={e=>{setPageSize(Number(e.target.value));setPage(1)}}><option value={10}>10</option><option value={5}>5</option></select></div><div className="d-flex align-items-center gap-2"><button className="btn btn-sm btn-outline-secondary" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Previous</button><span>{page} / {pages}</span><button className="btn btn-sm btn-outline-secondary" disabled={page>=pages} onClick={()=>setPage(p=>p+1)}>Next</button></div></div></div>
    {editId!==null&&<div className="attendance-modal-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setEditId(null)}}><div className="modal-dialog modal-dialog-centered"><div className="modal-content"><div className="modal-header"><h4 className="modal-title">Edit Attendance</h4><button type="button" className="btn-close" aria-label="Close" onClick={()=>setEditId(null)}/></div><form onSubmit={saveEdit}><div className="modal-body pb-0"><div className="row"><div className="col-md-12 mb-3"><label className="form-label">Date</label><input className="form-control" value={edit.date} onChange={e=>setEdit(p=>({...p,date:e.target.value}))}/></div>{([['checkIn','Check In'],['checkOut','Check Out'],['breakTime','Break'],['late','Late'],['hours','Production Hours']] as const).map(([key,label])=><div className={key==='hours'?'col-md-12 mb-3':'col-md-6 mb-3'} key={key}><label className="form-label">{label}</label><input className="form-control" value={edit[key]} onChange={e=>setEdit(p=>({...p,[key]:e.target.value}))}/></div>)}<div className="col-md-12 mb-3"><label className="form-label">Status</label><select className="form-select" value={edit.status} onChange={e=>setEdit(p=>({...p,status:e.target.value as 'Present'|'Absent'}))}><option>Present</option><option>Absent</option></select></div></div></div><div className="modal-footer"><button type="button" className="btn btn-light me-2" onClick={()=>setEditId(null)}>Cancel</button><button type="submit" className="btn btn-primary">Save Changes</button></div></form></div></div></div>}
    {report&&<div className="attendance-modal-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setReportId(null)}}><div className="modal-dialog modal-dialog-centered modal-lg"><div className="modal-content"><div className="modal-header"><h4 className="modal-title">Attendance</h4><button type="button" className="btn-close" aria-label="Close" onClick={()=>setReportId(null)}/></div><div className="modal-body"><div className="card shadow-none bg-light"><div className="card-body pb-1"><div className="row align-items-center"><div className="col-lg-4"><div className="d-flex align-items-center mb-3"><span className="avatar avatar-sm avatar-rounded flex-shrink-0 me-2"><img src={`${assets}users/${report.image}`} alt={report.name}/></span><div><h6 className="fw-medium mb-0">{report.name}</h6><span>{report.team}</span></div></div></div><div className="col-lg-8"><div className="row">{[['Date','15 Apr 2025'],['Punch in at',report.checkIn],['Punch out at',report.checkOut],['Status',report.status]].map(([label,value])=><div className="col-sm-3" key={label}><div className="mb-3 text-sm-end"><span>{label}</span><p className="text-gray-9 fw-medium">{value}</p></div></div>)}</div></div></div></div></div><div className="card shadow-none border mb-0"><div className="card-body"><div className="row">{[['Total Working hours','12h 36m','dark'],['Productive Hours','08h 36m','success'],['Break hours','22m 15s','warning'],['Overtime','02h 15m','info']].map(([label,value,color])=><div className="col-xl-3 col-sm-6" key={label}><div className="mb-4"><p className="d-flex align-items-center mb-1"><i className={`ti ti-point-filled text-${color} me-1`}/>{label}</p><h3>{value}</h3></div></div>)}</div><div className="row"><div className="col-md-8 mx-auto"><div className="progress bg-light mb-3" style={{height:24}}>{[18,5,28,17,22,5,3,2].map((width,i)=><div key={i} className={`progress-bar bg-${i===6||i===7?'info':i%2?'warning':'success'} rounded me-1`} style={{width:`${width}%`}}/>)}</div></div><div className="col-md-12"><div className="d-flex align-items-center justify-content-between attendance-timeline">{['06:00','07:00','08:00','09:00','10:00','11:00','12:00','01:00','02:00','03:00','04:00','05:00','06:00','07:00','08:00','09:00','10:00','11:00'].map((t,i)=><span key={i}>{t}</span>)}</div></div></div></div></div></div></div></div></div>}
  </div></>;
}

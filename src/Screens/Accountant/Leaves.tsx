import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

type Status = "Approved" | "Declined" | "New";
type Leave = { id:number; name:string; department:string; image:string; type:string; from:string; to:string; days:number; status:Status; reason:string; duration:string };
type Modal = "add" | "edit" | "view" | "delete" | "chat" | null;
const initial: Leave[] = [
  ["Anthony Lewis","Finance","user-32.jpg","Medical Leave","2024-01-14","2024-01-15",2,"Declined"],
  ["Brian Villalobos","Developer","user-09.jpg","Casual Leave","2024-01-21","2024-01-25",5,"Approved"],
  ["Harvey Smith","Developer","user-01.jpg","Medical Leave","2024-02-20","2024-02-22",3,"New"],
  ["Stephan Peralt","Executive Officer","user-33.jpg","Annual Leave","2024-03-15","2024-03-17",3,"Approved"],
  ["Doglas Martini","Manager","user-34.jpg","Casual Leave","2024-04-12","2024-04-16",5,"Approved"],
  ["Linda Ray","Finance","user-02.jpg","Medical Leave","2024-04-20","2024-04-21",2,"Approved"],
  ["Elliot Murray","Developer","user-35.jpg","Casual Leave","2024-07-06","2024-07-06",1,"Approved"],
  ["Rebecca Smtih","Executive","user-36.jpg","Medical Leave","2024-09-02","2024-09-04",3,"Approved"],
  ["Connie Waters","Developer","user-37.jpg","Annual Leave","2024-11-15","2024-11-15",1,"Approved"],
  ["Lori Broaddus","Finance","user-38.jpg","Casual Leave","2024-12-02","2024-12-03",2,"New"],
].map((r,i)=>({id:i+1,name:r[0] as string,department:r[1] as string,image:r[2] as string,type:r[3] as string,from:r[4] as string,to:r[5] as string,days:r[6] as number,status:r[7] as Status,reason:"I am currently experiencing a fever and design & Development",duration:"Full Day"}));
const blank: Leave = {id:0,name:"",department:"",image:"",type:"Medical Leave",from:"",to:"",days:1,status:"New",reason:"",duration:"Full Day"};
const formatDate = (s:string) => s ? new Date(`${s}T12:00:00`).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "-";
const calcDays = (a:string,b:string) => a && b ? Math.max(0,Math.round((new Date(`${b}T12:00:00`).getTime()-new Date(`${a}T12:00:00`).getTime())/86400000)+1) : 0;
const styles = `
.accountant-leaves{padding:24px;background:#f8fafc;min-height:100vh;color:#202c4b;font-size:14px}
.accountant-leaves .al-head{display:flex;justify-content:space-between;align-items:center;gap:15px;margin-bottom:22px;flex-wrap:wrap}
.accountant-leaves h2{font-size:24px;font-weight:700;margin:0 0 8px}
.accountant-leaves h5{font-size:18px;font-weight:600;margin:0}
.accountant-leaves .al-crumb{font-size:13px;color:#6b7280}.accountant-leaves .al-crumb a{color:#6b7280;text-decoration:none}
.accountant-leaves .al-primary{background:#c39339;border:1px solid #c39339;color:white;border-radius:5px;padding:9px 15px;font-weight:600;cursor:pointer}
.accountant-leaves .al-primary:hover{background:#a87c2c}
.accountant-leaves .al-cards{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px;margin-bottom:24px}
.accountant-leaves .al-stat{border-radius:7px;padding:23px 20px;display:flex;align-items:center;justify-content:space-between;min-height:116px}
.accountant-leaves .al-stat-icon{height:48px;width:48px;border-radius:50%;background:white;display:grid;place-items:center;font-size:23px}
.accountant-leaves .al-stat p{margin:0 0 7px}.accountant-leaves .al-stat strong{font-size:23px}
.accountant-leaves .al-panel{background:#fff;border:1px solid #e9edf1;border-radius:7px;overflow:hidden}
.accountant-leaves .al-panel-head{padding:19px 20px;display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;border-bottom:1px solid #edf0f4}
.accountant-leaves .al-filters{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.accountant-leaves input:not([type=checkbox]),.accountant-leaves select,.accountant-leaves textarea{border:1px solid #e3e7ed;border-radius:5px;padding:9px 12px;background:#fff;color:#344054;font:inherit;max-width:100%}
.accountant-leaves .al-table-wrap{overflow-x:auto}.accountant-leaves table{width:100%;border-collapse:collapse;white-space:nowrap;text-align:left}
.accountant-leaves th{background:#f8f9fb;color:#374151;font-size:13px;font-weight:600;padding:15px 13px}
.accountant-leaves td{border-top:1px solid #edf0f4;padding:13px;vertical-align:middle}
.accountant-leaves .al-employee{display:flex;align-items:center;gap:10px}.accountant-leaves .al-avatar{width:40px;height:40px;border-radius:50%;object-fit:cover;border:1px solid #e5e7eb}
.accountant-leaves .al-employee strong{display:block;font-size:14px}.accountant-leaves .al-employee small{color:#6b7280}
.accountant-leaves .al-status{border:1px solid #e3e7ed;border-radius:5px;background:#fff;padding:7px;cursor:pointer;color:#344054}
.accountant-leaves .al-dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:7px}
.accountant-leaves .al-actions{display:flex;gap:13px}.accountant-leaves .al-actions button{border:0;background:transparent;color:#67748e;cursor:pointer;font-size:18px;padding:2px}
.accountant-leaves .al-actions button:hover{color:#c39339}.accountant-leaves .al-footer{padding:16px 20px;border-top:1px solid #edf0f4;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
.accountant-leaves .al-page{padding:6px 11px;border:1px solid #e3e7ed;border-radius:4px;background:white;cursor:pointer;margin-left:5px}
.accountant-leaves .al-overlay{position:fixed;inset:0;background:#11182788;z-index:3000;display:flex;align-items:center;justify-content:center;padding:16px}
.accountant-leaves .al-modal{width:100%;max-width:570px;max-height:90vh;overflow:auto;background:white;border-radius:9px;box-shadow:0 20px 60px #0002}
.accountant-leaves .al-modal-head,.accountant-leaves .al-modal-foot{padding:18px 22px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #edf0f4}
.accountant-leaves .al-modal-foot{border-bottom:0;border-top:1px solid #edf0f4;justify-content:flex-end;gap:10px}
.accountant-leaves .al-modal-body{padding:20px 22px}.accountant-leaves .al-grid{display:grid;grid-template-columns:1fr 1fr;gap:15px}
.accountant-leaves .al-field{display:flex;flex-direction:column;gap:7px;margin-bottom:14px}.accountant-leaves .al-field label{font-weight:600}
.accountant-leaves .al-light{background:white;border:1px solid #d9dfe8;border-radius:5px;padding:9px 14px;cursor:pointer}
.accountant-leaves .al-danger{background:#dc3545;color:white;border:0;border-radius:5px;padding:9px 14px;cursor:pointer}
.accountant-leaves .al-info{color:#0d6efd;cursor:help;margin-left:8px}
@media(max-width:1100px){.accountant-leaves .al-cards{grid-template-columns:repeat(2,1fr)}}
@media(max-width:600px){.accountant-leaves{padding:15px}.accountant-leaves .al-cards{grid-template-columns:1fr}.accountant-leaves .al-grid{grid-template-columns:1fr}}
`;
const statusColor:Record<Status,string>={Approved:"#16a34a",Declined:"#dc3545",New:"#8759df"};
export default function Leaves(){
 const [records,setRecords]=useState<Leave[]>(initial);
 const [modal,setModal]=useState<Modal>(null);
 const [selected,setSelected]=useState<Leave|null>(null);
 const [form,setForm]=useState<Leave>(blank);
 const [filterType,setFilterType]=useState("All");
 const [sort,setSort]=useState("Recently Added");
 const [fromFilter,setFromFilter]=useState("");
 const [toFilter,setToFilter]=useState("");
 const [checked,setChecked]=useState<number[]>([]);
 const [page,setPage]=useState(1);
 const [message,setMessage]=useState("");
 const filtered=useMemo(()=>{
  const arr=records.filter(r=>(filterType==="All"||r.type===filterType)&&(!fromFilter||r.from>=fromFilter)&&(!toFilter||r.to<=toFilter));
  if(sort==="Ascending")arr.sort((a,b)=>a.name.localeCompare(b.name));
  else if(sort==="Descending")arr.sort((a,b)=>b.name.localeCompare(a.name));
  else if(sort==="Last Month"){const cutoff=new Date();cutoff.setMonth(cutoff.getMonth()-1);return arr.filter(r=>r.from>=cutoff.toISOString().slice(0,10));}
  else if(sort==="Last 7 Days"){const cutoff=new Date();cutoff.setDate(cutoff.getDate()-7);return arr.filter(r=>r.from>=cutoff.toISOString().slice(0,10));}
  else arr.sort((a,b)=>b.id-a.id);
  return arr;
 },[records,filterType,sort,fromFilter,toFilter]);
 const pages=Math.max(1,Math.ceil(filtered.length/10));
 const shown=filtered.slice((Math.min(page,pages)-1)*10,Math.min(page,pages)*10);
 const open=(kind:Modal,record?:Leave)=>{setSelected(record??null);setForm(record?{...record}:{...blank});setMessage("");setModal(kind)};
 const save=(e:FormEvent)=>{e.preventDefault();if(!form.name.trim()||!form.from||!form.to||form.to<form.from){alert("Please enter valid employee and leave dates.");return;}
  const next={...form,days:calcDays(form.from,form.to),id:modal==="add"?Math.max(0,...records.map(r=>r.id))+1:form.id};
  setRecords(old=>modal==="add"?[next,...old]:old.map(r=>r.id===next.id?next:r));setModal(null);setPage(1);
 };
 const setStatus=(id:number,status:Status)=>setRecords(old=>old.map(r=>r.id===id?{...r,status}:r));
 return <div className="accountant-leaves"><style>{styles}</style>
  <div className="al-head"><div><h2>Leaves</h2><div className="al-crumb"><Link to="/Accountant/AccountantDashboard"><i className="ti ti-smart-home"/></Link> &nbsp; / &nbsp; Leaves</div></div><button className="al-primary" onClick={()=>open("add")}><i className="ti ti-circle-plus"/> &nbsp;Add Leave</button></div>
  <div className="al-cards">{[
   ["Total Present","180/200","ti-user-check","#e7f7ef","#16a34a"],
   ["Planned Leaves","10","ti-user-edit","#fce9ef","#db2777"],
   ["Unplanned Leaves","10","ti-user-exclamation","#fff4d7","#d97706"],
   ["Pending Requests","15","ti-user-question","#e4f2ff","#0284c7"]
  ].map(([label,count,ico,bg,color])=><div className="al-stat" key={label} style={{background:bg}}><span className="al-stat-icon" style={{color}}><i className={`ti ${ico}`}/></span><div style={{textAlign:"right"}}><p>{label}</p><strong>{count}</strong></div></div>)}</div>
  <section className="al-panel"><div className="al-panel-head"><h5>Leave List</h5><div className="al-filters"><input aria-label="From date" type="date" value={fromFilter} onChange={e=>{setFromFilter(e.target.value);setPage(1)}}/><span>–</span><input aria-label="To date" type="date" value={toFilter} onChange={e=>{setToFilter(e.target.value);setPage(1)}}/><select aria-label="Leave Type" value={filterType} onChange={e=>{setFilterType(e.target.value);setPage(1)}}><option value="All">Leave Type</option>{["Medical Leave","Casual Leave","Annual Leave"].map(x=><option key={x}>{x}</option>)}</select><select aria-label="Sort By" value={sort} onChange={e=>{setSort(e.target.value);setPage(1)}}>{["Recently Added","Ascending","Descending","Last Month","Last 7 Days"].map(x=><option key={x}>{x}</option>)}</select></div></div>
  <div className="al-table-wrap"><table><thead><tr><th><input aria-label="Select all" type="checkbox" checked={shown.length>0&&shown.every(r=>checked.includes(r.id))} onChange={e=>setChecked(old=>e.target.checked?[...new Set([...old,...shown.map(r=>r.id)])]:old.filter(id=>!shown.some(r=>r.id===id)))}/></th><th>Employee</th><th>Leave Type</th><th>From</th><th>To</th><th>No of Days</th><th>Status</th><th></th></tr></thead><tbody>{shown.map(r=><tr key={r.id}><td><input aria-label={`Select ${r.name}`} type="checkbox" checked={checked.includes(r.id)} onChange={e=>setChecked(old=>e.target.checked?[...old,r.id]:old.filter(id=>id!==r.id))}/></td><td><div className="al-employee"><img className="al-avatar" src={`/assets/img/users/${r.image||"user-32.jpg"}`} alt=""/><div><strong>{r.name}</strong><small>{r.department}</small></div></div></td><td>{r.type}<span className="al-info" title={r.reason}><i className="ti ti-info-circle"/></span></td><td>{formatDate(r.from)}</td><td>{formatDate(r.to)}</td><td>{r.days} {r.days===1?"Day":"Days"}</td><td><span className="al-dot" style={{background:statusColor[r.status]}}/><select className="al-status" aria-label={`Status for ${r.name}`} value={r.status} onChange={e=>setStatus(r.id,e.target.value as Status)}>{["Approved","Declined","New"].map(s=><option key={s}>{s}</option>)}</select></td><td><div className="al-actions"><button title="View Leave" onClick={()=>open("view",r)}><i className="ti ti-eye"/></button><button title="Chat" onClick={()=>open("chat",r)}><i className="ti ti-messages"/></button><button title="Edit Leave" onClick={()=>open("edit",r)}><i className="ti ti-edit"/></button><button title="Delete Leave" onClick={()=>open("delete",r)}><i className="ti ti-trash"/></button></div></td></tr>)}{shown.length===0&&<tr><td colSpan={8} style={{textAlign:"center",padding:35}}>No leave records found</td></tr>}</tbody></table></div>
  <div className="al-footer"><span>Showing {filtered.length?Math.min((page-1)*10+1,filtered.length):0} - {Math.min(page*10,filtered.length)} of {filtered.length} entries</span><div><button className="al-page" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Previous</button><button className="al-page" style={{background:"#c39339",color:"white"}}>{page}</button><button className="al-page" disabled={page>=pages} onClick={()=>setPage(p=>p+1)}>Next</button></div></div></section>
  {modal&&<div className="al-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setModal(null)}}><div className="al-modal" role="dialog" aria-modal="true" aria-label={`${modal} leave`}><div className="al-modal-head"><h5>{modal==="add"?"Add Leave":modal==="edit"?"Edit Leave":modal==="view"?"View Leave":modal==="delete"?"Confirm Delete":"Chat"}</h5><button className="al-light" onClick={()=>setModal(null)} aria-label="Close">✕</button></div>
  {(modal==="add"||modal==="edit")&&<form onSubmit={save}><div className="al-modal-body"><div className="al-field"><label>Employee</label><select required value={form.name} onChange={e=>{const emp=initial.find(r=>r.name===e.target.value);setForm(f=>({...f,name:e.target.value,department:emp?.department||"",image:emp?.image||""}))}}><option value="">Select Employee</option>{initial.map(r=><option key={r.name}>{r.name}</option>)}</select></div><div className="al-field"><label>Leave Reason</label><select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>{["Annual Leave","Medical Leave","Casual Leave","Emergency Leave","Compassionate Leave","Unpaid Leave","Maternity Leave","Paternity Leave"].map(t=><option key={t}>{t}</option>)}</select></div><div className="al-grid"><div className="al-field"><label>From</label><input type="date" required value={form.from} onChange={e=>setForm(f=>({...f,from:e.target.value}))}/></div><div className="al-field"><label>To</label><input type="date" required min={form.from||undefined} value={form.to} onChange={e=>setForm(f=>({...f,to:e.target.value}))}/></div></div><div className="al-field"><label>Leave Type</label><select value={form.duration} onChange={e=>setForm(f=>({...f,duration:e.target.value}))}>{["Full Day","First Half","Second Half"].map(t=><option key={t}>{t}</option>)}</select></div><div className="al-field"><label>No of Days</label><input readOnly value={calcDays(form.from,form.to)} /></div><div className="al-field"><label>Reason</label><textarea rows={3} value={form.reason} onChange={e=>setForm(f=>({...f,reason:e.target.value}))}/></div></div><div className="al-modal-foot"><button type="button" className="al-light" onClick={()=>setModal(null)}>Cancel</button><button className="al-primary" type="submit">{modal==="add"?"Add Leave":"Save Changes"}</button></div></form>}
  {modal==="view"&&selected&&<><div className="al-modal-body"><div className="al-employee" style={{marginBottom:20}}><img className="al-avatar" src={`/assets/img/users/${selected.image}`} alt=""/><div><strong>{selected.name}</strong><small>{selected.department}</small></div></div><div className="al-grid">{[["Leave Reason",selected.type],["From",formatDate(selected.from)],["To",formatDate(selected.to)],["Leave Type",selected.duration],["No of Days",String(selected.days)],["Status",selected.status]].map(([k,v])=><div key={k}><small style={{color:"#6b7280"}}>{k}</small><h5 style={{margin:"6px 0 18px"}}>{v}</h5></div>)}</div><small>Reason</small><p>{selected.reason}</p></div><div className="al-modal-foot"><button className="al-light" onClick={()=>setModal(null)}>Close</button></div></>}
  {modal==="delete"&&selected&&<><div className="al-modal-body" style={{textAlign:"center"}}><i className="ti ti-trash" style={{fontSize:40,color:"#dc3545"}}/><h4>Confirm Delete</h4><p>Are you sure you want to delete {selected.name}'s leave?</p></div><div className="al-modal-foot"><button className="al-light" onClick={()=>setModal(null)}>Cancel</button><button className="al-danger" onClick={()=>{setRecords(old=>old.filter(r=>r.id!==selected.id));setModal(null)}}>Yes, Delete</button></div></>}
  {modal==="chat"&&selected&&<><div className="al-modal-body"><p>Message to {selected.name}</p><textarea style={{width:"100%"}} rows={4} placeholder="Type Your Message" value={message} onChange={e=>setMessage(e.target.value)}/><small>Demo only: messages are not sent to a server.</small></div><div className="al-modal-foot"><button className="al-light" onClick={()=>setModal(null)}>Cancel</button><button className="al-primary" onClick={()=>{if(message.trim())setModal(null)}}>Send</button></div></>}
  </div></div>}
 </div>;
}
    
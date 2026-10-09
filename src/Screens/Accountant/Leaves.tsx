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

  ["Rebecca Smith","Executive","user-36.jpg","Medical Leave","2024-09-02","2024-09-04",3,"Approved"],

  ["Connie Waters","Developer","user-37.jpg","Annual Leave","2024-11-15","2024-11-15",1,"Approved"],

  ["Lori Broaddus","Finance","user-38.jpg","Casual Leave","2024-12-10","2024-12-11",2,"Approved"],

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


/* Pixel-aligned Leaves screenshot overrides */
.accountant-leaves{padding:24px 23px 28px;background:#f7f8fa;color:#172b4d;font-size:14px}
.accountant-leaves .al-head{margin-bottom:27px;align-items:flex-start}
.accountant-leaves h2{font-size:24px;line-height:29px;margin:0 0 5px;color:#172b4d}
.accountant-leaves .al-primary{background:#b98e3b;border-color:#b98e3b;height:39px;padding:8px 16px;font-size:13px}
.accountant-leaves .al-cards{gap:24px;margin-bottom:24px}
.accountant-leaves .al-stat{height:88px;min-height:88px;position:relative;overflow:hidden;background:#fff;border:1px solid #dfe3e9;border-radius:5px;padding:0 18px 0 0;box-shadow:0 1px 2px #00000012}
.accountant-leaves .al-stat-decoration{width:122px;height:100%;position:relative;display:flex;align-items:center;padding-left:20px;clip-path:polygon(0 0,60% 0,100% 100%,0 100%);flex-shrink:0}
.accountant-leaves .al-stat-decoration:after{content:'';position:absolute;right:0;top:0;width:22px;height:100%;background:#ffffffdd;transform:skew(25deg)}
.accountant-leaves .al-stat-icon{height:33px;width:33px;z-index:1;font-size:18px}
.accountant-leaves .al-stat-text{text-align:right;flex:1;min-width:0}
.accountant-leaves .al-stat-text p{margin:0 0 5px;color:#64748b;font-size:13px;white-space:nowrap}
.accountant-leaves .al-stat-text strong{font-size:18px;font-weight:700;color:#172b4d}
.accountant-leaves .al-panel{border:1px solid #dfe3e9;border-radius:6px}
.accountant-leaves .al-panel-head{min-height:72px;padding:16px 20px}
.accountant-leaves h5{font-size:15px;font-weight:600}
.accountant-leaves .al-filters{gap:15px}
.accountant-leaves .al-filters .al-period-select{width:175px}
.accountant-leaves .al-filters .al-sort-select{width:150px}
.accountant-leaves .al-panel-head{min-height:61px;padding:12px 17px}
.accountant-leaves .al-filters select{height:38px;padding:8px 11px;font-size:13px;color:#172b4d}
.accountant-leaves .al-date-range{width:195px;height:38px;border:1px solid #dfe3e9;border-radius:5px;display:flex;align-items:center;padding:0 10px;position:relative;overflow:hidden;white-space:nowrap;font-size:13px;color:#172b4d}
.accountant-leaves .al-date-range span{overflow:hidden;text-overflow:clip;white-space:nowrap;max-width:157px}
.accountant-leaves .al-date-range:after{content:'⌄';position:absolute;right:10px;top:7px;color:#8290a5;font-size:17px;background:#fff}
.accountant-leaves .al-date-range input{position:absolute;right:0;top:0;width:50%;height:100%;opacity:0;cursor:pointer}
.accountant-leaves .al-date-range input:last-child{right:0;width:35%}
.accountant-leaves .al-table-tools{min-height:61px;padding:13px 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #e6e9ee;color:#344054;font-size:13px}
.accountant-leaves .al-table-tools select{padding:4px 6px;height:29px;margin:0 7px}
.accountant-leaves .al-table-tools input{height:31px;width:160px;padding:5px 12px;font-size:12px}
.accountant-leaves th{height:43px;padding:10px 15px;background:#e5e7eb;color:#172b4d;font-size:13px}
.accountant-leaves th:nth-child(n+2):nth-child(-n+7):after{content:'↕';float:right;color:#c7cdd6}
.accountant-leaves td{height:59px;padding:8px 15px;border-top:1px solid #e0e5eb;color:#667085;font-size:13px}
.accountant-leaves .al-employee strong{color:#172b4d;font-weight:500;font-size:14px}
.accountant-leaves .al-employee small{display:block;font-size:12px;margin-top:3px}
.accountant-leaves .al-avatar{width:32px;height:32px;background:#ccc;object-fit:cover}
.accountant-leaves .al-status{height:31px;padding:5px 24px 5px 24px;color:#172b4d;font-size:13px;min-width:89px;background-repeat:no-repeat;background-position:8px center;background-size:12px 12px}
.accountant-leaves .al-status-approved{background-image:radial-gradient(circle,#00c76a 0 3px,#d9f8e8 3.5px 6px,transparent 6px)}
.accountant-leaves .al-status-declined{background-image:radial-gradient(circle,#f22 0 3px,#ffe0e0 3.5px 6px,transparent 6px)}
.accountant-leaves .al-status-new{background-image:radial-gradient(circle,#b54fca 0 3px,#f4e4f8 3.5px 6px,transparent 6px)}
.accountant-leaves .al-actions{gap:12px;justify-content:flex-end}
.accountant-leaves .al-actions button{font-size:15px;padding:3px}
.accountant-leaves .al-footer{min-height:58px;padding:12px 16px;color:#64748b;font-size:13px}
.accountant-leaves .al-page{border:0;margin-left:7px;background:transparent}
.accountant-leaves .al-page:not(.al-chevron){border-radius:50%;width:27px;height:27px;padding:3px}
.accountant-leaves input[type=checkbox]{width:17px;height:17px;accent-color:#b98e3b}
@media(max-width:850px){.accountant-leaves .al-cards{grid-template-columns:repeat(2,minmax(0,1fr))}.accountant-leaves .al-panel-head{align-items:flex-start}.accountant-leaves table{min-width:970px}}
@media(max-width:550px){.accountant-leaves .al-cards{grid-template-columns:1fr}.accountant-leaves{padding:16px}}


.accountant-leaves .al-tabs{display:flex;gap:28px;border-bottom:1px solid #dce1e9;margin:0 0 16px}
.accountant-leaves .al-tabs button{background:none;border:0;border-bottom:2px solid transparent;padding:0 0 12px;color:#52627d;font-size:13px;cursor:pointer}
.accountant-leaves .al-tabs button.active{border-bottom-color:#cb9636;color:#bd882d;font-weight:600}
.accountant-leaves .al-overlay{background:rgba(0,0,0,.43)}
.accountant-leaves .al-modal{max-width:720px;border-radius:5px}
.accountant-leaves .al-modal-head{min-height:57px;padding:15px 16px;border-bottom:1px solid #e2e6eb}
.accountant-leaves .al-modal-head h5{font-size:18px;font-weight:500}
.accountant-leaves .al-close{border:0;background:#7e8795;color:white;border-radius:50%;height:18px;width:18px;line-height:17px;cursor:pointer;padding:0;font-size:14px}
.accountant-leaves .al-edit-grid,.accountant-leaves .al-view-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px 20px;padding:20px 15px}
.accountant-leaves .al-edit-grid .al-field{margin:0;gap:8px}
.accountant-leaves .al-edit-grid label,.accountant-leaves .al-view-grid small{font-size:12px;color:#44536e;font-weight:400}
.accountant-leaves .al-edit-grid input,.accountant-leaves .al-edit-grid select,.accountant-leaves .al-edit-grid textarea{width:100%;min-height:35px;border-color:#d6dde8}
.accountant-leaves .al-edit-grid textarea{min-height:78px}
.accountant-leaves .al-full{grid-column:1/-1}
.accountant-leaves .al-view-grid{gap:27px 20px;padding:32px 15px 27px}
.accountant-leaves .al-view-grid>div{display:flex;flex-direction:column;gap:6px}
.accountant-leaves .al-view-grid strong{font-size:15px;color:#2c3d60;font-weight:600}
.accountant-leaves .al-modal-foot{padding:12px 16px}
.accountant-leaves .al-modal-delete{max-width:360px}
.accountant-leaves .al-delete-content{text-align:center;padding:15px 20px}
.accountant-leaves .al-delete-icon{width:52px;height:52px;margin:0 auto 12px;border-radius:4px;background:#f8d1d3;color:#ff101c;display:grid;place-items:center;font-size:27px}
.accountant-leaves .al-delete-content h5{font-size:17px;font-weight:500;margin-bottom:8px}
.accountant-leaves .al-delete-content p{font-size:12px;line-height:19px;color:#45516a;margin:0 0 15px}
.accountant-leaves .al-delete-buttons{display:flex;justify-content:center;gap:14px}
.accountant-leaves .al-delete-buttons button{padding:9px 15px;font-size:12px}
.accountant-leaves .al-danger{background:#ff0a17}
.accountant-leaves .al-modal-chat{max-width:720px;height:min(428px,85vh);display:flex;flex-direction:column}
.accountant-leaves .al-chat-person{display:flex;align-items:center;gap:9px}
.accountant-leaves .al-chat-person strong{font-size:13px;font-weight:500;display:block}
.accountant-leaves .al-chat-person small{font-size:11px;display:block}
.accountant-leaves .al-chat-avatar{width:40px;height:40px;border-radius:50%;background:#d3d3d3;position:relative}
.accountant-leaves .al-chat-avatar:after{content:'';width:8px;height:8px;border-radius:50%;background:#00c966;position:absolute;bottom:0;right:0}
.accountant-leaves .al-chat-body{flex:1;overflow-y:auto;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:8px}
.accountant-leaves .al-chat-empty{color:#78849b;font-size:12px;text-align:center;line-height:19px}
.accountant-leaves .al-chat-bubble{background:#f1f5f9;border-radius:12px;padding:9px 14px;align-self:flex-end;margin-right:15px;max-width:80%}
.accountant-leaves .al-chat-compose{display:flex;align-items:center;gap:9px;padding:9px 15px;border-top:1px solid #e2e6eb}
.accountant-leaves .al-chat-compose input{flex:1;background:#f8f9fa;border:1px solid #e7eaf0;border-radius:7px;min-height:42px}
.accountant-leaves .al-chat-compose button{background:#dfbd81;color:white;border:0;border-radius:7px;width:32px;height:32px;cursor:pointer}
@media(max-width:600px){.accountant-leaves .al-edit-grid,.accountant-leaves .al-view-grid{grid-template-columns:1fr}.accountant-leaves .al-full{grid-column:1}}
`;



export default function Leaves(){

 const [records,setRecords]=useState<Leave[]>(initial);
 const [activeTab,setActiveTab]=useState<"my"|"employee">("my");
 const [messages,setMessages]=useState<Record<number,string[]>>({});

 const [modal,setModal]=useState<Modal>(null);

 const [selected,setSelected]=useState<Leave|null>(null);

 const [form,setForm]=useState<Leave>(blank);

 const [filterType,setFilterType]=useState("All");

 const [sort,setSort]=useState("Last 7 Days");
  const [search,setSearch]=useState("");
  const [pageSize,setPageSize]=useState(10);

 const [fromFilter,setFromFilter]=useState("");

 const [toFilter,setToFilter]=useState("");

 const [checked,setChecked]=useState<number[]>([]);

 const [page,setPage]=useState(1);

 const [message,setMessage]=useState("");

 const filtered=useMemo(()=>{

  const tabRecords=activeTab==="my"?records.slice(0,4):records.slice(4);
  const arr=tabRecords.filter(r=>(filterType==="All"||r.type===filterType)&&(!fromFilter||r.from>=fromFilter)&&(!toFilter||r.to<=toFilter)&&(`${r.name} ${r.department} ${r.type} ${r.status}`.toLowerCase().includes(search.toLowerCase())));

  if(sort==="Ascending")arr.sort((a,b)=>a.name.localeCompare(b.name));

  else if(sort==="Descending")arr.sort((a,b)=>b.name.localeCompare(a.name));

  else if(sort==="Last Month")arr.sort((a,b)=>b.from.localeCompare(a.from));

  else if(sort==="Last 7 Days")arr.sort((a,b)=>a.id-b.id);

  else arr.sort((a,b)=>b.id-a.id);

  return arr;

 },[records,activeTab,filterType,sort,fromFilter,toFilter,search]);

 const pages=Math.max(1,Math.ceil(filtered.length/pageSize));

 const shown=filtered.slice((Math.min(page,pages)-1)*pageSize,Math.min(page,pages)*pageSize);

 const open=(kind:Modal,record?:Leave)=>{setSelected(record??null);setForm(record?{...record}:{...blank});setMessage("");setModal(kind)};

 const save=(e:FormEvent)=>{e.preventDefault();if(!form.name.trim()||!form.from||!form.to||form.to<form.from){alert("Please enter valid employee and leave dates.");return;}

  const next={...form,days:calcDays(form.from,form.to),id:modal==="add"?Math.max(0,...records.map(r=>r.id))+1:form.id};

  setRecords(old=>modal==="add"?[next,...old]:old.map(r=>r.id===next.id?next:r));setModal(null);setPage(1);

 };

 const setStatus=(id:number,status:Status)=>setRecords(old=>old.map(r=>r.id===id?{...r,status}:r));

 return <div className="accountant-leaves"><style>{styles}</style>

  <div className="al-head"><div><h2>Leaves</h2><div className="al-crumb"><Link to="/Accountant/AccountantDashboard"><i className="ti ti-smart-home"/></Link> &nbsp; / &nbsp; Leaves</div></div><button className="al-primary" onClick={()=>open("add")}><i className="ti ti-circle-plus"/> &nbsp;Add Leave</button></div>

  <div className="al-cards">{[
    ["Total Present","180/200","ti-user-check","#00c75a"],
    ["Planned Leaves","10","ti-user-edit","#ff2e88"],
    ["Unplanned Leaves","10","ti-user-exclamation","#ffbc00"],
    ["Pending Requests","15","ti-user-question","#0dc1e3"]
   ].map(([label,count,ico,color])=><div className="al-stat" key={label}>
    <div className="al-stat-decoration" style={{background:color}}><span className="al-stat-icon" style={{color}}><i className={`ti ${ico}`}/></span></div>
    <div className="al-stat-text"><p>{label}</p><strong>{count}</strong></div>
   </div>)}</div>

  <div className="al-tabs" role="tablist"><button role="tab" aria-selected={activeTab==="my"} className={activeTab==="my"?"active":""} onClick={()=>{setActiveTab("my");setPage(1)}}>My Leaves</button><button role="tab" aria-selected={activeTab==="employee"} className={activeTab==="employee"?"active":""} onClick={()=>{setActiveTab("employee");setPage(1)}}>Employee Leaves</button></div>
  <section className="al-panel"><div className="al-panel-head"><h5>Leave List</h5><div className="al-filters"><select className="al-period-select" aria-label="Date period" defaultValue="Today"><option>Today</option><option>Yesterday</option><option>This Week</option><option>Last 7 Days</option><option>This Month</option></select><select aria-label="Leave Type" value={filterType} onChange={e=>{setFilterType(e.target.value);setPage(1)}}><option value="All">Leave Type</option>{["Medical Leave","Casual Leave","Annual Leave"].map(x=><option key={x}>{x}</option>)}</select><select className="al-sort-select" aria-label="Sort By" value={sort} onChange={e=>{setSort(e.target.value);setPage(1)}}>{["Recently Added","Ascending","Descending","Last Month","Last 7 Days"].map(x=><option key={x} value={x}>{`Sort By : ${x}`}</option>)}</select></div></div>

  <div className="al-table-tools"><div>Row Per Page <select aria-label="Rows per page" value={pageSize} onChange={e=>{setPageSize(Number(e.target.value));setPage(1)}}>{[5,10,20,50].map(n=><option key={n} value={n}>{n}</option>)}</select> Entries</div><input aria-label="Search" placeholder="Search" value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} /></div>
  <div className="al-table-wrap"><table><thead><tr><th><input aria-label="Select all" type="checkbox" checked={shown.length>0&&shown.every(r=>checked.includes(r.id))} onChange={e=>setChecked(old=>e.target.checked?[...new Set([...old,...shown.map(r=>r.id)])]:old.filter(id=>!shown.some(r=>r.id===id)))}/></th><th>Employee</th><th>Leave Type</th><th>From</th><th>To</th><th>No of Days</th><th>Status</th><th></th></tr></thead><tbody>{shown.map(r=><tr key={r.id}><td><input aria-label={`Select ${r.name}`} type="checkbox" checked={checked.includes(r.id)} onChange={e=>setChecked(old=>e.target.checked?[...old,r.id]:old.filter(id=>id!==r.id))}/></td><td><div className="al-employee"><img className="al-avatar" src={`/assets/img/users/${r.image||"user-32.jpg"}`} alt=""/><div><strong>{r.name}</strong><small>{r.department}</small></div></div></td><td>{r.type}<span className="al-info" title={r.reason}><i className="ti ti-info-circle"/></span></td><td>{formatDate(r.from)}</td><td>{formatDate(r.to)}</td><td>{r.days} {r.days===1?"Day":"Days"}</td><td><select className={`al-status al-status-${r.status.toLowerCase()}`} aria-label={`Status for ${r.name}`} value={r.status} onChange={e=>setStatus(r.id,e.target.value as Status)}>{["Approved","Declined","New"].map(s=><option key={s}>{s}</option>)}</select></td><td><div className="al-actions"><button title="View Leave" onClick={()=>open("view",r)}><i className="ti ti-eye"/></button><button title="Chat" onClick={()=>open("chat",r)}><i className="ti ti-messages"/></button><button title="Edit Leave" onClick={()=>open("edit",r)}><i className="ti ti-edit"/></button><button title="Delete Leave" onClick={()=>open("delete",r)}><i className="ti ti-trash"/></button></div></td></tr>)}{shown.length===0&&<tr><td colSpan={8} style={{textAlign:"center",padding:35}}>No leave records found</td></tr>}</tbody></table></div>

  <div className="al-footer"><span>Showing {filtered.length?Math.min((page-1)*pageSize+1,filtered.length):0} - {Math.min(page*pageSize,filtered.length)} of {filtered.length} entries</span><div><button className="al-page al-chevron" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>‹</button><button className="al-page" style={{background:"#c39339",color:"white"}}>{page}</button><button className="al-page al-chevron" disabled={page>=pages} onClick={()=>setPage(p=>p+1)}>›</button></div></div></section>

  {modal&&<div className="al-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setModal(null)}}>
    <div className={`al-modal al-modal-${modal}`} role="dialog" aria-modal="true" aria-label={`${modal} leave`}>
      {modal!=="delete"&&<div className="al-modal-head">
        {modal==="chat"&&selected?<div className="al-chat-person"><span className="al-chat-avatar"/><div><strong>{selected.name}</strong><small>Leave Chat</small></div></div>:<h5>{modal==="add"?"Add Leave":modal==="edit"?"Edit Leave":"View Leave"}</h5>}
        <button className="al-close" type="button" onClick={()=>setModal(null)} aria-label="Close">×</button>
      </div>}
      {(modal==="add"||modal==="edit")&&<form onSubmit={save}>
        <div className="al-modal-body al-edit-grid">
          <div className="al-field"><label>Employee</label><select required value={form.name} onChange={e=>{const emp=initial.find(r=>r.name===e.target.value);setForm(f=>({...f,name:e.target.value,department:emp?.department||"",image:emp?.image||""}))}}><option value="">Select</option>{initial.map(r=><option key={r.name}>{r.name}</option>)}</select></div>
          <div className="al-field"><label>Leave Reason</label><select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>{["Medical Leave","Casual Leave","Annual Leave","Emergency Leave","Compassionate Leave","Unpaid Leave"].map(t=><option key={t}>{t}</option>)}</select></div>
          <div className="al-field"><label>From</label><input type="date" required value={form.from} onChange={e=>setForm(f=>({...f,from:e.target.value}))}/></div>
          <div className="al-field"><label>To</label><input type="date" required min={form.from||undefined} value={form.to} onChange={e=>setForm(f=>({...f,to:e.target.value}))}/></div>
          <div className="al-field"><label>Leave Type</label><select value={form.duration} onChange={e=>setForm(f=>({...f,duration:e.target.value}))}>{["Full Day","First Half","Second Half","Early Dispersal"].map(t=><option key={t}>{t}</option>)}</select></div>
          <div className="al-field"><label>No of Days</label><input readOnly value={calcDays(form.from,form.to)}/></div>
          <div className="al-field al-full"><label>Reason</label><textarea rows={3} value={form.reason} onChange={e=>setForm(f=>({...f,reason:e.target.value}))}/></div>
        </div><div className="al-modal-foot"><button type="button" className="al-light" onClick={()=>setModal(null)}>Cancel</button><button className="al-primary" type="submit">{modal==="add"?"Add Leave":"Save Changes"}</button></div>
      </form>}
      {modal==="view"&&selected&&<div className="al-modal-body al-view-grid">{[["Employee",selected.name],["Leave Reason",selected.type],["From",formatDate(selected.from)],["To",formatDate(selected.to)],["Leave Type",selected.duration],["No of Days",`${selected.days} Days`],["Status",selected.status],["Reason",selected.reason]].map(([label,value])=><div key={label} className={label==="Reason"?"al-full":""}><small>{label}</small><strong>{value}</strong></div>)}</div>}
      {modal==="delete"&&selected&&<div className="al-delete-content"><div className="al-delete-icon"><i className="ti ti-trash"/></div><h5>Confirm Delete</h5><p>You want to delete all the marked items, this can be<br/> undone once you delete.</p><div className="al-delete-buttons"><button className="al-light" onClick={()=>setModal(null)}>Cancel</button><button className="al-danger" onClick={()=>{setRecords(old=>old.filter(r=>r.id!==selected.id));setModal(null)}}>Yes, Delete</button></div></div>}
      {modal==="chat"&&selected&&<><div className="al-chat-body">{(messages[selected.id]||[]).length===0?<div className="al-chat-empty">No messages yet.<br/>Start the conversation.</div>:(messages[selected.id]||[]).map((msg,i)=><div className="al-chat-bubble" key={i}>{msg}</div>)}</div><form className="al-chat-compose" onSubmit={e=>{e.preventDefault();if(!message.trim())return;setMessages(old=>({...old,[selected.id]:[...(old[selected.id]||[]),message.trim()]}));setMessage("")}}><input aria-label="Type Your Message" placeholder="Type Your Message" value={message} onChange={e=>setMessage(e.target.value)}/><button type="submit" aria-label="Send message"><i className="ti ti-send"/></button></form></>}
    </div>
  </div>}

 </div>;

}

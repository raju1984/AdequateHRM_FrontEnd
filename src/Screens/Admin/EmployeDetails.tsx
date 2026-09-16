import React, { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiEdit2,
  FiChevronDown,
  FiPhone,
  FiMail,
  FiCalendar,
  FiMapPin,
  FiBriefcase,
  FiUser,
  FiInfo,
  FiPlusCircle,
} from "react-icons/fi";

type EmployeeFromList = {
  uuid?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  department?: string;
  departmentId?: string;
  des?: string;
  designationId?: string;
  date?: string;
  rawJoiningDate?: string;
  about?: string;
  status?: "Active" | "Inactive";
  image?: string;
};

type LeaveRow = {
  id: number;
  reason: string;
  requestDate: string;
  from: string;
  to: string;
  approver: string;
  role: string;
};

const leaveRows: LeaveRow[] = [
  { id: 1, reason: "Medical Leave", requestDate: "01 Jan 2024", from: "14 Jan 2024", to: "15 Jan 2024", approver: "Douglas", role: "Manager" },
  { id: 2, reason: "Annual Leave", requestDate: "10 Jan 2024", from: "21 Jan 2024", to: "25 Jan 2024", approver: "Douglas", role: "Manager" },
  { id: 3, reason: "Medical Leave", requestDate: "10 Jan 2024", from: "20 Jan 2024", to: "22 Feb 2024", approver: "Warren", role: "Admin" },
  { id: 4, reason: "Annual Leave", requestDate: "01 Mar 2024", from: "15 Mar 2024", to: "17 Mar 2024", approver: "Douglas", role: "Manager" },
  { id: 5, reason: "Casual Leave", requestDate: "15 Mar 2024", from: "12 Apr 2024", to: "16 Apr 2024", approver: "Douglas", role: "Manager" },
  { id: 6, reason: "Medical Leave", requestDate: "01 May 2024", from: "20 May 2024", to: "21 Mar 2024", approver: "Warren", role: "Admin" },
  { id: 7, reason: "Casual Leave", requestDate: "29 May 2024", from: "06 Jul 2024", to: "06 Jul 2024", approver: "Douglas", role: "Manager" },
  { id: 8, reason: "Medical Leave", requestDate: "25 Aug 2024", from: "02 Sep 2024", to: "04 Sep 2024", approver: "Douglas", role: "Manager" },
  { id: 9, reason: "Annual Leave", requestDate: "01 Nov 2024", from: "15 Nov 2024", to: "15 Nov 2024", approver: "Warren", role: "Admin" },
  { id: 10, reason: "Casual Leave", requestDate: "01 Nov 2024", from: "10 Dec 2024", to: "11 Dec 2024", approver: "Douglas", role: "Manager" },
];

const EmployeDetails: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { employeeId } = useParams();
  const employee = (location.state as { employee?: EmployeeFromList } | null)?.employee;

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [approvedBy, setApprovedBy] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("7");

  const displayName = employee?.name || `${employee?.firstName || "Stephan"} ${employee?.lastName || "Peralt"}`.trim();
  const displayId = employee?.id || employeeId || "EMP001";
  const designation = employee?.des || "Software Developer";
  const email = employee?.email || "perralt12@example.com";
  const phone = employee?.phone || "(163) 2459 315";
  const joinDate = employee?.date || "1st Jan 2023";
  const about = employee?.about || "As an award winning designer, I deliver exceptional quality work and bring value to your brand! With 10 years of experience and 350+ projects completed worldwide with satisfied customers, I developed the 360° brand approach, which helped me to create numerous brands that are relevant, meaningful and loved.";

  const visibleLeaves = useMemo(() => {
    let data = leaveRows.filter((row) => {
      const q = search.trim().toLowerCase();
      const searchOk = !q || row.reason.toLowerCase().includes(q) || row.approver.toLowerCase().includes(q);
      const typeOk = !leaveType || row.reason === leaveType;
      const approvedOk = !approvedBy || row.approver === approvedBy;
      return searchOk && typeOk && approvedOk;
    });
    return data.slice(0, rowsPerPage);
  }, [search, leaveType, approvedBy, status, sort, rowsPerPage]);

  return (
    <>
      <style>{`
        *{box-sizing:border-box}
        .ed-page{min-height:100vh;background:#f6f7f9;padding:24px 22px 0;font-family:Inter,Arial,sans-serif;color:#0f2448}
        .ed-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}
        .ed-back{border:0;background:transparent;display:flex;align-items:center;gap:9px;font-size:14px;color:#0f2448;cursor:pointer;padding:0}
        .ed-gold-btn{height:39px;padding:0 15px;border:0;border-radius:6px;background:#c39236;color:white;font-weight:600;display:flex;align-items:center;gap:8px;cursor:pointer}
        .ed-grid{display:grid;grid-template-columns:338px minmax(0,1fr);gap:24px;align-items:start}
        .ed-left-card,.ed-card,.ed-emergency{background:white;border:1px solid #e0e4ea;border-radius:5px;box-shadow:0 1px 2px rgba(16,24,40,.03)}
        .ed-left-card{overflow:hidden}
        .ed-cover{height:91px;background:linear-gradient(135deg,#f25a00 0%,#ffb31b 52%,#ff5200 100%);position:relative}
        .ed-avatar{width:56px;height:56px;border-radius:50%;border:2px solid white;background:#d9d9d9;position:absolute;left:50%;bottom:-29px;transform:translateX(-50%);display:flex;align-items:center;justify-content:center;overflow:hidden;color:#8a8f98;font-size:10px}
        .ed-avatar img{width:100%;height:100%;object-fit:cover}
        .ed-profile-body{padding:37px 17px 15px;text-align:center}
        .ed-name{font-size:16px;font-weight:700;color:#0f2448;display:flex;justify-content:center;align-items:center;gap:5px;margin-bottom:8px}
        .ed-verified{color:#11c768;font-size:14px}
        .ed-badges{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-bottom:16px}
        .ed-pill{font-size:11px;padding:3px 10px;border-radius:4px;background:#eef1f3;color:#2f455f}
        .ed-pill.blue{background:#edf5f7;color:#49788c}
        .ed-info-list{display:grid;gap:10px;text-align:left}
        .ed-info-row{display:grid;grid-template-columns:20px 1fr auto;align-items:start;gap:4px;font-size:13px;color:#657184}
        .ed-info-row strong{color:#111827;font-weight:500}
        .ed-edit-btn{margin:17px auto 0;height:40px;padding:0 38px;border:0;border-radius:5px;background:#121b2e;color:#fff;font-weight:600;cursor:pointer}
        .ed-section{border-top:1px solid #e7e9ed;padding:18px 16px}
        .ed-section-title{display:flex;justify-content:space-between;align-items:center;font-weight:600;font-size:13px;margin-bottom:15px;color:#1d2d4a}
        .ed-mini-grid{display:grid;gap:11px}
        .ed-mini-row{display:grid;grid-template-columns:22px 1fr auto;gap:4px;align-items:start;color:#687587;font-size:13px}
        .ed-mini-row span:last-child{color:#222;text-align:right;max-width:180px}
        .ed-emergency-wrap{margin-top:27px}
        .ed-emergency-title{display:flex;justify-content:space-between;align-items:center;font-size:13px;font-weight:600;margin-bottom:13px;color:#263650}
        .ed-em-row{display:grid;grid-template-columns:1fr auto;gap:20px;padding:17px 16px;border-bottom:1px solid #e7e9ed;font-size:13px}
        .ed-em-row:last-child{border-bottom:0}.ed-label{color:#6b7585;font-size:12px;margin-bottom:5px}.red-dot{display:inline-block;width:5px;height:5px;border-radius:50%;background:red;margin:0 5px}
        .ed-right{display:grid;gap:24px}
        .ed-card-head{height:68px;padding:0 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #e4e7ec;font-weight:600}
        .ed-card-actions{display:flex;align-items:center;gap:13px}
        .ed-icon-btn{border:0;background:transparent;color:#12304f;cursor:pointer;padding:0}
        .ed-card-body{padding:28px 20px;color:#607087;font-size:13px;line-height:1.55}
        .ed-four{display:grid;grid-template-columns:repeat(4,1fr);gap:24px}.ed-field-label{color:#758195;font-size:12px}.ed-field-value{color:#0f2448;margin-top:2px}
        .ed-two-cards{display:grid;grid-template-columns:1fr 1fr;gap:24px}
        .ed-edu-row,.ed-exp-row{display:flex;justify-content:space-between;gap:15px;margin-bottom:18px}.ed-edu-row:last-child,.ed-exp-row:last-child{margin-bottom:0}.ed-edu-main,.ed-exp-main{color:#0f2448}.ed-muted{color:#738095;font-size:12px}.ed-substrong{font-weight:600;margin-top:3px}.ed-date{white-space:nowrap;color:#1f2937;font-size:12px}
        .ed-leave-card{overflow:hidden}.ed-leave-title{font-size:16px;font-weight:600;padding:17px 20px 8px}
        .ed-filters{display:flex;gap:15px;flex-wrap:wrap;padding:8px 20px 15px}.ed-select,.ed-date-select{height:36px;border:1px solid #dfe3e8;border-radius:6px;background:white;padding:0 10px;color:#1e2c45;font-size:13px}.ed-date-select{min-width:195px}
        .ed-table-tools{display:flex;justify-content:space-between;align-items:center;padding:13px 16px;border-top:1px solid #eceef1;border-bottom:1px solid #e4e7eb}.ed-entries{display:flex;align-items:center;gap:8px;color:#344054;font-size:13px}.ed-search{width:160px;height:31px;border:1px solid #dfe3e8;border-radius:6px;padding:0 12px;outline:none}
        .ed-table-wrap{width:100%;overflow:visible}.ed-table{width:100%;border-collapse:collapse;table-layout:fixed;min-width:0}.ed-table th{height:43px;background:#e6e8ec;text-align:left;padding:0 10px;font-size:13px;color:#0f172a;white-space:normal}.ed-table td{height:54px;border-bottom:1px solid #e5e7eb;padding:0 10px;font-size:13px;color:#657184;white-space:normal;overflow-wrap:anywhere}.ed-table th:first-child,.ed-table td:first-child{width:42px;text-align:center}.ed-table th:nth-child(2),.ed-table td:nth-child(2){width:22%}.ed-table th:nth-child(3),.ed-table td:nth-child(3){width:20%}.ed-table th:nth-child(4),.ed-table td:nth-child(4){width:17%}.ed-table th:nth-child(5),.ed-table td:nth-child(5){width:17%}.ed-table th:nth-child(6),.ed-table td:nth-child(6){width:24%}.ed-table input[type=checkbox]{width:16px;height:16px}.ed-reason{color:#62738b}.info-blue{color:#1677ff;margin-left:4px}.ed-approver{display:flex;align-items:center;gap:8px;color:#0f172a}.ed-mini-avatar{width:32px;height:32px;border-radius:50%;background:#d6d7d9}.ed-role{font-size:11px;color:#748095}
        .ed-table-footer{height:58px;display:flex;align-items:center;justify-content:space-between;padding:0 16px;color:#64748b;font-size:13px}.ed-pagination{display:flex;align-items:center;gap:16px}.ed-page-circle{width:27px;height:27px;border-radius:50%;background:#c39236;color:#fff;display:flex;align-items:center;justify-content:center}
        .ed-footer{margin:24px -22px 0;padding:18px 8px;border-top:1px solid #e5e7eb;background:white;display:flex;justify-content:space-between;color:#687587;font-size:13px}.gold{color:#c39236}
        @media(max-width:1050px){.ed-grid{grid-template-columns:1fr}.ed-two-cards{grid-template-columns:1fr}}
        @media(max-width:700px){.ed-page{padding:16px 12px 0}.ed-four{grid-template-columns:1fr 1fr}.ed-top{gap:12px}.ed-filters{flex-direction:column}.ed-select,.ed-date-select{width:100%}.ed-table-tools{flex-direction:column;align-items:stretch;gap:10px}.ed-search{width:100%}.ed-footer{margin:20px -12px 0;flex-direction:column;gap:8px}}
      `}</style>

      <div className="ed-page">
        <div className="ed-top">
          <button className="ed-back" onClick={() => navigate("/Hr/Employee")}><FiArrowLeft /> Employee Details</button>
          <button className="ed-gold-btn"><FiPlusCircle /> Bank & Statutory</button>
        </div>

        <div className="ed-grid">
          <div>
            <div className="ed-left-card">
              <div className="ed-cover">
                <div className="ed-avatar">{employee?.image ? <img src={employee.image} alt={displayName} /> : "300 x 300"}</div>
              </div>
              <div className="ed-profile-body">
                <div className="ed-name">{displayName} <FiCheckCircle className="ed-verified" /></div>
                <div className="ed-badges"><span className="ed-pill">• {designation}</span><span className="ed-pill blue">10+ years of Experience</span></div>
                <div className="ed-info-list">
                  <div className="ed-info-row"><FiBriefcase /><span>Employee ID</span><strong>{displayId}</strong></div>
                  <div className="ed-info-row"><FiUser /><span>EPF ID</span><strong>EPF1001</strong></div>
                  <div className="ed-info-row"><FiCalendar /><span>Date Of Join</span><strong>{joinDate}</strong></div>
                </div>
                <button className="ed-edit-btn"><FiEdit2 /> Edit Info</button>
              </div>

              <div className="ed-section">
                <div className="ed-section-title"><span>Basic information</span><FiEdit2 /></div>
                <div className="ed-mini-grid">
                  <div className="ed-mini-row"><FiPhone /><span>Phone</span><span>{phone}</span></div>
                  <div className="ed-mini-row"><FiMail /><span>Email</span><span style={{color:'#1677ff'}}>{email}</span></div>
                  <div className="ed-mini-row"><FiUser /><span>Gender</span><span>Male</span></div>
                  <div className="ed-mini-row"><FiCalendar /><span>Birthday</span><span>24th July 2000</span></div>
                  <div className="ed-mini-row"><FiMapPin /><span>Address</span><span>1861 Bayonne Ave,<br/>Manchester, NJ, 08759</span></div>
                </div>
              </div>

              <div className="ed-section">
                <div className="ed-section-title"><span>Personal Information</span><FiEdit2 /></div>
                <div className="ed-mini-grid">
                  <div className="ed-mini-row"><FiBriefcase /><span>Passport No</span><span>QRET4566FGRT</span></div>
                  <div className="ed-mini-row"><FiCalendar /><span>Passport Exp Date</span><span>15 May 2029</span></div>
                    <div className="ed-mini-row"><FiBriefcase /><span>PAN No</span><span>QRET4566FGRT</span></div>  
                  <div className="ed-mini-row"><FiUser /><span>Nationality</span><span>Indian</span></div>
                  <div className="ed-mini-row"><FiUser /><span>Religion</span><span>Christianity</span></div>
                  <div className="ed-mini-row"><FiUser /><span>Marital status</span><span>Yes</span></div>
                  <div className="ed-mini-row"><FiBriefcase /><span>Employment of spouse</span><span>No</span></div>
                  <div className="ed-mini-row"><FiUser /><span>No. of children</span><span>2</span></div>
                </div>
              </div>
            </div>

            <div className="ed-emergency-wrap">
              <div className="ed-emergency-title"><span>Emergency Contact Number</span><FiEdit2 /></div>
              <div className="ed-emergency">
                <div className="ed-em-row"><div><div className="ed-label">Primary</div><div>Adrian Peralt <span className="red-dot"></span> Father</div></div><div>+1 127 2685 598</div></div>
                <div className="ed-em-row"><div><div className="ed-label">Secondary</div><div>Karen Wills <span className="red-dot"></span> Mother</div></div><div>+1 989 7774 787</div></div>
              </div>
            </div>
          </div>

          <div className="ed-right">
            <div className="ed-card">
              <div className="ed-card-head"><span>About Employee</span><div className="ed-card-actions"><button className="ed-icon-btn"><FiEdit2/></button><FiChevronDown/></div></div>
              <div className="ed-card-body">{about}</div>
            </div>

            <div className="ed-card">
              <div className="ed-card-head"><span>Bank Information</span><div className="ed-card-actions"><button className="ed-icon-btn"><FiEdit2/></button><FiChevronDown/></div></div>
              <div className="ed-card-body ed-four">
                <div><div className="ed-field-label">Bank Name</div><div className="ed-field-value">Swiz International Bank</div></div>
                <div><div className="ed-field-label">Bank account no</div><div className="ed-field-value">159843014641</div></div>
                <div><div className="ed-field-label">IFSC Code</div><div className="ed-field-value">ICI245O4</div></div>
                <div><div className="ed-field-label">Branch</div><div className="ed-field-value">Alabama USA</div></div>
              </div>
            </div>

            <div className="ed-card">
              <div className="ed-card-head"><span>Family Information</span><div className="ed-card-actions"><button className="ed-icon-btn"><FiEdit2/></button><FiChevronDown/></div></div>
              <div className="ed-card-body ed-four">
                <div><div className="ed-field-label">Name</div><div className="ed-field-value">Hendry Peralt</div></div>
                <div><div className="ed-field-label">Relationship</div><div className="ed-field-value">Brother</div></div>
                <div><div className="ed-field-label">Date of birth</div><div className="ed-field-value">25 May 2014</div></div>
                <div><div className="ed-field-label">Phone</div><div className="ed-field-value">+1 265 6956 961</div></div>
              </div>
            </div>

            <div className="ed-two-cards">
              <div className="ed-card">
                <div className="ed-card-head"><span>Education Details</span><div className="ed-card-actions"><button className="ed-icon-btn"><FiEdit2/></button><FiChevronDown/></div></div>
                <div className="ed-card-body">
                  <div className="ed-edu-row"><div className="ed-edu-main"><div className="ed-muted">Oxford University</div><div className="ed-substrong">Computer Science</div></div><div className="ed-date">2020 - 2022</div></div>
                  <div className="ed-edu-row"><div className="ed-edu-main"><div className="ed-muted">Cambridge University</div><div className="ed-substrong">Computer Network & Systems</div></div><div className="ed-date">2016 - 2019</div></div>
                  <div className="ed-edu-row"><div className="ed-edu-main"><div className="ed-muted">Oxford School</div><div className="ed-substrong">Grade X</div></div><div className="ed-date">2012 - 2016</div></div>
                </div>
              </div>

              <div className="ed-card">
                <div className="ed-card-head"><span>Experience</span><div className="ed-card-actions"><button className="ed-icon-btn"><FiEdit2/></button><FiChevronDown/></div></div>
                <div className="ed-card-body">
                  <div className="ed-exp-row"><div className="ed-exp-main"><div className="ed-substrong">Google</div><div className="ed-pill blue" style={{display:'inline-block',marginTop:5}}>• UI/UX Developer</div></div><div className="ed-date">Jan 2013 - Present</div></div>
                  <div className="ed-exp-row"><div className="ed-exp-main"><div className="ed-substrong">Salesforce</div><div className="ed-pill blue" style={{display:'inline-block',marginTop:5}}>• Web Developer</div></div><div className="ed-date">Dec 2012- Jan 2015</div></div>
                  <div className="ed-exp-row"><div className="ed-exp-main"><div className="ed-substrong">HubSpot</div><div className="ed-pill blue" style={{display:'inline-block',marginTop:5}}>• Software Developer</div></div><div className="ed-date">Dec 2011- Jan 2012</div></div>
                </div>
              </div>
            </div>

            <div className="ed-card ed-leave-card">
              <div className="ed-leave-title">Leave List</div>
              <div className="ed-filters">
                <select className="ed-date-select"><option>08/27/2026 - 09/02/2026</option><option>Today</option><option>Yesterday</option><option>Last 7 Days</option><option>Last 30 Days</option><option>This Year</option><option>Next Year</option><option>Custom Range</option></select>
                <select className="ed-select" value={leaveType} onChange={(e)=>setLeaveType(e.target.value)}><option value="">Leave Type</option><option>Medical Leave</option><option>Annual Leave</option><option>Casual Leave</option></select>
                <select className="ed-select" value={approvedBy} onChange={(e)=>setApprovedBy(e.target.value)}><option value="">Approved By</option><option>Douglas</option><option>Warren</option></select>
                <select className="ed-select" value={status} onChange={(e)=>setStatus(e.target.value)}><option value="">Select Status</option><option>Approved</option><option>Pending</option><option>Rejected</option></select>
                <select className="ed-select" value={sort} onChange={(e)=>setSort(e.target.value)}><option value="7">Sort By : Last 7 Days</option><option value="30">Sort By : Last 30 Days</option></select>
              </div>
              <div className="ed-table-tools">
                <div className="ed-entries">Row Per Page <select className="ed-select" value={rowsPerPage} onChange={(e)=>setRowsPerPage(Number(e.target.value))}><option>10</option><option>20</option><option>50</option></select> Entries</div>
                <input className="ed-search" placeholder="Search" value={search} onChange={(e)=>setSearch(e.target.value)}/>
              </div>
              <div className="ed-table-wrap">
                <table className="ed-table">
                  <thead><tr><th><input type="checkbox"/></th><th>Leave Reason</th><th>Date of request</th><th>From</th><th>To</th><th>Approved By</th></tr></thead>
                  <tbody>{visibleLeaves.map((row)=><tr key={row.id}><td><input type="checkbox"/></td><td><span className="ed-reason">{row.reason}</span> <FiInfo className="info-blue"/></td><td>{row.requestDate}</td><td>{row.from}</td><td>{row.to}</td><td><div className="ed-approver"><div className="ed-mini-avatar"></div><div><div>{row.approver}</div><div className="ed-role">{row.role}</div></div></div></td></tr>)}</tbody>
                </table>
              </div>
              <div className="ed-table-footer"><span>Showing 1 - {visibleLeaves.length} of {visibleLeaves.length} entries</span><div className="ed-pagination"><span>‹</span><span className="ed-page-circle">1</span><span>›</span></div></div>
            </div>
          </div>
        </div>

        <div className="ed-footer"><span>2014 - 2025 © SmartHR.</span><span>Designed & Developed By <span className="gold">Dreams</span></span></div>
      </div>
    </>
  );
};

export default EmployeDetails;

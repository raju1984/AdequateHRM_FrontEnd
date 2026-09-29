import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx"; // npm i xlsx

/* =====================================================
   TYPES
===================================================== */

type FieldRow = { id: string; label: string; value: string };

type Employee = {
  id: string; // Emp-001
  name: string;
  role: string;
  email: string;
  phone: string;
  account: string;
  salary: number;
  avatar: string;
  earn?: FieldRow[];
  ded?: FieldRow[];
};

type PreviewRow = {
  salary: string;
  workedDays: string;
  holidays: string;
  el: string;
  gl: string;
  lwp: string;
  pf: string;
  tds: string;
  gratuity: string;
  advances: string;
  employerPf: string;
  other: string;
};

type ResultRow = {
  id: string;
  name: string;
  account: string;
  earnings: number;
  deductions: number;
  net: number;
};

/* =====================================================
   STATIC DATA (replace with API when ready)
   NOTE: avatar paths assume template assets are served from /assets
===================================================== */

const INITIAL_EMPLOYEES: Employee[] = [
  { id: "Emp-001", name: "Anthony Lewis", role: "Finance", email: "anthony@example.com", phone: "(123) 4567 890", account: "123456789001", salary: 40000, avatar: "/assets/img/users/user-32.jpg" },
  { id: "Emp-002", name: "Brian Villalobos", role: "Developer", email: "brian@example.com", phone: "(179) 7382 829", account: "123456789002", salary: 35000, avatar: "/assets/img/users/user-09.jpg" },
  { id: "Emp-003", name: "Harvey Smith", role: "Developer", email: "harvey@example.com", phone: "(184) 2719 738", account: "123456789003", salary: 20000, avatar: "/assets/img/users/user-01.jpg" },
  { id: "Emp-004", name: "Stephan Peralt", role: "Executive Officer", email: "peral@example.com", phone: "(193) 7839 748", account: "123456789004", salary: 22000, avatar: "/assets/img/users/user-33.jpg" },
  { id: "Emp-005", name: "Doglas Martini", role: "Manager", email: "martniwr@example.com", phone: "(183) 9302 890", account: "123456789005", salary: 25000, avatar: "/assets/img/users/user-34.jpg" },
  { id: "Emp-006", name: "Linda Ray", role: "Finance", email: "ray456@example.com", phone: "(120) 3728 039", account: "123456789006", salary: 30000, avatar: "/assets/img/users/user-02.jpg" },
  { id: "Emp-007", name: "Elliot Murray", role: "Developer", email: "murray@example.com", phone: "(102) 8480 832", account: "123456789007", salary: 35000, avatar: "/assets/img/users/user-35.jpg" },
  { id: "Emp-008", name: "Rebecca Smtih", role: "Executive", email: "smtih@example.com", phone: "(162) 8920 713", account: "123456789008", salary: 45000, avatar: "/assets/img/users/user-36.jpg" },
  { id: "Emp-009", name: "Connie Waters", role: "Developer", email: "connie@example.com", phone: "(189) 0920 723", account: "123456789009", salary: 50000, avatar: "/assets/img/users/user-37.jpg" },
  { id: "Emp-010", name: "Lori Broaddus", role: "Finance", email: "broaddus@example.com", phone: "(168) 8392 823", account: "123456789010", salary: 25000, avatar: "/assets/img/users/user-38.jpg" },
];

const DEFAULT_EARN_LABELS = ["Basic", "DA(40%)", "HRA(15%)", "Conveyance", "Allowance", "Medical Allowance", "Others"];
const DEFAULT_DED_LABELS = ["TDS", "ESI", "PF", "Leave", "Prof.Tax", "Labour Welfare", "Others"];

// Sample values shown in the original Edit modal (Anthony Lewis)
const ANTHONY_EARN = ["₹40000", "₹16000", "₹2666", "₹2000", "₹1000", "₹2000", ""];
const ANTHONY_DED = ["₹4000", "₹2000", "₹3000", "₹1000", "₹800", "₹500", "₹100"];

const ATTENDANCE_FIELDS: [keyof PreviewRow, string][] = [
  ["workedDays", "Worked Days"],
  ["holidays", "Holidays"],
  ["el", "Leaves (EL) - Paid"],
  ["gl", "Leaves (GL) - Paid"],
  ["lwp", "LWP"],
];

const DEDUCTION_FIELDS: [keyof PreviewRow, string][] = [
  ["pf", "PF"],
  ["tds", "TDS"],
  ["gratuity", "Gratuity"],
  ["advances", "Advances"],
  ["employerPf", "Employer Cont to PF"],
  ["other", "Other"],
];

/* =====================================================
   HELPERS
===================================================== */

let uid = 0;
const nextId = () => `f${++uid}`;

const parseAmt = (v: string | number) => {
  const n = parseFloat(String(v).replace(/[^0-9.]/g, ""));
  return Number.isNaN(n) ? 0 : n;
};

const num = (v: string) => {
  const n = Number(v);
  return v.trim() === "" || Number.isNaN(n) ? NaN : n;
};

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

const inr = (n: number) =>
  `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const hasMax2Decimals = (n: number) => Math.abs(Math.round(n * 100) - n * 100) < 1e-6;

const daysInMonth = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m, 0).getDate();
};

const monthLabel = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
};

const buildRows = (labels: string[], values: string[] = [], saved?: FieldRow[]): FieldRow[] =>
  saved && saved.length
    ? saved.map((r) => ({ ...r }))
    : labels.map((label, i) => ({ id: nextId(), label, value: values[i] ?? "" }));

const defaultPreviewRow = (emp: Employee, days: number): PreviewRow => ({
  salary: String(emp.salary),
  workedDays: String(days),
  holidays: "0",
  el: "0",
  gl: "0",
  lwp: "0",
  pf: "4200",
  tds: "3500",
  gratuity: "0",
  advances: "0",
  employerPf: "0",
  other: "0",
});

// Returns computed totals + whether the row is valid
const evaluateRow = (row: PreviewRow, days: number) => {
  const salary = num(row.salary);
  const att = ATTENDANCE_FIELDS.map(([k]) => num(row[k]));
  const ded = DEDUCTION_FIELDS.map(([k]) => num(row[k]));

  let valid = true;
  if (Number.isNaN(salary) || salary < 0) valid = false;
  if (att.some((a) => Number.isNaN(a) || a < 0 || (a * 2) % 1 !== 0)) valid = false;
  if (ded.some((d) => Number.isNaN(d) || d < 0 || !hasMax2Decimals(d))) valid = false;

  const attTotal = att.reduce((s, a) => s + (Number.isNaN(a) ? 0 : a), 0);
  if (attTotal !== days) valid = false;

  // Worked days, holidays, EL and GL are paid; LWP is unpaid.
  const paidDays = att.slice(0, 4).reduce((s, a) => s + (Number.isNaN(a) ? 0 : a), 0);
  const earnings = round2(((Number.isNaN(salary) ? 0 : salary) * paidDays) / days);
  const deductions = round2(ded.reduce((s, d) => s + (Number.isNaN(d) ? 0 : d), 0));
  if (deductions > earnings) valid = false;

  return { earnings, deductions, net: round2(earnings - deductions), valid };
};

/* =====================================================
   SALARY MODAL (Add / Edit)
===================================================== */

type SalaryModalProps = {
  title: string;
  submitLabel: string;
  employees: Employee[];
  initialEmployeeId: string;
  onClose: () => void;
  onSubmit: (employeeId: string, earn: FieldRow[], ded: FieldRow[], net: number) => void;
  initialEarn: FieldRow[];
  initialDed: FieldRow[];
};

const SalaryModal: React.FC<SalaryModalProps> = ({
  title,
  submitLabel,
  employees,
  initialEmployeeId,
  onClose,
  onSubmit,
  initialEarn,
  initialDed,
}) => {
  const [employeeId, setEmployeeId] = useState(initialEmployeeId);
  const [earn, setEarn] = useState<FieldRow[]>(initialEarn);
  const [ded, setDed] = useState<FieldRow[]>(initialDed);

  useEffect(() => {
    document.body.classList.add("modal-open");
    return () => document.body.classList.remove("modal-open");
  }, []);

  const net = useMemo(
    () =>
      round2(
        earn.reduce((s, r) => s + parseAmt(r.value), 0) - ded.reduce((s, r) => s + parseAmt(r.value), 0)
      ),
    [earn, ded]
  );

  const isDefault = (label: string, defaults: string[], idx: number) => idx < defaults.length && defaults[idx] === label;

  const renderRows = (
    rows: FieldRow[],
    setRows: React.Dispatch<React.SetStateAction<FieldRow[]>>,
    defaults: string[]
  ) =>
    rows.map((r, idx) => (
      <div className="col-md-3" key={r.id}>
        <div className="mb-3">
          {isDefault(r.label, defaults, idx) ? (
            <label className="form-label">{r.label}</label>
          ) : (
            <input
              type="text"
              className="form-control form-control-sm mb-1"
              placeholder="Name"
              value={r.label}
              onChange={(e) =>
                setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, label: e.target.value } : x)))
              }
            />
          )}
          <input
            type="text"
            className="form-control"
            value={r.value}
            onChange={(e) =>
              setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, value: e.target.value } : x)))
            }
          />
        </div>
      </div>
    ));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) {
      alert("Please select an employee.");
      return;
    }
    onSubmit(employeeId, earn, ded, net);
  };

  return (
    <>
      <div className="modal fade show" style={{ display: "block" }} tabIndex={-1} role="dialog" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">{title}</h4>
              <button type="button" className="btn-close custom-btn-close" aria-label="Close" onClick={onClose}>
                <i className="ti ti-x"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body pb-0">
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Employee Name </label>
                      <select className="form-select" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
                        <option value="">Select</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Net Salary </label>
                    <input type="text" className="form-control" value={net ? String(net) : ""} readOnly />
                  </div>
                </div>

                <div className="row earning-row">
                  <div className="d-flex justify-content-between mb-3">
                    <label className="form-label">Earnings</label>
                    <a
                      href="#"
                      className="add-earnings text-primary mb-2"
                      onClick={(e) => {
                        e.preventDefault();
                        setEarn((p) => [...p, { id: nextId(), label: "", value: "" }]);
                      }}
                    >
                      <i className="ti ti-plus me-2"></i>Add New
                    </a>
                  </div>
                  {renderRows(earn, setEarn, DEFAULT_EARN_LABELS)}
                </div>

                <div className="row deduction-row">
                  <div className="d-flex justify-content-between mb-3">
                    <label className="form-label">Deductions</label>
                    <a
                      href="#"
                      className="add-deduction text-primary mb-2"
                      onClick={(e) => {
                        e.preventDefault();
                        setDed((p) => [...p, { id: nextId(), label: "", value: "" }]);
                      }}
                    >
                      <i className="ti ti-plus me-2"></i>Add New
                    </a>
                  </div>
                  {renderRows(ded, setDed, DEFAULT_DED_LABELS)}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-white border me-2" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {submitLabel}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
};

/* =====================================================
   PAGE
===================================================== */

const EmployeeSalary: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);

  const [month, setMonth] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [preview, setPreview] = useState<Record<string, PreviewRow>>({});
  const [result, setResult] = useState<{ month: string; rows: ResultRow[] } | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);

  const previewTitleRef = useRef<HTMLHeadingElement>(null);
  const resultTitleRef = useRef<HTMLHeadingElement>(null);

  const monthChosen = !!month;
  const days = monthChosen ? daysInMonth(month) : 0;
  const allSelected = employees.length > 0 && employees.every((e) => selectedIds.includes(e.id));

  const selectedEmployees = employees.filter((e) => selectedIds.includes(e.id));

  /* ---------- selection ---------- */

  const resetFlow = () => {
    setPreviewOpen(false);
    setResult(null);
  };

  const handleMonthChange = (value: string) => {
    setMonth(value);
    setSelectedIds([]);
    setPreview({});
    resetFlow();
  };

  const toggleAll = (checked: boolean) => {
    setSelectedIds(checked ? employees.map((e) => e.id) : []);
    resetFlow();
  };

  const toggleOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) => (checked ? Array.from(new Set([...prev, id])) : prev.filter((x) => x !== id)));
    resetFlow();
  };

  /* ---------- next / preview ---------- */

  const handleNext = () => {
    const rows: Record<string, PreviewRow> = {};
    selectedEmployees.forEach((emp) => {
      rows[emp.id] = preview[emp.id] ?? defaultPreviewRow(emp, days);
    });
    setPreview(rows);
    setResult(null);
    setPreviewOpen(true);
  };

  useEffect(() => {
    if (previewOpen) previewTitleRef.current?.focus();
  }, [previewOpen]);

  useEffect(() => {
    if (result) resultTitleRef.current?.focus();
  }, [result]);

  const updatePreview = (id: string, key: keyof PreviewRow, value: string) => {
    setPreview((prev) => ({ ...prev, [id]: { ...prev[id], [key]: value } }));
    setResult(null);
  };

  const evaluated = useMemo(() => {
    const map: Record<string, ReturnType<typeof evaluateRow>> = {};
    selectedEmployees.forEach((emp) => {
      if (preview[emp.id]) map[emp.id] = evaluateRow(preview[emp.id], days || 1);
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preview, selectedIds, days, employees]);

  const previewEmployees = selectedEmployees.filter((e) => evaluated[e.id]);
  const allValid = previewEmployees.length > 0 && previewEmployees.every((e) => evaluated[e.id].valid);

  const totals = previewEmployees.reduce(
    (t, e) => ({
      gross: t.gross + evaluated[e.id].earnings,
      ded: t.ded + evaluated[e.id].deductions,
      net: t.net + evaluated[e.id].net,
    }),
    { gross: 0, ded: 0, net: 0 }
  );

  /* ---------- generate / download ---------- */

  const handleGenerate = () => {
    if (!allValid) return;
    setResult({
      month,
      rows: previewEmployees.map((e) => ({
        id: e.id,
        name: e.name,
        account: e.account,
        earnings: evaluated[e.id].earnings,
        deductions: evaluated[e.id].deductions,
        net: evaluated[e.id].net,
      })),
    });
  };

  const resultTotal = result ? round2(result.rows.reduce((s, r) => s + r.net, 0)) : 0;

  const handleDownload = () => {
    if (!result) return;
    const aoa: (string | number)[][] = [
      ["Emp ID", "Name", "Account Number", "Earnings (₹)", "Deductions (₹)", "Net Salary (₹)"],
      ...result.rows.map((r) => [r.id, r.name, r.account, r.earnings, r.deductions, r.net]),
      ["", "", "Total Net Salary", "", "", resultTotal],
    ];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = [{ wch: 10 }, { wch: 22 }, { wch: 18 }, { wch: 14 }, { wch: 16 }, { wch: 16 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Salary");
    XLSX.writeFile(wb, `Salary_${result.month}.xlsx`);
  };

  /* ---------- modals ---------- */

  const handleAddSubmit = (employeeId: string, earn: FieldRow[], ded: FieldRow[], net: number) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === employeeId ? { ...e, earn, ded, salary: net > 0 ? net : e.salary } : e))
    );
    setAddOpen(false);
  };

  const handleEditSubmit = (employeeId: string, earn: FieldRow[], ded: FieldRow[], net: number) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === employeeId ? { ...e, earn, ded, salary: net > 0 ? net : e.salary } : e))
    );
    setEditTarget(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setEmployees((prev) => prev.filter((e) => e.id !== deleteTarget.id));
    setSelectedIds((prev) => prev.filter((id) => id !== deleteTarget.id));
    setDeleteTarget(null);
    resetFlow();
  };

  useEffect(() => {
    if (deleteTarget) {
      document.body.classList.add("modal-open");
      return () => document.body.classList.remove("modal-open");
    }
  }, [deleteTarget]);

  const editInitial = (emp: Employee) => {
    const isAnthony = emp.id === "Emp-001";
    return {
      earn: buildRows(
        DEFAULT_EARN_LABELS,
        isAnthony ? ANTHONY_EARN : [`₹${emp.salary}`],
        emp.earn
      ),
      ded: buildRows(DEFAULT_DED_LABELS, isAnthony ? ANTHONY_DED : [], emp.ded),
    };
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <>
   <style>{`
  /* =========================================
     OCHRE YELLOW - ALL BUTTONS
  ========================================= */

  .employee-salary-page .btn,
  .modal .btn {
    background-color: #D4A017 !important;
    border-color: #D4A017 !important;
    color: #fff !important;
  }

  /* Hover */
  .employee-salary-page .btn:hover,
  .employee-salary-page .btn:focus,
  .employee-salary-page .btn:active,
  .employee-salary-page .btn.active,
  .modal .btn:hover,
  .modal .btn:focus,
  .modal .btn:active,
  .modal .btn.active {
    background-color: #D4A017 !important;
    border-color: #D4A017 !important;
    color: #fff !important;
    box-shadow: none !important;
  }

  /* Disabled button */
  .employee-salary-page .btn:disabled,
  .employee-salary-page .btn.disabled {
    background-color: #D4A017 !important;
    border-color: #D4A017 !important;
    color: #fff !important;
    opacity: 0.6;
  }

  /* Icons inside buttons */
  .employee-salary-page .btn i,
  .modal .btn i {
    color: #fff !important;
  }

  /* Add New links */
  .modal .add-earnings,
  .modal .add-deduction {
    color: #D4A017 !important;
  }

  .modal .add-earnings:hover,
  .modal .add-deduction:hover {
    color: #D4A017 !important;
  }
`}</style>
    
 

<div className="employee-salary-page">
  <div className="content">          {/* Breadcrumb */}
          <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
            <div className="my-auto mb-2">
              <h2 className="mb-1">Employee Salary</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link to="/admin/Dashboard"><i className="ti ti-smart-home"></i></Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">Employee Salary</li>
                </ol>
              </nav>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
              <div className="mb-2">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setAddOpen(true);
                  }}
                  className="btn btn-primary d-flex align-items-center"
                >
                  <i className="ti ti-circle-plus me-2"></i>Add Salary
                </a>
              </div>
            </div>
          </div>
          {/* /Breadcrumb */}

          {/* 1. Month */}
          <div id="salary-month-section" className="card">
            <div className="card-body">
              <label htmlFor="generation-month" className="form-label">1. Select Salary Month</label>
              <input
                type="month"
                id="generation-month"
                className="form-control w-auto"
                required
                value={month}
                onChange={(e) => handleMonthChange(e.target.value)}
                aria-describedby="salary-selection-help"
              />
              <p id="salary-selection-help" className="text-muted mt-2 mb-0">
                Select a month, then select employees below and click Next.
              </p>
            </div>
          </div>

          {/* 2. Employees */}
          {monthChosen && (
            <div id="salary-employees-section" className="card">
              <div className="card-header"><h5>2. Select Employees</h5></div>
              <div className="card-body p-0">
                <div className="custom-datatable-filter table-responsive">
                  <table id="employee-salary-table" className="table">
                    <thead className="thead-light">
                      <tr>
                        <th className="no-sort">
                          <div className="form-check form-check-md">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="salary-select-all"
                              aria-label="Select all employees"
                              checked={allSelected}
                              onChange={(e) => toggleAll(e.target.checked)}
                            />
                          </div>
                        </th>
                        <th>Emp ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Account Number</th>
                        <th>Salary</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((emp) => (
                        <tr key={emp.id}>
                          <td>
                            <div className="form-check form-check-md">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={selectedIds.includes(emp.id)}
                                onChange={(e) => toggleOne(emp.id, e.target.checked)}
                              />
                            </div>
                          </td>
                          <td>{emp.id}</td>
                          <td>
                            <div className="d-flex align-items-center file-name-icon">
                              <a href="#" className="avatar avatar-md" onClick={(e) => e.preventDefault()}>
                                <img src={emp.avatar} className="img-fluid rounded-circle" alt="img" />
                              </a>
                              <div className="ms-2">
                                <h6 className="fw-medium">
                                  <a href="#" onClick={(e) => e.preventDefault()}>{emp.name}</a>
                                </h6>
                                <span className="d-block mt-1">{emp.role}</span>
                              </div>
                            </div>
                          </td>
                          <td>{emp.email}</td>
                          <td>{emp.phone}</td>
                          <td>{emp.account}</td>
                          <td>₹{emp.salary}</td>
                          <td>
                            <div className="action-icon d-inline-flex">
                              <a
                                href="#"
                                className="me-2"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setEditTarget(emp);
                                }}
                              >
                                <i className="ti ti-edit"></i>
                              </a>
                              <a
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setDeleteTarget(emp);
                                }}
                              >
                                <i className="ti ti-trash"></i>
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {employees.length === 0 && (
                        <tr>
                          <td colSpan={8} className="text-center">No employees found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="card-footer d-flex justify-content-end">
                <button
                  type="button"
                  id="salary-next"
                  className="btn btn-primary"
                  disabled={selectedIds.length === 0}
                  onClick={handleNext}
                >
                  Next<i className="ti ti-arrow-right ms-2" aria-hidden="true"></i>
                </button>
              </div>
            </div>
          )}

          {/* 3. Preview */}
          {previewOpen && (
            <section id="generated-salary" className="card" aria-labelledby="generated-salary-title">
              <div className="card-header">
                <h5 id="generated-salary-title" tabIndex={-1} ref={previewTitleRef}>
                  3. Generated Salary Preview
                </h5>
              </div>
              <div className="card-body">
                <p id="generated-salary-summary" role="status">
                  {previewEmployees.length} employee{previewEmployees.length === 1 ? "" : "s"} selected for{" "}
                  {monthLabel(month)} ({days} calendar days).
                </p>
                <div className="table-responsive mb-3">
                  <table id="salary-preview-table" className="table">
                    <thead className="thead-light">
                      <tr>
                        <th scope="col">Emp ID</th>
                        <th scope="col">Name</th>
                        <th scope="col">Earnings (₹)</th>
                        <th scope="col">Deduction (₹)</th>
                        <th scope="col">Total Salary (₹)</th>
                      </tr>
                    </thead>
                    <tbody id="salary-preview-body">
                      {previewEmployees.map((emp) => {
                        const row = preview[emp.id];
                        const calc = evaluated[emp.id];
                        return (
                          <tr key={emp.id}>
                            <td className="employee-id">{emp.id}</td>
                            <td className="employee-name">{emp.name}</td>
                            <td>
                              <label className="d-flex align-items-center justify-content-between gap-2 mb-2">
                                <span>Monthly Salary (₹)</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  required
                                  className="form-control form-control-sm earnings-input"
                                  value={row.salary}
                                  onChange={(e) => updatePreview(emp.id, "salary", e.target.value)}
                                />
                              </label>
                              {ATTENDANCE_FIELDS.map(([key, label]) => (
                                <label key={key} className="d-flex align-items-center justify-content-between gap-2 mb-2">
                                  <span>{label}</span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    required
                                    className="form-control form-control-sm attendance-input"
                                    style={{ width: 100, minWidth: 100 }}
                                    aria-describedby="salary-preview-error"
                                    value={row[key]}
                                    onChange={(e) => updatePreview(emp.id, key, e.target.value)}
                                  />
                                </label>
                              ))}
                              <strong className="earnings-total d-block border-top pt-2">{inr(calc.earnings)}</strong>
                            </td>
                            <td>
                              {DEDUCTION_FIELDS.map(([key, label]) => (
                                <label key={key} className="d-flex align-items-center justify-content-between gap-2 mb-2">
                                  <span>{label}</span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    required
                                    className="form-control form-control-sm deduction-input"
                                    style={{ width: 120, minWidth: 120 }}
                                    aria-describedby="salary-preview-error"
                                    value={row[key]}
                                    onChange={(e) => updatePreview(emp.id, key, e.target.value)}
                                  />
                                </label>
                              ))}
                              <strong className="deduction-total d-block border-top pt-2">{inr(calc.deductions)}</strong>
                            </td>
                            <td className="salary-total">{inr(calc.net)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr>
                        <th scope="row" colSpan={2}>Total</th>
                        <td id="preview-gross-total">{inr(round2(totals.gross))}</td>
                        <td id="preview-deduction-total">{inr(round2(totals.ded))}</td>
                        <td id="preview-net-total" className="text-success fw-bold">{inr(round2(totals.net))}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <p id="salary-preview-error" className="text-danger" role="alert" hidden={allValid}>
                  Enter non-negative deductions with up to two decimal places. Combined deductions cannot exceed
                  earnings. Enter a valid monthly salary. Attendance values must be whole or half days and add up to
                  the selected month's day count.
                </p>

                <div className="d-flex justify-content-end gap-2 flex-wrap">
                  <button type="button" id="generate-salary" className="btn btn-primary" disabled={!allValid} onClick={handleGenerate}>
                    <i className="ti ti-file-spreadsheet me-2" aria-hidden="true"></i>Generate Salary
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Result */}
          {result && (
            <section id="salary-result" className="card" aria-labelledby="salary-result-title">
              <div className="card-header">
                <h5 id="salary-result-title" tabIndex={-1} ref={resultTitleRef}>Generated Salary</h5>
              </div>
              <div className="card-body">
                <p id="salary-result-month">Salary Month: {monthLabel(result.month)}</p>
                <div className="table-responsive">
                  <table className="table">
                    <thead className="thead-light">
                      <tr>
                        <th scope="col">Emp ID</th>
                        <th scope="col">Name</th>
                        <th scope="col">Account Number</th>
                        <th scope="col">Net Salary (&#8377;)</th>
                      </tr>
                    </thead>
                    <tbody id="salary-result-body">
                      {result.rows.map((r) => (
                        <tr key={r.id}>
                          <td>{r.id}</td>
                          <td>{r.name}</td>
                          <td>{r.account}</td>
                          <td>{inr(r.net)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <th scope="row" colSpan={3}>Total Net Salary</th>
                        <td id="salary-result-total" className="text-success fw-bold">{inr(resultTotal)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <div className="d-flex justify-content-end mt-3">
                  <button type="button" id="download-salary" className="btn btn-success" onClick={handleDownload}>
                    <i className="ti ti-download me-2" aria-hidden="true"></i>Download Excel (.xlsx)
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Add Salary Modal */}
      {addOpen && (
        <SalaryModal
          title="Add Employee Salary"
          submitLabel="Add Employee Salary"
          employees={employees}
          initialEmployeeId=""
          initialEarn={buildRows(DEFAULT_EARN_LABELS)}
          initialDed={buildRows(DEFAULT_DED_LABELS)}
          onClose={() => setAddOpen(false)}
          onSubmit={handleAddSubmit}
        />
      )}

      {/* Edit Salary Modal */}
      {editTarget && (() => {
        const init = editInitial(editTarget);
        return (
          <SalaryModal
            key={editTarget.id}
            title="Edit Employee Salary"
            submitLabel="Update Employee Salary"
            employees={employees}
            initialEmployeeId={editTarget.id}
            initialEarn={init.earn}
            initialDed={init.ded}
            onClose={() => setEditTarget(null)}
            onSubmit={handleEditSubmit}
          />
        );
      })()}

      {/* Delete Modal */}
      {deleteTarget && (
        <>
          <div className="modal fade show" style={{ display: "block" }} tabIndex={-1} role="dialog" aria-modal="true">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-body text-center">
                  <span className="avatar avatar-xl bg-transparent-danger text-danger mb-3">
                    <i className="ti ti-trash-x fs-36"></i>
                  </span>
                  <h4 className="mb-1">Confirm Delete</h4>
                  <p className="mb-3">
                    You want to delete all the marked items, this cant be undone once you delete.
                  </p>
                  <div className="d-flex justify-content-center">
                    <a
                      href="#"
                      className="btn btn-light me-3"
                      onClick={(e) => {
                        e.preventDefault();
                        setDeleteTarget(null);
                      }}
                    >
                      Cancel
                    </a>
                    <a
                      href="#"
                      className="btn btn-danger"
                      onClick={(e) => {
                        e.preventDefault();
                        confirmDelete();
                      }}
                    >
                      Yes, Delete
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </>
  );
};

export default EmployeeSalary;

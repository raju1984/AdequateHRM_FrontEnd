
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

type Employee = {
  id: string;
  name: string;
  department: string;
  email: string;
  phone: string;
  account: string;
  salary: number;
  image: string;
};

type SalaryFields = {
  monthlySalary: number;
  workedDays: number;
  holidays: number;
  el: number;
  gl: number;
  lwp: number;
  pf: number;
  tds: number;
  gratuity: number;
  advances: number;
  employerPf: number;
  other: number;
};

type SalaryRow = {
  employee: Employee;
  fields: SalaryFields;
};

type ModalType = "add" | "edit" | "delete" | null;

const initialEmployees: Employee[] = [
  {
    id: "Emp-001",
    name: "Anthony Lewis",
    department: "Finance",
    email: "anthony@example.com",
    phone: "(123) 4567 890",
    account: "123456789001",
    salary: 40000,
    image: "user-32.jpg",
  },
  {
    id: "Emp-002",
    name: "Brian Villalobos",
    department: "Developer",
    email: "brian@example.com",
    phone: "(179) 7382 829",
    account: "123456789002",
    salary: 35000,
    image: "user-09.jpg",
  },
  {
    id: "Emp-003",
    name: "Harvey Smith",
    department: "Developer",
    email: "harvey@example.com",
    phone: "(184) 2719 738",
    account: "123456789003",
    salary: 20000,
    image: "user-01.jpg",
  },
  {
    id: "Emp-004",
    name: "Stephan Peralt",
    department: "Executive Officer",
    email: "peral@example.com",
    phone: "(193) 7839 748",
    account: "123456789004",
    salary: 22000,
    image: "user-33.jpg",
  },
  {
    id: "Emp-005",
    name: "Doglas Martini",
    department: "Manager",
    email: "martniwr@example.com",
    phone: "(183) 9302 890",
    account: "123456789005",
    salary: 25000,
    image: "user-34.jpg",
  },
  {
    id: "Emp-006",
    name: "Linda Ray",
    department: "Finance",
    email: "ray456@example.com",
    phone: "(120) 3728 039",
    account: "123456789006",
    salary: 30000,
    image: "user-02.jpg",
  },
  {
    id: "Emp-007",
    name: "Elliot Murray",
    department: "Developer",
    email: "murray@example.com",
    phone: "(102) 8480 832",
    account: "123456789007",
    salary: 35000,
    image: "user-35.jpg",
  },
  {
    id: "Emp-008",
    name: "Rebecca Smtih",
    department: "Executive",
    email: "smtih@example.com",
    phone: "(162) 8920 713",
    account: "123456789008",
    salary: 45000,
    image: "user-36.jpg",
  },
  {
    id: "Emp-009",
    name: "Connie Waters",
    department: "Developer",
    email: "connie@example.com",
    phone: "(189) 0920 723",
    account: "123456789009",
    salary: 50000,
    image: "user-37.jpg",
  },
  {
    id: "Emp-010",
    name: "Lori Broaddus",
    department: "Finance",
    email: "broaddus@example.com",
    phone: "(168) 8392 823",
    account: "123456789010",
    salary: 25000,
    image: "user-38.jpg",
  },
];

const money = (value: number) =>
  `₹${value.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })}`;

const daysInMonth = (month: string) => {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Date(year, monthNumber, 0).getDate();
};

const getEarnings = (f: SalaryFields, days: number) => {
  const paidDays = f.workedDays + f.holidays + f.el + f.gl;
  return days > 0 ? (f.monthlySalary * paidDays) / days : 0;
};

const getDeductions = (f: SalaryFields) =>
  f.pf +
  f.tds +
  f.gratuity +
  f.advances +
  f.employerPf +
  f.other;

const createFields = (
  employee: Employee,
  days: number
): SalaryFields => ({
  monthlySalary: employee.salary,
  workedDays: days,
  holidays: 0,
  el: 0,
  gl: 0,
  lwp: 0,
  pf: 4200,
  tds: 3500,
  gratuity: 0,
  advances: 0,
  employerPf: 0,
  other: 0,
});

const emptyEmployee: Employee = {
  id: "",
  name: "",
  department: "",
  email: "",
  phone: "",
  account: "",
  salary: 0,
  image: "",
};

const EmployeeSalary = () => {
  const [employees, setEmployees] =
    useState<Employee[]>(initialEmployees);

  const [month, setMonth] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [step, setStep] = useState(1);
  const [rows, setRows] = useState<SalaryRow[]>([]);
  const [error, setError] = useState("");

  const [modal, setModal] = useState<ModalType>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Employee>(emptyEmployee);

  const days = month ? daysInMonth(month) : 0;

  const allSelected =
    employees.length > 0 &&
    selectedIds.length === employees.length;

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        const earnings = getEarnings(row.fields, days);
        const deductions = getDeductions(row.fields);

        return {
          earnings: acc.earnings + earnings,
          deductions: acc.deductions + deductions,
          net: acc.net + earnings - deductions,
        };
      },
      { earnings: 0, deductions: 0, net: 0 }
    );
  }, [rows, days]);

  const toggleEmployee = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const toggleAll = () => {
    setSelectedIds(
      allSelected ? [] : employees.map((employee) => employee.id)
    );
  };

  const handleMonthChange = (value: string) => {
    setMonth(value);
    setSelectedIds([]);
    setRows([]);
    setStep(1);
    setError("");
  };

  const handleNext = () => {
    const selected = employees.filter((employee) =>
      selectedIds.includes(employee.id)
    );

    if (!month || selected.length === 0) return;

    setRows(
      selected.map((employee) => ({
        employee,
        fields: createFields(employee, days),
      }))
    );

    setError("");
    setStep(3);
  };

  const updateField = (
    employeeId: string,
    field: keyof SalaryFields,
    value: number
  ) => {
    setRows((prev) =>
      prev.map((row) =>
        row.employee.id === employeeId
          ? {
              ...row,
              fields: {
                ...row.fields,
                [field]: value,
              },
            }
          : row
      )
    );

    setError("");
  };

  const validateSalary = () => {
    for (const row of rows) {
      const f = row.fields;

      const attendance = [
        f.workedDays,
        f.holidays,
        f.el,
        f.gl,
        f.lwp,
      ];

      if (
        !Number.isFinite(f.monthlySalary) ||
        f.monthlySalary < 0
      ) {
        return `Invalid monthly salary for ${row.employee.name}`;
      }

      if (
        attendance.some(
          (value) =>
            !Number.isFinite(value) ||
            value < 0 ||
            !Number.isInteger(value * 2)
        )
      ) {
        return `Invalid attendance for ${row.employee.name}`;
      }

      const totalDays = attendance.reduce(
        (sum, value) => sum + value,
        0
      );

      if (Math.abs(totalDays - days) > 0.001) {
        return `${row.employee.name}: Attendance must total ${days} days`;
      }

      const deductions = [
        f.pf,
        f.tds,
        f.gratuity,
        f.advances,
        f.employerPf,
        f.other,
      ];

      if (
        deductions.some(
          (value) =>
            !Number.isFinite(value) ||
            value < 0 ||
            Math.abs(value * 100 - Math.round(value * 100)) >
              0.00001
        )
      ) {
        return `Invalid deductions for ${row.employee.name}`;
      }

      if (getDeductions(f) > getEarnings(f, days)) {
        return `Deductions exceed earnings for ${row.employee.name}`;
      }
    }

    return "";
  };

  const handleGenerate = () => {
    const validationError = validateSalary();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setStep(4);
  };

  const downloadSalary = () => {
    const csvCell = (value: string | number) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const data = [
      [
        "Emp ID",
        "Name",
        "Account Number",
        "Net Salary",
      ],
      ...rows.map((row) => [
        row.employee.id,
        row.employee.name,
        row.employee.account,
        (
          getEarnings(row.fields, days) -
          getDeductions(row.fields)
        ).toFixed(2),
      ]),
    ];

    const csv = data
      .map((line) => line.map(csvCell).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `Employee_Salary_${month}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const openAdd = () => {
    setForm(emptyEmployee);
    setEditingId(null);
    setModal("add");
  };

  const openEdit = (employee: Employee) => {
    setForm({ ...employee });
    setEditingId(employee.id);
    setModal("edit");
  };

  const openDelete = (employee: Employee) => {
    setEditingId(employee.id);
    setModal("delete");
  };

  const saveEmployee = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !form.id.trim() ||
      !form.name.trim() ||
      !Number.isFinite(form.salary) ||
      form.salary < 0
    ) {
      alert("Please enter valid employee details");
      return;
    }

    if (
      modal === "add" &&
      employees.some((employee) => employee.id === form.id)
    ) {
      alert("Employee ID already exists");
      return;
    }

    if (modal === "add") {
      setEmployees((prev) => [...prev, form]);
    }

    if (modal === "edit") {
      setEmployees((prev) =>
        prev.map((employee) =>
          employee.id === editingId ? form : employee
        )
      );
    }

    setSelectedIds([]);
    setRows([]);
    setStep(1);
    setModal(null);
  };

  const deleteEmployee = () => {
    setEmployees((prev) =>
      prev.filter((employee) => employee.id !== editingId)
    );

    setSelectedIds([]);
    setRows([]);
    setStep(1);
    setModal(null);
  };

  const attendanceFields = [
    ["workedDays", "Worked Days"],
    ["holidays", "Holidays"],
    ["el", "Leaves (EL) - Paid"],
    ["gl", "Leaves (GL) - Paid"],
    ["lwp", "LWP"],
  ] as const;

  const deductionFields = [
    ["pf", "PF"],
    ["tds", "TDS"],
    ["gratuity", "Gratuity"],
    ["advances", "Advances"],
    ["employerPf", "Employer Cont to PF"],
    ["other", "Other"],
  ] as const;

  return (
    <div className="content p-3 p-md-4">
      {/* PAGE HEADER */}
      <div className="d-md-flex align-items-center justify-content-between page-breadcrumb mb-3">
        <div className="mb-2">
          <h2 className="mb-1">Employee Salary</h2>

          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link to="/Accountant/AccountantDashboard">
                  <i className="ti ti-smart-home" />
                </Link>
              </li>
              <li className="breadcrumb-item active">
                Employee Salary
              </li>
            </ol>
          </nav>
        </div>

        {/* <button
          type="button"
          className="btn btn-primary mb-2"
          onClick={openAdd}
        >
          <i className="ti ti-circle-plus me-2" />
          Add Salary
        </button> */}
      </div>

      {/* STEP 1: MONTH */}
      <div className="card">
        <div className="card-body">
          <label
            htmlFor="generation-month"
            className="form-label"
          >
            1. Select Salary Month
          </label>

          <input
            id="generation-month"
            type="month"
            className="form-control w-auto"
            value={month}
            onChange={(e) =>
              handleMonthChange(e.target.value)
            }
          />

          <p className="text-muted mt-2 mb-0">
            Select a month, then select employees below and
            click Next.
          </p>
        </div>
      </div>

      {/* STEP 2: EMPLOYEES */}
      {month && step <= 2 && (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">2. Select Employees</h5>
          </div>

          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table">
                <thead className="thead-light">
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={allSelected}
                        onChange={toggleAll}
                        aria-label="Select all employees"
                      />
                    </th>
                    <th>Emp ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Account Number</th>
                    <th>Salary</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.id}>
                      <td>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={selectedIds.includes(
                            employee.id
                          )}
                          onChange={() =>
                            toggleEmployee(employee.id)
                          }
                        />
                      </td>

                      <td>{employee.id}</td>

                      <td>
                        <div className="d-flex align-items-center">
                          {employee.image && (
                            <img
                              src={`/assets/img/users/${employee.image}`}
                              alt=""
                              className="rounded-circle me-2"
                              style={{
                                width: 38,
                                height: 38,
                                objectFit: "cover",
                              }}
                            />
                          )}

                          <div>
                            <h6 className="mb-0">
                              {employee.name}
                            </h6>
                            <small className="text-muted">
                              {employee.department}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>{employee.email}</td>
                      <td>{employee.phone}</td>
                      <td>{employee.account}</td>
                      <td>{money(employee.salary)}</td>

                      <td>
                        <div className="d-inline-flex gap-3">
                          <button
                            type="button"
                            className="btn btn-link p-0"
                            onClick={() =>
                              openEdit(employee)
                            }
                            aria-label="Edit employee salary"
                          >
                            <i className="ti ti-edit" />
                          </button>

                          <button
                            type="button"
                            className="btn btn-link text-danger p-0"
                            onClick={() =>
                              openDelete(employee)
                            }
                            aria-label="Delete employee salary"
                          >
                            <i className="ti ti-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card-footer d-flex justify-content-end">
            <button
              type="button"
              className="btn btn-primary"
              disabled={selectedIds.length === 0}
              onClick={handleNext}
            >
              Next
              <i className="ti ti-arrow-right ms-2" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: SALARY PREVIEW */}
      {step === 3 && (
        <section className="card">
          <div className="card-header">
            <h5 className="mb-0">
              3. Generated Salary Preview
            </h5>
          </div>

          <div className="card-body">
            <p>
              Salary Month: <strong>{month}</strong>
              {" | "}
              Employees: <strong>{rows.length}</strong>
            </p>

            <div className="table-responsive mb-3">
              <table className="table">
                <thead className="thead-light">
                  <tr>
                    <th>Emp ID</th>
                    <th>Name</th>
                    <th>Earnings (₹)</th>
                    <th>Deduction (₹)</th>
                    <th>Total Salary (₹)</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row) => {
                    const f = row.fields;
                    const earnings = getEarnings(f, days);
                    const deductions = getDeductions(f);

                    return (
                      <tr key={row.employee.id}>
                        <td>{row.employee.id}</td>
                        <td>{row.employee.name}</td>

                        {/* EARNINGS */}
                        <td style={{ minWidth: 240 }}>
                          <label className="form-label">
                            Monthly Salary (₹)
                          </label>

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="form-control form-control-sm mb-2"
                            value={f.monthlySalary}
                            onChange={(e) =>
                              updateField(
                                row.employee.id,
                                "monthlySalary",
                                e.target.value === ""
                                  ? NaN
                                  : Number(e.target.value)
                              )
                            }
                          />

                          {attendanceFields.map(
                            ([key, label]) => (
                              <label
                                key={key}
                                className="d-flex align-items-center justify-content-between gap-2 mb-2"
                              >
                                <span>{label}</span>

                                <input
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  className="form-control form-control-sm"
                                  style={{ width: 90 }}
                                  value={f[key]}
                                  onChange={(e) =>
                                    updateField(
                                      row.employee.id,
                                      key,
                                      e.target.value === ""
                                        ? NaN
                                        : Number(e.target.value)
                                    )
                                  }
                                />
                              </label>
                            )
                          )}

                          <strong className="d-block border-top pt-2">
                            {money(earnings)}
                          </strong>
                        </td>

                        {/* DEDUCTIONS */}
                        <td style={{ minWidth: 240 }}>
                          {deductionFields.map(
                            ([key, label]) => (
                              <label
                                key={key}
                                className="d-flex align-items-center justify-content-between gap-2 mb-2"
                              >
                                <span>{label}</span>

                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  className="form-control form-control-sm"
                                  style={{ width: 110 }}
                                  value={f[key]}
                                  onChange={(e) =>
                                    updateField(
                                      row.employee.id,
                                      key,
                                      e.target.value === ""
                                        ? NaN
                                        : Number(e.target.value)
                                    )
                                  }
                                />
                              </label>
                            )
                          )}

                          <strong className="d-block border-top pt-2">
                            {money(deductions)}
                          </strong>
                        </td>

                        <td className="fw-bold">
                          {money(earnings - deductions)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

                <tfoot>
                  <tr>
                    <th colSpan={2}>Total</th>
                    <th>{money(totals.earnings)}</th>
                    <th>{money(totals.deductions)}</th>
                    <th className="text-success">
                      {money(totals.net)}
                    </th>
                  </tr>
                </tfoot>
              </table>
            </div>

            {error && (
              <p className="text-danger" role="alert">
                {error}
              </p>
            )}

            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-light border"
                onClick={() => {
                  setStep(1);
                  setError("");
                }}
              >
                Back
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleGenerate}
              >
                <i className="ti ti-file-spreadsheet me-2" />
                Generate Salary
              </button>
            </div>
          </div>
        </section>
      )}

      {/* STEP 4: GENERATED RESULT */}
      {step === 4 && (
        <section className="card">
          <div className="card-header">
            <h5 className="mb-0">Generated Salary</h5>
          </div>

          <div className="card-body">
            <p>
              Salary Month: <strong>{month}</strong>
            </p>

            <div className="table-responsive">
              <table className="table">
                <thead className="thead-light">
                  <tr>
                    <th>Emp ID</th>
                    <th>Name</th>
                    <th>Account Number</th>
                    <th>Net Salary (₹)</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row) => (
                    <tr key={row.employee.id}>
                      <td>{row.employee.id}</td>
                      <td>{row.employee.name}</td>
                      <td>{row.employee.account}</td>
                      <td>
                        {money(
                          getEarnings(row.fields, days) -
                            getDeductions(row.fields)
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>

                <tfoot>
                  <tr>
                    <th colSpan={3}>Total Net Salary</th>
                    <th className="text-success">
                      {money(totals.net)}
                    </th>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-3">
              <button
                type="button"
                className="btn btn-light border"
                onClick={() => setStep(3)}
              >
                Back to Preview
              </button>

              <button
                type="button"
                className="btn btn-success"
                onClick={downloadSalary}
              >
                <i className="ti ti-download me-2" />
                Download Excel-compatible CSV
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ADD / EDIT MODAL */}
      {(modal === "add" || modal === "edit") && (
        <div
          className="modal d-block"
          role="dialog"
          aria-modal="true"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">
                  {modal === "add"
                    ? "Add Employee Salary"
                    : "Edit Employee Salary"}
                </h4>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setModal(null)}
                  aria-label="Close"
                />
              </div>

              <form onSubmit={saveEmployee}>
                <div className="modal-body">
                  <div className="row">
                    {(
                      [
                        ["id", "Employee ID"],
                        ["name", "Employee Name"],
                        ["department", "Department"],
                        ["email", "Email"],
                        ["phone", "Phone"],
                        ["account", "Account Number"],
                        ["salary", "Net Salary"],
                      ] as const
                    ).map(([key, label]) => (
                      <div className="col-md-6 mb-3" key={key}>
                        <label className="form-label">
                          {label}
                        </label>

                        <input
                          className="form-control"
                          type={
                            key === "salary"
                              ? "number"
                              : key === "email"
                              ? "email"
                              : "text"
                          }
                          min={
                            key === "salary" ? 0 : undefined
                          }
                          value={form[key]}
                          disabled={
                            modal === "edit" && key === "id"
                          }
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              [key]:
                                key === "salary"
                                  ? Number(e.target.value)
                                  : e.target.value,
                            }))
                          }
                          required={
                            key === "id" ||
                            key === "name" ||
                            key === "salary"
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-white border"
                    onClick={() => setModal(null)}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    {modal === "add"
                      ? "Add Employee Salary"
                      : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {modal === "delete" && (
        <div
          className="modal d-block"
          role="dialog"
          aria-modal="true"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-body text-center p-4">
                <i className="ti ti-trash-x fs-36 text-danger" />

                <h4 className="mt-3">Confirm Delete</h4>

                <p>
                  Are you sure you want to delete this
                  employee salary record?
                </p>

                <div className="d-flex justify-content-center gap-2">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => setModal(null)}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={deleteEmployee}
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeSalary;

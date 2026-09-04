import "../../assets/css/Employee.css";
import usersImg from "../../assets/img/users.png";
import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiHome,
  FiPlusCircle,
  FiTrash2,
  FiUser,
  FiUserPlus,
  FiUsers,
  FiX,
  FiUpload,
} from "react-icons/fi";

type EmployeeStatus = "Active" | "Inactive";

type EmployeeData = {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  designation: string;
  joiningDate: string;
  status: EmployeeStatus;
};

type EmployeeForm = {
  firstName: string;
  lastName: string;
  employeeId: string;
  joiningDate: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  company: string;
  department: string;
  designation: string;
  about: string;
  image?: string;
};

const emptyForm: EmployeeForm = {
  firstName: "",
  lastName: "",
  employeeId: "",
  joiningDate: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  company: "",
  department: "",
  designation: "",
  about: "",
  image: "",
};

const initialEmployees: EmployeeData[] = [
  {
    id: "Emp-001",
    name: "Anthony Lewis",
    role: "Finance",
    email: "anthony@example.com",
    phone: "(123) 4567 890",
    designation: "Finance",
    joiningDate: "12 Sep 2024",
    status: "Active",
  },
  {
    id: "Emp-002",
    name: "Brian Villalobos",
    role: "Developer",
    email: "brian@example.com",
    phone: "(179) 7382 829",
    designation: "Developer",
    joiningDate: "24 Oct 2024",
    status: "Active",
  },
  {
    id: "Emp-003",
    name: "Harvey Smith",
    role: "Developer",
    email: "harvey@example.com",
    phone: "(184) 2719 738",
    designation: "Developer",
    joiningDate: "18 Feb 2024",
    status: "Active",
  },
  {
    id: "Emp-004",
    name: "Stephan Peralt",
    role: "Executive Officer",
    email: "peral@example.com",
    phone: "(193) 7839 748",
    designation: "Executive",
    joiningDate: "17 Oct 2024",
    status: "Active",
  },
  {
    id: "Emp-005",
    name: "Doglas Martini",
    role: "Manager",
    email: "martniwr@example.com",
    phone: "(183) 9302 890",
    designation: "Manager",
    joiningDate: "20 Jul 2024",
    status: "Active",
  },
  {
    id: "Emp-006",
    name: "Linda Ray",
    role: "Finance",
    email: "ray456@example.com",
    phone: "(120) 3728 039",
    designation: "Finance",
    joiningDate: "10 Apr 2024",
    status: "Active",
  },
  {
    id: "Emp-007",
    name: "Elliot Murray",
    role: "Finance",
    email: "murray@example.com",
    phone: "(102) 8480 832",
    designation: "Developer",
    joiningDate: "29 Aug 2024",
    status: "Active",
  },
  {
    id: "Emp-008",
    name: "Rebecca Smtih",
    role: "Executive",
    email: "smtih@example.com",
    phone: "(162) 8920 713",
    designation: "Executive",
    joiningDate: "22 Feb 2024",
    status: "Inactive",
  },
  {
    id: "Emp-009",
    name: "Connie Waters",
    role: "Developer",
    email: "connie@example.com",
    phone: "(189) 0920 723",
    designation: "Developer",
    joiningDate: "03 Nov 2024",
    status: "Active",
  },
  {
    id: "Emp-010",
    name: "Lori Broaddus",
    role: "Finance",
    email: "broaddus@example.com",
    phone: "(168) 8392 823",
    designation: "Finance",
    joiningDate: "17 Dec 2024",
    status: "Active",
  },
];

const Employee = () => {
  const [employees, setEmployees] = useState<EmployeeData[]>(initialEmployees);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [designationFilter, setDesignationFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState("08/27/2026 - 09/02/2026");
  const [sortBy, setSortBy] = useState("Last 7 Days");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EmployeeForm>(emptyForm);

  const filteredEmployees = useMemo(() => {
    let result = employees.filter((employee) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        employee.id.toLowerCase().includes(q) ||
        employee.name.toLowerCase().includes(q) ||
        employee.email.toLowerCase().includes(q) ||
        employee.phone.toLowerCase().includes(q) ||
        employee.designation.toLowerCase().includes(q);

      const matchesDesignation =
        !designationFilter || employee.designation === designationFilter;
      const matchesStatus = !statusFilter || employee.status === statusFilter;

      return matchesSearch && matchesDesignation && matchesStatus;
    });

    if (sortBy === "Ascending") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortBy === "Descending") {
      result = [...result].sort((a, b) => b.name.localeCompare(a.name));
    }

    return result;
  }, [employees, search, designationFilter, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / rowsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * rowsPerPage;
  const visibleEmployees = filteredEmployees.slice(startIndex, startIndex + rowsPerPage);

  const handleField = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((previous) => ({ ...previous, image: URL.createObjectURL(file) }));
  };

  const openAddModal = () => {
    setForm(emptyForm);
    setAddOpen(true);
  };

  const openEditModal = (employee: EmployeeData) => {
    const [firstName, ...rest] = employee.name.split(" ");
    setEditingId(employee.id);
    setForm({
      firstName,
      lastName: rest.join(" "),
      employeeId: employee.id,
      joiningDate: employee.joiningDate,
      username: firstName,
      email: employee.email,
      password: "",
      confirmPassword: "",
      phone: employee.phone,
      company: "Abac Company",
      department: employee.role,
      designation: employee.designation,
      about: "",
      image: usersImg,
    });
    setEditOpen(true);
  };

  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.employeeId || !form.joiningDate || !form.email || !form.phone) {
      alert("Please fill all required fields.");
      return;
    }
    if (form.password && form.password !== form.confirmPassword) {
      alert("Password and confirm password do not match.");
      return;
    }

    const employee: EmployeeData = {
      id: form.employeeId,
      name: `${form.firstName} ${form.lastName}`.trim(),
      role: form.department || form.designation || "Employee",
      email: form.email,
      phone: form.phone,
      designation: form.designation || form.department || "Employee",
      joiningDate: form.joiningDate,
      status: "Active",
    };

    setEmployees((previous) => [employee, ...previous]);
    setAddOpen(false);
    setSuccessOpen(true);
  };

  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    setEmployees((previous) =>
      previous.map((employee) =>
        employee.id === editingId
          ? {
              ...employee,
              id: form.employeeId,
              name: `${form.firstName} ${form.lastName}`.trim(),
              role: form.department || employee.role,
              email: form.email,
              phone: form.phone,
              designation: form.designation || employee.designation,
              joiningDate: form.joiningDate,
            }
          : employee
      )
    );
    setEditOpen(false);
    setEditingId(null);
  };

  const requestDelete = (id: string) => {
    setSelectedIds([id]);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    setEmployees((previous) => previous.filter((employee) => !selectedIds.includes(employee.id)));
    setSelectedIds([]);
    setDeleteOpen(false);
  };

  const toggleSelectAll = () => {
    const ids = visibleEmployees.map((employee) => employee.id);
    const allSelected = ids.length > 0 && ids.every((id) => selectedIds.includes(id));
    setSelectedIds((previous) =>
      allSelected
        ? previous.filter((id) => !ids.includes(id))
        : Array.from(new Set([...previous, ...ids]))
    );
  };

  return (
    <div className="employee-page">
      <div className="employee-header">
        <div>
          <h1>Employee</h1>
          <div className="employee-breadcrumb">
            <Link to="/Admin/dashboard"><FiHome /></Link>
            <span>/</span>
            <span>Employees</span>
          </div>
        </div>
        <button className="add-employee-btn" onClick={openAddModal}>
          <FiPlusCircle /> Add Employee
        </button>
      </div>

      <div className="employee-stat-grid">
        <StatCard icon={<FiUsers />} tone="black" title="Total Employee" value="1007" badgeTone="purple" />
        <StatCard icon={<FiUser />} tone="green" title="Active" value="1007" badgeTone="orange" />
        <StatCard icon={<FiUser />} tone="red" title="InActive" value="1007" badgeTone="gray" />
        <StatCard icon={<FiUserPlus />} tone="blue" title="New Joiners" value="67" badgeTone="blue" />
      </div>

      <div className="employee-table-card">
        <div className="employee-table-top">
          <h3>Employee</h3>
          <div className="employee-filter-row">
            <div className="custom-select-box date-select-box">
              <input value={dateRange} onChange={(e) => setDateRange(e.target.value)} />
              <FiChevronDown />
            </div>
            <SelectBox
              value={designationFilter}
              onChange={(value) => { setDesignationFilter(value); setCurrentPage(1); }}
              className="designation-filter-box"
              options={[
                ["", "Designation"], ["Finance", "Finance"], ["Developer", "Developer"],
                ["Executive", "Executive"], ["Manager", "Manager"],
              ]}
            />
            <SelectBox
              value={statusFilter}
              onChange={(value) => { setStatusFilter(value); setCurrentPage(1); }}
              className="status-filter-box"
              options={[["", "Select Status"], ["Active", "Active"], ["Inactive", "Inactive"]]}
            />
            <SelectBox
              value={sortBy}
              onChange={setSortBy}
              className="sort-filter-box"
              options={[["Last 7 Days", "Sort By : Last 7 Days"], ["Ascending", "Ascending"], ["Descending", "Descending"]]}
            />
          </div>
        </div>

        <div className="employee-table-toolbar">
          <div className="rows-control">
            <span>Row Per Page</span>
            <div className="small-select">
              <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                <option value={10}>10</option><option value={20}>20</option><option value={30}>30</option><option value={40}>40</option>
              </select>
              <FiChevronDown />
            </div>
            <span>Entries</span>
          </div>
          <input className="employee-search" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} placeholder="Search" />
        </div>

        <div className="employee-table-responsive">
          <table className="employee-table">
            <thead>
              <tr>
                <th className="check-column"><input type="checkbox" checked={visibleEmployees.length > 0 && visibleEmployees.every((e) => selectedIds.includes(e.id))} onChange={toggleSelectAll} /></th>
                <th>Emp ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Designation</th><th>Joining Date</th><th>Status</th><th className="action-column" />
              </tr>
            </thead>
            <tbody>
              {visibleEmployees.map((employee) => (
                <tr key={employee.id}>
                  <td className="check-column"><input type="checkbox" checked={selectedIds.includes(employee.id)} onChange={() => setSelectedIds((previous) => previous.includes(employee.id) ? previous.filter((id) => id !== employee.id) : [...previous, employee.id])} /></td>
                  <td className="employee-id">{employee.id}</td>
                  <td>
                    <div className="employee-name-cell">
                      <img className="employee-avatar-image" src={usersImg} alt={employee.name} />
                      <div><p>{employee.name}</p><span>{employee.role}</span></div>
                    </div>
                  </td>
                  <td className="muted-cell">{employee.email}</td>
                  <td className="muted-cell">{employee.phone}</td>
                  <td>
                    <div className="table-designation-select">
                      <select value={employee.designation} onChange={(e) => setEmployees((previous) => previous.map((item) => item.id === employee.id ? { ...item, designation: e.target.value } : item))}>
                        <option>Finance</option><option>Developer</option><option>Executive</option><option>Manager</option>
                      </select><FiChevronDown />
                    </div>
                  </td>
                  <td className="muted-cell">{employee.joiningDate}</td>
                  <td><span className={`employee-status ${employee.status === "Active" ? "employee-status-active" : "employee-status-inactive"}`}><span className="status-dot" />{employee.status}</span></td>
                  <td className="action-column">
                    <button className="row-action-btn" onClick={() => openEditModal(employee)} aria-label="Edit employee"><FiEdit2 /></button>
                    <button className="row-action-btn danger" onClick={() => requestDelete(employee.id)} aria-label="Delete employee"><FiTrash2 /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="employee-table-footer">
          <p>Showing {filteredEmployees.length ? startIndex + 1 : 0} - {Math.min(startIndex + rowsPerPage, filteredEmployees.length)} of {filteredEmployees.length} entries</p>
          <div className="employee-pagination">
            <button disabled={safeCurrentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}><FiChevronLeft /></button>
            <button className="pagination-active">{safeCurrentPage}</button>
            <button disabled={safeCurrentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}><FiChevronRight /></button>
          </div>
        </div>
      </div>

      {addOpen && <EmployeeModal title="Add New Employee" form={form} setForm={setForm} onField={handleField} onImage={handleImage} onClose={() => setAddOpen(false)} onSubmit={handleAddSubmit} />}
      {editOpen && <EmployeeModal title="Edit Employee" form={form} setForm={setForm} onField={handleField} onImage={handleImage} onClose={() => setEditOpen(false)} onSubmit={handleEditSubmit} />}

      {successOpen && (
        <div className="employee-modal-overlay">
          <div className="employee-confirm-modal success-modal">
            <div className="success-icon">✓</div>
            <h3>Employee Added Successfully</h3>
            <p>Employee has been added successfully.</p>
            <button className="employee-save-btn" onClick={() => setSuccessOpen(false)}>Back to List</button>
          </div>
        </div>
      )}

      {deleteOpen && (
        <div className="employee-modal-overlay">
          <div className="employee-confirm-modal">
            <div className="delete-icon"><FiTrash2 /></div>
            <h3>Confirm Delete</h3>
            <p>You want to delete the marked item. This can't be undone once you delete.</p>
            <div className="confirm-actions">
              <button className="employee-cancel-btn" onClick={() => setDeleteOpen(false)}>Cancel</button>
              <button className="employee-delete-btn" onClick={confirmDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, tone, title, value, badgeTone }: { icon: React.ReactNode; tone: string; title: string; value: string; badgeTone: string }) => (
  <div className="employee-stat-card">
    <div className="stat-left">
      <div className={`stat-icon stat-icon-${tone}`}>{icon}</div>
      <div className="stat-text"><span>{title}</span><strong>{value}</strong></div>
    </div>
    <div className={`percentage percentage-${badgeTone}`}>↔ +19.01%</div>
  </div>
);

const SelectBox = ({ value, onChange, options, className = "" }: { value: string; onChange: (value: string) => void; options: [string, string][]; className?: string }) => (
  <div className={`custom-select-box ${className}`}>
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map(([optionValue, label]) => <option key={`${optionValue}-${label}`} value={optionValue}>{label}</option>)}
    </select>
    <FiChevronDown />
  </div>
);

const EmployeeModal = ({
  title, form, setForm, onField, onImage, onClose, onSubmit,
}: {
  title: string;
  form: EmployeeForm;
  setForm: React.Dispatch<React.SetStateAction<EmployeeForm>>;
  onField: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
}) => (
  <div className="employee-modal-overlay">
    <div className="employee-modal employee-modal-large">
      <div className="employee-modal-header">
        <h2>{title}</h2>
        <button type="button" className="modal-close" onClick={onClose}><FiX /></button>
      </div>
      <form onSubmit={onSubmit}>
        <div className="employee-modal-body full-form-grid">
          <div className="profile-upload-box full-width">
            <div className="profile-preview">
              {form.image ? <img src={form.image} alt="Profile preview" /> : <FiUpload />}
            </div>
            <div>
              <h4>Upload Profile Image</h4>
              <p>Image should be below 4 mb</p>
              <div className="profile-upload-actions">
                <label className="upload-label">Upload<input type="file" accept="image/*" onChange={onImage} /></label>
                <button type="button" className="mini-cancel" onClick={() => setForm((previous) => ({ ...previous, image: "" }))}>Cancel</button>
              </div>
            </div>
          </div>

          <FormInput label="First Name" name="firstName" value={form.firstName} onChange={onField} required />
          <FormInput label="Last Name" name="lastName" value={form.lastName} onChange={onField} />
          <FormInput label="Employee ID" name="employeeId" value={form.employeeId} onChange={onField} required />
          <FormInput label="Joining Date" name="joiningDate" value={form.joiningDate} onChange={onField} placeholder="dd/mm/yyyy" required />
          <FormInput label="Username" name="username" value={form.username} onChange={onField} required />
          <FormInput type="email" label="Email" name="email" value={form.email} onChange={onField} required />
          <FormInput type="password" label="Password" name="password" value={form.password} onChange={onField} required={title.includes("Add")} />
          <FormInput type="password" label="Confirm Password" name="confirmPassword" value={form.confirmPassword} onChange={onField} required={title.includes("Add")} />
          <FormInput label="Phone Number" name="phone" value={form.phone} onChange={onField} required />
          <FormInput label="Company" name="company" value={form.company} onChange={onField} required />
          <FormSelect label="Department" name="department" value={form.department} onChange={onField} options={["", "All Department", "Finance", "Developer", "Executive"]} />
          <FormSelect label="Designation" name="designation" value={form.designation} onChange={onField} options={["", "Finance", "Developer", "Executive", "Manager"]} />
          <div className="employee-form-group full-width">
            <label>About <span className="required-star">*</span></label>
            <textarea name="about" rows={3} value={form.about} onChange={onField} />
          </div>
        </div>
        <div className="employee-modal-footer">
          <button type="button" className="employee-cancel-btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="employee-save-btn">Save</button>
        </div>
      </form>
    </div>
  </div>
);

const FormInput = ({ label, name, value, onChange, type = "text", required = false, placeholder = "" }: { label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; required?: boolean; placeholder?: string }) => (
  <div className="employee-form-group">
    <label>{label} {required && <span className="required-star">*</span>}</label>
    <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} required={required} />
  </div>
);

const FormSelect = ({ label, name, value, onChange, options }: { label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: string[] }) => (
  <div className="employee-form-group">
    <label>{label}</label>
    <select name={name} value={value} onChange={onChange}>
      {options.map((option) => <option key={option || "select"} value={option}>{option || "Select"}</option>)}
    </select>
  </div>
);

export default Employee;

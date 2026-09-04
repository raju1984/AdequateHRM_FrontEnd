import { Link } from "react-router-dom";

const SelectRole = () => {
  return (
    <div className="select-role-page">
      <ul className="role-list">

        <li>
          <Link to="/admin/adminLogin">Admin</Link>
        </li>

        <li>
          <Link to="/Hr/HrLogin">HR</Link>
        </li>

        <li>
          <Link to="/Employee/EmployeLogin">
            Employee
          </Link>
        </li>

      </ul>
    </div>
  );
};

export default SelectRole;
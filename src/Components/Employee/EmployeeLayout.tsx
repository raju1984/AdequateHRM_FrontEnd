import React from "react";
import { Outlet } from "react-router-dom";

import EmployeeHeader from "./EmployeeHeader";
import EmployeeSidebar from "./EmployeeSidebar";

const EmployeeLayout = () => {
  return (
    <div className="main-wrapper">
      {/* Header */}
      <EmployeeHeader />

      {/* Sidebar */}
      <EmployeeSidebar />

      {/* Page Wrapper */}
      <div
  className="page-wrapper"
  style={{
    marginLeft: "260px",
    // marginTop: "55px",
    minHeight: "100vh",
    background: "#f8f9fc",
  }}
>
  <div className="content">
    <Outlet />
  </div>
</div>
    </div>
  );
};

export default EmployeeLayout;
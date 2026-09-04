import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";

<Outlet />

const DashboardLayout = ({ children }: any) => {
  return (
    <div className="app-container">

      <Sidebar />

      <div className="main-section">

        <Header />

        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
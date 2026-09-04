import React from "react";
import { Outlet } from "react-router-dom";

import HrHeader from "./HrHeader";
import HrSidebar from "./HrSidebar";
import HrFooter from "./HrFooter";

const HrLayout = () => {
  return (
    <div className="main-wrapper">

      {/* Header */}
      <HrHeader />

      {/* Sidebar */}
      <HrSidebar />

      {/* Page Wrapper */}
      <div className="page-wrapper">

        <div className="content">

          {/* All HR Screens Render Here */}
          <Outlet />

        </div>

        {/* Footer */}
        <HrFooter />

      </div>

    </div>
  );
};

export default HrLayout;
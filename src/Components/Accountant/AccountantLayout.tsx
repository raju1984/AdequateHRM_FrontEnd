
import { Outlet } from "react-router-dom";
import AccountantSidebar from "./AccountantSidebar";

const AccountantLayout = () => {
  return (
    <div className="main-wrapper">
      <AccountantSidebar />

      <div
        className="page-wrapper"
        style={{
          marginLeft: "250px",
          minHeight: "100vh",
        }}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default AccountantLayout;

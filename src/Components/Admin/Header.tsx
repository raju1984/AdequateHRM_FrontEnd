import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import logo from "../../assets/img/logo.webp";
import avatar27 from "../../assets/img/profiles/avatar-27.jpg";

const Header = () => {
 const [open, setOpen] = useState(false);

const dropdownRef = useRef<HTMLDivElement | null>(null);
const navigate = useNavigate();;

useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setOpen(false);
    }
  };

  document.addEventListener("click", handleClickOutside);

  return () => {
    document.removeEventListener("click", handleClickOutside);
  };
}, []);

  const handleLogout = () => {
    setOpen(false);
    navigate("/Admin/AdminLogin");
  };

  return (
    <div
      className="header"
 style={{
  height: "55px",
  background: "#fff",
  borderBottom: "1px solid #e5e7eb",
  position: "sticky",
  top: 0,
  zIndex: 1000,

  // position: "fixed",
  left: "260px",
  right: 0,
  width: "auto",
}}
    >
      <div
        className="main-header"
        style={{
          height: "100%",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* LEFT */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <a href="#" style={{ fontSize: "20px", color: "#667085" }}>
            <i className="ti ti-arrow-bar-to-left"></i>
          </a>

          {/* Search */}
          <div
            style={{
              width: "220px",
              height: "34px",
              border: "1px solid #d0d5dd",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              padding: "0 10px",
              background: "#f9fafb",
              position: "relative",
            }}
          >
            <i className="ti ti-search" style={{ color: "#98a2b3" }}></i>

            <input
              type="text"
              placeholder="Search in HRMS"
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                marginLeft: "6px",
                flex: 1,
                fontSize: "12px",
              }}
            />

            <span
              style={{
                position: "absolute",
                right: "6px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "10px",
                fontWeight: 600,
                color: "#667085",
                background: "#fff",
                border: "1px solid #d0d5dd",
                borderRadius: "6px",
                padding: "2px 6px",
              }}
            >
              CTRL + /
            </span>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          {/* Notification */}
          <i className="ti ti-bell" style={{ fontSize: "20px", color: "#667085" }}></i>

          {/* PROFILE */}
<div
  ref={dropdownRef}
  style={{ position: "relative" }}
>
              <img
              src={avatar27}
              alt=""
              onClick={() => setOpen(!open)}
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                cursor: "pointer",
                border: "2px solid #f2f4f7",
              }}
            />

            {/* DROPDOWN */}
            {open && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "45px",
                  width: "220px",
                  background: "#fff",
                  border: "1px solid #eaecf0",
                  borderRadius: "10px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                  padding: "10px",
                  zIndex: 9999,
                }}
              >
                <div style={{ padding: "8px" }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: "14px",
                      color: "#101828",
                    }}
                  >
                    Anjali Verma
                  </div>

                  <div
                    style={{
                      fontSize: "12px",
                      color: "#667085",
                      marginTop: "2px",
                    }}
                  >
                    anjali.verma@company.com
                  </div>
                </div>

                <hr style={{ border: "none", borderTop: "1px solid #eaecf0" }} />

               
                {/* My Profile */}
<div
  onClick={() => {
    setOpen(false);
    navigate("/Admin/Profile");
  }}
  
  style={{
    padding: "10px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    color: "#344054",
    background: "#f2f4f7",
    borderRadius: "6px",
    marginTop: "6px",
  }}
>
  My Profile
</div>

{/* Logout */}
<div
  onClick={handleLogout}
  style={{
    padding: "10px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    color: "#d92d20",
    background: "#fef3f2",
    borderRadius: "6px",
    marginTop: "6px",
  }}
>
  Logout
</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
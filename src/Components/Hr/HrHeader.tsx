import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// import logo from "../../assets/img/logo.webp";
import avatar27 from "../../assets/img/profiles/avatar-27.jpg";

const HrHeader = () => {
  const [open, setOpen] = useState(false);

const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();


  const [notificationOpen, setNotificationOpen] = useState(false);

const notificationRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Node;

    // Profile dropdown close
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(target)
    ) {
      setOpen(false);
    }

    // Notification dropdown close
    if (
      notificationRef.current &&
      !notificationRef.current.contains(target)
    ) {
      setNotificationOpen(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  const handleLogout = () => {
    setOpen(false);
    navigate("/HR/HrLogin");
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
        marginLeft: "260px",
        width: "calc(100% - 260px)",
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
          <div
  ref={notificationRef}
  style={{ position: "relative" }}
>
  <i
    className="ti ti-bell"
    onClick={() => setNotificationOpen(!notificationOpen)}
    style={{
      fontSize: "20px",
      color: "#667085",
      cursor: "pointer",
    }}
  ></i>

  {notificationOpen && (
    <div
      style={{
        position: "absolute",
        top: "40px",
        right: 0,
        width: "400px",
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        border: "1px solid #EAECF0",
        zIndex: 9999,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #EAECF0",
        }}
      >
        <div
          style={{
            fontSize: "20px",
            fontWeight: 600,
            color: "#101828",
          }}
        >
          Notifications (2)
        </div>

        <div
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
          }}
        >
          <span
            style={{
              color: "#C1953A",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: "14px",
            }}
          >
            Mark all as read
          </span>

          <span
            style={{
              color: "#667085",
              fontSize: "14px",
            }}
          >
            Today
          </span>
        </div>
      </div>

      {/* Notification List */}
      <div
        style={{
          maxHeight: "300px",
          overflowY: "auto",
        }}
      >
        {/* Item 1 */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            padding: "16px",
            borderBottom: "1px solid #EAECF0",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              background: "#D0D5DD",
              borderRadius: "4px",
            }}
          />

          <div>
            <div>
              <b>Shawn</b> performance in Math is below the threshold.
            </div>

            <div
              style={{
                color: "#667085",
                marginTop: "4px",
              }}
            >
              Just Now
            </div>
          </div>
        </div>

        {/* Item 2 */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            padding: "16px",
            borderBottom: "1px solid #EAECF0",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              background: "#D0D5DD",
              borderRadius: "4px",
            }}
          />

          <div style={{ flex: 1 }}>
            <div>
              <b>Sylvia</b> added appointment on 02:00 PM
            </div>

            <div
              style={{
                color: "#667085",
                marginTop: "4px",
              }}
            >
              10 mins ago
            </div>

            <div
              style={{
                marginTop: "10px",
                display: "flex",
                gap: "8px",
              }}
            >
              <button
                style={{
                  border: "none",
                  background: "#F2F4F7",
                  padding: "6px 14px",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Deny
              </button>

              <button
                style={{
                  border: "none",
                  background: "#C1953A",
                  color: "#fff",
                  padding: "6px 14px",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Approve
              </button>
            </div>
          </div>
        </div>

        {/* Item 3 */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            padding: "16px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              background: "#D0D5DD",
              borderRadius: "4px",
            }}
          />

          <div>
            <div>
              New student record <b>George</b> is created by <b>Teressa</b>
            </div>

            <div
              style={{
                color: "#667085",
                marginTop: "4px",
              }}
            >
              2 hrs ago
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: "1px solid #EAECF0",
          padding: "16px",
          display: "flex",
          gap: "12px",
        }}
      >
        <button
          onClick={() => setNotificationOpen(false)}
          style={{
            flex: 1,
            padding: "12px",
            border: "1px solid #D0D5DD",
            background: "#fff",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>

        <button
          style={{
            flex: 1,
            padding: "12px",
            border: "none",
            background: "#C1953A",
            color: "#fff",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          View All
        </button>
      </div>
    </div>
  )}
</div>
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
    navigate("/HR/Profilee");
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

export default HrHeader;
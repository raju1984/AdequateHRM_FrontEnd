import React, { useEffect, useRef, useState } from "react";
import {
  Eye,
  EyeOff,
  Home,
  Image as ImageIcon,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  getEmployeeProfile,
  updateEmployeeProfile,
} from "../../services/hrservices";

interface ProfileForm {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  state: string;
  city: string;
  postalCode: string;
}

const GOLD = "#c49332";
const PAGE_BG = "#f7f8fa";
const TEXT_DARK = "#14213d";
const TEXT_MUTED = "#667085";
const BORDER = "#e1e5eb";

const Profilee: React.FC = () => {
  const token = localStorage.getItem("token") || "";
  const userId = localStorage.getItem("userId") || "";

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [collapsed, setCollapsed] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profileImage, setProfileImage] = useState<string>("");

  const [form, setForm] = useState<ProfileForm>({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    country: "",
    state: "",
    city: "",
    postalCode: "",
  });

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getEmployeeProfile(userId, token);

      setForm({
        id: data.id || "",
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        country: data.country || "",
        state: data.state || "",
        city: data.city || "",
        postalCode: data.postalCode || "",
      });
    } catch (error) {
      console.error("Profile fetch error =>", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      if (newPassword && newPassword !== confirmPassword) {
        alert("New password and confirm password do not match");
        return;
      }

      const response = await updateEmployeeProfile(form, token);

      console.log("Update Response =>", response);

      alert("Profile updated successfully");
    } catch (error) {
      console.error("Update Error =>", error);
      alert("Failed to update profile");
    }
  };

  const handleCancel = () => {
    fetchProfile();

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const url = URL.createObjectURL(file);
    setProfileImage(url);
  };

  const handleImageCancel = () => {
    setProfileImage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: PAGE_BG,
        padding: "24px",
        boxSizing: "border-box",
        fontFamily:
          "'Inter', 'Nunito Sans', 'Segoe UI', Arial, sans-serif",
        color: TEXT_DARK,
      }}
    >
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 26,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 24,
              lineHeight: "30px",
              fontWeight: 700,
              color: "#14213d",
              letterSpacing: "-0.3px",
            }}
          >
            Profile
          </h1>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 8,
              fontSize: 12,
            }}
          >
            <NavLink
              to="/Hr/HrDashboard"
              style={{
                textDecoration: "none",
                display: "inline-flex",
                color: "#52647b",
              }}
            >
              <Home size={12} strokeWidth={1.7} />
            </NavLink>

            <span
              style={{
                color: "#b5bdc8",
              }}
            >
              /
            </span>

            <span
              style={{
                color: "#1c2940",
                fontWeight: 500,
              }}
            >
              Profile
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          style={{
            width: 39,
            height: 39,
            border: `1px solid ${BORDER}`,
            borderRadius: 6,
            background: "#ffffff",
            color: "#15223a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          {collapsed ? (
            <ChevronDown size={15} />
          ) : (
            <ChevronUp size={15} />
          )}
        </button>
      </div>

      {!collapsed && (
        <div
          style={{
            background: "#ffffff",
            border: `1px solid ${BORDER}`,
            borderRadius: 6,
            boxShadow: "0 1px 2px rgba(16,24,40,0.03)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "19px 20px 20px",
            }}
          >
            {/* =================================================
                CARD TITLE
            ================================================== */}

            <div
              style={{
                paddingBottom: 16,
                borderBottom: `1px solid ${BORDER}`,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 600,
                  color: TEXT_DARK,
                }}
              >
                Profile
              </h2>
            </div>

            {/* =================================================
                BASIC INFORMATION
            ================================================== */}

            <section
              style={{
                paddingTop: 16,
                paddingBottom: 16,
                borderBottom: `1px solid ${BORDER}`,
              }}
            >
              <h3
                style={{
                  margin: "0 0 17px",
                  fontSize: 13,
                  lineHeight: "18px",
                  fontWeight: 600,
                  color: "#11203b",
                }}
              >
                Basic Information
              </h3>

              {/* PROFILE PHOTO */}

              <div
                style={{
                  minHeight: 114,
                  background: "#f8f9fb",
                  borderRadius: 5,
                  padding: "16px",
                  boxSizing: "border-box",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 23,
                }}
              >
                <div
                  style={{
                    width: 80,
                    height: 80,
                    minWidth: 80,
                    borderRadius: "50%",
                    border: "1px dashed #d9dee6",
                    background: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <ImageIcon
                      size={16}
                      strokeWidth={1.5}
                      color="#c4cbd5"
                    />
                  )}
                </div>

                <div>
                  <div
                    style={{
                      color: "#12203c",
                      fontSize: 13,
                      fontWeight: 600,
                      marginBottom: 6,
                    }}
                  >
                    Profile Photo
                  </div>

                  <div
                    style={{
                      color: "#7b8494",
                      fontSize: 11,
                      marginBottom: 10,
                    }}
                  >
                    Recommended image size is 40px x 40px
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 15,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        minWidth: 56,
                        height: 28,
                        border: "none",
                        borderRadius: 5,
                        padding: "0 10px",
                        background: GOLD,
                        color: "#ffffff",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Upload
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleImageChange}
                    />

                    <button
                      type="button"
                      onClick={handleImageCancel}
                      style={{
                        border: "none",
                        background: "transparent",
                        padding: 0,
                        color: "#111827",
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>

              {/* FIRST/LAST NAME */}

              <TwoColumnRow>
                <FormField
                  label="First Name"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                />

                <FormField
                  label="Last Name"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                />
              </TwoColumnRow>

              {/* EMAIL / PHONE */}

              <TwoColumnRow>
                <FormField
                  label="Email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                />

                <FormField
                  label="Phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                />
              </TwoColumnRow>
            </section>

            {/* =================================================
                ADDRESS INFORMATION
            ================================================== */}

            <section
              style={{
                paddingTop: 15,
                paddingBottom: 16,
                borderBottom: `1px solid ${BORDER}`,
              }}
            >
              <h3
                style={{
                  margin: "0 0 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#11203b",
                }}
              >
                Address Information
              </h3>

              {/* ADDRESS FULL WIDTH */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "150px 1fr",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <label style={labelStyle}>Address</label>

                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              {/* COUNTRY / STATE */}

              <TwoColumnRow>
                <SelectField
                  label="Country"
                  name="country"
                  value={form.country}
                  options={[
                    "USA",
                    "Canada",
                    "Germany",
                    "France",
                    "India",
                  ]}
                  onChange={handleChange}
                />

                <SelectField
                  label="State"
                  name="state"
                  value={form.state}
                  options={[
                    "California",
                    "New York",
                    "Texas",
                    "Florida",
                    "Gujarat",
                    "Maharashtra",
                  ]}
                  onChange={handleChange}
                />
              </TwoColumnRow>

              {/* CITY / POSTAL CODE */}

              <TwoColumnRow>
                <SelectField
                  label="City"
                  name="city"
                  value={form.city}
                  options={[
                    "Los Angeles",
                    "San Diego",
                    "Fresno",
                    "San Francisco",
                    "Ahmedabad",
                    "Surat",
                    "Mumbai",
                  ]}
                  onChange={handleChange}
                />

                <FormField
                  label="Postal Code"
                  name="postalCode"
                  value={form.postalCode}
                  onChange={handleChange}
                />
              </TwoColumnRow>
            </section>

            {/* =================================================
                CHANGE PASSWORD
            ================================================== */}

            <section
              style={{
                paddingTop: 15,
                paddingBottom: 16,
                borderBottom: `1px solid ${BORDER}`,
              }}
            >
              <h3
                style={{
                  margin: "0 0 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#11203b",
                }}
              >
                Change Password
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr 1fr",
                  gap: 23,
                }}
              >
                <PasswordField
                  label="Current Password"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                  show={showCurrent}
                  setShow={setShowCurrent}
                />

                <PasswordField
                  label="New Password"
                  value={newPassword}
                  onChange={setNewPassword}
                  show={showNew}
                  setShow={setShowNew}
                />

                <PasswordField
                  label="Confirm Password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  show={showConfirm}
                  setShow={setShowConfirm}
                />
              </div>
            </section>

            {/* =================================================
                ACTION BUTTONS
            ================================================== */}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 16,
                paddingTop: 16,
              }}
            >
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  height: 39,
                  minWidth: 72,
                  padding: "0 14px",
                  background: "#ffffff",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 5,
                  color: "#26344e",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                style={{
                  height: 39,
                  minWidth: 60,
                  padding: "0 14px",
                  background: GOLD,
                  border: "none",
                  borderRadius: 5,
                  color: "#ffffff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================
   TWO COLUMN ROW
============================================================ */

const TwoColumnRow = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        columnGap: 24,
        marginBottom: 16,
      }}
    >
      {children}
    </div>
  );
};

/* ============================================================
   NORMAL INPUT
============================================================ */

interface FormFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => void;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  value,
  onChange,
}) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "150px 1fr",
        alignItems: "center",
      }}
    >
      <label style={labelStyle}>{label}</label>

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        style={inputStyle}
      />
    </div>
  );
};

/* ============================================================
   SELECT FIELD
============================================================ */

interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  options: string[];
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => void;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  name,
  value,
  options,
  onChange,
}) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "150px 1fr",
        alignItems: "center",
      }}
    >
      <label style={labelStyle}>{label}</label>

      <div
        style={{
          position: "relative",
        }}
      >
        <select
          name={name}
          value={value}
          onChange={onChange}
          style={{
            ...inputStyle,
            paddingRight: 36,
            appearance: "none",
            WebkitAppearance: "none",
            cursor: "pointer",
          }}
        >
          <option value="">Select</option>

          {options.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>

        <ChevronDown
          size={14}
          strokeWidth={1.7}
          color="#526176"
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
};

/* ============================================================
   PASSWORD FIELD
============================================================ */

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  setShow: React.Dispatch<
    React.SetStateAction<boolean>
  >;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  value,
  onChange,
  show,
  setShow,
}) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "145px 1fr",
        alignItems: "center",
        minWidth: 0,
      }}
    >
      <label
        style={{
          ...labelStyle,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </label>

      <div
        style={{
          position: "relative",
          minWidth: 0,
        }}
      >
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            ...inputStyle,
            paddingRight: 38,
          }}
        />

        <button
          type="button"
          onClick={() => setShow((prev) => !prev)}
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            border: "none",
            background: "transparent",
            padding: 0,
            margin: 0,
            color: "#101b30",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {show ? (
            <Eye size={17} strokeWidth={1.8} />
          ) : (
            <EyeOff size={17} strokeWidth={1.8} />
          )}
        </button>
      </div>
    </div>
  );
};

/* ============================================================
   COMMON STYLES
============================================================ */

const labelStyle: React.CSSProperties = {
  margin: 0,
  color: "#12203c",
  fontSize: 13,
  lineHeight: "18px",
  fontWeight: 400,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 38,
  padding: "0 10px",  
  boxSizing: "border-box",
  border: `1px solid ${BORDER}`,
  borderRadius: 5,
  outline: "none",
  background: "#ffffff",
  color: "#26344e",
  fontSize: 13,
  fontFamily:
    "'Inter', 'Nunito Sans', 'Segoe UI', Arial, sans-serif",
};

export default Profilee;
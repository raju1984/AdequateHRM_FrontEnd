import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Camera, Eye, EyeOff, Home } from "lucide-react";
import { getEmployeeProfile, updateEmployeeProfile,} from "../../services/employeservices";

  const Profiles: React.FC = () => {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [profile, setProfile] = useState<any>(null);

  const [form, setForm] = useState({
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
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});
  useEffect(() => {
    const fetchProfile = async () => {
      const id = localStorage.getItem("userId") || "";
      const token = localStorage.getItem("token") || "";

      try {
        const res = await getEmployeeProfile(id, token);
        setProfile(res);
setForm({
  id: res.id || "",

  firstName: res.firstName || "",
  lastName: res.lastName || "",
  email: res.email || "",
  phone: res.phoneNumber || "",
  address: res.address || "",
  country: res.country || "",
  state: res.state || "",
  city: res.city || "",
  postalCode: res.postalCode || "",
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});
      } catch (err) {
        console.log(err);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
  const token = localStorage.getItem("token") || "";

  try {
    await updateEmployeeProfile(form, token);
    alert("Profile Updated");
  } catch (err) {
    console.log(err);
  }
};

	

  return (
    <div
      style={{
        background: "#f4f6f9",
        minHeight: "100vh",
        fontFamily: "sans-serif",
        fontSize: 13,
        padding: 24,
      }}
    >
      <div>
        {/* BREADCRUMB */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2
              style={{
                fontSize: 31,
                fontWeight: 700,
                color: "#111827",
                marginBottom: 6,
              }}
            >
              Profile
            </h2>

            <div
  className="d-flex align-items-center gap-2"
  style={{
    color: "#6b7280",
    fontSize: 15,
  }}
>
  <Link to="/Employee/EmployeDashboard">
    <Home size={15} />
  </Link> / <span>Profile</span>
</div>
          </div>
        </div>

        {/* CARD */}
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            border: "1px solid #e5e7eb",
          }}
        >
          <div style={{ padding: 24 }}>
            <div
              style={{
                borderBottom: "1px solid #eceff3",
                paddingBottom: 16,
                marginBottom: 20,
              }}
            >
              <h4
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  marginBottom: 0,
                  color: "#111827",
                }}
              >
                Profile
              </h4>
            </div>

            {/* BASIC INFO */}
            <div
              style={{
                borderBottom: "1px solid #eceff3",
                marginBottom: 20,
                paddingBottom: 20,
              }}
            >
              <h6
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  marginBottom: 18,
                  color: "#111827",
                }}
              >
                Basic Information
              </h6>

              {/* PHOTO */}
              <div
                className="d-flex align-items-center flex-wrap"
                style={{
                  background: "#f9fafb",
                  borderRadius: 10,
                  padding: 18,
                  marginBottom: 25,
                  gap: 15,
                }}
              >
                <div
                  style={{
                    width: 88,
                    height: 88,
                    borderRadius: "50%",
                    border: "2px dashed #d1d5db",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#fff",
                  }}
                >
                  <Camera size={20} color="#9ca3af" />
                </div>

                <div>
                  <h6
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      marginBottom: 4,
                    }}
                  >
                    Profile Photo
                  </h6>

                  <p
                    style={{
                      fontSize: 11,
                      color: "#6b7280",
                      marginBottom: 12,
                    }}
                  >
                    Recommended image size is 40px x 40px
                  </p>

                  <div className="d-flex gap-2">
                    <label
                      style={{
                        background: "#b88a2f",
                        color: "#fff",
                        borderRadius: 6,
                        padding: "7px 16px",
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      Upload

                      <input type="file" hidden />
                    </label>

                    <button
                      style={{
                        background: "#fff",
                        border: "1px solid #d1d5db",
                        borderRadius: 6,
                        padding: "7px 16px",
                        fontSize: 12,
                        color: "#374151",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>

              {/* FORM */}
             <div className="row">
  <FormInput
    label="First Name"
    value={form.firstName}
    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
  setForm({ ...form, firstName: e.target.value })
}
  />

  <FormInput
    label="Last Name"
    value={form.lastName}
    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
  setForm({ ...form, lastName: e.target.value })
}
  />

  <FormInput
    label="Email"
    value={form.email}
   onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
  setForm({ ...form, email: e.target.value })
}
  />

  <FormInput
    label="Phone"
    value={form.phone}
   onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
  setForm({ ...form, phone: e.target.value })
}
  />
</div>
            </div>

            {/* ADDRESS */}
            <div
              style={{
                borderBottom: "1px solid #eceff3",
                marginBottom: 20,
                paddingBottom: 20,
              }}
            >
              <h6
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  marginBottom: 18,
                  color: "#111827",
                }}
              >
                Address Information
              </h6>

              <div className="row">
                <div className="col-md-12 mb-3">
  <div className="row align-items-center">
    
    <div className="col-md-2">
      <label style={{ fontSize: 13, color: "#374151" }}>
        Address
      </label>
    </div>

    <div className="col-md-10">
      <input
        type="text"
        className="form-control"
        style={{
          height: 42,
          fontSize: 13,
          borderRadius: 8,
        }}
        value={form.address}
        onChange={(e) =>
          setForm({ ...form, address: e.target.value })
        }
      />
    </div>

  </div>
</div>

               <SelectField
  label="Country"
  value={form.country}
  onChange={(e: any) =>
    setForm({ ...form, country: e.target.value })
  }
  options={["USA", "Canada", "Germany", "France"]}
/>

                <SelectField
  label="State"
  value={form.state}
  onChange={(e: any) =>
    setForm({ ...form, state: e.target.value })
  }
  options={["California", "New York", "Texas", "Florida"]}
/>

              <SelectField
  label="City"
  value={form.city}
  onChange={(e: any) =>
    setForm({ ...form, city: e.target.value })
  }
  options={["Los Angeles", "San Diego", "Fresno", "San Francisco"]}
/>


<FormInput
  label="Postal Code"
  value={form.postalCode}
  onChange={(e: any) =>
    setForm({ ...form, postalCode: e.target.value })
  }
/>              </div>
            </div>

            {/* PASSWORD */}
            <div
              style={{
                borderBottom: "1px solid #eceff3",
                marginBottom: 22,
                paddingBottom: 20,
              }}
            >
              <h6
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  marginBottom: 18,
                  color: "#111827",
                }}
              >
                Change Password
              </h6>

              <PasswordField
                label="Current Password"
                show={showCurrent}
                setShow={setShowCurrent}
              />

              <PasswordField
                label="New Password"
                show={showNew}
                setShow={setShowNew}
              />

              <PasswordField
                label="Confirm Password"
                show={showConfirm}
                setShow={setShowConfirm}
              />
            </div>

            {/* BUTTONS */}
            <div className="d-flex justify-content-end gap-3">
              <button
                style={{
                  height: 40,
                  padding: "0 18px",
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                  background: "#fff",
                  fontSize: 13,
                  color: "#374151",
                  fontWeight: 500,
                }}
              >
                Cancel
              </button>

              <button
  onClick={handleSave}
  style={{
    height: 40,
    padding: "0 18px",
    borderRadius: 8,
    border: "none",
    background: "#b88a2f",
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
  }}
>
  Save
</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FormInput = ({
  label,
  value,
  onChange,
}: any) => {
  return (
    <div className="col-md-6 mb-3">
      <div className="row align-items-center">
        <div className="col-md-4">
          <label style={{ fontSize: 13, color: "#374151" }}>
            {label}
          </label>
        </div>

        <div className="col-md-8">
          <input
            type="text"
            className="form-control"
            style={{
              height: 42,
              borderRadius: 8,
              fontSize: 13,
            }}
            value={value}
            onChange={onChange}
          />
        </div>
      </div>
    </div>
  );
};
const SelectField = ({
  label,
  value,
  onChange,
  options,
}: any) => {
  return (
    <div className="col-md-6 mb-3">
      <div className="row align-items-center">
        <div className="col-md-4">
          <label style={{ fontSize: 13 }}>
            {label}
          </label>
        </div>

        <div className="col-md-8">
          <select
            className="form-select"
            style={{
              height: 42,
              borderRadius: 8,
              fontSize: 13,
            }}
            value={value}
            onChange={onChange}
          >
            <option value="">Select</option>

            {options.map((item: any, i: number) => (
              <option key={i} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

const PasswordField = ({
  label,
  show,
  setShow,
}: {
  label: string;
  show: boolean;
  setShow: React.Dispatch<
    React.SetStateAction<boolean>
  >;
}) => {
  return (
    <div className="row align-items-center mb-3">
      <div className="col-md-2">
        <label
          style={{
            fontSize: 13,
            color: "#374151",
          }}
        >
          {label}
        </label>
      </div>

      <div className="col-md-4">
        <div style={{ position: "relative" }}>
          <input
            type={show ? "text" : "password"}
            className="form-control"
            style={{
              height: 42,
              borderRadius: 8,
              fontSize: 13,
              paddingRight: 40,
            }}
          />

          <div
            onClick={() => setShow(!show)}
            style={{
              position: "absolute",
              right: 12,
              top: 11,
              cursor: "pointer",
              color: "#6b7280",
            }}
          >
            {show ? (
              <Eye size={16} />
            ) : (
              <EyeOff size={16} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profiles;
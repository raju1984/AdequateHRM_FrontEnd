
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Camera,
  Eye,
  EyeOff,
  Home,
  X,
} from "lucide-react";

import {
  getEmployeeProfile,
  updateEmployeeProfile,
} from "../../services/employeservices";

// =====================================================
// TYPES
// =====================================================

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
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  profilePicture: File | null;
}

// =====================================================
// PROFILE COMPONENT
// =====================================================

const Profiles: React.FC = () => {
  // ===================================================
  // PASSWORD VISIBILITY
  // ===================================================

  const [showCurrent, setShowCurrent] =
    useState(false);

  const [showNew, setShowNew] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  // ===================================================
  // PROFILE DATA
  // ===================================================

  const [profile, setProfile] =
    useState<any>(null);

  // ===================================================
  // LOADING STATES
  // ===================================================

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  // ===================================================
  // PROFILE IMAGE PREVIEW
  // ===================================================

  const [imagePreview, setImagePreview] =
    useState<string>("");

  // ===================================================
  // FORM
  // ===================================================

  const [form, setForm] =
    useState<ProfileForm>({
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
      profilePicture: null,
    });

  // ===================================================
  // GET PROFILE
  // ===================================================

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token =
      localStorage.getItem("token") || "";

    if (!token) {
      alert(
        "Authentication token is missing. Please login again."
      );
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const res =
        await getEmployeeProfile(token);

      console.log(
        "PROFILE API RESPONSE:",
        res
      );

      setProfile(res);

      // -----------------------------------------------
      // SUPPORT BOTH camelCase AND PascalCase RESPONSE
      // -----------------------------------------------

      setForm({
        id: res?.id || res?.Id || "",

        firstName:
          res?.firstName ||
          res?.FirstName ||
          "",

        lastName:
          res?.lastName ||
          res?.LastName ||
          "",

        email:
          res?.email ||
          res?.Email ||
          "",

        phone:
          res?.phone ||
          res?.Phone ||
          res?.phoneNumber ||
          res?.PhoneNumber ||
          "",

        address:
          res?.address ||
          res?.Address ||
          "",

        country:
          res?.country ||
          res?.Country ||
          "",

        state:
          res?.state ||
          res?.State ||
          "",

        city:
          res?.city ||
          res?.City ||
          "",

        postalCode:
          res?.postalCode ||
          res?.PostalCode ||
          "",

        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        profilePicture: null,
      });

      // -----------------------------------------------
      // PROFILE IMAGE
      // -----------------------------------------------

      const profileImage =
        res?.profilePicture ||
        res?.ProfilePicture ||
        res?.profilePictureUrl ||
        res?.ProfilePictureUrl ||
        res?.image ||
        res?.Image ||
        "";

      if (profileImage) {
        setImagePreview(profileImage);
      }
    } catch (error: any) {
      console.error(
        "GET PROFILE ERROR:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Failed to load profile."
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // INPUT CHANGE
  // ===================================================

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ===================================================
  // PROFILE IMAGE CHANGE
  // ===================================================

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    // -----------------------------------------------
    // IMAGE TYPE VALIDATION
    // -----------------------------------------------

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    // -----------------------------------------------
    // 4 MB SIZE VALIDATION
    // -----------------------------------------------

    if (file.size > 4 * 1024 * 1024) {
      alert(
        "Profile image size must be less than 4 MB."
      );
      return;
    }

    setForm((prev) => ({
      ...prev,
      profilePicture: file,
    }));

    // -----------------------------------------------
    // PREVIEW
    // -----------------------------------------------

    const previewUrl =
      URL.createObjectURL(file);

    setImagePreview(previewUrl);
  };

  // ===================================================
  // REMOVE IMAGE
  // ===================================================

  const handleRemoveImage = () => {
    setForm((prev) => ({
      ...prev,
      profilePicture: null,
    }));

    setImagePreview("");
  };

  // ===================================================
  // CANCEL / RESET
  // ===================================================

  const handleCancel = () => {
    if (!profile) {
      return;
    }

    setForm({
      id:
        profile?.id ||
        profile?.Id ||
        "",

      firstName:
        profile?.firstName ||
        profile?.FirstName ||
        "",

      lastName:
        profile?.lastName ||
        profile?.LastName ||
        "",

      email:
        profile?.email ||
        profile?.Email ||
        "",

      phone:
        profile?.phone ||
        profile?.Phone ||
        profile?.phoneNumber ||
        profile?.PhoneNumber ||
        "",

      address:
        profile?.address ||
        profile?.Address ||
        "",

      country:
        profile?.country ||
        profile?.Country ||
        "",

      state:
        profile?.state ||
        profile?.State ||
        "",

      city:
        profile?.city ||
        profile?.City ||
        "",

      postalCode:
        profile?.postalCode ||
        profile?.PostalCode ||
        "",

      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      profilePicture: null,
    });

    const profileImage =
      profile?.profilePicture ||
      profile?.ProfilePicture ||
      profile?.profilePictureUrl ||
      profile?.ProfilePictureUrl ||
      profile?.image ||
      profile?.Image ||
      "";

    setImagePreview(profileImage || "");

    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  // ===================================================
  // SAVE PROFILE
  // ===================================================

  const handleSave = async () => {
    const token =
      localStorage.getItem("token") || "";

    if (!token) {
      alert(
        "Authentication token is missing. Please login again."
      );
      return;
    }

    // -----------------------------------------------
    // PASSWORD VALIDATION
    // -----------------------------------------------

    if (
      form.newPassword &&
      form.newPassword !== form.confirmPassword
    ) {
      alert(
        "New Password and Confirm Password do not match."
      );
      return;
    }

    // -----------------------------------------------
    // CURRENT PASSWORD REQUIRED IF CHANGING PASSWORD
    // -----------------------------------------------

    if (
      form.newPassword &&
      !form.currentPassword
    ) {
      alert(
        "Please enter your current password."
      );
      return;
    }

    try {
      setSaving(true);

      console.log(
        "UPDATE PROFILE FORM:",
        form
      );

      const response =
        await updateEmployeeProfile(
          form,
          token
        );

      console.log(
        "UPDATE PROFILE RESPONSE:",
        response
      );

      alert(
        response?.message ||
          "Profile Updated Successfully"
      );

      // ---------------------------------------------
      // CLEAR PASSWORD FIELDS
      // ---------------------------------------------

      setForm((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        profilePicture: null,
      }));

      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);

      // ---------------------------------------------
      // REFRESH PROFILE
      // ---------------------------------------------

      await fetchProfile();
    } catch (error: any) {
      console.error(
        "UPDATE PROFILE ERROR:",
        error
      );

      console.error(
        "UPDATE PROFILE RESPONSE:",
        error?.response?.data
      );

      alert(
        error?.response?.data?.message ||
          error?.response?.data?.Message ||
          "Profile update failed."
      );
    } finally {
      setSaving(false);
    }
  };

  // ===================================================
  // LOADING SCREEN
  // ===================================================

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f4f6f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            background: "#fff",
            padding: "25px 35px",
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            color: "#374151",
            fontSize: 14,
          }}
        >
          Loading profile...
        </div>
      </div>
    );
  }

  // ===================================================
  // UI
  // ===================================================

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
        {/* =================================================
            BREADCRUMB
        ================================================= */}

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
              <Link
                to="/Employee/EmployeDashboard"
                style={{
                  color: "#6b7280",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Home size={15} />
              </Link>

              <span>/</span>

              <span>Profile</span>
            </div>
          </div>
        </div>

        {/* =================================================
            MAIN CARD
        ================================================= */}

        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            border: "1px solid #e5e7eb",
          }}
        >
          <div style={{ padding: 24 }}>
            {/* =================================================
                PROFILE HEADER
            ================================================= */}

            <div
              style={{
                borderBottom:
                  "1px solid #eceff3",
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

            {/* =================================================
                BASIC INFORMATION
            ================================================= */}

            <div
              style={{
                borderBottom:
                  "1px solid #eceff3",
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

              {/* =================================================
                  PROFILE PHOTO
              ================================================= */}

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
                {/* IMAGE */}

                <div
                  style={{
                    width: 88,
                    height: 88,
                    borderRadius: "50%",
                    border:
                      "2px dashed #d1d5db",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#fff",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <Camera
                      size={20}
                      color="#9ca3af"
                    />
                  )}
                </div>

                {/* IMAGE ACTIONS */}

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
                    Recommended image size is
                    40px x 40px
                  </p>

                  <div className="d-flex gap-2">
                    {/* UPLOAD */}

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

                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={
                          handleImageChange
                        }
                      />
                    </label>

                    {/* REMOVE */}

                    {imagePreview && (
                      <button
                        type="button"
                        onClick={
                          handleRemoveImage
                        }
                        style={{
                          background: "#fff",
                          border:
                            "1px solid #d1d5db",
                          borderRadius: 6,
                          padding: "7px 16px",
                          fontSize: 12,
                          color: "#374151",
                          cursor: "pointer",
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* =================================================
                  BASIC FORM
              ================================================= */}

              <div className="row">
                <FormInput
                  label="First Name"
                  name="firstName"
                  value={form.firstName}
                  onChange={
                    handleInputChange
                  }
                />

                <FormInput
                  label="Last Name"
                  name="lastName"
                  value={form.lastName}
                  onChange={
                    handleInputChange
                  }
                />

                <FormInput
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={
                    handleInputChange
                  }
                />

                <FormInput
                  label="Phone"
                  name="phone"
                  value={form.phone}
                  onChange={
                    handleInputChange
                  }
                />
              </div>
            </div>

            {/* =================================================
                ADDRESS INFORMATION
            ================================================= */}

            <div
              style={{
                borderBottom:
                  "1px solid #eceff3",
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
                {/* ADDRESS */}

                <div className="col-md-12 mb-3">
                  <div className="row align-items-center">
                    <div className="col-md-2">
                      <label
                        style={{
                          fontSize: 13,
                          color: "#374151",
                        }}
                      >
                        Address
                      </label>
                    </div>

                    <div className="col-md-10">
                      <input
                        type="text"
                        name="address"
                        className="form-control"
                        style={{
                          height: 42,
                          fontSize: 13,
                          borderRadius: 8,
                        }}
                        value={form.address}
                        onChange={
                          handleInputChange
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* COUNTRY */}

                <SelectField
                  label="Country"
                  name="country"
                  value={form.country}
                  onChange={
                    handleInputChange
                  }
                  options={[
                    "USA",
                    "Canada",
                    "Germany",
                    "France",
                    "India",
                    "United Kingdom",
                  ]}
                />

                {/* STATE */}

                <SelectField
                  label="State"
                  name="state"
                  value={form.state}
                  onChange={
                    handleInputChange
                  }
                  options={[
                    "California",
                    "New York",
                    "Texas",
                    "Florida",
                    "Delhi",
                    "Maharashtra",
                    "Karnataka",
                    "Uttar Pradesh",
                  ]}
                />

                {/* CITY */}

                <SelectField
                  label="City"
                  name="city"
                  value={form.city}
                  onChange={
                    handleInputChange
                  }
                  options={[
                    "Los Angeles",
                    "San Diego",
                    "Fresno",
                    "San Francisco",
                    "Delhi",
                    "Mumbai",
                    "Bangalore",
                    "Lucknow",
                  ]}
                />

                {/* POSTAL CODE */}

                <FormInput
                  label="Postal Code"
                  name="postalCode"
                  value={form.postalCode}
                  onChange={
                    handleInputChange
                  }
                />
              </div>
            </div>

            {/* =================================================
                PASSWORD
            ================================================= */}

            <div
              style={{
                borderBottom:
                  "1px solid #eceff3",
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
                name="currentPassword"
                value={
                  form.currentPassword
                }
                onChange={
                  handleInputChange
                }
                show={showCurrent}
                setShow={
                  setShowCurrent
                }
              />

              <PasswordField
                label="New Password"
                name="newPassword"
                value={form.newPassword}
                onChange={
                  handleInputChange
                }
                show={showNew}
                setShow={setShowNew}
              />

              <PasswordField
                label="Confirm Password"
                name="confirmPassword"
                value={
                  form.confirmPassword
                }
                onChange={
                  handleInputChange
                }
                show={showConfirm}
                setShow={
                  setShowConfirm
                }
              />
            </div>

            {/* =================================================
                BUTTONS
            ================================================= */}

            <div className="d-flex justify-content-end gap-3">
              {/* CANCEL */}

              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                style={{
                  height: 40,
                  padding: "0 18px",
                  borderRadius: 8,
                  border:
                    "1px solid #d1d5db",
                  background: "#fff",
                  fontSize: 13,
                  color: "#374151",
                  fontWeight: 500,
                  cursor: saving
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                Cancel
              </button>

              {/* SAVE */}

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                style={{
                  height: 40,
                  padding: "0 18px",
                  borderRadius: 8,
                  border: "none",
                  background: saving
                    ? "#c9ad72"
                    : "#b88a2f",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: saving
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                {saving
                  ? "Saving..."
                  : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =====================================================
// FORM INPUT
// =====================================================

interface FormInputProps {
  label: string;
  name: string;
  value: string;
  type?: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
}

const FormInput: React.FC<
  FormInputProps
> = ({
  label,
  name,
  value,
  type = "text",
  onChange,
}) => {
  return (
    <div className="col-md-6 mb-3">
      <div className="row align-items-center">
        <div className="col-md-4">
          <label
            style={{
              fontSize: 13,
              color: "#374151",
            }}
          >
            {label}
          </label>
        </div>

        <div className="col-md-8">
          <input
            type={type}
            name={name}
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

// =====================================================
// SELECT FIELD
// =====================================================

interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => void;
  options: string[];
}

const SelectField: React.FC<
  SelectFieldProps
> = ({
  label,
  name,
  value,
  onChange,
  options,
}) => {
  return (
    <div className="col-md-6 mb-3">
      <div className="row align-items-center">
        <div className="col-md-4">
          <label
            style={{
              fontSize: 13,
              color: "#374151",
            }}
          >
            {label}
          </label>
        </div>

        <div className="col-md-8">
          <select
            name={name}
            className="form-select"
            style={{
              height: 42,
              borderRadius: 8,
              fontSize: 13,
            }}
            value={value}
            onChange={onChange}
          >
            <option value="">
              Select
            </option>

            {options.map(
              (item, index) => (
                <option
                  key={`${item}-${index}`}
                  value={item}
                >
                  {item}
                </option>
              )
            )}
          </select>
        </div>
      </div>
    </div>
  );
};

// =====================================================
// PASSWORD FIELD
// =====================================================

interface PasswordFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  show: boolean;
  setShow: React.Dispatch<
    React.SetStateAction<boolean>
  >;
}

const PasswordField: React.FC<
  PasswordFieldProps
> = ({
  label,
  name,
  value,
  onChange,
  show,
  setShow,
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
        <div
          style={{
            position: "relative",
          }}
        >
          <input
            type={
              show
                ? "text"
                : "password"
            }
            name={name}
            className="form-control"
            value={value}
            onChange={onChange}
            style={{
              height: 42,
              borderRadius: 8,
              fontSize: 13,
              paddingRight: 40,
            }}
          />

          <div
            onClick={() =>
              setShow(!show)
            }
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

// =====================================================
// EXPORT
// =====================================================

export default Profiles;


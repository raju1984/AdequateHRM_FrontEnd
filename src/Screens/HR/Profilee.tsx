
import React, {
  useEffect,
  useRef,
  useState,
} from "react";

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
  getProfile,
  updateEmployeeProfile,
} from "../../services/hrservices";

/* =====================================================
   TYPES
===================================================== */

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

/* =====================================================
   COLORS
===================================================== */

const GOLD = "#c49332";
const PAGE_BG = "#f7f8fa";
const TEXT_DARK = "#14213d";
const BORDER = "#e1e5eb";

/* =====================================================
   COMPONENT
===================================================== */

const Profilee: React.FC = () => {
  const token =
    localStorage.getItem("token") || "";

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  /* ===================================================
     UI STATE
  =================================================== */

  const [collapsed, setCollapsed] =
    useState(false);

  const [showCurrent, setShowCurrent] =
    useState(false);

  const [showNew, setShowNew] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  /* ===================================================
     PASSWORD STATE
  =================================================== */

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  /* ===================================================
     IMAGE STATE
  =================================================== */

  const [profileImage, setProfileImage] =
    useState("");

  const [profileImageFile, setProfileImageFile] =
    useState<File | null>(null);

  /* ===================================================
     API STATE
  =================================================== */

  const [loadingProfile, setLoadingProfile] =
    useState(false);

  const [savingProfile, setSavingProfile] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  /* ===================================================
     FORM STATE
  =================================================== */

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
    });

  /* =====================================================
     HELPER
     Extract profile object from API response
  ===================================================== */

  const extractProfileData = (
    response: any
  ): any => {
    if (!response) {
      return null;
    }

    /*
      Possible response structures:

      {
        data: {
          Id: "...",
          FirstName: "..."
        }
      }

      OR

      {
        data: {
          data: {
            Id: "..."
          }
        }
      }

      OR

      {
        Id: "...",
        FirstName: "..."
      }
    */

    if (
      response?.Id ||
      response?.id ||
      response?.FirstName ||
      response?.firstName ||
      response?.Email ||
      response?.email
    ) {
      return response;
    }

    if (
      response?.data?.Id ||
      response?.data?.id ||
      response?.data?.FirstName ||
      response?.data?.firstName ||
      response?.data?.Email ||
      response?.data?.email
    ) {
      return response.data;
    }

    if (
      response?.data?.data?.Id ||
      response?.data?.data?.id ||
      response?.data?.data?.FirstName ||
      response?.data?.data?.firstName ||
      response?.data?.data?.Email ||
      response?.data?.data?.email
    ) {
      return response.data.data;
    }

    /*
      Some APIs return result instead of data.
    */

    if (
      response?.result?.Id ||
      response?.result?.id ||
      response?.result?.FirstName ||
      response?.result?.firstName
    ) {
      return response.result;
    }

    return null;
  };

  /* =====================================================
     GET PROFILE
     
     GET:
     /api/Profile/Get-Profile
  ===================================================== */

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      setError("");
      setMessage("");

      if (!token) {
        setError(
          "Authentication token not found. Please login again."
        );

        return;
      }

      console.log(
        "Calling Profile/Get-Profile..."
      );

      const response =
        await getProfile(token);

      console.log(
        "Profile API Response =>",
        response
      );

      const profile =
        extractProfileData(response);

      console.log(
        "Profile Data =>",
        profile
      );

      if (!profile) {
        setError(
          "Profile data not found in API response."
        );

        return;
      }

      /* =================================================
         PROFILE ID
      ================================================= */

      const profileId =
        profile?.Id ||
        profile?.id ||
        profile?.userId ||
        profile?.UserId ||
        "";

      /* =================================================
         SET FORM
      ================================================= */

      setForm({
        id: String(profileId),

        firstName:
          profile?.FirstName ??
          profile?.firstName ??
          profile?.first_name ??
          profile?.firstname ??
          "",

        lastName:
          profile?.LastName ??
          profile?.lastName ??
          profile?.last_name ??
          profile?.lastname ??
          "",

        email:
          profile?.Email ??
          profile?.email ??
          "",

        phone:
          profile?.Phone ??
          profile?.phone ??
          profile?.Mobile ??
          profile?.mobile ??
          profile?.PhoneNumber ??
          profile?.phoneNumber ??
          "",

        address:
          profile?.Address ??
          profile?.address ??
          "",

        country:
          profile?.Country ??
          profile?.country ??
          "",

        state:
          profile?.State ??
          profile?.state ??
          "",

        city:
          profile?.City ??
          profile?.city ??
          "",

        postalCode:
          profile?.PostalCode ??
          profile?.postalCode ??
          profile?.postal_code ??
          profile?.ZipCode ??
          profile?.zipCode ??
          "",
      });

      /* =================================================
         PROFILE IMAGE
      ================================================= */

      const picture =
        profile?.ProfilePictureUrl ||
        profile?.profilePictureUrl ||
        profile?.ProfilePicture ||
        profile?.profilePicture ||
        profile?.ProfileImage ||
        profile?.profileImage ||
        profile?.Image ||
        profile?.image ||
        "";

      if (
        typeof picture === "string"
      ) {
        setProfileImage(picture);
      } else {
        setProfileImage("");
      }
    } catch (error: any) {
      console.error(
        "Get Profile Error =>",
        error
      );

      console.error(
        "Get Profile Backend Error =>",
        error?.response?.data
      );

      const backendError =
        error?.response?.data;

      const errorMessage =
        backendError?.message ||
        backendError?.Message ||
        backendError?.title ||
        backendError?.error ||
        (typeof backendError === "string"
          ? backendError
          : "") ||
        error?.message ||
        "Failed to load profile.";

      setError(errorMessage);
    } finally {
      setLoadingProfile(false);
    }
  };

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    fetchProfile();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =====================================================
     INPUT CHANGE
  ===================================================== */

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  /* =====================================================
     IMAGE CHANGE
  ===================================================== */

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    /* -----------------------------------------------
       Validate image
    ------------------------------------------------ */

    if (
      !file.type.startsWith("image/")
    ) {
      setError(
        "Please select a valid image file."
      );

      e.target.value = "";

      return;
    }

    /*
      Optional 4 MB validation.
    */

    if (file.size > 4 * 1024 * 1024) {
      setError(
        "Profile image size must be less than 4 MB."
      );

      e.target.value = "";

      return;
    }

    setProfileImageFile(file);

    const previewUrl =
      URL.createObjectURL(file);

    setProfileImage(previewUrl);

    setMessage("");
    setError("");
  };

  /* =====================================================
     CANCEL IMAGE
  ===================================================== */

  const handleImageCancel = async () => {
    setProfileImageFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    /*
      Reload original image from server.
    */

    await fetchProfile();

    setMessage("");
    setError("");
  };

  /* =====================================================
     SAVE PROFILE
     
     PUT:
     /api/Profile/Update-Profile
  ===================================================== */

  const handleSave = async () => {
    setMessage("");
    setError("");

    /* -----------------------------------------------
       Token validation
    ------------------------------------------------ */

    if (!token) {
      setError(
        "Authentication token not found. Please login again."
      );

      return;
    }

    /* -----------------------------------------------
       Profile ID validation
    ------------------------------------------------ */

    if (!form.id) {
      setError(
        "Profile ID is missing. Please reload the page and try again."
      );

      return;
    }

    /* -----------------------------------------------
       Password validation
    ------------------------------------------------ */

    if (
      newPassword &&
      newPassword !== confirmPassword
    ) {
      setError(
        "New password and confirm password do not match."
      );

      return;
    }

    if (
      newPassword &&
      !currentPassword
    ) {
      setError(
        "Please enter your current password."
      );

      return;
    }

    if (
      currentPassword &&
      !newPassword
    ) {
      setError(
        "Please enter your new password."
      );

      return;
    }

    try {
      setSavingProfile(true);

      /* =================================================
         PAYLOAD
      ================================================= */

      const payload = {
        Id:
          form.id || "",

        FirstName:
          form.firstName.trim(),

        LastName:
          form.lastName.trim(),

        Email:
          form.email.trim(),

        Phone:
          form.phone.trim(),

        Address:
          form.address.trim(),

        Country:
          form.country.trim(),

        State:
          form.state.trim(),

        City:
          form.city.trim(),

        PostalCode:
          form.postalCode.trim(),

        CurrentPassword:
          currentPassword || "",

        NewPassword:
          newPassword || "",

        ConfirmPassword:
          confirmPassword || "",

        ProfilePicture:
          profileImageFile,
      };

      console.log(
        "Profile Update Payload =>",
        payload
      );

      /* =================================================
         UPDATE API
      ================================================= */

      const response =
        await updateEmployeeProfile(
          payload,
          token
        );

      console.log(
        "Profile Update Response =>",
        response
      );

      /* =================================================
         SUCCESS
      ================================================= */

      const successMessage =
        response?.message ||
        response?.Message ||
        response?.data?.message ||
        response?.data?.Message ||
        "Profile updated successfully.";

      setMessage(
        successMessage
      );

      /* -----------------------------------------------
         Clear passwords
      ------------------------------------------------ */

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);

      /* -----------------------------------------------
         Clear selected image
      ------------------------------------------------ */

      setProfileImageFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      /* -----------------------------------------------
         Reload profile from server
      ------------------------------------------------ */

      await fetchProfile();
    } catch (error: any) {
      console.error(
        "Profile Update Error =>",
        error
      );

      console.error(
        "Profile Update Backend Error =>",
        error?.response?.data
      );

      const backendError =
        error?.response?.data;

      const errorMessage =
        backendError?.message ||
        backendError?.Message ||
        backendError?.title ||
        backendError?.error ||
        (typeof backendError === "string"
          ? backendError
          : "") ||
        error?.message ||
        "Failed to update profile.";

      setError(errorMessage);
    } finally {
      setSavingProfile(false);
    }
  };

  /* =====================================================
     CANCEL FORM
  ===================================================== */

  const handleCancel = async () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);

    setProfileImageFile(null);

    setMessage("");
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    await fetchProfile();
  };

  /* =====================================================
     UI
  ===================================================== */

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
      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent:
            "space-between",
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
                display:
                  "inline-flex",
                color: "#52647b",
              }}
            >
              <Home
                size={12}
                strokeWidth={1.7}
              />
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
          onClick={() =>
            setCollapsed(
              (prev) => !prev
            )
          }
          style={{
            width: 39,
            height: 39,
            border:
              `1px solid ${BORDER}`,
            borderRadius: 6,
            background: "#ffffff",
            color: "#15223a",
            display: "flex",
            alignItems: "center",
            justifyContent:
              "center",
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

      {/* =================================================
          PROFILE CARD
      ================================================= */}

      {!collapsed && (
        <div
          style={{
            background: "#ffffff",
            border:
              `1px solid ${BORDER}`,
            borderRadius: 6,
            boxShadow:
              "0 1px 2px rgba(16,24,40,0.03)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding:
                "19px 20px 20px",
            }}
          >
            {/* =================================================
                CARD HEADER
            ================================================= */}

            <div
              style={{
                paddingBottom: 16,
                borderBottom:
                  `1px solid ${BORDER}`,
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
                LOADING
            ================================================= */}

            {loadingProfile && (
              <div
                style={{
                  padding:
                    "10px 0",
                  fontSize: 12,
                  color: "#667085",
                }}
              >
                Loading profile...
              </div>
            )}

            {/* =================================================
                SUCCESS MESSAGE
            ================================================= */}

            {message && (
              <div
                style={{
                  marginTop: 16,
                  padding:
                    "10px 12px",
                  borderRadius: 5,
                  background:
                    "#eef8f0",
                  border:
                    "1px solid #cce8d1",
                  color: "#26743a",
                  fontSize: 12,
                }}
              >
                {message}
              </div>
            )}

            {/* =================================================
                ERROR MESSAGE
            ================================================= */}

            {error && (
              <div
                style={{
                  marginTop: 16,
                  padding:
                    "10px 12px",
                  borderRadius: 5,
                  background:
                    "#fff3f3",
                  border:
                    "1px solid #f1caca",
                  color: "#c0392b",
                  fontSize: 12,
                }}
              >
                {error}
              </div>
            )}

            {/* =================================================
                BASIC INFORMATION
            ================================================= */}

            <section
              style={{
                paddingTop: 16,
                paddingBottom: 16,
                borderBottom:
                  `1px solid ${BORDER}`,
              }}
            >
              <h3
                style={{
                  margin:
                    "0 0 17px",
                  fontSize: 13,
                  lineHeight:
                    "18px",
                  fontWeight: 600,
                  color: "#11203b",
                }}
              >
                Basic Information
              </h3>

              {/* =================================================
                  PROFILE PHOTO
              ================================================= */}

              <div
                style={{
                  minHeight: 114,
                  background:
                    "#f8f9fb",
                  borderRadius: 5,
                  padding: "16px",
                  boxSizing:
                    "border-box",
                  display: "flex",
                  alignItems:
                    "center",
                  gap: 10,
                  marginBottom: 23,
                }}
              >
                <div
                  style={{
                    width: 80,
                    height: 80,
                    minWidth: 80,
                    borderRadius:
                      "50%",
                    border:
                      "1px dashed #d9dee6",
                    background:
                      "#ffffff",
                    display: "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    overflow:
                      "hidden",
                  }}
                >
                  {profileImage ? (
                    <img
                      src={
                        profileImage
                      }
                      alt="Profile"
                      style={{
                        width:
                          "100%",
                        height:
                          "100%",
                        objectFit:
                          "cover",
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
                      color:
                        "#12203c",
                      fontSize: 13,
                      fontWeight: 600,
                      marginBottom: 6,
                    }}
                  >
                    Profile Photo
                  </div>

                  <div
                    style={{
                      color:
                        "#7b8494",
                      fontSize: 11,
                      marginBottom: 10,
                    }}
                  >
                    Recommended image
                    size is 40px x 40px
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems:
                        "center",
                      gap: 15,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      disabled={
                        savingProfile
                      }
                      style={{
                        minWidth: 56,
                        height: 28,
                        border: "none",
                        borderRadius: 5,
                        padding:
                          "0 10px",
                        background:
                          GOLD,
                        color:
                          "#ffffff",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor:
                          savingProfile
                            ? "not-allowed"
                            : "pointer",
                        opacity:
                          savingProfile
                            ? 0.6
                            : 1,
                      }}
                    >
                      Upload
                    </button>

                    <input
                      ref={
                        fileInputRef
                      }
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={
                        handleImageChange
                      }
                    />

                    <button
                      type="button"
                      onClick={
                        handleImageCancel
                      }
                      disabled={
                        savingProfile
                      }
                      style={{
                        border: "none",
                        background:
                          "transparent",
                        padding: 0,
                        color:
                          "#111827",
                        fontSize: 12,
                        cursor:
                          savingProfile
                            ? "not-allowed"
                            : "pointer",
                        opacity:
                          savingProfile
                            ? 0.6
                            : 1,
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>

              {/* =================================================
                  FIRST / LAST NAME
              ================================================= */}

              <TwoColumnRow>
                <FormField
                  label="First Name"
                  name="firstName"
                  value={
                    form.firstName
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    savingProfile
                  }
                />

                <FormField
                  label="Last Name"
                  name="lastName"
                  value={
                    form.lastName
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    savingProfile
                  }
                />
              </TwoColumnRow>

              {/* =================================================
                  EMAIL / PHONE
              ================================================= */}

              <TwoColumnRow>
                <FormField
                  label="Email"
                  name="email"
                  value={
                    form.email
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    savingProfile
                  }
                />

                <FormField
                  label="Phone"
                  name="phone"
                  value={
                    form.phone
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    savingProfile
                  }
                />
              </TwoColumnRow>
            </section>

            {/* =================================================
                ADDRESS INFORMATION
            ================================================= */}

            <section
              style={{
                paddingTop: 15,
                paddingBottom: 16,
                borderBottom:
                  `1px solid ${BORDER}`,
              }}
            >
              <h3
                style={{
                  margin:
                    "0 0 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#11203b",
                }}
              >
                Address Information
              </h3>

              {/* ADDRESS */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "150px 1fr",
                  alignItems:
                    "center",
                  marginBottom: 16,
                }}
              >
                <label
                  style={
                    labelStyle
                  }
                >
                  Address
                </label>

                <input
                  type="text"
                  name="address"
                  value={
                    form.address
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    savingProfile
                  }
                  style={{
                    ...inputStyle,
                    opacity:
                      savingProfile
                        ? 0.7
                        : 1,
                  }}
                />
              </div>

              {/* COUNTRY / STATE */}

              <TwoColumnRow>
                <SelectField
                  label="Country"
                  name="country"
                  value={
                    form.country
                  }
                  options={[
                    "USA",
                    "Canada",
                    "Germany",
                    "France",
                    "India",
                  ]}
                  onChange={
                    handleChange
                  }
                  disabled={
                    savingProfile
                  }
                />

                <SelectField
                  label="State"
                  name="state"
                  value={
                    form.state
                  }
                  options={[
                    "California",
                    "New York",
                    "Texas",
                    "Florida",
                    "Gujarat",
                    "Maharashtra",
                  ]}
                  onChange={
                    handleChange
                  }
                  disabled={
                    savingProfile
                  }
                />
              </TwoColumnRow>

              {/* CITY / POSTAL */}

              <TwoColumnRow>
                <SelectField
                  label="City"
                  name="city"
                  value={
                    form.city
                  }
                  options={[
                    "Los Angeles",
                    "San Diego",
                    "Fresno",
                    "San Francisco",
                    "Ahmedabad",
                    "Surat",
                    "Mumbai",
                  ]}
                  onChange={
                    handleChange
                  }
                  disabled={
                    savingProfile
                  }
                />

                <FormField
                  label="Postal Code"
                  name="postalCode"
                  value={
                    form.postalCode
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    savingProfile
                  }
                />
              </TwoColumnRow>
            </section>

            {/* =================================================
                CHANGE PASSWORD
            ================================================= */}

            <section
              style={{
                paddingTop: 15,
                paddingBottom: 16,
                borderBottom:
                  `1px solid ${BORDER}`,
              }}
            >
              <h3
                style={{
                  margin:
                    "0 0 16px",
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
                  value={
                    currentPassword
                  }
                  onChange={
                    setCurrentPassword
                  }
                  show={
                    showCurrent
                  }
                  setShow={
                    setShowCurrent
                  }
                  disabled={
                    savingProfile
                  }
                />

                <PasswordField
                  label="New Password"
                  value={
                    newPassword
                  }
                  onChange={
                    setNewPassword
                  }
                  show={
                    showNew
                  }
                  setShow={
                    setShowNew
                  }
                  disabled={
                    savingProfile
                  }
                />

                <PasswordField
                  label="Confirm Password"
                  value={
                    confirmPassword
                  }
                  onChange={
                    setConfirmPassword
                  }
                  show={
                    showConfirm
                  }
                  setShow={
                    setShowConfirm
                  }
                  disabled={
                    savingProfile
                  }
                />
              </div>
            </section>

            {/* =================================================
                BUTTONS
            ================================================= */}

            <div
              style={{
                display: "flex",
                justifyContent:
                  "flex-end",
                alignItems:
                  "center",
                gap: 16,
                paddingTop: 16,
              }}
            >
              <button
                type="button"
                onClick={
                  handleCancel
                }
                disabled={
                  savingProfile
                }
                style={{
                  height: 39,
                  minWidth: 72,
                  padding:
                    "0 14px",
                  background:
                    "#ffffff",
                  border:
                    `1px solid ${BORDER}`,
                  borderRadius: 5,
                  color:
                    "#26344e",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor:
                    savingProfile
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    savingProfile
                      ? 0.6
                      : 1,
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleSave
                }
                disabled={
                  savingProfile ||
                  loadingProfile
                }
                style={{
                  height: 39,
                  minWidth: 60,
                  padding:
                    "0 14px",
                  background:
                    GOLD,
                  border: "none",
                  borderRadius: 5,
                  color:
                    "#ffffff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor:
                    savingProfile ||
                    loadingProfile
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    savingProfile ||
                    loadingProfile
                      ? 0.7
                      : 1,
                }}
              >
                {savingProfile
                  ? "Saving..."
                  : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* =====================================================
   TWO COLUMN ROW
===================================================== */

const TwoColumnRow = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "1fr 1fr",
        columnGap: 24,
        marginBottom: 16,
      }}
    >
      {children}
    </div>
  );
};

/* =====================================================
   FORM FIELD
===================================================== */

interface FormFieldProps {
  label: string;
  name: string;
  value: string;

  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => void;

  disabled?: boolean;
}

const FormField: React.FC<
  FormFieldProps
> = ({
  label,
  name,
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "150px 1fr",
        alignItems:
          "center",
      }}
    >
      <label
        style={labelStyle}
      >
        {label}
      </label>

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={{
          ...inputStyle,
          opacity:
            disabled ? 0.7 : 1,
        }}
      />
    </div>
  );
};

/* =====================================================
   SELECT FIELD
===================================================== */

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

  disabled?: boolean;
}

const SelectField: React.FC<
  SelectFieldProps
> = ({
  label,
  name,
  value,
  options,
  onChange,
  disabled = false,
}) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "150px 1fr",
        alignItems:
          "center",
      }}
    >
      <label
        style={labelStyle}
      >
        {label}
      </label>

      <div
        style={{
          position:
            "relative",
        }}
      >
        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          style={{
            ...inputStyle,
            paddingRight: 36,
            appearance:
              "none",
            WebkitAppearance:
              "none",
            cursor: disabled
              ? "not-allowed"
              : "pointer",
            opacity:
              disabled ? 0.7 : 1,
          }}
        >
          <option value="">
            Select
          </option>

          {options.map(
            (item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            )
          )}
        </select>

        <ChevronDown
          size={14}
          strokeWidth={1.7}
          color="#526176"
          style={{
            position:
              "absolute",
            right: 10,
            top: "50%",
            transform:
              "translateY(-50%)",
            pointerEvents:
              "none",
          }}
        />
      </div>
    </div>
  );
};

/* =====================================================
   PASSWORD FIELD
===================================================== */

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;

  show: boolean;

  setShow: React.Dispatch<
    React.SetStateAction<boolean>
  >;

  disabled?: boolean;
}

const PasswordField: React.FC<
  PasswordFieldProps
> = ({
  label,
  value,
  onChange,
  show,
  setShow,
  disabled = false,
}) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "145px 1fr",
        alignItems:
          "center",
        minWidth: 0,
      }}
    >
      <label
        style={{
          ...labelStyle,
          whiteSpace:
            "nowrap",
        }}
      >
        {label}
      </label>

      <div
        style={{
          position:
            "relative",
          minWidth: 0,
        }}
      >
        <input
          type={
            show
              ? "text"
              : "password"
          }
          value={value}
          onChange={(e) =>
            onChange(
              e.target.value
            )
          }
          disabled={disabled}
          style={{
            ...inputStyle,
            paddingRight: 38,
            opacity:
              disabled ? 0.7 : 1,
          }}
        />

        <button
          type="button"
          onClick={() =>
            setShow(
              (prev) =>
                !prev
            )
          }
          disabled={disabled}
          style={{
            position:
              "absolute",
            right: 10,
            top: "50%",
            transform:
              "translateY(-50%)",
            border: "none",
            background:
              "transparent",
            padding: 0,
            margin: 0,
            color:
              "#101b30",
            cursor:
              disabled
                ? "not-allowed"
                : "pointer",
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            opacity:
              disabled
                ? 0.6
                : 1,
          }}
        >
          {show ? (
            <Eye
              size={17}
              strokeWidth={1.8}
            />
          ) : (
            <EyeOff
              size={17}
              strokeWidth={1.8}
            />
          )}
        </button>
      </div>
    </div>
  );
};

/* =====================================================
   STYLES
===================================================== */

const labelStyle: React.CSSProperties =
  {
    margin: 0,
    color: "#12203c",
    fontSize: 13,
    lineHeight: "18px",
    fontWeight: 400,
  };

const inputStyle: React.CSSProperties =
  {
    width: "100%",
    height: 38,
    padding: "0 10px",
    boxSizing: "border-box",
    border:
      `1px solid ${BORDER}`,
    borderRadius: 5,
    outline: "none",
    background:
      "#ffffff",
    color:
      "#26344e",
    fontSize: 13,
    fontFamily:
      "'Inter', 'Nunito Sans', 'Segoe UI', Arial, sans-serif",
  };

export default Profilee;


import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Camera,
  ChevronUp,
  Eye,
  EyeOff,
  Home,
} from "lucide-react";

import {
  getEmployeeProfile,
  updateEmployeeProfile,
} from "../../services/adminservices";

/* =========================================================
   TYPES
========================================================= */

interface ProfileForm {
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
}

interface ProfileApiData {
  id?: string;
  Id?: string;

  userId?: string;
  UserId?: string;

  firstName?: string;
  FirstName?: string;

  lastName?: string;
  LastName?: string;

  email?: string;
  Email?: string;

  phone?: string;
  Phone?: string;

  address?: string;
  Address?: string;

  country?: string;
  Country?: string;

  state?: string;
  State?: string;

  city?: string;
  City?: string;

  postalCode?: string;
  PostalCode?: string;

  profilePicture?: string;
  ProfilePicture?: string;

  profilePhoto?: string;
  ProfilePhoto?: string;

  profileImage?: string;
  ProfileImage?: string;

  photo?: string;
  Photo?: string;

  [key: string]: any;
}

/* =========================================================
   EMPTY FORM
========================================================= */

const emptyProfile: ProfileForm = {
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
};

/* =========================================================
   HELPERS
========================================================= */

const getValue = (
  data: ProfileApiData,
  lowerKey: string,
  upperKey: string
): string => {
  return String(
    data?.[lowerKey] ??
      data?.[upperKey] ??
      ""
  );
};

const getProfileObject = (
  response: any
): ProfileApiData => {
  /*
    Different APIs can return:

    {
      data: {...}
    }

    or

    {
      result: {...}
    }

    or directly:

    {
      id: "...",
      firstName: "..."
    }
  */

  if (
    response?.data &&
    typeof response.data === "object" &&
    !Array.isArray(response.data)
  ) {
    return response.data;
  }

  if (
    response?.result &&
    typeof response.result === "object" &&
    !Array.isArray(response.result)
  ) {
    return response.result;
  }

  if (
    response?.Data &&
    typeof response.Data === "object" &&
    !Array.isArray(response.Data)
  ) {
    return response.Data;
  }

  return response || {};
};

const getProfileId = (
  data: ProfileApiData
): string => {
  return String(
    data?.id ??
      data?.Id ??
      data?.userId ??
      data?.UserId ??
      localStorage.getItem("userId") ??
      ""
  ).trim();
};

/* =========================================================
   PROFILE COMPONENT
========================================================= */

const Profile: React.FC = () => {
  const token =
    localStorage.getItem("token") || "";

  const storedUserId =
    localStorage.getItem("userId") || "";

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [profile, setProfile] =
    useState<ProfileForm>(
      emptyProfile
    );

  const [originalProfile, setOriginalProfile] =
    useState<ProfileForm>(
      emptyProfile
    );

  const [profileId, setProfileId] =
    useState<string>(
      storedUserId
    );

  const [showCurrent, setShowCurrent] =
    useState(false);

  const [showNew, setShowNew] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [photoPreview, setPhotoPreview] =
    useState<string>("");

  const [selectedPhoto, setSelectedPhoto] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  /* =======================================================
     HANDLE INPUT
  ======================================================= */

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const {
      name,
      value,
    } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =======================================================
     FETCH PROFILE
     GET /api/Profile/Get-Profile
  ======================================================= */

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const response =
        await getEmployeeProfile(
          token
        );

      console.log(
        "PROFILE SCREEN API RESPONSE:",
        response
      );

      const data =
        getProfileObject(response);

      console.log(
        "PROFILE OBJECT:",
        data
      );

      const apiProfile: ProfileForm = {
        firstName: getValue(
          data,
          "firstName",
          "FirstName"
        ),

        lastName: getValue(
          data,
          "lastName",
          "LastName"
        ),

        email: getValue(
          data,
          "email",
          "Email"
        ),

        phone: getValue(
          data,
          "phone",
          "Phone"
        ),

        address: getValue(
          data,
          "address",
          "Address"
        ),

        country: getValue(
          data,
          "country",
          "Country"
        ),

        state: getValue(
          data,
          "state",
          "State"
        ),

        city: getValue(
          data,
          "city",
          "City"
        ),

        postalCode: getValue(
          data,
          "postalCode",
          "PostalCode"
        ),

        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      };

      const id =
        getProfileId(data);

      if (id) {
        setProfileId(id);

        /*
          Keep userId synchronized if backend
          returned the actual profile ID.
        */
        localStorage.setItem(
          "userId",
          id
        );
      }

      setProfile(apiProfile);
      setOriginalProfile(apiProfile);

      const profileImage =
        data?.profilePicture ||
        data?.ProfilePicture ||
        data?.profilePhoto ||
        data?.ProfilePhoto ||
        data?.profileImage ||
        data?.ProfileImage ||
        data?.photo ||
        data?.Photo ||
        "";

      setPhotoPreview(
        profileImage || ""
      );
    } catch (error: any) {
      console.error(
        "Profile fetch failed:",
        error
      );

      alert(
        error?.message ||
          "Failed to load profile."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  /* =======================================================
     PHOTO CHANGE
  ======================================================= */

  const handlePhotoChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      alert(
        "Please select a valid image."
      );

      e.target.value = "";
      return;
    }

    /*
      Optional 4 MB validation.
    */

    const maxSize =
      4 * 1024 * 1024;

    if (file.size > maxSize) {
      alert(
        "Profile image must be less than 4 MB."
      );

      e.target.value = "";
      return;
    }

    /*
      Revoke previous blob URL.
    */

    if (
      photoPreview &&
      photoPreview.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        photoPreview
      );
    }

    setSelectedPhoto(file);

    const previewUrl =
      URL.createObjectURL(file);

    setPhotoPreview(
      previewUrl
    );
  };

  /* =======================================================
     PHOTO CANCEL
  ======================================================= */

  const handlePhotoCancel = () => {
    if (
      photoPreview &&
      photoPreview.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        photoPreview
      );
    }

    setSelectedPhoto(null);

    /*
      Restore server image if possible
      by fetching profile again.
    */

    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        "";
    }

    fetchProfile();
  };

  /* =======================================================
     CANCEL FORM
  ======================================================= */

  const handleCancel = () => {
    setProfile({
      ...originalProfile,

      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);

    setSelectedPhoto(null);

    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        "";
    }

    /*
      Restore original server photo.
      Fetching keeps this safe if the backend
      has a profile picture URL.
    */

    fetchProfile();
  };

  /* =======================================================
     SAVE PROFILE
     PUT /api/Profile/Update-Profile
  ======================================================= */

  const handleSave = async () => {
    try {
      /* -----------------------------------------------
         PROFILE ID
      ------------------------------------------------ */

      const id =
        profileId ||
        localStorage.getItem(
          "userId"
        ) ||
        "";

      if (!id.trim()) {
        alert(
          "Profile ID not found. Please login again."
        );

        return;
      }

      /* -----------------------------------------------
         PASSWORD VALIDATION
      ------------------------------------------------ */

      if (
        profile.newPassword &&
        profile.newPassword !==
          profile.confirmPassword
      ) {
        alert(
          "New Password and Confirm Password do not match."
        );

        return;
      }

      if (
        profile.newPassword &&
        !profile.currentPassword
      ) {
        alert(
          "Please enter Current Password."
        );

        return;
      }

      if (
        profile.confirmPassword &&
        !profile.newPassword
      ) {
        alert(
          "Please enter New Password."
        );

        return;
      }

      /* -----------------------------------------------
         SAVE
      ------------------------------------------------ */

      setSaving(true);

      const payload = {
        Id: id.trim(),

        FirstName:
          profile.firstName.trim(),

        LastName:
          profile.lastName.trim(),

        Email:
          profile.email.trim(),

        Phone:
          profile.phone.trim(),

        Address:
          profile.address.trim(),

        Country:
          profile.country.trim(),

        State:
          profile.state.trim(),

        City:
          profile.city.trim(),

        PostalCode:
          profile.postalCode.trim(),

        CurrentPassword:
          profile.currentPassword || "",

        NewPassword:
          profile.newPassword || "",

        ConfirmPassword:
          profile.confirmPassword || "",

        ProfilePicture:
          selectedPhoto,
      };

      console.log(
        "PROFILE UPDATE PAYLOAD:",
        {
          ...payload,
          CurrentPassword:
            payload.CurrentPassword
              ? "***"
              : "",
          NewPassword:
            payload.NewPassword
              ? "***"
              : "",
          ConfirmPassword:
            payload.ConfirmPassword
              ? "***"
              : "",
          ProfilePicture:
            selectedPhoto?.name ||
            null,
        }
      );

      await updateEmployeeProfile(
        payload,
        token
      );

      alert(
        "Profile Updated Successfully."
      );

      /*
        Clear password fields after
        successful update.
      */

      setProfile((prev) => ({
        ...prev,

        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      /*
        Clear selected image because it has
        already been uploaded.
      */

      setSelectedPhoto(null);

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          "";
      }

      /*
        Reload latest profile from API.
      */

      await fetchProfile();
    } catch (error: any) {
      console.error(
        "Profile update failed:",
        error
      );

      alert(
        error?.message ||
          "Profile Update Failed."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div
      style={{
        background: "#f7f8fa",
        minHeight:
          "calc(100vh - 49px)",
        padding: "24px",
        fontFamily:
          "Inter, sans-serif",
        color: "#0f2447",
      }}
    >
      {/* ===================================================
          PAGE HEADER
      =================================================== */}

      <div
        className="d-flex align-items-start justify-content-between"
        style={{
          marginBottom: "26px",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              marginBottom: "9px",
              fontSize: "24px",
              lineHeight: "30px",
              fontWeight: 700,
              color: "#0f2447",
            }}
          >
            Profile
          </h2>

          <div
            className="d-flex align-items-center"
            style={{
              gap: "10px",
              fontSize: "12px",
              color: "#637083",
            }}
          >
            <Home
              size={12}
              strokeWidth={1.7}
              color="#64748b"
            />

            <span
              style={{
                color: "#b8bec7",
              }}
            >
              /
            </span>

            <span
              style={{
                color: "#0f2447",
              }}
            >
              Profile
            </span>
          </div>
        </div>

        <button
          type="button"
          aria-label="Collapse"
          style={{
            width: "38px",
            height: "39px",
            border:
              "1px solid #e2e6ec",
            borderRadius: "5px",
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            color: "#10264c",
            cursor: "pointer",
          }}
        >
          <ChevronUp
            size={15}
            strokeWidth={2.2}
          />
        </button>
      </div>

      {/* ===================================================
          MAIN CARD
      =================================================== */}

      <div
        style={{
          width: "100%",
          background: "#ffffff",
          border:
            "1px solid #dde2e8",
          borderRadius: "5px",
          boxShadow:
            "0 1px 2px rgba(0,0,0,0.02)",
        }}
      >
        <div
          style={{
            padding:
              "19px 20px 20px",
          }}
        >
          {/* CARD TITLE */}

          <div
            style={{
              borderBottom:
                "1px solid #dfe3e8",
              paddingBottom: "16px",
            }}
          >
            <h4
              style={{
                margin: 0,
                fontSize: "18px",
                lineHeight: "22px",
                fontWeight: 600,
                color: "#10264c",
              }}
            >
              Profile
            </h4>
          </div>

          {/* LOADING */}

          {loading ? (
            <div
              style={{
                minHeight: "400px",
                display: "flex",
                justifyContent:
                  "center",
                alignItems: "center",
                fontSize: "13px",
                color: "#667085",
              }}
            >
              Loading...
            </div>
          ) : (
            <>
              {/* =================================================
                  BASIC INFORMATION
              ================================================= */}

              <section
                style={{
                  borderBottom:
                    "1px solid #dfe3e8",
                  padding:
                    "16px 0 16px",
                }}
              >
                <SectionTitle>
                  Basic Information
                </SectionTitle>

                {/* PROFILE PHOTO */}

                <div
                  className="d-flex align-items-center"
                  style={{
                    minHeight: "114px",
                    background:
                      "#f8f9fa",
                    borderRadius: "4px",
                    padding: "16px",
                    marginTop: "17px",
                    marginBottom: "23px",
                  }}
                >
                  <div
                    style={{
                      width: "82px",
                      height: "82px",
                      minWidth: "82px",
                      borderRadius:
                        "50%",
                      border:
                        "1px dashed #d5dbe3",
                      background:
                        "#ffffff",
                      display: "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      overflow: "hidden",
                      marginRight:
                        "23px",
                    }}
                  >
                    {photoPreview ? (
                      <img
                        src={
                          photoPreview
                        }
                        alt="Profile"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit:
                            "cover",
                        }}
                      />
                    ) : (
                      <Camera
                        size={17}
                        strokeWidth={
                          1.5
                        }
                        color="#ccd2da"
                      />
                    )}
                  </div>

                  <div>
                    <div
                      style={{
                        marginBottom:
                          "5px",
                        fontSize:
                          "14px",
                        lineHeight:
                          "18px",
                        fontWeight: 600,
                        color:
                          "#10264c",
                      }}
                    >
                      Profile Photo
                    </div>

                    <div
                      style={{
                        marginBottom:
                          "9px",
                        fontSize:
                          "12px",
                        lineHeight:
                          "16px",
                        color:
                          "#798599",
                      }}
                    >
                      Recommended image size is
                      40px x 40px
                    </div>

                    <div
                      className="d-flex align-items-center"
                      style={{
                        gap: "17px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          fileInputRef.current?.click()
                        }
                        style={{
                          minWidth:
                            "57px",
                          height: "28px",
                          padding:
                            "0 9px",
                          border:
                            "none",
                          borderRadius:
                            "5px",
                          background:
                            "#bd8d32",
                          color:
                            "#ffffff",
                          fontSize:
                            "12px",
                          lineHeight:
                            "28px",
                          fontWeight: 600,
                          cursor:
                            "pointer",
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
                          handlePhotoChange
                        }
                      />

                      <button
                        type="button"
                        onClick={
                          handlePhotoCancel
                        }
                        style={{
                          border:
                            "none",
                          background:
                            "transparent",
                          padding: 0,
                          height:
                            "28px",
                          fontSize:
                            "12px",
                          color:
                            "#15294b",
                          cursor:
                            "pointer",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>

                {/* FIRST / LAST NAME */}

                <div className="row gx-4">
                  <div className="col-md-6">
                    <HorizontalInput
                      label="First Name"
                      name="firstName"
                      value={
                        profile.firstName
                      }
                      onChange={
                        handleChange
                      }
                    />
                  </div>

                  <div className="col-md-6">
                    <HorizontalInput
                      label="Last Name"
                      name="lastName"
                      value={
                        profile.lastName
                      }
                      onChange={
                        handleChange
                      }
                    />
                  </div>

                  <div className="col-md-6">
                    <HorizontalInput
                      label="Email"
                      name="email"
                      type="email"
                      value={
                        profile.email
                      }
                      onChange={
                        handleChange
                      }
                    />
                  </div>

                  <div className="col-md-6">
                    <HorizontalInput
                      label="Phone"
                      name="phone"
                      value={
                        profile.phone
                      }
                      onChange={
                        handleChange
                      }
                    />
                  </div>
                </div>
              </section>

              {/* =================================================
                  ADDRESS INFORMATION
              ================================================= */}

              <section
                style={{
                  borderBottom:
                    "1px solid #dfe3e8",
                  padding:
                    "14px 0 15px",
                }}
              >
                <SectionTitle>
                  Address Information
                </SectionTitle>

                <div
                  style={{
                    marginTop: "16px",
                  }}
                >
                  {/* ADDRESS */}

                  <div
                    className="row align-items-center"
                    style={{
                      marginBottom:
                        "16px",
                    }}
                  >
                    <div className="col-md-2">
                      <FormLabel>
                        Address
                      </FormLabel>
                    </div>

                    <div className="col-md-10">
                      <input
                        type="text"
                        name="address"
                        value={
                          profile.address
                        }
                        onChange={
                          handleChange
                        }
                        className="form-control"
                        style={
                          inputStyle
                        }
                      />
                    </div>
                  </div>

                  {/* COUNTRY / STATE */}

                  <div className="row gx-4">
                    <div className="col-md-6">
                      <HorizontalSelect
                        label="Country"
                        name="country"
                        value={
                          profile.country
                        }
                        onChange={
                          handleChange
                        }
                        options={[
                          "India",
                          "USA",
                          "Canada",
                          "Germany",
                          "France",
                        ]}
                      />
                    </div>

                    <div className="col-md-6">
                      <HorizontalSelect
                        label="State"
                        name="state"
                        value={
                          profile.state
                        }
                        onChange={
                          handleChange
                        }
                        options={[
                          "Gujarat",
                          "Maharashtra",
                          "Rajasthan",
                          "Delhi",
                          "Madhya Pradesh",
                          "California",
                          "New York",
                          "Texas",
                          "Florida",
                        ]}
                      />
                    </div>

                    {/* CITY / POSTAL CODE */}

                    <div className="col-md-6">
                      <HorizontalSelect
                        label="City"
                        name="city"
                        value={
                          profile.city
                        }
                        onChange={
                          handleChange
                        }
                        options={[
                          "Ahmedabad",
                          "Surat",
                          "Vadodara",
                          "Rajkot",
                          "Mumbai",
                          "Pune",
                          "Los Angeles",
                          "San Diego",
                          "Fresno",
                          "San Francisco",
                        ]}
                      />
                    </div>

                    <div className="col-md-6">
                      <HorizontalInput
                        label="Postal Code"
                        name="postalCode"
                        value={
                          profile.postalCode
                        }
                        onChange={
                          handleChange
                        }
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* =================================================
                  CHANGE PASSWORD
              ================================================= */}

              <section
                style={{
                  borderBottom:
                    "1px solid #dfe3e8",
                  padding:
                    "15px 0 16px",
                }}
              >
                <SectionTitle>
                  Change Password
                </SectionTitle>

                <div
                  style={{
                    marginTop: "17px",
                  }}
                >
                  <PasswordField
                    label="Current Password"
                    name="currentPassword"
                    value={
                      profile.currentPassword
                    }
                    show={
                      showCurrent
                    }
                    setShow={
                      setShowCurrent
                    }
                    onChange={
                      handleChange
                    }
                  />

                  <PasswordField
                    label="New Password"
                    name="newPassword"
                    value={
                      profile.newPassword
                    }
                    show={showNew}
                    setShow={
                      setShowNew
                    }
                    onChange={
                      handleChange
                    }
                  />

                  <PasswordField
                    label="Confirm Password"
                    name="confirmPassword"
                    value={
                      profile.confirmPassword
                    }
                    show={
                      showConfirm
                    }
                    setShow={
                      setShowConfirm
                    }
                    onChange={
                      handleChange
                    }
                    noMargin
                  />
                </div>
              </section>

              {/* =================================================
                  BUTTONS
              ================================================= */}

              <div
                className="d-flex justify-content-end align-items-center"
                style={{
                  gap: "16px",
                  paddingTop: "16px",
                }}
              >
                <button
                  type="button"
                  onClick={
                    handleCancel
                  }
                  disabled={saving}
                  style={{
                    height: "39px",
                    minWidth: "73px",
                    padding:
                      "0 14px",
                    borderRadius:
                      "5px",
                    border:
                      "1px solid #dce1e7",
                    background:
                      "#ffffff",
                    color:
                      "#10264c",
                    fontSize:
                      "13px",
                    fontWeight: 500,
                    cursor: saving
                      ? "not-allowed"
                      : "pointer",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    handleSave
                  }
                  disabled={saving}
                  style={{
                    height: "39px",
                    minWidth: "60px",
                    padding:
                      "0 14px",
                    borderRadius:
                      "5px",
                    border:
                      "none",
                    background:
                      "#bd8d32",
                    color:
                      "#ffffff",
                    fontSize:
                      "13px",
                    fontWeight: 600,
                    cursor: saving
                      ? "not-allowed"
                      : "pointer",
                    opacity: saving
                      ? 0.7
                      : 1,
                  }}
                >
                  {saving
                    ? "Saving..."
                    : "Save"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   SECTION TITLE
========================================================= */

const SectionTitle = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <h6
      style={{
        margin: 0,
        fontSize: "13px",
        lineHeight: "18px",
        fontWeight: 600,
        color: "#10264c",
      }}
    >
      {children}
    </h6>
  );
};

/* =========================================================
   FORM LABEL
========================================================= */

const FormLabel = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <label
      style={{
        margin: 0,
        fontSize: "13px",
        lineHeight: "18px",
        fontWeight: 400,
        color: "#10264c",
      }}
    >
      {children}
    </label>
  );
};

/* =========================================================
   HORIZONTAL INPUT
========================================================= */

interface HorizontalInputProps {
  label: string;
  name: string;
  value: string;
  type?: React.HTMLInputTypeAttribute;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
}

const HorizontalInput: React.FC<
  HorizontalInputProps
> = ({
  label,
  name,
  value,
  type = "text",
  onChange,
}) => {
  return (
    <div
      className="row align-items-center"
      style={{
        marginBottom: "16px",
      }}
    >
      <div className="col-md-4">
        <FormLabel>
          {label}
        </FormLabel>
      </div>

      <div className="col-md-8">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className="form-control"
          style={inputStyle}
        />
      </div>
    </div>
  );
};

/* =========================================================
   HORIZONTAL SELECT
========================================================= */

interface HorizontalSelectProps {
  label: string;
  name: string;
  value: string;
  options: string[];
  onChange: (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => void;
}

const HorizontalSelect: React.FC<
  HorizontalSelectProps
> = ({
  label,
  name,
  value,
  options,
  onChange,
}) => {
  return (
    <div
      className="row align-items-center"
      style={{
        marginBottom: "16px",
      }}
    >
      <div className="col-md-4">
        <FormLabel>
          {label}
        </FormLabel>
      </div>

      <div className="col-md-8">
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="form-select"
          style={selectStyle}
        >
          <option value="">
            Select
          </option>

          {options.map(
            (option) => (
              <option
                key={option}
                value={option}
              >
                {option}
              </option>
            )
          )}
        </select>
      </div>
    </div>
  );
};

/* =========================================================
   PASSWORD FIELD
========================================================= */

interface PasswordFieldProps {
  label: string;
  name: string;
  value: string;
  show: boolean;
  setShow: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  noMargin?: boolean;
}

const PasswordField: React.FC<
  PasswordFieldProps
> = ({
  label,
  name,
  value,
  show,
  setShow,
  onChange,
  noMargin = false,
}) => {
  return (
    <div
      className="row align-items-center"
      style={{
        marginBottom: noMargin
          ? 0
          : "16px",
      }}
    >
      <div className="col-md-2">
        <FormLabel>
          {label}
        </FormLabel>
      </div>

      <div className="col-md-4">
        <div
          style={{
            position:
              "relative",
          }}
        >
          <input
            type={
              show
                ? "text"
                : "password"
            }
            name={name}
            value={value}
            onChange={onChange}
            className="form-control"
            style={{
              ...inputStyle,
              paddingRight:
                "40px",
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
            aria-label={
              show
                ? "Hide password"
                : "Show password"
            }
            style={{
              position:
                "absolute",
              top: "50%",
              right: "11px",
              transform:
                "translateY(-50%)",
              width: "24px",
              height: "24px",
              padding: 0,
              border: "none",
              background:
                "transparent",
              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              color:
                "#10264c",
              cursor:
                "pointer",
            }}
          >
            {show ? (
              <Eye
                size={17}
                strokeWidth={1.7}
              />
            ) : (
              <EyeOff
                size={17}
                strokeWidth={1.7}
              />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   STYLES
========================================================= */

const inputStyle: React.CSSProperties =
  {
    width: "100%",
    height: "39px",
    minHeight: "39px",
    border:
      "1px solid #d9dfe7",
    borderRadius: "5px",
    backgroundColor:
      "#ffffff",
    color: "#1f2937",
    fontSize: "13px",
    padding:
      "7px 11px",
    boxShadow: "none",
    outline: "none",
  };

const selectStyle: React.CSSProperties =
  {
    ...inputStyle,
    cursor: "pointer",
    color: "#10264c",
  };

export default Profile;
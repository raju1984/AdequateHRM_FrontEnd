import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

import logo from "../../assets/img/logo.webp";
import authBg from "../../assets/img/bg/authentication-bg-01.png";

import { resetPassword } from "../../services/authservices";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";
  const otp = location.state?.otp || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const getPasswordStrength = () => {
    let strength = 0;

    if (password.length >= 8) {
      strength++;
    }

    if (/[A-Z]/.test(password)) {
      strength++;
    }

    if (/[0-9]/.test(password)) {
      strength++;
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      strength++;
    }

    return strength;
  };

  const passwordStrength =
    getPasswordStrength();

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!email) {
      alert(
        "Email is missing. Please start forgot password again."
      );
      return;
    }

    if (!otp) {
      alert(
        "OTP is missing. Please verify OTP again."
      );
      return;
    }

    if (!password.trim()) {
      alert("Please enter password");
      return;
    }

    if (password.length < 8) {
      alert(
        "Password must be at least 8 characters"
      );
      return;
    }

    if (!confirmPassword.trim()) {
      alert(
        "Please enter confirm password"
      );
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        email: email,
        otp: otp,
        password: password,
      };

      console.log(
        "Reset Password Payload:",
        payload
      );

      const response =
        await resetPassword(payload);

      console.log(
        "Reset Password Response:",
        response
      );

      if (
        response?.statusCode === 200 &&
        response?.isSuccess
      ) {
        alert(
          response?.message ||
            "Password Reset Successfully"
        );

        navigate(
          "/Employee/EmployeLogin"
        );
      } else {
        alert(
          response?.message ||
            "Unable to reset password"
        );
      }
    } catch (error: any) {
      console.error(
        "Reset Password Error:",
        error
      );

      console.error(
        "Backend Error:",
        error?.response?.data
      );

      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Reset Password Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        background: "#fff",
      }}
    >
      {/* LEFT SIDE */}

      <div
        className="d-none d-lg-flex"
        style={{
          width: "40.7%",
          minHeight: "100vh",
          background:
            "linear-gradient(145deg, #c89a42 0%, #9d7b3d 100%)",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "475px",
            minHeight: "605px",
            border:
              "1px solid rgba(255,255,255,0.85)",
            borderRadius: "16px",
            position: "relative",
            overflow: "hidden",
            padding: "38px 40px 28px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h1
            style={{
              margin: 0,
              color: "#fff",
              fontSize: "35px",
              lineHeight: "1.22",
              fontWeight: 700,
              maxWidth: "390px",
            }}
          >
            Empowering people
            <br />
            through seamless HR
            <br />
            management.
          </h1>

          <div
            style={{
              position: "absolute",
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              background:
                "linear-gradient(135deg,#ffb676,#ff7043)",
              right: "125px",
              top: "218px",
            }}
          ></div>

          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: "35px",
              marginBottom: "5px",
            }}
          >
            <img
              src={authBg}
              alt="HR Management"
              style={{
                width: "88%",
                maxHeight: "275px",
                objectFit: "contain",
              }}
            />
          </div>

          <div
            style={{
              textAlign: "center",
              color: "#fff",
              fontSize: "20px",
              lineHeight: "1.5",
              fontWeight: 600,
              maxWidth: "390px",
              margin: "0 auto",
            }}
          >
            Efficiently manage your workforce,
            <br />
            streamline
            <br />
            operations effortlessly.
          </div>

          <div
            style={{
              position: "absolute",
              width: "102px",
              height: "102px",
              borderRadius: "50%",
              background:
                "linear-gradient(135deg,#ffa27c,#f05c19)",
              left: "18px",
              bottom: "-42px",
            }}
          ></div>
        </div>
      </div>

      {/* RIGHT SIDE */}

      <div
        style={{
          width: "59.3%",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "#fff",
          position: "relative",
        }}
        className="flex-grow-1"
      >
        {/* LOGO */}

        <div
          style={{
            marginTop: "28px",
            textAlign: "center",
          }}
        >
          <img
            src={logo}
            alt="Adequate Infosoft"
            style={{
              width: "220px",
              maxWidth: "85%",
              objectFit: "contain",
            }}
          />
        </div>

        {/* CONTENT */}

        <div
          style={{
            width: "100%",
            maxWidth: "440px",
            marginTop: "80px",
            padding: "0 20px",
          }}
        >
          <form
            onSubmit={handleSubmit}
          >
            <div
              style={{
                textAlign: "center",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  color: "#0d214d",
                  fontSize: "24px",
                  fontWeight: 700,
                }}
              >
                Reset Password
              </h2>

              <p
                style={{
                  margin:
                    "10px auto 20px",
                  color: "#667085",
                  fontSize: "14px",
                  lineHeight: "1.5",
                }}
              >
                Your new password must be
                different from previous used
                <br />
                passwords.
              </p>
            </div>

            {/* PASSWORD */}

            <div
              style={{
                marginBottom: "14px",
              }}
            >
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#111827",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                Password
              </label>

              <div
                style={{
                  position: "relative",
                }}
              >
                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  style={{
                    width: "100%",
                    height: "38px",
                    border:
                      "1px solid #dfe3e8",
                    borderRadius: "5px",
                    padding:
                      "0 42px 0 12px",
                    outline: "none",
                  }}
                />

                <span
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev
                    )
                  }
                  style={{
                    position: "absolute",
                    right: "14px",
                    top: "50%",
                    transform:
                      "translateY(-50%)",
                    cursor: "pointer",
                    color: "#0d214d",
                  }}
                >
                  <i
                    className={
                      showPassword
                        ? "ti ti-eye"
                        : "ti ti-eye-off"
                    }
                  ></i>
                </span>
              </div>

              {/* PASSWORD STRENGTH BARS */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(4,1fr)",
                  gap: "10px",
                  marginTop: "16px",
                }}
              >
                {[1, 2, 3, 4].map(
                  (item) => (
                    <div
                      key={item}
                      style={{
                        height: "4px",
                        background:
                          passwordStrength >=
                          item
                            ? "#c49336"
                            : "#e5e7eb",
                        borderRadius:
                          "3px",
                        transition:
                          "0.2s",
                      }}
                    ></div>
                  )
                )}
              </div>

              <p
                style={{
                  margin: "10px 0 0",
                  color: "#667085",
                  fontSize: "12px",
                }}
              >
                Use 8 or more characters with a
                mix of letters, numbers &
                symbols.
              </p>
            </div>

            {/* CONFIRM PASSWORD */}

            <div
              style={{
                marginBottom: "16px",
              }}
            >
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#111827",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                Confirm Password
              </label>

              <div
                style={{
                  position: "relative",
                }}
              >
                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    confirmPassword
                  }
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  style={{
                    width: "100%",
                    height: "38px",
                    border:
                      "1px solid #dfe3e8",
                    borderRadius: "5px",
                    padding:
                      "0 42px 0 12px",
                    outline: "none",
                  }}
                />

                <span
                  onClick={() =>
                    setShowConfirmPassword(
                      (prev) => !prev
                    )
                  }
                  style={{
                    position: "absolute",
                    right: "14px",
                    top: "50%",
                    transform:
                      "translateY(-50%)",
                    cursor: "pointer",
                    color: "#0d214d",
                  }}
                >
                  <i
                    className={
                      showConfirmPassword
                        ? "ti ti-eye"
                        : "ti ti-eye-off"
                    }
                  ></i>
                </span>
              </div>
            </div>

            {/* BUTTON */}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                height: "40px",
                background:
                  "#c49336",
                border:
                  "1px solid #c49336",
                color: "#fff",
                fontWeight: 600,
                borderRadius: "5px",
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
                opacity: loading
                  ? 0.7
                  : 1,
              }}
            >
              {loading
                ? "Resetting..."
                : "Submit"}
            </button>
          </form>
        </div>

        {/* FOOTER */}

        <div
          style={{
            marginTop: "auto",
            marginBottom: "20px",
            textAlign: "center",
            color: "#0f172a",
            fontSize: "14px",
          }}
        >
          Copyright © 2025 -
          Adequateinfosoft
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
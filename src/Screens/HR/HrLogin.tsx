import { useNavigate } from "react-router-dom";
import { useState } from "react";

import logo from "../../assets/img/logo.webp";
import bg1 from "../../assets/img/bg/bg-01.png";
import bg2 from "../../assets/img/bg/bg-02.png";
import bg3 from "../../assets/img/bg/bg-03.png";
import authBg from "../../assets/img/bg/authentication-bg-01.png";

import { loginUser } from "../../services/authservices";

const HrLogin = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!formData.email.trim()) {
      alert("Please enter email address");
      return;
    }

    if (!formData.password.trim()) {
      alert("Please enter password");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        email: formData.email.trim(),
        password: formData.password,

        loginDevice: {
          deviceId: "WEB-HR-001",
          deviceName:
            navigator.userAgent || "Web Browser",
          publicIP: "",
          location: "India",
        },

        role: 1,
      };

      console.log("HR Login Payload:", payload);

      const response = await loginUser(payload);

      console.log("HR Login Response:", response);

      if (
        response?.statusCode === 200 &&
        response?.data
      ) {
        const userData = response.data;

        const userType = Number(
          userData?.userType
        );

        if (userType !== 1) {
          alert(
            `You are not an HR user. UserType: ${userType}`
          );
          return;
        }

        // Token handling
        const accessToken =
          userData?.tokens?.accessToken?.token ||
          userData?.tokens?.accessToken;

        if (accessToken) {
          localStorage.setItem(
            "token",
            accessToken
          );
        }

        const refreshToken =
          userData?.tokens?.refreshToken?.token ||
          userData?.tokens?.refreshToken;

        if (refreshToken) {
          localStorage.setItem(
            "refreshToken",
            refreshToken
          );
        }

        if (
          userData?.userId !== undefined &&
          userData?.userId !== null
        ) {
          localStorage.setItem(
            "userId",
            String(userData.userId)
          );
        }

        if (userData?.userName) {
          localStorage.setItem(
            "userName",
            userData.userName
          );
        }

        localStorage.setItem(
          "userType",
          String(userType)
        );

        localStorage.setItem(
          "email",
          formData.email.trim()
        );

        if (rememberMe) {
          localStorage.setItem(
            "rememberEmail",
            formData.email.trim()
          );
        } else {
          localStorage.removeItem(
            "rememberEmail"
          );
        }

        alert(
          response?.message ||
            "Login Successful"
        );

        navigate("/Hr/HrDashboard");
      } else {
        alert(
          response?.message ||
            "You are not currently registered"
        );
      }
    } catch (error: any) {
      console.error("HR Login Error:", error);

      console.error(
        "Backend Error:",
        error?.response?.data
      );

      alert(
        error?.response?.data?.message ||
          error?.message ||
          "You are not currently registered"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-wrapper">
      <div className="container-fluid">
        <div className="w-100 overflow-hidden position-relative vh-100">
          <div className="row">

            {/* LEFT SIDE */}
            <div className="col-lg-5 d-none d-lg-block">
              <div className="login-background d-flex align-items-center justify-content-center vh-100 position-relative">

                <div className="bg-overlay-img">
                  <img
                    src={bg1}
                    className="bg-1 img-fluid"
                    alt="bg1"
                  />

                  <img
                    src={bg2}
                    className="bg-2 img-fluid"
                    alt="bg2"
                  />

                  <img
                    src={bg3}
                    className="bg-3 img-fluid"
                    alt="bg3"
                  />
                </div>

                <div className="authentication-card w-100">
                  <div className="authen-overlay-item border w-100 p-4 text-center">

                    <h1 className="text-white display-6">
                      Empowering people <br />
                      through seamless HR <br />
                      management.
                    </h1>

                    <div className="my-4">
                      <img
                        src={authBg}
                        alt="auth"
                        className="img-fluid"
                      />
                    </div>

                    <p className="text-white fs-5 fw-semibold">
                      Efficiently manage your workforce,
                      streamline operations effortlessly.
                    </p>

                  </div>
                </div>

              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="col-lg-7 col-12">

              <div className="d-flex align-items-center justify-content-center vh-100">

                <div className="col-md-7">

                  <form
                    className="p-4"
                    onSubmit={handleLogin}
                  >

                    {/* LOGO */}
                    <div className="text-center mb-4">
                      <img
                        src={logo}
                        alt="logo"
                        style={{
                          height: "50px",
                        }}
                      />
                    </div>

                    {/* TITLE */}
                    <div className="text-center mb-3">
                      <h1>Sign In</h1>

                      <p>
                        Please enter your details
                        to sign in
                      </p>
                    </div>

                    {/* EMAIL */}
                    <div className="mb-3">
                      <label className="form-label">
                        Email Address
                      </label>

                      <div className="input-group">
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="form-control border-end-0"
                          placeholder="Enter email address"
                          autoComplete="email"
                        />

                        <span className="input-group-text border-start-0">
                          <i className="ti ti-mail"></i>
                        </span>
                      </div>
                    </div>

                    {/* PASSWORD */}
                    <div className="mb-3">
                      <label className="form-label">
                        Password
                      </label>

                      <div className="input-group">
                        <input
                          type={
                            showPassword
                              ? "text"
                              : "password"
                          }
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="form-control border-end-0"
                          placeholder="Enter password"
                          autoComplete="current-password"
                        />

                        <span
                          className="input-group-text border-start-0"
                          style={{
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            setShowPassword(
                              (prev) => !prev
                            )
                          }
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
                    </div>

                    {/* REMEMBER + FORGOT */}
                    <div className="d-flex justify-content-between align-items-center mb-3">

                      <div>
                        <input
                          type="checkbox"
                          id="remember"
                          checked={rememberMe}
                          onChange={(e) =>
                            setRememberMe(
                              e.target.checked
                            )
                          }
                        />

                        <label
                          htmlFor="remember"
                          className="ms-2"
                        >
                          Remember Me
                        </label>
                      </div>

                      <a
                        href="#"
                        className="text-danger"
                        onClick={(e) => {
                          e.preventDefault();

                          navigate(
                            "/Hr/ForgetPassword"
                          );
                        }}
                      >
                        Forgot Password?
                      </a>
                    </div>

                    {/* BUTTON */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn w-100"
                      style={{
                        backgroundColor:
                          "#b88d3c",
                        border:
                          "1px solid #b88d3c",
                        color: "#fff",
                        padding:
                          "10px 28px",
                      }}
                    >
                      {loading
                        ? "Signing In..."
                        : "Sign In"}
                    </button>

                    {/* REGISTER */}
                    <div className="auth-register-text mt-3 text-center">

                      <span>
                        Don&apos;t have an account?{" "}
                      </span>

                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();

                          navigate(
                            "/Hr/HrSignup"
                          );
                        }}
                      >
                        Create Account
                      </a>

                    </div>

                  </form>

                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HrLogin;  
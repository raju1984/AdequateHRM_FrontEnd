import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { registerUser } from "../../services/authservices";

import logo from "../../assets/img/logo.webp";
import bg1 from "../../assets/img/bg/bg-01.png";
import bg2 from "../../assets/img/bg/bg-02.png";
import bg3 from "../../assets/img/bg/bg-03.png";
import authBg from "../../assets/img/bg/authentication-bg-01.png";

const HrSignup = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [agreeTerms, setAgreeTerms] =
    useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
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

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!formData.firstName.trim()) {
      alert("Please enter first name");
      return;
    }

    if (!formData.lastName.trim()) {
      alert("Please enter last name");
      return;
    }

    if (!formData.email.trim()) {
      alert("Please enter email address");
      return;
    }

    if (!formData.password.trim()) {
      alert("Please enter password");
      return;
    }

    if (!agreeTerms) {
      alert(
        "Please agree to Terms & Privacy"
      );
      return;
    }

    try {
      setLoading(true);

      const payload = {
        firstName:
          formData.firstName.trim(),

        lastName:
          formData.lastName.trim(),

        email:
          formData.email.trim(),

        password:
          formData.password,

        role: 1,
      };

      console.log(
        "HR Registration Payload:",
        payload
      );

      const response =
        await registerUser(payload);

      console.log(
        "HR Registration Response:",
        response
      );

      if (
        response?.statusCode === 200 ||
        response?.statusCode === 201
      ) {
        alert(
          response?.message ||
            "Registration Successful"
        );

        navigate("/Hr/HrLogin");
      } else {
        alert(
          response?.message ||
            "Registration Failed"
        );
      }
    } catch (error: any) {
      console.error(
        "HR Registration Error:",
        error
      );

      console.error(
        "Backend Error:",
        error?.response?.data
      );

      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Registration Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-wrapper">

      <div className="container-fluid">

        <div className="w-100 overflow-hidden position-relative flex-wrap d-block vh-100">

          <div className="row">

            {/* LEFT SIDE */}
            <div className="col-lg-5">

              <div className="login-background position-relative d-lg-flex align-items-center justify-content-center d-none flex-wrap vh-100">

                <div className="bg-overlay-img">

                  <img
                    src={bg1}
                    className="bg-1"
                    alt="Background 1"
                  />

                  <img
                    src={bg2}
                    className="bg-2"
                    alt="Background 2"
                  />

                  <img
                    src={bg3}
                    className="bg-3"
                    alt="Background 3"
                  />

                </div>

                <div className="authentication-card w-100">

                  <div className="authen-overlay-item border w-100">

                    <h1 className="text-white display-1">
                      Empowering people <br />
                      through seamless HR <br />
                      management.
                    </h1>

                    <div className="my-4 mx-auto authen-overlay-img">

                      <img
                        src={authBg}
                        alt="Authentication"
                      />

                    </div>

                    <div>

                      <p className="text-white fs-20 fw-semibold text-center">
                        Efficiently manage your
                        workforce, streamline <br />
                        operations effortlessly.
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* RIGHT SIDE */}
            <div className="col-lg-7 col-md-12 col-sm-12">

              <div className="row justify-content-center align-items-center vh-100 overflow-auto flex-wrap">

                <div className="col-md-7 mx-auto vh-100">

                  <form
                    className="vh-100"
                    onSubmit={handleSubmit}
                  >

                    <div className="vh-100 d-flex flex-column justify-content-between p-4 pb-0">

                      {/* LOGO */}
                      <div className="mx-auto mb-5 text-center">

                        <img
                          src={logo}
                          className="img-fluid logo_size"
                          alt="Logo"
                        />

                      </div>

                      {/* CONTENT */}
                      <div>

                        {/* TITLE */}
                        <div className="text-center mb-3">

                          <h2 className="mb-2">
                            Sign Up
                          </h2>

                          <p className="mb-0">
                            Please enter your
                            details to sign up
                          </p>

                        </div>

                        {/* FIRST NAME */}
                        <div className="mb-3">

                          <label className="form-label">
                            First name
                          </label>

                          <div className="input-group">

                            <input
                              type="text"
                              name="firstName"
                              value={
                                formData.firstName
                              }
                              onChange={
                                handleChange
                              }
                              className="form-control border-end-0"
                              placeholder="Enter first name"
                              autoComplete="given-name"
                            />

                            <span className="input-group-text border-start-0">
                              <i className="ti ti-user"></i>
                            </span>

                          </div>
                        </div>

                        {/* LAST NAME */}
                        <div className="mb-3">

                          <label className="form-label">
                            Last name
                          </label>

                          <div className="input-group">

                            <input
                              type="text"
                              name="lastName"
                              value={
                                formData.lastName
                              }
                              onChange={
                                handleChange
                              }
                              className="form-control border-end-0"
                              placeholder="Enter last name"
                              autoComplete="family-name"
                            />

                            <span className="input-group-text border-start-0">
                              <i className="ti ti-user"></i>
                            </span>

                          </div>
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
                              value={
                                formData.email
                              }
                              onChange={
                                handleChange
                              }
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
                              value={
                                formData.password
                              }
                              onChange={
                                handleChange
                              }
                              className="form-control border-end-0"
                              placeholder="Enter password"
                              autoComplete="new-password"
                            />

                            <span
                              className="input-group-text border-start-0"
                              style={{
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                setShowPassword(
                                  (prev) =>
                                    !prev
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

                        {/* TERMS */}
                        <div className="d-flex align-items-center justify-content-between mb-3">

                          <div className="form-check form-check-md mb-0">

                            <input
                              className="form-check-input"
                              id="terms"
                              type="checkbox"
                              checked={agreeTerms}
                              onChange={(e) =>
                                setAgreeTerms(
                                  e.target.checked
                                )
                              }
                            />

                            <label
                              htmlFor="terms"
                              className="form-check-label text-dark mt-0"
                            >
                              Agree to{" "}

                              <span className="text-primary">
                                Terms & Privacy
                              </span>

                            </label>

                          </div>

                        </div>

                        {/* BUTTON */}
                        <div className="mb-3">

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
                              ? "Signing Up..."
                              : "Sign Up"}
                          </button>

                        </div>

                        {/* SIGN IN */}
                        <div className="text-center">

                          <h6 className="fw-normal text-dark mb-0">

                            Already have an
                            account?{" "}

                            <a
                              href="#"
                              className="hover-a"
                              onClick={(e) => {
                                e.preventDefault();

                                navigate(
                                  "/Hr/HrLogin"
                                );
                              }}
                            >
                              Sign In
                            </a>

                          </h6>

                        </div>

                      </div>

                      {/* FOOTER */}
                      <div className="mt-5 pb-4 text-center">

                        <p className="mb-0 text-gray-9">
                          Copyright &copy; 2025 -
                          Adequateinfosoft
                        </p>

                      </div>

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

export default HrSignup;
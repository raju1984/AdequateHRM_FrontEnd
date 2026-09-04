import { useNavigate } from "react-router-dom";

import logo from "../../assets/img/logo.webp";

import bg1 from "../../assets/img/bg/bg-01.png";
import bg2 from "../../assets/img/bg/bg-02.png";
import bg3 from "../../assets/img/bg/bg-03.png";

import authBg from "../../assets/img/bg/authentication-bg-01.png";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="main-wrapper">

      <div className="container-fuild">
        <div className="w-100 overflow-hidden position-relative flex-wrap d-block vh-100">

          <div className="row">

            {/* LEFT SIDE */}
            <div className="col-lg-5">

              <div className="login-background position-relative d-lg-flex align-items-center justify-content-center d-none flex-wrap vh-100">

                <div className="bg-overlay-img">
                  <img src={bg1} className="bg-1" alt="Img" />
                  <img src={bg2} className="bg-2" alt="Img" />
                  <img src={bg3} className="bg-3" alt="Img" />
                </div>

                <div className="authentication-card w-100">
                  <div className="authen-overlay-item border w-100">

                    <h1 className="text-white display-1">
                      Empowering people <br />
                      through seamless HR <br />
                      management.
                    </h1>

                    <div className="my-4 mx-auto authen-overlay-img">
                      <img src={authBg} alt="Img" />
                    </div>

                    <div>
                      <p className="text-white fs-20 fw-semibold text-center">
                        Efficiently manage your workforce, streamline <br />
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

                  <form className="vh-100" onSubmit={handleSubmit}>

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

                        <div className="text-center mb-3">
                          <h2 className="mb-2">Forgot Password?</h2>

                          <p className="mb-0">
                            If you forgot your password, well, then we'll email
                            you instructions to reset your password.
                          </p>
                        </div>

                        {/* EMAIL */}
                        <div className="mb-3">
                          <label className="form-label">
                            Email Address
                          </label>

                          <div className="input-group">
                            <input
                              type="text"
                              className="form-control border-end-0"
                            />

                            <span className="input-group-text border-start-0">
                              <i className="ti ti-mail"></i>
                            </span>
                          </div>
                        </div>

                        {/* BUTTON */}
                        <div className="mb-3">
                          <button
  type="submit"
  className="btn w-100"
  style={{
    backgroundColor: "#b88d3c",
    border: "1px solid #b88d3c",
    color: "#fff",
    padding: "10px 28px"
  }}
>
  Submit
</button>
                        </div>

                        {/* SIGN IN */}
                        <div className="text-center">
                          <h6 className="fw-normal text-dark mb-0">
                            Return to{" "}

                          <a
  href="#"
  className="hover-a"
  onClick={(e) => {
    e.preventDefault();
    navigate("/admin/adminLogin");
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
                          Copyright &copy; 2025 - Adequateinfosoft
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

export default ForgotPassword;
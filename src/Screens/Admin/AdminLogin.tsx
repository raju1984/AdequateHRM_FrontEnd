
// SELECT * FROM Users
// WHERE Email = 'admin@gmail.com';


import { useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../../assets/img/logo.webp";
import bg1 from "../../assets/img/bg/bg-01.png";
import bg2 from "../../assets/img/bg/bg-02.png";
import bg3 from "../../assets/img/bg/bg-03.png";
import authBg from "../../assets/img/bg/authentication-bg-01.png";
import { loginUser } from "../../services/authservices";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

     const payload = {
  email,
  password,
  role: 0,
  loginDevice: {
    deviceId: crypto.randomUUID(),
    deviceName: navigator.userAgent,
    publicIP: "",
    location: "",
  },
};

      const response = await loginUser(payload);

           console.log("Login Response:", response);
           console.log("User Type:", response?.data?.userType);
           console.log("Response Data:", response?.data);


      // Save token if API returns 0
     if (response?.data?.tokens?.accessToken) {
  localStorage.setItem(
    "token",
    response.data.tokens.accessToken
  );
}
      localStorage.setItem("user", JSON.stringify(response));

      if (response?.statusCode === 200) {
  const userType = response.data.userType;

  if (userType === 0) {
    navigate("/Admin/Dashboard");
  } else {
    alert("You are not an Admin");
  }
}
    } catch (error: any) {
      console.error(error);

      alert(
        error?.response?.data?.message ||
          "Invalid email or password"
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
                  <img src={bg1} className="bg-1 img-fluid" alt="bg1" />
                  <img src={bg2} className="bg-2 img-fluid" alt="bg2" />
                  <img src={bg3} className="bg-3 img-fluid" alt="bg3" />
                </div>

                <div className="authentication-card w-100">
                  <div className="authen-overlay-item border w-100 p-4 text-center">
                    <h1 className="text-white display-6">
                      Empowering people
                      <br />
                      through seamless HR
                      <br />
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
                  <form className="p-4" onSubmit={handleLogin}>
                    <div className="text-center mb-4">
                      <img
                        src={logo}
                        alt="logo"
                        style={{ height: "50px" }}
                      />
                    </div>

                    <div className="text-center mb-3">
                      <h1>Sign In</h1>
                      <p>Please enter your details to sign in</p>
                    </div>

                    {/* EMAIL */}
                    <div className="mb-3">
                      <label className="form-label">
                        Email Address
                      </label>
                      <div className="input-group">
                        <input
                          type="email"
                          className="form-control border-end-0"
                          value={email}
                          onChange={(e) =>
                            setEmail(e.target.value)
                          }
                          required
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
                            showPassword ? "text" : "password"
                          }
                          className="form-control border-end-0"
                          value={password}
                          onChange={(e) =>
                            setPassword(e.target.value)
                          }
                          required
                        />

                        <span
                          className="input-group-text border-start-0"
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            setShowPassword(!showPassword)
                          }
                        >
                          <i
                            className={
                              showPassword
                                ? "ti ti-eye"
                                : "ti ti-eye-off"
                            }
                          />
                        </span>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between mb-3">
                      <div>
                        <input type="checkbox" id="remember" />
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
                          navigate("/forgot-password");
                        }}
                      >
                        Forgot Password?
                      </a>
                    </div>

                    <button
                      type="submit"
                      className="btn w-100"
                      disabled={loading}
                      style={{
                        backgroundColor: "#b88d3c",
                        border: "1px solid #b88d3c",
                        color: "#fff",
                        padding: "10px 28px",
                      }}
                    >
                      {loading ? "Signing In..." : "Sign In"}
                    </button>
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
export default AdminLogin;
import { Link } from "react-router-dom";
import logo from "../assets/img/logo.webp";
import dashboard from "../assets/img/Dashboard.png";
import appoinment from "../assets/img/appoinment.png";
import team from "../assets/img/team.png";
import users from "../assets/img/users.png";
import creativity from "../assets/img/creativity.png";
import cloudlock from "../assets/img/cloud-lock.png";
import arrow from "../assets/img/arrow-1.png";
import dashboard3 from "../assets/img/dashbord-3.png";
import dashboard4 from "../assets/img/dashbord-4.png";

const Home = () => {
  return (
    <>
      {/* nav-bar start */}
      <header>
      <nav
  className="navbar navbar-expand-lg fixed-top navbar-custom"
  id="navbar"
>
          <div className="container">
            <div className="navbar-brand logo">
              <a
                className="navbar-caption fs-4 text-primary ls-1 fw-bold"
                href="javascript:void(0);"
              >
                <img src={logo} alt="" height="50" />
              </a>
            </div>

            <ul className="navbar-nav nav-btn">
              <li className="nav-item">
             <Link className="btn btn-orange text-light" to="/admin/selectRole"> Login</Link>
              </li>
            </ul>
          </div>
        </nav>
      </header>
      {/* nav-bar end */}

      {/* hero section */}
      <section className="hero-section bg-img-1 bg-home-1 pb-0" id="home">
        <div className="container">
          <div className="row align-items-center justify-content-center text-center">
            <div className="col-lg-10">
              <h1 className="display-1 fw-semibold lh-base text-primary">
                Empower Your Workforce with Smart{" "}
                <span className="text-orange text-line">
                  HR Management
                </span>
              </h1>

              <p className="mt-4">
                Save time managing employee data and HR processes.
                Use our ready-made HRM solutions to streamline
                recruitment, payroll, and performance tracking —
                so you can focus on growing your business,
                not paperwork.
              </p>

              <div className="main-btn my-5">
             <Link
  to="/admin/selectRole"
  className="btn btn-primary my-2"
>
  Login now!
</Link>
              </div>

              <img
                src={dashboard}
                alt=""
                className="img-fluid mt-5 rounded-4"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="position-relative">
        <div className="shape">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            version="1.1"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            width="1440"
            height="150"
            preserveAspectRatio="none"
            viewBox="0 0 1440 150"
          >
            <g mask='url("#SvgjsMask1022")' fill="none">
              <path
                d="M 0,58 C 144,73 432,131.8 720,133 C 1008,134.2 1296,77.8 1440,64L1440 250L0 250z"
                fill="rgba(255, 255, 255, 1)"
              ></path>
            </g>

            <defs>
              <mask id="SvgjsMask1022">
                <rect width="1440" height="250" fill="#ffffff"></rect>
              </mask>
            </defs>
          </svg>
        </div>
      </div>

      {/* about section */}
      <section className="section about-section pt-5 z-1" id="about">
        <div className="container">
          <div className="row align-items-center justify-content-start g-lg-4 g-3">
            <div className="col-xl-5">
              <div className="title-sm">
                <span>EASY HANDLING</span>
              </div>

              <div className="about-title main-title mt-3">
                <h2 className="text-primary">
                  Discover Powerful Features To Boost{" "}
                  <span className="text-orange text-line p-0">
                    Productivity
                  </span>
                </h2>
              </div>
            </div>

            <div className="col-xl-6 offset-xl-1">
              <div className="row g-lg-4 g-3">
                <div className="col-lg-6 col-md-6">
                  <div className="about-style-two">
                    <div className="icon">
                      <img src={appoinment} alt="Icon" />
                    </div>

                    <h3>
                      <a href="javascript:void(0);">
                        Employee Self-Service Portal
                      </a>
                    </h3>

                    <div className="bottom">
                      <span>Appoinment</span>

                      <a
                        href="javascript:void(0);"
                        className="angle-btn"
                      >
                        <img src={arrow} alt="Arrow Icon" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="col-lg-6 col-md-6">
                  <div className="about-style-two">
                    <div className="icon">
                      <img src={team} alt="Icon" />
                    </div>

                    <h3>
                      <a href="javascript:void(0);">
                        Automated Payroll Management
                      </a>
                    </h3>

                    <div className="bottom">
                      <span>Management</span>

                      <a
                        href="javascript:void(0);"
                        className="angle-btn"
                      >
                        <img src={arrow} alt="Arrow Icon" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-9">
              <div className="row g-lg-4 g-3">
                <div className="col-xl-4 col-lg-6 col-md-6">
                  <div className="about-style-two">
                    <div className="icon">
                      <img src={users} alt="Icon" />
                    </div>

                    <h3>
                      <a href="javascript:void(0);">
                        Smart Attendance Tracking
                      </a>
                    </h3>

                    <div className="bottom">
                      <span>Multi User</span>

                      <a
                        href="javascript:void(0);"
                        className="angle-btn"
                      >
                        <img src={arrow} alt="Arrow Icon" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="col-xl-4 col-lg-6 col-md-6">
                  <div className="about-style-two">
                    <div className="icon">
                      <img src={creativity} alt="Icon" />
                    </div>

                    <h3>
                      <a href="javascript:void(0);">
                        Recruitment & Onboarding
                      </a>
                    </h3>

                    <div className="bottom">
                      <span>Customization</span>

                      <a
                        href="javascript:void(0);"
                        className="angle-btn"
                      >
                        <img src={arrow} alt="Arrow Icon" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="col-xl-4 col-lg-6 col-md-6">
                  <div className="about-style-two">
                    <div className="icon">
                      <img src={cloudlock} alt="Icon" />
                    </div>

                    <h3>
                      <a href="javascript:void(0);">
                        Performance Management
                      </a>
                    </h3>

                    <div className="bottom">
                      <span>Cloud Server</span>

                      <a
                        href="javascript:void(0);"
                        className="angle-btn"
                      >
                        <img src={arrow} alt="Arrow Icon" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3">
              <div className="about-style-two">
                <div className="icon">
                  <img src={appoinment} alt="Icon" />
                </div>

                <h3>
                  <a href="javascript:void(0);">
                    Analytics & Reports
                  </a>
                </h3>

                <div className="bottom">
                  <span>Website</span>

                  <a
                    href="javascript:void(0);"
                    className="angle-btn"
                  >
                    <img src={arrow} alt="Arrow Icon" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* feature section */}
      <section className="section feature-section bg-light">
        <div className="container">
          <div className="row align-items-center justify-content-between">
            <div className="col-lg-5">
              <div className="title-sm">
                <span>STRUCTURE</span>
              </div>

              <div className="feature-title main-title mt-3">
                <h2 className="text-primary">
                  Discover All{" "}
                  <span className="text-orange text-line">
                    Our Features
                  </span>
                </h2>

                <p className="my-3">
                  Nam libero tempore, cum soluta nobis est eligendi
                  optio cumque nihil impedit quo minus id quod maxime
                  placeat facere possimus.
                </p>
              </div>

              <div className="row mt-4 g-lg-4 g-3">
                <div className="col-lg-6">
                  <h6 className="text-primary fw-semibold">
                    <i className="ri-checkbox-blank-circle-fill text-orange me-3"></i>
                    Trends Tracking
                  </h6>
                </div>

                <div className="col-lg-6">
                  <h6 className="text-primary fw-semibold">
                    <i className="ri-checkbox-blank-circle-fill text-orange me-3"></i>
                    Loyalty Programs
                  </h6>
                </div>

                <div className="col-lg-6">
                  <h6 className="text-primary fw-semibold">
                    <i className="ri-checkbox-blank-circle-fill text-orange me-3"></i>
                    Vendor Management
                  </h6>
                </div>

                <div className="col-lg-6">
                  <h6 className="text-primary fw-semibold">
                    <i className="ri-checkbox-blank-circle-fill text-orange me-3"></i>
                    Billing
                  </h6>
                </div>
              </div>

              <div className="feature-link mt-5">
                <a
                  href="javascript:void(0);"
                  className="btn btn-primary"
                >
                  All categories
                </a>
              </div>
            </div>

            <div className="col-lg-6">
              <img
                src={dashboard3}
                alt=""
                className="img-fluid"
              />
            </div>
          </div>
        </div>
      </section>

      {/* services section */}
      <section className="section services-section" id="services">
        <div className="container">
          <div className="row align-items-center justify-content-between">
            <div className="col-lg-6">
              <img
                src={dashboard4}
                alt=""
                className="img-fluid"
              />
            </div>

            <div className="col-lg-5">
              <div className="title-sm">
                <span>PERFORMANCE METRICS</span>
              </div>

              <div className="feature-title main-title mt-3">
                <h2 className="text-primary">
                  Grow Up Your Business With In{" "}
                  <span className="text-orange text-line">
                    5 Minutes
                  </span>
                </h2>

                <p className="my-3">
                  The passage experienced a surge in popularity
                  during the 1960s when Letraset used it.
                </p>
              </div>

              <div className="row mt-4">
                <div className="col-lg-6">
                  <div className="counter">
                    <h3 className="text-primary fw-bold">
                      200K
                    </h3>

                    <h6 className="text-muted">
                      Active user from the community
                    </h6>
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="counter">
                    <h3 className="text-primary fw-bold">
                      90%
                      <span className="fs-6 text-muted">
                        (Positive Rating)
                      </span>
                    </h3>

                    <ul className="d-flex text-orange list-unstyled">
                      <li>
                        <i className="ri-star-fill"></i>
                      </li>
                      <li>
                        <i className="ri-star-fill"></i>
                      </li>
                      <li>
                        <i className="ri-star-fill"></i>
                      </li>
                      <li>
                        <i className="ri-star-fill"></i>
                      </li>
                      <li>
                        <i className="ri-star-half-fill"></i>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <ul className="services-detail mt-4 list-unstyled">
                <li>
                  <i className="ri-checkbox-blank-circle-fill"></i>

                  <h6 className="text-dark">
                    Get Overview at a glance.
                  </h6>
                </li>

                <li className="my-3">
                  <i className="ri-checkbox-blank-circle-fill"></i>

                  <h6 className="text-dark">
                    Deposite funds easily, security.
                  </h6>
                </li>

                <li>
                  <i className="ri-checkbox-blank-circle-fill"></i>

                  <h6 className="text-dark">
                    First Working Process.
                  </h6>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="section footer-part-3 py-5 footer-part">
        <div className="container">
          <p className="mb-0 text-center">
            © Copyright 2017-2025 by Adequateinfosoft.
            All Rights Reserved.
          </p>
        </div>
      </footer>
    </>
  );
};

export default Home;
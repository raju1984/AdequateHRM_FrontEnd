import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

import logo from "../../assets/img/logo.webp";
import authBg from "../../assets/img/bg/authentication-bg-01.png";

const HROTP = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  const [seconds, setSeconds] = useState(599);

  const inputsRef =
    useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (value: number) => {
    const minutes = Math.floor(value / 60);
    const secs = value % 60;

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  };

  const handleChange = (
    index: number,
    value: string
  ) => {
    if (!/^\d?$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;

    setOtp(newOtp);

    if (
      value &&
      index < inputsRef.current.length - 1
    ) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 6) {
      alert("Please enter complete 6 digit OTP");
      return;
    }

    console.log("Entered HR OTP:", enteredOtp);
    console.log("HR Email:", email);

    navigate("/Hr/HRResetPassword", {
      state: {
        email,
        otp: enteredOtp,
      },
    });
  };

  const handleResend = () => {
    setSeconds(599);

    setOtp([
      "",
      "",
      "",
      "",
      "",
      "",
    ]);

    inputsRef.current[0]?.focus();

    console.log("Resend OTP for HR:", email);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        background: "#ffffff",
      }}
    >
      {/* LEFT SECTION */}

      <div
        className="d-none d-lg-flex"
        style={{
          width: "40.7%",
          minHeight: "100vh",
          background:
            "linear-gradient(180deg, #c79a43 0%, #9c7d3e 100%)",
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
              color: "#ffffff",
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
              alignItems: "flex-end",
              justifyContent: "center",
              marginTop: "20px",
              marginBottom: "20px",
            }}
          >
            <img
              src={authBg}
              alt="HR Management"
              style={{
                width: "100%",
                maxWidth: "360px",
                height: "300px",
                objectFit: "contain",
                objectPosition: "center bottom",
              }}
            />
          </div>

          <div
            style={{
              textAlign: "center",
              color: "#ffffff",
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

          <div
            style={{
              position: "absolute",
              width: "55px",
              height: "95px",
              borderRadius: "50%",
              border:
                "3px solid rgba(255,255,255,0.55)",
              right: "-23px",
              bottom: "30px",
              transform: "rotate(30deg)",
            }}
          ></div>
        </div>
      </div>

      {/* RIGHT SECTION */}

      <div
        style={{
          width: "59.3%",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "#ffffff",
          position: "relative",
        }}
        className="flex-grow-1"
      >
        <div
          style={{
            marginTop: "30px",
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

        <div
          style={{
            width: "100%",
            maxWidth: "500px",
            marginTop: "105px",
            padding: "0 20px",
          }}
        >
          <form onSubmit={handleSubmit}>
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
                Email OTP Verification
              </h2>

              <p
                style={{
                  margin: "10px auto 17px",
                  color: "#667085",
                  fontSize: "14px",
                  lineHeight: "1.5",
                }}
              >
                Please enter the OTP received to confirm your
                account
                <br />
                ownership. A code has been sent to{" "}
                {email}
              </p>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "12px",
                marginTop: "16px",
              }}
            >
              {otp.map((value, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    inputsRef.current[index] =
                      element;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={value}
                  onChange={(e) =>
                    handleChange(
                      index,
                      e.target.value
                    )
                  }
                  onKeyDown={(e) =>
                    handleKeyDown(index, e)
                  }
                  style={{
                    width: "60px",
                    height: "65px",
                    border:
                      "2px solid #e1e5eb",
                    borderRadius: "5px",
                    textAlign: "center",
                    outline: "none",
                    fontSize: "26px",
                    fontWeight: 600,
                    color: "#0d214d",
                    background: "#ffffff",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor =
                      "#c39339";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      "#e1e5eb";
                  }}
                />
              ))}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "18px",
              }}
            >
              <div
                style={{
                  background: "#ffdfe0",
                  color: "#ff3b3b",
                  padding: "3px 8px",
                  borderRadius: "4px",
                  fontSize: "11px",
                  fontWeight: 600,
                }}
              >
                ⏱ {formatTime(seconds)}
              </div>
            </div>

            <div
              style={{
                textAlign: "center",
                marginTop: "16px",
                fontSize: "14px",
                color: "#111827",
              }}
            >
              Didn&apos;t get the OTP?{" "}

              <span
                onClick={handleResend}
                style={{
                  color: "#c39339",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                Resend OTP
              </span>
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                height: "40px",
                background: "#c49336",
                border: "1px solid #c49336",
                color: "#ffffff",
                fontWeight: 600,
                borderRadius: "5px",
                marginTop: "18px",
                cursor: "pointer",
              }}
            >
              Verify & Proceed
            </button>
          </form>
        </div>

        <div
          style={{
            marginTop: "auto",
            marginBottom: "20px",
            textAlign: "center",
            color: "#0f172a",
            fontSize: "14px",
          }}
        >
          Copyright © 2025 - Adequateinfosoft
        </div>
      </div>
    </div>
  );
};

export default HROTP;
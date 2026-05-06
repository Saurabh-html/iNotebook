import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import config from "../config";

const ForgotPassword = (props) => {

  const [data, setData] = useState({
    email: "",
    password: "",
    cpassword: ""
  });

  const [otp, setOtp] = useState("");

  const [otpSent, setOtpSent] = useState(false);

  const [timer, setTimer] = useState(0);

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // OTP TIMER
  useEffect(() => {

    let interval = null;

    if (timer > 0) {

      interval = setInterval(() => {

        setTimer(prev => prev - 1);

      }, 1000);
    }

    return () => clearInterval(interval);

  }, [timer]);

  // SEND OTP
  const sendOtp = async () => {

    if (!data.email) {

      props.showAlert(
        "Please enter email first",
        "warning"
      );

      return;
    }

    try {

      setLoading(true);

      const response = await fetch(
        `${config.API_URL}/api/auth/send-forgot-otp`,
        {

          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            email: data.email
          })
        }
      );

      const json = await response.json();

      if (json.success) {

        setOtpSent(true);

        setTimer(30);

        props.showAlert(
          "OTP sent successfully",
          "success"
        );

      } else {

        props.showAlert(
          json.message || "Failed to send OTP",
          "danger"
        );
      }

    } catch (error) {

      console.log(error);

      props.showAlert(
        "Server Error",
        "danger"
      );

    } finally {

      setLoading(false);
    }
  };

  // UPDATE PASSWORD
  const handleSubmit = async (e) => {

    e.preventDefault();

    if (data.password !== data.cpassword) {

      props.showAlert(
        "Passwords do not match",
        "danger"
      );

      return;
    }

    if (!otpSent) {

      props.showAlert(
        "Please verify OTP first",
        "warning"
      );

      return;
    }

    if (otp.length !== 6) {

      props.showAlert(
        "Enter valid OTP",
        "warning"
      );

      return;
    }

    try {

      const response = await fetch(
        `${config.API_URL}/api/auth/forgotpassword`,
        {

          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            email: data.email,
            password: data.password,
            otp
          })
        }
      );

      const json = await response.json();

      if (json.success) {

        props.showAlert(
          "Password updated successfully",
          "success"
        );

        navigate("/login");

      } else {

        props.showAlert(
          json.error || "Failed",
          "danger"
        );
      }

    } catch (error) {

      console.log(error);

      props.showAlert(
        "Server Error",
        "danger"
      );
    }
  };

  // INPUT CHANGE
  const onChange = (e) => {

    setData({
      ...data,
      [e.target.name]: e.target.value
    });
  };

  return (

    <div className="auth-page">

      <div className="auth-card">

        <h1 className="auth-title">
          Reset Password 🔐
        </h1>

        <p className="auth-subtitle">
          Verify OTP and create a new password
        </p>

        <form onSubmit={handleSubmit}>

          {/* EMAIL */}
          <div className="auth-input-group">

            <i className="fa-solid fa-envelope"></i>

            <input
              type="email"
              className="auth-input"
              placeholder="Email Address"
              name="email"
              value={data.email}
              onChange={onChange}
              required
            />

          </div>

          {/* PASSWORD */}
          <div className="auth-input-group">

            <i className="fa-solid fa-lock"></i>

            <input
              type="password"
              className="auth-input"
              placeholder="New Password"
              name="password"
              value={data.password}
              onChange={onChange}
              required
            />

          </div>

          {/* CONFIRM PASSWORD */}
          <div className="auth-input-group">

            <i className="fa-solid fa-shield-halved"></i>

            <input
              type="password"
              className="auth-input"
              placeholder="Confirm Password"
              name="cpassword"
              value={data.cpassword}
              onChange={onChange}
              required
            />

          </div>

          {/* SEND OTP BUTTON */}
          <button
            type="button"
            className="auth-btn mb-3"
            onClick={sendOtp}
            disabled={loading || timer > 0}
          >

            {
              timer > 0
                ? `Resend OTP in ${timer}s`
                : loading
                  ? "Sending OTP..."
                  : otpSent
                    ? "Resend OTP"
                    : "Send OTP"
            }

          </button>

          {/* OTP BOXES */}
          {
            otpSent && (

              <div className="otp-container">

                {
                  [0,1,2,3,4,5].map((index) => (

                    <input
                      key={index}

                      type="text"

                      inputMode="numeric"

                      maxLength="1"

                      className="otp-box"

                      value={otp[index] || ""}

                      onChange={(e) => {

                        const value = e.target.value;

                        if (!/^[0-9]?$/.test(value))
                          return;

                        const newOtp = otp.split('');

                        newOtp[index] = value;

                        setOtp(newOtp.join(''));

                        // AUTO NEXT FOCUS
                        if (
                          value &&
                          e.target.nextSibling
                        ) {

                          e.target.nextSibling.focus();
                        }
                      }}

                      onKeyDown={(e) => {

                        // BACKSPACE PREVIOUS
                        if (
                          e.key === "Backspace" &&
                          !otp[index] &&
                          e.target.previousSibling
                        ) {

                          e.target.previousSibling.focus();
                        }
                      }}

                      onPaste={(e) => {

                        e.preventDefault();

                        const pastedData =
                          e.clipboardData
                            .getData("text")
                            .trim();

                        if (!/^[0-9]{6}$/.test(pastedData))
                          return;

                        setOtp(pastedData);

                        const inputs =
                          document.querySelectorAll('.otp-box');

                        inputs.forEach((input, i) => {

                          input.value = pastedData[i];
                        });

                        inputs[5].focus();
                      }}
                    />
                  ))
                }

              </div>
            )
          }

          {/* SUBMIT */}
          <button
            type="submit"
            className="auth-btn"
          >
            Update Password
          </button>

          {/* LOGIN */}
          <div className="auth-extra">

            Remember your password?{" "}

            <span
              className="auth-link"
              onClick={() => navigate("/login")}
            >
              Login
            </span>

          </div>

        </form>

      </div>

    </div>
  );
};

export default ForgotPassword;
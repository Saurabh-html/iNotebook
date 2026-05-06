import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import config from "../config";

const UpdatePassword = (props) => {

  const [data, setData] = useState({
    oldPassword: "",
    newPassword: "",
    cPassword: ""
  });

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // TIMER
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

    try {

      setLoading(true);

      const response = await fetch(`${config.API_URL}/api/auth/send-update-otp`, {

        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem(config.TOKEN_KEY)
        }
      });

      const json = await response.json();

      if (json.success) {

        setOtpSent(true);

        setTimer(30);

        props.showAlert("OTP sent successfully", "success");

      } else {

        props.showAlert(json.message, "danger");
      }

    } catch (error) {

      props.showAlert("Server Error", "danger");
    }

    setLoading(false);
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (data.newPassword !== data.cPassword) {

      props.showAlert("Passwords do not match", "danger");

      return;
    }

    if (!otpSent) {

      props.showAlert("Please verify OTP first", "warning");

      return;
    }

    if (otp.length !== 6) {

      props.showAlert("Enter valid OTP", "warning");

      return;
    }

    const response = await fetch(`${config.API_URL}/api/auth/updatepassword`, {

      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "auth-token": localStorage.getItem(config.TOKEN_KEY)
      },

      body: JSON.stringify({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
        otp
      })
    });

    const json = await response.json();

    if (json.success) {

  localStorage.removeItem("token");

  localStorage.removeItem("refreshToken");

  props.showAlert(
    "Password updated successfully. Please login again.",
    "success"
  );

  navigate("/login");
} else {

      props.showAlert(json.error, "danger");
    }
  };

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
          Update Password 🔐
        </h1>

        <p className="auth-subtitle">
          Secure your account with OTP verification
        </p>

        <form onSubmit={handleSubmit}>

          <div className="auth-input-group">
            <i className="fa-solid fa-lock"></i>

            <input
              type="password"
              name="oldPassword"
              className="auth-input"
              placeholder="Current Password"
              onChange={onChange}
              required
            />
          </div>

          <div className="auth-input-group">
            <i className="fa-solid fa-key"></i>

            <input
              type="password"
              name="newPassword"
              className="auth-input"
              placeholder="New Password"
              onChange={onChange}
              required
            />
          </div>

          <div className="auth-input-group">
            <i className="fa-solid fa-shield-halved"></i>

            <input
              type="password"
              name="cPassword"
              className="auth-input"
              placeholder="Confirm Password"
              onChange={onChange}
              required
            />
          </div>

          {/* SEND OTP */}
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
                      maxLength="1"
                      className="otp-box"

                      value={otp[index] || ""}

                      onChange={(e) => {

                        const value = e.target.value;

                        if (!/^[0-9]?$/.test(value)) return;

                        const newOtp = otp.split('');

                        newOtp[index] = value;

                        setOtp(newOtp.join(''));

                        if (
                          value &&
                          e.target.nextSibling
                        ) {
                          e.target.nextSibling.focus();
                        }
                      }}
                    />
                  ))
                }

              </div>
            )
          }

          <button
            type="submit"
            className="auth-btn"
          >
            Update Password
          </button>

        </form>

      </div>

    </div>
  )
}

export default UpdatePassword
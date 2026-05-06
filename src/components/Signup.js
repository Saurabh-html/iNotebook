import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import config from "../config";

const Signup = (props) => {

  const [credentials, setCredentials] = useState({
    name: "",
    email: "",
    password: "",
    cpassword: ""
  });

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  let navigate = useNavigate();

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

  const sendOtp = async () => {

    if (!credentials.email) {
      props.showAlert("Enter email first", "warning");
      return;
    }

    try {

      setLoading(true);

      const response = await fetch(`${config.API_URL}/api/auth/sendotp`, {

        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          email: credentials.email
        })
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

    const { name, email, password, cpassword } = credentials;

    if (password !== cpassword) {

      props.showAlert("Passwords do not match", "danger");

      return;
    }

    if (!otpSent) {

      props.showAlert("Please verify email first", "warning");

      return;
    }

    if (!otp) {

      props.showAlert("Enter OTP", "warning");

      return;
    }

    const response = await fetch(`${config.API_URL}/api/auth/createuser`, {

      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        name,
        email,
        password,
        otp
      })
    });

    const json = await response.json();

    if (json.success) {

      localStorage.setItem(config.TOKEN_KEY, json.authtoken);

      navigate("/", { replace: true });

      props.showAlert("Account Created Successfully", "success");

    } else {

      props.showAlert(json.error || "Invalid Credentials", "danger");
    }
  }

  const onChange = (e) => {

    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="auth-page">

      <div className="auth-card">

        <h1 className="auth-title">
          Create Account 🚀
        </h1>

        <p className="auth-subtitle">
          Secure signup with email verification
        </p>

        <form onSubmit={handleSubmit}>

          <div className="auth-input-group">
            <i className="fa-solid fa-user"></i>

            <input
              type="text"
              className="auth-input"
              placeholder="Full Name"
              name="name"
              onChange={onChange}
              required
            />
          </div>

          <div className="auth-input-group">
            <i className="fa-solid fa-envelope"></i>

            <input
              type="email"
              className="auth-input"
              placeholder="Email Address"
              name="email"
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

                        const newOtp =
                          otp.split('');

                        newOtp[index] = value;

                        setOtp(newOtp.join(''));

                        // AUTO NEXT
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

          <div className="auth-input-group">
            <i className="fa-solid fa-lock"></i>

            <input
              type="password"
              className="auth-input"
              placeholder="Password"
              name="password"
              onChange={onChange}
              minLength={5}
              required
            />
          </div>

          <div className="auth-input-group">
            <i className="fa-solid fa-shield-halved"></i>

            <input
              type="password"
              className="auth-input"
              placeholder="Confirm Password"
              name="cpassword"
              onChange={onChange}
              minLength={5}
              required
            />
          </div>

          <button type="submit" className="auth-btn">
            Create Account
          </button>

          <div className="auth-extra">

            Already have an account?{" "}

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
  )
}

export default Signup
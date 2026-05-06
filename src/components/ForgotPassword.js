import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import config from "../config";

const ForgotPassword = (props) => {
  const [data, setData] = useState({
    email: "",
    password: "",
    cpassword: ""
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (data.password !== data.cpassword) {
      props.showAlert("Passwords do not match", "danger");
      return;
    }

    const response = await fetch(`${config.API_URL}/api/auth/forgotpassword`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password
      })
    });

    const json = await response.json();

    if (json.success) {
      props.showAlert("Password updated successfully", "success");
      navigate("/login");
    } else {
      props.showAlert("Email not found", "danger");
    }
  };

  const onChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <h1 className="auth-title">Reset Password 🔐</h1>

        <p className="auth-subtitle">
          Enter your email and create a new password
        </p>

        <form onSubmit={handleSubmit}>

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

          <div className="auth-input-group">
            <i className="fa-solid fa-lock"></i>

            <input
              type="password"
              className="auth-input"
              placeholder="New Password"
              name="password"
              onChange={onChange}
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
              required
            />
          </div>

          <button type="submit" className="auth-btn">
            Update Password
          </button>

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

export default ForgotPassword
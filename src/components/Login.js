import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import config from "../config";

const Login = (props) => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });

  let navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch(`${config.API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password
      })
    });

    let json;

    try {
      json = await response.json();
    } catch {
      props.showAlert("Server error", "danger");
      return;
    }

    if (json.authtoken) {
      localStorage.setItem(config.TOKEN_KEY, json.authtoken);
      navigate("/", { replace: true });
      props.showAlert("Logged in Successfully", "success");
    } else {
      props.showAlert("Invalid Details", "danger");
    }
  }

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value })
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        <h1 className="auth-title">Welcome Back 👋</h1>
        <p className="auth-subtitle">
          Login to continue using iNotebook
        </p>

        <form onSubmit={handleSubmit}>

          <div className="auth-input-group">
            <i className="fa-solid fa-envelope"></i>

            <input
              type="email"
              className="auth-input"
              placeholder="Enter your email"
              name="email"
              value={credentials.email}
              onChange={onChange}
              required
            />
          </div>

          <div className="auth-input-group">
            <i className="fa-solid fa-lock"></i>

            <input
              type="password"
              className="auth-input"
              placeholder="Enter your password"
              name="password"
              value={credentials.password}
              onChange={onChange}
              required
            />
          </div>

          <div
            className="auth-link"
            onClick={() => navigate("/forgotpassword")}
          >
            Forgot Password?
          </div>

          <button type="submit" className="auth-btn">
            Login
          </button>

          <div className="auth-extra">
            New user?{" "}
            <span
              className="auth-link"
              onClick={() => navigate("/signup")}
            >
              Create Account
            </span>
          </div>

        </form>
      </div>
    </div>
  )
}

export default Login
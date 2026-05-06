import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import config from "../config";

const Signup = (props) => {
  const [credentials, setCredentials] = useState({
    name: "",
    email: "",
    password: "",
    cpassword: ""
  });

  let navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, password, cpassword } = credentials;

    if (password !== cpassword) {
      props.showAlert("Passwords do not match", "danger");
      return;
    }

    const response = await fetch(`${config.API_URL}/api/auth/createuser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password })
    });

    const json = await response.json();

    if (json.success) {
      localStorage.setItem(config.TOKEN_KEY, json.authtoken);
      navigate("/", { replace: true });
      props.showAlert("Account Created Successfully", "success");
    } else {
      props.showAlert("Invalid Credentials", "danger");
    }
  }

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value })
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        <h1 className="auth-title">Create Account 🚀</h1>

        <p className="auth-subtitle">
          Join iNotebook and organize your ideas beautifully
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
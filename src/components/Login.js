import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import config from "../config";

const Login = (props) => {
  const [credentials, setCredentials] = useState({ email: "", password: "" })
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
      navigate("/");
      props.showAlert("Logged in Successfully", "success");
    } else {
      props.showAlert("Invalid Details", "danger");
    }
  }

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value })
  }

  return (
    <div className="mt-2">
      <h2 className="my-3">Login to continue to iNotebook</h2>

      <form onSubmit={handleSubmit}>
        <div className="my-3">
          <label className="form-label">Email address</label>
          <input type="email" className="form-control" name="email" value={credentials.email} onChange={onChange} />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input type="password" className="form-control" name="password" value={credentials.password} onChange={onChange} />
        </div>

        {/* Forgot Password */}
        <div className="mb-2">
          <small
            style={{ cursor: "pointer", color: "blue" }}
            onClick={() => navigate("/forgotpassword")}
          >
            Forgot Password?
          </small>
        </div>

        {/* NEW LINE ADDED 👇 */}
        <div className="mb-3">
          <small>
            New user?{" "}
            <span
              style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </span>
          </small>
        </div>

        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </div>
  )
}

export default Login;
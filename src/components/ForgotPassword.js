import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import config from "../config";

const ForgotPassword = (props) => {
  const [data, setData] = useState({ email: "", password: "", cpassword: "" });
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
    <div className="container mt-2">
      <h2 className="my-3">Reset Password</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Email</label>
          <input type="email" className="form-control" name="email" onChange={onChange} required />
        </div>

        <div className="mb-3">
          <label>New Password</label>
          <input type="password" className="form-control" name="password" onChange={onChange} required />
        </div>

        <div className="mb-3">
          <label>Confirm Password</label>
          <input type="password" className="form-control" name="cpassword" onChange={onChange} required />
        </div>

        <div className="mb-3">
          <small>
            <span
              style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
              onClick={() => navigate("/login")}
            >
              Login
            </span>
          </small>
        </div>

        <button type="submit" className="btn btn-primary">Update Password</button>
      </form>
    </div>
  );
};

export default ForgotPassword;
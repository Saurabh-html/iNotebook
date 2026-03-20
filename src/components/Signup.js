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
      navigate("/");
      props.showAlert("Account Created Successfully", "success");
    } else {
      props.showAlert("Invalid Credentials", "danger");
    }
  }

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value })
  }

  return (
    <div className="container mt-2">
      <h2 className="my-3">Create an account to use iNotebook</h2>

      <form onSubmit={handleSubmit}>
        <div className="my-3">
          <label className="form-label">Full Name</label>
          <input type="text" className="form-control" name="name" onChange={onChange} />
        </div>

        <div className="mb-3">
          <label className="form-label">Email address</label>
          <input type="email" className="form-control" name="email" onChange={onChange} />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input type="password" className="form-control" name="password" onChange={onChange} minLength={5} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Confirm Password</label>
          <input type="password" className="form-control" name="cpassword" onChange={onChange} minLength={5} required />
        </div>

        {/* 👇 NEW LOGIN LINK */}
        <div className="mb-3">
          <small>
            Already a user?{" "}
            <span
              style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
              onClick={() => navigate("/login")}
            >
              Login
            </span>
          </small>
        </div>

        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </div>
  )
}

export default Signup;
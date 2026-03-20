import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import config from "../config";

const UpdatePassword = (props) => {
  const [data, setData] = useState({
    oldPassword: "",
    newPassword: "",
    cPassword: ""
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (data.newPassword !== data.cPassword) {
      props.showAlert("Passwords do not match", "danger");
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
        newPassword: data.newPassword
      })
    });

    const json = await response.json();

    if (json.success) {
      props.showAlert("Password updated successfully", "success");
      navigate("/");
    } else {
      props.showAlert(json.error, "danger");
    }
  };

  const onChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  return (
    <div className="container mt-3">
      <h2>Update Password</h2>

      <form onSubmit={handleSubmit}>
        <input type="password" name="oldPassword" className="form-control mb-2" placeholder="Current Password" onChange={onChange} required />
        <input type="password" name="newPassword" className="form-control mb-2" placeholder="New Password" onChange={onChange} required />
        <input type="password" name="cPassword" className="form-control mb-3" placeholder="Confirm Password" onChange={onChange} required />

        <button type="submit" className="btn btn-primary">Update Password</button>
      </form>
    </div>
  )
}

export default UpdatePassword;
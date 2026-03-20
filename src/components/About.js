import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import config from "../config";

const About = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem(config.TOKEN_KEY);
    if (!token) {
      navigate("/login", { replace: true });
    }
    //eslint-disable-next-line
  }, []);

  return (
    <div className="container my-4">

      <div className="text-center mb-5">
        <h1 className="fw-bold">About iNotebook</h1>
        <p className="text-muted">
          Your secure and smart place to manage notes efficiently.
        </p>
      </div>

      <div className="row">

        <div className="col-md-6">
          <h4 className="fw-semibold">📌 What is iNotebook?</h4>
          <p>
            iNotebook is a full-stack MERN application that allows users to securely create,
            manage, update, and delete notes with complete privacy.
          </p>

          <h4 className="fw-semibold mt-4">🚀 Key Features</h4>
          <ul>
            <li>JWT Authentication</li>
            <li>CRUD Notes</li>
            <li>User-specific data</li>
            <li>Password management</li>
          </ul>
        </div>

        <div className="col-md-6">
          <h4 className="fw-semibold">🛠️ Tech Stack</h4>
          <ul>
            <li>React (Context API)</li>
            <li>Node + Express</li>
            <li>MongoDB</li>
            <li>JWT + bcrypt</li>
          </ul>

          <h4 className="fw-semibold mt-4">🔐 Security</h4>
          <p>
            Passwords are hashed and authentication is handled via secure tokens.
          </p>
        </div>

      </div>

      <div className="text-center mt-5">
        <hr />
        <p className="text-muted">Built with ❤️ using MERN Stack</p>
      </div>

    </div>
  )
}

export default About;
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

      {/* HEADER */}
      <div className="text-center mb-5">
        <h1 className="fw-bold">About iNotebook</h1>
        <p className="text-muted">
          A modern, secure and intelligent note management system built with MERN Stack.
        </p>
      </div>

      <div className="row">

        {/* LEFT SECTION */}
        <div className="col-md-6">

          <h4 className="fw-semibold">📌 What is iNotebook?</h4>
          <p>
            iNotebook is a full-stack web application designed to help users manage their notes
            efficiently with a clean UI and powerful features. It ensures data privacy while
            offering smart tools to enhance productivity.
          </p>

          <h4 className="fw-semibold mt-4">🚀 Core Features</h4>
          <ul>
            <li>Secure JWT-based Authentication</li>
            <li>Create, Read, Update, Delete Notes</li>
            <li>User-specific private notes</li>
            <li>Password update functionality</li>
            <li>Server failure handling with fallback UI</li>
          </ul>

          <h4 className="fw-semibold mt-4">✨ Advanced Features</h4>
          <ul>
            <li>🔍 Smart Search (Title, Tag & Description)</li>
            <li>🎯 Keyword Highlighting in search results</li>
            <li>📝 Notes Version History (restore previous versions)</li>
            <li>📋 Copy & Share notes instantly</li>
            <li>🎨 Custom color notes</li>
            <li>🌓 Dark Mode & Light Mode toggle</li>
            <li>📅 Automatic Date & Time tracking</li>
            <li>✏️ Edited timestamp tracking</li>
          </ul>

        </div>

        {/* RIGHT SECTION */}
        <div className="col-md-6">

          <h4 className="fw-semibold">⚡ Productivity Enhancements</h4>
          <ul>
            <li>📌 Clean card-based UI for better readability</li>
            <li>📖 Expandable notes with blur background focus</li>
            <li>🔄 Drag & Drop notes reordering</li>
            <li>📊 Notes counter (dynamic updates)</li>
            <li>📱 Fully responsive design</li>
            <li>⚠️ Real-time alert system (Add, Edit, Delete, Copy)</li>
          </ul>

          <h4 className="fw-semibold mt-4">🌍 Smart Features</h4>
          <ul>
            <li>🧠 Intelligent UI interactions</li>
            <li>⚙️ Modular and scalable architecture</li>
          </ul>

          <h4 className="fw-semibold mt-4">🛠️ Tech Stack</h4>
          <ul>
            <li>Frontend: React (Context API)</li>
            <li>Backend: Node.js + Express</li>
            <li>Database: MongoDB</li>
            <li>Authentication: JWT + bcrypt</li>
            <li>UI: Bootstrap + Font Awesome</li>
          </ul>

          <h4 className="fw-semibold mt-4">🔐 Security</h4>
          <p>
            All user data is protected using encrypted passwords and token-based authentication.
            Each user's data is completely isolated and secure.
          </p>

        </div>

      </div>

      {/* FOOTER */}
      <div className="text-center mt-5">
        <hr />
        <p className="text-muted">
          Built with ❤️ using MERN Stack by S.
        </p>
      </div>

    </div>
  )
}

export default About;
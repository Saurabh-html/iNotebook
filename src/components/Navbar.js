import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from "react-router-dom";
import config from "../config";

const Navbar = ({ search, setSearch, searchType, setSearchType }) => {
  let navigate = useNavigate();
  let location = useLocation();

  const [user, setUser] = useState(null);

  const token = localStorage.getItem(config.TOKEN_KEY);

  const handleLogout = () => {
    localStorage.removeItem(config.TOKEN_KEY);
    setUser(null); // ✅ reset user
    navigate("/login");
  };

  const getUserDetails = async () => {
    try {
      const response = await fetch(`${config.API_URL}/api/auth/getuser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem(config.TOKEN_KEY)
        }
      });

      const json = await response.json();
      setUser(json);
    } catch (error) {
      console.log(error);
    }
  };

  // ✅ KEY FIX: run whenever token changes
  useEffect(() => {
    if (token) {
      getUserDetails();
    } else {
      setUser(null);
    }
  }, [token]);

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">

          <Link className="navbar-brand" to="/">iNotebook</Link>

          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">

            {/* LEFT */}
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className={`nav-link ${location.pathname === "/" ? "active" : ""}`} to="/">Home</Link>
              </li>

              <li className="nav-item">
                <Link className={`nav-link ${location.pathname === "/about" ? "active" : ""}`} to="/about">About</Link>
              </li>
            </ul>

            {/* SEARCH */}
            {token && location.pathname !== "/about" && (
              <div className="d-flex align-items-center me-3" style={{ maxWidth: "400px" }}>
                <div className="input-group">

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search your notes by..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />

                  <span className="input-group-text p-0">
                    <select
                      className="form-select border-0"
                      value={searchType}
                      onChange={(e) => setSearchType(e.target.value)}
                    >
                      <option value="title">Title</option>
                      <option value="tag">Tag</option>
                    </select>
                  </span>

                </div>
              </div>
            )}

            {/* RIGHT */}
            {!token ? (
              <div className="d-flex">
                <Link className="btn btn-primary mx-1" to="/login">Login</Link>
                <Link className="btn btn-primary mx-1" to="/signup">Signup</Link>
              </div>
            ) : (
              <div className="d-flex">
                <button
                  className="btn btn-outline-light mx-2"
                  data-bs-toggle="offcanvas"
                  data-bs-target="#profileSidebar"
                >
                  Your Profile {/* ✅ changed */}
                </button>
              </div>
            )}

          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <div className="offcanvas offcanvas-end d-flex flex-column" id="profileSidebar">

        <div className="offcanvas-header">
          <h5>User Profile</h5>
          <button className="btn-close" data-bs-dismiss="offcanvas"></button>
        </div>

        <div className="offcanvas-body">
          {user ? (
            <>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
            </>
          ) : (
            <p>Loading...</p>
          )}
        </div>

        <div className="mt-auto text-center mb-3">

          <button
            className="btn btn-outline-primary mb-2"
            onClick={() => navigate("/updatepassword")}
            data-bs-dismiss="offcanvas"
          >
            Update Password
          </button>

          <br />

          <button
            onClick={handleLogout}
            className="btn btn-danger"
            data-bs-dismiss="offcanvas"
          >
            Logout
          </button>

        </div>

      </div>
    </>
  )
}

export default Navbar;
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
    setUser(null);
    navigate("/login");
  };

  const getUserDetails = async () => {
    try {
      const response = await fetch(`${config.API_URL}/api/auth/getuser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token
        }
      });

      const json = await response.json();
      setUser(json);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (token) getUserDetails();
    else setUser(null);
    // eslint-disable-next-line
  }, [token]);

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">

        {/* BRAND */}
        <Link className="navbar-brand" to="/">iNotebook</Link>

        {/* SEARCH BAR (ALWAYS VISIBLE) */}
        {token && location.pathname !== "/about" && (
          <div className="mx-3 flex-grow-1" style={{ maxWidth: "500px" }}>
            <div className="input-group">

              <input
                type="text"
                className="form-control"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                className="form-select"
                style={{ maxWidth: "100px" }}
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
              >
                <option value="title">Title</option>
                <option value="tag">Tag</option>
              </select>

            </div>
          </div>
        )}

        {/* HAMBURGER */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* COLLAPSE MENU */}
        <div className="collapse navbar-collapse" id="navbarContent">

          <ul className="navbar-nav ms-auto">

            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === "/" ? "active" : ""}`} to="/">Home</Link>
            </li>

            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === "/about" ? "active" : ""}`} to="/about">About</Link>
            </li>

            {/* PROFILE SECTION */}
            {token && (
              <li className="nav-item mt-2 mt-lg-0 ms-lg-3">

                <button
                  className="btn btn-outline-light"
                  data-bs-toggle="offcanvas"
                  data-bs-target="#profileSidebar"
                >
                  Profile
                </button>

              </li>
            )}

          </ul>

        </div>

      </nav>

      {/* SIDEBAR */}
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
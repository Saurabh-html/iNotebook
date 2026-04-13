import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from "react-router-dom";
import config from "../config";

const Navbar = ({ search, setSearch, searchType, setSearchType, theme, setTheme }) => {
  let navigate = useNavigate();
  let location = useLocation();

  const [user, setUser] = useState(null);
  const token = localStorage.getItem(config.TOKEN_KEY);

  const handleLogout = () => {
    localStorage.removeItem(config.TOKEN_KEY);
    setUser(null);
    navigate("/login");
  };

  const handleProtectedRoute = (path) => {
    if (!token) {
      navigate("/login");
    } else {
      navigate(path);
    }
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
      <nav className="navbar navbar-dark bg-dark px-3">

        {/* TOP ROW */}
        <div className="d-flex justify-content-between align-items-center w-100 flex-wrap">

          <Link className="navbar-brand mb-0" to="/">iNotebook</Link>

          <div className="d-flex align-items-center gap-3">

            <span className="text-light" style={{ cursor: "pointer" }} onClick={() => handleProtectedRoute("/")}>Home</span>

            <span className="text-light" style={{ cursor: "pointer" }} onClick={() => handleProtectedRoute("/about")}>About</span>

            {/* THEME TOGGLE */}
            <div className="form-check form-switch text-light m-0">
              <input
                className="form-check-input"
                type="checkbox"
                checked={theme === "dark"}
                onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
              />
            </div>

            {/* PROFILE */}
            {token && (
              <i
                className="fa-solid fa-user"
                style={{ cursor: "pointer", fontSize: "20px", color: "white" }}
                data-bs-toggle="offcanvas"
                data-bs-target="#profileSidebar"
              ></i>
            )}

          </div>
        </div>

        {/* SEARCH BAR */}
        {token && location.pathname !== "/about" && (
          <div className="w-100 mt-2">
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
                <option value="description">Description</option>
                <option value="tag">Tag</option>
              </select>

            </div>
          </div>
        )}

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
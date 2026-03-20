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
  }, [token]);

  return (
    <>
      <nav className="navbar navbar-dark bg-dark px-3">

        {/* LEFT */}
        <Link className="navbar-brand me-3" to="/">iNotebook</Link>

        {/* SEARCH ALWAYS VISIBLE */}
        {token && location.pathname !== "/about" && (
          <div className="flex-grow-1 me-2">
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
                style={{ maxWidth: "90px" }}
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
              >
                <option value="title">Title</option>
                <option value="tag">Tag</option>
              </select>

            </div>
          </div>
        )}

        {/* RIGHT → AVATAR */}
        {token && (
          <button
            className="btn btn-outline-light"
            data-bs-toggle="offcanvas"
            data-bs-target="#profileSidebar"
            style={{ borderRadius: "50%", width: "40px", height: "40px" }}
          >
            👤
          </button>
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
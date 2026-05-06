import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from './components/Navbar'
import Home from './components/Home'
import About from './components/About'
import NoteState from './context/notes/NoteState';
import Alert from './components/Alert';
import Login from './components/Login';
import Signup from './components/Signup';
import { useState, useEffect, useCallback } from 'react';
import ForgotPassword from './components/ForgotPassword';
import UpdatePassword from './components/UpdatePassword';
import config from "./config";

function App() {
  const [alert, setAlert] = useState(null);
  const [search, setSearch] = useState("");
const [searchType, setSearchType] = useState("title");
const [theme, setTheme] = useState("light");

  const showAlert = (message, type) => {
    setAlert({ msg: message, type: type });

    setTimeout(() => {
      setAlert(null);
    }, 1500);
  }

  useEffect(() => {
  document.body.className = theme === "dark" ? "bg-dark text-light" : "bg-light text-dark";
}, [theme]);

const logout = useCallback(() => {

  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");

  window.location.href = "/login";

}, []);

useEffect(() => {

  let inactivityTimer;

  let refreshInterval;

  const refreshAccessToken = async () => {

    const refreshToken =
      localStorage.getItem("refreshToken");

    if (!refreshToken) {
      logout();
      return;
    }

    try {

      const response = await fetch(
        `${config.API_URL}/api/auth/refresh`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            refreshToken
          })
        }
      );

      const json = await response.json();

      if (json.success) {

        localStorage.setItem(
          "token",
          json.accessToken
        );

      } else {

        logout();
      }

    } catch (error) {

      logout();
    }
  };

  const resetTimer = () => {

    clearTimeout(inactivityTimer);

    inactivityTimer = setTimeout(() => {

      logout();

    }, 15 * 60 * 1000);
  };

  const events = [
    "mousemove",
    "keydown",
    "click",
    "scroll"
  ];

  events.forEach(event => {
    window.addEventListener(event, resetTimer);
  });

  resetTimer();

  refreshInterval = setInterval(() => {

    refreshAccessToken();

  }, 10 * 60 * 1000);

  return () => {

    clearTimeout(inactivityTimer);

    clearInterval(refreshInterval);

    events.forEach(event => {
      window.removeEventListener(event, resetTimer);
    });
  };

}, [logout]);

  const isLoggedIn = localStorage.getItem("token");

  return (
    <NoteState>
      <Router>
        <Navbar 
          search={search}
          setSearch={setSearch}
          searchType={searchType}
          setSearchType={setSearchType}
          theme={theme}
          setTheme={setTheme}
        />
        <Alert alert={alert} />

        <div className="container">
          <Routes>

            <Route path="/" element={<Home showAlert={showAlert} search={search} searchType={searchType}/>} />

            <Route
              path="/about"
              element={isLoggedIn ? <About /> : <Navigate to="/login" />}
            />

            <Route path="/login" element={<Login showAlert={showAlert} />} />

            <Route path="/signup" element={<Signup showAlert={showAlert} />} />

            <Route path="/forgotpassword" element={<ForgotPassword showAlert={showAlert} />} />

            <Route
              path="/updatepassword"
              element={isLoggedIn ? <UpdatePassword showAlert={showAlert} /> : <Navigate to="/login" />}
            />

          </Routes>
        </div>
      </Router>
    </NoteState>
  );
}

export default App;
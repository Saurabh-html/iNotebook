import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from './components/Navbar'
import Home from './components/Home'
import About from './components/About'
import NoteState from './context/notes/NoteState';
import Alert from './components/Alert';
import Login from './components/Login';
import Signup from './components/Signup';
import { useState, useEffect } from 'react';
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

  const isLoggedIn = localStorage.getItem(config.TOKEN_KEY);

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
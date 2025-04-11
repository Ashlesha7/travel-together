import React, { useState, useEffect } from "react"; // Added useState, useEffect
import axios from "axios"; // Added axios import for API calls
import "./Navigation.css";
import logo from "../assets/logo.png"; // Adjust path if needed
import { Link } from "react-router-dom";
import NotificationBell from "./NotificationBell";

const Navigation = ({ user, newMessageCount = 0 }) => {
  // Added local state for fetched profile, falling back to the passed user prop if available.
  const [profile, setProfile] = useState(user);

  // Added useEffect to fetch the user profile if not already provided.
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get("http://localhost:8080/api/profile", {
          headers: { Authorization: token },
        })
        .then((res) => setProfile(res.data))
        .catch((err) => console.error("Error fetching profile:", err));
    }
  }, []);
  

  // Use the fetched profile if available, otherwise use the passed user prop.
  const displayUser = profile || user;

  return (
    <header className="fullpage-navbar">
      {/* Left Section: Logo */}
      <div className="navbar-left">
        <img src={logo} alt="Logo" className="navbar-logo" />
      </div>

      {/* Right Section: Nav Buttons + User Pic */}
      <div className="navbar-right">
        <Link to="/start-trip">
          <button>Start a trip</button>
        </Link>
        <Link to="/discover">
          <button>Discover</button>
        </Link>

        {/* Message button with a badge if newMessageCount > 0 */}
        <Link to="/messages" style={{ position: "relative" }}>
          <button className="nav-button">
            Message
            {newMessageCount > 0 && (
              <span className="message-badge">{newMessageCount}</span>
            )}
          </button>
        </Link>

        <NotificationBell user={displayUser} />
        <Link to="/profile">

        <img
          src={
            displayUser && displayUser.profilePhoto
              ? `http://localhost:8080/${displayUser.profilePhoto}`
              : "/path/to/defaultUser.png"
          }
          alt="User"
          className="navbar-user"
        />
        </Link>
      </div>
    </header>
  );
};

export default Navigation;

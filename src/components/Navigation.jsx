import React, { useState, useEffect } from "react"; // Added useState, useEffect
import axios from "axios"; // For API calls
import "./Navigation.css";
import logo from "../assets/logo.png"; // Adjust path if needed
import { Link } from "react-router-dom";
import NotificationBell from "./NotificationBell";

const Navigation = ({ user }) => {
  // Local state for fetched profile, falling back to the passed user prop if available.
  const [profile, setProfile] = useState(user);
  // New state for unread count (Approach B: fetching directly in Navigation)
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch user profile if not already provided
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

  // Fetch global unread count directly in Navigation (polling every 10 seconds)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    const fetchGlobalUnreadCount = () => {
      axios
        .get("http://localhost:8080/api/messages/unreadCountGlobal", {
          headers: { Authorization: token },
        })
        .then((res) => {
          setUnreadCount(res.data.unreadCount);
        })
        .catch((err) =>
          console.error("Error fetching global unread count:", err)
        );
    };

    fetchGlobalUnreadCount();
    const intervalId = setInterval(fetchGlobalUnreadCount, 10000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <header className="fullpage-navbar">
      {/* Left Section: Logo wrapped in a Link to Home */}
      <div className="navbar-left">
        <Link to="/">
          <img src={logo} alt="Logo" className="navbar-logo" />
        </Link>
      </div>

      {/* Right Section: Nav Buttons + User Pic */}
      <div className="navbar-right">
        <Link to="/start-trip">
          <button>Start a trip</button>
        </Link>
        <Link to="/discover">
          <button>Discover</button>
        </Link>

        {/* Message button with a badge if unreadCount > 0 */}
        <Link to="/messages" style={{ position: "relative" }}>
          <button className="nav-button">
            Message
            {unreadCount > 0 && (
              <span className="message-badge">{unreadCount}</span>
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

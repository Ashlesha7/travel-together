import React from "react";
import "./Navigation.css";
import logo from "../assets/logo.png"; // Adjust path if needed
import { Link } from "react-router-dom";
import NotificationBell from "./NotificationBell";

const Navigation = ({ user, newMessageCount = 0 }) => {
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

        <NotificationBell user={user} />

        <img
          src={
            user && user.profilePhoto
              ? `http://localhost:8080/${user.profilePhoto}`
              : "/path/to/defaultUser.png"
          }
          alt="User"
          className="navbar-user"
        />
      </div>
    </header>
  );
};

export default Navigation;

import React from "react";
import "./Navigation.css";
import logo from "../assets/logo.png"; // Adjust path if needed
import { Link } from "react-router-dom";


// Accepts a "user" prop for dynamic user data (including profilePhoto)
const Navigation = ({ user }) => {
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
        <button>Message</button>
        <img
          src={
            user && user.profilePhoto
              ? `http://localhost:5000/${user.profilePhoto}`
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

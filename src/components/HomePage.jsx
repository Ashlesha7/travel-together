import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./HomePage.css";

// Different logos for header & footer
import headerLogo from "../assets/logo.png";
import footerLogo from "../assets/footerlogo.png";

// Background & destination images
import bgHome from "../assets/Background.jpg";
import annapurna from "../assets/annapurna.jpg";
import pokhara from "../assets/pokhara.jpg";
import mustang from "../assets/mustang.jpg";
import langtang from "../assets/langtang.jpg";

const HomePage = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch user data if logged in
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token"); // Get token from local storage
        if (token) {
          const res = await axios.get("http://localhost:8080/api/profile", {
            headers: { Authorization: token },
          });
          setUser(res.data);
        }
      } catch (error) {
        console.log("Not logged in");
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="homepage">
      {/* Hero Section with Background Image */}
      <div className="hero-section" style={{ backgroundImage: `url(${bgHome})` }}>
        {/* Navbar */}
        <nav className="navbar">
          <img src={headerLogo} alt="Header Logo" className="logo" />

          <div className="nav-buttons">
            <Link to="/start-trip">
              <button>Start a trip</button>
            </Link>
            <Link to="/discover">
              <button>Discover</button>
            </Link>
            {/* Updated: Message button is now a link */}
            <Link to="/messages">
              <button>Message</button>
            </Link>
          </div>

          {/* If user is logged in, show profile pic; else show single "Login | Signup" button */}
          {user ? (
            <Link to="/profile">
              <img
                src={`http://localhost:8080/${user.profilePhoto}`}
                alt="Profile"
                className="profile-pic"
              />
            </Link>
          ) : (
            <div className="auth-buttons">
              {/* Single button that leads to /login */}
              <Link to="/login" className="login-signup-button">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  width="16"
                  height="16"
                  fill="currentColor"
                  role="img"
                  aria-label="User icon"
                >
                  <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3Zm8-7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
                <span>Login | Signup</span>
              </Link>
            </div>
          )}
        </nav>

        {/* Welcome Message */}
        <div className="hero-text">
          <h1>Welcome to Travel Together</h1>
          <p>Find your travel partners and explore the world</p>
        </div>
      </div>

      {/* Destinations Section */}
      <div className="destinations">
        <h2>PUTTING TRAVEL IN YOUR HANDS</h2>
        <div className="destination-grid">
          <div className="destination-card">
            <img src={annapurna} alt="Annapurna" />
            <h3>Annapurna Base Camp</h3>
            <p>Stunning Himalayan destination in Nepal, offering breathtaking views</p>
          </div>
          <div className="destination-card">
            <img src={pokhara} alt="Pokhara" />
            <h3>Pokhara</h3>
            <p>A serene lakeside city in Nepal, surrounded by mountains.</p>
          </div>
          <div className="destination-card">
            <img src={mustang} alt="Mustang" />
            <h3>Mustang</h3>
            <p>A remote, rugged region in Nepal.</p>
          </div>
          <div className="destination-card">
            <img src={langtang} alt="Langtang" />
            <h3>Langtang</h3>
            <p>A scenic Himalayan valley in Nepal.</p>
          </div>
        </div>
        <button className="view-all">View All</button>
      </div>

      {/* Footer */}
      <footer>
        <img src={footerLogo} alt="Footer Logo" className="footer-logo" />
        <p>© 2025 TravelTogether | All rights reserved</p>
        <div className="footer-links">
          <Link to="#">About</Link>
          <Link to="#">Connect</Link>
          <Link to="#">Help</Link>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

import React from "react";
import { Link } from "react-router-dom";
import footerLogo from "../assets/footerlogo.png"; // Adjust the path as necessary
import "./Footer.css";

const Footer = () => {
  return (
    <footer>
      <img src={footerLogo} alt="Footer Logo" className="footer-logo" />
      <p>© 2025 TravelTogether | All rights reserved</p>
      <div className="footer-links">
        <Link to="#">About</Link>
        <Link to="#">Connect</Link>
        <Link to="#">Help</Link>
      </div>
    </footer>
  );
};

export default Footer;

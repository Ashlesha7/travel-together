import React, { useState } from "react";
import { Link } from "react-router-dom";
import footerLogo from "../assets/footerlogo.png";
import "./Footer.css";

const Footer = () => {
  const [showAbout, setShowAbout] = useState(false);
  const [showContact, setShowContact] = useState(false);

  const closeModals = () => {
    setShowAbout(false);
    setShowContact(false);
  };

  return (
    <>
      <footer>
        <img src={footerLogo} alt="Footer Logo" className="footer-logo" />
        <p>© 2025 TravelTogether | All rights reserved</p>
        <div className="footer-links">
          <Link
            to="#"
            onClick={(e) => {
              e.preventDefault();
              setShowAbout(true);
            }}
          >
            About Us
          </Link>
          <Link
            to="#"
            onClick={(e) => {
              e.preventDefault();
              setShowContact(true);
            }}
          >
            Contact
          </Link>
        </div>
      </footer>

      {/* About Us Modal */}
      {showAbout && (
        <div className="footer-modal-overlay" onClick={closeModals}>
          <div
            className="footer-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="footer-modal-close"
              onClick={closeModals}
              aria-label="Close"
            >
              &times;
            </button>
            <h2>About TravelTogether</h2>
            <p>
              Welcome to TravelTogether! We’re a community-driven platform that
              connects like-minded travelers looking to explore the world
              together. Whether you’re planning a Himalayan trek, a city tour,
              or an off-the-beaten-path adventure, our goal is to help you find
              the perfect travel companion. Share tips, coordinate itineraries,
              and build lifelong friendships while experiencing new cultures and
              destinations. Join us in making every journey more memorable!
            </p>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContact && (
        <div className="footer-modal-overlay" onClick={closeModals}>
          <div
            className="footer-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="footer-modal-close"
              onClick={closeModals}
              aria-label="Close"
            >
              &times;
            </button>
            <h2>Contact Us</h2>
            <p>
              Have questions or feedback? We’d love to hear from you!<br />
              <strong>Email:</strong>{" "}
              <a href="mailto:np0scs4a220157@heraldcollege.edu.np">
                np0scs4a220157@heraldcollege.edu.np
              </a>
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;

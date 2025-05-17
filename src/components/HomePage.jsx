import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./HomePage.css";

import headerLogo from "../assets/logo.png";
import footerLogo from "../assets/footerlogo.png";

// Background & destination images
import bgHome from "../assets/Background.jpg";
import annapurna from "../assets/annapurna.jpg";
import pokhara from "../assets/pokhara.jpg";
import mustang from "../assets/mustang.jpg";
import langtang from "../assets/langtang.jpg";

import notificationIcon from "../assets/notification.png";

const HomePage = () => {
  const [user, setUser] = useState(null);

  // Notifications state 
  const [homepageNotifications, setHomepageNotifications] = useState([]);
  const [historyNotifications, setHistoryNotifications] = useState([]);           // A) history list
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showHistory, setShowHistory] = useState(false);                           // B) toggle history vs recent

  // State for Message alert unread count
  const [unreadCount, setUnreadCount] = useState(0);
  //const navigate = useNavigate();

  // 1. Fetch user profile if token is present
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get("http://localhost:8080/api/profile", {
          headers: { Authorization: token },
        })
        .then((res) => setUser(res.data))
        .catch(() => console.log("Not logged in"));
    }
  }, []);

  // A) Recent notifications — when dropdown opens and not in history
  useEffect(() => {
    if (!showNotifDropdown || showHistory || !user) return;
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:8080/api/notifications", {
        headers: { Authorization: token },
      })
      .then((res) => {
        const filtered = res.data.filter(
          (notif) => String(notif.receiverId) === String(user._id)
        );
        setHomepageNotifications(filtered);
      })
      .catch((err) =>
        console.error("Error fetching homepage notifications:", err)
      );
  }, [showNotifDropdown, showHistory, user]);

  // B) History — only when View All clicked
  useEffect(() => {
    if (!showHistory || !user) return;
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:8080/api/notifications/history", {
        headers: { Authorization: token },
      })
      .then((res) => setHistoryNotifications(res.data))
      .catch((err) =>
        console.error("Error fetching notification history:", err)
      );
  }, [showHistory, user]);

  // 3. Poll recent notifications every 10 seconds (if dropdown open & not in history)
  useEffect(() => {
    if (!user) return;
    const intervalId = setInterval(() => {
      if (showNotifDropdown && !showHistory) {
        const token = localStorage.getItem("token");
        axios
          .get("http://localhost:8080/api/notifications", {
            headers: { Authorization: token },
          })
          .then((res) => {
            const filtered = res.data.filter(
              (notif) => String(notif.receiverId) === String(user._id)
            );
            setHomepageNotifications(filtered);
          })
          .catch((err) =>
            console.error("Error polling homepage notifications:", err)
          );
      }
    }, 10000);
    return () => clearInterval(intervalId);
  }, [user, showNotifDropdown, showHistory]);

  // 4. Poll global unread message count every 10 seconds
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const fetchUnreadCount = () => {
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
    fetchUnreadCount();
    const intervalId = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(intervalId);
  }, []);

  // Toggle notification dropdown for custom notification icon
  const toggleNotifDropdown = () => {
    setShowNotifDropdown((prev) => {
      if (prev) {
        // closing → reset to recent
        setShowHistory(false);
      }
      return !prev;
    });
  };

  // Accept/Reject handlers for notifications 
  const handleAccept = (notifId, senderName) => {
    const token = localStorage.getItem("token");
    axios
      .post(
        "http://localhost:8080/api/notifications/respond",
        { notificationId: notifId, response: "accept" },
        { headers: { Authorization: token } }
      )
      .then(() => {
        alert(`You accepted the connection from ${senderName}.`);
        setHomepageNotifications((prev) =>
          prev.filter((n) => n._id !== notifId)
        );
      })
      .catch((err) => console.error(err));
  };

  const handleReject = (notifId, senderName) => {
    const token = localStorage.getItem("token");
    axios
      .post(
        "http://localhost:8080/api/notifications/respond",
        { notificationId: notifId, response: "reject" },
        { headers: { Authorization: token } }
      )
      .then(() => {
        alert(`You rejected the connection from ${senderName}.`);
        setHomepageNotifications((prev) =>
          prev.filter((n) => n._id !== notifId)
        );
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="homepage">
      {/* Hero Section with Background Image */}
      <div
        className="hero-section"
        style={{ backgroundImage: `url(${bgHome})` }}
      >
        {/* Navbar */}
        <nav className="navbar">
          {/* Left Container: Logo */}
          <div className="navbar-left">
            <Link to="/">
              <img src={headerLogo} alt="Header Logo" className="logo" />
            </Link>
          </div>

          {/* Nav Buttons, Message Alert, Notification Icon, and Auth/Profile */}
          <div className="navbar-right">
            <div className="nav-buttons">
              <Link to="/start-trip">
                <button>Start a trip</button>
              </Link>
              <Link to="/discover">
                <button>Discover</button>
              </Link>
              {/* Message button with alert badge */}
              <Link to="/messages" style={{ position: "relative" }}>
                <button className="nav-button">
                  Message
                  {unreadCount > 0 && (
                    <span className="message-badge">{unreadCount}</span>
                  )}
                </button>
              </Link>
            </div>

            {/* Custom Notification Icon */}
            {user && (
              <div
                className="homepage-notif-container"
                onClick={toggleNotifDropdown}
                style={{ position: "relative", cursor: "pointer" }}
              >
                <img
                  src={notificationIcon}
                  alt="Notifications"
                  className="homepage-notif-icon"
                />
                {homepageNotifications.length > 0 && !showNotifDropdown && (
                  <span className="homepage-notif-badge">
                    {homepageNotifications.length}
                  </span>
                )}
                {showNotifDropdown && (
                  <div className="notification-dropdown">
                    {showHistory ? (
                      <>
                        <div className="notification-dropdown-header">
                          <h4>Notification History</h4>
                        </div>
                        {historyNotifications.length === 0 ? (
                          <p style={{ padding: "10px", color: "black" }}>
                            No notifications in history
                          </p>
                        ) : (
                          historyNotifications.map((n) => (
                            <div key={n._id} className="notification-item">
                              <p>{n.message}</p>
                              <small>Status: {n.status}</small>
                            </div>
                          ))
                        )}
                        <div className="notification-dropdown-footer">
                          <button
                            className="view-all-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                               setShowHistory(false);
                            }}
                          >
                            Back to Recent
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="notification-dropdown-header">
                          <h4>Notifications</h4>
                        </div>
                        {homepageNotifications.length === 0 ? (
                          <p style={{ padding: "10px", color: "black" }}>
                            No notifications
                          </p>
                        ) : (
                          homepageNotifications.map((notif) => (
                            <div key={notif._id} className="notification-item">
                              <p>
                                <Link
                                  to={`/profile/${notif.senderId}`}
                                  className="notif-sender"
                                >
                                  {notif.senderName}
                                </Link>{" "}
                                wants to connect with you
                              </p>
                              {notif.type === "connectRequest" &&
                                notif.status === "pending" && (
                                  <div className="notification-actions">
                                    <button
                                      onClick={() =>
                                        handleAccept(
                                          notif._id,
                                          notif.senderName
                                        )
                                      }
                                    >
                                      Accept
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleReject(
                                          notif._id,
                                          notif.senderName
                                        )
                                      }
                                    >
                                      Reject
                                    </button>
                                  </div>
                                )}
                            </div>
                          ))
                        )}
                        <div className="notification-dropdown-footer">
                          <button
                            className="view-all-btn"
                            onClick={ async(e) => {
                              e.stopPropagation();
                              try {
                                const token = localStorage.getItem("token");
                                const { data } = await axios.get(
                                  "http://localhost:8080/api/notifications/history",
                                    { headers: { Authorization: token } }
                                );
                                setHistoryNotifications(data);
                                setShowHistory(true);
                                } catch (err) {
                                  console.error("Could not load notification history:", err);
                                }
                            }}
                          >
                            View All Notifications
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Auth / Profile Section */}
            {user ? (
              <Link to="/profile">
                <img
                  src={
                    user.profilePhoto.startsWith("http")
                      ? user.profilePhoto
                      : `http://localhost:8080/${user.profilePhoto}`
                  }
                  alt="Profile"
                  className="profile-pic"
                />
              </Link>
            ) : (
              <div className="auth-buttons">
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
          </div>
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
            <p>
              Stunning Himalayan destination in Nepal, offering breathtaking views
            </p>
          </div>
          <div className="destination-card">
            <img src={pokhara} alt="Pokhara" />
            <h3>Pokhara</h3>
            <p>
              A serene lakeside city in Nepal, surrounded by mountains.
            </p>
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

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; 
import { Link } from "react-router-dom";
import "./NotificationBell.css"; 

const NotificationBell = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [historyNotifications, setHistoryNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const navigate = useNavigate();

  // Fetch recent notifications for the current user
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:8080/api/notifications", {
        headers: { Authorization: token },
      })
      .then((res) => {
        // Filter out notifications sent by the logged-in user
        const filtered = res.data.filter(
          (notif) => String(notif.senderId) !== String(user._id)
        );
        setNotifications(filtered);
      })
      .catch((err) =>
        console.error("Error fetching notifications:", err)
      );
  }, [user]);

  // When showHistory is true, fetch the notification history 
  useEffect(() => {
    if (!showHistory) return;
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:8080/api/notifications/history", {
        headers: { Authorization: token },
      })
      .then((res) => {
        setHistoryNotifications(res.data);
      })
      .catch((err) =>
        console.error("Error fetching notification history:", err)
      );
  }, [showHistory]);

  //  Function to mark all pending notifications as read
  const handleMarkAllAsRead = () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    // Get all current notification IDs
    const pendingIds = notifications.map((notif) => notif._id);
    if (pendingIds.length === 0) return;

    axios
      .post(
        "http://localhost:8080/api/notifications/mark-read",
        { notificationIds: pendingIds },
        { headers: { Authorization: token } }
      )
      .then(() => {
        // Clear notifications state since they're now marked as read
        setNotifications([]);
        //also clear historyNotifications if desired:
        setHistoryNotifications([]);
      })
      .catch((err) =>
        console.error("Error marking all notifications as read:", err)
      );
  };

  //  When opening, mark all notifications as read.
  const toggleDropdown = () => {
    if (!showDropdown) {
      // If the dropdown is about to open, mark all as read
      handleMarkAllAsRead();
    }
    setShowDropdown((prev) => !prev);
    // If closing the dropdown, reset to recent notifications view.
    if (showDropdown) setShowHistory(false);
  };

  // Function to mark a single notification as read (existing)
  const handleMarkAsRead = (notifId) => {
    const token = localStorage.getItem("token");
    axios
      .post(
        "http://localhost:8080/api/notifications/mark-read",
        { notificationIds: [notifId] },
        { headers: { Authorization: token } }
      )
      .then(() => {
        // Remove the notification from state so the alert is updated
        setNotifications((prev) => prev.filter((n) => n._id !== notifId));
        setHistoryNotifications((prev) =>
          prev.filter((n) => n._id !== notifId)
        );
      })
      .catch((err) => console.error("Error marking as read:", err));
  };

  const handleAccept = (id, senderName) => {
    const token = localStorage.getItem("token");
    axios
      .post(
        "http://localhost:8080/api/notifications/respond",
        { notificationId: id, response: "accept" },
        { headers: { Authorization: token } }
      )
      .then(() => {
        alert(`You accepted the connection from ${senderName}.`);
        setNotifications(notifications.filter((n) => n._id !== id));
        setHistoryNotifications(historyNotifications.filter((n) => n._id !== id));
      })
      .catch((err) => console.error(err));
  };

  const handleReject = (id, senderName) => {
    const token = localStorage.getItem("token");
    axios
      .post(
        "http://localhost:8080/api/notifications/respond",
        { notificationId: id, response: "reject" },
        { headers: { Authorization: token } }
      )
      .then(() => {
        alert(`You rejected the connection from ${senderName}.`);
        setNotifications(notifications.filter((n) => n._id !== id));
        setHistoryNotifications(historyNotifications.filter((n) => n._id !== id));
      })
      .catch((err) => console.error(err));
  };

  // Toggle to view the full notification history
  const handleViewHistory = () => {
    setShowHistory(true);
  };

  // Return to recent notifications view
  const handleBackToRecent = () => {
    setShowHistory(false);
  };

  return (
    <div className="notification-bell">
      <button onClick={toggleDropdown} className="notification-icon">
        🔔
        {notifications.length > 0 && !showHistory && (
          <span className="badge">{notifications.length}</span>
        )}
      </button>
      {showDropdown && (
        <div className="notification-dropdown">
          {showHistory ? (
            <>
              <div className="notification-dropdown-header">
                <h4>Notification History</h4>
              </div>
              {historyNotifications.length === 0 ? (
                <p style={{ padding: "0 1rem" }}>
                  No notifications in history
                </p>
              ) : (
                historyNotifications.map((notif) => (
                  <div key={notif._id} className="notification-item">
                    <p>{notif.message}</p>
                    <small>Status: {notif.status}</small>
                  </div>
                ))
              )}
              <div className="notification-dropdown-footer">
                <button className="view-all-btn" onClick={handleBackToRecent}>
                  Back to Recent
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="notification-dropdown-header">
                <h4>Notifications</h4>
              </div>
              {notifications.length === 0 ? (
                <p style={{ padding: "0 1rem" }}>No notifications</p>
              ) : (
                notifications.map((notif) => {
                  if (notif.type === "connectResponse") {
                    if (notif.status === "accepted") {
                      // Accepted connect response to navigate to messaging page.
                      return (
                        <div
                          key={notif._id}
                          className="notification-item accepted"
                          onClick={async () => {
                            // Await marking notification as read before navigating
                            await handleMarkAsRead(notif._id);
                            const token = localStorage.getItem("token");
                            axios
                              .post(
                                "http://localhost:8080/api/conversations/find-or-create",
                                { otherUserId: notif.senderId },
                                { headers: { Authorization: token } }
                              )
                              .then((res) => {
                                const conversationId = res.data._id;
                                navigate(`/messages/${conversationId}`);
                              })
                              .catch((err) => {
                                console.error("Error creating conversation:", err);
                              });
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          <p>{notif.message}</p>
                        </div>
                      );
                    } else {
                      return (
                        <div key={notif._id} className="notification-item rejected">
                          <p>{notif.message}</p>
                        </div>
                      );
                    }
                  } else {
                    return (
                      <div key={notif._id} className="notification-item">
                        <p>
                        <Link to={`/profile/${notif.senderId}`} className="notif-sender">
                        {notif.senderName}
                        </Link>{" "}
                        wants to connect with you.
                        </p>
                        <div className="notification-actions">
                        <button onClick={() => handleAccept(notif._id, notif.senderName)}>
                        Accept
                        </button>
                        <button onClick={() => handleReject(notif._id, notif.senderName)}>
                        Reject
                        </button>
                        </div>
                      </div>
                    );
                  }
                })
              )}
              <div className="notification-dropdown-footer">
                <button className="view-all-btn" onClick={handleViewHistory}>
                  View All Notifications
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

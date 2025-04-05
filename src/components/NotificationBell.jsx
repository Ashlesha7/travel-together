import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // NEW: for navigation
import "./NotificationBell.css"; // Create and adjust as needed

const NotificationBell = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate(); // NEW

  // Fetch notifications for the current user
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

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
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
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="notification-bell">
      <button onClick={toggleDropdown} className="notification-icon">
        🔔
        {notifications.length > 0 && (
          <span className="badge">{notifications.length}</span>
        )}
      </button>
      {showDropdown && (
        <div className="notification-dropdown">
          {notifications.length === 0 ? (
            <p>No notifications</p>
          ) : (
            notifications.map((notif) => {
              if (notif.type === "connectResponse") {
                if (notif.status === "accepted") {
                  // Accepted connect response: clickable to navigate to messaging page.
                  // Instead of navigating directly, we call the conversation endpoint to find or create the conversation.
                  return (
                    <div
                      key={notif._id}
                      className="notification-item accepted"
                      onClick={() => {
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
                  // Rejected connect response: non-clickable
                  return (
                    <div key={notif._id} className="notification-item rejected">
                      <p>{notif.message}</p>
                    </div>
                  );
                }
              } else {
                // Pending connection request notifications with action buttons
                return (
                  <div key={notif._id} className="notification-item">
                    <p>{notif.senderName} wants to connect with you.</p>
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
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

import React, { useState, useEffect } from "react";
import axios from "axios";
//import { useNavigate } from "react-router-dom";

function AdminNotifications() {
  // Initialize state as an object with total and notifications (array)
  const [notificationsData, setNotificationsData] = useState({ total: 0, notifications: [] });
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // Optional filter by status
  const [page, setPage] = useState(1);
  const limit = 20; // Items per page

  //const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await axios.get("http://localhost:8080/api/admin/notifications", {
          headers: { Authorization: `Bearer ${token}` },
          params: { status: statusFilter, page, limit }
        });
        // Check the response shape in the console (uncomment below to debug)
        // console.log("Admin notifications response:", res.data);
        // Expecting an object: { total, notifications: [...] }
        setNotificationsData(res.data);
      } catch (err) {
        console.error("Error fetching admin notifications:", err);
        setError("Failed to load notifications.");
      }
    };
    fetchNotifications();
  }, [statusFilter, page]);

  // Inline styling – adjust as needed
  const containerStyle = {
    padding: "20px",
    fontFamily: "'Roboto', sans-serif",
    backgroundColor: "#ecf0f1",
    minHeight: "100vh"
  };

  const headingStyle = {
    textAlign: "center",
    marginBottom: "20px",
    color: "#2c3e50",
    fontSize: "1.8rem"
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
    backgroundColor: "#fff",
    borderRadius: "4px",
    overflow: "hidden",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
  };

  const theadStyle = {
    backgroundColor: "#2c3e50",
    color: "#ecf0f1"
  };

  const thStyle = {
    padding: "12px 10px",
    textAlign: "left"
  };

  const tdStyle = {
    borderBottom: "1px solid #ddd",
    padding: "12px 10px"
  };

  const paginationButtonStyle = {
    padding: "8px 12px",
    margin: "0 10px",
    cursor: "pointer",
    border: "none",
    borderRadius: "4px",
    backgroundColor: "#3498db",
    color: "#fff"
  };

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>All Notifications</h2>
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      {/* Filtering by status */}
      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        <label htmlFor="statusFilter">Filter by Status: </label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => { 
            setStatusFilter(e.target.value); 
            setPage(1); 
          }}
          style={{ padding: "5px", borderRadius: "4px" }}
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="read">Read</option>
        </select>
      </div>

      {notificationsData.notifications && notificationsData.notifications.length === 0 ? (
        <p style={{ textAlign: "center" }}>No notifications found.</p>
      ) : (
        <table style={tableStyle}>
          <thead style={theadStyle}>
            <tr>
              <th style={thStyle}>Sender</th>
              <th style={thStyle}>Receiver</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Message</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Created At</th>
            </tr>
          </thead>
          <tbody>
            {notificationsData.notifications.map((notif) => (
              <tr key={notif._id}>
                <td style={tdStyle}>
                  {notif.senderId && notif.senderId.fullName ? notif.senderId.fullName : "Unknown"}
                </td>
                <td style={tdStyle}>
                  {notif.receiverId && notif.receiverId.fullName ? notif.receiverId.fullName : "Unknown"}
                </td>
                <td style={tdStyle}>{notif.type}</td>
                <td style={tdStyle}>{notif.message}</td>
                <td style={tdStyle}>{notif.status}</td>
                <td style={tdStyle}>{new Date(notif.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination Controls */}
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          style={paginationButtonStyle}
        >
          Previous
        </button>
        <span>Page {page}</span>
        <button
          onClick={() => setPage((prev) => prev + 1)}
          disabled={notificationsData.notifications.length < limit}
          style={paginationButtonStyle}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default AdminNotifications;

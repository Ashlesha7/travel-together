import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminNotifications() {
  const [notificationsData, setNotificationsData] = useState({ total: 0, notifications: [] });
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); 
  const [page, setPage] = useState(1);
  const limit = 20; // Items per page

  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await axios.get("http://localhost:8080/api/admin/notifications", {
          headers: { Authorization: `Bearer ${token}` },
          params: { status: statusFilter, page, limit }
        });
        
        setNotificationsData(res.data);
      } catch (err) {
        console.error("Error fetching admin notifications:", err);
        setError("Failed to load notifications.");
      }
    };
    fetchNotifications();
  }, [statusFilter, page]);

  // Sidebar and Layout styles 
  const containerStyle = {
    display: "flex",
    width: "100vw",
    height: "100vh",
    margin: 0,
    padding: 0,
    fontFamily: "'Roboto', sans-serif",
    boxSizing: "border-box",
    overflow: "hidden"
  };

  const sidebarStyle = {
    width: "240px",
    height: "100%",
    background: "linear-gradient(135deg, #2c3e50, #34495e)",
    color: "#ecf0f1",
    padding: "20px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column"
  };

  const sidebarHeaderStyle = {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "1.5rem"
  };

  const sidebarItemStyle = {
    marginBottom: "1rem",
    cursor: "pointer",
    padding: "0.5rem 1rem",
    borderRadius: "4px",
    transition: "background-color 0.3s"
  };

  const mainContentStyle = {
    flex: 1,
    height: "100%",
    overflowY: "auto",
    backgroundColor: "#ecf0f1",
    padding: "20px",
    boxSizing: "border-box"
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

  
  // Sidebar hover effects 
 
  const [hoveredItem, setHoveredItem] = useState(null);

  const handleMouseEnter = (index) => setHoveredItem(index);
  const handleMouseLeave = () => setHoveredItem(null);

  const getSidebarItemDynamicStyle = (index) => {
    return hoveredItem === index ? { backgroundColor: "rgba(255, 255, 255, 0.1)" } : {};
  };

  
  // Render the component
  return (
    <div style={containerStyle}>
      {/* Sidebar Navigation */}
      <div style={sidebarStyle}>
        <div style={sidebarHeaderStyle}>Admin Panel</div>
        <div
          style={{ ...sidebarItemStyle, ...getSidebarItemDynamicStyle(0) }}
          onMouseEnter={() => handleMouseEnter(0)}
          onMouseLeave={handleMouseLeave}
          onClick={() => navigate("/admin/dashboard")}
        >
          Dashboard
        </div>
        <div
          style={{
            ...sidebarItemStyle,
            ...getSidebarItemDynamicStyle(1),
            backgroundColor: "rgba(255, 255, 255, 0.1)"
          }}
          onMouseEnter={() => handleMouseEnter(1)}
          onMouseLeave={handleMouseLeave}
          onClick={() => navigate("/admin/users")}
        >
          Users
        </div>
        <div
          style={{ ...sidebarItemStyle, ...getSidebarItemDynamicStyle(5) }}
          onMouseEnter={() => handleMouseEnter(5)}
          onMouseLeave={handleMouseLeave}
          onClick={() => navigate("/admin/trip-plans")}
        >
          Trip Plans
        </div>
        <div
        style={{ ...sidebarItemStyle, ...getSidebarItemDynamicStyle(6) }}
        onMouseEnter={() => handleMouseEnter(6)}
        onMouseLeave={handleMouseLeave}
        onClick={() => navigate("/admin/notifications")}
        >
          Notifications
          </div>

        <div
          style={{ ...sidebarItemStyle, ...getSidebarItemDynamicStyle(2) }}
          onMouseEnter={() => handleMouseEnter(2)}
          onMouseLeave={handleMouseLeave}
          onClick={() => navigate("/admin/reports")}
        >
          Reports
        </div>
        <div
          style={{ ...sidebarItemStyle, ...getSidebarItemDynamicStyle(3) }}
          onMouseEnter={() => handleMouseEnter(3)}
          onMouseLeave={handleMouseLeave}
          onClick={() => navigate("/admin/reviews")}
        >
          Ratings and Reviews
        </div>
        <div
          style={{ ...sidebarItemStyle, ...getSidebarItemDynamicStyle(4) }}
          onMouseEnter={() => handleMouseEnter(4)}
          onMouseLeave={handleMouseLeave}
          onClick={() => {
            localStorage.removeItem("adminToken");
            navigate("/admin/login");
          }}
        >
          Logout
        </div>
      </div>

      {/* Main Content Area */}
      <div style={mainContentStyle}>
        <h2 style={headingStyle}>All Notifications</h2>
        {error && (
          <p style={{ color: "red", textAlign: "center" }}>{error}</p>
        )}

        {/* Filtering Controls */}
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

        {/* Check if notifications array exists and render the table */}
        {notificationsData?.notifications?.length === 0 ? (
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
              {notificationsData?.notifications?.map((notif) => (
                <tr key={notif._id}>
                  <td style={tdStyle}>
                    {notif.senderId && notif.senderId.fullName
                      ? notif.senderId.fullName
                      : "Unknown"}
                  </td>
                  <td style={tdStyle}>
                    {notif.receiverId && notif.receiverId.fullName
                      ? notif.receiverId.fullName
                      : "Unknown"}
                  </td>
                  <td style={tdStyle}>{notif.type}</td>
                  <td style={tdStyle}>{notif.message}</td>
                  <td style={tdStyle}>{notif.status}</td>
                  <td style={tdStyle}>
                    {new Date(notif.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination Controls */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "1rem",
            marginTop: "20px"
          }}
        >
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
            disabled={notificationsData?.notifications?.length < limit}
            style={paginationButtonStyle}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminNotifications;

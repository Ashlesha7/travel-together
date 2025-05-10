import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";    

function AdminReviews() {
  // ensure consistent background & no outer scroll
  React.useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.background = "#ecf0f1";
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.background = null;
      document.body.style.overflow = null;
    };
  }, []);

  const [reviewsData, setReviewsData] = useState({ total: 0, reviews: [] });
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;
  const navigate = useNavigate();

  // fetch reviews from server
  const fetchReviews = useCallback(async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const res = await axios.get("http://localhost:8080/api/admin/reviews", {
                headers: { Authorization: `Bearer ${token}` },
                params: { page, limit },
            });
            setReviewsData(res.data);
        } catch (err) {
            console.error("Error fetching reviews:", err);
            setError("Failed to load reviews.");
        }
    }, [page]);

    // initial & page‑change load
    useEffect(() => {
    fetchReviews();
    }, [fetchReviews]); 

  // delete a review
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`http://localhost:8080/api/admin/reviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchReviews(); // refresh after delete
    } catch (err) {
      console.error("Error deleting review:", err);
      alert("Could not delete review.");
    }
  };

  // Layout & styling
  const containerStyle = {
    display: "flex",
    width: "100vw",
    height: "100vh",
    margin: 0,
    padding: 0,
    boxSizing: "border-box",
    backgroundColor: "#ecf0f1",
  };

  const sidebarStyle = {
    width: "240px",
    position: "fixed",
    top: 0,
    left: 0,
    height: "100vh",
    background: "#2c3e50",
    color: "#ecf0f1",
    padding: "20px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
  };

  const sidebarHeaderStyle = {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "1.5rem",
  };

  const sidebarItemStyle = {
    marginBottom: "1rem",
    cursor: "pointer",
    padding: "0.5rem 1rem",
    borderRadius: "4px",
    transition: "background-color 0.3s",
  };

  const [hoveredItem, setHoveredItem] = useState(null);
  const handleMouseEnter = (idx) => setHoveredItem(idx);
  const handleMouseLeave = () => setHoveredItem(null);
  const getSidebarItemStyle = (idx) =>
    hoveredItem === idx ? { backgroundColor: "rgba(255,255,255,0.1)" } : {};

  // main area fills remaining space and scrolls
  const mainContentStyle = {
    flex: 1,
    marginLeft: "240px",
    padding: "20px",
    height: "100vh",
    overflowY: "auto",
    backgroundColor: "#ecf0f1",
    boxSizing: "border-box",
  };

  // white card wrapper matching Users page
  const cardStyle = {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    padding: "20px",
    marginBottom: "20px",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
  };
  const theadStyle = { backgroundColor: "#2c3e50", color: "#ecf0f1" };
  const thStyle = { padding: "12px 10px", textAlign: "left" };
  const tdStyle = { borderBottom: "1px solid #ddd", padding: "12px 10px" };

  const deleteButtonStyle = {
    backgroundColor: "#e74c3c",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer",
  };

  const paginationStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "20px",
  };
  const paginationButtonStyle = {
    padding: "8px 16px",
    margin: "0 8px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    backgroundColor: "#3498db",
    color: "#fff",
  };
  const paginationButtonDisabled = {
    ...paginationButtonStyle,
    backgroundColor: "#95a5a6",
    cursor: "not-allowed",
  };

  return (
    <div style={containerStyle}>
      {/* Sidebar */}
      <div style={sidebarStyle}>
        <div style={sidebarHeaderStyle}>Admin Panel</div>
        {[
          { label: "Dashboard", path: "/admin/dashboard" },
          { label: "Users", path: "/admin/users" },
          { label: "Trip Plans", path: "/admin/trip-plans" },
          { label: "Notifications", path: "/admin/notifications" },
          { label: "Reports", path: "/admin/reports" },
          { label: "Ratings and Reviews", path: "/admin/reviews" },
        ].map((it, idx) => (
          <div
            key={idx}
            style={{ ...sidebarItemStyle, ...getSidebarItemStyle(idx) }}
            onMouseEnter={() => handleMouseEnter(idx)}
            onMouseLeave={handleMouseLeave}
            onClick={() => navigate(it.path)}
          >
            {it.label}
          </div>
        ))}
        <div
          style={sidebarItemStyle}
          onMouseEnter={() => handleMouseEnter(6)}
          onMouseLeave={handleMouseLeave}
          onClick={() => {
            localStorage.removeItem("adminToken");
            navigate("/admin/login");
          }}
        >
          Logout
        </div>
      </div>

      {/* Main content */}
      <main style={mainContentStyle}>
        <div style={cardStyle}>
          <h2 style={{ textAlign: "center", color: "#2c3e50", marginBottom: "20px" }}>
            Ratings and Reviews
          </h2>
          {error && <p style={{ color: "#c0392b", textAlign: "center" }}>{error}</p>}

          <table style={tableStyle}>
            <thead style={theadStyle}>
              <tr>
                <th style={thStyle}>Reviewer</th>
                <th style={thStyle}>Reviewee</th>
                <th style={thStyle}>Rating</th>
                <th style={thStyle}>Comment</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviewsData.reviews.map((r, i) => (
                <tr
                  key={r._id}
                  style={i % 2 === 0 ? { backgroundColor: "#fafafa" } : {}}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f8ff")}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = i % 2 === 0 ? "#fafafa" : "#fff")
                  }
                >
                  <td style={tdStyle}>{r.reviewerId?.fullName || "-"}</td>
                  <td style={tdStyle}>{r.revieweeId?.fullName || "-"}</td>
                  <td style={{ ...tdStyle, color: "#f1c40f" }}>
                    {Array(r.rating).fill("★").join("")}
                  </td>
                  <td style={tdStyle}>{r.comment || "-"}</td>
                  <td style={tdStyle}>{new Date(r.createdAt).toLocaleString()}</td>
                  <td style={tdStyle}>
                    <button style={deleteButtonStyle} onClick={() => handleDelete(r._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={paginationStyle}>
            <button
              style={page === 1 ? paginationButtonDisabled : paginationButtonStyle}
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
            >
              Prev
            </button>
            <span>Page {page}</span>
            <button
              style={reviewsData.reviews.length < limit ? paginationButtonDisabled : paginationButtonStyle}
              disabled={reviewsData.reviews.length < limit}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminReviews;

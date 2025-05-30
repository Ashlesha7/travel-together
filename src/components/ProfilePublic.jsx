import React, { useState, useEffect } from "react";
import axios from "axios";
import Navigation from "./Navigation";
import "./Profile.css";

export default function ProfilePublic({ userId }) {
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    async function fetchPublicUser() {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/users/${userId}`
        );
        setUser(response.data);
      } catch (err) {
        console.error("Error fetching public profile:", err);
      }
    }
    if (userId) fetchPublicUser();
  }, [userId]);

    // fetch this user’s received reviews
   useEffect(() => {
     if (!userId) return;
     const token = localStorage.getItem("token");
     axios
       .get(`http://localhost:8080/api/reviews/user/${userId}`, {
         headers: { Authorization: token },
       })
       .then(res => setReviews(res.data))
       .catch(err => console.error("Error fetching reviews:", err));
   }, [userId]);

  const formatJoinedDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const options = { year: "numeric", month: "long" };
    return date.toLocaleDateString(undefined, options);
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="profile-page">
      <Navigation user={JSON.parse(localStorage.getItem("user") || "{}")} />

      {/* Cover Photo (public) */}
      <section className="fullwidth-cover">
        {user.coverPhoto ? (
          <img
            src={
              user.coverPhoto.startsWith("http")
                ? user.coverPhoto
                : `http://localhost:8080/${user.coverPhoto}`
            }
            alt="Cover"
            className="cover-image"
          />
        ) : (
          <div className="cover-placeholder">No Cover Photo</div>
        )}
      </section>

      <div className="profile-main">
        {/* Header: Avatar + Name */}
        <div className="profile-header">
          <div className="profile-picture-wrapper">
            {user.profilePhoto ? (
              <img
                src={
                  user.profilePhoto.startsWith("http")
                    ? user.profilePhoto
                    : `http://localhost:8080/${user.profilePhoto}`
                }
                alt="User Profile"
                className="profile-picture-circle"
              />
            ) : (
              <div className="profile-picture-placeholder">
                No Profile Photo
              </div>
            )}
            <span className="profile-label">Profile</span>
          </div>
          <h1 className="profile-username">
            {user.fullName || "User Name"}
          </h1>
        </div>

        {/* Public Info Sections */}
        <div className="info-container">
          <div className="profile-info-section">
            <div className="section-header">
              <h2>About Me</h2>
            </div>
            <div className="section-content">
              <p>Home base: {user.homeBase || "Not specified"}</p>
              <p>Joined in: {formatJoinedDate(user.createdAt)}</p>
              <p>Birth Year: {user.birthYear || "Not specified"}</p>
              <p>Gender: {user.gender || "Not specified"}</p>
            </div>
          </div>

          <hr />

          <div className="profile-info-section">
            <div className="section-header">
              <h2>Bio</h2>
            </div>
            <div className="section-content">
              <p>{user.bio || "No bio yet."}</p>
            </div>
          </div>
        </div>
        <div className="info-container">
           <hr/>
            <div className="profile-info-section">
              <h2>Reviews</h2>
              {reviews.length === 0 ? (
                <p>No reviews yet.</p>
                ) : (
                  reviews.map(r => (
                    <div key={r._id} className="review-item">
                      <div className="stars">
                        {"★".repeat(r.rating) + "☆".repeat(5 - r.rating)}
                        </div>
                      <p className="review-comment">{r.comment}</p>
                      <small className="review-meta">
                        by {r.reviewerId?.fullName || "Anonymous"} on{" "}
                        {new Date(r.createdAt).toLocaleDateString()}
                      </small>
                      </div>
                  ))
                )}
            </div>
        </div>
      </div>

    </div>
  );
}

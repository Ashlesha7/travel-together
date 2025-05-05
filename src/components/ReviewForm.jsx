import React, { useState } from "react";
import PropTypes from "prop-types";
import "./ReviewForm.css";    // ← import your CSS

export default function ReviewForm({
  tripId,
  revieweeId,
  reviewerId,
  onSubmitted,
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1) return;
    setSubmitting(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const resp = await fetch("http://localhost:8080/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          tripId,
          revieweeId,
          reviewerId,
          rating,
          comment,
        }),
      });
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        throw new Error(body.message || "Failed to submit review");
      }
      setRating(0);
      setComment("");
      onSubmitted();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="review-form"
    >
      <h3 className="review-form__title">Leave a Review</h3>

      {/* Numeric label */}
      <div className="rating-value">{rating || 0}/5</div>

      {/* Star selector */}
      <div className="star-container">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`star-btn ${
              (hoverRating || rating) >= star ? "filled" : "empty"
            }`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            aria-label={`${star} Star${star > 1 ? "s" : ""}`}
          >
            ★
          </button>
        ))}
      </div>

      {/* Comment */}
      <div className="comment-box">
        <label htmlFor="comment">Comment (optional)</label>
        <textarea
          id="comment"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      {error && <p className="error-message">Error: {error}</p>}

      <button
        type="submit"
        disabled={submitting || rating < 1}
        className="submit-btn view-profile-button"
      >
        {submitting ? "Submitting…" : "Submit Review"}
      </button>
    </form>
  );
}

ReviewForm.propTypes = {
  tripId: PropTypes.string.isRequired,
  revieweeId: PropTypes.string.isRequired,
  reviewerId: PropTypes.string.isRequired,
  onSubmitted: PropTypes.func.isRequired,
};


const express    = require("express");
const mongoose   = require("mongoose");
const router     = express.Router();

const Review       = require("./reviewModel");
const Trip         = require("./tripPlanModel");
const Connection   = require("./connectionModel");
const Notification = require("./notificationModel");
const User         = require("./userModel");       

/**
 * POST /api/reviews
 * Body: { tripId?, reviewerId, revieweeId, rating, comment }
 */
router.post("/", async (req, res) => {
  try {
    const { tripId, reviewerId, revieweeId, rating, comment } = req.body;
    if (!reviewerId || !revieweeId || !rating) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 1) If tripId provided, verify trip exists & ended
    if (tripId) {
      if (!mongoose.Types.ObjectId.isValid(tripId)) {
        return res.status(400).json({ message: "Invalid tripId" });
      }
      const trip = await Trip.findById(tripId);
      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }
      if (
        trip.status !== "completed" && // admin did not auto-complete
        new Date(trip.endDate) > new Date() // trip not ended yet
      ) {
        return res.status(400).json({ message: "Trip has not completed yet" });
      }
    }

    // 2) Verify accepted companion via Connection or Notification fallback
    let validConnection = false;
    if (tripId) {
      validConnection = await Connection.exists({
        tripId,
        status: "accepted",
        $or: [
          { requester: reviewerId, requestee: revieweeId },
          { requester: revieweeId, requestee: reviewerId },
        ],
      });
    }
    // fallback: accepted connectResponse notification
    if (!validConnection) {
      validConnection = await Notification.exists({
        status: "accepted",
        $or: [
          { type: "connectRequest",senderId: reviewerId, receiverId: revieweeId },
          { type: "connectRequest",senderId: revieweeId, receiverId: reviewerId },
          { type: "connectResponse", senderId: reviewerId, receiverId: revieweeId },
          { type: "connectResponse", senderId: revieweeId, receiverId: reviewerId },
        ],
      });
    }
    if (!validConnection) {
      return res.status(403).json({ message: "No valid companion connection found" });
    }

    // 3) Prevent duplicate reviews on the same trip
    const existing = await Review.findOne({ tripId, reviewerId, revieweeId });
    if (existing) {
      return res.status(400).json({ message: "Review already submitted" });
    }

    // ─── NEW BLOCK ────────────────────────────────────────────────────────────────
    // 4) Look up each user’s fullName so we can store it
    const [ reviewer, reviewee ] = await Promise.all([
      User.findById(reviewerId, "fullName"),
      User.findById(revieweeId, "fullName"),
    ]);
    if (!reviewer || !reviewee) {
      return res.status(404).json({ message: "Reviewer or reviewee not found" });
    }
    // ────────────────────────────────────────────────────────────────────────────────

    // 5) Persist review (with names)
    const review = await Review.create({
      tripId,
      reviewerId,
      revieweeId,
      reviewerName: reviewer.fullName,   // ← NEW
      revieweeName: reviewee.fullName,   // ← NEW
      rating,
      comment,
    });

    return res.status(201).json(review);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/reviews/user/:userId
 * Returns all reviews received by that user
 */
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }
    const reviews = await Review.find({ revieweeId: userId })
      .populate("reviewerId", "fullName profilePhoto")
      .sort({ createdAt: -1 });
    return res.json(reviews);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/reviews/trip/:tripId
 * Returns all reviews for a trip
 */
router.get("/trip/:tripId", async (req, res) => {
  try {
    const { tripId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ message: "Invalid tripId" });
    }
    const reviews = await Review.find({ tripId })
      .populate("reviewerId", "fullName profilePhoto")
      .sort({ createdAt: -1 });
    return res.json(reviews);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

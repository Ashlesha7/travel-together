// backend/connectionRoutes.js
const express = require("express");
const router  = express.Router();
const jwt     = require("jsonwebtoken");
const Connection = require("./connectionModel");

const JWT_SECRET = process.env.JWT_SECRET || "apple123";

// Inline auth middleware
function auth(req, res, next) {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ msg: "Access Denied" });
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ msg: "Invalid token" });
  }
}

/**
 * GET /api/connections/status
 * Query params:
 *   - otherUserId: ID of the other user
 *   - tripId:      ID of the trip
 * Returns JSON { connectionExists: boolean }
 */
router.get("/status", auth, async (req, res) => {
  const { otherUserId, tripId } = req.query;
  if (!otherUserId || !tripId) {
    return res.status(400).json({ msg: "Missing otherUserId or tripId" });
  }
  try {
    const exists = await Connection.exists({
      tripId,
      status: "accepted",
      $or: [
        { requester: req.user._id, requestee: otherUserId },
        { requester: otherUserId, requestee: req.user._id }
      ]
    });
    res.json({ connectionExists: !!exists });
  } catch (err) {
    console.error("Error checking connection status:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * GET /api/connections/chat/:chatRoomId
 * Path param:
 *   - chatRoomId: ID of the chat room
 * Returns the Connection record for the chat room if accepted
 */
router.get("/chat/:chatRoomId", auth, async (req, res) => {
  const { chatRoomId } = req.params;
  if (!chatRoomId) {
    return res.status(400).json({ msg: "Missing chatRoomId" });
  }
  try {
    const conn = await Connection.findOne({
      chatRoomId,
      status: "accepted"
    });
    if (!conn) {
      return res.status(404).json({ msg: "Connection not found" });
    }
    res.json({
      tripId:    conn.tripId,
      requester: conn.requester,
      requestee: conn.requestee,
      status:    conn.status,
      chatRoomId: conn.chatRoomId
    });
  } catch (err) {
    console.error("Error fetching connection by chatRoomId:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;

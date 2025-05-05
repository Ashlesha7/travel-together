// // notificationRoutes.js
// const express = require("express");
// const router = express.Router();
// const Notification = require("./notificationModel"); // Import your Notification model
// const jwt = require("jsonwebtoken");
// const JWT_SECRET = process.env.JWT_SECRET || "apple123";

// // A simple auth middleware (if you already have one, reuse it)
// function auth(req, res, next) {
//   const token = req.header("Authorization");
//   if (!token) return res.status(401).json({ msg: "Access Denied" });
//   try {
//     const verified = jwt.verify(token, JWT_SECRET);
//     req.user = verified;
//     next();
//   } catch (error) {
//     res.status(400).json({ msg: "Invalid token" });
//   }
// }

// // 1) Send a notification
// router.post("/notifications/send", auth, async (req, res) => {
//   try {
//     const { senderId, senderName, receiverId, type, message } = req.body;

//     // Basic validation
//     if (!senderId || !receiverId || !type || !message) {
//       return res.status(400).json({ msg: "Missing required fields" });
//     }

//     // Create and save a new notification
//     const newNotification = new Notification({
//       senderId,
//       senderName,
//       receiverId,
//       type,
//       message,
//     });
//     await newNotification.save();

//     res
//       .status(201)
//       .json({ msg: "Notification created", notification: newNotification });
//   } catch (err) {
//     console.error("Error creating notification:", err);
//     res.status(500).json({ msg: "Server error", error: err.message });
//   }
// });

// // 2) Fetch notifications for the logged-in user
// //    Returns pending notifications and connectResponse notifications.
// router.get("/notifications", auth, async (req, res) => {
//   try {
//     const notifications = await Notification.find({
//       receiverId: req.user.id,
//       $or: [{ status: "pending" }, { type: "connectResponse" }],
//     }).sort({ createdAt: -1 });
//     res.status(200).json(notifications);
//   } catch (err) {
//     console.error("Error fetching notifications:", err);
//     res.status(500).json({ msg: "Server error", error: err.message });
//   }
// });

// // 3) Respond to a notification (Accept/Reject)
// router.post("/notifications/respond", auth, async (req, res) => {
//   try {
//     const { notificationId, response } = req.body;
//     const notification = await Notification.findById(notificationId);
//     if (!notification) {
//       return res.status(404).json({ msg: "Notification not found" });
//     }

//     // Ensure only the intended receiver can respond
//     if (notification.receiverId.toString() !== req.user.id) {
//       return res
//         .status(403)
//         .json({ msg: "Not authorized to respond to this notification" });
//     }

//     if (response === "accept") {
//       notification.status = "accepted";
//     } else if (response === "reject") {
//       notification.status = "rejected";
//     } else {
//       return res.status(400).json({ msg: "Invalid response action" });
//     }

//     await notification.save();

//     // Create a response notification to inform the sender about the result.
//     const responseNotification = new Notification({
//       senderId: req.user.id, // responder becomes the sender
//       senderName: req.user.fullName || "Responder",
//       receiverId: notification.senderId,
//       type: "connectResponse",
//       message: `Your connection request was ${notification.status} by ${
//         req.user.fullName || "the user"
//       }.`,
//       status: notification.status,
//     });
//     await responseNotification.save();

//     res.status(200).json({
//       msg: "Notification updated",
//       notification,
//       responseNotification,
//     });
//   } catch (err) {
//     console.error("Error responding to notification:", err);
//     res.status(500).json({ msg: "Server error", error: err.message });
//   }
// });

// // 4) Check connection status between logged-in user and another user
// router.get("/notifications/connection-status", auth, async (req, res) => {
//   try {
//     const { otherUserId } = req.query;
//     if (!otherUserId) {
//       return res.status(400).json({ msg: "Missing otherUserId parameter" });
//     }
//     // Look for an accepted connection request between the two users.
//     const connection = await Notification.findOne({
//       type: "connectRequest",
//       status: "accepted",
//       $or: [
//         { senderId: req.user.id, receiverId: otherUserId },
//         { senderId: otherUserId, receiverId: req.user.id },
//       ],
//     });
//     res.status(200).json({ connectionExists: !!connection });
//   } catch (err) {
//     console.error("Error checking connection status:", err);
//     res.status(500).json({ msg: "Server error", error: err.message });
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Notification = require("./notificationModel");
const Connection = require("./connectionModel");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "apple123";

//  auth middleware 
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

// 1) Send a notification
router.post("/notifications/send", auth, async (req, res) => {
  try {
    const { senderId, senderName, receiverId, type, message, tripId } = req.body;

    //  validation
    if (!senderId || !receiverId || !type || !message) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    // Create and save a new notification
    const newNotification = new Notification({
      senderId,
      senderName,
      receiverId,
      type,
      message,
      tripId,
    });
    await newNotification.save();

    res
      .status(201)
      .json({ msg: "Notification created", notification: newNotification });
  } catch (err) {
    console.error("Error creating notification:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// 2) Fetch notifications for the logged-in user
//    Returns pending notifications and connectResponse notifications.
router.get("/notifications", auth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      receiverId: req.user.id,
      $or: [
        { status: "pending" },
        { type: "connectResponse", status: "pending" }
      ],
    }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});


// 3) Respond to a notification (Accept/Reject)
router.post("/notifications/respond", auth, async (req, res) => {
  try {
    const { notificationId, response } = req.body;
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ msg: "Notification not found" });
    }

    // Ensure only the intended receiver can respond
    if (notification.receiverId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ msg: "Not authorized to respond to this notification" });
    }

    if (response === "accept") {
      notification.status = "accepted";
    } else if (response === "reject") {
      notification.status = "rejected";
    } else {
      return res.status(400).json({ msg: "Invalid response action" });
    }

    await notification.save();

    // Check if the notification is a connection request
    if (response === "accept") {
      await Connection.create({
        tripId:   notification.tripId, 
        requester: notification.senderId,
        requestee: notification.receiverId,
        status:   "accepted",
        chatRoomId: notification.chatRoomId
      });
    }

    // Create a response notification to inform the sender about the result.
    const responseNotification = new Notification({
      senderId: req.user.id, 
      senderName: req.user.fullName || "Responder",
      receiverId: notification.senderId,
      type: "connectResponse",
      message: `Your connection request was ${notification.status} by ${
        req.user.fullName || "the user"
      }.`,
      status: notification.status,
    });
    await responseNotification.save();

    res.status(200).json({
      msg: "Notification updated",
      notification,
      responseNotification,
    });
  } catch (err) {
    console.error("Error responding to notification:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// 4) Check connection status between logged-in user and another user
router.get("/notifications/connection-status", auth, async (req, res) => {
  try {
    const { otherUserId } = req.query;
    if (!otherUserId) {
      return res.status(400).json({ msg: "Missing otherUserId parameter" });
    }
    // Look for an accepted connection request between the two users.
    const connection = await Notification.findOne({
      type: "connectRequest",
      status: "accepted",
      $or: [
        { senderId: req.user.id, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: req.user.id },
      ],
    });
    res.status(200).json({ connectionExists: !!connection });
  } catch (err) {
    console.error("Error checking connection status:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});


// Endpoints for Persistent Unread Notifications

// 5) Fetch unread notifications count for the logged-in user
router.get("/notifications/unread", auth, async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      receiverId: req.user.id,
      status: "pending", 
    });
    res.status(200).json({ unreadCount });
  } catch (err) {
    console.error("Error fetching unread notifications:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// 6) Mark notifications as read for the logged-in user
router.post("/notifications/mark-read", auth, async (req, res) => {
  try {
    const { notificationIds } = req.body; // expecting an array of notification IDs
    if (!notificationIds || (Array.isArray(notificationIds) && notificationIds.length === 0)) {
      return res.status(400).json({ msg: "Missing notificationIds" });
    }
    
    // Explicitly cast the notificationIds and the receiver's id to ObjectId
    const castNotificationIds = notificationIds.map(id => mongoose.Types.ObjectId(id));
    //const receiverObjectId = mongoose.Types.ObjectId(req.user.id);

    // Update notifications that match
    const result = await Notification.updateMany(
      { 
        _id: { $in: castNotificationIds },
        //receiverId: receiverObjectId 
        receiverId: req.user.id 
      },
      { status: "read" }
    );
    console.log("Modified notifications count:", result.modifiedCount);
    res.status(200).json({ msg: "Notifications marked as read", modifiedCount: result.modifiedCount });
  } catch (err) {
    console.error("Error marking notifications as read:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});


// 7) Fetch notification history for the logged-in user (last 2 months)
// This endpoint returns all notifications (read or unread) created within the last 2 months.
router.get("/notifications/history", auth, async (req, res) => {
  try {
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    const notifications = await Notification.find({
      receiverId: req.user.id,
      createdAt: { $gte: twoMonthsAgo }
    }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (err) {
    console.error("Error fetching notification history:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});


module.exports = router;

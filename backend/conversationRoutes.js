// const express = require("express");
// const router = express.Router();
// const jwt = require("jsonwebtoken");
// const mongoose = require("mongoose"); // For casting IDs
// const Conversation = require("./conversationModel");
// const Message = require("./messageModel");
// const User = require("./userModel"); // For user lookups if needed

// const JWT_SECRET = process.env.JWT_SECRET || "apple123";

// // Simple auth middleware
// function auth(req, res, next) {
//   const token = req.header("Authorization");
//   if (!token) return res.status(401).json({ msg: "Access Denied" });
//   try {
//     const verified = jwt.verify(token, JWT_SECRET);
//     req.user = verified; // { id: "<some user id>", ... }
//     next();
//   } catch (error) {
//     res.status(400).json({ msg: "Invalid token" });
//   }
// }

// // 1) Find or create a conversation with "otherUserId"
// router.post("/conversations/find-or-create", auth, async (req, res) => {
//   try {
//     const { otherUserId } = req.body;
//     if (!otherUserId) {
//       return res.status(400).json({ msg: "Missing otherUserId" });
//     }

//     // Check if conversation already exists
//     let conversation = await Conversation.findOne({
//       participants: { $all: [req.user.id, otherUserId] },
//     });

//     // If none, create a new conversation
//     if (!conversation) {
//       conversation = new Conversation({
//         participants: [req.user.id, otherUserId],
//       });
//       await conversation.save();
//     }

//     // Populate participants to return the other user's details
//     await conversation.populate("participants", "fullName profilePhoto");

//     // Identify the other participant
//     const otherParticipant = conversation.participants.find(
//       (p) => String(p._id) !== String(req.user.id)
//     );
//     const responseData = {
//       _id: conversation._id,
//       userId: otherParticipant ? otherParticipant._id : null,
//       name: otherParticipant ? otherParticipant.fullName : "Unknown",
//       photo: otherParticipant ? otherParticipant.profilePhoto : "",
//     };

//     res.json(responseData);
//   } catch (err) {
//     console.error("Error creating/finding conversation:", err);
//     res.status(500).json({ msg: "Server error", error: err.message });
//   }
// });

// // 2) Fetch all conversations for the logged-in user
// router.get("/conversations", auth, async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const conversations = await Conversation.find({
//       participants: userId,
//     })
//       .sort({ updatedAt: -1 })
//       // Populate both "fullName" and "profilePhoto" for each participant
//       .populate("participants", "fullName profilePhoto");

//     // Simplify for frontend: include details of the other participant only
//     const convData = conversations.map((conv) => {
//       const otherParticipant = conv.participants.find(
//         (p) => String(p._id) !== String(userId)
//       );
//       return {
//         _id: conv._id,
//         userId: otherParticipant ? otherParticipant._id : null,
//         name: otherParticipant ? otherParticipant.fullName : "Unknown",
//         photo: otherParticipant ? otherParticipant.profilePhoto : "",
//       };
//     });

//     res.json(convData);
//   } catch (err) {
//     console.error("Error fetching conversations:", err);
//     res.status(500).json({ msg: "Server error", error: err.message });
//   }
// });

// // 3) Fetch messages for a conversation
// router.get("/messages/:conversationId", auth, async (req, res) => {
//   try {
//     const { conversationId } = req.params;
//     // Optionally, verify the user is a participant before fetching messages
//     const messages = await Message.find({ conversationId }).sort({ timestamp: 1 });
//     res.json(messages);
//   } catch (err) {
//     console.error("Error fetching messages:", err);
//     res.status(500).json({ msg: "Server error", error: err.message });
//   }
// });

// // 4) Post a new message
// router.post("/messages", auth, async (req, res) => {
//   try {
//     const { conversationId, text } = req.body;
//     if (!conversationId || !text) {
//       return res.status(400).json({ msg: "Missing conversationId or text" });
//     }

//     const newMessage = new Message({
//       conversationId,
//       senderId: req.user.id,
//       text,
//       timestamp: new Date(),
//     });
//     await newMessage.save();

//     // Optionally update the conversation's updatedAt timestamp
//     await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() });

//     res.status(201).json(newMessage);
//   } catch (err) {
//     console.error("Error creating message:", err);
//     res.status(500).json({ msg: "Server error", error: err.message });
//   }
// });

// module.exports = router;


const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose"); // For casting IDs
const Conversation = require("./conversationModel");
const Message = require("./messageModel");
const User = require("./userModel"); // For user lookups if needed

const JWT_SECRET = process.env.JWT_SECRET || "apple123";

// Simple auth middleware
function auth(req, res, next) {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ msg: "Access Denied" });
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified; // { id: "<some user id>", ... }
    next();
  } catch (error) {
    res.status(400).json({ msg: "Invalid token" });
  }
}

// 1) Find or create a conversation with "otherUserId"
router.post("/conversations/find-or-create", auth, async (req, res) => {
  try {
    const { otherUserId } = req.body;
    if (!otherUserId) {
      return res.status(400).json({ msg: "Missing otherUserId" });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, otherUserId] },
    });

    // If none, create a new conversation
    if (!conversation) {
      conversation = new Conversation({
        participants: [req.user.id, otherUserId],
      });
      await conversation.save();
    }

    // Populate participants to return the other user's details
    await conversation.populate("participants", "fullName profilePhoto");

    // Identify the other participant
    const otherParticipant = conversation.participants.find(
      (p) => String(p._id) !== String(req.user.id)
    );
    const responseData = {
      _id: conversation._id,
      userId: otherParticipant ? otherParticipant._id : null,
      name: otherParticipant ? otherParticipant.fullName : "Unknown",
      photo: otherParticipant ? otherParticipant.profilePhoto : "",
    };

    res.json(responseData);
  } catch (err) {
    console.error("Error creating/finding conversation:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// 2) Fetch all conversations for the logged-in user
router.get("/conversations", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await Conversation.find({
      participants: userId,
    })
      .sort({ updatedAt: -1 })
      // Populate both "fullName" and "profilePhoto" for each participant
      .populate("participants", "fullName profilePhoto");

    // Simplify for frontend: include details of the other participant only
    const convData = conversations.map((conv) => {
      const otherParticipant = conv.participants.find(
        (p) => String(p._id) !== String(userId)
      );
      return {
        _id: conv._id,
        userId: otherParticipant ? otherParticipant._id : null,
        name: otherParticipant ? otherParticipant.fullName : "Unknown",
        photo: otherParticipant ? otherParticipant.profilePhoto : "",
      };
    });

    res.json(convData);
  } catch (err) {
    console.error("Error fetching conversations:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// 3) Fetch messages for a conversation
router.get("/messages/:conversationId", auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    // Optionally, verify the user is a participant before fetching messages
    const messages = await Message.find({ conversationId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// 4) Post a new message
router.post("/messages", auth, async (req, res) => {
  try {
    const { conversationId, text } = req.body;
    if (!conversationId || !text) {
      return res.status(400).json({ msg: "Missing conversationId or text" });
    }

    const newMessage = new Message({
      conversationId,
      senderId: req.user.id,
      text,
      timestamp: new Date(),
    });
    await newMessage.save();

    // Optionally update the conversation's updatedAt timestamp
    await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() });

    // Re-query the saved message so that the encryption plugin auto-decrypts the text
    const savedMessage = await Message.findById(newMessage._id);
    res.status(201).json(savedMessage);
  } catch (err) {
    console.error("Error creating message:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// 5) Get unread message count for the logged-in user
// A message is considered unread if it was sent by someone else and the user's ID is not in the readBy array.
router.get("/messages/unreadCount", auth, async (req, res) => {
  try {
    const unreadCount = await Message.countDocuments({
      senderId: { $ne: req.user.id },
      readBy: { $ne: req.user.id },
    });
    res.status(200).json({ unreadCount });
  } catch (err) {
    console.error("Error fetching unread message count:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// 6) Mark messages as read for the logged-in user in a specific conversation
router.post("/messages/mark-read", auth, async (req, res) => {
  try {
    const { conversationId } = req.body;
    if (!conversationId) {
      return res.status(400).json({ msg: "Missing conversationId" });
    }
    // Update messages in this conversation where the user is not the sender and not yet marked as read
    await Message.updateMany(
      {
        conversationId,
        senderId: { $ne: req.user.id },
        readBy: { $ne: req.user.id },
      },
      { $push: { readBy: req.user.id } }
    );
    res.status(200).json({ msg: "Messages marked as read" });
  } catch (err) {
    console.error("Error marking messages as read:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

module.exports = router;

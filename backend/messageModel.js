// // messageModel.js
// const mongoose = require("mongoose");

// const messageSchema = new mongoose.Schema({
//   conversationId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Conversation",
//     required: true,
//   },
//   senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   text: { type: String, required: true },
//   timestamp: { type: Date, default: Date.now },

//   // NEW: Track which users have read this message
//   readBy: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//   ],
// });

// module.exports = mongoose.model("Message", messageSchema);


const mongoose = require("mongoose");
const fieldEncryption = require("mongoose-field-encryption").fieldEncryption; // Import the encryption plugin

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
    required: true,
  },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },

  // Track which users have read this message
  readBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

// Apply the encryption plugin to the "text" field
// This encrypts "text" before saving to MongoDB and automatically decrypts it when querying (if not using .lean())
messageSchema.plugin(fieldEncryption, {
  fields: ["text"],
  secret: process.env.ENCRYPTION_KEY || "np03cs4a220157",
});

module.exports = mongoose.model("Message", messageSchema);

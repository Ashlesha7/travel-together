// notificationModel.js
const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  senderName: { type: String, required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", NotificationSchema);

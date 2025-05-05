
const mongoose = require("mongoose");
const { Schema } = mongoose;

const NotificationSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  senderName: { type: String, required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, required: true },
  message: { type: String, required: true },
  status: { 
    type: String, 
    enum: ["pending", "accepted", "rejected", "read"], 
    default: "pending" 
  },
  createdAt: { type: Date, default: Date.now },
  tripId: { type: Schema.Types.ObjectId, ref: "TripPlan" , 
    required: function() {
      return this.type === "connectRequest";
    },
  },
  chatRoomId:   { type: Schema.Types.ObjectId, ref: "Conversation" }
});

module.exports = mongoose.model("Notification", NotificationSchema);

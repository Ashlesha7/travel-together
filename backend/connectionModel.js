// backend/connectionModel.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const ConnectionSchema = new Schema(
  {
    tripId: {
      type: Schema.Types.ObjectId,
      ref: "TripPlan",          // matches your TripPlan model name
      required: true,
    },
    requester: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requestee: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    chatRoomId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",      // if you tie them to a chat room
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Connection", ConnectionSchema);

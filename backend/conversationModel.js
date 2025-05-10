
const mongoose = require("mongoose");
const { Schema } = mongoose; 

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],

    tripPlanId: {
      type: Schema.Types.ObjectId,
      ref: "TripPlan",
      default: null      // allow null for conversations not tied to a trip
    },

  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);

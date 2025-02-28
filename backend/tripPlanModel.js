const mongoose = require("mongoose");

const TripPlanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
  userName: { type: String }, // Store user's name for history purposes
  tripType: { type: String, required: true },
  tripName: { type: String, required: true },
  shortDescription: { type: String, required: true },
  currentLocation: { type: String, required: true },
  destination: { type: String, required: true },
  meetupLocation: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  markerPosition: { type: Object },
  startCoordinates: { type: Object }, // New field for start location coordinates
  endCoordinates: { type: Object },   // New field for destination coordinates
  status: { type: String, enum: ["planned", "completed"], default: "planned" }, // Status tracking
  createdAt: { type: Date, default: Date.now },
});

// Auto-update status when fetching trips (completed if endDate has passed)
TripPlanSchema.pre("save", function (next) {
  if (this.endDate < new Date()) {
    this.status = "completed";
  }
  next();
});

const TripPlan = mongoose.model("TripPlan", TripPlanSchema);
module.exports = TripPlan;

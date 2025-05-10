const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const TripPlan = require("./tripPlanModel");
const User = require("./userModel"); 
const JWT_SECRET = process.env.JWT_SECRET || "apple123";

// Middleware to check token
const auth = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ msg: "Access Denied" });
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ msg: "Invalid token" });
  }
};

//  Create a new trip plan
router.post("/trip-plans", auth, async (req, res) => {
  try {
    const {
      tripType,
      tripName,
      shortDescription,
      currentLocation,
      destination,
      meetupLocation,
      startDate,
      endDate,
      markerPosition,
      startCoordinates,
      endCoordinates,
    } = req.body;

    if (
      !tripType ||
      !tripName ||
      !shortDescription ||
      !currentLocation ||
      !destination ||
      !meetupLocation ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const newTripPlan = new TripPlan({
      user: req.user.id,
      userName: user.fullName,
      tripType,
      tripName,
      shortDescription,
      currentLocation,
      destination,
      meetupLocation,
      startDate,
      endDate,
      markerPosition,
      startCoordinates,
      endCoordinates,
    });

    await newTripPlan.save();
    res
      .status(201)
      .json({ msg: "Trip plan created successfully", trip: newTripPlan });
  } catch (error) {
    console.error("Error creating trip:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// Get ALL trips (but must be logged in)
router.get("/trip-plans", auth, async (req, res) => {
  try {
    let allTrips = await TripPlan.find()
      .populate("user", "fullName profilePhoto")
      .sort({ createdAt: -1 });

    const now = new Date();
    await Promise.all(
      allTrips.map(async (trip) => {
        if (new Date(trip.endDate) < now && trip.status !== "completed") {
          trip.status = "completed";
          await trip.save();
        }
      })
    );

    allTrips = await TripPlan.find()
      .populate("user", "fullName profilePhoto gender birthYear")
      .sort({ createdAt: -1 });

    res.status(200).json(allTrips);
  } catch (error) {
    console.error("Error fetching all trips:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

//Mark trip as completed manually
router.patch("/trip-plans/:tripId/complete", auth, async (req, res) => {
  try {
    const trip = await TripPlan.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ msg: "Trip not found" });

    trip.status = "completed";
    await trip.save();
    res.status(200).json({ msg: "Trip marked as completed", trip });
  } catch (error) {
    console.error("Error marking trip as completed:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// Get one trip‑plan by its id
router.get("/trip-plans/:id", auth, async (req, res) => {
  try {
    const plan = await TripPlan
      .findById(req.params.id)
      .populate("user", "fullName profilePhoto");
    if (!plan) return res.status(404).json({ msg: "Trip not found" });
    res.json(plan);
  } catch (err) {
    console.error("Error fetching trip‑plan by id:", err);
    res.status(500).json({ msg: "Server error" });
  }
});


module.exports = router;

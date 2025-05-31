require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../admin/adminModel");  

const User = require("../userModel");        
const TripPlan = require("../tripPlanModel"); 
const Notification = require("../notificationModel");
const Review = require("../reviewModel");
const Conversation = require("../conversationModel");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "apple123";

// Admin Login Route
router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input: ensure email and password are provided
    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required." });
    }

    // Find admin in MongoDB by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ msg: "Invalid credentials." });
    }

    // Compare provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials." });
    }

    // Sign a JWT token including admin info and role
    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      msg: "Admin login successful.",
      token,
      admin: { id: admin._id, email: admin.email }
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// Middleware to verify admin token
function verifyAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ msg: "Access Denied, no token provided." });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err || decoded.role !== "admin") {
      return res.status(403).json({ msg: "Access Denied." });
    }
    req.admin = decoded;
    next();
  });
}

// Protected Admin Dashboard Route with Metrics
router.get("/admin/dashboard", verifyAdmin, async (req, res) => {
  try {
    // Query your User and TripPlan collections for metrics.
    const totalUsers = await User.countDocuments();
    const totalTrips = await TripPlan.countDocuments();
    // Fetch the three most recent signups (adjust the limit and fields as needed)
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select("email fullName");
    const recentSignups = recentUsers.map((user) => user.email);

    return res.status(200).json({
      msg: "Dashboard data loaded",
      totalUsers,
      totalTrips,
      recentSignups,
      admin: req.admin
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return res.status(500).json({ msg: "Server error", error: error.message });
  }
});

//  Get all users (for admin user management)
router.get("/admin/users", verifyAdmin, async (req, res) => {
  try {
    // Return only the fields you wish to display (omit sensitive data)
    const users = await User.find({}, "fullName email phoneNumber createdAt citizenshipNumber citizenshipPhoto birthYear gender bio homeBase profilePhoto isAccepted isRejected");
    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ msg: "Server error", error: error.message });
  }
});

//  Delete a user by ID
router.delete("/admin/users/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    return res.status(200).json({ msg: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// Accept a user (admin must approve before they can log in)
router.patch(
  "/admin/users/:id/accept",
  verifyAdmin,
  async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { isAccepted: true,
          isRejected: false 
         },

        { new: true }
      );
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }
      return res
        .status(200)
        .json({ msg: "User accepted successfully", user });
    } catch (error) {
      console.error("Accept user error:", error);
      return res
        .status(500)
        .json({ msg: "Server error", error: error.message });
    }
  }
);

// Reject a user (admin must reject before they can log in)
router.patch(
  "/admin/users/:id/reject",
  verifyAdmin,
  async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { isRejected: true, isAccepted: false },
        { new: true }
      );
      if (!user) return res.status(404).json({ msg: "User not found" });
      return res.status(200).json({ msg: "User rejected", user });
    } catch (error) {
      console.error("Reject user error:", error);
      return res.status(500).json({ msg: "Server error", error: error.message });
    }
  }
);


// New Admin Trip Plans Endpoints

// Get all trip plans (for admin trip plans management)
router.get("/admin/trip-plans", verifyAdmin, async (req, res) => {
  try {
    // Fetch all trip plans, optionally populate user fields for display
    const trips = await TripPlan.find()
      .populate("user", "fullName profilePhoto")
      .sort({ createdAt: -1 });
    return res.status(200).json(trips);
  } catch (error) {
    console.error("Error fetching trip plans:", error);
    return res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// Delete a trip plan by ID
router.delete("/admin/trip-plans/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await TripPlan.findByIdAndDelete(id);
    return res.status(200).json({ msg: "Trip plan deleted successfully" });
  } catch (error) {
    console.error("Error deleting trip plan:", error);
    return res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// Mark a trip plan as completed
router.patch("/admin/trip-plans/:id/complete", verifyAdmin, async (req, res) => {
  try {
    const trip = await TripPlan.findById(req.params.id);
    if (!trip) return res.status(404).json({ msg: "Trip not found" });
    trip.status = "completed";
    await trip.save();

     const io = req.app.get("io");
     const convs = await Conversation.find({ tripPlanId: trip._id });
     convs.forEach((conv) => {
      if (String(conv.userId) !== String(trip.user)) {
        io.to(conv._id.toString()).emit("tripCompleted", {
           tripId: trip._id.toString(),
           });
      }
       });
       
    return res.status(200).json({ msg: "Trip marked as completed", trip });
  } catch (error) {
    console.error("Error marking trip as completed:", error);
    return res.status(500).json({ msg: "Server error", error: error.message });
  }
});


// Endpoint for Admin Notifications
// This endpoint allows an admin to view notifications across all users.
router.get("/admin/notifications", verifyAdmin, async (req, res) => {
  if (!req.admin || req.admin.role !== "admin") {
    return res.status(403).json({ msg: "Admin access required" });
  }
  try {
    // Extract optional query params
    const { status, page = 1, limit = 20 } = req.query;
    
    // Build a filter object
    const filter = {};
    if (status) {
      // Only filter by status if it's provided
      filter.status = status;
    }

    // For pagination
    const skip = (page - 1) * limit;

    // Query the DB with  filter + pagination
    const notifications = await Notification.find(filter)
      .populate("senderId", "fullName")
      .populate("receiverId", "fullName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    //  get total count of matching notifications
    const totalCount = await Notification.countDocuments(filter);

    return res.status(200).json({
      total: totalCount,
      notifications
    });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});





// Reports Endpoint with Status Distribution

router.get("/admin/reports", verifyAdmin, async (req, res) => {
  try {
    // Aggregate user registrations per month
    const userRegistrations = await User.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);
    
    // Aggregate trip plans submissions per month
    const tripPlans = await TripPlan.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);
    
    // Aggregate trip plan status distribution
    const statusAggregation = await TripPlan.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    const statusDistribution = statusAggregation.map(item => ({
      status: item._id,
      count: item.count
    }));

    // Aggregate notification status distribution
    const notificationsDistribution = await Notification.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Convert _id to 'status' field
    const formattedNotificationsDist = notificationsDistribution.map(item => ({
      status: item._id,
      count: item.count
    }));
    
    
    // Convert numeric month to month abbreviations
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const formattedUserRegs = userRegistrations.map(item => ({
      month: monthNames[item._id - 1],
      count: item.count
    }));
    
    const formattedTripPlans = tripPlans.map(item => ({
      month: monthNames[item._id - 1],
      count: item.count
    }));
    
    res.status(200).json({
      userRegistrations: formattedUserRegs,
      tripPlans: formattedTripPlans,
      statusDistribution: statusDistribution,
      notificationsDistribution: formattedNotificationsDist
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// Get all reviews (for admin management)
router.get("/admin/reviews", verifyAdmin, async (req, res) => {
  try {
    // pagination support
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // fetch reviews, populate reviewer & reviewee names/photos
    const reviews = await Review.find()
      .populate("reviewerId", "fullName profilePhoto")
      .populate("revieweeId", "fullName profilePhoto")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    const total = await Review.countDocuments();

    return res.status(200).json({ total, reviews });
  } catch (err) {
    console.error("Error fetching admin reviews:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Delete a review by ID (admin only)
router.delete(
  "/admin/reviews/:id",
  verifyAdmin,
  async (req, res) => {
    try {
      const deleted = await Review.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ msg: "Review not found" });
      return res.status(200).json({ msg: "Review deleted" });
    } catch (err) {
      console.error("Error deleting review:", err);
      return res.status(500).json({ msg: "Server error" });
    }
  }
);

module.exports = router;

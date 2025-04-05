require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../admin/adminModel");  // Adjust path if needed

// New imports for gathering dashboard metrics:
const User = require("../userModel");        // Path to your User model
const TripPlan = require("../tripPlanModel");  // Path to your TripPlan model

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
    // Fetch the three most recent signups (you can adjust the limit and fields)
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

// New Endpoint: Get all users (for admin user management)
router.get("/admin/users", verifyAdmin, async (req, res) => {
  try {
    // Return only the fields you wish to display (omit sensitive data)
    const users = await User.find({}, "fullName email phoneNumber createdAt citizenshipNumber citizenshipPhoto birthYear gender bio homeBase profilePhoto");
    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// New Endpoint: Delete a user by ID
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

module.exports = router;

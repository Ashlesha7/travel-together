require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const nodemailer = require("nodemailer"); // NEW: Import nodemailer
const { OAuth2Client } = require("google-auth-library"); // NEW: Import Google Auth client
const User = require("./userModel");
const path = require("path");
const fs = require("fs");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "apple123"; // Change this to a strong secret key

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure Multer for File Uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, and JPG are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Setup Nodemailer transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // e.g., "smtp.gmail.com" for Gmail
  port: process.env.SMTP_PORT, // e.g., 587 for Gmail (or 465 for SSL)
  secure: process.env.SMTP_SECURE === "true", // true for port 465, false for 587
  auth: {
    user: process.env.SMTP_USER, // your email address
    pass: process.env.SMTP_PASS, // your email password or app password
  },
});

// ----------------------------
// NEW: Google Sign-In Endpoint
// ----------------------------
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
router.post("/google-signin", async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ msg: "Google token is required" });
  }
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // Check if user already exists; if not, create a new user record
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        fullName: name,
        email: email,
        phoneNumber: "",            // To be updated by the user later
        citizenshipNumber: "",      // To be updated by the user later
        password: "",               // No password required for Google sign in
        citizenshipPhoto: "",       // To be updated by the user later
        profilePhoto: picture,      // Use Google profile picture as default
      });
      await user.save();
    }

    // Generate JWT token
    const jwtToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

    // Determine if profile is complete (here we check for three critical fields)
    const profileComplete = user.phoneNumber && user.citizenshipNumber && user.citizenshipPhoto ? true : false;

    res.status(200).json({
      message: "Google sign-in successful",
      token: jwtToken,
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        profileComplete,
      },
    });
  } catch (error) {
    console.error("Google sign-in error:", error);
    res.status(500).json({ message: "Server error during Google sign-in", error: error.message });
  }
});

// ----------------------------
// Signup Route (Handles FormData & Files)
// ----------------------------
router.post(
  "/signup",
  upload.fields([{ name: "citizenshipPhoto" }, { name: "profilePhoto" }]),
  async (req, res) => {
    try {
      console.log("📥 Received signup request:", req.body);
      console.log("📂 Received files:", req.files);

      const { fullName, email, phoneNumber, citizenshipNumber, password } = req.body;

      // Ensure all fields are received
      if (!fullName || !email || !phoneNumber || !citizenshipNumber || !password) {
        return res.status(400).json({ msg: "All text fields are required" });
      }
      if (!req.files || !req.files.citizenshipPhoto || !req.files.profilePhoto) {
        return res
          .status(400)
          .json({ msg: "Both citizenshipPhoto and profilePhoto are required" });
      }

      // Check if user already exists
      let existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ msg: "User already exists" });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Save user to database
      const newUser = new User({
        fullName,
        email,
        phoneNumber,
        citizenshipNumber,
        password: hashedPassword,
        citizenshipPhoto: "uploads/" + req.files.citizenshipPhoto[0].filename,
        profilePhoto: "uploads/" + req.files.profilePhoto[0].filename,
      });

      await newUser.save();
      // Convert _id to string for consistency
      res.status(201).json({
        msg: "Signup successful",
        user: { id: newUser._id.toString(), email: newUser.email },
      });
    } catch (error) {
      console.error("❌ Signup error:", error);
      res.status(500).json({ msg: "Server error", error: error.message });
    }
  }
);

// ----------------------------
// Login Route
// ----------------------------
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

    // Return user._id as a string
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ----------------------------
// Forgot Password Route
// ----------------------------
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ msg: "Email is required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Generate a 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    // Set expiry for 15 minutes from now
    user.resetCode = resetCode;
    user.resetCodeExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    // Prepare email options
    const mailOptions = {
      from: `"YourApp Support" <${process.env.SMTP_USER}>`, // Change as appropriate
      to: user.email,
      subject: "Password Reset Code",
      text: `Hello ${user.fullName},\n\nYour password reset code is: ${resetCode}\nIt will expire in 15 minutes.\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nYourApp Team`,
    };

    // Send email using nodemailer
    await transporter.sendMail(mailOptions);

    res.status(200).json({ msg: "Reset code sent to your email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// ----------------------------
// Reset Password Route
// ----------------------------
router.post("/reset-password", async (req, res) => {
  const { email, resetCode, newPassword } = req.body;
  if (!email || !resetCode || !newPassword) {
    return res.status(400).json({ msg: "Email, reset code, and new password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Check if reset code matches and hasn't expired
    if (user.resetCode !== resetCode || (user.resetCodeExpiry && user.resetCodeExpiry < new Date())) {
      return res.status(400).json({ msg: "Invalid or expired reset code" });
    }

    // Hash the new password and update the user record
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    // Clear reset code fields
    user.resetCode = "";
    user.resetCodeExpiry = undefined;
    await user.save();

    res.status(200).json({ msg: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// ----------------------------
// Protected Route (To Check Token)
// ----------------------------
router.get("/profile", async (req, res) => {
  try {
    const token = req.header("Authorization");
    if (!token) {
      return res.status(401).json({ msg: "Access Denied" });
    }

    const verified = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(verified.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("❌ Authentication error:", error);
    res.status(401).json({ msg: "Invalid token" });
  }
});

// ----------------------------
// Serve Uploaded Files (Access Images)
// ----------------------------
router.use("/uploads", express.static(uploadDir));

// ----------------------------
// Get User Profile (Detailed)
// ----------------------------
router.get("/user-profile", async (req, res) => {
  try {
    const token = req.header("Authorization");
    if (!token) {
      return res.status(401).json({ msg: "Access Denied" });
    }

    const verified = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(verified.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("❌ Authentication error:", error);
    res.status(401).json({ msg: "Invalid token" });
  }
});

// ----------------------------
// Update User Profile
// ----------------------------
router.put("/user-profile", upload.single("coverPhoto"), async (req, res) => {
  try {
    const token = req.header("Authorization");
    if (!token) {
      return res.status(401).json({ msg: "Access Denied" });
    }
    const verified = jwt.verify(token, JWT_SECRET);

    let updatedFields = {
      bio: req.body.bio,
      homeBase: req.body.homeBase,
      birthYear: req.body.birthYear,
      gender: req.body.gender,
    };

    if (req.file) {
      updatedFields.coverPhoto = "uploads/" + req.file.filename;
    }

    const user = await User.findByIdAndUpdate(verified.id, updatedFields, { new: true });
    res.status(200).json({ msg: "Profile updated successfully!", user });
  } catch (error) {
    console.error("❌ Profile update error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// ----------------------------
// Additional route to update only cover photo
// ----------------------------
router.patch("/user-profile/cover", upload.single("coverPhoto"), async (req, res) => {
  try {
    const token = req.header("Authorization");
    if (!token) {
      return res.status(401).json({ msg: "Access Denied" });
    }

    const verified = jwt.verify(token, JWT_SECRET);
    if (!verified) {
      return res.status(401).json({ msg: "Invalid token" });
    }

    let updatedFields = {};
    if (req.file) {
      updatedFields.coverPhoto = "uploads/" + req.file.filename;
    }

    const user = await User.findByIdAndUpdate(verified.id, updatedFields, { new: true });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    return res.status(200).json({ msg: "Cover photo updated successfully!", user });
  } catch (error) {
    console.error("❌ Cover photo update error:", error);
    return res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// ----------------------------
// Lookup user by username
// ----------------------------
router.get("/users", async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ msg: "Username query parameter required" });
    }
    const user = await User.findOne({ fullName: username });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Error fetching user by username:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

module.exports = router;

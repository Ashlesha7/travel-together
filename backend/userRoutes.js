require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const User = require("./userModel");
const path = require("path");
const fs = require("fs");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "apple123"; // Change this to a strong secret key

// ✅ Ensure the uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// ✅ Configure Multer for File Uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    }
});

// ✅ File type filter (accept only images)
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
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// ✅ Signup Route (Handles FormData & Files)
router.post("/signup", upload.fields([{ name: "citizenshipPhoto" }, { name: "profilePhoto" }]), async (req, res) => {
    try {
        console.log("📥 Received signup request:", req.body);
        console.log("📂 Received files:", req.files);

        const { fullName, email, phoneNumber, citizenshipNumber, password } = req.body;

        // ✅ Ensure All Fields Are Received
        if (!fullName || !email || !phoneNumber || !citizenshipNumber || !password) {
            return res.status(400).json({ msg: "All text fields are required" });
        }
        if (!req.files || !req.files.citizenshipPhoto || !req.files.profilePhoto) {
            return res.status(400).json({ msg: "Both citizenshipPhoto and profilePhoto are required" });
        }

        // ✅ Check if User Already Exists
        let existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: "User already exists" });
        }

        // ✅ Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ Save User to Database
        const newUser = new User({
            fullName,
            email,
            phoneNumber,
            citizenshipNumber,
            password: hashedPassword,
            citizenshipPhoto:"uploads/" + req.files.citizenshipPhoto[0].filename,
            profilePhoto:"uploads/" + req.files.profilePhoto[0].filename,
        });

        await newUser.save();
        res.status(201).json({ msg: "Signup successful", user: { id: newUser._id, email: newUser.email } });

    } catch (error) {
        console.error("❌ Signup error:", error);
        res.status(500).json({ msg: "Server error", error: error.message });
    }
});

// ✅ Login Route
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // ✅ Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // ✅ Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // ✅ Generate JWT token
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
            }
        });
    } catch (error) {
        console.error("❌ Login error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// ✅ Protected Route (To Check Token)
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

// ✅ Serve Uploaded Files (Access Images)
router.use("/uploads", express.static(uploadDir));

// module.exports = router;

// ✅ Get User Profile
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

// ✅ Update User Profile
router.put("/user-profile", upload.single("coverPhoto"), async (req, res) => {
    try {
      const token = req.header("Authorization");
      if (!token) {
        return res.status(401).json({ msg: "Access Denied" });
      }
      const verified = jwt.verify(token, JWT_SECRET);
      
      // Build updatedFields from the request body:
      let updatedFields = { 
        bio: req.body.bio,         
        homeBase: req.body.homeBase,  
        birthYear: req.body.birthYear, 
        gender: req.body.gender        
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
  

  // ✅ Add this new route at the end of your userRoutes file (or wherever appropriate)
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
  
      // Build an object for fields you want to update
      let updatedFields = {};
  
      // If a file was uploaded, store its path in coverPhoto
      if (req.file) {
        updatedFields.coverPhoto = "uploads/" + req.file.filename;
      }
  
      // Optionally update other fields too (e.g., bio, about)
      // updatedFields.bio = req.body.bio;
      // updatedFields.about = req.body.about;
  
      // Update user in the database
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

  module.exports = router;
  
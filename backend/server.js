require("dotenv").config();
const express = require("express");
const connectDB = require("./db");
const userRoutes = require("./userRoutes");
const tripPlanRoutes = require("./tripPlanRoutes");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const morgan = require("morgan");

const app = express();

// ✅ Connect to MongoDB
connectDB().catch((err) => {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
});

// ✅ Ensure "uploads/" directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Allow CORS for both localhost:3000 and localhost:3001
const allowedOrigins = ["http://localhost:3000", "http://localhost:3001"];
app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    })
);

app.use(morgan("dev")); // Logs all requests for debugging

// File Upload Configuration
const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

// ✅ Serve Uploaded Files Correctly
app.use("/uploads", express.static(uploadDir));

// API Health Check Route
app.get("/", (req, res) => {
    res.status(200).json({ msg: "API is running 🚀" });
});

// User Routes
app.use("/api", userRoutes);

// Trip Plan Routes
app.use("/api", tripPlanRoutes);

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("❌ Global Error Handler:", err.message);
    res.status(500).json({ msg: "Something went wrong!", error: err.message });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

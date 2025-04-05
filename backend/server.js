require("dotenv").config();
const express = require("express");
const http = require("http"); // Create an HTTP server for Socket.IO
const socketio = require("socket.io"); // Socket.IO integration
const connectDB = require("./db");
const userRoutes = require("./userRoutes");
const tripPlanRoutes = require("./tripPlanRoutes");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const morgan = require("morgan");
const notificationRoutes = require("./notificationRoutes");

// Import conversationRoutes
const conversationRoutes = require("./conversationRoutes");

// Import Message & Conversation models to persist messages
const Message = require("./messageModel");
const Conversation = require("./conversationModel");


const adminRoutes = require('./admin/adminRoutes');
const bcrypt = require("bcryptjs");
const Admin = require("./admin/adminModel");


const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://localhost:3006",
    ],
    methods: ["GET", "POST"],
  },
});

// Connect to MongoDB
connectDB().catch((err) => {
  console.error("❌ Database connection failed:", err);
  process.exit(1);
});

// Ensure "uploads/" directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Allow CORS for specified origins
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3006",
];
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

app.use(morgan("dev"));

// File Upload Configuration
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Serve Uploaded Files
app.use("/uploads", express.static(uploadDir));

// API Health Check Route
app.get("/", (req, res) => {
  res.status(200).json({ msg: "API is running 🚀" });
});

// Use Routes
app.use("/api", userRoutes);
app.use("/api", tripPlanRoutes);
app.use("/api", notificationRoutes);
app.use("/api", conversationRoutes);
app.use("/api", adminRoutes);

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("❌ Global Error Handler:", err.message);
  res.status(500).json({ msg: "Something went wrong!", error: err.message });
});

// -------------------------
// Socket.IO for Real-Time Messaging
// -------------------------
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Join a conversation room when a client emits "joinConversation"
  socket.on("joinConversation", (conversationId) => {
    socket.join(conversationId);
    console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
  });

  // Listen for messages sent from a client and persist them to the DB
  socket.on("sendMessage", async ({ conversationId, message }) => {
    try {
      // Validate required fields
      if (!conversationId || !message || !message.text) {
        console.error("Missing required fields in sendMessage");
        return;
      }
  
      // Create and save the message in MongoDB
      const newMessage = new Message({
        conversationId,
        senderId: message.senderId, // Ensure this is the logged-in user's ID
        text: message.text,
        timestamp: new Date(),
      });
      await newMessage.save();
  
      // Optionally update the conversation's updatedAt field
      await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() });
  
      // Re-query the saved message so that Mongoose auto-decrypts the text field
      const savedMessage = await Message.findById(newMessage._id);
  
      // Emit the saved, decrypted message to everyone in the room
      io.to(conversationId).emit("newMessage", savedMessage);
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });
  

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// After connecting to the database in server.js, add this function:
async function seedAdminIfNotExists() {
  try {
    // Get admin credentials from environment variables
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminFullName = process.env.ADMIN_FULLNAME || "Ashlesha KC";

    if (!adminEmail || !adminPassword) {
      console.error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in your .env file.");
      return;
    }

    // Check if an admin with this email already exists
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (!existingAdmin) {
      // Automatically hash the password and create the admin record
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const newAdmin = new Admin({
        fullName: adminFullName,
        email: adminEmail,
        password: hashedPassword,
      });
      await newAdmin.save();
      console.log("Admin seeded successfully.");
    } else {
      console.log("Admin already exists.");
    }
  } catch (error) {
    console.error("Error seeding admin:", error);
  }
}

// After your DB connection is successful, call the function:
connectDB().then(() => {
  seedAdminIfNotExists();
  // Continue with starting the server, etc.
}).catch((err) => {
  console.error("❌ Database connection failed:", err);
  process.exit(1);
});

// Start Server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

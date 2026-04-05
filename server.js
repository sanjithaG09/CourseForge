require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const limiter = require("./middleware/rateLimiter");

const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const searchRoutes = require("./routes/searchRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

/* ================= SOCKET.IO SETUP ================= */

// Create HTTP server
const server = http.createServer(app);

// Attach Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // later replace with frontend URL
    methods: ["GET", "POST"]
  }
});

// Make io accessible in controllers
app.set("io", io);

// Socket connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User joined room: ${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

/* ================= MIDDLEWARE ================= */

// Stripe webhook (RAW body must come BEFORE json)
app.use(
  "/api/payments/webhook",
  express.raw({ type: "application/json" })
);

app.use(express.json());
app.use(cors());
app.use(limiter);

/* ================= ROUTES ================= */

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/payments", paymentRoutes);

/* ================= DB CONNECTION ================= */

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/courseforge")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

/* ================= SERVER START ================= */

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

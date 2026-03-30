require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");

const courseRoutes = require("./routes/courseRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);

app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);

// DB Connection
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/courseforge")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Start server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
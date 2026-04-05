require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const searchRoutes = require("./routes/searchRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

// Stripe webhook needs raw body
app.use(
  "/api/payments/webhook",
  express.raw({ type: "application/json" })
);

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/payments", paymentRoutes);

// DB Connection
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/courseforge")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

//Start Server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String
    // optional — Google OAuth users have no password
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  picture: {
    type: String
  },
  role: {
    type: String,
    enum: ["student", "instructor", "admin"],
    default: "student"
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  signupOTP: String,
  signupOTPExpires: Date,
  resetPasswordOTP: String,
  resetPasswordOTPExpires: Date,
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);

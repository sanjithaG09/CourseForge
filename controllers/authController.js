const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const redis = require("../config/redis");
const { OAuth2Client } = require("google-auth-library");
const emailService = require("../utils/emailService");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const OTP_TTL = 10 * 60 * 1000; // 10 minutes

const issueToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

// ─── SIGNUP ───────────────────────────────────────────────
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email });

    if (existing) {
      if (existing.isEmailVerified) {
        // Block if registered with a different role
        const requestedRole = role === "instructor" ? "instructor" : "student";
        if (existing.role !== requestedRole) {
          return res.status(400).json({
            message: `This email is already registered as ${existing.role}. You cannot create a ${requestedRole} account with the same email.`
          });
        }
        return res.status(400).json({ message: "Email already registered" });
      }
      // Unverified account exists — resend OTP
      const otp = generateOTP();
      existing.signupOTP = otp;
      existing.signupOTPExpires = new Date(Date.now() + OTP_TTL);
      existing.name = name;
      existing.password = await bcrypt.hash(password, 10);
      existing.role = role === "instructor" ? "instructor" : "student";
      await existing.save();
      await emailService.sendSignupOTP(email, name, otp);
      return res.status(200).json({ requiresOTP: true, email, message: "OTP resent to your email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: role === "instructor" ? "instructor" : "student",
      isEmailVerified: false,
      signupOTP: otp,
      signupOTPExpires: new Date(Date.now() + OTP_TTL),
    });

    await emailService.sendSignupOTP(email, name, otp);

    res.status(201).json({ requiresOTP: true, email, message: "OTP sent to your email" });

  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Error in signup" });
  }
};

// ─── VERIFY SIGNUP OTP ────────────────────────────────────
exports.verifySignupOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.isEmailVerified) return res.status(400).json({ message: "Email already verified" });

    if (!user.signupOTP || user.signupOTP !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (user.signupOTPExpires < new Date()) {
      return res.status(400).json({ message: "OTP has expired — please request a new one" });
    }

    user.isEmailVerified = true;
    user.signupOTP = undefined;
    user.signupOTPExpires = undefined;
    await user.save();

    const token = issueToken(user);
    res.json({ token, role: user.role, name: user.name });

  } catch (err) {
    console.error("VerifySignupOTP error:", err);
    res.status(500).json({ message: "Error verifying OTP" });
  }
};

// ─── RESEND SIGNUP OTP ────────────────────────────────────
exports.resendSignupOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.isEmailVerified) return res.status(400).json({ message: "Email already verified" });

    const otp = generateOTP();
    user.signupOTP = otp;
    user.signupOTPExpires = new Date(Date.now() + OTP_TTL);
    await user.save();

    await emailService.sendSignupOTP(email, user.name, otp);
    res.json({ message: "OTP resent to your email" });

  } catch (err) {
    console.error("ResendSignupOTP error:", err);
    res.status(500).json({ message: "Error resending OTP" });
  }
};

// ─── LOGIN ────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (!user.password) {
      return res.status(400).json({ message: "This account uses Google Sign-In — please continue with Google" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = issueToken(user);
    res.json({ token, role: user.role, name: user.name });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Error in login" });
  }
};

// ─── FORGOT PASSWORD ──────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    // Always return success to prevent email enumeration
    if (!user || !user.password) {
      return res.json({ message: "If an account with that email exists, an OTP has been sent" });
    }

    const otp = generateOTP();
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpires = new Date(Date.now() + OTP_TTL);
    await user.save();

    await emailService.sendForgotPasswordOTP(email, user.name, otp);
    res.json({ message: "OTP sent to your email" });

  } catch (err) {
    console.error("ForgotPassword error:", err);
    res.status(500).json({ message: "Error sending reset OTP" });
  }
};

// ─── VERIFY RESET OTP ─────────────────────────────────────
exports.verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid OTP" });

    if (!user.resetPasswordOTP || user.resetPasswordOTP !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (user.resetPasswordOTPExpires < new Date()) {
      return res.status(400).json({ message: "OTP has expired — please request a new one" });
    }

    res.json({ message: "OTP verified", email });

  } catch (err) {
    console.error("VerifyResetOTP error:", err);
    res.status(500).json({ message: "Error verifying OTP" });
  }
};

// ─── RESET PASSWORD ───────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid request" });

    if (!user.resetPasswordOTP || user.resetPasswordOTP !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (user.resetPasswordOTPExpires < new Date()) {
      return res.status(400).json({ message: "OTP has expired — please request a new one" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successfully" });

  } catch (err) {
    console.error("ResetPassword error:", err);
    res.status(500).json({ message: "Error resetting password" });
  }
};

// ─── GOOGLE AUTH ──────────────────────────────────────────
exports.googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: "Google credential required" });

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { sub: googleId, email, name, picture } = ticket.getPayload();

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      user = await User.create({ name, email, googleId, picture, isEmailVerified: true });
    } else if (!user.googleId) {
      user.googleId = googleId;
      user.picture = picture;
      user.isEmailVerified = true;
      await user.save();
    }

    const token = issueToken(user);
    res.json({ token, role: user.role, name: user.name });

  } catch (err) {
    console.error("Google auth error:", err);
    res.status(401).json({ message: "Google authentication failed" });
  }
};

// ─── LOGOUT ───────────────────────────────────────────────
exports.logout = async (req, res) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) return res.status(400).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(400).json({ message: "Token missing" });

    try {
      await redis.set(`blacklist:${token}`, 1, "EX", 7 * 24 * 60 * 60);
    } catch (redisErr) {
      console.warn("Redis unavailable, token not blacklisted:", redisErr.message);
    }

    res.json({ message: "Logged out successfully" });

  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Error in logout" });
  }
};

// ─── GET PROFILE ──────────────────────────────────────────
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -signupOTP -signupOTPExpires -resetPasswordOTP -resetPasswordOTPExpires");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("GetProfile error:", err);
    res.status(500).json({ message: "Error fetching profile" });
  }
};

// ─── UPDATE PROFILE ───────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: "Name is required" });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name: name.trim() },
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (err) {
    console.error("UpdateProfile error:", err);
    res.status(500).json({ message: "Error updating profile" });
  }
};

// ─── CHANGE EMAIL ─────────────────────────────────────────
exports.changeEmail = async (req, res) => {
  try {
    const { newEmail, password } = req.body;

    if (!newEmail || !password) {
      return res.status(400).json({ message: "New email and current password are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existing = await User.findOne({ email: newEmail });
    if (existing) return res.status(400).json({ message: "Email already in use by another account" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

    user.email = newEmail;
    await user.save();

    const updatedUser = await User.findById(req.user.id).select("-password");
    res.json({ message: "Email updated successfully", user: updatedUser });

  } catch (err) {
    console.error("ChangeEmail error:", err);
    res.status(500).json({ message: "Error changing email" });
  }
};

// ─── CHANGE PASSWORD ──────────────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) return res.status(400).json({ message: "Both passwords required" });
    if (newPassword.length < 6) return res.status(400).json({ message: "New password must be at least 6 characters" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Wrong current password" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    console.error("ChangePassword error:", err);
    res.status(500).json({ message: "Error changing password" });
  }
};

// ─── DELETE ACCOUNT ──────────────────────────────────────
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("deleteAccount error:", err);
    res.status(500).json({ message: "Failed to delete account" });
  }
};

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const blacklist = require("../middleware/blacklist");

// ─── SIGNUP ───────────────────────────────────────────────
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      // ✅ FIX: No hardcoded role — defaults to "student" from schema
    });

    res.status(201).json({ message: "User registered successfully" });

  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Error in signup" });
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

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, role: user.role, name: user.name });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Error in login" });
  }
};

// ─── LOGOUT ───────────────────────────────────────────────
exports.logout = (req, res) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) return res.status(400).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    blacklist.push(token);

    res.json({ message: "Logged out successfully" });

  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Error in logout" });
  }
};

// ─── GET PROFILE ──────────────────────────────────────────
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
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
    // Prevent role from being changed via this route
    delete req.body.role;
    delete req.body.password;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      req.body,
      { new: true }
    ).select("-password");

    res.json(user);

  } catch (err) {
    console.error("UpdateProfile error:", err);
    res.status(500).json({ message: "Error updating profile" });
  }
};

// ─── CHANGE PASSWORD ──────────────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Both passwords required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Wrong current password" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    console.error("ChangePassword error:", err);
    res.status(500).json({ message: "Error changing password" });
  }
};

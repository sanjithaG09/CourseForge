const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  getProfile,
  updateProfile,
  changeEmail,
  changePassword,
  logout
} = require("../controllers/authController");

const auth = require("../middleware/auth");
const role = require("../middleware/role");

// ─── PUBLIC ───────────────────────────────────────────────
router.post("/signup", signup);
router.post("/login", login);

// ─── PROTECTED ────────────────────────────────────────────
router.post("/logout", auth, logout);

// Profile
router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);          // update name only

// Email & Password (separate routes for security)
router.put("/change-email", auth, changeEmail);       // ✅ new route
router.put("/change-password", auth, changePassword);

// Admin only
router.get("/admin", auth, role("admin"), (req, res) => {
  res.json({ message: "Welcome Admin!" });
});

module.exports = router;
const express = require("express");
const router = express.Router();

const {
  signup,
  verifySignupOTP,
  resendSignupOTP,
  login,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  googleAuth,
  getProfile,
  updateProfile,
  changeEmail,
  changePassword,
  logout,
  deleteAccount
} = require("../controllers/authController");

const auth = require("../middleware/auth");
const role = require("../middleware/role");

// ─── PUBLIC ───────────────────────────────────────────────
router.post("/signup", signup);
router.post("/verify-signup-otp", verifySignupOTP);
router.post("/resend-signup-otp", resendSignupOTP);
router.post("/login", login);
router.post("/google", googleAuth);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOTP);
router.post("/reset-password", resetPassword);

// ─── PROTECTED ────────────────────────────────────────────
router.post("/logout", auth, logout);
router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);
router.put("/change-email", auth, changeEmail);
router.put("/change-password", auth, changePassword);
router.delete("/account", auth, deleteAccount);

// Admin only
router.get("/admin", auth, role("admin"), (req, res) => {
  res.json({ message: "Welcome Admin!" });
});

module.exports = router;

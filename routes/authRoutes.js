const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout
} = require("../controllers/authController");
const auth = require("../middleware/auth");


router.post("/signup", signup);
router.post("/login", login);
const role = require("../middleware/role");
router.post("/logout", auth, logout);
router.get("/admin", auth, role("admin"), (req, res) => {
  res.json({ message: "Welcome Admin!" });
});
router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);
router.put("/change-password", auth, changePassword);

module.exports = router;
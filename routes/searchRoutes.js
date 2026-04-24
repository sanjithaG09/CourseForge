const express = require("express");
const router = express.Router();

const {
  advancedSearch,
  getCategoryStats,
  getDashboardData
} = require("../controllers/searchController");

const auth = require("../middleware/auth");
const optionalAuth = require("../middleware/optionalAuth");

// Public routes — optionalAuth so logged-in searches get activity logged
router.get("/courses",    optionalAuth, advancedSearch);
router.get("/categories", getCategoryStats);

// Protected — student must be logged in
router.get("/dashboard",  auth, getDashboardData);

module.exports = router;
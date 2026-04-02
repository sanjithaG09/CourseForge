const express = require("express");
const router = express.Router();

const {
  advancedSearch,
  getCategoryStats,
  getDashboardData
} = require("../controllers/searchController");

const auth = require("../middleware/auth");

// Public routes
router.get("/courses",    advancedSearch);
router.get("/categories", getCategoryStats);

// Protected — student must be logged in
router.get("/dashboard",  auth, getDashboardData);

module.exports = router;
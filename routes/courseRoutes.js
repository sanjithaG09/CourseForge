const express = require("express");
const router = express.Router();

const {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  publishCourse,
  getMyCourses
} = require("../controllers/courseController");

const auth = require("../middleware/auth");
const role = require("../middleware/role");
const optionalAuth = require("../middleware/optionalAuth");

// Public
router.get("/", getAllCourses);

// ✅ /my/courses MUST be before /:id otherwise Express thinks "my" is an id
router.get("/my/courses", auth, role("instructor", "admin"), getMyCourses);

// Public — optionalAuth so logged-in users get activity logged
router.get("/:id", optionalAuth, getCourseById);

// Instructor only
router.post("/", auth, role("instructor", "admin"), createCourse);
router.put("/:id", auth, role("instructor", "admin"), updateCourse);
router.delete("/:id", auth, role("instructor", "admin"), deleteCourse);
router.put("/:id/publish", auth, role("instructor", "admin"), publishCourse);

module.exports = router;
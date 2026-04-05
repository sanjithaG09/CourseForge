const express = require("express");
const router = express.Router();

const {
  enrollCourse,
  getMyEnrollments,
  markModuleComplete,
  getCourseProgress
} = require("../controllers/enrollmentController");

const auth = require("../middleware/auth");

// ✅ /my MUST be before /:courseId for same reason as above
router.get("/my", auth, getMyEnrollments);
router.post("/:courseId", auth, enrollCourse);
router.put("/:courseId/modules/:moduleId/complete", auth, markModuleComplete);
router.get("/:courseId/progress", auth, getCourseProgress);

module.exports = router;
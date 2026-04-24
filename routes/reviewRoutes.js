const express = require("express");
const router = express.Router();
const { addReview, getCourseReviews, deleteReview } = require("../controllers/reviewController");
const auth = require("../middleware/auth");

router.get("/:courseId", getCourseReviews);
router.post("/:courseId", auth, addReview);
router.delete("/:courseId", auth, deleteReview);

module.exports = router;

const mongoose = require("mongoose");
const Review = require("../models/Review");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

async function recalculateCourseRating(courseId) {
  const stats = await Review.aggregate([
    { $match: { course: new mongoose.Types.ObjectId(courseId) } },
    { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
  ]);

  if (stats.length > 0) {
    await Course.findByIdAndUpdate(courseId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      ratingCount: stats[0].count
    });
  } else {
    await Course.findByIdAndUpdate(courseId, { rating: 0, ratingCount: 0 });
  }
}

// ─── ADD OR UPDATE REVIEW ─────────────────────────────────────
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const courseId = req.params.courseId;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }
    if (!comment?.trim()) {
      return res.status(400).json({ message: "Comment is required" });
    }

    const enrollment = await Enrollment.findOne({ user: userId, course: courseId });
    if (!enrollment) {
      return res.status(403).json({ message: "You must be enrolled to leave a review" });
    }

    const review = await Review.findOneAndUpdate(
      { user: userId, course: courseId },
      { rating: Number(rating), comment: comment.trim() },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).populate("user", "name");

    await recalculateCourseRating(courseId);

    res.status(200).json({ message: "Review saved", review });

  } catch (err) {
    console.error("AddReview error:", err);
    res.status(500).json({ message: "Error saving review" });
  }
};

// ─── GET REVIEWS FOR A COURSE ─────────────────────────────────
exports.getCourseReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ course: req.params.courseId })
      .populate("user", "name picture")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    console.error("GetCourseReviews error:", err);
    res.status(500).json({ message: "Error fetching reviews" });
  }
};

// ─── DELETE OWN REVIEW ───────────────────────────────────────
exports.deleteReview = async (req, res) => {
  try {
    const courseId = req.params.courseId;

    const review = await Review.findOne({ user: req.user.id, course: courseId });
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    await review.deleteOne();
    await recalculateCourseRating(courseId);

    res.json({ message: "Review deleted" });

  } catch (err) {
    console.error("DeleteReview error:", err);
    res.status(500).json({ message: "Error deleting review" });
  }
};

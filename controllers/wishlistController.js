const Wishlist = require("../models/Wishlist");

// ─── ADD TO WISHLIST ──────────────────────────────────────────
exports.addToWishlist = async (req, res) => {
  try {
    try {
      const item = await Wishlist.create({
        user: req.user.id,
        course: req.params.courseId
      });
      res.status(201).json({ message: "Added to wishlist", item });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({ message: "Already in wishlist" });
      }
      throw err;
    }
  } catch (err) {
    console.error("AddToWishlist error:", err);
    res.status(500).json({ message: "Error adding to wishlist" });
  }
};

// ─── REMOVE FROM WISHLIST ─────────────────────────────────────
exports.removeFromWishlist = async (req, res) => {
  try {
    const deleted = await Wishlist.findOneAndDelete({
      user: req.user.id,
      course: req.params.courseId
    });

    if (!deleted) {
      return res.status(404).json({ message: "Course not in wishlist" });
    }

    res.json({ message: "Removed from wishlist" });
  } catch (err) {
    console.error("RemoveFromWishlist error:", err);
    res.status(500).json({ message: "Error removing from wishlist" });
  }
};

// ─── GET MY WISHLIST ──────────────────────────────────────────
exports.getMyWishlist = async (req, res) => {
  try {
    const items = await Wishlist.find({ user: req.user.id })
      .populate({
        path: "course",
        select: "title description thumbnail price level category instructor rating ratingCount enrollmentCount isPublished",
        populate: { path: "instructor", select: "name" }
      })
      .sort({ addedAt: -1 });

    // Filter out wishlist entries where the course was deleted
    const valid = items.filter(item => item.course);
    res.json(valid);
  } catch (err) {
    console.error("GetMyWishlist error:", err);
    res.status(500).json({ message: "Error fetching wishlist" });
  }
};

// ─── CHECK IF COURSE IS WISHLISTED ───────────────────────────
exports.checkWishlist = async (req, res) => {
  try {
    const item = await Wishlist.findOne({
      user: req.user.id,
      course: req.params.courseId
    });

    res.json({ wishlisted: !!item });
  } catch (err) {
    console.error("CheckWishlist error:", err);
    res.status(500).json({ message: "Error checking wishlist" });
  }
};

const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Prevent duplicate wishlist entries
wishlistSchema.index({ user: 1, course: 1 }, { unique: true });
// Fast lookup of all wishlist items for a user
wishlistSchema.index({ user: 1 });

module.exports = mongoose.model("Wishlist", wishlistSchema);

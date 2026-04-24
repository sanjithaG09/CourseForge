const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema({
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
  completedModules: [
    {
      type: mongoose.Schema.Types.ObjectId
    }
  ],
  progress: {
    type: Number,
    default: 0
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// ✅ Prevents duplicate enrollment even under race condition
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

// ✅ Faster dashboard queries
enrollmentSchema.index({ user: 1 });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
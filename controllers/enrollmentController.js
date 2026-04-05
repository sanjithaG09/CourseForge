const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");

// ─── ENROLL IN A COURSE ───────────────────────────────────
exports.enrollCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const userId = req.user.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // ✅ Race condition handled via unique index + error code 11000
    try {
      const enrollment = await Enrollment.create({
        user: userId,
        course: courseId
      });

      await Course.findByIdAndUpdate(courseId, {
        $inc: { enrollmentCount: 1 }
      });

      res.status(201).json({ message: "Enrolled successfully", enrollment });

    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({ message: "Already enrolled" });
      }
      throw err;
    }

  } catch (err) {
    console.error("EnrollCourse error:", err);
    res.status(500).json({ message: "Error enrolling in course" });
  }
};

// ─── GET MY ENROLLMENTS ───────────────────────────────────
exports.getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user.id })
      .populate("course", "title description thumbnail instructor price");

    res.json(enrollments);

  } catch (err) {
    console.error("GetMyEnrollments error:", err);
    res.status(500).json({ message: "Error fetching enrollments" });
  }
};

// ─── MARK MODULE COMPLETE ─────────────────────────────────
exports.markModuleComplete = async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;

    // ✅ Fetch course first to validate module ID
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // ✅ Check if moduleId actually belongs to this course
    const moduleExists = course.modules.some(
      m => m._id.toString() === moduleId
    );
    if (!moduleExists) {
      return res.status(400).json({ message: "Invalid module ID" });
    }

    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: courseId
    });

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    // Add moduleId only if not already completed
    if (!enrollment.completedModules.includes(moduleId)) {
      enrollment.completedModules.push(moduleId);
    }

    // ✅ Calculate progress percentage
    const totalModules = course.modules.length;
    if (totalModules > 0) {
      enrollment.progress = Math.round(
        (enrollment.completedModules.length / totalModules) * 100
      );
    }

    if (enrollment.progress === 100) {
      enrollment.isCompleted = true;
    }

    // ✅ Update last accessed time for P6 dropout detection
    enrollment.lastAccessedAt = new Date();

    await enrollment.save();

    res.json({
      message: "Module marked complete",
      progress: enrollment.progress,
      isCompleted: enrollment.isCompleted
    });

  } catch (err) {
    console.error("MarkModuleComplete error:", err);
    res.status(500).json({ message: "Error updating progress" });
  }
};

// ─── GET COURSE PROGRESS ──────────────────────────────────
exports.getCourseProgress = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: req.params.courseId
    }).populate("course", "title modules");

    if (!enrollment) {
      return res.status(404).json({ message: "Not enrolled in this course" });
    }

    res.json({
      course: enrollment.course.title,
      progress: enrollment.progress,
      completedModules: enrollment.completedModules,
      isCompleted: enrollment.isCompleted,
      lastAccessedAt: enrollment.lastAccessedAt
    });

  } catch (err) {
    console.error("GetCourseProgress error:", err);
    res.status(500).json({ message: "Error fetching progress" });
  }
};
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const Order = require("../models/Order");
const User = require("../models/User");
const notify = require("../utils/notify");
const emailService = require("../utils/emailService");
const logActivity = require("../utils/activityLogger");

// ─── ENROLL IN A COURSE ───────────────────────────────────
// Only free courses can be enrolled here directly.
// Paid courses must go through POST /payment/confirm (Razorpay webhook-verified).
exports.enrollCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const userId = req.user.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // ── Payment gate: block free enrollment for paid courses ─────────────────
    if (course.price > 0) {
      // Verify a completed order exists for this user/course before enrolling
      const paidOrder = await Order.findOne({
        user: userId,
        course: courseId,
        status: "completed",
      });

      if (!paidOrder) {
        return res.status(403).json({
          message: "Payment required. Please complete checkout before enrolling.",
        });
      }
    }

    // ── Race condition handled via unique index + error code 11000 ───────────
    try {
      const enrollment = await Enrollment.create({ user: userId, course: courseId });

      await Course.findByIdAndUpdate(courseId, { $inc: { enrollmentCount: 1 } });

      const student = await User.findById(userId).select("name");
      if (student) {
        notify.sendNotification(
          course.instructor.toString(),
          `📚 ${student.name} enrolled in "${course.title}"`
        );
      }

      logActivity(userId, 'enroll', courseId);
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

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const moduleExists = course.modules.some(m => m._id.toString() === moduleId);
    if (!moduleExists) {
      return res.status(400).json({ message: "Invalid module ID" });
    }

    const enrollment = await Enrollment.findOne({ user: req.user.id, course: courseId });
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    if (!enrollment.completedModules.includes(moduleId)) {
      enrollment.completedModules.push(moduleId);
    }

    const totalModules = course.modules.length;
    if (totalModules > 0) {
      enrollment.progress = Math.round(
        (enrollment.completedModules.length / totalModules) * 100
      );
    }

    if (enrollment.progress === 100) {
      enrollment.isCompleted = true;
      notify.sendNotification(req.user.id, `🎉 Congratulations! You completed "${course.title}"`);
      User.findById(req.user.id).select("name email").then(student => {
        if (student) emailService.sendCourseCompleted(student.email, student.name, course.title);
      }).catch(err => console.error("Completion email error:", err.message));
    }

    enrollment.lastAccessedAt = new Date();
    await enrollment.save();

    logActivity(req.user.id, 'complete_lesson', courseId, { moduleId });

    res.json({
      message: "Module marked complete",
      progress: enrollment.progress,
      isCompleted: enrollment.isCompleted,
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
      course: req.params.courseId,
    }).populate("course", "title modules");

    if (!enrollment) {
      return res.status(404).json({ message: "Not enrolled in this course" });
    }

    res.json({
      course: enrollment.course.title,
      progress: enrollment.progress,
      completedModules: enrollment.completedModules,
      isCompleted: enrollment.isCompleted,
      lastAccessedAt: enrollment.lastAccessedAt,
    });
  } catch (err) {
    console.error("GetCourseProgress error:", err);
    res.status(500).json({ message: "Error fetching progress" });
  }
};

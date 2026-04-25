const mongoose = require("mongoose");
const Course = require("../models/Course");
const Order = require("../models/Order");
const Enrollment = require("../models/Enrollment");
const notify = require("../utils/notify");
const logActivity = require("../utils/activityLogger");

const UPI_VPA = process.env.UPI_VPA || "courseforge@ybl";
const MERCHANT_NAME = process.env.MERCHANT_NAME || "CourseForge";

// ── Generate UPI QR string ───────────────────────────────────────────────────
const createPaymentIntent = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    const course = await Course.findById(courseId).populate("instructor", "name _id");
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (!course.isPublished) return res.status(400).json({ message: "Course not available" });

    const alreadyEnrolled = await Enrollment.findOne({ user: userId, course: courseId });
    if (alreadyEnrolled) return res.status(400).json({ message: "You are already enrolled in this course" });

    const txnRef = "CF" + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();

    const upiString = "upi://pay" +
      "?pa=" + encodeURIComponent(UPI_VPA) +
      "&pn=" + encodeURIComponent(MERCHANT_NAME) +
      "&am=" + course.price.toFixed(2) +
      "&cu=INR" +
      "&tn=" + encodeURIComponent("CourseForge: " + course.title) +
      "&tr=" + txnRef;

    res.status(200).json({
      upiString,
      txnRef,
      amount: course.price,
      courseName: course.title,
      upiVpa: UPI_VPA,
      instructorId: course.instructor?._id,
    });
  } catch (err) {
    console.error("createPaymentIntent error:", err);
    res.status(500).json({ message: "Failed to initiate payment", error: err.message });
  }
};

// ── Confirm after student pays via QR and enters UTR ────────────────────────
const confirmPayment = async (req, res) => {
  try {
    const { courseId, utrNumber, txnRef } = req.body;
    const userId = req.user.id;

    if (!utrNumber || utrNumber.trim().length < 6) {
      return res.status(400).json({ message: "Please enter a valid UTR / Transaction ID" });
    }

    const course = await Course.findById(courseId).populate("instructor", "name _id");
    if (!course) return res.status(404).json({ message: "Course not found" });

    const alreadyEnrolled = await Enrollment.findOne({ user: userId, course: courseId });
    if (alreadyEnrolled) return res.status(400).json({ message: "Already enrolled" });

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      await Order.create([{
        user: userId,
        course: courseId,
        amount: course.price,
        paymentId: utrNumber.trim().toUpperCase(),
        upiRef: txnRef || "",
        status: "completed",
      }], { session });

      await Enrollment.create([{ user: userId, course: courseId }], { session });
      await Course.findByIdAndUpdate(courseId, { $inc: { enrollmentCount: 1 } }, { session });
      await session.commitTransaction();
      session.endSession();
    } catch (txErr) {
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json({ message: "Enrollment failed. Please contact support." });
    }

    logActivity(userId, 'enroll', courseId);
    notify.sendNotification(userId.toString(), "Payment of Rs." + course.price + " confirmed! You are enrolled in " + course.title);
    if (course.instructor?._id) {
      notify.sendNotification(course.instructor._id.toString(), "Rs." + course.price + " received via UPI! Student enrolled in " + course.title);
    }

    res.status(200).json({ message: "Payment confirmed. You are now enrolled!" });
  } catch (err) {
    console.error("confirmPayment error:", err);
    res.status(500).json({ message: "Confirmation failed", error: err.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("course", "title thumbnail price")
      .sort({ createdAt: -1 });

    res.status(200).json({
      orders: orders.map(o => ({
        ...o.toObject(),
        invoice: {
          invoiceId: "INV-" + o._id,
          course: { id: o.course?._id, title: o.course?.title },
          amount: o.amount,
          currency: "INR",
          date: o.createdAt,
          status: o.status,
        },
      })),
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders", error: err.message });
  }
};

module.exports = { createPaymentIntent, confirmPayment, getMyOrders };

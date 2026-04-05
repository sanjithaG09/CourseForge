const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const mongoose = require("mongoose");

const Course = require("../models/Course");
const Order = require("../models/Order");
const Coupon = require("../models/Coupon");
const Enrollment = require("../models/Enrollment");

const userId = paymentIntent.metadata.userId;
sendNotification(userId, "Payment successful! You are enrolled.");

function generateInvoice(order, course) {
  return {
    invoiceId: `INV-${order._id}`,
    orderId: order._id,
    course: {
      id: course._id,
      title: course.title
    },
    amount: order.amount,
    currency: "usd",
    couponUsed: order.couponUsed || null,
    date: order.createdAt,
    status: order.status
  };
}

const createPaymentIntent = async (req, res) => {
  try {
    const { courseId, couponCode } = req.body;
    const userId = req.user.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    if (!course.isPublished) {
      return res.status(400).json({ message: "Course is not available for purchase" });
    }

    const alreadyEnrolled = await Enrollment.findOne({ user: userId, course: courseId });
    if (alreadyEnrolled) {
      return res.status(400).json({ message: "You are already enrolled in this course" });
    }

    let finalPrice = course.price;
    let couponUsed = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        expiry: { $gt: new Date() }
      });

      if (!coupon) {
        return res.status(400).json({ message: "Invalid or expired coupon code" });
      }

      const discount = (finalPrice * coupon.discountPercent) / 100;
      finalPrice = finalPrice - discount;
      couponUsed = coupon.code;
    }

    const amountInCents = Math.round(finalPrice * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      metadata: {
        userId: userId.toString(),
        courseId: courseId.toString(),
        couponUsed: couponUsed || ""
      }
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: finalPrice,
      couponApplied: couponUsed
    });

  } catch (err) {
    console.error("createPaymentIntent error:", err);
    res.status(500).json({ message: "Payment initiation failed", error: err.message });
  }
};

const handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature error:", err.message);
    return res.status(400).json({ message: `Webhook error: ${err.message}` });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const { userId, courseId, couponUsed } = paymentIntent.metadata;
    const amountPaid = paymentIntent.amount / 100;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const existingOrder = await Order.findOne({ paymentId: paymentIntent.id }).session(session);
      if (existingOrder) {
        await session.abortTransaction();
        session.endSession();
        return res.status(200).json({ received: true, message: "Already processed" });
      }

      await Order.create([{
        user: userId,
        course: courseId,
        amount: amountPaid,
        paymentId: paymentIntent.id,
        status: "completed",
        couponUsed: couponUsed || null
      }], { session });

      await Enrollment.create([{
        user: userId,
        course: courseId
      }], { session });

      await Course.findByIdAndUpdate(
        courseId,
        { $inc: { enrollmentCount: 1 } },
        { session }
      );

      await session.commitTransaction();
      session.endSession();

    } catch (txError) {
      await session.abortTransaction();
      session.endSession();
      console.error("Transaction failed:", txError);
      return res.status(500).json({ message: "Transaction failed" });
    }
  }

  res.status(200).json({ received: true });
};

const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ user: userId })
      .populate("course", "title thumbnail price")
      .sort({ createdAt: -1 });

    const ordersWithInvoice = orders.map(order => {
      const invoice = generateInvoice(order, order.course);
      return {
        ...order.toObject(),
        invoice
      };
    });

    res.status(200).json({ orders: ordersWithInvoice });

  } catch (err) {
    console.error("getMyOrders error:", err);
    res.status(500).json({ message: "Failed to fetch orders", error: err.message });
  }
};

module.exports = {
  createPaymentIntent,
  handleWebhook,
  getMyOrders
};

const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { createPaymentIntent, confirmPayment, getMyOrders } = require("../controllers/paymentController");

router.post("/create", auth, createPaymentIntent);
router.post("/confirm", auth, confirmPayment);
router.get("/my-orders", auth, getMyOrders);

module.exports = router;

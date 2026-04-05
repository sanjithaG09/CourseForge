const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const {
  createPaymentIntent,
  handleWebhook,
  getMyOrders
} = require("../controllers/paymentController");

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook
);
router.post("/create", auth, createPaymentIntent);
router.get("/my-orders", auth, getMyOrders);

module.exports = router;

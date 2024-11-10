// routes/paymentRoutes.js
const express = require("express");
const router = express.Router();

const {
  createPaymentIntent,
  paymentInfo,
  getPaymentHistory,
  getPaymentHistoryLength,
} = require("../controllers/paymentController");

const { verifyJWT } = require("../middleware/authMiddleware");

router.post("/create-payment-intent", verifyJWT, createPaymentIntent);
router.post("/payment-info", verifyJWT, paymentInfo);
router.get("/payment-history/:email", getPaymentHistory);

router.get("/payment-history-length/:email", getPaymentHistoryLength);

module.exports = router;

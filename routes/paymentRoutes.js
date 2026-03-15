const express = require("express");
const router  = express.Router();
const {
  getAllPayments,
  getPendingCount,
  makePayment,
  createPayment,
  updatePaymentStatus,
} = require("../controllers/paymentController");
const verifyToken = require(
  "../middleware/verifyToken"
);

// IMPORTANT: specific routes BEFORE /:id
router.get( "/",              verifyToken, getAllPayments);
router.get( "/pending-count", verifyToken, getPendingCount);
router.post("/pay",           verifyToken, makePayment);
router.post("/",              verifyToken, createPayment);
router.put( "/:id",           verifyToken, updatePaymentStatus);

module.exports = router;

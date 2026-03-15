const Payment  = require("../models/Payment");
const Rental   = require("../models/Rental");
const mongoose = require("mongoose");

// -- GET all payments --
const getAllPayments = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === "tenant")
      filter.tenant = req.user.id;
    else if (req.user.role === "owner")
      filter.owner = req.user.id;

    const payments = await Payment.find(filter)
      .populate("rental",
        "rentAmount startDate endDate")
      .populate("tenant", "name email phone")
      .populate("owner",  "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(payments);
  } catch (err) {
    console.error("getAllPayments:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// -- GET pending count --
const getPendingCount = async (req, res) => {
  try {
    const count = await Payment.countDocuments({
      tenant: req.user.id,
      status: { $in: ["pending","overdue"] },
    });
    res.status(200).json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// -- POST /pay — tenant pays rent --
const makePayment = async (req, res) => {
  try {
    console.log("--- MAKE PAYMENT ---");
    console.log("Body:", req.body);

    const {
      paymentId,
      rentalId,
      method,
      note,
      // New fields
      upiId,
      cardNumber,
      cardHolder,
      bankName,
    } = req.body;

    let payment = null;

    // Find payment by paymentId OR rentalId
    if (paymentId) {
      payment = await Payment.findById(paymentId);
    } else if (rentalId) {
      payment = await Payment.findOne({
        rental: rentalId,
        tenant: req.user.id,
        status: { $in: ["pending","overdue"] },
      });
    }

    if (!payment) {
      return res.status(404).json({
        message: "No pending payment found."
      });
    }

    if (payment.tenant.toString() !== req.user.id){
      return res.status(403).json({
        message: "Not authorized for this payment"
      });
    }

    if (payment.status === "paid") {
      return res.status(400).json({
        message: "This payment is already paid"
      });
    }

    // Validate method-specific fields
    const cleanMethod = (method || "other")
      .toLowerCase()
      .trim();

    if (cleanMethod === "upi" && !upiId?.trim()) {
      return res.status(400).json({
        message: "UPI ID is required for UPI payment"
      });
    }

    if (cleanMethod === "card") {
      if (!cardNumber?.trim()) {
        return res.status(400).json({
          message: "Card number is required"
        });
      }
      if (!cardHolder?.trim()) {
        return res.status(400).json({
          message: "Card holder name is required"
        });
      }
      // Validate card number — 16 digits
      const digits = cardNumber.replace(/\s/g,"");
      if (digits.length !== 16 ||
          isNaN(Number(digits))) {
        return res.status(400).json({
          message: "Enter a valid 16-digit card number"
        });
      }
    }

    if (cleanMethod === "netbanking" &&
        !bankName?.trim()) {
      return res.status(400).json({
        message: "Please select a bank"
      });
    }

    // Mask card number for storage —
    // only save last 4 digits
    const maskedCard = cardNumber
      ? "XXXX XXXX XXXX " +
        cardNumber.replace(/\s/g,"").slice(-4)
      : "";

    // Use updateOne to bypass ALL validation
    await Payment.updateOne(
      { _id: payment._id },
      {
        $set: {
          status:      "paid",
          paymentDate: new Date(),
          method:      cleanMethod,
          note:        (note || "").trim(),
          receiptId:   "RW-" + Date.now(),
            paymentDetails: {
              upiId:      upiId?.trim()      || "",
              cardNumber: maskedCard         || "",
              cardHolder: cardHolder?.trim() || "",
              bankName:   bankName?.trim()   || "",
            },
        }
      }
    );

    const updated = await Payment.findById(
      payment._id
    )
      .populate("tenant", "name email")
      .populate("rental", "rentAmount");

    console.log("Payment saved:",
      updated.receiptId);

    // Auto-create next month payment
    try {
      const rental = await Rental.findById(
        payment.rental
      );
      if (rental && rental.status === "active") {
        const nextDue = new Date(payment.dueDate);
        nextDue.setMonth(nextDue.getMonth() + 1);

        const exists = await Payment.findOne({
          rental: payment.rental,
          tenant: payment.tenant,
          status: { $in: ["pending","overdue"] },
        });

        if (!exists &&
            nextDue <= new Date(rental.endDate)) {
          await Payment.create({
            rental:    payment.rental,
            tenant:    payment.tenant,
            owner:     payment.owner,
            amount:    payment.amount,
            dueDate:   nextDue,
            method:    "other",
            status:    "pending",
            note:      "Monthly rent",
            receiptId: "",
          });
          console.log("Next payment created:",
            nextDue.toLocaleDateString("en-IN"));
        }
      }
    } catch (e) {
      console.warn("Next payment:", e.message);
    }

    res.status(200).json({
      message: "Payment successful!",
      payment: updated,
    });

  } catch (err) {
    console.error("makePayment error:", err.message);
    res.status(500).json({
      message: err.message || "Payment failed"
    });
  }
};

// -- POST / — create payment (owner/manager) --
const createPayment = async (req, res) => {
  try {
    const { rentalId, tenantId, ownerId,
            amount, dueDate, method, note } = req.body;

    if (!rentalId || !tenantId ||
        !amount   || !dueDate) {
      return res.status(400).json({
        message: "rentalId, tenantId, " +
                 "amount, dueDate required"
      });
    }

    const payment = await Payment.create({
      rental:    rentalId,
      tenant:    tenantId,
      owner:     ownerId || req.user.id,
      amount,
      dueDate:   new Date(dueDate),
      method:    method || "other",
      status:    "pending",
      note:      note || "",
      receiptId: "",
    });

    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// -- PUT /:id — update status --
const updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    await Payment.updateOne(
      { _id: req.params.id },
      {
        $set: {
          status,
          ...(status === "paid" && {
            paymentDate: new Date(),
            receiptId:   "RW-" + Date.now(),
          })
        }
      }
    );

    const payment = await Payment.findById(
      req.params.id
    );
    res.status(200).json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllPayments,
  getPendingCount,
  makePayment,
  createPayment,
  updatePaymentStatus,
};

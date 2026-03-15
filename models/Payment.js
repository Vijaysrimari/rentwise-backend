const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  rental: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Rental", required: true
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", required: true
  },
  amount:      { type: Number, required: true },
  paymentDate: { type: Date,   default: null },
  dueDate:     { type: Date,   required: true },
  method: {
    type:    String,
    default: "other",
  },
  status: {
    type:    String,
    default: "pending",
  },
  note:      { type: String, default: "" },
  receiptId: { type: String, default: "" },

  // NEW — store payment details
  paymentDetails: {
    upiId:      { type: String, default: "" },
    cardNumber: { type: String, default: "" },
    cardHolder: { type: String, default: "" },
    bankName:   { type: String, default: "" },
  },
}, { timestamps: true });

module.exports = mongoose.model(
  "Payment", paymentSchema
);

const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    member: { type: mongoose.Schema.Types.ObjectId, ref: "Member" },
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: String,
    razorpaySignature: String,
    amount: { type: Number, required: true }, // in paise
    currency: { type: String, default: "INR" },
    plan: String,
    status: {
      type: String,
      enum: ["created", "paid", "failed", "refunded"],
      default: "created",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", PaymentSchema);

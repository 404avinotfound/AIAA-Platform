const express = require("express");
const Member = require("../models/Member");
const Payment = require("../models/Payment");
const { requireAuth } = require("../middleware/auth");
const { createOrder, verifySignature } = require("../services/razorpay.service");
const { activateMembership } = require("../services/membership.service");
const { sendMembershipConfirmationEmail } = require("../services/email.service");

const router = express.Router();

// Admin-configurable plan pricing (₹). Move this to a Settings collection
// if you want amounts editable from the admin panel without a code change.
const PLAN_PRICES = {
  annual: 1000,
  lifetime: 10000,
  premium: 2500,
  student: 300,
  corporate: 15000,
};

// POST /api/payments/create-order
router.post("/create-order", requireAuth, async (req, res, next) => {
  try {
    const { plan } = req.body;
    const amount = PLAN_PRICES[plan];
    if (!amount) return res.status(400).json({ message: "Unknown membership plan" });

    const member = await Member.findOne({ user: req.user._id });
    if (!member) return res.status(404).json({ message: "Submit a membership application first" });

    const order = await createOrder({
      amountInRupees: amount,
      receipt: `aiaa_${member._id}_${Date.now()}`,
      notes: { memberId: member._id.toString(), plan },
    });

    await Payment.create({
      user: req.user._id,
      member: member._id,
      razorpayOrderId: order.id,
      amount: order.amount,
      plan,
      status: "created",
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/payments/verify - called by the frontend after Razorpay checkout succeeds
router.post("/verify", requireAuth, async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const valid = verifySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });
    if (!valid) return res.status(400).json({ message: "Payment signature verification failed" });

    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "paid",
      },
      { new: true }
    );
    if (!payment) return res.status(404).json({ message: "Order not found" });

    const member = await activateMembership(payment.user, { plan: payment.plan });

    await sendMembershipConfirmationEmail(member.user.email, {
      membershipNumber: member.membershipNumber,
      fullName: member.user.fullName,
    });

    res.json({ message: "Payment verified, membership activated", member });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

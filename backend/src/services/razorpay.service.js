const Razorpay = require("razorpay");
const crypto = require("crypto");

function getClient() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay keys are not configured. Add them to backend/.env");
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// amountInRupees: plain rupee amount, e.g. 1000 for ₹1000.
async function createOrder({ amountInRupees, receipt, notes = {} }) {
  const client = getClient();
  const order = await client.orders.create({
    amount: Math.round(amountInRupees * 100), // Razorpay expects paise
    currency: "INR",
    receipt,
    notes,
  });
  return order;
}

// Verifies the signature Razorpay sends back after a successful checkout,
// per https://razorpay.com/docs/payments/server-integration/nodejs/payment-gateway/build-integration/#step-5-verify-payment-signature
function verifySignature({ orderId, paymentId, signature }) {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return expected === signature;
}

module.exports = { createOrder, verifySignature };

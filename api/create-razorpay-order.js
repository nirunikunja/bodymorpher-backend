// Creates a Razorpay order for INR users
// POST JSON: { plan: "pro" | "unlimited" }
// Requires: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET

import { withCors, ok, bad } from "./_utils.js";

export default withCors(async function handler(req, res) {
  if (req.method !== "POST") return bad(res, 405, "Use POST");

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return bad(res, 500, "Razorpay not configured");

  const Razorpay = (await import("razorpay")).default;

  const instance = new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });

  const { plan } = req.body || {};
  const AMOUNT_MAP = {
    pro: 499 * 100,         // ₹499.00
    unlimited: 999 * 100    // ₹999.00
  };
  const amount = AMOUNT_MAP[plan] || AMOUNT_MAP.pro;

  const order = await instance.orders.create({
    amount,
    currency: "INR",
    receipt: `bm_${Date.now()}`,
    notes: { plan }
  });

  ok(res, { order });
});

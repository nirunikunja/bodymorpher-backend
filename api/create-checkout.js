// Creates a Stripe Checkout session
// POST JSON: { plan: "pro" | "unlimited", successUrl?: string, cancelUrl?: string }
// Requires: STRIPE_SECRET_KEY

import { withCors, ok, bad } from "./_utils.js";

export default withCors(async function handler(req, res) {
  if (req.method !== "POST") return bad(res, 405, "Use POST");
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return bad(res, 500, "Stripe not configured");

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(key, { apiVersion: "2023-10-16" });

  const { plan, successUrl, cancelUrl } = req.body || {};
  const origin = (req.headers.origin || "").replace(/\/+$/, "");
  const success_url = successUrl || `${origin}/?paid=1`;
  const cancel_url = cancelUrl || `${origin}/?canceled=1`;

  // USD prices (match your frontend)
  const PRICE_MAP = {
    pro: 499,          // $4.99
    unlimited: 999     // $9.99
  };
  const amount = PRICE_MAP[plan] || 499;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{
      price_data: {
        currency: "usd",
        product_data: { name: plan === "unlimited" ? "Unlimited (10 HD renders / month)" : "Pro (1 HD render, no watermark)" },
      unit_amount: amount
      },
      quantity: 1
    }],
    success_url,
    cancel_url
  });

  ok(res, { id: session.id, url: session.url });
});

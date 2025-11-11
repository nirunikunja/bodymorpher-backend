# BodyMorpher Backend (Vercel)

Serverless endpoints for:
- AI preview (Replicate img2img) — `POST /api/generate`
- Stripe Checkout — `POST /api/create-checkout`
- Razorpay Order — `POST /api/create-razorpay-order`

## 1) Deploy

1. Create a new **GitHub** repo and add these files.
2. Go to **Vercel → New Project → Import** this repo.
3. In **Environment Variables**, add those from `.env.example`.
4. Deploy.

## 2) Get your Replicate version id
Open your chosen Replicate model → **Run with API** → copy the **version** id.  
Set it as `REPLICATE_MODEL_VERSION` in Vercel.

## 3) Calling the endpoints from Framer

**Generate preview**
```js
const r = await fetch("https://YOUR-VERCEL-APP.vercel.app/api/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    imageUrl: uploadedUrl,
    goal: selectedGoal // e.g., "build muscle – 6 months"
  }),
});
const { url } = await r.json();
// show the returned image URL

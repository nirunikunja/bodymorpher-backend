// Generates a preview using Replicate (img2img)
// POST JSON: { imageUrl: string, goal: string }
// Requires: REPLICATE_API_TOKEN, REPLICATE_MODEL_VERSION (version id from Replicate)

import { withCors, ok, bad } from "./_utils.js";

export default withCors(async function handler(req, res) {
  if (req.method !== "POST") return bad(res, 405, "Use POST");

  const { imageUrl, goal } = req.body || {};
  if (!imageUrl || !goal) return bad(res, 400, "imageUrl and goal are required");

  const token = process.env.REPLICATE_API_TOKEN;
  const version = process.env.REPLICATE_MODEL_VERSION; // example: "a1b2c3d4..."; set from your Replicate model
  if (!token || !version) return bad(res, 500, "Replicate env not configured");

  // A clean, conservative prompt that keeps identity but nudges the goal
  const prompt = [
    "the same person, front view, realistic skin, gym lighting, photo-real, high detail,",
    goal
  ].join(" ");

  const body = {
    version,
    input: {
      prompt,
      image: imageUrl,
      // tweakables; safe defaults
      strength: 0.35,            // how much to change the source (0–1)
      scheduler: "DPMSolver++",
      guidance_scale: 7,
      num_inference_steps: 30
    }
  };

  // 1) create prediction
  const r = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const created = await r.json();
  if (!r.ok) {
    console.error(created);
    return bad(res, 500, created?.error?.message || "Replicate create failed");
  }

  // 2) poll until finished
  let pred = created;
  const MAX_MS = 90000;
  const start = Date.now();

  while (pred.status === "starting" || pred.status === "processing" || pred.status === "queued") {
    if (Date.now() - start > MAX_MS) return bad(res, 504, "Generation timed out");
    await new Promise((s) => setTimeout(s, 1500));

    const pr = await fetch(`https://api.replicate.com/v1/predictions/${pred.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    pred = await pr.json();
  }

  if (pred.status !== "succeeded") {
    console.error(pred);
    return bad(res, 500, pred?.error || "Generation failed");
  }

  // Replicate returns output array (urls). Send the first one.
  const out = Array.isArray(pred.output) ? pred.output[0] : pred.output;
  ok(res, { url: out });
});

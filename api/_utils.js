// Small helpers for responses & CORS (used by all endpoints)

export function ok(res, data) {
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(JSON.stringify({ ok: true, ...data }));
}

export function bad(res, code = 400, message = "Bad request") {
  res.setHeader("Content-Type", "application/json");
  res.status(code).send(JSON.stringify({ ok: false, message }));
}

const DEFAULT_ORIGIN = "*"; // or set to your domain for stricter CORS

export function withCors(handler) {
  return async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || DEFAULT_ORIGIN);
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
      res.status(200).end();
      return;
    }
    try {
      await handler(req, res);
    } catch (err) {
      console.error(err);
      bad(res, 500, "Server error");
    }
  };
}

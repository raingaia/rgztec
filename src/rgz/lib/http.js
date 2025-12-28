export async function readJsonBody(req) {
  // Vercel already parses JSON for Next-like, but plain Node handlers might not.
  // Safest: if req.body exists, use it; else parse stream.
  if (req.body != null) return req.body;

  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}

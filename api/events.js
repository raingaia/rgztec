import { db, FieldValue } from "../apps/rgz/lib/firebaseAdmin.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok:false, error:"METHOD_NOT_ALLOWED" });

  try {
    const body = req.body || {};
    const allowed = new Set(["store_view","banner_click","outbound_click"]);
    if (!allowed.has(body.type)) return res.status(400).json({ ok:false, error:"BAD_EVENT_TYPE" });

    await db().collection("events").add({
      ...body,
      ip: req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "",
      ua: req.headers["user-agent"] || "",
      serverTs: FieldValue.serverTimestamp()
    });

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok:false, error:"EVENT_WRITE_FAILED", message: e?.message || String(e) });
  }
}

import { db } from "../_lib/firebase.js";
import { verifyToken, getBearer } from "../_lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const token = getBearer(req);
    const payload = verifyToken(token);
    if (!payload || payload.role !== "seller" || !payload.sellerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const sellerId = payload.sellerId;
    const { json } = req.body || {};

    if (!json || typeof json !== "object") {
      return res.status(400).json({ error: "json (object) required" });
    }

    // Guard: sellerId mismatch engeli
    if (json.sellerId && String(json.sellerId) !== String(sellerId)) {
      return res.status(400).json({ error: "sellerId mismatch" });
    }

    await db()
      .collection("sellers")
      .doc(sellerId)
      .collection("data")
      .doc("main")
      .set(
        {
          updatedAt: Date.now(),
          json,
        },
        { merge: true }
      );

    return res.status(200).json({ ok: true, savedAt: Date.now() });
  } catch (e) {
    return res.status(500).json({ error: "Server error", detail: String(e?.message || e) });
  }
}

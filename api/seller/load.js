import { db } from "../_lib/firebase.js";
import { verifyToken, getBearer } from "../_lib/auth.js";

export default async function handler(req, res) {
  try {
    const token = getBearer(req);
    const payload = verifyToken(token);
    if (!payload || payload.role !== "seller" || !payload.sellerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const sellerId = payload.sellerId;

    const snap = await db()
      .collection("sellers")
      .doc(sellerId)
      .collection("data")
      .doc("main")
      .get();

    if (!snap.exists) return res.status(200).json({ ok: true, json: null });

    const data = snap.data() || {};
    return res.status(200).json({ ok: true, json: data.json || null, updatedAt: data.updatedAt || null });
  } catch (e) {
    return res.status(500).json({ error: "Server error", detail: String(e?.message || e) });
  }
}

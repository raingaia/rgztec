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
    const snap = await db().collection("sellers").doc(sellerId).get();
    if (!snap.exists) return res.status(404).json({ error: "Seller not found" });

    const data = snap.data() || {};
    return res.status(200).json({
      ok: true,
      seller: {
        sellerId,
        name: data.name || sellerId,
        active: data.active !== false,
      },
    });
  } catch (e) {
    return res.status(500).json({ error: "Server error", detail: String(e?.message || e) });
  }
}

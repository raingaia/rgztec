import { db } from "../_lib/firebase.js";
import { signToken } from "../_lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { sellerId, accessKey } = req.body || {};
    if (!sellerId || !accessKey) {
      return res.status(400).json({ error: "sellerId and accessKey required" });
    }

    const docRef = db().collection("sellers").doc(String(sellerId));
    const snap = await docRef.get();

    if (!snap.exists) return res.status(401).json({ error: "Invalid credentials" });

    const data = snap.data() || {};
    if (data.active === false) return res.status(403).json({ error: "Seller disabled" });

    // MVP: plain key compare (sonra hash’e çeviririz)
    if (String(data.accessKey || "") !== String(accessKey)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = signToken({ role: "seller", sellerId: String(sellerId) }, 60 * 60 * 24 * 14);

    return res.status(200).json({
      ok: true,
      token,
      seller: {
        sellerId: String(sellerId),
        name: data.name || String(sellerId),
      },
    });
  } catch (e) {
    return res.status(500).json({ error: "Server error", detail: String(e?.message || e) });
  }
}

import { db } from "../_lib/firebase.js";
import { verifyToken, getBearer } from "../_lib/auth.js";

function json(res, status, payload) {
  return res.status(status).json(payload);
}
function err(res, status, code, message) {
  return json(res, status, { ok: false, error: { code, message } });
}

export default async function handler(req, res) {
  if (req.method !== "GET") return err(res, 405, "METHOD_NOT_ALLOWED", "Method not allowed");

  try {
    const token = getBearer(req);
    if (!token) return err(res, 401, "UNAUTHORIZED", "Missing bearer token");

    const payload = verifyToken(token);
    if (!payload || payload.role !== "seller" || !payload.sellerId) {
      return err(res, 401, "UNAUTHORIZED", "Invalid token");
    }

    const sellerId = String(payload.sellerId);

    const snap = await db.collection("sellers").doc(sellerId).get();
    if (!snap.exists) return err(res, 404, "SELLER_NOT_FOUND", "Seller not found");

    const data = snap.data() || {};
    if (data.active === false) return err(res, 403, "SELLER_DISABLED", "Seller account is disabled");

    return json(res, 200, {
      ok: true,
      session: {
        sellerId,
        role: "seller",
        sessionId: payload.sessionId || null
      },
      seller: {
        id: sellerId,
        name: data.name || sellerId,
        active: true
      }
    });
  } catch (e) {
    return err(res, 500, "SERVER_ERROR", "Server error");
  }
}


import { db } from "../_lib/firebase.js";
import { verifyToken, getBearer } from "../_lib/auth.js";

/**
 * RGZTEC • Seller Session
 * GET /api/seller/me
 *
 * Header:
 *  Authorization: Bearer <token>
 *
 * Success (200):
 *  {
 *    ok: true,
 *    session: { sellerId, role, sessionId },
 *    seller: { id, name, active }
 *  }
 */

function json(res, status, payload) {
  return res.status(status).json(payload);
}

function err(res, status, code, message) {
  return json(res, status, { ok: false, error: { code, message } });
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return err(res, 405, "METHOD_NOT_ALLOWED", "Method not allowed");
  }

  try {
    // 1️⃣ Token al
    const token = getBearer(req);
    if (!token) {
      return err(res, 401, "UNAUTHORIZED", "Missing bearer token");
    }

    // 2️⃣ Token doğrula
    const payload = verifyToken(token);
    if (!payload || payload.role !== "seller" || !payload.sellerId) {
      return err(res, 401, "UNAUTHORIZED", "Invalid token");
    }

    const sellerId = String(payload.sellerId);

    // 3️⃣ Seller fetch
    const snap = await db()
      .collection("sellers")
      .doc(sellerId)
      .get();

    if (!snap.exists) {
      return err(res, 404, "SELLER_NOT_FOUND", "Seller not found");
    }

    const data = snap.data() || {};

    // 4️⃣ Disabled kontrol
    if (data.active === false) {
      return err(res, 403, "SELLER_DISABLED", "Seller account is disabled");
    }

    // 5️⃣ Response (minimum ama yeterli)
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

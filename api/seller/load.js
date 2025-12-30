import { db } from "../_lib/firebase.js";
import { verifyToken, getBearer } from "../_lib/auth.js";

/**
 * RGZTEC • Seller Load
 * GET /api/seller/load
 *
 * Header:
 *  Authorization: Bearer <token>
 *
 * Purpose:
 *  - Validate session
 *  - Load seller bootstrap data (panel init)
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

    // 3️⃣ Seller kontrol
    const sellerRef = db().collection("sellers").doc(sellerId);
    const sellerSnap = await sellerRef.get();

    if (!sellerSnap.exists) {
      return err(res, 404, "SELLER_NOT_FOUND", "Seller not found");
    }

    const seller = sellerSnap.data() || {};
    if (seller.active === false) {
      return err(res, 403, "SELLER_DISABLED", "Seller account is disabled");
    }

    // 4️⃣ Ana panel datası (opsiyonel)
    const mainRef = sellerRef.collection("data").doc("main");
    const mainSnap = await mainRef.get();

    const mainData = mainSnap.exists ? mainSnap.data() : null;

    // 5️⃣ Response (tek bakışta panel hazır)
    return json(res, 200, {
      ok: true,
      session: {
        sellerId,
        role: "seller",
        sessionId: payload.sessionId || null
      },
      seller: {
        id: sellerId,
        name: seller.name || sellerId,
        active: true
      },
      data: {
        main: mainData,
        updatedAt: mainData?.updatedAt || null
      }
    });

  } catch (e) {
    return err(res, 500, "SERVER_ERROR", "Server error");
  }
}


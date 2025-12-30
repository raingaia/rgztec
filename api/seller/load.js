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
    const sellerRef = db.collection("sellers").doc(sellerId);
    const sellerSnap = await sellerRef.get();

    if (!sellerSnap.exists) return err(res, 404, "SELLER_NOT_FOUND", "Seller not found");

    const seller = sellerSnap.data() || {};
    if (seller.active === false) return err(res, 403, "SELLER_DISABLED", "Seller account is disabled");

    const mainSnap = await sellerRef.collection("data").doc("main").get();
    const mainData = mainSnap.exists ? (mainSnap.data() || null) : null;

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



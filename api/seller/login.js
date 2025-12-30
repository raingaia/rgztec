import crypto from "crypto";
import { db } from "../_lib/firebase.js";
import { signToken } from "../_lib/auth.js";

const TOKEN_TTL_SEC = 60 * 60 * 24 * 10; // 10 days

function json(res, status, payload) { return res.status(status).json(payload); }
function err(res, status, code, message) { return json(res, status, { ok:false, error:{ code, message } }); }

function timingSafeEqualStr(a, b) {
  const A = Buffer.from(String(a || ""), "utf8");
  const B = Buffer.from(String(b || ""), "utf8");
  if (A.length !== B.length) return false;
  return crypto.timingSafeEqual(A, B);
}

function makeSessionId() { return crypto.randomBytes(16).toString("hex"); }

export default async function handler(req, res) {
  if (req.method !== "POST") return err(res, 405, "METHOD_NOT_ALLOWED", "Method not allowed");

  const sellerId = String(req.body?.sellerId || "").trim();
  const accessKey = String(req.body?.accessKey || "").trim();
  if (!sellerId || !accessKey) return err(res, 400, "INVALID_INPUT", "sellerId and accessKey are required.");

  try {
    const ref = db.collection("sellers").doc(sellerId);
    const snap = await ref.get();
    if (!snap.exists) return err(res, 401, "INVALID_CREDENTIALS", "Invalid credentials.");

    const data = snap.data() || {};
    if (data.active === false) return err(res, 403, "SELLER_DISABLED", "Seller account is disabled.");

    // Basit doğrulama: data.accessKey ile kıyaslıyor (istersen hash’li sisteme geçiririz)
    if (!timingSafeEqualStr(data.accessKey || "", accessKey)) {
      return err(res, 401, "INVALID_CREDENTIALS", "Invalid credentials.");
    }

    const sessionId = makeSessionId();
    const token = signToken({ role: "seller", sellerId, sessionId }, TOKEN_TTL_SEC);

    // audit
    ref.set({ lastLoginAt: new Date() }, { merge: true }).catch(() => {});

    return json(res, 200, { ok:true, token, expiresInSec: TOKEN_TTL_SEC, session:{ sellerId, role:"seller", sessionId } });
  } catch {
    return err(res, 500, "SERVER_ERROR", "Server error");
  }
}

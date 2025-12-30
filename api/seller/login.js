import crypto from "crypto";
import { db } from "../_lib/firebase.js";
import { signToken } from "../_lib/auth.js";

const TOKEN_TTL_SEC = 60 * 60 * 24 * 10; // 10 days
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 12;

// best-effort rate limit
const HIT = globalThis.__RGZ_SELLER_LOGIN_HIT__ || (globalThis.__RGZ_SELLER_LOGIN_HIT__ = new Map());

function getIp(req) {
  const xf = req.headers["x-forwarded-for"];
  if (typeof xf === "string" && xf.trim()) return xf.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

function rateLimit(ip) {
  const now = Date.now();
  const r = HIT.get(ip) || { c: 0, t: now };
  if (now - r.t > RATE_LIMIT_WINDOW_MS) { r.c = 0; r.t = now; }
  r.c += 1;
  HIT.set(ip, r);
  return r.c <= RATE_LIMIT_MAX;
}

function json(res, status, payload) {
  return res.status(status).json(payload);
}
function err(res, status, code, message) {
  return json(res, status, { ok: false, error: { code, message } });
}

function timingSafeEqualStr(a, b) {
  const A = Buffer.from(String(a || ""), "utf8");
  const B = Buffer.from(String(b || ""), "utf8");
  if (A.length !== B.length) return false;
  return crypto.timingSafeEqual(A, B);
}

function sha256Hex(s) {
  return crypto.createHash("sha256").update(String(s), "utf8").digest("hex");
}
function makeHashTag(accessKey) {
  return "sha256:" + sha256Hex(accessKey);
}
function isHashTag(v) {
  return typeof v === "string" && v.startsWith("sha256:");
}

// migration-friendly:
// - if accessKeyHash exists, verify it
// - else fall back to plain accessKey
function verifyAccessKey(accessKeyInput, sellerDoc) {
  const accessKey = String(accessKeyInput || "").trim();
  const hashStored = sellerDoc?.accessKeyHash;
  const plainStored = sellerDoc?.accessKey;

  if (typeof hashStored === "string" && hashStored.length) {
    if (!isHashTag(hashStored)) return false;
    return timingSafeEqualStr(hashStored, makeHashTag(accessKey));
  }

  if (typeof plainStored === "string" && plainStored.length) {
    return timingSafeEqualStr(String(plainStored), accessKey);
  }

  return false;
}

function makeSessionId() {
  return crypto.randomBytes(16).toString("hex");
}

export default async function handler(req, res) {
  if (req.method !== "POST") return err(res, 405, "METHOD_NOT_ALLOWED", "Method not allowed");

  const ip = getIp(req);
  if (!rateLimit(ip)) return err(res, 429, "RATE_LIMITED", "Too many attempts. Try again later.");

  const sellerId = String(req.body?.sellerId || "").trim();
  const accessKey = String(req.body?.accessKey || "").trim();

  if (!sellerId || !accessKey) {
    return err(res, 400, "INVALID_INPUT", "sellerId and accessKey are required.");
  }

  try {
    const ref = db.collection("sellers").doc(sellerId);
    const snap = await ref.get();

    // enumeration azalt
    if (!snap.exists) return err(res, 401, "INVALID_CREDENTIALS", "Invalid credentials.");

    const data = snap.data() || {};
    if (data.active === false) return err(res, 403, "SELLER_DISABLED", "Seller account is disabled.");

    if (!verifyAccessKey(accessKey, data)) {
      return err(res, 401, "INVALID_CREDENTIALS", "Invalid credentials.");
    }

    const sessionId = makeSessionId();
    const expiresAt = Date.now() + TOKEN_TTL_SEC * 1000;

    const token = signToken(
      { role: "seller", sellerId, sessionId },
      TOKEN_TTL_SEC
    );

    // audit (non-blocking)
    ref.set({ lastLoginAt: new Date(), lastLoginIp: ip }, { merge: true }).catch(() => {});

    return json(res, 200, {
      ok: true,
      token,
      expiresInSec: TOKEN_TTL_SEC,
      expiresAt,
      session: { sellerId, role: "seller", sessionId }
    });
  } catch (e) {
    return err(res, 500, "SERVER_ERROR", "Server error");
  }
}



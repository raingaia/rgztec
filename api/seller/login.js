import crypto from "crypto";
import { db } from "../_lib/firebase.js";
import { signToken } from "../_lib/auth.js";

/**
 * RGZTEC • Seller Login API
 * POST /api/seller/login
 *
 * Body:
 *  - sellerId: string
 *  - accessKey: string
 *
 * Success (200):
 *  {
 *    ok: true,
 *    token: string,
 *    expiresInSec: number,
 *    expiresAt: number,
 *    session: { sellerId, role, sessionId }
 *  }
 *
 * Errors:
 *  - 400 INVALID_INPUT
 *  - 401 INVALID_CREDENTIALS
 *  - 403 SELLER_DISABLED
 *  - 405 METHOD_NOT_ALLOWED
 *  - 429 RATE_LIMITED
 *  - 500 SERVER_ERROR
 */

// -------------------- CONFIG --------------------
const TOKEN_TTL_SEC = 60 * 60 * 24 * 10; // 10 days
const RATE_LIMIT_WINDOW_MS = 60_000;     // 1 min
const RATE_LIMIT_MAX = 12;              // 12 attempts / min / ip

// If you want strict mode (only hash accepted), set true after migration:
const REQUIRE_HASH = false;

// -------------------- RATE LIMIT (best-effort) --------------------
const HIT =
  globalThis.__RGZ_SELLER_LOGIN_HIT__ ||
  (globalThis.__RGZ_SELLER_LOGIN_HIT__ = new Map());

function getIp(req) {
  const xf = req.headers["x-forwarded-for"];
  if (typeof xf === "string" && xf.trim()) return xf.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

function rateLimit(ip) {
  const now = Date.now();
  const r = HIT.get(ip) || { c: 0, t: now };
  if (now - r.t > RATE_LIMIT_WINDOW_MS) {
    r.c = 0;
    r.t = now;
  }
  r.c += 1;
  HIT.set(ip, r);
  return r.c <= RATE_LIMIT_MAX;
}

// -------------------- UTILS --------------------
function json(res, status, payload) {
  res.status(status).json(payload);
}

function err(res, status, code, message) {
  return json(res, status, { ok: false, error: { code, message } });
}

function normalizeId(x) {
  return String(x || "").trim();
}

function normalizeKey(x) {
  return String(x || "").trim();
}

function timingSafeEqualStr(a, b) {
  const A = Buffer.from(String(a || ""), "utf8");
  const B = Buffer.from(String(b || ""), "utf8");
  if (A.length !== B.length) return false;
  return crypto.timingSafeEqual(A, B);
}

/**
 * Hash strategy (simple & deploy-safe):
 * - Store: accessKeyHash = "sha256:<hex>"
 * - Verify: sha256(accessKey) and compare
 *
 * Not as strong as bcrypt/argon2, but very stable in serverless and fast.
 * If you later want bcrypt, we can migrate in a separate step.
 */
function sha256Hex(s) {
  return crypto.createHash("sha256").update(String(s), "utf8").digest("hex");
}

function makeHashTag(accessKey) {
  return "sha256:" + sha256Hex(accessKey);
}

function isHashTag(v) {
  return typeof v === "string" && v.startsWith("sha256:");
}

function verifyAccessKey({ accessKeyInput, sellerDoc }) {
  const accessKey = normalizeKey(accessKeyInput);
  const hashStored = sellerDoc?.accessKeyHash;
  const plainStored = sellerDoc?.accessKey;

  // 1) Hash path (preferred)
  if (typeof hashStored === "string" && hashStored.length) {
    if (!isHashTag(hashStored)) return false;
    const computed = makeHashTag(accessKey);
    return timingSafeEqualStr(hashStored, computed);
  }

  // 2) If strict mode, do not accept plain
  if (REQUIRE_HASH) return false;

  // 3) Plain path (legacy)
  if (typeof plainStored === "string" && plainStored.length) {
    return timingSafeEqualStr(String(plainStored), accessKey);
  }

  return false;
}

function makeSessionId() {
  return crypto.randomBytes(16).toString("hex");
}

// -------------------- HANDLER --------------------
export default async function handler(req, res) {
  // Method
  if (req.method !== "POST") {
    return err(res, 405, "METHOD_NOT_ALLOWED", "Method not allowed");
  }

  // Rate limit
  const ip = getIp(req);
  if (!rateLimit(ip)) {
    return err(res, 429, "RATE_LIMITED", "Too many attempts. Try again later.");
  }

  // Validate input
  const sellerId = normalizeId(req.body?.sellerId);
  const accessKey = normalizeKey(req.body?.accessKey);

  if (!sellerId || !accessKey) {
    return err(res, 400, "INVALID_INPUT", "sellerId and accessKey are required.");
  }

  try {
    // Fetch seller doc
    const ref = db().collection("sellers").doc(String(sellerId));
    const snap = await ref.get();

    // Prevent seller enumeration: same error for not found / invalid key
    if (!snap.exists) {
      return err(res, 401, "INVALID_CREDENTIALS", "Invalid credentials.");
    }

    const data = snap.data() || {};

    // Disabled
    if (data.active === false) {
      return err(res, 403, "SELLER_DISABLED", "Seller account is disabled.");
    }

    // Verify key
    const ok = verifyAccessKey({ accessKeyInput: accessKey, sellerDoc: data });
    if (!ok) {
      return err(res, 401, "INVALID_CREDENTIALS", "Invalid credentials.");
    }

    // Issue token
    const sessionId = makeSessionId();
    const expiresAt = Date.now() + TOKEN_TTL_SEC * 1000;

    const token = signToken(
      {
        role: "seller",
        sellerId: String(sellerId),
        sessionId
      },
      TOKEN_TTL_SEC
    );

    // (Optional) audit lastLoginAt (non-blocking)
    // Not required, but corporate hygiene:
    ref.set(
      {
        lastLoginAt: new Date(),
        lastLoginIp: ip
      },
      { merge: true }
    ).catch(() => { /* ignore */ });

    return json(res, 200, {
      ok: true,
      token,
      expiresInSec: TOKEN_TTL_SEC,
      expiresAt,
      session: {
        sellerId: String(sellerId),
        role: "seller",
        sessionId
      }
    });
  } catch (e) {
    return err(res, 500, "SERVER_ERROR", "Server error.");
  }
}


import crypto from "crypto";

const SECRET = process.env.RGZ_AUTH_SECRET || "dev-secret-change-me";

function b64url(input) {
  return Buffer.from(input).toString("base64url");
}

function unb64url(input) {
  return Buffer.from(input, "base64url").toString("utf8");
}

export function signToken(payloadObj, ttlSeconds = 60 * 60 * 24 * 7) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    ...payloadObj,
    iat: now,
    exp: now + ttlSeconds,
  };

  const header = { alg: "HS256", typ: "RGZ" };
  const h = b64url(JSON.stringify(header));
  const p = b64url(JSON.stringify(payload));
  const data = `${h}.${p}`;

  const sig = crypto
    .createHmac("sha256", SECRET)
    .update(data)
    .digest("base64url");

  return `${data}.${sig}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [h, p, sig] = parts;
  const data = `${h}.${p}`;

  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(data)
    .digest("base64url");

  if (expected !== sig) return null;

  const payload = JSON.parse(unb64url(p));
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && now > payload.exp) return null;

  return payload;
}

export function getBearer(req) {
  const auth = req.headers?.authorization || "";
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

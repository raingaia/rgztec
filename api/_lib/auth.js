import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  // production’da env zorunlu; burada throw etmek daha sağlıklı
  // eslint-disable-next-line no-console
  console.warn("[auth] JWT_SECRET is missing");
}

export function getBearer(req) {
  const h = req.headers?.authorization || req.headers?.Authorization || "";
  const s = String(h);
  if (!s.toLowerCase().startsWith("bearer ")) return "";
  return s.slice(7).trim();
}

export function signToken(payload, expiresInSec) {
  return jwt.sign(payload, SECRET, { expiresIn: expiresInSec });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

// apps/saas/src/lib/auth/crypto.ts
import { createHmac } from "crypto";

/**
 * base64url encode
 * - "+" -> "-"
 * - "/" -> "_"
 * - "=" padding kaldırılır
 */
export function base64url(input: Uint8Array | Buffer | string): string {
  const buf =
    typeof input === "string" ? Buffer.from(input, "utf8") : Buffer.from(input);

  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

/**
 * base64url decode -> Uint8Array
 * (şimdilik şart değil ama ileride işine yarar)
 */
export function base64urlToBytes(b64url: string): Uint8Array {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  const buf = Buffer.from(b64 + pad, "base64");
  return new Uint8Array(buf);
}

/**
 * HMAC-SHA256(secret, data) -> bytes
 * session.ts bunu base64url ile stringe çeviriyor.
 */
export function hmacSHA256(secret: string, data: string): Uint8Array {
  const digest = createHmac("sha256", secret).update(data).digest();
  return new Uint8Array(digest);
}



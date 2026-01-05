import crypto from "crypto";

export function hmacSHA256(secret: string, data: string) {
  return crypto.createHmac("sha256", secret).update(data).digest();
}

export function base64url(buf: Buffer) {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

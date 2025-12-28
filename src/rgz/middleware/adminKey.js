import { RGZ } from "../config/index.js";

export function requireAdmin(req, res) {
  const key = req.headers["x-admin-key"] || "";
  const expected = RGZ.admin.key;

  if (!expected || key !== expected) {
    res.status(401).json({ ok: false, error: "UNAUTHORIZED" });
    return false;
  }
  return true;
}

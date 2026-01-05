export type Role = "buyer" | "seller" | "admin";

export function normalizeRole(v: any): Role {
  const s = String(v || "").toLowerCase();
  if (s === "admin") return "admin";
  if (s === "seller") return "seller";
  return "buyer";
}
